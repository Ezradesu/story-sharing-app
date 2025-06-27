import L from "leaflet";
import marker from "/images/marker-icon-2x.png";
import shadow from "/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: marker,
  shadowUrl: shadow,
});

export default class AddStoryPresenter {
  constructor(view, model) {
    this.view = view;
    this.model = model;
    this.stream = null;

    this.token = localStorage.getItem("token");
    this.isLoggedIn = !!this.token;

    // Track if destroy has already been called
    this._isDestroyed = false;

    // Initialize view elements first
    this.view.initElements();

    // Then initialize components
    this._initCamera();
    this._initMap();
    this._initForm();
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

    // Add event listener for capture button
    if (this.view.captureBtn) {
      this.view.captureBtn.addEventListener("click", () =>
        this._handleCapture()
      );
    }
  }

  _handleCapture() {
    if (this.view.preview.style.display === "block") {
      this.view.resetCamera();
      this.view.uploadBtn.style.display = "none";
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
      console.log("AddStoryPresenter: Getting current location...");
      const position = await this.model.getCurrentLocation();
      const { latitude: lat, longitude: lng } = position.coords;

      console.log(
        "AddStoryPresenter: Initializing map with location:",
        lat,
        lng
      );
      const mapResult = this.view.initMap(L, lat, lng);

      if (!mapResult) {
        throw new Error("Failed to initialize map");
      }

      const { map, marker } = mapResult;

      this.view.setLocationValues(lat, lng);
      this.view.updateMapInfo(
        "Pilih lokasi dengan menggeser penanda pada peta"
      );

      this._setupMapEventListeners(map, marker);
    } catch (error) {
      console.log(
        "AddStoryPresenter: Using fallback location due to:",
        error.message
      );
      const mapResult = this.view.initMap(L, fallbackLat, fallbackLng);

      if (!mapResult) {
        console.error("Failed to initialize map with fallback location");
        return;
      }

      const { map, marker } = mapResult;
      this.view.updateMapInfo(
        "GPS tidak tersedia. Pilih lokasi manual di peta."
      );

      this._setupMapEventListeners(map, marker);
    }
  }

  _setupMapEventListeners(map, marker) {
    if (!map || !marker) return;

    // Set up marker drag event
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      this.view.setMapPosition(pos.lat, pos.lng);
    });

    // Set up map click event
    map.on("click", (e) => {
      this.view.setMapPosition(e.latlng.lat, e.latlng.lng);
    });
  }

  _initForm() {
    if (!this.view.form) {
      console.error("Form not found");
      return;
    }

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
        console.error("Error uploading story:", err);
        this.view.showAlert("Gagal mengirim story: " + err.message);
        this.view.setSubmitButtonState(false);
      }
    });
  }

  destroy() {
    if (this._isDestroyed) {
      console.log("AddStoryPresenter: already destroyed, skipping");
      return;
    }

    console.log("AddStoryPresenter: Destroying and cleaning up resources");

    try {
      // Stop camera stream
      if (this.stream) {
        this.stream.getTracks().forEach((track) => {
          console.log(`AddStoryPresenter: Stopping ${track.kind} track`);
          track.stop();
        });
        this.stream = null;
      }

      // Cleanup model
      if (this.model && typeof this.model.stopCameraStream === "function") {
        this.model.stopCameraStream();
      }

      // Cleanup view resources
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
