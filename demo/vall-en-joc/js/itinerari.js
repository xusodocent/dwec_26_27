import { reptes } from "./dades.js";
export const seleccio = [];
export const obtenirReptes = () =>
  seleccio.map((id) => reptes.find((r) => r.id === id));
export function afegir(id) {
  if (!reptes.some((r) => r.id === id)) return "Repte desconegut.";
  if (seleccio.includes(id)) return "Aquest repte ja està seleccionat.";
  if (seleccio.length >= 5) return "Ja tens cinc reptes.";
  seleccio.push(id);
  return "Repte afegit.";
}
export function eliminar(id) {
  const i = seleccio.indexOf(id);
  if (i !== -1) seleccio.splice(i, 1);
}
export function moure(id, delta) {
  const i = seleccio.indexOf(id),
    j = i + delta;
  if (i < 0 || j < 0 || j >= seleccio.length) return;
  seleccio.splice(i, 1);
  seleccio.splice(j, 0, id);
}
export function moureAbans(id, referencia) {
  if (
    id === referencia ||
    !seleccio.includes(id) ||
    !seleccio.includes(referencia)
  )
    return;
  eliminar(id);
  seleccio.splice(seleccio.indexOf(referencia), 0, id);
}
