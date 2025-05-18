import HomeModel from "./home-model.js";
import HomeView from "./home-view.js";
import SavedStoryDB from "../../data/saved-db.js"; // Import SavedStoryDB untuk fitur simpan
import logout from "../../utils/logout.js";

export default class HomePresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;

    // Setup event listeners for custom events from the view
    this._setupEventListeners();
  }

  async init() {
    const token = localStorage.getItem("token");

    if (!token) {
      this.view.showLoginRequired();
      return;
    }

    this.view.showLoading();

    try {
      const stories = await this.model.getStories(token);
      this.view.renderStories(stories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      this.view.showError(error.message);
    }

    // Setup logout listener
    this.view.setLogoutListener(logout);
  }

  _setupEventListeners() {
    // Listen for custom save-story event from the view
    this.view.container.addEventListener("save-story", async (event) => {
      const { storyId } = event.detail;

      try {
        await this._saveStory(storyId);
        // Show success message or update UI if needed
        alert("Cerita berhasil disimpan!");
      } catch (error) {
        console.error("Error saving story:", error);
        alert(`Gagal menyimpan cerita: ${error.message}`);
      }
    });
  }

  async _saveStory(storyId) {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Anda harus login untuk menyimpan cerita.");
    }

    try {
      // Check if story is already saved
      const isSaved = await SavedStoryDB.isStorySaved(storyId);
      if (isSaved) {
        throw new Error("Cerita ini sudah disimpan sebelumnya.");
      }

      // Get story details
      const stories = await this.model.getStories(token);
      const storyToSave = stories.find((story) => story.id === storyId);

      if (!storyToSave) {
        throw new Error("Cerita tidak ditemukan.");
      }

      // Save to IndexedDB
      await SavedStoryDB.saveStory({
        id: storyToSave.id,
        name: storyToSave.name,
        description: storyToSave.description,
        photoUrl: storyToSave.photoUrl,
        createdAt: storyToSave.createdAt,
        lat: storyToSave.lat,
        lon: storyToSave.lon,
      });

      return true;
    } catch (error) {
      console.error("Error in _saveStory:", error);
      throw error;
    }
  }
}
