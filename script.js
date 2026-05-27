/* ================================================================
   script.js — Week 9 Session 2
   Interactive Step-by-Step Guide

   FEATURES:
     1. Click any checkbox → marks step done (green tick)
     2. Progress is saved in localStorage → survives page refresh
     3. Per-phase progress bar under each phase header
     4. Overall progress bar in the site header
     5. Completion banner appears when all audit items are ticked
     6. "Reset All" button (injected at the bottom) clears everything
================================================================ */

document.addEventListener("DOMContentLoaded", function () {

  /* ── 1. Collect all checkable items on the page ── */
  // Every .step-item and .audit-item that has a .step-check button
  var allSections = [
    { id: "phase0",  listSel: '[data-phase="phase0"]'  },
    { id: "phase1",  listSel: '[data-phase="phase1"]'  },
    { id: "phase2",  listSel: '[data-phase="phase2"]'  },
    { id: "phase3",  listSel: '[data-phase="phase3"]'  },
    { id: "audit",   listSel: '[data-phase="audit"]'   },
  ];

  var totalSteps = 0;   // cumulative across all sections

  /* ── 2. Initialise each section ── */
  allSections.forEach(function (sec) {
    var list = document.querySelector(sec.listSel);
    if (!list) return;

    var items = list.querySelectorAll(".step-item, .audit-item");
    totalSteps += items.length;

    // Inject a per-phase progress bar just before the list
    injectPhaseBar(list, sec.id, items.length);

    // Restore saved state
    restoreState(items, sec.id);

    // Attach click listeners
    items.forEach(function (item) {
      var btn = item.querySelector(".step-check");
      if (!btn) return;
      btn.addEventListener("click", function () {
        toggleItem(item, btn, sec.id, items);
        updateAll();
      });
    });
  });

  // Set the overall total count in the header
  document.getElementById("overall-total").textContent = totalSteps;

  // Run once on load to restore overall bar
  updateAll();

  /* ── 3. Inject a coloured progress bar before each list ── */
  function injectPhaseBar(list, secId, total) {
    var wrap = document.createElement("div");
    wrap.className = "phase-progress-wrap";
    wrap.innerHTML =
      '<div class="phase-progress-label">' +
        'Phase progress: <span id="pp-done-' + secId + '">0</span> / ' + total +
      '</div>' +
      '<div class="phase-track">' +
        '<div class="phase-fill" id="pp-fill-' + secId + '" style="width:0%"></div>' +
      '</div>';
    list.parentNode.insertBefore(wrap, list);
  }

  /* ── 4. Toggle a single step ── */
  function toggleItem(item, btn, secId, allItems) {
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

  /* ── 5. Save / restore localStorage ── */
  function saveState(items, key) {
    var states = [];
    items.forEach(function (item) {
      states.push(item.classList.contains("done"));
    });
    try { localStorage.setItem("wp-s2-" + key, JSON.stringify(states)); } catch(e){}
  }

  function restoreState(items, key) {
    try {
      var saved = localStorage.getItem("wp-s2-" + key);
      if (!saved) return;
      var states = JSON.parse(saved);
      items.forEach(function (item, idx) {
        if (states[idx]) {
          item.classList.add("done");
          var btn = item.querySelector(".step-check");
          if (btn) { btn.textContent = "✓"; }
        }
      });
    } catch(e) {}
  }

  /* ── 6. Update per-phase progress bar ── */
  function updatePhaseBar(secId, items) {
    var done  = Array.from(items).filter(function(i){ return i.classList.contains("done"); }).length;
    var total = items.length;
    var pct   = total ? Math.round(done / total * 100) : 0;

    var doneEl = document.getElementById("pp-done-" + secId);
    var fillEl = document.getElementById("pp-fill-" + secId);
    if (doneEl) doneEl.textContent = done;
    if (fillEl) fillEl.style.width = pct + "%";
  }

  /* ── 7. Update overall bar + completion banner ── */
  function updateAll() {
    var totalDone = 0;
    var auditItems = null;

    allSections.forEach(function (sec) {
      var list = document.querySelector(sec.listSel);
      if (!list) return;
      var items = list.querySelectorAll(".step-item, .audit-item");
      var done  = Array.from(items).filter(function(i){ return i.classList.contains("done"); }).length;
      totalDone += done;
      updatePhaseBar(sec.id, items);
      if (sec.id === "audit") auditItems = items;
    });

    // Overall bar
    var pct = totalSteps ? Math.round(totalDone / totalSteps * 100) : 0;
    document.getElementById("overall-done").textContent = totalDone;
    var fill = document.getElementById("overall-fill");
    if (fill) fill.style.width = pct + "%";

    // Session complete banner — show only when all AUDIT items are done
    var banner = document.getElementById("session-complete");
    if (banner && auditItems) {
      var auditDone = Array.from(auditItems).filter(function(i){ return i.classList.contains("done"); }).length;
      banner.style.display = (auditDone === auditItems.length) ? "block" : "none";
    }
  }

  /* ── 8. Inject a "Reset Progress" button at the bottom ── */
  var footer = document.querySelector(".site-footer");
  if (footer) {
    var resetBtn = document.createElement("button");
    resetBtn.textContent = "Reset All Progress";
    resetBtn.className   = "reset-btn";
    resetBtn.addEventListener("click", function () {
      if (!confirm("Clear all your saved progress and start from scratch?")) return;

      allSections.forEach(function (sec) {
        try { localStorage.removeItem("wp-s2-" + sec.id); } catch(e){}
        var list = document.querySelector(sec.listSel);
        if (!list) return;
        var items = list.querySelectorAll(".step-item, .audit-item");
        items.forEach(function (item) {
          item.classList.remove("done");
          var btn = item.querySelector(".step-check");
          if (btn) { btn.textContent = "☐"; btn.setAttribute("aria-label", "Mark complete"); }
        });
      });
      updateAll();
    });
    footer.appendChild(resetBtn);
  }

});
