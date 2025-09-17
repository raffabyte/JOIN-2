/**
 * Desktop logo element used in the splash animation.
 * @type {HTMLElement|null}
 */
const desktopLogo = document.getElementById("join-logo");

/**
 * Mobile logo element used in the splash animation.
 * @type {HTMLElement|null}
 */
const mobileLogo = document.getElementById("join-logo-response");

/**
 * Returns the currently active logo depending on viewport width.
 * @returns {HTMLElement|null}
 */
function getActiveLogo() {
    return window.matchMedia("(max-width: 768px)").matches
        ? mobileLogo
        : desktopLogo;
}

/**
 * Resets logos and makes only the active logo visible.
 * Keeps inline styles minimal to let media queries work.
 * @returns {void}
 */
function updateLogo() {
    if (!desktopLogo || !mobileLogo) return;

    // Alle Logos zurücksetzen
    [desktopLogo, mobileLogo].forEach(logo => {
        logo.classList.remove("visible", "moved", "start");
        logo.style.left = ""; // zurücksetzen für Media Query
    });

    // Nur aktives Logo sichtbar machen
    getActiveLogo().classList.add("visible");
}

/**
 * Adds the "start" class after a short delay to trigger animation.
 * @param {HTMLElement} logo
 */
function startLogoAnimation(logo) {
    setTimeout(() => {
        logo.classList.add("start");
    }, 100);
}

/**
 * Handles a single transitionend event for a logo.
 * Adds "moved" on opacity end; navigates on top end.
 * @param {HTMLElement} logo
 * @param {TransitionEvent} event
 */
function handleLogoTransition(logo, event) {
    if (event.propertyName === "opacity" && logo.classList.contains("visible")) {
        logo.classList.add("moved");
    }
    if (event.propertyName === "top" && logo.classList.contains("moved")) {
        navigateToLogin();
    }
}

/**
 * Wires the transitionend handler for a given logo element.
 * @param {HTMLElement|null} logo
 */
function attachTransitionHandler(logo) {
    if (!logo) return;
    logo.addEventListener("transitionend", (event) => handleLogoTransition(logo, event));
}

/** Navigates to the login page after the splash animation. */
function navigateToLogin() {
    window.location.href = "assets/index/login.html";
}

/**
 * Initializes the splash animation: visibility, start, and handlers.
 * @returns {void}
 */
function init() {
    updateLogo();

    const activeLogo = getActiveLogo();
    if (!activeLogo) return;

    startLogoAnimation(activeLogo);

    // Transition-Ende für beide Logos
    [desktopLogo, mobileLogo].forEach(attachTransitionHandler);
}

window.addEventListener("load", init);
window.addEventListener("resize", updateLogo);
