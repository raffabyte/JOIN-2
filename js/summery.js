/**
 * Dashboard / Summary page script
 * Uses global constants from main.js (window.BASE_URL & window.USERKEY).
 * Handles user greeting, task statistics, and overlay animation.
 */

const userKey = window.USERKEY || localStorage.getItem("loggedInUserKey");

(function guard() {
  if (typeof window.protectPageAccess === "function") {
    if (!window.protectPageAccess("../../index.html")) return;
  } else {
    if (!userKey) {
      window.location.href = "../../index.html";
      return;
    }
  }
})();

window.addEventListener("DOMContentLoaded", async () => {
  mobileOverlayFadeOut();
  addHeader();
  linkesNavMenuVersion();
  showHideHelpAndUser();
  await setUserInitials();
  await loadAndRenderTaskCounts();
  await init();
});

/**
 * Loads user data from Firebase.
 * @returns {Promise<Object>} User object from Firebase
 */
async function loadUserData() {
  const response = await fetch(`${window.BASE_URL}users/${userKey}.json`);
  const user = await response.json();
  return user || {};
}

/**
 * Initializes dashboard with username and greeting.
 * @returns {Promise<void>}
 */
async function init() {
  const user = await loadUserData();
  const formattedName = user.guest ? "" : formatName(user?.name || "Unknown User");

  ["userName", "userNameMobile"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = formattedName;
  });

  if (user.guest) {
    ["comma", "commaMobile"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = "";
    });
  }

  await showCurrentTime();
}

function setTextByIds(ids, text) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  });
}

/**
 * Displays the current greeting based on time of day.
 * @returns {Promise<void>}
 */
async function showCurrentTime() {
  const hour = new Date().getHours();
  const text =
    hour >= 5 && hour < 11 ? "Good morning" :
    hour >= 11 && hour < 17 ? "Good afternoon" :
    hour >= 17 && hour < 22 ? "Good evening" :
    "Good night";

  // Desktop + Mobile aktualisieren
  setTextByIds(["greetingText", "greetingTextMobile"], text);
}

/**
 * Formats a user's full name into proper case.
 * @param {string} name - The user's name
 * @returns {string} Formatted name
 */
function formatName(name) {
  return name
    .split(" ")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Loads tasks and renders the dashboard statistics.
 * @returns {Promise<void>}
 */
async function loadAndRenderTaskCounts() {
  try {
    const tasks = await fetchTasks();
    const { countByColumn, highPriorityCount, upcomingUrgentDates } = analyzeTasks(tasks);
    renderTaskCounts(countByColumn, tasks.length, highPriorityCount);
    renderNextDeadline(upcomingUrgentDates);
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}

/**
 * Fetches all tasks from Firebase.
 * @returns {Promise<Object[]>} Array of task objects
 */
async function fetchTasks() {
  const response = await fetch(`${window.BASE_URL}users/${userKey}/tasks.json`);
  const data = await response.json();
  return Object.values(data || {});
}

/**
 * Analyzes task statistics by column and priority.
 * @param {Object[]} tasks - Array of task objects
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
 * Increments task counters based on column type.
 * @param {Object} task - Task object
 * @param {{todo: number, inProgress: number, awaitFeedback: number, done: number}} countByColumn
 */
function countColumns(task, countByColumn) {
  switch (task.column) {
    case "todoColumn":          countByColumn.todo++; break;
    case "inProgressColumn":    countByColumn.inProgress++; break;
    case "awaitFeedbackColumn": countByColumn.awaitFeedback++; break;
    case "doneColumn":          countByColumn.done++; break;
  }
}

/**
 * Processes high-priority tasks and upcoming deadlines.
 * @param {Object} task - Task object
 * @param {{count: number}} highPriorityRef
 * @param {Date[]} datesArr - Array of upcoming urgent dates
 * @param {Date} today - Current date
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
 * Renders the task statistics into the dashboard UI.
 * @param {{todo: number, inProgress: number, awaitFeedback: number, done: number}} counts
 * @param {number} total - Total number of tasks
 * @param {number} highPriority - Total number of high-priority tasks
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
 * Displays the next upcoming deadline in the dashboard.
 * @param {Date[]} dates - Array of urgent deadlines
 */
function renderNextDeadline(dates) {
  const elem = document.getElementById("nextDeadlineDate");
  if (!elem) return;

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

/**
 * Handles the fade-out animation of the mobile greeting overlay.
 */
function mobileOverlayFadeOut() {
  const overlay = document.getElementById("MobileGreeting");
  if (!overlay) return;

  const shouldShow = sessionStorage.getItem("showMobileGreeting") === "1";
  if (!shouldShow) return;

  overlay.classList.remove("hidden");
  setTimeout(() => {
    overlay.classList.add("fade-out");
    setTimeout(() => {
      overlay.classList.add("hidden");
      sessionStorage.removeItem("showMobileGreeting");
    }, 1000);
  }, 1000);
}
