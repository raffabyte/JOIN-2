const userKey = localStorage.getItem("loggedInUserKey");

if (!userKey) {
  // Kein Benutzer eingeloggt → weiterleiten
  window.location.href = "../../index.html";
}

const OVERLAY = document.getElementById('overlay');
const OVERLAY_CONTENT = document.getElementById('overlayContent');


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
    const PRIORITY = PRIORITY_BTN ? PRIORITY_BTN.classList[PRIORITY_BTN.classList.length - 1] : '';
    const SUBTASKS = Array.from(document.querySelectorAll('.subtask-text')).map(subtask => subtask.textContent);
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


function taskDataPush() {
    const taskData = saveTaskData();
    if (!taskData) {
        return;
    }

    fetch(BASE_URL, {
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
        if (task.column === 'todoColumn') {
            todoColumn.innerHTML += taskCard;
        } else if (task.column === 'inProgressColumn') {
            inProgressColumn.innerHTML += taskCard;
        } else if (task.column === 'awaitFeedbackColumn') {
            awaitFeedbackColumn.innerHTML += taskCard;
        } else if (task.column === 'doneColumn') {
            doneColumn.innerHTML += taskCard;
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
    fetch(BASE_URL)
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

    taskDataPush();
    updateBoard();
    closeOverlay();
}

function renderMembers() {
    Array.isArray(task.assignee)
        ? task.assignee.map(name => contactIconSpanTemplate(name)).join('') : ''

}