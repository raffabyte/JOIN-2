function setupEventListeners() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const msgBox = document.getElementById("msgBox");

  emailInput.addEventListener("input", () => clearInputError(emailInput, msgBox));
  passwordInput.addEventListener("input", () => clearInputError(passwordInput, msgBox));
}

function validateInput(email, password) {
  return email.trim() !== "" && password !== "";
}

function showInputError(inputs, msgBox, message) {
  msgBox.textContent = message;
  msgBox.style.color = "red";
  inputs.forEach(input => input.classList.add("input-error"));
}

function clearInputError(input, msgBox) {
  input.classList.remove("input-error");
  msgBox.textContent = "";
}

function findUser(users, email, password) {
  return Object.keys(users).find(
    key => users[key].email === email && users[key].password === password
  );
}

async function login(event) {
  event.preventDefault();

  const { emailInput, passwordInput, msgBox, email, password } = getLoginElements();

  resetUI(emailInput, passwordInput, msgBox);

  if (!validateInput(email, password)) {
    showInputError([emailInput, passwordInput], msgBox, "E-mail oder Passwort ist falsch");
    return;
  }

  try {
    const users = await loadData("users");
    const userKey = findUser(users, email, password);

    userKey
      ? redirectToSummary(userKey)
      : showInputError([emailInput, passwordInput], msgBox, "E-mail oder Passwort ist falsch");
  } catch {
    showInputError([emailInput, passwordInput], msgBox, "Fehler beim Login.");
  }
}

function getLoginElements() {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const msgBox = document.getElementById("msgBox");

  return {
    emailInput,
    passwordInput,
    msgBox,
    email: emailInput.value,
    password: passwordInput.value
  };
}

function resetUI(emailInput, passwordInput, msgBox) {
  emailInput.classList.remove("input-error");
  passwordInput.classList.remove("input-error");
  msgBox.textContent = "";
  msgBox.style.color = "";
}

function validateInput(email, password) {
  return email.trim() !== "" && password !== "";
}

function findUser(users, email, password) {
  return Object.keys(users).find(
    key => users[key].email === email && users[key].password === password
  );
}

function redirectToSummary(userKey) {
  localStorage.setItem("loggedInUserKey", userKey);
  window.location.href = "../index/summary.html";
}

window.addEventListener("DOMContentLoaded", setupEventListeners);

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