document.addEventListener("DOMContentLoaded", () => {
    initializeDropdowns();
    initializePriorityButtons();
    initializeSubtaskInput();
    initializeDatePicker();
    initializeFormValidation();
    initializeActiveStateHandling(); 
});

function initializeDropdowns() {
    const contactOptions = [
        "Max Mustermann", "Lara Beispiel", "Franz Kontakt", "Julia Sommer", "Tom Winter",
        "Ella Meier", "David König", "Nina Berg", "Leo Schmitt", "Sophie Schwarz"
    ];
    const categoryOptions = [
        "Technical Task", "User Story"  
    ];

    setupDropdown('assigned-to-input', 'assigned-toggle-btn', 'assigned-to-options', contactOptions);
    setupDropdown('category-input', 'category-toggle-btn', 'category-options', categoryOptions);
}

/**
 * @param {string} inputId 
 * @param {string} toggleBtnId
 * @param {string} dropdownId 
 * @param {string[]} options 
 */
function setupDropdown(inputId, toggleBtnId, dropdownId, options) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleBtnId);
    const dropdown = document.getElementById(dropdownId);

    if (!input || !toggle || !dropdown) return;

    input.addEventListener("focus", () => renderDropdownOptions(dropdown, input, options));
    input.addEventListener("input", () => renderDropdownOptions(dropdown, input, options));

     toggle.addEventListener("click", (e) => {
        e.stopPropagation(); 
        const isVisible = dropdown.classList.toggle("show");
        if (isVisible) {
            renderDropdownOptions(dropdown, input, options);
        }
    });

  document.addEventListener("click", (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove("show");
        }
    });
}

function renderDropdownOptions(dropdown, input, options) {
    const filter = input.value.toLowerCase();
    const filteredOptions = options.filter(opt => opt.toLowerCase().includes(filter));
    
    dropdown.innerHTML = ""; 
    filteredOptions.forEach(optionText => {
        const li = document.createElement("li");

        if (dropdown.id === 'assigned-to-options') {
            li.innerHTML = `
                <label>
                    <span>${optionText}</span>
                    <input type="checkbox" class="contact-checkbox">
                </label>
            `;
            
        } else {
            li.textContent = optionText;
            li.addEventListener("click", () => {
                input.value = optionText;
                dropdown.classList.remove("show");
                input.dispatchEvent(new Event('change'));
            });
        }
        dropdown.appendChild(li);
    });
    dropdown.classList.add("show");
}

function initializePriorityButtons() {
    const priorityContainer = document.querySelector(".priority-options");
    if (!priorityContainer) return;

    priorityContainer.addEventListener("click", (e) => {
        const clickedButton = e.target.closest(".priority-btn");
        if (!clickedButton) return;

        priorityContainer.querySelectorAll(".priority-btn").forEach(btn => btn.classList.remove("selected"));
        
        clickedButton.classList.add("selected");
        const group = priorityContainer.closest('.form-group');
        removeFieldError(group);
    });
}

function initializeSubtaskInput() {
    const input = document.getElementById("subtasks");
    const list = document.getElementById("subtask-list");

    if (!input || !list) return;

    input.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" || !input.value.trim()) return;
        
        e.preventDefault();
        addSubtask(input.value.trim(), list);
        input.value = ""; 
    });
}

function addSubtask(text, list) {
    const li = document.createElement("li");
    li.textContent = text;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✖";
    deleteBtn.className = "delete-subtask-btn";
    deleteBtn.type = "button";
    deleteBtn.onclick = () => li.remove(); 

    li.appendChild(deleteBtn);
    list.appendChild(li);
}

function initializeDatePicker() {
    const dateInput = document.getElementById("due-date");
    if (!dateInput) return;

    const showPicker = (e) => {
        e.preventDefault();
        dateInput.type = "date";
        setTimeout(() => dateInput.showPicker(), 10); 
    };

    dateInput.addEventListener("focus", showPicker);
    document.getElementById("calendar-toggle")?.addEventListener("click", showPicker);

    dateInput.addEventListener("blur", () => {
        if (!dateInput.value) {
            dateInput.type = "text";
        }
    });
}

function initializeFormValidation() {
    const form = document.querySelector(".task-form");
    if (!form) return;

    const requiredFieldIds = ["title", "due-date", "category-input"];
    const allFieldIds = ["title", "description", "due-date", "assigned-to-input", "category-input", "subtasks"];

requiredFieldIds.forEach(id => { 
    const el = document.getElementById(id);
    el?.addEventListener("change", () => validateField(el));
    el?.addEventListener("blur", () => validateField(el));
});

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        let isFormValid = true;

        requiredFieldIds.forEach(id => {
            const field = document.getElementById(id);
            if (!validateField(field)) {
                isFormValid = false;
            }
        });      
        
const priorityGroup = document.querySelector('.priority-options');
if (!priorityGroup.querySelector('.priority-btn.selected')) {
    isFormValid = false;
}

        if (isFormValid) {
            showTaskCreatedOverlay();
        }
    });

form.querySelector('.clear-button')?.addEventListener('click', () => {
  form.reset();
  form.querySelectorAll('.input-error, .input-valid').forEach(el => el.classList.remove('input-error', 'input-valid'));
  form.querySelectorAll('.field-error').forEach(err => err.remove());
  document.querySelectorAll('.priority-btn.selected').forEach(btn => btn.classList.remove('selected'));
  
   form.querySelectorAll('.is-active').forEach(el => el.classList.remove('is-active'));
});
}

/**
 * Validiert ein einzelnes Feld und gibt zurück, ob es gültig ist.
 * @returns {boolean}
 */
function validateField(field) {
    if (!field) return false;
    
    if (field.value.trim()) {
        markFieldAsValid(field.closest('.form-group'));
        return true;
    } else {
        showFieldError(field.closest('.form-group'));
        return false;
    }
}

function showFieldError(formGroup, message = "This field is required.") {
    if (!formGroup) return;
    const input = formGroup.querySelector('input, textarea, .priority-options');
    input?.classList.add("input-error");
    input?.classList.remove("input-valid");

    if (!formGroup.querySelector(".field-error")) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "field-error";
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);
    }
}

function removeFieldError(formGroup) {
    if (!formGroup) return;
    formGroup.querySelector(".field-error")?.remove();
}

function markFieldAsValid(formGroup) {
    if (!formGroup) return;
    const input = formGroup.querySelector('input, textarea, .priority-options');
    input?.classList.remove("input-error");
    input?.classList.add("input-valid");
    removeFieldError(formGroup);
}

function initializeActiveStateHandling() {
  const fields = document.querySelectorAll(
    '#title, #description, #due-date, #assigned-to-input, #category-input, #subtasks'
  );

  fields.forEach(field => {
    const eventHandler = (event) => {
      // Bei Dropdowns den Wrapper, ansonsten das Feld selbst ansprechen
      const elementToStyle = event.target.closest('.dropdown-input-wrapper') || event.target;
      
      if (event.target.value.trim() !== '') {
        elementToStyle.classList.add('is-active');
      } else {
        elementToStyle.classList.remove('is-active');
      }
    };

    field.addEventListener('input', eventHandler);
    field.addEventListener('blur', eventHandler);
  });
}

function showTaskCreatedOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "task-overlay";
    overlay.innerHTML = `
        <span>Task added to board</span>
        <img src="../img/board_icon.svg" alt="Board Icon" />
    `;
    document.body.appendChild(overlay);

  setTimeout(() => {
        overlay.classList.add("visible");
        setTimeout(() => {
            window.location.href = "board.html";
        }, 1500); 
    }, 10); 
}