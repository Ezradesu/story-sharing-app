import CONFIG from "../config";

export default function initCamera({
  videoEl,
  captureBtn,
  previewImg,
  uploadBtn,
  canvasEl,
  getLocation,
}) {
  let stream;

  const startCamera = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoEl.srcObject = stream;
    } catch (err) {
      alert("Gagal mengakses kamera: " + err.message);
    }
  };

  const captureImage = () => {
    const confirmed = confirm("Are you sure ingin mengambil gambar ini?");
    if (!confirmed) return;

    const ctx = canvasEl.getContext("2d");
    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;
    ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

    previewImg.src = canvasEl.toDataURL("image/jpeg");
    uploadBtn.style.display = "inline-block";
  };

  const uploadImage = async () => {
    const imageBlob = await new Promise((resolve) => {
      canvasEl.toBlob(resolve, "image/jpeg");
    });

    const { lat, lon } = await getLocation();

    const formData = new FormData();
    formData.append("photo", imageBlob, "captured.jpg");
    formData.append("description", "Deskripsi dari gambar");
    formData.append("lat", lat);
    formData.append("lon", lon);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.error) throw new Error(data.message);

      alert("Upload berhasil!");
    } catch (err) {
      alert("Upload gagal: " + err.message);
    }
  };

  captureBtn.addEventListener("click", captureImage);
  uploadBtn.addEventListener("click", uploadImage);

  startCamera();
}
