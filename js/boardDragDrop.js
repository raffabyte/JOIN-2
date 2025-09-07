/**
 * Board Drag and Drop Functionality
 * Handles all drag and drop operations for the board
 */

let currentDraggedElement;


/**
 * Sets up event handlers for drag and drop on columns
 * @param {HTMLElement} column 
 * @param {string} columnId 
 * @param {string} dragAreaId
 * @returns {void}
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
 * Checks if columns are empty and displays appropriate messages
 * @function checkEmptyColumn
 * @returns {void}
 */
function checkEmptyColumn() {
    const boardColumns = document.querySelectorAll('#todoColumn, #inProgressColumn, #awaitFeedbackColumn, #doneColumn');
    boardColumns.forEach(column => {
        const existingNoTask = column.querySelector('.no-task-item');
        const dragArea = column.querySelector('.drag-area');
        
        if (!column.querySelector('.task-card') && dragArea && dragArea.classList.contains('display-none')) {
            !existingNoTask ? column.innerHTML += noTaskCardTemplate(column.getAttribute('column-name')) : null;
        } else {
            existingNoTask ? existingNoTask.remove() : null;
        }
    });
}


/**
 * Allows drop operation by preventing default behavior
 * @param {DragEvent} ev
 * @returns {void}
 */
function allowDrop(ev) {
    ev.preventDefault();
}


/**
 * Initiates drag operation for a task card
 * @param {DragEvent} event 
 * @param {string} id 
 * @returns {void}
 */
function startDragging(event, id) {
    const taskCard = document.getElementById(id);

    event.dataTransfer.setDragImage(new Image(), 0, 0);
    currentDraggedElement = id;
    taskCard.classList.add('dragging');
}


/**
 * Stops drag operation and removes dragging visual state
 * @returns {void}
 */
function stopDragging() {
    const element = document.getElementById(currentDraggedElement);
    element.classList.remove('dragging');
}


/**
 * Moves the currently dragged task to a new column
 * @param {string} column
 * @returns {void}
 */
function moveTo(column) {
    const element = document.getElementById(currentDraggedElement);
    if (!element) return;

    element.classList.remove('dragging');
    ['toDoDragArea', 'inProgressDragArea', 'awaitingFeedbackDragArea', 'doneDragArea'].forEach(removeHighlight);

    const tasksUrl = "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks";
    fetch(`${tasksUrl}/${currentDraggedElement}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ column, movedAt: Date.now() })
    }).then(() => { 
        updateBoard(); 
        currentDraggedElement = null; 
    });
}


/**
 * Sets the height of a drag area to match the dragged task
 * @param {HTMLElement} element 
 * @returns {void}
 */
function setDragAreaHeight(element) {
    const draggedTask = document.getElementById(currentDraggedElement);

    if (draggedTask) {
        const taskHeight = draggedTask.offsetHeight;
        element.style.height = taskHeight + 'px';
    }
}


/**
 * Highlights a drag area when a task is dragged over it
 * @param {string} id 
 * @returns {void}
 */
function highlight(id) {
    const dragArea = document.getElementById(id);
    const column = dragArea.parentElement;

    dragArea.classList.remove('display-none');
    setDragAreaHeight(dragArea);
    
    if (!column.querySelector('.task-card')) {
        checkEmptyColumn();
    }
}


/**
 * Removes highlight from a drag area
 * @param {string} id 
 * @returns {void}
 */
function removeHighlight(id) {
    const dragArea = document.getElementById(id);
    if (!dragArea || !dragArea.parentElement) return;

    const column = dragArea.parentElement;
    dragArea.classList.add('display-none');

    if (!column.querySelector('.task-card')) {
        checkEmptyColumn();
    }
}