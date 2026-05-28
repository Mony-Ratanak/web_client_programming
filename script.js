/* ================================================================
   script.js — Week 9 Session 3
   Interactive Step-by-Step Guide

   FEATURES:
     1. Click any checkbox → marks it done with a green tick
     2. Progress saved in localStorage → survives page refresh
     3. Per-phase progress bar below each phase header
     4. Overall progress bar in the site header
     5. Session Complete banner when all audit items are ticked
     6. Reset All button at the footer
================================================================ */

document.addEventListener("DOMContentLoaded", function () {

  /* ─── Section definitions — must match data-phase attributes ─── */
  var sections = [
    { id: "prereq",  sel: '[data-phase="prereq"]'  },
    { id: "phase1",  sel: '[data-phase="phase1"]'   },
    { id: "phase1b", sel: '[data-phase="phase1b"]'  },
    { id: "phase2a", sel: '[data-phase="phase2a"]'  },
    { id: "phase2b", sel: '[data-phase="phase2b"]'  },
    { id: "phase3",  sel: '[data-phase="phase3"]'   },
    { id: "phase4",  sel: '[data-phase="phase4"]'   },
  ];

  var totalSteps = 0;

  /* ─── Initialise every section ─── */
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

  /* Set the denominator in the overall bar */
  var totalEl = document.getElementById("overall-total");
  if (totalEl) totalEl.textContent = totalSteps;

  /* Render the current saved state on first load */
  updateAll();


  /* ─── Inject a thin progress bar before each step list ─── */
  function injectPhaseBar(list, id, total) {
    var wrap = document.createElement("div");
    wrap.className = "phase-progress-wrap";
    wrap.innerHTML =
      '<div class="phase-progress-label">' +
        'Phase progress: <span id="pp-n-' + id + '">0</span> / ' + total +
      '</div>' +
      '<div class="phase-track">' +
        '<div class="phase-fill" id="pp-f-' + id + '" style="width:0%"></div>' +
      '</div>';
    list.parentNode.insertBefore(wrap, list);
  }


  /* ─── Toggle a single item's done state ─── */
  function toggle(item, btn, secId, allItems) {
    var wasDone = item.classList.contains("done");
    if (wasDone) {
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


  /* ─── Save & restore from localStorage ─── */
  function saveState(items, key) {
    var arr = Array.from(items).map(function (i) {
      return i.classList.contains("done");
    });
    try { localStorage.setItem("wp-s3-" + key, JSON.stringify(arr)); } catch (e) {}
  }

  function restoreState(items, key) {
    try {
      var raw = localStorage.getItem("wp-s3-" + key);
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


  /* ─── Update a single phase's progress bar ─── */
  function updatePhaseBar(secId, items) {
    var done  = Array.from(items).filter(function (i) { return i.classList.contains("done"); }).length;
    var total = items.length;
    var pct   = total ? Math.round(done / total * 100) : 0;
    var n = document.getElementById("pp-n-" + secId);
    var f = document.getElementById("pp-f-" + secId);
    if (n) n.textContent  = done;
    if (f) f.style.width  = pct + "%";
  }


  /* ─── Update overall bar and session-complete banner ─── */
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
      if (sec.id === "phase4") auditItems = items;
    });

    /* Overall bar */
    var pct  = totalSteps ? Math.round(totalDone / totalSteps * 100) : 0;
    var doneEl = document.getElementById("overall-done");
    var fillEl = document.getElementById("overall-fill");
    if (doneEl) doneEl.textContent = totalDone;
    if (fillEl) fillEl.style.width = pct + "%";

    /* Completion banner — only when ALL audit (phase4) items done */
    var banner = document.getElementById("session-complete");
    if (banner && auditItems) {
      var auditDone = Array.from(auditItems).filter(function (i) { return i.classList.contains("done"); }).length;
      banner.style.display = (auditDone === auditItems.length && auditItems.length > 0) ? "block" : "none";
    }
  }


  /* ─── Inject a Reset button at the footer ─── */
  var footer = document.querySelector(".site-footer");
  if (footer) {
    var btn = document.createElement("button");
    btn.textContent = "Reset All Progress";
    btn.className   = "reset-btn";
    btn.addEventListener("click", function () {
      if (!confirm("Clear all saved progress and start from scratch?")) return;
      sections.forEach(function (sec) {
        try { localStorage.removeItem("wp-s3-" + sec.id); } catch (e) {}
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
