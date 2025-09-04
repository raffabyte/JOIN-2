/**
 * UI helpers for Add Task page:
 * DOM cache, date picker, selection-only inputs, priority buttons, badges, and popup.
 */

/**
 * Shorthand querySelector.
 * @param {string} s
 * @param {ParentNode} [r=document]
 */
function qs(s, r = document) { return r.querySelector(s); }

/**
 * Returns YYYY-MM-DD for today's local date.
 * @returns {string}
 */
function todayStr() {
  const d = new Date(), y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

// --- date reopen guard (prevents immediate re-opening after selection)
let _dateGuardUntil = 0;
/**
 * Returns true if the date picker should stay closed.
 * Uses performance.now() for precise timing.
 */
function dateGuardActive() {
  return performance.now() < _dateGuardUntil;
}
/**
 * Arms the guard to block picker reopening for the next X ms.
 * @param {number} ms - Duration in milliseconds.
 */
function armDateGuard(ms = 400) {
  _dateGuardUntil = performance.now() + ms;
}


/**
 * Ensures input becomes temporarily editable to open native pickers.
 * @param {HTMLInputElement} el
 * @param {Function} fn
 */
function withMutable(el, fn) {
  const ro = el.readOnly, di = el.disabled;
  el.readOnly = false; el.disabled = false;
  try { fn(); } finally { el.readOnly = ro; el.disabled = di; }
}

/**
 * Tries all strategies to open a date input's native picker.
 * @param {HTMLInputElement} input
 */
function tryOpenDate(input) {
  try { if (typeof input.showPicker === "function") return input.showPicker(); } catch {}
  try { input.click(); } catch {}
  input.focus();
  setTimeout(() => { try { input.click(); } catch {} }, 0);
}

/**
 * Creates a colored badge for a user.
 * @param {{name:string,color?:string}} user
 */
function makeBadge(user) {
  const div = document.createElement("div");
  div.className = "contact-badge";
  div.textContent = getInitials(user.name);
  if (user.color) div.style.backgroundColor = user.color;
  div.title = user.name; div.setAttribute("aria-label", user.name);
  return div;
}

/* ---------------------- selection-only input (global helper) ---------------------- */

/**
 * Makes an input selection-only: blocks typing/paste; triggers openFn on click/Enter/Space/ArrowDown.
 * @param {HTMLInputElement} input
 * @param {Function} openFn
 */
window.makeSelectionOnly = function makeSelectionOnly(input, openFn) {
  if (!input) return;
  input.setAttribute("readonly", "readonly");
  input.addEventListener("click", (e) => { e.preventDefault(); openFn?.(); });
  input.addEventListener("keydown", (e) => {
    const ok = ["Tab","Shift","Alt","Control","Meta","Escape","ArrowLeft","ArrowRight","Home","End"];
    if (ok.includes(e.key)) return;
    if (["Enter"," ","ArrowDown"].includes(e.key)) { e.preventDefault(); return openFn?.(); }
    e.preventDefault();
  });
  input.addEventListener("paste", (e) => e.preventDefault());
  input.addEventListener("drop",  (e) => e.preventDefault());
};

/* ---------------------- module methods ---------------------- */

Object.assign(window.addTaskManager, {
  /**
   * Cache frequently used DOM elements.
   */
  _cacheDOMElements() {
    this.elements.form              = qs(".task-form");
    this.elements.createBtn         = this.elements.form?.querySelector(".create-button") || null;
    this.elements.clearBtn          = this.elements.form?.querySelector(".clear-button")  || null;
    this.elements.title             = qs("#title");
    this.elements.dueDate           = qs("#due-date");
    this.elements.categoryInput     = qs("#category-input");
    this.elements.prioButtons       = document.querySelectorAll(".priority-btn");
    this.elements.subtaskInput      = qs("#subtasks");
    this.elements.selectedAssignees = qs("#selected-assignees");
  },

  /**
   * Open the native date picker for due date.
   */
_openDatePicker() {
  const input = this.elements.dueDate; if (!input) return;
  if (dateGuardActive()) return;          
  withMutable(input, () => tryOpenDate(input));
},


  /**
   * Wire calendar button + input to open native picker reliably.
   */
_setupDatePicker() {
  const btn = document.getElementById("calendar-toggle");
  const input = this.elements.dueDate;
  if (!btn || !input) return;

  const open = (e) => {
    if (dateGuardActive()) return;
    e.preventDefault();
    withMutable(input, () => tryOpenDate(input));
  };

  btn.addEventListener("pointerdown", open);
  btn.addEventListener("click", open);
  input.addEventListener("pointerdown", (e) => this._handleDatePointer(e, input, open));
  input.addEventListener("change", () => this._handleDateChange(input));
},


/**
 * Handles pointerdown on the due date input.
 * Prevents reopening the picker immediately if the guard is active.
 */
_handleDatePointer(e, input, open) {
  if (!input.readOnly) return;
  if (dateGuardActive()) return;
  e.preventDefault();
  open(e);
},

/**
 * Handles date change: sets guard and removes focus.
 */
_handleDateChange(input) {
  armDateGuard(500); 
  setTimeout(() => input.blur(), 0);
},


  /**
   * Enforce min date = today and validate on blur.
   */
  _setDueDateMinToday() {
    const input = this.elements.dueDate; if (!input) return;
    const min = todayStr(); input.setAttribute("min", min);
    input.addEventListener("input", () => { if (input.value && input.value < min) input.value = min; input.setCustomValidity(""); });
    input.addEventListener("blur",  () => {
      if (input.value && input.value < min) this._showError(input, "Date cannot be in the past.");
      else this._clearError(input);
    });
  },

  /**
   * Make fields selection-only: due date, category, assigned-to.
   */
  _enforceSelectionOnlyFields() {
    const due = this.elements.dueDate;
    const cat = this.elements.categoryInput;
    const catBtn = document.getElementById("category-toggle-btn");
    const asg = document.getElementById("assigned-to-input");
    const asgBtn = document.getElementById("assigned-to-toggle-btn");
    if (due)    makeSelectionOnly(due, () => this._openDatePicker());
    if (cat && catBtn) makeSelectionOnly(cat, () => catBtn.click());
    if (asg && asgBtn) makeSelectionOnly(asg, () => asgBtn.click());
  },

  /**
   * Inject SVGs, set ARIA, and bind clicks for priority group.
   */
  _setupPriorityButtons() {
    const u = document.getElementById("prioUrgentIcon");
    const m = document.getElementById("prioMediumIcon");
    const l = document.getElementById("prioLowIcon");
    if (u && typeof HIGH_PRIORITY_SVG !== "undefined") u.innerHTML = HIGH_PRIORITY_SVG;
    if (m && typeof MID_PRIORITY_SVG  !== "undefined") m.innerHTML = MID_PRIORITY_SVG;
    if (l && typeof LOW_PRIORITY_SVG  !== "undefined") l.innerHTML = LOW_PRIORITY_SVG;
    this.elements.prioButtons.forEach(b => b.setAttribute("aria-pressed", b.classList.contains("selected") ? "true" : "false"));
    this.elements.prioButtons.forEach(btn => btn.addEventListener("click", () => {
      this.elements.prioButtons.forEach(b => { b.classList.remove("selected"); b.setAttribute("aria-pressed", "false"); });
      btn.classList.add("selected"); btn.setAttribute("aria-pressed", "true");
      this._clearError(btn.parentElement);
    }));
  },

  /**
   * Render selected assignee badges + overflow chip.
   */
  _updateContactBadges() {
    const emails = this._getSelectedAssignees();
    const wrap = this.elements.selectedAssignees; if (!wrap) return;
    wrap.innerHTML = ""; if (!emails.length) return wrap.classList.add("display-none");
    wrap.classList.remove("display-none");
    const MAX = 3, vis = emails.slice(0, MAX), hid = emails.slice(MAX);
    vis.forEach(email => {
      const u = this.state.assignableUsers.find(x => x.email === email);
      if (u) wrap.appendChild(makeBadge(u));
    });
    if (!hid.length) return;
    const names = hid.map(e => (this.state.assignableUsers.find(x => x.email === e)?.name || null)).filter(Boolean);
    const more = document.createElement("div");
    more.className = "contact-badge contact-badge--overflow";
    more.textContent = `+${hid.length}`; more.title = names.join(", ");
    more.setAttribute("aria-label", names.join(", ")); wrap.appendChild(more);
  },

  /**
   * Show success toast after creating a task.
   */
  _showSuccessPopup() {
    const tpl = document.getElementById("boardSvgTemplate");
    const svg = tpl ? tpl.innerHTML : "";
    const el = document.createElement("div");
    el.className = "task-added-popup";
    el.innerHTML = `<span>Task added to board</span>${svg}`;
    document.body.appendChild(el);
    setTimeout(() => {
      el.classList.add("fade-out");
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }, 3000);
  }
});
