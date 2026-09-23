const CLAU = "vall-en-joc.itinerari.v1";
export function guardar(ids) {
  try {
    localStorage.setItem(CLAU, JSON.stringify(ids));
    return true;
  } catch {
    return false;
  }
}
export function recuperar(cataleg) {
  try {
    const dades = JSON.parse(localStorage.getItem(CLAU) ?? "[]");
    if (!Array.isArray(dades)) return [];
    return dades
      .filter(
        (id, i) =>
          typeof id === "string" &&
          cataleg.some((r) => r.id === id) &&
          dades.indexOf(id) === i,
      )
      .slice(0, 5);
  } catch {
    return [];
  }
}
export function esborrarGuardat() {
  try {
    localStorage.removeItem(CLAU);
    return true;
  } catch {
    return false;
  }
}
export const benvingudaTancada = () =>
  document.cookie.split(";").some((p) => p.trim() === "vallBenvinguda=1");
export function recordarBenvinguda() {
  document.cookie = "vallBenvinguda=1; Max-Age=604800; Path=/; SameSite=Lax";
}
export function restablirBenvinguda() {
  document.cookie = "vallBenvinguda=; Max-Age=0; Path=/; SameSite=Lax";
}
