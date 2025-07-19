document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  if (!input) return;
  input.addEventListener("input", debounce(handleSearch, 300));
});

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchButton");

  if (input) input.addEventListener("input", debounce(handleSearch, 300));
  if (searchBtn) searchBtn.addEventListener("click", handleSearch);
});

function handleSearch() {
  const query = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();
  if (!query) return window.updateBoard?.();
  fetchFilteredTasks(query);
}

function fetchFilteredTasks(query) {
  fetch(
    "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks.json"
  )
    .then((r) => r.json())
    .then((data) => {
      const tasks = Object.entries(data || {}).map(([id, t]) => ({ ...t, id }));
      const result = tasks.filter(
        (t) =>
          t.title?.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
      window.updateColumns?.(result);
      checkEmptyFiltered(result);
    });
}

function checkEmptyFiltered(tasks) {
  const cols = [
    "todoColumn",
    "inProgressColumn",
    "awaitFeedbackColumn",
    "doneColumn",
  ];
  const ids = [
    "toDoDragArea",
    "inProgressDragArea",
    "awaitingFeedbackDragArea",
    "doneDragArea",
  ];

  cols.forEach((col, i) => insertNoMatchCardIfEmpty(col, ids[i], tasks));
}

function insertNoMatchCardIfEmpty(colId, dragAreaId, tasks) {
  const colEl = document.getElementById(colId);
  const dragArea = document.getElementById(dragAreaId);
  const hasTasks = tasks.some((t) => t.column === colId);
  if (hasTasks) return;

  colEl.innerHTML = `<div class="no-task-item flexR">No tasks found</div>`;
  if (dragArea) colEl.appendChild(dragArea);
}

function debounce(fn, delay) {
  let to;
  return (...a) => {
    clearTimeout(to);
    to = setTimeout(() => fn(...a), delay);
  };
}

function clearSearchInput() {
  const input = document.getElementById("searchInput");
  if (input) {
    input.value = "";
    handleSearch();
  }
}

function fetchAllTasks() {
  fetch(
    "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks.json"
  )
    .then((r) => r.json())
    .then((data) => {
      const tasks = Object.entries(data || {}).map(([id, t]) => ({ ...t, id }));
      window.updateColumns?.(tasks);
    });
}
