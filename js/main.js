// Entry point — importa los módulos e inicializa la app.
// Prototipo de compra de entradas LNB — datos simulados, sin backend ni pagos reales.

import { inicializarAsientos } from "./config/partidos.js";
import { $btnCheckout } from "./utils/dom.js";
import { renderPartidos } from "./render/partidos.js";
import { renderCarrito } from "./carrito.js";
import { abrirCheckout } from "./checkout.js";

inicializarAsientos();
renderPartidos();
renderCarrito();

$btnCheckout.addEventListener("click", abrirCheckout);
