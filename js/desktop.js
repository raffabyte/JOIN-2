// document.addEventListener('DOMContentLoaded', () => {
//     const logo = document.querySelector('.join-logo');

//     logo.style.transition = 'transform 100ms ease-in-out';
    
//     logo.style.cursor = 'pointer'; 
    
//     setTimeout(() => {
//         logo.style.transform = 'scale(1.05)';
//     }, 100);

//     setTimeout(() => {
//         logo.style.transform = 'scale(1)';
//     }, 200);

//     logo.addEventListener('mouseenter', () => {
//         logo.style.transform = 'scale(1.1) rotate(10deg)'; 
//     });

//     logo.addEventListener('mouseleave', () => {
//         logo.style.transform = 'scale(1) rotate(0deg)'; 
//     });

//     logo.addEventListener('click', () => {
//        window.location.href = 'assets/index/login.html'; 
//     });
// });

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