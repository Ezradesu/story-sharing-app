export default class RegisterView {
  constructor() {
    this.app = document.querySelector("#app") || document.body;
  }

  render() {
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

  bindFormSubmit(handler) {
    const form = document.querySelector("#register-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const userData = {
        name: form.name.value,
        email: form.email.value,
        password: form.password.value,
      };

      handler(userData);
    });
  }

  showSuccessMessage() {
    alert("Register berhasil! Silakan login.");
  }

  showErrorMessage(message) {
    alert(`Error: ${message}`);
  }

  redirectTo(url) {
    window.location.href = url;
  }
}
