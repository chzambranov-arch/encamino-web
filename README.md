# En Camino Logística · Laboratorio

Página de una sola pieza (`index.html`) con seis laboratorios de logística en 3D,
bilingüe (ES/EN), pensada para abrirse desde reels de Instagram en el celular.

- `index.html` — la página completa, lista para GitHub Pages.
- `src/` — el código fuente por partes; `node src/build.js` vuelve a armar `index.html`.
- `tests/` — pruebas automáticas con Playwright (`node tests/verify.js`).
- `capturas/` — capturas de pantalla que dejan las pruebas.

Enlaces profundos: `?reel=6` abre la fila de camiones, `?reel=4` los andenes, `?reel=2` el pasillo de Amazon;
`?caso=nivel`, `?caso=ikea`, `?caso=ups` los demás.
