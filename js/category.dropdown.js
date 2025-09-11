(() => {
  const M = window.addTaskManager || (window.addTaskManager = { state:{}, elements:{} });
  if (M.__categoryInitDone) return;
  M.__categoryInitDone = true;

  // Fallback-Kategorien (falls Core keine gesetzt hat)
  M.state.categories = Array.isArray(M.state.categories) && M.state.categories.length
    ? M.state.categories
    : ["Technical Task", "User Story"];

  // DOM holen
  const q = (s) => document.querySelector(s);
  M.elements.categorySelector  = q(".dropdown.category-selector");
  M.elements.categoryInput     = q("#category-input");
  M.elements.categoryToggleBtn = q("#category-toggle-btn");
  M.elements.categoryOptions   = q("#category-options");
  if (!M.elements.categorySelector || !M.elements.categoryInput || !M.elements.categoryOptions) return;

  // Selection-only
  const input = M.elements.categoryInput;
  input.readOnly = true;
  input.setAttribute("role", "combobox");
  input.setAttribute("aria-autocomplete", "list");
  input.setAttribute("aria-expanded", "false");

  // Render: immer komplette Liste neu
  M._renderCategoryOptions = function () {
    const ul = M.elements.categoryOptions;
    const current = (input.value || "").trim().toLowerCase();
    ul.innerHTML = "";
    (M.state.categories || []).forEach((name) => {
      const li = document.createElement("li");
      li.className = "dropdown-option";
      li.setAttribute("role", "option");
      li.dataset.value = name;
      li.textContent = name;
      if (current && name.toLowerCase() === current) {
        li.classList.add("is-active");
        li.setAttribute("aria-selected", "true");
      }
      li.addEventListener("click", () => M._selectCategory(name));
      ul.appendChild(li);
    });
  };

  M._selectCategory = function (value) {
    input.value = value;
    if (typeof M._clearError === "function") M._clearError(input);
    M._closeCategoryDropdown();
  };

  M._openCategoryDropdown = function () {
    M._renderCategoryOptions();
    M.elements.categorySelector.classList.add("open");
    input.setAttribute("aria-expanded", "true");
  };

  M._closeCategoryDropdown = function () {
    M.elements.categorySelector.classList.remove("open");
    input.setAttribute("aria-expanded", "false");
  };

  // Toggle mit Debounce
  let _last = 0;
  const toggle = (e) => {
    e?.preventDefault?.();
    const now = performance.now();
    if (now - _last < 180) return;
    _last = now;
    const open = M.elements.categorySelector.classList.contains("open");
    open ? M._closeCategoryDropdown() : M._openCategoryDropdown();
  };

  // Events
  M.elements.categoryToggleBtn?.addEventListener("mousedown", toggle, { capture: true });
  input?.addEventListener("mousedown", toggle);

  input?.addEventListener("keydown", (e) => {
    if (["Enter", " ", "ArrowDown"].includes(e.key)) { e.preventDefault(); M._openCategoryDropdown(); }
    if (e.key === "Escape") { e.preventDefault(); M._closeCategoryDropdown(); }
  });

  document.addEventListener("mousedown", (e) => {
    if (!e.target.closest(".category-selector")) M._closeCategoryDropdown();
  });
})();

