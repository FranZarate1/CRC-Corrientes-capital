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
      id: "lado-rio",
      nombre: "Platea Río",
      icono: "≈",
      filas: ["D", "C", "B", "A"],
      porFila: 24,
      secciones: [
        { id: "lado-rio", nombre: "Platea Río" },
      ],
    },
    {
      id: "parque",
      nombre: "Platea Parque",
      icono: "♠",
      filas: ["A", "B", "C", "D"],
      porFila: 24,
      secciones: [
        { id: "parque", nombre: "Platea Parque" },
      ],
    },
    {
      id: "general-norte",
      nombre: "General Norte",
      tipo: "general",
      secciones: [
        { id: "general-norte", nombre: "General Norte (De pie)" },
      ],
    },
    {
      id: "general-sur",
      nombre: "General Sur",
      tipo: "general",
      secciones: [
        { id: "general-sur", nombre: "General Sur (De pie)" },
      ],
    },
  ],
};

// Cantidad máxima de entradas que se puede agregar por compra.
export const MAX_POR_COMPRA_ZONA = 6;

