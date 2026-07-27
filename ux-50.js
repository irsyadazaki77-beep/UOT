/* 50-point UX pass — items 26–50 are behavioral and accessibility improvements. */
(() => {
  'use strict';

  const supportedPages = new Set(['index', 'materi', 'snbt']);
  const page = document.body?.dataset.page;
  if (!supportedPages.has(page) || document.documentElement.dataset.ux50Ready === 'true') return;
  document.documentElement.dataset.ux50Ready = 'true';

  const all = (selector, root = document) => [...root.querySelectorAll(selector)];
  const one = (selector, root = document) => root.querySelector(selector);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let announcer;

  const safeSession = {
    get(key) { try { return sessionStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { sessionStorage.setItem(key, value); } catch (_) { /* Optional preference. */ } }
  };

  function announce(message) {
    if (!announcer || !message) return;
    announcer.textContent = '';
    window.setTimeout(() => { announcer.textContent = message; }, 16);
  }

  /* [26] Keep this audited UX layer last in the cascade. */
  function prioritizeUxLayer() {
    const stylesheet = one('link[href*="ux-50.css"]');
    if (stylesheet?.parentElement) stylesheet.parentElement.appendChild(stylesheet);
  }

  /* [27] Give the primary content landmark a stable target and page-specific name. */
  function labelMainLandmark() {
    const main = one('main');
    if (!main) return;
    if (!main.id) main.id = 'main-content';
    const labels = { index: 'Konten utama beranda', materi: 'Workspace materi belajar', snbt: 'Workspace persiapan TKA' };
    main.setAttribute('aria-label', labels[page]);
  }

  /* [28] Identify the product navigation for assistive technology. */
  function labelPrimaryNavigation() {
    const nav = one('.navbar');
    if (nav) nav.setAttribute('aria-label', 'Navigasi utama');
  }

  /* [29] Mark the current page link semantically, including query/hash-safe matching. */
  function markCurrentPage() {
    const current = location.pathname.split('/').pop() || 'index.html';
    all('.nav-links a, .mega-item-link').forEach((link) => {
      const href = (link.getAttribute('href') || '').split(/[?#]/)[0];
      if (href === current) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  /* [30] Prevent non-form buttons from accidentally behaving like submit controls. */
  function normalizeButtonTypes() {
    all('button:not([type])').forEach((button) => {
      if (!button.closest('form')) button.type = 'button';
    });
  }

  /* [31] Supply useful names for symbol-only and icon-only buttons. */
  function nameIconButtons() {
    const knownNames = [
      ['formula', 'Buka lembar rumus'], ['bookmark', 'Simpan soal'], ['close', 'Tutup'],
      ['reset', 'Atur ulang'], ['prev', 'Sebelumnya'], ['next', 'Berikutnya'],
      ['theme', 'Ubah tema'], ['sound', 'Ubah suara'], ['top', 'Kembali ke atas']
    ];
    all('button:not([aria-label])').forEach((button) => {
      const text = button.textContent.replace(/\s+/g, ' ').trim();
      const meaningfulText = text.replace(/[^\p{L}\p{N}]+/gu, '').trim();
      if (meaningfulText) return;
      const haystack = `${button.id} ${button.className} ${button.title}`.toLowerCase();
      const match = knownNames.find(([needle]) => haystack.includes(needle));
      button.setAttribute('aria-label', button.title || match?.[1] || 'Tutup');
    });
  }

  /* [32] Improve image decoding while keeping above-the-fold branding eager. */
  function optimizeImages() {
    all('img').forEach((image) => {
      image.decoding = 'async';
      if (image.closest('.navbar')) {
        image.loading = 'eager';
        image.fetchPriority = 'high';
      } else if (!image.hasAttribute('loading')) {
        image.loading = 'lazy';
      }
    });
  }

  /* [33] Give every unlabelled field a programmatic name derived from its context. */
  function labelFormControls() {
    const preferred = {
      careerGoal: 'Target karier', plannerFocus: 'Fokus rencana belajar', glossaryMode: 'Kategori glosarium',
      sandboxTemplateSelect: 'Template sandbox', firstElective: 'Mata pelajaran pilihan pertama',
      secondElective: 'Mata pelajaran pilihan kedua', focusArea: 'Fokus terlemah'
    };
    all('input, select, textarea').forEach((field) => {
      if (field.type === 'hidden' || field.hasAttribute('aria-label') || field.hasAttribute('aria-labelledby')) return;
      const hasLabel = field.id && one(`label[for="${field.id}"]`);
      if (hasLabel || field.closest('label')) return;
      const raw = preferred[field.id] || field.placeholder || field.name || field.id;
      if (raw) field.setAttribute('aria-label', raw.replace(/\.{3,}$/g, '').trim());
    });
  }

  /* [34] Add one unobtrusive screen-reader announcer for interaction feedback. */
  function installAnnouncer() {
    announcer = one('#ux50Announcer');
    if (announcer) return;
    announcer = document.createElement('div');
    announcer.id = 'ux50Announcer';
    announcer.className = 'sr-only';
    announcer.setAttribute('role', 'status');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(announcer);
  }

  /* [35] Expose changing quiz, drill, sandbox, and form feedback as live status. */
  function enhanceFeedbackRegions() {
    const selector = [
      '#demoQuizFeedback', '#drillFeedback', '#snbtFeedback', '#sandboxJsFeedback',
      '#sandboxSqlFeedback', '#sandboxXssStatusText', '#sandboxSqliStatusText',
      '#newsletterSuccess', '.module-result-status', '.toast'
    ].join(',');
    all(selector).forEach((region) => {
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'true');
    });
  }

  /* [36] Build complete FAQ question-to-answer relationships. */
  function prepareFaqSemantics() {
    all('.faq-item').forEach((item, index) => {
      const question = one('.faq-question', item);
      const answer = one('.faq-answer', item);
      if (!question || !answer) return;
      question.id ||= `ux-faq-question-${index + 1}`;
      answer.id ||= `ux-faq-answer-${index + 1}`;
      question.setAttribute('aria-controls', answer.id);
      answer.setAttribute('role', 'region');
      answer.setAttribute('aria-labelledby', question.id);
    });
  }

  /* [37] Keep FAQ expanded/collapsed ARIA state synchronized with visual state. */
  function syncFaqState() {
    const items = all('.faq-item');
    const update = () => items.forEach((item) => {
      const open = item.classList.contains('open') || item.classList.contains('active');
      one('.faq-question', item)?.setAttribute('aria-expanded', String(open));
      one('.faq-answer', item)?.setAttribute('aria-hidden', String(!open));
    });
    if (items.length) new MutationObserver(update).observe(one('.faq-list'), { attributes: true, subtree: true, attributeFilter: ['class'] });
    update();
  }

  /* [38] Remember which optional home section the visitor intentionally opened. */
  function restoreHomeDisclosures() {
    all('.home-secondary-content').forEach((details, index) => {
      const key = `ux50-home-detail-${index}`;
      details.open = safeSession.get(key) === 'open';
      details.addEventListener('toggle', () => safeSession.set(key, details.open ? 'open' : 'closed'));
    });
  }

  /* [39] Keep optional home content accordion-like so the page never becomes crowded again. */
  function limitOpenHomeDisclosures() {
    const disclosures = all('.home-secondary-content');
    disclosures.forEach((details) => details.addEventListener('toggle', () => {
      if (!details.open) return;
      disclosures.forEach((other) => { if (other !== details) other.open = false; });
    }));
  }

  /* [40] Reflect scroll position in the navbar without running an expensive handler each frame. */
  function installNavbarScrollState() {
    const navbar = one('.navbar');
    if (!navbar) return;
    let scheduled = false;
    const update = () => {
      navbar.classList.toggle('ux-scrolled', window.scrollY > 24);
      scheduled = false;
    };
    window.addEventListener('scroll', () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  /* [41] Keep the selected tab visible inside horizontally scrolling mobile tab bars. */
  function keepActiveTabsVisible() {
    const selector = '.feature-tab-btn, .tka-main-tab-btn, .tka-tab-btn, .syllabus-tab-btn, .sandbox-tab-btn';
    all(selector).forEach((button) => button.addEventListener('click', () => {
      const strip = button.parentElement;
      if (!strip || strip.scrollWidth <= strip.clientWidth) return;
      button.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    }));
  }

  /* [42] Expose material category filters as a labelled, pressed-state toolbar. */
  function enhanceMaterialFilters() {
    const row = one('body[data-page="materi"] .filter-row');
    if (!row) return;
    row.setAttribute('role', 'toolbar');
    row.setAttribute('aria-label', 'Filter kategori materi');
    const buttons = all('.filter-btn[data-filter]', row);
    const sync = () => buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.classList.contains('active'))));
    buttons.forEach((button) => button.addEventListener('click', () => window.setTimeout(sync, 0)));
    sync();
  }

  /* [43] Connect each module card to its summary for clearer screen-reader context. */
  function describeModuleCards() {
    all('body[data-page="materi"] .module-card').forEach((card, index) => {
      const summary = one('.module-top p', card);
      if (!summary) return;
      summary.id ||= `module-summary-${index + 1}`;
      card.setAttribute('aria-describedby', summary.id);
    });
  }

  /* [44] Escape clears material and glossary searches and announces the reset. */
  function installSearchEscape() {
    all('#moduleSearch, #glossarySearch').forEach((input) => input.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !input.value) return;
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      announce('Pencarian dibersihkan');
    }));
  }

  /* [45] Announce material result counts after search or filter changes. */
  function announceMaterialResults() {
    const status = one('.module-result-status');
    if (!status) return;
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
  }

  /* [46] Remember the visitor's selected SNBT workspace tab. */
  function persistSnbtTab() {
    all('body[data-page="snbt"] .tka-main-tab-btn').forEach((button) => button.addEventListener('click', () => {
      safeSession.set('ux50-snbt-tab', button.getAttribute('aria-controls') || '');
    }));
  }

  /* [47] Restore the last SNBT workspace tab when returning during the session. */
  function restoreSnbtTab() {
    const saved = safeSession.get('ux50-snbt-tab');
    if (!saved) return;
    one(`body[data-page="snbt"] .tka-main-tab-btn[aria-controls="${saved}"]`)?.click();
  }

  /* [48] In-page links automatically reveal a target hidden inside an SNBT tab. */
  function revealHiddenSnbtTargets() {
    all('body[data-page="snbt"] a[href^="#"]').forEach((link) => link.addEventListener('click', (event) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      let target;
      try { target = one(href); } catch (_) { return; }
      const panel = target?.closest('.tka-main-tab-panel');
      if (!panel?.classList.contains('hidden')) return;
      const tab = one(`.tka-main-tab-btn[aria-controls="${panel.id}"]`);
      if (!tab) return;
      event.preventDefault();
      tab.click();
      window.setTimeout(() => target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' }), 0);
    }));
  }

  /* [49] Add expanded state and region relationships to every syllabus accordion. */
  function enhanceSyllabusAccordions() {
    all('body[data-page="snbt"] .tka-accordion-item').forEach((item, index) => {
      const header = one('.tka-accordion-header', item);
      const body = one('.tka-accordion-body', item);
      if (!header || !body) return;
      header.id ||= `syllabus-heading-${index + 1}`;
      body.id ||= `syllabus-panel-${index + 1}`;
      header.setAttribute('aria-controls', body.id);
      body.setAttribute('role', 'region');
      body.setAttribute('aria-labelledby', header.id);
      const sync = () => {
        const open = item.classList.contains('active');
        header.setAttribute('aria-expanded', String(open));
        body.setAttribute('aria-hidden', String(!open));
      };
      header.addEventListener('click', () => window.setTimeout(sync, 0));
      sync();
    });
  }

  /* [50] Synchronize browser chrome color and native control scheme with the active theme. */
  function syncThemeChrome() {
    let meta = one('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    const update = () => {
      const dark = document.body.classList.contains('dark-theme');
      meta.content = dark ? '#0b1120' : '#4f46e5';
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    };
    new MutationObserver(update).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    update();
  }

  function init() {
    installAnnouncer();
    prioritizeUxLayer();
    labelMainLandmark();
    labelPrimaryNavigation();
    markCurrentPage();
    normalizeButtonTypes();
    nameIconButtons();
    optimizeImages();
    labelFormControls();
    enhanceFeedbackRegions();
    prepareFaqSemantics();
    syncFaqState();
    restoreHomeDisclosures();
    limitOpenHomeDisclosures();
    installNavbarScrollState();
    keepActiveTabsVisible();
    enhanceMaterialFilters();
    describeModuleCards();
    installSearchEscape();
    announceMaterialResults();
    persistSnbtTab();
    restoreSnbtTab();
    revealHiddenSnbtTargets();
    enhanceSyllabusAccordions();
    syncThemeChrome();
    window.setTimeout(prioritizeUxLayer, 0);
    window.addEventListener('load', prioritizeUxLayer, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.setTimeout(init, 0), { once: true });
  } else {
    window.setTimeout(init, 0);
  }
})();
