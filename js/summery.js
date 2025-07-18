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
    

function formatName(name) {
  return name
    .split(" ")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

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

async function fetchTasks() {
  const response = await fetch("https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks.json");
  const data = await response.json();
  return Object.values(data || {});
}

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

function countColumns(task, countByColumn) {
  switch (task.column) {
    case "todoColumn": countByColumn.todo++; break;
    case "inProgressColumn": countByColumn.inProgress++; break;
    case "awaitFeedbackColumn": countByColumn.awaitFeedback++; break;
    case "doneColumn": countByColumn.done++; break;
  }
}

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

function renderTaskCounts(counts, total, highPriority) {
  document.getElementById("ToDo").innerText = counts.todo;
  document.getElementById("tasksInProgress").innerText = counts.inProgress;
  document.getElementById("awaitingFeedback").innerText = counts.awaitFeedback;
  document.getElementById("Done").innerText = counts.done;
  document.getElementById("tasksinBoard").innerText = total;
  document.getElementById("highPriorityCount").innerText = highPriority;
}

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
