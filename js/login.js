function initLogin() {
  const form = document.querySelector('form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginButton = document.querySelector('.login-btn');
  const messageBox = document.getElementById('msgBox');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearMessage();

    if (!validateLoginForm(emailInput.value, passwordInput.value)) {
      showMessage('Bitte geben Sie gültige Login-Daten ein.');
      return;
    }

    disableButton(loginButton);

    // Simulated Login
    setTimeout(() => {
      const success = fakeLogin(emailInput.value, passwordInput.value);

      if (!success) {
        showMessage('E-Mail oder Passwort ist falsch.');
        enableButton(loginButton);
        return;
      }

      window.location.href = '../../index.html';
    }, 1000);
  });
}


/**
 * Validates login form fields.
 * @param {string} email
 * @param {string} password
 * @returns {boolean}
 */
function validateLoginForm(email, password) {
  return email.includes('@') && password.trim().length >= 4;
}


/**
 * Shows a message to the user.
 * @param {string} msg
 */
function showMessage(msg) {
  const box = document.getElementById('msgBox');
  box.textContent = msg;
}


/**
 * Clears message box.
 */
function clearMessage() {
  document.getElementById('msgBox').textContent = '';
}


/**
 * Disables a button element.
 * @param {HTMLElement} button
 */
function disableButton(button) {
  button.disabled = true;
  button.classList.add('loading');
}


/**
 * Enables a button element.
 * @param {HTMLElement} button
 */
function enableButton(button) {
  button.disabled = false;
  button.classList.remove('loading');
}


/**
 * Simulates login logic.
 * @param {string} email
 * @param {string} password
 * @returns {boolean}
 */
function fakeLogin(email, password) {
  return email === 'test@example.com' && password === 'test1234';
}

window.addEventListener('DOMContentLoaded', initLogin);
