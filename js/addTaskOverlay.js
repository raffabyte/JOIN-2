/** Handles outside clicks for the category options dropdown. */
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

/** Handles outside clicks for the assignee options list. */
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

/** Handles outside clicks for the subtask input area. */
function handleSubtaskInputOutsideClick(event) {
  const inputFeld = document.getElementById("inputBox");
  const plusBtn = document.getElementById("subtaskPlusBtn");
  const addCancelBtns = document.getElementById("addCancelBtns");
  const HINT_MESSAGE_DIV = document.getElementById("subtaskHintMessage");

  if (inputFeld && !inputFeld.contains(event.target)) {
    addCancelBtns.classList.add("display-none");
    HINT_MESSAGE_DIV.classList.add("display-none");
    inputFeld.classList.remove("correct-me");
  }
}

/** Delegates global outside clicks to all handlers. */
function handleOutsideClick(event) {
  handleCategoryOptionsOutsideClick(event);
  handleAssigneeOptionsOutsideClick(event);
  handleSubtaskInputOutsideClick(event);
}

/** Opens the add-task overlay and initializes its content. */
function addTaskOverlay(columnId) {
  // Set the overlay content to the add task form
  OVERLAY_CONTENT.innerHTML = addTaskOverlayForm(columnId);
  OVERLAY_CONTENT.classList.add("add-task");

  // Load and render contacts
  loadAndRenderContacts();

  // Show the overlay
  OVERLAY.classList.remove("display-none");

  setTimeout(() => {
    // Add animation class to the overlay content
    OVERLAY_CONTENT.classList.add("active");
  }, 10);
}

/** Fetches contacts for the current user from Firebase. */
async function fetchContactsData() {
  const response = await fetch(
    `https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/users/${USERKEY}/contacts.json`
  );
  const data = await response.json();
  await loadAllContactColors();
  return Object.entries(data || {}).filter(([, contact]) => contact?.name);
}

/** Renders the assignee options list from contacts. */
function renderContactOptions(contactEntries) {
  const assigneeOptions = document.getElementById("assigneeOptions");
  if (assigneeOptions) {
    const contactTemplates = contactEntries.map(([, contact]) =>
      assigneeOptionTemplate(contact)
    );
    assigneeOptions.innerHTML = contactTemplates.join("");
    setTimeout(() => markPreselectedAssignees(), 100);
  }
}

/** Loads contacts and renders them into the overlay. */
async function loadAndRenderContacts() {
  try {
    const contactEntries = await fetchContactsData();
    renderContactOptions(contactEntries);
  } catch (error) {
    console.error("Error loading contacts:", error);
  }
}

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

/** Sets the active priority button by given priority. */
function PriorityHandler(priority) {
  const buttons = document.querySelectorAll(
    ".priority-button, .edit-priority-button"
  );
  const priorityMap = {
    high: "HighPriority",
    medium: "MidPriority",
    low: "LowPriority",
  };

  buttons.forEach((btn) => btn.classList.remove("active"));
  buttons.forEach((btn) => {
    if (btn.classList.contains(priorityMap[priority])) {
      btn.classList.add("active");
    }
  });
}

/** Filters visible assignees by search text. */
function searchAssignee(text) {
  if (!text || !text.trim()) return loadAndRenderContacts();
  const assigneeOptions = document.getElementById("assigneeOptions");
  const options = assigneeOptions.querySelectorAll(".assignee-option");
  let visibleCount = 0;

  options.forEach((option) => {
    const contactName = option.querySelector(".contact-name").textContent;
    const isMatch = contactName.toLowerCase().includes(text.toLowerCase());
    option.classList.toggle("display-none", !isMatch);
    if (isMatch) visibleCount++;
  });
  
  checkNoResults(visibleCount, text);
}

/** Injects a “no results” info when nothing matches. */
function checkNoResults(numberOfResults, text) {
  const assigneeOptions = document.getElementById("assigneeOptions");
  if (!assigneeOptions) return;

  const existingNotFound = assigneeOptions.querySelector(".no-results");
  if (existingNotFound) existingNotFound.remove();

  if (numberOfResults === 0 && text.trim()) {
    assigneeOptions.innerHTML += noSearchResultsTemplate();
  }
}

/** Toggles the assignee options dropdown visibility. */
function toggleAssigneeOptions() {
  const ASSIGNEEOPTIONS = document.getElementById("assigneeOptions");

  ASSIGNEEOPTIONS.classList.toggle("display-none");
  ASSIGNEEOPTIONS.classList.toggle("active");
  if (ASSIGNEEOPTIONS.classList.contains("active")) {
    markPreselectedAssignees();
  }
}

/** Marks already selected assignees in the options list. */
function markPreselectedAssignees() {
  const currentAssignees = getCurrentTaskAssignees();

  document.querySelectorAll(".assignee-option").forEach((option) => {
    const contactNameElement = option.querySelector(".contact-name");
    const checkbox = option.querySelector(".checkbox");
    const checkboxFilled = option.querySelector(".checkbox-filled");
    if (contactNameElement && checkbox && checkboxFilled) {
      const isSelected = currentAssignees.includes(
        contactNameElement.textContent
      );
      option.classList.toggle("selcted-assignee", isSelected);
      checkbox.classList.toggle("display-none", isSelected);
      checkboxFilled.classList.toggle("display-none", !isSelected);
    }
  });
}

/** Returns the names of currently selected assignees in the overlay. */
function getCurrentTaskAssignees() {
  const containers = document.querySelectorAll('#selectedAssignee,#editedAssignee,#selected-assignees,#selectedAssignees,.assignee-container .flexC,.assigned-to-wrapper .selected-assignees');
  for (const c of containers) {
    const m = Array.from(c.querySelectorAll('.member-name-text')).map(e=>e.textContent.trim()).filter(Boolean);
    if (m.length) return m;
    const i = Array.from(c.querySelectorAll('.contact-icon[data-name]')).map(e=>e.dataset.name?.trim()).filter(Boolean);
    if (i.length) return i;
    const n = Array.from(c.querySelectorAll('.contact-name')).map(e=>e.textContent.trim()).filter(Boolean);
    if (n.length) return n;
  }
  const boxes = document.querySelectorAll('#assigneeOptions input[type="checkbox"]:checked,#assigned-to-options input[type="checkbox"]:checked');
  return boxes.length?Array.from(boxes).map(cb=>{const r=cb.closest('li')||cb.parentElement;const nm=r?.querySelector('.contact-name')?.textContent.trim();return (nm||cb.dataset?.email||cb.value||'').trim();}).filter(Boolean):[];
}

/** Toggles selected styling and checkbox icons for an assignee row. */
function highligtSlected(item) {
  const CHECKBOX = item.querySelector(".checkbox");
  const CHECKBOXFILLED = item.querySelector(".checkbox-filled");

  item.classList.toggle("selcted-assignee");
  CHECKBOX.classList.toggle("display-none");
  CHECKBOXFILLED.classList.toggle("display-none");
}

/** Selects or deselects an assignee and updates selected list. */
function selectAssignee(assignee) {
  let nameSpan = assignee.querySelector(".contact-name");
  let assigneeName = nameSpan ? nameSpan.textContent : assignee;

  toggleAssigneeIcon(assigneeName);
  highligtSlected(assignee);
}

/** Toggles the presence of an assignee icon in the selection area. */
function toggleAssigneeIcon(assigneeName) {
  let SELECTEDASSIGNEE =
    document.getElementById("selectedAssignee") ||
    document.getElementById("editedAssignee");
  let iconSpans = SELECTEDASSIGNEE.querySelectorAll(
    ".contact-icon:not(.extra-count)"
  );
  let notFound = false;

  iconSpans.forEach((span) => {
    if (span.dataset.name === assigneeName) {
      span.remove();
      notFound = true;
    }
  });

  addToSelectedAssignee(assigneeName, !notFound);
}

/** Adds or removes an assignee icon and updates the display overflow. */
function addToSelectedAssignee(assigneeName, found) {
  let SELECTEDASSIGNEE =
    document.getElementById("selectedAssignee") ||
    document.getElementById("editedAssignee");
  if (found) {
    SELECTEDASSIGNEE.classList.remove("display-none");
    SELECTEDASSIGNEE.innerHTML += contactIconSpanTemplate(assigneeName);
  }
  updateAssigneeDisplay(SELECTEDASSIGNEE);
}

/** Manages visible icons and extra-count in the selection area. */
function updateAssigneeDisplay(container) {
  const maxVisible = 5;
  const allSpans = container.querySelectorAll(
    ".contact-icon:not(.extra-count)"
  );

  container.querySelector(".contact-icon.extra-count")?.remove();

  allSpans.forEach(
    (span, index) => (span.style.display = index < maxVisible ? "" : "none")
  );

  if (allSpans.length > maxVisible) {
    container.innerHTML += extraCountSpanTemplate(allSpans.length - maxVisible);
  }
}

/** Toggles the category options dropdown visibility. */
function toggleCategoryOptions() {
  const opts = document.getElementById("categoryOptions");
  if (!opts) return;
  opts.classList.toggle("display-none");
  opts.classList.toggle("active");
}

/** Selects a category, updates the input, and closes the dropdown. */
function selectCategory(category) {
  const input = document.getElementById("taskCategory");
  const opts = document.getElementById("categoryOptions");
  if (!input) return;

  input.textContent = category;
  input.classList.add("selected");
  opts?.classList.add("display-none");
  opts?.classList.remove("active");
}

/** Adds a subtask when pressing Enter on the target input. */
function onEnterAddSubTask(event, inputId) {
  if (event.key === "Enter") {
    event.preventDefault();
    addSubtask(inputId);
  }
}

/** Saves an edited subtask when pressing Enter. */
function onEnterEditSubTask(event, editInput) {
  if (event.key === "Enter") {
    event.preventDefault();
    finalEditditSubtask(editInput);
  }
}

/** Shows add/cancel buttons and hides the plus button for subtasks. */
function showAddCancelBtns() {
  const plusBtn = document.getElementById("subtaskPlusBtn");
  const addCancelBtns = document.getElementById("addCancelBtns");

  addCancelBtns.classList.remove("display-none");
}

/** Resets subtask input fields and button visibility. */
function cancelSubtask() {
  const subtaskInput = document.getElementById("subtasks");
  const editedSubtaskInput = document.getElementById("editedSubtasks");
  const plusBtn = document.getElementById("subtaskPlusBtn");
  const addCancelBtns = document.getElementById("addCancelBtns");

  if (subtaskInput) subtaskInput.value = "";
  if (editedSubtaskInput) editedSubtaskInput.value = "";
  if (plusBtn) plusBtn.classList.remove("display-none");
  if (addCancelBtns) addCancelBtns.classList.add("display-none");
}

/** Adds a subtask to the list with basic validation. */
function addSubtask(subtaskInputId) {
  const inputElement = document.getElementById(subtaskInputId);
  const inputValue = inputElement.value;
  const hintDiv = document.getElementById("subtaskHintMessage");
  const subtasksList = document.getElementById(
    subtaskInputId === "editedSubtasks" ? "editedSubtasksList" : "subtasksList"
  );

  checkSubtask(inputValue.length, inputValue, subtasksList);

  hintDiv.classList.contains("display-none")
    ? addSubtaskToList(subtasksList, inputValue, inputElement)
    : "";
}

/** Appends a new subtask item to the visible list. */
function addSubtaskToList(subtasksList, inputValue, inputElement) {
  subtasksList.classList.remove("display-none");
  subtasksList.innerHTML += addSubTaskTemplate(inputValue);
  inputElement.value = "";
}

/** Toggles the subtask alert message and input highlight. */
function showHideAlertMessage() {
  const HINT_MESSAGE_DIV = document.getElementById("subtaskHintMessage");
  const INPUT_FELD = document.getElementById("inputBox");

  HINT_MESSAGE_DIV.classList.toggle("display-none");
  INPUT_FELD.classList.toggle("correct-me");
}

/** Validates subtask input and shows contextual errors. */
function checkSubtask(subtaskLength, inputValue, subtasksList) {
  const HINT_MESSAGE_DIV = document.getElementById("subtaskHintMessage");
  const INPUT_FELD = document.getElementById("inputBox");
  const valueExists = subtasksList
    ?.querySelectorAll(".subtask-text")
    .values()
    .find((st) => st.textContent.trim() === inputValue.trim());

  const errorMessages = {
    length:
      subtaskLength <= 2 ? "Subtask must be at least 3 characters long" : null,
    exists: valueExists ? "Subtask already exists" : null,
  };

  const error = errorMessages.length || errorMessages.exists;
  HINT_MESSAGE_DIV.textContent = error || "";
  HINT_MESSAGE_DIV.classList.toggle("display-none", !error);
  INPUT_FELD.classList.toggle("correct-me", !!error);
}

/** Removes a subtask item from the list. */
function deleteSubtask(subtask) {
  subtask.closest(".subtask-item").remove();
}

/** Opens a subtask in edit mode and pre-fills the input. */
function editSubtask(btn) {
  let subtask = btn.closest(".subtask-item");
  let subtaskDisplay = subtask.querySelector(".subtask");
  let editDiv = subtask.querySelector(".edit-subtask-input-wrapper");
  let toEditText = subtask.querySelector(".subtask-text").textContent;

  subtaskDisplay.classList.add("display-none");
  editDiv.classList.remove("display-none");
  const editInput = editDiv.querySelector(".edit-subtask-input");
  editInput.value = toEditText;

  onEnterEditSubTask(editInput);
}

function finalEditditSubtask(subtask) {
  let subtaskItem = subtask.closest(".subtask-item");
  let editDiv = subtaskItem.querySelector(".edit-subtask-input-wrapper");
  let subtaskDisplay = subtaskItem.querySelector(".subtask");
  let input = editDiv.querySelector(".edit-subtask-input");
  let newText = input.value.trim();
  
  if (!validateEditedSubtask(subtaskItem, newText)) {
    return;
  }

  subtaskItem.querySelector(".subtask-text").textContent = newText;
  editDiv.classList.add("display-none");
  subtaskDisplay.classList.remove("display-none");
  clearEditValidation(subtaskItem);
}

function validateEditedSubtask(subtaskItem, text) {
  if (text.length < 3) {
    showEditValidationError(subtaskItem, "Subtask must be at least 3 characters");
    return false;
  }
  
  if (subtaskAlreadyExists(subtaskItem, text)) {
    showEditValidationError(subtaskItem, "Subtask already exists");
    return false;
  }
  return true;
}

function subtaskAlreadyExists(currentItem, text) {
  let existingSubtasks = [];
  document.querySelectorAll(".subtask-item").forEach(item => {
    if (item !== currentItem && item.querySelector(".subtask-text")?.textContent?.trim()) {
      existingSubtasks.push(item.querySelector(".subtask-text").textContent.trim().toLowerCase());
    }
  });
  return existingSubtasks.includes(text.toLowerCase());
}

function showEditValidationError(subtaskItem, message) {
  let editWrapper = subtaskItem.querySelector(".edit-subtask-input-wrapper");
  editWrapper.classList.add("edit-validation-error");
  
  let existingHint = subtaskItem.querySelector(".hint");
  if (existingHint) existingHint.remove();
  
  let hint = document.createElement("span");
  hint.className = "hint edit-validation-hint";
  hint.textContent = message;
  
  editWrapper.parentNode.insertBefore(hint, editWrapper.nextSibling);
}

function clearEditValidation(subtaskItem) {
  let editWrapper = subtaskItem.querySelector(".edit-subtask-input-wrapper");
  editWrapper.classList.remove("edit-validation-error");
  
  let hint = subtaskItem.querySelector(".hint");
  if (hint) hint.remove();
}

// Add event listener for outside clicks to close dropdowns
document.addEventListener('click', handleOutsideClick);


function addTaskForm() {
  const form = document.getElementById("addTaskSeite");
  form.innerHTML = addTaskOverlayForm("todoColumn", 'Clear');

  const closeBtn = document.getElementById("closeOverlayBtn");
  if (closeBtn) closeBtn.classList.add("display-none");
  loadAndRenderContacts();
}

