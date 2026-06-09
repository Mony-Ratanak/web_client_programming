/* ================================================================
   script.js — Week 10 Session 2
   Plugins & Contact Forms — Step-by-Step Lab Guide

   FEATURES:
   1. Click any checkbox → marks step done (green tick)
   2. Progress saved in localStorage → survives page refresh
   3. Per-phase progress bar below each phase header
   4. Overall gold progress bar in the site header
   5. Session Complete banner when all audit items ticked
   6. Reset All button injected at the footer
================================================================ */

document.addEventListener("DOMContentLoaded", function () {

  /* ── Section definitions — match data-phase attributes ── */
  var sections = [
    { id:"prereq",   sel:'[data-phase="prereq"]'  },
    { id:"phase1",   sel:'[data-phase="phase1"]'  },
    { id:"phase2a",  sel:'[data-phase="phase2a"]' },
    { id:"phase2b",  sel:'[data-phase="phase2b"]' },
    { id:"phase3",   sel:'[data-phase="phase3"]'  },
    { id:"phase3t",  sel:'[data-phase="phase3t"]' },
    { id:"phase4",   sel:'[data-phase="phase4"]'  },
    { id:"audit",    sel:'[data-phase="audit"]'   },
  ];

  var totalSteps = 0;

  /* ── Initialise every section ── */
  sections.forEach(function (sec) {
    var list = document.querySelector(sec.sel);
    if (!list) return;
    var items = list.querySelectorAll(".step-item, .audit-item");
    totalSteps += items.length;
    injectPhaseBar(list, sec.id, items.length);
    restoreState(items, sec.id);
    items.forEach(function (item) {
      var btn = item.querySelector(".step-check");
      if (!btn) return;
      btn.addEventListener("click", function () {
        toggle(item, btn, sec.id, items);
        updateAll();
      });
    });
  });

  var totalEl = document.getElementById("overall-total");
  if (totalEl) totalEl.textContent = totalSteps;
  updateAll();

  /* ── Inject per-phase progress bar ── */
  function injectPhaseBar(list, id, total) {
    var wrap = document.createElement("div");
    wrap.className = "phase-progress-wrap";
    wrap.innerHTML =
      '<div class="phase-progress-label">Phase progress: <span id="ppn-' + id + '">0</span> / ' + total + '</div>' +
      '<div class="phase-track"><div class="phase-fill" id="ppf-' + id + '" style="width:0%"></div></div>';
    list.parentNode.insertBefore(wrap, list);
  }

  /* ── Toggle one item ── */
  function toggle(item, btn, secId, allItems) {
    var done = item.classList.contains("done");
    if (done) {
      item.classList.remove("done");
      btn.textContent = "☐";
      btn.setAttribute("aria-label", "Mark complete");
    } else {
      item.classList.add("done");
      btn.textContent = "✓";
      btn.setAttribute("aria-label", "Unmark step");
    }
    saveState(allItems, secId);
    updatePhaseBar(secId, allItems);
  }

  /* ── Save / restore localStorage ── */
  function saveState(items, key) {
    var arr = Array.from(items).map(function (i) { return i.classList.contains("done"); });
    try { localStorage.setItem("w10s2-" + key, JSON.stringify(arr)); } catch (e) {}
  }

  function restoreState(items, key) {
    try {
      var raw = localStorage.getItem("w10s2-" + key);
      if (!raw) return;
      var arr = JSON.parse(raw);
      items.forEach(function (item, idx) {
        if (arr[idx]) {
          item.classList.add("done");
          var btn = item.querySelector(".step-check");
          if (btn) btn.textContent = "✓";
        }
      });
    } catch (e) {}
  }

  /* ── Update one phase bar ── */
  function updatePhaseBar(secId, items) {
    var done  = Array.from(items).filter(function (i) { return i.classList.contains("done"); }).length;
    var total = items.length;
    var pct   = total ? Math.round(done / total * 100) : 0;
    var n = document.getElementById("ppn-" + secId);
    var f = document.getElementById("ppf-" + secId);
    if (n) n.textContent = done;
    if (f) f.style.width = pct + "%";
  }

  /* ── Update overall bar + session-complete banner ── */
  function updateAll() {
    var totalDone  = 0;
    var auditItems = null;
    sections.forEach(function (sec) {
      var list = document.querySelector(sec.sel);
      if (!list) return;
      var items = list.querySelectorAll(".step-item, .audit-item");
      var done  = Array.from(items).filter(function (i) { return i.classList.contains("done"); }).length;
      totalDone += done;
      updatePhaseBar(sec.id, items);
      if (sec.id === "audit") auditItems = items;
    });
    var pct    = totalSteps ? Math.round(totalDone / totalSteps * 100) : 0;
    var doneEl = document.getElementById("overall-done");
    var fillEl = document.getElementById("overall-fill");
    if (doneEl) doneEl.textContent = totalDone;
    if (fillEl) fillEl.style.width = pct + "%";
    var banner = document.getElementById("session-complete");
    if (banner && auditItems) {
      var auditDone = Array.from(auditItems).filter(function (i) { return i.classList.contains("done"); }).length;
      banner.style.display = (auditDone === auditItems.length && auditItems.length > 0) ? "block" : "none";
    }
  }

  /* ── Inject Reset button at footer ── */
  var footer = document.querySelector(".site-footer");
  if (footer) {
    var btn = document.createElement("button");
    btn.textContent = "Reset All Progress";
    btn.className   = "reset-btn";
    btn.addEventListener("click", function () {
      if (!confirm("Clear all saved progress and start from scratch?")) return;
      sections.forEach(function (sec) {
        try { localStorage.removeItem("w10s2-" + sec.id); } catch (e) {}
        var list = document.querySelector(sec.sel);
        if (!list) return;
        list.querySelectorAll(".step-item, .audit-item").forEach(function (item) {
          item.classList.remove("done");
          var b = item.querySelector(".step-check");
          if (b) { b.textContent = "☐"; b.setAttribute("aria-label", "Mark complete"); }
        });
      });
      updateAll();
    });
    footer.appendChild(btn);
  }

});
