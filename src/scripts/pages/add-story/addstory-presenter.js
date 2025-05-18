import L from "leaflet";

export default class AddStoryPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.stream = null;
    this.view.initElements();

    this.token = localStorage.getItem("token");
    this.isLoggedIn = !!this.token;

    this._initCamera();
    this._initMap();
    this._initForm();

    // Track if destroy has already been called
    this._isDestroyed = false;
  }

  async _initCamera() {
    try {
      console.log("AddStoryPresenter: Initializing camera...");
      this.stream = await this.model.getCameraStream();
      this.model.stream = this.stream;
      this.view.setCameraStream(this.stream);
      console.log("AddStoryPresenter: Camera initialized successfully");
    } catch (err) {
      console.error("Error accessing camera:", err);
      this.view.showFallbackUpload();
    }

    this.view.captureBtn.addEventListener("click", () => this._captureImage());
  }

  _captureImage() {
    const canvas = document.createElement("canvas");
    canvas.width = this.view.video.videoWidth;
    canvas.height = this.view.video.videoHeight;
    canvas.getContext("2d").drawImage(this.view.video, 0, 0);

    const dataURL = canvas.toDataURL("image/jpeg");
    this.view.preview.src = dataURL;
    this.view.preview.style.display = "block";
    this.view.video.style.display = "none";
    this.view.captureBtn.textContent = "Ambil Ulang";
    this.view.uploadBtn.style.display = "inline";

    const blob = this.model.dataURLtoBlob(dataURL);
    const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
    const dt = new DataTransfer();
    dt.items.add(file);
    this.view.photoInput.files = dt.files;
  }

  async _initMap() {
    const fallbackLat = -6.2;
    const fallbackLng = 106.8;

    try {
      const position = await this.model.getCurrentLocation();
      this._loadMap(position.coords.latitude, position.coords.longitude);
      this.view.latInput.value = position.coords.latitude;
      this.view.lonInput.value = position.coords.longitude;
      this.view.mapInfo.textContent =
        "Pilih lokasi dengan menggeser penanda pada peta";
    } catch {
      this._loadMap(fallbackLat, fallbackLng);
      this.view.mapInfo.textContent =
        "GPS tidak tersedia. Pilih lokasi manual di peta.";
    }
  }

  _loadMap(lat, lng) {
    const map = L.map("map").setView([lat, lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      map
    );
    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      this.view.latInput.value = pos.lat.toFixed(6);
      this.view.lonInput.value = pos.lng.toFixed(6);
    });

    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      this.view.latInput.value = e.latlng.lat.toFixed(6);
      this.view.lonInput.value = e.latlng.lng.toFixed(6);
    });

    setTimeout(() => map.invalidateSize(), 100);
  }

  _initForm() {
    this.view.form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!this.view.photoInput.files.length) {
        alert("Mohon ambil atau unggah foto terlebih dahulu");
        return;
      }

      const description = document.getElementById("description").value;
      const photo = this.view.photoInput.files[0];
      const lat = this.view.latInput.value;
      const lon = this.view.lonInput.value;

      this.view.uploadBtn.disabled = true;
      this.view.uploadBtn.textContent = "Mengirim...";

      try {
        await this.model.uploadStory({
          token: this.token,
          description,
          photo,
          lat,
          lon,
        });
        alert("Story berhasil dikirim!");

        this.destroy();

        window.location.href = "#/";
      } catch (err) {
        alert("Gagal mengirim story: " + err.message);
      }

      this.view.uploadBtn.disabled = false;
      this.view.uploadBtn.textContent = "Upload Cerita";
    });
  }

  destroy() {
    // semisal ada destroy
    if (this._isDestroyed) {
      console.log("AddStoryPresenter: already destroyed, skipping");
      return;
    }

    console.log("AddStoryPresenter: Destroying and cleaning up resources");

    try {
      // mati
      if (this.stream) {
        this.stream.getTracks().forEach((track) => {
          console.log(`AddStoryPresenter: Stopping ${track.kind} track`);
          track.stop();
        });
        this.stream = null;
      }

      if (this.model) {
        this.model.stopCameraStream();
      }

      if (this.view && this.view.video) {
        console.log("AddStoryPresenter: Clearing video source");
        this.view.video.srcObject = null;
        this.view.video.load();
      }

      this._isDestroyed = true;

      console.log("AddStoryPresenter: All resources cleaned up successfully");
    } catch (error) {
      console.error("Error in AddStoryPresenter destroy:", error);
    }
  }
}
