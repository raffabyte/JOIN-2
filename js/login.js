/**
 * Regular expression for validating email addresses.
 * @type {RegExp}
 */

const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
const MIN_PASSWORD_LENGTH = 0;
const DEBUG_LOGIN = false;

document.addEventListener("DOMContentLoaded", initLogin);


/**
 * Initializes the login form: sets up input feedback, password masking, and event handlers.
*/
function initLogin() {
  const elements = getLoginElements();
  setupLiveFeedback(elements);
  applyStarMaskToPassword(elements.passwordInput, elements.msgBox);
  bindLoginHandler(elements);
}


/**
 * Retrieves references to all relevant DOM elements for the login form.
 * @returns {Object} 
 */
function getLoginElements() {
  return {
    form: document.getElementById("loginForm"),
    emailInput: document.getElementById("email"),
    passwordInput: document.getElementById("password"),
    loginButton: document.querySelector(".login-btn"),
    msgBox: document.getElementById("msgBox"),
  };
}


/**
 * Sets up live feedback to remove error states when the user types.
 * @param {Object} param0 
 */
function setupLiveFeedback({ emailInput, passwordInput, msgBox }) {
  emailInput.addEventListener("input", () => {
    emailInput.classList.remove("input-error");
    clearMessage(msgBox);
  });
  passwordInput.addEventListener("input", () => {
    passwordInput.classList.remove("input-error");
    clearMessage(msgBox);
  });
}


/**
 * Binds the form submit event for login.
 * @param {Object} param0 
 */
function bindLoginHandler({ form, emailInput, passwordInput, loginButton, msgBox }) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessage(msgBox);

    const email = emailInput.value.trim();
    const password = passwordInput.getRealPassword(); 

    if (!validateInputs(email, password, emailInput, passwordInput, msgBox)) {
    return; 
  }
    
    if (!email || !password) {
      showMessage("Check your input. Please try again.", msgBox);
      return;
    }

    disableButton(loginButton);
    const result = await login(email, password);

    if (result.success) {
      sessionStorage.setItem("showMobileGreeting", "1");
      window.location.href = "../index/summary.html";
    } else {
      showMessage("Check your input. Please try again.", msgBox);
      enableButton(loginButton);
    }
  });
}


/**
 * Validates the user inputs for login.
 * @param {string} email 
 * @param {string} password
 * @param {HTMLInputElement} emailInput
 * @param {HTMLInputElement} passwordInput
 * @param {HTMLElement} msgBox
 * @returns {boolean} 
 */
function validateInputs(email, password, emailInput, passwordInput, msgBox) {
  let valid = true;

  if (!emailRegex.test(email)) {
    emailInput.classList.add("input-error");
    showMessage("Check your input. Please try again.", msgBox);
    valid = false;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    passwordInput.classList.add("input-error");
    showMessage("Check your input. Please try again.", msgBox);
    valid = false;
  }

  return valid;
}


/**
 * Displays login error messages based on the error code.
 * @param {string} errorCode
 * @param {HTMLElement} msgBox
 * @param {HTMLInputElement} emailInput
 * @param {HTMLInputElement} passwordInput
 */
function showLoginError(errorCode, msgBox, emailInput, passwordInput) {
  switch (errorCode) {
    case "email-not-found":
      showMessage("Please check your input and try again.", msgBox);
      emailInput.classList.add("input-error");
      break;
    case "wrong-password":
      showMessage("Please check your input and try again.", msgBox);
      passwordInput.classList.add("input-error");
      break;
    default:
      showMessage("Login error.", msgBox);
  }
}

/**
 * Displays login error messages based on the error code.
 * @param {string} errorCode 
 * @param {HTMLElement} msgBox
 * @param {HTMLInputElement} emailInput
 * @param {HTMLInputElement} passwordInput
 */
function applyStarMaskToPassword(passwordInput, msgBox) {
  let realPassword = "";
  let visible = false;

  passwordInput.getRealPassword = () => realPassword;
  passwordInput.type = "text";

  if (passwordInput.value.length > 0) {
    realPassword = passwordInput.value;
    updatePasswordField(passwordInput, realPassword, visible);
    updateVisualFeedback(passwordInput, msgBox, realPassword, visible);
  }

  passwordInput.addEventListener("beforeinput", (e) => {
    realPassword = handlePasswordInput(e, realPassword, passwordInput, visible);
    updatePasswordField(passwordInput, realPassword, visible);
    updateCursorPosition(passwordInput, visible);
    updateVisualFeedback(passwordInput, msgBox, realPassword, visible);
  });

  passwordInput.addEventListener("input", () => {
    if (passwordInput.value !== "*".repeat(realPassword.length)) {
      realPassword = passwordInput.value;
      updatePasswordField(passwordInput, realPassword, visible);
      updateVisualFeedback(passwordInput, msgBox, realPassword, visible);
    }
  });

  passwordInput.addEventListener("click", (e) => {
    if (clickedToggleArea(e, passwordInput) && realPassword.length > 0) {
      visible = !visible;
      updatePasswordField(passwordInput, realPassword, visible);
      updateVisualFeedback(passwordInput, msgBox, realPassword, visible);
    }
  });
  setTimeout(() => {
    realPassword = passwordInput.value;
    if (realPassword.length > 0) {
      updatePasswordField(passwordInput, realPassword, false);
      updateVisualFeedback(passwordInput, msgBox, realPassword, false);
    }
  }, 500); 

  clearMessage(msgBox);
}


/**
 * Handles manual user input in the password field to update the real password.
 * @param {InputEvent} e 
 * @param {string} realPassword
 * @param {HTMLInputElement} input 
 * @param {boolean} visible 
 * @returns {string} 
 */
function handlePasswordInput(e, realPassword, input, visible) {
  const start = input.selectionStart;
  const end = input.selectionEnd;

  if (e.inputType === "insertText" && e.data) {
    realPassword = realPassword.slice(0, start) + e.data + realPassword.slice(end);
  } else if (e.inputType === "deleteContentBackward") {
    realPassword = realPassword.slice(0, start - 1) + realPassword.slice(end);
  } else if (e.inputType === "deleteContentForward") {
    realPassword = realPassword.slice(0, start) + realPassword.slice(end + 1);
  }

  e.preventDefault();
  return realPassword;
}


/**
 * Updates the displayed value of the password field based on visibility.
 * @param {HTMLInputElement} input
 * @param {string} realPassword
 * @param {boolean} visible
 */
function updatePasswordField(input, realPassword, visible) {
  input.value = visible ? realPassword : "*".repeat(realPassword.length);
}


/**
 * Adjusts cursor position to keep UX smooth when masking/unmasking.
 * @param {HTMLInputElement} input
 * @param {boolean} visible
 */
function updateCursorPosition(input, visible) {
  requestAnimationFrame(() => {
    const pos = visible ? input.selectionStart + 1 : input.value.length;
    input.setSelectionRange(pos, pos);
  });
}


/**
 * Applies visual feedback like icons based on password state.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} msgBox
 * @param {string} realPassword
 * @param {boolean} visible
 */
function updateVisualFeedback(input, msgBox, realPassword, visible) {
  input.classList.remove("input-error", "lock_icon", "visibility_icon", "visibility_off_icon");
  clearMessage(msgBox);

  const iconClass = realPassword.length === 0
    ? "lock_icon"
    : visible
    ? "visibility_icon"
    : "visibility_off_icon";

  input.classList.add(iconClass);
}


/**
 * Checks if the user clicked in the password visibility toggle area.
 * @param {MouseEvent} e
 * @param {HTMLInputElement} input
 * @returns {boolean} 
 */
function clickedToggleArea(e, input) {
  const rect = input.getBoundingClientRect();
  return e.clientX > rect.right - 40;
}


async function login(email, password) {
  try {
    const response = await fetch(`${BASE_URL}users.json`);
    const users = await response.json();

    let userFound = null;

    for (let key in users) {
      const user = users[key];
      if (user.email === email) {
        userFound = { key, user };
        break;
      }
    }

    if (!userFound) return { success: false, error: "wrong input" };
    if (userFound.user.password !== password) return { success: false, error: "wrong input" };

    localStorage.setItem("loggedInUserKey", userFound.key);
    return { success: true };
  } catch (err) {
    console.error("Login-Fehler:", err);
    return { success: false, error: "server-error" };
  }
}
 

/**
* Flattens arbitrarily nested user objects/arrays into a list.
* Expects objects with at least { email, password }.
 */
function flattenUsers(node, basePath = "users") {
  const list = [];

  function walk(n, path) {
    if (!n) return;

    if (typeof n === "object" && n !== null && "email" in n && "password" in n) {
      list.push({ path, ...n });
      return;
    }

    if (Array.isArray(n)) {
      n.forEach((item, idx) => walk(item, `${path}/${idx}`));
      return;
    }

    if (typeof n === "object") {
      for (const k in n) {
        walk(n[k], `${path}/${k}`);
      }
      return;
    }
  }

  walk(node, basePath);
  return list;
}


/**
 * Collects all sheets with { email, password } – no matter how nested.
 */
function collectUsers(root) {
  const out = [];
  (function walk(n, path) {
    if (!n) return;
    if (typeof n === "object" && n !== null && "email" in n && "password" in n) {
      out.push({ path, email: String(n.email), password: String(n.password) });
      return;
    }
    if (Array.isArray(n)) { n.forEach((v,i)=>walk(v, `${path}/${i}`)); return; }
    if (typeof n === "object") { for (const k in n) walk(n[k], `${path}/${k}`); }
  })(root, "users");
  return out;
}


/**
 * Displays a message in the message box.
 * @param {string} message 
 * @param {HTMLElement} box 
 */
function showMessage(message, box) {
  box.textContent = message;
  box.style.color = "red";
}


/**
 * Clears any message from the message box.
 * @param {HTMLElement} box 
 */
function clearMessage(box) {
  box.textContent = "";
  box.style.color = "";
}


/**
 * Disables a button and applies loading state.
 * @param {HTMLButtonElement} button
 */
function disableButton(button) {
  button.disabled = true;
  button.classList.add("loading");
}


/**
 * Enables a button and removes loading state.
 * @param {HTMLButtonElement} button
 */
function enableButton(button) {
  button.disabled = false;
  button.classList.remove("loading");
}


/**
 * Starts a guest session with temporary demo user data.
 * @returns {Promise<void>}
 */
async function startGuestSession() {
  const guestId = `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const guestData = {
    name: "Guest",
    email: `guest_${Date.now()}@example.com`,
    password: "",
    guest: true
  };

  await fetch(`${BASE_URL}users/guests/${guestId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(guestData)
  });

  await preloadGuestContacts(`guests/${guestId}`);

  sessionStorage.setItem("showMobileGreeting", "1");

  localStorage.setItem("loggedInUserKey", `guests/${guestId}`);
  localStorage.setItem("guestMode", "true");

  window.location.href = "../index/summary.html";
}

/**
 * Preloads demo contacts for a guest user.
 * @param {string} userPath 
 * @returns {Promise<void>}
 */
async function preloadGuestContacts(userPath) {
  const contactsPath = `users/${userPath}/contacts`;

  for (const contact of demoContacts) {
    await fetch(`${BASE_URL}${contactsPath}.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact)
    });
  }
}


/**
 * Predefined demo contacts for guest users.
 * @type {Array<{ name: string, email: string, phone: string }>}
 */
const demoContacts = [
  { name: "Anna Becker", email: "anna@example.com", phone: "123456789", color: "#FF7A00" },
  { name: "Tom Meier", email: "tom@example.com", phone: "987654321", color: "#FF5EB3" },
  { name: "Lisa Schmidt", email: "lisa@example.com", phone: "555123456", color: "#6E52FF" },
  { name: "Peter Braun", email: "peter@example.com", phone: "333222111", color: "#9327FF" },
  { name: "Nina Keller", email: "nina@example.com", phone: "444555666", color: "#00BEE8" },
  { name: "Max Fischer", email: "max@example.com", phone: "666777888", color: "#00BEE8" },
  { name: "Julia König", email: "julia@example.com", phone: "777888999", color: "#FF745E" },
  { name: "Leon Wagner", email: "leon@example.com", phone: "111222333", color: "#FFA35E" },
  { name: "Emma Roth", email: "emma@example.com", phone: "222333444", color: "#FC71FF" },
  { name: "Paul Weber", email: "paul@example.com", phone: "999000111", color: "#FC71FF" }
];