// let users = [
//     {'email': 'password': 'test123'}
// ];

// function addUser() {
//     let email= document.getElementById('email');
//     let password = document.getElementById('password');
//     users.push({email: email.value, password: password.value});
//     // Redirect to Login page + display message: "Successful registration"

//     window.location.href = 'login.html?msg=Du hast dich erfolgreich registriert';
// }

function signUp() {
    const nameField = document.getElementById("name");
    const emailField = document.getElementById("email");
  
    if (!nameField || !emailField) {
      console.error("Name oder Email Feld nicht gefunden!");
      return;
    }
  
    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;
    const accept = document.getElementById("accept").checked;
  
    console.log("Name:", name);
    console.log("Email:", email);
  
    if (password !== password2) {
      alert("Passwords do not match.");
      return;
    }
  
    if (!accept) {
      alert("Please accept the privacy policy.");
      return;
    }
  
    // Overlay anzeigen
    const overlay = document.getElementById("signUpSuccess");
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  
    setTimeout(() => {
      overlay.style.display = "none";
      document.body.style.overflow = "";
      window.location.href = '../../assets/index/login.html';
    }, 3000);
  }
  