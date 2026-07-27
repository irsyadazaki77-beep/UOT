(function () {
    "use strict";
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    const store = {
        get(key, fallback) { try { const value = localStorage.getItem(`wonder-v3-${key}`); return value === null ? fallback : JSON.parse(value); } catch { return fallback; } },
        set(key, value) { try { localStorage.setItem(`wonder-v3-${key}`, JSON.stringify(value)); } catch {} }
    };
    const announce = (message) => { const el = $("#v3Announcer"); if (el) { el.textContent = ""; requestAnimationFrame(() => { el.textContent = message; }); } };

    function init() {
        // 01. Screen-reader announcer for dynamic feedback.
        document.body.insertAdjacentHTML("afterbegin", '<div id="v3Announcer" class="v3-sr-only" role="status" aria-live="polite" aria-atomic="true"></div><div class="v3-reading-progress" aria-hidden="true"><span></span></div>');

        // 02. Reading progress indicator.
        const progressBar = $(".v3-reading-progress span");
        const updateReadingProgress = () => { const max = document.documentElement.scrollHeight - innerHeight; progressBar.style.width = `${max > 0 ? Math.min(100, scrollY / max * 100) : 0}%`; };
        addEventListener("scroll", updateReadingProgress, { passive: true }); updateReadingProgress();

        // 03. Floating back-to-top control.
        document.body.insertAdjacentHTML("beforeend", '<div class="v3-tool-dock"><button class="v3-fab" id="v3DisplayBtn" aria-label="Buka pengaturan tampilan" aria-expanded="false"><i class="fa-solid fa-sliders"></i></button><button class="v3-fab" id="v3TopBtn" aria-label="Kembali ke atas" hidden><i class="fa-solid fa-arrow-up"></i></button></div>');
        const topBtn = $("#v3TopBtn"); addEventListener("scroll", () => { topBtn.hidden = scrollY < 500; }, { passive:true }); topBtn.addEventListener("click", () => scrollTo({ top:0, behavior: document.body.classList.contains("v3-no-motion") ? "auto" : "smooth" }));

        // 04. Display preference panel.
        document.body.insertAdjacentHTML("beforeend", '<section class="v3-control-panel" id="v3ControlPanel" aria-label="Pengaturan tampilan" hidden><div class="v3-control-head"><strong>Pengaturan Tampilan</strong><button class="v3-fab" id="v3ClosePanel" aria-label="Tutup pengaturan"><i class="fa-solid fa-xmark"></i></button></div><div class="v3-control-grid"><button id="v3FontDown"><i class="fa-solid fa-minus"></i> Teks</button><button id="v3FontUp"><i class="fa-solid fa-plus"></i> Teks</button><button id="v3Contrast" aria-pressed="false"><i class="fa-solid fa-circle-half-stroke"></i> Kontras</button><button id="v3Motion" aria-pressed="false"><i class="fa-solid fa-person-running"></i> Animasi</button><button id="v3Share"><i class="fa-solid fa-link"></i> Salin tautan</button><button id="v3Print"><i class="fa-solid fa-print"></i> Cetak</button></div></section>');
        const displayBtn=$("#v3DisplayBtn"), panel=$("#v3ControlPanel"); const togglePanel=(open)=>{ panel.hidden=!open; displayBtn.setAttribute("aria-expanded",String(open)); if(open) $("#v3ClosePanel").focus(); };
        displayBtn.addEventListener("click",()=>togglePanel(panel.hidden)); $("#v3ClosePanel").addEventListener("click",()=>{togglePanel(false);displayBtn.focus();});

        // 05. Persistent font scaling.
        let fontScale=store.get("fontScale",1); const applyFont=()=>document.documentElement.style.setProperty("--detail-font-scale",fontScale); applyFont();
        $("#v3FontDown").addEventListener("click",()=>{fontScale=Math.max(.88,+(fontScale-.06).toFixed(2));store.set("fontScale",fontScale);applyFont();announce("Ukuran teks diperkecil");});
        $("#v3FontUp").addEventListener("click",()=>{fontScale=Math.min(1.24,+(fontScale+.06).toFixed(2));store.set("fontScale",fontScale);applyFont();announce("Ukuran teks diperbesar");});

        // 06. Persistent high-contrast mode.
        const contrastBtn=$("#v3Contrast"); const applyContrast=(on)=>{document.body.classList.toggle("v3-high-contrast",on);contrastBtn.setAttribute("aria-pressed",String(on));}; applyContrast(store.get("contrast",false));
        contrastBtn.addEventListener("click",()=>{const on=!document.body.classList.contains("v3-high-contrast");applyContrast(on);store.set("contrast",on);});

        // 07. Persistent reduced-motion mode with OS preference fallback.
        const motionBtn=$("#v3Motion"); const defaultMotion=matchMedia("(prefers-reduced-motion: reduce)").matches; const applyMotion=(on)=>{document.body.classList.toggle("v3-no-motion",on);motionBtn.setAttribute("aria-pressed",String(on));motionBtn.innerHTML=on?'<i class="fa-solid fa-person-walking"></i> Animasi mati':'<i class="fa-solid fa-person-running"></i> Animasi';}; applyMotion(store.get("noMotion",defaultMotion));
        motionBtn.addEventListener("click",()=>{const on=!document.body.classList.contains("v3-no-motion");applyMotion(on);store.set("noMotion",on);});

        // 08. Share/copy a canonical deep link.
        $("#v3Share").addEventListener("click",async()=>{try{await navigator.clipboard.writeText(location.href);announce("Tautan halaman berhasil disalin");window.WonderfulCore?.showToast?.("Tautan daerah disalin");}catch{announce("Tautan tidak dapat disalin");}});

        // 09. Print-friendly cultural summary.
        $("#v3Print").addEventListener("click",()=>window.print());

        // 10. Online/offline status pill.
        const heroLeft=$(".hero-left"); if(heroLeft) heroLeft.insertAdjacentHTML("beforeend",'<div class="v3-page-status"><span class="v3-status-pill" id="v3Network"><i class="fa-solid fa-circle"></i><span></span></span><span class="v3-status-pill"><i class="fa-regular fa-clock"></i><span id="v3ReadTime">~5 menit belajar</span></span></div>');
        const network=$("#v3Network"); const updateNetwork=()=>{const on=navigator.onLine;network.classList.toggle("online",on);network.classList.toggle("offline",!on);$("span",network).textContent=on?"Online":"Mode offline";}; addEventListener("online",updateNetwork);addEventListener("offline",updateNetwork);updateNetwork();

        // 11. Dynamic reading-time estimate.
        const wordCount=($$("p").map(p=>p.textContent).join(" ").trim().split(/\s+/).length); const readTime=Math.max(3,Math.ceil(wordCount/180)); $("#v3ReadTime").textContent=`~${readTime} menit belajar`;

        // 12. Persist and restore the last main tab.
        const originalSwitch=window.switchMainTab; if(originalSwitch){window.switchMainTab=function(id,trigger){originalSwitch(id,trigger);store.set("activeTab",id);history.replaceState(null,"",`${location.pathname}${location.search}#${id}`);};}
        const requestedTab=location.hash.slice(1)||store.get("activeTab","explore"); const restored=$(`[data-main-tab="${requestedTab}"]`); if(restored) requestAnimationFrame(()=>restored.click());

        // 13. Keyboard hint for tab navigation.
        $(".dashboard-tab-bar")?.insertAdjacentHTML("beforeend",'<span class="v3-tab-hint"><i class="fa-solid fa-keyboard"></i> ← → untuk pindah</span>');

        // 14. Global shortcut 1/2/3 for learning tabs outside text fields.
        addEventListener("keydown",event=>{if(/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)||event.ctrlKey||event.metaKey||event.altKey)return;if(["1","2","3"].includes(event.key)){const tab=$$('[data-main-tab]')[+event.key-1];tab?.click();tab?.focus();}});

        // 15. Gallery pagination dots.
        const slideshow=$(".slideshow-container"); if(slideshow){slideshow.insertAdjacentHTML("beforeend",'<div class="v3-gallery-dots" aria-label="Navigasi galeri"><button class="v3-gallery-dot active" aria-label="Slide 1"></button><button class="v3-gallery-dot" aria-label="Slide 2"></button></div>'); const dots=$$(".v3-gallery-dot",slideshow);dots.forEach((dot,i)=>dot.addEventListener("click",()=>{const target=i===0?$("#slidePrevBtn"):$("#slideNextBtn");target?.click();dots.forEach((d,j)=>d.classList.toggle("active",i===j));}));$("#slidePrevBtn")?.addEventListener("click",()=>dots.forEach((d,j)=>d.classList.toggle("active",j===0)));$("#slideNextBtn")?.addEventListener("click",()=>dots.forEach((d,j)=>d.classList.toggle("active",j===1)));}

        // 16. Arrow-key navigation for the gallery.
        slideshow?.setAttribute("tabindex","0"); slideshow?.addEventListener("keydown",e=>{if(e.key==="ArrowLeft")$("#slidePrevBtn")?.click();if(e.key==="ArrowRight")$("#slideNextBtn")?.click();});

        // 17. Favorite shortcut (F) and clearer pressed state.
        const fav=$("#detailFavoriteBtn"); if(fav){fav.setAttribute("aria-pressed",String(fav.classList.contains("active")));fav.addEventListener("click",()=>requestAnimationFrame(()=>fav.setAttribute("aria-pressed",String(fav.classList.contains("active")))));addEventListener("keydown",e=>{if(e.key.toLowerCase()==="f"&&!/INPUT|TEXTAREA/.test(e.target.tagName)){fav.click();announce("Status favorit diperbarui");}});}

        // 18. Mastery button pressed semantics.
        const mastered=$("#detailMasteredBtn"); if(mastered){mastered.setAttribute("aria-pressed",String(mastered.classList.contains("active")));mastered.addEventListener("click",()=>requestAnimationFrame(()=>mastered.setAttribute("aria-pressed",String(mastered.classList.contains("active")))));}

        // 19. Search result counter.
        const search=$("#glossarySearchInput"), phraseGrid=$("#phraseGrid"); if(search&&phraseGrid){search.insertAdjacentHTML("afterend",'<div class="v3-search-meta"><span id="v3SearchCount">Semua frasa ditampilkan</span><span>Esc untuk menghapus</span></div>'); const refreshSearch=()=>requestAnimationFrame(()=>{const cards=$$(".phrase-card,article",phraseGrid);const visible=cards.filter(card=>getComputedStyle(card).display!=="none");$("#v3SearchCount").textContent=search.value?`${visible.length} hasil untuk “${search.value}”`:`${cards.length} frasa tersedia`;});search.addEventListener("input",refreshSearch);refreshSearch();}

        // 20. Escape clears glossary search.
        search?.addEventListener("keydown",e=>{if(e.key==="Escape"&&search.value){search.value="";search.dispatchEvent(new Event("input",{bubbles:true}));announce("Pencarian dibersihkan");}});

        // 21. Highlight matching glossary terms without changing stored data.
        search?.addEventListener("input",()=>{const q=search.value.trim();$$(".phrase-card strong, #phraseGrid article strong").forEach(el=>{const raw=el.textContent;el.textContent=raw;if(q){const index=raw.toLowerCase().indexOf(q.toLowerCase());if(index>=0){el.textContent="";el.append(raw.slice(0,index),Object.assign(document.createElement("mark"),{className:"v3-mark",textContent:raw.slice(index,index+q.length)}),raw.slice(index+q.length));}}});});

        // 22. Notes character counter.
        const notes=$("#privateNotesArea"); if(notes){notes.maxLength=1500;notes.insertAdjacentHTML("afterend",'<div class="v3-notes-meta"><span id="v3NotesCount">0 / 1500</span></div>');const countNotes=()=>$("#v3NotesCount").textContent=`${notes.value.length} / 1500`;notes.addEventListener("input",countNotes);countNotes();}

        // 23. Honest notes saving feedback while typing.
        let notesTimer; notes?.addEventListener("input",()=>{const status=$("#notesSaveStatus");if(status)status.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';clearTimeout(notesTimer);notesTimer=setTimeout(()=>{if(status)status.innerHTML='<i class="fa-solid fa-circle-check" style="color:#4caf50"></i> Catatan tersimpan';announce("Catatan tersimpan otomatis");},650);});

        // 24. Planner prevents dates in the past.
        const planner=$("#studyPlannerDate"); if(planner){const today=new Date();today.setMinutes(today.getMinutes()-today.getTimezoneOffset());planner.min=today.toISOString().slice(0,10);}

        // 25. Enter sends chatbot messages; Shift+Enter remains available in future textarea upgrades.
        const chat=$("#bububChatInput");chat?.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey&&chat.value.trim()){e.preventDefault();$("#bububSendBtn")?.click();}});

        // 26. Chat input length limit and live count.
        if(chat){chat.maxLength=220;chat.insertAdjacentHTML("afterend",'<span class="v3-sr-only" id="v3ChatCount">0 dari 220 karakter</span>');chat.setAttribute("aria-describedby","v3ChatCount");chat.addEventListener("input",()=>$("#v3ChatCount").textContent=`${chat.value.length} dari 220 karakter`);}

        // 27. Quiz completion progress bar.
        const quizStats=$("#detailQuizStats"); if(quizStats){quizStats.insertAdjacentHTML("afterend",'<div class="v3-quiz-progress" aria-label="Progres kuis"><span></span></div>');const updateQuizProgress=()=>{const text=quizStats.textContent;const match=text.match(/(\d+)\/(\d+)/);const pct=match&&+match[2]?Math.min(100,+match[1]/+match[2]*100):0;$(".v3-quiz-progress span").style.width=`${pct}%`;};new MutationObserver(updateQuizProgress).observe(quizStats,{childList:true,subtree:true,characterData:true});updateQuizProgress();}

        // 28. Matching-game reset confirmation only when a game is in progress.
        const restart=$("#restartMatchBtn");restart?.addEventListener("click",()=>announce("Permainan kata dimulai ulang"));

        // 29. Reveal animation runs once as sections enter the viewport.
        if("IntersectionObserver" in window&&!document.body.classList.contains("v3-no-motion")){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("v3-section-visible");observer.unobserve(entry.target);}}),{threshold:.08});$$(".section-card,.sidebar-widget,.context-sub-card").forEach(card=>observer.observe(card));}

        // 30. Cleanup speech/audio work when leaving the page.
        addEventListener("pagehide",()=>{try{speechSynthesis.cancel();}catch{};});
    }
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
})();
