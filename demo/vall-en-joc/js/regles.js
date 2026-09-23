export function resumir(seleccio = []) {
  return {
    quantitat: seleccio.length,
    minuts: seleccio.reduce((s, r) => s + r.minuts, 0),
    punts: seleccio.reduce((s, r) => s + r.punts, 0),
    categories: [...new Set(seleccio.map((r) => r.categoria))],
  };
}
export function validarItinerari(seleccio = []) {
  const r = resumir(seleccio),
    errors = [];
  if (r.quantitat < 3 || r.quantitat > 5)
    errors.push("Tria entre 3 i 5 reptes.");
  if (r.categories.length < 2) errors.push("Tria almenys 2 categories.");
  if (r.minuts > 180) errors.push("No pots superar els 180 minuts.");
  if (new Set(seleccio.map((r) => r.id)).size !== seleccio.length)
    errors.push("No pots repetir reptes.");
  return errors;
}
