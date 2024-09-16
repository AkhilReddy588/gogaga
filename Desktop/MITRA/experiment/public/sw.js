self.addEventListener('push', event => {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || 'https://res.cloudinary.com/dwma8dkv0/image/upload/v1725112862/mitra_white_bgm_vdejyb.jpg',
    };
  
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  });
  
  self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
      clients.openWindow('https://studentmitra.fun/orders') // Redirect the user to your site
    );
  });
  