import { MAPA_VISUAL } from "../config/estadio.js";
import { obtenerZona, formatoARS } from "../utils/formato.js";
import estado from "../estado.js";

function renderCanchaSVG() {
  return `
    <g class="cancha-mini">
      <rect x="140" y="120" width="140" height="80" rx="6" fill="#e3b579" stroke="#a9784f" stroke-width="2"></rect>
      <line x1="210" y1="120" x2="210" y2="200" stroke="#fff" stroke-width="1.5"></line>
      <circle cx="210" cy="160" r="13" fill="none" stroke="#fff" stroke-width="1.5"></circle>
      <circle cx="210" cy="160" r="2" fill="#fff"></circle>

      <rect x="140" y="140" width="30" height="40" fill="none" stroke="#fff" stroke-width="1.3"></rect>
      <circle cx="170" cy="160" r="11" fill="none" stroke="#fff" stroke-width="1.3"></circle>
      <path d="M 140 130 Q 190 160 140 190" fill="none" stroke="#fff" stroke-width="1.3"></path>
      <circle cx="148" cy="160" r="2.5" fill="none" stroke="#fff" stroke-width="1.3"></circle>

      <rect x="250" y="140" width="30" height="40" fill="none" stroke="#fff" stroke-width="1.3"></rect>
      <circle cx="250" cy="160" r="11" fill="none" stroke="#fff" stroke-width="1.3"></circle>
      <path d="M 280 130 Q 230 160 280 190" fill="none" stroke="#fff" stroke-width="1.3"></path>
      <circle cx="272" cy="160" r="2.5" fill="none" stroke="#fff" stroke-width="1.3"></circle>
    </g>
  `;
}

function renderBandasYCanchaSVG(p) {
  const bandas = MAPA_VISUAL.bandas.map(banda => {
    const zona = banda.zona ? obtenerZona(banda.zona) : null;
    const activa = banda.zona && banda.zona === estado.zonaActiva;
    const fill = activa ? banda.colorActiva : banda.color;

    if (!zona) {
      const cx = banda.x + banda.width / 2;
      const cy = banda.y + banda.height / 2;
      return `
        <g>
          <rect class="mapa-banda placeholder" x="${banda.x}" y="${banda.y}" width="${banda.width}" height="${banda.height}" rx="6" fill="${fill}" stroke="${banda.stroke}">
            <title>${banda.nombre} (a definir)</title>
          </rect>
          <text x="${cx}" y="${cy}" class="mapa-banda-label" text-anchor="middle">${banda.nombre}</text>
        </g>
      `;
    }

    const secciones = zona.secciones;
    const n = secciones.length;
    const largo = banda.eje === "x" ? banda.width : banda.height;
    const medida = (largo - banda.gap * (n - 1)) / n;
    const precio = formatoARS(p.precios[zona.id]);

    return secciones.map((s, i) => {
      let sx = banda.x, sy = banda.y, sw = banda.width, sh = banda.height;
      if (banda.eje === "x") { sx = banda.x + i * (medida + banda.gap); sw = medida; }
      else { sy = banda.y + i * (medida + banda.gap); sh = medida; }
      const cx = sx + sw / 2, cy = sy + sh / 2;
      
      const isSeccionActiva = s.id === estado.seccionActiva;
      const isHighlighted = isSeccionActiva || (activa && !estado.seccionActiva);
      const strokeColor = isHighlighted ? "#0b2447" : banda.stroke;
      const strokeWidth = isHighlighted ? 3 : 1.5;

      return `
        <g>
          <rect class="mapa-banda ${isHighlighted ? "activa" : ""}" data-zona="${banda.zona}" data-seccion="${s.id}" x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="6" fill="${isHighlighted ? banda.colorActiva : fill}" stroke="${strokeColor}" stroke-width="${strokeWidth}">
            <title>${s.nombre} — ${precio}</title>
          </rect>
          <text x="${cx}" y="${cy}" class="mapa-banda-label" text-anchor="middle">${i + 1}</text>
        </g>
      `;
    }).join("");
  }).join("");

  return `${bandas}${renderCanchaSVG()}`;
}

export function renderMapaEstadio(p) {
  return `
    <svg viewBox="0 0 ${MAPA_VISUAL.ancho} ${MAPA_VISUAL.alto}" class="mapa-estadio-svg" role="img" aria-label="Mapa del estadio, tocá una zona para ver las entradas">
      ${renderBandasYCanchaSVG(p)}
    </svg>
  `;
}

// Vista "con zoom" de una zona puntual: recorta el viewBox para acercar la cancha
// y la tribuna elegida, en vez de mostrar el estadio entero de lejos.
export function renderMapaZoom(p, zonaId) {
  const viewBox = MAPA_VISUAL.zoom[zonaId] || `0 0 ${MAPA_VISUAL.ancho} ${MAPA_VISUAL.alto}`;
  return `
    <svg viewBox="${viewBox}" class="mapa-estadio-svg mapa-zoom" role="img" aria-label="Zoom de la cancha y la tribuna elegida">
      ${renderBandasYCanchaSVG(p)}
    </svg>
  `;
}

export function renderLeyendaMapa() {
  return `
    <div class="mapa-leyenda">
      ${MAPA_VISUAL.bandas.map(b => `
        <span><i class="mapa-leyenda-swatch" style="background:${b.color};border-color:${b.stroke}"></i>${b.zona ? obtenerZona(b.zona).nombre : b.nombre}</span>
      `).join("")}
    </div>
  `;
}
