document.querySelectorAll(".priority-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".priority-btn")
      .forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("subtasks");
  const dropdown = document.querySelector(".subtask-dropdown");
  const options = document.querySelectorAll(".subtask-option");
  const addBtn = document.querySelector(".add-subtask-inside");
  const list = document.querySelector(".subtask-list");
  input.addEventListener("focus", () => {
    dropdown.classList.add("show");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".subtask-input-wrapper")) {
      dropdown.classList.remove("show");
    }
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      input.value = option.textContent;
      dropdown.classList.remove("show");
    });
  });

  function addSubtask() {
    const value = input.value.trim();
    if (!value) return;
    const li = document.createElement("li");
    li.textContent = value;
    list.appendChild(li);
    input.value = "";
    dropdon.classList.remove("show");
  }
  addBtn.addEventListener("click", addSubtask);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubtask();
    }
  });
});
