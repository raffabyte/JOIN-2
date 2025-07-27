/**
 * @file subtasks.js
 * @description Handles subtask creation, input visibility, and clearing logic for use in addTask.html.
 */
const editSVG = `
<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.14453 17H3.54453L12.1695 8.375L10.7695 6.975L2.14453 15.6V17ZM16.4445 6.925L12.1945 2.725L13.5945 1.325C13.9779 0.941667 14.4487 0.75 15.007 0.75C15.5654 0.75 16.0362 0.941667 16.4195 1.325L17.8195 2.725C18.2029 3.10833 18.4029 3.57083 18.4195 4.1125C18.4362 4.65417 18.2529 5.11667 17.8695 5.5L16.4445 6.925ZM14.9945 8.4L4.39453 19H0.144531V14.75L10.7445 4.15L14.9945 8.4Z" fill="#2A3647"/>
</svg>`;

const deleteSVG = `
<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.14453 18C2.59453 18 2.1237 17.8042 1.73203 17.4125C1.34036 17.0208 1.14453 16.55 1.14453 16V3C0.861198 3 0.623698 2.90417 0.432031 2.7125C0.240365 2.52083 0.144531 2.28333 0.144531 2C0.144531 1.71667 0.240365 1.47917 0.432031 1.2875C0.623698 1.09583 0.861198 1 1.14453 1H5.14453C5.14453 0.716667 5.24036 0.479167 5.43203 0.2875C5.6237 0.0958333 5.8612 0 6.14453 0H10.1445C10.4279 0 10.6654 0.0958333 10.857 0.2875C11.0487 0.479167 11.1445 0.716667 11.1445 1H15.1445C15.4279 1 15.6654 1.09583 15.857 1.2875C16.0487 1.47917 16.1445 1.71667 16.1445 2C16.1445 2.28333 16.0487 2.52083 15.857 2.7125C15.6654 2.90417 15.4279 3 15.1445 3V16C15.1445 16.55 14.9487 17.0208 14.557 17.4125C14.1654 17.8042 13.6945 18 13.1445 18H3.14453Z" fill="#2A3647"/>
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
 * Creates and appends a subtask list item.
 * @param {string} text - The subtask text.
 * @param {HTMLElement} list - The list to append to.
 */
function createAndAppendSubtask(text, list) {
  const li = document.createElement("li");
  li.className = "flexR";
  li.innerHTML = `<span class="subtask-text">${text}</span>`;
  list.appendChild(li);
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
