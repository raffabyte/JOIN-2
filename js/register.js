const passwordStates = {
  password: { value: "", visible: false },
  password2: { value: "", visible: false },
};

document.addEventListener("DOMContentLoaded", () => {
  initMaskedInputs();
  initPasswordToggles();
  setupLivePasswordValidation();
});

function initMaskedInputs() {
  Object.keys(passwordStates).forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("input", () => handleInput(id, input));
    input.addEventListener("click", (e) => handleToggleClick(e, id, input));
    updateMask(id, input);
  });
}

function setupLivePasswordValidation() {
  const pw1 = document.getElementById("password");
  const pw2 = document.getElementById("password2");
  const msg = document.getElementById("msgBox");

  pw2.addEventListener("input", () => {
    const val1 = pw1.dataset.real || "";
    const val2 = pw2.dataset.real || "";

    const match = val1 === val2;
    pw2.classList.toggle("input-error", !match);
    msg.textContent = match
      ? ""
      : "Your passwords don’t match. Please try again.";
  });
}

function initPasswordToggles() {
  document.querySelectorAll(".toggle-password").forEach((icon) => {
    icon.addEventListener("click", () => togglePassword(icon.dataset.target));
  });
}

function togglePassword(id) {
  const state = passwordStates[id];
  const input = document.getElementById(id);
  state.visible = !state.visible;
  updateMask(id, input);
}

function handleToggleClick(e, id, input) {
  const s = passwordStates[id];
  const r = input.getBoundingClientRect();
  if (e.clientX > r.right - 40 && s.value.length > 0) {
    s.visible = !s.visible;
    updateMask(id, input);
  }
}

function updateMask(id, input) {
  const state = passwordStates[id];
  input.value = state.visible ? state.value : "*".repeat(state.value.length);
  input.dataset.real = state.value;
}

async function signUp() {
  const name = getTrimmedValue("name");
  const email = getTrimmedValue("email");
  const password = getPassword("password");
  const password2 = getPassword("password2");
  const accept = document.getElementById("accept").checked;
  resetPasswordError();

  if (!validatePasswords(password, password2)) return;
  if (!accept) return alert("Please accept the privacy policy.");

  const userData = { name, email, password };
  try {
    const response = await postData("users", userData);
    const userKey = response.name;
    await preloadContacts(userKey);
    localStorage.setItem("loggedInUserKey", userKey);
    showSignUpSuccessOverlay();
  } catch (error) {
    console.error(error);
    alert("Es ist ein Fehler aufgetreten.");
  }
}

function getTrimmedValue(id) {
  return document.getElementById(id).value.trim();
}

function getPassword(id) {
  return document.getElementById(id).dataset.real || "";
}

function resetPasswordError() {
  const msgBox = document.getElementById("msgBox");
  const input = document.getElementById("password2");
  input.classList.remove("input-error");
  msgBox.textContent = "";
}

function validatePasswords(pw1, pw2) {
  if (pw1 === pw2) return true;
  const msgBox = document.getElementById("msgBox");
  const input = document.getElementById("password2");
  input.classList.add("input-error");
  msgBox.textContent = "Your passwords don’t match. Please try again.";
  return false;
}

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

function showSignUpSuccessOverlay() {
  const overlay = document.getElementById("signUpSuccess");
  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";
  setTimeout(() => {
    overlay.style.display = "none";
    document.body.style.overflow = "";
    window.location.href = "../../assets/index/login.html";
  }, 3000);
}

async function preloadContacts(userKey) {
  const contactsPath = `users/${userKey}/contacts`;
  for (const contact of demoContacts) {
    await fetch(`${BASE_URL}${contactsPath}.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
    });
  }
}

const demoContacts = [
  {
    name: "Anna Becker",
    email: "anna@example.com",
    phone: "123456789",
    color: "#FF7A00",
  },
  {
    name: "Tom Meier",
    email: "tom@example.com",
    phone: "987654321",
    color: "#9327FF",
  },
  {
    name: "Lisa Schmidt",
    email: "lisa@example.com",
    phone: "555123456",
    color: "#6E52FF",
  },
  {
    name: "Peter Braun",
    email: "peter@example.com",
    phone: "333222111",
    color: "#FC71FF",
  },
  {
    name: "Nina Keller",
    email: "nina@example.com",
    phone: "444555666",
    color: "#FFBB2B",
  },
  {
    name: "Max Fischer",
    email: "max@example.com",
    phone: "666777888",
    color: "#1FD7C1",
  },
  {
    name: "Julia König",
    email: "julia@example.com",
    phone: "777888999",
    color: "#462F8A",
  },
  {
    name: "Leon Wagner",
    email: "leon@example.com",
    phone: "111222333",
    color: "#FF4646",
  },
  {
    name: "Emma Roth",
    email: "emma@example.com",
    phone: "222333444",
    color: "#00BEE8",
  },
];
