/* Shared small enhancements. Keeps existing page-specific behaviours intact. */
(() => {
  const page = document.body?.dataset.page;
  if (!page || !['index', 'materi', 'snbt'].includes(page)) return;

  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    if ((link.getAttribute('href') || '').split('#')[0] === current) {
      link.classList.add('is-active');
      link.setAttribute('aria-current', 'page');
    }
  });

  const revealItems = [...document.querySelectorAll('.reveal')];
  if (!('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px' });
    revealItems.forEach((item) => observer.observe(item));
  }

  function keepRefreshLayerLast() {
    const stylesheet = document.querySelector('link[href*="clean-ui-refresh.css"]');
    if (stylesheet?.parentElement) stylesheet.parentElement.appendChild(stylesheet);
  }



  function syncTabState(buttons, panels) {
    buttons.forEach((button) => {
      const active = button.classList.contains('active');
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = !panel.classList.contains('hidden') && panel.style.display !== 'none';
      panel.setAttribute('aria-hidden', String(!active));
    });
  }

  function enhanceNestedTabSet(buttonSelector, panelSelector, targetAttribute) {
    const buttons = [...document.querySelectorAll(buttonSelector)];
    const panels = [...document.querySelectorAll(panelSelector)];
    if (!buttons.length || !panels.length) return;
    buttons[0].parentElement?.setAttribute('role', 'tablist');

    const sync = () => {
      buttons.forEach((button) => {
        const target = document.getElementById(button.dataset[targetAttribute]);
        const active = button.classList.contains('active');
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
        if (target) {
          button.setAttribute('aria-controls', target.id);
          target.setAttribute('role', 'tabpanel');
          target.setAttribute('aria-hidden', String(!active));
        }
      });
    };

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => window.setTimeout(sync, 0));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        buttons[next].focus();
        buttons[next].click();
      });
    });
    sync();
  }

  function enhanceSnbtTabs() {
    const buttons = [...document.querySelectorAll('.tka-main-tab-btn')];
    const panels = [...document.querySelectorAll('.tka-main-tab-panel')];
    if (!buttons.length || !panels.length) return;

    syncTabState(buttons, panels);
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => window.setTimeout(() => syncTabState(buttons, panels), 0));
      button.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        buttons[next].focus();
        buttons[next].click();
      });
    });

    const practiceLink = document.querySelector('a[href="#tryout"]');
    const practiceTab = document.querySelector('.tka-main-tab-btn[aria-controls="panel-practice"]');
    const practiceSection = document.getElementById('tryout');
    practiceLink?.addEventListener('click', (event) => {
      if (!practiceTab || !practiceSection) return;
      event.preventDefault();
      practiceTab.click();
      window.setTimeout(() => practiceSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
    });

    enhanceNestedTabSet('.tka-tab-btn', '.tka-tab-content', 'target');
    enhanceNestedTabSet('.syllabus-tab-btn', '.syllabus-sub-column', 'subjectTab');
  }

  function init() {
    keepRefreshLayerLast();
    window.setTimeout(keepRefreshLayerLast, 0);
    if (page === 'snbt') enhanceSnbtTabs();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
