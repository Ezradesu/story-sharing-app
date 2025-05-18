import RegisterPresenter from "./register-presenter.js";

export default class RegisterPage {
  async render() {
    return `
      <section class="container">
        <h1>Register Page</h1>
        <form id="register-form">
          <label>Name:</label><br />
          <input type="text" name="name" placeholder="Name" required /><br />
          <label>Email:</label><br />
          <input type="email" name="email" placeholder="Email" required /><br />
          <label>Password:</label><br />
          <input type="password" name="password" placeholder="Password" required minlength="8" /><br />
          <button class="btn" type="submit">Register</button>
        </form>
        <p>Sudah punya akun? <a href="/login#/login">Login</a></p>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector("#register-form");
    form.addEventListener("submit", (e) =>
      RegisterPresenter.handleFormSubmit(e, form)
    );
  }
}
