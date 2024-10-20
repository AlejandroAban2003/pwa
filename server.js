const express = require('express');
const bodyParser = require('body-parser');
const app = express();

let events = [];  // Almacenamiento temporal

// Middleware para parsear el cuerpo de las solicitudes
app.use(bodyParser.json());
app.use(express.static('public'));

// Ruta para obtener todos los eventos (Read)
app.get('/api/events', (req, res) => {
  res.json(events);
});

// Ruta para crear un nuevo evento (Create)
app.post('/api/events', (req, res) => {
  const newEvent = { ...req.body, id: Date.now().toString() };
  events.push(newEvent);
  res.status(201).json(newEvent);
});

// Ruta para actualizar un evento por ID (Update)
app.put('/api/events/:id', (req, res) => {
  const id = req.params.id;
  const updatedEvent = { ...req.body, id };
  const eventIndex = events.findIndex(ev => ev.id === id);
  if (eventIndex !== -1) {
    events[eventIndex] = updatedEvent;
    res.json(updatedEvent);
  } else {
    res.status(404).json({ error: 'Evento no encontrado' });
  }
});

// Ruta para eliminar un evento por ID (Delete)
app.delete('/api/events/:id', (req, res) => {
  const id = req.params.id;
  events = events.filter(ev => ev.id !== id);
  res.status(204).end();
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});

if ('serviceWorker' in navigator && 'SyncManager' in window) {
  navigator.serviceWorker.ready.then(registration => {
    registration.sync.register('sync-events')
      .then(() => console.log('Sincronización en segundo plano registrada'))
      .catch(err => console.error('Error al registrar la sincronización:', err));
  });
}

