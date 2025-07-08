function initSubtaskControls() {
  console.log("🛠 initSubtaskControls gestartet");

  waitForElement("#subtasks", () => {
    const elements = getSubtaskElements();
    if (!elements) return;

    console.log("📌 Versuche Subtask hinzuzufügen", elements.input.value);

    setupSubtaskEvents(elements);
    setInitialSubtaskState(elements);
  });
}

function waitForElement(selector, callback, timeout = 1000) {
  const start = performance.now();
  (function check() {
    const el = document.querySelector(selector);
    if (el) {
      callback();
    } else if (performance.now() - start < timeout) {
      requestAnimationFrame(check);
    } else {
      console.warn(`❗ Element ${selector} nicht gefunden nach ${timeout}ms`);
    }
  })();
}

function getSubtaskElements() {
  const elements = {
    input: document.getElementById("subtasks"),
    list: document.getElementById("subtask-list"),
    plusBtn: document.getElementById("subtaskPlusBtn"),
    clearBtn: document.querySelector(".cancel-subtask-button"),
    confirmBtn: document.querySelector(".add-subtask-button"),
    addCancelBtns: document.getElementById("addCancelBtns"),
  };

  for (const [key, el] of Object.entries(elements)) {
    if (!el) {
      console.warn(`❗ Element '${key}' nicht gefunden.`);
      return null;
    }
  }

  return elements;
}

function setupSubtaskEvents(elements) {
  addSubtaskEventListeners(elements);
  elements.plusBtn.addEventListener("click", () => {
    elements.input.focus();
  });
}

function setInitialSubtaskState(elements) {
  if (elements.input.value.trim() === "") {
    hideAddCancelBtns(elements);
  } else {
    showAddCancelBtns(elements);
  }
}

function addSubtaskEventListeners(elements) {
  elements.input.addEventListener("focus", () => {
    if (elements.input.value.trim() !== "") {
      showAddCancelBtns(elements);
    }
  });

  elements.input.addEventListener("input", () => {
    if (elements.input.value.trim() === "") {
      hideAddCancelBtns(elements);
    } else {
      showAddCancelBtns(elements);
    }
  });

  elements.input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubtaskAddition(elements);
    }
  });

  if (elements.clearBtn) {
    elements.clearBtn.addEventListener("click", () => clearSubtaskInput(elements));
  }

  if (elements.confirmBtn) {
    elements.confirmBtn.addEventListener("click", () => handleSubtaskAddition(elements));
  }
}

function showAddCancelBtns(elements) {
  elements.addCancelBtns.style.display = "flex";
  elements.plusBtn.style.display = "none";
}

function hideAddCancelBtns(elements) {
  elements.addCancelBtns.style.display = "none";
  elements.plusBtn.style.display = "flex";
}

function handleSubtaskAddition(elements) {
  console.log("📌 Subtask wird hinzugefügt");
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
  li.innerHTML = `<span class="subtask-text">${text}</span>`;
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

  const deleteBtn = createSvgButton(deleteSVG, "delete-icon", () => li.remove());
  const checkBtn = createSvgButton(checkSVG, "check-icon", () => saveSubtaskEdit(input, li, container));
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
  const editBtn = createSvgButton(editSVG, "edit-btn", () => enableSubtaskEditing(li));
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

window.checkSubtask = function (length) {
  console.log("checkSubtask: input length =", length);
};

window.showAddCancelBtns = function () {
  const input = document.getElementById("subtasks");
  const plusBtn = document.getElementById("subtaskPlusBtn");
  const btns = document.getElementById("addCancelBtns");

  if (!input || !btns || !plusBtn) return;

  if (input.value.trim() !== "") {
    btns.style.display = "flex";
    plusBtn.style.display = "none";
  }
};

window.initSubtaskControls = initSubtaskControls;

const editSVG = `
<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.14453 17H3.54453L12.1695 8.375L10.7695 6.975L2.14453 15.6V17ZM16.4445 6.925L12.1945 2.725L13.5945 1.325C13.9779 0.941667 14.4487 0.75 15.007 0.75C15.5654 0.75 16.0362 0.941667 16.4195 1.325L17.8195 2.725C18.2029 3.10833 18.4029 3.57083 18.4195 4.1125C18.4362 4.65417 18.2529 5.11667 17.8695 5.5L16.4445 6.925ZM14.9945 8.4L4.39453 19H0.144531V14.75L10.7445 4.15L14.9945 8.4Z" fill="#2A3647"/>
</svg>
`;

const deleteSVG = `
<svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.14453 18C2.59453 18 2.1237 17.8042 1.73203 17.4125C1.34036 17.0208 1.14453 16.55 1.14453 16V3C0.861198 3 0.623698 2.90417 0.432031 2.7125C0.240365 2.52083 0.144531 2.28333 0.144531 2C0.144531 1.71667 0.240365 1.47917 0.432031 1.2875C0.623698 1.09583 0.861198 1 1.14453 1H5.14453C5.14453 0.716667 5.24036 0.479167 5.43203 0.2875C5.6237 0.0958333 5.8612 0 6.14453 0H10.1445C10.4279 0 10.6654 0.0958333 10.857 0.2875C11.0487 0.479167 11.1445 0.716667 11.1445 1H15.1445C15.4279 1 15.6654 1.09583 15.857 1.2875C16.0487 1.47917 16.1445 1.71667 16.1445 2C16.1445 2.28333 16.0487 2.52083 15.857 2.7125C15.6654 2.90417 15.4279 3 15.1445 3V16C15.1445 16.55 14.9487 17.0208 14.557 17.4125C14.1654 17.8042 13.6945 18 13.1445 18H3.14453ZM3.14453 3V16H13.1445V3H3.14453ZM5.14453 13C5.14453 13.2833 5.24036 13.5208 5.43203 13.7125C5.6237 13.9042 5.8612 14 6.14453 14C6.42786 14 6.66536 13.9042 6.85703 13.7125C7.0487 13.5208 7.14453 13.2833 7.14453 13V6C7.14453 5.71667 7.0487 5.47917 6.85703 5.2875C6.66536 5.09583 6.42786 5 6.14453 5C5.8612 5 5.6237 5.09583 5.43203 5.2875C5.24036 5.47917 5.14453 5.71667 5.14453 6V13ZM9.14453 13C9.14453 13.2833 9.24037 13.5208 9.43203 13.7125C9.6237 13.9042 9.8612 14 10.1445 14C10.4279 14 10.6654 13.9042 10.857 13.7125C11.0487 13.5208 11.1445 13.2833 11.1445 13V6C11.1445 5.71667 11.0487 5.47917 10.857 5.2875C10.6654 5.09583 10.4279 5 10.1445 5C9.8612 5 9.6237 5.09583 9.43203 5.2875C9.24037 5.47917 9.14453 5.71667 9.14453 6V13Z" fill="#2A3647"/>
</svg>
`;

const checkSVG = `
<svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M5.69474 9.15L14.1697 0.675C14.3697 0.475 14.6072 0.375 14.8822 0.375C15.1572 0.375 15.3947 0.475 15.5947 0.675C15.7947 0.875 15.8947 1.1125 15.8947 1.3875C15.8947 1.6625 15.7947 1.9 15.5947 2.1L6.39474 11.3C6.19474 11.5 5.96141 11.6 5.69474 11.6C5.42807 11.6 5.19474 11.5 4.99474 11.3L0.694738 7C0.494738 6.8 0.398905 6.5625 0.407238 6.2875C0.415572 6.0125 0.519738 5.775 0.719738 5.575C0.919738 5.375 1.15724 5.275 1.43224 5.275C1.70724 5.275 1.94474 5.375 2.14474 5.575L5.69474 9.15Z" fill="#2A3647"/>
</svg>
`;


