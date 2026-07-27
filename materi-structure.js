(function () {
    'use strict';
    const META = {
        modules: ['Workspace belajar', 'Modul dan jalur belajar', 'Cari topik, pilih fokus karier, lalu ikuti modul dan roadmap tanpa berpindah konteks.'],
        sandbox: ['Workspace praktik', 'Lab dan latihan interaktif', 'Uji konsep melalui daily drill, visualizer kode, simulasi SQL, dan latihan keamanan.'],
        planner: ['Workspace perencanaan', 'Planner dan progres', 'Susun target mingguan yang realistis dan lihat perkembangan kurikulum dalam satu tempat.'],
        glossary: ['Workspace referensi', 'Glosarium dan flashcards', 'Cari istilah teknis atau gunakan kartu belajar untuk mengingat konsep penting dengan cepat.']
    };

    function addWorkspaceHeaders() {
        Object.entries(META).forEach(([key, copy]) => {
            const panel = document.getElementById('tabPanel-' + key);
            if (!panel || panel.querySelector(':scope > .workspace-intro')) return;
            const header = document.createElement('header');
            header.className = 'workspace-intro';
            const actions = { modules:['Lanjut ke latihan','quiz.html'], sandbox:['Buka lab interaktif','#sandbox-section'], planner:['Susun rencana','#planner'], glossary:['Mulai flashcards','#glossaryFlashcardView'] };
            header.innerHTML = '<div><small>' + copy[0] + '</small><h2>' + copy[1] + '</h2></div><div><p>' + copy[2] + '</p><a class="workspace-next-action" href="' + actions[key][1] + '">' + actions[key][0] + '</a></div>';
            panel.prepend(header);
        });
    }

    function addLearningFlow() {
        const hero = document.querySelector('.hero');
        if (!hero || document.querySelector('.learning-flow')) return;
        const flow = document.createElement('div');
        flow.className = 'learning-flow';
        flow.setAttribute('aria-label','Alur belajar yang disarankan');
        flow.innerHTML = [
            ['1','Pilih','Tentukan modul'],['2','Pelajari','Baca konsep'],
            ['3','Praktik','Gunakan lab'],['4','Uji','Kerjakan quiz']
        ].map(item => '<div class="learning-flow-step"><b>'+item[0]+'</b><span><strong>'+item[1]+'</strong>'+item[2]+'</span></div>').join('');
        hero.insertAdjacentElement('afterend',flow);
    }

    function improveModuleDiscovery() {
        const input = document.getElementById('moduleSearch');
        const grid = document.getElementById('moduleGrid');
        if (!input || !grid || input.closest('.module-search-shell')) return;
        const shell = document.createElement('div'); shell.className='module-search-shell';
        input.parentNode.insertBefore(shell,input); shell.appendChild(input);
        const clear=document.createElement('button'); clear.type='button'; clear.className='module-search-clear'; clear.textContent='×'; clear.hidden=true; clear.setAttribute('aria-label','Hapus pencarian'); shell.appendChild(clear);
        const status=document.createElement('p'); status.className='module-result-status'; status.setAttribute('role','status'); status.setAttribute('aria-live','polite'); grid.insertAdjacentElement('beforebegin',status);
        const empty=document.createElement('div'); empty.className='module-empty-state'; empty.innerHTML='<strong>Modul tidak ditemukan</strong><span>Coba kata kunci lain atau pilih filter Semua.</span>'; grid.appendChild(empty);
        const cards=Array.from(grid.querySelectorAll('.module-card'));
        cards.forEach(card=>{
            card.setAttribute('role','button');
            card.tabIndex=0;
            card.setAttribute('aria-label','Lihat detail '+(card.querySelector('h3')?.textContent||'modul'));
            const footer = card.querySelector('.module-footer');
            if (footer && card.dataset.duration && !footer.querySelector('.module-duration')) {
                const duration = document.createElement('span');
                duration.className = 'module-duration';
                duration.innerHTML = '<i class="fa-regular fa-clock" aria-hidden="true"></i> ' + card.dataset.duration;
                footer.prepend(duration);
            }
            card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click();}});
        });
        function update(){ window.setTimeout(()=>{ const visible=cards.filter(card=>getComputedStyle(card).display!=='none'&&!card.classList.contains('filtered-out')).length; status.textContent=visible+' modul sesuai pilihanmu'; empty.classList.toggle('is-visible',visible===0); clear.hidden=!input.value; },0); }
        input.addEventListener('input',update); document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',update));
        clear.addEventListener('click',()=>{input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();}); update();
    }

    function improveTabs() {
        const buttons = Array.from(document.querySelectorAll('.feature-tab-btn'));
        const panels = Array.from(document.querySelectorAll('.tab-content-panel'));
        if (!buttons.length || !panels.length) return;
        const nav = document.querySelector('.feature-tabs-nav');
        nav?.setAttribute('role', 'tablist');
        const live=document.createElement('div'); live.className='workspace-live'; live.setAttribute('role','status'); live.setAttribute('aria-live','polite'); document.body.appendChild(live); let liveTimer;

        buttons.forEach(button => {
            const key = button.dataset.featureTab;
            const panel = document.getElementById('tabPanel-' + key);
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-controls', panel?.id || '');
            button.setAttribute('aria-selected', String(button.classList.contains('active')));
            if (panel) { panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', key + '-tab'); }
            button.id = key + '-tab';
            button.addEventListener('click', () => {
                buttons.forEach(item => item.setAttribute('aria-selected', String(item === button)));
                try { sessionStorage.setItem('materi-active-workspace', key); } catch (_) {}
                history.replaceState(null, '', '#workspace-' + key);
                live.textContent='Workspace '+META[key][1]+' dibuka'; live.classList.add('is-visible'); clearTimeout(liveTimer); liveTimer=setTimeout(()=>live.classList.remove('is-visible'),1600);
            });
            button.addEventListener('keydown',event=>{ if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return; event.preventDefault(); let index=buttons.indexOf(button); if(event.key==='ArrowRight')index=(index+1)%buttons.length; if(event.key==='ArrowLeft')index=(index-1+buttons.length)%buttons.length; if(event.key==='Home')index=0; if(event.key==='End')index=buttons.length-1; buttons[index].focus(); buttons[index].click(); });
        });

        let preferred = location.hash.replace('#workspace-', '');
        if (!META[preferred]) {
            try { preferred = sessionStorage.getItem('materi-active-workspace'); } catch (_) {}
        }
        const preferredButton = buttons.find(button => button.dataset.featureTab === preferred);
        if (preferredButton && !preferredButton.classList.contains('active')) preferredButton.click();
    }

    function installFullscreenControl() {
        const actions = document.querySelector('.navbar .nav-actions');
        if (!actions || document.querySelector('.materi-fullscreen-toggle')) return;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'materi-fullscreen-toggle';
        button.innerHTML = '<i class="fa-solid fa-expand"></i>';
        button.setAttribute('aria-label', 'Masuk layar penuh');
        button.title = 'Layar penuh';
        actions.insertBefore(button, actions.firstChild);
        function update() {
            const active = Boolean(document.fullscreenElement);
            document.body.classList.toggle('materi-is-fullscreen', active);
            button.innerHTML = active ? '<i class="fa-solid fa-compress"></i>' : '<i class="fa-solid fa-expand"></i>';
            button.setAttribute('aria-label', active ? 'Keluar dari layar penuh' : 'Masuk layar penuh');
            button.title = active ? 'Keluar dari layar penuh' : 'Layar penuh';
        }
        button.addEventListener('click', async () => {
            try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
            catch (_) { button.title = 'Layar penuh tidak didukung browser ini'; }
        });
        document.addEventListener('fullscreenchange', update);
        update();
    }

    function init() { addWorkspaceHeaders(); improveModuleDiscovery(); improveTabs(); installFullscreenControl(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
