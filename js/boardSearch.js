/** Initializes search inputs and buttons on page load. */
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  const mobileInput = document.getElementById("searchInputMobile");
  const searchBtn = document.getElementById("searchButton");

  if (input) input.addEventListener("input", debounce(() => handleSearch("searchInput"), 300));
  if (mobileInput) mobileInput.addEventListener("input", debounce(() => handleSearch("searchInputMobile"), 300));
  if (searchBtn) searchBtn.addEventListener("click", () => handleSearch("searchInput"));
});


/** Handles the search query and triggers task filtering. */
function handleSearch(inputId = "searchInput") {
  const query = document
    .getElementById(inputId)
    ?.value.trim()
    .toLowerCase();
  if (!query) return window.updateBoard?.();
  fetchFilteredTasks(query);
}


/** Fetches tasks from Firebase and filters them by search query. */
function fetchFilteredTasks(query) {
  fetch(getUserTasksUrl())
    .then((r) => r.json())
    .then((data) => {
      const tasks = Object.entries(data || {}).map(([id, t]) => ({ ...t, id }));
      const result = tasks.filter(
        (t) =>
          t.title?.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query)
      );
      renderSearchResults(result);
    });
}


/** Renders filtered search results into their respective board columns. */
function renderSearchResults(tasks) {
  const columns = [
    { id: 'todoColumn', dragAreaId: 'toDoDragArea' },
    { id: 'inProgressColumn', dragAreaId: 'inProgressDragArea' },
    { id: 'awaitFeedbackColumn', dragAreaId: 'awaitingFeedbackDragArea' },
    { id: 'doneColumn', dragAreaId: 'doneDragArea' }
  ];

  columns.forEach(({ id, dragAreaId }) => {
    const column = document.getElementById(id);
    const columnTasks = tasks.filter(task => task.column === id);
    
    if (columnTasks.length === 0) {
      column.innerHTML = noTaskCardTemplate("found") + dragAreaTemplate(dragAreaId);
    } else {
      const tasksHTML = columnTasks.map(taskCardTemplate).join('');
      column.innerHTML = tasksHTML + dragAreaTemplate(dragAreaId);
    }
    
    const dragArea = document.getElementById(dragAreaId);
    if (dragArea) {
      column.ondrop = () => moveTo(id);
      column.ondragover = (e) => {
        allowDrop(e);
        highlight(dragAreaId);
      };
      column.ondragleave = () => removeHighlight(dragAreaId);
    }
  });
}


/** Checks if columns are empty after filtering and updates display. */
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


/** Inserts a no-match card if a column has no matching tasks. */
function insertNoMatchCardIfEmpty(colId, dragAreaId, tasks) {
  const colEl = document.getElementById(colId);
  const dragArea = document.getElementById(dragAreaId);
  const hasTasks = tasks.some((t) => t.column === colId);
  if (hasTasks) return;

  colEl.innerHTML = noTaskCardTemplate("found");
  if (dragArea) colEl.appendChild(dragArea);
}


/** Delays execution of a function to limit rapid firing. */
function debounce(fn, delay) {
  let to;
  return (...a) => {
    clearTimeout(to);
    to = setTimeout(() => fn(...a), delay);
  };
}


/** Clears both search inputs and resets the board view. */
function clearSearchInput() {
  const input = document.getElementById("searchInput");
  const mobileInput = document.getElementById("searchInputMobile");
  
  if (input) input.value = "";
  if (mobileInput) mobileInput.value = "";
  handleSearch();
}


/** Fetches all tasks from Firebase and updates the board columns. */
function fetchAllTasks() {
  fetch(getUserTasksUrl())
    .then((r) => r.json())
    .then((data) => {
      const tasks = Object.entries(data || {}).map(([id, t]) => ({ ...t, id }));
      window.updateColumns?.(tasks);
    });
}