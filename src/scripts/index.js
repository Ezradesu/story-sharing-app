import "../styles/styles.css";
import App from "./pages/app";

document.addEventListener("DOMContentLoaded", async () => {
  // ============= SERVICE WORKER & PUSH SETUP =============
  if ("serviceWorker" in navigator && "PushManager" in window) {
    window.addEventListener("load", async () => {
      try {
        // 1. Register service worker
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered:", registration);

        // 2. Wait for service worker to be ready/active
        await waitForServiceWorkerActive(registration);

        // 3. Setup push notifications setelah SW active
        await setupPushNotifications(registration);
      } catch (err) {
        console.error("Service Worker Error:", err);
      }
    });
  }

  // Function untuk menunggu service worker aktif
  async function waitForServiceWorkerActive(registration) {
    return new Promise((resolve) => {
      if (registration.active) {
        console.log("Service Worker already active");
        resolve();
        return;
      }

      const worker = registration.installing || registration.waiting;
      if (worker) {
        worker.addEventListener("statechange", function () {
          console.log("Service Worker state:", worker.state);
          if (worker.state === "activated") {
            console.log("Service Worker is now active");
            resolve();
          }
        });
      } else {
        // Fallback: wait for navigator.serviceWorker.ready
        navigator.serviceWorker.ready.then(() => {
          console.log("Service Worker ready");
          resolve();
        });
      }
    });
  }

  // Function untuk setup push notifications
  async function setupPushNotifications(registration) {
    try {
      // Request notification permission first
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        console.log("Notification permission not granted:", permission);
        return;
      }

      console.log("Notification permission granted");

      // Check existing subscription
      const existingSubscription =
        await registration.pushManager.getSubscription();

      if (!existingSubscription) {
        console.log("No existing subscription, creating new one...");
        await subscribeUserToPush(registration);
      } else {
        console.log("Already subscribed to push:", existingSubscription);
      }
    } catch (error) {
      console.error("Setup push notifications failed:", error);
    }
  }

  async function subscribeUserToPush(registration) {
    const vapidPublicKey =
      "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";
    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

    try {
      // Pastikan service worker masih active
      if (!registration.active) {
        throw new Error("Service Worker not active");
      }

      console.log("Attempting to subscribe to push notifications...");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      console.log("Push subscription successful:", subscription);

      // Kirim subscription ke server (optional)
      try {
        await fetch("/api/save-subscription", {
          method: "POST",
          body: JSON.stringify(subscription),
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Subscription saved to server");
      } catch (serverError) {
        console.log(
          "Failed to save subscription to server (this is optional):",
          serverError
        );
      }

      return subscription;
    } catch (err) {
      console.error("Failed to subscribe to push notifications:", err);

      // Detailed error logging
      if (err.name === "AbortError") {
        console.error(
          "Subscription aborted - Service Worker might not be active yet"
        );
      } else if (err.name === "NotSupportedError") {
        console.error("Push messaging is not supported");
      } else if (err.name === "NotAllowedError") {
        console.error("Permission for push messaging denied");
      }

      throw err;
    }
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // ============= AUTH & UI LOGIC =============
  const token = localStorage.getItem("token");

  const logoutBtn = document.getElementById("logout-button");
  const registerLink = document.querySelector('a[href="#/register"]');
  const loginLink = document.querySelector('a[href="#/login"]');
  const postLink = document.querySelector('a[href="#/add-story"]');
  const savedLink = document.querySelector('a[href="#/saved"]');

  if (token) {
    // User logged in
    if (registerLink) registerLink.style.display = "none";
    if (loginLink) loginLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";
    if (postLink) postLink.style.display = "block";
    if (savedLink) savedLink.style.display = "block";
  } else {
    // User not logged in
    if (logoutBtn) logoutBtn.style.display = "none";
    if (postLink) postLink.style.display = "none";
    if (savedLink) savedLink.style.display = "none";
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.hash = "#/login";
      window.location.reload();
    });
  }

  // ============= APP INITIALIZATION =============
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });

  // ============= DEBUG HELPERS =============
  // Add to window for debugging (remove in production)
  window.checkSWStatus = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      console.log("Registration found:", {
        scope: registration.scope,
        active: registration.active?.state,
        installing: registration.installing?.state,
        waiting: registration.waiting?.state,
      });

      const subscription = await registration.pushManager.getSubscription();
      console.log("Push subscription:", subscription ? "Active" : "None");
    } else {
      console.log("No service worker registration found");
    }
  };

  window.testNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("Test Notification", {
        body: "This is a test notification",
        icon: "/favicon.ico",
      });
    } else {
      console.log("Notification permission not granted");
    }
  };
});
