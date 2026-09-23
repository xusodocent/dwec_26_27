import { node } from "./vista.js";
export function iniciarMapa(reptes) {
  const estat = document.querySelector("#estat-mapa"),
    boto = document.querySelector("#ubicar");
  const llista = document.querySelector("#llista-ubicacions");
  reptes.forEach((r) =>
    llista.append(node("li", `${r.nom}: ${r.lat}, ${r.lng}`)),
  );
  if (typeof L === "undefined") {
    estat.textContent =
      "Mapa no disponible. Pots consultar les coordenades de les proves.";
    boto.disabled = true;
    return;
  }
  const mapa = L.map("mapa").setView([39.072, -0.267], 15);
  const capa = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(mapa);
  capa.on("tileerror", () => {
    estat.textContent =
      "No s’ha pogut carregar el fons del mapa. Revisa la connexió; les coordenades estan disponibles davall.";
  });
  reptes.forEach((r) =>
    L.marker([r.lat, r.lng]).addTo(mapa).bindPopup(node("span", r.nom)),
  );
  let usuari;
  boto.addEventListener("click", () => {
    if (!navigator.geolocation) {
      estat.textContent = "Aquest navegador no ofereix geolocalització.";
      return;
    }
    boto.disabled = true;
    estat.textContent = "Buscant la ubicació...";
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const coords = [p.coords.latitude, p.coords.longitude];
        if (usuari) usuari.setLatLng(coords);
        else
          usuari = L.marker(coords).addTo(mapa).bindPopup("La teua ubicació");
        mapa.setView(coords, 15);
        estat.textContent = "Ubicació actualitzada.";
        boto.disabled = false;
      },
      (e) => {
        estat.textContent =
          {
            1: "Has denegat el permís. Pots continuar sense compartir la ubicació.",
            2: "Ubicació no disponible.",
            3: "S’ha esgotat el temps. Torna-ho a provar.",
          }[e.code] ?? "No s’ha pogut obtindre la ubicació.";
        boto.disabled = false;
      },
      { timeout: 10000 },
    );
  });
}
