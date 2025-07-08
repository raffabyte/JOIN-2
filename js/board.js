const userKey = localStorage.getItem("loggedInUserKey");

if (!userKey) {
    // Kein Benutzer eingeloggt → weiterleiten
    window.location.href = "../../index.html";
}

const OVERLAY = document.getElementById('overlay');
const OVERLAY_CONTENT = document.getElementById('overlayContent');
const TASKS_BASE_URL = "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

function addTaskOverlay() {
    // Set the overlay content to the add task form
    OVERLAY_CONTENT.innerHTML = addTaskOverlayForm();
    OVERLAY_CONTENT.classList.add('add-task');

    // Show the overlay
    OVERLAY.classList.remove('display-none');

    setTimeout(() => {
        // Add animation class to the overlay content
        OVERLAY_CONTENT.classList.add('active');
        const subtaskInput = document.getElementById('subtasks');
        onEnterAddSubTask(subtaskInput);
        document.querySelectorAll('.edit-subtask-input').forEach(editInput => {
            onEnterEditSubTask(editInput);
        });
    }, 10);
}



function closeOverlay() {
    // Remove animation class
    OVERLAY_CONTENT.classList.remove('active');

    // Hide the overlay after animation
    setTimeout(() => {
        OVERLAY.classList.add('display-none');
        OVERLAY_CONTENT.classList.remove('add-task');
        OVERLAY_CONTENT.innerHTML = '';
    }, 110);
}


function notContentClickClose(event) {
    if (event.target === OVERLAY) {
        closeOverlay();
    }
}


let saveTaskData = () => {
    const TASKTITLE = document.getElementById('taskTitle').value;
    const TASKDESCRIPTION = document.getElementById('taskDescription').value;
    const TASKDUEDATE = document.getElementById('taskDueDate').value;
    const TASKCATEGORY = document.getElementById('taskCategory').textContent;
    const TASKASSIGNEE = Array.from(document.querySelectorAll('#selectedAssignee .contact-icon')).map(span => span.dataset.name);
    const PRIORITY_BTN = document.querySelector('.priority-button.active');
    const PRIORITY = PRIORITY_BTN ? PRIORITY_BTN.classList[PRIORITY_BTN.classList.length - 2] : '';
    const SUBTASKS = Array.from(document.querySelectorAll('.subtask-text')).map(subtask => ({
        value: subtask.textContent,
        checked: false
    }));
    const RQUIRED_SPAN_HINT = document.querySelectorAll('.required-span');
    const REQUIRED_INPUTS = document.querySelectorAll('.requierd-input');

    let taskData = {
        title: TASKTITLE,
        description: TASKDESCRIPTION,
        dueDate: TASKDUEDATE,
        category: TASKCATEGORY,
        assignee: TASKASSIGNEE,
        priority: PRIORITY,
        subtasks: SUBTASKS,
        column: 'todoColumn' // Standardmäßig in der To-Do-Spalte
    };
    // Validierung der Eingabedaten
    if (!TASKTITLE || !TASKDUEDATE || !TASKCATEGORY) {
        RQUIRED_SPAN_HINT.forEach(span => {
            span.classList.remove('display-none');
            REQUIRED_INPUTS.forEach(input => {
                input.classList.add('correct-me');
            });

        });
        return null;
    } else {
        return taskData;
    }
}


async function taskDataPush() {
    const taskData = saveTaskData();
    if (!taskData) {
        return Promise.reject('No task data');
    }

    return fetch(TASKS_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
    })
}

function updateColumns(tasks) {
    const todoColumn = document.getElementById('todoColumn');
    const inProgressColumn = document.getElementById('inProgressColumn');
    const awaitFeedbackColumn = document.getElementById('awaitFeedbackColumn');
    const doneColumn = document.getElementById('doneColumn');

    todoColumn.innerHTML = '';
    inProgressColumn.innerHTML = '';
    doneColumn.innerHTML = '';
    awaitFeedbackColumn.innerHTML = '';

    tasks.forEach(task => {
        let taskCard = taskCardTemplate(task);
        switch (task.column) {
            case 'todoColumn':
                todoColumn.innerHTML += taskCard;
                break;
            case 'inProgressColumn':
                inProgressColumn.innerHTML += taskCard;
                break;
            case 'awaitFeedbackColumn':
                awaitFeedbackColumn.innerHTML += taskCard;
                break;
            case 'doneColumn':
                doneColumn.innerHTML += taskCard;
                break;
        }

    }
    );
}
function checkEmptyColumn() {
    const boardColumns = document.querySelectorAll('.board-column');
    boardColumns.forEach(column => {
        if (!column.querySelector('.task-card')) {
            column.innerHTML = noTaskCardTemplate();
        }
    });
}

function updateBoard() {
    fetch(TASKS_BASE_URL)
        .then(response => response.json())
        .then(data => {
            const tasks = Object.values(data || {}).map((task, index) => ({
                ...task,
                id: index + 1 // Assign a unique ID based on the index
            }));
            updateColumns(tasks)
            checkEmptyColumn();
        });
}



function addTask(event) {
    if (event) event.preventDefault();
    const taskData = saveTaskData();

    if (!taskData) {
        return;
    }

    taskDataPush()
        .then(()=> { 
            updateBoard();
            showAddedTaskNotification();
            setTimeout(() => {
                closeOverlay();
            }, 900);  
        });
}

function showAddedTaskNotification() {
    const ADDEDTOBOARDMESSAGE = document.getElementById('addedToBoardMessage');
    ADDEDTOBOARDMESSAGE.classList.remove('display-none');
}

function renderMembers(task) {
    return Array.isArray(task.assignee) ? task.assignee.map(name => contactIconSpanTemplate(name)).join('') : ''
}

function toCamelCase(word) {
    return (word.charAt(0).toLowerCase() + word.slice(1)).replace(' ', '')
}

function handlePriority(priority) {
    switch (priority) {
        case 'HighPriority':
            return HighPrioritySvgTemplate();
            break;
        case 'MidPriority':
            return MidPrioritySvgTemplate();
            break;
        case 'LowPriority':
            return LowPrioritySvgTemplate();
            break;
        default:
            return '';
    }
}

function handleSubtasks(subtasks) {
    if (Array.isArray(subtasks) && subtasks.length > 0) {
        return `${subtasks.filter(sub => sub.checked).length}/${subtasks.length}`;
    }
    return '';
}

function toggleSubtasksVisibility(task){
    return `${Array.isArray(task.subtasks) && task.subtasks.length > 0 ? '' : ' display-none'}"`;
}