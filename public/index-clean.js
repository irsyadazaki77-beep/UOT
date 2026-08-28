(function(){
    "use strict";
    const curriculum=window.QNCurriculum;
    if(!curriculum){console.error("Data kurikulum tidak tersedia.");return;}

    const storage={
        memory:Object.create(null),
        get(key){try{return localStorage.getItem(key);}catch(_){return this.memory[key]??null;}},
        set(key,value){try{localStorage.setItem(key,String(value));}catch(_){this.memory[key]=String(value);}}
    };
    const $=id=>document.getElementById(id);
    const elements={
        header:$("siteHeader"),theme:$("themeToggleBtn"),menu:$("menuToggle"),mobileNav:$("mobileNav"),menuClose:$("mobileMenuClose"),
        pathFilters:$("pathFilters"),pathGrid:$("pathGrid"),live:$("liveRegion"),heroVisual:$("heroVisual")
    };
    let activeCareer="all";

    function escapeHTML(value){return String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[char]);}
    function formatDuration(minutes){return `${Math.round(minutes/60)} jam`;}
    function overview(){
        const progress=curriculum.readProgress();let completed=0,total=0,active=0,continueTrack=curriculum.tracks[0],best=-1;
        curriculum.tracks.forEach(track=>{const item=curriculum.getTrackProgress(track.id,progress);completed+=item.completed;total+=item.total;if(item.completed>0&&item.percent<100)active++;if(item.completed>best&&item.percent<100){best=item.completed;continueTrack=track;}});
        return{progress,completed,total,active,percent:total?Math.round(completed/total*100):0,continueTrack};
    }

    function updateDashboard(){
        const data=overview(),track=data.continueTrack,trackProgress=curriculum.getTrackProgress(track.id,data.progress);
        const trackMetric=$("trackMetric"), lessonMetric=$("lessonMetric");
        if(trackMetric) trackMetric.dataset.target=curriculum.tracks.length;
        if(lessonMetric) lessonMetric.dataset.target=data.total;
        if($("visualTrackTitle")) $("visualTrackTitle").textContent=track.title;
        if($("visualProgress")) $("visualProgress").textContent=`${trackProgress.percent}%`;
        if($("visualProgressBar")) $("visualProgressBar").style.width=`${trackProgress.percent}%`;
        if($("visualLessonText")) $("visualLessonText").textContent=`${trackProgress.completed} dari ${trackProgress.total} pelajaran`;
        if($("visualContinueLink")) $("visualContinueLink").href=`materi-basic.html?topik=${encodeURIComponent(track.id)}`;
        if($("visualCompleted")) $("visualCompleted").textContent=data.completed;
        const skillRing=document.querySelector(".skill-ring");
        if(skillRing) skillRing.style.background=`radial-gradient(circle at center,var(--surface) 56%,transparent 58%),conic-gradient(var(--green) ${data.percent*3.6}deg,var(--surface-soft) 0)`;
        if($("bentoProgress")) $("bentoProgress").textContent=`${data.percent}%`;
        const progressOrbit=document.querySelector(".progress-orbit");
        if(progressOrbit) progressOrbit.style.setProperty("--total",`${data.percent*3.6}deg`);

        if (typeof window.ProgressionEngine !== "undefined") {
            try {
                const gameState = window.ProgressionEngine.getGameState();
                const streakPill = document.querySelector(".streak-pill");
                if (streakPill) {
                    streakPill.innerHTML = `<i class="fa-solid fa-fire" style="color:#f59e0b"></i> ${gameState.streak > 0 ? `${gameState.streak} Hari Streak` : "Mulai Streak"}`;
                }
                const nextObj = window.ProgressionEngine.getNextObjective(data.progress);
                if (nextObj) {
                    if($("visualTrackTitle")) $("visualTrackTitle").textContent = nextObj.title || track.title;
                    if($("visualLessonText")) $("visualLessonText").textContent = nextObj.reason || `${trackProgress.completed} dari ${trackProgress.total} pelajaran`;
                    if (nextObj.url && $("visualContinueLink")) $("visualContinueLink").href = nextObj.url;
                }
            } catch (e) {
                console.warn("[IndexClean] ProgressionEngine dashboard sync error:", e);
            }
        }

        updateResume(data,track,trackProgress);
    }

    function updateResume(data,track,trackProgress){
        const section=$("resumeSection");
        if(!section) return;
        let nextObj = null;
        if (typeof window.ProgressionEngine !== "undefined") {
            try {
                nextObj = window.ProgressionEngine.getNextObjective(data.progress);
            } catch (_) {}
        }
        if (data.completed===0 && !nextObj){section.hidden=true;return;}
        section.hidden=false;
        if (nextObj) {
            if($("resumeTitle")) $("resumeTitle").textContent = nextObj.title;
            if($("resumeText")) $("resumeText").textContent = nextObj.reason;
            if($("resumePercent")) $("resumePercent").textContent = `${trackProgress.percent}%`;
            if($("resumeBar")) $("resumeBar").style.width = `${trackProgress.percent}%`;
            if($("resumeLink")) {
                $("resumeLink").href = nextObj.url || `materi-basic.html?topik=${encodeURIComponent(track.id)}`;
                $("resumeLink").innerHTML = `${escapeHTML(nextObj.actionLabel || "Lanjutkan")} <span aria-hidden="true">→</span>`;
            }
        } else {
            if($("resumeTitle")) $("resumeTitle").textContent=`Lanjutkan ${track.title}`;
            if($("resumeText")) $("resumeText").textContent=`${trackProgress.completed} dari ${trackProgress.total} pelajaran sudah selesai.`;
            if($("resumePercent")) $("resumePercent").textContent=`${trackProgress.percent}%`;
            if($("resumeBar")) $("resumeBar").style.width=`${trackProgress.percent}%`;
            if($("resumeLink")) $("resumeLink").href=`materi-basic.html?topik=${encodeURIComponent(track.id)}`;
        }
    }

    function selectedTracks(){
        const source=activeCareer==="all"?curriculum.tracks:curriculum.tracks.filter(track=>track.careerTags.includes(activeCareer));
        return source.slice(0,6);
    }
    function pathTemplate(track,index,progress){
        const item=curriculum.getTrackProgress(track.id,progress);
        return `<article class="path-card">
            <a href="materi-basic.html?topik=${encodeURIComponent(track.id)}" aria-label="Buka jalur ${escapeHTML(track.title)}">
                <span class="path-card-top"><span class="path-mark">${escapeHTML(track.mark)}</span><span class="path-level">${escapeHTML(track.level)}</span></span>
                <h3>${escapeHTML(track.title)}</h3><p>${escapeHTML(track.summary)}</p>
                <span class="path-meta"><span>${formatDuration(track.durationMinutes)}</span><i></i><span>${track.chapters.length} bab</span><i></i><span>${item.percent}% selesai</span></span>
                <span class="path-progress" aria-hidden="true"><span></span></span>
            </a></article>`;
    }
    function renderPaths(announce=false){
        const data=overview(),tracks=selectedTracks();elements.pathGrid.innerHTML=tracks.map((track,index)=>pathTemplate(track,index,data.progress)).join("");
        elements.pathGrid.querySelectorAll(".path-card").forEach((card,index)=>{const track=tracks[index],item=curriculum.getTrackProgress(track.id,data.progress);card.style.setProperty("--index",index);card.querySelector(".path-progress span").style.setProperty("--progress",`${item.percent}%`);});
        if(announce)elements.live.textContent=`${tracks.length} jalur belajar ditampilkan.`;
    }

    function setTheme(theme){
        const dark=theme==="dark";document.body.classList.toggle("dark-theme",dark);elements.theme.setAttribute("aria-label",dark?"Aktifkan tema terang":"Aktifkan tema gelap");
        elements.theme.innerHTML=dark?'<i class="fa-solid fa-sun" aria-hidden="true"></i>':'<i class="fa-solid fa-moon" aria-hidden="true"></i>';
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content",dark?"#09140f":"#f7fbf9");
    }
    function initTheme(){const saved=storage.get("eduquest_theme"),preferred=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";setTheme(saved||preferred);elements.theme.addEventListener("click",()=>{const next=document.body.classList.contains("dark-theme")?"light":"dark";storage.set("eduquest_theme",next);setTheme(next);});}
    function toggleMenu(open){elements.mobileNav.toggleAttribute("inert",!open);elements.mobileNav.classList.toggle("is-active",open);elements.mobileNav.setAttribute("aria-hidden",String(!open));elements.menu.setAttribute("aria-expanded",String(open));document.body.classList.toggle("nav-open",open);if(open)setTimeout(()=>elements.menuClose.focus(),80);else elements.menu.focus({preventScroll:true});}

    function initReveal(){
        const reduced=matchMedia("(prefers-reduced-motion:reduce)").matches,targets=document.querySelectorAll(".reveal");
        if(reduced||!("IntersectionObserver"in window)){targets.forEach(el=>el.classList.add("in-view"));return;}
        const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("in-view");observer.unobserve(entry.target);}}),{threshold:.12});targets.forEach(el=>observer.observe(el));
    }
    function initCounters(){
        const counters=document.querySelectorAll("[data-target]");
        if(matchMedia("(prefers-reduced-motion:reduce)").matches){counters.forEach(el=>el.textContent=el.dataset.target);return;}
        const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target,target=Number(el.dataset.target)||0,start=performance.now(),duration=900;function tick(now){const p=Math.min(1,(now-start)/duration),eased=1-Math.pow(1-p,3);el.textContent=Math.round(target*eased);if(p<1)requestAnimationFrame(tick);}requestAnimationFrame(tick);observer.unobserve(el);}),{threshold:.5});counters.forEach(el=>observer.observe(el));
    }
    function initTilt(){
        if(matchMedia("(prefers-reduced-motion:reduce)").matches||matchMedia("(pointer:coarse)").matches)return;
        if(!elements.heroVisual) return;
        const card=elements.heroVisual.querySelector(".learning-dashboard");
        if(!card) return;
        elements.heroVisual.addEventListener("pointermove",event=>{const rect=elements.heroVisual.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;card.style.transform=`rotateY(${x*7}deg) rotateX(${-y*6}deg) translateY(-3px)`;});elements.heroVisual.addEventListener("pointerleave",()=>card.style.transform="");
    }
    function syncSubscription(){
        const pro=storage.get("eduquestSubscription")==="pro",badge=$("navSubscriptionBadge");
        if(badge){
            badge.textContent=pro?"Pro":"Basic";
            badge.className=`subscription-badge ${pro?"pro":"basic"}`;
        }
    }
    function syncSession(){
        let session=null;try{session=JSON.parse(storage.get("eduquestUserSession")||"null");}catch(_){}
        if(!session?.isLoggedIn)return;
        const label=String(session.username||"Profil").trim().slice(0,18),desktop=$("navLoginLink"),mobile=$("mobileLoginLink");
        if(desktop){
            desktop.href="profile.html";desktop.textContent=label;desktop.setAttribute("aria-label",`Buka profil ${label}`);
        }
        if(mobile){
            mobile.href="profile.html";mobile.textContent="Buka Profil";
        }
    }

    function bindEvents(){
        if(elements.pathFilters){
            elements.pathFilters.addEventListener("click",event=>{const button=event.target.closest("[data-career]");if(!button)return;activeCareer=button.dataset.career;elements.pathFilters.querySelectorAll("button").forEach(item=>{const active=item===button;item.classList.toggle("active",active);item.setAttribute("aria-pressed",String(active));});renderPaths(true);});
        }
        if(elements.menu && elements.mobileNav){
            elements.menu.addEventListener("click",()=>toggleMenu(!elements.mobileNav.classList.contains("is-active")));
        }
        if(elements.menuClose){
            elements.menuClose.addEventListener("click",()=>toggleMenu(false));
        }
        if(elements.mobileNav){
            elements.mobileNav.addEventListener("click",event=>{if(event.target===elements.mobileNav)toggleMenu(false);});
            elements.mobileNav.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>toggleMenu(false)));
        }
        document.addEventListener("keydown",event=>{if(event.key==="Escape"&&elements.mobileNav&&elements.mobileNav.classList.contains("is-active"))toggleMenu(false);});
        if(elements.header){
            window.addEventListener("scroll",()=>elements.header.classList.toggle("ux-scrolled",scrollY>24),{passive:true});
        }
        window.addEventListener("curriculum-progress",()=>{updateDashboard();renderPaths();});
    }

    function init(){
        initTheme();syncSubscription();syncSession();updateDashboard();renderPaths();bindEvents();initReveal();initCounters();initTilt();
        if(elements.header) elements.header.classList.toggle("ux-scrolled",scrollY>24);
        if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol))window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}),{once:true});
    }
    init();
})();
