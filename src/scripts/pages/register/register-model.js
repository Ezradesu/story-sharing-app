import CONFIG from "../../config.js";

export default class RegisterModel {
  async registerUser({ name, email, password }) {
    const response = await fetch(`${CONFIG.BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Gagal register");
    }
    return data;
  }
}
