import { categories } from "./dades.js";
export function node(tag, text, classe) {
  const n = document.createElement(tag);
  if (text !== undefined) n.textContent = text;
  if (classe) n.className = classe;
  return n;
}
export function boto(accio, text, titol) {
  const b = node("button", text);
  b.type = "button";
  b.dataset.accio = accio;
  if (titol) {
    b.title = titol;
    b.setAttribute("aria-label", titol);
    b.className = "icona";
  }
  return b;
}
export function pintarCataleg(llista, contenidor, seleccio) {
  contenidor.replaceChildren();
  if (!llista.length) {
    contenidor.append(node("p", "No hi ha reptes amb aquests filtres."));
    return;
  }
  for (const r of llista) {
    const a = node("article", undefined, "fitxa");
    a.dataset.id = r.id;
    a.classList.toggle("seleccionada", seleccio.includes(r.id));
    const img = node("img");
    img.src = r.imatge;
    img.alt = `Il·lustració de ${categories[r.categoria]}`;
    img.width = 600;
    img.height = 334;
    const cos = node("div", undefined, "cos"),
      accions = node("div", undefined, "accions");
    cos.append(
      node("span", categories[r.categoria], "categoria"),
      node("h3", r.nom),
      node("p", `${r.minuts} min · ${r.punts} punts · Nivell ${r.dificultat}`),
    );
    const detall = boto("detall", "Detall");
    detall.className = "secundari";
    accions.append(
      detall,
      boto("afegir", seleccio.includes(r.id) ? "Seleccionat" : "Afegir"),
    );
    cos.append(accions);
    a.append(img, cos);
    contenidor.append(a);
  }
}
