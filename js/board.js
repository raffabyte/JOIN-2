const TASKS_BASE_URL = "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";


if (!USERKEY) {
    window.location.href = "../../index.html";
}

/* Saving added tasks to Board */

/**
 * Gets the selected priority from the form
 * @returns {string} 
 */
function getSelectedPriority() {
    const priorityBtn = document.querySelector('.priority-button.active');
    return priorityBtn ? priorityBtn.classList[priorityBtn.classList.length - 2] : '';
}


/**
 * Gets the assigned contacts from the form
 * @returns {Array<string>} 
 */
function getAssignedContacts() {
    return Array.from(document.querySelectorAll('#selectedAssignee .contact-icon'))
        .map(span => span.dataset.name);
}


/**
 * Gets the subtasks from the form
 * @returns {Array<Object>} 
 */
function getFormSubtasks() {
    return Array.from(document.querySelectorAll('.subtask-text')).map(subtask => ({
        value: subtask.textContent,
        checked: false
    }));
}


/**
 * Collects task data from form elements and creates a task object
 * @param {string} columnId 
 * @returns {Object} 
 */
function collectTaskData(columnId) {
    return {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        dueDate: document.getElementById('taskDueDate').value,
        category: document.getElementById('taskCategory').textContent,
        assignee: getAssignedContacts(),
        priority: getSelectedPriority(),
        subtasks: getFormSubtasks(),
        column: columnId
    };
}


/**
 * Validates and saves task data to a specific column
 * @param {string} columnId 
 * @returns {Object|null} 
 */
function validateAndSaveTaskData(columnId) {
    const taskData = collectTaskData(columnId);
    if (!taskData.title || !taskData.dueDate || !taskData.category) {
        showValidationErrors();
        return null;
    }
    return taskData;
}


/**
 * Pushes task data to the Firebase database
 * @param {string} columnId 
 * @returns {Promise<Response>} 
 * @throws {Promise<string>} P
 */
async function pushTaskToDatabase(columnId) {
    const taskData = validateAndSaveTaskData(columnId);
    if (!taskData) return Promise.reject('No task data');

    return fetch(TASKS_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    });
}


/**
 * Configures event handlers for a board column
 * @param {HTMLElement} column 
 * @param {string} columnId 
 * @param {string} dragAreaId
 */
function setupColumnEventHandlers(column, columnId, dragAreaId) {
    column.ondrop = () => moveTo(columnId);
    column.ondragover = (e) => {
        allowDrop(e);
        highlight(dragAreaId);
    };
    column.ondragleave = () => removeHighlight(dragAreaId);
}


/**
 * Groups tasks by columns and sorts them by movedAt timestamp
 * @function groupAndSortTasks
 * @param {Array<Object>} tasks 
 * @returns {Object} 
 * @property {Array} todoColumn 
 * @property {Array} inProgressColumn
 * @property {Array} awaitFeedbackColumn 
 * @property {Array} doneColumn 
 */
function groupAndSortTasks(tasks) {
    const tasksByColumn = {
        todoColumn: [], inProgressColumn: [],
        awaitFeedbackColumn: [], doneColumn: []
    };
   
    tasks.forEach(task => {
        if (tasksByColumn[task.column]) { tasksByColumn[task.column].push(task); }
    });
   
    Object.keys(tasksByColumn).forEach(col => {
        tasksByColumn[col].sort((a, b) => (a.movedAt || 0) - (b.movedAt || 0));
    });
    return tasksByColumn;
}


/**
 * Generates column data with HTML and drag area information
 * @function generateColumnData
 * @param {Object} tasksByColumn 
 * @returns {Array<Object>} 
 * @property {string} col 
 * @property {string} dragAreaId 
 * @property {string} tasksHTML 
 */
function generateColumnData(tasksByColumn) {
    const columns = ['todoColumn', 'inProgressColumn', 'awaitFeedbackColumn', 'doneColumn'];
    const dragAreas = ['toDoDragArea', 'inProgressDragArea', 'awaitingFeedbackDragArea', 'doneDragArea'];

    return columns.map((col, i) => {
        const tasksHTML = tasksByColumn[col].map(taskCardTemplate).join('');
        return { col, dragAreaId: dragAreas[i], tasksHTML };
    });
}


/**
 * Renders column data to the DOM and sets up event handlers
 * @function renderColumns
 * @param {Array<Object>} columnData 
 * @returns {void}
 */
function renderColumns(columnData) {
    columnData.forEach(({ col, dragAreaId, tasksHTML }) => {
        const column = document.getElementById(col);
        column.innerHTML = tasksHTML + dragAreaTemplate(dragAreaId);
        setupColumnEventHandlers(column, col, dragAreaId);
    });
}


/**
 * Updates all board columns with provided tasks
 * @function updateColumns
 * @param {Array<Object>} tasks
 * @returns {Promise<void>}
 */
async function updateColumns(tasks) {
    const tasksByColumn = groupAndSortTasks(tasks);
    await loadAllContactColors();
    const columnData = generateColumnData(tasksByColumn);
    renderColumns(columnData);
}


/**
 * Fetches all board data from Firebase database
 * @function fetchBoardData
 * @returns {Promise<Array<Object>>} 
 */
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


/**
 * Updates the entire board with fresh data from the database
 * @function updateBoard
 * @returns {Promise<void>} 
 */
async function updateBoard() {
    try {
        const tasks = await fetchBoardData();
        await updateColumns(tasks);
        checkEmptyColumn();
    } catch (error) {
        console.error('Error updating board:', error);
    }
}


/**
 * Adds a new task to the specified column
 * @param {Event|null} event 
 * @param {string} columnId 
 * @returns {void}
 */
function addTask(event, columnId) {
    if (event) event.preventDefault();
    const taskData = validateAndSaveTaskData(columnId);

    if (!taskData) {
        return;
    }

    pushTaskToDatabase(columnId)
        .then(() => {
            updateBoard();
            showAddedTaskNotification();
            setTimeout(() => {
                closeOverlay();
            }, 900);
        });
}


/* Tasks-Design in Board functions */

/**
 * Map to store contact colors for quick access
 * @type {Map<string, string>}
 */
let contactColorMap = new Map();


/**
 * Loads all contact colors from Firebase and stores them in a Map for quick access
 * @function loadAllContactColors
 * @returns {Promise<Object>}
 */
async function loadAllContactColors() {
    const response = await fetch(`https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/users/${USERKEY}/contacts.json`);
    const result = await response.json();
    contactColorMap.clear();
    Object.values(result || {}).forEach(contact => {
        if (contact.name && contact.color) {
            contactColorMap.set(contact.name, contact.color);
        }
    });

    return result;
}


/**
 * Gets the color associated with a contact name
 * @function getContactColor
 * @param {string} name 
 * @returns {string} 
 */
function getContactColor(name) {
    if (!name) return 'transparent';
    return contactColorMap.get(name) || 'transparent';
}


/**
 * Finds and returns a contact object by name
 * @function getContactByName
 * @param {string} name 
 * @returns {Promise<Object|null>} 
 */
async function getContactByName(name) {
    const contactsCache = await loadAllContactColors();
    return Object.values(contactsCache || {}).find(contact => contact.name === name) || null;
}


/**
 * Renders member icons for a task, showing up to 3 members with overflow count
 * @function renderMembers
 * @param {Object} task 
 * @param {Array<string>} task.assignee 
 * @returns {string}
 */
function renderMembers(task) {
    const filteredAssignees = Array.isArray(task.assignee) ? task.assignee.filter(name => name && name.trim()) : '';
    if (filteredAssignees.length === 0) return '';

    const displayAssignees = filteredAssignees.slice(0, 3);
    const result = displayAssignees.map(name => contactIconSpanTemplate(name)).join('');
    return filteredAssignees.length > 3 ? result + extraCountSpanTemplate(filteredAssignees.length - 3) : result;
}


/**
 * Renders member icons with names for detailed view
 * @function renderMembersWithName
 * @param {Object} task
 * @param {Array<string>} task.assignee 
 * @returns {string} 
 */
function renderMembersWithName(task) {
    if (!Array.isArray(task.assignee)) return '';
    const filteredAssignees = task.assignee.filter(name => name && name.trim());
    const results = filteredAssignees.map(name => memberWithNameTemplate(name));
    return results.join('');
}