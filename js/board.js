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
    // Annahme: Es gibt drei Buttons mit den IDs: 'priorityHigh', 'priorityMedium', 'priorityLow'
    const btnHigh = document.getElementById('priorityHigh');
    const btnMedium = document.getElementById('priorityMedium');
    const btnLow = document.getElementById('priorityLow');

    btnHigh.classList.remove('active');
    btnMedium.classList.remove('active');
    btnLow.classList.remove('active');

    if (priority === 'high') {
        btnHigh.classList.add('active');
    } else if (priority === 'medium') {
        btnMedium.classList.add('active');
    } else if (priority === 'low') {
        btnLow.classList.add('active');
    }
}
