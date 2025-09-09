/**
 * Assigned-To & Category dropdown logic:
 */

// Ensure the namespace exists even if this file loads first
window.addTaskManager = window.addTaskManager || {};
window.CHECKBOX_SVG = window.CHECKBOX_SVG || (
  '<svg class="checkbox" width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<rect x="4.68213" y="4.39673" width="16" height="16" rx="3" stroke="#2A3647" stroke-width="2"/></svg>'
);
window.CHECKBOX_FILLED_LIGHT_SVG = window.CHECKBOX_FILLED_LIGHT_SVG || (
  '<svg class="checkbox-filled" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M20 11V17C20 18.6569 18.6569 20 17 20H7C5.34315 20 4 18.6569 4 17V7C4 5.34315 5.34315 4 7 4H15" stroke="white" stroke-width="2" stroke-linecap="round"/>' +
  '<path d="M8 12L12 16L20 4.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
);

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


  /** Renders optionsliste to panel. */
_renderAssigneeOptions() {
  const p = document.getElementById('assigned-to-options'); if (!p) return;
  const U = this.state.assignableUsers || [];
  const filled = (typeof CHECKBOX_FILLED_LIGHT_SVG !== 'undefined')
    ? CHECKBOX_FILLED_LIGHT_SVG.replace(/\bdisplay-none\b/, '')
    : '';
  p.innerHTML = U.map(u => {
    const em = (u.email || '').trim().toLowerCase();
    const nm = (u.name || '').trim();
    const init = (typeof getInitials === 'function') ? getInitials(nm) : '?';
    return `<li class="checkbox-option">
      <span class="initial-badge-circle" style="background:${u.color || '#A5A5A5'}">${init}</span>
      <span class="contact-name">${nm}</span>
      <input type="checkbox" data-email="${em}" value="${em || nm}">
      <span class="custom-checkbox">${(typeof CHECKBOX_SVG!=='undefined'?CHECKBOX_SVG:'')}${filled}</span>
    </li>`;
  }).join('');
},


  /** Shows/hides penel and arrow. */
_toggleAssigneesPanel(open) {
  const p = document.getElementById('assigned-to-options');
  const t = document.getElementById('assigned-to-toggle-btn');
  const w = document.querySelector('.assigned-to-wrapper .dropdown-input-wrapper');
  if (!p) return;
  if (open) p.classList.add('show'); else p.classList.remove('show');
  t?.classList.toggle('open', !!open);
  w?.classList.toggle('open', !!open);
},


  /** Binds toggle button: renders, syncs, opens.*/
_bindAssigneesToggle() {
  if (this._assToggleBound) return; this._assToggleBound = true;
  const btn = document.getElementById('assigned-to-toggle-btn'); if (!btn) return;
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); }, true);
  btn.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    const p = document.getElementById('assigned-to-options'); const willOpen = !p.classList.contains('show');
    if (willOpen) {
      this._renderAssigneeOptions(); this._applyAssignedSelectionToDropdown?.();
      this._toggleAssigneesPanel(true); this._onAssignedOpen(); this._armOutside();
      setTimeout(() => this._applyAssignedSelectionToDropdown?.(), 0);  
    } else {
      this._toggleAssigneesPanel(false); this._disarmOutside();        
    }
  }, true);
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


  /** Handles dropdown open: immediate sync + short-lived interaction tracking. */
  _onAssignedOpen() {
    const panel = _assPanel(); if (!panel) return;
    this._applyAssignedSelectionToDropdown(); this._updateAllAssignedRowClasses();
    const start = (e) => { if (panel.contains(e.target)) this._userInteracting = true; };
    const end   = () => { this._userInteracting = false; };
    document.addEventListener('pointerdown', start, true); document.addEventListener('pointerup', end, true);
    setTimeout(() => { this._applyAssignedSelectionToDropdown(); this._updateAllAssignedRowClasses(); }, 0);
    setTimeout(() => {
      document.removeEventListener('pointerdown', start, true);
      document.removeEventListener('pointerup', end, true);
    }, 1500);
  },


  /** Wires opening triggers and a delegated change-handler for instant coloring. */
_wireAssignedDropdownOpenSync() {
  const input = document.getElementById('assigned-to-input');
  input?.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.stopImmediatePropagation(); }, true);
  input?.addEventListener('click', (e) => {
    e.stopPropagation();
    const p = _assPanel(); if (!p || p.classList.contains('show')) return;
    this._renderAssigneeOptions(); this._applyAssignedSelectionToDropdown?.();
    this._toggleAssigneesPanel(true); this._onAssignedOpen(); this._armOutside();
    setTimeout(() => this._applyAssignedSelectionToDropdown?.(), 0);
  });
  document.addEventListener('change', (e) => {
    const p=_assPanel(); if (!p || !p.contains(e.target)) return;
    const t=e.target, isIn=t.matches?.('input[type="checkbox"]'), isRole=t.matches?.('[role="checkbox"]');
    if ((!isIn && !isRole) || this._assigneeSyncGuard) return;
    const row=_rowFor(t), on=isRole?(t.getAttribute('aria-checked')==='true'):!!t.checked;
    this._markRowChecked(row,on); this._captureAssignedSelection(); this._updateAllAssignedRowClasses(); this._updateContactBadges();
  });
},


_globalShield(ms=120) {
  this._shieldUntil = performance.now() + ms;
  const end=this._shieldUntil, evts=['click','mousedown','mouseup','pointerdown','pointerup'];
  const wrap=document.querySelector('.assigned-to-wrapper');
  const stop=(e)=>{
    if (performance.now()>=end) return;
    if (wrap && wrap.contains(e.target)) return;   
    e.stopPropagation(); e.stopImmediatePropagation();
  };
  evts.forEach(t=>document.addEventListener(t,stop,true));
  setTimeout(()=>evts.forEach(t=>document.removeEventListener(t,stop,true)),ms);
},


_afterShield(fn) {
  const d = Math.max(0, (this._shieldUntil||0) - performance.now() + 10);
  setTimeout(fn, d);
},


_armOutside() {
  if (this._assOutsideOn) return; this._assOutsideOn = true;
  this._assigneeOutsideHandler = (ev) => {
    const wrap = document.querySelector('.assigned-to-wrapper');
    if (wrap && wrap.contains(ev.target)) return;
    this._toggleAssigneesPanel(false); this._disarmOutside();
  };
  setTimeout(() => document.addEventListener('click', this._assigneeOutsideHandler, true), 0);
},


_disarmOutside() {
  if (this._assigneeOutsideHandler) {
    document.removeEventListener('click', this._assigneeOutsideHandler, true);
    this._assigneeOutsideHandler = null; this._assOutsideOn = false;
  }
},
});
