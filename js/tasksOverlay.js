function handlePriority(priority) {
    switch (priority) {
        case 'HighPriority':
            return 'High';
            break;
        case 'MidPriority':
            return 'Medium';
            break;
        case 'LowPriority':
            return 'Low';
            break;
        default:
            return '';
    }
}



function taskOverlay(taskId) {
    fetch(TASKS_BASE_URL)
        .then(response => response.json())
        .then(data => {
            const taskEntry = Object.entries(data || {}).find(([key, task]) => key === taskId);

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

function showTaskOverlay(task) {
    OVERLAY_CONTENT.innerHTML = taskOverlayTemplate(task);
    OVERLAY_CONTENT.classList.add('task-overlay');
    OVERLAY.classList.remove('display-none');

    setTimeout(() => {
        OVERLAY_CONTENT.classList.add('active');
    }, 10);
}

function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

async function updateSubtaskInFirebase(firebaseKey, updatedSubtasks) {
    await fetch(`https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks/${firebaseKey}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtasks: updatedSubtasks })
    });
}


async function toggleSubtask(taskId, subtaskValue) {
    try {
        const data = await (await fetch(TASKS_BASE_URL)).json();
        const taskEntry = Object.entries(data || {}).find(([key]) => key === taskId);

        if (!taskEntry) return;
        const [firebaseKey, task] = taskEntry;
        const updatedSubtasks = task.subtasks.map(subtask => subtask.value === subtaskValue ? { ...subtask, checked: !subtask.checked } : subtask
        );

        await updateSubtaskInFirebase(firebaseKey, updatedSubtasks);
        showTaskOverlay({ ...task, subtasks: updatedSubtasks, id: firebaseKey });
        updateBoard();
    } catch (error) { console.error('Error toggling subtask:', error); }
}

function deleteTask(taskId) {
    fetch(TASKS_BASE_URL)
        .then(response => response.json())
        .then(data => {
            const taskEntry = Object.entries(data || {}).find(([key]) => key === taskId);
            if (taskEntry) {
                const [firebaseKey] = taskEntry;
                return fetch(`https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks/${firebaseKey}.json`, {
                    method: 'DELETE'
                });
            } else {
                console.error('Task not found:', taskId);
            }
        })
        .then(() => updateBoard()).then(() => { closeOverlay(); })
        .catch(error => console.error('Error deleting task:', error));
}

function showEditTaskOverlay(task) {
    const TASK_EDIT_FORM = document.getElementById('taskEditForm');
    const TASK_INFOS = document.getElementById('taskOverlayContent');
    
    // Speichere die aktuelle Task für späteren Zugriff
    window.currentEditingTask = task;

    TASK_EDIT_FORM.classList.remove('display-none');
    TASK_INFOS.classList.add('display-none');


    initializeSubtaskEventHandlers();
   
}

function editTask(taskId) {
    fetch(TASKS_BASE_URL)
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

function editedTask() {
    const PRIORITY_BTN = document.querySelector('.edit-priority-button.active');
    return {
        title: document.getElementById('editedTaskTitle').value,
        description: document.getElementById('editedTaskDescription').value,
        dueDate: document.getElementById('editedTaskDueDate').value,
        assignee: Array.from(document.querySelectorAll('#editedAssignee .contact-icon')).map(span => span.dataset.name),
        priority: PRIORITY_BTN ? PRIORITY_BTN.classList[PRIORITY_BTN.classList.length - 2] : '',
        subtasks: Array.from(document.querySelectorAll('.subtask-text')).map((subtask, index) => ({
            value: subtask.textContent,
            checked: window.currentEditingTask?.subtasks?.[index]?.checked || false
        }))
    };
}


async function updateTaskInFirebase(taskId, updatedTaskData) {
    try {
        const taskUrl = `https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}.json`;
        const response = await fetch(taskUrl, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTaskData)
        });
        return response.json();
    } catch (error) {
        console.error('Error updating task:', error);
    }
}


function submitEdit() {
    const editedTaskData = editedTask();
    const taskId = document.querySelector('[data-task-id]')?.dataset.taskId;
    const updatedTask = { ...window.currentEditingTask, ...editedTaskData, id: taskId };

    updateTaskInFirebase(taskId, editedTaskData)
        .then(() => {
            updateBoard();
            showTaskOverlay(updatedTask);
        })
        .catch(error => {
            console.error('Failed to update task:', error);
        });
}