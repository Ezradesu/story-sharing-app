import routes, { getPage } from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import "leaflet/dist/leaflet.css";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #currentPage = null;
  #currentRoute = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();

    // Memastikan pembersihan resource saat navigasi
    this.#setupPageLifecycle();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  #setupPageLifecycle() {
    // Menambahkan event listener untuk hashchange
    window.addEventListener("hashchange", () => {
      console.log("App: Hash changed, cleaning up current page");
      this.#cleanupCurrentPage();
    });

    // Menambahkan event listener untuk beforeunload
    window.addEventListener("beforeunload", () => {
      console.log("App: Page unloading, cleaning up resources");
      this.#cleanupCurrentPage();
    });
  }

  #cleanupCurrentPage() {
    // Membersihkan resource dari halaman saat ini jika ada
    if (this.#currentPage && typeof this.#currentPage.destroy === "function") {
      console.log(`App: Cleaning up resources from page ${this.#currentRoute}`);
      try {
        this.#currentPage.destroy();
      } catch (error) {
        console.error("Error during page cleanup:", error);
      }
    }
  }

  async renderPage() {
    // Mendapatkan rute aktif
    const url = getActiveRoute();
    console.log(`App: Rendering page for route ${url}`);

    // Membersihkan halaman sebelumnya jika berbeda dengan rute saat ini
    if (this.#currentRoute !== url) {
      this.#cleanupCurrentPage();
    }

    // Mendapatkan instance halaman baru
    // Menggunakan getPage jika tersedia, atau routes langsung jika tidak
    const page = typeof getPage === "function" ? getPage(url) : routes[url];

    // Menyimpan referensi ke halaman dan rute saat ini
    this.#currentPage = page;
    this.#currentRoute = url;

    // Render halaman menggunakan View Transitions API jika tersedia
    if (!document.startViewTransition) {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      return;
    }

    document.startViewTransition(async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    });
  }
}

export default App;
