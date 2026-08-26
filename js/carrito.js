import { PARTIDOS } from "./config/partidos.js";
import estado from "./estado.js";
import { $carritoItems, $carritoVacio, $carritoTotal, $btnCheckout } from "./utils/dom.js";
import { formatoARS } from "./utils/formato.js";
import { renderAsientosZona } from "./render/asientos.js";

export function renderCarrito() {
  if (estado.carrito.length === 0) {
    $carritoItems.innerHTML = "";
    $carritoVacio.style.display = "block";
    $btnCheckout.disabled = true;
    $carritoTotal.textContent = formatoARS(0);
    return;
  }
  $carritoVacio.style.display = "none";
  $btnCheckout.disabled = false;
  $carritoItems.innerHTML = estado.carrito.map((it, idx) => `
    <li>
      <span>${it.cantidad}× ${it.seccionNombre} — ${it.rival}<br><small style="color:var(--gris);">Asientos: ${it.asientos.join(", ")}</small></span>
      <span>
        ${formatoARS(it.precio * it.cantidad)}
        <button data-idx="${idx}" style="border:none;background:none;color:#c0392b;cursor:pointer;">✕</button>
      </span>
    </li>
  `).join("");

  $carritoItems.querySelectorAll("button[data-idx]").forEach(btn => {
    btn.addEventListener("click", () => quitarItemCarrito(Number(btn.dataset.idx)));
  });

  const total = estado.carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  $carritoTotal.textContent = formatoARS(total);
}

function liberarAsientos(partido, seccionId, ids) {
  const asientos = partido.asientos[seccionId];
  for (const id of ids) {
    asientos.find(a => a.id === id).ocupado = false;
  }
}

function quitarItemCarrito(idx) {
  const it = estado.carrito[idx];
  const partido = PARTIDOS.find(p => p.id === it.partidoId);
  liberarAsientos(partido, it.seccionId, it.asientos);
  estado.carrito.splice(idx, 1);
  renderCarrito();
  if (estado.partidoSeleccionado && estado.partidoSeleccionado.id === it.partidoId) renderAsientosZona();
}
