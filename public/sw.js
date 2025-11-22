// Service Worker for handling push notifications
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.message,
      icon: data.image || '/logo.png',
      badge: '/logo.png',
      image: data.image,
      tag: data.tag || 'ornut-notification',
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: 'View Product'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
        // Try to focus an existing window
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if none found
        if (clients.openWindow) {
          return clients.openWindow('/products');
        }
      })
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', event => {
  event.notification.close();
});
