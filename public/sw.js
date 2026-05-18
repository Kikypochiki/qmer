self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const options = {
    body: data.body ?? '',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.tag ?? 'qmer-notification',
    renotify: false,
    data: { url: data.url ?? '/alerts' },
    requireInteraction: data.urgency === 'high',
    vibrate: data.urgency === 'high' ? [200, 100, 200] : [100],
  };
  event.waitUntil(self.registration.showNotification(data.title ?? 'QMeR+ Alert', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      const url = event.notification.data?.url ?? '/alerts';
      const existing = list.find(c => c.url.includes(url));
      return existing ? existing.focus() : clients.openWindow(url);
    })
  );
});