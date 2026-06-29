/* global self, clients */
// Service worker — réception des notifications Web Push.

self.addEventListener('push', (event) => {
  let data = {}
  try { data = event.data ? event.data.json() : {} } catch (_e) { /* payload texte ignoré */ }
  const title = data.title || 'ICAMTrack'
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || '',
      tag: data.tag || undefined,
      data: { link: data.link || '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const link = (event.notification.data && event.notification.data.link) || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ('focus' in w) {
          if ('navigate' in w) { try { w.navigate(link) } catch (_e) { /* noop */ } }
          return w.focus()
        }
      }
      return clients.openWindow(link)
    })
  )
})
