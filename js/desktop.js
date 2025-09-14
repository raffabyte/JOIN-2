const desktopLogo = document.getElementById("join-logo");
const mobileLogo = document.getElementById("join-logo-response");

function getActiveLogo() {
    return window.matchMedia("(max-width: 768px)").matches
        ? mobileLogo
        : desktopLogo;
}

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

function init() {
    updateLogo();

    const activeLogo = getActiveLogo();
    if (!activeLogo) return;

    // Kurz warten → dann Animation starten
    setTimeout(() => {
        activeLogo.classList.add("start");
    }, 100);

    // Transition-Ende für beide Logos
    [desktopLogo, mobileLogo].forEach((logo) => {
        if (!logo) return;

        logo.addEventListener("transitionend", (event) => {
            if (event.propertyName === "opacity" && logo.classList.contains("visible")) {
                // moved setzen
                logo.classList.add("moved");
            }

            if (event.propertyName === "top" && logo.classList.contains("moved")) {
                // weiterleiten
                window.location.href = "assets/index/login.html";
            }
        });
    });
}

window.addEventListener("load", init);
window.addEventListener("resize", updateLogo);
