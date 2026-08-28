const fs = require('fs');

let htmlCode = fs.readFileSync('public/profile.html', 'utf8');
const masterySection = `
                <!-- TIER 2.5: MASTERY & ADAPTIVE INSIGHTS -->
                <section class="p-section" aria-labelledby="masteryTitle" style="margin-top: 32px;">
                    <div class="p-section-heading">
                        <div>
                            <span class="p-eyebrow"><i class="fa-solid fa-brain"></i> Adaptive Engine</span>
                            <h2 id="masteryTitle">Skill Mastery & Rekomendasi</h2>
                        </div>
                    </div>
                    <div class="p-overview-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
                        <article class="p-card" style="padding: 20px;">
                            <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 16px;">Kekuatan Utama (Strongest Skills)</h3>
                            <div id="masteryStrongest" style="display: flex; flex-direction: column; gap: 12px;">
                                <p style="font-size: 13px; color: var(--uot-text-muted);">Memuat data adaptive...</p>
                            </div>
                        </article>
                        <article class="p-card" style="padding: 20px;">
                            <h3 style="font-size: 15px; font-weight: 700; margin-bottom: 16px;">Perlu Latihan (Needs Practice)</h3>
                            <div id="masteryWeakest" style="display: flex; flex-direction: column; gap: 12px;">
                                <p style="font-size: 13px; color: var(--uot-text-muted);">Memuat data adaptive...</p>
                            </div>
                        </article>
                    </div>
                </section>
`;

htmlCode = htmlCode.replace(/<!-- TIER 3: IDENTITY & MEMBERSHIP STATUS -->/, masterySection + '\n                <!-- TIER 3: IDENTITY & MEMBERSHIP STATUS -->');
fs.writeFileSync('public/profile.html', htmlCode, 'utf8');

let jsCode = fs.readFileSync('public/profile.js', 'utf8');

const renderMasteryCode = `
    async function renderMastery() {
        if (typeof window === "undefined" || !window.RecommendationService) return;
        try {
            const recs = await window.RecommendationService.getRecommendations();
            if (!recs || !recs.masterySummary) return;
            
            const skills = Object.values(recs.masterySummary).filter(m => m.score > 0);
            const strongest = [...skills].sort((a,b) => b.score - a.score).slice(0, 3);
            const weakest = [...skills].sort((a,b) => a.score - b.score).slice(0, 3);
            
            const renderSkill = (s) => \`<div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 13px; font-weight: 600; color: var(--uot-text);">\${s.skillName}</span>
                    <span style="font-size: 11px; color: var(--uot-text-muted);">\${s.tier.label} \${s.tier.badge} · \${s.attemptsCount} percobaan</span>
                </div>
                <div style="font-weight: 800; font-size: 14px; color: \${s.tier.color};">\${s.score}%</div>
            </div>\`;
            
            const strongEl = document.getElementById("masteryStrongest");
            if (strongEl) {
                strongEl.innerHTML = strongest.length > 0 ? strongest.map(renderSkill).join('<div style="height: 1px; background: var(--uot-border);"></div>') : '<p style="font-size: 13px; color: var(--uot-text-muted);">Belum ada data mastery.</p>';
            }
            
            const weakEl = document.getElementById("masteryWeakest");
            if (weakEl) {
                weakEl.innerHTML = weakest.length > 0 ? weakest.map(renderSkill).join('<div style="height: 1px; background: var(--uot-border);"></div>') : '<p style="font-size: 13px; color: var(--uot-text-muted);">Terus berlatih untuk mengukur kelemahan.</p>';
            }
        } catch (e) {
            console.error("Mastery rendering failed:", e);
        }
    }
`;

// Inject before applyPreferences
jsCode = jsCode.replace(/function applyPreferences\(\) \{/, renderMasteryCode + '\n    function applyPreferences() {');

// Inject call into render
const renderRegex = /function render\(\) \{[\s\S]*?renderHealthBreakdown\(\);/;
const renderReplacement = `function render() {
        renderHealthBreakdown();
        renderMastery();`;
jsCode = jsCode.replace(renderRegex, renderReplacement);

fs.writeFileSync('public/profile.js', jsCode, 'utf8');
