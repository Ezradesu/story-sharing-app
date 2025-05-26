import L from "leaflet";

export default class AddStoryPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.stream = null;
    this.view.initElements();

    // Ambil status login dari model
    this.isLoggedIn = this.model.isUserLoggedIn();

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
    // Implementasi form handling bisa ditambahkan di sini
    // Contoh jika ada form submit:
    const form = this.view.getForm();
    if (form) {
      form.addEventListener("submit", (e) => this._handleSubmit(e));
    }
  }

  async _handleSubmit(event) {
    event.preventDefault();

    // Ambil data dari form
    const formData = this.view.getFormData();

    try {
      // Upload story menggunakan model (token sudah dihandle di model)
      const result = await this.model.uploadStory({
        description: formData.description,
        photo: formData.photo,
        lat: formData.lat,
        lon: formData.lon,
      });

      console.log("Story uploaded successfully:", result);
      // Handle success (redirect, show message, etc.)
    } catch (error) {
      console.error("Error uploading story:", error);
      // Handle error
    }
  }

  _captureImage() {
    // Implementasi capture image
    if (this.view.video && this.view.canvas) {
      const context = this.view.canvas.getContext("2d");
      context.drawImage(
        this.view.video,
        0,
        0,
        this.view.canvas.width,
        this.view.canvas.height
      );

      // Convert to blob and set to form
      this.view.canvas.toBlob((blob) => {
        this.view.setImageBlob(blob);
      });
    }
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
