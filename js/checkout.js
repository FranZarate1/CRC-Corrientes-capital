import estado from "./estado.js";
import { $modalOverlay, $modalBox } from "./utils/dom.js";
import { formatoARS } from "./utils/formato.js";
import { generarCodigoSeguro } from "./utils/random.js";
import { renderCarrito } from "./carrito.js";

function cerrarModal() {
  $modalOverlay.classList.remove("abierto");
}

function finalizarDemo() {
  cerrarModal();
  estado.carrito = [];
  renderCarrito();
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

export function abrirCheckout() {
  const total = estado.carrito.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
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
