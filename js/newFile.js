Object.assign(window.addTaskManager, {
  state: Object.assign({
    categories: ["Technical Task", "User Story"],
    selectedCategory: ""
  }, window.addTaskManager.state || {}),

  // Input entkoppeln: cloneNode entfernt fremde Event-Listener
  _initCategoryInput() {
    const oldInput = document.getElementById("category-input");
    if (!oldInput) return;
    const clone = oldInput.cloneNode(true);
    clone.readOnly = true; // verhindert Live-Filter von Fremdcode
    clone.setAttribute("aria-readonly", "true");
    oldInput.parentNode.replaceChild(clone, oldInput);
    this.elements = this.elements || {};
    this.elements.categoryInput = clone;
  },

  _getCategory() {
    return this.state.categories;
  },

  _renderCategoryOptions() {
    const ul = document.getElementById("category-options");
    const input = this.elements?.categoryInput || document.getElementById("category-input");
    ul.innerHTML = "";
    this._getCategory().forEach(cat => {
      const li = document.createElement("li");
      li.className = "dropdown-option";
      const span = document.createElement("span");
      span.className = "option-label";
      span.textContent = cat;
      li.appendChild(span);
      if (this.state.selectedCategory === cat) li.classList.add("selected");
      li.addEventListener("click", () => {
        input.value = cat;
        this.state.selectedCategory = cat;
        this._closeCategoryDropdown();
      });
      ul.appendChild(li);
    });
  },

  _openCategoryDropdown() {
    const ul = document.getElementById("category-options");
    if (!ul) return;
    this._renderCategoryOptions(); // immer beide rendern
    ul.classList.add("show", "active");
    ul.style.setProperty("display", "block", "important"); // überfährt generisches display:none
  },

  _closeCategoryDropdown() {
    const ul = document.getElementById("category-options");
    if (!ul) return;
    ul.classList.remove("show", "active");
    ul.style.removeProperty("display");
  },

  _initCategoryDropdown() {
    const btn = document.getElementById("category-toggle-btn");
    const input = this.elements?.categoryInput || document.getElementById("category-input");
    const ul = document.getElementById("category-options");
    if (!btn || !input || !ul) return;

    const openHandler = (e) => {
      e.stopPropagation(); // verhindert sofortiges Outside-Close
      if (ul.classList.contains("show")) {
        this._closeCategoryDropdown();
      } else {
        this._openCategoryDropdown();
      }
    };

    btn.addEventListener("click", openHandler);
    input.addEventListener("click", openHandler);

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".category-selector")) this._closeCategoryDropdown();
    });
  },

  // Optional: wenn ein Wert im Input steht, als selected markieren
  _syncCategoryFromInput() {
    const inputVal = (this.elements?.categoryInput || document.getElementById("category-input"))?.value?.trim();
    if (this._getCategory().includes(inputVal)) this.state.selectedCategory = inputVal;
  },


  /**
   * App entry point. Safe to call once on DOMContentLoaded.
   * @returns {Promise<void>}
   */
  async init() {
    this._initCategoryInput();
    this._initCategoryDropdown();
    this._protectPageAccess();
    this._cacheDOMElements();
    this._setupDatePicker();
    this._setDueDateMinToday();
    if (typeof initSubtaskControls === "function") initSubtaskControls();
    this.state.assignableUsers = await this._loadAssignableUsers();
    this._initializeDropdowns();
    this._renderCategoryOptions();
    this._enforceSelectionOnlyFields();
    this._setupPriorityButtons();
    this._registerEventListeners();
    this._addInputListeners();
  },


  _initCategoryInput() {
    const oldInput = document.getElementById("category-input");
    if (!oldInput) return;

    // cloneNode(true) kopiert KEINE Event-Listener → globale Filter hängen nicht mehr dran
    const clone = oldInput.cloneNode(true);
    clone.readOnly = true; // wichtig: keine Fremd-Filter mehr triggern
    clone.setAttribute("aria-readonly", "true");

    oldInput.parentNode.replaceChild(clone, oldInput);

    // Referenz merken, damit wir sie in anderen Methoden nutzen
    this.elements.categoryInput = clone;
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
      description: document.getElementById("category").value.trim(),
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
   * Returns available category options.
   * @returns {string[]}
   */
  _getCategory() {
    return this.state.categories;
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

  // 1) Quelle der Kategorien
  _getCategory() {
    return this.state.categories; // ["Technical Task","User Story"]
  },

  // 2) Render: UL (#category-options) mit LI + <span class="option-label">
  _renderCategoryOptions() {
    const ul = document.getElementById("category-options");
    const input = this.elements?.categoryInput || document.getElementById("category-input");
    ul.innerHTML = "";

    const cats = this._getCategory();
    cats.forEach(cat => {
      const li = document.createElement("li");
      li.className = "dropdown-option";

      const span = document.createElement("span");
      span.className = "option-label";
      span.textContent = cat;
      li.appendChild(span);

      if (this.state.selectedCategory === cat) li.classList.add("selected");

      li.addEventListener("click", () => {
        input.value = cat; // Wert sichtbar setzen
        this.state.selectedCategory = cat; // State merken
        document.getElementById("category-options").classList.remove("show", "active");
      });

      ul.appendChild(li);
    });

    // Debug
    const hidden = [...ul.children].filter(li => {
      const cs = getComputedStyle(li);
      return li.hidden || cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0";
    });
    console.log("[DEBUG] Optionen im Dropdown gerendert:", ul.children.length);
    console.log("[DEBUG] Sichtbare Optionen:", ul.children.length - hidden.length);
    console.log("[DEBUG] Versteckte Optionen:", hidden.map(li => li.textContent));
  },


  // 3) Toggle: gleiche Klassen wie deine CSS (.show/.active) + Input neutralisieren
  _initCategoryDropdown() {
    const btn = document.getElementById("category-toggle-btn");
    const ul = document.getElementById("category-options");

    btn?.addEventListener("click", () => {
      const willOpen = !ul.classList.contains("show");
      if (!willOpen) {
        ul.classList.remove("show", "active");
        return;
      }

      // Immer alles neu und ungefiltert rendern
      this._renderCategoryOptions();
      ul.classList.add("show", "active");
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".category-selector")) {
        ul.classList.remove("show", "active");
      }
    });
  },


  /**
   * Debug: misst UL/LI-Geometrie und Overflows NACH dem Öffnen.
   */
  _logCategoryDropdownMetrics() {
    const ul = document.getElementById("category-options");

    console.log("[DEBUG] UL rect:", ul.getBoundingClientRect());
    [...ul.children].forEach((li, i) => {
      console.log(`[DEBUG] LI ${i} rect (${li.textContent}):`, li.getBoundingClientRect());
    });

    let p = ul.parentElement;
    while (p) {
      const cs = getComputedStyle(p);
      if (cs.overflow !== "visible" || cs.overflowY !== "visible") {
        console.log("[DEBUG] Overflowing parent:", p.className || p.tagName, {
          overflow: cs.overflow,
          overflowY: cs.overflowY,
          rect: p.getBoundingClientRect()
        });
      }
      p = p.parentElement;
    }
  },


  /**
   * Clears subtasks via subtasks.js if available.
   */
  _resetSubtasks() {
    if (typeof clearSubtasks === "function") clearSubtasks();
  }
});
