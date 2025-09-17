
/**
 * Builds the task details overlay content including actions and edit form.
 *
 * @param {Object} task - Task object including id, title, description, dueDate, priority, assignee, subtasks.
 * @returns {string} HTML string for the overlay.
 */
function taskOverlayTemplate(task){
    return `
        <div class="flexC gap-24 task-overlay-content width-100" id="taskOverlayContent" data-task-id="${task.id}">
            <div class="space-between flexR">
                <span class="task-category" id="${convertToCamelCase(task.category)}">${task.category}</span>
                <button class="overlay-button" onclick="closeOverlay()">
                    ${CLOSE_CANCEL_SVG}
                </button>
            </div>
            <div class="task-overlay-header gap-24 flexC">
                <h2>${task.title}</h2>
                <p class="${getVisibilityClass(task.description)}" id="taskOverlayDescription">${task.description || ''}</p>
                <div class="gap-25 flexR">
                    <p class="task-overlay-headdings">Due Date:</p>
                    ${formatDate(task.dueDate)}
                </div>
                <div class="flexR gap-25 ${getVisibilityClass(task.priority)}">
                    <p class="task-overlay-headdings">Priority:</p>
                    <div class="flexR overlay-priority">
                        ${handlePriority(task.priority)} 
                        ${getPrioritySvg(task.priority)}
                    </div>
                </div>
                <div class="assignee-container gap-8 flexC ${getVisibilityClass(task.assignee)}">
                    <p class="task-overlay-headdings">Assignees:</p>
                    <div class="flexC width-100">
                    ${renderMembersWithName(task)}
                    </div>
                </div>
                <div class="gap-8 flexC subtasks-overlay ${getVisibilityClass(task.subtasks)}">   
                    <p class="task-overlay-headdings">Subtasks:</p>
                    <div class="subtasks-overlay-list flexC width-100">
                        ${task.subtasks && task.subtasks.length > 0 ? task.subtasks.map(subtask => `
                            <div class="subtask-item-overlay gap-16 flexR">
                                <button class="checkbox" onclick="toggleSubtask('${task.id}', '${subtask.value}')">
                                    ${subtask.checked ? CHECKBOX_FILLED_DARK_SVG : CHECKBOX_SVG}
                                </button>
                                <span>${subtask.value}</span>
                            </div>
                        `).join('') : '<p>No subtasks available</p>'}
                    </div>
                </div>
            </div>
            <div class="task-overlay-footer gap-8 flexR">
                <button class="task-footer-btn gap-8 flexR" onclick="deleteTask('${task.id}')">${DELETE_SVG} Delete</button>
                ${SEPARATOR_SVG}
                <button class="task-footer-btn gap-8 flexR" onclick="editTask('${task.id}')">${EDIT_SVG} Edit</button>
            </div>
        </div>
        ${editTaskOverlayTemplate(task)}
        `;
}


/**
 * Template for the edit task form fields within the overlay.
 *
 * @param {Object} task - Task object to prefill the edit form.
 * @returns {string} HTML for the edit form fields.
 */
function taskEditTemplate(task) {
    return `
        <div class="flexC width-100 gap-24">
            <div class="gap-8 width-100 flexC">
                <label class="width-100" for="editedTaskTitle">Title</label>
                <input class="inputs change-onfoucus requierd-input" oninput="hideValidationErrors()" type="text" id="editedTaskTitle" value="${task.title}" placeholder="Enter a title" >
                <span class="required-span width-100 display-none">This field is required</span>
            </div>
            <div class="gap-8 width-100 flexC">
                <label class="width-100" for="editedTaskDescription">Description</label>
                <textarea class="inputs change-onfoucus" id="editedTaskDescription" name="taskDescription" placeholder="Enter Task description">${task.description || ''}</textarea>
            </div>
            <div class="gap-8 width-100 flexC">
                <label class="width-100" for="editedTaskDueDate">Due date<span class="highlight">*</span></label>
                <input class="inputs change-onfoucus requierd-input" value="${task.dueDate ? task.dueDate.split('T')[0] : ''}" type="date" id="editedTaskDueDate" name="taskDueDate" min="" onfocus="this.min=new Date().toISOString().split('T')[0]">
                <span class="required-span width-100 display-none">This field is required</span>
            </div>
            <div class="gap-8 width-100 flexC">
                <span class="width-100 prio-style">Priority</span>
                <div class="flexR priority-select width-100 gap-16">
        <button type="button" class="edit-priority-button gap-8 width-100 flexR HighPriority ${task.priority === 'HighPriority' ? 'active' : ''}" 
          onclick="priorityHandler('high'); event.stopPropagation();">
                        <span class="priority-text">Urgent</span>
                        ${HIGH_PRIORITY_SVG}
                    </button>
        <button type="button" class="edit-priority-button gap-8 width-100 flexR MidPriority ${task.priority === 'MidPriority' ? 'active' : ''}" 
          onclick="priorityHandler('medium'); event.stopPropagation();">
                        <span class="priority-text">Medium</span>
                        ${MID_PRIORITY_SVG}
                    </button>
        <button type="button" class="edit-priority-button gap-8 width-100 flexR LowPriority ${task.priority === 'LowPriority' ? 'active' : ''}" 
          onclick="priorityHandler('low'); event.stopPropagation();">
                        <span class="priority-text">Low</span>
                        ${LOW_PRIORITY_SVG}
                    </button>
                </div>
            </div>
            <div class="flexC gap-8 width-100">
                <label class="width-100" for="editedTaskAssignee">Assigned To</label>
                <div class="input-svg-wrapper width-100 flexC">
                    <input  class="inputs change-onfoucus" oninput="toggleAssigneeOptions()" type="text" id="editedTaskAssignee" placeholder="Select Contacts to assign"
                            onclick="toggleAssigneeOptions(); event.stopPropagation(); ">
                    <div id="assigneeOptions" class="assignee-options width-100 display-none">
                        <!-- Dynamically generated assignee options will be inserted here -->
                    </div>
                </div>
                <div class="selected-assignee width-100 gap-8 flexR ${task.assignee && task.assignee.length > 0 ? '' : 'display-none'}" id="editedAssignee">
                    ${task.assignee && task.assignee.length > 0 ? task.assignee.map(name => contactIconSpanTemplate(name)).join('') : ''}
                </div>
            </div>
            <div class="gap-8 width-100 flexC">
                <label class="width-100" for="editedSubtasks">Subtasks</label>
                <div class="inputs change-onfoucus space-between flexR" id="inputBox">
                    <input type="text" id="editedSubtasks" placeholder="add new subtask" oninput="checkSubtask(this.value.length, this.value, document.getElementById('editedSubtasksList'))" onfocus="showAddCancelBtns()" onkeydown="onEnterAddSubTask(event, 'editedSubtasks')">
                    <button class="plus-button overlay-button" id="subtaskPlusBtn" type="button" onclick="showAddCancelBtns()">
                            ${PLUS_SVG}
                    </button>
                    <div class="add-cancel-btns flexR display-none gap-8" id="addCancelBtns">
                        <button class="cancel-subtask-button overlay-button" type="button" onclick="cancelSubtask()">
                            ${CLOSE_CANCEL_SVG}
                        </button>
                        ${SEPARATOR_SVG}
                        <button class="add-subtask-button overlay-button" type="button" onclick="addSubtask('editedSubtasks')">
                            ${SUBMIT_SVG}
                        </button>
                    </div>
                </div>
                <span id="subtaskHintMessage" class="width-100 display-none">Please type a clear subtask</span>
                <ul class="flexC width-100 ${task.subtasks && task.subtasks.length > 0 ? '' : 'display-none'}" id="editedSubtasksList">
                    ${task.subtasks && Array.isArray(task.subtasks) ? task.subtasks.map((subtask, index) => addSubTaskTemplate(subtask.value, index)).join('') : ''}
                </ul>
            </div>
        </div>`;
}


/**
 * Wraps the edit task form with header/footer inside the overlay container.
 *
 * @param {Object} task - Task object to edit.
 * @returns {string} HTML for the edit overlay container.
 */
function editTaskOverlayTemplate(task) {
    return `
    <div class="display-none flexC gap-24 width-100" id="taskEditForm">
        <div class="flexR width-100 flex-end">
            <button class="overlay-button" onclick="closeOverlay()">
                    ${CLOSE_CANCEL_SVG}
            </button>
        </div>
        <div class="flexC edit-task-div width-100 gap-24">
            ${taskEditTemplate(task)}
        </div>
        <div class="flexR width-100 flex-end">
            <button class="submit-edit btn-shadow" onclick="submitEdit()">
                Ok
                ${SUBMIT_LIGHT_SVG}
            </button>
        </div>
    </div>`;
}
