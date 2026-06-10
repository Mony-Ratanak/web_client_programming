/**
 * Week10_Session3_Lab.js
 * Web Client Programming — ITC
 * Week 10 · Session 3: SEO Plugins & Custom Menus
 *
 * TABLE OF CONTENTS
 * ─────────────────
 * 01. Constants & State
 * 02. localStorage Helpers
 * 03. Progress Calculation & Rendering
 * 04. Checkbox Initialisation & Handlers
 * 05. Phase Navigation Highlighting
 * 06. Completion Banners & Session Complete Overlay
 * 07. Yoast Mock Panel Interactivity
 * 08. Reset
 * 09. Initialisation (DOMContentLoaded)
 */

(function () {
  'use strict';

  /* ================================================================
     01. CONSTANTS & STATE
     ================================================================ */

  const STORAGE_PREFIX = 'wk10s3_';

  /**
   * Phase definitions.
   * total: number of checkboxes in that phase (must match HTML).
   */
  const PHASES = {
    1: { total: 10, label: 'p1',  barId: 'p1-bar',  countId: 'p1-label',  dotId: 'dot-1', navCountId: 'nav-count-1', bannerId: 'banner-1' },
    2: { total: 8,  label: 'p2',  barId: 'p2-bar',  countId: 'p2-label',  dotId: 'dot-2', navCountId: 'nav-count-2', bannerId: 'banner-2' },
    3: { total: 10, label: 'p3',  barId: 'p3-bar',  countId: 'p3-label',  dotId: 'dot-3', navCountId: 'nav-count-3', bannerId: 'banner-3' },
    4: { total: 4,  label: 'p4',  barId: 'p4-bar',  countId: 'p4-label',  dotId: 'dot-4', navCountId: 'nav-count-4', bannerId: 'banner-4' },
  };

  const TOTAL_STEPS = Object.values(PHASES).reduce((sum, p) => sum + p.total, 0);

  /** All checkbox keys grouped by phase — derived from DOM, populated on init */
  const phaseKeys = { 1: [], 2: [], 3: [], 4: [] };


  /* ================================================================
     02. LOCALSTORAGE HELPERS
     ================================================================ */

  /**
   * Save a single checkbox state.
   * @param {string} key   - data-key attribute value (e.g. "cb-s1-1")
   * @param {boolean} checked
   */
  function saveState(key, checked) {
    try {
      if (checked) {
        localStorage.setItem(STORAGE_PREFIX + key, '1');
      } else {
        localStorage.removeItem(STORAGE_PREFIX + key);
      }
    } catch (e) {
      /* localStorage unavailable — silently continue */
    }
  }

  /**
   * Load a single checkbox state.
   * @param {string} key
   * @returns {boolean}
   */
  function loadState(key) {
    try {
      return localStorage.getItem(STORAGE_PREFIX + key) === '1';
    } catch (e) {
      return false;
    }
  }

  /**
   * Clear all progress from localStorage.
   */
  function clearAllState() {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(STORAGE_PREFIX)) keysToRemove.push(k);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) { /* ignore */ }
  }


  /* ================================================================
     03. PROGRESS CALCULATION & RENDERING
     ================================================================ */

  /**
   * Count checked checkboxes for a given phase.
   * @param {number} phase
   * @returns {number}
   */
  function countChecked(phase) {
    return phaseKeys[phase].filter(key => {
      const el = document.getElementById(key);
      return el && el.checked;
    }).length;
  }

  /**
   * Update all progress bars, counts, nav dots, and labels.
   * Called after every checkbox change.
   */
  function updateAllProgress() {
    let totalChecked = 0;

    Object.keys(PHASES).forEach(phaseNum => {
      const n    = parseInt(phaseNum, 10);
      const cfg  = PHASES[n];
      const done = countChecked(n);
      totalChecked += done;

      const pct = cfg.total > 0 ? Math.round((done / cfg.total) * 100) : 0;

      /* Phase progress bar */
      const bar = document.getElementById(cfg.barId);
      if (bar) bar.style.width = pct + '%';

      /* Phase step counter label */
      const lbl = document.getElementById(cfg.countId);
      if (lbl) lbl.textContent = done + ' / ' + cfg.total + ' steps';

      /* Navigation dot colour */
      const dot = document.getElementById(cfg.dotId);
      if (dot) {
        dot.className = 'phase-dot';
        if (done === cfg.total && cfg.total > 0) {
          dot.classList.add('is-complete');
        } else if (done > 0) {
          dot.classList.add('is-partial');
        }
      }

      /* Navigation count badge */
      const navCount = document.getElementById(cfg.navCountId);
      if (navCount) navCount.textContent = done + '/' + cfg.total;

      /* Show/hide phase completion banner */
      revealBanner(n, done, cfg.total);
    });

    /* Overall progress bar */
    const overallPct = TOTAL_STEPS > 0 ? Math.round((totalChecked / TOTAL_STEPS) * 100) : 0;
    const overallBar = document.getElementById('overall-bar');
    if (overallBar) overallBar.style.width = overallPct + '%';

    const overallBarTrack = document.getElementById('overall-bar-track');
    if (overallBarTrack) overallBarTrack.setAttribute('aria-valuenow', overallPct);

    const overallCount = document.getElementById('overall-count');
    if (overallCount) overallCount.textContent = totalChecked + ' / ' + TOTAL_STEPS + ' steps';

    /* Show session complete overlay when everything is done */
    if (totalChecked === TOTAL_STEPS && TOTAL_STEPS > 0) {
      showSessionComplete();
    }
  }


  /* ================================================================
     04. CHECKBOX INITIALISATION & HANDLERS
     ================================================================ */

  /**
   * Find all step checkboxes, group by phase, restore saved states,
   * and attach change handlers.
   */
  function initCheckboxes() {
    const checkboxes = document.querySelectorAll('.step-checkbox');

    checkboxes.forEach(cb => {
      const key   = cb.dataset.key;
      const phase = parseInt(cb.dataset.phase, 10);

      if (!key || !phase) return;

      /* Register key in phaseKeys map */
      if (phaseKeys[phase]) phaseKeys[phase].push(key);

      /* Restore saved state */
      cb.checked = loadState(key);

      /* Change handler */
      cb.addEventListener('change', function () {
        saveState(key, this.checked);
        updateAllProgress();
        /* Animate the step row */
        const stepItem = this.closest('.step-item');
        if (stepItem) {
          stepItem.classList.toggle('is-checked', this.checked);
        }
      });
    });
  }


  /* ================================================================
     05. PHASE NAVIGATION HIGHLIGHTING
     ================================================================ */

  /**
   * Highlight the active phase in the sticky nav as the user scrolls.
   * Uses IntersectionObserver for performance.
   */
  function initNavHighlighting() {
    const sections = document.querySelectorAll('.phase-section');
    if (!sections.length) return;

    const navButtons = document.querySelectorAll('.phase-nav-btn');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const phase = entry.target.dataset.phase;
          navButtons.forEach(btn => {
            btn.classList.toggle('is-active', btn.dataset.phase === phase);
          });
        }
      });
    }, {
      rootMargin: '-30% 0px -60% 0px',   /* fire when section is ~30% into view */
      threshold: 0
    });

    sections.forEach(sec => observer.observe(sec));
  }


  /* ================================================================
     06. COMPLETION BANNERS & SESSION COMPLETE OVERLAY
     ================================================================ */

  /**
   * Show or hide a phase's completion banner.
   * @param {number} phase
   * @param {number} done
   * @param {number} total
   */
  function revealBanner(phase, done, total) {
    const banner = document.getElementById('banner-' + phase);
    if (!banner) return;

    const shouldShow = done === total && total > 0;
    if (shouldShow && banner.hidden) {
      banner.hidden = false;
      banner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (!shouldShow) {
      banner.hidden = true;
    }
  }

  /**
   * Display the session-complete overlay.
   * Only shows once per session (tracked in localStorage).
   */
  function showSessionComplete() {
    const overlay = document.getElementById('session-complete');
    if (overlay) overlay.hidden = false;
  }

  /** Close the session-complete overlay (called from inline handler). */
  window.closeSessionComplete = function () {
    const overlay = document.getElementById('session-complete');
    if (overlay) overlay.hidden = true;
  };


  /* ================================================================
     07. YOAST MOCK PANEL INTERACTIVITY
     ================================================================ */

  /**
   * Toggle the snippet edit area open / closed.
   * Called from onclick="toggleSnippetEdit()" in HTML.
   */
  window.toggleSnippetEdit = function () {
    const editArea = document.getElementById('snippet-edit-area');
    const btn      = document.getElementById('edit-snippet-btn');
    if (!editArea || !btn) return;

    const isOpen = !editArea.hidden;
    editArea.hidden = isOpen;
    btn.setAttribute('aria-expanded', String(!isOpen));
    btn.textContent = isOpen ? 'Edit snippet ▼' : 'Close snippet ▲';

    if (!isOpen) {
      /* Initialise the meters on first open */
      const descField = document.getElementById('mock-meta-desc');
      if (descField) updateMockDesc(descField.value);
      const titleField = document.getElementById('mock-seo-title');
      if (titleField) updateMockTitle(titleField.value);
    }
  };

  /**
   * Live-update the snippet preview title from the SEO title field.
   * Called from oninput on #mock-seo-title.
   * @param {string} value
   */
  window.updateMockTitle = function (value) {
    const mockTitle = document.getElementById('mock-title');
    if (mockTitle) {
      mockTitle.textContent = value.trim() || '(No title entered)';
    }
  };

  /**
   * Live-update the snippet preview description AND the character-count
   * meter from the meta description textarea.
   * Called from oninput on #mock-meta-desc.
   * @param {string} value
   */
  window.updateMockDesc = function (value) {
    /* Update snippet preview */
    const mockDesc = document.getElementById('mock-desc');
    if (mockDesc) {
      mockDesc.textContent = value.trim() || '(No description entered)';
    }

    /* Update character count */
    const len       = value.length;
    const MAX_DESC  = 156;
    const MIN_IDEAL = 120;

    const charCount = document.getElementById('desc-char-count');
    if (charCount) charCount.textContent = len + ' / ' + MAX_DESC;

    /* Update progress meter */
    const fill = document.getElementById('desc-meter-fill');
    const hint = document.getElementById('desc-meter-hint');
    if (!fill) return;

    const pct = Math.min(Math.round((len / MAX_DESC) * 100), 100);
    fill.style.width = pct + '%';

    if (len === 0) {
      fill.style.background = '#CBD5E1';
      if (hint) hint.innerHTML = 'Aim for <strong>120–156 characters</strong> — the bar turns <strong style="color:#16A34A">green</strong> when ideal.';
    } else if (len < 60) {
      fill.style.background = '#DC2626';   /* red — too short */
      if (hint) hint.innerHTML = `<span style="color:#DC2626">Too short (${len} chars)</span> — add more detail.`;
    } else if (len < MIN_IDEAL) {
      fill.style.background = '#E09000';   /* orange — getting there */
      if (hint) hint.innerHTML = `<span style="color:#E09000">Getting there (${len} chars)</span> — aim for 120+.`;
    } else if (len <= MAX_DESC) {
      fill.style.background = '#16A34A';   /* green — ideal */
      if (hint) hint.innerHTML = `<span style="color:#16A34A">✅ Perfect length (${len} chars)</span> — Google will use this description.`;
    } else {
      fill.style.background = '#DC2626';   /* red — too long */
      if (hint) hint.innerHTML = `<span style="color:#DC2626">Too long (${len} chars)</span> — Google will cut off after ${MAX_DESC} characters.`;
    }
  };

  /**
   * Switch between "SEO" and "Readability" tabs in the mock panel.
   * Called from onclick on each tab button.
   * @param {'seo'|'readability'} tab
   */
  window.switchYoastTab = function (tab) {
    const tabs = document.querySelectorAll('.yoast-tab');
    tabs.forEach(t => {
      const isTarget = t.id === 'tab-' + tab;
      t.classList.toggle('yoast-tab--active', isTarget);
      t.setAttribute('aria-selected', String(isTarget));
    });
    /* (only SEO body exists in this mock — readability tab is decorative) */
  };


  /* ================================================================
     08. RESET
     ================================================================ */

  /**
   * Reset all progress: uncheck every checkbox, clear localStorage,
   * hide banners & overlay, reset progress bars.
   * Called from onclick="resetProgress()" in HTML.
   */
  window.resetProgress = function () {
    if (!confirm('Reset all progress? This will uncheck every step.')) return;

    clearAllState();

    document.querySelectorAll('.step-checkbox').forEach(cb => {
      cb.checked = false;
      const stepItem = cb.closest('.step-item');
      if (stepItem) stepItem.classList.remove('is-checked');
    });

    /* Hide all banners */
    document.querySelectorAll('.phase-complete-banner').forEach(b => {
      b.hidden = true;
    });

    /* Hide session complete overlay */
    const overlay = document.getElementById('session-complete');
    if (overlay) overlay.hidden = true;

    /* Re-render all progress */
    updateAllProgress();

    /* Scroll back to top */
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  /* ================================================================
     09. INITIALISATION
     ================================================================ */

  document.addEventListener('DOMContentLoaded', function () {

    /* 1. Register checkboxes, restore saved states */
    initCheckboxes();

    /* 2. Render progress bars & counts from restored state */
    updateAllProgress();

    /* 3. Initialise Yoast mock description meter with default text */
    (function initYoastMock() {
      const descField = document.getElementById('mock-meta-desc');
      if (descField) updateMockDesc(descField.value);
    })();

    /* 4. Set up scroll-based nav highlighting */
    initNavHighlighting();

    /* 5. Keyboard accessibility — allow Enter/Space on step labels */
    document.querySelectorAll('.step-label').forEach(label => {
      label.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const cb = this.querySelector('.step-checkbox');
          if (cb) { cb.checked = !cb.checked; cb.dispatchEvent(new Event('change')); }
        }
      });
      label.setAttribute('tabindex', '0');
      label.setAttribute('role', 'checkbox');
    });

    /* 6. Smooth-scroll for phase nav anchor links (progressive enhancement) */
    document.querySelectorAll('.phase-nav-btn').forEach(link => {
      link.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          /* Account for sticky nav height */
          const navH = document.getElementById('phase-nav')
            ? document.getElementById('phase-nav').offsetHeight : 0;
          const top  = target.getBoundingClientRect().top + window.scrollY - navH - 12;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });

    console.info('[Lab Guide] Week 10 · Session 3 — Loaded. Total steps: ' + TOTAL_STEPS);
  });

})(); /* end IIFE */
