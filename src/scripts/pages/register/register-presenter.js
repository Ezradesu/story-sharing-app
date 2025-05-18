import RegisterModel from "./register-model.js";

const RegisterPresenter = {
  async handleFormSubmit(event, form) {
    event.preventDefault();

    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;

    try {
      await RegisterModel.registerUser({ name, email, password });
      alert("Register berhasil! Silakan login.");
      window.location.href = "/login";
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  },
};

export default RegisterPresenter;
