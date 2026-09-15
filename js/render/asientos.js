import { MAX_POR_COMPRA_ZONA } from "../config/estadio.js";
import estado from "../estado.js";
import { $panel } from "../utils/dom.js";
import { formatoARS, claveAsiento } from "../utils/formato.js";
import { renderMapaArena } from "./mapa.js";
import { renderCarrito } from "../carrito.js";
import { actualizarStep } from "./partidos.js";

// Estado local de la vista del mapa
let cantPersonas = 2;
let zoomLevel = 100;

export function renderSectores() {
  if (!estado.partidoSeleccionado) {
    $panel.innerHTML = "";
    return;
  }

  const p = estado.partidoSeleccionado;

  // Calcular total acumulado de lo actualmente seleccionado en el mapa
  let cantTotal = 0;
  let montoTotal = 0;

  estado.asientosSeleccionados.forEach(clave => {
    const [seccionId] = clave.split("::");
    cantTotal++;
    const precio = p.precios[seccionId] || 15000;
    montoTotal += precio;
  });

  $panel.innerHTML = `
    <div class="sectores-header" style="margin-bottom:16px;">
      <h2 class="section-title">${p.rival} — Seleccioná tus ubicaciones</h2>
    </div>

    ${renderMapaArena(p, { cantPersonas, zoom: zoomLevel })}

    <!-- Barra de subtotal y confirmación -->
    <div class="arena-cta-bar ${cantTotal > 0 ? 'activa' : ''}" id="arena-cta-bar">
      <div class="arena-cta-info">
        <div class="arena-cta-count">
          ${cantTotal > 0
      ? `${cantTotal} entrada${cantTotal > 1 ? 's' : ''} seleccionada${cantTotal > 1 ? 's' : ''}`
      : 'Hacé clic en los asientos o populares para elegirlos'}
        </div>
        ${cantTotal > 0 ? `<div class="arena-cta-total">${formatoARS(montoTotal)}</div>` : ''}
      </div>

      <button type="button" class="btn arena-btn-comprar" id="btn-agregar-al-carrito" ${cantTotal === 0 ? 'disabled' : ''}>
        ${cantTotal > 0 ? `Agregar ${cantTotal} al carrito →` : 'Elegí tus entradas'}
      </button>
    </div>
  `;

  // ── Vincular Eventos ─────────────────────────────────────────

  // 1. Clic en asientos de Platea Río / Platea Parque
  $panel.querySelectorAll(".arena-seat:not(.ocupado)").forEach(btn => {
    btn.addEventListener("click", () => {
      const seccionId = btn.dataset.seccion;
      const asientoId = btn.dataset.asiento;
      const clave = claveAsiento(seccionId, asientoId);

      if (estado.asientosSeleccionados.has(clave)) {
        estado.asientosSeleccionados.delete(clave);
      } else {
        if (estado.asientosSeleccionados.size >= MAX_POR_COMPRA_ZONA) {
          alert(`Podés seleccionar un máximo de ${MAX_POR_COMPRA_ZONA} entradas por compra.`);
          return;
        }
        estado.asientosSeleccionados.add(clave);
      }

      actualizarStep(3);
      renderSectores();
    });
  });

  // 2. Clic en General Norte
  const btnGenNorte = $panel.querySelector("#btn-general-norte");
  if (btnGenNorte) {
    btnGenNorte.addEventListener("click", (e) => {
      manejarClickGeneral("general-norte", e);
    });
  }

  // 3. Clic en General Sur
  const btnGenSur = $panel.querySelector("#btn-general-sur");
  if (btnGenSur) {
    btnGenSur.addEventListener("click", (e) => {
      manejarClickGeneral("general-sur", e);
    });
  }

  // 4. Stepper de personas
  const btnMenos = $panel.querySelector("#btn-stepper-menos");
  const btnMas = $panel.querySelector("#btn-stepper-mas");
  if (btnMenos) {
    btnMenos.addEventListener("click", () => {
      if (cantPersonas > 1) {
        cantPersonas--;
        renderSectores();
      }
    });
  }
  if (btnMas) {
    btnMas.addEventListener("click", () => {
      if (cantPersonas < MAX_POR_COMPRA_ZONA) {
        cantPersonas++;
        renderSectores();
      }
    });
  }

  // 5. Botón "Buscar juntos" (selecciona automáticamente N butacas contiguas)
  const btnBuscarJuntos = $panel.querySelector("#btn-buscar-juntos");
  if (btnBuscarJuntos) {
    btnBuscarJuntos.addEventListener("click", () => {
      buscarAsientosJuntos(cantPersonas);
    });
  }

  // 6. Botón "Restablecer"
  const btnRestablecer = $panel.querySelector("#btn-restablecer");
  if (btnRestablecer) {
    btnRestablecer.addEventListener("click", () => {
      estado.asientosSeleccionados.clear();
      renderSectores();
    });
  }

  // 7. Zoom widget
  const btnZoomMenos = $panel.querySelector("#btn-zoom-menos");
  const btnZoomMas = $panel.querySelector("#btn-zoom-mas");
  if (btnZoomMenos) {
    btnZoomMenos.addEventListener("click", () => {
      if (zoomLevel > 80) {
        zoomLevel -= 10;
        aplicarZoom();
      }
    });
  }
  if (btnZoomMas) {
    btnZoomMas.addEventListener("click", () => {
      if (zoomLevel < 120) {
        zoomLevel += 10;
        aplicarZoom();
      }
    });
  }

  // 8. Botón "Agregar al carrito"
  const btnAgregar = $panel.querySelector("#btn-agregar-al-carrito");
  if (btnAgregar) {
    btnAgregar.addEventListener("click", () => {
      confirmarSeleccionAlCarrito();
    });
  }
}

// ── Helpers ──────────────────────────────────────────────────

function aplicarZoom() {
  const viewport = document.getElementById("arena-viewport");
  const zoomPct = document.getElementById("zoom-pct");
  if (viewport) viewport.style.transform = `scale(${zoomLevel / 100})`;
  if (zoomPct) zoomPct.textContent = `${zoomLevel}%`;
}

function manejarClickGeneral(zonaId, e) {
  const stepBtn = e.target.closest(".gen-step-btn");
  if (stepBtn) {
    e.stopPropagation();
    const action = stepBtn.dataset.action;
    modificarGeneral(zonaId, action === "plus" ? 1 : -1);
    return;
  }

  // Si hizo clic en la tarjeta fuera del stepper:
  modificarGeneral(zonaId, 1);
}

function modificarGeneral(zonaId, delta) {
  const claves = Array.from(estado.asientosSeleccionados).filter(k => k.startsWith(`${zonaId}::`));

  if (delta > 0) {
    if (estado.asientosSeleccionados.size >= MAX_POR_COMPRA_ZONA) {
      alert(`Podés seleccionar un máximo de ${MAX_POR_COMPRA_ZONA} entradas por compra.`);
      return;
    }
    const nuevaClave = `${zonaId}::ticket-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    estado.asientosSeleccionados.add(nuevaClave);
  } else if (delta < 0) {
    if (claves.length > 0) {
      estado.asientosSeleccionados.delete(claves[claves.length - 1]);
    }
  }

  actualizarStep(3);
  renderSectores();
}

function toggleGeneral(zonaId) {
  modificarGeneral(zonaId, 1);
}

function buscarAsientosJuntos(cantidad) {
  const p = estado.partidoSeleccionado;
  if (!p) return;

  // Prioridad: Fila A o B de Platea Río, luego Platea Parque
  const zonasAExaminar = [
    { id: "lado-rio", filas: ["A", "B", "C", "D"] },
    { id: "parque", filas: ["A", "B", "C", "D"] },
  ];

  for (const z of zonasAExaminar) {
    const asientos = p.asientos[z.id];
    if (!asientos) continue;

    for (const f of z.filas) {
      const asientosFila = asientos.filter(a => a.fila === f);

      // Prioridad 1: Sector Central (asientos 9 a 16) - "Mejor vista"
      const centro = asientosFila.filter(a => a.numero >= 9 && a.numero <= 16);
      const juntosCentro = encontrarContiguos(centro, cantidad);
      if (juntosCentro) {
        aplicarAsientosEncontrados(z.id, juntosCentro);
        return;
      }

      // Prioridad 2: Sector 1 (asientos 1 a 8)
      const b1 = asientosFila.filter(a => a.numero >= 1 && a.numero <= 8);
      const juntosB1 = encontrarContiguos(b1, cantidad);
      if (juntosB1) {
        aplicarAsientosEncontrados(z.id, juntosB1);
        return;
      }

      // Prioridad 3: Sector 3 (asientos 17 a 24)
      const b3 = asientosFila.filter(a => a.numero >= 17 && a.numero <= 24);
      const juntosB3 = encontrarContiguos(b3, cantidad);
      if (juntosB3) {
        aplicarAsientosEncontrados(z.id, juntosB3);
        return;
      }
    }
  }

  alert("No encontramos esa cantidad de butacas contiguas en la misma fila. Podés seleccionarlas individualmente.");
}

function encontrarContiguos(asientosLista, cant) {
  asientosLista.sort((a, b) => a.numero - b.numero);
  for (let i = 0; i <= asientosLista.length - cant; i++) {
    const sub = asientosLista.slice(i, i + cant);
    const todosLibres = sub.every(a => !a.ocupado);
    const consecutivos = sub.every((a, idx) => idx === 0 || a.numero === sub[idx - 1].numero + 1);
    if (todosLibres && consecutivos) return sub;
  }
  return null;
}

function aplicarAsientosEncontrados(seccionId, asientos) {
  estado.asientosSeleccionados.clear();
  asientos.forEach(a => {
    estado.asientosSeleccionados.add(claveAsiento(seccionId, a.id));
  });
  actualizarStep(3);
  renderSectores();

  // Scroll suave al mapa
  const view = document.getElementById("arena-viewport");
  if (view) view.scrollIntoView({ behavior: "smooth", block: "center" });
}

function confirmarSeleccionAlCarrito() {
  if (estado.asientosSeleccionados.size === 0) return;
  const p = estado.partidoSeleccionado;

  // Agrupar por sección
  const porSeccion = {};
  estado.asientosSeleccionados.forEach(clave => {
    const [seccionId, asientoId] = clave.split("::");
    if (!porSeccion[seccionId]) porSeccion[seccionId] = [];
    porSeccion[seccionId].push(asientoId);
  });

  Object.entries(porSeccion).forEach(([seccionId, ids]) => {
    let zonaNombre = "";
    let seccionNombre = "";
    let precio = p.precios[seccionId] || 15000;

    if (seccionId === "lado-rio") {
      zonaNombre = "Platea Río";
      seccionNombre = "Platea Río (Butacas numeradas)";
    } else if (seccionId === "parque") {
      zonaNombre = "Platea Parque";
      seccionNombre = "Platea Parque (Butacas numeradas)";
    } else if (seccionId === "general-norte") {
      zonaNombre = "General Norte";
      seccionNombre = "General Norte (De pie)";
    } else if (seccionId === "general-sur") {
      zonaNombre = "General Sur";
      seccionNombre = "General Sur (De pie)";
    }

    // Marcar ocupados si son asientos numerados
    if (p.asientos[seccionId]) {
      ids.forEach(id => {
        const a = p.asientos[seccionId].find(as => as.id === id);
        if (a) a.ocupado = true;
      });
    }

    const existente = estado.carrito.find(it => it.partidoId === p.id && it.seccionId === seccionId);
    if (existente) {
      existente.cantidad += ids.length;
      existente.asientos.push(...ids);
    } else {
      estado.carrito.push({
        partidoId: p.id,
        rival: p.rival,
        fecha: p.fecha,
        estadio: p.estadio,
        zonaId: seccionId,
        zonaNombre,
        seccionId,
        seccionNombre,
        precio,
        cantidad: ids.length,
        asientos: ids,
      });
    }
  });

  estado.asientosSeleccionados = new Set();
  renderCarrito();
  actualizarStep(4);
  renderSectores();

  // Animación / feedback suave hacia el carrito
  const carritoBox = document.querySelector(".carrito-box");
  if (carritoBox) {
    carritoBox.classList.add("carrito-updated");
    setTimeout(() => carritoBox.classList.remove("carrito-updated"), 600);
  }
}

// Mantener compatibilidad si se llama externamente
export function renderAsientosZona() {
  renderSectores();
}
