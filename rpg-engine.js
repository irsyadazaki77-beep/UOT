// Universe Of Tech - Coder RPG Engine (Unified Progression Adapter)

let rpgLevel = 1;
let rpgXp = 0;
let rpgTotalXp = 0;
let purchasedAvatars = ["👨‍💻"];
let activeAvatar = "👨‍💻";
const rpgStorageKey = "eduquestRPG";

function getEngineState() {
    if (typeof window !== "undefined" && window.ProgressionEngine) {
        return window.ProgressionEngine.getGameState();
    }
    try {
        return JSON.parse(localStorage.getItem(rpgStorageKey) || "{}");
    } catch {
        return {};
    }
}

function loadRPG() {
    try {
        const state = getEngineState();
        rpgLevel = state.level || 1;
        rpgXp = state.currentLevelXp || state.xp || 0;
        rpgTotalXp = state.lifetimeXp || state.totalXp || 0;
        purchasedAvatars = state.inventory || state.unlockedAvatars || ["👨‍💻"];
        activeAvatar = state.equippedItems?.avatar || state.activeAvatar || "👨‍💻";

        if (Array.isArray(state.achievements) && typeof achievementsList !== "undefined") {
            state.achievements.forEach(savedId => {
                const ach = achievementsList.find(a => a.id === savedId);
                if (ach) ach.unlocked = true;
            });
        }
    } catch {
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
    if (typeof window !== "undefined" && window.ProgressionEngine) {
        // ProgressionEngine persists canonical state and syncs to eduquestRPG automatically
        return;
    }
    try {
        const unlockedIds = (typeof achievementsList !== "undefined")
            ? achievementsList.filter(a => a.unlocked).map(a => a.id)
            : [];
        localStorage.setItem(rpgStorageKey, JSON.stringify({
            level: rpgLevel,
            xp: rpgXp,
            totalXp: rpgTotalXp,
            achievements: unlockedIds,
            unlockedAvatars: purchasedAvatars,
            activeAvatar: activeAvatar
        }));
    } catch (_) {}
}

function addXp(amount, reason = "Latihan Koding", rewardId = null) {
    if (typeof window !== "undefined" && window.ProgressionEngine) {
        const result = window.ProgressionEngine.awardXp(amount, reason, rewardId);
        loadRPG();
        
        // Notify XP Gain
        const awardText = document.getElementById("sandboxAwardStatus");
        if (awardText && amount > 0 && result.awarded) {
            awardText.textContent = `+${result.amount} XP (+${result.bonusCoins || Math.round(result.amount/2)} Koin)`;
            awardText.style.display = "inline";
            setTimeout(() => { if (awardText) awardText.style.display = "none"; }, 3000);
        }

        if (result.leveledUp) {
            triggerLevelUp();
        }
        return result;
    }

    // Fallback if engine is not yet mounted
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

    const awardText = document.getElementById("sandboxAwardStatus");
    if (awardText && amount > 0) {
        awardText.textContent = `+${amount} XP Didapatkan!`;
        awardText.style.display = "inline";
        setTimeout(() => { if (awardText) awardText.style.display = "none"; }, 3000);
    }

    if (levelUp) {
        triggerLevelUp();
    }
}

function unlockAchievement(id) {
    if (typeof window !== "undefined" && window.ProgressionEngine) {
        const res = window.ProgressionEngine.unlockAchievement(id);
        if (res.unlocked) {
            loadRPG();
            showAchievementToast(res.achievement);
        }
        return res;
    }

    const ach = (typeof achievementsList !== "undefined") ? achievementsList.find(a => a.id === id) : null;
    if (ach && !ach.unlocked) {
        ach.unlocked = true;
        saveRPG();
        updateRpgHud();
        showAchievementToast(ach);
    }
}

function showAchievementToast(ach) {
    if (!ach) return;
    const toast = document.createElement("div");
    toast.style.cssText = "position:fixed; bottom:100px; left:24px; background:linear-gradient(135deg, #10b981, #2563eb); color:white; padding:14px 20px; border-radius:16px; box-shadow:0 10px 25px -5px rgba(0,0,0,0.3); display:flex; align-items:center; gap:12px; z-index:10002; font-family:system-ui, -apple-system, sans-serif; font-size:13px; font-weight:700; animation:panelFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;";
    toast.innerHTML = `<span style="font-size:22px;">${ach.icon || '🏆'}</span> <div><span style="display:block; font-size:11px; text-transform:uppercase; opacity:0.85;">Pencapaian Baru! (+${ach.xp || 50} XP)</span> <strong>${ach.title}</strong></div>`;
    document.body.appendChild(toast);
    
    if (typeof playSound === "function") playSound('success');
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        toast.style.transition = "all 0.4s ease";
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

function triggerLevelUp() {
    if (typeof playSound === "function") playSound('fanfare');
    if (typeof triggerConfetti === 'function') triggerConfetti();

    const levelText = document.getElementById("levelUpLevelText");
    const newTitleEl = document.getElementById("levelUpNewTitle");
    const modal = document.getElementById("levelUpModal");
    const card = document.getElementById("levelUpCard");

    if (levelText && newTitleEl && modal && card) {
        const title = getLevelTitle(rpgLevel);
        levelText.textContent = `Level ${rpgLevel} Coder`;
        newTitleEl.textContent = title;
        modal.style.display = "grid";
        setTimeout(() => card.classList.add("show"), 100);
    }
}

function getLevelTitle(level) {
    if (typeof window !== "undefined" && window.ProgressionEngine?.getLevelTitle) {
        return window.ProgressionEngine.getLevelTitle(level);
    }
    const titles = {
        1: "Script Kiddie",
        2: "Syntax Squire",
        3: "Logic Knight",
        4: "DOM Conqueror",
        5: "Query Warlord",
        6: "DevOps Architect",
        7: "AI Archmage"
    };
    return titles[level] || "Tech Legend (Diluar Nalar)";
}

function updateRpgHud() {
    let progress;
    let coins = 0;
    if (typeof window !== "undefined" && window.ProgressionEngine) {
        progress = window.ProgressionEngine.getLevelProgress();
        rpgLevel = progress.level;
        rpgXp = progress.currentLevelXp;
        rpgTotalXp = progress.lifetimeXp;
        coins = window.ProgressionEngine.getCoins();
    } else {
        const xpNeeded = rpgLevel * 100;
        const percent = Math.min(100, Math.round((rpgXp / xpNeeded) * 100));
        progress = {
            level: rpgLevel,
            currentLevelXp: rpgXp,
            lifetimeXp: rpgTotalXp,
            xpNeededForNext: xpNeeded,
            percentage: percent,
            title: getLevelTitle(rpgLevel)
        };
    }

    // Navbar badge Elements
    const lvlVal = document.getElementById("rpgLevelValue");
    if (lvlVal) lvlVal.textContent = progress.level;
    
    const xpProg = document.getElementById("rpgXpProgress");
    if (xpProg) xpProg.style.width = `${progress.percentage}%`;
    
    const lvlTitle = document.getElementById("rpgLevelTitle");
    if (lvlTitle) lvlTitle.textContent = progress.title;

    // Profile Popover Elements
    const currXp = document.getElementById("rpgCurrentXp");
    if (currXp) currXp.textContent = progress.currentLevelXp;
    
    const nextXp = document.getElementById("rpgNextLevelXp");
    if (nextXp) nextXp.textContent = progress.xpNeededForNext;
    
    const pctVal = document.getElementById("rpgPercentValue");
    if (pctVal) pctVal.textContent = `${progress.percentage}%`;
    
    const panelBar = document.getElementById("rpgPanelXpBar");
    if (panelBar) {
        panelBar.style.setProperty("--value", `${progress.percentage}%`);
        panelBar.style.width = `${progress.percentage}%`;
    }
    
    const panelTitle = document.getElementById("rpgPanelTitle");
    if (panelTitle) panelTitle.textContent = progress.title;

    // Avatar Icon Element
    const avatar = document.getElementById("rpgAvatar");
    if (avatar) avatar.textContent = activeAvatar;

    // Total XP Text Element
    const totalXpText = document.getElementById("rpgTotalXpText");
    if (totalXpText) totalXpText.textContent = `Total: ${progress.lifetimeXp} XP • 🪙 ${coins} Koin`;

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
        if (item.dataset.rpgShopBound) return;
        item.dataset.rpgShopBound = "true";

        item.addEventListener("click", () => {
            const avatar = item.dataset.shopAvatar;
            const cost = Number(item.dataset.shopCost) || 0;

            if (purchasedAvatars.includes(avatar)) {
                activeAvatar = avatar;
                if (typeof window !== "undefined" && window.ProgressionEngine) {
                    window.ProgressionEngine.equipAvatar(avatar);
                }
                if (typeof playSound === "function") playSound('click');
                loadRPG();
                updateRpgHud();
                updateShopUI();
            } else {
                // Buy avatar using COINS, lifetimeXp is completely untouched (Rule 1, 2, 12)
                if (typeof window !== "undefined" && window.ProgressionEngine) {
                    const buyRes = window.ProgressionEngine.spendCoins(cost, avatar, "avatar");
                    if (buyRes.success) {
                        activeAvatar = avatar;
                        if (!purchasedAvatars.includes(avatar)) purchasedAvatars.push(avatar);
                        if (typeof playSound === "function") playSound('success');
                        loadRPG();
                        updateRpgHud();
                        updateShopUI();
                    } else {
                        if (typeof playSound === "function") playSound('alarm');
                        const awardText = document.getElementById("sandboxAwardStatus");
                        if (awardText) {
                            awardText.textContent = `Koin tidak cukup! Butuh ${cost} Koin.`;
                            awardText.style.display = "inline";
                            setTimeout(() => { if (awardText) awardText.style.display = "none"; }, 3000);
                        }
                    }
                }
            }
        });
    });
    updateShopUI();
}

function updateShopUI() {
    const coins = (typeof window !== "undefined" && window.ProgressionEngine) ? window.ProgressionEngine.getCoins() : 0;
    
    document.querySelectorAll(".rpg-shop-item").forEach(item => {
        const avatar = item.dataset.shopAvatar;
        const cost = Number(item.dataset.shopCost) || 0;
        const costSpan = item.querySelector(".item-cost");

        item.classList.remove("purchased", "locked");

        if (purchasedAvatars.includes(avatar)) {
            item.classList.add("purchased");
            if (costSpan) {
                costSpan.textContent = (activeAvatar === avatar) ? "AKTIF" : "MILIK";
            }
        } else if (coins < cost) {
            item.classList.add("locked");
            if (costSpan) {
                costSpan.textContent = cost + " 🪙";
            }
        } else {
            if (costSpan) {
                costSpan.textContent = "BELI (" + cost + " 🪙)";
            }
        }
    });
}

// Listen for global progression updates
if (typeof window !== "undefined") {
    window.addEventListener("uot-progression-updated", () => {
        loadRPG();
    });
}

