/**
 * Dashboard / Summary page script
 * Uses global constants from main.js (window.BASE_URL & window.USERKEY).
 * Handles user greeting, task statistics, and overlay animation.
 *
 * Globals expected:
 * - window.BASE_URL (string): Firebase base URL ending with a trailing slash.
 * - window.USERKEY (string): Current user's key; alternatively taken from localStorage.
 */

/**
 * @typedef {Object} Task
 * @property {"todoColumn"|"inProgressColumn"|"awaitFeedbackColumn"|"doneColumn"} column
 * @property {"HighPriority"|"MediumPriority"|"LowPriority"} [priority]
 * @property {string} [dueDate] ISO date string (e.g., "2025-09-16")
 * @property {any} [id]
 * @property {any} [title]
 * @property {any} [description]
 */

/**
 * @typedef {Object} TaskCounts
 * @property {number} todo
 * @property {number} inProgress
 * @property {number} awaitFeedback
 * @property {number} done
 */

const userKey = window.USERKEY || localStorage.getItem("loggedInUserKey");

/**
 * Guards the page from unauthorized access.
 * If `window.protectPageAccess` exists, delegates to it; otherwise falls back
 * to redirecting to the login page when no userKey is present.
 *
 * @returns {void}
 */
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
  try {
    mobileOverlayFadeOut();
    addHeader();
    linkesNavMenuVersion();
    showHideHelpAndUser();

    // Ensure user name/initials are set before potentially longer task fetches
    await setUserInitials();
    await init();

    // Load task counts only after the user name is displayed and seeding is ensured
    await loadAndRenderTaskCounts();
  } catch (err) {
    console.error('Initialization error:', err);
  } finally {
    // Make the page visible once we've attempted to populate all fields
    try { document.body.style.visibility = 'visible'; } catch (e) { /* ignore */ }
  }
});

/**
 * Loads the current user's data from Firebase.
 * @returns {Promise<Object>} User object (empty object if not found)
 */
async function loadUserData() {
  const response = await fetch(`${window.BASE_URL}users/${userKey}.json`);
  const user = await response.json();
  return user || {};
}

/**
 * Initializes the dashboard with the user's formatted name and greeting.
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

/**
 * Sets the same text content for multiple element IDs.
 * Useful for keeping desktop and mobile UIs in sync.
 *
 * @param {string[]} ids - Element IDs
 * @param {string} text  - Text to set
 * @returns {void}
 */
function setTextByIds(ids, text) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  });
}

/**
 * Displays a greeting based on the current time of day.
 * @returns {Promise<void>}
 */
async function showCurrentTime() {
  const hour = new Date().getHours();
  const text =
    hour >= 5 && hour < 11 ? "Good morning" :
    hour >= 11 && hour < 17 ? "Good afternoon" :
    hour >= 17 && hour < 22 ? "Good evening" :
    "Good night";

  // Update desktop + mobile
  setTextByIds(["greetingText", "greetingTextMobile"], text);
}

/**
 * Formats a user's full name to Proper Case.
 * @param {string} name - User's name
 * @returns {string} Proper-cased name
 */
function formatName(name) {
  return name
    .split(" ")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Loads tasks and renders dashboard statistics (counts + next deadline).
 * Ensures seeding for new users if a seeding function is available.
 * @returns {Promise<void>}
 */
async function loadAndRenderTaskCounts() {
  try {
    // Ensure starter tasks are seeded for new users if available
    if (typeof seedUserTasksIfEmpty === 'function') await seedUserTasksIfEmpty();

    const tasks = await fetchTasks();
    const { countByColumn, highPriorityCount, upcomingUrgentDates } = analyzeTasks(tasks);
    renderTaskCounts(countByColumn, tasks.length, highPriorityCount);
    renderNextDeadline(upcomingUrgentDates);
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}

/**
 * Fetches all tasks for the current user from Firebase.
 * @returns {Promise<Task[]>} Array of tasks (empty array if none)
 */
async function fetchTasks() {
  const response = await fetch(`${window.BASE_URL}users/${userKey}/tasks.json`);
  const data = await response.json();
  return Object.values(data || {});
}

/**
 * Computes task statistics (counts by column, number of high-priority tasks,
 * and a list of upcoming high-priority due dates).
 *
 * @param {Task[]} tasks - Task array
 * @returns {{
 *   countByColumn: TaskCounts,
 *   highPriorityCount: number,
 *   upcomingUrgentDates: Date[]
 * }}
 */
function analyzeTasks(tasks) {
  /** @type {TaskCounts} */
  const countByColumn = { todo: 0, inProgress: 0, awaitFeedback: 0, done: 0 };
  const highPriority = { count: 0 };
  /** @type {Date[]} */
  const upcomingUrgentDates = [];
  const today = new Date();

  tasks.forEach(task => {
    countColumns(task, countByColumn);
    processPriority(task, highPriority, upcomingUrgentDates, today);
  });

  return { countByColumn, highPriorityCount: highPriority.count, upcomingUrgentDates };
}

/**
 * Increments counters based on the task's column.
 * @param {Task} task - Task to count
 * @param {TaskCounts} countByColumn - Accumulator for per-column counts
 * @returns {void}
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
 * Tracks high-priority tasks and collects upcoming due dates.
 * Only dates that are valid and on/after today are considered "upcoming".
 *
 * @param {Task} task - Task to inspect
 * @param {{count: number}} highPriorityRef - Mutable counter reference
 * @param {Date[]} datesArr - Collector for upcoming high-priority due dates
 * @param {Date} today - Current date used for comparison
 * @returns {void}
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
 * Renders the task statistics into the dashboard elements.
 * Expects the following element IDs to exist:
 *   "ToDo", "tasksInProgress", "awaitingFeedback", "Done",
 *   "tasksinBoard", "highPriorityCount"
 *
 * @param {TaskCounts} counts - Counts per board column
 * @param {number} total - Total number of tasks
 * @param {number} highPriority - Number of high-priority tasks
 * @returns {void}
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
 * Displays the next upcoming high-priority deadline, if any.
 * Writes "No urgent deadlines" if the list is empty.
 * Expects an element with ID "nextDeadlineDate".
 *
 * @param {Date[]} dates - Upcoming urgent deadlines
 * @returns {void}
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
 * Fades out the mobile greeting overlay after a short delay.
 * Requires an element with ID "MobileGreeting" and CSS classes "hidden" and "fade-out".
 *
 * Controlled by `sessionStorage.showMobileGreeting === "1"`.
 * Clears the storage flag after hiding the overlay.
 *
 * @returns {void}
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
