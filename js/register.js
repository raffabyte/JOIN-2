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

// function signUp() {
//     const nameField = document.getElementById("name");
//     const emailField = document.getElementById("email");

//     if (!nameField || !emailField) {
//       console.error("Name oder Email Feld nicht gefunden!");
//       return;
//     }

//     const name = nameField.value.trim();
//     const email = emailField.value.trim();
//     const password = document.getElementById("password").value;
//     const password2 = document.getElementById("password2").value;
//     const accept = document.getElementById("accept").checked;

//     console.log("Name:", name);
//     console.log("Email:", email);

//     if (password !== password2) {
//       alert("Passwords do not match.");
//       return;
//     }

//     if (!accept) {
//       alert("Please accept the privacy policy.");
//       return;
//     }

//     // Overlay anzeigen
//     const overlay = document.getElementById("signUpSuccess");
//     overlay.style.display = "flex";
//     document.body.style.overflow = "hidden";

//     setTimeout(() => {
//       overlay.style.display = "none";
//       document.body.style.overflow = "";
//       window.location.href = '../../assets/index/login.html';
//     }, 3000);
//   }

async function signUp() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const password2 = document.getElementById("password2").value;
  const accept = document.getElementById("accept").checked;

  if (password !== password2) {
    alert("Passwords do not match.");
    return;
  }
  if (!accept) {
    alert("Please accept the privacy policy.");
    return;
  }

  // Nutzerdaten als Objekt
  const userData = {
    name: name,
    email: email,
    password: password,
  };

  try {
    // Nutzer speichern
    const response = await postData("users", userData);
    console.log("Benutzer gespeichert:", response);

    const userKey = response.name; // ← Das ist dein eindeutiger Schlüssel

    await preloadContacts(userKey);

    // Speichern für spätere Nutzung
    localStorage.setItem("loggedInUserKey", userKey);
    
    // Overlay anzeigen
    const overlay = document.getElementById("signUpSuccess");
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      overlay.style.display = "none";
      document.body.style.overflow = "";
      window.location.href = "../../assets/index/login.html";
    }, 3000);
  } catch (error) {
    console.error(error);
    alert("Es ist ein Fehler aufgetreten.");
  }
}

async function preloadContacts(userKey) {
  const contactsPath = `users/${userKey}/contacts`;

  for (const contact of demoContacts) {
    await fetch(`${BASE_URL}${contactsPath}.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(contact)
    });
  }
}

const demoContacts = [
  { name: "Anna Becker", email: "anna@example.com", phone: "123456789" },
  { name: "Tom Meier", email: "tom@example.com", phone: "987654321" },
  { name: "Lisa Schmidt", email: "lisa@example.com", phone: "555123456" },
  { name: "Peter Braun", email: "peter@example.com", phone: "333222111" },
  { name: "Nina Keller", email: "nina@example.com", phone: "444555666" },
  { name: "Max Fischer", email: "max@example.com", phone: "666777888" },
  { name: "Julia König", email: "julia@example.com", phone: "777888999" },
  { name: "Leon Wagner", email: "leon@example.com", phone: "111222333" },
  { name: "Emma Roth", email: "emma@example.com", phone: "222333444" },
  { name: "Paul Weber", email: "paul@example.com", phone: "999000111" }
];