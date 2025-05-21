import CONFIG from "../../config.js";

export default class LoginModel {
  async loginUser({ email, password }) {
    const response = await fetch(`${CONFIG.BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login gagal");
    }
    return data.loginResult;
  }
}
