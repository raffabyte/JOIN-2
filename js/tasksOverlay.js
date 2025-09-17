/**
 * Returns the priority label based on a given priority class.
 * @param {string} priority - CSS class for priority (HighPriority/MidPriority/LowPriority).
 * @returns {string} Human-readable priority.
 */
function handlePriority(priority) {
    switch (priority) {
        case 'HighPriority': return 'High';
        case 'MidPriority': return 'Medium';
        case 'LowPriority': return 'Low';
        default: return '';
    }
}

/**
 * Fetches tasks from Firebase and displays a specific task in an overlay.
 * @param {string} taskId - Firebase key of the task.
 */
function taskOverlay(taskId) {
    fetch(getUserTasksUrl())
        .then(response => response.json())
        .then(data => {
            const taskEntry = Object.entries(data || {}).find(([key]) => key === taskId);

            if (taskEntry) {
                const [firebaseKey, task] = taskEntry;
                const taskWithId = { ...task, id: firebaseKey };
                showTaskOverlay(taskWithId);
            } else {
                console.error('Task not found:', taskId);
            }
        })
        .catch(error => console.error('Error fetching task:', error));
}

/**
 * Renders the overlay for a specific task.
 * @param {Object} task - Task object.
 */
function showTaskOverlay(task) {
    OVERLAY_CONTENT.innerHTML = taskOverlayTemplate(task);
    OVERLAY_CONTENT.classList.add('task-overlay');
    OVERLAY.classList.remove('display-none');

    setTimeout(() => {
        OVERLAY_CONTENT.classList.add('active');
    }, 10);
}

/**
 * Formats a date string from YYYY-MM-DD to DD/MM/YYYY.
 * @param {string} dateString - A date formatted like 2025-09-16.
 * @returns {string} Formatted date like 16/09/2025.
 */
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Updates the subtasks of a given task in Firebase.
 * @param {string} firebaseKey - Task key in Firebase.
 * @param {Array<{value:string,checked:boolean}>} updatedSubtasks - New subtasks array.
 * @returns {Promise<void>} Resolves when patched.
 */
async function updateSubtaskInFirebase(firebaseKey, updatedSubtasks) {
    await fetch(getUserTaskItemUrl(firebaseKey), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtasks: updatedSubtasks })
    });
}

/**
 * Toggles the completion state of a subtask and updates Firebase.
 * @param {string} taskId - Task key.
 * @param {string} subtaskValue - Subtask label.
 * @returns {Promise<void>} Resolves when done.
 */
async function toggleSubtask(taskId, subtaskValue) {
    try {
        const data = await fetchUserTasks();
        const entry = findTaskEntry(data, taskId); if (!entry) return;
        const [firebaseKey, task] = entry;
        const updated = computeToggledSubtasks(task, subtaskValue);
        await updateSubtaskInFirebase(firebaseKey, updated);
        toggleSubtaskDisplayOnly(subtaskValue); updateBoard();
    } catch (error) { console.error('Error toggling subtask:', error); }
}

/** Fetches all tasks JSON for the current user. */
async function fetchUserTasks(){
    const res = await fetch(getUserTasksUrl()); return res.json();
}

/** Finds the [key,task] pair for a given id in tasks JSON. */
function findTaskEntry(data, taskId){
    return Object.entries(data || {}).find(([key]) => key === taskId);
}

/** Returns a new subtasks array with target subtask toggled. */
function computeToggledSubtasks(task, subtaskValue){
    return task.subtasks.map(s => s.value === subtaskValue ? { ...s, checked: !s.checked } : s);
}

/**
 * Toggles only the visual display of a subtask without reloading the overlay.
 * @param {string} subtaskValue - Text value of the subtask.
 */
function toggleSubtaskDisplayOnly(subtaskValue) {
    const subtaskItems = document.querySelectorAll('.subtask-item-overlay');
    subtaskItems.forEach(item => {
        const spanElement = item.querySelector('span');
        if (spanElement && spanElement.textContent.trim() === subtaskValue) {
            const checkboxButton = item.querySelector('.checkbox');
            const currentSvg = checkboxButton.innerHTML;
            
            if (currentSvg.includes('stroke-linejoin')) {
                checkboxButton.innerHTML = `<svg class="checkbox" width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4.68213" y="4.39673" width="16" height="16" rx="3" stroke="#2A3647" stroke-width="2"/></svg>`;
            } else {
                checkboxButton.innerHTML = `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.6821 11.3967V17.3967C20.6821 19.0536 19.339 20.3967 17.6821 20.3967H7.68213C6.02527 20.3967 4.68213 19.0536 4.68213 17.3967V7.39673C4.68213 5.73987 6.02527 4.39673 7.68213 4.39673H15.6821" stroke="#2A3647" stroke-width="2" stroke-linecap="round"/><path d="M8.68213 12.3967L12.6821 16.3967L20.6821 4.89673" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
            }
        }
    });
}

/**
 * Deletes a task from Firebase and updates the board.
 * @param {string} taskId - Task key to delete.
 */
function deleteTask(taskId) {
    fetch(getUserTasksUrl())
        .then(response => response.json())
        .then(data => {
            const taskEntry = Object.entries(data || {}).find(([key]) => key === taskId);
            if (taskEntry) {
                const [firebaseKey] = taskEntry;
                return fetch(getUserTaskItemUrl(firebaseKey), {
                    method: 'DELETE'
                });
            } else {
                console.error('Task not found:', taskId);
            }
        })
        .then(() => updateBoard())
        .then(() => closeOverlay())
        .catch(error => console.error('Error deleting task:', error));
}

/**
 * Displays the edit task overlay and loads contact data.
 * @param {Object} task - Task to edit.
 */
function showEditTaskOverlay(task) {
    const TASK_EDIT_FORM = document.getElementById('taskEditForm');
    const TASK_INFOS = document.getElementById('taskOverlayContent');
    window.currentEditingTask = task;
    TASK_EDIT_FORM.classList.remove('display-none');
    TASK_INFOS.classList.add('display-none');
    loadAndRenderContacts().then(()=>{
        // vorhandene Assignees des Tasks in den Container rendern
        const container = document.getElementById('editedAssignee');
        if (container && Array.isArray(task.assignee)) {
            container.innerHTML = '';
            task.assignee.forEach(name=>{ container.innerHTML += contactIconSpanTemplate(name); });
            if (typeof updateAssigneeDisplay === 'function') updateAssigneeDisplay(container);
        }
    });
}

/**
 * Fetches the task data and opens the edit overlay.
 * @param {string} taskId - Task key to edit.
 */
function editTask(taskId) {
    fetch(getUserTasksUrl())
        .then(response => response.json())
        .then(data => {
            const taskEntry = Object.entries(data || {}).find(([key]) => key === taskId);
            if (taskEntry) {
                const [firebaseKey, task] = taskEntry;
                const taskWithId = { ...task, id: firebaseKey };
                showEditTaskOverlay(taskWithId);
            } else {
                console.error('Task not found:', taskId);
            }
        })
        .catch(error => console.error('Error fetching task:', error));
}

/**
 * Collects and returns the edited task data from the form.
 * @returns {{title:string,description:string,dueDate:string,assignee:string[],priority:string,subtasks:Array<{value:string,checked:boolean}>}}
 */
function editedTask() {
    const PRIORITY_BTN = document.querySelector('.edit-priority-button.active');
    return {
        title: document.getElementById('editedTaskTitle').value,
        description: document.getElementById('editedTaskDescription').value,
        dueDate: document.getElementById('editedTaskDueDate').value,
        assignee: Array.from(document.querySelectorAll('#editedAssignee .contact-icon')).map(span => span.dataset.name),
        priority: PRIORITY_BTN ? PRIORITY_BTN.classList[PRIORITY_BTN.classList.length - 2] : '',
        subtasks: Array.from(document.querySelectorAll('#editedSubtasksList .subtask-text')).map((subtask, index) => ({
            value: subtask.textContent.trim(),
            checked: window.currentEditingTask?.subtasks?.[index]?.checked || false
        }))
    };
}

/**
 * Updates an existing task in Firebase.
 * @param {string} taskId - Firebase key.
 * @param {Object} updatedTaskData - Partial task data.
 * @returns {Promise<Object>} The patched Firebase object.
 */
async function updateTaskInFirebase(taskId, updatedTaskData) {
    try {
    const taskUrl = getUserTaskItemUrl(taskId);
    const response = await fetch(taskUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTaskData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating task:', error);
        throw error;
    }
}

/** Submits the edited task to Firebase and updates the board. */
function submitEdit() {
    const editedTaskData = editedTask();
    const taskId = window.currentEditingTask.id;

    if (!editedTaskData.title || !editedTaskData.dueDate) {
        showValidationErrors();
        return null;
    } else {
        updateTaskInFirebase(taskId, editedTaskData)
            .then(() => {
                updateBoard();
                taskOverlay(taskId);
            })
            .catch(error => {
                console.error('Failed to update task:', error);
            });
    }
}