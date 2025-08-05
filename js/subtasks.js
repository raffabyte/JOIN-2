/**
 * @file subtasks.js
 * @description Handles subtask creation, editing, and deletion.
 */

/* Initialize subtask controls on page load.
 */
function initSubtaskControls() {
  injectStaticSubtaskIcons();

  const elements = getSubtaskElements();
  if (!elements) return;
  elements.plusBtn.addEventListener("click", () => showAddCancelBtns(elements));
  elements.clearBtn.addEventListener("click", () => cancelSubtask(elements));
  elements.confirmBtn.addEventListener("click", () => handleSubtaskAddition(elements));
  elements.input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubtaskAddition(elements);
    }
  });
}

/**
 * Inject static SVG icons from template.js into buttons.
 */
function injectStaticSubtaskIcons() {
  const plusBtn = document.getElementById("subtaskPlusBtn");
  const cancelBtn = document.querySelector(".cancel-subtask-button");
  const confirmBtn = document.querySelector(".add-subtask-button");
  const divider = document.getElementById("subtask-divider");

  if (plusBtn) plusBtn.innerHTML = PLUS_SVG;
  if (cancelBtn) cancelBtn.innerHTML = CLOSE_CANCEL_SVG;
  if (divider) divider.innerHTML = SEPARATOR_SVG;
  if (confirmBtn) confirmBtn.innerHTML = SUBMIT_SVG;
}

/**
 * Collect all subtask DOM elements.
 */
function getSubtaskElements() {
  const elements = {
    input: document.getElementById("subtasks"),
    list: document.getElementById("subtask-list"),
    plusBtn: document.getElementById("subtaskPlusBtn"),
    clearBtn: document.querySelector(".cancel-subtask-button"),
    confirmBtn: document.querySelector(".add-subtask-button"),
    addCancelBtns: document.getElementById("addCancelBtns"),
  };
  for (const el of Object.values(elements)) {
    if (!el) return null;
  }
  return elements;
}

/**
 * Show Add/Cancel buttons when typing a new subtask.
 */
function showAddCancelBtns(elements) {
  elements.addCancelBtns.style.display = "flex";
  elements.plusBtn.style.display = "none";
  elements.input.focus();
}

/**
 * Hide Add/Cancel buttons and reset plus button.
 */
function hideAddCancelBtns(elements) {
  elements.addCancelBtns.style.display = "none";
  elements.plusBtn.style.display = "flex";
}

/**
 * Cancel subtask creation.
 */
function cancelSubtask(elements) {
  clearSubtaskInput(elements);
  hideAddCancelBtns(elements);
}

/**
 * Clear subtask input field.
 */
function clearSubtaskInput(elements) {
  elements.input.value = "";
}

/**
 * Handle adding a new subtask.
 */
function handleSubtaskAddition(elements) {
  const text = elements.input.value.trim();
  if (!text) return;
  if (elements.list.children.length >= 10) {
    alert("Maximum of 10 subtasks reached.");
    return;
  }
  createAndAppendSubtask(text, elements.list);
  clearSubtaskInput(elements);
  hideAddCancelBtns(elements);
}

/**
 * Create a subtask list item with edit/delete icons.
 */
function createAndAppendSubtask(text, list) {
  const li = document.createElement("li");
  li.className = "flexR";

  li.innerHTML = `
    <span class="subtask-text">${text}</span>
    <div class="subtask-actions">
      <button class="overlay-button" onclick="editSubtask(this)" aria-label="Edit Subtask">
        ${EDIT_SVG}
      </button>
      <span class="icon-divider">|</span>
      <button class="overlay-button" onclick="deleteSubtask(this)" aria-label="Delete Subtask">
        ${DELETE_SVG}
      </button>
    </div>
  `;

  list.appendChild(li);
}

/**
 * Enables editing of a subtask. Replaces text with input and provides delete + confirm buttons.
 * @param {HTMLElement} btn - The edit button element that was clicked.
 */
function editSubtask(btn) {
  const li = btn.closest("li");
  const textSpan = li.querySelector(".subtask-text");
  const oldText = textSpan.textContent;

  li.classList.add("editing");
  li.innerHTML = `
    <input class="edit-subtask-input" value="${oldText}" onkeydown="onSubtaskEditKey(event, this)">
    <div class="subtask-edit-actions">
      <button class="overlay-button" onclick="deleteSubtask(this)" aria-label="Delete Subtask">
        ${DELETE_SVG}
      </button>
      <span class="icon-divider">|</span>
      <button class="overlay-button" onclick="confirmSubtaskEdit(this)" aria-label="Confirm Edit">
        ${SUBMIT_SVG}
      </button>
    </div>
  `;

  li.querySelector("input").focus();
}

/**
 * Handle Enter key while editing.
 */
function onSubtaskEditKey(event, input) {
  if (event.key === "Enter") {
    confirmSubtaskEdit(input.nextElementSibling.querySelector("button[aria-label='Confirm Edit']"));
  }
}

/**
 * Confirm subtask edit.
 */
function confirmSubtaskEdit(btn) {
  const li = btn.closest("li");
  const input = li.querySelector("input");
  const newText = input.value.trim();
  if (!newText) return;

  li.classList.remove("editing");
  li.innerHTML = `
    <span class="subtask-text">${newText}</span>
    <div class="subtask-actions">
      <button class="overlay-button" onclick="editSubtask(this)" aria-label="Edit Subtask">
        ${EDIT_SVG}
      </button>
      <span class="icon-divider">|</span>
      <button class="overlay-button" onclick="deleteSubtask(this)" aria-label="Delete Subtask">
        ${DELETE_SVG}
      </button>
    </div>
  `;
}

/**
 * Cancel editing and restore original text.
 */
function cancelSubtaskEdit(btn, oldText) {
  const li = btn.closest("li");
  li.classList.remove("editing");
  li.innerHTML = `
    <span class="subtask-text">${oldText}</span>
    <div class="subtask-actions">
      <button class="overlay-button" onclick="editSubtask(this)" aria-label="Edit Subtask">
        ${EDIT_SVG}
      </button>
      <span class="icon-divider">|</span>
      <button class="overlay-button" onclick="deleteSubtask(this)" aria-label="Delete Subtask">
        ${DELETE_SVG}
      </button>
    </div>
  `;
}

/**
 * Delete a subtask.
 */
function deleteSubtask(btn) {
  const li = btn.closest("li");
  li.remove();
}

/**
 * Clear all subtasks.
 */
function clearSubtasks() {
  const list = document.getElementById("subtask-list");
  if (list) list.innerHTML = "";
}

/**
 * Retrieves an array of subtask texts from the DOM.
 * @returns {Array<string>}
 */
function getSubtaskListData() {
    const list = document.getElementById("subtask-list");
    if (!list) return [];
  
    return Array.from(list.querySelectorAll(".subtask-text")).map(
        (item) => item.textContent.trim()
    );
}

window.initSubtaskControls = initSubtaskControls;
window.clearSubtasks = clearSubtasks;
window.getSubtaskListData = getSubtaskListData; 