function addTaskOverlayForm() {
    return `
            <div class="overlay-header flexR">
            <h2>Add Task</h2>
            <button class="close-button" onclick="closeOverlay()">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 8.40005L2.1 13.3C1.91667 13.4834 1.68333 13.575 1.4 13.575C1.11667 13.575 0.883333 13.4834 0.699999 13.3C0.516666 13.1167 0.424999 12.8834 0.424999 12.6C0.424999 12.3167 0.516666 12.0834 0.699999 11.9L5.6 7.00005L0.699999 2.10005C0.516666 1.91672 0.424999 1.68338 0.424999 1.40005C0.424999 1.11672 0.516666 0.883382 0.699999 0.700049C0.883333 0.516715 1.11667 0.425049 1.4 0.425049C1.68333 0.425049 1.91667 0.516715 2.1 0.700049L7 5.60005L11.9 0.700049C12.0833 0.516715 12.3167 0.425049 12.6 0.425049C12.8833 0.425049 13.1167 0.516715 13.3 0.700049C13.4833 0.883382 13.575 1.11672 13.575 1.40005C13.575 1.68338 13.4833 1.91672 13.3 2.10005L8.4 7.00005L13.3 11.9C13.4833 12.0834 13.575 12.3167 13.575 12.6C13.575 12.8834 13.4833 13.1167 13.3 13.3C13.1167 13.4834 12.8833 13.575 12.6 13.575C12.3167 13.575 12.0833 13.4834 11.9 13.3L7 8.40005Z" fill="#2A3647"/>
            </svg>

            </button>
            </div>
            <form id="addTaskForm" class="overlay-bottom flexC" onsubmit="addTask()">
                <div class="flexR task-form-top">
                    <div class="flexC task-form-column">
                        <div class="task-form flexC">
                            <label for="taskTitle">Title<span class="highlight">*</span></label>
                            <input class="inputs" type="text" id="taskTitle" name="taskTitle" placeholder="Enter a title" required>
                            <span class="required-span display-none">This field is required</span>
                        </div>

                        <div class="task-form flexC">
                            <label for="taskDescription">Description</label>
                            <textarea class="inputs" id="taskDescription" name="taskDescription" placeholder="Enter a description"></textarea>
                        </div>

                        <div class="task-form flexC">
                            <label for="taskDueDate">Due date<span class="highlight">*</span></label>
                            <input class="inputs" type="date" id="taskDueDate" name="taskDueDate" required min="" onfocus="this.min=new Date().toISOString().split('T')[0]">
                            <span class="required-span display-none">This field is required</span>
                        </div>
                    </div>
                    <span class="middle-vector"></span>
                    <div class="flexC task-form-column">
                        <div class="task-form flexC">
                            <label for="taskPriority">Priority</label>
                            <div class="flexR priority-select">
                                <button type="button" class="priority-button flexR HighPriority" id="taskPriority" onclick="PriorityHandler('high'); event.stopPropagation();">
                                    <span class="priority-text">Urgent</span>
                                    <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clip-path="url(#clip0_335524_5203)">
                                            <path d="M19.6527 15.2547C19.418 15.2551 19.1895 15.1803 19.0006 15.0412L10.7486 8.958L2.4965 15.0412C2.38065 15.1267 2.24907 15.1887 2.10927 15.2234C1.96947 15.2582 1.82419 15.2651 1.68172 15.2437C1.53925 15.2223 1.40239 15.1732 1.27894 15.099C1.1555 15.0247 1.04789 14.927 0.962258 14.8112C0.876629 14.6954 0.814657 14.5639 0.77988 14.4243C0.745104 14.2846 0.738203 14.1394 0.759574 13.997C0.802733 13.7095 0.958423 13.4509 1.19239 13.2781L10.0965 6.70761C10.2852 6.56802 10.5138 6.49268 10.7486 6.49268C10.9833 6.49268 11.2119 6.56802 11.4006 6.70761L20.3047 13.2781C20.4906 13.415 20.6285 13.6071 20.6987 13.827C20.7688 14.0469 20.7677 14.2833 20.6954 14.5025C20.6231 14.7216 20.4833 14.9124 20.296 15.0475C20.1088 15.1826 19.8836 15.2551 19.6527 15.2547Z" fill="#FF3D00"/>
                                            <path d="M19.6527 9.50568C19.4181 9.50609 19.1895 9.43124 19.0006 9.29214L10.7486 3.20898L2.49654 9.29214C2.26257 9.46495 1.96948 9.5378 1.68175 9.49468C1.39403 9.45155 1.13523 9.29597 0.962293 9.06218C0.789357 8.82838 0.71645 8.53551 0.759609 8.24799C0.802768 7.96048 0.958458 7.70187 1.19243 7.52906L10.0965 0.958588C10.2852 0.818997 10.5138 0.743652 10.7486 0.743652C10.9834 0.743652 11.212 0.818997 11.4007 0.958588L20.3048 7.52906C20.4907 7.66598 20.6286 7.85809 20.6987 8.07797C20.7689 8.29785 20.7677 8.53426 20.6954 8.75344C20.6231 8.97262 20.4833 9.16338 20.2961 9.29847C20.1088 9.43356 19.8837 9.50608 19.6527 9.50568Z" fill="#FF3D00"/>
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_335524_5203">
                                                <rect width="20" height="14.5098" fill="white" transform="translate(0.748535 0.745117)"/>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </button>
                                <button type="button" class="priority-button flexR MidPriority" id="taskPriority" onclick="PriorityHandler('medium'); event.stopPropagation();">
                                    <span class="priority-text">Medium</span>
                                    <svg width="21" height="8" viewBox="0 0 21 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19.1526 7.72528H1.34443C1.05378 7.72528 0.775033 7.60898 0.569514 7.40197C0.363995 7.19495 0.248535 6.91419 0.248535 6.62143C0.248535 6.32867 0.363995 6.0479 0.569514 5.84089C0.775033 5.63388 1.05378 5.51758 1.34443 5.51758H19.1526C19.4433 5.51758 19.722 5.63388 19.9276 5.84089C20.1331 6.0479 20.2485 6.32867 20.2485 6.62143C20.2485 6.91419 20.1331 7.19495 19.9276 7.40197C19.722 7.60898 19.4433 7.72528 19.1526 7.72528Z" fill="#FFA800"/>
                                        <path d="M19.1526 2.48211H1.34443C1.05378 2.48211 0.775033 2.36581 0.569514 2.1588C0.363995 1.95179 0.248535 1.67102 0.248535 1.37826C0.248535 1.0855 0.363995 0.804736 0.569514 0.597724C0.775033 0.390712 1.05378 0.274414 1.34443 0.274414L19.1526 0.274414C19.4433 0.274414 19.722 0.390712 19.9276 0.597724C20.1331 0.804736 20.2485 1.0855 20.2485 1.37826C20.2485 1.67102 20.1331 1.95179 19.9276 2.1588C19.722 2.36581 19.4433 2.48211 19.1526 2.48211Z" fill="#FFA800"/>
                                    </svg>
                                </button>
                                <button type="button" class="priority-button flexR LowPriority" id="taskPriority" onclick="PriorityHandler('low'); event.stopPropagation();">
                                    <span class="priority-text">Low</span>
                                    <svg width="21" height="16" viewBox="0 0 21 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M10.2485 9.50614C10.0139 9.50654 9.7854 9.4317 9.59655 9.29262L0.693448 2.72288C0.57761 2.63733 0.47977 2.52981 0.405515 2.40647C0.33126 2.28313 0.282043 2.14638 0.260675 2.00404C0.217521 1.71655 0.290421 1.42372 0.463337 1.18994C0.636253 0.956173 0.895022 0.800615 1.18272 0.757493C1.47041 0.71437 1.76347 0.787216 1.99741 0.960004L10.2485 7.04248L18.4997 0.960004C18.6155 0.874448 18.7471 0.812529 18.8869 0.777782C19.0266 0.743035 19.1719 0.736141 19.3144 0.757493C19.4568 0.778844 19.5937 0.828025 19.7171 0.902225C19.8405 0.976425 19.9481 1.07419 20.0337 1.18994C20.1194 1.3057 20.1813 1.43717 20.2161 1.57685C20.2509 1.71653 20.2578 1.86169 20.2364 2.00404C20.215 2.14638 20.1658 2.28313 20.0916 2.40647C20.0173 2.52981 19.9195 2.63733 19.8036 2.72288L10.9005 9.29262C10.7117 9.4317 10.4831 9.50654 10.2485 9.50614Z" fill="#7AE229"/>
                                        <path d="M10.2485 15.2547C10.0139 15.2551 9.7854 15.1802 9.59655 15.0412L0.693448 8.47142C0.459502 8.29863 0.30383 8.04005 0.260675 7.75257C0.217521 7.46509 0.290421 7.17225 0.463337 6.93848C0.636253 6.70471 0.895021 6.54915 1.18272 6.50603C1.47041 6.46291 1.76347 6.53575 1.99741 6.70854L10.2485 12.791L18.4997 6.70854C18.7336 6.53575 19.0267 6.46291 19.3144 6.50603C19.602 6.54915 19.8608 6.70471 20.0337 6.93848C20.2066 7.17225 20.2795 7.46509 20.2364 7.75257C20.1932 8.04005 20.0376 8.29863 19.8036 8.47142L10.9005 15.0412C10.7117 15.1802 10.4831 15.2551 10.2485 15.2547Z" fill="#7AE229"/>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div class="flexC task-form">
                            <label for="taskAssignee">Assigned To</label>
                            <div class="input-svg-wrapper flexC">
                                <input  class="inputs" type="text" id="taskAssignee" placeholder="Select Contacts to assign" 
                                        onclick="toggleAssigneeOptions(); event.stopPropagation(); ">
                                <div id="assigneeOptions" class="assignee-options display-none">
                                    <div class="assignee-option" onclick="selectAssignee('Unassigned')">
                                       <span class="assignee-name">Unassigned</span>
                                    </div>
                                    <div class="assignee-option" onclick="selectAssignee('Unassigned')">
                                       <span class="assignee-name">Unassigned</span>
                                    </div>
                                    <div class="assignee-option" onclick="selectAssignee('Unassigned')">
                                       <span class="assignee-name">Unassigned</span>
                                    </div>
                                    <div class="assignee-option" onclick="selectAssignee('Unassigned')">
                                      <span class="assignee-name">Unassigned</span>
                                    </div>
                                    <div class="assignee-option" onclick="selectAssignee('Unassigned')">
                                       <span class="assignee-name">Unassigned</span>
                                    </div>
                                    <div class="assignee-option" onclick="selectAssignee('Unassigned')">
                                        <span class="assignee-name">Unassigned</span>
                                    </div>
                                </div>
                            </div>
                            <div class="selected-assignee flexR display-none" id="selectedAssignee">
                                <img src="../img/Bord/member1.png" alt="Member 1">
                                <img src="../img/Bord/member2.png" alt="Member 2">
                                <img src="../img/Bord/member3.png" alt="Member 3">
                            </div>
                        </div>
                        <div class="task-form flexC">
                            <label for="taskCategory">Category<span class="highlight">*</span></label>
                            <div class="category-options">
                                <button class="inputs" type="button" id="taskCategory" onclick="toggleCategoryOptions(); event.stopPropagation();" required>Select task category</button>
                                <div class="category-options-list display-none flexC" id="categoryOptions">
                                    <span onclick="selectCategory('User Story');" class="category-option" value="userStory">User Story</span>
                                    <span onclick="selectCategory('Technical Task');" class="category-option" value="technicalTask">Technical Task</span>
                                </div>
                            </div>
                            <span class="required-span display-none">This field is required</span>
                        </div>
                        <div class="task-form flexC">
                            <label for="subtasks">Subtasks</label>
                            <input class="inputs" type="text" id="subtasks" placeholder="add new subtask">
                        </div>
                    </div>
                </div>
                <div class="flexR task-form-bottom">
                    <span>
                    <span class="highlight">*</span>This field is required</span>
                    <div class="flexR add-task-footer-btns">
                        <button type="button" id="closeOverlayButton" onclick="closeOverlay()">
                            Cancel
                            <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.24953 7.00008L11.4925 12.2431M1.00653 12.2431L6.24953 7.00008L1.00653 12.2431ZM11.4925 1.75708L6.24853 7.00008L11.4925 1.75708ZM6.24853 7.00008L1.00653 1.75708L6.24853 7.00008Z" stroke="#2A3647" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button type="submit" id="addTaskButton">
                            Creat Task
                            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.79911 9.15L14.2741 0.675C14.4741 0.475 14.7116 0.375 14.9866 0.375C15.2616 0.375 15.4991 0.475 15.6991 0.675C15.8991 0.875 15.9991 1.1125 15.9991 1.3875C15.9991 1.6625 15.8991 1.9 15.6991 2.1L6.49911 11.3C6.29911 11.5 6.06578 11.6 5.79911 11.6C5.53245 11.6 5.29911 11.5 5.09911 11.3L0.799113 7C0.599113 6.8 0.50328 6.5625 0.511613 6.2875C0.519946 6.0125 0.624113 5.775 0.824113 5.575C1.02411 5.375 1.26161 5.275 1.53661 5.275C1.81161 5.275 2.04911 5.375 2.24911 5.575L5.79911 9.15Z" fill="white"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </form>
    `;
}
