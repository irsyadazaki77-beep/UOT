// leaderboard.js
(async () => {
    let currentFilter = "weekly";
    let currentCohort = "global";
    const cacheKeyPrefix = "uot_leaderboard_";
    let myUserId = "usr_demo_7701";

    function updateTitle() {
        const titleEl = document.querySelector(".leaderboard-hero h1");
        const descEl = document.querySelector(".leaderboard-hero p");
        if (!titleEl || !descEl) return;
        
        let periodText = "Minggu Ini";
        if (currentFilter === "monthly") periodText = "Bulan Ini";
        else if (currentFilter === "all_time") periodText = "Sepanjang Masa";

        let cohortText = "Global";
        if (currentCohort === "friends") cohortText = "Teman";

        titleEl.textContent = `Papan Peringkat ${cohortText}`;
        descEl.textContent = `Bersaing dengan pelajar lain dan pantau progresmu. Menampilkan data ${periodText.toLowerCase()}.`;
    }

    async function checkAuth() {
        if (window.UOTAuth) {
            const session = await window.UOTAuth.getSession();
            if (session && session.user) {
                myUserId = session.user.id;
            }
        }
    }

    async function fetchLeaderboard() {
        showLoadingState();
        const cacheKey = `${cacheKeyPrefix}${currentFilter}_${currentCohort}`;
        
        try {
            await checkAuth();

            const response = await fetch(`/api/social/leaderboard?period=${currentFilter}&cohort=${currentCohort}`);
            if (!response.ok) {
                throw new Error("Gagal mengambil data dari server");
            }
            const data = await response.json();
            
            // Cache for offline
            localStorage.setItem(cacheKey, JSON.stringify({
                timestamp: Date.now(),
                data: data
            }));

            renderLeaderboard(data);
        } catch (err) {
            console.warn("Gagal fetch leaderboard, mencoba dari cache...", err);
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                renderLeaderboard(parsed.data, parsed.timestamp);
            } else {
                renderErrorState();
            }
        }
    }

    async function fetchChallengesAndPB() {
        try {
            // Fetch Challenges
            const chRes = await fetch("/api/social/challenges");
            if (chRes.ok) {
                const chData = await chRes.json();
                renderChallenges(chData.challenges || []);
            }

            // Fetch Progress for Personal Best
            const pbRes = await fetch("/api/progress");
            if (pbRes.ok) {
                const pbData = await pbRes.json();
                renderPersonalBest(pbData.progress?.personalBests || {});
            }
        } catch(e) {
            console.warn("Failed to fetch challenges or PB", e);
        }
    }

    function renderChallenges(challenges) {
        const container = document.getElementById("challengesContainer");
        if (!container) return;
        if (!challenges.length) {
            container.innerHTML = `<div style="color:var(--text-secondary); font-size:14px; text-align:center; padding: 20px 0;">Belum ada tantangan aktif.</div>`;
            return;
        }

        container.innerHTML = challenges.map(ch => `
            <div style="background:var(--white); padding:16px; border-radius:16px; margin-bottom:12px; border:1px solid var(--border);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                    <div>
                        <strong style="color:var(--text-primary); font-size:14px;">${ch.title}</strong>
                        <p style="margin:4px 0 0; font-size:12px; color:var(--text-secondary);">${ch.description}</p>
                    </div>
                    ${ch.isClaimed ? `<span style="background:var(--success-color, #10b981); color:#fff; padding:2px 8px; border-radius:12px; font-size:10px; font-weight:700;">Diklaim</span>` : 
                      ch.isCompleted ? `<button onclick="claimChallenge('${ch.id}')" style="background:var(--blue); border:none; color:#fff; padding:4px 12px; border-radius:12px; font-size:11px; font-weight:600; cursor:pointer;">Klaim</button>` : 
                      `<span style="background:var(--bg-secondary); color:var(--text-secondary); padding:2px 8px; border-radius:12px; font-size:10px; font-weight:600;">${ch.current}/${ch.target}</span>`}
                </div>
                <div style="height:6px; background:var(--bg-secondary); border-radius:3px; overflow:hidden;">
                    <div style="height:100%; width:${(ch.current/ch.target)*100}%; background:var(--blue); border-radius:3px;"></div>
                </div>
            </div>
        `).join('');
    }

    window.claimChallenge = async (challengeId) => {
        try {
            const csrfRes = await fetch("/api/csrf-token");
            const { csrfToken } = await csrfRes.json();
            const res = await fetch("/api/social/challenges/claim", {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
                body: JSON.stringify({ challengeId })
            });
            if(res.ok) {
                if (typeof window.playSound === "function") { try { window.playSound("success"); } catch(e){} }
                fetchChallengesAndPB();
            }
        } catch(e) {
            console.error(e);
        }
    };

    function renderPersonalBest(pb) {
        const container = document.getElementById("personalBestContainer");
        if (!container) return;
        
        container.innerHTML = `
            <div style="background:var(--white); padding:16px; border-radius:16px; margin-bottom:12px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="color:var(--text-secondary); font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Streak Tertinggi</div>
                    <div style="color:var(--text-primary); font-size:20px; font-weight:800; margin-top:4px;">${pb.maxStreak || 0} Hari</div>
                </div>
                <i class="fa-solid fa-fire" style="font-size:24px; color:var(--orange, #f97316); opacity:0.8;"></i>
            </div>
            <div style="background:var(--white); padding:16px; border-radius:16px; margin-bottom:12px; border:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="color:var(--text-secondary); font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.05em;">Skor Kuis Terbaik</div>
                    <div style="color:var(--text-primary); font-size:20px; font-weight:800; margin-top:4px;">${pb.highestQuizScore || 0}%</div>
                </div>
                <i class="fa-solid fa-check-double" style="font-size:24px; color:var(--green, #10b981); opacity:0.8;"></i>
            </div>
        `;
    }

    window.openSocialProfile = async (userId) => {
        const modal = document.getElementById("socialProfileModal");
        if (!modal) return;
        
        try {
            const res = await fetch(`/api/social/profile/${userId}`);
            if (!res.ok) throw new Error("Gagal memuat profil");
            const profile = await res.json();
            
            document.getElementById("modalName").textContent = profile.username;
            document.getElementById("modalAvatar").textContent = profile.avatar || "👨‍💻";
            document.getElementById("modalTitle").textContent = `Level ${profile.level || 1} Coder`;
            
            if (profile.isPrivate) {
                document.getElementById("modalBio").textContent = "Profil ini bersifat privat.";
                document.getElementById("modalXp").textContent = "---";
                document.getElementById("modalStreak").textContent = "---";
            } else {
                document.getElementById("modalBio").textContent = profile.bio || "Pelajar di Universe of Tech.";
                document.getElementById("modalXp").textContent = (profile.xp || 0).toLocaleString();
                document.getElementById("modalStreak").textContent = `${profile.streak || 0} Hari`;
            }

            const btnFollow = document.getElementById("btnFollow");
            if (userId === myUserId) {
                btnFollow.style.display = "none";
                document.getElementById("btnChallenge").style.display = "none";
            } else {
                btnFollow.style.display = "inline-flex";
                document.getElementById("btnChallenge").style.display = "inline-flex";
                
                if (profile.isFollowing) {
                    btnFollow.innerHTML = `<i class="fa-solid fa-user-check"></i> Mengikuti`;
                    btnFollow.className = "btn btn-ghost";
                    btnFollow.onclick = () => handleFollowToggle(userId, false);
                } else {
                    btnFollow.innerHTML = `<i class="fa-solid fa-user-plus"></i> Ikuti`;
                    btnFollow.className = "btn btn-primary";
                    btnFollow.onclick = () => handleFollowToggle(userId, true);
                }
            }

            modal.style.display = "flex";
        } catch(e) {
            console.error(e);
        }
    };

    async function handleFollowToggle(userId, isFollowing) {
        try {
            const csrfRes = await fetch("/api/csrf-token");
            const { csrfToken } = await csrfRes.json();
            
            const endpoint = isFollowing ? "/api/social/follow" : "/api/social/unfollow";
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
                body: JSON.stringify({ targetUserId: userId })
            });

            if (res.ok) {
                window.openSocialProfile(userId);
                fetchLeaderboard();
            }
        } catch(e) {
            console.error(e);
        }
    }

    document.getElementById("closeProfileModal")?.addEventListener("click", () => {
        document.getElementById("socialProfileModal").style.display = "none";
    });

    function showLoadingState() {
        const podiumContainer = document.getElementById("podiumContainer");
        const leaderboardBody = document.getElementById("leaderboardBody");
        const myRankingBar = document.getElementById("myRankingBar");

        podiumContainer.innerHTML = `<div style="text-align:center; width:100%; color:var(--text-secondary);">Memuat data...</div>`;
        leaderboardBody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Memuat data...</td></tr>`;
        myRankingBar.innerHTML = ``;
    }

    function renderErrorState() {
        const podiumContainer = document.getElementById("podiumContainer");
        const leaderboardBody = document.getElementById("leaderboardBody");
        const myRankingBar = document.getElementById("myRankingBar");

        podiumContainer.innerHTML = `<div style="text-align:center; width:100%; color:var(--danger-color);">Gagal memuat papan peringkat. Coba lagi nanti.</div>`;
        leaderboardBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--danger-color);">Data tidak tersedia.</td></tr>`;
        myRankingBar.innerHTML = ``;
    }

    function renderLeaderboard(data, cachedTimestamp = null) {
        if (!data || !data.entries) return;

        const dataList = data.entries;
        const top3 = dataList.slice(0, 3);
        const myName = (data.userRank && data.userRank.username) || "Pengguna";
        const myRank = data.callerRank;

        // Fill fallbacks if list has less than 3
        while (top3.length < 3) {
            top3.push({ username: "Menanti Coder...", avatar: "??", level: 1, title: "-", specialty: "-", xp: 0 });
        }

        const podiumContainer = document.getElementById("podiumContainer");
        podiumContainer.innerHTML = `
            <div class="podium-card podium-2" onclick="window.openSocialProfile('${top3[1].userId}')" style="cursor:pointer;">
                <div class="podium-rank">2</div>
                <span class="podium-avatar">${top3[1].avatar || '👨‍💻'}</span>
                <div class="podium-username">${top3[1].username}</div>
                <div class="podium-title">${top3[1].title || 'Coder'} • Lv. ${top3[1].level}</div>
                <span class="podium-xp">${top3[1].xp.toLocaleString()} XP</span>
            </div>
            <div class="podium-card podium-1" onclick="window.openSocialProfile('${top3[0].userId}')" style="cursor:pointer;">
                <div class="podium-rank">1</div>
                <span class="podium-avatar" style="font-size: 64px;">??<br>${top3[0].avatar || '👨‍💻'}</span>
                <div class="podium-username" style="font-size: 21px;">${top3[0].username}</div>
                <div class="podium-title">${top3[0].title || 'Coder'} • Lv. ${top3[0].level}</div>
                <span class="podium-xp">${top3[0].xp.toLocaleString()} XP</span>
            </div>
            <div class="podium-card podium-3" onclick="window.openSocialProfile('${top3[2].userId}')" style="cursor:pointer;">
                <div class="podium-rank">3</div>
                <span class="podium-avatar">${top3[2].avatar || '👨‍💻'}</span>
                <div class="podium-username">${top3[2].username}</div>
                <div class="podium-title">${top3[2].title || 'Coder'} • Lv. ${top3[2].level}</div>
                <span class="podium-xp">${top3[2].xp.toLocaleString()} XP</span>
            </div>
        `;

        const leaderboardBody = document.getElementById("leaderboardBody");
        leaderboardBody.innerHTML = "";
        
        if (cachedTimestamp) {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td colspan="4" style="text-align:center; font-size:12px; color:var(--text-secondary); background: var(--bg-secondary);">Data offline (Terakhir diperbarui: ${new Date(cachedTimestamp).toLocaleString()})</td>`;
            leaderboardBody.appendChild(tr);
        }

        dataList.forEach((item, index) => {
            const isUser = item.isCurrentUser;

            // Only show rows inside the list limit (e.g. up to top 20, starting from 4th)
            if (index >= 3 && index < 20) {
                const tr = document.createElement("tr");
                if (isUser) tr.className = "highlight-user";
                tr.style.cursor = "pointer";
                tr.onclick = () => window.openSocialProfile(item.userId);
                tr.innerHTML = `
                    <td class="rank-col">#${item.rank}</td>
                    <td>
                        <div class="user-col">
                            <span class="user-col-avatar">${item.avatar || '👨‍💻'}</span>
                            <div class="user-col-info">
                                <span class="user-col-name">${item.username}${isUser ? ' (Anda)' : ''}</span>
                                <span class="user-col-title">${item.title || 'Coder'} • Lv. ${item.level}</span>
                            </div>
                        </div>
                    </td>
                    <td class="badge-col"><span>Explorer</span></td>
                    <td class="xp-col">${item.xp.toLocaleString()}</td>
                `;
                leaderboardBody.appendChild(tr);
            }
        });

        const myRankingBar = document.getElementById("myRankingBar");
        if (myRank && data.userRank) {
            myRankingBar.innerHTML = `
                <div class="my-ranking-left">
                    <div class="my-ranking-badge">Peringkat #${data.userRank.rank}</div>
                    <div class="my-ranking-info">
                        <strong>Anda</strong>
                        <span>Level ${data.userRank.level || 1} Coder</span>
                    </div>
                </div>
                <div class="my-ranking-right">
                    ${data.userRank.xp.toLocaleString()} XP
                </div>
            `;
        } else {
            myRankingBar.innerHTML = `
                <div class="my-ranking-left" style="opacity: 0.7">
                    <div class="my-ranking-badge">Belum ada peringkat</div>
                    <div class="my-ranking-info">
                        <strong>Anda</strong>
                        <span>Kumpulkan XP untuk masuk leaderboard</span>
                    </div>
                </div>
            `;
        }
    }

    // Tabs events
    document.querySelectorAll(".filter-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            if (tab.dataset.filter) {
                document.querySelectorAll(".filter-tab[data-filter]").forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                currentFilter = tab.dataset.filter;
            }
            if (tab.dataset.cohort) {
                document.querySelectorAll(".filter-tab[data-cohort]").forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                currentCohort = tab.dataset.cohort;
            }
            updateTitle();
            fetchLeaderboard();
            if (typeof playSound === "function") {
                try { playSound("click"); } catch(err){}
            }
        });
    });

    // Theme toggling initialization
    const savedTheme = localStorage.getItem("eduquest_theme") || "light";
    document.body.classList.toggle("dark-theme", savedTheme === "dark");
    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
        themeBtn.textContent = savedTheme === "dark" ? "🌙" : "☀️";
        themeBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-theme");
            const isDark = document.body.classList.contains("dark-theme");
            localStorage.setItem("eduquest_theme", isDark ? "dark" : "light");
            themeBtn.textContent = isDark ? "🌙" : "☀️";
            if (typeof playSound === "function") {
                try { playSound("click"); } catch(err){}
            }
        });
    }

    // Fix filter tab structure for cohorts if not present
    const tabsContainer = document.querySelector('.filter-tabs');
    if (tabsContainer && !document.querySelector('.filter-tab[data-cohort]')) {
        const cohortTabs = document.createElement('div');
        cohortTabs.className = 'cohort-tabs';
        cohortTabs.style.display = 'flex';
        cohortTabs.style.gap = '8px';
        cohortTabs.style.marginTop = '16px';
        cohortTabs.style.justifyContent = 'center';
        
        cohortTabs.innerHTML = `
            <button class="filter-tab active" data-cohort="global">🌍 Global</button>
            <button class="filter-tab" data-cohort="friends">👥 Teman</button>
        `;
        tabsContainer.parentNode.insertBefore(cohortTabs, tabsContainer.nextSibling);
        
        // Add events to new tabs
        cohortTabs.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                cohortTabs.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                currentCohort = tab.dataset.cohort;
                updateTitle();
                fetchLeaderboard();
                if (typeof playSound === "function") {
                    try { playSound("click"); } catch(err){}
                }
            });
        });
    }

    // Fix alltime typo to all_time
    document.querySelectorAll('.filter-tab[data-filter="alltime"]').forEach(el => el.dataset.filter = 'all_time');

    // Init load
    fetchLeaderboard();
    fetchChallengesAndPB();
})();
