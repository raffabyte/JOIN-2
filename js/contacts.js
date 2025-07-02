let contactsData = {};

function toggleOverlay() {
  const overlay = document.getElementById("overlay");
  const isVisible = overlay.classList.contains("show");

  if (isVisible) {
    overlay.classList.remove("show");

    // nach der Slide-Out-Animation: ausblenden
    setTimeout(() => {
      overlay.classList.add("d_none");
    }, 400); // gleich wie die CSS transition-Dauer
  } else {
    overlay.classList.remove("d_none");

    // kleiner Timeout, um Rendering zu erzwingen
    setTimeout(() => {
      overlay.classList.add("show");
    }, 10);
  }
}

const BASE_URL =
  "https://join-475-370cd-default-rtdb.europe-west1.firebasedatabase.app/";

async function loadData(path = "") {
  let response = await fetch(BASE_URL + path + ".json");
  return (responseToJson = await response.json());
}

async function postData(path = "", data = {}) {
  let response = await fetch(BASE_URL + path + ".json", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return (responseToJson = await response.json());
}

async function putData(path = "", data = {}) {
  let response = await fetch(BASE_URL + path + ".json", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return await response.json();
}

async function deleteData(path = "") {
  let response = await fetch(BASE_URL + path + ".json", {
    method: "DELETE",
  });
  return (responseToJson = await response.json());
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
    contactsData = contacts; // ⬅️ global speichern
    renderContacts(contacts);
  }
});

function renderContacts(data) {
  const container = document.querySelector(".contacsList");

  for (const key in data) {
    const contact = data[key];
    container.innerHTML += `
      <div onclick="showcontactCardDetails('${key}')" class="contactCard">
      <img class="contactImg" src="../img/Profile badge.png" alt="">
      <div>
        <p class="contactName"> ${contact.name}</p>
        <p class="contactMail"> ${contact.email}</p>
        </div>
      </div>
    `;
  }
}

function showcontactCardDetails(key) {
  const contact = contactsData[key];

  const detailsContainer = document.getElementById("contactsDetails");
  detailsContainer.innerHTML = `
  <div class="displayFlex">
  <img class="BigPB" src="../img/Frame 79.png" alt="" />
  <div class="displayColumn">
    <h2 class="contectName">${contact.name}</h2>
    <div class="displayFlex1">
      <div class="editContainer">
        <svg width="24" height="24" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_334068_6285" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="33" height="32">
<rect x="0.5" width="32" height="32" fill="#D9D9D9"/>
</mask>
<g mask="url(#mask0_334068_6285)">
<path d="M7.16667 25.3332H9.03333L20.5333 13.8332L18.6667 11.9665L7.16667 23.4665V25.3332ZM26.2333 11.8998L20.5667 6.29984L22.4333 4.43317C22.9444 3.92206 23.5722 3.6665 24.3167 3.6665C25.0611 3.6665 25.6889 3.92206 26.2 4.43317L28.0667 6.29984C28.5778 6.81095 28.8444 7.42761 28.8667 8.14984C28.8889 8.87206 28.6444 9.48873 28.1333 9.99984L26.2333 11.8998ZM24.3 13.8665L10.1667 27.9998H4.5V22.3332L18.6333 8.19984L24.3 13.8665Z" fill="#2A3647"/>
</g>
</svg>
        <p class="pSmall">Edit</p>
      </div>
      <div class="DeleteContainer">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_336135_3940" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
<rect width="24" height="24" fill="#D9D9D9"/>
</mask>
<g mask="url(#mask0_336135_3940)">
<path d="M7 21C6.45 21 5.97917 20.8042 5.5875 20.4125C5.19583 20.0208 5 19.55 5 19V6C4.71667 6 4.47917 5.90417 4.2875 5.7125C4.09583 5.52083 4 5.28333 4 5C4 4.71667 4.09583 4.47917 4.2875 4.2875C4.47917 4.09583 4.71667 4 5 4H9C9 3.71667 9.09583 3.47917 9.2875 3.2875C9.47917 3.09583 9.71667 3 10 3H14C14.2833 3 14.5208 3.09583 14.7125 3.2875C14.9042 3.47917 15 3.71667 15 4H19C19.2833 4 19.5208 4.09583 19.7125 4.2875C19.9042 4.47917 20 4.71667 20 5C20 5.28333 19.9042 5.52083 19.7125 5.7125C19.5208 5.90417 19.2833 6 19 6V19C19 19.55 18.8042 20.0208 18.4125 20.4125C18.0208 20.8042 17.55 21 17 21H7ZM7 6V19H17V6H7ZM9 16C9 16.2833 9.09583 16.5208 9.2875 16.7125C9.47917 16.9042 9.71667 17 10 17C10.2833 17 10.5208 16.9042 10.7125 16.7125C10.9042 16.5208 11 16.2833 11 16V9C11 8.71667 10.9042 8.47917 10.7125 8.2875C10.5208 8.09583 10.2833 8 10 8C9.71667 8 9.47917 8.09583 9.2875 8.2875C9.09583 8.47917 9 8.71667 9 9V16ZM13 16C13 16.2833 13.0958 16.5208 13.2875 16.7125C13.4792 16.9042 13.7167 17 14 17C14.2833 17 14.5208 16.9042 14.7125 16.7125C14.9042 16.5208 15 16.2833 15 16V9C15 8.71667 14.9042 8.47917 14.7125 8.2875C14.5208 8.09583 14.2833 8 14 8C13.7167 8 13.4792 8.09583 13.2875 8.2875C13.0958 8.47917 13 8.71667 13 9V16Z" fill="#2A3647"/>
</g>
</svg>

        <p class="pSmall">Delete</p>
      </div>
    </div>
  </div>
</div>

<p class="contactInformation">Contact Information</p>

<div class="displayColumn1">
<p class="strong">Email</p>
<p class="mailInfoSmall">${contact.email}</p>
</div>

<div class="displayColumn1">
<p class="strong">Phone</p>
<p class="phoneInfoSmall"> ${contact.phone}</p>
</div>
  `;
}


