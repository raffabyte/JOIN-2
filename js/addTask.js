const userKey = localStorage.getItem("loggedInUserKey");

if (!userKey) {
  // Kein Benutzer eingeloggt → weiterleiten
  window.location.href = "../../index.html";
}


document.addEventListener("DOMContentLoaded", initAddTaskPage);


function initAddTaskPage() {
    initDropdowns();
    initPriorityButtons();
    initSubtaskControls();
    initDatePicker();
    initFormValidation();
}


function initDropdowns() {
    const contacts = ["Max Mustermann", "Lara Beispiel", "Franz Kontakt"];
    const categories = ["Technical Task", "User Story"];

    setupDropdown('assigned-to-input', 'assigned-to-options', contacts, true);
    setupDropdown('category-input', 'category-options', categories, false);
}


/**
 * Konfiguriert ein einzelnes Dropdown-Menü.
 * @param {string} inputId 
 * @param {string} optionsId 
 * @param {string[]} options 
 * @param {boolean} isMultiSelect 
 */
function setupDropdown(inputId, optionsId, options, isMultiSelect) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(optionsId);
    
    if (!input || !dropdown) return;

    const toggle = input.nextElementSibling;
    const render = () => renderDropdownOptions(dropdown, input, options, isMultiSelect);
    
    addDropdownEventListeners(input, toggle, render);
    handleOutsideClick(input, dropdown);
}


/**
 * Fügt die notwendigen Event-Listener zu einem Dropdown hinzu.
 * @param {HTMLInputElement} input 
 * @param {HTMLElement} toggle 
 * @param {Function} renderFn 
 */
function addDropdownEventListeners(input, toggle, renderFn) {
    input.addEventListener("focus", renderFn);
    input.addEventListener("input", renderFn);
    toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        document.getElementById(input.getAttribute('aria-controls')).classList.toggle('show');
        renderFn();
    });
}


/**
 * Schließt das Dropdown, wenn außerhalb geklickt wird.
 * @param {HTMLInputElement} input 
 * @param {HTMLUListElement} dropdown 
 */
function handleOutsideClick(input, dropdown) {
    document.addEventListener("click", (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove("show");
        }
    });
}


/**
 * Rendert die gefilterten Optionen im Dropdown.
 * @param {HTMLUListElement} dropdown 
 * @param {HTMLInputElement} input 
 * @param {string[]} options 
 * @param {boolean} isMultiSelect 
 */
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


/**
 * Erstellt ein einzelnes Listenelement (<li>) für ein Dropdown.
 * @param {string} text 
 * @param {boolean} isMultiSelect 
 * @param {HTMLInputElement} input 
 * @param {HTMLUListElement} dropdown 
 * @returns {HTMLLIElement} 
 */
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


/**
 * Gibt den HTML-String für eine Dropdown-Option zurück.
 * @param {string} text 
 * @param {boolean} isMultiSelect 
 * @returns {string} 
 */
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


function initSubtaskControls() {
    const elements = {
        input: document.getElementById("subtasks"),
        list: document.getElementById("subtask-list"),
        defaultIcons: document.getElementById("subtask-icons-default"),
        activeIcons: document.getElementById("subtask-icons-active"),
        clearBtn: document.getElementById("subtask-clear-btn"),
        confirmBtn: document.getElementById("subtask-confirm-btn")
    };
    if (!elements.input) return;

    addSubtaskEventListeners(elements);
}


/**
 * Fügt Event-Listener für das Subtask-Eingabefeld und zugehörige Buttons hinzu.
 * @param {Object} elements - Enthält alle relevanten DOM-Elemente für das Subtask-Feld.
 */
function addSubtaskEventListeners(elements) {
    setupSubtaskFocusHandler(elements);
    setupSubtaskInputHandler(elements);
    setupSubtaskBlurHandler(elements);
    setupSubtaskKeydownHandler(elements);
    setupSubtaskClearHandler(elements);
    setupSubtaskConfirmHandler(elements);
}

/**
 * Zeigt aktive Icons bei Fokus nur, wenn Eingabe vorhanden.
 * @param {Object} elements
 */
function setupSubtaskFocusHandler(elements) {
    elements.input.addEventListener("focus", () => {
        if (elements.input.value.trim() !== "") {
            toggleSubtaskIcons(elements, true);
        }
    });
}

/**
 * Reagiert auf Texteingabe im Subtask-Feld und schaltet Icons.
 * @param {Object} elements
 */
function setupSubtaskInputHandler(elements) {
    elements.input.addEventListener("input", () => {
        const hasText = elements.input.value.trim() !== "";
        toggleSubtaskIcons(elements, hasText);
    });
}

/**
 * Behandelt das Verlassen des Fokus und schaltet Icons zurück.
 * @param {Object} elements
 */
function setupSubtaskBlurHandler(elements) {
    elements.input.addEventListener("blur", () => {
        setTimeout(() => {
            if (!elements.input.value.trim()) {
                toggleSubtaskIcons(elements, false);
            }
        }, 150);
    });
}

/**
 * Fügt Subtask bei Enter hinzu – verhindert Hauptformular-Abgabe.
 * @param {Object} elements
 */
function setupSubtaskKeydownHandler(elements) {
    elements.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubtaskAddition(elements);
        }
    });
}

/**
 * Leert das Subtask-Feld und setzt Icon-Zustand zurück.
 * @param {Object} elements
 */
function setupSubtaskClearHandler(elements) {
    elements.clearBtn.addEventListener("click", () => {
        clearSubtaskInput(elements);
    });
}

/**
 * Fügt Subtask hinzu, wenn auf den Bestätigungs-Button geklickt wird.
 * @param {Object} elements
 */
function setupSubtaskConfirmHandler(elements) {
    elements.confirmBtn.addEventListener("click", () => {
        handleSubtaskAddition(elements);
    });
}


/**
 * Behandelt das Hinzufügen eines neuen Subtasks.
 * @param {object} elements 
 */
function handleSubtaskAddition(elements) {
    const text = elements.input.value.trim();
    if (!text) return;

    if (elements.list.children.length >= 10) {
        alert("Maximum of 10 subtasks reached.");
        return;
    }
    
    createAndAppendSubtask(text, elements.list);
    elements.input.value = "";
    elements.input.focus();
}


/**
 * Erstellt und hängt einen neuen Subtask an die Liste an.
 * @param {string} text
 * @param {HTMLUListElement} list 
 */
function createAndAppendSubtask(text, list) {
    const li = document.createElement('li');
    li.innerHTML = getSubtaskListItemHTML(text);
    list.appendChild(li);

    li.querySelector('.delete-btn').addEventListener('click', () => li.remove());
    li.querySelector('.edit-btn').addEventListener('click', () => enableSubtaskEditing(li));
}


/**
 * Gibt den HTML-String für einen Subtask in der Liste zurück.
 * @param {string} text 
 * @returns {string} 
 */
function getSubtaskListItemHTML(text) {
    return `
        <span class="subtask-text">${text}</span>
        <div class="subtask-actions">
            <img src="assets/img/summeryIcons/edit.png" class="edit-btn" alt="Edit">
            <span class="icon-divider">|</span>
            <img src="assets/img/delete.png" class="delete-btn" alt="Delete">
        </div>`;
}


/**
 * Aktiviert den Bearbeitungsmodus für einen Subtask.
 * @param {HTMLLIElement} li
 */
function enableSubtaskEditing(li) {
    const textSpan = li.querySelector('.subtask-text');
    const originalActions = li.querySelector('.subtask-actions');
    const currentText = textSpan.textContent;

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = currentText;
    editInput.className = 'edit-subtask-input';

    li.replaceChild(editInput, textSpan);
    originalActions.style.display = 'none'; 
    editInput.focus();
}


/**
 * Schaltet die Sichtbarkeit der Subtask-Icons um (+ vs. X | ✔).
 * @param {object} elements 
 * @param {boolean} isActive 
 */
function toggleSubtaskIcons(elements, isActive) {
    elements.defaultIcons.style.display = isActive ? 'none' : 'flex';
    elements.activeIcons.style.display = isActive ? 'flex' : 'none';
}


/**
 * Leert das Subtask-Eingabefeld und setzt die Icons zurück.
 * @param {object} elements 
 */
function clearSubtaskInput(elements) {
    elements.input.value = "";
    toggleSubtaskIcons(elements, false);
}


/**
 * Behandelt das Verlassen des Fokus vom Subtask-Eingabefeld.
 * @param {object} elements 
 */
function handleSubtaskBlur(elements) {
    setTimeout(() => {
        if (!elements.input.contains(document.activeElement)) {
            if (!elements.input.value) {
                toggleSubtaskIcons(elements, false);
            }
        }
    }, 150); 
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


/**
 * Prüft, ob alle erforderlichen Felder des Formulars gültig sind.
 * @param {HTMLFormElement} form 
 * @returns {boolean} 
 */
function isFormValid(form) {
    const requiredIds = ["title", "due-date", "category-input"];
    let isValid = true;

    requiredIds.forEach(id => {
        if (!document.getElementById(id).value.trim()) isValid = false;
    });

    if (!form.querySelector('.priority-btn.selected')) isValid = false;

    return isValid;
}


/**
 * Deaktiviert/Aktiviert einen Button, um doppelte Klicks zu verhindern.
 * @param {HTMLButtonElement} button
 * @param {boolean} isDisabled 
 */
function disableButton(button, isDisabled) {
    button.disabled = isDisabled;
    button.style.opacity = isDisabled ? '0.7' : '1';
}


/**
 * Zeigt ein "Task Created"-Overlay an und leitet dann weiter.
 */
function showTaskCreatedOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "task-overlay";
    overlay.innerHTML = `<span>Task added to board</span>`;
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.classList.add("visible");
        setTimeout(() => {
            window.location.href = "board.html";
        }, 1500);
    }, 10);
}