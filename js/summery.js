window.addEventListener("DOMContentLoaded", async () => {
  addHeader();
  linkesNavMenuVersion();
  showHideHelpAndUser();
  await setUserInitials();
  await init();
  await loadAndRenderTaskCounts(); // 👈 Hier neu
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

async function loadAndRenderTaskCounts() {
  try {
    const response = await fetch("https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks.json");
    const data = await response.json();

    const tasks = Object.values(data || {});
    const countByColumn = {
      todo: 0,
      inProgress: 0,
      awaitFeedback: 0,
      done: 0
    };

    let highPriorityCount = 0;
    let upcomingUrgentDates = [];
    const today = new Date();

    tasks.forEach(task => {
      // Spalten zählen
      switch (task.column) {
        case "todoColumn":
          countByColumn.todo++;
          break;
        case "inProgressColumn":
          countByColumn.inProgress++;
          break;
        case "awaitFeedbackColumn":
          countByColumn.awaitFeedback++;
          break;
        case "doneColumn":
          countByColumn.done++;
          break;
      }

      // High Priority zählen + Deadline speichern
      if (task.priority === "HighPriority") {
        highPriorityCount++;

        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          if (dueDate >= today) {
            upcomingUrgentDates.push(dueDate);
          }
        }
      }
    });

    const totalTasks =
      countByColumn.todo +
      countByColumn.inProgress +
      countByColumn.awaitFeedback +
      countByColumn.done;

    // 🔢 Zähler aktualisieren
    document.getElementById("ToDo").innerText = countByColumn.todo;
    document.getElementById("tasksInProgress").innerText = countByColumn.inProgress;
    document.getElementById("awaitingFeedback").innerText = countByColumn.awaitFeedback;
    document.getElementById("Done").innerText = countByColumn.done;
    document.getElementById("tasksinBoard").innerText = totalTasks;
    document.getElementById("highPriorityCount").innerText = highPriorityCount;

    // 📅 Nächstes Urgent-Datum anzeigen
    if (upcomingUrgentDates.length > 0) {
      const timestamps = upcomingUrgentDates.map(date => date.getTime());
      const nextUrgentDeadline = new Date(Math.min(...timestamps));

      const formatted = nextUrgentDeadline.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      document.getElementById("nextDeadlineDate").innerText = formatted;
    } else {
      document.getElementById("nextDeadlineDate").innerText = "No urgent deadlines";
    }

  } catch (error) {
    console.error("Fehler beim Laden der Aufgaben:", error);
  }
}
