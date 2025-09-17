/**
 * Regular expression for validating email addresses.
 * @type {RegExp}
 */

const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
const MIN_PASSWORD_LENGTH = 0;

document.addEventListener("DOMContentLoaded", initLogin);

/**
 * Initializes the login form: sets up input feedback, password masking, and event handlers.
 * @returns {void}
 */
function initLogin() {
  const elements = getLoginElements();
  setupLiveFeedback(elements);
  applyStarMaskToPassword(elements.passwordInput, elements.msgBox);
  bindLoginHandler(elements);
}

/**
 * Retrieves references to all relevant DOM elements for the login form.
 * @returns {{form:HTMLFormElement,emailInput:HTMLInputElement,passwordInput:HTMLInputElement,loginButton:HTMLButtonElement,msgBox:HTMLElement}}
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
 * @param {{emailInput:HTMLInputElement,passwordInput:HTMLInputElement,msgBox:HTMLElement}} param0
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
 * @param {{form:HTMLFormElement,emailInput:HTMLInputElement,passwordInput:HTMLInputElement,loginButton:HTMLButtonElement,msgBox:HTMLElement}} param0
 */
function bindLoginHandler({ form, emailInput, passwordInput, loginButton, msgBox }) {
  form.addEventListener("submit", (e) =>
    onSubmitLogin(e, { emailInput, passwordInput, loginButton, msgBox })
  );
}

/**
 * Handles login form submission flow.
 * @param {SubmitEvent} e
 * @param {{emailInput:HTMLInputElement,passwordInput:HTMLInputElement,loginButton:HTMLButtonElement,msgBox:HTMLElement}} ctx
 */
async function onSubmitLogin(e, { emailInput, passwordInput, loginButton, msgBox }) {
  e.preventDefault();
  clearMessage(msgBox);
  const email = emailInput.value.trim();
  const password = passwordInput.getRealPassword();
  if (!email || !password) return showMessage("Check your input. Please try again.", msgBox);
  disableButton(loginButton);
  const result = await login(email, password);
  if (result.success) {
    sessionStorage.setItem("showMobileGreeting", "1");
    window.location.href = "../index/summary.html";
  } else {
    showMessage("Check your input. Please try again.", msgBox);
    enableButton(loginButton);
  }
}

/**
 * Applies a star mask over the password field while keeping the real value.
 * Adds handlers for editing, syncing and toggling visibility.
 * @param {HTMLInputElement} passwordInput
 * @param {HTMLElement} msgBox
 */
function applyStarMaskToPassword(passwordInput, msgBox) {
  const state = { realPassword: "", visible: false };
  passwordInput.getRealPassword = () => state.realPassword;
  passwordInput.type = "text";
  if (passwordInput.value.length > 0) initializeMaskSync(passwordInput, msgBox, state);
  addBeforeInputMaskHandler(passwordInput, msgBox, state);
  addInputSyncHandler(passwordInput, msgBox, state);
  addClickToggleHandler(passwordInput, msgBox, state);
  scheduleInitialMaskSync(passwordInput, msgBox, state);
  clearMessage(msgBox);
}

/**
 * Initializes mask and visual state for prefilled passwords.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} msgBox
 * @param {{realPassword:string,visible:boolean}} state
 */
function initializeMaskSync(input, msgBox, state) {
  state.realPassword = input.value;
  updatePasswordField(input, state.realPassword, state.visible);
  updateVisualFeedback(input, msgBox, state.realPassword, state.visible);
}

/**
 * Adds handler for fine-grained text edits before input is applied.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} msgBox
 * @param {{realPassword:string,visible:boolean}} state
 */
function addBeforeInputMaskHandler(input, msgBox, state) {
  input.addEventListener("beforeinput", (e) => {
    state.realPassword = handlePasswordInput(e, state.realPassword, input, state.visible);
    updatePasswordField(input, state.realPassword, state.visible);
    updateCursorPosition(input, state.visible);
    updateVisualFeedback(input, msgBox, state.realPassword, state.visible);
  });
}

/**
 * Keeps mask in sync when input value changes unexpectedly.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} msgBox
 * @param {{realPassword:string,visible:boolean}} state
 */
function addInputSyncHandler(input, msgBox, state) {
  input.addEventListener("input", () => {
    if (input.value !== "*".repeat(state.realPassword.length)) {
      state.realPassword = input.value;
      updatePasswordField(input, state.realPassword, state.visible);
      updateVisualFeedback(input, msgBox, state.realPassword, state.visible);
    }
  });
}

/**
 * Toggles visibility when the icon area is clicked.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} msgBox
 * @param {{realPassword:string,visible:boolean}} state
 */
function addClickToggleHandler(input, msgBox, state) {
  input.addEventListener("click", (e) => {
    if (clickedToggleArea(e, input) && state.realPassword.length > 0) {
      state.visible = !state.visible;
      updatePasswordField(input, state.realPassword, state.visible);
      updateVisualFeedback(input, msgBox, state.realPassword, state.visible);
    }
  });
}

/**
 * Schedules a deferred mask sync for browser autofill cases.
 * @param {HTMLInputElement} input
 * @param {HTMLElement} msgBox
 * @param {{realPassword:string,visible:boolean}} state
 */
function scheduleInitialMaskSync(input, msgBox, state) {
  setTimeout(() => {
    state.realPassword = input.value;
    if (state.realPassword.length > 0) {
      updatePasswordField(input, state.realPassword, false);
      updateVisualFeedback(input, msgBox, state.realPassword, false);
    }
  }, 500);
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

/**
 * Attempts to log in using provided credentials.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{success:boolean,error?:string}>}
 */
async function login(email, password) {
  try {
    const users = await fetchUsers();
    const match = findUserByEmail(users, email);
    if (!match || !verifyPassword(match.user, password)) return { success: false, error: "wrong input" };
    localStorage.setItem("loggedInUserKey", match.key);
    return { success: true };
  } catch (err) {
    console.error("Login-Fehler:", err);
    return { success: false, error: "server-error" };
  }
}

/** Fetches all users JSON from backend. */
async function fetchUsers() {
  const response = await fetch(`${BASE_URL}users.json`);
  return response.json();
}

/** Finds the user by email in the users object. */
function findUserByEmail(users, email) {
  for (const [key, user] of Object.entries(users || {})) {
    if (user && user.email === email) return { key, user };
  }
  return null;
}

/** Verifies a user's password. */
function verifyPassword(user, password) {
  return user.password === password;
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
 * Starts a guest session: creates a transient user, preloads contacts, seeds tasks, redirects.
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
  await saveGuestRecord(guestId, guestData);
  await preloadGuestContacts(`guests/${guestId}`);
  setGuestSessionState(guestId);
  await seedUserTasksIfEmpty();
  window.location.href = "../index/summary.html";
}

/** Saves the guest user record in backend. */
async function saveGuestRecord(guestId, guestData) {
  await fetch(`${BASE_URL}users/guests/${guestId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(guestData)
  });
}

/** Sets local/session state for the newly created guest. */
function setGuestSessionState(guestId) {
  sessionStorage.setItem("showMobileGreeting", "1");
  const guestKey = `guests/${guestId}`;
  localStorage.setItem("loggedInUserKey", guestKey);
  localStorage.setItem("guestMode", "true");
  window.USERKEY = guestKey;
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