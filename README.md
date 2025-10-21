# Story Sharing App (Tugas Akhir Intermediate)

> [!NOTE]
> Ini adalah Proyek "Tugas Akhir Intermediate" yang berfokus pada pengembangan aplikasi web PWA (Progressive Web App) untuk berbagi cerita dengan fitur berbasis lokasi.

## Deskripsi

Aplikasi web ini memungkinkan pengguna untuk mendaftar, login, dan membagikan cerita mereka. Berdasarkan file `package.json`, setiap cerita dapat disertai dengan lokasi yang ditandai pada peta menggunakan **Leaflet**, dan aplikasi ini tidak bergantung pada API layanan peta eksternal.

Aplikasi ini dibangun sebagai **Progressive Web App (PWA)** dan mendukung fungsionalitas offline, di mana pengguna dapat melihat cerita yang telah mereka simpan sebelumnya menggunakan **IndexedDB** (melalui library `idb`).

## Demo


## Fitur Utama
* **Autentikasi Pengguna:** Halaman Login (`/login`) dan Register (`/register`).
* **Beranda:** Menampilkan daftar semua cerita (`/`).
* **Tambah Cerita:** Halaman untuk menambahkan cerita baru (`/add-story`).
* **Detail Cerita:** Menampilkan detail dari satu cerita yang dipilih (`/detail/:id`).
* **Cerita Tersimpan (Offline):** Halaman untuk melihat cerita yang telah disimpan di IndexedDB (`/saved`), yang diimplementasikan menggunakan `SavedStoryPresenter` dan `SavedStoryView`.

## Teknologi yang Digunakan
* **Bundler:** Vite
* **PWA:** Menggunakan Web App Manifest
* **Database (Lokal):** `idb` (IndexedDB)
* **Peta (Maps):** `leaflet`

## Instalasi dan Menjalankan Proyek

1.  Clone repository ini:
    ```sh
    git clone [URL-REPO-ANDA]
    cd [NAMA-REPO-ANDA]
    ```
2.  Install dependencies (sesuai `package.json`):
    ```sh
    npm install
    ```
3.  Jalankan development server:
    ```sh
    npm run dev
    ```
   
4.  Untuk membuat build produksi:
    ```sh
    npm run build
    ```
   
5.  Untuk melihat preview build produksi:
    ```sh
    npm run preview
    ```
