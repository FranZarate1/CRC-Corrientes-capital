import { formatoARS } from "../utils/formato.js";
import { claveAsiento } from "../utils/formato.js";
import estado from "../estado.js";

// ── Cancha de básquet central (alineada 1:1 con el ancho total de las plateas) ──
export function renderCanchaSVG() {
  return `
    <svg viewBox="0 0 460 170" class="arena-cancha-svg" role="img" aria-label="Cancha oficial de básquet del Club de Regatas Corrientes">
      <defs>
        <pattern id="parquet-slats" width="16" height="16" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="16" y2="0" stroke="#f0e4d2" stroke-width="0.5" opacity="0.6"/>
          <line x1="8" y1="0" x2="8" y2="16" stroke="#f0e4d2" stroke-width="0.5" opacity="0.4"/>
        </pattern>
      </defs>

      <!-- Piso de parquet madera -->
      <rect x="2" y="2" width="456" height="166" rx="8" fill="#f5ede3" stroke="#ddccb4" stroke-width="1.5"/>
      <rect x="2" y="2" width="456" height="166" rx="8" fill="url(#parquet-slats)" opacity="0.75"/>

      <!-- Línea perimetral interior -->
      <rect x="12" y="10" width="436" height="150" fill="none" stroke="#d5c4b0" stroke-width="1.4"/>

      <!-- Línea central de mitad de campo -->
      <line x1="230" y1="10" x2="230" y2="160" stroke="#d5c4b0" stroke-width="1.4"/>

      <!-- Círculo central con REGATAS -->
      <circle cx="230" cy="85" r="32" fill="none" stroke="#d5c4b0" stroke-width="1.4"/>
      <circle cx="230" cy="85" r="1.8" fill="#d5c4b0"/>
      <text x="230" y="88.5" fill="#a08d77" font-size="10" font-weight="800" letter-spacing="2.5"
            text-anchor="middle" font-family="'Inter', sans-serif">REGATAS</text>

      <!-- ── LLAVE IZQUIERDA (Zona pintada) ──────────────── -->
      <rect x="12" y="52" width="72" height="66" fill="rgba(215, 195, 170, 0.18)" stroke="#d5c4b0" stroke-width="1.4"/>
      <path d="M 84 52 a 33 33 0 0 1 0 66" fill="none" stroke="#d5c4b0" stroke-width="1.4"/>
      <path d="M 84 52 a 33 33 0 0 0 0 66" fill="none" stroke="#d5c4b0" stroke-width="1" stroke-dasharray="3,3"/>
      <!-- Tablero y aro izquierdo -->
      <line x1="26" y1="68" x2="26" y2="102" stroke="#bfaaa0" stroke-width="2.2"/>
      <line x1="26" y1="85" x2="32" y2="85" stroke="#bfaaa0" stroke-width="1.4"/>
      <circle cx="36" cy="85" r="5.5" fill="none" stroke="#ba8257" stroke-width="1.8"/>
      <!-- Triple izquierdo -->
      <path d="M 12 22 L 48 22 A 75 75 0 0 1 48 148 L 12 148" fill="none" stroke="#d5c4b0" stroke-width="1.4"/>

      <!-- ── LLAVE DERECHA (Zona pintada) ───────────────── -->
      <rect x="376" y="52" width="72" height="66" fill="rgba(215, 195, 170, 0.18)" stroke="#d5c4b0" stroke-width="1.4"/>
      <path d="M 376 52 a 33 33 0 0 0 0 66" fill="none" stroke="#d5c4b0" stroke-width="1.4"/>
      <path d="M 376 52 a 33 33 0 0 1 0 66" fill="none" stroke="#d5c4b0" stroke-width="1" stroke-dasharray="3,3"/>
      <!-- Tablero y aro derecho -->
      <line x1="434" y1="68" x2="434" y2="102" stroke="#bfaaa0" stroke-width="2.2"/>
      <line x1="434" y1="85" x2="428" y2="85" stroke="#bfaaa0" stroke-width="1.4"/>
      <circle cx="424" cy="85" r="5.5" fill="none" stroke="#ba8257" stroke-width="1.8"/>
      <!-- Triple derecho -->
      <path d="M 448 22 L 412 22 A 75 75 0 0 0 412 148 L 448 148" fill="none" stroke="#d5c4b0" stroke-width="1.4"/>
    </svg>
  `;
}

// ── Render de 3 bloques de asientos con pasillos centrales ───────
function renderFilasDeAsientos(filas, seccionId, asientosData) {
  const mapaAsientos = new Map();
  (asientosData || []).forEach(a => {
    mapaAsientos.set(`${a.fila}-${a.numero}`, a);
  });

  return filas.map(filaLetra => {
    // Bloque 1: Asientos 1 a 8
    const b1 = [];
    for (let n = 1; n <= 8; n++) {
      const a = mapaAsientos.get(`${filaLetra}-${n}`) || { id: `F${filaLetra}-A${n}`, fila: filaLetra, numero: n, ocupado: false };
      b1.push(renderBotonAsiento(seccionId, a));
    }

    // Bloque 2: Asientos 9 a 16 (Sector Central)
    const b2 = [];
    for (let n = 9; n <= 16; n++) {
      const a = mapaAsientos.get(`${filaLetra}-${n}`) || { id: `F${filaLetra}-A${n}`, fila: filaLetra, numero: n, ocupado: false };
      b2.push(renderBotonAsiento(seccionId, a));
    }

    // Bloque 3: Asientos 17 a 24
    const b3 = [];
    for (let n = 17; n <= 24; n++) {
      const a = mapaAsientos.get(`${filaLetra}-${n}`) || { id: `F${filaLetra}-A${n}`, fila: filaLetra, numero: n, ocupado: false };
      b3.push(renderBotonAsiento(seccionId, a));
    }

    return `
      <div class="arena-seat-row">
        <span class="arena-row-label left" aria-hidden="true">${filaLetra}</span>
        <div class="arena-seat-block block-1">${b1.join("")}</div>
        <div class="arena-aisle" aria-hidden="true"></div>
        <div class="arena-seat-block block-2">${b2.join("")}</div>
        <div class="arena-aisle" aria-hidden="true"></div>
        <div class="arena-seat-block block-3">${b3.join("")}</div>
        <span class="arena-row-label right" aria-hidden="true">${filaLetra}</span>
      </div>
    `;
  }).join("");
}

function renderBotonAsiento(seccionId, a) {
  const clave = claveAsiento(seccionId, a.id);
  const esSeleccionado = estado.asientosSeleccionados.has(clave);

  let estadoClase = "disponible";
  if (a.ocupado) estadoClase = "ocupado";
  else if (esSeleccionado) estadoClase = "tu-seleccion";

  return `
    <button type="button"
            class="arena-seat ${estadoClase}"
            data-seccion="${seccionId}"
            data-asiento="${a.id}"
            ${a.ocupado ? "disabled aria-disabled='true'" : ""}
            aria-pressed="${esSeleccionado}"
            aria-label="Fila ${a.fila}, Asiento ${a.numero}${a.ocupado ? ' (ocupado)' : ''}"
            title="Fila ${a.fila} — Asiento ${a.numero}">
      ${a.numero}
    </button>
  `;
}

// ── Render vista completa de la arena con 3 sectores ──────────
export function renderMapaArena(p, { cantPersonas = 2, zoom = 100 } = {}) {
  const precioRio = p.rangos?.["lado-rio"] || "$18.000 – $24.000";
  const precioParque = p.rangos?.["parque"] || "$15.000 – $21.000";
  const precioNorte = formatoARS(p.precios["general-norte"] || 9000);
  const precioSur = formatoARS(p.precios["general-sur"] || 9000);

  let cantNorte = 0;
  let cantSur = 0;
  estado.asientosSeleccionados.forEach(clave => {
    if (clave.startsWith("general-norte::")) cantNorte++;
    if (clave.startsWith("general-sur::")) cantSur++;
  });

  return `
    <div class="arena-card">
      <!-- Barra superior de filtros -->
      <div class="arena-top-toolbar">
        <div class="arena-toolbar-left">
          <span class="arena-toolbar-label">¿Cuántos vienen?</span>
          <div class="arena-stepper">
            <button type="button" class="stepper-btn" id="btn-stepper-menos" aria-label="Menos personas">−</button>
            <span class="stepper-value" id="stepper-val">${cantPersonas} persona${cantPersonas > 1 ? "s" : ""}</span>
            <button type="button" class="stepper-btn" id="btn-stepper-mas" aria-label="Más personas">+</button>
          </div>
          <div class="arena-dropdown-wrap">
            <button type="button" class="arena-select-btn" id="btn-filtro-vista">
              <span>Mejor vista</span>
              <span class="dropdown-chevron">▾</span>
            </button>
          </div>
        </div>

        <button type="button" class="btn-buscar-juntos" id="btn-buscar-juntos">
          <span class="sparkle-icon">✦</span> Buscar juntos
        </button>
      </div>

      <!-- Sub-barra: Butacas y generales + Restablecer -->
      <div class="arena-subbar">
        <div class="arena-subbar-title">
          <span class="subbar-bullet">•</span> Butacas y generales (3 sectores por platea a lo largo de la cancha)
        </div>
        <button type="button" class="btn-restablecer" id="btn-restablecer">
          Restablecer
        </button>
      </div>

      <!-- Contenedor con zoom de la cancha y tribunas -->
      <div class="arena-viewport" id="arena-viewport" style="transform: scale(${zoom / 100}); transform-origin: top center;">
        
        <!-- ── PLATEA RÍO (Superior) ─────────────────────────── -->
        <section class="arena-tribuna tribuna-rio" aria-label="Platea Río">
          <div class="arena-tribuna-header">
            <div class="arena-tribuna-titulo">
              <span class="tribuna-simbolo">≈</span> PLATEA RÍO
            </div>
            <div class="arena-tribuna-precio">${precioRio}</div>
          </div>

          <!-- Indicadores de los 3 sectores -->
          <div class="arena-sectores-header">
            <span class="sector-pill">SECTOR 1 (1 - 8)</span>
            <span class="sector-pill centro">SECTOR 2 · CENTRAL (9 - 16)</span>
            <span class="sector-pill">SECTOR 3 (17 - 24)</span>
          </div>

          <div class="arena-filas-wrap">
            ${renderFilasDeAsientos(["D", "C", "B", "A"], "lado-rio", p.asientos["lado-rio"])}
          </div>

          <div class="arena-linea-lateral">LÍNEA LATERAL</div>
        </section>

        <!-- ── CENTRO: GENERAL NORTE + CANCHA + GENERAL SUR ─── -->
        <div class="arena-middle-row">
          <!-- General Norte (Cabecera Norte) -->
          <div class="arena-general-card ${cantNorte > 0 ? 'seleccionada' : ''}"
               id="btn-general-norte"
               data-general="general-norte"
               role="button"
               tabindex="0"
               aria-label="General Norte, de pie, ${precioNorte}">
            <div class="general-card-title">GENERAL<br>NORTE</div>
            <div class="general-card-sub">De pie</div>
            <div class="general-card-precio">${precioNorte}</div>
            ${cantNorte > 0 ? `<div class="general-card-badge">${cantNorte} seleccionada${cantNorte > 1 ? 's' : ''}</div>` : ''}
          </div>

          <!-- Cancha central alineada 1:1 con el ancho de las plateas -->
          <div class="arena-cancha-wrapper">
            ${renderCanchaSVG()}
          </div>

          <!-- General Sur (Cabecera Sur) -->
          <div class="arena-general-card ${cantSur > 0 ? 'seleccionada' : ''}"
               id="btn-general-sur"
               data-general="general-sur"
               role="button"
               tabindex="0"
               aria-label="General Sur, de pie, ${precioSur}">
            <div class="general-card-title">GENERAL<br>SUR</div>
            <div class="general-card-sub">De pie</div>
            <div class="general-card-precio">${precioSur}</div>
            ${cantSur > 0 ? `<div class="general-card-badge">${cantSur} seleccionada${cantSur > 1 ? 's' : ''}</div>` : ''}
          </div>
        </div>

        <!-- ── PLATEA PARQUE (Inferior) ──────────────────────── -->
        <section class="arena-tribuna tribuna-parque" aria-label="Platea Parque">
          <div class="arena-linea-lateral top">LÍNEA LATERAL</div>

          <div class="arena-filas-wrap">
            ${renderFilasDeAsientos(["A", "B", "C", "D"], "parque", p.asientos["parque"])}
          </div>

          <!-- Indicadores de los 3 sectores -->
          <div class="arena-sectores-header bottom">
            <span class="sector-pill">SECTOR 1 (1 - 8)</span>
            <span class="sector-pill centro">SECTOR 2 · CENTRAL (9 - 16)</span>
            <span class="sector-pill">SECTOR 3 (17 - 24)</span>
          </div>

          <div class="arena-tribuna-header bottom">
            <div class="arena-tribuna-titulo">
              <span class="tribuna-simbolo">♠</span> PLATEA PARQUE
            </div>
            <div class="arena-tribuna-precio">${precioParque}</div>
            <div class="arena-acceso-label">ACCESO PRINCIPAL ↑</div>
          </div>
        </section>

      </div>

      <!-- Barra inferior: Referencias + Control de Zoom -->
      <div class="arena-bottom-bar">
        <div class="arena-legend" aria-label="Referencias de asientos">
          <span class="legend-item">
            <i class="legend-swatch disponible" aria-hidden="true"></i> Disponible
          </span>
          <span class="legend-item">
            <i class="legend-swatch tu-seleccion" aria-hidden="true"></i> Tu selección
          </span>
          <span class="legend-item">
            <i class="legend-swatch ocupado" aria-hidden="true"></i> Ocupado
          </span>
        </div>

        <div class="arena-zoom-widget" aria-label="Control de zoom">
          <button type="button" class="zoom-btn" id="btn-zoom-menos" aria-label="Reducir zoom">−</button>
          <span class="zoom-pct" id="zoom-pct">${zoom}%</span>
          <button type="button" class="zoom-btn" id="btn-zoom-mas" aria-label="Aumentar zoom">+</button>
        </div>
      </div>
    </div>
  `;
}
