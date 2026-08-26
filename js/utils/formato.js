import { MAPA_ESTADIO } from "../config/estadio.js";

export function formatoARS(n) {
  return "$" + n.toLocaleString("es-AR");
}

export function obtenerZona(zonaId) {
  return MAPA_ESTADIO.zonas.find(z => z.id === zonaId);
}

export function obtenerSeccion(zonaId, seccionId) {
  return obtenerZona(zonaId).secciones.find(s => s.id === seccionId);
}

// Clave única para identificar un asiento en el Set de seleccionados
// (una zona puede tener varias secciones).
export function claveAsiento(seccionId, asientoId) {
  return `${seccionId}::${asientoId}`;
}
