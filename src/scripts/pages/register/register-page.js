import RegisterView from "./register-view.js";
import RegisterPresenter from "./register-presenter.js";
import RegisterModel from "./register-model.js";

export default class RegisterPage {
  constructor() {
    this.presenter = null;
  }

  async render() {
    return RegisterView.render();
  }

  async afterRender() {
    const view = new RegisterView();
    const model = new RegisterModel();
    this.presenter = new RegisterPresenter(view, model);
  }
}
