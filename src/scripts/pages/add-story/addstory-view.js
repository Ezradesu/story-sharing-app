export default class AddStoryView {
  constructor() {
    this.mapInstance = null;
    this.mapMarker = null;
  }

  static render() {
    return `
      <section id="main-content" class="container">
        <h1>Tambah Cerita</h1>
        <form id="add-story-form" enctype="multipart/form-data">
          <div class="form-group">
            <input id="description" type="text" name="description" placeholder="Deskripsi" required />
          </div>
          <input id="photo" type="file" name="photo" accept="image/*" style="display:none;" />
          <div class="form-group">
            <input id="lat" type="text" name="lat" placeholder="Latitude (opsional)" readonly />
          </div>
          <div class="form-group">
            <input id="lon" type="text" name="lon" placeholder="Longitude (opsional)" readonly />
          </div>
          <div class="camera-container">
            <video id="camera" autoplay></video>
            <img id="preview" alt="Preview foto" />
            <div class="camera-actions">
              <button type="button" id="capture" class="btn">Ambil Foto</button>
              <button type="submit" id="upload" class="btn">Upload Cerita</button>
            </div>
          </div>
          <div class="map-wrapper">
            <p class="map-info">Pilih lokasi anda</p>
            <div class="map-container"><div id="map"></div></div>
          </div>
        </form>
      </section>
    `;
  }

  initElements() {
    this.video = document.getElementById("camera");
    this.preview = document.getElementById("preview");
    this.captureBtn = document.getElementById("capture");
    this.uploadBtn = document.getElementById("upload");
    this.photoInput = document.getElementById("photo");
    this.latInput = document.getElementById("lat");
    this.lonInput = document.getElementById("lon");
    this.form = document.getElementById("add-story-form");
    this.mapInfo = document.querySelector(".map-info");
    this.uploadBtn.style.display = "none"; // Hide upload button initially
  }

  setCameraStream(stream) {
    this.video.srcObject = stream;
  }

  showFallbackUpload() {
    const cameraContainer = document.querySelector(".camera-container");
    cameraContainer.innerHTML = `
      <div class="upload-fallback">
        <p>Tidak dapat mengakses kamera. Silakan upload foto.</p>
        <input type="file" id="manual-photo" accept="image/*">
        <img id="manual-preview" style="display:none; width:100%; margin-top:10px;">
      </div>
    `;

    document.getElementById("manual-photo").addEventListener("change", (e) => {
      this.handleManualPhotoChange(e);
    });
  }

  handleManualPhotoChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById("manual-preview").src = e.target.result;
        document.getElementById("manual-preview").style.display = "block";
        this.photoInput.files = document.getElementById("manual-photo").files;
        this.uploadBtn.style.display = "inline";
      };
      reader.readAsDataURL(file);
    }
  }

  captureImage() {
    const canvas = document.createElement("canvas");
    canvas.width = this.video.videoWidth;
    canvas.height = this.video.videoHeight;
    canvas.getContext("2d").drawImage(this.video, 0, 0);

    const dataURL = canvas.toDataURL("image/jpeg");
    this.preview.src = dataURL;
    this.preview.style.display = "block";
    this.video.style.display = "none";
    this.captureBtn.textContent = "Ambil Ulang";
    this.uploadBtn.style.display = "inline";

    return dataURL;
  }

  resetCamera() {
    this.preview.style.display = "none";
    this.video.style.display = "block";
    this.captureBtn.textContent = "Ambil Foto";
  }

  initMap(L, lat, lng) {
    const map = L.map("map").setView([lat, lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      map
    );
    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

    this.mapInstance = map;
    this.mapMarker = marker;

    setTimeout(() => map.invalidateSize(), 100);

    return { map, marker };
  }

  setMapPosition(lat, lng) {
    if (this.mapMarker) {
      this.mapMarker.setLatLng([lat, lng]);
    }
    this.latInput.value = lat.toFixed(6);
    this.lonInput.value = lng.toFixed(6);
  }

  updateMapInfo(message) {
    this.mapInfo.textContent = message;
  }

  setLocationValues(lat, lng) {
    this.latInput.value = lat;
    this.lonInput.value = lng;
  }

  setSubmitButtonState(isLoading) {
    this.uploadBtn.disabled = isLoading;
    this.uploadBtn.textContent = isLoading ? "Mengirim..." : "Upload Cerita";
  }

  getFormData() {
    return {
      description: document.getElementById("description").value,
      photo: this.photoInput.files[0],
      lat: this.latInput.value,
      lon: this.lonInput.value,
    };
  }

  showAlert(message) {
    alert(message);
  }

  cleanupResources() {
    if (this.video) {
      this.video.srcObject = null;
      this.video.load();
    }

    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
      this.mapMarker = null;
    }
  }
}
