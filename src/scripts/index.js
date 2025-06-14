import "../styles/styles.css";
import CONFIG from "./config";
import App from "./pages/app";

document.addEventListener("DOMContentLoaded", async () => {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered:", registration);

        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          console.log("Sudah ter-subscribe ke push:", subscription);
          updatePushButtonState(true);
        } else {
          updatePushButtonState(false);
        }

        setupPushButton(registration);
      } catch (err) {
        console.error("Service Worker Error:", err);
      }
    });
  }

  function updatePushButtonState(isSubscribed) {
    const pushButton = document.getElementById("push-subscribe-button");
    if (!pushButton) return;

    if (isSubscribed) {
      pushButton.textContent = "Matikan Notifikasi";
      pushButton.classList.remove("subscribe");
      pushButton.classList.add("unsubscribe");
    } else {
      pushButton.textContent = "Aktifkan Notifikasi";
      pushButton.classList.remove("unsubscribe");
      pushButton.classList.add("subscribe");
    }
  }

  function setupPushButton(registration) {
    const pushButton = document.getElementById("push-subscribe-button");
    if (!pushButton) return;

    pushButton.addEventListener("click", async () => {
      try {
        const subscription = await registration.pushManager.getSubscription();
        const token = localStorage.getItem("token");

        if (subscription) {
          const endpoint = subscription.endpoint;

          await subscription.unsubscribe();
          console.log("Push unsubscribed");

          await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ endpoint }),
          });

          updatePushButtonState(false);
        } else {
          await subscribeUserToPush(registration, token);
        }
      } catch (err) {
        console.error("Error handling push subscription:", err);
      }
    });
  }

  async function subscribeUserToPush(registration, token) {
    const vapidPublicKey =
      "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";
    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      console.log("Push subscribed:", subscription);
      updatePushButtonState(true);

      await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(subscription),
      });
    } catch (err) {
      console.error("Gagal subscribe ke push:", err);
      updatePushButtonState(false);
    }
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  // ==== Autentikasi UI Toggle ====
  const token = localStorage.getItem("token");

  const logoutBtn = document.getElementById("logout-button");
  const registerLink = document.querySelector('a[href="#/register"]');
  const loginLink = document.querySelector('a[href="#/login"]');
  const postLink = document.querySelector('a[href="#/add-story"]');
  const savedLink = document.querySelector('a[href="#/saved"]');

  if (token) {
    if (registerLink) registerLink.style.display = "none";
    if (loginLink) loginLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "";
    if (postLink) postLink.style.display = "";
    if (savedLink) savedLink.style.display = "";
  } else {
    if (logoutBtn) logoutBtn.style.display = "none";
    if (postLink) postLink.style.display = "";
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.hash = "/login";
      window.location.reload();
    });
  }

  // ==== Inisialisasi App ====
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});
