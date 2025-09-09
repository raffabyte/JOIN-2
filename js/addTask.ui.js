/**
 * UI helpers for Add Task page:
 * DOM cache, date picker, selection-only inputs, priority buttons, badges, and popup.
 */

// Fallback-Icons (werden nur benutzt, wenn window.* leer/undef. ist)
const PRIO_SVGS = {
  high:  '<svg viewBox="0 0 24 24"><path d="M12 2l9 16H3z" fill="currentColor"/></svg>',
  medium:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 12h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  low:   '<svg viewBox="0 0 24 24"><path d="M4 16h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4 12h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".6"/></svg>'
};

// Falls das vorhandene SVG nichts zeichnet, ersetze durch Fallback
function _ensurePrioIcon(el, key) {
  if (!el) return;
  const html = (el.innerHTML || '').trim();
  const hasShape = /<(path|circle|rect|line|polygon)\b/i.test(html);
  if (!html || !hasShape) el.innerHTML = PRIO_SVGS[key];
}

// liefert svg 
function _getPrioSVG(k) {
  const pick = {
    high:   () => (typeof HIGH_PRIORITY_SVG !== 'undefined' ? HIGH_PRIORITY_SVG : null),
    medium: () => (typeof MID_PRIORITY_SVG  !== 'undefined' ? MID_PRIORITY_SVG  : null),
    low:    () => (typeof LOW_PRIORITY_SVG  !== 'undefined' ? LOW_PRIORITY_SVG  : null)
  };
  return (pick[k]?.() || PRIO_SVGS[k]);
}


function _debugPrioSources() {
  ['high','medium','low'].forEach(k => {
    const s = _getPrioSVG(k);
    const usedFallback = s === PRIO_SVGS[k];
    console.log(`[prio:${k}]`, usedFallback ? 'fallback' : 'templates.js');
  });
}


// Ensure the namespace exists even if this file loads first
window.addTaskManager = window.addTaskManager || {};


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

let _dateGuardUntil = 0;


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

const SUPPORTS_SHOW_PICKER = "showPicker" in HTMLInputElement.prototype;


/* ---------------------- module methods ---------------------- */

Object.assign(window.addTaskManager, {
  /** Cache frequently used DOM elements. */
  _cacheDOMElements() {
    const qs = (s, r = document) => r.querySelector(s);
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

  /** Open the native date picker for due date. */
  _openDatePicker() {
    const input = this.elements.dueDate;
    if (!input) return;
    if (typeof window.dateGuardActive === "function" && window.dateGuardActive()) return;
    const withMutable = (el, fn) => {
      const ro = el.readOnly, di = el.disabled;
      el.readOnly = false; el.disabled = false;
      try { fn(); } finally { el.readOnly = ro; el.disabled = di; }
    };
    const tryOpenDate = (inp) => {
      try { if (typeof inp.showPicker === "function") return inp.showPicker(); } catch {}
      try { inp.click(); } catch {}
      inp.focus();
      setTimeout(() => { try { inp.click(); } catch {} }, 0);
    };
    withMutable(input, () => tryOpenDate(input));
  },

  /** Wire calendar button + input to open native picker reliably. */
_setupDatePicker() {
  const btn = document.getElementById("calendar-toggle");
  const input = this.elements.dueDate;
  if (!btn || !input) return;
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    withMutable(input, () => {
      if (typeof input.showPicker === "function") input.showPicker();
      else { input.removeAttribute("readonly"); input.focus(); input.click(); }
    });
  });
},


  /** Enforce min date = today and validate on blur. */
  _setDueDateMinToday() {
    const input = this.elements.dueDate;
    if (!input) return;
    const todayStr = () => {
      const d = new Date(), y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), da = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${da}`;
    };
    const min = todayStr();
    input.setAttribute("min", min);
    input.addEventListener("input", () => {
      if (input.value && input.value < min) input.value = min;
      input.setCustomValidity("");
    });
    input.addEventListener("blur",  () => {
      if (input.value && input.value < min) this._showError(input, "Date cannot be in the past.");
      else this._clearError(input);
    });
  },


  /** Make fields selection-only: due date, category, assigned-to. */
_enforceSelectionOnlyFields() {
  const due = this.elements.dueDate;
  const cat = this.elements.categoryInput;
  const asg = document.getElementById("assigned-to-input");
  const catBtn = document.getElementById("category-toggle-btn");
  const asgBtn = document.getElementById("assigned-to-toggle-btn");
  if (due) due.removeAttribute("readonly");
  if (cat && catBtn) makeSelectionOnly(cat, () => catBtn.click());
  if (asg && asgBtn) makeSelectionOnly(asg, () => asgBtn.click());
},


  /**
   * Inject SVGs, set ARIA, and bind clicks for priority group.
   */
  _setupPriorityButtons() {
    const ids = { high: "prioUrgentIcon", medium: "prioMediumIcon", low: "prioLowIcon" };
    Object.entries(ids).forEach(([k, id]) => {
      const el = document.getElementById(id);
      if (el) { el.innerHTML = _getPrioSVG(k); _ensurePrioIcon(el, k); }
    });
    this.elements.prioButtons.forEach(b =>
      b.setAttribute("aria-pressed", b.classList.contains("selected") ? "true" : "false")
    );
    this.elements.prioButtons.forEach(btn => btn.addEventListener("click", () => {
      this.elements.prioButtons.forEach(b => { b.classList.remove("selected"); b.setAttribute("aria-pressed", "false"); });
      btn.classList.add("selected"); btn.setAttribute("aria-pressed", "true");
      this._clearError(btn.parentElement);
    }));
  },


  /** Render selected assignee badges + overflow chip (robust: email ODER name). */
/**
 * Finds a user by email or name.
 * @param {string} key
 * @returns {Object|null}
 */
  _findUserByKey(key) {
    const k = (key || "").trim().toLowerCase();
    return this.state.assignableUsers.find(
      u => u.email?.toLowerCase() === k || u.name?.trim().toLowerCase() === k
    ) || null;
  },

/**
 * Creates a single contact badge element.
 * @param {Object} user
 * @returns {HTMLDivElement}
 */
  _createBadgeElement(user) {
    const div = document.createElement("div");
    div.className = "contact-badge";
    div.textContent = (typeof window.getInitials === "function") ? window.getInitials(user.name) : (user.name || "?");
    if (user.color) div.style.backgroundColor = user.color;
    div.title = user.name;
    div.setAttribute("aria-label", user.name);
    return div;
  },


/**
 * Render selected assignee badges + overflow chip.
 */
  _updateContactBadges() {
    const wrap = this.elements.selectedAssignees; if (!wrap) return;
    const sel = [...(this.state.selectedAssignees || [])];
    wrap.innerHTML = "";
    if (!sel.length) { wrap.classList.add("display-none"); return; }
    wrap.classList.remove("display-none");
    sel.slice(0, 3).forEach(k => { const u = this._findUserByKey(k); if (u) wrap.appendChild(this._createBadgeElement(u)); });
    const hid = sel.slice(3); if (!hid.length) return;
    const names = hid.map(k => this._findUserByKey(k)?.name).filter(Boolean);
    const more = document.createElement("div");
    more.className = "contact-badge contact-badge--overflow";
    more.textContent = `+${hid.length}`;
    more.title = names.join(", ");
    more.setAttribute("aria-label", names.join(", "));
    wrap.appendChild(more);
  },


  /** Success toast. */
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