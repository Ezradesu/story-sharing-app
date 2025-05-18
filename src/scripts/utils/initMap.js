import L from "leaflet";
export default function initMap() {
  if (!navigator.geolocation) {
    alert("Geolocation tidak didukung di browser ini.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      document.getElementById("lat").value = latitude;
      document.getElementById("lon").value = longitude;

      const map = L.map("map").setView([latitude, longitude], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      const marker = L.marker([latitude, longitude]).addTo(map);
      marker.bindPopup("Lokasi Anda Sekarang").openPopup();
    },
    (error) => {
      alert("Gagal mendapatkan lokasi: " + error.message);
    }
  );
}
