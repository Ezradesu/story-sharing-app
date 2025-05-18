import CONFIG from "../../config.js";

export default class AddStoryModel {
  constructor() {
    this.stream = null;
  }

  async getCameraStream() {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
    } catch {
      return await navigator.mediaDevices.getUserMedia({ video: true });
    }
  }

  stopCameraStream() {
    if (this.stream) {
      console.log("Model: Menghentikan stream kamera...");
      this.stream.getTracks().forEach((track) => {
        console.log("Model: Menghentikan track:", track.kind);
        track.stop();
      });
      this.stream = null;
    }
  }

  dataURLtoBlob(dataurl) {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject("Geolocation not supported");
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });
    });
  }

  async uploadStory({ token, description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);
    if (lat) formData.append("lat", lat);
    if (lon) formData.append("lon", lon);

    const endpoint = token
      ? `${CONFIG.BASE_URL}/stories`
      : `${CONFIG.BASE_URL}/stories/guest`;

    const options = {
      method: "POST",
      body: formData,
    };
    if (token) options.headers = { Authorization: `Bearer ${token}` };

    const response = await fetch(endpoint, options);
    const data = await response.json();
    if (data.error) throw new Error(data.message);
    return data;
  }
}
