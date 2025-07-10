// function initLogin() {
//   const form = document.querySelector('form');
//   const emailInput = document.getElementById('email');
//   const passwordInput = document.getElementById('password');
//   const loginButton = document.querySelector('.login-btn');
//   const messageBox = document.getElementById('msgBox');

//   form.addEventListener('submit', async function (e) {
//      e.preventDefault();
//      clearMessage();

//      const email = emailInput.value.trim();
//      const password = passwordInput.value.trim();

//      if (!validateLoginForm(email, password)) {
//         showMessage("Bitte geben Sie gültige Login-Daten ein.");
//         return;
//      }

//      disableButton(loginButton);

//      const success = await fakeLogin(email, password);

//      if (success) {
//         window.location.href = "../index/summary.html";
//      } else {
//         showMessage("E-Mail oder Passwort ist falsch.");
//         enableButton(loginButton);
//      }
//   });
// }


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
        localStorage.setItem("loggedInUserKey", key);
        window.location.href = "../index/summary.html";
        break;
      }
    }

    if (!found) {
      showMessage("Email oder Passwort falsch.");
    }
  } catch (error) {
    console.error(error);
    showMessage("Fehler beim Login.");
  }
}

window.addEventListener('DOMContentLoaded', initLogin);


async function startGuestSession() {
  const guestId = `guest_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  const guestData = {
    name: "Guest",
    email: `guest_${Date.now()}@example.com`,
    password: "",
    guest: true
  };

  // User speichern
  await fetch(`${BASE_URL}users/guests/${guestId}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(guestData)
  });

  // 🔽 Demo-Kontakte hinzufügen
  await preloadGuestContacts(`guests/${guestId}`);

  // Session merken
  localStorage.setItem("loggedInUserKey", `guests/${guestId}`);
  localStorage.setItem("guestMode", "true");

  // Weiterleitung
  window.location.href = "../index/summary.html";
}

async function preloadGuestContacts(userPath) {
  const contactsPath = `users/${userPath}/contacts`;

  for (const contact of demoContacts) {
    await fetch(`${BASE_URL}${contactsPath}.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(contact)
    });
  }
}

const demoContacts = [
  { name: "Anna Becker", email: "anna@example.com", phone: "123456789" },
  { name: "Tom Meier", email: "tom@example.com", phone: "987654321" },
  { name: "Lisa Schmidt", email: "lisa@example.com", phone: "555123456" },
  { name: "Peter Braun", email: "peter@example.com", phone: "333222111" },
  { name: "Nina Keller", email: "nina@example.com", phone: "444555666" },
  { name: "Max Fischer", email: "max@example.com", phone: "666777888" },
  { name: "Julia König", email: "julia@example.com", phone: "777888999" },
  { name: "Leon Wagner", email: "leon@example.com", phone: "111222333" },
  { name: "Emma Roth", email: "emma@example.com", phone: "222333444" },
  { name: "Paul Weber", email: "paul@example.com", phone: "999000111" }
];