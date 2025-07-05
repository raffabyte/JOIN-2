function header() {
    return `
        <h3>Kanban Project Management Tool</h3>
        <div class="userInfo">
            <a href="help.html" id="helpLink">
                <img class="help" src="../img/SummaryUser/help.png" alt="" />
            </a>
            <button onclick="toggleMenu()" id="userProfile">
                <img src="../img/SummaryUser/User profile initials.png" alt="">
            </button>
            <div class="flexC not-visible" id="menu">
                <a href="../index/legal-notice.html">Legal notice</a>
                <a href="../index/privacy.html">Privacy Policy</a>
                <a href="login.html">Log Out</a>
            </div>
        </div>
    `
}

function linkesNav(activePage) {
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
        <a href="../index/privacy.html" class="privacyPolicy${activePage === 'privacy' ? ' aktiveNav' : ''}">Privacy Policy</a>
        <a href="../index/legal-notice.html" class="legalNotice${activePage === 'legal-notice' ? ' aktiveNav' : ''}">Legal notice</a>
    </div>`
}

function linkesNavLogin(activePage) {
    return `
    <div class="login-menu flexC">
        <img class="join" src="../img/fav-icon.png" alt="">
        <a href="../index/login.html" class="login-link flexR">
            <img class="icon" src="../img/LogIn/login-arrow.png" alt="login">
            <p>Log in</p>
        </a>

    </div>
    <div class="legalLinks flexC">
        <a href="../index/privacy-login.html" class="privacyPolicy ${activePage === 'privacy' || activePage === 'privacy-login' ? ' aktiveNav' : ''}">Privacy Policy</a>
        <a href="../index/legal-notice-login.html" class="legalNotice ${activePage === 'legal-notice' || activePage === 'legal-notice-login' ? ' aktiveNav' : ''}">Legal notice</a>
    </div>`
}

