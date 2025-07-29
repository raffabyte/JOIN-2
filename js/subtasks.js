/**
 * @file subtasks.js
 * @description Handles subtask creation, input visibility, and clearing logic for use in addTask.html.
 */
const editSVG = `
<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.14453 17H3.54453L12.1695 8.375L10.7695 6.975L2.14453 15.6V17ZM16.4445 6.925L12.1945 2.725L13.5945 1.325C13.9779 0.941667 14.4487 0.75 15.007 0.75C15.5654 0.75 16.0362 0.941667 16.4195 1.325L17.8195 2.725C18.2029 3.10833 18.4029 3.57083 18.4195 4.1125C18.4362 4.65417 18.2529 5.11667 17.8695 5.5L16.4445 6.925ZM14.9945 8.4L4.39453 19H0.144531V14.75L10.7445 4.15L14.9945 8.4Z" fill="#2A3647"/>
</svg>`;

const deleteSVG = `
<svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3C0.716667 3 0.479167 2.90417 0.2875 2.7125C0.0958333 2.52083 0 2.28333 0 2C0 1.71667 0.0958333 1.47917 0.2875 1.2875C0.479167 1.09583 0.716667 1 1 1H5C5 0.716667 5.09583 0.479167 5.2875 0.2875C5.47917 0.0958333 5.71667 0 6 0H10C10.2833 0 10.5208 0.0958333 10.7125 0.2875C10.9042 0.479167 11 0.716667 11 1H15C15.2833 1 15.5208 1.09583 15.7125 1.2875C15.9042 1.47917 16 1.71667 16 2C16 2.28333 15.9042 2.52083 15.7125 2.7125C15.5208 2.90417 15.2833 3 15 3V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM3 3V16H13V3H3ZM5 13C5 13.2833 5.09583 13.5208 5.2875 13.7125C5.47917 13.9042 5.71667 14 6 14C6.28333 14 6.52083 13.9042 6.7125 13.7125C6.90417 13.5208 7 13.2833 7 13V6C7 5.71667 6.90417 5.47917 6.7125 5.2875C6.52083 5.09583 6.28333 5 6 5C5.71667 5 5.47917 5.09583 5.2875 5.2875C5.09583 5.47917 5 5.71667 5 6V13ZM9 13C9 13.2833 9.09583 13.5208 9.2875 13.7125C9.47917 13.9042 9.71667 14 10 14C10.2833 14 10.5208 13.9042 10.7125 13.7125C10.9042 13.5208 11 13.2833 11 13V6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6V13Z" fill="#2A3647"/>
</svg>`;

const checkSVG = `
<svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.69474 9.15L14.1697 0.675C14.3697 0.475 14.6072 0.375 14.8822 0.375C15.1572 0.375 15.3947 0.475 15.5947 0.675C15.7947 0.875 15.8947 1.1125 15.8947 1.3875C15.8947 1.6625 15.7947 1.9 15.5947 2.1L6.39474 11.3C6.19474 11.5 5.96141 11.6 5.69474 11.6C5.42807 11.6 5.19474 11.5 4.99474 11.3L0.694738 7C0.494738 6.8 0.398905 6.5625 0.407238 6.2875C0.415572 6.0125 0.519738 5.775 0.719738 5.575C0.919738 5.375 1.15724 5.275 1.43224 5.275C1.70724 5.275 1.94474 5.375 2.14474 5.575L5.69474 9.15Z" fill="#2A3647"/>
</svg>`;

/**
 * Redirects the user if not logged in.
 */
if (!window.USERKEY) {
  window.location.href = "../../index.html";
}

/**
 * Initializes subtask controls: plus, add, and cancel buttons.
 */
function initSubtaskControls() {
  const elements = getSubtaskElements();
  if (!elements) return;

  elements.plusBtn.addEventListener("click", () => showAddCancelBtns(elements));
  elements.clearBtn.addEventListener("click", () => cancelSubtask(elements));
  elements.confirmBtn.addEventListener("click", () => handleSubtaskAddition(elements));
}

/**
 * Cancels subtask creation and hides the input.
 * @param {object} elements - The subtask UI elements.
 */
function cancelSubtask(elements) {
  hideAddCancelBtns(elements);
  clearSubtaskInput(elements);
}

/**
 * Shows Add/Cancel buttons and hides plus button.
 * @param {object} elements - The subtask UI elements.
 */
function showAddCancelBtns(elements) {
  elements.addCancelBtns.style.display = "flex";
  elements.plusBtn.style.display = "none";
  elements.input.focus();
}

/**
 * Hides Add/Cancel buttons and shows plus button.
 * @param {object} elements - The subtask UI elements.
 */
function hideAddCancelBtns(elements) {
  elements.addCancelBtns.style.display = "none";
  elements.plusBtn.style.display = "flex";
}

/**
 * Handles adding a subtask with validation and UI reset.
 * @param {object} elements - The subtask UI elements.
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
}

/**
 * Clears the input and hides controls.
 * @param {object} elements - The subtask UI elements.
 */
function clearSubtaskInput(elements) {
  elements.input.value = "";
  hideAddCancelBtns(elements);
}

/**
 * Creates and appends a subtask list item with icons and interaction elements.
 * @param {string} text - The subtask text.
 * @param {HTMLElement} list - The list to append to.
 */
function createAndAppendSubtask(text, list) {
  const li = document.createElement("li");
  li.className = "flexR";

  li.innerHTML = `
    <span class="subtask-text">${text}</span>
    <div class="subtask-actions">
      <button class="overlay-button" onclick="editSubtask(this)" aria-label="Edit Subtask">
        ${editSVG}
      </button>
      <span class="icon-divider">|</span>
      <button class="overlay-button" onclick="deleteSubtask(this)" aria-label="Delete Subtask">
        ${deleteSVG}
      </button>
    </div>
  `;

  list.appendChild(li);
}


/**
 * Edits a subtask when the edit icon is clicked.
 * @param {HTMLElement} btn - The edit button element.
 */
function editSubtask(btn) {
  const li = btn.closest("li");
  const textSpan = li.querySelector(".subtask-text");
  const oldText = textSpan.textContent;

  li.classList.add("editing");
li.innerHTML = `
  <input class="edit-subtask-input" value="${oldText}" onkeydown="onSubtaskEditKey(event, this)">
  <div class="subtask-edit-actions">
    <button class="overlay-button" onclick="cancelSubtaskEdit(this, '${oldText}')" aria-label="Cancel">
      ${deleteSVG}
    </button>
    <span class="icon-divider">|</span>
    <button class="overlay-button" onclick="confirmSubtaskEdit(this)" aria-label="Confirm">
      ${checkSVG}
    </button>
  </div>
`;

  li.querySelector("input").focus();
}

/**
 * Confirms editing a subtask and saves changes.
 * @param {HTMLElement} btn - The confirm button element.
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
        ${editSVG}
      </button>
      <span class="icon-divider">|</span>
      <button class="overlay-button" onclick="deleteSubtask(this)" aria-label="Delete Subtask">
        ${deleteSVG}
      </button>
    </div>
  `;
}

/**
 * Cancels editing and restores the original subtask text.
 * @param {HTMLElement} btn - The cancel button element.
 * @param {string} oldText - The original subtask text.
 */
function cancelSubtaskEdit(btn, oldText) {
  const li = btn.closest("li");
  li.classList.remove("editing");
  li.innerHTML = `
    <span class="subtask-text">${oldText}</span>
    <div class="subtask-actions">
      <button class="overlay-button" onclick="editSubtask(this)" aria-label="Edit Subtask">
        ${editSVG}
      </button>
      <span class="icon-divider">|</span>
      <button class="overlay-button" onclick="deleteSubtask(this)" aria-label="Delete Subtask">
        ${deleteSVG}
      </button>
    </div>
  `;
}

/**
 * Deletes the corresponding subtask.
 * @param {HTMLElement} btn - The delete button element.
 */
function deleteSubtask(btn) {
  const li = btn.closest("li");
  li.remove();
}


/**
 * Returns DOM references for subtask-related elements.
 * @returns {object|null}
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

window.initSubtaskControls = initSubtaskControls;

/**
 * Clears all subtasks from the list.
 */
function clearSubtasks() {
  const list = document.getElementById("subtask-list");
  if (list) {
    list.innerHTML = "";
  }
}

window.clearSubtasks = clearSubtasks;
