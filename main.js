/* passende Deklarierung einmal in main.js; in allen anderen js kann dann das verwendet werden: // remoteStorage.js, addTask.js usw.
const BASE_URL = window.BASE_URL;
const USERKEY = window.USERKEY;
*/
window.BASE_URL = "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/";
window.USERKEY = localStorage.getItem("loggedInUserKey");
const BASE_URL = "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/";
const USERKEY = localStorage.getItem("loggedInUserKey");


const predefinedColors = [
  "#FF7A00",
  "#9327FF",
  "#6E52FF",
  "#FC71FF",
  "#FFBB2B",
  "#1FD7C1",
  "#462F8A",
  "#FF4646",
  "#00BEE8",
];

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
const toggleMenu = () => {
    const menu = document.getElementById('menu');
    menu.classList.toggle('not-visible');
    
    document.body.onclick = !menu.classList.contains('not-visible') 
        ? (e) => (!menu.contains(e.target) && !document.getElementById('userProfile').contains(e.target)) && (menu.classList.add('not-visible'), document.body.onclick = null)
        : null;
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
   
    const HEADER = document.getElementById('header');

    HEADER.innerHTML = header();
}
  
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
  const response = await fetch(`${BASE_URL}users/${USERKEY}.json`);
  const user = await response.json();

  if (!initialsEl || typeof USERKEY === 'undefined' || !USERKEY) return;
  if (!initialsEl || !USERKEY) return;
  try {    
    if (user?.name) {
      const initials = contactIconSpan(user.name);
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
        return splitedName[0][0].toUpperCase() + splitedName[2][0].toUpperCase();
    }else if (splitedName.length === 2) {
        return splitedName[0][0].toUpperCase() + splitedName[1][0].toUpperCase();
    }else if (splitedName.length === 1) {
        return splitedName[0][0].toUpperCase();
    }
}

async function logout() {
  const isGuest = localStorage.getItem("guestMode") === "true";

  if (isGuest && USERKEY) {
    await fetch(`https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/users/${USERKEY}.json`, {
      method: "DELETE",
    });
  }

  localStorage.clear();
  window.location.href = "../../index.html";
}


function getRandomColor() {
  const index = Math.floor(Math.random() * predefinedColors.length);
  return predefinedColors[index];
}

function getInitials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map(word => word[0]?.toUpperCase() || "")
    .join("")
    .substring(0, 2);
}



async function loadData(path = "") {
  let response = await fetch(BASE_URL + path + ".json");
  return (responseToJson = await response.json());
}


async function postData(path = "", data = {}) {
  let response = await fetch(BASE_URL + path + ".json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return (responseToJson = await response.json());
}


async function putData(path = "", data = {}) {
  let response = await fetch(BASE_URL + path + ".json", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return await response.json();
}


async function deleteData(path = "") {
  let response = await fetch(BASE_URL + path + ".json", {
    method: "DELETE",
  });
  return (responseToJson = await response.json());
}
