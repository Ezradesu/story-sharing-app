import StoryDetailModel from "./story-detail-model.js";
import StoryDetailView from "./story-detail-view.js";
import StoryDetailPresenter from "./story-detail-presenter.js";
import { parseActivePathname } from "../../routes/url-parser.js";

export default class StoryDetailPage {
  async render() {
    return `
      <section class="container story-detail-container">
        <h1 class="story-detail-title">Detail Cerita</h1>
        <div id="story-detail" class="story-detail-content">
          <div class="loading-indicator">Loading...</div>
        </div>
        <div id="map-container" class="map-container">
          <div id="map" style="height: 400px; width: 100%; border-radius: 8px;"></div>
        </div>
        <div id="main-content" class="navigation-links">
          <a href="#/" class="back-link">Kembali ke Beranda</a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this._loadLeafletCSS();

    const storyId = this._getStoryIdFromUrl();

    const view = new StoryDetailView();
    const model = new StoryDetailModel();

    new StoryDetailPresenter({ view, model, storyId });
  }

  _getStoryIdFromUrl() {
    const parsed = parseActivePathname();
    return parsed.id;
  }

  _loadLeafletCSS() {
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }
  }
}
