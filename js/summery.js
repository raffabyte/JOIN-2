if (!USERKEY) {
  window.location.href = "../../index.html";
}

mobileOverlayFadeOut()

window.addEventListener("DOMContentLoaded", async () => {
  addHeader();
  linkesNavMenuVersion();
  showHideHelpAndUser();
  await setUserInitials();
  await loadAndRenderTaskCounts()
  await init();
  
});

protectPageAccess(); // Funktion ist global verfügbar

/**
 * Loads user data from Firebase.
 * @returns {Promise<Object>}
 */
async function loadUserData() {
  const response = await fetch(`${BASE_URL}users/${USERKEY}.json`);
  const user = await response.json();
  return user;
}

/**
 * Initializes greeting and username in the dashboard.
 */
async function init() {
    const user = await loadUserData();

  if (user.guest) {
  document.getElementById("userNameMobile").innerText = "";
  document.getElementById("comma").innerHTML = "";
} else {
  const formattedName = formatName(user?.name || "Unknown User");
  document.getElementById("userNameMobile").innerText = formattedName;
}

await showCurrentTime();
}

/**
 * Shows the current time-of-day greeting.
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
 * Formats a name to match case.
 * @param {string} name 
 * @returns {string} 
 */
function formatName(name) {
  return name
    .split(" ")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Loads all tasks from Firebase and renders statistics.
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
 * Fetches tasks from the Firebase database.
 * @returns {Promise<Object[]>} 
 */
async function fetchTasks() {
  const response = await fetch("https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks.json");
  const data = await response.json();
  return Object.values(data || {});
}

/**
 * Analyzes tasks by status and priority
 * @param {Object[]} tasks 
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
 * Increases the counter in the matching task status.
 *
 * @param {Object} task
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
 * Counts high-priority tasks and checks for upcoming due dates.
 *
 * @param {Object} task
 * @param {{count: number}} highPriorityRef
 * @param {Date[]} datesArr 
 * @param {Date} today 
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
 * Renders all task statistics in the dashboard.
 *
 * @param {{todo: number, inProgress: number, awaitFeedback: number, done: number}} counts
 * @param {number} total 
 * @param {number} highPriority
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
 * Displays the next due date (if any) in the dashboard.
 * @param {Date[]} dates
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

function mobileOverlayFadeOut() {
  const overlay = document.getElementById("MobileGreeting");
  const shouldShow = sessionStorage.getItem("showMobileGreeting") === "1";
  if (shouldShow) {
    overlay.classList.remove("hidden")

    setTimeout(() => {
    overlay.classList.add("fade-out");

    setTimeout(() => {
      overlay.classList.add("hidden");
      sessionStorage.removeItem("showMobileGreeting");
    }, 1000);
  }, 1000);
  }
  else {
  }
}