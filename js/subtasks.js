function initSubtaskControls() {
    const elements = {
        input: document.getElementById("subtasks"),
        list: document.getElementById("subtask-list"),
        defaultIcons: document.getElementById("subtask-icons-default"),
        activeIcons: document.getElementById("subtask-icons-active"),
        clearBtn: document.getElementById("subtask-clear-btn"),
        confirmBtn: document.getElementById("subtask-confirm-btn")
    };
    console.log("Subtask Elements:", elements);

    if (!elements.input || !elements.list || !elements.defaultIcons || !elements.activeIcons) {
        console.warn("❗ Eines der Subtask-Elemente wurde nicht gefunden!");
        return;
    }

    addSubtaskEventListeners(elements);
    addPlusClickFocus(elements);
}

function addSubtaskEventListeners(elements) {
    setupSubtaskFocusHandler(elements);
    setupSubtaskInputHandler(elements);
    setupSubtaskBlurHandler(elements);
    setupSubtaskKeydownHandler(elements);
    setupSubtaskClearHandler(elements);
    setupSubtaskConfirmHandler(elements);
}

function addPlusClickFocus(elements) {
    const plusWrapper = elements.defaultIcons?.querySelector(".icon-wrapper");
    if (!plusWrapper) return;

    plusWrapper.addEventListener("click", () => {
        elements.input.focus();
    });
}


function setupSubtaskFocusHandler(elements) {
    elements.input.addEventListener("focus", () => {
        if (elements.input.value.trim() !== "") {
            toggleSubtaskIcons(elements, true);
        }
    });
}

function setupSubtaskInputHandler(elements) {
    elements.input.addEventListener("input", () => {
        const hasText = elements.input.value.trim() !== "";
        toggleSubtaskIcons(elements, hasText);
    });
}

function setupSubtaskBlurHandler(elements) {
    elements.input.addEventListener("blur", () => {
        setTimeout(() => {
            if (!elements.input.value.trim()) {
                toggleSubtaskIcons(elements, false);
            }
        }, 150);
    });
}

function setupSubtaskKeydownHandler(elements) {
    elements.input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubtaskAddition(elements);
        }
    });
}

function setupSubtaskClearHandler(elements) {
    elements.clearBtn.addEventListener("click", () => {
        clearSubtaskInput(elements);
    });
}

function setupSubtaskConfirmHandler(elements) {
    elements.confirmBtn.addEventListener("click", () => {
        handleSubtaskAddition(elements);
    });
}

function handleSubtaskAddition(elements) {
    const text = elements.input.value.trim();
    if (!text) return;

    if (elements.list.children.length >= 10) {
        alert("Maximum of 10 subtasks reached.");
        return;
    }

    createAndAppendSubtask(text, elements.list);
    clearSubtaskInput(elements);
    elements.input.focus();
}

function createAndAppendSubtask(text, list) {
    const li = document.createElement('li');
    li.innerHTML = getSubtaskListItemHTML(text);
    list.appendChild(li);

    li.querySelector('.delete-btn').addEventListener('click', () => li.remove());
    li.querySelector('.edit-btn').addEventListener('click', () => enableSubtaskEditing(li));
}

function getSubtaskListItemHTML(text) {
    return `
        <span class="subtask-text">${text}</span>
        <div class="subtask-actions">
            <img src="../img/summeryIcons/edit.png" class="edit-btn" alt="Edit" style="filter: invert(1);">
            <span class="icon-divider">|</span>
            <img src="../img/delete.png" class="delete-btn" alt="Delete">
        </div>`;
}

function enableSubtaskEditing(li) {
    li.classList.add('editing');

    const oldSpan = li.querySelector('.subtask-text');
    const oldActions = li.querySelector('.subtask-actions');
    const currentText = oldSpan.textContent;

    const input = createEditInput(currentText);
    li.replaceChild(input, oldSpan);
    li.removeChild(oldActions);

    const newActions = createEditActions(input, li, oldSpan);
    li.appendChild(newActions);
    input.focus();
    attachEditInputEvents(input, li, oldSpan, newActions);
}

function createEditInput(text) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = text;
    input.className = 'edit-subtask-input';
    return input;
}

function createEditActions(input, li, oldSpan) {
    const container = document.createElement('div');
    container.className = 'subtask-edit-actions';

    const deleteIcon = document.createElement('img');
    deleteIcon.src = '../img/delete.png';
    deleteIcon.alt = 'Delete';
    deleteIcon.className = 'delete-icon';
    deleteIcon.addEventListener('click', () => li.remove());

    const divider = document.createElement('span');
    divider.className = 'icon-divider';
    divider.textContent = '|';

    const checkIcon = document.createElement('img');
    checkIcon.src = '../img/check.png';
    checkIcon.alt = 'Save';
    checkIcon.className = 'check-icon';
    checkIcon.addEventListener('click', () => saveSubtaskEdit(input, li, container));

    container.append(deleteIcon, divider, checkIcon);
    return container;
}

function attachEditInputEvents(input, li, oldSpan, actions) {
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveSubtaskEdit(input, li, actions);
        if (e.key === 'Escape') cancelSubtaskEdit(input, li, oldSpan, actions);
    });

    input.addEventListener('blur', () => {
        setTimeout(() => {
            if (document.body.contains(input)) {
                saveSubtaskEdit(input, li, actions);
            }
        }, 150);
    });
}

function saveSubtaskEdit(input, li, actionsContainer) {
    li.classList.remove('editing');
    const newText = input.value.trim();
    if (!newText) return;

    const newSpan = document.createElement('span');
    newSpan.className = 'subtask-text';
    newSpan.textContent = newText;

    li.replaceChild(newSpan, input);
    if (actionsContainer && li.contains(actionsContainer)) {
        li.removeChild(actionsContainer);
    }
    li.appendChild(createDefaultActions(li));
}

function cancelSubtaskEdit(input, li, oldSpan, actionsContainer) {
    li.replaceChild(oldSpan, input);
    li.removeChild(actionsContainer);
    li.appendChild(createDefaultActions(li));
    li.classList.remove('editing');
}

function createDefaultActions(li) {
    const container = document.createElement('div');
    container.className = 'subtask-actions';
    container.append(
        createEditButton(li),
        createDivider(),
        createDeleteButton(li)
    );
    return container;
}

function createEditButton(li) {
    const editBtn = document.createElement('img');
    editBtn.src = '../img/summeryIcons/edit.png';
    editBtn.className = 'edit-btn';
    editBtn.style.filter = 'invert(1)';
    editBtn.alt = 'Edit';
    editBtn.addEventListener('click', () => enableSubtaskEditing(li));
    return editBtn;
}

function createDivider() {
    const divider = document.createElement('span');
    divider.className = 'icon-divider';
    divider.textContent = '|';
    return divider;
}

function createDeleteButton(li) {
    const deleteBtn = document.createElement('img');
    deleteBtn.src = '../img/delete.png';
    deleteBtn.className = 'delete-btn';
    deleteBtn.alt = 'Delete';
    deleteBtn.addEventListener('click', () => li.remove());
    return deleteBtn;
}

function toggleSubtaskIcons(elements, isActive) {
    elements.defaultIcons.style.display = isActive ? 'none' : 'flex';
    elements.activeIcons.style.display = isActive ? 'flex' : 'none';
}

function clearSubtaskInput(elements) {
    elements.input.value = "";
    toggleSubtaskIcons(elements, false);
}
