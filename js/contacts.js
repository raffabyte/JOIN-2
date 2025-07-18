if (!USERKEY) {
  window.location.href = "../../index.html";
}
const basePath = `users/${USERKEY}/contacts`;

let editingOwnContact = false;
let contactsData = {};
let currentMode = "create";
let currentEditKey = null;

const predefinedColors = [
  "#FF7A00",
  "#9327FF",
  "#6E52FF",
  "#FC71FF",
  "#FFBB2B",
  "#1FD7C1",
  "#462F8A",
  "#FF4646",
  "#00BEE8",
];

document.addEventListener("DOMContentLoaded", async () => {
  const contacts = await loadData(`users/${USERKEY}/contacts`);
  const ownContact = await loadData(`users/${USERKEY}`);

  contactsData = contacts; // ⬅️ global speichern
  renderContacts(contacts);
  renderOwnContact(ownContact);
});

// ---------- overlays --------------

function openNewContactForm() {
  document.getElementById("contactForm").reset();
  document.getElementById("contactKey").value = "";

  const avatarContainer = document.getElementById("editAvatarContainer");
  avatarContainer.innerHTML = `<img class="pb" src="../img/Group 13.png" alt="" />`;

  setupFormButtons("create"); // ⬅️ wichtig!
  toggleOverlay();
}

function setupFormButtons(mode, contactKey = null) {
  currentMode = mode;
  currentEditKey = contactKey;

  const cancelText = document.getElementById("cancelText");
  const cancelImg = document.getElementById("cancelIcon");
  const submitText = document.getElementById("submitText");
  const submitIcon = document.getElementById("submitIcon");
  const cancelBtn = document.getElementById("cancelBtn");

  if (mode === "edit") {
    cancelText.textContent = "Delete";
    submitText.textContent = "Save";
    cancelImg.style.display = "none";
    cancelBtn.onclick = () => deleteContact(contactKey, true); // ⬅️ wichtig
  } else {
    cancelText.textContent = "Cancel";
    submitText.textContent = "Create contact";
    submitIcon.src = "../img/check.png";
    cancelBtn.onclick = toggleOverlay;
  }
}

function toggleOverlay() {
  const overlay = document.getElementById("overlay");
  const isVisible = overlay.classList.contains("show");

  if (isVisible) {
    setTimeout(() => {
      overlay.classList.remove("show");

      setTimeout(() => {
        overlay.classList.add("d_none");
      }, 400);
    }, 100);
  } else {
    overlay.classList.remove("d_none");

    setTimeout(() => {
      overlay.classList.add("show");
    }, 100);
  }
}

async function submitContact(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const contactKey = document.getElementById("contactKey").value.trim();

  if (editingOwnContact) {
    await updateOwnUserContact({ name, email, phone });
    return;
  }

  await saveOrUpdateContact({ name, email, phone, contactKey });

  toggleOverlay();
  showSuccessOverlay();
}

async function updateOwnUserContact({ name, email, phone }) {
  const existingUserData = await loadData(`users/${USERKEY}`);

  const updatedUser = {
    ...existingUserData,
    name,
    email,
    phone,
  };

  await putData(`users/${USERKEY}`, updatedUser);

  renderOwnContact(updatedUser);
  showOwnContactCardDetails(updatedUser);
  toggleOverlay();
  editingOwnContact = false;
}

async function saveOrUpdateContact({ name, email, phone, contactKey }) {
  if (contactKey) {
    await updateContact(name, email, phone, contactKey)
  } else {
    await createNewContact(name, email, phone, contactKey);
  }
}
async function updateContact(name, email, phone, contactKey) {
  const existingContact = contactsData[contactKey] || {};
    const updatedContact = { ...existingContact, name, email, phone };

    await putData(`${basePath}/${contactKey}`, updatedContact);

    await loadDataAfterSave();
    showcontactCardDetails(contactKey);
    activateContactCard(contactKey);
    document.getElementById("contactsDetails").classList.add("showDetails");
}

async function createNewContact(name, email, phone) {
  const color = getRandomColor();
  const newContact = { name, email, phone, color };

  const result = await postData(basePath, newContact);
  const newKey = result.name;

  await loadDataAfterSave();
  showcontactCardDetails(newKey);
  activateContactCard(newKey);
  document.getElementById("contactsDetails").classList.add("showDetails");
}

function showSuccessOverlay(message = "Kontakt erfolgreich gespeichert!") {
  const successOverlay = document.getElementById("successOverlay");
  const text = successOverlay.querySelector(".succesText");
  text.textContent = message;

  successOverlay.classList.remove("d_none");

  setTimeout(() => {
    successOverlay.classList.add("show");
  }, 10);

  setTimeout(() => {
    successOverlay.classList.remove("show");
    setTimeout(() => {
      successOverlay.classList.add("d_none");
    }, 400);
  }, 1500);
}

// --------------------- Render Own and Contacts + Details

function renderOwnContact(ownContact) {
  const container = document.getElementById("ownContactArea");
  container.innerHTML = "";

  const contactCard = createOwnContactCard(ownContact);
  attachClickHandler(contactCard, ownContact);

  container.appendChild(contactCard);
}

function createOwnContactCard(contact) {
  const initials = getInitials(contact.name);
  const card = document.createElement("div");
  card.className = "contactCard";
  card.innerHTML = getOwnContactCardHtml(contact, initials);
  return card;
}

function attachClickHandler(card, contact) {
  card.addEventListener("click", () => {
    deactivateAllContactCards();
    activateContactCard(card);
    document.getElementById("contactsDetails").classList.add("showDetails");
  showOwnContactCardDetails(contact);
  });
}

function deactivateAllContactCards() {
  document.querySelectorAll(".contactCard").forEach((card) => {
    card.classList.remove("activeCard");

    const circle = card.querySelector(".ownContactCircle");
    if (circle) {
      circle.style.borderColor = "black";
    }
  });
}

function activateContactCard(card) {
  card.classList.add("activeCard");

  const circle = card.querySelector(".ownContactCircle");
  if (circle) {
    circle.style.borderColor = "white";
  }
}

function showOwnContactCardDetails(contact) {
  const detailsContainer = document.getElementById("contactsDetails");
  detailsContainer.innerHTML = getOwnContactCardDetailsHtml(contact);

  document.getElementById("ownEditButton").addEventListener("click", () => {
    editOwnContact(contact);
  });
}

// -------------------------------

function renderContacts(data) {
  const container = document.getElementById("contactCardsContainer");
  container.innerHTML = "";

  const sortedEntries = sortContactsByName(data);

  let currentLetter = null;

  for (const [key, contact] of sortedEntries) {
    const firstLetter = contact.name[0].toUpperCase();

    if (firstLetter !== currentLetter) {
      currentLetter = firstLetter;
      appendLetterHeader(container, currentLetter);
    }

    const contactCard = createContactCard(key, contact);
    container.appendChild(contactCard);
  }
}

function sortContactsByName(data) {
  return Object.entries(data).sort((a, b) => a[1].name.localeCompare(b[1].name));
}

function appendLetterHeader(container, letter) {
  const letterHeader = document.createElement("div");
  letterHeader.className = "letterHeader";
  letterHeader.innerText = letter;

  const separatorList = document.createElement("div");
  separatorList.className = "separatorList";

  container.appendChild(letterHeader);
  container.appendChild(separatorList);
}

function createContactCard(key, contact) {
  const initials = getInitials(contact.name);
  const card = document.createElement("div");
  card.className = "contactCard";
  card.innerHTML = getContendCardHtml(contact, initials, contact.color);

  card.addEventListener("click", () => {
    deactivateAllContactCards();
    activateContactCard(card);
    showContactDetails(key);
  });

  return card;
}

function deactivateAllContactCards() {
  document.querySelectorAll(".contactCard").forEach((card) => {
    card.classList.remove("activeCard");

    const circle = card.querySelector(".ownContactCircle"); // oder .contactCircle?
    if (circle) {
      circle.style.borderColor = "black";
    }
  });
}

function activateContactCard(card) {
  card.classList.add("activeCard");

  const circle = card.querySelector(".ownContactCircle"); // oder .contactCircle?
  if (circle) {
    circle.style.borderColor = "white";
  }

  document.getElementById("contactsDetails").classList.add("showDetails");
}

function showContactDetails(key) {
  showcontactCardDetails(key); // Bestehende Funktion
}

function showcontactCardDetails(key) {
  const contact = contactsData[key];

  const detailsContainer = document.getElementById("contactsDetails");
  detailsContainer.innerHTML = getContentCardDetailsHtml(contact, key);
}

function editOwnContact(contact) {
  editingOwnContact = true;

  document.getElementById("name").value = contact.name;
  document.getElementById("email").value = contact.email;
  document.getElementById("phone").value = contact.phone;

  const initials = getInitials(contact.name)

  const avatarContainer = document.getElementById("editAvatarContainer");
  avatarContainer.innerHTML = `
    <div class="ownBigContactCircle">
      ${initials}
    </div>
  `;

  setupFormButtons("edit", contact);
  toggleOverlay();
}

// ----------------- edit and delete contact

function editContact(key) {
  const contact = contactsData[key];

  document.getElementById("contactKey").value = key;
  document.getElementById("name").value = contact.name;
  document.getElementById("email").value = contact.email;
  document.getElementById("phone").value = contact.phone;

  const initials = getInitials(contact.name)

  const color = contact.color;

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
  await deleteData(`users/${USERKEY}/contacts/${key}`);
  document.getElementById("contactsDetails").innerHTML = ""; // ❌ Details leeren
  document.getElementById("contactsDetails").classList.remove("showDetails"); // ❌ ggf. auch "ausblenden"
  await loadDataAfterSave();

  if (closeOverlay) {
    toggleOverlay();
  }
  showSuccessOverlay("Kontakt gelöscht!");
}

// ---------------

async function loadDataAfterSave() {
  const newContacts = await loadData(`users/${USERKEY}/contacts`);
  contactsData = newContacts; // optional, wenn du den globalen Zustand behalten willst
  renderContacts(newContacts);
}

function getRandomColor() {
  const index = Math.floor(Math.random() * predefinedColors.length);
  return predefinedColors[index];
}

function getInitials(name) {
  if (!name) return "";
  return name
    .split(" ")
    .map(word => word[0]?.toUpperCase() || "")
    .join("")
    .substring(0, 2);
}