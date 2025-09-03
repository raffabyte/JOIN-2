/**
 * Regular expression for validating email addresses.
 * @type {RegExp}
 */

const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

document.addEventListener("DOMContentLoaded", initLogin);

/**
 * Initializes the login form: sets up input feedback,
 * password masking, and event handlers.
 */
function initLogin() {
  const elements = getLoginElements();
  setupLiveFeedback(elements);
  applyStarMaskToPassword(elements.passwordInput, elements.msgBox);
  bindLoginHandler(elements);
}

/**
 * Retrieves references to all relevant DOM elements for the login form.
 * @returns {Object} An object containing form and input elements.
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
 * @param {Object} param0 - Destructured email and password inputs and the message box.
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
 * @param {Object} param0 - Destructured elements needed for login.
 */

function bindLoginHandler({ form, emailInput, passwordInput, loginButton, msgBox }) {
  form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessage(msgBox);

  const email = emailInput.value.trim();
  const password = passwordInput.getRealPassword().trim();

  const isValid = validateInputs(email, password, emailInput, passwordInput, msgBox);
  if (!isValid) return;

  disableButton(loginButton);
  const result = await login(email, password);

  if (result.success) {
    sessionStorage.setItem("showMobileGreeting", "1");
    window.location.href = "../index/summary.html";
  } else {
    showLoginError(result.error, msgBox, emailInput, passwordInput);
    enableButton(loginButton);
  }
});
}

/**
 * Validates the user inputs for login.
 * @param {string} email - The entered email address.
 * @param {string} password - The entered password.
 * @param {HTMLInputElement} emailInput
 * @param {HTMLInputElement} passwordInput
 * @param {HTMLElement} msgBox - The message box element for feedback.
 * @returns {boolean} True if inputs are valid, false otherwise.
 */
function validateInputs(email, password, emailInput, passwordInput, msgBox) {
  let valid = true;

  if (!emailRegex.test(email)) {
    emailInput.classList.add("input-error");
    showMessage("Check your email. Please try again.", msgBox);
    valid = false;
  }

  if (password.length < 4) {
    passwordInput.classList.add("input-error");
    showMessage("Check your password. Please try again.", msgBox);
    valid = false;
  }

  return valid;
}

/**
 * Displays login error messages based on the error code.
 * @param {string} errorCode - The error type (e.g., "wrong-password").
 * @param {HTMLElement} msgBox
 * @param {HTMLInputElement} emailInput
 * @param {HTMLInputElement} passwordInput
 */

function showLoginError(errorCode, msgBox, emailInput, passwordInput) {
  switch (errorCode) {
    case "email-not-found":
      showMessage("Check your email and password. Please try again.", msgBox);
      emailInput.classList.add("input-error");
      break;
    case "wrong-password":
      showMessage("Check your email and password. Please try again.", msgBox);
      passwordInput.classList.add("input-error");
      break;
    default:
      showMessage("Login error.", msgBox);
  }
}

/**
 * Displays login error messages based on the error code.
 * @param {string} errorCode - The error type (e.g., "wrong-password").
 * @param {HTMLElement} msgBox
 * @param {HTMLInputElement} emailInput
 * @param {HTMLInputElement} passwordInput
 */

function applyStarMaskToPassword(passwordInput, msgBox) {
  let realPassword = "";
  let visible = false;

  passwordInput.getRealPassword = () => realPassword;
  passwordInput.type = "text";

  // Fallback bei Autovervollständigung oder Copy-Paste
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

  // 🔁 Fallback bei Copy/Paste, Autofill oder Änderungen nachträglich
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
  }, 500); // Verzögerung, damit Autofill durch ist

  clearMessage(msgBox);
}

/**
 * Handles manual user input in the password field to update the real password.
 * @param {InputEvent} e - The input event.
 * @param {string} realPassword - The actual password.
 * @param {HTMLInputElement} input - The password input element.
 * @param {boolean} visible - Whether the password is currently visible.
 * @returns {string} Updated password string.
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

  e.preventDefault(); // verhindert native Anzeige
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
 * @returns {boolean} True if toggle area was clicked.
 */

function clickedToggleArea(e, input) {
  const rect = input.getBoundingClientRect();
  return e.clientX > rect.right - 40;
}

/**
 * Attempts to log the user in by verifying credentials against Firebase.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, error?: string }>} Result of the login attempt.
 */

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

    if (!userFound) return { success: false, error: "email-not-found" };
    if (userFound.user.password !== password) return { success: false, error: "wrong-password" };

    localStorage.setItem("loggedInUserKey", userFound.key);
    return { success: true };
  } catch (err) {
    console.error("Login-Fehler:", err);
    return { success: false, error: "server-error" };
  }
}

/**
 * Displays a message in the message box.
 * @param {string} message - The message to show.
 * @param {HTMLElement} box - The message box element.
 */

function showMessage(message, box) {
  box.textContent = message;
  box.style.color = "red";
}

/**
 * Clears any message from the message box.
 * @param {HTMLElement} box - The message box to clear.
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

  localStorage.setItem("loggedInUserKey", `guests/${guestId}`);
  localStorage.setItem("guestMode", "true");

  window.location.href = "../index/summary.html";
}

/**
 * Preloads demo contacts for a guest user.
 * @param {string} userPath - Path in the database where contacts should be stored.
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
