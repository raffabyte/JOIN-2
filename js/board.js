
if (!USERKEY) {
    // Kein Benutzer eingeloggt → weiterleiten
    window.location.href = "../../index.html";
}

/* Saving added tasks to Board */

/**
 * Gets the selected priority from the form
 * @returns {string} The selected priority or empty string
 */
function getSelectedPriority() {
    const priorityBtn = document.querySelector('.priority-button.active');
    return priorityBtn ? priorityBtn.classList[priorityBtn.classList.length - 2] : '';
}


/**
 * Gets the assigned contacts from the form
 * @returns {Array<string>} Array of assigned contact names
 */
function getAssignedContacts() {
    return Array.from(document.querySelectorAll('#selectedAssignee .contact-icon'))
        .map(span => span.dataset.name);
}


/**
 * Gets the subtasks from the form
 * @returns {Array<Object>} Array of subtask objects
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
 * @param {string} columnId - 
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
 * @throws {Promise<string>}
 */
async function pushTaskToDatabase(columnId) {
    const taskData = validateAndSaveTaskData(columnId);
    if (!taskData) return Promise.reject('No task data');

    // store per-user so each user has their own copy
    return fetch(getUserTasksUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
    });
}


/**
 * Konfiguriert Event-Handler für eine Board-Spalte
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
 * @param {Array<Object>} tasks - Array of task objects
 * @returns {Object} Object with tasks grouped by column and sorted
 * @property {Array} todoColumn - Tasks in todo column
 * @property {Array} inProgressColumn - Tasks in progress column
 * @property {Array} awaitFeedbackColumn - Tasks awaiting feedback
 * @property {Array} doneColumn - Completed tasks
 */
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

/**
 * Generates column data with HTML and drag area information
 * @function generateColumnData
 * @param {Object} tasksByColumn - Tasks grouped by column
 * @returns {Array<Object>} Array of column data objects
 * @property {string} col - Column ID
 * @property {string} dragAreaId - Drag area ID for the column
 * @property {string} tasksHTML - HTML string of all tasks in the column
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
 * @param {Array<Object>} columnData - Array of column data objects
 * @returns {void}
 */
function renderColumns(columnData) {
    columnData.forEach(({ col, dragAreaId, tasksHTML }) => {
        const column = document.getElementById(col);
        if (!column) {
            // Page may be a standalone add-task page without board columns; skip safely
            console.debug && console.debug(`renderColumns: missing element ${col}, skipping`);
            return;
        }
        column.innerHTML = tasksHTML + dragAreaTemplate(dragAreaId);
        setupColumnEventHandlers(column, col, dragAreaId);
    });
}

/**
 * Updates all board columns with provided tasks
 * @function updateColumns
 * @param {Array<Object>} tasks - Array of task objects
 * @returns {Promise<void>} Promise that resolves when columns are updated
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
 * @returns {Promise<Array<Object>>} Promise that resolves to array of task objects with IDs
 */
async function fetchBoardData() {
    // Ensure starter tasks exist for new users
    await seedUserTasksIfEmpty();

    const [tasksResponse] = await Promise.all([
        fetch(getUserTasksUrl()),
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
 * @returns {Promise<void>} Promise that resolves when board is updated
 */
async function updateBoard() {
    try {
        const tasks = await fetchBoardData();
        await updateColumns(tasks);
    if (typeof checkEmptyColumn === 'function') checkEmptyColumn();
    } catch (error) {
        console.error('Error updating board:', error);
    }
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
 * @returns {Promise<Object>} Promise that resolves to the contacts object from Firebase
 */
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

/**
 * Gets the color associated with a contact name
 * @function getContactColor
 * @param {string} name - The contact name
 * @returns {string} The color value or 'transparent' if not found
 */
function getContactColor(name) {
    if (!name) return 'transparent';
    return contactColorMap.get(name) || 'transparent';
}

/**
 * Finds and returns a contact object by name
 * @function getContactByName
 * @param {string} name - The contact name to search for
 * @returns {Promise<Object|null>} Promise that resolves to the contact object or null if not found
 */
async function getContactByName(name) {
    const contactsCache = await loadAllContactColors();
    return Object.values(contactsCache || {}).find(contact => contact.name === name) || null;
}


/**
 * Renders member icons for a task, showing up to 3 members with overflow count
 * @function renderMembers
 * @param {Object} task - The task object containing assignee information
 * @param {Array<string>} task.assignee - Array of assigned contact names
 * @returns {string} HTML string of member icons
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
 * @param {Object} task - The task object containing assignee information
 * @param {Array<string>} task.assignee - Array of assigned contact names
 * @returns {string} HTML string of members with names
 */
function renderMembersWithName(task) {
    if (!Array.isArray(task.assignee)) return '';
    const filteredAssignees = task.assignee.filter(name => name && name.trim());
    const results = filteredAssignees.map(name => memberWithNameTemplate(name));
    return results.join('');
}