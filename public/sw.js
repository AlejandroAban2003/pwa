self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('v1').then(cache => {
        return cache.addAll([
          '/',
          '/styles.css',
          '/app.js',
          '/manifest.json'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  });
  
  let deferredPrompt;


  self.addEventListener('sync', event => {
    if (event.tag === 'sync-events') {
      event.waitUntil(syncLocalEventsWithServer()); // Sincroniza los eventos locales con el servidor
    }
  });
  