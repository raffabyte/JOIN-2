function header() {
    return `
        <h3>Kanban Project Management Tool</h3>
        <div class="userInfo">
            <a href="help.html" id="helpLink">
                <img class="help" src="../img/SummaryUser/help.png" alt="" />
            </a>
            <button onclick="toggleMenu()" id="userProfile" class="initials-button">
                <img src="../img/Ellipse 3.png" alt="">
                <span id="userInitials" class="initials-text"></span>
            </button>
            <div class="flexC not-visible" id="menu">
                <a href="../index/legal-notice.html">Legal notice</a>
                <a href="../index/privacy.html">Privacy Policy</a>
                <a onclick="logout()" href="login.html">Log Out</a>
            </div>
        </div>
    `
}

async function setUserInitials() {
  const initialsEl = document.getElementById("userInitials");
  if (!initialsEl || !userKey) return;

  try {
    const response = await fetch(`${BASE_URL}users/${userKey}.json`);
    const user = await response.json();

    if (user?.name) {
      const initials = user.name
        .split(" ")
        .map(word => word[0].toUpperCase())
        .slice(0, 2)
        .join("");
      initialsEl.innerText = initials;
    } else {
      initialsEl.innerText = "?";
    }
  } catch (error) {
    console.error("Fehler beim Laden der Userdaten:", error);
    initialsEl.innerText = "?";
  }
}

function linkesNav(activePage) {
  const isGuest = localStorage.getItem("guestMode") === "true";

  const privacyHref = isGuest ? "../index/privacy-login.html" : "../index/privacy.html";
  const legalHref = isGuest ? "../index/legal-notice-login.html" : "../index/legal-notice.html";

  return `
    <div class="flexC nav-menu-top">
      <img class="join" src="../img/fav-icon.png" alt="">
      <div class="menu">
        <a href="summary.html" class="flexR menuOption${activePage === 'summary' ? ' aktiveNav' : ''}">
          <img class="icon" src="../img/summary.png" alt="">
          <p>Summary</p>
        </a>
        <a href="add_task.html" class="menuOption flexR${activePage === 'add_task' ? ' aktiveNav' : ''}">
          <img class="icon" src="../img/add-tasks.png" alt="">
          <p>Add Task</p>
        </a>
        <a href="board.html" class="menuOption flexR${activePage === 'board' ? ' aktiveNav' : ''}">
          <img class="icon" src="../img/Board.png" alt="">
          <p>Board</p>
        </a>
        <a href="contacts.html" class="menuOption flexR${activePage === 'contacts' ? ' aktiveNav' : ''}">
          <img class="icon" src="../img/contacts.png" alt="">
          <p>Contacts</p>
        </a>
      </div>
    </div>
    <div class="legalLinks">
      <a href="${privacyHref}" class="privacyPolicy${activePage === 'privacy' ? ' aktiveNav' : ''}">Privacy Policy</a>
      <a href="${legalHref}" class="legalNotice${activePage === 'legal-notice' ? ' aktiveNav' : ''}">Legal notice</a>
    </div>
  `;
}

function linkesNavLogin(activePage) {
    return `
    <div class="login-menu flexC">
        <img class="join" src="../img/fav-icon.png" alt="">
        <a onclick="logout()" href="../index/login.html" class="login-link flexR">
            <img class="icon" src="../img/LogIn/login-arrow.png" alt="login">
            <p>Log in</p>
        </a>

    </div>
    <div class="legalLinks flexC">
        <a href="../index/privacy-login.html" class="privacyPolicy ${activePage === 'privacy' || activePage === 'privacy-login' ? ' aktiveNav' : ''}">Privacy Policy</a>
        <a href="../index/legal-notice-login.html" class="legalNotice ${activePage === 'legal-notice' || activePage === 'legal-notice-login' ? ' aktiveNav' : ''}">Legal notice</a>
    </div>`
}

function taskCardTemplate(task) {
    return `
        <div class="task-card flexC" id="${task.id}" draggable="true" ondragstart="startDragging(${task.id})">
            <div class="task-card-header flexR">
                <span id="userStory">${task.category}</span>
            </div>
            <h3>${task.title}</h3>
            <p class="task-description" id="taskDescription">${task.description}</p>
            <div class="subtasks" id="subtasks"></div>
            <div class="task-card-footer flexR">
                <div class="task-members" id="taskMembers">
                    ${
                    Array.isArray(task.assignee)
                    ? task.assignee.map(name => renderMembers(name)).join(''): ''
                }
                </div>
                <img src="../img/Bord/${task.priority}.png" alt="priority">
            </div>
        </div>`;
}

function noTaskCardTemplate() {
    return `
        <div class="no-task-item flexR">
            <p>No Tasks to do</p>
        </div>`;
}

function contactIconSpanTemplate(name) {
    return `
    <span class="contact-icon flexR" data-name="${name}">${contactIconSpan(name)}</span>`;
}