// ----------------------------------------------------------------------------
// Generador de asientos con ocupación simulada (con semilla, no criptográfico).
// Es solo para poblar el plano tipo "cine" de demostración con datos estables
// entre renders — no tiene ningún uso de seguridad, a diferencia del código
// de la orden de compra que sí usa crypto.getRandomValues.
// ----------------------------------------------------------------------------

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a) {
  return function () {
    a = Math.trunc(a); a = Math.trunc(a + 0x6d2b79f5);
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generarAsientos(semilla, filas, porFila) {
  const rand = mulberry32(xmur3(semilla)());
  const ocupacionPct = 0.18 + rand() * 0.14; // ~18% a 32% ocupado, simulando disponibilidad real
  const asientos = [];
  const filaArray = Array.isArray(filas) ? filas : Array.from({ length: filas }, (_, i) => i + 1);

  for (const f of filaArray) {
    for (let n = 1; n <= porFila; n++) {
      asientos.push({
        id: `F${f}-A${n}`,
        fila: f,
        numero: n,
        ocupado: rand() < ocupacionPct,
      });
    }
  }
  return asientos;
}

export function agruparPorFila(asientos) {
  const filas = [];
  let filaActual = null;
  for (const a of asientos) {
    if (!filaActual || filaActual[0].fila !== a.fila) { filaActual = []; filas.push(filaActual); }
    filaActual.push(a);
  }
  return filas;
}

export function generarCodigoSeguro(longitud = 8) {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin caracteres ambiguos (0/O, 1/I/L)
  const bytes = new Uint32Array(longitud);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => alfabeto[b % alfabeto.length]).join("");
}
