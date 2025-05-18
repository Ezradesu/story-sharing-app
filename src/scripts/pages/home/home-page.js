// import HomePresenter from "./home-presenter.js";

// export default class HomePage {
//   async render() {
//     return `
//       <section id="main-content" class="container">
//         <h1>Daftar Cerita</h1>
//         <div id="story-list">Loading...</div>
//       </section>
//     `;
//   }

//   async afterRender() {
//     await HomePresenter.init("story-list");
//   }
// }
import HomeView from "./home-view.js";
import HomeModel from "./home-model.js";
import HomePresenter from "./home-presenter.js";

export default class HomePage {
  async render() {
    return `
      <section id="main-content" class="container">
        <h1>Daftar Cerita</h1>
        <div id="story-list">loading...</div>
      </section>
    `;
  }

  async afterRender() {
    const container = document.getElementById("story-list");

    // Inisialisasi komponen dengan struktur MVP
    const view = new HomeView(container);
    const model = HomeModel;
    const presenter = new HomePresenter(view, model);

    // Jalankan inisialisasi presenter
    await presenter.init();
  }
}
