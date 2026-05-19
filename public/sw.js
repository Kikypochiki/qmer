self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const options = {
    body: data.body ?? '',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.tag ?? 'co5mo-notification',
    renotify: true,
    data: { url: data.url ?? '/alerts' },
    requireInteraction: data.urgency === 'high',
    silent: false,
    vibrate: data.urgency === 'high' ? [200, 100, 200] : [100],
  };
  event.waitUntil((async () => {
    await self.registration.showNotification(data.title ?? 'CO5MO Alert', options);

    const clientsList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientsList) {
      client.postMessage({
        type: 'co5mo-push-alert',
        payload: data,
      });
    }
  })());
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