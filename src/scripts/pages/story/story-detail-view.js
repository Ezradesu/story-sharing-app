export default class StoryDetailView {
  constructor() {
    this.container = document.getElementById("story-detail");
    this.mapContainer = document.getElementById("map-container");
    this.saveButton = this._createSaveButton();
  }

  renderStory(story) {
    const createdAtDate = new Date(story.createdAt);
    const formattedDate = createdAtDate.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    this.container.innerHTML = `
        <div class="story-card">
          <div class="story-header">
            <h2 class="story-name">${story.name}</h2>
            <p class="story-date">Dibuat pada: ${formattedDate}</p>
          </div>
          
          <div class="story-image-container">
            <img src="${story.photoUrl}" alt="${
      story.name
    }" class="story-image" />
          </div>
          
          <div class="story-body">
            <p class="story-description">${story.description}</p>
            ${
              story.lat && story.lon
                ? `<div class="story-location">
                   <p><strong>Lokasi:</strong> Latitude: ${story.lat}, Longitude: ${story.lon}</p>
                 </div>`
                : ""
            }
          </div>
        </div>
      `;

    this.container.appendChild(this.saveButton);

    if (story.lat && story.lon) {
      this.mapContainer.style.display = "block";
      this._showMap(story.lat, story.lon);
    } else {
      this.mapContainer.style.display = "none";
    }
  }

  showError(message) {
    this.container.innerHTML = `
        <div class="error-container">
          <p class="error-message">Gagal memuat detail cerita: ${message}</p>
          <p>Silakan coba lagi nanti atau periksa ID cerita</p>
        </div>
      `;
    this.mapContainer.style.display = "none";
  }

  setSaveButton(isSaved) {
    this.saveButton.textContent = isSaved
      ? "Hapus dari Favorit"
      : "Simpan Cerita";
  }

  _createSaveButton() {
    const button = document.createElement("button");
    button.className = "save-story-button";
    button.textContent = "Simpan Cerita";
    return button;
  }

  _showMap(lat, lon) {
    lat = parseFloat(lat);
    lon = parseFloat(lon);
    import("leaflet").then((L) => {
      const mapElement = document.getElementById("map");

      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      this.map = L.map(mapElement).setView([lat, lon], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(this.map);

      L.marker([lat, lon])
        .addTo(this.map)
        .bindPopup(`Lat: ${lat}, Lon: ${lon}`)
        .openPopup();

      setTimeout(() => {
        this.map.invalidateSize();
      }, 100);
    });
  }
}
