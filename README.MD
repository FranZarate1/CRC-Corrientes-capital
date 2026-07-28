# CRC — Prototipo con sección "Comprar Entradas" (LNB)

Prototipo estático (HTML/CSS/JS puro, sin dependencias ni build) inspirado en la estructura
y paleta de colores de [crc.org.ar](https://crc.org.ar/w/), al que se le agrega una sección
nueva de **Comprar Entradas** para los partidos de la Liga Nacional de Básquet.

> ⚠️ Este es un **prototipo interno / demo**. No es el sitio oficial del club, los datos de
> partidos son simulados y el flujo de compra **no procesa pagos reales** (no hay backend,
> no se piden ni almacenan datos de tarjeta).

## Cómo verlo

No requiere instalación. Alcanza con abrir `index.html` en el navegador, o servirlo local:

```bash
python -m http.server 8000
```

y entrar a `http://localhost:8000/`.

## Estructura

- `index.html` — portada (header, nav, noticias, deportes, LNB) con CTA a "Comprar Entradas".
- `entradas.html` — listado de próximos partidos, selección de sector/cantidad, carrito y
  checkout simulado (`js/entradas.js`).
- `css/style.css` — estilos compartidos.
- `js/entradas.js` — lógica de carrito y checkout simulado (sin backend).

## Próximos pasos si se quiere llevar a producción

- Reemplazar los datos de partidos simulados por una API real (fixture de la LNB).
- Integrar un procesador de pagos real (ej. Mercado Pago) en vez del checkout simulado.
- Autorización y branding oficial del club antes de publicar nada externamente.
