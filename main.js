

function login() {
            const EMAIL = document.getElementById('email').value;
            const PASSWORD = document.getElementById('password').value;
            const MSG_BOX = document.getElementById('msgBox');

            if (EMAIL === 'test@example.com' && PASSWORD === 'password123') {
                MSG_BOX.style.color = 'green';
                MSG_BOX.textContent = 'Login successful!';
               
            } else {
                MSG_BOX.style.color = 'red';
                MSG_BOX.textContent = 'Invalid email or password.';
            }
            console.log('Login attempt with:', EMAIL, PASSWORD);
        }

// Placeholder for a logout function if needed later
function logout() {
    alert('Du wurdest abgemeldet!');
}


//Profil menu Toggle function

function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('not-visible');
}

