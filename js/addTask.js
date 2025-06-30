document.addEventListener("DOMContentLoaded", () => {
  setupDropdown({
    inputId: "assigned-to-input",
    toggleBtnId: "assigned-toggle-btn",
    dropdownId: "assigned-to-options",
    options: [
      "Max Mustermann", "Lara Beispiel", "Franz Kontakt",
      "Julia Sommer", "Tom Winter", "Ella Meier",
      "David König", "Nina Berg", "Leo Schmitt", "Sophie Schwarz"
    ],
  });

  setupDropdown({
    inputId: "category-input",
    toggleBtnId: "category-toggle-btn",
    dropdownId: "category-options",
    options: [
      "Technical Task", "User Story", "Bug / Issue", "Design",
      "Testing / QA", "Meeting / Planning", "Documentation",
      "Research / Analysis", "Deployment / Release", "Maintenance / Support"
    ],
  });

  setupPriorityButtons();
  setupSubtaskAdding();
  setupFormValidation();
});

// ----- DROPDOWN HANDLING -----

function setupDropdown({ inputId, toggleBtnId, dropdownId, options, onSelect }) {
  const input = document.getElementById(inputId);
  const toggleBtn = document.getElementById(toggleBtnId);
  const dropdown = document.getElementById(dropdownId);
  setupDropdownEvents(input, toggleBtn, dropdown, options, onSelect);
}

function setupDropdownEvents(input, toggleBtn, dropdown, options, onSelect) {
  input.addEventListener("focus", () => {
    showDropdown(dropdown);
    renderDropdownOptions(input, dropdown, options, onSelect);
  });

  input.addEventListener("input", () => {
    renderDropdownOptions(input, dropdown, options, onSelect);
  });

  toggleBtn.addEventListener("click", () => {
    toggleDropdown(dropdown);
    renderDropdownOptions(input, dropdown, options, onSelect);
  });

  closeDropdownOnOutsideClick(dropdown, toggleBtn);
}

function renderDropdownOptions(input, dropdown, options, onSelect) {
  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(input.value.toLowerCase())
  );
  updateDropdownList(dropdown, filtered, input, onSelect);
}

function updateDropdownList(dropdown, options, input, onSelect) {
  dropdown.innerHTML = "";
  options.forEach((opt) => {
    const li = createDropdownItem(opt, input, dropdown, onSelect);
    dropdown.appendChild(li);
  });
}

function createDropdownItem(text, input, dropdown, onSelect) {
  const li = document.createElement("li");
  li.classList.add("dropdown-option");
  li.textContent = text;
  li.addEventListener("click", () => {
    input.value = text;
    dropdown.classList.remove("show");
    if (onSelect) onSelect(text);
  });
  return li;
}

function toggleDropdown(dropdown) {
  dropdown.classList.toggle("show");
}

function showDropdown(dropdown) {
  dropdown.classList.add("show");
}

function closeDropdownOnOutsideClick(dropdown, toggleBtn) {
  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && !toggleBtn.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
}

// ----- PRIORITY BUTTONS -----

function setupPriorityButtons() {
  document.querySelectorAll(".priority-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".priority-btn").forEach((b) =>
        b.classList.remove("selected")
      );
      btn.classList.add("selected");
    });
  });
}

// ----- FORM VALIDATION -----

function setupFormValidation() {
  const form = document.querySelector(".task-form");
  const createBtn = document.querySelector(".create-button");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    resetValidationHints();

    const valid = validateFormFields();
    if (!valid) return;

    handleFormSubmission(createBtn, form);
  });
}

function validateFormFields() {
  const title = document.getElementById("title");
  const dueDate = document.getElementById("due-date");
  const category = document.getElementById("category");

  let isValid = true;

  if (title.value.trim() === "") {
    markFieldInvalid(title);
    isValid = false;
  }

  if (dueDate.value === "") {
    markFieldInvalid(dueDate);
    isValid = false;
  }

  if (!category.value) {
    markFieldInvalid(category);
    isValid = false;
  }

  if (!isValid) showValidationHint();
  return isValid;
}

function resetValidationHints() {
  const fields = [
    document.getElementById("title"),
    document.getElementById("due-date"),
    document.getElementById("category"),
  ];

  fields.forEach((el) => {
    el.style.border = "1px solid transparent";
  });

  const hint = document.querySelector(".validation-hint");
  hint.style.color = "initial";
}

function markFieldInvalid(field) {
  field.style.border = "1px solid red";
}

function showValidationHint() {
  const hint = document.querySelector(".validation-hint");
  hint.style.color = "red";
}

function handleFormSubmission(button, form) {
  button.disabled = true;
  button.textContent = "Creating...";

  setTimeout(() => {
    button.disabled = false;
    button.textContent = "Create Task ✔";
    alert("Task created successfully!");
    resetForm(form);
  }, 1000);
}

function resetForm(form) {
  form.reset();

  document
    .querySelectorAll(".priority-btn")
    .forEach((btn) => btn.classList.remove("selected"));

  document
    .querySelector(".priority-btn.medium")
    .classList.add("selected");
}

// ----- SUBTASK HANDLING -----

function setupSubtaskAdding() {
  const input = document.getElementById("subtasks");
  const dropdown = document.getElementById("subtask-options"); 
  const addBtn = document.querySelector(".add-subtask-inside");

  const list = initializeSubtaskList(input);
  registerSubtaskEvents(input, dropdown, addBtn, list);
}

function initializeSubtaskList(input) {
  let list = document.querySelector(".subtask-list");
  if (!list) {
    list = document.createElement("ul");
    list.classList.add("subtask-list");
    input.parentElement.appendChild(list);
  }
  return list;
}

function registerSubtaskEvents(input, dropdown, addBtn, list) {
  if (!input || !dropdown || !addBtn || !list) return;

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#subtask-dropdown")) {
      dropdown.classList.remove("show");
    }
  });

  addBtn.addEventListener("click", () => addSubtask(input, list, dropdown));

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubtask(input, list, dropdown);
    }
  });
}

function addSubtask(input, list, dropdown) {
  const value = input.value.trim();
  if (!value) return;

  const li = document.createElement("li");
  li.textContent = value;
  list.appendChild(li);

  input.value = "";
  dropdown.classList.remove("show");
}
