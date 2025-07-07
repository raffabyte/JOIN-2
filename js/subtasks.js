function initSubtaskControls() {
  const elements = {
    input: document.getElementById("subtasks"),
    list: document.getElementById("subtask-list"),
    plusBtn: document.getElementById("subtaskPlusBtn"),
    clearBtn: document.querySelector(".cancel-subtask-button"),
    confirmBtn: document.querySelector(".add-subtask-button"),
    addCancelBtns: document.getElementById("addCancelBtns"),
  };

  if (
    !elements.input ||
    !elements.list ||
    !elements.clearBtn ||
    !elements.confirmBtn ||
    !elements.plusBtn
  ) {
    console.warn("❗ Eines der Subtask-Elemente wurde nicht gefunden!");
    return;
  }

  addSubtaskEventListeners(elements);
  elements.plusBtn.addEventListener("click", () => elements.input.focus());
}

function addSubtaskEventListeners(elements) {
  elements.input.addEventListener("focus", () => showAddCancelBtns(elements));
  elements.input.addEventListener("input", () => {
    if (elements.input.value.trim() === "") hideAddCancelBtns(elements);
  });
  elements.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubtaskAddition(elements);
    }
  });
  elements.clearBtn.addEventListener("click", () =>
    clearSubtaskInput(elements)
  );
  elements.confirmBtn.addEventListener("click", () =>
    handleSubtaskAddition(elements)
  );
}

function showAddCancelBtns(elements) {
  elements.addCancelBtns.classList.remove("display-none");
}

function hideAddCancelBtns(elements) {
  elements.addCancelBtns.classList.add("display-none");
}

function handleSubtaskAddition(elements) {
  const text = elements.input.value.trim();
  if (!text) return;

  if (elements.list.children.length >= 10) {
    alert("Maximum of 10 subtasks reached.");
    return;
  }

  createAndAppendSubtask(text, elements.list);
  clearSubtaskInput(elements);
  elements.input.focus();
}

function clearSubtaskInput(elements) {
  elements.input.value = "";
  hideAddCancelBtns(elements);
}

function createAndAppendSubtask(text, list) {
  const li = document.createElement("li");
  li.innerHTML = `
        <span class="subtask-text">${text}</span>
    `;
  const actions = createDefaultActions(li);
  li.appendChild(actions);
  list.appendChild(li);
}

function enableSubtaskEditing(li) {
  li.classList.add("editing");

  const oldSpan = li.querySelector(".subtask-text");
  const oldActions = li.querySelector(".subtask-actions");
  const currentText = oldSpan.textContent;

  const input = createEditInput(currentText);
  li.replaceChild(input, oldSpan);
  li.removeChild(oldActions);

  const newActions = createEditActions(input, li, oldSpan);
  li.appendChild(newActions);
  input.focus();
  attachEditInputEvents(input, li, oldSpan, newActions);
}

function createEditInput(text) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = text;
  input.className = "edit-subtask-input";
  return input;
}

function createEditActions(input, li, oldSpan) {
  const container = document.createElement("div");
  container.className = "subtask-edit-actions";

  const deleteBtn = createSvgButton(deleteSVG, "delete-icon", () =>
    li.remove()
  );
  const checkBtn = createSvgButton(checkSVG, "check-icon", () =>
    saveSubtaskEdit(input, li, container)
  );
  const divider = document.createElement("span");
  divider.className = "icon-divider";
  divider.textContent = "|";

  container.append(deleteBtn, divider, checkBtn);
  return container;
}

function attachEditInputEvents(input, li, oldSpan, actions) {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveSubtaskEdit(input, li, actions);
    if (e.key === "Escape") cancelSubtaskEdit(input, li, oldSpan, actions);
  });

  input.addEventListener("blur", () => {
    setTimeout(() => {
      if (document.body.contains(input)) {
        saveSubtaskEdit(input, li, actions);
      }
    }, 150);
  });
}

function saveSubtaskEdit(input, li, actionsContainer) {
  li.classList.remove("editing");
  const newText = input.value.trim();
  if (!newText) return;

  const newSpan = document.createElement("span");
  newSpan.className = "subtask-text";
  newSpan.textContent = newText;

  li.replaceChild(newSpan, input);
  if (actionsContainer && li.contains(actionsContainer)) {
    li.removeChild(actionsContainer);
  }
  li.appendChild(createDefaultActions(li));
}

function cancelSubtaskEdit(input, li, oldSpan, actionsContainer) {
  li.replaceChild(oldSpan, input);
  li.removeChild(actionsContainer);
  li.appendChild(createDefaultActions(li));
  li.classList.remove("editing");
}

function createDefaultActions(li) {
  const container = document.createElement("div");
  container.className = "subtask-actions";
  const editBtn = createSvgButton(editSVG, "edit-btn", () =>
    enableSubtaskEditing(li)
  );
  const deleteBtn = createSvgButton(deleteSVG, "delete-btn", () => li.remove());
  const divider = document.createElement("span");
  divider.className = "icon-divider";
  divider.textContent = "|";

  container.append(editBtn, divider, deleteBtn);
  return container;
}

function createSvgButton(svgMarkup, className, onClick) {
  const btn = document.createElement("button");
  btn.className = `overlay-button ${className}`;
  btn.innerHTML = svgMarkup;
  btn.addEventListener("click", onClick);
  return btn;
}

/* SVGs */
const editSVG = `
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 10.6667V14H5.33333L13.3333 6L10 2.66667L2 10.6667Z" stroke="#2A3647" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const deleteSVG = `
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 4H14M6 7V11M10 7V11M5 4L5.33333 2.66667H10.6667L11 4M6 14H10C10.5304 14 11.0391 13.7893 11.4142 13.4142C11.7893 13.0391 12 12.5304 12 12V4H4V12C4 12.5304 4.21071 13.0391 4.58579 13.4142C4.96086 13.7893 5.46957 14 6 14Z" stroke="#2A3647" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;

const checkSVG = `
<svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.79911 9.15L14.2741 0.675C14.4741 0.475 14.7116 0.375 14.9866 0.375C15.2616 0.375 15.4991 0.475 15.6991 0.675C15.8991 0.875 15.9991 1.1125 15.9991 1.3875C15.9991 1.6625 15.8991 1.9 15.6991 2.1L6.49911 11.3C6.29911 11.5 6.06578 11.6 5.79911 11.6C5.53245 11.6 5.29911 11.5 5.09911 11.3L0.799113 7C0.599113 6.8 0.50328 6.5625 0.511613 6.2875C0.519946 6.0125 0.624113 5.775 0.824113 5.575C1.02411 5.375 1.26161 5.275 1.53661 5.275C1.81161 5.275 2.04911 5.375 2.24911 5.575L5.79911 9.15Z" fill="#2A3647"/>
</svg>
`;

// 🔧 Für oninput="checkSubtask(...)"
window.checkSubtask = function (length) {
  // Kann ggf. später mit Logik erweitert werden – aktuell genügt leeres Stub
  console.log("checkSubtask: input length = ", length);
};

// 🔧 Für onfocus="showAddCancelBtns()"
window.showAddCancelBtns = function () {
  const btns = document.getElementById("addCancelBtns");
  if (btns) btns.classList.remove("display-none");
};
