function login() {
            const EMAIL = document.getElementById('email').value;
            const PASSWORD = document.getElementById('password').value;
            const MSG_BOX = document.getElementById('msgBox');

            if (EMAIL === 'test@example.com' && PASSWORD === 'password123') {
                MSG_BOX.style.color = 'green';
                MSG_BOX.textContent = 'Login successful!';
               
            } else {
                MSG_BOX.style.color = 'red';
                MSG_BOX.textContent = 'Invalid email or password.';
            }
            console.log('Login attempt with:', EMAIL, PASSWORD);
        }

// Placeholder for a logout function if needed later
function logout() {
    alert('Du wurdest abgemeldet!');
}


//Profil menu Toggle function

function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('not-visible');
}


function linkesNavMenuVersion(){
    // This function determines which navigation menu to display based on the current page

    // Get the current page name from the URL
    let page = window.location.pathname.split('/').pop().split('.')[0];

    // Get the elements by their IDs
    const LINKES_NAV_MENU = document.getElementById('linkesNavMenu');


    if (page === 'legal-notice-login' || page === 'privacy-login') {
        LINKES_NAV_MENU.innerHTML = linkesNavLogin(page);
    }else {
        LINKES_NAV_MENU.innerHTML = linkesNav(page);
    }
}

function showHideHelpAndUser() {
    // Get the current page name from the URL
    let page = window.location.pathname.split('/').pop().split('.')[0];
    // Get the elements by their IDs
    const HELP_LINK = document.getElementById('helpLink');
    const USER_PROFILE = document.getElementById('userProfile');

    // Hide or show help link and user profile based on the current page
    if (page === 'legal-notice-login' || page === 'privacy-login' || page === 'privacy' || page === 'legal-notice') {
        HELP_LINK.classList.add('displayNone');
        USER_PROFILE.classList.add('displayNone');
    }else if (page === 'help') {
        HELP_LINK.classList.add('displayNone');
        USER_PROFILE.classList.remove('displayNone');
    }else {
        HELP_LINK.classList.remove('displayNone');
        USER_PROFILE.classList.remove('displayNone');
    }
}

function addHeader() {
    // This function adds the header to the page
    // Get the header element by its ID
    const HEADER = document.getElementById('header');

    HEADER.innerHTML = header();
}

function init(){
    // Initialize the header and navigation menu based on the current page
    // This function is called when the page loads
    addHeader();
    linkesNavMenuVersion();
    showHideHelpAndUser();
}
