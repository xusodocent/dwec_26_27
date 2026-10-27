/* API local per a la demo estàtica. No proporciona seguretat ni un backend real.
   Intercepta exclusivament /api dins de l'abast d'aquesta demo. */
importScripts('./seed.js');
const apiRoot = new URL('api/', self.registration.scope);
const dbName = 'vall-gestor-demo:' + self.registration.scope;
const categories = ['logica', 'patrimoni', 'fotografia', 'esport'];
const accounts = [
  { id: 1, email: 'organitza@vall.test', password: 'Organitza123!', rol: 'organitzador' },
  { id: 2, email: 'lector@vall.test', password: 'Lector123!', rol: 'lector' },
];
const publicUser = ({ id, email, rol }) => ({ id, email, rol });
const encoder = new TextEncoder();
const decoder = new TextDecoder();
// La clau és pública: aquesta signatura il·lustra el flux, no protegeix dades.
const signingKey = crypto.subtle.importKey('raw', encoder.encode('public-demo-key-not-a-server-secret'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
const b64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
const unb64 = text => Uint8Array.from(atob(text.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4-text.length%4)%4)), c => c.charCodeAt(0));
async function issue(user) {
  const header = b64(encoder.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const payload = b64(encoder.encode(JSON.stringify({ sub: String(user.id), iss: 'vall-demo', aud: 'vall-demo-client', exp: Math.floor(Date.now()/1000)+3600 })));
  const content = header + '.' + payload;
  return content + '.' + b64(await crypto.subtle.sign('HMAC', await signingKey, encoder.encode(content)));
}
async function authenticated(request) {
  try {
    const authorization = request.headers.get('Authorization') || '';
    if (!authorization.startsWith('Bearer ')) return null;
    const token = authorization.slice(7), parts = token.split('.');
    if (parts.length !== 3) return null;
    const header = JSON.parse(decoder.decode(unb64(parts[0])));
    const payload = JSON.parse(decoder.decode(unb64(parts[1])));
    if (header.alg !== 'HS256' || payload.iss !== 'vall-demo' || payload.aud !== 'vall-demo-client' || !Number.isFinite(payload.exp) || payload.exp <= Date.now()/1000) return null;
    if (!await crypto.subtle.verify('HMAC', await signingKey, unb64(parts[2]), encoder.encode(parts[0] + '.' + parts[1]))) return null;
    return accounts.find(u => String(u.id) === payload.sub) || null;
  } catch { return null; }
}
function database() {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(dbName, 1);
    open.onupgradeneeded = () => open.result.createObjectStore('data');
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => reject(open.error);
  });
}
async function load() {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('data', 'readonly');
    const req = tx.objectStore('data').get('reptes');
    let value;
    req.onsuccess = () => { value = req.result; };
    tx.oncomplete = () => { db.close(); resolve(value || structuredClone(seed.reptes)); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
async function store(reptes) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('data', 'readwrite');
    tx.objectStore('data').put(reptes, 'reptes');
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
const json = (data, status = 200, headers = {}) => new Response(status === 204 ? null : JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
});
async function handle(request) {
  const url = new URL(request.url);
  const path = '/' + url.pathname.slice(apiRoot.pathname.length), method = request.method;
  let body;
  if (['POST', 'PUT', 'PATCH'].includes(method) && path !== '/demo/reset') {
    const raw = await request.text();
    if (encoder.encode(raw).length > 20*1024) return json({ missatge: 'Cos massa gran' }, 413);
    try { body = JSON.parse(raw); } catch { return json({ missatge: 'JSON mal format' }, 400); }
  }
  if (path === '/login' && method === 'POST') {
    if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') return json({ missatge: 'Credencials mal formades' }, 400);
    const user = accounts.find(u => u.email === body.email && u.password === body.password);
    return user ? json({ accessToken: await issue(user), user: publicUser(user) }) : json('Incorrect password', 400);
  }
  if (path.startsWith('/users/')) {
    const user = await authenticated(request);
    if (!user) return json('Missing or invalid authorization', 401);
    if (method !== 'GET' || String(user.id) !== path.slice('/users/'.length)) return json('Private resource access', 403);
    return json(publicUser(user));
  }
  if (path === '/demo/reset' && method === 'POST') {
    await store(structuredClone(seed.reptes)); return json({ missatge: 'Dades restaurades' });
  }
  if (!/^\/reptes(?:\/[^/]+)?$/.test(path)) return json({ missatge: 'Endpoint no trobat' }, 404);
  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return json({ missatge: 'Mètode no disponible' }, 405);
  const id = path === '/reptes' ? null : decodeURIComponent(path.slice('/reptes/'.length));
  if ((method === 'POST' && id) || (['PUT','PATCH','DELETE'].includes(method) && !id)) return json({ missatge: 'Endpoint no trobat' }, 404);
  if (method !== 'GET') {
    const user = await authenticated(request);
    if (!user) return json({ missatge: 'Token invàlid o caducat' }, 401);
  }
  const reptes = await load();
  if (method === 'GET' && !id) {
    const q = url.searchParams.get('q') || '', categoria = url.searchParams.get('categoria') || '';
    const ordre = url.searchParams.get('_sort') || 'nom', pagina = Number(url.searchParams.get('_page') || 1), mida = Number(url.searchParams.get('_limit') || 4);
    if (!['nom','minuts'].includes(ordre) || !Number.isInteger(pagina) || pagina < 1 || !Number.isInteger(mida) || mida < 1 || mida > 20 || (categoria && !categories.includes(categoria))) return json({ missatge: 'Filtres incorrectes' }, 400);
    const items = reptes.filter(r => r.nom.toLocaleLowerCase().includes(q.toLocaleLowerCase()) && (!categoria || r.categoria === categoria));
    items.sort((a,b) => ordre === 'minuts' ? a.minuts-b.minuts : a.nom.localeCompare(b.nom));
    return url.searchParams.has('_page') ? json(items.slice((pagina-1)*mida, pagina*mida), 200, { 'X-Total-Count': String(items.length) }) : json(items);
  }
  const index = id ? reptes.findIndex(r => r.id === id) : -1;
  if (id && index < 0) return json({ missatge: 'Repte no trobat' }, 404);
  if (method === 'GET') return json(reptes[index]);
  if (method === 'POST') {
    const item = { id: crypto.randomUUID(), ...body }; reptes.push(item); await store(reptes);
    return json(item, 201, { Location: apiRoot.pathname + 'reptes/' + item.id });
  }
  if (method === 'DELETE') { reptes.splice(index, 1); await store(reptes); return json({}, 200); }
  reptes[index] = method === 'PUT' ? { id, ...body } : { ...reptes[index], ...body };
  await store(reptes); return json(reptes[index]);
}
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
// Serialitza lectures i escriptures per evitar perdre canvis de dues pestanyes.
let queue = Promise.resolve();
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin !== apiRoot.origin || !url.pathname.startsWith(apiRoot.pathname)) return;
  const task = queue.then(() => handle(event.request)).catch(() => json({ missatge: 'No es poden accedir a les dades locals de la demo' }, 500));
  queue = task.then(() => undefined);
  event.respondWith(task);
});
