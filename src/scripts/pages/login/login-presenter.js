export default class LoginPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;

    this.view.initElements();
    this.view.bindFormSubmit(this.handleLogin.bind(this));
  }

  async handleLogin(formData) {
    try {
      const loginResult = await this.model.loginUser(formData);

      this.model.saveAuthToken(loginResult.token);

      this.view.showAlert("Login berhasil!");
      this.view.redirectToHome();
    } catch (error) {
      this.view.showAlert(`Error: ${error.message}`);
    }
  }

  checkLoginStatus() {
    return this.model.isUserLoggedIn();
  }
}
