/**
 * Returns the priority label based on a given priority class.
 * @param {string} priority 
 * @returns {string} 
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
 * @param {string} taskId
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
 * @param {Object} task
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
 * @param {string} dateString 
 * @returns {string}
 */
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

/**
 * Updates the subtasks of a given task in Firebase.
 * @param {string} firebaseKey 
 * @param {Array} updatedSubtasks 
 * @returns {Promise<void>}
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
 * @param {string} taskId 
 * @param {string} subtaskValue
 * @returns {Promise<void>}
 */
async function toggleSubtask(taskId, subtaskValue) {
    try {
        const data = await (await fetch(getUserTasksUrl())).json();
        const taskEntry = Object.entries(data || {}).find(([key]) => key === taskId);

        if (!taskEntry) return;
        const [firebaseKey, task] = taskEntry;
        const updatedSubtasks = task.subtasks.map(subtask =>
            subtask.value === subtaskValue ? { ...subtask, checked: !subtask.checked } : subtask
        );

    await updateSubtaskInFirebase(firebaseKey, updatedSubtasks);
        showTaskOverlay({ ...task, subtasks: updatedSubtasks, id: firebaseKey });
        updateBoard();
    } catch (error) {
        console.error('Error toggling subtask:', error);
    }
}

/**
 * Deletes a task from Firebase and updates the board.
 * @param {string} taskId 
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
 * @param {Object} task 
 */
function showEditTaskOverlay(task) {
    const TASK_EDIT_FORM = document.getElementById('taskEditForm');
    const TASK_INFOS = document.getElementById('taskOverlayContent');
    window.currentEditingTask = task;
    TASK_EDIT_FORM.classList.remove('display-none');
    TASK_INFOS.classList.add('display-none');
    loadAndRenderContacts();
}

/**
 * Fetches the task data and opens the edit overlay.
 * @param {string} taskId 
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
 * @returns {Object} 
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
 * @param {string} taskId 
 * @param {Object} updatedTaskData
 * @returns {Promise<Object>} 
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

/**
 * Submits the edited task to Firebase and updates the board.
 */
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