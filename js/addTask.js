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
      "Bug / Issue", "Design", "Testing / QA", "Meeting / Planning",
      "Documentation", "Research / Analysis", "Deployment / Release",
      "Maintenance / Support"
    ],
  });

  setupPriorityButtons();
  setupFreeSubtaskInput();
  setupDatePicker();
  setupFieldValidation();
});

// ----- DROPDOWNS -----

function setupDropdown({ inputId, toggleBtnId, dropdownId, options, onSelect }) {
  const input = document.getElementById(inputId);
  const toggle = document.getElementById(toggleBtnId);
  const dropdown = document.getElementById(dropdownId);

  input?.addEventListener("focus", () => renderDropdown(dropdown, input, options, onSelect));
  input?.addEventListener("input", () => renderDropdown(dropdown, input, options, onSelect));
  toggle?.addEventListener("click", () => toggleDropdown(dropdown, input, options, onSelect));

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
}

function renderDropdown(dropdown, input, options, onSelect) {
  const filtered = options.filter(opt => opt.toLowerCase().includes(input.value.toLowerCase()));
  dropdown.innerHTML = "";
  filtered.forEach(opt => {
    const li = document.createElement("li");
    li.textContent = opt;
    li.className = "dropdown-option";
    li.addEventListener("click", () => {
      input.value = opt;
      dropdown.classList.remove("show");
      if (onSelect) onSelect(opt);
    });
    dropdown.appendChild(li);
  });
  dropdown.classList.add("show");
}

function toggleDropdown(dropdown, input, options, onSelect) {
  dropdown.classList.toggle("show");
  if (dropdown.classList.contains("show")) {
    renderDropdown(dropdown, input, options, onSelect);
  }
}

// ----- PRIORITY -----

function setupPriorityButtons() {
  document.querySelectorAll(".priority-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".priority-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });
}

// ----- SUBTASK -----

function setupFreeSubtaskInput() {
  const input = document.getElementById("subtasks");
  const list = document.getElementById("subtask-list");

  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = input.value.trim();
      if (!value) return;
      const li = document.createElement("li");
      li.textContent = value;
      list.appendChild(li);
      input.value = "";
    }
  });
}

// ----- DATE PICKER -----

function setupDatePicker() {
  const dateInput = document.getElementById("due-date");
  const toggleBtn = document.getElementById("calendar-toggle");

  if (!dateInput || !toggleBtn) return;

  dateInput.addEventListener("focus", () => {
    dateInput.type = "date";
    dateInput.showPicker();
  });

  toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    dateInput.type = "date";
    dateInput.focus();
    dateInput.showPicker();
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".date-picker")) {
      dateInput.blur();
    }
  });

  dateInput.addEventListener("blur", () => {
    if (!dateInput.value) dateInput.type = "text";
  });
}

// ----- VALIDIERUNG -----

function setupFieldValidation() {
  const required = ["title", "due-date", "category-input"];
  const all = ["title", "description", "due-date", "assigned-to-input", "category-input", "subtasks"];
  const form = document.querySelector(".task-form");

  handleFormSubmission(form, required, showTaskCreatedOverlay);
  addLiveFieldStyling(all);
}

function handleFormSubmission(form, requiredFields, onSuccess) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    resetValidationHints(requiredFields);
    const valid = validateRequiredFields(requiredFields);
    if (valid) onSuccess();
  });
}

function validateRequiredFields(ids) {
  let allValid = true;
  ids.forEach(id => {
    const field = document.getElementById(id);
    if (!field || !field.value.trim()) {
      showFieldError(field);
      allValid = false;
    } else {
      markFieldValid(field);
    }
  });
  return allValid;
}

function addLiveFieldStyling(fieldIds) {
  fieldIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    ["input", "change", "blur"].forEach(evt => {
      el.addEventListener(evt, () => {
        if (el.value.trim().length > 0) {
          markFieldValid(el);
        }
      });
    });
  });
}

function markFieldValid(field) {
  field.classList.remove("input-error");
  field.classList.add("input-valid");

  const group = field.closest(".form-group");
  if (!group) return;

  const err = group.querySelector(".field-error");
  if (err) err.remove();
}

function showFieldError(field) {
  field.classList.remove("input-valid");
  field.classList.add("input-error");

  const group = field.closest(".form-group");
  if (!group) return;

  if (!group.querySelector(".field-error")) {
    const err = document.createElement("div");
    err.className = "field-error";
    err.textContent = "This field is required";
    group.appendChild(err);
  }
}

function removeFieldError(field) {
  field.classList.remove("input-error", "input-valid");
  const err = field.closest(".form-group")?.querySelector(".field-error");
  if (err) err.remove();
}

function resetValidationHints(ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      removeFieldError(el);
    }
  });
}

// ----- TASK OVERLAY -----

function showTaskCreatedOverlay() {
  const overlay = document.createElement("div");
  overlay.className = "task-overlay";
  overlay.innerHTML = `
    <div class="task-overlay-content">
      Task added to board
      <img src="../img/Board.png" alt="Board" />
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => {
    overlay.classList.add("visible");
    setTimeout(() => {
      window.location.href = "../index/board.html";
    }, 1500);
  }, 100);
}
