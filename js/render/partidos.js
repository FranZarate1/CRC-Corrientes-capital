import { PARTIDOS } from "../config/partidos.js";
import { MAPA_ESTADIO } from "../config/estadio.js";
import estado from "../estado.js";
import { $lista } from "../utils/dom.js";
import { renderSectores } from "./asientos.js";

export function renderPartidos() {
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
  estado.partidoSeleccionado = PARTIDOS.find(p => p.id === id);
  estado.zonaActiva = MAPA_ESTADIO.zonas[0].id;
  estado.seccionActiva = MAPA_ESTADIO.zonas[0].secciones[0].id;
  estado.asientosSeleccionados = new Set();
  renderSectores();
}
