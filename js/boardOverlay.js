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
    OVERLAY_CONTENT.classList.remove('active');

    setTimeout(() => {
        OVERLAY.classList.add('display-none');
        OVERLAY_CONTENT.classList.remove('add-task');
        OVERLAY_CONTENT.innerHTML = '';
        OVERLAY_CONTENT.classList.remove('add-task', 'edit-task-overlay', 'task-overlay');
    }, 110);
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