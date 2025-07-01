// function initLogin() {
//   const form = document.querySelector('form');
//   const emailInput = document.getElementById('email');
//   const passwordInput = document.getElementById('password');
//   const loginButton = document.querySelector('.login-btn');
//   const messageBox = document.getElementById('msgBox');

//   form.addEventListener('submit', function (e) {
//     e.preventDefault();
//     clearMessage();

//     if (!validateLoginForm(emailInput.value, passwordInput.value)) {
//       showMessage('Bitte geben Sie gültige Login-Daten ein.');
//       return;
//     }

//     disableButton(loginButton);

//     // Simulated Login
//     setTimeout(() => {
//       const success = fakeLogin(emailInput.value, passwordInput.value);

//       if (!success) {
//         showMessage('E-Mail oder Passwort ist falsch.');
//         enableButton(loginButton);
//         return;
//       }

//       window.location.href = '../index/summary.html';
//     }, 1000);
//   });
// }

function initLogin() {
  const form = document.querySelector('form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginButton = document.querySelector('.login-btn');
  const messageBox = document.getElementById('msgBox');

  form.addEventListener('submit', async function (e) {
     e.preventDefault();
     clearMessage();

     const email = emailInput.value.trim();
     const password = passwordInput.value.trim();

     if (!validateLoginForm(email, password)) {
        showMessage("Bitte geben Sie gültige Login-Daten ein.");
        return;
     }

     disableButton(loginButton);

     const success = await fakeLogin(email, password);

     if (success) {
        window.location.href = "../index/summary.html";
     } else {
        showMessage("E-Mail oder Passwort ist falsch.");
        enableButton(loginButton);
     }
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

// async function fakeLogin(email, password) {
//   const response = await fetch(BASE_URL + "users.json");
//   const users = await response.json();
  
//   for (let userId in users) {
//      const user = users[userId];
//      if (user.email === email && user.password === password) {
//         return true;
//      }
//   }
//   return false;
// }

async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const users = await loadData("users");
    let found = false;

    for (let key in users) {
      const user = users[key];
      if (user.email === email && user.password === password) {
        found = true;
        window.location.href = "../index/summary.html";
        break;
      }
    }

    if (!found) {
      alert("Email oder Passwort falsch.");
    }
  } catch (error) {
    console.error(error);
    alert("Fehler beim Login.");
  }
}

window.addEventListener('DOMContentLoaded', initLogin);
