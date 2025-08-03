/**
 * Manages all functionality for the add task page.
 * @namespace addTaskManager
 */
const addTaskManager = {
  /**
   * Cached DOM elements for easy access.
   * @property {object} elements
   */
  elements: {},

  /**
   * Holds the state of the application, like loaded users.
   * @property {object} state
   */
  state: {
    assignableUsers: [],
    categories: ["Technical Task", "User Story"],
  },

  /**
   * Initializes the entire add task page.
   * This is the main entry point.
   */
  async init() {
    this._protectPageAccess();
    this._cacheDOMElements();
    await this._initComponents();
    this._registerEventListeners();
	this._addInputListeners(); 
  },

  // --- 1. SETUP & INITIALIZATION ---

  /**
   * Redirects to the login page if no user is logged in.
   * @private
   */
  _protectPageAccess() {
    if (!USERKEY) {
      window.location.href = "../../index.html";
    }
  },

  /**
   * Caches frequently used DOM elements to avoid repeated lookups.
   * @private
   */
  _cacheDOMElements() {
    this.elements.form = document.querySelector(".task-form");
    this.elements.title = document.getElementById("title");
    this.elements.dueDate = document.getElementById("due-date");
    this.elements.categoryInput = document.getElementById("category-input");
    this.elements.assignedInput = document.getElementById("assigned-to-input");
    this.elements.prioButtons = document.querySelectorAll(".priority-btn");
    this.elements.createBtn =
      this.elements.form.querySelector(".create-button");
    this.elements.clearBtn = this.elements.form.querySelector(".clear-button");
    this.elements.subtaskInput = document.getElementById("subtasks");
    this.elements.selectedAssignees =
      document.getElementById("selected-assignees");
  },

  /**
   * Initializes all page components like dropdowns and priority buttons.
   * @private
   */
  async _initComponents() {
    this._setupPriorityButtons();
    this._setupDatePicker();
    initSubtaskControls();
    this.state.assignableUsers = await this._loadAssignableUsers();
    this._setupAllDropdowns();
  },

  /**
   * Registers all event listeners for the page.
   * @private
   */
  _registerEventListeners() {
    this.elements.form.addEventListener("submit", (e) =>
      this._handleFormSubmit(e)
    );
    this.elements.clearBtn?.addEventListener("click", () => this._resetForm());
    this.elements.subtaskInput?.addEventListener("keydown", (e) =>
      this._handleSubtaskInput(e)
    );
    document.addEventListener("click", (e) => this._handleOutsideClick(e));
    document.addEventListener("change", (e) => {
      if (e.target.name === "assigned") this._updateContactBadges();
    });
  },

  // --- 2. COMPONENT SETUP ---
  /**
   * Sets up click events and injects SVG icons for priority buttons.
   * @private
   */
  _setupPriorityButtons() {
    const urgentIcon = document.getElementById("prioUrgentIcon");
    const mediumIcon = document.getElementById("prioMediumIcon");
    const lowIcon = document.getElementById("prioLowIcon");

    if (urgentIcon) urgentIcon.innerHTML = HIGH_PRIORITY_SVG;
    if (mediumIcon) mediumIcon.innerHTML = MID_PRIORITY_SVG;
    if (lowIcon) lowIcon.innerHTML = LOW_PRIORITY_SVG;

    this.elements.prioButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.elements.prioButtons.forEach((b) =>
          b.classList.remove("selected")
        );
        btn.classList.add("selected");
        this._clearError(btn.parentElement);
      });
    });
  },

  /**
   * Enables the native date picker to be opened via a button click.
   * @private
   */
  _setupDatePicker() {
    const calendarToggle = document.getElementById("calendar-toggle");
    calendarToggle?.addEventListener("click", () =>
      this.elements.dueDate.showPicker()
    );
  },

  /**
   * Initializes all dropdowns on the page.
   * @private
   */
  _setupAllDropdowns() {
    this._setupDropdown("category", this.state.categories);
    this._setupDropdown("assigned-to", this.state.assignableUsers, true);
  },

  /**
   * Sets up a single dropdown's toggle and input listeners.
   * @param {string} idPrefix
   * @param {Array} options
   * @param {boolean} [isMultiSelect=false]
   * @private
   */
  _setupDropdown(idPrefix, options, isMultiSelect = false) {
    const input = document.getElementById(`${idPrefix}-input`);
    const toggle = document.getElementById(`${idPrefix}-toggle-btn`);
    toggle?.addEventListener("click", (e) => {
      e.stopPropagation();
      this._toggleDropdown(idPrefix, options, isMultiSelect);
    });
    input?.addEventListener("input", () =>
      this._renderDropdownOptions(idPrefix, options, isMultiSelect)
    );
  },

  // --- 3. DROPDOWN LOGIC ---

  /**
   * Toggles the visibility of a dropdown menu.
   * @param {string} idPrefix
   * @param {Array} options
   * @param {boolean} isMultiSelect
   * @private
   */
  _toggleDropdown(idPrefix, options, isMultiSelect) {
    const dropdown = document.getElementById(`${idPrefix}-options`);
    const toggle = document.getElementById(`${idPrefix}-toggle-btn`);
    const isOpen = dropdown.classList.contains("show");
    this._closeAllDropdowns();
    if (!isOpen) {
      dropdown.classList.add("show");
      toggle.classList.add("open");
      this._renderDropdownOptions(idPrefix, options, isMultiSelect);
    }
  },

  /**
   * Renders the options for a specific dropdown, filtering by input value.
   * @param {string} idPrefix
   * @param {Array} options
   * @param {boolean} isMultiSelect
   * @private
   */
  _renderDropdownOptions(idPrefix, options, isMultiSelect) {
    const dropdown = document.getElementById(`${idPrefix}-options`);
    const input = document.getElementById(`${idPrefix}-input`);
    const filter = input.value.toLowerCase();
    dropdown.innerHTML = "";

    options
      .filter((opt) => this._filterOption(opt, filter))
      .forEach((option) => {
        const li = this._createDropdownItem(option, idPrefix, isMultiSelect);
        dropdown.appendChild(li);
      });
  },

  /**
   * Creates a single list item element for a dropdown.
   * @param {object|string} option
   * @param {string} idPrefix
   * @param {boolean} isMultiSelect
   * @returns {HTMLLIElement}
   * @private
   */
  _createDropdownItem(option, idPrefix, isMultiSelect) {
    const li = document.createElement("li");
    li.innerHTML = this._getOptionHTML(option, isMultiSelect);
    if (!isMultiSelect) {
      const input = document.getElementById(`${idPrefix}-input`);
      li.addEventListener("click", () =>
        this._selectSingleOption(input, option)
      );
    }
    return li;
  },

  /**
   * Generates the inner HTML for a dropdown option.
   * @param {object|string} option
   * @param {boolean} isMultiSelect
   * @returns {string}
   * @private
   */
  _getOptionHTML(option, isMultiSelect) {
    if (typeof option === "string") return `<span>${option}</span>`;
    const initials = this._getInitials(option.name);
    const checked = document.querySelector(`input[value="${option.email}"]`)
      ?.checked
      ? "checked"
      : "";
    return `
      <span class="initial-badge-circle">${initials}</span>
      <span class="contact-name">${option.name}</span>
      <input type="checkbox" name="assigned" value="${option.email}" ${checked}>
    `;
  },

  /**
   * Closes all open dropdown menus.
   * @private
   */
  _closeAllDropdowns() {
    document
      .querySelectorAll(".dropdown-options.show")
      .forEach((d) => d.classList.remove("show"));
    document
      .querySelectorAll(".dropdown-toggle.open")
      .forEach((t) => t.classList.remove("open"));
  },

  /**
   * Handles selecting an option from a single-select dropdown.
   * @param {HTMLInputElement} input
   * @param {string} option
   * @private
   */
  _selectSingleOption(input, option) {
    input.value = option;
    this._closeAllDropdowns();
    this._clearError(input);
  },

  // --- 4. FORM SUBMISSION & VALIDATION ---

  /**
   * Handles the form submission event.
   * @param {Event} e
   * @private
   */
  async _handleFormSubmit(e) {
    e.preventDefault();
    if (this._isFormValid()) {
      this.elements.createBtn.disabled = true;
      await this._saveTask();
      this.elements.createBtn.disabled = false;
    }
  },

  /**
   * Validates the entire form.
   * @returns {boolean}
   * @private
   */
  _isFormValid() {
    let isValid = true;
    const requiredFields = [
      this.elements.title,
      this.elements.dueDate,
      this.elements.categoryInput,
    ];
    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        this._showError(field, "This field is required.");
        isValid = false;
      }
    });
    if (!document.querySelector(".priority-btn.selected")) {
      this._showError(
        this.elements.prioButtons[0].parentElement,
        "Please select a priority."
      );
      isValid = false;
    }
    return isValid;
  },

  /**
   * Shows a validation error message for a given field.
   * @param {HTMLElement} field
   * @param {string} message
   * @private
   */
  _showError(field, message) {
    const formGroup = field.closest(".form-group, .priority-options");
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

/**
 * Adds event listeners to clear validation errors on user input
 * for fields that don't have it yet.
 * @private
 */
_addInputListeners() {
  const fieldsToClear = [
    this.elements.title,
    this.elements.dueDate,
  ];

  fieldsToClear.forEach((field) => {
    field.addEventListener("input", () => this._clearError(field));
  });
},

  /**
   * Clears validation errors from a field.
   * @param {HTMLElement} field
   * @private
   */
  _clearError(field) {
    const formGroup = field.closest(".form-group, .priority-options");
    formGroup?.classList.remove("input-error");
    formGroup?.querySelector(".field-error")?.remove();
  },

  /**
   * Clears all validation errors from the form.
   * @private
   */
  _clearAllErrors() {
    document
      .querySelectorAll(".input-error")
      .forEach((el) => el.classList.remove("input-error"));
    document.querySelectorAll(".field-error").forEach((el) => el.remove());
  },

  // --- 5. DATA HANDLING (FIREBASE) ---

  /**
   * Loads assignable users from the database.
   * @returns {Promise<Array>}
   * @private
   */
  async _loadAssignableUsers() {
    try {
      const users = await loadData("users");
      return Object.values(users).map((user) => ({
        name: this._extractNameFromEmail(user.email),
        email: user.email,
      }));
    } catch (error) {
      console.error("Error loading users:", error);
      return [];
    }
  },

/**
   * Collects all form data into a task object.
   * @returns {object}
   * @private
   */
  _collectTaskData() {
    return {
      title: this.elements.title.value.trim(),
      description: document.getElementById("description").value.trim(),
      dueDate: this.elements.dueDate.value,
      priority:
        document.querySelector(".priority-btn.selected")?.dataset.priority || "low",
      category: this.elements.categoryInput.value.trim(),
      assignee: this._getSelectedAssignees(),
      members: this._getSelectedMembers(),
      subtasks: this._getSubtasks(),
      status: "todo", // Dieses Feld ist gut, wird aber vom Board nicht zur Gruppierung genutzt
      
      // HIER DIE ENTSCHEIDENDE ERGÄNZUNG:
      column: "todoColumn", 

      createdAt: new Date().toISOString(),
    };
  },

/**
   * Saves the collected task data to Firebase.
   * @private
   */
  async _saveTask() {
    const taskData = this._collectTaskData();
    try {
      // KORREKTUR: Speichere direkt unter 'tasks'
      await postData('tasks', taskData); 
      
      this._showSuccessPopup();
      this._resetForm();
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Could not save task. Please try again.");
    }
  },

  // --- 6. UI & EVENT HANDLERS ---

  /**
   * Resets the entire form to its initial state.
   * @private
   */
  _resetForm() {
    this.elements.form.reset();
    this._clearAllErrors();
    document
      .querySelectorAll(".selected")
      .forEach((el) => el.classList.remove("selected"));
    this.elements.selectedAssignees.innerHTML = "";
    document.getElementById("subtask-list").innerHTML = "";
  },

  /**
   * Handles 'Enter' key press in the subtask input field.
   * @param {Event} e
   * @private
   */
  _handleSubtaskInput(e) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const value = this.elements.subtaskInput.value.trim();
    if (value) {
      this._addSubtaskToList(value);
      this.elements.subtaskInput.value = "";
    }
  },

  /**
   * Adds a new subtask item to the subtask list in the DOM.
   * @param {string} subtaskText
   * @private
   */
  _addSubtaskToList(subtaskText) {
    const list = document.getElementById("subtask-list");
    const li = document.createElement("li");
    li.textContent = subtaskText;
    list.appendChild(li);
  },

  /**
   * Handles clicks outside of dropdowns to close them.
   * @param {Event} e
   * @private
   */
  _handleOutsideClick(e) {
    if (!e.target.closest(".dropdown")) {
      this._closeAllDropdowns();
    }
  },

  /**
   * Updates the display of selected contact badges.
   * @private
   */
  _updateContactBadges() {
    const selected = this._getSelectedAssignees();
    this.elements.selectedAssignees.innerHTML = "";
    selected.forEach((email) => {
      const user = this.state.assignableUsers.find((u) => u.email === email);
      if (user) {
        const badge = document.createElement("div");
        badge.className = "contact-badge";
        badge.textContent = this._getInitials(user.name);
        this.elements.selectedAssignees.appendChild(badge);
      }
    });
  },

  /**
   * Displays a temporary "Task added" confirmation popup.
   * @private
   */
  _showSuccessPopup() {
    const boardSvg = document.getElementById("boardSvgTemplate").innerHTML;
    const popup = document.createElement("div");
    popup.className = "task-added-popup";
    popup.innerHTML = `
      <span>Task added to board</span>
      ${boardSvg}
    `;

    document.body.appendChild(popup);
    setTimeout(() => {
      popup.classList.add("fade-out");
      popup.addEventListener("animationend", () => popup.remove(), {
        once: true,
      });
    }, 3000);
  },

  // --- 7. UTILITY HELPERS ---

  /**
   * Extracts and formats a name from an email address.
   * @param {string} email
   * @returns {string}
   * @private
   */
  _extractNameFromEmail(email) {
    if (!email) return "Unknown";
    return email
      .split("@")[0]
      .replace(/[._]/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  },

  /**
   * Gets the initials from a full name.
   * @param {string} name
   * @returns {string}
   * @private
   */
  _getInitials(name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  },

  /**
   * Filters dropdown options based on user input.
   * @param {object|string} option
   * @param {string} filter
   * @returns {boolean}
   * @private
   */
  _filterOption(option, filter) {
    const optionName = typeof option === "string" ? option : option.name;
    return optionName.toLowerCase().includes(filter);
  },

  /**
   * Retrieves an array of selected assignee emails.
   * @returns {Array<string>}
   * @private
   */
  _getSelectedAssignees() {
    return Array.from(
      document.querySelectorAll("input[name='assigned']:checked")
    ).map((cb) => cb.value);
  },

  /**
   * Retrieves an array of selected member emails.
   * @returns {Array<string>}
   * @private
   */
  _getSelectedMembers() {
    const memberCheckboxes = document.querySelectorAll("input[name='member']:checked");
    return Array.from(memberCheckboxes).map((cb) => cb.value);
  },

  /**
   * Retrieves an array of subtasks from the DOM.
   * @returns {Array<string>}
   * @private
   */
  _getSubtasks() {
    return Array.from(document.querySelectorAll("#subtask-list li")).map(
      (item) => item.textContent.trim()
    );
  },
};

// --- SCRIPT ENTRY POINT ---
document.addEventListener("DOMContentLoaded", () => {
  window.USERKEY = window.USERKEY || localStorage.getItem("userKey");
  addTaskManager.init();
});
