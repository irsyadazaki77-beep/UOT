const fs = require('fs');

let code = fs.readFileSync('public/profile.js', 'utf8');

const replacement = `
    function render() {
        const session = readJSON("eduquestUserSession", null);
        const prefs = getPrefs();
        const rpg = readJSON("eduquestRPG", {});
        const avatar = rpg.activeAvatar || session?.avatar || "👨‍💻";
        const name = session?.username || "Pengguna Universe";
        
        if (document.getElementById("profileEditorName")) document.getElementById("profileEditorName").textContent = name;
        if (document.getElementById("profileAvatarLarge")) document.getElementById("profileAvatarLarge").textContent = avatar;
        
        const headline = prefs.headline || "Tambahkan headline agar profilmu lebih personal.";
        if (document.getElementById("profileHeadlineDisplay")) document.getElementById("profileHeadlineDisplay").textContent = headline;
        
        const bio = prefs.bio || "Identitas ini digunakan di seluruh pengalaman belajarmu.";
        if (document.getElementById("profileBioDisplay")) document.getElementById("profileBioDisplay").textContent = bio;
        
        // Stats
        if (document.getElementById("profileXp")) document.getElementById("profileXp").textContent = rpg.xp || 0;
        if (document.getElementById("profileStreak")) document.getElementById("profileStreak").textContent = rpg.streak || 0;
        if (document.getElementById("profileAccuracy")) document.getElementById("profileAccuracy").textContent = (rpg.accuracy || 0) + "%";
        if (document.getElementById("profileProjectCount")) document.getElementById("profileProjectCount").textContent = rpg.projects || 0;
        
        const level = rpg.level || 1;
        if (document.getElementById("profileLevel")) document.getElementById("profileLevel").textContent = "Level " + level;
        
        const xpForNext = level * 100;
        if (document.getElementById("profileXpLabel")) document.getElementById("profileXpLabel").textContent = (rpg.xp || 0) + " / " + xpForNext + " XP";
        
        const pct = Math.min(100, ((rpg.xp || 0) / xpForNext) * 100);
        if (document.getElementById("profileXpBar")) document.getElementById("profileXpBar").style.width = pct + "%";
        
        if (document.getElementById("nextLevelLabel")) document.getElementById("nextLevelLabel").textContent = (xpForNext - (rpg.xp || 0)) + " XP lagi menuju level berikutnya";
        
        renderHealthBreakdown();
        renderSubscription();
        renderMastery();
    }
    
    const saveStateNode = document.getElementById("profileSaveState");
    if (saveStateNode && typeof MutationObserver !== "undefined") {
        new MutationObserver(() => {
            syncSaveState();
        }).observe(saveStateNode, { childList: true, characterData: true, subtree: true });
    }
`;

code = code.replace(/function render\(\) \{[\s\S]*?syncSaveState\(\); \}\)\.observe\(saveStateNode, \{ childList: true, characterData: true, subtree: true \}\);/, replacement);
fs.writeFileSync('public/profile.js', code, 'utf8');
