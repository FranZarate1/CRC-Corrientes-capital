import { PARTIDOS } from "../config/partidos.js";
import { MAPA_ESTADIO } from "../config/estadio.js";
import estado from "../estado.js";
import { $lista } from "../utils/dom.js";
import { formatoARS } from "../utils/formato.js";
import { renderSectores } from "./asientos.js";

export function renderPartidos() {
  $lista.innerHTML = PARTIDOS.map(p => {
    const precioMin = Math.min(...Object.values(p.precios));
    const esSeleccionado = estado.partidoSeleccionado && estado.partidoSeleccionado.id === p.id;
    return `
    <article class="partido-card ${esSeleccionado ? "seleccionado" : ""}" data-partido="${p.id}" role="button" tabindex="0" aria-pressed="${esSeleccionado}">
      <div class="partido-info">
        <div class="partido-badge">🏀 LNB · Local</div>
        <h3>${p.rival}</h3>
        <div class="meta">
          <span class="meta-item">📅 ${p.fecha}</span>
          <span class="meta-item">📍 ${p.estadio}</span>
        </div>
      </div>
      <div class="partido-right">
        <div>
          <div class="partido-precio-desde">desde</div>
          <div class="partido-precio-monto">${formatoARS(precioMin)} <small>/ entrada</small></div>
        </div>
        <button class="btn btn-sm ${esSeleccionado ? "btn-outline" : ""}" data-partido-btn="${p.id}" aria-label="Elegir sector para ${p.rival}">
          ${esSeleccionado ? "Partido elegido ✓" : "Elegir sector →"}
        </button>
      </div>
    </article>
    `;
  }).join("");

  $lista.querySelectorAll(".partido-card").forEach(card => {
    card.addEventListener("click", () => {
      seleccionarPartido(card.dataset.partido);
      actualizarStep(2);
    });
  });
}

function seleccionarPartido(id) {
  estado.partidoSeleccionado = PARTIDOS.find(p => p.id === id);
  estado.zonaActiva = MAPA_ESTADIO.zonas[0].id;
  estado.seccionActiva = MAPA_ESTADIO.zonas[0].secciones[0].id;
  estado.asientosSeleccionados = new Set();

  renderPartidos();
  renderSectores();

  // Scroll suave hacia el plano de la cancha
  setTimeout(() => {
    const panel = document.getElementById("sectores-panel");
    if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 50);
}

// Actualiza el indicador de pasos en el header
export function actualizarStep(stepNum) {
  document.querySelectorAll(".step").forEach(el => {
    const n = Number(el.dataset.step);
    if (n < stepNum)  { el.classList.add("done");   el.classList.remove("active"); el.querySelector(".step-num").textContent = "✓"; }
    else if (n === stepNum) { el.classList.add("active"); el.classList.remove("done"); el.querySelector(".step-num").textContent = n; }
    else              { el.classList.remove("active", "done"); el.querySelector(".step-num").textContent = n; }
  });
}
