// Prototipo de compra de entradas LNB — datos simulados, sin backend ni pagos reales.

const PARTIDOS = [
  {
    id: "p1",
    rival: "Regatas vs. San Lorenzo",
    fecha: "Vie 07/08/2026 — 21:00 hs",
    estadio: "Estadio José Jorge Contte",
    sectores: [
      { id: "popular", nombre: "Popular", precio: 8000 },
      { id: "platea", nombre: "Platea", precio: 15000 },
      { id: "vip", nombre: "Palco VIP", precio: 30000 },
    ],
  },
  {
    id: "p2",
    rival: "Regatas vs. Boca Juniors",
    fecha: "Mar 18/08/2026 — 21:30 hs",
    estadio: "Estadio José Jorge Contte",
    sectores: [
      { id: "popular", nombre: "Popular", precio: 9000 },
      { id: "platea", nombre: "Platea", precio: 17000 },
      { id: "vip", nombre: "Palco VIP", precio: 35000 },
    ],
  },
  {
    id: "p3",
    rival: "Regatas vs. Instituto",
    fecha: "Sáb 29/08/2026 — 20:00 hs",
    estadio: "Estadio José Jorge Contte",
    sectores: [
      { id: "popular", nombre: "Popular", precio: 8000 },
      { id: "platea", nombre: "Platea", precio: 15000 },
      { id: "vip", nombre: "Palco VIP", precio: 30000 },
    ],
  },
];

let partidoSeleccionado = null;
const cantidades = {}; // sectorId -> cantidad
let carrito = []; // { partidoId, rival, sectorId, sectorNombre, precio, cantidad }

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
  for (const s of partidoSeleccionado.sectores) cantidades[s.id] = cantidades[s.id] || 0;
  renderSectores();
}

function renderSectores() {
  if (!partidoSeleccionado) { $panel.innerHTML = ""; return; }
  const p = partidoSeleccionado;
  $panel.innerHTML = `
    <h2 class="section-title">${p.rival} — elegí sector</h2>
    <div class="sectores">
      ${p.sectores.map(s => `
        <div class="sector-card">
          <h4>${s.nombre}</h4>
          <div class="precio">${formatoARS(s.precio)}</div>
          <div class="qty-control">
            <button data-op="menos" data-sector="${s.id}">−</button>
            <span id="qty-${s.id}">${cantidades[s.id]}</span>
            <button data-op="mas" data-sector="${s.id}">+</button>
          </div>
        </div>
      `).join("")}
    </div>
    <button class="btn" style="margin-top:16px;" id="btn-agregar-carrito">Agregar al carrito</button>
  `;

  $panel.querySelectorAll("button[data-op]").forEach(btn => {
    btn.addEventListener("click", () => {
      const sid = btn.dataset.sector;
      if (btn.dataset.op === "mas") cantidades[sid]++;
      else cantidades[sid] = Math.max(0, cantidades[sid] - 1);
      document.getElementById(`qty-${sid}`).textContent = cantidades[sid];
    });
  });

  document.getElementById("btn-agregar-carrito").addEventListener("click", agregarAlCarrito);
}

function agregarAlCarrito() {
  const p = partidoSeleccionado;
  let algoAgregado = false;
  for (const s of p.sectores) {
    const cant = cantidades[s.id];
    if (cant > 0) {
      const existente = carrito.find(it => it.partidoId === p.id && it.sectorId === s.id);
      if (existente) existente.cantidad += cant;
      else carrito.push({ partidoId: p.id, rival: p.rival, sectorId: s.id, sectorNombre: s.nombre, precio: s.precio, cantidad: cant });
      algoAgregado = true;
      cantidades[s.id] = 0;
    }
  }
  if (algoAgregado) renderCarrito();
  renderSectores();
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
      <span>${it.cantidad}× ${it.sectorNombre} — ${it.rival}</span>
      <span>
        ${formatoARS(it.precio * it.cantidad)}
        <button data-idx="${idx}" style="border:none;background:none;color:#c0392b;cursor:pointer;">✕</button>
      </span>
    </li>
  `).join("");

  $carritoItems.querySelectorAll("button[data-idx]").forEach(btn => {
    btn.addEventListener("click", () => {
      carrito.splice(Number(btn.dataset.idx), 1);
      renderCarrito();
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
