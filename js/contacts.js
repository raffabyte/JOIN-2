function toggleOverlay() {
  const overlay = document.getElementById('overlay');
  const isVisible = overlay.classList.contains('show');

  if (isVisible) {
    overlay.classList.remove('show');

    // nach der Slide-Out-Animation: ausblenden
    setTimeout(() => {
      overlay.classList.add('d_none');
    }, 400); // gleich wie die CSS transition-Dauer
  } else {
    overlay.classList.remove('d_none');

    // kleiner Timeout, um Rendering zu erzwingen
    setTimeout(() => {
      overlay.classList.add('show');
    }, 10);
  }
}


const BASE_URL = "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/";

async function loadData(path="") {
    let response = await fetch(BASE_URL + path +  ".json");
    return responseToJson = await response.json();
}

async function postData (path="", data={}) {
    let response = await fetch(BASE_URL + path +  ".json",{
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify(data)
    });
    return responseToJson = await response.json();
}

async function putData (path="", data={}) {
    let response = await fetch(BASE_URL + path +  ".json",{
        method: "PUT",
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}
 
async function deleteData(path="") {
    let response = await fetch(BASE_URL + path +  ".json",{
        method: "DELETE",
    });
    return responseToJson = await response.json();
}
function submitContact(event) {
  event.preventDefault(); // verhindert Reload

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!name || !email || !phone) {
    alert("Bitte alle Felder ausfüllen!");
    return;
  }

  const contact = {
    name,
    email,
    phone,
  };

  // Beispiel-Pfad – du kannst ihn dynamisch machen
  const path = `users/raffael/contacts`;

  postData(path, contact).then(() => {
    alert("Kontakt gespeichert!");
    toggleOverlay();
  });
}

async function sendContactData(path = "", data = {}) {
  const response = await fetch(BASE_URL + path + ".json", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return await response.json();
}

document.addEventListener("DOMContentLoaded", async () => {
  const contacts = await loadData("users/raffael/contacts");

  if (contacts) {
    renderContacts(contacts);
  }
});

function renderContacts(data) {
  const container = document.querySelector(".contacsList");

  for (const key in data) {
    const contact = data[key];
    container.innerHTML += `
      <div class="contactCard">
      <img class="contactImg" src="../img/Profile badge.png" alt="">
      <div>
        <p class="contactName"> ${contact.name}</p>
        <p class="contactMail"> ${contact.email}</p>
        </div>
      </div>
    `;
  }
}

//<p><strong>Telefon:</strong> ${contact.phone}</p>