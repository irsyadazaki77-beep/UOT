import { storage, showToast } from "./shared-utilities.js";

export function initLibraryPage() {
    const resources = [
        { id: "js-basic", title: "Dasar JavaScript", type: "Modul", topic: "Programming", time: "18 menit" },
        { id: "sql-join", title: "SQL Join Visual", type: "Cheatsheet", topic: "Database", time: "10 menit" },
        { id: "ui-heuristic", title: "Checklist UI/UX", type: "Checklist", topic: "Design", time: "8 menit" },
        { id: "analytics-kpi", title: "KPI dan Funnel", type: "Ringkasan", topic: "Analytics", time: "12 menit" },
        { id: "web-semantic", title: "Semantic HTML", type: "Modul", topic: "Web", time: "15 menit" },
        { id: "flash-snbt", title: "Flashcard TKA", type: "Flashcard", topic: "TKA", time: "20 kartu" }
    ];
    const searchInput = document.getElementById("librarySearch");
    const filterButtons = document.querySelectorAll("[data-library-filter]");
    const grid = document.getElementById("resourceGrid");
    const savedList = document.getElementById("savedList");
    const noteInput = document.getElementById("libraryNote");
    const saved = storage.get("library_saved", []);
    let activeFilter = "all";

    function renderSaved() {
        const items = saved.map(id => resources.find(item => item.id === id)).filter(Boolean);
        savedList.innerHTML = items.map(item => `
            <div class="saved-item">
                <div><strong>${item.title}</strong><span class="muted">${item.type} - ${item.topic}</span></div>
                <span class="mini-tag">${item.time}</span>
            </div>
        `).join("") || `<div class="saved-item"><div><strong>Belum ada simpanan</strong><span class="muted">Tekan tombol simpan pada materi yang ingin kamu baca lagi.</span></div></div>`;
    }

    function renderResources() {
        const query = searchInput.value.trim().toLowerCase();
        const filtered = resources.filter(item => {
            const matchFilter = activeFilter === "all" || item.topic.toLowerCase() === activeFilter;
            const matchSearch = `${item.title} ${item.type} ${item.topic}`.toLowerCase().includes(query);
            return matchFilter && matchSearch;
        });
        grid.innerHTML = filtered.map(item => {
            const isSaved = saved.includes(item.id);
            return `
                <article class="resource-card">
                    <div class="resource-meta"><span>${item.type}</span><span>${item.time}</span></div>
                    <h3>${item.title}</h3>
                    <p class="muted">Materi ${item.topic} untuk sesi belajar cepat dan review sebelum quiz.</p>
                    <button class="save-btn" data-save="${item.id}">${isSaved ? "Tersimpan" : "Simpan ke Library"}</button>
                </article>
            `;
        }).join("") || `<div class="card"><h3>Materi tidak ditemukan</h3><p>Coba kata kunci atau filter lain.</p></div>`;

        grid.querySelectorAll("[data-save]").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.save;
                const index = saved.indexOf(id);
                if (index >= 0) {
                    saved.splice(index, 1);
                    showToast("Materi dihapus dari Library.");
                } else {
                    saved.push(id);
                    showToast("Materi disimpan ke Library.");
                }
                storage.set("library_saved", saved);
                renderResources();
                renderSaved();
            });
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            filterButtons.forEach(item => item.classList.remove("active"));
            btn.classList.add("active");
            activeFilter = btn.dataset.libraryFilter;
            renderResources();
        });
    });
    if (searchInput) {
        searchInput.addEventListener("input", renderResources);
    }
    const saveNoteBtn = document.getElementById("saveLibraryNote");
    if (saveNoteBtn) {
        saveNoteBtn.addEventListener("click", () => {
            storage.set("library_note", noteInput.value.trim());
            showToast("Catatan belajar tersimpan.");
        });
    }

    if (noteInput) {
        noteInput.value = storage.get("library_note", "");
    }
    renderResources();
    renderSaved();
}

// Global scope attachment for backward compatibility
window.initLibraryPage = initLibraryPage;
