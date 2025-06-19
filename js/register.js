let users = [
    {'email': 'password': 'test123'}
];

function addUser() {
    let email= document.getElementById('email');
    let password = document.getElementById('password');
    users.push({email: email.value, password: password.value});
    //Weiterleitung zu Loginseite + Nachricht anzeigen: "Erfolgreiche registrierung"

    window.location.href = 'login.html?msg=Du hast dich erfolgreich registriert';
}