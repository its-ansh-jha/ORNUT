// Notification utilities for push notifications

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export async function subscribeToPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Create a subscription (for demo purposes, we'll use local notifications)
      subscription = {
        endpoint: 'local-notifications'
      };
    }
    
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

export async function sendNotification(title: string, options: {
  message: string;
  image?: string;
  tag?: string;
}): Promise<void> {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    const NotificationAPI = (window as any).Notification;
    if (NotificationAPI.permission === 'granted') {
      // For local notifications (no backend server needed)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
          body: options.message,
          icon: options.image || '/logo.png',
          badge: '/logo.png',
          image: options.image,
          tag: options.tag || 'ornut-notification',
          requireInteraction: false
        });
      }
    }
  }
}

const PRODUCT_NOTIFICATIONS = [
  {
    title: 'Peanut Butter Khana Hai!',
    message: 'Fresh creamy peanut butter now available - 100% natural & delicious',
    productId: 'natural-creamy-peanut-butter-350g',
    image: null
  },
  {
    title: 'Chocolate wala Peanut Butter',
    message: 'Taste me Yummy Hota haina - Premium chocolate peanut spread',
    productId: 'chocolate-peanut-butter-350g',
    image: null
  },
  {
    title: 'Crunchy Spread Alert!',
    message: 'Love crunchy texture? Try our new crunchy peanut butter',
    productId: 'crunchy-peanut-butter-350g',
    image: null
  }
];

const NOTIFICATION_INTERVAL_MS = 16 * 60 * 1000; // 16 minutes in milliseconds
const STORAGE_KEY = 'ornut_last_notification_time';

export function getRandomNotification() {
  return PRODUCT_NOTIFICATIONS[Math.floor(Math.random() * PRODUCT_NOTIFICATIONS.length)];
}

export function getTimeSinceLastNotification(): number {
  const lastTime = localStorage.getItem(STORAGE_KEY);
  if (!lastTime) return Infinity;
  return Date.now() - parseInt(lastTime, 10);
}

export function shouldShowNotification(): boolean {
  return getTimeSinceLastNotification() >= NOTIFICATION_INTERVAL_MS;
}

export function updateLastNotificationTime() {
  localStorage.setItem(STORAGE_KEY, Date.now().toString());
}

export async function scheduleProductNotifications() {
  // Check if enough time has passed since last notification
  if (shouldShowNotification()) {
    const notification = getRandomNotification();
    
    // Send the notification
    await sendNotification(notification.title, {
      message: notification.message,
      tag: `notification-${Date.now()}`
    });
    
    // Update timestamp
    updateLastNotificationTime();
  }

  // Store notifications in localStorage for later use
  localStorage.setItem('ornut_notifications', JSON.stringify(PRODUCT_NOTIFICATIONS));
  return PRODUCT_NOTIFICATIONS;
}

export function initializeNotificationTimer() {
  // Check for notifications when user comes back to site
  scheduleProductNotifications();
  
  // Check every minute if it's time to show notification
  const intervalId = setInterval(() => {
    if (shouldShowNotification()) {
      scheduleProductNotifications();
    }
  }, 60000); // Check every minute
  
  return intervalId;
}
