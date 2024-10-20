const express = require('express');
const app = express();

let tasks = [];  // Arreglo para las tareas
let events = []; // Arreglo para los eventos

// Middleware para parsear JSON
app.use(express.json());  // Esto reemplaza body-parser
app.use(express.static('public'));  // Para servir archivos estáticos

// --- Rutas para tareas (tasks) ---
// Obtener todas las tareas
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// Crear una nueva tarea
app.post('/api/tasks', (req, res) => {
  const newTask = req.body;
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// --- Rutas para eventos (events) ---
// Obtener todos los eventos
app.get('/api/events', (req, res) => {
  res.json(events);
});

// Crear un nuevo evento
app.post('/api/events', (req, res) => {
  const newEvent = req.body;
  events.push(newEvent);
  res.status(201).json(newEvent);
});

// Actualizar un evento
app.put('/api/events/:id', (req, res) => {
  const id = req.params.id;
  const updatedEvent = req.body;
  const eventIndex = events.findIndex(event => event.id === id);

  if (eventIndex !== -1) {
    events[eventIndex] = updatedEvent;
    res.json(updatedEvent);
  } else {
    res.status(404).json({ message: 'Evento no encontrado' });
  }
});

// Eliminar un evento
app.delete('/api/events/:id', (req, res) => {
  const id = req.params.id;
  events = events.filter(event => event.id !== id);
  res.status(204).send();
});

// Iniciar servidor
app.listen(3001, () => {
  console.log('Servidor corriendo en http://localhost:3001');
});
