
ipt>document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const openModalBtn = document.getElementById("open-modal-btn");
  const closeModalBtn = document.querySelector(".close-btn");
  const eventForm = document.getElementById("event-form");
  const eventList = document.getElementById("event-list");
  let events = [];

  // Función para abrir el modal
  openModalBtn.addEventListener("click", () => {
    modal.style.display = "block";
  });

  // Función para cerrar el modal
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
    eventForm.reset();
  });

  // Cerrar el modal al hacer clic fuera de la ventana
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
      eventForm.reset();
    }
  });

  // Función para renderizar la lista de eventos
  const renderEvents = () => {
    eventList.innerHTML = "";
    events.forEach(event => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>Nombre del evento:</strong> ${event.title}<br>
        <strong>Descripción:</strong> ${event.description}<br>
        <strong>Ubicación:</strong> ${event.location}<br>
        <strong>Fecha:</strong> ${event.date}<br>
        <strong>Hora:</strong> ${event.time}<br>
        <div class="event-actions">
          <button class="edit-btn" onclick="editEvent('${event.id}')">Editar</button>
          <button class="delete-btn" onclick="deleteEvent('${event.id}')">Eliminar</button>
        </div>
      `;
      eventList.appendChild(li);
    });
  };

  // Función para cargar los eventos desde el servidor
  function loadEvents() {
    fetch('/api/events')
      .then(response => response.json())
      .then(data => {
        events = data;  // Asignar eventos al array
        renderEvents();  // Renderizar los eventos en el DOM
      })
      .catch(error => console.error('Error al cargar los eventos:', error));
  }

  // Función para guardar o editar un evento
  eventForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("event-title").value;
    const description = document.getElementById("event-description").value;
    const location = document.getElementById("event-location").value;
    const date = document.getElementById("event-date").value;
    const time = document.getElementById("event-time").value;
    const eventId = document.getElementById("event-id").value;

    const newEvent = {
      title,
      description,
      location,
      date,
      time,
      id: eventId || new Date().getTime().toString() // Generar ID temporal
    };

    if (eventId) {
      // Actualizar un evento existente
      fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEvent)
      })
      .then(response => response.json())
      .then(updatedEvent => {
        const eventIndex = events.findIndex(ev => ev.id === eventId);
        events[eventIndex] = updatedEvent;
        renderEvents();
      })
      .catch(error => console.error('Error al actualizar el evento:', error));
    } else {
      // Crear un nuevo evento
      fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEvent)
      })
      .then(response => response.json())
      .then(createdEvent => {
        events.push(createdEvent);
        renderEvents();
        saveEventLocally(createdEvent); // Guardar localmente si hay conexión
      })
      .catch(error => {
        console.error('Error al crear el evento:', error);
        saveEventLocally(newEvent); // Guardar localmente si hay error
      });
    }

    modal.style.display = "none";
    eventForm.reset();
  });

  // Función para editar un evento
  window.editEvent = (id) => {
    const event = events.find(ev => ev.id === id);
    document.getElementById("event-title").value = event.title;
    document.getElementById("event-description").value = event.description;
    document.getElementById("event-location").value = event.location;
    document.getElementById("event-date").value = event.date;
    document.getElementById("event-time").value = event.time;
    document.getElementById("event-id").value = event.id;
    modal.style.display = "block";
  };

  // Función para eliminar un evento
  window.deleteEvent = (id) => {
    fetch(`/api/events/${id}`, {
      method: 'DELETE'
    })
    .then(() => {
      events = events.filter(ev => ev.id !== id);
      renderEvents();
    })
    .catch(error => console.error('Error al eliminar el evento:', error));
  };

  // Abrir la base de datos de IndexedDB
  const openDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('eventsDB', 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('events')) {
          db.createObjectStore('events', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };

  // Guardar un evento localmente en IndexedDB (offline)
  const saveEventLocally = (event) => {
    openDB().then(db => {
      const transaction = db.transaction('events', 'readwrite');
      const store = transaction.objectStore('events');
      store.put(event);
      transaction.oncomplete = () => console.log('Evento guardado localmente');
    });
  };

  // Sincronizar eventos locales con el servidor cuando vuelva la conexión
  const syncLocalEventsWithServer = () => {
    openDB().then(db => {
      const transaction = db.transaction('events', 'readonly');
      const store = transaction.objectStore('events');
      const getAll = store.getAll();

      getAll.onsuccess = () => {
        const localEvents = getAll.result;
        localEvents.forEach(event => {
          fetch('/api/events', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
          })
          .then(response => response.json())
          .then(() => {
            console.log('Evento sincronizado con el servidor');
          })
          .catch(error => console.error('Error al sincronizar evento:', error));
        });

        // Limpiar la base de datos local después de sincronizar
        const clearTransaction = db.transaction('events', 'readwrite');
        const clearStore = clearTransaction.objectStore('events');
        clearStore.clear();
      };
    });
  };

  // Escuchar cambios de conexión
  window.addEventListener('online', () => {
    console.log('Conexión restablecida');
    syncLocalEventsWithServer(); // Sincroniza cuando haya conexión
  });

  window.addEventListener('offline', () => {
    console.log('Sin conexión. Guardando datos localmente.');
  });

  // Cargar eventos al cargar la página
  loadEvents();
});
