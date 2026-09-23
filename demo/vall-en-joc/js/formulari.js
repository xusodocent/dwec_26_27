export function validarFormulari(form) {
  const d = new FormData(form),
    errors = {};
  const equip = String(d.get("equip") ?? "").trim(),
    correu = String(d.get("correu") ?? "").trim(),
    n = Number(d.get("participants"));
  if (equip.length < 3 || equip.length > 30)
    errors.equip = "Escriu entre 3 i 30 caràcters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correu))
    errors.correu = "Revisa el format del correu.";
  if (!Number.isInteger(n) || n < 2 || n > 6)
    errors.participants = "Calen entre 2 i 6 participants, sense decimals.";
  if (!["tranquilla", "competitiva"].includes(d.get("modalitat")))
    errors.modalitat = "Tria una modalitat.";
  if (!d.getAll("preferencies").length)
    errors.preferencies = "Tria almenys una preferència.";
  if (String(d.get("observacions") ?? "").length > 200)
    errors.observacions = "El màxim és de 200 caràcters.";
  if (!d.has("accepta")) errors.accepta = "Cal acceptar les condicions.";
  return errors;
}
