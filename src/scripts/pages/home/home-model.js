import CONFIG from "../../config.js";

const HomeModel = {
  // Method untuk mendapatkan token dari localStorage
  getAuthToken() {
    return localStorage.getItem("token");
  },

  // Method untuk mengecek apakah user sudah login
  isUserLoggedIn() {
    return !!this.getAuthToken();
  },

  async getStories() {
    const token = this.getAuthToken();

    if (!token) {
      throw new Error("Token tidak ditemukan. Silakan login terlebih dahulu.");
    }

    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (data.error) throw new Error(data.message);
    return data.listStory;
  },

  // Method untuk mendapatkan detail story berdasarkan ID
  async getStoryById(storyId) {
    const stories = await this.getStories();
    const story = stories.find((story) => story.id === storyId);

    if (!story) {
      throw new Error("Cerita tidak ditemukan.");
    }

    return story;
  },
};

export default HomeModel;
