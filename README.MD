# CRC — Prototipo de compra de entradas LNB

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

### Demo online

La versión publicada en GitHub Pages puede recorrerse directamente desde el navegador:

<https://franzarate1.github.io/CRC-Corrientes-capital/>

También se puede acceder directamente al flujo de entradas desde:

<https://franzarate1.github.io/CRC-Corrientes-capital/entradas.html>

La demo online corresponde a la rama `feature` y mantiene el mismo alcance de prototipo:
no procesa pagos, no reserva ubicaciones y no genera entradas válidas para ingresar.

## Estructura

- `index.html` — portada (header, nav, noticias, deportes, LNB) con CTA a "Comprar Entradas".
- `entradas.html` — listado de partidos de demostración, selección de sector/cantidad, carrito y
  checkout simulado.
- `css/style.css` — estilos compartidos.
- `js/main.js` — punto de entrada que inicializa la aplicación.
- `js/estado.js` — estado local del carrito y de la selección.
- `js/carrito.js` — renderizado y actualización del carrito.
- `js/checkout.js` — formulario y ticket de demostración.
- `js/config/` — datos simulados del estadio y de los partidos.
- `js/render/` — renderizado de partidos, mapa y asientos.
- `js/utils/` — utilidades de DOM, formato y generación de datos demo.

## Mantenimiento del prototipo

- El fixture, las fechas y los precios de ejemplo se editan en `js/config/partidos.js`. Son datos fijos: revisar antes de cada presentación. La interfaz los identifica como demostración para no confundirlos con partidos confirmados.
- La distribución del estadio y el límite de entradas se editan en `js/config/estadio.js`. El plano visual está en `js/render/mapa.js`.
- Los estilos compartidos, incluidos los ajustes para celular, están en `css/style.css`. El menú de ambas páginas usa `js/navigation.js`.
- Probar la portada y el flujo de entradas a 320, 375, 430, 768 y 1024 px cuando se cambien tarjetas, textos, menú o plano. En el plano móvil, verificar que el desplazamiento horizontal se conserve al seleccionar una butaca.

## Alcance actual

La aplicación es un prototipo navegable para evaluar la experiencia de usuario. Los
partidos, sectores, precios y disponibilidad son simulados en el navegador. El checkout
no procesa pagos, no reserva ubicaciones y no envía ni almacena datos en un servidor.
El ticket generado incluye códigos visuales de demostración y no es válido para ingresar.

## Próximos pasos si se quiere llevar a producción

- Reemplazar los datos de partidos simulados por una API real (fixture de la LNB).
- Integrar un procesador de pagos real (ej. Mercado Pago) en vez del checkout simulado.
- Autorización y branding oficial del club antes de publicar nada externamente.
- Backend para fixture, inventario, reservas temporales y emisión de entradas.
- Integración con socios, autenticación, pagos, facturación y notificaciones.
- Validaciones, seguridad, auditoría y pruebas antes de cualquier uso productivo.
