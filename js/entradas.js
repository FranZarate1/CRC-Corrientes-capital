// Prototipo de compra de entradas LNB — datos simulados, sin backend ni pagos reales.

// ============================================================================
// MAPA DEL ESTADIO — CONFIGURACIÓN PROVISORIA
// Todavía no tenemos el plano real de sectores del estadio, así que esto es
// una distribución de referencia (Platea Norte / Platea Sur / Populares).
// Cuando tengamos el mapa definitivo, alcanza con reemplazar las zonas y
// secciones acá abajo — el resto del código (render, carrito, checkout) no
// necesita tocarse.
// ============================================================================
const MAPA_ESTADIO = {
  zonas: [
    {
      id: "platea-norte",
      nombre: "Platea Norte",
      posicion: "norte", // referencia para una futura UI de mapa gráfico
      secciones: [
        { id: "pn-1", nombre: "Platea Norte - Sección 1" },
        { id: "pn-2", nombre: "Platea Norte - Sección 2" },
        { id: "pn-3", nombre: "Platea Norte - Sección 3" },
      ],
    },
    {
      id: "platea-sur",
      nombre: "Platea Sur",
      posicion: "sur",
      secciones: [
        { id: "ps-1", nombre: "Platea Sur - Sección 1" },
        { id: "ps-2", nombre: "Platea Sur - Sección 2" },
        { id: "ps-3", nombre: "Platea Sur - Sección 3" },
      ],
    },
    {
      id: "populares",
      nombre: "Populares",
      posicion: "derecha",
      secciones: [
        { id: "pop-1", nombre: "Popular - Sección 1" },
        { id: "pop-2", nombre: "Popular - Sección 2" },
      ],
    },
  ],
};

// Cantidad máxima de entradas por sección que se puede agregar en una misma compra (provisorio).
const MAX_POR_COMPRA_SECCION = 6;

// ----------------------------------------------------------------------------
// Mapa visual del estadio (SVG generado por código, no una imagen fija).
// Cada "gajo" (wedge) ocupa un rango de grados (0° = arriba, sentido horario)
// alrededor de la cancha y apunta a una zona de MAPA_ESTADIO. El de "zona: null"
// es un sector todavía sin definir — queda de ejemplo de cómo sumar más
// gajos el día que tengamos el plano real (con más anillos, gates, etc).
// ----------------------------------------------------------------------------
const MAPA_VISUAL = {
  cx: 200, cy: 190, radioInterno: 68, radioExterno: 150,
  wedges: [
    { zona: "platea-norte", desde: -55, hasta: 55, color: "#eaf6fd", colorActiva: "#bfe6fb" },
    { zona: "populares", desde: 55, hasta: 130, color: "#fde3c4", colorActiva: "#fbcf94" },
    { zona: "platea-sur", desde: 130, hasta: 230, color: "#eaf6fd", colorActiva: "#bfe6fb" },
    { zona: null, nombre: "Sector a definir", desde: 230, hasta: 305, color: "#e7ebf0", colorActiva: "#e7ebf0" },
  ],
};

function puntoPolar(cx, cy, r, anguloDeg) {
  const rad = (anguloDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

function annularSectorPath(cx, cy, rInt, rExt, a0, a1) {
  const p1 = puntoPolar(cx, cy, rExt, a0);
  const p2 = puntoPolar(cx, cy, rExt, a1);
  const p3 = puntoPolar(cx, cy, rInt, a1);
  const p4 = puntoPolar(cx, cy, rInt, a0);
  const largeArc = a1 - a0 > 180 ? 1 : 0;
  return `M ${p1.x} ${p1.y} A ${rExt} ${rExt} 0 ${largeArc} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInt} ${rInt} 0 ${largeArc} 0 ${p4.x} ${p4.y} Z`;
}

function renderMapaEstadio(p) {
  const { cx, cy, radioInterno, radioExterno, wedges } = MAPA_VISUAL;
  const radioMedio = (radioInterno + radioExterno) / 2;

  const gajos = wedges.map(w => {
    const activa = w.zona && w.zona === zonaActiva;
    const path = annularSectorPath(cx, cy, radioInterno, radioExterno, w.desde, w.hasta);
    const medio = (w.desde + w.hasta) / 2;
    const label = puntoPolar(cx, cy, radioMedio, medio);
    const nombre = w.zona ? obtenerZona(w.zona).nombre : w.nombre;
    const precio = w.zona ? formatoARS(p.precios[w.zona]) : "";
    return `
      <g>
        <path class="mapa-wedge ${activa ? "activa" : ""} ${w.zona ? "" : "placeholder"}"
          d="${path}" fill="${activa ? w.colorActiva : w.color}" data-zona="${w.zona || ""}">
          <title>${nombre}${precio ? " — " + precio : " (a definir)"}</title>
        </path>
        <text x="${label.x}" y="${label.y}" class="mapa-wedge-label" text-anchor="middle">${nombre}</text>
        ${precio ? `<text x="${label.x}" y="${label.y + 14}" class="mapa-wedge-precio" text-anchor="middle">${precio}</text>` : ""}
      </g>
    `;
  }).join("");

  return `
    <svg viewBox="0 0 400 370" class="mapa-estadio-svg" role="img" aria-label="Mapa del estadio, tocá una zona para ver las entradas">
      ${gajos}
      <rect x="160" y="160" width="80" height="60" rx="10" fill="#e7c9a3" stroke="#a9784f" stroke-width="2"></rect>
      <circle cx="200" cy="190" r="14" fill="none" stroke="#a9784f" stroke-width="2"></circle>
      <line x1="200" y1="160" x2="200" y2="220" stroke="#a9784f" stroke-width="2"></line>
    </svg>
  `;
}

// Precio por zona y disponibilidad por sección, particular de cada partido.
const PARTIDOS = [
  {
    id: "p1",
    rival: "Regatas vs. San Lorenzo",
    fecha: "Vie 07/08/2026 — 21:00 hs",
    estadio: "Estadio José Jorge Contte",
    precios: { "platea-norte": 15000, "platea-sur": 15000, "populares": 8000 },
    disponibilidad: { "pn-1": 38, "pn-2": 40, "pn-3": 12, "ps-1": 40, "ps-2": 22, "ps-3": 0, "pop-1": 75, "pop-2": 80 },
  },
  {
    id: "p2",
    rival: "Regatas vs. Boca Juniors",
    fecha: "Mar 18/08/2026 — 21:30 hs",
    estadio: "Estadio José Jorge Contte",
    precios: { "platea-norte": 17000, "platea-sur": 17000, "populares": 9000 },
    disponibilidad: { "pn-1": 10, "pn-2": 5, "pn-3": 0, "ps-1": 18, "ps-2": 40, "ps-3": 40, "pop-1": 60, "pop-2": 30 },
  },
  {
    id: "p3",
    rival: "Regatas vs. Instituto",
    fecha: "Sáb 29/08/2026 — 20:00 hs",
    estadio: "Estadio José Jorge Contte",
    precios: { "platea-norte": 15000, "platea-sur": 15000, "populares": 8000 },
    disponibilidad: { "pn-1": 40, "pn-2": 40, "pn-3": 40, "ps-1": 40, "ps-2": 40, "ps-3": 40, "pop-1": 80, "pop-2": 80 },
  },
];

let partidoSeleccionado = null;
let zonaActiva = null;
let seccionActiva = null;
const cantidades = {}; // seccionId -> cantidad elegida (aún no agregada al carrito)
let carrito = []; // { partidoId, rival, zonaId, zonaNombre, seccionId, seccionNombre, precio, cantidad }

const $lista = document.getElementById("partido-lista");
const $panel = document.getElementById("sectores-panel");
const $carritoItems = document.getElementById("carrito-items");
const $carritoVacio = document.getElementById("carrito-vacio");
const $carritoTotal = document.getElementById("carrito-total-monto");
const $btnCheckout = document.getElementById("btn-checkout");
const $modalOverlay = document.getElementById("modal-overlay");
const $modalBox = document.getElementById("modal-box");

function formatoARS(n) {
  return "$" + n.toLocaleString("es-AR");
}

function obtenerZona(zonaId) {
  return MAPA_ESTADIO.zonas.find(z => z.id === zonaId);
}

function obtenerSeccion(zonaId, seccionId) {
  return obtenerZona(zonaId).secciones.find(s => s.id === seccionId);
}

function renderPartidos() {
  $lista.innerHTML = PARTIDOS.map(p => `
    <div class="partido-card">
      <div class="partido-info">
        <h3>${p.rival}</h3>
        <div class="meta">${p.fecha} · ${p.estadio}</div>
      </div>
      <button class="btn btn-outline btn-sm" data-partido="${p.id}">Elegir sector</button>
    </div>
  `).join("");

  $lista.querySelectorAll("button[data-partido]").forEach(btn => {
    btn.addEventListener("click", () => seleccionarPartido(btn.dataset.partido));
  });
}

function seleccionarPartido(id) {
  partidoSeleccionado = PARTIDOS.find(p => p.id === id);
  zonaActiva = MAPA_ESTADIO.zonas[0].id;
  seccionActiva = null;
  renderSectores();
}

function renderSectores() {
  if (!partidoSeleccionado) { $panel.innerHTML = ""; return; }
  const p = partidoSeleccionado;
  $panel.innerHTML = `
    <h2 class="section-title">${p.rival} — elegí tu ubicación</h2>
    <div class="mapa-estadio-wrap">${renderMapaEstadio(p)}</div>
    <div class="zona-nota">Mapa ilustrativo y provisorio — se reemplazará por el plano real del estadio. Tocá una zona para ver sus secciones.</div>
    <div class="zona-tabs">
      ${MAPA_ESTADIO.zonas.map(z => `
        <button class="zona-tab ${z.id === zonaActiva ? "activa" : ""}" data-zona="${z.id}">
          <span>${z.nombre}</span>
          <span class="zona-tab-precio">${formatoARS(p.precios[z.id])}</span>
        </button>
      `).join("")}
    </div>
    <div class="secciones-grid" id="secciones-grid"></div>
    <div id="seccion-detalle"></div>
  `;

  $panel.querySelectorAll(".mapa-wedge:not(.placeholder)").forEach(path => {
    path.addEventListener("click", () => {
      zonaActiva = path.dataset.zona;
      seccionActiva = null;
      renderSectores();
    });
  });

  $panel.querySelectorAll("button[data-zona]").forEach(btn => {
    btn.addEventListener("click", () => {
      zonaActiva = btn.dataset.zona;
      seccionActiva = null;
      renderSectores();
    });
  });

  renderSecciones();
}

function renderSecciones() {
  const p = partidoSeleccionado;
  const zona = obtenerZona(zonaActiva);
  const $grid = document.getElementById("secciones-grid");

  $grid.innerHTML = zona.secciones.map(s => {
    const disponibles = p.disponibilidad[s.id] ?? 0;
    const agotada = disponibles === 0;
    return `
      <button class="seccion-card ${seccionActiva === s.id ? "activa" : ""} ${agotada ? "agotada" : ""}"
        data-seccion="${s.id}" ${agotada ? "disabled" : ""}>
        <span class="seccion-nombre">${s.nombre}</span>
        <span class="seccion-precio">${formatoARS(p.precios[zona.id])}</span>
        <span class="seccion-disp">${agotada ? "Agotado" : disponibles + " disponibles"}</span>
      </button>
    `;
  }).join("");

  $grid.querySelectorAll("button[data-seccion]").forEach(btn => {
    btn.addEventListener("click", () => {
      seccionActiva = btn.dataset.seccion;
      renderSecciones();
    });
  });

  renderDetalleSeccion();
}

function renderDetalleSeccion() {
  const $det = document.getElementById("seccion-detalle");
  if (!seccionActiva) { $det.innerHTML = ""; return; }

  const p = partidoSeleccionado;
  const zona = obtenerZona(zonaActiva);
  const s = obtenerSeccion(zonaActiva, seccionActiva);
  const precio = p.precios[zona.id];
  const disponibles = p.disponibilidad[s.id] ?? 0;
  const limite = Math.min(disponibles, MAX_POR_COMPRA_SECCION);
  cantidades[s.id] = Math.min(cantidades[s.id] || 0, limite);
  const cant = cantidades[s.id];

  $det.innerHTML = `
    <div class="seccion-detalle-box">
      <div class="seccion-detalle-info">
        <h4>${s.nombre}</h4>
        <div class="precio-unitario">${formatoARS(precio)} <span>por entrada</span></div>
        <div class="disponibilidad-msg">${disponibles} entradas disponibles · máximo ${limite || 0} por compra</div>
      </div>
      <div class="qty-control">
        <button data-op="menos">−</button>
        <span id="qty-${s.id}">${cant}</span>
        <button data-op="mas">+</button>
      </div>
      <div class="seccion-subtotal">Subtotal: <strong id="subtotal-${s.id}">${formatoARS(precio * cant)}</strong></div>
      <button class="btn" id="btn-agregar-seccion" ${cant === 0 ? "disabled" : ""}>Agregar al carrito</button>
    </div>
  `;

  $det.querySelector('button[data-op="mas"]').addEventListener("click", () => {
    if (cantidades[s.id] < limite) {
      cantidades[s.id]++;
      actualizarDetalleQty(s.id, precio);
    }
  });
  $det.querySelector('button[data-op="menos"]').addEventListener("click", () => {
    cantidades[s.id] = Math.max(0, cantidades[s.id] - 1);
    actualizarDetalleQty(s.id, precio);
  });
  document.getElementById("btn-agregar-seccion").addEventListener("click", () => agregarSeccionAlCarrito(zona, s, precio));
}

function actualizarDetalleQty(seccionId, precio) {
  document.getElementById(`qty-${seccionId}`).textContent = cantidades[seccionId];
  document.getElementById(`subtotal-${seccionId}`).textContent = formatoARS(precio * cantidades[seccionId]);
  document.getElementById("btn-agregar-seccion").disabled = cantidades[seccionId] === 0;
}

function agregarSeccionAlCarrito(zona, seccion, precio) {
  const cant = cantidades[seccion.id];
  if (!cant) return;

  const p = partidoSeleccionado;
  const existente = carrito.find(it => it.partidoId === p.id && it.seccionId === seccion.id);
  if (existente) existente.cantidad += cant;
  else carrito.push({
    partidoId: p.id, rival: p.rival,
    zonaId: zona.id, zonaNombre: zona.nombre,
    seccionId: seccion.id, seccionNombre: seccion.nombre,
    precio, cantidad: cant,
  });

  p.disponibilidad[seccion.id] -= cant;
  cantidades[seccion.id] = 0;

  renderCarrito();
  renderSecciones();
}

function renderCarrito() {
  if (carrito.length === 0) {
    $carritoItems.innerHTML = "";
    $carritoVacio.style.display = "block";
    $btnCheckout.disabled = true;
    $carritoTotal.textContent = formatoARS(0);
    return;
  }
  $carritoVacio.style.display = "none";
  $btnCheckout.disabled = false;
  $carritoItems.innerHTML = carrito.map((it, idx) => `
    <li>
      <span>${it.cantidad}× ${it.seccionNombre} — ${it.rival}</span>
      <span>
        ${formatoARS(it.precio * it.cantidad)}
        <button data-idx="${idx}" style="border:none;background:none;color:#c0392b;cursor:pointer;">✕</button>
      </span>
    </li>
  `).join("");

  $carritoItems.querySelectorAll("button[data-idx]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.idx);
      const it = carrito[idx];
      const partido = PARTIDOS.find(p => p.id === it.partidoId);
      partido.disponibilidad[it.seccionId] += it.cantidad;
      carrito.splice(idx, 1);
      renderCarrito();
      if (partidoSeleccionado && partidoSeleccionado.id === it.partidoId) renderSecciones();
    });
  });

  const total = carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  $carritoTotal.textContent = formatoARS(total);
}

function abrirCheckout() {
  const total = carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  $modalBox.innerHTML = `
    <button class="modal-close" id="modal-cerrar">✕</button>
    <h3>Confirmar datos</h3>
    <div class="aviso">Esto es un prototipo de demostración: no se procesa ningún pago ni se envían datos a ningún servidor.</div>
    <label for="f-nombre">Nombre y apellido</label>
    <input id="f-nombre" type="text" placeholder="Nombre completo">
    <label for="f-email">Email</label>
    <input id="f-email" type="email" placeholder="tu@email.com">
    <div class="modal-actions">
      <button class="btn btn-outline" id="modal-cancelar" style="flex:1;">Cancelar</button>
      <button class="btn" id="modal-confirmar" style="flex:1;">Confirmar (${formatoARS(total)})</button>
    </div>
  `;
  $modalOverlay.classList.add("abierto");

  document.getElementById("modal-cerrar").addEventListener("click", cerrarModal);
  document.getElementById("modal-cancelar").addEventListener("click", cerrarModal);
  document.getElementById("modal-confirmar").addEventListener("click", confirmarCompra);
}

function generarCodigoSeguro(longitud = 8) {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin caracteres ambiguos (0/O, 1/I/L)
  const bytes = new Uint32Array(longitud);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => alfabeto[b % alfabeto.length]).join("");
}

function confirmarCompra() {
  const nombre = document.getElementById("f-nombre").value.trim();
  const email = document.getElementById("f-email").value.trim();
  if (!nombre || !email) {
    alert("Completá nombre y email para continuar (simulación).");
    return;
  }
  const nroOrden = "DEMO-" + generarCodigoSeguro();
  $modalBox.innerHTML = `
    <button class="modal-close" id="modal-cerrar">✕</button>
    <div class="confirmacion">
      <div class="icono">✔</div>
      <h3>¡Compra simulada exitosa!</h3>
      <p>Orden de prueba <strong>${nroOrden}</strong> a nombre de ${nombre}.</p>
      <p style="margin-top:8px;color:var(--gris);font-size:13px;">
        Esto es solo una demostración: no se realizó ningún cargo real ni se emitió una entrada válida.
      </p>
      <button class="btn" id="modal-listo" style="margin-top:18px;width:100%;">Listo</button>
    </div>
  `;
  document.getElementById("modal-cerrar").addEventListener("click", finalizarDemo);
  document.getElementById("modal-listo").addEventListener("click", finalizarDemo);
}

function finalizarDemo() {
  cerrarModal();
  carrito = [];
  renderCarrito();
}

function cerrarModal() {
  $modalOverlay.classList.remove("abierto");
}

$btnCheckout.addEventListener("click", abrirCheckout);

renderPartidos();
renderCarrito();
