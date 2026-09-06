import { PARTIDOS } from "./config/partidos.js";
import estado from "./estado.js";
import { $carritoItems, $carritoVacio, $carritoTotal, $btnCheckout } from "./utils/dom.js";
import { formatoARS } from "./utils/formato.js";
import { renderAsientosZona } from "./render/asientos.js";

export function renderCarrito() {
  const total = estado.carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);

  if (estado.carrito.length === 0) {
    $carritoItems.innerHTML = "";
    $carritoVacio.style.display = "block";
    $btnCheckout.disabled = true;
    $carritoTotal.textContent = formatoARS(0);
    return;
  }

  $carritoVacio.style.display = "none";
  $btnCheckout.disabled = false;

  $carritoItems.innerHTML = estado.carrito.map((it, idx) => {
    // Extraer números de asiento (ids tienen formato "FD-A3" o "ticket-xxx")
    const nums = it.asientos
      .filter(id => id.includes("-A"))
      .map(id => id.split("-").pop().replace("A", ""))
      .sort((a, b) => Number(a) - Number(b))
      .join(", ");

    const detalleUbicacion = nums ? `Asientos: ${nums}` : "Entrada general (de pie)";

    return `
      <li>
        <span>
          <strong style="display:block; font-size:12.5px; color:var(--marino);">
            ${it.cantidad}× ${it.seccionNombre.replace(it.zonaNombre + " - ", it.zonaNombre + " · ")}
          </strong>
          <small style="color:var(--gris); font-size:11px;">
            ${it.rival} · ${detalleUbicacion}
          </small>
        </span>
        <span>
          ${formatoARS(it.precio * it.cantidad)}
          <button data-idx="${idx}"
                  style="border:none;background:rgba(183,28,28,.08);color:var(--rojo);cursor:pointer;
                         width:22px;height:22px;border-radius:50%;font-size:13px;
                         display:grid;place-items:center;flex-shrink:0;"
                  aria-label="Quitar ${it.seccionNombre} del carrito"
                  title="Quitar del carrito">✕</button>
        </span>
      </li>
    `;
  }).join("");

  $carritoItems.querySelectorAll("button[data-idx]").forEach(btn => {
    btn.addEventListener("click", () => quitarItemCarrito(Number(btn.dataset.idx)));
  });

  $carritoTotal.textContent = formatoARS(total);
}

function liberarAsientos(partido, seccionId, ids) {
  const asientos = partido?.asientos?.[seccionId];
  if (!asientos || !Array.isArray(asientos)) return;
  for (const id of ids) {
    const a = asientos.find(a => a.id === id);
    if (a) a.ocupado = false;
  }
}

function quitarItemCarrito(idx) {
  const it     = estado.carrito[idx];
  const partido = PARTIDOS.find(p => p.id === it.partidoId);
  liberarAsientos(partido, it.seccionId, it.asientos);
  estado.carrito.splice(idx, 1);
  renderCarrito();
  if (estado.partidoSeleccionado && estado.partidoSeleccionado.id === it.partidoId) {
    renderAsientosZona();
  }
}
