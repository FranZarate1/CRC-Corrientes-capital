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
    precios: {
      "lado-rio": 18000,
      "parque": 15000,
      "general-norte": 9000,
      "general-sur": 9000,
    },
    rangos: {
      "lado-rio": "$18.000 – $24.000",
      "parque": "$15.000 – $21.000",
      "general-norte": "$9.000",
      "general-sur": "$9.000",
    },
  },
  {
    id: "p2",
    rival: "Regatas vs. Boca Juniors",
    fecha: "Mar 18/08/2026 — 21:30 hs",
    estadio: "Estadio José Jorge Contte",
    precios: {
      "lado-rio": 20000,
      "parque": 16000,
      "general-norte": 9500,
      "general-sur": 9500,
    },
    rangos: {
      "lado-rio": "$20.000 – $26.000",
      "parque": "$16.000 – $22.000",
      "general-norte": "$9.500",
      "general-sur": "$9.500",
    },
  },
  {
    id: "p3",
    rival: "Regatas vs. Instituto",
    fecha: "Sáb 29/08/2026 — 20:00 hs",
    estadio: "Estadio José Jorge Contte",
    precios: {
      "lado-rio": 18000,
      "parque": 15000,
      "general-norte": 9000,
      "general-sur": 9000,
    },
    rangos: {
      "lado-rio": "$18.000 – $24.000",
      "parque": "$15.000 – $21.000",
      "general-norte": "$9.000",
      "general-sur": "$9.000",
    },
  },
];

// Genera la grilla de asientos para cada partido.
export function inicializarAsientos() {
  PARTIDOS.forEach(p => {
    p.asientos = {};
    MAPA_ESTADIO.zonas.forEach(zona => {
      if (zona.filas) {
        zona.secciones.forEach(seccion => {
          p.asientos[seccion.id] = generarAsientos(`${p.id}-${seccion.id}`, zona.filas, zona.porFila);
        });
      } else {
        zona.secciones.forEach(seccion => {
          p.asientos[seccion.id] = [];
        });
      }
    });
  });
}
