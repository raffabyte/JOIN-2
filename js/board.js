const OVERLAY = document.getElementById('overlay');
const OVERLAY_CONTENT = document.getElementById('overlayContent');
const TASKS_BASE_URL = "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

let currentDraggedElement;


if (!USERKEY) {
    // Kein Benutzer eingeloggt → weiterleiten
    window.location.href = "../../index.html";
}

/* Overlay closing functionality */

function closeOverlay() {
    OVERLAY_CONTENT.classList.remove('active');

    setTimeout(() => {
        OVERLAY.classList.add('display-none');
        OVERLAY_CONTENT.classList.remove('add-task');
        OVERLAY_CONTENT.innerHTML = '';
        OVERLAY_CONTENT.classList.remove('add-task', 'edit-task-overlay', 'task-overlay');
    }, 110);
}


function handleOverlayClicks(event) {
    event.target === OVERLAY ? closeOverlay() : handleOutsideClick(event);
}

/* Saving added tasks to Board */

function collectTaskData(columnId) {
    const PRIORITY_BTN = document.querySelector('.priority-button.active');
    return {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        dueDate: document.getElementById('taskDueDate').value,
        category: document.getElementById('taskCategory').textContent,
        assignee: Array.from(document.querySelectorAll('#selectedAssignee .contact-icon')).map(span => span.dataset.name),
        priority: PRIORITY_BTN ? PRIORITY_BTN.classList[PRIORITY_BTN.classList.length - 2] : '',
        subtasks: Array.from(document.querySelectorAll('.subtask-text')).map(subtask => ({
            value: subtask.textContent,
            checked: false
        })),
        column: columnId
    };
}


let saveTaskDataTo = (columnId) => {
    const taskData = collectTaskData(columnId);
    if (!taskData.title || !taskData.dueDate || !taskData.category) {
        showValidationErrors();
        return null;
    }
    return taskData;
}


async function taskDataPush(columnId) {
    const taskData = saveTaskDataTo(columnId);
    if (!taskData) return Promise.reject('No task data');

    return fetch(TASKS_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    });
}


/**
 * Konfiguriert Event-Handler für eine Board-Spalte
 * @param {HTMLElement} column - Das Spalten-Element
 * @param {string} columnId - Die ID der Spalte
 * @param {string} dragAreaId - Die ID der Drag-Area
 */
function setupColumnEventHandlers(column, columnId, dragAreaId) {
    column.ondrop = () => moveTo(columnId);
    column.ondragover = (e) => {
        allowDrop(e);
        highlight(dragAreaId);
    };
    column.ondragleave = () => removeHighlight(dragAreaId);
}


function groupAndSortTasks(tasks) {
    const tasksByColumn = {
        todoColumn: [], inProgressColumn: [],
        awaitFeedbackColumn: [], doneColumn: []
    };
    // Gruppiere Tasks nach Spalten
    tasks.forEach(task => {
        if (tasksByColumn[task.column]) { tasksByColumn[task.column].push(task); }
    });
    // Sortiere nach movedAt
    Object.keys(tasksByColumn).forEach(col => {
        tasksByColumn[col].sort((a, b) => (a.movedAt || 0) - (b.movedAt || 0));
    });
    return tasksByColumn;
}


function generateColumnData(tasksByColumn) {
    const columns = ['todoColumn', 'inProgressColumn', 'awaitFeedbackColumn', 'doneColumn'];
    const dragAreas = ['toDoDragArea', 'inProgressDragArea', 'awaitingFeedbackDragArea', 'doneDragArea'];

    return columns.map((col, i) => {
        const tasksHTML = tasksByColumn[col].map(taskCardTemplate).join('');
        return { col, dragAreaId: dragAreas[i], tasksHTML };
    });
}

function renderColumns(columnData) {
    columnData.forEach(({ col, dragAreaId, tasksHTML }) => {
        const column = document.getElementById(col);
        column.innerHTML = tasksHTML + dragAreaTemplate(dragAreaId);
        setupColumnEventHandlers(column, col, dragAreaId);
    });
}

async function updateColumns(tasks) {
    const tasksByColumn = groupAndSortTasks(tasks);
    await loadAllContactColors();
    const columnData = generateColumnData(tasksByColumn);
    renderColumns(columnData);
}


function checkEmptyColumn() {
    const boardColumns = document.querySelectorAll('.board-column');
    boardColumns.forEach(column => {
        const existingNoTask = column.querySelector('.no-task-item');
        const dragArea = column.querySelector('.drag-area');
        
        if (!column.querySelector('.task-card') && dragArea && dragArea.classList.contains('display-none')) {
            !existingNoTask ? column.innerHTML += noTaskCardTemplate(column.getAttribute('column-name')) : null;
        } else {
            // Entferne no-task-item wenn dragArea sichtbar ist oder Tasks vorhanden sind
            existingNoTask ? existingNoTask.remove() : null;
        }
    });
}

async function fetchBoardData() {
    const [tasksResponse] = await Promise.all([
        fetch(TASKS_BASE_URL),
        loadAllContactColors()
    ]);

    return Object.entries((await tasksResponse.json()) || {}).map(([firebaseKey, task]) => ({
        ...task,
        id: firebaseKey
    }));
}

async function updateBoard() {
    try {
        const tasks = await fetchBoardData();
        await updateColumns(tasks);
        checkEmptyColumn();
    } catch (error) {
        console.error('Error updating board:', error);
    }
}


function showAddedTaskNotification() {
    const ADDEDTOBOARDMESSAGE = document.getElementById('addedToBoardMessage');
    ADDEDTOBOARDMESSAGE.classList.remove('display-none');
}



function addTask(event, columnId) {
    if (event) event.preventDefault();
    const taskData = saveTaskDataTo(columnId);

    if (!taskData) {
        return;
    }

    taskDataPush(columnId)
        .then(() => {
            updateBoard();
            showAddedTaskNotification();
            setTimeout(() => {
                closeOverlay();
            }, 900);
        });
}


/* Tasks-Design in Board functions */
let contactColorMap = new Map();

async function loadAllContactColors() {
    const response = await fetch(`https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/users/${USERKEY}/contacts.json`);
    const result = await response.json();

    // Erstelle Color Map für schnellen Zugriff
    contactColorMap.clear();
    Object.values(result || {}).forEach(contact => {
        if (contact.name && contact.color) {
            contactColorMap.set(contact.name, contact.color);
        }
    });

    return result;
}

function getContactColor(name) {
    if (!name) return 'transparent';
    return contactColorMap.get(name) || 'transparent';
}

async function getContactByName(name) {
    const contactsCache = await loadAllContactColors();
    return Object.values(contactsCache || {}).find(contact => contact.name === name) || null;
}


function renderMembers(task) {
    const filteredAssignees = Array.isArray(task.assignee) ? task.assignee.filter(name => name && name.trim()) : '';
    if (filteredAssignees.length === 0) return '';

    const displayAssignees = filteredAssignees.slice(0, 3);
    const result = displayAssignees.map(name => contactIconSpanTemplate(name)).join('');
    return filteredAssignees.length > 3 ? result + extraCountSpanTemplate(filteredAssignees.length - 3) : result;
}


function renderMembersWithName(task) {
    if (!Array.isArray(task.assignee)) return '';
    const filteredAssignees = task.assignee.filter(name => name && name.trim());
    const results = filteredAssignees.map(name => memberWithNameTemplate(name));
    return results.join('');
}



function toCamelCase(word) {
    if (!word) return ''; // Fallback für undefined/null
    return (word.charAt(0).toLowerCase() + word.slice(1)).replace(' ', '')
}


function handlePrioritySvg(priority) {
    switch (priority) {
        case 'HighPriority':
            return HIGH_PRIORITY_SVG;
            break;
        case 'MidPriority':
            return MID_PRIORITY_SVG;
            break;
        case 'LowPriority':
            return LOW_PRIORITY_SVG;
            break;
        default:
            return '';
    }
}


function handleSubtasks(subtasks) {
    if (!subtasks || subtasks.length === 0) {
        return '';
    }

    const completedSubtasks = subtasks.filter(subtask => subtask.checked === true).length;
    const totalSubtasks = subtasks.length;
    const progressPercentage = (completedSubtasks / totalSubtasks) * 100;

    return handleSubtasksTemplate(progressPercentage, completedSubtasks, totalSubtasks);
}


function showCheckedSubtasksCount(subtasks) {
    if (Array.isArray(subtasks) && subtasks.length > 0) {
        return `${subtasks.filter(sub => sub.checked).length}/${subtasks.length}`;
    }
    return '';
}


function visibilityClass(condition) {
    return condition ? '' : ' display-none';
}


function hasFooterData(task) {
    return (Array.isArray(task.assignee) && task.assignee.length > 0) || task.priority;
}


/* Drag & Drop Functions */


function allowDrop(ev) {
    ev.preventDefault();
}


function startDragging(event, id) {
    const taskCard = document.getElementById(id);

    event.dataTransfer.setDragImage(new Image(), 0, 0);
    currentDraggedElement = id;
    taskCard.classList.add('dragging');
}


function stopDragging() {
    const element = document.getElementById(currentDraggedElement);

    element.classList.remove('dragging');
}


function moveTo(column) {
    const element = document.getElementById(currentDraggedElement);
    if (!element) return;

    element.classList.remove('dragging');
    ['toDoDragArea', 'inProgressDragArea', 'awaitingFeedbackDragArea', 'doneDragArea'].forEach(removeHighlight);

    fetch(`https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks/${currentDraggedElement}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ column, movedAt: Date.now() })
    }).then(() => { updateBoard(); currentDraggedElement = null; });
}


function dragAreaHeight(element) {
    const draggedTask = document.getElementById(currentDraggedElement);

    if (draggedTask) {
        const taskHeight = draggedTask.offsetHeight;
        element.style.height = taskHeight + 'px';
    }
}


function highlight(id) {
    const DRAG_AREA = document.getElementById(id);
    const column = DRAG_AREA.parentElement;
    const noTaskItem = column.querySelector('.no-task-item');

    DRAG_AREA.classList.remove('display-none');
    
    dragAreaHeight(DRAG_AREA);
    
    !column.querySelector('.task-card') ? checkEmptyColumn() : null;
}


function removeHighlight(id) {
    const DRAG_AREA = document.getElementById(id);
    if (!DRAG_AREA || !DRAG_AREA.parentElement) return;

    const column = DRAG_AREA.parentElement;
    const noTaskItem = column.querySelector('.no-task-item');

    DRAG_AREA.classList.add('display-none');

    !column.querySelector('.task-card') ? checkEmptyColumn() : null;
}