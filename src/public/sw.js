const CACHE_NAME = "app-v1";

// Jangan hardcode file dengan hash, cache secara dinamis saja
const ESSENTIAL_URLS = ["/", "/index.html"];

// Install Service Worker
self.addEventListener("install", function (event) {
  console.log("Service Worker installing...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        console.log("Cache opened");
        // Hanya cache URL essential yang pasti ada
        return cache.addAll(ESSENTIAL_URLS);
      })
      .then(function () {
        console.log("Essential files cached successfully");
        // Skip waiting untuk aktivasi langsung
        return self.skipWaiting();
      })
      .catch(function (error) {
        console.error("Cache addAll failed:", error);
        // Tetap skip waiting meski cache gagal
        return self.skipWaiting();
      })
  );
});

// Activate Service Worker
self.addEventListener("activate", function (event) {
  console.log("Service Worker activating...");

  const cacheAllowlist = [CACHE_NAME];

  event.waitUntil(
    caches
      .keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheAllowlist.indexOf(cacheName) === -1) {
              console.log("Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function () {
        console.log("Service Worker activated and claiming clients");
        return self.clients.claim();
      })
  );
});

// Fetch dengan Strategy Cache First untuk assets, Network First untuk HTML
self.addEventListener("fetch", function (event) {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip cross-origin requests
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip API calls (jika ada)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  event.respondWith(handleFetchRequest(event.request));
});

async function handleFetchRequest(request) {
  const url = new URL(request.url);

  try {
    // Untuk HTML documents - Network First strategy
    if (
      request.destination === "document" ||
      url.pathname === "/" ||
      url.pathname.endsWith(".html")
    ) {
      return await networkFirstStrategy(request);
    }

    // Untuk assets (JS, CSS, images) - Cache First strategy
    return await cacheFirstStrategy(request);
  } catch (error) {
    console.error("Fetch handler error:", error);

    // Fallback ke cache atau offline page
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Last resort fallback
    if (request.destination === "document") {
      const cachedIndex = await caches.match("/");
      if (cachedIndex) {
        return cachedIndex;
      }
    }

    throw error;
  }
}

// Network First Strategy - untuk HTML
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log("Network failed, trying cache:", request.url);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

// Cache First Strategy - untuk assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    console.log("Cache hit:", request.url);
    return cachedResponse;
  }

  console.log("Cache miss, fetching:", request.url);

  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("Network fetch failed:", request.url, error);
    throw error;
  }
}

// Event untuk menangani Push Notification
self.addEventListener("push", function (event) {
  console.log("Push notification received");

  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.log("Failed to parse push data as JSON:", e);
      data = {
        title: "Notifikasi Baru",
        body: event.data.text() || "Anda menerima notifikasi baru",
      };
    }
  } else {
    data = {
      title: "Notifikasi Baru",
      body: "Anda menerima notifikasi baru",
    };
  }

  const options = {
    body: data.body || "Anda menerima notifikasi baru",
    icon: data.icon || "/favicon.ico", // Gunakan favicon yang pasti ada
    badge: data.badge || "/favicon.ico",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
    requireInteraction: false,
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Notifikasi Baru", options)
  );
});

// Event saat notifikasi diklik
self.addEventListener("notificationclick", function (event) {
  console.log("Notification clicked");
  event.notification.close();

  const url = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        // Cari tab yang sudah terbuka
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(url) && client.focus) {
            return client.focus();
          }
        }

        // Buka tab baru jika tidak ada yang terbuka
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Error handler untuk debugging
self.addEventListener("error", function (event) {
  console.error("Service Worker error:", event.error);
});

self.addEventListener("unhandledrejection", function (event) {
  console.error("Service Worker unhandled rejection:", event.reason);
});
