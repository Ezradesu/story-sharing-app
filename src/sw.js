const CACHE_NAME = "app-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/bundle.js",
  "/styles.css",
  // Tambahkan semua asset yang ingin di-cache
];

// Install Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache opened");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate Service Worker
self.addEventListener("activate", (event) => {
  const cacheAllowlist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch dengan Strategy Cache First, kemudian Network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

// Event untuk menangani Push Notification
self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: "Notifikasi Baru",
      body: event.data ? event.data.text() : "Anda menerima notifikasi baru",
      icon: "/images/logo.png", // Sesuaikan dengan path icon aplikasi Anda
    };
  }

  const options = {
    body: data.body || "Anda menerima notifikasi baru",
    icon: data.icon || "/images/logo.png",
    badge: data.badge || "/favicon.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Notifikasi Baru", options)
  );
});

// Event saat notifikasi diklik
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const url = event.notification.data.url || "/";

      // Jika sudah ada tab yang terbuka, fokuskan
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }

      // Jika tidak ada tab yang terbuka, buka tab baru
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
