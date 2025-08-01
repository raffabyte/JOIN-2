/**
 * @file addTask.js
 * @description Handles the add task form logic including dropdowns, date picker, validation, and Firebase saving. 
 * Uses global USERKEY and BASE_URL from main.js and remoteStorage.js.
 */

/** Set USERKEY if not already defined */
if (typeof USERKEY === "undefined") {
  window.USERKEY = localStorage.getItem("userKey");
}

/** Redirect if user not logged in */
if (!USERKEY) {
  window.location.href = "../../index.html";
}

/**
 * Returns the Firebase base URL from global definition or fallback.
 */
function getBaseUrl() {
  return typeof BASE_URL !== "undefined"
    ? BASE_URL
    : "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/";
}

/* -------------------------
   Dropdown Handling
------------------------- */

/**
 * Initializes dropdown toggle and input behavior
 */
function setupDropdown(inputId, optionsId, options, isMultiSelect) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(optionsId);
  const toggle = document.getElementById(inputId.replace("input", "toggle-btn"));
  if (!input || !dropdown || !toggle) return;
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    handleToggleClick(dropdown, toggle, input, options, isMultiSelect);
  });

  input.addEventListener("focus", () => renderDropdown(input, dropdown, options, isMultiSelect));
  input.addEventListener("input", () => renderDropdown(input, dropdown, options, isMultiSelect));
}

/**
 * Closes all dropdowns and resets arrows.
 */
function closeAllDropdowns() {
  document.querySelectorAll(".dropdown-options.show").forEach(d => d.classList.remove("show"));
  document.querySelectorAll(".dropdown-toggle.open").forEach(t => t.classList.remove("open"));
}

/**
 * Handles toggle button clicks for dropdown open/close.
 */
function handleToggleClick(dropdown, toggle, input, options, isMultiSelect) {
  const isOpen = dropdown.classList.contains("show");
  closeAllDropdowns();
console.log("🎯 Dropdown gefunden:", dropdown);

  if (!isOpen) {
    console.log("🔽 Dropdown wird geöffnet");
    renderDropdown(input, dropdown, options, isMultiSelect);
    dropdown.classList.add("show");
    toggle.classList.add("open");
  } else {
    console.log("🔼 Dropdown wird geschlossen");
    dropdown.classList.remove("show");
    toggle.classList.remove("open");
  }
}


/**
 * Opens dropdown, renders options, sets arrow state.
 */
function openDropdown(input, dropdown, toggle, options, isMultiSelect) {
  renderDropdown(input, dropdown, options, isMultiSelect);
  dropdown.classList.add("show");
  toggle.classList.add("open");
}

/**
 * Closes all dropdowns and resets arrows.
 */
function closeAllDropdowns() {
  document.querySelectorAll(".dropdown-options.show").forEach(d => d.classList.remove("show"));
  document.querySelectorAll(".dropdown-toggle.open").forEach(t => t.classList.remove("open"));
}

/**
 * Renders dropdown options dynamically based on input filter.
 */
function renderDropdown(input, dropdown, options, isMultiSelect) {
    const selectedValues = Array.from(document.querySelectorAll("input[name='assigned']:checked"))
    .map(cb => cb.value);

  dropdown.innerHTML = "";
  const filter = input.value.toLowerCase();

  options.filter(opt => (typeof opt === "string" ? opt : opt.name).toLowerCase().includes(filter))
    .forEach(option => {
      const li = document.createElement("li");
      li.innerHTML = getDropdownOptionHTML(option, isMultiSelect);
      if (isMultiSelect && selectedValues.includes(option.email)) {
        li.querySelector("input[type='checkbox']").checked = true;
      }
      if (!isMultiSelect) {
        li.addEventListener("click", () => selectDropdownOption(input, dropdown, option));
      }
      dropdown.appendChild(li);
    });
}


/**
 * Creates a dropdown item element.
 */
function createDropdownItem(option, input, dropdown, isMultiSelect) {
  const li = document.createElement("li");
  li.innerHTML = getDropdownOptionHTML(option, isMultiSelect);
  if (!isMultiSelect) {
    li.addEventListener("click", () => selectDropdownOption(input, dropdown, option));
  }
  return li;
}

/**
 * Selects a dropdown option.
 */
function selectDropdownOption(input, dropdown, option) {
  input.value = option;
  dropdown.classList.remove("show");
  clearDropdownErrorState(input);
}

/**
 * Clears error state from dropdown.
 */
function clearDropdownErrorState(input) {
  const wrapper = input.closest(".dropdown-input-wrapper");
  input.classList.remove("input-error");
  wrapper?.classList.remove("input-error");
  wrapper?.classList.add("filled");
  wrapper?.closest(".form-group")?.querySelector(".field-error")?.remove();
}

/**
 * Handles clicks outside dropdowns to close them.
 */
function addDropdownOutsideClickListener() {
  document.addEventListener("click", (e) => {
    ["category", "assigned-to"].forEach(prefix => {
      const input = document.getElementById(`${prefix}-input`);
      const dropdown = document.getElementById(`${prefix}-options`);
      const toggle = document.getElementById(`${prefix}-toggle-btn`);
      if (dropdown && !dropdown.contains(e.target) && !input.contains(e.target) && !toggle.contains(e.target)) {
        dropdown.classList.remove("show");
        toggle.classList.remove("open");
      }
    });
  });
}

/**
 * Returns dropdown option HTML.
 */
function getDropdownOptionHTML(option, isMultiSelect) {
  if (typeof option === "string") {
    return `<span class="dropdown-option">${option}</span>`;
  }
  const initials = option.name.split(" ").map(n => n[0]).join("").toUpperCase();
  return `
    <label class="checkbox-option">
      <span class="initial-badge-circle">${initials}</span>
      <span class="contact-name">${option.name}</span>
      <input type="checkbox" name="assigned" value="${option.email}" class="contact-checkbox-right">
    </label>
  `;
}

/* -------------------------
   Selected Contacts
------------------------- */

function clearContactBadges(container) {
  container.innerHTML = "";
}

function createContactBadge(initials) {
  const badge = document.createElement("div");
  badge.className = "contact-badge";
  badge.textContent = initials;
  return badge;
}

function renderContactBadges(container, selectedContacts) {
  selectedContacts.forEach(cb => {
    const initials = cb.closest("label")
      .querySelector(".initial-badge-circle")?.textContent || "?";
    container.appendChild(createContactBadge(initials));
  });
}

function updateSelectedContacts() {
  const container = document.getElementById("selected-assignees");
  if (!container) return;

  const checked = document.querySelectorAll("input[name='assigned']:checked");
  clearContactBadges(container);

  if (checked.length === 0) {
    container.classList.add("display-none");
    return;
  }

  renderContactBadges(container, checked);
  container.classList.remove("display-none");
}

function initSelectedContactsListener() {
  document.addEventListener("change", e => {
    if (e.target && e.target.name === "assigned") {
      updateSelectedContacts();
    }
  });
}

initSelectedContactsListener();

/* -------------------------
   Load Users
------------------------- */

async function loadAssignableUsers() {
  try {
    const users = await loadData("users");
    return Object.entries(users)
      .filter(([key]) => key !== USERKEY)
      .map(([, user]) => {
        if (!user?.email) return { name: "Unknown", email: "" };
        return { name: extractName(user.email), email: user.email };
      });
  } catch (error) {
    console.error("Error loading users:", error);
    return [];
  }
}

function extractName(email) {
  return email.split("@")[0].replace(/[._]/g, " ")
    .split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

async function loadAndRenderContacts() {
  const users = await loadAssignableUsers();
  setupDropdown("assigned-to-input", "assigned-to-options", users, true);
}

function initDropdowns() {
  const categories = ["Technical Task", "User Story"];
  setupDropdown("category-input", "category-options", categories, false);
  loadAndRenderContacts();
}

/* -------------------------
   Field Validation & States
------------------------- */

function initFilledFieldTracking() {
  trackStandardFields(["title", "due-date", "description"]);
  trackCategoryField();
}

function trackStandardFields(fieldIds) {
  fieldIds.forEach(id => {
    const input = document.getElementById(id);
    if (input) bindFilledListener(input);
  });
}

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

function clearFieldError(input) {
  input.classList.remove("input-error");
  const wrapper = input.closest(".form-group");
  if (!wrapper) return;
  const errorEl = wrapper.querySelector(".field-error");
  if (errorEl) errorEl.remove();
}

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

/* -------------------------
   Priority & Date Picker
------------------------- */

function initPrioritySelection() {
  document.getElementById("prioUrgentIcon").innerHTML = HIGH_PRIORITY_SVG;
  document.getElementById("prioMediumIcon").innerHTML = MID_PRIORITY_SVG;
  document.getElementById("prioLowIcon").innerHTML = LOW_PRIORITY_SVG;

  const buttons = document.querySelectorAll(".priority-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });
}

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

/* -------------------------
   Validation & Form Submit
------------------------- */

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
      disableButton(createBtn, false);
    }
  });

  clearBtn?.addEventListener("click", () => {
    resetFilledStates();
    clearValidationErrors();
    clearSubtasks();
  });
}

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

function clearValidationErrors() {
  document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
  document.querySelectorAll(".field-error").forEach(el => el.remove());
}

function resetFilledStates() {
  document.querySelectorAll(".filled").forEach(el => el.classList.remove("filled"));
}

function disableButton(button, disabled) {
  if (!button) return;
  button.disabled = disabled;
  button.style.opacity = disabled ? "0.7" : "1";
}

/* -------------------------
   Subtasks
------------------------- */

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

/* -------------------------
   Save Task to Firebase
------------------------- */

function collectTaskData() {
  return {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    dueDate: document.getElementById("due-date").value,
    priority: document.querySelector(".priority-btn.selected")?.dataset.priority || "",
    category: document.getElementById("category-input").value.trim(),
    assignedTo: getSelectedAssignees(),
    subtasks: getSubtasks(),
    status: "todo",
    createdAt: new Date().toISOString()
  };
}

function getSelectedAssignees() {
  return Array.from(document.querySelectorAll("input[name='assigned']:checked"))
    .map(cb => cb.value);
}

function getSubtasks() {
  return Array.from(document.querySelectorAll(".subtask-item"))
    .map(item => item.textContent.trim());
}

function resetTaskForm() {
  document.querySelector(".task-form").reset();
  resetFilledStates();
  clearValidationErrors();
  clearSubtasks();
}

async function saveTaskToFirebase() {
  const taskData = collectTaskData();

  try {
    await postData(`tasks/${USERKEY}`, taskData);
    console.log("✅ Task successfully saved to Firebase:", taskData);
    resetTaskForm();
    showTaskAddedPopup();
  } catch (error) {
    alert("Error saving task. Please try again.");
  }
}

function showTaskAddedPopup() {
  const popup = document.createElement("div");
  popup.className = "task-added-popup";
  popup.innerHTML = `${BOARD_SVG}<span>Task added to board</span>`;
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.classList.add("fade-out");
    setTimeout(() => popup.remove(), 500);
  }, 2500);
}

/* -------------------------
   Init Page
------------------------- */

document.addEventListener("DOMContentLoaded", async () => {
  protectPageAccess();
  hideValidationErrors();
  await loadAndRenderContacts();
  addDropdownOutsideClickListener();
  initPrioritySelection();
  initSubtaskInput();
  initAddTaskPage();
  initFilledFieldTracking();
});

function protectPageAccess() {
  if (!USERKEY) {
    window.location.href = "../../index.html";
  }
}

function hideValidationErrors() {
  clearValidationErrors();
  resetFilledStates();
}

function initAddTaskPage() {
  initDropdowns();
  initPrioritySelection();
  initDatePicker();
  initFormValidation();
  initSubtaskControls();
}
