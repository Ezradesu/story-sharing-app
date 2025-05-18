import CONFIG from "../../config.js";

const HomeModel = {
  async getStories(token) {
    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (data.error) throw new Error(data.message);
    return data.listStory;
  },
};

export default HomeModel;
