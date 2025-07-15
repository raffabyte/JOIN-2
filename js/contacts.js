


if (!userKey) {
  window.location.href = "../../index.html";
}


const basePath = `users/${userKey}/contacts`;


let editingOwnContact = false;


let contactsData = {};


console.log(contactsData);




function toggleOverlay() {
  const overlay = document.getElementById("overlay");
  const isVisible = overlay.classList.contains("show");

  if (isVisible) {
    // ❗ 100ms warten, bevor es schließt
    setTimeout(() => {
      overlay.classList.remove("show");

      // ❗ Und 400ms (Übergang) warten, bevor es ausgeblendet wird
      setTimeout(() => {
        overlay.classList.add("d_none");
      }, 400);
    }, 100);
  } else {
    // ❗ Zuerst sichtbar machen
    overlay.classList.remove("d_none");

    // ❗ 100ms warten, bevor es reingeschoben wird
    setTimeout(() => {
      overlay.classList.add("show");
    }, 100);
  }
}


function openNewContactForm() {
  document.getElementById("contactForm").reset();
  document.getElementById("contactKey").value = "";


  const avatarContainer = document.getElementById("editAvatarContainer");
  avatarContainer.innerHTML = `
    <img class="pb" src="../img/Group 13.png" alt="" />
  `;


  toggleOverlay();
}


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








async function submitContact(event) {
  event.preventDefault();


  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const contactKey = document.getElementById("contactKey").value.trim();


  const contact = { name, email, phone };


  if (contactKey === "__own" || editingOwnContact) {
  // 🧠 Erst bestehende Nutzerdaten laden (inkl. Passwort)
  const existingUserData = await loadData(`users/${userKey}`);


  // 🔧 Bestehendes Objekt erweitern
  const updatedUser = {
    ...existingUserData,
    name,
    email,
    phone,
  };


  // ✅ Nur das Gewünschte aktualisieren
  await putData(`users/${userKey}`, updatedUser);


  // Anzeige aktualisieren
  ownContact = updatedUser;
  renderOwnContact(ownContact);
  showOwnContactCardDetails(ownContact);
  toggleOverlay();
  editingOwnContact = false;
  return;
}


  if (contactKey) {
    // Bestehenden Kontakt aktualisieren
    await fetch(`${BASE_URL}${basePath}/${contactKey}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
    });


    await loadDataAfterSave();
    showcontactCardDetails(contactKey);
    activateContactCard(contactKey);
    document.getElementById("contactsDetails").classList.add("showDetails");
  } else {
    // Neuen Kontakt anlegen
    const result = await postData(basePath, contact);
    const newKey = result.name;


    await loadDataAfterSave();
    showcontactCardDetails(newKey);
    activateContactCard(newKey);
    document.getElementById("contactsDetails").classList.add("showDetails");
  }


  toggleOverlay();
}






async function loadDataAfterSave() {
  const newContacts = await loadData(`users/${userKey}/contacts`);
  contactsData = newContacts; // optional, wenn du den globalen Zustand behalten willst
  renderContacts(newContacts);
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
  const contacts = await loadData(`users/${userKey}/contacts`);
  const ownContact = await loadData(`users/${userKey}`);

  await setUserInitials();
 


  if (contacts) {
    contactsData = contacts; // ⬅️ global speichern
    renderContacts(contacts);
  }
  console.log(contacts);
  renderOwnContact(ownContact)
 
});


function renderOwnContact(ownContact) {
     const container = document.getElementById("ownContactArea");
  container.innerHTML = "";


  const contact = ownContact


  const initials = contact.name
      .split(" ")
      .map(word => word[0].toUpperCase())
      .join("")
      .substring(0, 2);


 
    const color = generateColorFromString(contact.name);


    const contactCard = document.createElement("div");
    contactCard.className = "contactCard";
    contactCard.innerHTML = `
      <div class="contactCircle" style="background-color: ${color};">${initials}</div>
      <div>
        <p class="contactName">${contact.name}</p>
      </div>
    `;


    contactCard.addEventListener("click", () => {
      document.querySelectorAll(".contactCard").forEach(card =>
        card.classList.remove("activeCard")
      );
      contactCard.classList.add("activeCard");
      document.getElementById("contactsDetails").classList.add("showDetails");
      showOwnContactCardDetails(contact);
    });


    container.appendChild(contactCard);
  }


function showOwnContactCardDetails(contact) {
  const detailsContainer = document.getElementById("contactsDetails");
  detailsContainer.innerHTML = `
    <div class="displayFlex">
      <div class="BigContactCircle" style="background-color: ${generateColorFromString(contact.name)};">
        ${contact.name.split(" ").map(w => w[0].toUpperCase()).join("").substring(0, 2)}
      </div>
      <div class="displayColumn">
        <h2 class="contectName">${contact.name}</h2>
        <div class="displayFlex1">
          <div class="editContainer" id="ownEditButton">
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
      <p class="phoneInfoSmall">${contact.phone}</p>
    </div>
  `;


  // 🧠 Jetzt attach den Event-Listener NACHDEM das HTML gesetzt wurde
  document.getElementById("ownEditButton").addEventListener("click", () => {
    editOwnContact(contact);
  });
}




function renderContacts(data) {
  const container = document.getElementById("contactCardsContainer");
  container.innerHTML = "";


  const sortedEntries = Object.entries(data).sort((a, b) => {
    return a[1].name.localeCompare(b[1].name);
  });


  let currentLetter = null;


  for (const [key, contact] of sortedEntries) {
    const firstLetter = contact.name[0].toUpperCase();


    if (firstLetter !== currentLetter) {
      currentLetter = firstLetter;
      const letterHeader = document.createElement("div");
      letterHeader.className = "letterHeader";
      letterHeader.innerText = currentLetter;
      const separatorList = document.createElement("div");
      separatorList.className = "separatorList";
      container.appendChild(letterHeader);
      container.appendChild(separatorList);
    }


    const initials = contact.name
      .split(" ")
      .map(word => word[0].toUpperCase())
      .join("")
      .substring(0, 2);


    const color = generateColorFromString(contact.name);


    const contactCard = document.createElement("div");
    contactCard.className = "contactCard";
    contactCard.innerHTML = `
      <div class="contactCircle" style="background-color: ${color};">${initials}</div>
      <div>
        <p class="contactName">${contact.name}</p>
        <p class="contactMail">${contact.email}</p>
      </div>
    `;


    contactCard.addEventListener("click", () => {
      document.querySelectorAll(".contactCard").forEach(card =>
        card.classList.remove("activeCard")
      );
      contactCard.classList.add("activeCard");
      document.getElementById("contactsDetails").classList.add("showDetails");
      showcontactCardDetails(key);
    });


    container.appendChild(contactCard);
  }
}


function showcontactCardDetails(key) {
  const contact = contactsData[key];


  const detailsContainer = document.getElementById("contactsDetails");
  detailsContainer.innerHTML = `
  <div class="displayFlex">
  <div class="BigContactCircle" style="background-color: ${generateColorFromString(contact.name)};">
  ${contact.name.split(" ").map(w => w[0].toUpperCase()).join("").substring(0, 2)}
</div>
  <div class="displayColumn">
    <h2 class="contectName">${contact.name}</h2>
    <div onclick="editContact('${key}')" class="displayFlex1">
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
      <div onclick="event.stopPropagation(); deleteContact('${key}')" class="DeleteContainer">
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


function editOwnContact(contact) {
  editingOwnContact = true;
   


  document.getElementById("name").value = contact.name;
  document.getElementById("email").value = contact.email;
  document.getElementById("phone").value = contact.phone;


  // Initialen und Farbe berechnen
  const initials = contact.name
    .split(" ")
    .map(w => w[0].toUpperCase())
    .join("")
    .substring(0, 2);
  const color = generateColorFromString(contact.name);


  // Avatar-Kreis einfügen
  const avatarContainer = document.getElementById("editAvatarContainer");
  avatarContainer.innerHTML = `
    <div class="BigContactCircle" style="background-color: ${color};">
      ${initials}
    </div>
  `;


  toggleOverlay();
}




function editContact(key) {
  const contact = contactsData[key];

  document.getElementById("contactKey").value = key;
  document.getElementById("name").value = contact.name;
  document.getElementById("email").value = contact.email;
  document.getElementById("phone").value = contact.phone;

  const initials = contact.name
    .split(" ")
    .map(w => w[0].toUpperCase())
    .join("")
    .substring(0, 2);
  const color = generateColorFromString(contact.name);

  const avatarContainer = document.getElementById("editAvatarContainer");
  avatarContainer.innerHTML = `
    <div class="BigContactCircle" style="background-color: ${color};">
      ${initials}
    </div>
  `;

  setupFormButtons("edit", key); // ⬅️ das ist neu!
  toggleOverlay();
}

async function deleteContact(key, closeOverlay = false) {
  await deleteData(`users/${userKey}/contacts/${key}`);
  document.getElementById("contactsDetails").innerHTML = ""; // ❌ Details leeren
  document.getElementById("contactsDetails").classList.remove("showDetails"); // ❌ ggf. auch "ausblenden"
  await loadDataAfterSave();

    if (closeOverlay) {
    toggleOverlay();
  }
}


function activateContactCard(key) {
  document.querySelectorAll(".contactCard").forEach(card =>
    card.classList.remove("activeCard")
  );


  // Karte mit Name und Mail finden
  const container = document.getElementById("contactCardsContainer");
  const cards = container.querySelectorAll(".contactCard");


  for (let card of cards) {
    const nameText = card.querySelector(".contactName")?.innerText.trim();
    const emailText = card.querySelector(".contactMail")?.innerText.trim();
    const contact = contactsData[key];


    if (contact.name === nameText && contact.email === emailText) {
      card.classList.add("activeCard");
      break;
    }
  }
}

let currentMode = "create"; // oder 'edit'
let currentEditKey = null;  // merken, wen man bearbeitet


function setupFormButtons(mode, contactKey = null) {
  currentMode = mode;
  currentEditKey = contactKey;

  const cancelText = document.getElementById("cancelText");
  const cancelImg = document.getElementById("cancelIcon")
  const submitText = document.getElementById("submitText");
  const submitIcon = document.getElementById("submitIcon");
  const cancelBtn = document.getElementById("cancelBtn");

  if (mode === "edit") {
    cancelText.textContent = "Delete";
    submitText.textContent = "Save";
    cancelImg.style.display = "none"
    cancelBtn.onclick = () => deleteContact(contactKey, true); // ⬅️ wichtig
  } else {
    cancelText.textContent = "Cancel";
    submitText.textContent = "Create contact";
    submitIcon.src = "../img/check.png";
    cancelBtn.onclick = toggleOverlay;
  }
}

function openNewContactForm() {
  document.getElementById("contactForm").reset();
  document.getElementById("contactKey").value = "";

  const avatarContainer = document.getElementById("editAvatarContainer");
  avatarContainer.innerHTML = `<img class="pb" src="../img/Group 13.png" alt="" />`;

  setupFormButtons("create"); // ⬅️ wichtig!
  toggleOverlay();
}