import { MAPA_ESTADIO } from "./estadio.js";
import { generarAsientos } from "../utils/random.js";

// Precio por zona, particular de cada partido. La disponibilidad de asientos
// se genera más abajo a partir de MAPA_ESTADIO (una grilla tipo cine por sección).
export const PARTIDOS = [
  {
    id: "p1",
    rival: "Regatas vs. San Lorenzo",
    fecha: "Vie 07/08/2026 — 21:00 hs",
    estadio: "Estadio José Jorge Contte",
    precios: { "parque": 15000, "lado-rio": 15000, "populares": 8000 },
  },
  {
    id: "p2",
    rival: "Regatas vs. Boca Juniors",
    fecha: "Mar 18/08/2026 — 21:30 hs",
    estadio: "Estadio José Jorge Contte",
    precios: { "parque": 17000, "lado-rio": 17000, "populares": 9000 },
  },
  {
    id: "p3",
    rival: "Regatas vs. Instituto",
    fecha: "Sáb 29/08/2026 — 20:00 hs",
    estadio: "Estadio José Jorge Contte",
    precios: { "parque": 15000, "lado-rio": 15000, "populares": 8000 },
  },
];

// Genera la grilla de asientos (con ocupación simulada) de cada sección, para cada partido.
// Cuando llegue el backend, esta función se reemplaza por un fetch.
export function inicializarAsientos() {
  PARTIDOS.forEach(p => {
    p.asientos = {};
    MAPA_ESTADIO.zonas.forEach(zona => {
      zona.secciones.forEach(seccion => {
        p.asientos[seccion.id] = generarAsientos(`${p.id}-${seccion.id}`, zona.layout.filas, zona.layout.porFila);
      });
    });
  });
}
