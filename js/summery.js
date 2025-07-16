window.addEventListener("DOMContentLoaded", async () => {
  addHeader();
  linkesNavMenuVersion();
  showHideHelpAndUser();
  await setUserInitials();
  await init();
  renderTaskCounts()
});

if (!USERKEY) {
  // Kein Benutzer eingeloggt → weiterleiten
  window.location.href = "../../index.html";
}

async function loadUserData() {
  const response = await fetch(`${BASE_URL}users/${USERKEY}.json`);
  const user = await response.json();
  return user;
}

async function init() {
  try {
    const user = await loadUserData();

    if (user.guest) {
  // Gastnutzer → keinen Namen anzeigen
  document.getElementById("userName").innerText = "";
  document.getElementById("comma").innerHTML = "";
} else {
  const formattedName = formatName(user?.name || "Unknown User");
  document.getElementById("userName").innerText = formattedName;
}

    // 2. Begrüßung nach Uhrzeit anzeigen
    const greetingElement = document.getElementById("greetingText");
    const hour = new Date().getHours();
    let greetingText = "";

    if (hour >= 5 && hour < 11) {
      greetingText = "Good morning";
    } else if (hour >= 11 && hour < 17) {
      greetingText = "Good afternoon";
    } else if (hour >= 17 && hour < 22) {
      greetingText = "Good evening";
    } else {
      greetingText = "Good night";
    }

    greetingElement.innerText = greetingText;
  } catch (error) {
    console.error("Fehler beim Laden der Benutzerdaten:", error);
    document.getElementById("userName").innerText = "Unknown User";
    document.getElementById("greeting").innerText = "Hello,";
  }
}

function formatName(name) {
  return name
    .split(" ")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function renderTaskCounts() {
  const counts = JSON.parse(localStorage.getItem("taskCounts")) || {
    todo: 0,
    inProgress: 0,
    awaitFeedback: 0,
    done: 0
  };

  const totalTasks =
    counts.todo +
    counts.inProgress +
    counts.awaitFeedback +
    counts.done;

  document.getElementById("ToDo").innerText = counts.todo;
  document.getElementById("tasksInProgress").innerText = counts.inProgress;
  document.getElementById("awaitingFeedback").innerText = counts.awaitFeedback;
  document.getElementById("Done").innerText = counts.done;
  document.getElementById("tasksinBoard").innerText = totalTasks;
}