window.addEventListener("DOMContentLoaded", async () => {
  addHeader();
  linkesNavMenuVersion();
  showHideHelpAndUser();
  await init();
});

const userKey = localStorage.getItem("loggedInUserKey");

if (!userKey) {
  // Kein Benutzer eingeloggt → weiterleiten
  window.location.href = "../../index.html";
}

const BASE_URL =
  "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/";

async function loadUserData() {
  const response = await fetch(`${BASE_URL}users/${userKey}.json`);
  const user = await response.json();
  return user;
}
async function init() {
  try {
    const user = await loadUserData();

    // 1. Benutzernamen anzeigen
    const userNameElement = document.getElementById("userName");
    userNameElement.innerText = user?.name || "Unknown User";

    // 2. Begrüßung nach Uhrzeit anzeigen
    const greetingElement = document.getElementById("greeting");
    const hour = new Date().getHours();
    let greetingText = "";

    if (hour >= 5 && hour < 11) {
      greetingText = "Good morning,";
    } else if (hour >= 11 && hour < 17) {
      greetingText = "Good afternoon,";
    } else if (hour >= 17 && hour < 22) {
      greetingText = "Good evening,";
    } else {
      greetingText = "Good night,";
    }

    greetingElement.innerText = greetingText;
  } catch (error) {
    console.error("Fehler beim Laden der Benutzerdaten:", error);
    document.getElementById("userName").innerText = "Unknown User";
    document.getElementById("greeting").innerText = "Hello,";
  }
}
