// ============================================================================
// MAPA DEL ESTADIO — CONFIGURACIÓN PROVISORIA
// Todavía no tenemos el plano real de sectores del estadio, así que esto es
// una distribución de referencia (Parque / Lado Río / Populares).
// Cuando tengamos el mapa definitivo, alcanza con reemplazar las zonas y
// secciones acá abajo — el resto del código (render, carrito, checkout) no
// necesita tocarse.
// ============================================================================

export const MAPA_ESTADIO = {
  zonas: [
    {
      id: "parque",
      nombre: "Parque",
      layout: { filas: 5, porFila: 8 },
      secciones: [
        { id: "pq-1", nombre: "Parque - Sección 1" },
        { id: "pq-2", nombre: "Parque - Sección 2" },
        { id: "pq-3", nombre: "Parque - Sección 3" },
      ],
    },
    {
      id: "lado-rio",
      nombre: "Lado Río",
      layout: { filas: 5, porFila: 8 },
      secciones: [
        { id: "lr-1", nombre: "Lado Río - Sección 1" },
        { id: "lr-2", nombre: "Lado Río - Sección 2" },
        { id: "lr-3", nombre: "Lado Río - Sección 3" },
      ],
    },
    {
      id: "populares",
      nombre: "Populares",
      layout: { filas: 8, porFila: 10 },
      secciones: [
        { id: "pop-1", nombre: "Popular - Sección 1" },
        { id: "pop-2", nombre: "Popular - Sección 2" },
      ],
    },
  ],
};

// Cantidad máxima de entradas por zona que se puede agregar en una misma compra (provisorio).
export const MAX_POR_COMPRA_ZONA = 6;

// ----------------------------------------------------------------------------
// Mapa visual del estadio (SVG generado por código, no una imagen fija).
// Tribunas rectangulares a lo largo (arriba/abajo) y a lo ancho (derecha/izquierda)
// de la cancha, cada una dividida en las secciones reales de su zona de
// MAPA_ESTADIO. La de "zona: null" (izquierda) es un sector todavía sin definir.
// "zoom" tiene, por zona, el viewBox recortado que se usa en el plano de butacas
// para "acercar la cámara" a la cancha y esa tribuna en particular.
// ----------------------------------------------------------------------------
export const MAPA_VISUAL = {
  ancho: 420, alto: 320,
  cancha: { x: 140, y: 120, width: 140, height: 80 },
  bandas: [
    {
      id: "top", zona: "parque", eje: "x", gap: 4,
      x: 20, y: 20, width: 380, height: 85,
      color: "#ffffff", colorActiva: "#dbe9f4", stroke: "#c7d2db",
    },
    {
      id: "bottom", zona: "lado-rio", eje: "x", gap: 4,
      x: 20, y: 215, width: 380, height: 85,
      color: "#ffffff", colorActiva: "#dbe9f4", stroke: "#c7d2db",
    },
    {
      id: "right", zona: "populares", eje: "y", gap: 4,
      x: 295, y: 105, width: 105, height: 110,
      color: "#f0a233", colorActiva: "#d88a1c", stroke: "#c97f1c",
    },
    {
      id: "left", zona: null, nombre: "Zona no habilitada", eje: "y", gap: 0,
      x: 20, y: 105, width: 105, height: 110,
      color: "#9aa5b1", colorActiva: "#9aa5b1", stroke: "#7c8794",
    },
  ],
  zoom: {
    "parque": "10 10 400 225",
    "lado-rio": "10 85 400 225",
    "populares": "190 95 220 140",
  },
};
