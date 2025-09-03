/**
 * Assigned-To & Category dropdown logic:
 * - Load users
 * - Initialize dropdowns
 * - Keep multi-select visuals synced (.is-checked + white checkbox)
 * - Robust sync on open/rerender
 */

/* ---------------------- file-scoped helpers (tiny & reusable) ---------------------- */

/**
 * Returns the <ul id="assigned-to-options"> panel.
 * @returns {HTMLElement|null}
 */
function _assPanel() { return document.getElementById('assigned-to-options'); }

/**
 * Returns a Set of lowercased selected emails from state.
 * @param {Set<string>} sel
 * @returns {Set<string>}
 */
function _selSet(sel) { return new Set(Array.from(sel || []).map(v => (v || '').trim().toLowerCase())); }

/**
 * Finds the nearest LI row for a given node.
 * @param {HTMLElement} node
 * @returns {HTMLElement}
 */
function _rowFor(node) {
  return (node.closest && node.closest('li.checkbox-option')) || node;
}

/**
 * Toggles checkbox attributes and aria.
 * @param {HTMLInputElement} cb
 * @param {boolean} on
 */
function _setCB(cb, on) {
  cb.checked = !!on;
  if (on) cb.setAttribute('checked', '');
  else cb.removeAttribute('checked');
  cb.setAttribute('aria-checked', on ? 'true' : 'false');
}

/**
 * Click-like utility for 3rd-party UIs that need real events to update.
 * @param {HTMLElement} el
 */
function _clickLike(el) {
  if (!el) return;
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
  el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
  el.dispatchEvent(new MouseEvent('mouseup',   { bubbles: true, cancelable: true, view: window }));
  el.dispatchEvent(new MouseEvent('click',     { bubbles: true, cancelable: true, view: window }));
}

/**
 * Resolves a stable key for an option node (email lowercased).
 * Checks input dataset/value, row dataset, then falls back to name text.
 * @param {HTMLElement} node
 * @param {Array<{name:string,email:string}>} users
 * @returns {string}
 */
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
  /**
   * Loads assignable users via contactService.js.
   * @returns {Promise<Array<{name:string,email:string,color?:string}>>}
   */
  async _loadAssignableUsers() {
    return await getAssignablePeople(window.USERKEY);
  },

  /**
   * Initializes category + assignees dropdowns (separate steps).
   */
  _initializeDropdowns() {
    this._initCategoryDropdown();
    this._initAssigneesDropdown();
  },

  /**
   * Initializes the Category (single-select) dropdown.
   */
  _initCategoryDropdown() {
    const opts = this.state.categories.map(c => ({ name: c, value: c }));
    new CustomDropdown('category', opts, {
      onSelect: (opt) => {
        const input = this.elements.categoryInput;
        if (!input) return;
        const v = opt && (opt.value || opt.name) ? (opt.value || opt.name) : '';
        input.value = v;
        input.dispatchEvent(new Event('input'));
        this._clearError(input);
      }
    });
  },

  /**
   * Initializes the Assigned-To (multi-select) dropdown and wires sync-on-open.
   */
  _initAssigneesDropdown() {
    new CustomDropdown('assigned-to', this.state.assignableUsers, {
      isMultiSelect: true,
      getInitials: getInitials,
      isSelected: (opt) => this.state.selectedAssignees.has((opt.email || '').trim().toLowerCase()),
      onChange: () => { this._captureAssignedSelection(); this._updateContactBadges(); }
    });
    this._wireAssignedDropdownOpenSync();
  },

  /**
   * Rebuilds the selection Set from rendered checkboxes (state = source of truth).
   */
  _captureAssignedSelection() {
    const boxes = document.querySelectorAll('#assigned-to-options input[type="checkbox"]');
    const users = this.state.assignableUsers;
    const sel = new Set();
    boxes.forEach(cb => {
      const key = _resolveKey(cb, users);
      if (cb.checked && key) sel.add(key);
    });
    this.state.selectedAssignees = sel;
  },

  /**
   * Applies state selection to the rendered dropdown (inputs + role=checkbox).
   */
  _applyAssignedSelectionToDropdown() {
    const panel = _assPanel(); if (!panel) return;
    const selected = _selSet(this.state.selectedAssignees);
    const users = this.state.assignableUsers;

    panel.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      const on = selected.has(_resolveKey(cb, users));
      const row = cb.closest?.('li.checkbox-option');
      _setCB(cb, on);
      if (row) row.classList.toggle('is-checked', on);
    });

    panel.querySelectorAll('[role="checkbox"]').forEach(el => {
      const on = selected.has(_resolveKey(el, users));
      el.setAttribute('aria-checked', on ? 'true' : 'false');
      const row = el.closest?.('li.checkbox-option') || el;
      row?.classList?.toggle('is-checked', on);
    });
  },

  /**
   * Fallback: emulates real clicks so 3rd-party UI updates, then enforces booleans.
   */
  _applyAssignedSelectionByClick() {
    const panel = _assPanel(); if (!panel) return;
    const selected = _selSet(this.state.selectedAssignees);
    const users = this.state.assignableUsers;

    this._assigneeSyncGuard = true;

    panel.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      const on = selected.has(_resolveKey(cb, users));
      if (!!cb.checked !== on) _clickLike(cb);
    });

    panel.querySelectorAll('[role="checkbox"]').forEach(box => {
      const on = selected.has(_resolveKey(box, users));
      const cur = box.getAttribute('aria-checked') === 'true';
      if (cur !== on) _clickLike(box);
    });

    setTimeout(() => { this._assigneeSyncGuard = false; this._updateContactBadges(); }, 0);
  },

  /**
   * Marks a single row as (de)selected and syncs input/ARIA attributes.
   * @param {HTMLElement} row
   * @param {boolean} on
   */
  _markRowChecked(row, on) {
    if (!row) return;
    row.classList.toggle('is-checked', !!on);
    const cb = row.querySelector('input[type="checkbox"]');
    if (cb) _setCB(cb, on);
    const roleBox = row.querySelector('[role="checkbox"]');
    if (roleBox) roleBox.setAttribute('aria-checked', on ? 'true' : 'false');
  },

  /**
   * Applies `.is-checked` to all visible rows based on state.
   */
  _updateAllAssignedRowClasses() {
    const panel = _assPanel(); if (!panel) return;
    const selected = _selSet(this.state.selectedAssignees);
    const users = this.state.assignableUsers;

    panel.querySelectorAll('li.checkbox-option').forEach(row => {
      const on = selected.has(_resolveKey(row, users));
      this._markRowChecked(row, on);
    });
  },

  /**
   * Returns whether the row is visually/semantically checked.
   * @param {HTMLElement} row
   * @returns {boolean}
   */
  _rowIsChecked(row) {
    const cb = row.querySelector?.('input[type="checkbox"]');
    if (cb) return !!cb.checked;
    const roleBox = row.querySelector?.('[role="checkbox"]');
    if (roleBox) return roleBox.getAttribute('aria-checked') === 'true';
    const aria = row.getAttribute?.('aria-checked');
    if (aria != null) return aria === 'true';
    const c = row.classList || { contains(){return false;} };
    return c.contains('is-checked') || c.contains('selected') || c.contains('checked');
  },

  /**
   * Toggles the visible checkbox/box by firing real click-like events.
   * @param {HTMLElement} row
   */
  _rowClickToggle(row) {
    const box = row.querySelector?.('.custom-checkbox');
    if (box) return _clickLike(box);
    const cb = row.querySelector?.('input[type="checkbox"]');
    if (cb) return _clickLike(cb);
    _clickLike(row);
  },

  /**
   * Heuristic pass: aligns UI with state by toggling rows that differ.
   */
  _syncAssignedRowsHeuristic() {
    const panel = _assPanel(); if (!panel) return;
    const users = this.state.assignableUsers;
    const wanted = _selSet(this.state.selectedAssignees);

    this._assigneeSyncGuard = true;

    panel.querySelectorAll('li.checkbox-option').forEach(row => {
      const key = _resolveKey(row, users);
      const shouldOn = wanted.has(key);
      const cb = row.querySelector?.('input[type="checkbox"]');
      const isOn = cb ? !!cb.checked : row.classList.contains('is-checked');
      if (isOn === shouldOn) return;

      this._rowClickToggle(row);
      row.classList.toggle('is-checked', shouldOn);
      if (cb) _setCB(cb, shouldOn);
    });

    setTimeout(() => { this._assigneeSyncGuard = false; this._updateContactBadges(); }, 0);
  },

  /**
   * Schedules several short sync passes after open and observes rerenders briefly.
   * @param {HTMLElement} panel
   */
  _scheduleOpenSync(panel) {
    const run = () => {
      this._applyAssignedSelectionToDropdown();
      if (typeof this._applyAssignedSelectionByClick === 'function') this._applyAssignedSelectionByClick();
      this._syncAssignedRowsHeuristic();
    };

    requestAnimationFrame(() => {
      run(); setTimeout(run, 80); setTimeout(run, 200);

      const obs = new MutationObserver(() => {
        this._applyAssignedSelectionToDropdown();
        this._updateAllAssignedRowClasses();
      });
      try { obs.observe(panel, { childList: true, subtree: true }); } catch {}

      setTimeout(() => { try { obs.disconnect(); } catch {} }, 1500);
    });
  },

  /**
   * Handles dropdown open: immediate sync + short-lived interaction tracking.
   */
  _onAssignedOpen() {
    const panel = _assPanel(); if (!panel) return;

    // immediate visual sync
    this._applyAssignedSelectionToDropdown();
    this._updateAllAssignedRowClasses();

    // short-lived interaction guard
    const start = (e) => { if (panel.contains(e.target)) this._userInteracting = true; };
    const end   = () => { this._userInteracting = false; };
    document.addEventListener('pointerdown', start, true);
    document.addEventListener('pointerup',   end,   true);

    this._scheduleOpenSync(panel);

    setTimeout(() => {
      document.removeEventListener('pointerdown', start, true);
      document.removeEventListener('pointerup',   end,   true);
    }, 1500);
  },

  /**
   * Wires opening triggers and a delegated change-handler for instant coloring.
   */
  _wireAssignedDropdownOpenSync() {
    const toggle = document.getElementById('assigned-to-toggle-btn');
    const input  = document.getElementById('assigned-to-input');

    toggle?.addEventListener('click', () => this._onAssignedOpen());
    input ?.addEventListener('click', () => this._onAssignedOpen());
    input ?.addEventListener('focus', () => this._onAssignedOpen());

    document.addEventListener('change', (e) => {
      const panel = _assPanel();
      if (!panel || !panel.contains(e.target)) return;

      const t = e.target;
      const isInput = t.matches?.('input[type="checkbox"]');
      const isRole  = t.matches?.('[role="checkbox"]');
      if (!isInput && !isRole) return;
      if (this._assigneeSyncGuard) return;

      const row = _rowFor(t);
      const on = isRole ? (t.getAttribute('aria-checked') === 'true') : !!t.checked;
      this._markRowChecked(row, on);
      this._captureAssignedSelection();
      this._updateAllAssignedRowClasses();
      this._updateContactBadges();
    });
  }
});

