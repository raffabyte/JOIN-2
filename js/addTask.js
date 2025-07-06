const userKey = localStorage.getItem("loggedInUserKey");

if (!userKey) {
  window.location.href = "../../index.html";
}

document.addEventListener("DOMContentLoaded", initAddTaskPage);

function initAddTaskPage() {
    initDropdowns();
    initPriorityButtons();
    initSubtaskControls(); // ← muss in subtasks.js definiert sein
    initDatePicker();
    initFormValidation();
}

function initDropdowns() {
    const contacts = ["Max Mustermann", "Lara Beispiel", "Franz Kontakt"];
    const categories = ["Technical Task", "User Story"];

    setupDropdown('assigned-to-input', 'assigned-to-options', contacts, true);
    setupDropdown('category-input', 'category-options', categories, false);
}

function setupDropdown(inputId, optionsId, options, isMultiSelect) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(optionsId);
    if (!input || !dropdown) return;

    const toggle = input.nextElementSibling;
    const render = () => renderDropdownOptions(dropdown, input, options, isMultiSelect);

    addDropdownEventListeners(input, toggle, render);
    handleOutsideClick(input, dropdown);
}

function addDropdownEventListeners(input, toggle, renderFn) {
    const dropdownId = input.id === 'assigned-to-input' ? 'assigned-to-options' : 'category-options';
    const dropdown = document.getElementById(dropdownId);

    input.addEventListener("focus", renderFn);
    input.addEventListener("input", renderFn);

    toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('show');

        dropdown.classList.toggle('show', !isOpen);
        toggle.classList.toggle('rotated', !isOpen);

        if (!isOpen) renderFn();
    });
}

function handleOutsideClick(input, dropdown) {
    document.addEventListener("click", (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove("show");
            const toggle = input.nextElementSibling;
            if (toggle) toggle.classList.remove('rotated');
        }
    });
}

function renderDropdownOptions(dropdown, input, options, isMultiSelect) {
    const filter = input.value.toLowerCase();
    const filteredOptions = options.filter(opt => opt.toLowerCase().includes(filter));

    dropdown.innerHTML = "";
    filteredOptions.forEach(option => {
        const li = createDropdownOption(option, isMultiSelect, input, dropdown);
        dropdown.appendChild(li);
    });

    dropdown.classList.add("show");
}

function createDropdownOption(text, isMultiSelect, input, dropdown) {
    const li = document.createElement("li");
    li.innerHTML = getDropdownOptionHTML(text, isMultiSelect);

    if (!isMultiSelect) {
        li.addEventListener("click", () => {
            input.value = text;
            dropdown.classList.remove("show");
        });
    }
    return li;
}

function getDropdownOptionHTML(text, isMultiSelect) {
    if (isMultiSelect) {
        return `<label><span>${text}</span><input type="checkbox" class="contact-checkbox"></label>`;
    }
    return text;
}

function initPriorityButtons() {
    const container = document.querySelector(".priority-options");
    if (!container) return;

    container.addEventListener("click", (e) => {
        const clickedButton = e.target.closest(".priority-btn");
        if (!clickedButton) return;

        container.querySelectorAll(".priority-btn").forEach(btn => btn.classList.remove("selected"));
        clickedButton.classList.add("selected");
    });
}

function initDatePicker() {
    const dateInput = document.getElementById("due-date");
    const calendarToggle = document.getElementById("calendar-toggle");
    if (!dateInput || !calendarToggle) return;

    const showPicker = () => {
        dateInput.type = "date";
        dateInput.showPicker();
    };

    dateInput.addEventListener("focus", showPicker);
    calendarToggle.addEventListener("click", showPicker);
}

function initFormValidation() {
    const form = document.querySelector(".task-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const createButton = form.querySelector('.create-button');

        if (isFormValid(form)) {
            disableButton(createButton, true);
            showTaskCreatedOverlay();
        }
    });
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
    clearFieldError(input);
    const value = input.value.trim();

    if (!value) {
        showFieldError(input, "This field is required");
        return false;
    }

    return true;
}

function validatePriority(form) {
    const priorityContainer = form.querySelector('.priority-options');
    const selected = form.querySelector('.priority-btn.selected');

    if (!selected) {
        priorityContainer.classList.add("input-error");
        return false;
    }

    priorityContainer.classList.remove("input-error");
    return true;
}

function disableButton(button, isDisabled) {
    button.disabled = isDisabled;
    button.style.opacity = isDisabled ? '0.7' : '1';
}

function showFieldError(input, message) {
    input.classList.add("input-error");

    let wrapper = input.parentElement;
    
    // Wenn es ein Dropdown ist → ein Level höher zur field-wrapper
    if (wrapper.classList.contains('dropdown-input-wrapper')) {
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

    const errorEl = input.parentElement.querySelector(".field-error");
    if (errorEl) {
        errorEl.remove();
    }
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
