const USERKEY = localStorage.getItem("userKey");

if (!USERKEY) {
  window.location.href = "../../index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  initAddTaskPage();
  initFilledFieldTracking(); 
});

function initFilledFieldTracking() {
  const fieldIds = ["title", "due-date", "description"];
  fieldIds.forEach(id => {
    const input = document.getElementById(id);
    if (input) handleInputFilledState(input);
  });
  initCategoryFieldTracking();
}

function handleInputFilledState(input) {
  input.addEventListener("input", () => {
    const value = input.value.trim();
    input.classList.toggle("filled", value !== "");
    if (value !== "") {
      input.classList.remove("input-error");
      clearFieldError(input);
    }
  });
}

function initCategoryFieldTracking() {
  const categoryInput = document.getElementById("category-input");
  const wrapper = categoryInput?.closest(".dropdown-input-wrapper");
  if (!categoryInput || !wrapper) return;
  categoryInput.addEventListener("input", () => {
    wrapper.classList.remove("filled");
    categoryInput.classList.remove("input-error");
    clearFieldError(categoryInput);
  });
}


function initAddTaskPage() {
  initDropdowns();
  initPriorityButtons();
  initSubtaskControls();
  initDatePicker();
  initFormValidation();
}


async function loadAssignableUsers() {
  if (!USERKEY) return [];
  try {
    const users = await loadData("users");
    return Object.entries(users)
      .filter(([key]) => key !== USERKEY)
      .map(([, user]) => {
  if (!user || !user.email) {
    console.warn("Ungültiger Nutzer:", user);
    return { name: "Unbekannt", email: "" };
  }
  return {
    name: extractName(user.email),
    email: user.email,
  };
});
} catch (error) {
    console.error("Fehler beim Laden der Nutzer:", error);
    return [];
  }
}


async function initDropdowns() {
  document.getElementById("assigned-to-options")?.classList.remove("show");
  const users = await loadAssignableUsers();
  const categories = ["Technical Task", "User Story"];
  setupDropdown("assigned-to-input", "assigned-to-options", users, true);
  setupDropdown("category-input", "category-options", categories, false);
}


function setupDropdown(inputId, optionsId, options, isMultiSelect) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(optionsId);
  const toggleBtnId =
  inputId === "assigned-to-input" ? "assigned-toggle-btn" : "category-toggle-btn";
  const toggle = document.getElementById(toggleBtnId);
  if (!input || !dropdown || !toggle) return;
  const render = () => renderDropdownOptions(dropdown, input, options, isMultiSelect);
  addDropdownEventListeners(input, toggle, dropdown, render);
  handleOutsideClick(input, dropdown, toggle);
}


function addDropdownEventListeners(input, toggle, dropdown, renderFn) {
  input.addEventListener("focus", renderFn);
  input.addEventListener("input", renderFn);
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains("show");
    dropdown.classList.toggle("show", !isOpen);
    toggle.classList.toggle("open", !isOpen);
    if (!isOpen) renderFn();
  });
}


function handleOutsideClick(input, dropdown, toggle) {
  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target) && !toggle.contains(e.target)) {
      dropdown.classList.remove("show");
      toggle.classList.remove("open");
    }
  });
}


function renderDropdownOptions(dropdown, input, options, isMultiSelect) {
  const filter = input.value.toLowerCase();
  dropdown.innerHTML = "";
  const filteredOptions = options.filter((opt) =>
    (typeof opt === "string" ? opt : opt.name).toLowerCase().includes(filter)
  );
  filteredOptions.forEach((option) => {
    const li = createDropdownOption(option, isMultiSelect, input, dropdown);
    dropdown.appendChild(li);
  });
  dropdown.classList.add("show");
}


function createDropdownOption(option, isMultiSelect, input, dropdown) {
  const li = document.createElement("li");
  li.innerHTML = getDropdownOptionHTML(option, isMultiSelect);
 if (!isMultiSelect) {
  li.addEventListener("click", () => {
    input.value = option;
    dropdown.classList.remove("show");
    clearFieldError(input);
  });
}
  return li;
}

function getDropdownOptionHTML(option, isMultiSelect) {
  if (typeof option === "string") return option;
  const initials = getInitials(option.name);
  const color = generateColor(initials);
  return `
    <label class="dropdown-user-option">
      <span class="user-badge" style="background-color:${color};">${initials}</span>
      <span class="user-name">${option.name}</span>
      <input type="checkbox" class="contact-checkbox">
    </label>
  `;
}

function initPriorityButtons() {
  const container = document.querySelector(".priority-options");
  if (!container) return;
  container.addEventListener("click", (e) => {
    const clicked = e.target.closest(".priority-btn");
    if (!clicked) return;
    container.querySelectorAll(".priority-btn").forEach(btn =>
      btn.classList.remove("selected")
    );
    clicked.classList.add("selected");
  });
}

function initDatePicker() {
  const dateInput = document.getElementById("due-date");
  const calendarToggle = document.getElementById("calendar-toggle");
  if (!dateInput || !calendarToggle) return;

  calendarToggle.addEventListener("click", () => {
    dateInput.focus();
    dateInput.showPicker?.();
  });
}

function initFormValidation() {
  const form = document.querySelector(".task-form");
  if (!form) return;
  initSubmitHandler(form);
  initClearButton(form);
}

function initSubmitHandler(form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const createBtn = form.querySelector(".create-button");
    if (isFormValid(form)) {
      disableButton(createBtn, true);
      saveTaskToFirebase();
    }
  });
}

function initClearButton(form) {
  const clearBtn = form.querySelector(".clear-button");
  if (!clearBtn) return;
  clearBtn.addEventListener("click", () => {
    resetFilledStates();
    clearValidationErrors();
    clearSubtasks();
  });
}

function resetFilledStates() {
  document.querySelectorAll(".filled").forEach(el => el.classList.remove("filled"));
}

function clearValidationErrors() {
  const ids = ["title", "due-date", "category-input"];
  ids.forEach(id => {
    const input = document.getElementById(id);
    if (input) clearFieldError(input);
  });
}

function clearSubtasks() {
  const list = document.getElementById("subtask-list");
  if (list) list.innerHTML = "";
  const elements = getSubtaskElements?.();
  if (elements) hideAddCancelBtns(elements);
}

function isFormValid(form) {
  const requiredIds = ["title", "due-date", "category-input"];
  let isValid = true;
  requiredIds.forEach(id => {
    const input = document.getElementById(id);
    if (!validateInput(input)) isValid = false;
  });
  if (!validatePriority(form)) isValid = false;
  return isValid;
}

function validateInput(input) {
  if (!input) {
    return false;
  }
  clearFieldError(input);
  const value = input.value.trim();
  if (!value) {
    showFieldError(input, "This field is required");
    return false;
  }
  return true;
}

function validatePriority(form) {
  const priorityContainer = form.querySelector(".priority-options");
  const selected = form.querySelector(".priority-btn.selected");
  if (!selected) {
    priorityContainer.classList.add("input-error");
    return false;
  }
  priorityContainer.classList.remove("input-error");
  return true;
}

function showFieldError(input, message) {
  input.classList.add("input-error");
  let wrapper = input.parentElement;
  if (wrapper.classList.contains("dropdown-input-wrapper")) {
    wrapper = wrapper.parentElement.parentElement;
  }
  let errorEl = wrapper.querySelector(".field-error");
  if (!errorEl) {
    errorEl = document.createElement("div");
    errorEl.className = "field-error";
    wrapper.appendChild(errorEl);
  }
  errorEl.textContent = message;
}

function clearFieldError(input) {
  input.classList.remove("input-error");
  const wrapper = input.closest(".form-group");
  if (!wrapper) return;
  const inputWrapper = input.closest(".dropdown-input-wrapper");
  if (inputWrapper) inputWrapper.classList.remove("input-error");
  const errorEl = wrapper.querySelector(".field-error");
  if (errorEl) errorEl.remove();
}

function disableButton(button, isDisabled) {
  button.disabled = isDisabled;
  button.style.opacity = isDisabled ? "0.7" : "1";
}

function showTaskCreatedOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "task-overlay";
  overlay.innerHTML = `
    <span>Task added to board</span>
    <img src="../img/Board.png" alt="Board Icon" class="task-overlay-img">
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.classList.add("visible");
    setTimeout(() => {
      window.location.href = "board.html";
    }, 1500);
  }, 10);
}

function extractName(email) {
  const namePart = email.split("@")[0].replace(/[._]/g, " ");
  return namePart
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getInitials(name) {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function generateColor(initials) {
  const hash = [...initials].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    "#FF8A00", "#E200BE", "#6E52FF", "#9327FF",
    "#00BEE8", "#1FD7C1", "#FF5C00", "#E97200"
  ];
  return colors[hash % colors.length];
}

function collectTaskData() {
  const title = getInputValue("title");
  const description = getInputValue("description");
  const dueDate = getInputValue("due-date");
  const category = getInputValue("category-input");
  const assignee = getSelectedAssignees();
  const priority = getSelectedPriority();
  const subtasks = getSubtaskData();
  if (!title || !dueDate || !category) return null;
  return {
    title,
    description,
    dueDate,
    category,
    assignee,
    priority,
    subtasks,
    column: "todoColumn"
  };
}

function getInputValue(id) {
  const input = document.getElementById(id);
  return input ? input.value.trim() : "";
}

function getSelectedAssignees() {
  const checkboxes = document.querySelectorAll(".dropdown-user-option input:checked");
  return Array.from(checkboxes).map(input =>
    input.closest("label").querySelector(".user-name").textContent.trim()
  );
}

function getSelectedPriority() {
  const selected = document.querySelector(".priority-btn.selected");
  return selected ? selected.dataset.priority : "";
}

function getSubtaskData() {
  const subtasks = document.querySelectorAll("#subtask-list .subtask-text");
  return Array.from(subtasks).map(el => ({
    value: el.textContent.trim(),
    checked: false
  }));
}

async function saveTaskToFirebase() {
  const task = collectTaskData();
  if (!task) {
    alert("Bitte alle Pflichtfelder ausfüllen!");
    return;
  }
  const response = await sendTaskToServer(task);
  if (response?.ok) {
    showTaskCreatedOverlay();
  } else {
    alert("Fehler beim Speichern der Aufgabe.");
  }
}

async function sendTaskToServer(task) {
  return await fetch("https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks.json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });
}

