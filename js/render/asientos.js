import { MAPA_ESTADIO, MAX_POR_COMPRA_ZONA } from "../config/estadio.js";
import estado from "../estado.js";
import { $panel } from "../utils/dom.js";
import { formatoARS, obtenerZona, obtenerSeccion, claveAsiento } from "../utils/formato.js";
import { agruparPorFila } from "../utils/random.js";
import { renderMapaEstadio, renderLeyendaMapa } from "./mapa.js";
import { renderCarrito } from "../carrito.js";

export function renderSectores() {
  if (!estado.partidoSeleccionado) { $panel.innerHTML = ""; return; }
  const p = estado.partidoSeleccionado;
  const zona = obtenerZona(estado.zonaActiva);

  // Asegurar que la sección activa sea válida para la zona actual
  if (!estado.seccionActiva || !zona.secciones.some(s => s.id === estado.seccionActiva)) {
    estado.seccionActiva = zona.secciones[0].id;
  }

  $panel.innerHTML = `
    <h2 class="section-title">${p.rival} — elegí tu ubicación</h2>
    <div class="mapa-estadio-wrap">${renderMapaEstadio(p)}</div>
    ${renderLeyendaMapa()}
    <div class="zona-nota">Mapa ilustrativo y provisorio — se reemplazará por el plano real del estadio. Tocá una zona o sección en el mapa para ver sus detalles.</div>
    
    <div class="zona-tabs">
      ${MAPA_ESTADIO.zonas.map(z => `
        <button class="zona-tab ${z.id === estado.zonaActiva ? "activa" : ""}" data-zona="${z.id}">
          <span>${z.nombre}</span>
          <span class="zona-tab-precio">${formatoARS(p.precios[z.id])}</span>
        </button>
      `).join("")}
    </div>

    <div class="seccion-selector-wrap" style="margin-top: 15px; display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 13px; font-weight: 700; color: var(--marino);">Seleccionar Sección:</span>
      <div class="seccion-tabs" style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${zona.secciones.map(s => `
          <button class="btn btn-sm ${s.id === estado.seccionActiva ? "" : "btn-outline"}" data-seccion-tab="${s.id}" style="padding: 5px 12px; font-size: 12px;">
            ${s.nombre.replace(zona.nombre + " - ", "")}
          </button>
        `).join("")}
      </div>
    </div>

    <div id="zona-asientos"></div>
  `;

  // Interacción con bandas del mapa SVG
  $panel.querySelectorAll(".mapa-banda:not(.placeholder)").forEach(rect => {
    rect.addEventListener("click", () => {
      estado.zonaActiva = rect.dataset.zona;
      if (rect.dataset.seccion) {
        estado.seccionActiva = rect.dataset.seccion;
      } else {
        const z = obtenerZona(estado.zonaActiva);
        estado.seccionActiva = z.secciones[0].id;
      }
      estado.asientosSeleccionados = new Set();
      renderSectores();
    });
  });

  // Interacción con tabs de zonas
  $panel.querySelectorAll("button[data-zona]").forEach(btn => {
    btn.addEventListener("click", () => {
      estado.zonaActiva = btn.dataset.zona;
      const z = obtenerZona(estado.zonaActiva);
      estado.seccionActiva = z.secciones[0].id;
      estado.asientosSeleccionados = new Set();
      renderSectores();
    });
  });

  // Interacción con tabs de secciones
  $panel.querySelectorAll("button[data-seccion-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      estado.seccionActiva = btn.dataset.seccionTab;
      estado.asientosSeleccionados = new Set();
      renderSectores();
    });
  });

  renderAsientosZona();
}

function renderSpatialLayoutSVG(zonaId, activePos) {
  const isParque = zonaId === "parque";
  const standsY = isParque ? 15 : 130;
  const courtY = isParque ? 85 : 15;
  
  const fillActive = "#0f5fa8"; // Azul Regatas para el sector seleccionado
  const fillInactive = "#f1f5f9";
  
  const s1Active = activePos === "izq";
  const s2Active = activePos === "centro";
  const s3Active = activePos === "der";
  
  let conePoints = "";
  let sightlines = "";
  
  if (isParque) {
    if (s1Active) {
      conePoints = "15,50 135,50 210,85 15,85";
      sightlines = `
        <line x1="15" y1="50" x2="15" y2="85" stroke="#3fb6f0" stroke-width="1.2" stroke-dasharray="3,3"></line>
        <line x1="135" y1="50" x2="210" y2="85" stroke="#3fb6f0" stroke-width="1.2" stroke-dasharray="3,3"></line>
        <line x1="75" y1="50" x2="112.5" y2="85" stroke="#3fb6f0" stroke-width="2" stroke-dasharray="3,3" marker-end="url(#arrow)"></line>
      `;
    } else if (s2Active) {
      conePoints = "145,50 275,50 310,85 100,85";
      sightlines = `
        <line x1="145" y1="50" x2="100" y2="85" stroke="#3fb6f0" stroke-width="1.2" stroke-dasharray="3,3"></line>
        <line x1="275" y1="50" x2="310" y2="85" stroke="#3fb6f0" stroke-width="1.2" stroke-dasharray="3,3"></line>
        <line x1="210" y1="50" x2="210" y2="85" stroke="#3fb6f0" stroke-width="2" stroke-dasharray="3,3" marker-end="url(#arrow)"></line>
      `;
    } else if (s3Active) {
      conePoints = "285,50 405,50 405,85 210,85";
      sightlines = `
        <line x1="285" y1="50" x2="210" y2="85" stroke="#3fb6f0" stroke-width="1.2" stroke-dasharray="3,3"></line>
        <line x1="405" y1="50" x2="405" y2="85" stroke="#3fb6f0" stroke-width="1.2" stroke-dasharray="3,3"></line>
        <line x1="345" y1="50" x2="307.5" y2="85" stroke="#3fb6f0" stroke-width="2" stroke-dasharray="3,3" marker-end="url(#arrow)"></line>
      `;
    }
  } else {
    // Lado Río
    if (s1Active) {
      conePoints = "15,130 135,130 210,95 15,95";
      sightlines = `
        <line x1="15" y1="130" x2="15" y2="95" stroke="#3fb6f0" stroke-width="1.2" stroke-dasharray="3,3"></line>
        <line x1="135" y1="130" x2="210" y2="95" stroke="#3fb6f0" stroke-width="1.2" stroke-dasharray="3,3"></line>
        <line x1="75" y1="130" x2="112.5" y2="95" stroke="#3fb6f0" stroke-width="2" stroke-dasharray="3,3" marker-end="url(#arrow-reverse)"></line>
      `;
    } else if (s2Active) {
      conePoints = "145,130 275,130 310,95 100,95";
      sightlines = `
        <line x1="145" y1="130" x2="100" y2="95" stroke="#3fb6f0" stroke-width="1.2" stroke-dasharray="3,3"></line>
        <line x1="275" y1="130" x2="310" y2="95" stroke="#3fb6f0" stroke-width="1.2" stroke-dasharray="3,3"></line>
        <line x1="210" y1="130" x2="210" y2="95" stroke="#3fb6f0" stroke-width="2" stroke-dasharray="3,3" marker-end="url(#arrow-reverse)"></line>
      `;
    } else if (s3Active) {
      conePoints = "285,130 405,130 405,95 210,95";
      sightlines = `
        <line x1="285" y1="130" x2="210" y2="95" stroke="#3fb6f0" stroke-width="1.2" stroke-dasharray="3,3"></line>
        <line x1="405" y1="130" x2="405" y2="95" stroke="#3fb6f0" stroke-width="1.2" stroke-dasharray="3,3"></line>
        <line x1="345" y1="130" x2="307.5" y2="95" stroke="#3fb6f0" stroke-width="2" stroke-dasharray="3,3" marker-end="url(#arrow-reverse)"></line>
      `;
    }
  }

  return `
    <svg viewBox="0 0 420 180" class="spatial-layout-svg" style="width: 100%; height: auto; background: #ffffff; border-radius: 8px; border: 1px solid var(--borde);">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#3fb6f0" />
        </marker>
        <marker id="arrow-reverse" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 10 1 L 0 5 L 10 9 z" fill="#3fb6f0" />
        </marker>
      </defs>

      <!-- Cono del Campo Visual -->
      <polygon points="${conePoints}" fill="rgba(63, 182, 240, 0.08)"></polygon>
      ${sightlines}

      <!-- Cancha de Básquet -->
      <g transform="translate(15, ${courtY})">
        <rect x="0" y="0" width="390" height="80" rx="6" fill="#fbeed9" stroke="#d4a373" stroke-width="1.5"></rect>
        <!-- Líneas demarcatorias de la cancha -->
        <line x1="195" y1="0" x2="195" y2="80" stroke="#d4a373" stroke-width="1.2" stroke-dasharray="3,3"></line>
        <circle cx="195" cy="40" r="16" fill="none" stroke="#d4a373" stroke-width="1.2"></circle>
        
        <!-- Áreas pintadas / Llaves (Celeste Regatas) -->
        <rect x="0" y="24" width="40" height="32" fill="#dbeaf8" stroke="#d4a373" stroke-width="1.2"></rect>
        <circle cx="40" cy="40" r="16" fill="none" stroke="#d4a373" stroke-width="1.2"></circle>
        <rect x="350" y="24" width="40" height="32" fill="#dbeaf8" stroke="#d4a373" stroke-width="1.2"></rect>
        <circle cx="350" cy="40" r="16" fill="none" stroke="#d4a373" stroke-width="1.2"></circle>
        
        <!-- Líneas de triple -->
        <path d="M 0 10 C 60 20, 60 60, 0 70" fill="none" stroke="#d4a373" stroke-width="1.2"></path>
        <path d="M 390 10 C 330 20, 330 60, 390 70" fill="none" stroke="#d4a373" stroke-width="1.2"></path>
        
        <!-- Aros y tableros -->
        <line x1="15" y1="32" x2="15" y2="48" stroke="#d4a373" stroke-width="2"></line>
        <circle cx="20" cy="40" r="3.5" fill="none" stroke="#d4a373" stroke-width="1.2"></circle>
        
        <line x1="375" y1="32" x2="375" y2="48" stroke="#d4a373" stroke-width="2"></line>
        <circle cx="370" cy="40" r="3.5" fill="none" stroke="#d4a373" stroke-width="1.2"></circle>
        
        <text x="195" y="44" fill="#cda886" font-size="8" font-weight="bold" text-anchor="middle" letter-spacing="1.5">CAMPO DE JUEGO</text>
      </g>

      <!-- Tribunas (Secciones) -->
      <g>
        <!-- Sección 1 -->
        <rect x="15" y="${standsY}" width="120" height="35" rx="6" 
              fill="${s1Active ? fillActive : fillInactive}" 
              stroke="${s1Active ? '#0b4a85' : '#cbd5e1'}" 
              stroke-width="${s1Active ? 2 : 1}"></rect>
        <text x="75" y="${standsY + 22}" fill="${s1Active ? '#ffffff' : '#64748b'}" font-size="10" font-weight="bold" text-anchor="middle">
          ${s1Active ? '★ Tu Sección 1' : 'Sección 1'}
        </text>
        
        <!-- Sección 2 -->
        <rect x="145" y="${standsY}" width="130" height="35" rx="6" 
              fill="${s2Active ? fillActive : fillInactive}" 
              stroke="${s2Active ? '#0b4a85' : '#cbd5e1'}" 
              stroke-width="${s2Active ? 2 : 1}"></rect>
        <text x="210" y="${standsY + 22}" fill="${s2Active ? '#ffffff' : '#64748b'}" font-size="10" font-weight="bold" text-anchor="middle">
          ${s2Active ? '★ Tu Sección 2' : 'Sección 2'}
        </text>
        
        <!-- Sección 3 -->
        <rect x="285" y="${standsY}" width="120" height="35" rx="6" 
              fill="${s3Active ? fillActive : fillInactive}" 
              stroke="${s3Active ? '#0b4a85' : '#cbd5e1'}" 
              stroke-width="${s3Active ? 2 : 1}"></rect>
        <text x="345" y="${standsY + 22}" fill="${s3Active ? '#ffffff' : '#64748b'}" font-size="10" font-weight="bold" text-anchor="middle">
          ${s3Active ? '★ Tu Sección 3' : 'Sección 3'}
        </text>
      </g>
    </svg>
  `;
}

export function renderAsientosZona() {
  const $cont = document.getElementById("zona-asientos");
  const p = estado.partidoSeleccionado;
  const zona = obtenerZona(estado.zonaActiva);
  const precio = p.precios[zona.id];

  // Sección seleccionada activa
  const s = zona.secciones.find(sec => sec.id === estado.seccionActiva) || zona.secciones[0];

  const totalDisponibles = p.asientos[s.id].filter(a => !a.ocupado).length;
  const limite = Math.min(totalDisponibles, MAX_POR_COMPRA_ZONA);
  const cant = estado.asientosSeleccionados.size;

  const isSpatial = zona.id === "parque" || zona.id === "lado-rio";
  const seccionIndex = zona.secciones.findIndex(sec => sec.id === s.id);
  const pos = seccionIndex === 0 ? "izq" : (seccionIndex === 1 ? "centro" : "der");

  let spatialPickerHTML = "";

  if (isSpatial) {
    // Representación horizontal de la cancha en planta
    const courtHTML = `
      <div class="court-representation-horizontal" style="width: 420px; margin: 15px auto;">
        ${renderSpatialLayoutSVG(zona.id, pos)}
        <div class="court-label" style="text-align: center; font-size: 10px; font-weight: bold; color: var(--gris); margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">
          Ubicación de tu sección respecto del campo de juego y visual proyectada
        </div>
      </div>
    `;

    // Para "parque" (zona arriba), F1 está más cerca de la cancha (abajo). Orden: F5, F4, F3, F2, F1.
    // Para "lado-rio" (zona abajo), F1 está más cerca de la cancha (arriba). Orden: F1, F2, F3, F4, F5.
    let filas = agruparPorFila(p.asientos[s.id]);
    if (zona.id === "parque") {
      filas = [...filas].reverse();
    }

    const seatsGridHTML = `
      <div class="spatial-seat-map-wrapper">
        <div class="spatial-seats-grid align-${pos}">
          ${filas.map(fila => `
            <div class="seat-row">
              <span class="seat-row-label">F${fila[0].fila}</span>
              <div class="seat-row-asientos">
                ${fila.map(a => {
                  let est = "disponible";
                  if (a.ocupado) est = "ocupado";
                  else if (estado.asientosSeleccionados.has(claveAsiento(s.id, a.id))) est = "seleccionado";
                  return `<button class="seat ${est}" data-seccion="${s.id}" data-asiento="${a.id}" ${a.ocupado ? "disabled" : ""} title="${s.nombre} - Fila ${a.fila} - Asiento ${a.numero}">${a.numero}</button>`;
                }).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    spatialPickerHTML = `
      <div class="spatial-layout layout-${zona.id}" style="width: 100%; display: flex; flex-direction: column; align-items: center;">
        ${zona.id === "lado-rio" ? courtHTML + seatsGridHTML : seatsGridHTML + courtHTML}
      </div>
    `;
  } else {
    // Vista clásica tipo cine para populares
    spatialPickerHTML = `
      <div class="seat-map-seccion" style="border-top: none; margin-top: 0; padding-top: 0;">
        ${agruparPorFila(p.asientos[s.id]).map(fila => `
          <div class="seat-row" style="justify-content: center;">
            <span class="seat-row-label">F${fila[0].fila}</span>
            <div class="seat-row-asientos">
              ${fila.map(a => {
                let est = "disponible";
                if (a.ocupado) est = "ocupado";
                else if (estado.asientosSeleccionados.has(claveAsiento(s.id, a.id))) est = "seleccionado";
                return `<button class="seat ${est}" data-seccion="${s.id}" data-asiento="${a.id}" ${a.ocupado ? "disabled" : ""} title="${s.nombre} - Fila ${a.fila} - Asiento ${a.numero}">${a.numero}</button>`;
              }).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  $cont.innerHTML = `
    <div class="seccion-detalle-box seat-picker">
      <div class="seccion-detalle-info">
        <h4>${s.nombre}</h4>
        <div class="precio-unitario">${formatoARS(precio)} <span>por entrada</span></div>
        <div class="disponibilidad-msg">${totalDisponibles} asientos disponibles en esta sección · máximo ${limite || 0} por compra</div>
      </div>

      <div class="seat-map">
        ${spatialPickerHTML}
      </div>

      <div class="seat-legend">
        <span><i class="seat-swatch disponible"></i>Disponible</span>
        <span><i class="seat-swatch seleccionado"></i>Seleccionado</span>
        <span><i class="seat-swatch ocupado"></i>Ocupado</span>
      </div>

      <div class="seccion-subtotal">Subtotal (${cant} entrada${cant === 1 ? "" : "s"}): <strong>${formatoARS(precio * cant)}</strong></div>
      <button class="btn" id="btn-agregar-zona" ${cant === 0 ? "disabled" : ""}>Agregar al carrito</button>
    </div>
  `;

  // Controladores de eventos para los asientos
  $cont.querySelectorAll("button[data-asiento]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = claveAsiento(btn.dataset.seccion, btn.dataset.asiento);
      if (estado.asientosSeleccionados.has(key)) {
        estado.asientosSeleccionados.delete(key);
      } else {
        if (estado.asientosSeleccionados.size >= limite) return;
        estado.asientosSeleccionados.add(key);
      }
      renderAsientosZona();
    });
  });

  document.getElementById("btn-agregar-zona").addEventListener("click", () => agregarZonaAlCarrito(zona, precio));
}

function agregarZonaAlCarrito(zona, precio) {
  if (estado.asientosSeleccionados.size === 0) return;
  const p = estado.partidoSeleccionado;

  const porSeccion = {};
  estado.asientosSeleccionados.forEach(key => {
    const [seccionId, asientoId] = key.split("::");
    if (!porSeccion[seccionId]) porSeccion[seccionId] = [];
    porSeccion[seccionId].push(asientoId);
  });

  Object.entries(porSeccion).forEach(([seccionId, ids]) => {
    const seccion = obtenerSeccion(zona.id, seccionId);
    const asientos = p.asientos[seccionId];
    ids.forEach(id => { asientos.find(a => a.id === id).ocupado = true; });

    const existente = estado.carrito.find(it => it.partidoId === p.id && it.seccionId === seccionId);
    if (existente) { existente.cantidad += ids.length; existente.asientos.push(...ids); }
    else estado.carrito.push({
      partidoId: p.id, rival: p.rival,
      zonaId: zona.id, zonaNombre: zona.nombre,
      seccionId, seccionNombre: seccion.nombre,
      precio, cantidad: ids.length, asientos: ids,
    });
  });

  estado.asientosSeleccionados = new Set();

  renderCarrito();
  renderAsientosZona();
}
