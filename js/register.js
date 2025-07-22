/**
 * register2.js
 * Module for handling user registration: password masking, form validation, and submission.
 * Uses global postData function loaded via remoteStorage.js script tag.
 */

/**
 * @typedef {Object} PasswordState
 * @property {string} value - The unmasked password value.
 * @property {boolean} visible - Whether the password is currently visible.
 */

/** @type {Record<string, PasswordState>} */
const passwordStates = {
  password: { value: '', visible: false },
  password2: { value: '', visible: false },
};

// Demo contacts to preload for a new user
const demoContacts = [
  { name: 'Anna Becker', email: 'anna@example.com', phone: '123456789', color: '#FF7A00' },
  { name: 'Tom Meier',   email: 'tom@example.com',   phone: '987654321', color: '#9327FF' },
  { name: 'Lisa Schmidt', email: 'lisa@example.com',  phone: '555123456', color: '#6E52FF' },
  { name: 'Peter Braun',  email: 'peter@example.com', phone: '333222111', color: '#FC71FF' },
  { name: 'Nina Keller',  email: 'nina@example.com',  phone: '444555666', color: '#FFBB2B' },
  { name: 'Max Fischer',  email: 'max@example.com',   phone: '666777888', color: '#1FD7C1' },
  { name: 'Julia König',  email: 'julia@example.com',  phone: '777888999', color: '#462F8A' },
  { name: 'Leon Wagner',  email: 'leon@example.com',  phone: '111222333', color: '#FF4646' },
  { name: 'Emma Roth',    email: 'emma@example.com',  phone: '222333444', color: '#00BEE8' },
];

document.addEventListener('DOMContentLoaded', () => {
  initMaskedInputs();
  initPasswordToggles();
  setupLivePasswordValidation();
  bindFormSubmit();
});

/**
 * Binds the form submit event to the signUp handler.
 */
function bindFormSubmit() {
  const form = document.getElementById('signUpForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await signUp();
  });
}

/**
 * Attaches input and click listeners to password fields for masking behavior.
 */
function initMaskedInputs() {
  Object.keys(passwordStates).forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('input', () => handleInput(id, input));
    input.addEventListener('click', (e) => handleToggleClick(e, id, input));
    updateMask(id, input);
  });
}

/**
 * Sets up live validation for matching passwords.
 */
function setupLivePasswordValidation() {
  const pw1 = document.getElementById('password');
  const pw2 = document.getElementById('password2');
  const msg = document.getElementById('msgBox');
  if (!pw1 || !pw2 || !msg) return;

  pw2.addEventListener('input', () => {
    const val1 = pw1.dataset.real || '';
    const val2 = pw2.dataset.real || '';
    const match = val1 === val2;
    pw2.classList.toggle('input-error', !match);
    msg.textContent = match ? '' : 'Your passwords don’t match. Please try again.';
  });
}

/**
 * Attaches click listeners to eye icons for toggling visibility.
 */
function initPasswordToggles() {
  document.querySelectorAll('.toggle-password').forEach((icon) => {
    const target = icon.dataset.target;
    icon.addEventListener('click', () => togglePassword(target));
  });
}

/**
 * Toggles visibility of a password input.
 * @param {string} id - The ID of the password input element.
 */
function togglePassword(id) {
  const state = passwordStates[id];
  const input = document.getElementById(id);
  if (!state || !input) return;
  state.visible = !state.visible;
  updateMask(id, input);
}

/**
 * Handles click inside the masked input to detect eye-icon toggles.
 * @param {MouseEvent} e
 * @param {string} id
 * @param {HTMLInputElement} input
 */
function handleToggleClick(e, id, input) {
  const state = passwordStates[id];
  const rect = input.getBoundingClientRect();
  if (e.clientX > rect.right - 40 && state.value.length > 0) {
    state.visible = !state.visible;
    updateMask(id, input);
  }
}

/**
 * Updates the input display, toggles background icon, manages eye-icon visibility, and toggles actual text display.
 * @param {string} id
 * @param {HTMLInputElement} input
 */
function updateMask(id, input) {
  const state = passwordStates[id];
  // Display masked or plain text
  input.value = state.visible ? state.value : '*'.repeat(state.value.length);
  input.dataset.real = state.value;

  // Toggle lock-icon background only for password fields
  if (input.classList.contains('lock_icon')) {
    input.classList.toggle('no-bg-icon', state.visible);
  }

  // Toggle actual text visibility via CSS class
  input.classList.toggle('show-password', state.visible);

  // Toggle eye-icon visibility via CSS class
  const wrapper = input.closest('.password-wrapper');
  if (wrapper) {
    const svg = wrapper.querySelector('.toggle-password');
    if (svg) {
      svg.classList.toggle('visible', state.visible);
    }
  }
}


/**
 * Handles raw input to maintain actual password state while masking.
 * @param {string} id - The ID of the password input element.
 * @param {HTMLInputElement} input - The input element being typed into.
 */
function handleInput(id, input) {
  const state = passwordStates[id];
  const newLength = input.value.length;
  const lastChar = input.value.slice(-1);

  if (newLength < state.value.length) {
    state.value = state.value.slice(0, newLength);
  } else {
    state.value += lastChar;
  }

  input.dataset.real = state.value;
  updateMask(id, input);
}

/**
 * Retrieves the trimmed value of an input by ID.
 * @param {string} id
 * @returns {string}
 */
function getTrimmedValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/**
 * Retrieves the real password (unmasked) from data attribute.
 * @param {string} id
 * @returns {string}
 */
function getPassword(id) {
  const el = document.getElementById(id);
  return el ? el.dataset.real || '' : '';
}

/**
 * Clears any existing password mismatch error.
 */
function resetPasswordError() {
  const pw2 = document.getElementById('password2');
  const msg = document.getElementById('msgBox');
  if (pw2) pw2.classList.remove('input-error');
  if (msg) msg.textContent = '';
}

/**
 * Validates that two passwords match and shows error if not.
 * @param {string} pw1
 * @param {string} pw2
 * @returns {boolean}
 */
function validatePasswords(pw1, pw2) {
  if (pw1 === pw2) return true;
  const pw2El = document.getElementById('password2');
  const msg = document.getElementById('msgBox');
  if (pw2El) pw2El.classList.add('input-error');
  if (msg) msg.textContent = 'Your passwords don’t match. Please try again.';
  return false;
}

/**
 * Displays a full-screen success overlay, then redirects.
 */
function showSignUpSuccessOverlay() {
  const overlay = document.getElementById('signUpSuccess');
  if (!overlay) return;
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    window.location.href = '../../assets/index/login.html';
  }, 3000);
}

/**
 * Main sign-up flow: gathers input, validates, sends data, preloads contacts.
 */
async function signUp() {
  resetPasswordError();
  const name = getTrimmedValue('name');
  const email = getTrimmedValue('email');
  const password = getPassword('password');
  const password2 = getPassword('password2');
  const accept = document.getElementById('accept')?.checked;

  if (!validatePasswords(password, password2)) return;
  if (!accept) {
    alert('Please accept the privacy policy.');
    return;
  }

  try {
    const response = await postData('users', { name, email, password });
    const userKey = response.name;
    await preloadContacts(userKey);
    localStorage.setItem('loggedInUserKey', userKey);
    showSignUpSuccessOverlay();
  } catch (error) {
    console.error(error);
    alert('Es ist ein Fehler aufgetreten.');
  }
}

/**
 * Preloads demo contacts for a new user using global postData.
 * @param {string} userKey - The new user's key.
 */
async function preloadContacts(userKey) {
  for (const contact of demoContacts) {
    await postData(`users/${userKey}/contacts`, contact);
  }
}
