
function addTaskOverlayForm(columnId) {
    return `
            <div class="overlay-header flexR width-100 space-between">
            <h2>Add Task</h2>
            <button class="overlay-button" onclick="closeOverlay()">
            ${CLOSE_CANCEL_SVG}

            </button>
            </div>
            <form id="addTaskForm" class="overlay-bottom width-100 flexC" onsubmit="addTask(event, '${columnId}')">
                <div class="flexR task-form-top width-100 space-between">
                    <div class="flexC task-form-column">
                        <div class="gap-8 width-100 flexC">
                            <label class="width-100" for="taskTitle">Title<span class="highlight">*</span></label>
                            <input class="inputs requierd-input change-onfoucus" oninput="hideValidationErrors()" type="text" id="taskTitle" name="taskTitle" placeholder="Enter a title" >
                            <span class="required-span width-100 display-none">This field is required</span>
                        </div>

                        <div class="gap-8 width-100 flexC">
                            <label class="width-100" for="taskDescription">Description</label>
                            <textarea class="inputs change-onfoucus" id="taskDescription" name="taskDescription" placeholder="Enter a description"></textarea>
                        </div>

                        <div class="gap-8 width-100 flexC">
                            <label class="width-100" for="taskDueDate">Due date<span class="highlight">*</span></label>
                            <input class="inputs requierd-input change-onfoucus" oninput="hideValidationErrors()" type="date" id="taskDueDate" name="taskDueDate" min="" onfocus="this.min=new Date().toISOString().split('T')[0]">
                            <span class="required-span width-100 display-none">This field is required</span>
                        </div>
                    </div>
                    <span class="middle-vector"></span>
                    <div class="flexC task-form-column">
                        <div class="gap-8 width-100 flexC">
                            <span class="width-100 prio-style">Priority</span>
                            <div class="flexR priority-select gap-16 width-100">
                                <button type="button" class="priority-button gap-8 width-100 flexR HighPriority" onclick="PriorityHandler('high'); event.stopPropagation();">
                                    <span class="priority-text">Urgent</span>
                                    ${HIGH_PRIORITY_SVG}
                                </button>
                                <button type="button" class="priority-button gap-8 width-100 flexR MidPriority" onclick="PriorityHandler('medium'); event.stopPropagation();">
                                    <span class="priority-text">Medium</span>
                                    ${MID_PRIORITY_SVG}
                                </button>
                                <button type="button" class="priority-button gap-8 width-100 flexR LowPriority" onclick="PriorityHandler('low'); event.stopPropagation();">
                                    <span class="priority-text">Low</span>
                                    ${LOW_PRIORITY_SVG}
                                </button>
                            </div>
                        </div>

                        <div class="flexC gap-8 width-100">
                            <label class="width-100" for="taskAssignee">Assigned To</label>
                            <div class="input-svg-wrapper width-100 flexC">
                                <input  class="inputs change-onfoucus" type="text" id="taskAssignee" placeholder="Select Contacts to assign" oninput="searchAssignee(this.value)"
                                        onclick="toggleAssigneeOptions(); event.stopPropagation(); ">
                                <div id="assigneeOptions" oninput="toggleAssigneeOptions()" class="assignee-options width-100 display-none">
                                    <!-- Contacts will be loaded dynamically -->
                                </div>
                            </div>
                            <div class="selected-assignee width-100 gap-8 flexR display-none" id="selectedAssignee">
                                
                            </div>
                        </div>
                        <div class="gap-8 width-100 flexC">
                            <label class="width-100" for="taskCategory">Category<span class="highlight">*</span></label>
                            <div class="width-100">
                                <button class="change-onfoucus category-options-btn inputs requierd-input" type="button" id="taskCategory" onclick="toggleCategoryOptions(); event.stopPropagation(); hideValidationErrors()">Select task category</button>
                                <div class="category-options-list width-100 display-none flexC" id="categoryOptions">
                                    <span onclick="selectCategory('User Story');" class="category-option width-100" value="userStory">User Story</span>
                                    <span onclick="selectCategory('Technical Task');" class="category-option width-100" value="technicalTask">Technical Task</span>
                                </div>
                            </div>
                            <span class="required-span width-100 display-none">This field is required</span>
                        </div>
                        <div class="gap-8 width-100 flexC">
                            <label class="width-100" for="subtasks">Subtasks</label>
                            <div class="inputs change-onfoucus space-between flexR" id="inputBox">
                                <input type="text" id="subtasks" placeholder="add new subtask" oninput="checkSubtask(this.value.length)" onfocus="showAddCancelBtns()" onkeydown="onEnterAddSubTask(event, 'subtasks')">
                                <button class="plus-button overlay-button" id="subtaskPlusBtn" type="button" onclick="showAddCancelBtns()">
                                        ${PLUS_SVG}
                                </button>
                                <div class="add-cancel-btns flexR display-none gap-8" id="addCancelBtns">
                                    <button class="cancel-subtask-button overlay-button" type="button" onclick="cancelSubtask()">
                                        ${CLOSE_CANCEL_SVG}
                                    </button>
                                    ${SEPARATOR_SVG}
                                    <button class="add-subtask-button overlay-button" type="button" onclick="addSubtask('subtasks')">
                                        ${SUBMIT_SVG}
                                    </button>
                                </div>
                            </div>
                            <span id="subtaskHintMessage" class="width-100 display-none">Please type a clear subtask</span>
                            <ul id="subtasksList" class="flexC width-100 display-none">
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="flexR width-100 space-between">
                    <span>
                        <span class="highlight">*</span>
                        This field is required</span>
                    <div class="flexR gap-16">
                        <button class="btn-shadow" type="button" id="closeOverlayButton" onclick="closeOverlay()">
                            Cancel ${CLOSE_CANCEL_SVG}
                        </button>
                        <button class="btn-shadow" type="submit" id="addTaskButton">
                            Creat Task ${SUBMIT_SVG}
                        </button>
                    </div>
                </div>
            </form>
            <div class="flexR added-to-board-message display-none" id="addedToBoardMessage">
                <span class="message-text">Task added to board</span> ${BOARD_SVG}
            </div>
    `;
}


function addSubTaskTemplate(subtaskInput, index = 0){
    const uniqueId = `subtaskInfos_${index}_${Date.now()}`;
    const editUniqueId = `editSubtask_${index}_${Date.now()}`;
    const editInputId = `editSubtaskInput_${index}_${Date.now()}`;
    
    return`
    <li ondblclick="editSubtask(this)" class="subtask-item flexC">
        <div class="subtask flexR" id="${uniqueId}">
            <div class="subtask-headdinfg flexR gap-8" >
                •
                <span class="subtask-text">${subtaskInput}</span>
            </div>
            <div class="delete-edit-btns gap-8 flexR">
                <button class="edit-subtask-button overlay-button" type="button" onclick="editSubtask(this)">
                    ${EDIT_SVG}
                </button>
                ${SEPARATOR_SVG}
                <button class="delete-subtask-button overlay-button" type="button" onclick="deleteSubtask(this)">
                    ${DELETE_SVG}
                </button>
            </div>
        </div>
        <div class="edit-subtask-input-wrapper space-between width-100 flexR display-none" id="${editUniqueId}">
            <input type="text" id="${editInputId}" class="width-100" onkeydown="onEnterEditSubTask(event, this)">
            <div class="gap-8 flexR">
            <button class="delete-subtask-button overlay-button" type="button" onclick="deleteSubtask(this)">
                <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3C0.716667 3 0.479167 2.90417 0.2875 2.7125C0.0958333 2.52083 0 2.28333 0 2C0 1.71667 0.0958333 1.47917 0.2875 1.2875C0.479167 1.09583 0.716667 1 1 1H5C5 0.716667 5.09583 0.479167 5.2875 0.2875C5.47917 0.0958333 5.71667 0 6 0H10C10.2833 0 10.5208 0.0958333 10.7125 0.2875C10.9042 0.479167 11 0.716667 11 1H15C15.2833 1 15.5208 1.09583 15.7125 1.2875C15.9042 1.47917 16 1.71667 16 2C16 2.28333 15.9042 2.52083 15.7125 2.7125C15.5208 2.90417 15.2833 3 15 3V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM3 3V16H13V3H3ZM5 13C5 13.2833 5.09583 13.5208 5.2875 13.7125C5.47917 13.9042 5.71667 14 6 14C6.28333 14 6.52083 13.9042 6.7125 13.7125C6.90417 13.5208 7 13.2833 7 13V6C7 5.71667 6.90417 5.47917 6.7125 5.2875C6.52083 5.09583 6.28333 5 6 5C5.71667 5 5.47917 5.09583 5.2875 5.2875C5.09583 5.47917 5 5.71667 5 6V13ZM9 13C9 13.2833 9.09583 13.5208 9.2875 13.7125C9.47917 13.9042 9.71667 14 10 14C10.2833 14 10.5208 13.9042 10.7125 13.7125C10.9042 13.5208 11 13.2833 11 13V6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6V13Z" fill="#2A3647"/>
                </svg>
            </button>
                <svg width="2" height="24" viewBox="0 0 2 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 0V24" stroke="#D1D1D1"/>
                </svg>
            <button class="add-subtask-button overlay-button" type="button" onclick="finalEditditSubtask(this)">
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.79911 9.15L14.2741 0.675C14.4741 0.475 14.7116 0.375 14.9866 0.375C15.2616 0.375 15.4991 0.475 15.6991 0.675C15.8991 0.875 15.9991 1.1125 15.9991 1.3875C15.9991 1.6625 15.8991 1.9 15.6991 2.1L6.49911 11.3C6.29911 11.5 6.06578 11.6 5.79911 11.6C5.53245 11.6 5.29911 11.5 5.09911 11.3L0.799113 7C0.599113 6.8 0.50328 6.5625 0.511613 6.2875C0.519946 6.0125 0.624113 5.775 0.824113 5.575C1.02411 5.375 1.26161 5.275 1.53661 5.275C1.81161 5.275 2.04911 5.375 2.24911 5.575L5.79911 9.15Z" fill="#2A3647"/>
                </svg>
            </button>
            </div>
        </div>
    </li>
    `
}

function editedSubTask(subtaskInput){
    return`<div class="subtask-headdinfg flexR gap-8">
                •
                <span class="subtask-text">${subtaskInput}</span>
            </div>
            <div class="gap-8 flexR">
                <button class="edit-subtask-button overlay-button" type="button" onclick="editSubtask(this)">
                    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 17H3.4L12.025 8.375L10.625 6.975L2 15.6V17ZM16.3 6.925L12.05 2.725L13.45 1.325C13.8333 0.941667 14.3042 0.75 14.8625 0.75C15.4208 0.75 15.8917 0.941667 16.275 1.325L17.675 2.725C18.0583 3.10833 18.2583 3.57083 18.275 4.1125C18.2917 4.65417 18.1083 5.11667 17.725 5.5L16.3 6.925ZM14.85 8.4L4.25 19H0V14.75L10.6 4.15L14.85 8.4Z" fill="#2A3647"/>
                    </svg>
                </button>
                <svg width="2" height="24" viewBox="0 0 2 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 0V24" stroke="#D1D1D1"/>
                </svg>
                <button class="delete-subtask-button overlay-button" type="button" onclick="deleteSubtask(this)">
                    <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3C0.716667 3 0.479167 2.90417 0.2875 2.7125C0.0958333 2.52083 0 2.28333 0 2C0 1.71667 0.0958333 1.47917 0.2875 1.2875C0.479167 1.09583 0.716667 1 1 1H5C5 0.716667 5.09583 0.479167 5.2875 0.2875C5.47917 0.0958333 5.71667 0 6 0H10C10.2833 0 10.5208 0.0958333 10.7125 0.2875C10.9042 0.479167 11 0.716667 11 1H15C15.2833 1 15.5208 1.09583 15.7125 1.2875C15.9042 1.47917 16 1.71667 16 2C16 2.28333 15.9042 2.52083 15.7125 2.7125C15.5208 2.90417 15.2833 3 15 3V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM3 3V16H13V3H3ZM5 13C5 13.2833 5.09583 13.5208 5.2875 13.7125C5.47917 13.9042 5.71667 14 6 14C6.28333 14 6.52083 13.9042 6.7125 13.7125C6.90417 13.5208 7 13.2833 7 13V6C7 5.71667 6.90417 5.47917 6.7125 5.2875C6.52083 5.09583 6.28333 5 6 5C5.71667 5 5.47917 5.09583 5.2875 5.2875C5.09583 5.47917 5 5.71667 5 6V13ZM9 13C9 13.2833 9.09583 13.5208 9.2875 13.7125C9.47917 13.9042 9.71667 14 10 14C10.2833 14 10.5208 13.9042 10.7125 13.7125C10.9042 13.5208 11 13.2833 11 13V6C11 5.71667 10.9042 5.47917 10.7125 5.2875C10.5208 5.09583 10.2833 5 10 5C9.71667 5 9.47917 5.09583 9.2875 5.2875C9.09583 5.47917 9 5.71667 9 6V13Z" fill="#2A3647"/>
                    </svg>
                </button>
            </div>`
}