// src/scripts/utils/logout.js
const logout = () => {
  localStorage.removeItem("token");
  alert("Berhasil logout!");
  window.location.href = "/login.html";
};

export default logout;
