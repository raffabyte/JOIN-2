/**
 * @file addTask.js
 * @description Handles the add task form logic including dropdowns, date picker, validation, and Firebase saving. All logic is compatible with remoteStorage.js.
 */

/**
 * Sets USERKEY from localStorage only if not already defined globally.
 */
if (typeof USERKEY === "undefined") {
  window.USERKEY = localStorage.getItem("userKey");
}

/**
 * Redirects to login page if USERKEY is not available.
 */
if (!USERKEY) {
  window.location.href = "../../index.html";
}

/**
 * Returns the Firebase base URL from global definition or fallback.
 * @returns {string} Firebase database base URL
 */
function getBaseUrl() {
  return typeof BASE_URL !== "undefined"
    ? BASE_URL
    : "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/";
}


/**
 * Loads users and renders the "Assigned To" dropdown options.
 * Includes debug logs to verify data loading.
 */
async function loadAndRenderContacts() {
  console.log("⏳ loadAndRenderContacts start");
  const users = await loadAssignableUsers();
  console.log("✅ Users loaded:", users);
  setupDropdown("assigned-to-input", "assigned-to-options", users, true);
}

/**
 * Renders and manages a dropdown (multi- or single-select).
 * Includes debug logs on each render.
 * @param {string} inputId
 * @param {string} optionsId
 * @param {Array} options
 * @param {boolean} isMultiSelect
 */
function setupDropdown(inputId, optionsId, options, isMultiSelect) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(optionsId);
  const toggle = document.getElementById(inputId.replace("input", "toggle-btn"));
  if (!input || !dropdown || !toggle) return;

  const render = () => {
    console.log(`🔄 render dropdown ${optionsId}`, options);
    const filter = input.value.toLowerCase();
    dropdown.innerHTML = "";
    const filtered = options.filter(opt => {
      const label = typeof opt === "string" ? opt : opt.name;
      return label.toLowerCase().includes(filter);
    });
    console.log(`🔍 filtered ${filtered.length} options`);
    filtered.forEach(option => {
      const li = document.createElement("li");
      li.innerHTML = getDropdownOptionHTML(option, isMultiSelect);
      if (!isMultiSelect) li.addEventListener("click", () => { input.value = option; dropdown.classList.remove("display-none"); });
      dropdown.appendChild(li);
    });
    dropdown.classList.add("show");
  };

  input.addEventListener("input", render);
  input.addEventListener("focus", render);
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains("show");
    dropdown.classList.toggle("show", !isOpen);
    toggle.classList.toggle("open", !isOpen);
    if (!isOpen) render();
  });
}









/**
 * Initializes input tracking for required fields and category.
 */
function initFilledFieldTracking() {
  trackStandardFields(["title", "due-date", "description"]);
  trackCategoryField();
}

/**
 * Adds input listeners to required fields to toggle 'filled' state.
 * @param {string[]} fieldIds - Array of input field IDs.
 */
function trackStandardFields(fieldIds) {
  fieldIds.forEach(id => {
    const input = document.getElementById(id);
    if (input) bindFilledListener(input);
  });
}

/**
 * Removes error styling and message from a form input.
 * @param {HTMLElement} input - The input element to clear error from.
 */
function clearFieldError(input) {
  input.classList.remove("input-error");
  const wrapper = input.closest(".form-group");
  if (!wrapper) return;

  const errorEl = wrapper.querySelector(".field-error");
  if (errorEl) errorEl.remove();
}


/**
 * Binds 'input' event to mark input as filled or clear error.
 * @param {HTMLInputElement} input
 */
function bindFilledListener(input) {
  input.addEventListener("input", () => {
    const value = input.value.trim();
    input.classList.toggle("filled", value !== "");
    if (value !== "") {
      input.classList.remove("input-error");
      clearFieldError(input);
    }
  });
}

/**
 * Special tracking for the category field wrapper.
 */
function trackCategoryField() {
  const input = document.getElementById("category-input");
  const wrapper = input?.closest(".dropdown-input-wrapper");
  if (!input || !wrapper) return;

  input.addEventListener("input", () => {
    wrapper.classList.remove("filled");
    input.classList.remove("input-error");
    clearFieldError(input);
  });
}


/**
 * Initializes all required event listeners and UI states.
 */
document.addEventListener("DOMContentLoaded", async () => {
  protectPageAccess();
  hideValidationErrors();
  await loadAndRenderContacts();
  addCategoryAndAssigneeDropdownListeners();
  initPrioritySelection();
  initSubtaskInput();
  initAddTaskPage();
  initFilledFieldTracking();
});

/**
 * Protects the page by redirecting if the user is not authenticated.
 */
function protectPageAccess() {
  if (!USERKEY) {
    window.location.href = "../../index.html";
  }
}

/**
 * Hides all validation errors initially.
 */
function hideValidationErrors() {
  clearValidationErrors();
  resetFilledStates();
}

/**
 * Adds listeners to close dropdowns when clicking outside.
 */
/**
 * Adds listeners to close dropdowns when clicking outside.
 */
function addCategoryAndAssigneeDropdownListeners() {
  document.addEventListener("click", (e) => {
    const inputs = [
      document.getElementById("category-input"),
      document.getElementById("assigned-to-input")
    ];
    const dropdowns = [
      document.getElementById("category-options"),
      document.getElementById("assigned-to-options")
    ];
    const toggles = [
      document.getElementById("category-toggle-btn"),
      document.getElementById("assigned-to-toggle-btn")
    ];

    dropdowns.forEach((dropdown, i) => {
      const input = inputs[i];
      const toggle = toggles[i];
      // only run if all three elements exist
      if (
        dropdown && input && toggle &&
        !dropdown.contains(e.target) &&
        !input.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        dropdown.classList.remove("show");
        toggle.classList.remove("open");
      }
    });
  });
}


/**
 * Loads assignable users from Firebase excluding the current user.
 * @returns {Promise<Array<{ name: string, email: string }>>}
 */
async function loadAssignableUsers() {
  try {
    const users = await loadData("users");
    return Object.entries(users)
      .filter(([key]) => key !== USERKEY)
      .map(([, user]) => {
        if (!user?.email) return { name: "Unknown", email: "" };
        return {
          name: extractName(user.email),
          email: user.email
        };
      });
  } catch (error) {
    console.error("Error loading users:", error);
    return [];
  }
}

/**
 * Converts an email into a user-friendly name.
 * @param {string} email
 * @returns {string}
 */
function extractName(email) {
  return email.split("@")[0].replace(/[._]/g, " ")
    .split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/**
 * Loads users and renders the "Assigned To" dropdown options.
 */
async function loadAndRenderContacts() {
  const users = await loadAssignableUsers();
  setupDropdown("assigned-to-input", "assigned-to-options", users, true);
}

/**
 * Initializes both category and assigned-to dropdowns.
 */
function initDropdowns() {
  const categories = ["Technical Task", "User Story"];
  setupDropdown("category-input", "category-options", categories, false);
  loadAssignableUsers().then(users => {
    setupDropdown("assigned-to-input", "assigned-to-options", users, true);
  });
}

/**
 * Initializes dropdowns, priority, date picker, form validation, subtasks.
 */
function initAddTaskPage() {
  initDropdowns();
  initPrioritySelection();
  initDatePicker();
  initFormValidation();
  initSubtaskControls();
}

/**
 * Initializes the date picker toggle for due-date input.
 */
function initDatePicker() {
  const dateInput = document.getElementById("due-date");
  const calendarToggle = document.getElementById("calendar-toggle");
  if (!dateInput || !calendarToggle) return;

  calendarToggle.addEventListener("click", () => {
    if (typeof dateInput.showPicker === "function") {
      dateInput.showPicker();
    } else {
      dateInput.focus();
    }
  });
}

/**
 * Initializes priority button behavior and visual selection.
 */
function initPrioritySelection() {
  const buttons = document.querySelectorAll(".priority-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });
}

/**
 * Initializes form submission and clear/reset logic.
 */
function initFormValidation() {
  const form = document.querySelector(".task-form");
  if (!form) return;

  const createBtn = form.querySelector(".create-button");
  const clearBtn = form.querySelector(".clear-button");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isFormValid(form)) {
      disableButton(createBtn, true);
      await saveTaskToFirebase();
    }
  });

  clearBtn?.addEventListener("click", () => {
    resetFilledStates();
    clearValidationErrors();
    clearSubtasks();
  });
}

/**
 * Validates required form fields.
 * @param {HTMLFormElement} form
 * @returns {boolean}
 */
function isFormValid(form) {
  const requiredIds = ["title", "due-date", "category-input"];
  let isValid = true;
  requiredIds.forEach(id => {
    const input = document.getElementById(id);
    if (!input?.value.trim()) {
      showFieldError(input, "This field is required");
      isValid = false;
    }
  });

  const prioritySelected = !!form.querySelector(".priority-btn.selected");
  if (!prioritySelected) {
    form.querySelector(".priority-options")?.classList.add("input-error");
    isValid = false;
  }

  return isValid;
}

/**
 * Shows an error message below the input.
 * @param {HTMLElement} input
 * @param {string} message
 */
function showFieldError(input, message) {
  if (!input) return;
  input.classList.add("input-error");
  const wrapper = input.closest(".form-group");
  if (!wrapper) return;
  let error = wrapper.querySelector(".field-error");
  if (!error) {
    error = document.createElement("div");
    error.className = "field-error";
    wrapper.appendChild(error);
  }
  error.textContent = message;
}

/**
 * Removes validation error styles and messages from all inputs.
 */
function clearValidationErrors() {
  document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
  document.querySelectorAll(".field-error").forEach(el => el.remove());
}

/**
 * Resets filled state styling.
 */
function resetFilledStates() {
  document.querySelectorAll(".filled").forEach(el => el.classList.remove("filled"));
}

/**
 * Disables or enables a button.
 * @param {HTMLElement} button
 * @param {boolean} disabled
 */
function disableButton(button, disabled) {
  if (!button) return;
  button.disabled = disabled;
  button.style.opacity = disabled ? "0.7" : "1";
}

/**
 * Initializes subtask input behavior (Enter key support).
 */
function initSubtaskInput() {
  const input = document.getElementById("subtasks");
  if (!input) return;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = input.value.trim();
      if (value) {
        addSubtask(value);
        input.value = "";
      }
    }
  });
}

/**
 * Renders and manages a dropdown (multi- or single-select).
 * @param {string} inputId - ID of the input field
 * @param {string} optionsId - ID of the dropdown options list
 * @param {Array} options - Options to show (strings or user objects)
 * @param {boolean} isMultiSelect - Enables checkbox rendering if true
 */
function setupDropdown(inputId, optionsId, options, isMultiSelect) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(optionsId);
  const toggle = document.getElementById(inputId.replace("input", "toggle-btn"));
  if (!input || !dropdown || !toggle) return;

  const render = () => {
    const filter = input.value.toLowerCase();
    dropdown.innerHTML = "";
    const filtered = options.filter(opt => {
      const label = typeof opt === "string" ? opt : opt.name;
      return label.toLowerCase().includes(filter);
    });

    filtered.forEach(option => {
      const li = document.createElement("li");
      li.innerHTML = getDropdownOptionHTML(option, isMultiSelect);
      if (!isMultiSelect) {
        li.addEventListener("click", () => {
          input.value = option;
          dropdown.classList.remove("show");
        });
      }
      dropdown.appendChild(li);
    });

    dropdown.classList.add("show");
  };

  input.addEventListener("input", render);
  input.addEventListener("focus", render);
  toggle.addEventListener("click", () => {
    const isOpen = dropdown.classList.contains("show");
    dropdown.classList.toggle("show", !isOpen);
    toggle.classList.toggle("open", !isOpen);
    if (!isOpen) render();
  });
}

/**
 * Returns innerHTML for a dropdown option item.
 * @param {string|Object} option
 * @param {boolean} isMultiSelect
 * @returns {string}
 */
function getDropdownOptionHTML(option, isMultiSelect) {
  if (typeof option === "string") {
    return `<span class="dropdown-option">${option}</span>`;
  } else {
    const initials = option.name.split(" ").map(n => n[0]).join("");
    return `
      <label class="checkbox-option">
        <input type="checkbox" name="assigned" value="${option.email}">
        <span class="initial-badge">${initials}</span>
        <span class="contact-name">${option.name}</span>
      </label>
    `;
  }
}
