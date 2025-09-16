/* passende Deklarierung einmal in main.js; in allen anderen js kann dann das verwendet werden: // remoteStorage.js, addTask.js usw.
const BASE_URL = window.BASE_URL;
const USERKEY = window.USERKEY;
*/

/**
 * Base URL for Firebase Realtime Database.
 * Stored both on the `window` (for global access) and as a module-level constant.
 * Must end with a trailing slash.
 * @type {string}
 */
window.BASE_URL = "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/";

/**
 * Currently logged-in user's key. Pulled from localStorage at boot.
 * Exposed both on `window` and as a module-level constant.
 * @type {string|null}
 */
window.USERKEY = localStorage.getItem("loggedInUserKey");

/** @type {string} */
const BASE_URL = "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/";
/** @type {string|null} */
const USERKEY = localStorage.getItem("loggedInUserKey");

/**
 * Palette of predefined colors used for contact avatars or tags.
 * @type {string[]}
 */
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

/**
 * Simple demo login that validates against hard-coded credentials.
 * Displays a message in the element with id "msgBox".
 * NOTE: For production, replace with real authentication.
 *
 * @returns {void}
 */
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

/**
 * Placeholder logout (early definition).
 * NOTE: This function is later redefined by another `logout` implementation below,
 * which will override this one because of function hoisting.
 *
 * @returns {void}
 */
function logout() {
    alert('Du wurdest abgemeldet!');
}

/**
 * Toggles the visibility of the profile menu and wires a body click handler
 * to close the menu when clicking outside of it.
 * Expects elements with IDs "menu" and "userProfile".
 *
 * @returns {void}
 */
function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('not-visible');
    
    document.body.onclick = !menu.classList.contains('not-visible') 
        ? (e) => (!menu.contains(e.target) && !document.getElementById('userProfile').contains(e.target)) && (menu.classList.add('not-visible'), document.body.onclick = null)
        : null;
}

/**
 * Renders the left navigation menu variant depending on the current page.
 * Uses `linkesNavLogin(page)` for login-related legal pages, otherwise `linkesNav(page)`.
 * Expects an element with ID "linkesNavMenu" and the templating functions to exist.
 *
 * @returns {void}
 */
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

/**
 * Shows/hides the help link and user profile icon depending on the current page.
 * Expects elements with IDs "helpLink" and "userProfile".
 * Uses the "displayNone" class to hide elements.
 *
 * @returns {void}
 */
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

/**
 * Injects the header markup into the element with ID "header".
 * Relies on a global `header()` template function.
 *
 * @returns {void}
 */
function addHeader() {
    // This function adds the header to the page
   
    const HEADER = document.getElementById('header');

    HEADER.innerHTML = header();
}
  
/**
 * Initializes common page chrome: header, left nav, visibility of help/user controls,
 * and the user's initials bubble.
 *
 * @returns {Promise<void>}
 */
async function init(){
    // Initialize the header and navigation menu based on the current page
    // This function is called when the page loads
    
    addHeader();
    linkesNavMenuVersion();
    showHideHelpAndUser();
    await setUserInitials();
}

/**
 * Loads the current user from Firebase and sets the text content of the element
 * with ID "userInitials" to the user's initials. Falls back to "?" on failure.
 *
 * @returns {Promise<void>}
 */
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

/**
 * Computes initials from a given full name.
 * Returns the first letter of the 1st and 3rd words if 3+ words,
 * otherwise the first letters of the first two words, or one letter for single names.
 *
 * NOTE: This function uses an undeclared variable `splitedName`, which becomes a global.
 * For robustness, consider declaring it with `const` or `let`.
 *
 * @param {string} name - Full name.
 * @returns {string} Initials in uppercase.
 */
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

/**
 * Logs out the current user and returns to the login page.
 * If the user is in guest mode, their user node is deleted from Firebase before logout.
 * Clears all localStorage keys and redirects to "../../index.html".
 *
 * NOTE: This definition overrides the earlier placeholder `logout()` above.
 *
 * @returns {Promise<void>}
 */
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

/**
 * Returns a random color from the `predefinedColors` palette.
 * @returns {string} A hex color string.
 */
function getRandomColor() {
  const index = Math.floor(Math.random() * predefinedColors.length);
  return predefinedColors[index];
}

/**
 * Generates up to two initials from a name.
 * @param {string} name - Full name
 * @returns {string} 1–2 uppercase letters (empty string if name is falsy)
 */
function getInitials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map(word => word[0]?.toUpperCase() || "")
    .join("")
    .substring(0, 2);
}

/**
 * Performs a GET request to `${BASE_URL}${path}.json` and returns parsed JSON.
 * NOTE: Assigns to `responseToJson` (implicit global) to mirror existing logic.
 *
 * @template T
 * @param {string} [path=""] - Path relative to BASE_URL (without leading slash).
 * @returns {Promise<T>} Parsed JSON response.
 */
async function loadData(path = "") {
  let response = await fetch(BASE_URL + path + ".json");
  return (responseToJson = await response.json());
}

/**
 * Performs a POST request to `${BASE_URL}${path}.json` with a JSON body.
 * Typically returns `{ name: "<generated-key>" }` from Firebase.
 * NOTE: Assigns to `responseToJson` (implicit global) to mirror existing logic.
 *
 * @template T
 * @param {string} [path=""] - Path relative to BASE_URL (without leading slash).
 * @param {any} [data={}] - Data to serialize and send as JSON.
 * @returns {Promise<T>} Parsed JSON response.
 */
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

/**
 * Performs a PUT request to `${BASE_URL}${path}.json` with a JSON body.
 * Overwrites the value at the path.
 *
 * @template T
 * @param {string} [path=""] - Path relative to BASE_URL (without leading slash).
 * @param {any} [data={}] - Data to serialize and send as JSON.
 * @returns {Promise<T>} Parsed JSON response.
 */
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

/**
 * Performs a DELETE request to `${BASE_URL}${path}.json`.
 * Deletes the node at the specified path.
 * NOTE: Assigns to `responseToJson` (implicit global) to mirror existing logic.
 *
 * @template T
 * @param {string} [path=""] - Path relative to BASE_URL (without leading slash).
 * @returns {Promise<T>} Parsed JSON response (Firebase typically returns `null`).
 */
async function deleteData(path = "") {
  let response = await fetch(BASE_URL + path + ".json", {
    method: "DELETE",
  });
  return (responseToJson = await response.json());
}
