import LoginPresenter from "./login-presenter.js";

export default class LoginPage {
  async render() {
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

  async afterRender() {
    const form = document.querySelector("#login-form");
    form.addEventListener("submit", (event) =>
      LoginPresenter.handleFormSubmit(event, form)
    );
  }
}
