if (!USERKEY) {
  // Kein Benutzer eingeloggt → weiterleiten
  window.location.href = "../../index.html";
}

async function init() {
  await loadAndRenderTaskCounts();
}

/**
 * Lädt die Benutzerdaten aus Firebase.
 * @returns {Promise<Object>} Das Benutzerobjekt.
 */
async function loadUserData() {
  const response = await fetch(`${BASE_URL}users/${USERKEY}.json`);
  const user = await response.json();
  return user;
}

/**
 * Initialisiert Begrüßung und Benutzername im Dashboard.
 */
async function init() {
    const user = await loadUserData();

    if (user.guest) {
  // Gastnutzer → keinen Namen anzeigen
  document.getElementById("userName").innerText = "";
  document.getElementById("comma").innerHTML = "";
} else {
  const formattedName = formatName(user?.name || "Unknown User");
  document.getElementById("userName").innerText = formattedName;
}

await showCurrentTime();
}

/**
 * Zeigt die aktuelle Tageszeit-gerechte Begrüßung ("Good morning", etc.).
 */
async function showCurrentTime() {
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
  }
    
/**
 * Formatiert einen Namen auf Groß-/Kleinschreibung.
 * z. B. "max mustermann" → "Max Mustermann"
 * 
 * @param {string} name - Der Name des Benutzers.
 * @returns {string} Formatierter Name.
 */
function formatName(name) {
  return name
    .split(" ")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Lädt alle Aufgaben aus Firebase und rendert Statistiken.
 */
async function loadAndRenderTaskCounts() {
  try {
    const tasks = await fetchTasks();
    const { countByColumn, highPriorityCount, upcomingUrgentDates } = analyzeTasks(tasks);
    renderTaskCounts(countByColumn, tasks.length, highPriorityCount);
    renderNextDeadline(upcomingUrgentDates);
  } catch (error) {
    console.error("Fehler beim Laden der Aufgaben:", error);
  }
}

/**
 * Holt Aufgaben aus der Firebase-Datenbank.
 * @returns {Promise<Object[]>} Liste aller Aufgaben.
 */
async function fetchTasks() {
  const response = await fetch("https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks.json");
  const data = await response.json();
  return Object.values(data || {});
}

/**
 * Analysiert Aufgaben nach Status und Priorität.
 *
 * @param {Object[]} tasks - Alle geladenen Aufgaben.
 * @returns {{
 *   countByColumn: {todo: number, inProgress: number, awaitFeedback: number, done: number},
 *   highPriorityCount: number,
 *   upcomingUrgentDates: Date[]
 * }}
 */
function analyzeTasks(tasks) {
  const countByColumn = { todo: 0, inProgress: 0, awaitFeedback: 0, done: 0 };
  const highPriority = { count: 0 };
  const upcomingUrgentDates = [];
  const today = new Date();

  tasks.forEach(task => {
    countColumns(task, countByColumn);
    processPriority(task, highPriority, upcomingUrgentDates, today);
  });

  return { countByColumn, highPriorityCount: highPriority.count, upcomingUrgentDates };
}

/**
 * Erhöht den Zähler im passenden Aufgabenstatus.
 *
 * @param {Object} task - Eine Aufgabe.
 * @param {{todo: number, inProgress: number, awaitFeedback: number, done: number}} countByColumn
 */
function countColumns(task, countByColumn) {
  switch (task.column) {
    case "todoColumn": countByColumn.todo++; break;
    case "inProgressColumn": countByColumn.inProgress++; break;
    case "awaitFeedbackColumn": countByColumn.awaitFeedback++; break;
    case "doneColumn": countByColumn.done++; break;
  }
}

/**
 * Zählt hochpriorisierte Aufgaben und prüft auf bevorstehende Fälligkeiten.
 *
 * @param {Object} task - Eine Aufgabe.
 * @param {{count: number}} highPriorityRef - Referenzobjekt zum Hochzählen.
 * @param {Date[]} datesArr - Liste mit bevorstehenden Fälligkeitsdaten.
 * @param {Date} today - Das heutige Datum.
 */
function processPriority(task, highPriorityRef, datesArr, today) {
  if (task.priority === "HighPriority") {
    highPriorityRef.count++;
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      if (!isNaN(dueDate) && dueDate >= today) {
        datesArr.push(dueDate);
      }
    }
  }
}

/**
 * Rendert alle Aufgabenstatistiken im Dashboard.
 *
 * @param {{todo: number, inProgress: number, awaitFeedback: number, done: number}} counts
 * @param {number} total - Gesamtanzahl der Aufgaben.
 * @param {number} highPriority - Anzahl hochpriorisierter Aufgaben.
 */
function renderTaskCounts(counts, total, highPriority) {
  document.getElementById("ToDo").innerText = counts.todo;
  document.getElementById("tasksInProgress").innerText = counts.inProgress;
  document.getElementById("awaitingFeedback").innerText = counts.awaitFeedback;
  document.getElementById("Done").innerText = counts.done;
  document.getElementById("tasksinBoard").innerText = total;
  document.getElementById("highPriorityCount").innerText = highPriority;
}

/**
 * Zeigt das nächste Fälligkeitsdatum (wenn vorhanden) im Dashboard an.
 *
 * @param {Date[]} dates - Liste aller bevorstehenden Deadlines.
 */
function renderNextDeadline(dates) {
  const elem = document.getElementById("nextDeadlineDate");

  if (dates.length === 0) {
    elem.innerText = "No urgent deadlines";
    return;
  }

  const next = new Date(Math.min(...dates.map(date => date.getTime())));
  const formatted = next.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  elem.innerText = formatted;
}
