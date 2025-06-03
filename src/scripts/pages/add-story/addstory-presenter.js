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

    this.view.captureBtn.addEventListener("click", () => this._handleCapture());
  }

  _handleCapture() {
    if (this.view.preview.style.display === "block") {
      this.view.resetCamera();
    } else {
      const dataURL = this.view.captureImage();
      const blob = this.model.dataURLtoBlob(dataURL);
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
      const dt = new DataTransfer();
      dt.items.add(file);
      this.view.photoInput.files = dt.files;
    }
  }

  async _initMap() {
    const fallbackLat = -6.2;
    const fallbackLng = 106.8;

    try {
      const position = await this.model.getCurrentLocation();
      const { lat, lng } = position.coords;
      const { map, marker } = this.view.initMap(L, lat, lng);

      this.view.setLocationValues(lat, lng);
      this.view.updateMapInfo(
        "Pilih lokasi dengan menggeser penanda pada peta"
      );

      // Set up map event listeners
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        this.view.setMapPosition(pos.lat, pos.lng);
      });

      map.on("click", (e) => {
        this.view.setMapPosition(e.latlng.lat, e.latlng.lng);
      });
    } catch (error) {
      const { map, marker } = this.view.initMap(L, fallbackLat, fallbackLng);
      this.view.updateMapInfo(
        "GPS tidak tersedia. Pilih lokasi manual di peta."
      );

      // Set up map event listeners
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        this.view.setMapPosition(pos.lat, pos.lng);
      });

      map.on("click", (e) => {
        this.view.setMapPosition(e.latlng.lat, e.latlng.lng);
      });
    }
  }

  _initForm() {
    this.view.form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = this.view.getFormData();

      if (!formData.photo) {
        this.view.showAlert("Mohon ambil atau unggah foto terlebih dahulu");
        return;
      }

      this.view.setSubmitButtonState(true);

      try {
        await this.model.uploadStory({
          token: this.token,
          description: formData.description,
          photo: formData.photo,
          lat: formData.lat,
          lon: formData.lon,
        });

        this.view.showAlert("Story berhasil dikirim!");
        this.destroy();
        window.location.href = "#/";
      } catch (err) {
        this.view.showAlert("Gagal mengirim story: " + err.message);
      }

      this.view.setSubmitButtonState(false);
    });
  }

  destroy() {
    if (this._isDestroyed) {
      console.log("AddStoryPresenter: already destroyed, skipping");
      return;
    }

    console.log("AddStoryPresenter: Destroying and cleaning up resources");

    try {
      // Hentikan stream
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

      // Bersihkan resource di view
      if (this.view) {
        this.view.cleanupResources();
      }

      this._isDestroyed = true;

      console.log("AddStoryPresenter: All resources cleaned up successfully");
    } catch (error) {
      console.error("Error in AddStoryPresenter destroy:", error);
    }
  }
}
