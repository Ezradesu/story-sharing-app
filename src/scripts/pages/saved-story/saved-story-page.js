import SavedStoryView from "./saved-story-view.js";
import SavedStoryPresenter from "./saved-story-presenter.js";

// Fungsi untuk menginisialisasi halaman saved-story
const initSavedStory = () => {
  const view = new SavedStoryView();
  const presenter = new SavedStoryPresenter(view);

  // Setup event listeners tambahan jika diperlukan
  setupEventListeners();

  return { view, presenter };
};

// Setup event listeners tambahan jika diperlukan
const setupEventListeners = () => {
  // Misalnya, jika ada tombol refresh atau filter
  const refreshButton = document.querySelector("#refreshButton");
  if (refreshButton) {
    refreshButton.addEventListener("click", async () => {
      const presenter = new SavedStoryPresenter(new SavedStoryView());
      await presenter.refreshStories();
    });
  }
};

// Panggil fungsi ini ketika halaman dimuat
document.addEventListener("DOMContentLoaded", () => {
  initSavedStory();
});

// Eksport untuk digunakan di tempat lain jika diperlukan
export { initSavedStory };
