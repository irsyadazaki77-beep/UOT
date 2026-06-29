// Universe Of Tech - Coder RPG Engine

let rpgLevel = 1;
let rpgXp = 0;
let rpgTotalXp = 0;
let purchasedAvatars = ["👨‍💻"];
let activeAvatar = "👨‍💻";
const rpgStorageKey = "eduquestRPG";

function loadRPG() {
    try {
        const data = JSON.parse(localStorage.getItem(rpgStorageKey) || "{}");
        rpgLevel = data.level || 1;
        rpgXp = data.xp || 0;
        rpgTotalXp = data.totalXp || 0;
        purchasedAvatars = data.unlockedAvatars || ["👨‍💻"];
        activeAvatar = data.activeAvatar || "👨‍💻";

        if (data.achievements) {
            data.achievements.forEach(savedId => {
                const ach = achievementsList.find(a => a.id === savedId);
                if (ach) ach.unlocked = true;
            });
        }
    } catch (e) {
        rpgLevel = 1;
        rpgXp = 0;
        rpgTotalXp = 0;
        purchasedAvatars = ["👨‍💻"];
        activeAvatar = "👨‍💻";
    }
    updateRpgHud();
    initRpgShop();
}

function saveRPG() {
    const unlockedIds = achievementsList.filter(a => a.unlocked).map(a => a.id);
    localStorage.setItem(rpgStorageKey, JSON.stringify({
        level: rpgLevel,
        xp: rpgXp,
        totalXp: rpgTotalXp,
        achievements: unlockedIds,
        unlockedAvatars: purchasedAvatars,
        activeAvatar: activeAvatar
    }));
}

function addXp(amount) {
    rpgXp += amount;
    rpgTotalXp += amount;
    let levelUp = false;
    let xpNeeded = rpgLevel * 100;

    while (rpgXp >= xpNeeded) {
        rpgXp -= xpNeeded;
        rpgLevel++;
        xpNeeded = rpgLevel * 100;
        levelUp = true;
    }

    saveRPG();
    updateRpgHud();
    updateShopUI();

    // Notify XP Gain
    const awardText = document.getElementById("sandboxAwardStatus");
    if (awardText && amount > 0) {
        awardText.textContent = `+${amount} XP Didapatkan!`;
        awardText.style.display = "inline";
        setTimeout(() => awardText.style.display = "none", 3000);
    }

    if (levelUp) {
        triggerLevelUp();
    }
}

function unlockAchievement(id) {
    const ach = achievementsList.find(a => a.id === id);
    if (ach && !ach.unlocked) {
        ach.unlocked = true;
        saveRPG();
        updateRpgHud();
        
        // Show floating achievement toast
        const toast = document.createElement("div");
        toast.style.cssText = "position:fixed; bottom:100px; left:24px; background:linear-gradient(135deg, var(--green-dark), var(--blue)); color:white; padding:14px 20px; border-radius:20px; box-shadow:var(--shadow); display:flex; align-items:center; gap:10px; z-index:10002; font-family:'Inter', sans-serif; font-size:13px; font-weight:800; animation:panelFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;";
        toast.innerHTML = `<span style="font-size:20px;">${ach.icon}</span> <div><span style="display:block; font-size:10px; text-transform:uppercase; opacity:0.8;">Pencapaian Baru!</span> <strong>${ach.title}</strong></div>`;
        document.body.appendChild(toast);
        playSound('success');
        setTimeout(() => {
            toast.style.animation = "bubbleFade 0.4s ease reverse forwards";
            setTimeout(() => toast.remove(), 400);
        }, 4000);

        if (achievementsList.filter(a => a.unlocked).length >= 5) {
            unlockAchievement('level_legend');
        }
    }
}

function triggerLevelUp() {
    playSound('fanfare');
    if (typeof triggerConfetti === 'function') {
        triggerConfetti();
    }

    // Set up modal content
    const levelText = document.getElementById("levelUpLevelText");
    const newTitleEl = document.getElementById("levelUpNewTitle");
    const modal = document.getElementById("levelUpModal");
    const card = document.getElementById("levelUpCard");

    if (levelText && newTitleEl && modal && card) {
        const title = getLevelTitle(rpgLevel);
        levelText.textContent = `Level ${rpgLevel} Coder`;
        newTitleEl.textContent = title;
        
        modal.style.display = "grid";
        setTimeout(() => {
            card.classList.add("show");
        }, 100);
    }
}

function getLevelTitle(level) {
    if (level === 1) return "Script Kiddie";
    if (level === 2) return "Syntax Squire";
    if (level === 3) return "Logic Knight";
    if (level === 4) return "DOM Conqueror";
    if (level === 5) return "Query Warlord";
    if (level === 6) return "DevOps Architect";
    if (level === 7) return "AI Archmage";
    return "Tech Legend (Diluar Nalar)";
}

function updateRpgHud() {
    const xpNeeded = rpgLevel * 100;
    const percent = Math.min(100, Math.round((rpgXp / xpNeeded) * 100));

    // Navbar badge Elements
    const lvlVal = document.getElementById("rpgLevelValue");
    if (lvlVal) lvlVal.textContent = rpgLevel;
    
    const xpProg = document.getElementById("rpgXpProgress");
    if (xpProg) xpProg.style.width = `${percent}%`;
    
    const lvlTitle = document.getElementById("rpgLevelTitle");
    if (lvlTitle) lvlTitle.textContent = getLevelTitle(rpgLevel);

    // Profile Popover Elements
    const currXp = document.getElementById("rpgCurrentXp");
    if (currXp) currXp.textContent = rpgXp;
    
    const nextXp = document.getElementById("rpgNextLevelXp");
    if (nextXp) nextXp.textContent = xpNeeded;
    
    const pctVal = document.getElementById("rpgPercentValue");
    if (pctVal) pctVal.textContent = `${percent}%`;
    
    const panelBar = document.getElementById("rpgPanelXpBar");
    if (panelBar) {
        panelBar.style.setProperty("--value", `${percent}%`);
        panelBar.style.width = `${percent}%`;
    }
    
    const panelTitle = document.getElementById("rpgPanelTitle");
    if (panelTitle) panelTitle.textContent = getLevelTitle(rpgLevel);

    // Avatar Icon Element
    const avatar = document.getElementById("rpgAvatar");
    if (avatar) avatar.textContent = activeAvatar;

    // Total XP Text Element
    const totalXpText = document.getElementById("rpgTotalXpText");
    if (totalXpText) totalXpText.textContent = `Total: ${rpgTotalXp} XP`;

    // Achievements List Element
    const achListEl = document.getElementById("rpgAchievementsList");
    if (achListEl && typeof achievementsList !== 'undefined') {
        achListEl.innerHTML = achievementsList.map(a => `
            <div class="rpg-ach-item ${a.unlocked ? 'unlocked' : 'locked'}">
                <span class="rpg-ach-icon">${a.unlocked ? a.icon : '🔒'}</span>
                <div class="rpg-ach-info">
                    <strong class="rpg-ach-title">${a.title}</strong>
                    <span class="rpg-ach-desc">${a.desc}</span>
                </div>
            </div>
        `).join("");
    }
}

function initRpgShop() {
    document.querySelectorAll(".rpg-shop-item").forEach(item => {
        // Prevent duplicate event binding
        if (item.dataset.rpgShopBound) return;
        item.dataset.rpgShopBound = "true";

        item.addEventListener("click", () => {
            const avatar = item.dataset.shopAvatar;
            const cost = Number(item.dataset.shopCost);

            if (purchasedAvatars.includes(avatar)) {
                activeAvatar = avatar;
                playSound('click');
                updateRpgHud();
                saveRPG();
                updateShopUI();
            } else if (rpgTotalXp >= cost) {
                rpgTotalXp -= cost;
                purchasedAvatars.push(avatar);
                activeAvatar = avatar;
                playSound('success');
                updateRpgHud();
                saveRPG();
                updateShopUI();
            } else {
                playSound('alarm');
            }
        });
    });
    updateShopUI();
}

function updateShopUI() {
    document.querySelectorAll(".rpg-shop-item").forEach(item => {
        const avatar = item.dataset.shopAvatar;
        const cost = Number(item.dataset.shopCost);
        const costSpan = item.querySelector(".item-cost");

        item.classList.remove("purchased", "locked");

        if (purchasedAvatars.includes(avatar)) {
            item.classList.add("purchased");
            if (costSpan) {
                costSpan.textContent = (activeAvatar === avatar) ? "AKTIF" : "MILIK";
            }
        } else if (rpgTotalXp < cost) {
            item.classList.add("locked");
            if (costSpan) {
                costSpan.textContent = cost + " XP";
            }
        } else {
            if (costSpan) {
                costSpan.textContent = "BELI (" + cost + ")";
            }
        }
    });
}
