export default class SavedStoryView {
  constructor() {
    this.listContainer = document.querySelector("#savedStoryList");
  }

  renderSavedStories(stories) {
    this.listContainer.innerHTML = "";

    if (stories.length === 0) {
      this.listContainer.innerHTML = "<p>Belum ada cerita yang disimpan.</p>";
      return;
    }

    stories.forEach((story) => {
      const item = document.createElement("div");
      item.classList.add("saved-story-item");

      item.innerHTML = `
        <img src="${story.photoUrl}" alt="${
        story.description
      }" class="story-image">
        <div class="story-date">${new Date(
          story.createdAt
        ).toLocaleString()}</div>
        <h3 class="story-title">${story.name}</h3>
        <p class="story-description">${story.description}</p>
        ${
          story.lat && story.lon
            ? `<p class="story-location"><strong>Lokasi:</strong> Latitude: ${story.lat}, Longitude: ${story.lon}</p>`
            : ""
        }
        <button class="remove-btn" data-id="${story.id}">Hapus</button>
      `;

      this.listContainer.appendChild(item);
    });

    // Add event listeners to delete buttons AFTER they're added to the DOM
    this._attachDeleteListeners();
  }

  _attachDeleteListeners() {
    // Import SavedStoryDB dynamically to avoid circular dependencies
    import("../../data/saved-db.js")
      .then((module) => {
        const SavedStoryDB = module.default;

        this.listContainer.querySelectorAll(".remove-btn").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            // Get the story ID from the clicked button's data attribute
            const id = e.target.dataset.id;

            try {
              // Delete the story from IndexedDB
              await SavedStoryDB.deleteStory(id);
              console.log(`Story with ID ${id} deleted successfully`);

              // Refresh the story list
              const updatedStories = await SavedStoryDB.getAllStories();
              this.renderSavedStories(updatedStories);
            } catch (error) {
              console.error("Gagal menghapus cerita:", error);
              alert("Gagal menghapus cerita. Silakan coba lagi.");
            }
          });
        });
      })
      .catch((error) => {
        console.error("Error loading saved-db module:", error);
      });
  }
}
