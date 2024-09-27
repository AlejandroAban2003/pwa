const express = require('express');
const app = express();
const path = require('path');


app.use(express.static('public'));

// Ruta principal con SSR
app.get('/', (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mi PWA con SSR</title>
      <link rel="stylesheet" href="/styles.css">
      <link rel="manifest" href="/manifest.json">
    </head>
    <body>cl
      <div id="app">
        <h1>Hola desde el lado del servidor (SSR)</h1>
      </div>
      <script src="/app.js"></script>
    </body>
    </html>
  `;
  res.send(html);
});

// Inicia el servidor
app.listen(3001, () => {
  console.log('Servidor SSR corriendo en http://localhost:3001');
});
