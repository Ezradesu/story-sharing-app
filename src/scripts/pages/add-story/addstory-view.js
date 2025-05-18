export default class AddStoryView {
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
      const file = e.target.files[0];
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
    });
  }
}
