function handleCategoryOptionsOutsideClick(event) {
  const opts   = document.getElementById('category-options');
  const input  = document.getElementById('category-input');
  const toggle = document.getElementById('category-toggle-btn');
  if (!opts || !opts.classList.contains('active')) return;

  const clickedInsideOpts = opts.contains(event.target);
  const clickedInput      = input && input.contains(event.target);
  const clickedToggle     = toggle && toggle.contains(event.target);

  if (!clickedInsideOpts && !clickedInput && !clickedToggle) {
    opts.classList.add('display-none');
    opts.classList.remove('active');
  }
}

function handleAssigneeOptionsOutsideClick(event) {
    const assigneeOptions = document.getElementById('assigneeOptions');
    if (assigneeOptions && assigneeOptions.classList.contains('active')) {
        if (!assigneeOptions.contains(event.target) && event.target.id !== 'taskAssignee') {
            assigneeOptions.classList.add('display-none');
            assigneeOptions.classList.remove('active');
        }
    }
}

function handleSubtaskInputOutsideClick(event) {
    const inputFeld = document.getElementById('inputBox');
    const plusBtn = document.getElementById('subtaskPlusBtn');
    const addCancelBtns = document.getElementById('addCancelBtns');
    const HINT_MESSAGE_DIV = document.getElementById('subtaskHintMessage');

    if (inputFeld && !inputFeld.contains(event.target)) {
        plusBtn.classList.remove('display-none');
        addCancelBtns.classList.add('display-none');
        HINT_MESSAGE_DIV.classList.add('display-none');
        inputFeld.classList.remove('correct-me');
    }
}

function handleOutsideClick(event) {
    handleCategoryOptionsOutsideClick(event);
    handleAssigneeOptionsOutsideClick(event);
    handleSubtaskInputOutsideClick(event);
}


function addTaskOverlay(columnId) {
    // Set the overlay content to the add task form
    OVERLAY_CONTENT.innerHTML = addTaskOverlayForm(columnId);
    OVERLAY_CONTENT.classList.add('add-task');

    // Load and render contacts
    loadAndRenderContacts();

    // Show the overlay
    OVERLAY.classList.remove('display-none');

    setTimeout(() => {
        // Add animation class to the overlay content
        OVERLAY_CONTENT.classList.add('active');
    }, 10);
}

async function fetchContactsData() {
    const response = await fetch(`https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/users/${USERKEY}/contacts.json`);
    const data = await response.json();
    await loadAllContactColors();
    return Object.entries(data || {}).filter(([,contact]) => contact?.name);
}

function renderContactOptions(contactEntries) {
    const assigneeOptions = document.getElementById('assigneeOptions');
    if (assigneeOptions) {
        const contactTemplates = contactEntries.map(([,contact]) => assigneeOptionTemplate(contact));
        assigneeOptions.innerHTML = contactTemplates.join('');
        setTimeout(() => markPreselectedAssignees(), 100);
    }
}

async function loadAndRenderContacts() {
    try {
        const contactEntries = await fetchContactsData();
        renderContactOptions(contactEntries);
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}


function hideValidationErrors() {
    document.querySelectorAll('.required-span').forEach(span => span.classList.add('display-none'));
    document.querySelectorAll('.requierd-input').forEach(input => input.classList.remove('correct-me'));
}


function showValidationErrors() {
    document.querySelectorAll('.required-span').forEach(span => span.classList.remove('display-none'));
    document.querySelectorAll('.requierd-input').forEach(input => input.classList.add('correct-me'));
}


function PriorityHandler(priority) {
    const buttons = document.querySelectorAll('.priority-button, .edit-priority-button');
    const priorityMap = { 'high': 'HighPriority', 'medium': 'MidPriority', 'low': 'LowPriority' };
    
    buttons.forEach(btn => btn.classList.remove('active'));
    buttons.forEach(btn => {
        if (btn.classList.contains(priorityMap[priority])) {
            btn.classList.add('active');
        }
    });
}

function searchAssignee(text) {
    const assigneeOptions = document.getElementById('assigneeOptions');
    const options = assigneeOptions.querySelectorAll('.assignee-option');
    let visibleCount = 0;

    options.forEach(option => {
        const contactName = option.querySelector('.contact-name').textContent;
        const isMatch = contactName.toLowerCase().includes(text.toLowerCase());
        option.classList.toggle('display-none', !isMatch);
        if (isMatch) visibleCount++;
    });

    checkNoResults(visibleCount , text);
}

function checkNoResults(numberOfResults, text) {
  const assigneeOptions = document.getElementById('assigneeOptions');
  if (!assigneeOptions) return;

  const existingNotFound = assigneeOptions.querySelector('.no-results');
  if (existingNotFound) existingNotFound.remove();

  if (numberOfResults === 0 && text.trim()) {
    assigneeOptions.innerHTML += noSearchResultsTemplate();
  }
}

function toggleAssigneeOptions() {
    const ASSIGNEEOPTIONS = document.getElementById('assigneeOptions');
    
    ASSIGNEEOPTIONS.classList.toggle('display-none');
    ASSIGNEEOPTIONS.classList.toggle('active');
    
    // Wenn die Optionen geöffnet werden, bereits zugewiesene Kontakte markieren
    if (ASSIGNEEOPTIONS.classList.contains('active')) {
        markPreselectedAssignees();
    }
}

function markPreselectedAssignees() {
    const currentAssignees = getCurrentTaskAssignees();
    
    document.querySelectorAll('.assignee-option').forEach(option => {
        const contactNameElement = option.querySelector('.contact-name');
        const checkbox = option.querySelector('.checkbox');
        const checkboxFilled = option.querySelector('.checkbox-filled');
        if (contactNameElement && checkbox && checkboxFilled) {
            const isSelected = currentAssignees.includes(contactNameElement.textContent);
            option.classList.toggle('selcted-assignee', isSelected);
            checkbox.classList.toggle('display-none', isSelected);
            checkboxFilled.classList.toggle('display-none', !isSelected);
        }
    });
}

function getCurrentTaskAssignees() {
    // Für Edit-Modus: aus dem HTML der Task extrahieren
    const taskOverlayContent = document.getElementById('taskOverlayContent');
    if (taskOverlayContent) {
        const assigneeContainer = document.querySelector('.assignee-container .flexC');
        if (assigneeContainer) {
            // Assignee-Namen aus dem HTML extrahieren
            const memberElements = assigneeContainer.querySelectorAll('.member-name-text');
            return Array.from(memberElements).map(el => el.textContent.trim()).filter(name => name);
        }
    }
    
    return [];
}


function highligtSlected(item) {
    const CHECKBOX = item.querySelector('.checkbox');
    const CHECKBOXFILLED = item.querySelector('.checkbox-filled');

    item.classList.toggle('selcted-assignee');
    CHECKBOX.classList.toggle('display-none');
    CHECKBOXFILLED.classList.toggle('display-none');
}

function selectAssignee(assignee) {
    let nameSpan = assignee.querySelector('.contact-name');
    let assigneeName = nameSpan ? nameSpan.textContent : assignee;

    toggleAssigneeIcon(assigneeName);
    highligtSlected(assignee);
}


function toggleAssigneeIcon(assigneeName) {
    let SELECTEDASSIGNEE = document.getElementById('selectedAssignee') || document.getElementById('editedAssignee');
    let iconSpans = SELECTEDASSIGNEE.querySelectorAll('.contact-icon:not(.extra-count)');
    let notFound = false;
    
    iconSpans.forEach(span => {
        if (span.dataset.name === assigneeName) {
            span.remove();
            notFound = true;
        }
    });

    addToSelectedAssignee(assigneeName, !notFound);
}

function addToSelectedAssignee(assigneeName, found) {
    let SELECTEDASSIGNEE = document.getElementById('selectedAssignee') || document.getElementById('editedAssignee');
    if (found) {
        SELECTEDASSIGNEE.classList.remove('display-none');
        SELECTEDASSIGNEE.innerHTML += contactIconSpanTemplate(assigneeName);
    }
    updateAssigneeDisplay(SELECTEDASSIGNEE);
}

function updateAssigneeDisplay(container) {
    const maxVisible = 5;
    const allSpans = container.querySelectorAll('.contact-icon:not(.extra-count)');
    
    container.querySelector('.contact-icon.extra-count')?.remove();
    
    allSpans.forEach((span, index) => span.style.display = index < maxVisible ? '' : 'none');
    
    if (allSpans.length > maxVisible) {
        container.innerHTML += extraCountSpanTemplate(allSpans.length - maxVisible);
    }
}

function toggleCategoryOptions() {
  const opts = document.getElementById('category-options');
  if (!opts) return;
  opts.classList.toggle('display-none');
  opts.classList.toggle('active');
}

function selectCategory(category) {
  const input = document.getElementById('category-input');
  const opts  = document.getElementById('category-options');
  if (!input) return;

  input.value = category;                  // <— wichtig: value, nicht textContent
  input.dispatchEvent(new Event('input')); // Validierungs-/Clear-Listener anstoßen
  opts?.classList.add('display-none');
  opts?.classList.remove('active');
}



function onEnterAddSubTask(event, inputId){
    if (event.key === 'Enter') {
        event.preventDefault();
        addSubtask(inputId);
    }
}

function onEnterEditSubTask(event, editInput){
    if (event.key === 'Enter') {
        event.preventDefault();
        finalEditditSubtask(editInput);
    }
}

function showAddCancelBtns() {
    const plusBtn = document.getElementById('subtaskPlusBtn');
    const addCancelBtns = document.getElementById('addCancelBtns');

    plusBtn.classList.add('display-none');
    addCancelBtns.classList.remove('display-none');
}

function cancelSubtask(){
    const subtaskInput = document.getElementById('subtasks');
    const editedSubtaskInput = document.getElementById('editedSubtasks');
    const plusBtn = document.getElementById('subtaskPlusBtn');
    const addCancelBtns = document.getElementById('addCancelBtns');

    if (subtaskInput) subtaskInput.value = ''; 
    if (editedSubtaskInput) editedSubtaskInput.value = '';
    if (plusBtn) plusBtn.classList.remove('display-none');
    if (addCancelBtns) addCancelBtns.classList.add('display-none');
}

function addSubtask(subtaskInputId){
    const inputElement = document.getElementById(subtaskInputId);
    const inputValue = inputElement.value;
    const hintDiv = document.getElementById('subtaskHintMessage');
    const subtasksList = document.getElementById(subtaskInputId === 'editedSubtasks' ? 'editedSubtasksList' : 'subtasksList');
    
    checkSubtask(inputValue.length, inputValue, subtasksList);
    
    hintDiv.classList.contains('display-none') ?  addSubtaskToList(subtasksList, inputValue, inputElement) : '';
}

function addSubtaskToList(subtasksList, inputValue, inputElement) {
    subtasksList.classList.remove('display-none');
    subtasksList.innerHTML += addSubTaskTemplate(inputValue);
    inputElement.value = '';
}

function showHideAlertMessage() {
    const  HINT_MESSAGE_DIV = document.getElementById('subtaskHintMessage');
    const INPUT_FELD = document.getElementById('inputBox');

    HINT_MESSAGE_DIV.classList.toggle('display-none');
    INPUT_FELD.classList.toggle('correct-me');
}

function checkSubtask(subtaskLength, inputValue, subtasksList){
    const HINT_MESSAGE_DIV = document.getElementById('subtaskHintMessage');
    const INPUT_FELD = document.getElementById('inputBox');
    const valueExists = subtasksList?.querySelectorAll('.subtask-text').values().find(st => st.textContent.trim() === inputValue.trim());
    
    const errorMessages = {
        length: subtaskLength <= 2 ? 'Subtask must be at least 3 characters long' : null,
        exists: valueExists ? 'Subtask already exists' : null
    };
    
    const error = errorMessages.length || errorMessages.exists;
    HINT_MESSAGE_DIV.textContent = error || '';
    HINT_MESSAGE_DIV.classList.toggle('display-none', !error);
    INPUT_FELD.classList.toggle('correct-me', !!error);
}

function deleteSubtask(subtask){
    subtask.closest('.subtask-item').remove();
}

function editSubtask(btn) {
    let subtask = btn.closest('.subtask-item');
    let subtaskDisplay = subtask.querySelector('.subtask');
    let editDiv = subtask.querySelector('.edit-subtask-input-wrapper');
    let toEditText = subtask.querySelector('.subtask-text').textContent;

    subtaskDisplay.classList.add('display-none');
    editDiv.classList.remove('display-none');
    const editInput = editDiv.querySelector('.edit-subtask-input');
    editInput.value = toEditText;

    onEnterEditSubTask(editInput);
}


function finalEditditSubtask(subtask){
    let subtaskItem = subtask.closest('.subtask-item');
    let editDiv = subtaskItem.querySelector('.edit-subtask-input-wrapper');
    let subtaskDisplay = subtaskItem.querySelector('.subtask');
    let input = editDiv.querySelector('.edit-subtask-input');
    let newText = input.value;

    // Text aktualisieren
    subtaskItem.querySelector('.subtask-text').textContent = newText;
    // Edit-Modus ausblenden, Anzeige wieder einblenden
    editDiv.classList.add('display-none');
    subtaskDisplay.classList.remove('display-none');
}
