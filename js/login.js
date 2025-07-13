const emailRegex = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

document.addEventListener("DOMContentLoaded", initLogin);

function initLogin() {
  setupPasswordToggleOnIcon();
  const elements = getLoginElements();
  setupLiveFeedback(elements);
  bindLoginHandler(elements);
}

// 🔎 DOM-Elemente sammeln
function getLoginElements() {
  return {
    form: document.getElementById("loginForm"),
    emailInput: document.getElementById("email"),
    passwordInput: document.getElementById("password"),
    loginButton: document.querySelector(".login-btn"),
    msgBox: document.getElementById("msgBox"),
  };
}

// 🖐 Eingabe überwachen & Fehler zurücksetzen
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

// 🧠 Login-Event verknüpfen
function bindLoginHandler({ form, emailInput, passwordInput, loginButton, msgBox }) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessage(msgBox);

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const isValid = validateInputs(email, password, emailInput, passwordInput, msgBox);
    if (!isValid) return;

    disableButton(loginButton);
    const result = await login(email, password);

    if (result.success) {
      window.location.href = "../index/summary.html";
    } else {
      showLoginError(result.error, msgBox, emailInput, passwordInput);
      enableButton(loginButton);
    }
  });
}

// ✅ Eingabe validieren
function validateInputs(email, password, emailInput, passwordInput, msgBox) {
  let valid = true;

  if (!emailRegex.test(email)) {
    emailInput.classList.add("input-error");
    valid = false;
  }

  if (password.length < 4) {
    passwordInput.classList.add("input-error");
    valid = false;
  }

  if (!valid) {
    showMessage("Bitte geben Sie eine gültige Domain ein.", msgBox);
  }

  return valid;
}

// 📢 Fehlermeldung je nach Login-Ergebnis
function showLoginError(errorCode, msgBox, emailInput, passwordInput) {
  switch (errorCode) {
    case "email-not-found":
      showMessage("E-Mail ist nicht registriert.", msgBox);
      emailInput.classList.add("input-error");
      break;
    case "wrong-password":
      showMessage("Passwort ist falsch.", msgBox);
      passwordInput.classList.add("input-error");
      break;
    default:
      showMessage("Fehler beim Login.", msgBox);
  }
}

function setupPasswordToggleOnIcon() {
  const passwordInput = document.getElementById("password");

  // Zustand merken
  let visible = false;

  // Toggle durch Klick auf rechte Seite
  passwordInput.addEventListener("click", (e) => {
    const inputRect = passwordInput.getBoundingClientRect();
    const clickX = e.clientX;
  
    // Klick im rechten Iconbereich?
    if (clickX > inputRect.right - 40) {
      // Abbruch wenn Feld leer
      if (passwordInput.value.length === 0) return;
  
      visible = !visible;
      passwordInput.type = visible ? "text" : "password";
  
      passwordInput.classList.remove("lock_icon", "visibility_icon", "visibility_off_icon");
      passwordInput.classList.add(visible ? "visibility_icon" : "visibility_off_icon");
  
      e.preventDefault();
    }
  });
  

  // Beim Eintippen → Icon aktivieren
  passwordInput.addEventListener("input", () => {
    if (passwordInput.value.length > 0 && !visible) {
      passwordInput.classList.remove("lock_icon");
      passwordInput.classList.add("visibility_off_icon");
    } else if (passwordInput.value.length === 0) {
      passwordInput.classList.remove("visibility_icon", "visibility_off_icon");
      passwordInput.classList.add("lock_icon");
      passwordInput.type = "password";
      visible = false;
    }
  });
}



// 🔑 Login gegen Firebase-Datenbank
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

// 🧹 UI-Helfer
function showMessage(message, box) {
  box.textContent = message;
  box.style.color = "red";
}

function clearMessage(box) {
  box.textContent = "";
  box.style.color = "";
}

function disableButton(button) {
  button.disabled = true;
  button.classList.add("loading");
}

function enableButton(button) {
  button.disabled = false;
  button.classList.remove("loading");
}

// 👤 Gast-Login mit Demo-Daten
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

// 📋 Kontakte für Gast erstellen
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
