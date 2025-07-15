document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('searchInput');
  if (!input) return;
  input.addEventListener('input', debounce(handleSearch, 300));
});

function handleSearch() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  if (!query) return window.updateBoard?.(); // wenn leer, alles neu laden
  fetch("https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/tasks.json")
    .then(r => r.json())
    .then(d => {
      const tasks = Object.entries(d || {}).map(([id, t]) => ({ ...t, id }));
      const result = tasks.filter(t =>
        t.title?.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query));
      window.updateColumns?.(result);
      window.checkEmptyFiltered?.(result);
    });
}

function debounce(fn, delay) {
  let to; return (...a) => {
    clearTimeout(to); to = setTimeout(() => fn(...a), delay);
  };
}
