import { reptes } from "./dades.js";
import { resumir, validarItinerari } from "./regles.js";
import {
  seleccio,
  obtenirReptes,
  afegir,
  eliminar,
  moure,
  moureAbans,
} from "./itinerari.js";
import {
  guardar,
  recuperar,
  esborrarGuardat,
  benvingudaTancada,
  recordarBenvinguda,
  restablirBenvinguda,
} from "./persistencia.js";
import { validarFormulari } from "./formulari.js";
import { crearModel } from "./models.js";
import { node, boto, pintarCataleg } from "./vista.js";
import { iniciarMapa } from "./mapa.js";
const $ = (s) => document.querySelector(s);
const form = $("#inscripcio"),
  cataleg = $("#cataleg"),
  llista = $("#itinerari"),
  dialog = $("#detall");
const camps = [
  "equip",
  "correu",
  "participants",
  "modalitat",
  "preferencies",
  "observacions",
  "accepta",
];
let repteObert = null,
  origenDetall = null;
seleccio.push(...recuperar(reptes));
function actualitzarCataleg() {
  const cerca = $("#cerca").value.trim().toLocaleLowerCase("ca");
  const visibles = reptes.filter(
    (r) =>
      r.nom.toLocaleLowerCase("ca").includes(cerca) &&
      ($("#categoria").value === "totes" ||
        r.categoria === $("#categoria").value),
  );
  visibles.sort((a, b) =>
    $("#ordre").value === "minuts"
      ? a.minuts - b.minuts
      : $("#ordre").value === "punts"
        ? b.punts - a.punts
        : a.nom.localeCompare(b.nom, "ca"),
  );
  pintarCataleg(visibles, cataleg, seleccio);
  $("#recompte").textContent = `${visibles.length} reptes`;
}
function puntsEquip() {
  return obtenirReptes()
    .map(crearModel)
    .reduce(
      (s, r) => s + r.calcularPunts(Number(form.elements.participants.value)),
      0,
    );
}
function revisar() {
  const errors = validarFormulari(form),
    ruta = validarItinerari(obtenirReptes());
  camps.forEach((n) => {
    $(`#error-${n}`).textContent = errors[n] ?? "";
    form
      .querySelectorAll(`[name="${n}"]`)
      .forEach((c) =>
        c.setAttribute("aria-invalid", String(Boolean(errors[n]))),
      );
  });
  $("#errors-itinerari").textContent = ruta.join(" ");
  $("#punts-equip").textContent = errors.participants
    ? "Indica un nombre vàlid de participants."
    : `${puntsEquip()} punts previstos per a l’equip`;
  const valid = !Object.keys(errors).length && !ruta.length;
  $("#confirmar").disabled = !valid;
  return valid;
}
function actualitzarItinerari() {
  llista.replaceChildren();
  obtenirReptes().forEach((r, i) => {
    const li = node("li");
    li.dataset.id = r.id;
    li.draggable = true;
    const nom = node("span", r.nom, "nom");
    nom.append(node("small", `${r.minuts} min · ${r.punts} punts`));
    const pujar = boto("pujar", "↑", `Pujar ${r.nom}`),
      baixar = boto("baixar", "↓", `Baixar ${r.nom}`);
    pujar.disabled = i === 0;
    baixar.disabled = i === seleccio.length - 1;
    li.append(
      node("span", String(i + 1), "numero"),
      nom,
      pujar,
      baixar,
      boto("eliminar", "×", `Eliminar ${r.nom}`),
    );
    llista.append(li);
  });
  if (!seleccio.length)
    llista.append(node("li", "Encara no has seleccionat cap repte."));
  const r = resumir(obtenirReptes());
  $("#quantitat").textContent = `${r.quantitat}/5`;
  $("#resum").replaceChildren(
    ...[
      [r.quantitat, "reptes"],
      [r.minuts, "minuts"],
      [r.punts, "punts base"],
    ].map(([valor, text]) => {
      const d = node("div");
      d.append(node("strong", String(valor)), node("span", text));
      return d;
    }),
  );
  const errors = validarItinerari(obtenirReptes());
  $("#errors-ruta").replaceChildren(...errors.map((e) => node("li", e)));
  $("#validesa").textContent = errors.length ? "" : "Itinerari vàlid";
  $("#buidar").disabled = !seleccio.length;
  revisar();
}
function canvi(missatge) {
  const ok = guardar(seleccio);
  actualitzarCataleg();
  actualitzarItinerari();
  $("#missatge").textContent =
    missatge +
    (ok
      ? ""
      : " No s’ha pogut guardar: la selecció només es conserva en aquesta sessió.");
}
function restaurarFocus(id, accio) {
  const controls = [...llista.querySelectorAll(`[data-id="${id}"] button`)];
  (
    controls.find((b) => b.dataset.accio === accio && !b.disabled) ??
    controls.find((b) => !b.disabled) ??
    $("#titol-ruta")
  ).focus();
}
$("#cerca").addEventListener("input", actualitzarCataleg);
["#categoria", "#ordre"].forEach((s) =>
  $(s).addEventListener("change", actualitzarCataleg),
);
cataleg.addEventListener("click", (e) => {
  const b = e.target.closest("button[data-accio]");
  if (!b) return;
  const id = b.closest("article").dataset.id;
  if (b.dataset.accio === "afegir") {
    canvi(afegir(id));
    cataleg.querySelector(`[data-id="${id}"] [data-accio="afegir"]`)?.focus();
    return;
  }
  repteObert = reptes.find((r) => r.id === id);
  origenDetall = id;
  $("#detall-titol").textContent = repteObert.nom;
  $("#detall-imatge").src = repteObert.imatge;
  $("#detall-imatge").alt = repteObert.nom;
  $("#detall-text").textContent = repteObert.descripcio;
  $("#detall-dades").textContent =
    `${repteObert.minuts} minuts · ${repteObert.punts} punts base · Dificultat ${repteObert.dificultat}`;
  dialog.showModal();
});
$("#tancar-detall").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  (
    cataleg.querySelector(
      `[data-id="${origenDetall}"] [data-accio="detall"]`,
    ) ?? $("#cerca")
  ).focus();
});
$("#detall-afegir").addEventListener("click", () => {
  canvi(afegir(repteObert.id));
  dialog.close();
});
llista.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const id = b.closest("li").dataset.id;
  const i = seleccio.indexOf(id);
  if (b.dataset.accio === "eliminar") eliminar(id);
  else moure(id, b.dataset.accio === "pujar" ? -1 : 1);
  canvi("Itinerari actualitzat.");
  restaurarFocus(
    b.dataset.accio === "eliminar"
      ? seleccio[Math.min(i, seleccio.length - 1)]
      : id,
    b.dataset.accio,
  );
});
llista.addEventListener("dragstart", (e) => {
  const li = e.target.closest("li[data-id]");
  if (li) e.dataTransfer.setData("text/plain", li.dataset.id);
});
llista.addEventListener("dragover", (e) => e.preventDefault());
llista.addEventListener("drop", (e) => {
  e.preventDefault();
  const desti = e.target.closest("li[data-id]");
  if (!desti) return;
  const id = e.dataTransfer.getData("text/plain");
  moureAbans(id, desti.dataset.id);
  canvi("Ordre actualitzat.");
  restaurarFocus(id, "pujar");
});
$("#buidar").addEventListener("click", () => {
  seleccio.splice(0);
  const ok = esborrarGuardat();
  actualitzarCataleg();
  actualitzarItinerari();
  $("#missatge").textContent = ok
    ? "Itinerari esborrat."
    : "Selecció buidada; no s’ha pogut esborrar l’emmagatzematge.";
  $("#titol-ruta").focus();
});
form.addEventListener("input", revisar);
form.addEventListener("change", revisar);
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!revisar()) {
    form.querySelector('[aria-invalid="true"]')?.focus();
    return;
  }
  const d = new FormData(form);
  const justificant = $("#justificant");
  justificant.replaceChildren(
    node("h3", "Inscripció local confirmada"),
    node(
      "p",
      `${d.get("equip").trim()} · ${d.get("participants")} participants · ${d.get("modalitat")}`,
    ),
    node(
      "p",
      obtenirReptes()
        .map((r) => r.nom)
        .join(" → "),
    ),
    node(
      "p",
      `${resumir(obtenirReptes()).minuts} minuts · ${puntsEquip()} punts previstos`,
    ),
    node(
      "p",
      "No s’ha enviat cap dada. Aquest justificant correspon a la selecció confirmada.",
    ),
  );
});
$("#benvinguda").hidden = benvingudaTancada();
$("#tancar-avis").addEventListener("click", () => {
  recordarBenvinguda();
  $("#benvinguda").hidden = true;
  $("#cerca").focus();
});
$("#restablir-avis").addEventListener("click", () => {
  restablirBenvinguda();
  $("#benvinguda").hidden = false;
  $("#tancar-avis").focus();
});
actualitzarCataleg();
actualitzarItinerari();
iniciarMapa(reptes);
