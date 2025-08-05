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

    // --- 1. SETUP & INITIALIZATION ---
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

  /**
   * Redirects to the login page if no user is logged in.
   */
  _protectPageAccess() {
    if (!USERKEY) {
      window.location.href = "../../index.html";
    }
  },

  /**
   * Caches frequently used DOM elements to avoid repeated lookups.
   */
  _cacheDOMElements() {
    this.elements.form = document.querySelector(".task-form");
    this.elements.title = document.getElementById("title");
    this.elements.dueDate = document.getElementById("due-date");
    this.elements.categoryInput = document.getElementById("category-input");
    this.elements.prioButtons = document.querySelectorAll(".priority-btn");
    this.elements.clearBtn = this.elements.form.querySelector(".clear-button");
    this.elements.subtaskInput = document.getElementById("subtasks");
    this.elements.selectedAssignees = document.getElementById("selected-assignees");
  },

  /**
   * Initializes all page components like dropdowns and priority buttons.
   */
  async _initComponents() {
    this._setupPriorityButtons();
    this._setupDatePicker();
    initSubtaskControls(); // Annahme: Diese Funktion existiert global oder in einer anderen Datei
    this.state.assignableUsers = await this._loadAssignableUsers();
    this._initializeDropdowns(); // Ruft die neue Dropdown-Logik auf
  },
    

    /**
   * Registers all event listeners for the page.
   */
_registerEventListeners() {
    this.elements.form.addEventListener("submit", (e) => this._handleFormSubmit(e));
    this.elements.clearBtn?.addEventListener("click", () => this._resetForm());
},

    /**
   * Adds event listeners to clear validation errors on user input.
   */
  _addInputListeners() {
    const fieldsToClear = [this.elements.title, this.elements.dueDate];
    fieldsToClear.forEach((field) => {
      field?.addEventListener("input", () => this._clearError(field));
    });
  },

    //Category Dropdown (single select)
    _initializeDropdowns() {
        new CustomDropdown('category', this.state.categories, {
            onSelect: () => {
                this._clearError(this.elements.categoryInput);
            }
        });
        new CustomDropdown('assigned-to', this.state.assignableUsers, {
            isMultiSelect: true,
            getInitials: getInitials, 
            onChange: () => {
                this._updateContactBadges(); 
            }
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

  // --- 3. FORM SUBMISSION & VALIDATION ---

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

  // --- 4. DATA HANDLING (FIREBASE) ---

  /**
   * Loads assignable users from the database.
   * @returns {Promise<Array>}
   * @private
   */
async _loadAssignableUsers() {
  return await getAssignablePeople(USERKEY);
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
      status: "todo", 
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
      await postData('tasks', taskData); 
      this._showSuccessPopup();
      this._resetForm();
    } catch (error) {
      console.error("Error saving task:", error);
      alert("Could not save task. Please try again.");
    }
  },

  // --- 5. UI & EVENT HANDLERS ---

  /**
   * Resets the entire form to its initial state.
   * @private
   */
_resetForm() {
    this.elements.form.reset();
    this._clearAllErrors();
    document.querySelectorAll(".selected").forEach((el) => el.classList.remove("selected"));
    this.elements.selectedAssignees.innerHTML = "";
    clearSubtasks();
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
            badge.textContent = getInitials(user.name);
            // NEU: Hintergrundfarbe dynamisch setzen
            badge.style.backgroundColor = user.color; 
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

  // --- 6. UTILITY HELPERS ---

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
    return getSubtaskListData(); 
},
};

// --- SCRIPT ENTRY POINT ---
document.addEventListener("DOMContentLoaded", () => {
  window.USERKEY = window.USERKEY || localStorage.getItem("userKey");
  addTaskManager.init();
});
