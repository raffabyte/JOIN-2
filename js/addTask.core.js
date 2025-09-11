/**
 * Global manager object for the Add Task page.
 * Core orchestration: init, events, validation, data, save, reset.
 */
window.addTaskManager = window.addTaskManager || {
  elements: {},
  state: {
    assignableUsers: [],
    categories: ["Technical Task", "User Story"],
    selectedAssignees: new Set(),
  },


  /**
   * App entry point. Safe to call once on DOMContentLoaded.
   * @returns {Promise<void>}
   */
  async init() {
    this._protectPageAccess();
    this._cacheDOMElements();
    this._setupDatePicker();
    this._setDueDateMinToday();
    if (typeof initSubtaskControls === "function") initSubtaskControls();
    this.state.assignableUsers = await this._loadAssignableUsers();
    this._initializeDropdowns();
    this._enforceSelectionOnlyFields();
    this._setupPriorityButtons();
    this._registerEventListeners();
    this._addInputListeners();
},


  /**
   * Redirects to login if user key is missing.
   */
  _protectPageAccess() {
    if (!window.USERKEY) window.location.href = "../../index.html";
  },


  /**
   * Registers global form events.
   */
  _registerEventListeners() {
    const f = this.elements.form, clr = this.elements.clearBtn;
    if (f) f.addEventListener("submit", (e) => this._handleFormSubmit(e));
    if (clr) clr.addEventListener("click", () => this._resetForm());
  },


  /**
   * Clears errors while user types.
   */
  _addInputListeners() {
    [this.elements.title, this.elements.dueDate, this.elements.categoryInput]
      .forEach((field) => {
        if (!field) return;
        field.addEventListener("input", () => this._clearError(field));
        field.addEventListener("blur", () => {
          if (field.value && field.value.trim()) this._clearError(field);
        });
      });
  },


  /**
   * Handles submit → validate → save → re-enable button.
   * @param {SubmitEvent} e
   */
  async _handleFormSubmit(e) {
    e.preventDefault();
    if (!this._isFormValid()) return;
    if (this.elements.createBtn) this.elements.createBtn.disabled = true;
    await this._saveTask();
    if (this.elements.createBtn) this.elements.createBtn.disabled = false;
  },


  /**
   * Master validation orchestrator.
   * @returns {boolean}
   */
  _isFormValid() {
    let ok = true;
    ok &= this._validateRequiredFields();
    ok &= this._validateDateMin();
    ok &= this._validatePriority();
    return !!ok;
  },


  /**
   * Inline error renderer.
   * @param {HTMLElement} field
   * @param {string} message
   */
  _showError(field, message) {
    if (!field) return;
    const group = this._formGroupOf(field);
    if (!group) return;
    group.classList.add("input-error");
    const el = this._ensureErrorEl(group);
    el.textContent = message;
  },


  /**
   * Clears error from a field group.
   * @param {HTMLElement} field
   */
  _clearError(field) {
    if (!field) return;
    const group = this._formGroupOf(field);
    if (!group) return;
    group.classList.remove("input-error");
    const err = group.querySelector(".field-error");
    if (err) err.remove();
  },


  /**
   * Clears all errors in form.
   */
  _clearAllErrors() {
    document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
    document.querySelectorAll(".field-error").forEach(el => el.remove());
  },


  /**
   * Collects normalized task data from UI.
   * @returns {Object}
   */
  _collectTaskData() {
    return {
      title: this.elements.title.value.trim(),
      description: document.getElementById("description").value.trim(),
      dueDate: this.elements.dueDate.value,
      priority: this._getSelectedPriority(),
      category: this.elements.categoryInput.value.trim(),
      assignee: this._getSelectedAssignees(),
      members: this._getSelectedMembers(),
      subtasks: this._normalizeSubtasks(this._getSubtasks() || []),
      status: "todo",
      column: "todoColumn",
      createdAt: new Date().toISOString(),
    };
  },


  /**
   * Persists the task and shows success UI.
   */
  async _saveTask() {
    try {
      await postData("tasks", this._collectTaskData());
      this._showSuccessPopup();
      this._resetForm();
    } catch (err) {
      console.error("Error saving task:", err);
      alert("Could not save task. Please try again.");
    }
  },


  /**
   * Resets form and UI state.
   */
  _resetForm() {
    if (this.elements.form) this.elements.form.reset();
    this._clearAllErrors();
    this._resetPriorityToMedium();
    if (this.elements.categoryInput) this.elements.categoryInput.value = "";
    this._resetAssignees();
    this._resetSubtasks();
  },


/**
 * Returns selected assignees as contact names.
 * @returns {string[]}
 */
_getSelectedAssignees() {
  const emails = this.state.selectedAssignees?.size
    ? Array.from(this.state.selectedAssignees)
    : Array.from(document.querySelectorAll('#assigned-to-options input[type="checkbox"]:checked'))
        .map(cb => (cb.dataset?.email || cb.value || "").trim().toLowerCase())
        .filter(Boolean);
return emails.map(e => {
    const u = this.state.assignableUsers.find(x => x.email?.toLowerCase() === e);
    return u?.name || e;
  }).filter(Boolean);
},


  /**
   * Returns selected members (separate group).
   * @returns {string[]}
   */
  _getSelectedMembers() {
    return Array.from(document.querySelectorAll('input[name="member"]:checked'))
      .map(cb => cb.value);
  },


  /**
   * Gets subtask texts (bridged to subtasks.js).
   * @returns {string[]}
   */
  _getSubtasks() {
    return typeof getSubtaskListData === "function" ? getSubtaskListData() : [];
  },


  /**
   * Required fields validation.
   * @returns {boolean}
   */
  _validateRequiredFields() {
    let ok = true;
    [this.elements.title, this.elements.dueDate, this.elements.categoryInput]
      .forEach(f => {
        if (!f || !f.value || !f.value.trim()) {
          this._showError(f || this.elements.form, "This field is required.");
          ok = false;
        }
      });
    return ok;
  },


  /**
   * Min date (today) validation.
   * @returns {boolean}
   */
  _validateDateMin() {
    const min = this.elements.dueDate?.getAttribute("min");
    const val = this.elements.dueDate?.value;
    if (val && min && val < min) {
      this._showError(this.elements.dueDate, "Date cannot be in the past.");
      return false;
    }
    return true;
  },


  /**
   * Priority selection validation.
   * @returns {boolean}
   */
  _validatePriority() {
    const sel = document.querySelector(".priority-btn.selected");
    if (sel) return true;
    const parent = this.elements.prioButtons[0]?.parentElement || this.elements.form;
    this._showError(parent, "Please select a priority.");
    return false;
  },


  /**
   * Returns group wrapper for a field.
   * @param {HTMLElement} field
   */
  _formGroupOf(field) {
    return field.closest?.(".form-group, .priority-options") || null;
  },
  

  /**
   * Ensures and returns a .field-error element in group.
   * @param {HTMLElement} group
   */
  _ensureErrorEl(group) {
    let el = group.querySelector(".field-error");
    if (!el) {
      el = document.createElement("div");
      el.className = "field-error";
      group.appendChild(el);
    }
    return el;
  },


/**
 * Returns selected priority in the exact format the board expects.
 * @returns {"HighPriority"|"MidPriority"|"LowPriority"}
 */
_getSelectedPriority() {
  const btn = document.querySelector(".priority-btn.selected");
  const val = btn?.dataset?.priority || "low"; // "high" | "medium" | "low"
  const MAP = { high: "HighPriority", medium: "MidPriority", low: "LowPriority" };
  return MAP[val] || "LowPriority";
},


  /**
   * Normalizes subtasks to a board-friendly shape.
   * @param {string[]} items
   * @returns {Array<Object>}
   */
_normalizeSubtasks(items) {
  return (items || [])
    .map(s => (typeof s === "string" ? s : String(s || "")))
    .map(t => t.trim())
    .filter(Boolean)
    .map(value => ({ value, checked: false }));
},


  /**
   * Resets priority to "Medium".
   */
  _resetPriorityToMedium() {
    this.elements.prioButtons.forEach(b => {
      b.classList.remove("selected");
      b.setAttribute("aria-pressed", "false");
    });
    const m = Array.from(this.elements.prioButtons).find(b => b.dataset.priority === "medium");
    if (m) { m.classList.add("selected"); m.setAttribute("aria-pressed", "true"); }
  },


  /**
   * Clears assignee selection + chips.
   */
  _resetAssignees() {
    this.state.selectedAssignees.clear();
    document.querySelectorAll("#assigned-to-options input[type='checkbox']").forEach(cb => cb.checked = false);
    const wrap = this.elements.selectedAssignees;
    if (wrap) { wrap.innerHTML = ""; wrap.classList.add("display-none"); }
  },


  /**
   * Clears subtasks via subtasks.js if available.
   */
  _resetSubtasks() {
    if (typeof clearSubtasks === "function") clearSubtasks();
  }
};


/* ---- Entry point ---- */
(() => {
  const run = () => addTaskManager.init();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(run, 0), { once: true });
  } else {
    setTimeout(run, 0);
  }
})();


Object.assign(window.addTaskManager, {
  /**
   * Loads user contact
   */
  async _loadAssignableUsers() {
    const [contacts, own] = await Promise.all([
      loadData(`users/${USERKEY}/contacts`),
      loadData(`users/${USERKEY}`)
    ]);
    const list = this._buildAssignableList(contacts, own);
    const map = new Map();
    list.forEach(u => map.set((u.email || u.name).toLowerCase(), u));
    const out = Array.from(map.values()).sort((a,b) => a.name.localeCompare(b.name));
    return out;
  },


  /**
   * Builds list from own user and contact info.
  */
  _buildAssignableList(contacts, own) {
    const list = [];
    if (own) {
      const eml = (own.email || "").trim().toLowerCase();
      list.push({ name: (own.name || "").trim() || this._nameFromEmail(eml),
                  email: eml, color: own.color || getRandomColor?.() });
    }
    Object.values(contacts || {}).forEach(c => {
      const eml = (c.email || "").trim().toLowerCase();
      const nm  = (c.name  || "").trim() || this._nameFromEmail(eml);
      if (!eml && !nm) return;
      list.push({ name: nm, email: eml, color: c.color });
    });
    return list;
  },


  _nameFromEmail(em) {
    return (em || "")
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, m => m.toUpperCase()) || "Unknown";
  },
});