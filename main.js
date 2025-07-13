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
const BASE_URL =
  "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/";
  
async function init(){
    // Initialize the header and navigation menu based on the current page
    // This function is called when the page loads
    
    addHeader();
    linkesNavMenuVersion();
    showHideHelpAndUser();
    await setUserInitials();
}

async function setUserInitials() {
  const initialsEl = document.getElementById("userInitials");

  if (!initialsEl || typeof userKey === 'undefined' || !userKey) return;
  
  if (!initialsEl || !userKey) return;

  try {
    const response = await fetch(`${BASE_URL}users/${userKey}.json`);
    const user = await response.json();

    if (user?.name) {
      const initials = user.name
        .split(" ")
        .map(word => word[0].toUpperCase())
        .slice(0, 2)
        .join("");
      initialsEl.innerText = initials;
    } else {
      initialsEl.innerText = "?";
    }
  } catch (error) {
    console.error("Fehler beim Laden der Userdaten:", error);
    initialsEl.innerText = "?";
  }
}

function contactIconSpan(name){
    splitedName = name.split(" ");
    if (splitedName.length >= 3) {
        return splitedName[0][0].toUpperCase() + " " + splitedName[2][0].toUpperCase();
    }else if (splitedName.length === 2) {
        return splitedName[0][0].toUpperCase() + " " + splitedName[1][0].toUpperCase();
    }else if (splitedName.length === 1) {
        return splitedName[0][0].toUpperCase();
    }
}

async function logout() {
  const isGuest = localStorage.getItem("guestMode") === "true";
  const userKey = localStorage.getItem("loggedInUserKey");

  if (isGuest && userKey) {
    await fetch(`https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/users/${userKey}.json`, {
      method: "DELETE",
    });
  }

  localStorage.clear();
  window.location.href = "../../index.html";
}


function generateColorFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}
