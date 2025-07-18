
function addTaskOverlay(columnId) {
    // Set the overlay content to the add task form
    OVERLAY_CONTENT.innerHTML = addTaskOverlayForm(columnId);
    OVERLAY_CONTENT.classList.add('add-task');

    // Show the overlay
    OVERLAY.classList.remove('display-none');

    setTimeout(() => {
        // Add animation class to the overlay content
        OVERLAY_CONTENT.classList.add('active');
        initializeSubtaskEventHandlers();
    }, 10);
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
    buttons.forEach(btn => btn.classList.remove('active'));
    buttons.forEach(btn => {
        switch (priority) {
            case 'high':
                if (btn.classList.contains('HighPriority')) btn.classList.add('active');
                break;
            case 'medium':
                if (btn.classList.contains('MidPriority')) btn.classList.add('active');
                break;
            case 'low':
                if (btn.classList.contains('LowPriority')) btn.classList.add('active');
                break;
        }
    });
}

function toggleAssigneeOptions() {
    const  ASSIGNEEOPTIONS = document.getElementById('assigneeOptions');
    
    ASSIGNEEOPTIONS.classList.toggle('display-none');
    ASSIGNEEOPTIONS.classList.toggle('active');
}


function highligtSlected(item) {
    const CHECKBOX = item.querySelector('.checkbox');
    const CHECKBOXFILLED = item.querySelector('.checkbox-filled');

    item.classList.toggle('selcted-assignee');
    CHECKBOX.classList.toggle('display-none');
    CHECKBOXFILLED.classList.toggle('display-none');
}


function toggleAssigneeIcon(assigneeName) {
    let SELECTEDASSIGNEE = document.getElementById('selectedAssignee') || document.getElementById('editedAssignee');
    
    let iconSpans = SELECTEDASSIGNEE.querySelectorAll('.contact-icon');
    let found = false;
    iconSpans.forEach(span => {
        if (span.dataset.name === assigneeName) {
            span.remove();
            found = true;
        }
    });
    if (!found) {
        SELECTEDASSIGNEE.classList.remove('display-none');
        SELECTEDASSIGNEE.innerHTML += contactIconSpanTemplate(assigneeName);
    }
}


function selectAssignee(assignee) {
    let nameSpan = assignee.querySelector('.contact-name');
    let assigneeName = nameSpan ? nameSpan.textContent : assignee;

    toggleAssigneeIcon(assigneeName);
}

function toggleCategoryOptions() {
    const CATEGORYOPTIONS = document.getElementById('categoryOptions');
    
    CATEGORYOPTIONS.classList.toggle('display-none');
    CATEGORYOPTIONS.classList.toggle('active');
}

function selectCategory(category) {
    const TASKCATEGORY = document.getElementById('taskCategory');
    const CATEGORYOPTIONS = document.getElementById('categoryOptions');

    TASKCATEGORY.textContent = category;
    CATEGORYOPTIONS.classList.add('display-none');
    CATEGORYOPTIONS.classList.remove('active');
    
}



document.addEventListener('click', function(event) {
    const categoryOptions = document.getElementById('categoryOptions');
    if (categoryOptions && categoryOptions.classList.contains('active')) {
        if (!categoryOptions.contains(event.target) && event.target.id !== 'taskCategory') {
            categoryOptions.classList.add('display-none');
            categoryOptions.classList.remove('active');
        }
    }
});

document.addEventListener('click' , function(event) {

    const assigneeOptions = document.getElementById('assigneeOptions');
    if (assigneeOptions && assigneeOptions.classList.contains('active')) {
        if (!assigneeOptions.contains(event.target) && event.target.id !== 'taskAssignee') {
            assigneeOptions.classList.add('display-none');
            assigneeOptions.classList.remove('active');
        }
    }
});


document.addEventListener('click', function(event) {
    const inputFeld = document.getElementById('inputBox');
    const plusBtn = document.getElementById('subtaskPlusBtn');
    const addCancelBtns = document.getElementById('addCancelBtns');
    const  HINT_MESSAGE_DIV = document.getElementById('subtaskHintMessage');

     if (inputFeld && !inputFeld.contains(event.target)) {
        plusBtn.classList.remove('display-none');
        addCancelBtns.classList.add('display-none');
        HINT_MESSAGE_DIV.classList.add('display-none');
     }

    if (inputFeld && inputFeld.classList.contains('correct-me')) {
        if (!inputFeld.contains(event.target)) {
            inputFeld.classList.remove('correct-me');
        }
    }
});

function onEnterAddSubTask(subtaskInput){
    if (subtaskInput && !subtaskInput._enterListenerAdded) {
        subtaskInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                addSubtask(subtaskInput.id);
            }
        });
        subtaskInput._enterListenerAdded = true;
    }
}

function onEnterEditSubTask(editInput){
    if (editInput && !editInput._enterListenerAdded) {
        editInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                finalEditditSubtask(editInput);
            }
        });
        editInput._enterListenerAdded = true;
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

    subtaskInput.value = ''; 
    editedSubtaskInput.value = '';
    plusBtn.classList.remove('display-none');
    addCancelBtns.classList.add('display-none');
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
    const valueExists = subtasksList && Array.from(subtasksList.querySelectorAll('.subtask-text')).map(st => st.textContent.trim()).includes(inputValue.trim());
    INPUT_FELD.classList.add('correct-me');

    if (subtaskLength <= 2) {
        HINT_MESSAGE_DIV.textContent = 'Subtask must be at least 3 characters long';
        HINT_MESSAGE_DIV.classList.remove('display-none');
    } else if (valueExists) {
        HINT_MESSAGE_DIV.textContent = 'Subtask already exists';
        HINT_MESSAGE_DIV.classList.remove('display-none');
    } else {
        HINT_MESSAGE_DIV.classList.add('display-none');
        INPUT_FELD.classList.remove('correct-me');
    }
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


function initializeSubtaskEventHandlers() {
    ['subtasks', 'editedSubtasks'].forEach(id => {
        const input = document.getElementById(id);
        if (input) onEnterAddSubTask(input);
    });

    document.querySelectorAll('.edit-subtask-input').forEach(editInput => {
        onEnterEditSubTask(editInput);
    });
}