import LoginModel from "./login-model.js";

const LoginPresenter = {
  async handleFormSubmit(event, form) {
    event.preventDefault();

    const email = form.email.value;
    const password = form.password.value;

    try {
      const loginResult = await LoginModel.loginUser({ email, password });

      localStorage.setItem("token", loginResult.token);
      alert("Login berhasil!");

      window.location.href = "/";
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  },
};

export default LoginPresenter;
