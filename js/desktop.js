const desktopLogo = document.getElementById("join-logo");
const mobileLogo = document.getElementById("join-logo-response");

function updateLogo() {
    if (window.matchMedia("(max-width: 768px)").matches) {
        desktopLogo.classList.remove("visible");
        mobileLogo.classList.add("visible");
    } else {
        mobileLogo.classList.remove("visible");
        desktopLogo.classList.add("visible");
    }
}

window.addEventListener("load", () => {
    updateLogo();

    const activeLogo = window.matchMedia("(max-width: 768px)").matches
        ? mobileLogo
        : desktopLogo;

    setTimeout(() => {
        activeLogo.classList.add("visible");
    }, 100);

    activeLogo.addEventListener("transitionend", (event) => {
        if (event.propertyName === "opacity") {
            activeLogo.classList.add("moved");
        } else if (event.propertyName === "top") {
            window.location.href = "assets/index/login.html";
        }
    });
});

window.addEventListener("resize", updateLogo);