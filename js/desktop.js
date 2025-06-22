document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.join-logo');

    logo.style.transition = 'transform 100ms ease-in-out';
    
    logo.style.cursor = 'pointer'; 
    
    setTimeout(() => {
        logo.style.transform = 'scale(1.05)';
    }, 100);

    setTimeout(() => {
        logo.style.transform = 'scale(1)';
    }, 200);

    logo.addEventListener('mouseenter', () => {
        logo.style.transform = 'scale(1.1) rotate(10deg)'; 
    });

    logo.addEventListener('mouseleave', () => {
        logo.style.transform = 'scale(1) rotate(0deg)'; 
    });

    logo.addEventListener('click', () => {
       window.location.href = 'assets/index/login.html'; 
    });
});