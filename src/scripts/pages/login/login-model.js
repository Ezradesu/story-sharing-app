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

  // Method untuk menyimpan token ke localStorage
  saveAuthToken(token) {
    if (!token) {
      throw new Error("Token tidak valid");
    }
    localStorage.setItem("token", token);
  }

  // Method untuk mendapatkan token dari localStorage
  getAuthToken() {
    return localStorage.getItem("token");
  }

  // Method untuk mengecek apakah user sudah login
  isUserLoggedIn() {
    return !!this.getAuthToken();
  }

  // Method untuk menghapus token (logout)
  removeAuthToken() {
    localStorage.removeItem("token");
  }
}
