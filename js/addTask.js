/**
 * Manages all functionality for the add task page.
 * @namespace addTaskManager
 */
const addTaskManager = {
  // Cached DOM
  elements: {},

  // App state
  state: {
    assignableUsers: [],
    categories: ["Technical Task", "User Story"],
    selectedAssignees: new Set(), // persistente Auswahl
  },

  /**
   * Setzt das sichtbare Icon in .custom-checkbox passend zum Zustand.
   * @private
   */

  // --- 1) SETUP & INIT ---
  async init() {
    this._protectPageAccess();
    this._cacheDOMElements();
    await this._initComponents();
    this._registerEventListeners();
    this._addInputListeners();
  },

  _protectPageAccess() {
    if (!window.USERKEY) {
      window.location.href = "../../index.html";
    }
  },

  _cacheDOMElements() {
    this.elements.form = document.querySelector(".task-form");
    this.elements.createBtn = this.elements.form ? this.elements.form.querySelector(".create-button") : null;
    this.elements.title = document.getElementById("title");
    this.elements.dueDate = document.getElementById("due-date");
    this.elements.categoryInput = document.getElementById("category-input");
    this.elements.prioButtons = document.querySelectorAll(".priority-btn");
    this.elements.clearBtn = this.elements.form ? this.elements.form.querySelector(".clear-button") : null;
    this.elements.subtaskInput = document.getElementById("subtasks");
    this.elements.selectedAssignees = document.getElementById("selected-assignees");
  },

  async _initComponents() {
    this._setupPriorityButtons();
    this._setupDatePicker();
    this._setDueDateMinToday();
    if (typeof initSubtaskControls === "function") initSubtaskControls();

    this.state.assignableUsers = await this._loadAssignableUsers();
    this._initializeDropdowns();
    this._enforceSelectionOnlyFields();
  },

  /**
   * Erzwingt „nur Auswahl, keine freie Eingabe“ für Due Date, Category, Assigned.
   */
  _enforceSelectionOnlyFields() {
    // Due Date
    if (this.elements.dueDate) {
      makeSelectionOnly(this.elements.dueDate, () => this._openDatePicker());
    }

    // Category
    const categoryInput = this.elements.categoryInput;
    const categoryToggleBtn = document.getElementById("category-toggle-btn");
    if (categoryInput && categoryToggleBtn) {
      makeSelectionOnly(categoryInput, () => categoryToggleBtn.click());
    }

    // Assigned-To
    const assignedInput = document.getElementById("assigned-to-input");
    const assignedToggleBtn = document.getElementById("assigned-to-toggle-btn");
    if (assignedInput && assignedToggleBtn) {
      makeSelectionOnly(assignedInput, () => assignedToggleBtn.click());
    }
  },

  _setDueDateMinToday() {
    const input = this.elements.dueDate;
    if (!input) return;

    const now = new Date();
    const local = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yyyy = local.getFullYear();
    const mm = String(local.getMonth() + 1).padStart(2, "0");
    const dd = String(local.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    input.setAttribute("min", todayStr);

    input.addEventListener("input", () => {
      if (input.value && input.value < todayStr) input.value = todayStr;
      input.setCustomValidity("");
    });

    input.addEventListener("blur", () => {
      if (input.value && input.value < todayStr) {
        this._showError(input, "Datum darf nicht in der Vergangenheit liegen.");
      } else {
        this._clearError(input);
      }
    });
  },

  _registerEventListeners() {
    if (this.elements.form) {
      this.elements.form.addEventListener("submit", (e) => this._handleFormSubmit(e));
    }
    if (this.elements.clearBtn) {
      this.elements.clearBtn.addEventListener("click", () => this._resetForm());
    }
  },

  _addInputListeners() {
    const fields = [this.elements.title, this.elements.dueDate, this.elements.categoryInput];
    fields.forEach((field) => {
      if (!field) return;
      field.addEventListener("input", () => this._clearError(field));
      field.addEventListener("blur", () => {
        if (field.value && field.value.trim()) this._clearError(field);
      });
    });
  },

  // --- DROPDOWNS ---
  _initializeDropdowns() {
    // Category (Single-Select)
    const catOptions = this.state.categories.map((c) => ({ name: c, value: c }));
    new CustomDropdown("category", catOptions, {
      onSelect: (opt) => {
        const input = this.elements.categoryInput;
        if (!input) return;
        const v = opt && (opt.value || opt.name) ? (opt.value || opt.name) : "";
        input.value = v;
        input.dispatchEvent(new Event("input"));
        this._clearError(input);
      }
    });

    // Assigned-To (Multi-Select)
    new CustomDropdown("assigned-to", this.state.assignableUsers, {
      isMultiSelect: true,
      getInitials: getInitials,
        isSelected: (opt) =>
   this.state.selectedAssignees.has((opt.email || "").trim().toLowerCase()),
      onChange: () => {
        this._captureAssignedSelection();
        this._updateContactBadges();
      }
      // falls verfügbar: onOpen: () => this._applyAssignedSelectionToDropdown()
    });

    this._wireAssignedDropdownOpenSync();
  },

  // --- 2) COMPONENT SETUP ---
  _setupPriorityButtons() {
    const urgentIcon = document.getElementById("prioUrgentIcon");
    const mediumIcon = document.getElementById("prioMediumIcon");
    const lowIcon = document.getElementById("prioLowIcon");

    if (urgentIcon && typeof HIGH_PRIORITY_SVG !== "undefined") urgentIcon.innerHTML = HIGH_PRIORITY_SVG;
    if (mediumIcon && typeof MID_PRIORITY_SVG !== "undefined") mediumIcon.innerHTML = MID_PRIORITY_SVG;
    if (lowIcon && typeof LOW_PRIORITY_SVG !== "undefined") lowIcon.innerHTML = LOW_PRIORITY_SVG;

    this.elements.prioButtons.forEach((b) => {
      b.setAttribute("aria-pressed", b.classList.contains("selected") ? "true" : "false");
    });

    this.elements.prioButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.elements.prioButtons.forEach((b) => {
          b.classList.remove("selected");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("selected");
        btn.setAttribute("aria-pressed", "true");
        this._clearError(btn.parentElement);
      });
    });
  },

  // --- Datepicker ---
  _openDatePicker() {
    const input = this.elements.dueDate;
    if (!input) return;

    const wasReadOnly = input.readOnly;
    const wasDisabled = input.disabled;

    input.readOnly = false;
    input.disabled = false;

    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
      } else {
        try { input.click(); } catch (e) {}
        input.focus();
      }
    } catch (e) {
      try { input.click(); } catch (e2) {}
      input.focus();
    } finally {
      input.readOnly = wasReadOnly;
      input.disabled = wasDisabled;
    }
  },

  _setupDatePicker() {
    const calendarToggle = document.getElementById("calendar-toggle");
    const input = this.elements.dueDate;
    if (!calendarToggle || !input) return;

    const withTemporarilyMutable = (el, fn) => {
      const wasReadOnly = el.readOnly;
      const wasDisabled = el.disabled;
      el.readOnly = false;
      el.disabled = false;
      try { fn(); } finally {
        el.readOnly = wasReadOnly;
        el.disabled = wasDisabled;
      }
    };

    const openNativePicker = () => {
      withTemporarilyMutable(input, () => {
        try {
          if (typeof input.showPicker === "function") { input.showPicker(); return; }
        } catch (e) {}
        try { input.click(); } catch (e2) {}
        input.focus();
        setTimeout(() => { try { input.click(); } catch (e3) {} }, 0);
      });
    };

    const open = (e) => { e.preventDefault(); openNativePicker(); };

    calendarToggle.addEventListener("pointerdown", open);
    calendarToggle.addEventListener("click", open);

    input.addEventListener("pointerdown", (e) => {
      if (input.readOnly) { e.preventDefault(); openNativePicker(); }
    });
  },

  // --- 3) FORM SUBMISSION & VALIDATION ---
  async _handleFormSubmit(e) {
    e.preventDefault();
    if (this._isFormValid()) {
      if (this.elements.createBtn) this.elements.createBtn.disabled = true;
      await this._saveTask();
      if (this.elements.createBtn) this.elements.createBtn.disabled = false;
    }
  },

  _isFormValid() {
    let isValid = true;
    const requiredFields = [this.elements.title, this.elements.dueDate, this.elements.categoryInput];

    requiredFields.forEach((field) => {
      if (!field || !field.value || !field.value.trim()) {
        this._showError(field || this.elements.form, "Dieses Feld ist erforderlich.");
        isValid = false;
      }
    });

    const min = this.elements.dueDate ? this.elements.dueDate.getAttribute("min") : null;
    const val = this.elements.dueDate ? this.elements.dueDate.value : null;
    if (val && min && val < min) {
      this._showError(this.elements.dueDate, "Datum darf nicht in der Vergangenheit liegen.");
      isValid = false;
    }

    if (!document.querySelector(".priority-btn.selected")) {
      const parent = this.elements.prioButtons[0] ? this.elements.prioButtons[0].parentElement : this.elements.form;
      this._showError(parent, "Bitte eine Priorität wählen.");
      isValid = false;
    }
    return isValid;
  },

  _showError(field, message) {
    if (!field) return;
    let formGroup = null;
    if (field.closest) formGroup = field.closest(".form-group, .priority-options");
    if (!formGroup) return;
    formGroup.classList.add("input-error");
    let errorEl = formGroup.querySelector(".field-error");
    if (!errorEl) {
      errorEl = document.createElement("div");
      errorEl.className = "field-error";
      formGroup.appendChild(errorEl);
    }
    errorEl.textContent = message;
  },

  _clearError(field) {
    if (!field) return;
    const formGroup = field.closest ? field.closest(".form-group, .priority-options") : null;
    if (formGroup) {
      formGroup.classList.remove("input-error");
      const err = formGroup.querySelector(".field-error");
      if (err) err.remove();
    }
  },

  _clearAllErrors() {
    document.querySelectorAll(".input-error").forEach((el) => el.classList.remove("input-error"));
    document.querySelectorAll(".field-error").forEach((el) => el.remove());
  },

  // --- 4) DATA ---
  async _loadAssignableUsers() {
    return await getAssignablePeople(window.USERKEY);
  },

_collectTaskData() {
  const selectedBtn = document.querySelector(".priority-btn.selected");
  const priority = selectedBtn && selectedBtn.dataset ? selectedBtn.dataset.priority : "low";

  // Subtasks aus dem UI -> universelles Objekt-Format
  const normalizedSubtasks = (this._getSubtasks() || [])
    .map(st => (typeof st === "string" ? st : String(st || "")))
    .map(s => s.trim())
    .filter(Boolean)
    .map(text => ({
      // 👉 Board-kompatibel:
      value: text,
      checked: false,

      // 👉 zusätzlich tolerant für andere Renderer:
      title: text,
      name: text,
      text,
      done: false,
      completed: false,
      isDone: false
    }));

  return {
    title: this.elements.title.value.trim(),
    description: document.getElementById("description").value.trim(),
    dueDate: this.elements.dueDate.value,
    priority,
    category: this.elements.categoryInput.value.trim(),
    assignee: this._getSelectedAssignees(),
    members: this._getSelectedMembers(),
    subtasks: normalizedSubtasks,      // ⬅️ jetzt mit value/checked
    status: "todo",
    column: "todoColumn",
    createdAt: new Date().toISOString(),
  };
},

  async _saveTask() {
    const taskData = this._collectTaskData();
    try {
      await postData("tasks", taskData);
      this._showSuccessPopup();
      this._resetForm();
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Could not save task. Please try again.");
    }
  },

  // --- 5) UI & EVENTS ---
  _resetForm() {
    if (this.elements.form) this.elements.form.reset();
    this._clearAllErrors();

    // Priority zurück auf "Medium"
    this.elements.prioButtons.forEach((b) => {
      b.classList.remove("selected");
      b.setAttribute("aria-pressed", "false");
    });
    const mediumBtn = Array.from(this.elements.prioButtons).find((b) => b.dataset.priority === "medium");
    if (mediumBtn) {
      mediumBtn.classList.add("selected");
      mediumBtn.setAttribute("aria-pressed", "true");
    }

    // Category Input leeren
    if (this.elements.categoryInput) this.elements.categoryInput.value = "";

    // Persistente Auswahl löschen
    this.state.selectedAssignees.clear();

    // Checkboxen (falls gerendert) abwählen
    document.querySelectorAll("#assigned-to-options input[type='checkbox']").forEach((cb) => { cb.checked = false; });

    // Chips leeren + verstecken
    if (this.elements.selectedAssignees) {
      this.elements.selectedAssignees.innerHTML = "";
      this.elements.selectedAssignees.classList.add("display-none");
    }

    // Subtasks leeren
    if (typeof clearSubtasks === "function") clearSubtasks();
  },

  _updateContactBadges() {
    const selectedEmails = this._getSelectedAssignees();
    const wrap = this.elements.selectedAssignees;
    if (!wrap) return;
    wrap.innerHTML = "";

    if (!selectedEmails.length) {
      wrap.classList.add("display-none");
      return;
    } else {
      wrap.classList.remove("display-none");
    }

    const MAX_VISIBLE = 3;
    const visible = selectedEmails.slice(0, MAX_VISIBLE);
    const hidden = selectedEmails.slice(MAX_VISIBLE);

    visible.forEach((email) => {
      const user = this.state.assignableUsers.find((u) => u.email === email);
      if (!user) return;
      const badge = document.createElement("div");
      badge.className = "contact-badge";
      badge.textContent = getInitials(user.name);
      if (user.color) badge.style.backgroundColor = user.color;
      badge.title = user.name;
      badge.setAttribute("aria-label", user.name);
      wrap.appendChild(badge);
    });

    if (hidden.length > 0) {
      const names = hidden
        .map((email) => {
          const u = this.state.assignableUsers.find((x) => x.email === email);
          return u ? u.name : null;
        })
        .filter(Boolean);

      const overflow = document.createElement("div");
      overflow.className = "contact-badge contact-badge--overflow";
      overflow.textContent = "+" + hidden.length;
      overflow.title = names.join(", ");
      overflow.setAttribute("aria-label", names.join(", "));
      wrap.appendChild(overflow);
    }
  },

  _showSuccessPopup() {
    const tpl = document.getElementById("boardSvgTemplate");
    const boardSvg = tpl ? tpl.innerHTML : "";
    const popup = document.createElement("div");
    popup.className = "task-added-popup";
    popup.innerHTML = '<span>Task added to board</span>' + boardSvg;
    document.body.appendChild(popup);
    setTimeout(() => {
      popup.classList.add("fade-out");
      popup.addEventListener("animationend", () => popup.remove(), { once: true });
    }, 3000);
  },


  // --- 6) UTILS (ASSIGNED-DROPDOWN) ---

/**
 * Liefert einen stabilen Key (z. B. E-Mail) für eine Optionszeile/Checkbox.
 * Sucht in input[data-value|data-email|value], dann in row[data-value|data-email], dann Fallback auf Namens-Text.
 * @private
 */
_resolveOptionKey(node) {
  const cb = (node.matches && node.matches('input[type="checkbox"]'))
    ? node
    : (node.querySelector ? node.querySelector('input[type="checkbox"]') : null);

  const row = (cb && cb.closest ? cb.closest('li, .dropdown-item, label') : null)
          || (node.closest ? node.closest('li, .dropdown-item, label') : null)
          || node;

  let key =
    (cb && cb.dataset && (cb.dataset.value || cb.dataset.email)) ||
    (cb && typeof cb.value !== "undefined" ? cb.value : "") ||
    (row && row.dataset && (row.dataset.value || row.dataset.email)) ||
    "";

  key = (key || "").trim().toLowerCase();

  if (!key && row) {
    const nameText = (row.textContent || "").trim().toLowerCase();
    const match = this.state.assignableUsers.find(u => u.name && u.name.trim().toLowerCase() === nameText);
    if (match && match.email) key = match.email.trim().toLowerCase();
  }
  return key;
},


  _captureAssignedSelection() {
    const boxes = document.querySelectorAll('#assigned-to-options input[type="checkbox"]');
    const sel = new Set();
    boxes.forEach((cb) => {
      const key = this._resolveOptionKey(cb);
      if (cb.checked && key) sel.add(key);
    });
    this.state.selectedAssignees = sel;
  },


/**
 * Spiegelt die Auswahl in die aktuell gerenderten Options-Elemente.
 * Arbeitet mit echten <input> ODER Custom-Checkboxen (role="checkbox").
 * @private
 */
_applyAssignedSelectionToDropdown() {
  const selected = new Set(
    Array.from(this.state.selectedAssignees || []).map(v => (v || '').trim().toLowerCase())
  );
  const panel = document.getElementById('assigned-to-options');
  if (!panel) return;

  // echte Inputs aktualisieren
  panel.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    const key = this._resolveOptionKey(cb);
    const on = selected.has(key);

    cb.checked = on;
    if (on) cb.setAttribute('checked', '');
    else cb.removeAttribute('checked');
    cb.setAttribute('aria-checked', on ? 'true' : 'false');

    const row = cb.closest ? cb.closest('li.checkbox-option') : null;
    if (row) row.classList.toggle('is-checked', on);
  });

  // evtl. zusätzliche role=checkbox-Elemente
  panel.querySelectorAll('[role="checkbox"]').forEach((el) => {
    const key = this._resolveOptionKey(el);
    const on = selected.has(key);

    el.setAttribute('aria-checked', on ? 'true' : 'false');

    const row = el.closest ? el.closest('li.checkbox-option') : el;
    if (row && row.classList) row.classList.toggle('is-checked', on);
  });
},


/**
 * Erkennt, ob eine Optionszeile „checked“ ist (input, aria, Klassen).
 * @private
 */
_rowIsChecked(row) {
  const cb = row.querySelector ? row.querySelector('input[type="checkbox"]') : null;
  if (cb) return !!cb.checked;

  const roleBox = row.querySelector ? row.querySelector('[role="checkbox"]') : null;
  if (roleBox) {
    const v = roleBox.getAttribute('aria-checked');
    if (v != null) return v === 'true';
  }

  const aria = row.getAttribute ? row.getAttribute('aria-checked') : null;
  if (aria != null) return aria === 'true';

  const cls = row.classList || { contains(){ return false; } };
  return cls.contains('is-checked') || cls.contains('selected') || cls.contains('checked');
},

/**
 * Klickt die *richtige* Stelle (sichtbarer Kasten), damit die interne UI (SVG & Klasse) mitzieht.
 * @private
 */
_rowClickToggle(row) {
  const fire = (el, type) => {
    if (!el) return;
    el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true }));
  };
  const clickLike = (el) => {
    if (!el) return;
    fire(el, 'pointerdown');
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
    el.dispatchEvent(new MouseEvent('mouseup',   { bubbles: true, cancelable: true, view: window }));
    el.dispatchEvent(new MouseEvent('click',     { bubbles: true, cancelable: true, view: window }));
  };

  const box = row.querySelector ? row.querySelector('.custom-checkbox') : null;
  if (box) { clickLike(box); return; }

  const cb = row.querySelector ? row.querySelector('input[type="checkbox"]') : null;
  if (cb) { clickLike(cb); return; }

  clickLike(row);
},


/**
 * Heuristischer Sync: geht Zeile für Zeile durch und klickt,
 * bis der visuelle Zustand dem State entspricht.
 * @private
 */
_syncAssignedRowsHeuristic() {
  const panel = document.getElementById('assigned-to-options');
  if (!panel) return;

  const rows = panel.querySelectorAll('li.checkbox-option');
  if (!rows.length) return;

  const wanted = new Set(
    Array.from(this.state.selectedAssignees || []).map(v => (v || '').trim().toLowerCase())
  );

  this._assigneeSyncGuard = true;

  rows.forEach((row) => {
    const key = this._resolveOptionKey(row);
    if (!key) return;

    const shouldOn = wanted.has(key);
    const cb = row.querySelector ? row.querySelector('input[type="checkbox"]') : null;
    const isOn = cb ? !!cb.checked : row.classList.contains('is-checked');

    if (isOn !== shouldOn) {
      // interne UI toggeln (sichtbares Target klicken)
      this._rowClickToggle(row);

      // Zustand hart nachziehen (nur Klasse + input-Attr., KEIN SVG innerHTML)
      row.classList.toggle('is-checked', shouldOn);
      if (cb) {
        cb.checked = shouldOn;
        if (shouldOn) cb.setAttribute('checked', '');
        else cb.removeAttribute('checked');
        cb.setAttribute('aria-checked', shouldOn ? 'true' : 'false');
      }
    }
  });

  setTimeout(() => {
    this._assigneeSyncGuard = false;
    this._updateContactBadges();
  }, 0);
},

  
/**
 * Setzt Auswahl notfalls per echten Klicks, damit interne Dropdown-UI/Styles übernehmen.
 * @private
 */
_applyAssignedSelectionByClick() {
  const selected = new Set(Array.from(this.state.selectedAssignees || []).map(v => (v || "").trim().toLowerCase()));
  const panel = document.getElementById('assigned-to-options');
  if (!panel) return;

  const clickEl = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

  this._assigneeSyncGuard = true;

  // Inputs
  panel.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    const key = this._resolveOptionKey(cb);
    const shouldBeOn = selected.has(key);
    if (cb.checked !== shouldBeOn) clickEl(cb);
  });

  // Custom role=checkbox
  panel.querySelectorAll('[role="checkbox"]').forEach(box => {
    const key = this._resolveOptionKey(box);
    const shouldBeOn = selected.has(key);
    const current = box.getAttribute('aria-checked') === 'true';
    if (current !== shouldBeOn) clickEl(box);
  });

  setTimeout(() => { this._assigneeSyncGuard = false; this._updateContactBadges(); }, 0);
},


/**
 * Synchronisiert die Checkboxen jedes Mal beim Öffnen des Assigned-Dropdowns.
 * @private
 */
_wireAssignedDropdownOpenSync() {
  const toggle     = document.getElementById("assigned-to-toggle-btn");
  const inputField = document.getElementById("assigned-to-input");
  const getPanel   = () => document.getElementById("assigned-to-options");

  // während der User im Panel klickt, pausieren wir unseren Pump
  let userInteracting = false;
  const markInteractStart = (e) => {
    const p = getPanel();
    if (p && p.contains(e.target)) userInteracting = true;
  };
  const markInteractEnd = () => { userInteracting = false; };

  const runOneSyncPass = () => {
    if (userInteracting) return;
    this._applyAssignedSelectionToDropdown();
    if (typeof this._applyAssignedSelectionByClick === "function") {
      this._applyAssignedSelectionByClick();
    }
    this._syncAssignedRowsHeuristic();
  };

  const onOpen = () => {
    // pro Öffnen: frisch aufgelöstes Panel verwenden
    const panel = getPanel();
    if (!panel) return;

    // globale Pointer-Listener nur kurz aktiv, um Interaktion zu erkennen
    document.addEventListener("pointerdown", markInteractStart, true);
    document.addEventListener("pointerup",   markInteractEnd,   true);

    // mehrere kurze Sync-Pässe (wegen asynchronem Rendern/Animationen)
    requestAnimationFrame(() => {
      runOneSyncPass();               // direkt nach dem ersten Frame
      setTimeout(runOneSyncPass, 80); // kleiner zweiter Pass
      setTimeout(runOneSyncPass, 200);// letzter Pass

      // zusätzlich: MutationObserver nur für dieses Panel
      const obs = new MutationObserver(() => runOneSyncPass());
      try { obs.observe(panel, { childList: true, subtree: true }); } catch {}
      setTimeout(() => {
        try { obs.disconnect(); } catch {}
        document.removeEventListener("pointerdown", markInteractStart, true);
        document.removeEventListener("pointerup",   markInteractEnd,   true);
      }, 1500); // nach 1,5s wieder abklemmen
    });
  };

  // Öffnen-Trigger
  toggle?.addEventListener("click", onOpen);
  inputField?.addEventListener("click", onOpen);
  inputField?.addEventListener("focus", onOpen);

  // WICHTIG: change-Listener delegiert, damit er auch bei neuem Panel greift
  document.addEventListener("change", (e) => {
    const panel = getPanel();
    if (!panel || !panel.contains(e.target)) return;
    const t = e.target;
    if (t && t.matches && (t.matches('input[type="checkbox"]') || t.matches('[role="checkbox"]'))) {
      if (this._assigneeSyncGuard) return; // eigene Sync-Klicks ignorieren
      this._captureAssignedSelection();
      this._updateContactBadges();
    }
  });
},


  // --- 7) GENERIC HELPERS ---
  _filterOption(option, filter) {
    const optionName = (typeof option === "string") ? option : option.name;
    return optionName.toLowerCase().includes(filter);
  },

  _getSelectedAssignees() {
    if (this.state.selectedAssignees && this.state.selectedAssignees.size) {
      return Array.from(this.state.selectedAssignees);
    }
    return Array.from(
      document.querySelectorAll('#assigned-to-options input[type="checkbox"]:checked')
    ).map((cb) => {
      if (cb.dataset && cb.dataset.value) return cb.dataset.value.trim().toLowerCase();
      if (typeof cb.value !== "undefined") return (cb.value || "").trim().toLowerCase();
      return "";
    }).filter(Boolean);
  },

  _getSelectedMembers() {
    const boxes = document.querySelectorAll('input[name="member"]:checked');
    return Array.from(boxes).map((cb) => cb.value);
  },

  _getSubtasks() {
    return typeof getSubtaskListData === "function" ? getSubtaskListData() : [];
  }
}; // END addTaskManager

/**
 * Macht ein Input feld „nur auswählbar“: keine Tastatureingabe, kein Paste/Drop.
 */
function makeSelectionOnly(input, openFn) {
  if (!input) return;

  input.setAttribute("readonly", "readonly");

  input.addEventListener("click", (e) => {
    e.preventDefault();
    if (typeof openFn === "function") openFn();
  });

  input.addEventListener("keydown", (e) => {
    const allowed = ["Tab", "Shift", "Alt", "Control", "Meta", "Escape", "ArrowLeft", "ArrowRight", "Home", "End"];
    if (allowed.indexOf(e.key) !== -1) return;
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      if (typeof openFn === "function") openFn();
      return;
    }
    e.preventDefault();
  });

  input.addEventListener("paste", (e) => e.preventDefault());
  input.addEventListener("drop", (e) => e.preventDefault());
};


// --- SCRIPT ENTRY POINT ---
document.addEventListener("DOMContentLoaded", () => {
  window.USERKEY = window.USERKEY || localStorage.getItem("userKey");
  addTaskManager.init();
});
