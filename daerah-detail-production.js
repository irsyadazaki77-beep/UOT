(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const pid=new URLSearchParams(location.search).get("id")||"default", storageKey=`wonder-production-${pid}`;
let data={done:[],lastTab:"explore",scroll:0,focusSeconds:600};try{data={...data,...JSON.parse(localStorage.getItem(storageKey)||"{}")};}catch{}
const save=()=>{try{localStorage.setItem(storageKey,JSON.stringify(data));}catch{}};
const tabNames={explore:"Eksplorasi budaya",vocab:"Kosakata & dialek",test:"Kuis & permainan"};

function init(){injectRoadmap();injectUtilities();injectShortcuts();enhanceTabJourney();trackCompletion();setupResume();setupFocusMode();setupSessionTimer();setupKeyboard();setupPerformance();}

function injectRoadmap(){
 const hero=$(".wonder-page-hero");if(!hero)return;
 hero.insertAdjacentHTML("afterend",`<section class="prod-roadmap" aria-label="Peta perjalanan belajar"><div class="prod-roadmap-card"><div class="prod-roadmap-title"><div class="prod-roadmap-icon"><i class="fa-solid fa-route"></i></div><div><strong>Perjalanan belajar</strong><span>Pilih tahap atau lanjutkan dari progres terakhir</span></div></div><div class="prod-steps" aria-label="Tahap pembelajaran"><button class="prod-step" data-prod-tab="explore"><span class="num">1</span><strong>Jelajahi</strong><small>Budaya & cerita</small></button><button class="prod-step" data-prod-tab="vocab"><span class="num">2</span><strong>Pelajari</strong><small>Bahasa & aksara</small></button><button class="prod-step" data-prod-tab="test"><span class="num">3</span><strong>Uji diri</strong><small>Kuis & permainan</small></button></div><button class="prod-continue" id="prodContinue"><i class="fa-solid fa-play"></i> Lanjutkan belajar</button></div></section>`);
 $$('[data-prod-tab]').forEach(btn=>btn.addEventListener("click",()=>openTab(btn.dataset.prodTab,true)));$("#prodContinue")?.addEventListener("click",()=>openTab(nextTab(),true));renderRoadmap();
}
function openTab(id,scroll){const btn=$(`[data-main-tab="${id}"]`);if(!btn)return;btn.click();data.lastTab=id;save();renderRoadmap();if(scroll)setTimeout(()=>$(".dashboard-tab-bar")?.scrollIntoView({behavior:document.body.classList.contains("v3-no-motion")?"auto":"smooth",block:"start"}),80);}
function nextTab(){return ["explore","vocab","test"].find(id=>!data.done.includes(id))||data.lastTab||"explore";}
function renderRoadmap(){
 $$('[data-prod-tab]').forEach(step=>{const id=step.dataset.prodTab,done=data.done.includes(id);step.classList.toggle("done",done);step.classList.toggle("active",id===data.lastTab);const num=$(".num",step);if(num)num.innerHTML=done?'<i class="fa-solid fa-check"></i>':({explore:1,vocab:2,test:3}[id]);const small=$("small",step);if(small&&done)small.textContent="Tahap selesai";});
 $$('[data-main-tab]').forEach(tab=>tab.classList.toggle("prod-done",data.done.includes(tab.dataset.mainTab)));const next=nextTab(),button=$("#prodContinue");if(button)button.innerHTML=data.done.length===3?'<i class="fa-solid fa-rotate-right"></i> Ulangi perjalanan':`<i class="fa-solid fa-play"></i> Lanjut: ${tabNames[next]}`;
}
function enhanceTabJourney(){
 $$('[data-main-tab]').forEach(tab=>tab.addEventListener("click",()=>{data.lastTab=tab.dataset.mainTab;save();renderRoadmap();}));
 const stored=data.lastTab;if(stored&&$(`[data-main-tab="${stored}"]`))requestAnimationFrame(()=>openTab(stored,false));
}
function markDone(id){if(!data.done.includes(id)){data.done.push(id);save();renderRoadmap();window.WonderfulCore?.showToast?.(`${tabNames[id]} selesai ditandai`);}}
function trackCompletion(){
 $("#detailMasteredBtn")?.addEventListener("click",()=>markDone("explore"));
 let known=0;$$('[data-confidence="know"]').forEach(btn=>btn.addEventListener("click",()=>{known++;if(known>=2)markDone("vocab");}));
 $("#detailQuizAnswers")?.addEventListener("click",e=>{if(e.target.closest("button"))setTimeout(()=>markDone("test"),350);});
 $("#matchVictoryMsg")&&new MutationObserver(()=>{if(getComputedStyle($("#matchVictoryMsg")).display!=="none")markDone("test");}).observe($("#matchVictoryMsg"),{attributes:true,attributeFilter:["style","class"]});
}
function injectUtilities(){
 document.body.insertAdjacentHTML("beforeend",`<div class="prod-utility"><button id="prodFocus" aria-label="Aktifkan mode fokus" aria-pressed="false" title="Mode fokus"><i class="fa-solid fa-bullseye"></i> <span>Fokus</span></button><button id="prodTimer" aria-label="Mulai timer belajar 10 menit" title="Timer belajar 10 menit"><i class="fa-regular fa-clock"></i> <span id="prodTimerText">10:00</span></button><button id="prodHelp" aria-label="Buka daftar shortcut" title="Daftar shortcut"><i class="fa-regular fa-keyboard"></i> <span>Shortcut</span></button></div><div class="prod-resume" id="prodResume"><span>Lanjutkan dari posisi terakhir?</span><button id="prodResumeYes">Lanjut</button><button class="dismiss" id="prodResumeNo" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button></div>`);
 $("#prodHelp")?.addEventListener("click",()=>$("#prodShortcuts")?.showModal());
}
function setupFocusMode(){const btn=$("#prodFocus");btn?.addEventListener("click",()=>{const on=!document.body.classList.contains("prod-focus-dim");document.body.classList.toggle("prod-focus-dim",on);btn.setAttribute("aria-pressed",String(on));btn.setAttribute("aria-label",on?"Keluar dari mode fokus":"Aktifkan mode fokus");btn.classList.toggle("timer-running",on);btn.innerHTML=on?'<i class="fa-solid fa-minimize"></i> <span>Keluar fokus</span>':'<i class="fa-solid fa-bullseye"></i> <span>Fokus</span>';if(on)$(".dashboard-tab-bar")?.scrollIntoView({behavior:"smooth",block:"start"});});}
function setupSessionTimer(){
 let remaining=Number.isFinite(data.focusSeconds)?data.focusSeconds:600,running=false,interval;const btn=$("#prodTimer"),text=$("#prodTimerText");const render=()=>{const m=String(Math.floor(remaining/60)).padStart(2,"0"),s=String(remaining%60).padStart(2,"0");if(text)text.textContent=`${m}:${s}`;};render();
 btn?.addEventListener("click",()=>{running=!running;btn.classList.toggle("timer-running",running);btn.title=running?"Jeda timer":"Lanjutkan timer";btn.setAttribute("aria-label",running?"Jeda timer belajar":"Lanjutkan timer belajar");if(running){interval=setInterval(()=>{remaining=Math.max(0,remaining-1);data.focusSeconds=remaining;save();render();if(remaining===0){clearInterval(interval);running=false;btn.classList.remove("timer-running");btn.setAttribute("aria-label","Mulai ulang timer belajar");window.WonderfulCore?.showToast?.("Sesi fokus selesai. Waktunya istirahat!");}},1000);}else clearInterval(interval);});addEventListener("pagehide",()=>clearInterval(interval));
}
function setupResume(){
 const resume=$("#prodResume");if(data.scroll>900){setTimeout(()=>resume?.classList.add("show"),900);}$("#prodResumeYes")?.addEventListener("click",()=>{resume.classList.remove("show");scrollTo({top:data.scroll,behavior:"smooth"});});$("#prodResumeNo")?.addEventListener("click",()=>resume.classList.remove("show"));
 let timer;addEventListener("scroll",()=>{clearTimeout(timer);timer=setTimeout(()=>{data.scroll=Math.round(scrollY);save();},300);},{passive:true});
}
function injectShortcuts(){document.body.insertAdjacentHTML("beforeend",`<dialog class="prod-shortcuts" id="prodShortcuts"><div class="prod-shortcuts-card"><div class="prod-shortcuts-head"><h2>Shortcut halaman</h2><button id="prodCloseShortcuts" aria-label="Tutup"><i class="fa-solid fa-xmark"></i></button></div><div class="prod-shortcut-list"><div class="prod-shortcut"><span>Pindah tab pembelajaran</span><kbd>1–3</kbd></div><div class="prod-shortcut"><span>Buka pencarian perintah</span><kbd>Ctrl K</kbd></div><div class="prod-shortcut"><span>Favoritkan daerah</span><kbd>F</kbd></div><div class="prod-shortcut"><span>Balik flashcard</span><kbd>Space</kbd></div><div class="prod-shortcut"><span>Buka daftar shortcut</span><kbd>?</kbd></div><div class="prod-shortcut"><span>Tutup dialog/panel</span><kbd>Esc</kbd></div></div></div></dialog>`);$("#prodCloseShortcuts")?.addEventListener("click",()=>$("#prodShortcuts").close());}
function setupKeyboard(){addEventListener("keydown",e=>{if(e.key==="?"&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)){$("#prodShortcuts")?.showModal();}if(e.key==="Escape"&&$("#prodShortcuts")?.open)$("#prodShortcuts").close();});}
function setupPerformance(){
 const hero=$("#heroCanvas");if(hero&&"IntersectionObserver" in window){new IntersectionObserver(([entry])=>{hero.style.visibility=entry.isIntersecting?"visible":"hidden";},{rootMargin:"100px"}).observe(hero);}
 document.documentElement.classList.add("prod-ready");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
