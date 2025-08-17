document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("searchInput");
  const mobileInput = document.getElementById("searchInputMobile");
  const searchBtn = document.getElementById("searchButton");

  if (input) input.addEventListener("input", debounce(() => handleSearch("searchInput"), 300));
  if (mobileInput) mobileInput.addEventListener("input", debounce(() => handleSearch("searchInputMobile"), 300));
  if (searchBtn) searchBtn.addEventListener("click", () => handleSearch("searchInput"));
});

function handleSearch(inputId = "searchInput") {
  const query = document
    .getElementById(inputId)
    ?.value.trim()
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
      renderSearchResults(result);
    });
}

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
      // Keine Tasks gefunden - zeige "No tasks found"
      column.innerHTML = noTaskCardTemplate("found") + dragAreaTemplate(dragAreaId);
    } else {
      // Tasks gefunden - zeige diese
      const tasksHTML = columnTasks.map(taskCardTemplate).join('');
      column.innerHTML = tasksHTML + dragAreaTemplate(dragAreaId);
    }
    
    // Setup event handlers für die Spalte
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

  colEl.innerHTML = noTaskCardTemplate("found");
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
  const mobileInput = document.getElementById("searchInputMobile");
  
  if (input) input.value = "";
  if (mobileInput) mobileInput.value = "";
  handleSearch();
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
