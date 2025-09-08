/**
 * Assigned-To & Category dropdown logic:
 */

// Ensure the namespace exists even if this file loads first
window.addTaskManager = window.addTaskManager || {};

/* ---------------------- file-scoped helpers (tiny & reusable) ---------------------- */

/** Returns the <ul id="assigned-to-options"> panel. */
function _assPanel() { 
  return document.getElementById('assigned-to-options'); 
}

/** Lowercased Set helper. */
function _selSet(sel) { 
  return new Set(Array.from(sel || []).map(v => (v || '').trim().toLowerCase())); 
}

/** Finds nearest LI row. */
function _rowFor(node) { 
  return (node.closest && node.closest('li.checkbox-option')) || node; 
}

/** Toggles checkbox attrs + aria. */
function _setCB(cb, on) {
  cb.checked = !!on;
  if (on) cb.setAttribute('checked', ''); else cb.removeAttribute('checked');
  cb.setAttribute('aria-checked', on ? 'true' : 'false');
}

/** Fires real click-like events. */
function _clickLike(el) {
  if (!el) return;
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
  el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
  el.dispatchEvent(new MouseEvent('mouseup',   { bubbles: true, cancelable: true, view: window }));
  el.dispatchEvent(new MouseEvent('click',     { bubbles: true, cancelable: true, view: window }));
}

/** Resolves stable key (email lowercased; fallback name). */
function _resolveKey(node, users) {
  const cb = node.matches?.('input[type="checkbox"]') ? node : node.querySelector?.('input[type="checkbox"]');
  const row = cb?.closest?.('li, .dropdown-item, label') || node.closest?.('li, .dropdown-item, label') || node;
  let key = (cb?.dataset?.value || cb?.dataset?.email) || (typeof cb?.value !== 'undefined' ? cb?.value : '') ||
            (row?.dataset?.value || row?.dataset?.email) || '';
  key = (key || '').trim().toLowerCase();
  if (key) return key;
  const name = (row?.textContent || '').trim().toLowerCase();
  const match = users?.find(u => u.name && u.name.trim().toLowerCase() === name);
  return (match?.email || '').trim().toLowerCase();
}

/* --------------------------------- attach methods --------------------------------- */

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

  /** Initialisiert Category- & Assignees-Dropdowns */
  _initializeDropdowns() {
    this._initCategoryDropdown();
    this._initAssigneesDropdown();
  },

  /** Rendert die Optionsliste ins Panel. */
  _renderAssigneeOptions() {
    const p = document.getElementById('assigned-to-options'); if (!p) return;
    const U = this.state.assignableUsers || [];
    p.innerHTML = U.map(u => {
      const em = (u.email || '').trim().toLowerCase();
      const nm = (u.name || '').trim();
      const init = (typeof getInitials === 'function') ? getInitials(nm) : '?';
      return `
<li class="checkbox-option">
  <span class="initial-badge-circle" style="background:${u.color || '#A5A5A5'}">${init}</span>
  <span class="contact-name">${nm}</span>
  <input type="checkbox" data-email="${em}" value="${em || nm}">
  <span class="custom-checkbox">${typeof CHECK_SVG !== 'undefined' ? CHECK_SVG : ''}</span>
</li>`;
    }).join('');
  },

  /** Zeigt/verbirgt Panel + Pfeilzustand. */
  _toggleAssigneesPanel(open) {
    const p = document.getElementById('assigned-to-options');
    const t = document.getElementById('assigned-to-toggle-btn');
    const w = document.querySelector('.assigned-to-wrapper .dropdown-input-wrapper');
    if (!p) return;
    p.classList.toggle('show', !!open);
    t?.classList.toggle('open', !!open);
    w?.classList.toggle('open', !!open);
  },

  /** Bindet Toggle-Button: rendert, synced, öffnet. */
  _bindAssigneesToggle() {
    const btn = document.getElementById('assigned-to-toggle-btn'); if (!btn) return;
    btn.addEventListener('click', () => {
      const p = document.getElementById('assigned-to-options');
      const willOpen = !(p && p.classList.contains('show'));
      this._renderAssigneeOptions();
      this._applyAssignedSelectionToDropdown?.();
      this._toggleAssigneesPanel(willOpen);
      if (willOpen) this._onAssignedOpen();
  });
  },

  /** Initializes the Category (single-select) dropdown. */
  _initCategoryDropdown() {
    const opts = this.state.categories.map(c => ({ name: c, value: c }));
    new CustomDropdown('category', opts, {
      onSelect: (opt) => {
        const input = this.elements.categoryInput; if (!input) return;
        const v = opt && (opt.value || opt.name) ? (opt.value || opt.name) : '';
        input.value = v; input.dispatchEvent(new Event('input')); this._clearError(input);
      }
    });
  },

  /** Initializes the Assigned-To (multi-select) dropdown and wires sync-on-open. */
  _initAssigneesDropdown() {
    const opts = (this.state.assignableUsers || []).map(u => ({
      name: u.name, value: (u.email || u.name), email: (u.email || ''), color: u.color
    }));
    new CustomDropdown('assigned-to', opts, {
      isMultiSelect: true,
      getInitials: getInitials,
      isSelected: (o) => this.state.selectedAssignees.has(((o.email||o.value||'').toLowerCase())),
      onChange: () => { this._captureAssignedSelection(); this._updateContactBadges(); }
    });
    this._renderAssigneeOptions();
    this._wireAssignedDropdownOpenSync();
    this._bindAssigneesToggle();
  },

  /** Rebuilds selection from rendered checkboxes. */
  _captureAssignedSelection() {
    const boxes = document.querySelectorAll('#assigned-to-options input[type="checkbox"]');
    const users = this.state.assignableUsers; const sel = new Set();
    boxes.forEach(cb => { const key = _resolveKey(cb, users); if (cb.checked && key) sel.add(key); });
    this.state.selectedAssignees = sel;
  },

  /** Applies state selection to inputs + role=checkbox. */
  _applyAssignedSelectionToDropdown() {
    const panel = _assPanel(); if (!panel) return;
    const selected = _selSet(this.state.selectedAssignees); const users = this.state.assignableUsers;
    panel.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      const on = selected.has(_resolveKey(cb, users)); const row = cb.closest?.('li.checkbox-option');
      _setCB(cb, on); if (row) row.classList.toggle('is-checked', on);
    });
    panel.querySelectorAll('[role="checkbox"]').forEach(el => {
      const on = selected.has(_resolveKey(el, users));
      el.setAttribute('aria-checked', on ? 'true' : 'false');
      const row = el.closest?.('li.checkbox-option') || el; row?.classList?.toggle('is-checked', on);
    });
  },

  /** Emulates clicks to sync 3rd-party UI, then enforces booleans. */
  _applyAssignedSelectionByClick() {
    const panel = _assPanel(); if (!panel) return;
    const selected = _selSet(this.state.selectedAssignees); const users = this.state.assignableUsers;
    this._assigneeSyncGuard = true;
    panel.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      const on = selected.has(_resolveKey(cb, users)); if (!!cb.checked !== on) _clickLike(cb);
    });
    panel.querySelectorAll('[role="checkbox"]').forEach(box => {
      const on = selected.has(_resolveKey(box, users));
      const cur = box.getAttribute('aria-checked') === 'true'; if (cur !== on) _clickLike(box);
    });
    setTimeout(() => { this._assigneeSyncGuard = false; this._updateContactBadges(); }, 0);
  },

  /** Marks a single row as (de)selected. */
  _markRowChecked(row, on) {
    if (!row) return;
    row.classList.toggle('is-checked', !!on);
    const cb = row.querySelector('input[type="checkbox"]'); if (cb) _setCB(cb, on);
    const roleBox = row.querySelector('[role="checkbox"]'); if (roleBox) roleBox.setAttribute('aria-checked', on ? 'true' : 'false');
  },

  /** Applies `.is-checked` to all visible rows based on state. */
  _updateAllAssignedRowClasses() {
    const panel = _assPanel(); if (!panel) return;
    const selected = _selSet(this.state.selectedAssignees); const users = this.state.assignableUsers;
    panel.querySelectorAll('li.checkbox-option').forEach(row => {
      const on = selected.has(_resolveKey(row, users)); this._markRowChecked(row, on);
    });
  },

  /** Returns whether the row is visually/semantically checked. */
  _rowIsChecked(row) {
    const cb = row.querySelector?.('input[type="checkbox"]'); if (cb) return !!cb.checked;
    const roleBox = row.querySelector?.('[role="checkbox"]'); if (roleBox) return roleBox.getAttribute('aria-checked') === 'true';
    const aria = row.getAttribute?.('aria-checked'); if (aria != null) return aria === 'true';
    const c = row.classList || { contains(){return false;} };
    return c.contains('is-checked') || c.contains('selected') || c.contains('checked');
  },

  /** Toggles a visible checkbox/box via real click events. */
  _rowClickToggle(row) {
    const box = row.querySelector?.('.custom-checkbox'); if (box) return _clickLike(box);
    const cb = row.querySelector?.('input[type="checkbox"]'); if (cb) return _clickLike(cb);
    _clickLike(row);
  },

  /** Heuristic: align UI with state by toggling rows that differ. */
  _syncAssignedRowsHeuristic() {
    const panel = _assPanel(); if (!panel) return;
    const users = this.state.assignableUsers; const wanted = _selSet(this.state.selectedAssignees);
    this._assigneeSyncGuard = true;
    panel.querySelectorAll('li.checkbox-option').forEach(row => {
      const key = _resolveKey(row, users); const shouldOn = wanted.has(key);
      const cb = row.querySelector?.('input[type="checkbox"]');
      const isOn = cb ? !!cb.checked : row.classList.contains('is-checked'); if (isOn === shouldOn) return;
      this._rowClickToggle(row); row.classList.toggle('is-checked', shouldOn); if (cb) _setCB(cb, shouldOn);
    });
    setTimeout(() => { this._assigneeSyncGuard = false; this._updateContactBadges(); }, 0);
  },

  /** Schedules short sync passes and observes rerenders briefly. */
  _scheduleOpenSync(panel) {
    const run = () => {
      this._applyAssignedSelectionToDropdown();
      if (typeof this._applyAssignedSelectionByClick === 'function') this._applyAssignedSelectionByClick();
      this._syncAssignedRowsHeuristic();
    };
    requestAnimationFrame(() => {
      run(); setTimeout(run, 80); setTimeout(run, 200);
      const obs = new MutationObserver(() => { this._applyAssignedSelectionToDropdown(); this._updateAllAssignedRowClasses(); });
      try { obs.observe(panel, { childList: true, subtree: true }); } catch {}
      setTimeout(() => { try { obs.disconnect(); } catch {} }, 1500);
    });
  },

  /** Handles dropdown open: immediate sync + short-lived interaction tracking. */
  _onAssignedOpen() {
    const panel = _assPanel(); if (!panel) return;
    this._applyAssignedSelectionToDropdown(); this._updateAllAssignedRowClasses();
    const start = (e) => { if (panel.contains(e.target)) this._userInteracting = true; };
    const end   = () => { this._userInteracting = false; };
    document.addEventListener('pointerdown', start, true); document.addEventListener('pointerup', end, true);
    this._scheduleOpenSync(panel);
    setTimeout(() => {
      document.removeEventListener('pointerdown', start, true);
      document.removeEventListener('pointerup', end, true);
    }, 1500);
  },

  /** Wires opening triggers and a delegated change-handler for instant coloring. */
  _wireAssignedDropdownOpenSync() {
    const toggle = document.getElementById('assigned-to-toggle-btn');
    const input  = document.getElementById('assigned-to-input');
    toggle?.addEventListener('click', () => this._onAssignedOpen());
    input ?.addEventListener('click', () => this._onAssignedOpen());
    input ?.addEventListener('focus', () => this._onAssignedOpen());
    document.addEventListener('change', (e) => {
      const panel = _assPanel(); if (!panel || !panel.contains(e.target)) return;
      const t = e.target; const isInput = t.matches?.('input[type="checkbox"]'); const isRole = t.matches?.('[role="checkbox"]');
      if (!isInput && !isRole) return; if (this._assigneeSyncGuard) return;
      const row = _rowFor(t); const on = isRole ? (t.getAttribute('aria-checked') === 'true') : !!t.checked;
      this._markRowChecked(row, on); this._captureAssignedSelection(); this._updateAllAssignedRowClasses(); this._updateContactBadges();
    });
  },
});

