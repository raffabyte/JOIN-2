/**
 * Board Utility Functions
 * Helper functions for board functionality
 */


/**
 * Converts a string to camelCase format
 * @param {string} word - The word to convert
 * @returns {string} The camelCase version of the word
 */
function convertToCamelCase(word) {
    if (!word) return '';
    return (word.charAt(0).toLowerCase() + word.slice(1)).replace(' ', '');
}


/**
 * Returns the appropriate SVG icon for a given priority level
 * @param {string} priority - The priority level ('HighPriority', 'MidPriority', 'LowPriority')
 * @returns {string} SVG markup for the priority icon
 */
function getPrioritySvg(priority) {
    switch (priority) {
        case 'HighPriority':
            return HIGH_PRIORITY_SVG;
        case 'MidPriority':
            return MID_PRIORITY_SVG;
        case 'LowPriority':
            return LOW_PRIORITY_SVG;
        default:
            return '';
    }
}


/**
 * Generates HTML for subtask progress display
 * @param {Array<Object>} subtasks - Array of subtask objects
 * @returns {string} HTML string for subtask progress or empty string if no subtasks
 */
function generateSubtaskProgress(subtasks) {
    if (!subtasks || subtasks.length === 0) {
        return '';
    }

    const completedSubtasks = subtasks.filter(subtask => subtask.checked === true).length;
    const totalSubtasks = subtasks.length;
    const progressPercentage = (completedSubtasks / totalSubtasks) * 100;

    return handleSubtasksTemplate(progressPercentage, completedSubtasks, totalSubtasks);
}


/**
 * Returns a string showing completed vs total subtasks count
 * @param {Array<Object>} subtasks - Array of subtask objects
 * @returns {string} Formatted count string (e.g., "2/5") or empty string
 */
function getSubtasksCount(subtasks) {
    if (Array.isArray(subtasks) && subtasks.length > 0) {
        return `${subtasks.filter(sub => sub.checked).length}/${subtasks.length}`;
    }
    return '';
}


/**
 * Returns appropriate CSS class for conditional visibility
 * @param {boolean} condition - Whether the element should be visible
 * @returns {string} Empty string if visible, ' display-none' if hidden
 */
function getVisibilityClass(condition) {
    return condition ? '' : ' display-none';
}


/**
 * Checks if a task has footer data (assignees or priority)
 * @param {Object} task - The task object to check
 * @returns {boolean} True if task has footer data, false otherwise
 */
function taskHasFooterData(task) {
    return (Array.isArray(task.assignee) && task.assignee.length > 0) || task.priority;
}
