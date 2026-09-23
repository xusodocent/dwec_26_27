export const categories = {
  logica: "Lògica",
  patrimoni: "Patrimoni",
  fotografia: "Fotografia",
  esport: "Esport",
};
export const reptes = [
  {
    id: "r1",
    nom: "El codi de la plaça",
    categoria: "logica",
    minuts: 20,
    punts: 100,
    dificultat: 1,
    lat: 39.071,
    lng: -0.267,
    descripcio:
      "Observa els patrons del paviment i resol la seqüència numèrica. L’equip ha de justificar la resposta amb tres pistes.",
  },
  {
    id: "r2",
    nom: "Memòria del mercat",
    categoria: "patrimoni",
    minuts: 30,
    punts: 120,
    dificultat: 2,
    lat: 39.072,
    lng: -0.266,
    descripcio:
      "Relaciona cinc fotografies antigues amb els espais del mercat. Ordena les imatges i explica què ha canviat.",
  },
  {
    id: "r3",
    nom: "Perspectives",
    categoria: "fotografia",
    minuts: 25,
    punts: 90,
    dificultat: 1,
    lat: 39.073,
    lng: -0.265,
    descripcio:
      "Troba tres formes geomètriques en les façanes. Fotografia-les des de perspectives diferents i posa un títol a la sèrie.",
  },
  {
    id: "r4",
    nom: "Relleu cooperatiu",
    categoria: "esport",
    minuts: 40,
    punts: 150,
    dificultat: 3,
    lat: 39.074,
    lng: -0.268,
    descripcio:
      "Completa el circuit en equip repartint els trams entre participants. Aquesta prova cooperativa suma 10 punts previstos per participant.",
  },
  {
    id: "r5",
    nom: "L’enigma de la font",
    categoria: "logica",
    minuts: 35,
    punts: 130,
    dificultat: 2,
    lat: 39.07,
    lng: -0.269,
    descripcio:
      "Resol les pistes de la font i combina els resultats per a descobrir una paraula. Cada membre ha d’explicar una part de la solució.",
  },
  {
    id: "r6",
    nom: "Detalls amagats",
    categoria: "fotografia",
    minuts: 20,
    punts: 80,
    dificultat: 1,
    lat: 39.069,
    lng: -0.266,
    descripcio:
      "Localitza quatre detalls arquitectònics de les imatges de referència. Crea una composició que mostre on es troba cadascun.",
  },
  {
    id: "r7",
    nom: "Veus del poble",
    categoria: "patrimoni",
    minuts: 45,
    punts: 160,
    dificultat: 3,
    lat: 39.075,
    lng: -0.267,
    descripcio:
      "Llig les històries proporcionades i situa-les en el plànol. Prepareu una narració breu que connecte els llocs.",
  },
  {
    id: "r8",
    nom: "Circuit d’equilibri",
    categoria: "esport",
    minuts: 30,
    punts: 110,
    dificultat: 2,
    lat: 39.071,
    lng: -0.264,
    descripcio:
      "Completa les estacions d’equilibri al teu ritme. Acordeu com col·laborar per a superar els obstacles del circuit.",
  },
].map((repte) => ({ ...repte, imatge: `img/${repte.categoria}.png` }));
