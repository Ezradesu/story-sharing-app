import LoginView from "./login-view.js";
import LoginPresenter from "./login-presenter.js";
import LoginModel from "./login-model.js";

export default class LoginPage {
  constructor() {
    this.presenter = null;
  }

  async render() {
    return LoginView.render();
  }

  async afterRender() {
    const view = new LoginView();
    const model = new LoginModel();
    this.presenter = new LoginPresenter(view, model);
  }
}
