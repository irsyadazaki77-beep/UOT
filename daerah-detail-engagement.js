(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const placeId=new URLSearchParams(location.search).get("id")||"default";
const key=`wonder-engagement-${placeId}`;
const initial={score:0,actions:[],cards:{},badges:[],lastVisit:""};
let state;try{state={...initial,...JSON.parse(localStorage.getItem(key)||"{}")};}catch{state={...initial};}
const save=()=>{try{localStorage.setItem(key,JSON.stringify(state));}catch{}};
const unique=id=>{if(!state.actions.includes(id)){state.actions.push(id);state.score+=15;save();renderSession();reward("Progres bertambah",`+15 poin eksplorasi dari ${labelFor(id)}`);checkBadges();}};
const labelFor=id=>({gallery:"galeri budaya",story:"legenda rakyat",aksara:"latihan aksara",vocab:"flashcard",search:"pencarian frasa",match:"teka-teki",quiz:"kuis mandiri",trivia:"roda trivia",chat:"BUBUB",notes:"catatan belajar",favorite:"favorit daerah",mastered:"status dikuasai"}[id]||"aktivitas belajar");

function init(){
  injectSession(); injectBadges(); injectDialog(); enhanceHeaders(); enhanceFlashcards(); bindEngagement(); updateVisit(); checkBadges(); maybeOnboard();
}
function injectSession(){
 const container=$(".dashboard-container");if(!container)return;
 container.insertAdjacentHTML("afterbegin",`<section class="eng-session-card" aria-label="Progres sesi belajar"><div class="eng-level-orb"><span id="engLevel">1</span></div><div class="eng-session-copy"><strong id="engGoalTitle">Target sesi: jelajahi 5 aktivitas</strong><span id="engGoalCopy">Mulai dari bagian yang paling menarik bagimu.</span><div class="eng-session-progress" role="progressbar" aria-valuemin="0" aria-valuemax="5" aria-valuenow="0"><span></span></div></div><div class="eng-session-score"><strong id="engScore">0</strong><span>poin sesi</span></div></section>`);renderSession();
}
function renderSession(){
 const done=Math.min(5,state.actions.length),pct=done/5*100,level=Math.floor(state.score/100)+1;
 $("#engLevel")&&( $("#engLevel").textContent=level );$("#engScore")&&( $("#engScore").textContent=state.score );
 const bar=$(".eng-session-progress");if(bar){bar.setAttribute("aria-valuenow",done);$("span",bar).style.width=`${pct}%`;}
 const title=$("#engGoalTitle"),copy=$("#engGoalCopy");if(title)title.textContent=done>=5?"Target sesi selesai—hebat!":"Target sesi: jelajahi 5 aktivitas";if(copy)copy.textContent=done>=5?"Kamu sudah menjelajahi cukup banyak budaya hari ini.":`${done}/5 aktivitas selesai. Tinggal ${5-done} lagi.`;
 if(done>=5&&!state.actions.includes("session-complete")){state.actions.push("session-complete");state.score+=25;save();celebrate();reward("Target sesi selesai!","Bonus +25 poin eksplorasi");}
}
function injectBadges(){
 const quest=$("#questChecklist");if(!quest)return;const widget=quest.closest(".sidebar-widget");widget?.insertAdjacentHTML("beforeend",`<div class="eng-badge-shelf" aria-label="Lencana pencapaian"><div class="eng-badge" data-badge="explorer"><i class="fa-solid fa-compass"></i><span>Penjelajah</span></div><div class="eng-badge" data-badge="linguist"><i class="fa-solid fa-language"></i><span>Bahasawan</span></div><div class="eng-badge" data-badge="scholar"><i class="fa-solid fa-award"></i><span>Cendekia</span></div></div>`);
}
function checkBadges(){
 const unlock=(id,condition)=>{if(condition&&!state.badges.includes(id)){state.badges.push(id);save();reward("Lencana baru!",id==="explorer"?"Penjelajah Budaya":id==="linguist"?"Bahasawan Muda":"Cendekia Daerah");} $(`[data-badge="${id}"]`)?.classList.toggle("unlocked",state.badges.includes(id));};
 unlock("explorer",state.actions.filter(x=>["gallery","story","trivia"].includes(x)).length>=2);unlock("linguist",state.actions.filter(x=>["vocab","search","aksara"].includes(x)).length>=2);unlock("scholar",state.actions.includes("quiz")&&state.actions.includes("match"));
}
function injectDialog(){
 document.body.insertAdjacentHTML("beforeend",`<dialog class="eng-dialog" id="engDialog"><div class="eng-dialog-card"><div class="eng-dialog-icon"><i class="fa-solid fa-map-location-dot"></i></div><h2 id="engDialogTitle">Mulai petualangan budaya</h2><p id="engDialogText">Jelajahi cerita, bahasa, permainan, dan fakta unik daerah ini. Setiap aktivitas menambah progres sesi dan membuka lencana.</p><div class="eng-dialog-actions"><button id="engDialogLater">Nanti</button><button class="primary" id="engDialogStart">Mulai jelajah</button></div></div></dialog><div class="eng-toast" id="engToast" role="status" aria-live="polite"><i class="fa-solid fa-star"></i><div><strong></strong><span></span></div></div>`);
 $("#engDialogLater")?.addEventListener("click",()=>$("#engDialog").close());$("#engDialogStart")?.addEventListener("click",()=>{$("#engDialog").close();$(".dashboard-tab-bar")?.scrollIntoView({behavior:"smooth",block:"center"});});
}
function maybeOnboard(){if(!sessionStorage.getItem(`eng-onboard-${placeId}`)&&state.actions.length===0){sessionStorage.setItem(`eng-onboard-${placeId}`,"1");setTimeout(()=>$("#engDialog")?.showModal(),550);}}
function enhanceHeaders(){
 const help={"Rumah Adat & Busana":"Gunakan tombol panah atau keyboard untuk melihat representasi budaya.","Legenda Rakyat":"Aktifkan pembaca suara bila ingin menikmati cerita sambil menyimak.","Studio Flashcard 3D":"Balik kartu, lalu nilai seberapa yakin kamu mengingat artinya.","Teka-Teki Cocok Kata":"Pasangkan frasa dan arti secepat mungkin untuk mendapat skor tinggi.","Kuis Mandiri Daerah":"Jawab pertanyaan lalu baca penjelasannya agar konsep melekat."};
 $$(".card-header-row").forEach(header=>{const h=$("h3",header);if(!h||!help[h.textContent.trim()])return;header.classList.add("eng-section-head");const btn=document.createElement("button");btn.className="eng-help-btn";btn.type="button";btn.setAttribute("aria-label",`Petunjuk ${h.textContent.trim()}`);btn.innerHTML='<i class="fa-solid fa-question"></i>';btn.addEventListener("click",()=>reward(h.textContent.trim(),help[h.textContent.trim()]));header.appendChild(btn);});
}
function enhanceFlashcards(){
 const nav=$(".flashcard-nav-row");if(!nav)return;nav.insertAdjacentHTML("afterend",`<div class="eng-confidence" aria-label="Penilaian hafalan"><button data-confidence="again">😅 Ulangi</button><button data-confidence="unsure">🤔 Hampir</button><button data-confidence="know">✨ Sudah ingat</button></div>`);
 $$("[data-confidence]").forEach(btn=>btn.addEventListener("click",()=>{const progress=$("#cardProgressString")?.textContent||"kartu";state.cards[progress]=btn.dataset.confidence;save();$$("[data-confidence]").forEach(b=>b.classList.toggle("active",b===btn));unique("vocab");reward("Penilaian tersimpan",btn.dataset.confidence==="know"?"Mantap, lanjut ke kartu berikutnya!":btn.dataset.confidence==="unsure"?"Sedikit lagi—coba balik kartunya sekali lagi.":"Tidak apa-apa, pengulangan adalah bagian belajar.");if(btn.dataset.confidence==="know")setTimeout(()=>$("#nextCardBtn")?.click(),500);}));
 $("#nextCardBtn")?.addEventListener("click",()=>$$('[data-confidence]').forEach(b=>b.classList.remove("active")));$("#prevCardBtn")?.addEventListener("click",()=>$$('[data-confidence]').forEach(b=>b.classList.remove("active")));
}
function bindEngagement(){
 const once=(selector,event,id)=>$(selector)?.addEventListener(event,()=>unique(id));
 once("#slideNextBtn","click","gallery");once("#ttsPlayBtn","click","story");once("#copyAksaraBtn","click","aksara");once("#glossarySearchInput","input","search");once("#spinTriviaBtn","click","trivia");once("#bububSendBtn","click","chat");once("#privateNotesArea","input","notes");once("#detailFavoriteBtn","click","favorite");once("#detailMasteredBtn","click","mastered");
 $("#detailQuizAnswers")?.addEventListener("click",e=>{if(e.target.closest("button"))unique("quiz");});$(".matching-game-container")?.addEventListener("click",e=>{if(e.target.closest(".match-item,.matching-item,button"))unique("match");});
 $$("[data-main-tab]").forEach(tab=>tab.addEventListener("click",()=>{tab.classList.add("eng-pulse");setTimeout(()=>tab.classList.remove("eng-pulse"),600);}));
}
function updateVisit(){const today=new Date().toISOString().slice(0,10);if(state.lastVisit!==today){state.lastVisit=today;save();}}
let toastTimer;function reward(title,text){const toast=$("#engToast");if(!toast)return;$("strong",toast).textContent=title;$("span",toast).textContent=text;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),2600);}
function celebrate(){const layer=document.createElement("div");layer.className="eng-complete";for(let i=0;i<28;i++){const bit=document.createElement("i");bit.className="eng-confetti";bit.style.left=`${Math.random()*100}%`;bit.style.background=["#22c55e","#f59e0b","#3b82f6","#ec4899"][i%4];bit.style.setProperty("--drift",`${Math.random()*180-90}px`);bit.style.animationDelay=`${Math.random()*.35}s`;layer.appendChild(bit);}document.body.appendChild(layer);setTimeout(()=>layer.remove(),2200);}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
