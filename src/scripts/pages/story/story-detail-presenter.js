import SavedStoryDB from "../../data/saved-db";

export default class StoryDetailPresenter {
  constructor({ view, model, storyId }) {
    this.view = view;
    this.model = model;
    this.storyId = storyId;

    this.init();
  }

  async init() {
    try {
      const story = await this.model.getStoryDetail(this.storyId);
      this.view.renderStory(story);

      const isSaved = await SavedStoryDB.isStorySaved(story.id);
      this.view.setSaveButton(isSaved);

      this.view.saveButton.addEventListener("click", async () => {
        const saved = await SavedStoryDB.isStorySaved(story.id);
        if (saved) {
          await SavedStoryDB.deleteStory(story.id);
          this.view.setSaveButton(false);
        } else {
          await SavedStoryDB.saveStory(story);
          this.view.setSaveButton(true);
        }
      });
    } catch (error) {
      this.view.showError(error.message);
    }
  }
}
