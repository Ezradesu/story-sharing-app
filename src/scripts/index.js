import "../styles/styles.css";
import CONFIG from "./config";
import App from "./pages/app";

// ====== CONSTANTS ======
const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

// ====== SERVICE WORKER & PUSH NOTIFICATION MANAGER ======
class PushNotificationManager {
  constructor() {
    this.registration = null;
    this.isSupported = "serviceWorker" in navigator && "PushManager" in window;
  }

  async init() {
    if (!this.isSupported) {
      console.warn("⚠️ Push notifications not supported");
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register("/sw.js");
      console.log("✅ Service Worker registered:", this.registration);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      await this.checkExistingSubscription();
      this.setupPushButton();

      return true;
    } catch (error) {
      console.error("❌ Service Worker registration failed:", error);
      return false;
    }
  }

  async checkExistingSubscription() {
    try {
      const subscription =
        await this.registration.pushManager.getSubscription();
      const isSubscribed = !!subscription;

      console.log(
        isSubscribed
          ? "✅ Already subscribed to push"
          : "ℹ️ Not subscribed to push"
      );
      this.updatePushButtonState(isSubscribed);

      return isSubscribed;
    } catch (error) {
      console.error("❌ Error checking subscription:", error);
      this.updatePushButtonState(false);
      return false;
    }
  }

  updatePushButtonState(isSubscribed) {
    const pushButton = document.getElementById("push-subscribe-button");
    if (!pushButton) return;

    pushButton.disabled = false;

    if (isSubscribed) {
      pushButton.textContent = "🔕 Matikan Notifikasi";
      pushButton.classList.remove("subscribe");
      pushButton.classList.add("unsubscribe");
      pushButton.setAttribute("data-subscribed", "true");
    } else {
      pushButton.textContent = "🔔 Aktifkan Notifikasi";
      pushButton.classList.remove("unsubscribe");
      pushButton.classList.add("subscribe");
      pushButton.setAttribute("data-subscribed", "false");
    }
  }

  setupPushButton() {
    const pushButton = document.getElementById("push-subscribe-button");
    if (!pushButton) return;

    // Remove existing listeners
    pushButton.replaceWith(pushButton.cloneNode(true));
    const newPushButton = document.getElementById("push-subscribe-button");

    newPushButton.addEventListener("click", async (e) => {
      e.preventDefault();

      const token = localStorage.getItem("token");
      if (!token) {
        alert("❌ Silakan login terlebih dahulu untuk mengaktifkan notifikasi");
        return;
      }

      newPushButton.disabled = true;
      newPushButton.textContent = "⏳ Memproses...";

      try {
        const isCurrentlySubscribed =
          newPushButton.getAttribute("data-subscribed") === "true";

        if (isCurrentlySubscribed) {
          await this.unsubscribeFromPush(token);
        } else {
          await this.subscribeUserToPush(token);
        }
      } catch (error) {
        console.error("❌ Error handling push subscription:", error);
        alert("❌ Gagal mengubah pengaturan notifikasi. Silakan coba lagi.");
        // Restore button state
        await this.checkExistingSubscription();
      }
    });
  }

  async subscribeUserToPush(token) {
    try {
      const convertedKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });

      console.log("🔔 Browser subscription created:", subscription);

      // Prepare subscription data for server
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
          auth: arrayBufferToBase64(subscription.getKey("auth")),
        },
      };

      console.log("📤 Sending subscription data to server:", subscriptionData);

      // Send subscription to server
      const response = await fetch(
        `${CONFIG.BASE_URL}/notifications/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(subscriptionData),
        }
      );

      const responseData = await response.json();
      console.log("📥 Server response:", responseData);

      if (!response.ok) {
        throw new Error(
          `Server error: ${responseData.message || response.statusText}`
        );
      }

      this.updatePushButtonState(true);
      console.log("✅ Successfully subscribed to push notifications");

      // Show success message
      this.showNotificationPermissionSuccess();
    } catch (error) {
      console.error("❌ Failed to subscribe:", error);

      // Try to clean up browser subscription if server request failed
      try {
        const subscription =
          await this.registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      } catch (cleanupError) {
        console.error("❌ Failed to cleanup subscription:", cleanupError);
      }

      this.updatePushButtonState(false);
      throw error;
    }
  }

  async unsubscribeFromPush(token) {
    try {
      const subscription =
        await this.registration.pushManager.getSubscription();
      if (!subscription) {
        console.log("ℹ️ No subscription found");
        this.updatePushButtonState(false);
        return;
      }

      const endpoint = subscription.endpoint;

      // Unsubscribe from browser
      const unsubscribeSuccess = await subscription.unsubscribe();
      console.log(
        "🔕 Browser unsubscription:",
        unsubscribeSuccess ? "success" : "failed"
      );

      // Notify server
      const response = await fetch(
        `${CONFIG.BASE_URL}/notifications/subscribe`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ endpoint }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.warn("⚠️ Server unsubscribe warning:", errorData.message);
        // Don't throw error here as browser unsubscription succeeded
      }

      this.updatePushButtonState(false);
      console.log("✅ Successfully unsubscribed from push notifications");
    } catch (error) {
      console.error("❌ Failed to unsubscribe:", error);
      throw error;
    }
  }

  showNotificationPermissionSuccess() {
    // You can customize this method to show a success message
    if (Notification.permission === "granted") {
      new Notification("🎉 Notifikasi Aktif!", {
        body: "Anda akan menerima notifikasi untuk update terbaru",
        icon: "/favicon.ico",
        tag: "welcome-notification",
      });
    }
  }

  urlBase64ToUint8Array(base64String) {
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
}

// ====== AUTHENTICATION MANAGER ======
class AuthenticationManager {
  constructor() {
    this.token = localStorage.getItem("token");
  }

  updateUIForAuthState() {
    const elements = {
      logoutBtn: document.getElementById("logout-button"),
      registerLink: document.querySelector('a[href="#/register"]'),
      loginLink: document.querySelector('a[href="#/login"]'),
      postLink: document.querySelector('a[href="#/add-story"]'),
      savedLink: document.querySelector('a[href="#/saved"]'),
      pushButton: document.getElementById("push-subscribe-button"),
    };

    if (this.token) {
      // User is logged in
      if (elements.registerLink) elements.registerLink.style.display = "none";
      if (elements.loginLink) elements.loginLink.style.display = "none";
      if (elements.logoutBtn) elements.logoutBtn.style.display = "block";
      if (elements.postLink) elements.postLink.style.display = "block";
      if (elements.savedLink) elements.savedLink.style.display = "block";
      if (elements.pushButton) elements.pushButton.style.display = "block";
    } else {
      // User is not logged in
      if (elements.registerLink) elements.registerLink.style.display = "block";
      if (elements.loginLink) elements.loginLink.style.display = "block";
      if (elements.logoutBtn) elements.logoutBtn.style.display = "none";
      if (elements.postLink) elements.postLink.style.display = "none";
      if (elements.savedLink) elements.savedLink.style.display = "none";
      if (elements.pushButton) elements.pushButton.style.display = "none";
    }
  }

  setupLogoutHandler() {
    const logoutBtn = document.getElementById("logout-button");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      try {
        // Unsubscribe from push notifications before logout
        const pushManager = new PushNotificationManager();
        if (pushManager.isSupported) {
          await pushManager.init();
          const subscription = await navigator.serviceWorker.ready.then((reg) =>
            reg.pushManager.getSubscription()
          );

          if (subscription) {
            await pushManager.unsubscribeFromPush(this.token);
          }
        }
      } catch (error) {
        console.warn(
          "⚠️ Failed to unsubscribe from push during logout:",
          error
        );
      }

      // Clear token and redirect
      localStorage.removeItem("token");
      this.token = null;

      window.location.hash = "/login";
      window.location.reload();
    });
  }
}

// ====== UTILITY FUNCTIONS ======
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ====== MAIN APPLICATION INITIALIZATION ======
document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Initializing application...");

  try {
    // Initialize Authentication Manager
    const authManager = new AuthenticationManager();
    authManager.updateUIForAuthState();
    authManager.setupLogoutHandler();

    // Initialize Push Notification Manager (only if user is logged in)
    if (authManager.token) {
      const pushManager = new PushNotificationManager();
      await pushManager.init();
    }

    // Initialize Main App
    const app = new App({
      content: document.querySelector("#main-content"),
      drawerButton: document.querySelector("#drawer-button"),
      navigationDrawer: document.querySelector("#navigation-drawer"),
    });

    await app.renderPage();

    // Handle hash changes
    window.addEventListener("hashchange", async () => {
      await app.renderPage();

      // Update auth UI after page change (in case token changed)
      const newAuthManager = new AuthenticationManager();
      newAuthManager.updateUIForAuthState();
    });

    console.log("✅ Application initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize application:", error);
  }
});

// ====== GLOBAL ERROR HANDLERS ======
window.addEventListener("error", (event) => {
  console.error("💥 Global error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("💥 Unhandled promise rejection:", event.reason);
});
