/**
 * Week11_Session2_Lab.js
 * Basic CSS Overrides in WordPress — ITC Web Client Programming
 *
 * 01. Constants & Phase Config
 * 02. localStorage Helpers
 * 03. Progress Rendering
 * 04. Checkbox Init & Handlers
 * 05. Phase Nav Highlighting
 * 06. Completion Banners & Session Overlay
 * 07. DevTools Mock Interactivity
 * 08. CSS Playground
 * 09. Code Copy Buttons
 * 10. Reset
 * 11. Init
 */
(function () {
  'use strict';

  /* ── 01. CONFIG ──────────────────────────────────────────── */
  const PFX = 'wk11s2_';

  const PHASES = {
    1: { total:8, barId:'p1-bar', countId:'p1-label', dotId:'dot-1', navCountId:'nav-count-1', bannerId:'banner-1' },
    2: { total:8, barId:'p2-bar', countId:'p2-label', dotId:'dot-2', navCountId:'nav-count-2', bannerId:'banner-2' },
    3: { total:6, barId:'p3-bar', countId:'p3-label', dotId:'dot-3', navCountId:'nav-count-3', bannerId:'banner-3' },
    4: { total:4, barId:'p4-bar', countId:'p4-label', dotId:'dot-4', navCountId:'nav-count-4', bannerId:'banner-4' },
  };
  const TOTAL = Object.values(PHASES).reduce((s,p) => s+p.total, 0);
  const phaseKeys = { 1:[], 2:[], 3:[], 4:[] };

  /* ── 02. LOCALSTORAGE ────────────────────────────────────── */
  const save = (k, v) => { try { v ? localStorage.setItem(PFX+k,'1') : localStorage.removeItem(PFX+k); } catch(e){} };
  const load = k => { try { return localStorage.getItem(PFX+k)==='1'; } catch(e){ return false; } };
  function clearAll() {
    try {
      const ks = [];
      for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(PFX))ks.push(k);}
      ks.forEach(k=>localStorage.removeItem(k));
    } catch(e){}
  }

  /* ── 03. PROGRESS ────────────────────────────────────────── */
  function countChecked(ph) {
    return phaseKeys[ph].filter(k => { const el=document.getElementById(k); return el&&el.checked; }).length;
  }
  function updateAllProgress() {
    let tot = 0;
    Object.keys(PHASES).forEach(n => {
      const ph = parseInt(n,10), cfg = PHASES[ph], done = countChecked(ph);
      tot += done;
      const pct = cfg.total>0 ? Math.round((done/cfg.total)*100) : 0;
      const bar = document.getElementById(cfg.barId); if(bar) bar.style.width = pct+'%';
      const lbl = document.getElementById(cfg.countId); if(lbl) lbl.textContent = done+' / '+cfg.total+' steps';
      const dot = document.getElementById(cfg.dotId);
      if(dot){ dot.className='phase-dot'; dot.classList.add(done===cfg.total&&cfg.total>0?'is-complete':done>0?'is-partial':''); }
      const nc = document.getElementById(cfg.navCountId); if(nc) nc.textContent = done+'/'+cfg.total;
      revealBanner(ph, done, cfg.total);
    });
    const opct = TOTAL>0 ? Math.round((tot/TOTAL)*100) : 0;
    const ob=document.getElementById('overall-bar'); if(ob) ob.style.width=opct+'%';
    const obt=document.getElementById('overall-bar-track'); if(obt) obt.setAttribute('aria-valuenow',opct);
    const oc=document.getElementById('overall-count'); if(oc) oc.textContent=tot+' / '+TOTAL+' steps';
    if(tot===TOTAL&&TOTAL>0) showSessionComplete();
  }

  /* ── 04. CHECKBOXES ──────────────────────────────────────── */
  function initCheckboxes() {
    document.querySelectorAll('.step-checkbox').forEach(cb => {
      const key=cb.dataset.key, phase=parseInt(cb.dataset.phase,10);
      if(!key||!phase) return;
      if(phaseKeys[phase]) phaseKeys[phase].push(key);
      cb.checked = load(key);
      cb.addEventListener('change', function(){ save(key,this.checked); updateAllProgress(); });
    });
  }

  /* ── 05. PHASE NAV ───────────────────────────────────────── */
  function initNavHighlighting() {
    const secs = document.querySelectorAll('.phase-section');
    if(!secs.length) return;
    const btns = document.querySelectorAll('.phase-nav-btn');
    new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting){ const ph=e.target.dataset.phase; btns.forEach(b=>b.classList.toggle('is-active',b.dataset.phase===ph)); } });
    }, { rootMargin:'-30% 0px -60% 0px', threshold:0 }).observe && secs.forEach(s=>new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){const ph=e.target.dataset.phase;btns.forEach(b=>b.classList.toggle('is-active',b.dataset.phase===ph));}});},{rootMargin:'-30% 0px -60% 0px',threshold:0}).observe(s));
  }

  /* ── 06. BANNERS & OVERLAY ───────────────────────────────── */
  function revealBanner(phase, done, total) {
    const b = document.getElementById('banner-'+phase);
    if(!b) return;
    if(done===total&&total>0&&b.hidden){ b.hidden=false; b.scrollIntoView({behavior:'smooth',block:'nearest'}); }
    else if(done<total) b.hidden=true;
  }
  function showSessionComplete() { const o=document.getElementById('session-complete'); if(o) o.hidden=false; }

  /* ── 07. DEVTOOLS MOCK ───────────────────────────────────── */

  // Switch DevTools tabs
  window.switchDtTab = function(btn, tab) {
    document.querySelectorAll('.dt-tab').forEach(t=>t.classList.remove('dt-tab-active'));
    btn.classList.add('dt-tab-active');
    ['elements','console','network'].forEach(t => {
      const el = document.getElementById('dt-'+t);
      if(el) el.hidden = (t!==tab);
    });
  };

  // Click element to "select" it in mock HTML panel
  window.selectElement = function() {
    const hint = document.querySelector('.dt-select-hint');
    if(hint){ hint.style.color='#FFE066'; hint.textContent=' ← class="entry-title" found!'; }
  };

  // Add test rule (+ button)
  window.addTestRule = function() {
    const rule = document.getElementById('test-rule');
    if(!rule) return;
    rule.hidden = false;
    // Apply initial color
    const picker = document.getElementById('test-color-picker');
    if(picker) applyTestColor(picker.value);
    const note = document.getElementById('dt-refresh-note');
    if(note) note.textContent = '⚠ These changes are temporary — refresh the page and they disappear!';
  };

  // Apply color from DevTools color picker to page preview
  window.applyTestColor = function(color) {
    const val = document.getElementById('test-color-val');
    if(val){ val.textContent=color; val.style.color=color; }
    // Change post titles in the mock page preview
    document.querySelectorAll('.pp-entry-title').forEach(el => el.style.color=color);
    // Show the "temporary" reminder
    const note = document.getElementById('dt-refresh-note');
    if(note && !note.textContent) note.textContent = '⚠ These changes are temporary — refresh to reset!';
  };

  /* ── 08. CSS PLAYGROUND ──────────────────────────────────── */

  const PLAYGROUND_DEFAULT = `/* Change blog post title color */
.entry-title a {
    color: #ff5722;
    text-transform: uppercase;
}

/* Change footer background */
.site-footer {
    background-color: #1a1a2e;
    color: #ffffff;
}`;

  // Apply playground CSS to the preview panel
  window.applyPlaygroundCSS = function(css) {
    const styleEl = document.getElementById('playground-style');
    if(!styleEl) return;

    // Scope the CSS to the playground preview by replacing element selectors
    // Map generic selectors to the playground preview classes
    let scoped = css
      .replace(/\.entry-title\s+a/g, '.pg-main h2 .entry-title-link')
      .replace(/\.site-footer/g, '.pg-footer')
      .replace(/\.entry-content\s+p/g, '.pg-excerpt')
      .replace(/\.ast-footer-copyright|\.site-info/g, '.pg-credit');

    styleEl.textContent = scoped;

    // Handle display:none on .pg-credit
    const pgCredit = document.getElementById('pg-credit');
    if(pgCredit){
      const hidden = css.includes('.ast-footer-copyright') && css.includes('display')&&css.includes('none');
      pgCredit.style.display = hidden ? 'none' : '';
    }
  };

  window.resetPlayground = function() {
    const ta = document.getElementById('css-playground');
    if(ta){ ta.value = PLAYGROUND_DEFAULT; applyPlaygroundCSS(PLAYGROUND_DEFAULT); }
  };

  /* ── 09. CODE COPY ───────────────────────────────────────── */
  window.copyCode = function(id) {
    const el = document.getElementById(id);
    if(!el) return;
    const text = el.textContent || el.innerText;
    navigator.clipboard.writeText(text.trim()).then(() => {
      // Visual feedback — briefly change button text
      const btn = el.parentElement?.querySelector('.cd-copy-btn');
      if(btn){ const orig=btn.textContent; btn.textContent='Copied!'; btn.style.background='#10B981'; btn.style.color='#000';
        setTimeout(()=>{ btn.textContent=orig; btn.style.background=''; btn.style.color=''; },1500); }
    }).catch(() => {
      // Fallback for older browsers
      const range = document.createRange(); range.selectNode(el);
      window.getSelection()?.removeAllRanges(); window.getSelection()?.addRange(range);
      document.execCommand('copy'); window.getSelection()?.removeAllRanges();
    });
  };

  /* ── 10. RESET ───────────────────────────────────────────── */
  window.resetProgress = function() {
    if(!confirm('Reset all progress? This will uncheck every step.')) return;
    clearAll();
    document.querySelectorAll('.step-checkbox').forEach(cb=>cb.checked=false);
    document.querySelectorAll('.phase-complete-banner').forEach(b=>b.hidden=true);
    const o=document.getElementById('session-complete'); if(o) o.hidden=true;
    // Reset DevTools mock
    document.querySelectorAll('.pp-entry-title').forEach(el=>el.style.color='');
    const tr=document.getElementById('test-rule'); if(tr) tr.hidden=true;
    const note=document.getElementById('dt-refresh-note'); if(note) note.textContent='';
    // Reset playground
    resetPlayground();
    updateAllProgress();
    window.scrollTo({top:0,behavior:'smooth'});
  };

  /* ── 11. INIT ────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initCheckboxes();
    updateAllProgress();
    initNavHighlighting();

    // Init playground CSS
    const ta = document.getElementById('css-playground');
    if(ta) applyPlaygroundCSS(ta.value);

    // Keyboard step labels
    document.querySelectorAll('.step-label').forEach(label => {
      label.setAttribute('tabindex','0'); label.setAttribute('role','checkbox');
      label.addEventListener('keydown', e => {
        if(e.key==='Enter'||e.key===' '){ e.preventDefault(); const cb=label.querySelector('.step-checkbox'); if(cb){cb.checked=!cb.checked;cb.dispatchEvent(new Event('change'));} }
      });
    });

    // Smooth phase-nav scroll
    document.querySelectorAll('.phase-nav-btn').forEach(link => {
      link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if(target){ e.preventDefault(); const navH=(document.getElementById('phase-nav')||{}).offsetHeight||0;
          window.scrollTo({top:target.getBoundingClientRect().top+window.scrollY-navH-12,behavior:'smooth'}); }
      });
    });

    console.info('[Lab Guide] Week 11 · Session 2 — Loaded. Total steps:', TOTAL);
  });
})();
