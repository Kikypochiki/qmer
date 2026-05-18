'use client'

import { useState, useEffect } from 'react'

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const checkSubscription = async () => {
        try {
          const res = await fetch('/api/push/check');
          const data = await res.json();
          setIsSubscribed(data.subscribed);
        } catch (error) {
          console.error('Error checking push subscription:', error);
        }
      };
      checkSubscription();
    }
  }, [])

  const subscribeToNotifications = async () => {
    if (!('Notification' in window)) {
      return { success: false, reason: 'unsupported' }
    }

    const requestedPermission = await Notification.requestPermission()
    setPermission(requestedPermission)

    if (requestedPermission !== 'granted') {
      return { success: false, reason: 'denied' }
    }

    const registration = await navigator.serviceWorker.ready
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) {
      console.error('VAPID public key not found')
      return { success: false, reason: 'no_vapid_key' }
    }

    let subscription: PushSubscription | null = null;
    try {
      console.log('Attempting to subscribe with key starting with:', vapidKey.trim().substring(0, 5));
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey.trim()),
      })
    } catch (err: any) {
      console.error('Subscription error:', err);
      // If there's an existing subscription with a different key, unsubscribe first
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
        try {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey.trim()),
          });
        } catch (retryErr: any) {
          console.error('Retry subscription error:', retryErr);
          return { success: false, reason: 'subscription_failed', error: retryErr.message };
        }
      } else {
        return { success: false, reason: 'subscription_failed', error: err.message };
      }
    }

    if (!subscription) {
      return { success: false, reason: 'subscription_failed' };
    }

    const { endpoint } = subscription
    const { p256dh, auth } = subscription.toJSON().keys!

    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint,
        p256dh,
        auth_key: auth,
      }),
    })

    if (response.ok) {
      setIsSubscribed(true)
      return { success: true }
    } else {
      return { success: false, reason: 'api_error' }
    }
  }

  return { permission, isSubscribed, subscribeToNotifications }
}
