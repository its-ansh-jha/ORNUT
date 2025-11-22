// Background notification timer for service worker
// This script runs periodically to check if it's time to send notifications

const NOTIFICATION_INTERVAL_MS = 16 * 60 * 1000; // 16 minutes
const STORAGE_KEY = 'ornut_last_notification_time';

const PRODUCT_NOTIFICATIONS = [
  {
    title: 'Peanut Butter Khana Hai!',
    message: 'Fresh creamy peanut butter now available - 100% natural & delicious',
  },
  {
    title: 'Chocolate wala Peanut Butter',
    message: 'Taste me Yummy Hota haina - Premium chocolate peanut spread',
  },
  {
    title: 'Crunchy Spread Alert!',
    message: 'Love crunchy texture? Try our new crunchy peanut butter',
  }
];

function getRandomNotification() {
  return PRODUCT_NOTIFICATIONS[Math.floor(Math.random() * PRODUCT_NOTIFICATIONS.length)];
}

function getTimeSinceLastNotification() {
  const lastTime = localStorage.getItem(STORAGE_KEY);
  if (!lastTime) return Infinity;
  return Date.now() - parseInt(lastTime, 10);
}

function shouldShowNotification() {
  return getTimeSinceLastNotification() >= NOTIFICATION_INTERVAL_MS;
}

function updateLastNotificationTime() {
  localStorage.setItem(STORAGE_KEY, Date.now().toString());
}

// Periodic background check
if ('serviceWorkerContainer' in navigator && 'periodicSync' in self.registration) {
  self.addEventListener('periodicsync', event => {
    if (event.tag === 'ornut-notifications' && shouldShowNotification()) {
      const notification = getRandomNotification();
      self.registration.showNotification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'ornut-notification',
        requireInteraction: false
      });
      updateLastNotificationTime();
    }
  });
}
