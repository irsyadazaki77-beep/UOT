/* Canonical Explore menu shared by every primary navbar. */
(() => {
    "use strict";

    const menuMarkup = `
        <button class="btn-explore" id="btnExplore" type="button" aria-label="Jelajahi menu belajar" aria-controls="exploreMegaMenu" aria-expanded="false">
            <i class="fa-solid fa-compass explore-leading-icon" aria-hidden="true"></i>
            <span>Jelajahi</span>
            <i class="fa-solid fa-chevron-down explore-chevron" aria-hidden="true"></i>
        </button>
        <div class="explore-mega-menu" id="exploreMegaMenu" aria-hidden="true">
            <div class="mega-col">
                <h4>Kategori Belajar</h4>
                <ul class="mega-list">
                    <li><a href="materi-basic.html?topik=programming" class="mega-item-link"><span class="mega-icon-box"><i class="fa-solid fa-code" aria-hidden="true"></i></span><span>Dasar Pemrograman</span></a></li>
                    <li><a href="materi-basic.html?topik=web" class="mega-item-link"><span class="mega-icon-box"><i class="fa-solid fa-laptop-code" aria-hidden="true"></i></span><span>Web Development</span></a></li>
                    <li><a href="materi-basic.html?topik=database" class="mega-item-link"><span class="mega-icon-box"><i class="fa-solid fa-database" aria-hidden="true"></i></span><span>Database &amp; SQL</span></a></li>
                    <li><a href="materi-basic.html?topik=design" class="mega-item-link"><span class="mega-icon-box"><i class="fa-solid fa-pen-ruler" aria-hidden="true"></i></span><span>UI/UX Design</span></a></li>
                    <li><a href="materi.html" class="mega-item-link"><span class="mega-icon-box"><i class="fa-solid fa-book-open" aria-hidden="true"></i></span><span>Semua Materi</span></a></li>
                </ul>
            </div>
            <div class="mega-col">
                <h4>Latihan &amp; Eksplorasi</h4>
                <ul class="mega-list">
                    <li><a href="quiz.html" class="mega-item-link"><span class="mega-icon-box"><i class="fa-solid fa-circle-question" aria-hidden="true"></i></span><span>Quiz &amp; Latihan</span></a></li>
                    <li><a href="snbt.html" class="mega-item-link"><span class="mega-icon-box"><i class="fa-solid fa-graduation-cap" aria-hidden="true"></i></span><span>Persiapan SNBT</span></a></li>
                    <li><a href="tka-lms.html" class="mega-item-link"><span class="mega-icon-box"><i class="fa-solid fa-pen-to-square" aria-hidden="true"></i></span><span>Persiapan TKA</span></a></li>
                    <li><a href="bahasa-daerah.html" class="mega-item-link"><span class="mega-icon-box"><i class="fa-solid fa-map-location-dot" aria-hidden="true"></i></span><span>Bahasa &amp; Budaya</span></a></li>
                    <li><a href="library.html" class="mega-item-link"><span class="mega-icon-box"><i class="fa-solid fa-bookmark" aria-hidden="true"></i></span><span>Library</span></a></li>
                </ul>
            </div>
            <div class="mega-col">
                <h4>Progres &amp; Akun</h4>
                <ul class="mega-list">
                    <li><a href="learning-journey.html" class="mega-item-link"><span class="mega-icon-box"><i class="fa-solid fa-compass" aria-hidden="true"></i></span><span>Learning Journey</span></a></li>
                    <li><a href="leaderboard.html" class="mega-item-link"><span class="mega-icon-box"><i class="fa-solid fa-trophy" aria-hidden="true"></i></span><span>Leaderboard</span></a></li>
                    <li><a href="achievements.html" class="mega-item-link"><span class="mega-icon-box"><i class="fa-solid fa-medal" aria-hidden="true"></i></span><span>Pencapaian</span></a></li>
                    <li><a href="profile.html" class="mega-item-link"><span class="mega-icon-box"><i class="fa-solid fa-user" aria-hidden="true"></i></span><span>Profil Saya</span></a></li>
                    <li><a href="pro-hub.html" class="mega-item-link"><span class="mega-icon-box"><i class="fa-solid fa-crown" aria-hidden="true"></i></span><span>Ruang PRO</span></a></li>
                </ul>
            </div>
        </div>`;

    function render() {
        const wrapper = document.querySelector(".navbar .explore-wrapper");
        if (!wrapper || wrapper.dataset.sharedExplore === "true") return;

        wrapper.innerHTML = menuMarkup;
        wrapper.dataset.sharedExplore = "true";

        const currentPage = window.location.pathname.split("/").pop() || "index.html";
        wrapper.querySelectorAll(".mega-item-link").forEach((link) => {
            const targetPage = (link.getAttribute("href") || "").split("?")[0].split("#")[0];
            if (targetPage === currentPage) link.setAttribute("aria-current", "page");
        });
    }

    window.QuizNationExplore = Object.freeze({ render });
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", render, { once: true });
    } else {
        render();
    }
})();
