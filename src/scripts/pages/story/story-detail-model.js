import CONFIG from "../../config.js";

export default class StoryDetailModel {
  async getStoryDetail(storyId) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${CONFIG.BASE_URL}/stories/${storyId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.message || "Gagal mengambil data cerita");
    }

    return data.story;
  }
}
