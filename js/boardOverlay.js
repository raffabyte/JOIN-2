/**
 * Board Overlay Management
 * Handles overlay functionality for the board
 */

const OVERLAY = document.getElementById('overlay');
const OVERLAY_CONTENT = document.getElementById('overlayContent');


/**
 * Closes the task overlay by removing active classes and clearing content
 * @returns {void}
 */
function closeOverlay() {
    if (!OVERLAY || !OVERLAY_CONTENT) {
        const page = document.getElementById('addTaskSeite');
        if (page) {
            page.querySelectorAll('input,textarea,select').forEach(el=>{ if(el.type==='checkbox'||el.type==='radio') el.checked=false; else el.value=''; });
            page.querySelectorAll('.selected-assignee .contact-icon').forEach(n=>n.remove());
            page.querySelectorAll('#subtasksList,#editedSubtasksList').forEach(l=>l.innerHTML='');
            page.querySelectorAll('.priority-button.active, .edit-priority-button.active').forEach(b=>b.classList.remove('active'));
            page.querySelector('.priority-button.MidPriority, .edit-priority-button.MidPriority').classList.add('active');
        }
        return;
    }
    OVERLAY_CONTENT.classList.remove('active');
    setTimeout(()=>{ OVERLAY.classList.add('display-none'); OVERLAY_CONTENT.classList.remove('add-task','edit-task-overlay','task-overlay'); OVERLAY_CONTENT.innerHTML=''; },110);
}


/**
 * Handles overlay click events and closes overlay when clicking outside
 * @param {Event} event 
 * @returns {void}
 */
function handleOverlayClicks(event) {
    event.target === OVERLAY ? closeOverlay() : handleOutsideClick(event);
}


/**
 * Shows a notification message when a task is added to the board
 * @returns {void}
 */
function showAddedTaskNotification() {
    const addedToBoardMessage = document.getElementById('addedToBoardMessage');
    addedToBoardMessage.classList.remove('display-none');
}

/**
 * Handles post-add-task actions depending on current UI context.
 * If the overlay is open, it will close it after the delay.
 * If running on a dedicated add-task page, it will hide the notification and open the board view.
 * @param {number} delayMs - delay in milliseconds
 */
function handlePostAddTaskBehavior(delayMs = 900) {
    const overlayVisible = OVERLAY && !OVERLAY.classList.contains('display-none');
    setTimeout(() => {
        if (overlayVisible) return closeOverlay();
        const msg = document.getElementById('addedToBoardMessage');
        msg?.classList.add('display-none');
        openBoardPage();
    }, delayMs);
}

/**
 * Central navigation helper: relative redirect to Board.html, then updateBoard()
 */
function openBoardPage() {
    try {
        if (location.pathname.endsWith('addTask.html') || location.pathname.includes('addTask')) {
            location.href = location.pathname.replace(/addTask.*$/, 'board.html');
            return;
        }
    } catch (e) { /* ignore */ }
    if (typeof updateBoard === 'function') return updateBoard();
}

/**
 * Adds a new task to the specified column
 * @param {Event|null} event - The event object (if triggered by form submission)
 * @param {string} columnId - The ID of the target column
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
            // Delegate post-add behavior to helper (overlay vs standalone page)
            handlePostAddTaskBehavior(900);
        });
}
