import SavedStoryDB from "../../data/saved-db.js";

export default class SavedStoryPresenter {
  constructor(view) {
    this.view = view;
    this.init();
  }

  async init() {
    try {
      const savedStories = await SavedStoryDB.getAllStories();
      this.view.renderSavedStories(savedStories);
    } catch (error) {
      console.error("Error initializing saved stories:", error);
      // Tampilkan pesan error jika diperlukan
    }
  }

  // Method untuk refresh data secara manual jika diperlukan
  async refreshStories() {
    try {
      const savedStories = await SavedStoryDB.getAllStories();
      this.view.renderSavedStories(savedStories);
      return true;
    } catch (error) {
      console.error("Error refreshing stories:", error);
      return false;
    }
  }
}
