import { openDB } from "idb";

const DB_NAME = "story-saved-db";
const DB_VERSION = 1;
const STORE_NAME = "stories";

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    }
  },
});

const SavedStoryDB = {
  async getAllStories() {
    return (await dbPromise).getAll(STORE_NAME);
  },

  async getStory(id) {
    return (await dbPromise).get(STORE_NAME, id);
  },

  async saveStory(story) {
    return (await dbPromise).put(STORE_NAME, story);
  },

  async deleteStory(id) {
    return (await dbPromise).delete(STORE_NAME, id);
  },

  async isStorySaved(id) {
    const story = await this.getStory(id);
    return !!story;
  },
};

export default SavedStoryDB;
