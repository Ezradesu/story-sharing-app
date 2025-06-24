const CACHE_NAME = "app-v1";
const ESSENTIAL_URLS = ["/", "/index.html"];

// Install Service Worker
self.addEventListener("install", (event) => {
  console.log("🔧 Installing Service Worker...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ESSENTIAL_URLS))
      .then(() => {
        console.log("✅ Essential files cached");
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error("⚠️ Failed to cache essentials:", err);
        return self.skipWaiting();
      })
  );
});

// Activate Service Worker
self.addEventListener("activate", (event) => {
  console.log("⚡ Activating Service Worker...");

  const cacheAllowlist = [CACHE_NAME];

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (!cacheAllowlist.includes(name)) {
              console.log("🗑 Deleting old cache:", name);
              return caches.delete(name);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch handler
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Ignore cross-origin
  if (url.origin !== self.location.origin) return;

  // Ignore API endpoints or JSON data
  if (
    url.pathname.startsWith("/notifications/") ||
    url.pathname.startsWith("/api/") ||
    event.request.headers.get("Accept")?.includes("application/json")
  ) {
    return;
  }

  event.respondWith(handleFetchRequest(event.request));
});

async function handleFetchRequest(request) {
  const url = new URL(request.url);

  try {
    // Network First untuk dokumen HTML
    if (
      request.destination === "document" ||
      url.pathname === "/" ||
      url.pathname.endsWith(".html")
    ) {
      return await networkFirstStrategy(request);
    }

    // Cache First untuk asset (JS, CSS, gambar)
    return await cacheFirstStrategy(request);
  } catch (err) {
    console.error("❌ Fetch error:", err);

    // Fallback ke cache
    const cached = await caches.match(request);
    if (cached) return cached;

    // Fallback ke homepage kalau dokumen
    if (request.destination === "document") {
      return (await caches.match("/")) || (await caches.match("/index.html"));
    }

    throw err;
  }
}

// Network First
async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return await caches.match(request);
  }
}

// Cache First
async function cacheFirstStrategy(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.status === 200) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }

  return response;
}

// Push Notification
self.addEventListener("push", (event) => {
  console.log("📨 Push received");

  let payload = {
    title: "Notifikasi Baru",
    options: {
      body: "Anda menerima notifikasi baru",
    },
  };

  if (event.data) {
    try {
      payload = event.data.json();
      console.log("📦 Push data:", payload);
    } catch (e) {
      payload.options.body = event.data.text();
    }
  }

  const options = {
    body: payload.options?.body || "Anda menerima notifikasi baru",
    icon: payload.options?.icon || "/favicon.ico",
    badge: payload.options?.badge || "/favicon.ico",
    vibrate: [100, 50, 100],
    data: {
      url: payload.options?.url || "/",
    },
    requireInteraction: false,
    actions: payload.options?.actions || [],
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// Notification Click
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 Notification clicked");
  event.notification.close();

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Global error handlers
self.addEventListener("error", (event) => {
  console.error("💥 Service Worker error:", event.error);
});

self.addEventListener("unhandledrejection", (event) => {
  console.error("💥 Unhandled Rejection:", event.reason);
});
