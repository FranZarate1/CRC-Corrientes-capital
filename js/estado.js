// Estado global de la aplicación.
// Centralizado en un solo objeto para facilitar debugging y una futura
// migración a un store reactivo o conexión con backend.

const estado = {
  partidoSeleccionado: null,
  zonaActiva: null,
  seccionActiva: null, // ID de la sección activa dentro de la zona (para el picker espacial)
  asientosSeleccionados: new Set(), // claves "seccionId::asientoId" elegidas en la zona actual
  carrito: [], // { partidoId, rival, zonaId, zonaNombre, seccionId, seccionNombre, precio, cantidad, asientos }
};

export default estado;
