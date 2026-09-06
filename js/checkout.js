import estado from "./estado.js";
import { $modalOverlay, $modalBox } from "./utils/dom.js";
import { formatoARS } from "./utils/formato.js";
import { generarCodigoSeguro } from "./utils/random.js";
import { renderCarrito } from "./carrito.js";
import { actualizarStep } from "./render/partidos.js";

// ── Helpers ────────────────────────────────────────────────────
function cerrarModal() {
  $modalOverlay.classList.remove("abierto");
  document.body.style.overflow = "";
}

function abrirModal() {
  $modalOverlay.classList.add("abierto");
  document.body.style.overflow = "hidden";
}

function finalizarDemo() {
  cerrarModal();
  estado.carrito = [];
  renderCarrito();
  actualizarStep(1);
}

// ── QR simulado (SVG pattern) ──────────────────────────────────
function generarQRSVG() {
  const size   = 80;
  const modules = 10;
  const cell   = size / modules;

  // Patrón fijo visual (no es un QR real)
  const p = [
    [1,1,1,1,1,1,1,0,1,0],
    [1,0,0,0,0,0,1,0,0,1],
    [1,0,1,1,1,0,1,0,1,0],
    [1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,0],
    [1,1,1,1,1,1,1,0,1,1],
    [0,0,0,1,0,0,0,1,0,1],
    [1,1,0,0,1,1,0,1,1,0],
    [0,1,1,1,0,1,1,0,1,1],
    [1,0,1,0,1,0,0,1,0,1],
  ];

  let rects = "";
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (p[r]?.[c]) {
        rects += `<rect x="${c * cell + .5}" y="${r * cell + .5}"
                        width="${cell - 1}" height="${cell - 1}"
                        rx="1" fill="#0b2447"/>`;
      }
    }
  }

  return `
    <svg class="ticket-qr-svg" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"
         aria-label="Código QR simulado" role="img">
      <rect x="0" y="0" width="${size}" height="${size}" rx="4" fill="white" stroke="#e0eaf2" stroke-width="1"/>
      ${rects}
    </svg>
  `;
}

// ── Ticket final ───────────────────────────────────────────────
function mostrarTicketFinal(nombre, nroOrden) {
  const $dialog = document.getElementById("ticket-dialog");
  const $content = document.getElementById("ticket-dialog-content");
  if (!$dialog || !$content) return;

  const total     = estado.carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  const servicio  = Math.round(total * 0.08);
  const totalFinal = total + servicio;

  // Tomar datos del primer partido/rival del carrito para el encabezado
  const primerItem = estado.carrito[0];
  const rival  = primerItem?.rival  || "Regatas";
  const fecha  = primerItem?.fecha  || "—";
  const estadioNombre = primerItem?.estadio || "Estadio José Jorge Contte";

  // Armar líneas del ticket por sección
  const lineasHTML = estado.carrito.map(it => {
    // Obtener números de asiento o etiqueta general
    const numeros = it.asientos
      .filter(id => id.includes("-A"))
      .map(id => id.split("-").pop().replace("A", ""))
      .sort((a, b) => Number(a) - Number(b));

    const chipsHTML = numeros.length > 0
      ? numeros.map(n => `<span class="ticket-asiento-chip">Butaca ${n}</span>`).join("")
      : `<span class="ticket-asiento-chip" style="background:#f7f2ea; color:#706354; border-color:#dfd4c4;">De pie (Sector general)</span>`;

    return `
      <div class="ticket-info-row" style="flex-direction:column; align-items:flex-start; gap:6px;">
        <div style="display:flex; justify-content:space-between; width:100%; align-items:baseline;">
          <span class="ticket-info-label">${it.zonaNombre} · ${it.seccionNombre.replace(it.zonaNombre + " - ", "")}</span>
          <span class="ticket-info-value">${formatoARS(it.precio * it.cantidad)}</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; font-size:11.5px; color:var(--gris);">
          <span>${it.cantidad} entrada${it.cantidad > 1 ? "s" : ""} · ${formatoARS(it.precio)} c/u</span>
        </div>
        <div class="ticket-asiento-chips" style="justify-content:flex-start;" aria-label="Ubicaciones">
          ${chipsHTML}
        </div>
      </div>
    `;
  }).join(`<hr style="border:none; border-top:1px dashed var(--borde); margin:4px 0;">`);

  // Código de barras numérico falso
  const barcodeNum = nroOrden.replace("DEMO-", "") + " " + Math.random().toFixed(6).slice(2);

  $content.innerHTML = `
    <div class="ticket-final">

      <!-- Top del ticket -->
      <div class="ticket-top">
        <div class="ticket-brand">
          <img src="https://crc.org.ar/w/wp-content/uploads/2024/05/LogoCRC.png"
               alt="Escudo Regatas Corrientes" width="36" height="42">
          <div>
            <span class="ticket-brand-name">REGATAS CORRIENTES</span>
            <span class="ticket-brand-sub">Club de Regatas Corrientes</span>
          </div>
        </div>

        <span class="ticket-league">LNB · Liga Nacional de Básquet · Temporada 2026</span>

        <div class="ticket-rival" id="ticket-dialog-title">
          ${rival.replace("Regatas vs.", "Regatas<br><span class='vs'>vs.</span>").replace("vs.", "<span class='vs'>vs.</span>")}
        </div>

        <div class="ticket-event-grid">
          <div class="ticket-event-item">
            <small>Fecha y hora</small>
            <strong>${fecha}</strong>
          </div>
          <div class="ticket-event-item">
            <small>Estadio</small>
            <strong>${estadioNombre}</strong>
          </div>
          <div class="ticket-event-item">
            <small>A nombre de</small>
            <strong>${nombre}</strong>
          </div>
          <div class="ticket-event-item">
            <small>Orden</small>
            <strong style="font-family:'Barlow Condensed',monospace; font-size:15px; letter-spacing:.5px;">${nroOrden}</strong>
          </div>
        </div>
      </div>

      <!-- Línea perforada -->
      <div class="ticket-perf" aria-hidden="true"></div>

      <!-- Cuerpo del ticket -->
      <div class="ticket-body">
        <div class="ticket-status-badge" role="status">ENTRADA CONFIRMADA</div>

        <!-- Líneas de asientos por sección -->
        <div class="ticket-info-section" aria-label="Detalle de entradas">
          ${lineasHTML}
        </div>

        <!-- Totales -->
        <div class="ticket-totales-section">
          <div class="ticket-total-row">
            <span>Subtotal entradas</span>
            <span>${formatoARS(total)}</span>
          </div>
          <div class="ticket-total-row">
            <span>Cargo de servicio (8%)</span>
            <span>${formatoARS(servicio)}</span>
          </div>
          <div class="ticket-total-row main">
            <span>Total <small style="font-size:10px;color:var(--gris-claro);font-weight:400;margin-left:4px;">ARS</small></span>
            <strong>${formatoARS(totalFinal)}</strong>
          </div>
        </div>

        <!-- Código de barras -->
        <div class="ticket-barcode-section">
          <div class="ticket-barcode" role="img" aria-label="Código de barras"></div>
          <span class="ticket-barcode-num">${barcodeNum.toUpperCase()}</span>

          <!-- QR simulado -->
          <div class="ticket-qr-wrap">
            ${generarQRSVG()}
            <span class="ticket-qr-label">Presentá este código en el ingreso</span>
            <span class="ticket-demo-tag">DEMO · No válido para ingresar</span>
          </div>
        </div>
      </div>

      <!-- Acciones -->
      <div class="ticket-actions">
        <button class="btn btn-outline" id="btn-cerrar-ticket" aria-label="Cerrar ticket y volver">
          ← Volver al inicio
        </button>
        <button class="btn" id="btn-nuevo-ticket" style="background:linear-gradient(135deg,#43a047,#1b6b33);">
          ¡Listo! 🎉
        </button>
      </div>

    </div>
  `;

  $dialog.showModal();
  document.body.style.overflow = "hidden";

  document.getElementById("btn-cerrar-ticket").addEventListener("click", () => {
    $dialog.close();
    document.body.style.overflow = "";
  });

  document.getElementById("btn-nuevo-ticket").addEventListener("click", () => {
    $dialog.close();
    document.body.style.overflow = "";
    finalizarDemo();
  });

  $dialog.addEventListener("click", e => {
    if (e.target === $dialog) {
      $dialog.close();
      document.body.style.overflow = "";
    }
  }, { once: true });
}

// ── Confirmar compra ───────────────────────────────────────────
function confirmarCompra() {
  const nombre = document.getElementById("f-nombre")?.value.trim();
  const email  = document.getElementById("f-email")?.value.trim();

  if (!nombre || !email) {
    const msg = document.getElementById("modal-error");
    if (msg) { msg.style.display = "block"; msg.textContent = "Por favor completá tu nombre y email para continuar."; }
    return;
  }

  const nroOrden = "DEMO-" + generarCodigoSeguro();
  cerrarModal();

  // Pequeño delay para que se vea el cierre del modal antes del ticket
  setTimeout(() => mostrarTicketFinal(nombre, nroOrden), 150);
}

// ── Abrir checkout ─────────────────────────────────────────────
export function abrirCheckout() {
  const total = estado.carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  const servicio = Math.round(total * 0.08);

  $modalBox.innerHTML = `
    <button class="modal-close" id="modal-cerrar" aria-label="Cerrar">✕</button>
    <h3>Confirmar datos</h3>
    <p class="aviso" role="note">
      Prototipo de demostración — no se procesa ningún pago ni se envían datos a ningún servidor.
    </p>

    <label for="f-nombre">Nombre y apellido</label>
    <input id="f-nombre" type="text" placeholder="Ej: Juan García" autocomplete="name" required>

    <label for="f-email">Email</label>
    <input id="f-email" type="email" placeholder="tu@email.com" autocomplete="email" required>

    <p id="modal-error" style="display:none; color:var(--rojo); font-size:12px; margin-top:8px;"></p>

    <div style="margin-top:18px; padding:12px; background:var(--fondo); border-radius:10px;">
      <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--gris); margin-bottom:5px;">
        <span>Subtotal</span><span>${formatoARS(total)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--gris); margin-bottom:10px;">
        <span>Cargo de servicio (8%)</span><span>${formatoARS(servicio)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:16px; font-weight:800; color:var(--marino);">
        <span>Total ARS</span>
        <span style="font-family:'Barlow Condensed',sans-serif;font-size:22px;letter-spacing:-.3px;">${formatoARS(total + servicio)}</span>
      </div>
    </div>

    <div class="modal-actions">
      <button class="btn btn-outline" id="modal-cancelar">Cancelar</button>
      <button class="btn" id="modal-confirmar">
        Confirmar y ver ticket →
      </button>
    </div>
  `;

  abrirModal();

  document.getElementById("modal-cerrar").addEventListener("click", cerrarModal);
  document.getElementById("modal-cancelar").addEventListener("click", cerrarModal);
  document.getElementById("modal-confirmar").addEventListener("click", confirmarCompra);

  // Cerrar con Enter en los inputs
  document.getElementById("f-nombre").addEventListener("keydown", e => { if (e.key === "Enter") document.getElementById("f-email").focus(); });
  document.getElementById("f-email").addEventListener("keydown",  e => { if (e.key === "Enter") confirmarCompra(); });
}
