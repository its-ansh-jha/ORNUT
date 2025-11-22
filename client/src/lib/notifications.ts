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
}) {
  if (Notification.permission === 'granted') {
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
    } else {
      // Fallback to basic notification
      new Notification(title, {
        body: options.message,
        icon: options.image
      });
    }
  }
}

export async function scheduleProductNotifications() {
  // Schedule periodic product notifications
  const notifications = [
    {
      title: 'Peanut Butter Khana Hai!',
      message: 'Fresh creamy peanut butter now available - 100% natural & delicious',
      productId: 'natural-creamy-peanut-butter-350g',
      image: null // Will be loaded from product image
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

  // Store notifications in localStorage for later use
  localStorage.setItem('ornut_notifications', JSON.stringify(notifications));
  return notifications;
}
