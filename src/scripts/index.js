import "../styles/styles.css";

import App from "./pages/app";

document.addEventListener("DOMContentLoaded", async () => {
  //sw
  if ("serviceWorker" in navigator && "PushManager" in window) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker registered:", registration);

        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscribeUserToPush(registration);
        } else {
          console.log("Sudah ter-subscribe ke push:", subscription);
        }
      } catch (err) {
        console.error("Service Worker Error:", err);
      }
    });
  }

  async function subscribeUserToPush(registration) {
    const vapidPublicKey =
      "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";
    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      console.log("Push subscribed:", subscription);

      // Kirim `subscription` ke server kamu (POST ke API)
      // Uncomment dan sesuaikan endpoint di bawah untuk menyimpan subscription ke server
      ////////asdfasdfads
      await fetch("/api/save-subscription", {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Gagal subscribe ke push:", err);
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

  /////////////////////////////////////////////

  const token = localStorage.getItem("token");

  const logoutBtn = document.getElementById("logout-button");
  const registerLink = document.querySelector('a[href="#/register"]');
  const loginLink = document.querySelector('a[href="#/login"]');
  const postLink = document.querySelector('a[href="#/add-story"]');
  const savedLink = document.querySelector('a[href="#/saved"]');

  if (token) {
    // login
    if (registerLink) registerLink.style.display = "none";
    if (loginLink) loginLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "";
    if (postLink) postLink.style.display = "";
    if (savedLink) savedLink.style.display = "";
  } else {
    // belum
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
