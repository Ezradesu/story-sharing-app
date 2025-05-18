// home-view.js
export default class HomeView {
  constructor(container) {
    this.container = container;
  }

  showLoading() {
    this.container.innerHTML = '<div class="loading">Loading...</div>';
  }

  showError(message) {
    this.container.innerHTML = `<div class="error-message">
        <p>Gagal mengambil data story: ${message}</p>
      </div>`;
  }

  showLoginRequired() {
    this.container.innerHTML = `<div class="login-required">
        <p>Silakan login untuk melihat daftar cerita.</p>
        <a href="#/login" class="btn">Login Sekarang</a>
      </div>`;
  }

  renderStories(stories) {
    if (stories.length === 0) {
      this.container.innerHTML = `<div class="empty-stories">
          <p>Belum ada cerita yang ditampilkan.</p>
        </div>`;
      return;
    }

    this.container.innerHTML = stories
      .map(
        (story) => `
            <div class="story-card">
              <h3>${story.name}</h3>
              <img src="${story.photoUrl}" alt="${
          story.description
        }" width="200"/>
              <p>${story.description}</p>
              <p>${new Date(story.createdAt).toLocaleString()}</p>
              <div class="story-actions">
                <a href="#/detail/${story.id}" class="btn">Lihat Detail</a>
                
              </div>
            </div>
          `
      )
      .join("");
  }

  _attachSaveButtonListeners() {
    const saveButtons = this.container.querySelectorAll(".save-story-btn");

    saveButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        const storyId = event.target.dataset.id;

        // Dispatch a custom event that the presenter can listen to
        const saveEvent = new CustomEvent("save-story", {
          detail: { storyId },
        });

        this.container.dispatchEvent(saveEvent);
      });
    });
  }

  setLogoutListener(callback) {
    const logoutBtn = document.querySelector("#logout-button");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", callback);
    }
  }
}
