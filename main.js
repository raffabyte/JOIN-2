function login() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const msgBox = document.getElementById('msgBox');

            if (email === 'test@example.com' && password === 'password123') {
                msgBox.style.color = 'green';
                msgBox.textContent = 'Login successful!';
               
            } else {
                msgBox.style.color = 'red';
                msgBox.textContent = 'Invalid email or password.';
            }
            console.log('Login attempt with:', email, password);
        }

        // Placeholder for a logout function if needed later
        function logout() {
            alert('Du wurdest abgemeldet!');
        }