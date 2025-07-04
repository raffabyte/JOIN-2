
const OVERLAY = document.getElementById('overlay');
const OVERLAY_CONTENT = document.getElementById('overlayContent');

function addTaskOverlay() {
    // Set the overlay content to the add task form
    OVERLAY_CONTENT.innerHTML = addTaskOverlayForm();
    OVERLAY_CONTENT.classList.add('add-task');

    // Show the overlay
    OVERLAY.classList.remove('display-none');

    setTimeout(() => {
        // Add animation class to the overlay content
        OVERLAY_CONTENT.classList.add('active');
    }, 10);
}



function closeOverlay() {
    // Remove animation class
    OVERLAY_CONTENT.classList.remove('active');

    // Hide the overlay after animation
    setTimeout(() => {
        OVERLAY.classList.add('display-none');
        OVERLAY_CONTENT.classList.remove('add-task');
        OVERLAY_CONTENT.innerHTML = '';
    }, 110);
}



function notContentClickClose(event) {
    if (event.target === OVERLAY) {
        closeOverlay();
    }
}


function PriorityHandler(priority) {
    // Hole alle Priority-Buttons per Klasse
    const buttons = document.querySelectorAll('.priority-button');
    buttons.forEach(btn => btn.classList.remove('active'));

    buttons.forEach(btn => {
        switch (priority) {
            case 'high':
                if (btn.classList.contains('HighPriority')) btn.classList.add('active');
                break;
            case 'medium':
                if (btn.classList.contains('MidPriority')) btn.classList.add('active');
                break;
            case 'low':
                if (btn.classList.contains('LowPriority')) btn.classList.add('active');
                break;
        }
    });
}

function toggleAssigneeOptions() {
    const  ASSIGNEEOPTIONS = document.getElementById('assigneeOptions');
    
    ASSIGNEEOPTIONS.classList.toggle('display-none');
    ASSIGNEEOPTIONS.classList.toggle('active');
}

function toggleCategoryOptions() {
    const CATEGORYOPTIONS = document.getElementById('categoryOptions');
    
    CATEGORYOPTIONS.classList.toggle('display-none');
    CATEGORYOPTIONS.classList.toggle('active');
}

function selectCategory(category) {
    const TASKCATEGORY = document.getElementById('taskCategory');
    const CATEGORYOPTIONS = document.getElementById('categoryOptions');

    TASKCATEGORY.textContent = category;
    CATEGORYOPTIONS.classList.add('display-none');
    CATEGORYOPTIONS.classList.remove('active');
    
}

// Schließt offene Dropdowns, wenn außerhalb geklickt wird
document.addEventListener('click', function(event) {
    const categoryOptions = document.getElementById('categoryOptions');
    const assigneeOptions = document.getElementById('assigneeOptions');

    // Category-Options schließen, wenn offen und Klick außerhalb
    if (categoryOptions && categoryOptions.classList.contains('active')) {
        if (!categoryOptions.contains(event.target) && event.target.id !== 'taskCategory') {
            categoryOptions.classList.add('display-none');
            categoryOptions.classList.remove('active');
        }
    }

    // Assignee-Options schließen, wenn offen und Klick außerhalb
    if (assigneeOptions && assigneeOptions.classList.contains('active')) {
        if (!assigneeOptions.contains(event.target) && event.target.id !== 'taskAssignee') {
            assigneeOptions.classList.add('display-none');
            assigneeOptions.classList.remove('active');
        }
    }
});