//Service worker

self.addEventListener('push', (e)=> {
  self.registration.showNotification(e.data.text());
})