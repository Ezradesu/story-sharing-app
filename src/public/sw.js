// src/sw-register.js

export async function registerSW() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      // Handle updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // New service worker available
            console.log("New service worker available");

            // Optional: Show update notification to user
            if (
              confirm(
                "Aplikasi telah diperbarui. Refresh untuk menggunakan versi terbaru?"
              )
            ) {
              window.location.reload();
            }
          }
        });
      });

      console.log("Service Worker registered successfully:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      throw error;
    }
  } else {
    console.warn("Service Worker not supported");
    throw new Error("Service Worker not supported");
  }
}

// Function untuk unregister (opsional, untuk development)
export async function unregisterSW() {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();

    for (let registration of registrations) {
      await registration.unregister();
    }

    console.log("All service workers unregistered");
  }
}

// Function untuk request notification permission
export async function requestNotificationPermission() {
  if ("Notification" in window) {
    const permission = await Notification.requestPermission();
    console.log("Notification permission:", permission);
    return permission === "granted";
  }
  return false;
}
