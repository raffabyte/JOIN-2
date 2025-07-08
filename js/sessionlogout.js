/**
 * Testversuch für Logoutverhalten. Prüft beim Seitenaufruf und beim Zurück-Navigieren den Login-Status.
 */
export function checkLoginStatus() {
  const redirectIfNotLoggedIn = () => {
    const userKey = localStorage.getItem("loggedInUserKey");
    if (!userKey) {
      window.location.replace("../login/login.html");
    }
  };

  // Beim regulären Laden prüfen
  window.addEventListener("DOMContentLoaded", redirectIfNotLoggedIn);

  // Beim Zurück-Navigieren prüfen (bfcache!)
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      redirectIfNotLoggedIn();
    }
  });
}

/**
 * Führt Logout beim Schließen des Tabs/Fensters durch (optional).
 */
export function sessionLogout() {
  window.addEventListener("beforeunload", () => {
    localStorage.removeItem("loggedInUserKey");
    localStorage.removeItem("guestMode");
  });
}

/**
 * Logout über Dropdown-Menü – NICHT für Gäste löschen!
 */
export async function logoutDropdown() {
  const isGuest = localStorage.getItem("guestMode") === "true";
  const userKey = localStorage.getItem("loggedInUserKey");

  if (isGuest && userKey) {
    await fetch(`https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/users/${userKey}.json`, {
      method: "DELETE",
    });
  }

  localStorage.clear();
  window.location.replace("../login/login.html");
}
