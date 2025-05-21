import AddStoryView from "../add-story/addstory-view.js";
import AddStoryPresenter from "../add-story/addstory-presenter.js";
import AddStoryModel from "../add-story/addstory-model.js";

export default class AddStoryPage {
  constructor() {
    this.presenter = null;
  }

  async render() {
    return AddStoryView.render();
  }

  async afterRender() {
    const model = new AddStoryModel();
    const view = new AddStoryView();
    this.presenter = new AddStoryPresenter(view, model);

    // Emergency backup - add a failsafe cleanup
    this._setupEmergencyCleanup();
  }

  destroy() {
    console.log("AddStoryPage: destroy method called");
    try {
      if (this.presenter) {
        console.log("AddStoryPage: destroying presenter");
        this.presenter.destroy();
        this.presenter = null;
      }
    } catch (error) {
      console.error("Error in AddStoryPage destroy:", error);
    }
  }

  _setupEmergencyCleanup() {
    // This is just a backup in case the App's destroy isn't called
    const cleanupFunction = () => {
      // Simple check to see if we've navigated away from this page
      if (!document.getElementById("add-story-form")) {
        console.log("Emergency cleanup: Add story form no longer in DOM");
        this.destroy();
        // Remove listeners after cleanup
        window.removeEventListener("hashchange", cleanupFunction);
      }
    };

    window.addEventListener("hashchange", cleanupFunction);
  }
}
