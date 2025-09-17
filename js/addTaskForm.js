/**
 * Handles outside clicks for the category options dropdown.
 * Closes category options when click happens outside.
 * @param {MouseEvent} event - The click event.
 */
function handleCategoryOptionsOutsideClick(event) {
  const opts = document.getElementById("categoryOptions");
  const input = document.getElementById("taskCategory");
  if (!opts || !opts.classList.contains("active")) return;

  const clickedInsideOpts = opts.contains(event.target);
  const clickedInput = input && input.contains(event.target);

  if (!clickedInsideOpts && !clickedInput) {
    opts.classList.add("display-none");
    opts.classList.remove("active");
  }
}

/**
 * Handles outside clicks for the assignee options list.
 * @param {MouseEvent} event - The click event.
 */
function handleAssigneeOptionsOutsideClick(event) {
  const assigneeOptions = document.getElementById("assigneeOptions");
  if (assigneeOptions && assigneeOptions.classList.contains("active")) {
    if (
      !assigneeOptions.contains(event.target) &&
      event.target.id !== "taskAssignee"
    ) {
      assigneeOptions.classList.add("display-none");
      assigneeOptions.classList.remove("active");
    }
  }
}

/**
 * Handles outside clicks for the subtask input area.
 * Hides controls and validation state when clicking outside.
 * @param {MouseEvent} event - The click event.
 */
function handleSubtaskInputOutsideClick(event) {
  const inputFeld = document.getElementById("inputBox");
  const plusBtn = document.getElementById("subtaskPlusBtn");
  const addCancelBtns = document.getElementById("addCancelBtns");
  const HINT_MESSAGE_DIV = document.getElementById("subtaskHintMessage");

  if (inputFeld && !inputFeld.contains(event.target)) {
    addCancelBtns?.classList.add("display-none");
    HINT_MESSAGE_DIV?.classList.add("display-none");
    inputFeld.classList.remove("correct-me");
  }
}

/**
 * Delegates global outside clicks to all section handlers.
 * @param {MouseEvent} event - The click event.
 */
function handleOutsideClick(event) {
  handleCategoryOptionsOutsideClick(event);
  handleAssigneeOptionsOutsideClick(event);
  handleSubtaskInputOutsideClick(event);
}

/**
 * Opens the add-task overlay and initializes its content.
 * @param {string} columnId - Board column id for the new task.
 */
function addTaskOverlay(columnId) {
  renderAddTaskOverlayContent(columnId);
  // Provided by addTaskOverlay.assignees.js
  if (typeof loadAndRenderContacts === 'function') loadAndRenderContacts();
  showOverlay();
  activateOverlayAnimation();
}

/**
 * Renders the Add Task overlay HTML content.
 * @param {string} columnId - Board column id.
 */
function renderAddTaskOverlayContent(columnId) {
  OVERLAY_CONTENT.innerHTML = addTaskOverlayForm(columnId);
  OVERLAY_CONTENT.classList.add("add-task");
}

/** Shows the overlay container. */
function showOverlay() { OVERLAY.classList.remove("display-none"); }

/** Adds entry animation to the overlay content. */
function activateOverlayAnimation() { setTimeout(() => OVERLAY_CONTENT.classList.add("active"), 10); }

/** Hides all validation error messages for required inputs. */
function hideValidationErrors() {
  document
    .querySelectorAll(".required-span")
    .forEach((span) => span.classList.add("display-none"));
  document
    .querySelectorAll(".requierd-input")
    .forEach((input) => input.classList.remove("correct-me"));
}

/** Shows all validation error messages for required inputs. */
function showValidationErrors() {
  document
    .querySelectorAll(".required-span")
    .forEach((span) => span.classList.remove("display-none"));
  document
    .querySelectorAll(".requierd-input")
    .forEach((input) => input.classList.add("correct-me"));
}

/**
 * Sets the active priority button by given priority.
 * @param {('high'|'medium'|'low')} priority - Target priority.
 */
function priorityHandler(priority) {
  const buttons = document.querySelectorAll(".priority-button, .edit-priority-button");
  const map = { high: "HighPriority", medium: "MidPriority", low: "LowPriority" };
  buttons.forEach((b) => b.classList.remove("active"));
  buttons.forEach((b) => { if (b.classList.contains(map[priority])) b.classList.add("active"); });
}

/**
 * Toggles the category options dropdown visibility.
 * @returns {void}
 */
function toggleCategoryOptions() {
  const opts = document.getElementById("categoryOptions");
  if (!opts) return;
  opts.classList.toggle("display-none");
  opts.classList.toggle("active");
}

/**
 * Selects a category, updates the input, and closes the dropdown.
 * @param {string} category - Selected category label.
 */
function selectCategory(category) {
  const input = document.getElementById("taskCategory");
  const opts = document.getElementById("categoryOptions");
  if (!input) return;

  input.textContent = category;
  input.classList.add("selected");
  opts?.classList.add("display-none");
  opts?.classList.remove("active");
}

// Add event listener for outside clicks to close dropdowns
document.addEventListener('click', handleOutsideClick);

/** Injects the Add Task form into the dedicated page container. */
function addTaskForm() {
  const form = document.getElementById("addTaskSeite");
  form.innerHTML = addTaskOverlayForm("todoColumn", 'Clear');

  const closeBtn = document.getElementById("closeOverlayBtn");
  if (closeBtn) closeBtn.classList.add("display-none");
  // Provided by addTaskOverlay.assignees.js
  if (typeof loadAndRenderContacts === 'function') loadAndRenderContacts();
}

/**
 * Adds a subtask when pressing Enter on the target input.
 * @param {KeyboardEvent} event - Keydown event from the input.
 * @param {string} inputId - Target input id ('subtasks'|'editedSubtasks').
 */
function onEnterAddSubTask(event, inputId) {
  if (event.key === 'Enter') {
    event.preventDefault();
    addSubtask(inputId);
  }
}

/**
 * Saves an edited subtask when pressing Enter or wires an input to Enter-save.
 * @param {KeyboardEvent|HTMLInputElement} eventOrInput - Keydown event or direct input element.
 */
function onEnterEditSubTask(eventOrInput) {
  if (eventOrInput && eventOrInput.target && eventOrInput.key === 'Enter') {
    eventOrInput.preventDefault();
    finalEditditSubtask(eventOrInput.target);
    return;
  }
  const input = eventOrInput;
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      finalEditditSubtask(input);
    }
  });
}

/** Shows the add/cancel control group below the subtask input. */
function showAddCancelBtns() {
  document.getElementById('addCancelBtns')?.classList.remove('display-none');
}

/** Resets subtask inputs and hides add/cancel controls. */
function cancelSubtask() {
  const sub = document.getElementById('subtasks');
  const ed = document.getElementById('editedSubtasks');
  const plus = document.getElementById('subtaskPlusBtn');
  const wrap = document.getElementById('addCancelBtns');
  if (sub) sub.value = '';
  if (ed) ed.value = '';
  if (plus) plus.classList.remove('display-none');
  if (wrap) wrap.classList.add('display-none');
}

/**
 * Adds a subtask to the appropriate list after validation.
 * @param {string} inputId - 'subtasks' or 'editedSubtasks'.
 */
function addSubtask(inputId) {
  const el = document.getElementById(inputId);
  if (!el) return;
  const list = document.getElementById(inputId === 'editedSubtasks' ? 'editedSubtasksList' : 'subtasksList');
  const val = el.value.trim();
  if (!checkSubtask(val.length, val, list) || !list) return;
  list.classList.remove('display-none');
  list.innerHTML += addSubTaskTemplate(val);
  el.value = '';
}

/** Toggles subtask hint visibility and error highlight class. */
function showHideAlertMessage() {
  document.getElementById('subtaskHintMessage')?.classList.toggle('display-none');
  document.getElementById('inputBox')?.classList.toggle('correct-me');
}

/**
 * Live input handler: shows controls and validates value.
 * @param {HTMLInputElement} inputEl - The subtask input element.
 */
function handleSubtaskInputChange(inputEl) {
  if (!inputEl) return;
  showAddCancelForInput();
  const list = document.getElementById('subtasksList');
  const val = inputEl.value;
  checkSubtask(val.length, val, list);
  if (!val.trim()) resetSubtaskValidationState();
}

/** Ensures add/cancel wrapper is visible for subtask input. */
function showAddCancelForInput() {
  const w = document.getElementById('addCancelBtns');
  if (w?.classList.contains('display-none')) w.classList.remove('display-none');
}

/** Clears hint and error highlight for subtask input. */
function resetSubtaskValidationState() {
  document.getElementById('addCancelBtns')?.classList.add('display-none');
  document.getElementById('subtaskHintMessage')?.classList.add('display-none');
  document.getElementById('inputBox')?.classList.remove('correct-me');
}

/**
 * Validates subtask input value and toggles contextual error hints.
 * @param {number} _ - Legacy length param (unused).
 * @param {string} inputValue - The current input value.
 * @param {HTMLElement} subtasksList - The UL to check for duplicates.
 * @returns {boolean} True when valid, false otherwise.
 */
function checkSubtask(_, inputValue, subtasksList) {
  const hint = document.getElementById('subtaskHintMessage');
  const box = document.getElementById('inputBox');
  const list = resolveSubtasksList(subtasksList);
  const val = (typeof inputValue === 'string' ? inputValue : document.activeElement?.value || '').trim();
  const error = detectSubtaskError(val, list);
  if (hint) {
    hint.textContent = error;
    hint.classList.toggle('display-none', !error);
  }
  if (box) box.classList.toggle('correct-me', !!error);
  return !error;
}

/**
 * Resolves the correct UL element for subtask list given active input focus.
 * @param {HTMLElement|null} list - Optional explicit list element.
 * @returns {HTMLElement|null} The resolved list (edited vs. new) or null.
 */
function resolveSubtasksList(list) {
  if (list) return list;
  const id = document.activeElement?.id;
  return document.getElementById(id === 'editedSubtasks' ? 'editedSubtasksList' : 'subtasksList');
}

/**
 * Computes validation error message or empty string when valid.
 * @param {string} val - Proposed subtask text.
 * @param {HTMLElement|null} list - List for duplicate detection.
 * @returns {string} Empty string if OK, otherwise error message.
 */
function detectSubtaskError(val, list) {
  if (!val) return 'Subtask required';
  if (val.length < 3) return 'Subtask must be at least 3 characters';
  const dup = list && Array.from(list.querySelectorAll('.subtask-text')).some((st) => st.textContent?.trim() === val);
  return dup ? 'Subtask already exists' : '';
}

/** Removes a subtask row from the list. */
function deleteSubtask(subtask) {
  subtask.closest('.subtask-item').remove();
}

/** Opens a subtask row in edit mode and prefills the input. */
function editSubtask(btn) {
  const row = btn.closest('.subtask-item');
  openSubtaskEditUI(row);
}

/**
 * Switches a row to edit mode and wires Enter-save.
 * @param {HTMLElement} row - The subtask row container.
 */
function openSubtaskEditUI(row) {
  const display = row.querySelector('.subtask');
  const edit = row.querySelector('.edit-subtask-input-wrapper');
  const text = row.querySelector('.subtask-text')?.textContent || '';
  display.classList.add('display-none');
  edit.classList.remove('display-none');
  const input = edit.querySelector('.edit-subtask-input');
  input.value = text;
  onEnterEditSubTask(input);
}

/**
 * Finalizes subtask edit; validates and applies new text.
 * @param {HTMLElement} subtask - Edit input element or child inside row.
 */
function finalEditditSubtask(subtask) {
  const item = subtask.closest('.subtask-item');
  const edit = item.querySelector('.edit-subtask-input-wrapper');
  const display = item.querySelector('.subtask');
  const input = edit.querySelector('.edit-subtask-input');
  const text = input.value.trim();

  if (!validateEditedSubtask(item, text)) return;
  item.querySelector('.subtask-text').textContent = text;
  edit.classList.add('display-none');
  display.classList.remove('display-none');
  clearEditValidation(item);
}

/**
 * Validates the edited subtask text.
 * @param {HTMLElement} subtaskItem - Row container being edited.
 * @param {string} text - New text to validate.
 * @returns {boolean} True if valid.
 */
function validateEditedSubtask(subtaskItem, text) {
  if (text.length < 3) {
    showEditValidationError(subtaskItem, 'Subtask must be at least 3 characters');
    return false;
  }
  if (subtaskAlreadyExists(subtaskItem, text)) {
    showEditValidationError(subtaskItem, 'Subtask already exists');
    return false;
  }
  return true;
}

/**
 * Checks for duplicate subtask text among sibling rows.
 * @param {HTMLElement} currentItem - The row being edited.
 * @param {string} text - Normalized text to check.
 * @returns {boolean} True if a duplicate exists.
 */
function subtaskAlreadyExists(currentItem, text) {
  let existingSubtasks = [];
  document.querySelectorAll('.subtask-item').forEach((item) => {
    if (item !== currentItem && item.querySelector('.subtask-text')?.textContent?.trim()) {
      existingSubtasks.push(item.querySelector('.subtask-text').textContent.trim().toLowerCase());
    }
  });
  return existingSubtasks.includes(text.toLowerCase());
}

/**
 * Shows inline validation error styling and message for a row.
 * @param {HTMLElement} subtaskItem - The subtask row.
 * @param {string} message - Error message to display.
 */
function showEditValidationError(subtaskItem, message) {
  let editWrapper = subtaskItem.querySelector('.edit-subtask-input-wrapper');
  editWrapper.classList.add('edit-validation-error');
  let existingHint = subtaskItem.querySelector('.hint');
  if (existingHint) existingHint.remove();
  insertSubtaskHintAfter(editWrapper, message);
}

