const fs = require('fs');
let code = fs.readFileSync('public/profile.js', 'utf8');

code = code.replace(/    \}\n    window\.addEventListener/, `
    function syncSaveState() {
        const node = document.getElementById("profileSaveState");
        if (!node) return;
        const value = (node.textContent || "").toLowerCase();
        node.className = "p-save-state " + (value.includes("gagal") || value.includes("error") ? "error" : value.includes("menyimpan") || value.includes("sinkronisasi") ? "syncing" : "success");
    }
    window.addEventListener`);

fs.writeFileSync('public/profile.js', code, 'utf8');
