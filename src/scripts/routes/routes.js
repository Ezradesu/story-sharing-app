import HomePage from "../pages/home/home-page";
import LoginPage from "../pages/login/login-page";
import RegisterPage from "../pages/register/register-page";
import AddStoryPage from "../pages/add-story/addstory-page";
import StoryDetailPage from "../pages/story/story-detail-page";
import SavedStoryView from "../pages/saved-story/saved-story-view";
import SavedStoryPresenter from "../../scripts/pages/saved-story/saved-story-presenter";

const routes = {
  "/": () => new HomePage(),
  "/login": () => new LoginPage(),
  "/register": () => new RegisterPage(),
  "/add-story": () => new AddStoryPage(),
  "/detail/:id": () => new StoryDetailPage(),
  "/saved": {
    render: async () => `
      <section class="saved-story-page">
        <h2>Saved Stories</h2>
        <div id="savedStoryList"></div>
      </section>
    `,
    afterRender: async () => {
      const view = new SavedStoryView();
      new SavedStoryPresenter(view);
    },
    destroy: () => {
      console.log("saved");
    },
  },
};

/**
 * test
 * @param {string} route
 * @returns {Object}
 */
function getPage(route) {
  const handler = routes[route];

  if (typeof handler === "function") {
    return handler();
  }

  return handler;
}

export { getPage };
export default routes;
