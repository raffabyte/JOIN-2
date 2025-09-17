/**
 * Fetches contacts for the current user from Firebase.
 * @returns {Promise<Array<[string, {name:string}]>>} Filtered entries with names
 */
async function fetchContactsData() {
  const response = await fetch(
    `https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/users/${USERKEY}/contacts.json`
  );
  const data = await response.json();
  await loadAllContactColors();
  return Object.entries(data || {}).filter(([, contact]) => contact?.name);
}

/**
 * Renders the assignee options list from contacts.
 * @param {Array<[string, {name:string}]>} contactEntries - Contact entries to render
 */
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

/** Filters visible assignees by search text. */
function searchAssignee(text) {
  if (!text || !text.trim()) return loadAndRenderContacts();
  const opts = document.getElementById("assigneeOptions");
  const count = applyAssigneeFilter(opts?.querySelectorAll(".assignee-option") || [], text);
  checkNoResults(count, text);
}

/**
 * Applies filter to assignee option nodes and returns visible count.
 * @param {NodeListOf<Element>|Array<Element>} options - Option nodes.
 * @param {string} text - Filter text (case-insensitive).
 * @returns {number} Visible option count.
 */
function applyAssigneeFilter(options, text) {
  let visible = 0; const q = text.toLowerCase();
  options.forEach((o) => {
    const name = o.querySelector(".contact-name")?.textContent || "";
    const match = name.toLowerCase().includes(q);
    o.classList.toggle("display-none", !match);
    if (match) visible++;
  });
  return visible;
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
      applyOptionSelectionState(option, checkbox, checkboxFilled, isSelected);
    }
  });
}

/**
 * Applies selected styling and toggles checkbox icons for an option row.
 * @param {Element} option - The option row element.
 * @param {Element} checkbox - Unchecked icon element.
 * @param {Element} checkboxFilled - Checked icon element.
 * @param {boolean} isSelected - Whether option is selected.
 */
function applyOptionSelectionState(option, checkbox, checkboxFilled, isSelected){
  option.classList.toggle("selcted-assignee", isSelected);
  checkbox.classList.toggle("display-none", isSelected);
  checkboxFilled.classList.toggle("display-none", !isSelected);
}

/**
 * Returns the names of currently selected assignees in the overlay.
 * Prefers visible selection containers, falls back to checked checkboxes.
 *
 * @returns {string[]} Array of assignee names.
 */
function getCurrentTaskAssignees() {
  const fromContainers = collectAssigneesFromContainers();
  if (fromContainers.length) return fromContainers;
  return collectAssigneesFromCheckboxes();
}

/**
 * Collects assignee names from known visual containers in the DOM.
 * Probes multiple container variants to ensure compatibility across views.
 *
 * @returns {string[]} Names found in selected-assignee containers.
 */
function collectAssigneesFromContainers(){
  const nodes = document.querySelectorAll('#selectedAssignee,#editedAssignee,#selected-assignees,#selectedAssignees,.assignee-container .flexC,.assigned-to-wrapper .selected-assignees');
  for (const c of nodes) {
    const m = Array.from(c.querySelectorAll('.member-name-text')).map(e=>e.textContent.trim()).filter(Boolean);
    if (m.length) return m;
    const i = Array.from(c.querySelectorAll('.contact-icon[data-name]')).map(e=>e.dataset.name?.trim()).filter(Boolean);
    if (i.length) return i;
    const n = Array.from(c.querySelectorAll('.contact-name')).map(e=>e.textContent.trim()).filter(Boolean);
    if (n.length) return n;
  }
  return [];
}

/**
 * Collects assignee names from checked checkbox inputs in the options list.
 *
 * @returns {string[]} Names resolved from checked inputs or associated labels.
 */
function collectAssigneesFromCheckboxes(){
  const boxes = document.querySelectorAll('#assigneeOptions input[type="checkbox"]:checked,#assigned-to-options input[type="checkbox"]:checked');
  if(!boxes.length) return [];
  return Array.from(boxes).map(cb=>{
    const r=cb.closest('li')||cb.parentElement; const nm=r?.querySelector('.contact-name')?.textContent.trim();
    return (nm||cb.dataset?.email||cb.value||'').trim();
  }).filter(Boolean);
}

/**
 * Toggles selected styling and checkbox icons for an assignee option row.
 *
 * @param {HTMLElement} item - The option row element.
 */
function highligtSlected(item) {
  const CHECKBOX = item.querySelector(".checkbox");
  const CHECKBOXFILLED = item.querySelector(".checkbox-filled");

  item.classList.toggle("selcted-assignee");
  CHECKBOX.classList.toggle("display-none");
  CHECKBOXFILLED.classList.toggle("display-none");
}

/**
 * Selects or deselects an assignee and updates the selected icons list.
 *
 * @param {HTMLElement|string} assignee - Option row element or assignee name.
 */
function selectAssignee(assignee) {
  let nameSpan = assignee.querySelector(".contact-name");
  let assigneeName = nameSpan ? nameSpan.textContent : assignee;

  toggleAssigneeIcon(assigneeName);
  highligtSlected(assignee);
}

/**
 * Toggles the presence of an assignee icon in the selection area.
 *
 * @param {string} assigneeName - Full name of the assignee.
 */
function toggleAssigneeIcon(assigneeName) {
  const container = getAssigneeContainer();
  const removed = removeAssigneeFromContainer(container, assigneeName);
  addToSelectedAssignee(assigneeName, !removed);
}

/**
 * Returns the active assignee container, preferring the edit overlay.
 *
 * @returns {HTMLElement|null} The container element or null.
 */
function getAssigneeContainer(){
  return document.getElementById("editedAssignee") || document.getElementById("selectedAssignee");
}

/**
 * Removes an assignee icon from the container if present.
 *
 * @param {HTMLElement} container - Selected assignee icons container.
 * @param {string} assigneeName - Name to remove.
 * @returns {boolean} True if an icon was removed.
 */
function removeAssigneeFromContainer(container, assigneeName){
  let removed=false;
  container.querySelectorAll('.contact-icon:not(.extra-count)').forEach((span)=>{
    if(span.dataset.name===assigneeName){ span.remove(); removed=true; }
  });
  return removed;
}

/**
 * Adds an assignee icon if toggled on and updates the overflow display (+N).
 *
 * @param {string} assigneeName - Name to add if selected.
 * @param {boolean} found - Whether the name was not removed (true => add).
 */
function addToSelectedAssignee(assigneeName, found) {
  // Bevorzuge im Edit-Modus #editedAssignee (Reihenfolge invertiert)
  let SELECTEDASSIGNEE =
    document.getElementById("editedAssignee") ||
    document.getElementById("selectedAssignee");
  if (found) {
    SELECTEDASSIGNEE.classList.remove("display-none");
    SELECTEDASSIGNEE.innerHTML += contactIconSpanTemplate(assigneeName);
  }
  updateAssigneeDisplay(SELECTEDASSIGNEE);
}

/**
 * Manages visible icons and extra-count badge in the selection area.
 * Shows up to 5 icons, collapses the rest into a +N badge.
 *
 * @param {HTMLElement} container - The selected-assignee icons container.
 */
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

/**
 * Creates and inserts a hint element after the edit wrapper.
 * @param {HTMLElement} editWrapper - The edit wrapper container.
 * @param {string} message - The hint text to display.
 */
function insertSubtaskHintAfter(editWrapper, message) {
  const hint = document.createElement('span');
  hint.className = 'hint edit-validation-hint';
  hint.textContent = message;
  editWrapper.parentNode.insertBefore(hint, editWrapper.nextSibling);
}

/** Clears validation state and removes hint for a subtask row. */
function clearEditValidation(subtaskItem) {
  let editWrapper = subtaskItem.querySelector('.edit-subtask-input-wrapper');
  editWrapper.classList.remove('edit-validation-error');
  subtaskItem.querySelector('.hint')?.remove();
}
