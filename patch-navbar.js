const fs = require('fs');
let code = fs.readFileSync('public/navbar-shared.js', 'utf8');

const sessionCode = `
            overlay.innerHTML = \`
                <div class="mobile-menu-drawer" role="dialog" aria-modal="true" aria-labelledby="mobileNavigationTitle">
                    <div class="mobile-menu-header">
                        <span class="mobile-menu-title" id="mobileNavigationTitle">Menu</span>
                        <button class="mobile-menu-close" type="button" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button>
                    </div>
                    <div class="mobile-menu-links">\${mobileMenuMarkup}</div>
                </div>
            \`;
            document.body.appendChild(overlay);
            closeBtn = overlay.querySelector(".mobile-menu-close");
            linksContainer = overlay.querySelector(".mobile-menu-links");
            
            // Inject session
            const drawer = overlay.querySelector(".mobile-menu-drawer");
            const rawUser = localStorage.getItem("quiznationCurrentUser") || localStorage.getItem("uot_current_user") || localStorage.getItem("eduquestUserSession");
            if (drawer) {
                const sessionSection = document.createElement("div");
                sessionSection.className = "mobile-menu-session";
                sessionSection.style.marginTop = "auto";
                sessionSection.style.paddingTop = "16px";
                sessionSection.style.borderTop = "1px solid var(--uot-border, rgba(15,23,42,0.1))";
                sessionSection.style.display = "flex";
                sessionSection.style.flexDirection = "column";
                sessionSection.style.gap = "10px";
                
                if (rawUser) {
                    const session = JSON.parse(rawUser);
                    const userName = session.name || session.username || "Pengguna";
                    if (session.isLoggedIn !== false) {
                        const rpg = JSON.parse(localStorage.getItem("eduquestRPG") || "{}");
                        const currentAvatar = rpg.activeAvatar || session.avatar || userName.slice(0, 1).toUpperCase();
                        
                        let avatarHtml = currentAvatar.length <= 4 
                            ? \`<span style="width: 44px; height: 44px; border-radius: 12px; background: var(--uot-primary, #4361ee); color: white; display: grid; place-items: center; font-size: 20px; font-weight: 800;">\${currentAvatar}</span>\`
                            : \`<span style="width: 44px; height: 44px; border-radius: 12px; background: var(--uot-surface-soft); color: var(--uot-primary); display: grid; place-items: center; font-size: 18px; font-weight: 800; border: 1px solid var(--uot-border);">\${currentAvatar.slice(0, 1).toUpperCase()}</span>\`;
                        
                        sessionSection.innerHTML = \`
                            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--uot-surface-soft, rgba(0,0,0,0.03)); border-radius: 12px; border: 1px solid var(--uot-border);">
                                \${avatarHtml}
                                <div style="display: flex; flex-direction: column; min-width: 0;">
                                    <span style="font-weight: 800; font-size: 14px; color: var(--uot-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">\${userName}</span>
                                    <span style="font-size: 11px; color: var(--uot-text-muted); font-weight: 600;">\${localStorage.getItem("eduquestSubscription") === "pro" ? "Pro Member 👑" : "Basic Member"}</span>
                                </div>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 6px;">
                                <a href="profile.html" style="padding: 10px 12px; border-radius: 10px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: var(--uot-text); text-decoration: none;">
                                    <i class="fa-solid fa-user"></i> Profil Saya
                                </a>
                                <a href="login.html?logout=1" style="padding: 10px 12px; border-radius: 10px; display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #ef4444; text-decoration: none;">
                                    <i class="fa-solid fa-right-from-bracket"></i> Keluar
                                </a>
                            </div>
                        \`;
                    } else {
                        sessionSection.innerHTML = \`
                            <a href="login.html" class="button button-primary" style="width: 100%; justify-content: center;">Masuk / Daftar</a>
                        \`;
                    }
                } else {
                    sessionSection.innerHTML = \`
                        <a href="login.html" class="button button-primary" style="width: 100%; justify-content: center;">Masuk / Daftar</a>
                    \`;
                }
                drawer.appendChild(sessionSection);
            }
`;

code = code.replace(/overlay\.innerHTML = `[\s\S]*?linksContainer = overlay\.querySelector\("\.mobile-menu-links"\);/, sessionCode);

fs.writeFileSync('public/navbar-shared.js', code, 'utf8');
