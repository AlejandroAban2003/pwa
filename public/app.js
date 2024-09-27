document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById('app');
  
    // Renderizado dinámico en el cliente
    app.innerHTML = `<h1>Hola desde el lado del cliente (CSR)</h1>`;
  });

  
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt event detected');
    // Prevenir que el navegador muestre el prompt automáticamente
    e.preventDefault();
    deferredPrompt = e;
  
    // Crear el botón de instalación
    const installButton = document.createElement('button');
    installButton.innerText = 'Instalar PWA';
    installButton.id = 'install-button';
  
    // // Agregar el b
    // const installContainer = document.getElementById('install-container');
    // installContainer.appendChild(installButton);
  
    // Manejar el evento de clic en el botón
    installButton.addEventListener('click', () => {
      // Mostrar el prompt de instalación
      deferredPrompt.prompt();
  
      // Verificar lo que el usuario eligió
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('El usuario aceptó instalar la PWA');
        } else {
          console.log('El usuario rechazó instalar la PWA');
        }
        deferredPrompt = null;  // Reiniciar el prompt
      });
    });
  });
  