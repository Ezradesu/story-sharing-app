export default class RegisterView {
  constructor() {
    this.form = null;
  }

  static render() {
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

  initElements() {
    this.form = document.querySelector("#register-form");
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
      name: this.form.name.value,
      email: this.form.email.value,
      password: this.form.password.value,
    };
  }

  showSuccessMessage() {
    alert("Register berhasil! Silakan login.");
  }

  showErrorMessage(message) {
    alert(`Error: ${message}`);
  }

  redirectToLogin() {
    window.location.href = "/login";
  }
}
