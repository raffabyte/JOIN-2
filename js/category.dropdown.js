(() => {
  const M = window.addTaskManager || (window.addTaskManager = {state:{},elements:{}});
  if (M.__categoryInitDone) return; M.__categoryInitDone = true;

  
  // Default-Categories
  M.state.categories = M.state.categories?.length ? M.state.categories : ["Technical Task","User Story"];


  // DOM
  const q = s=>document.querySelector(s);
  M.elements.categorySelector  = q(".dropdown.category-selector");
  M.elements.categoryInput     = q("#category-input");
  M.elements.categoryToggleBtn = q("#category-toggle-btn");
  M.elements.categoryOptions   = q("#category-options");
  if (!M.elements.categorySelector || !M.elements.categoryInput || !M.elements.categoryOptions) return;


  // Capture-Guard
  document.addEventListener('click', e=>{
    const inside = e.target.closest('.category-selector');
    const toggle = e.target.closest('#category-toggle-btn');
    const li = e.target.closest('#category-options li');
    if (inside && !toggle && !li) e.stopImmediatePropagation();
  },true);

  const input = M.elements.categoryInput;
  input.readOnly = true; input.setAttribute("role","combobox");
  input.setAttribute("aria-autocomplete","list"); input.setAttribute("aria-expanded","false");


  // Render Optionen
M._renderCategoryOptions = function () {
  const ul = M.elements.categoryOptions;
  const current = (M.elements.categoryInput.value || "").trim().toLowerCase();
  ul.innerHTML = "";
  (M.state.categories || []).forEach(name => {
    const li = document.createElement("li");
    li.className = "dropdown-option";
    li.setAttribute("role","option");
    li.dataset.value = name;
    li.textContent = name;
    li.classList.toggle("is-active", current && name.toLowerCase()===current);
    li.addEventListener("click", () => {
      M.elements.categoryInput.value = name;
      if(typeof M._clearError==="function") M._clearError(M.elements.categoryInput);
      M._closeCategoryDropdown();
    });
    ul.appendChild(li);
  });
};


  M._selectCategory = value=>{
    input.value = value; if(M._clearError) M._clearError(input);
    M._closeCategoryDropdown();
  };


M._openCategoryDropdown = function() {
  M._renderCategoryOptions();
  M.elements.categoryOptions.classList.remove("display-none");
  M.elements.categorySelector.classList.add("open");
  M.elements.categoryInput.setAttribute("aria-expanded","true");
};


M._closeCategoryDropdown = function() {
  M.elements.categoryOptions.classList.add("display-none");
  M.elements.categorySelector.classList.remove("open");
  M.elements.categoryInput.setAttribute("aria-expanded","false");
};


  // Toggle with debounce
  let _lastToggle=0;
  const toggle = e=>{
    e?.preventDefault?.();
    const now=performance.now(); if(now-_lastToggle<180) return; _lastToggle=now;
    M.elements.categorySelector.classList.contains("open") ? M._closeCategoryDropdown() : M._openCategoryDropdown();
  };

  M.elements.categoryToggleBtn.addEventListener("click",toggle);
  M.elements.categoryInput.addEventListener("click", ()=>M._openCategoryDropdown());
})();


// --- Category "owned": blocks global Dropdown-Handler ---
document.addEventListener('click', (e)=> {
  const root = e.target.closest('.category-selector');
  if (!root) return;                       
  e.preventDefault(); e.stopImmediatePropagation(); 

  const M = window.addTaskManager, ul = M?.elements?.categoryOptions, input = M?.elements?.categoryInput;
  if (!M || !ul || !input) return;

  const onToggle = e.target.closest('#category-toggle-btn') || e.target === input;
  const onItem   = e.target.closest('#category-options li');

  if (onToggle) {                          
    const open = root.classList.contains('open');
    open ? M._closeCategoryDropdown() : M._openCategoryDropdown();
    return;
  }
  if (onItem) {                            
    const value = onItem.dataset.value || onItem.textContent.trim();
    input.value = value;
    if (typeof M._clearError === 'function') M._clearError(input);
    M._closeCategoryDropdown();
  }
}, true); 



