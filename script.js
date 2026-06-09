/* ================================================================
   script.js — Week 10 Session 2
   Interactive Demo: Plugins & Contact Forms

   SECTIONS:
     1. Phase 1 — Theme Switcher
     2. Phase 1 — Plugin Install Simulator
     3. Phase 1 — Security Source Checker
     4. Phase 2 — Form Builder Field Toggles
     5. Phase 2 — Contact Form Validation
     6. Phase 2 — Star Rating
     7. Phase 3 — Shortcode Renderer
     8. Phase 3 — Shortcode Example Loader
     9. Phase 4 — Brute-Force Attack Simulator
    10. Phase 4 — LLA Settings Save
================================================================ */


/* ================================================================
   1. PHASE 1 — THEME SWITCHER

   switchTheme(name) — applies a CSS class to the site-preview div
   which changes all nested colours/fonts via cascading CSS rules.
   This demonstrates that the content (posts) never changes,
   only the visual presentation does.
================================================================ */

function switchTheme(name) {
  var preview = document.getElementById("site-preview");
  // Remove any existing theme class
  preview.className = "site-preview theme-" + name;

  // Update active button state
  document.querySelectorAll(".theme-btn").forEach(function (btn) {
    btn.classList.toggle("active", btn.dataset.theme === name);
  });
}

// Apply default theme on page load
document.addEventListener("DOMContentLoaded", function () {
  switchTheme("default");
});


/* ================================================================
   2. PHASE 1 — PLUGIN INSTALL SIMULATOR

   simulateInstall() — animates the WPForms menu item appearing
   in the mock WordPress sidebar, demonstrating what happens
   when you install and activate a plugin.
================================================================ */

function simulateInstall() {
  var btn  = document.getElementById("install-btn");
  var item = document.getElementById("wpforms-menu-item");
  var result = document.getElementById("install-result");

  // Disable button while animating
  btn.textContent = "Installing... ⏳";
  btn.style.opacity = "0.7";
  btn.disabled = true;

  // Step 1: Show downloading
  setTimeout(function () {
    btn.textContent = "Activating... ✓";
  }, 800);

  // Step 2: Show the new menu item
  setTimeout(function () {
    item.classList.remove("hidden");
    item.style.animation = "slideIn 0.4s ease";
    btn.textContent = "✅ Activated!";
    btn.classList.add("done");
    result.style.display = "block";
  }, 1600);
}

/* CSS animation for the new menu item appearing */
var menuStyle = document.createElement("style");
menuStyle.textContent = "@keyframes slideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }";
document.head.appendChild(menuStyle);


/* ================================================================
   3. PHASE 1 — SECURITY SOURCE CHECKER

   checkSource(type) — shows a result message and optionally
   reveals the hidden malware PHP code example.
================================================================ */

function checkSource(type) {
  var resultEl  = document.getElementById("security-result");
  var malwareEl = document.getElementById("malware-reveal");

  // Reset previous state
  resultEl.className = "security-result";
  malwareEl.classList.add("hidden");

  if (type === "official") {
    resultEl.className = "security-result sr-good";
    resultEl.textContent = "✅ SAFE — The WordPress.org repository reviews all plugins before listing them. All 60,000+ plugins are scanned for malware. Always install this way.";
  } else {
    resultEl.className = "security-result sr-bad";
    var messages = {
      google:   "❌ DANGEROUS — Random blog posts and websites offering 'free premium plugins' almost always bundle malware. Never trust these.",
      telegram: "❌ DANGEROUS — Telegram groups sharing plugin ZIP files are a very common malware distribution channel. These files are not reviewed by anyone.",
      pirate:   "❌ DANGEROUS — 'Nulled' or 'cracked' plugins are premium plugins with the license check removed — and hidden malware added. See the code below for proof."
    };
    resultEl.textContent = messages[type];

    // Show the malware code example for the pirate choice
    if (type === "pirate") {
      malwareEl.classList.remove("hidden");
    }
  }
}


/* ================================================================
   4. PHASE 2 — FORM BUILDER FIELD TOGGLES

   toggleField(fieldName, checkbox) — shows or hides form fields
   in the live preview based on checkbox state.
   Also updates the shortcode preview text dynamically.
================================================================ */

function toggleField(fieldName, checkbox) {
  var fieldEl = document.getElementById("field-" + fieldName);
  if (!fieldEl) return;

  if (checkbox.checked) {
    fieldEl.classList.remove("hidden");
    // Update parent label styling
    checkbox.closest(".field-toggle").classList.add("ft-on");
  } else {
    fieldEl.classList.add("hidden");
    checkbox.closest(".field-toggle").classList.remove("ft-on");
    // Clear error when field is hidden
    var errEl = document.getElementById("err-" + fieldName);
    if (errEl) errEl.textContent = "";
  }

  // Update shortcode preview to reflect active fields
  updateShortcodePreview();
}

function updateShortcodePreview() {
  // Count how many fields are visible
  var count = document.querySelectorAll(".wf-field:not(.hidden)").length;
  var scEl  = document.getElementById("shortcode-preview");
  if (scEl) {
    scEl.textContent = '[wpforms id="1" title="false" fields="' + count + '"]';
  }
}


/* ================================================================
   5. PHASE 2 — CONTACT FORM VALIDATION

   submitForm(e) — validates all visible required fields.
   Shows red error messages under each failing field — exactly
   the same way WPForms works in real WordPress.
   On success, hides the form and shows a success message.
================================================================ */

function submitForm(e) {
  e.preventDefault();
  var valid = true;

  // ── Validate Name ──
  var name  = document.getElementById("input-name");
  var errN  = document.getElementById("err-name");
  if (name && !name.closest(".wf-field").classList.contains("hidden")) {
    if (!name.value.trim()) {
      showError(name, errN, "This field is required.");
      valid = false;
    } else {
      clearError(name, errN);
    }
  }

  // ── Validate Email ──
  var email = document.getElementById("input-email");
  var errE  = document.getElementById("err-email");
  if (email && !email.closest(".wf-field").classList.contains("hidden")) {
    if (!email.value.trim()) {
      showError(email, errE, "This field is required.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showError(email, errE, "Please enter a valid email address.");
      valid = false;
    } else {
      clearError(email, errE);
    }
  }

  // ── Validate Subject dropdown (if visible) ──
  var subjectField = document.getElementById("field-subject");
  if (subjectField && !subjectField.classList.contains("hidden")) {
    var subject = document.getElementById("input-subject");
    var errS    = document.getElementById("err-subject");
    if (!subject.value) {
      showError(subject, errS, "Please select a subject.");
      valid = false;
    } else {
      clearError(subject, errS);
    }
  }

  // ── Validate Message ──
  var msg   = document.getElementById("input-message");
  var errM  = document.getElementById("err-message");
  if (msg && !msg.closest(".wf-field").classList.contains("hidden")) {
    if (!msg.value.trim()) {
      showError(msg, errM, "This field is required.");
      valid = false;
    } else if (msg.value.trim().length < 10) {
      showError(msg, errM, "Please enter at least 10 characters.");
      valid = false;
    } else {
      clearError(msg, errM);
    }
  }

  // ── If valid: show success ──
  if (valid) {
    document.getElementById("contact-form-preview").style.display = "none";
    document.getElementById("form-success").classList.remove("hidden");
  }
}

function showError(inputEl, errEl, message) {
  inputEl.classList.add("error");
  errEl.textContent = message;
}

function clearError(inputEl, errEl) {
  inputEl.classList.remove("error");
  errEl.textContent = "";
}

function resetForm() {
  // Clear all inputs
  document.getElementById("contact-form-preview").reset();
  // Remove all error states
  document.querySelectorAll(".wf-input, .wf-select, .wf-textarea").forEach(function (el) {
    el.classList.remove("error");
  });
  document.querySelectorAll(".wf-error").forEach(function (el) {
    el.textContent = "";
  });
  // Reset stars
  setRating(0);
  // Show form, hide success
  document.getElementById("contact-form-preview").style.display = "flex";
  document.getElementById("form-success").classList.add("hidden");
}


/* ================================================================
   6. PHASE 2 — STAR RATING

   setRating(val) — lights up stars 1 through val,
   stores value in hidden input, used with WPForms rating field.
================================================================ */

function setRating(val) {
  document.getElementById("input-rating").value = val;
  document.querySelectorAll(".star").forEach(function (star) {
    star.classList.toggle("lit", parseInt(star.dataset.val) <= val);
  });
}


/* ================================================================
   7. PHASE 3 — SHORTCODE RENDERER

   renderShortcode() — reads the shortcode text from the input
   and renders a simulated form output in the output area below.
   This shows students how shortcodes get "replaced" by PHP output.
================================================================ */

function renderShortcode() {
  var input  = document.getElementById("shortcode-input").value.trim();
  var output = document.getElementById("so-content");

  // Parse the shortcode name (the word after the opening bracket)
  var match = input.match(/^\[([a-zA-Z0-9_-]+)/);
  if (!match) {
    output.innerHTML = '<span style="color:var(--red);">⚠️ Invalid shortcode — shortcodes must start with [ and contain only letters, numbers, or hyphens.</span>';
    return;
  }

  var name = match[1].toLowerCase();

  // Generate appropriate mock output for each recognised shortcode
  var rendered = "";

  if (name === "wpforms" || name === "contact-form-7") {
    // Render a mini version of the contact form
    rendered = '<div style="font-size:.85rem;color:var(--text-md);margin-bottom:.6rem;">📋 WPForms rendered your contact form:</div>' +
      '<div style="display:flex;flex-direction:column;gap:.6rem;">' +
        '<div><label style="font-size:.8rem;font-weight:700;display:block;margin-bottom:.25rem;">Full Name *</label><input style="width:100%;padding:.45rem .7rem;border:1.5px solid #e2e8f0;border-radius:5px;font-size:.88rem;" placeholder="e.g. Sokha Mony" readonly></div>' +
        '<div><label style="font-size:.8rem;font-weight:700;display:block;margin-bottom:.25rem;">Email Address *</label><input type="email" style="width:100%;padding:.45rem .7rem;border:1.5px solid #e2e8f0;border-radius:5px;font-size:.88rem;" placeholder="e.g. sokha@example.com" readonly></div>' +
        '<div><label style="font-size:.8rem;font-weight:700;display:block;margin-bottom:.25rem;">Subject *</label><select style="width:100%;padding:.45rem .7rem;border:1.5px solid #e2e8f0;border-radius:5px;font-size:.88rem;" disabled><option>— Select a subject —</option><option>General Inquiry</option><option>Support</option><option>Sales</option></select></div>' +
        '<div><label style="font-size:.8rem;font-weight:700;display:block;margin-bottom:.25rem;">Message *</label><textarea rows="3" style="width:100%;padding:.45rem .7rem;border:1.5px solid #e2e8f0;border-radius:5px;font-size:.88rem;resize:none;" placeholder="Write your message here..." readonly></textarea></div>' +
        '<button style="background:var(--blue);color:#fff;border:none;padding:.55rem 1.4rem;border-radius:5px;font-weight:700;font-size:.9rem;cursor:default;">Send Message</button>' +
      '</div>';

  } else if (name === "gallery") {
    rendered = '<div style="font-size:.85rem;color:var(--text-md);margin-bottom:.6rem;">🖼️ WordPress rendered an image gallery:</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.4rem;">' +
        '<div style="background:#e2e8f0;border-radius:4px;height:60px;"></div>' +
        '<div style="background:#e2e8f0;border-radius:4px;height:60px;"></div>' +
        '<div style="background:#e2e8f0;border-radius:4px;height:60px;"></div>' +
      '</div>';

  } else if (name === "youtube") {
    rendered = '<div style="font-size:.85rem;color:var(--text-md);margin-bottom:.6rem;">▶ WordPress embedded the video:</div>' +
      '<div style="background:#000;border-radius:6px;height:100px;display:flex;align-items:center;justify-content:center;gap:.7rem;">' +
        '<span style="font-size:2rem;color:#fff;">▶</span>' +
        '<span style="color:#888;font-size:.85rem;">Embedded YouTube Player</span>' +
      '</div>';

  } else {
    rendered = '<div style="color:var(--orange);">⚠️ Unknown shortcode <code>[' + match[1] + ']</code> — no plugin has registered this shortcode. It would appear as plain text on the page.</div>';
  }

  output.innerHTML = rendered;
}


/* ================================================================
   8. PHASE 3 — SHORTCODE EXAMPLE LOADER

   loadShortcode(code) — puts an example shortcode into the
   simulator input and renders it automatically.
================================================================ */

function loadShortcode(code) {
  var input = document.getElementById("shortcode-input");
  input.value = code;
  document.getElementById("phase-3").scrollIntoView({ behavior: "smooth" });
  // Small delay so the scroll completes first
  setTimeout(renderShortcode, 400);
}

function copyShortcode() {
  var code = document.getElementById("shortcode-preview").textContent;
  navigator.clipboard.writeText(code).then(function () {
    var btn = document.querySelector(".copy-sc-btn");
    btn.textContent = "Copied!";
    setTimeout(function () { btn.textContent = "Copy"; }, 1500);
  });
}


/* ================================================================
   9. PHASE 4 — BRUTE-FORCE ATTACK SIMULATOR

   STATE:
     attackInterval  — the setInterval running the bot
     attempts        — total login attempts made
     blockedCount    — number of attempts the plugin blocked
     isProtected     — whether LLA plugin is "active"
     lockoutAt       — the attempt number when lockout triggers

   The simulator shows:
     - Unprotected: bot keeps trying indefinitely until it "wins"
     - Protected:   bot gets locked out after 4 attempts

   It generates random password strings to make the log look real.
================================================================ */

var attackInterval = null;
var attempts       = 0;
var blockedCount   = 0;
var isProtected    = false;
var lockoutAt      = 4;    // LLA default: lock out after 4 attempts

// Common passwords a bot would try (educational list only)
var PASSWORDS = [
  "123456","password","admin","123456789","12345678","admin123",
  "iloveyou","abc123","qwerty","monkey","dragon","1234567",
  "sunshine","master","hello","shadow","superman","batman",
  "letmein","trustno1","passw0rd","football","baseball"
];

function setProtection(val) {
  isProtected = val;
  document.getElementById("btn-unprotected").classList.toggle("active", !val);
  document.getElementById("btn-protected").classList.toggle("active", val);
  resetAttack();
}

function startAttack() {
  if (attackInterval) return;

  // Disable start, show stop
  document.getElementById("ap-start").classList.add("hidden");
  document.getElementById("ap-stop").classList.remove("hidden");

  // Update status
  document.getElementById("stat-status").textContent = "Running...";

  var speed = parseInt(document.getElementById("speed-select").value);
  var logEntries = document.getElementById("al-entries");

  // Clear old log
  logEntries.innerHTML = "";

  attackInterval = setInterval(function () {
    attempts++;
    document.getElementById("stat-attempts").textContent = attempts;

    var password = PASSWORDS[(attempts - 1) % PASSWORDS.length];
    var timestamp = new Date().toLocaleTimeString();

    // ── PROTECTED: lock out after 4 attempts ──
    if (isProtected && attempts >= lockoutAt) {
      // Show lockout UI
      document.getElementById("wlm-error").classList.add("hidden");
      document.getElementById("wlm-lockout").classList.remove("hidden");
      document.getElementById("attack-password").textContent = "🔒";

      blockedCount++;
      document.getElementById("stat-blocked").textContent = blockedCount;

      addLog(logEntries, "[" + timestamp + "] Attempt #" + attempts + ": " + password + " → BLOCKED — IP locked out for 20 minutes!", "al-blocked");

      // Update LLA stats
      updateLLAStats();

      // Stop after showing lockout
      stopAttack();
      document.getElementById("stat-status").textContent = "Blocked!";
      return;
    }

    // ── Regular attempt ──
    document.getElementById("attack-password").textContent = password.replace(/./g, "•");
    document.getElementById("wlm-error").classList.remove("hidden");

    // Occasional flash effect
    var wpLogin = document.getElementById("wp-login-mock");
    wpLogin.style.opacity = "0.7";
    setTimeout(function () { wpLogin.style.opacity = "1"; }, 80);

    addLog(logEntries, "[" + timestamp + "] Attempt #" + attempts + ": admin / " + password + " → FAILED", "al-fail");

    // ── Unprotected: bot eventually "wins" at attempt ~15 ──
    if (!isProtected && attempts === 15) {
      document.getElementById("attack-password").textContent = "12345678";
      document.getElementById("wlm-error").classList.add("hidden");

      var successEntry = document.createElement("div");
      successEntry.className = "al-entry al-success";
      successEntry.textContent = "[" + timestamp + "] Attempt #" + attempts + ": admin / 12345678 → ✅ LOGIN SUCCESSFUL — SITE COMPROMISED!";
      logEntries.prepend(successEntry);

      stopAttack();
      document.getElementById("stat-status").textContent = "⚠️ Hacked!";
    }

  }, speed);
}

function addLog(container, text, className) {
  var entry = document.createElement("div");
  entry.className = "al-entry " + className;
  entry.textContent = text;
  container.prepend(entry);  // newest entries at the top
}

function stopAttack() {
  if (attackInterval) {
    clearInterval(attackInterval);
    attackInterval = null;
  }
  document.getElementById("ap-start").classList.remove("hidden");
  document.getElementById("ap-stop").classList.add("hidden");
}

function resetAttack() {
  stopAttack();
  attempts     = 0;
  blockedCount = 0;

  document.getElementById("stat-attempts").textContent = "0";
  document.getElementById("stat-blocked").textContent  = "0";
  document.getElementById("stat-status").textContent   = "Running...";

  document.getElementById("wlm-error").classList.add("hidden");
  document.getElementById("wlm-lockout").classList.add("hidden");
  document.getElementById("attack-password").textContent = "••••••••";

  var logEntries = document.getElementById("al-entries");
  logEntries.innerHTML = '<div class="al-entry al-info">Waiting for attack to start...</div>';
}


/* ================================================================
   10. PHASE 4 — LLA SETTINGS SAVE

   saveLLASettings() — reads the configured values and shows a
   saved confirmation, then updates the lockout threshold used
   by the brute-force simulator.
================================================================ */

function saveLLASettings() {
  lockoutAt = parseInt(document.getElementById("lla-retries").value) || 4;

  var savedEl = document.getElementById("lla-saved");
  savedEl.classList.remove("hidden");
  setTimeout(function () { savedEl.classList.add("hidden"); }, 2000);
}

function updateLLAStats() {
  var lockouts = parseInt(document.getElementById("lla-stat-lockouts").textContent) + 1;
  var ips      = Math.min(lockouts, 3);
  var total    = parseInt(document.getElementById("lla-stat-total").textContent) + attempts;

  document.getElementById("lla-stat-lockouts").textContent = lockouts;
  document.getElementById("lla-stat-ips").textContent      = ips;
  document.getElementById("lla-stat-total").textContent    = total;
}
