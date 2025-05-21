export default class LoginView {
  constructor() {
    this.form = null;
  }

  static render() {
    return `
        <section class="container">
          <h1>Login Page</h1>
          <form id="login-form">
            <label>Email:</label><br />
            <input type="email" name="email" placeholder="Email" required /><br />
            <label>Password:</label><br />
            <input type="password" name="password" placeholder="Password" required /><br />
            <button class="btn" type="submit">Login</button>
          </form>
          <p>Belum punya akun? <a href="/register#/register">Register</a></p>
        </section>
      `;
  }

  initElements() {
    this.form = document.querySelector("#login-form");
    return this.form;
  }

  bindFormSubmit(handler) {
    this.form.addEventListener("submit", (event) => {
      event.preventDefault();
      handler(this.getFormData());
    });
  }

  getFormData() {
    return {
      email: this.form.email.value,
      password: this.form.password.value,
    };
  }

  showAlert(message) {
    alert(message);
  }

  redirectToHome() {
    window.location.href = "/";
  }
}
