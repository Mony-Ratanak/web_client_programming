/**
 * Week11_Session1_Lab.js
 * Web Client Programming — ITC
 * Week 11 · Session 1: Advanced Customization & Footer Widgets
 *
 * TABLE OF CONTENTS
 * ─────────────────
 * 01. Constants & Phase Config
 * 02. localStorage Helpers
 * 03. Progress Rendering
 * 04. Checkbox Init & Handlers
 * 05. Footer Preview (live column reveal)
 * 06. Phase Nav Highlighting
 * 07. Completion Banners & Session Overlay
 * 08. Customizer Mock Interactivity
 * 09. Header Builder Drag-and-Drop
 * 10. Layout Option Selector
 * 11. Reset
 * 12. Init (DOMContentLoaded)
 */

(function () {
  'use strict';

  /* ================================================================
     01. CONSTANTS & PHASE CONFIG
     ================================================================ */

  const STORAGE_PREFIX = 'wk11s1_';

  const PHASES = {
    1: { total: 8,  barId: 'p1-bar', countId: 'p1-label', dotId: 'dot-1', navCountId: 'nav-count-1', bannerId: 'banner-1' },
    2: { total: 10, barId: 'p2-bar', countId: 'p2-label', dotId: 'dot-2', navCountId: 'nav-count-2', bannerId: 'banner-2' },
    3: { total: 6,  barId: 'p3-bar', countId: 'p3-label', dotId: 'dot-3', navCountId: 'nav-count-3', bannerId: 'banner-3' },
    4: { total: 4,  barId: 'p4-bar', countId: 'p4-label', dotId: 'dot-4', navCountId: 'nav-count-4', bannerId: 'banner-4' },
  };

  const TOTAL_STEPS = Object.values(PHASES).reduce((s, p) => s + p.total, 0);
  const phaseKeys   = { 1: [], 2: [], 3: [], 4: [] };

  /** Footer-preview trigger mapping: which checkbox key triggers which column reveal. */
  const FP_TRIGGERS = {
    'cb-s2-2': 'col1-start',
    'cb-s2-4': 'col1',
    'cb-s2-5': 'col2-start',
    'cb-s2-7': 'col2',
    'cb-s2-8': 'col3-start',
    'cb-s2-9': 'col3',
  };


  /* ================================================================
     02. LOCALSTORAGE HELPERS
     ================================================================ */

  function save(key, checked) {
    try { checked ? localStorage.setItem(STORAGE_PREFIX + key, '1') : localStorage.removeItem(STORAGE_PREFIX + key); }
    catch (e) { /* ignore */ }
  }

  function load(key) {
    try { return localStorage.getItem(STORAGE_PREFIX + key) === '1'; }
    catch (e) { return false; }
  }

  function clearAll() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) keys.push(k);
      }
      keys.forEach(k => localStorage.removeItem(k));
    } catch (e) { /* ignore */ }
  }


  /* ================================================================
     03. PROGRESS RENDERING
     ================================================================ */

  function countChecked(phase) {
    return phaseKeys[phase].filter(k => {
      const el = document.getElementById(k);
      return el && el.checked;
    }).length;
  }

  function updateAllProgress() {
    let total = 0;

    Object.keys(PHASES).forEach(n => {
      const ph   = parseInt(n, 10);
      const cfg  = PHASES[ph];
      const done = countChecked(ph);
      total += done;
      const pct  = cfg.total > 0 ? Math.round((done / cfg.total) * 100) : 0;

      const bar = document.getElementById(cfg.barId);
      if (bar) bar.style.width = pct + '%';

      const lbl = document.getElementById(cfg.countId);
      if (lbl) lbl.textContent = done + ' / ' + cfg.total + ' steps';

      const dot = document.getElementById(cfg.dotId);
      if (dot) {
        dot.className = 'phase-dot';
        if (done === cfg.total && cfg.total > 0) dot.classList.add('is-complete');
        else if (done > 0)                       dot.classList.add('is-partial');
      }

      const nc = document.getElementById(cfg.navCountId);
      if (nc) nc.textContent = done + '/' + cfg.total;

      revealBanner(ph, done, cfg.total);
    });

    const opct = TOTAL_STEPS > 0 ? Math.round((total / TOTAL_STEPS) * 100) : 0;
    const ob   = document.getElementById('overall-bar');
    const obt  = document.getElementById('overall-bar-track');
    const oc   = document.getElementById('overall-count');
    if (ob)  ob.style.width = opct + '%';
    if (obt) obt.setAttribute('aria-valuenow', opct);
    if (oc)  oc.textContent = total + ' / ' + TOTAL_STEPS + ' steps';

    if (total === TOTAL_STEPS && TOTAL_STEPS > 0) showSessionComplete();
  }


  /* ================================================================
     04. CHECKBOX INIT & HANDLERS
     ================================================================ */

  function initCheckboxes() {
    document.querySelectorAll('.step-checkbox').forEach(cb => {
      const key   = cb.dataset.key;
      const phase = parseInt(cb.dataset.phase, 10);
      if (!key || !phase) return;

      if (phaseKeys[phase]) phaseKeys[phase].push(key);
      cb.checked = load(key);

      cb.addEventListener('change', function () {
        save(key, this.checked);
        updateAllProgress();
        updateFooterPreview();
      });
    });
  }


  /* ================================================================
     05. FOOTER PREVIEW — live column reveal
     ================================================================ */

  /**
   * Show / hide footer preview columns based on which checkboxes are ticked.
   * col1 shows when cb-s2-4 is checked, col2 when cb-s2-7, col3 when cb-s2-9.
   */
  function updateFooterPreview() {
    const col1Full  = load('cb-s2-4');
    const col2Full  = load('cb-s2-7');
    const col3Full  = load('cb-s2-9');
    const col1Start = load('cb-s2-2');
    const col2Start = load('cb-s2-5');
    const col3Start = load('cb-s2-8');

    revealFooterCol(1, col1Full, col1Start);
    revealFooterCol(2, col2Full, col2Start);
    revealFooterCol(3, col3Full, col3Start);
  }

  function revealFooterCol(num, full, started) {
    const empty   = document.getElementById('fp-col' + num + '-empty');
    const content = document.getElementById('fp-col' + num + '-content');
    if (!empty || !content) return;

    if (full) {
      empty.hidden   = true;
      content.hidden = false;
    } else if (started) {
      /* Partial — show empty with pulsing hint */
      empty.hidden   = false;
      content.hidden = true;
      const hint = empty.querySelector('.fp-empty-hint');
      if (hint) hint.textContent = 'Adding blocks…';
    } else {
      empty.hidden   = false;
      content.hidden = true;
      const hint = empty.querySelector('.fp-empty-hint');
      if (hint) {
        const hints = ['Complete steps 2–4', 'Complete steps 5–7', 'Complete steps 8–9'];
        hint.textContent = hints[num - 1] || '';
      }
    }
  }


  /* ================================================================
     06. PHASE NAV HIGHLIGHTING
     ================================================================ */

  function initNavHighlighting() {
    const sections = document.querySelectorAll('.phase-section');
    if (!sections.length) return;
    const navBtns = document.querySelectorAll('.phase-nav-btn');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const ph = e.target.dataset.phase;
          navBtns.forEach(b => b.classList.toggle('is-active', b.dataset.phase === ph));
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
    sections.forEach(s => obs.observe(s));
  }


  /* ================================================================
     07. COMPLETION BANNERS & SESSION OVERLAY
     ================================================================ */

  function revealBanner(phase, done, total) {
    const b = document.getElementById('banner-' + phase);
    if (!b) return;
    const show = done === total && total > 0;
    if (show && b.hidden) {
      b.hidden = false;
      b.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (!show) {
      b.hidden = true;
    }
  }

  function showSessionComplete() {
    const o = document.getElementById('session-complete');
    if (o) o.hidden = false;
  }


  /* ================================================================
     08. CUSTOMIZER MOCK INTERACTIVITY
     ================================================================ */

  const CUSTOMIZER_INFO = {
    header:     { title: 'Header Builder', desc: 'Drag elements (Logo, Menu, Button) into the 3-column header grid rows. Changes preview live on the right.' },
    global:     { title: 'Global Settings', desc: 'Container (Boxed / Full Width), Colors, Typography — changes apply site-wide to all pages at once.' },
    footer:     { title: 'Footer Builder', desc: 'Like the Header Builder but for the footer. Assign widget areas to the left, centre, and right columns.' },
    colors:     { title: 'Global Color', desc: 'Set the primary accent color of the theme — affects buttons, links, headings. Changes every element at once.' },
    typography: { title: 'Global Typography', desc: 'Choose fonts for headings and body text. Try Playfair Display for headings and Roboto for body text.' },
    menus:      { title: 'Menus', desc: 'Assign your saved menus (Main Navbar, Footer Menu) to the correct theme locations.' },
  };

  window.selectCustomizerSection = function (btn, section) {
    document.querySelectorAll('.c-nav-item').forEach(b => b.classList.remove('c-nav-active'));
    btn.classList.add('c-nav-active');
    const info = CUSTOMIZER_INFO[section];
    if (info) {
      const t = document.getElementById('c-info-title');
      const d = document.getElementById('c-info-desc');
      if (t) t.textContent = info.title;
      if (d) d.textContent = info.desc;
    }
  };


  /* ================================================================
     09. HEADER BUILDER DRAG-AND-DROP
     ================================================================ */

  let draggedElement = null;

  window.dragElement = function (event, name) {
    draggedElement = name;
    event.dataTransfer.effectAllowed = 'move';
  };

  window.dropElement = function (event, target) {
    event.preventDefault();
    if (!draggedElement) return;

    const cells = { left: 'hb-left', center: 'hb-center', right: 'hb-right' };
    const elIds = { logo: 'el-logo', menu: 'el-menu', button: 'el-button' };

    const destCell = document.getElementById(cells[target]);
    const draggedEl = document.getElementById(elIds[draggedElement]);
    if (!destCell || !draggedEl) return;

    /* Swap if dest already has an element */
    const existingEl = destCell.querySelector('.hb-element');
    if (existingEl && existingEl !== draggedEl) {
      const srcCell = draggedEl.parentElement;
      srcCell.appendChild(existingEl);
    }
    destCell.appendChild(draggedEl);

    const hint = document.getElementById('hb-hint');
    if (hint) hint.textContent = '✅ Layout updated! In the real Customizer, the preview pane would update instantly.';
    draggedElement = null;
  };

  /* Drag-over visual feedback */
  document.addEventListener('dragover', function (e) {
    const cell = e.target.closest('.hb-cell');
    document.querySelectorAll('.hb-cell').forEach(c => c.classList.remove('drag-over'));
    if (cell) cell.classList.add('drag-over');
  });
  document.addEventListener('drop', function () {
    document.querySelectorAll('.hb-cell').forEach(c => c.classList.remove('drag-over'));
  });


  /* ================================================================
     10. LAYOUT OPTION SELECTOR (Boxed / Full Width)
     ================================================================ */

  window.selectLayout = function (type) {
    const boxed = document.getElementById('opt-boxed');
    const full  = document.getElementById('opt-full');
    if (!boxed || !full) return;

    if (type === 'boxed') {
      boxed.classList.add('layout-selected');
      boxed.setAttribute('aria-pressed', 'true');
      full.classList.remove('layout-selected');
      full.setAttribute('aria-pressed', 'false');
    } else {
      full.classList.add('layout-selected');
      full.setAttribute('aria-pressed', 'true');
      boxed.classList.remove('layout-selected');
      boxed.setAttribute('aria-pressed', 'false');
    }
  };


  /* ================================================================
     11. RESET
     ================================================================ */

  window.resetProgress = function () {
    if (!confirm('Reset all progress? This will uncheck every step.')) return;
    clearAll();
    document.querySelectorAll('.step-checkbox').forEach(cb => { cb.checked = false; });
    document.querySelectorAll('.phase-complete-banner').forEach(b => { b.hidden = true; });
    const overlay = document.getElementById('session-complete');
    if (overlay) overlay.hidden = true;
    updateAllProgress();
    updateFooterPreview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  /* ================================================================
     12. INIT
     ================================================================ */

  document.addEventListener('DOMContentLoaded', function () {

    /* 1. Register + restore checkboxes */
    initCheckboxes();

    /* 2. Render all progress bars from restored state */
    updateAllProgress();

    /* 3. Restore footer preview from saved state */
    updateFooterPreview();

    /* 4. Scroll-based nav highlighting */
    initNavHighlighting();

    /* 5. Keyboard accessibility for step labels */
    document.querySelectorAll('.step-label').forEach(label => {
      label.setAttribute('tabindex', '0');
      label.setAttribute('role', 'checkbox');
      label.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const cb = this.querySelector('.step-checkbox');
          if (cb) { cb.checked = !cb.checked; cb.dispatchEvent(new Event('change')); }
        }
      });
    });

    /* 6. Smooth-scroll phase nav links */
    document.querySelectorAll('.phase-nav-btn').forEach(link => {
      link.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const navH = (document.getElementById('phase-nav') || {}).offsetHeight || 0;
          const top  = target.getBoundingClientRect().top + window.scrollY - navH - 12;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });

    /* 7. Layout option keyboard support */
    document.querySelectorAll('.layout-option').forEach(opt => {
      opt.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const t = this.id === 'opt-boxed' ? 'boxed' : 'full';
          selectLayout(t);
        }
      });
    });

    console.info('[Lab Guide] Week 11 · Session 1 — Loaded. Total steps:', TOTAL_STEPS);
  });

})();
