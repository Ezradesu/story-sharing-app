import RegisterModel from "./register-model.js";

export default class RegisterPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;

    this.view.initElements();
    this.view.bindFormSubmit(this.handleRegister.bind(this));
  }

  async handleRegister(userData) {
    try {
      await this.model.registerUser(userData);
      this.view.showSuccessMessage();
      this.view.redirectToLogin();
    } catch (error) {
      this.view.showErrorMessage(error.message);
    }
  }
}
