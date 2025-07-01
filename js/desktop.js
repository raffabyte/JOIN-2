const logo = document.getElementById("join-logo");
console.log("Script gestartet");

window.addEventListener("load", () => {
    setTimeout(() => {
        logo.classList.add("fade-in");
    }, 100);    
});

logo.addEventListener("transitionend", (event) => {
    if (event.propertyName === "opacity") {
        logo.classList.add("moved");
    } else if (event.propertyName === "top") {
        window.location.href = "assets/index/login.html"
    }
});