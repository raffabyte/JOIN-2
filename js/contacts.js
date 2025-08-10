if (!USERKEY) {
  window.location.href = "../../index.html";
}
const basePath = `users/${USERKEY}/contacts`;

let editingOwnContact = false;
let contactsData = {};
let currentMode = "create";
let currentEditKey = null;
let activeContactKey = null;

/**
 * Lädt Kontakte und eigenen Kontakt aus Firebase und rendert das UI.
 */
document.addEventListener("DOMContentLoaded", async () => {
  const contacts = await loadData(`users/${USERKEY}/contacts`);
  const ownContact = await loadData(`users/${USERKEY}`);

  contactsData = contacts; // ⬅️ global speichern
  renderContacts(contacts);
  renderOwnContact(ownContact);
});

/**
 * Öffnet das Kontaktformular im "Neuer Kontakt"-Modus.
 * löscht die inputfelder und gibt ein unbekanntes Profilbild
 */
function openNewContactForm() {
  document.getElementById("contactForm").reset();
  document.getElementById("contactKey").value = "";

  const avatarContainer = document.getElementById("editAvatarContainer");
  avatarContainer.innerHTML = `<img class="pb" src="../img/Group 13.png" alt="" />`;

  setupFormButtons("create"); // ⬅️ wichtig!
  toggleOverlay();
}

/**
 * Schaltet zwischen "create" und "edit" um und passt Button-Logik an.
 * @param {"create"|"edit"} mode
 * @param {string|null} [contactKey]
 */
function setupFormButtons(mode, contactKey = null) {
  currentMode = mode;
  currentEditKey = contactKey;

  if (mode === "edit") {
    setupEditButtons(contactKey);
  } else {
    setupCreateButtons();
  }
}

/**
 * Konfiguriert das Formular für den Bearbeitungsmodus.
 * @param {string} contactKey
 */
function setupEditButtons(contactKey) {
  document.getElementById("cancelText").textContent = "Delete";
  document.getElementById("submitText").textContent = "Save";
  document.getElementById("cancelIcon").style.display = "none";
  document.getElementById("cancelBtn").onclick = () => deleteContact(contactKey, true);
}

/**
 * Konfiguriert das Formular für den Erstellmodus.
 */
function setupCreateButtons() {
  document.getElementById("cancelText").textContent = "Cancel";
  document.getElementById("submitText").textContent = "Create contact";
  document.getElementById("submitIcon").src = "../img/check.png";
  document.getElementById("cancelBtn").onclick = toggleOverlay;
}

/**
 * Öffnet oder schließt das Overlay.
 */
function toggleOverlay() {
  const overlay = document.getElementById("overlay");
  overlay.classList.contains("show") ? hideOverlay(overlay) : showOverlay(overlay);


}

/**
 * Blendet das Overlay aus.
 * @param {HTMLElement} overlay
 */
function hideOverlay(overlay) {
  setTimeout(() => {
    overlay.classList.remove("show");
    setTimeout(() => overlay.classList.add("d_none"), 400);
  }, 100);
  editingOwnContact = false;
}

/**
 * Blendet das Overlay ein.
 * @param {HTMLElement} overlay
 */
function showOverlay(overlay) {
  overlay.classList.remove("d_none");
  setTimeout(() => overlay.classList.add("show"), 100);
}

/**
 * Verarbeitet das Kontaktformular (Speichern oder Aktualisieren).
 * @param {Event} event
 */
async function submitContact(event) {
  event.preventDefault();

  const formData = getFormData();

  if (editingOwnContact) {
    await updateOwnUserContact(formData);
    return;
  }

  await saveOrUpdateContact(formData);

  toggleOverlay();
  showSuccessOverlay();
}

/**
 * Holt die Daten aus dem Kontaktformular.
 * @returns {{name: string, email: string, phone: string, contactKey: string}}
 */
function getFormData() {
  return {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    contactKey: document.getElementById("contactKey").value.trim()
  };
}

/**
 * Speichert oder aktualisiert eigenen Kontakt.
 * @param {{name: string, email: string, phone: string, contactKey: string}} formData
 */
async function updateOwnUserContact(formData) {
  const { name, email, phone } = formData

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
  activateContactCard("ownContact");
  toggleOverlay();
  editingOwnContact = false;
}

/**
 * Speichert oder aktualisiert einen Kontakt.
 * @param {{name: string, email: string, phone: string, contactKey: string}} formData
 */
async function saveOrUpdateContact(formData) {
  const { name, email, phone, contactKey } = formData;

  if (contactKey) {
    await updateContact(name, email, phone, contactKey);
  } else {
    await createNewContact(name, email, phone);
  }
}

/**
 * Aktualisiert einen bestehenden Kontakt in Firebase.
 * @param {string} name
 * @param {string} email
 * @param {string} phone
 * @param {string} contactKey
 */
async function updateContact(name, email, phone, contactKey) {
  const existingContact = contactsData[contactKey] || {};
  const updatedContact = { ...existingContact, name, email, phone };

  await putData(`${basePath}/${contactKey}`, updatedContact);

  await loadDataAfterSave();
  showcontactCardDetails(contactKey);
  activateContactCard(contactKey);
  document.getElementById("contactsDetails").classList.add("showDetails");
}

/**
 * Erstellt einen neuen Kontakt in Firebase.
 * @param {string} name
 * @param {string} email
 * @param {string} phone
 */
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

/**
 * Zeigt einen temporären Erfolgsoverlay an.
 * @param {string} [message="Kontakt erfolgreich gespeichert!"]
 */
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

/**
 * Rendert den eigenen Kontakt im UI.
 * @param {Contact} ownContact
 */
function renderOwnContact(ownContact) {
  const container = document.getElementById("ownContactArea");
  container.innerHTML = "";

  const contactCard = createOwnContactCard(ownContact);
  attachClickHandler(contactCard, ownContact);

  container.appendChild(contactCard);
}

/**
 * Erstellt das Card-Element für den eigenen Kontakt.
 * @param {Contact} contact
 * @returns {HTMLElement}
 */
function createOwnContactCard(contact) {
  const initials = getInitials(contact.name);
  const card = document.createElement("div");
  card.className = "contactCard";
  card.setAttribute("data-key", "ownContact");
  card.innerHTML = getOwnContactCardHtml(contact, initials);
  return card;
}

/**
 * Hängt einen Klickhandler an eine Kontaktkarte an.
 * @param {HTMLElement} card
 * @param {Contact} contact
 */
function attachClickHandler(card, contact) {
  card.addEventListener("click", () => {
    editingOwnContact = true
    deactivateAllContactCards();
    activateContactCard(card);
    document.getElementById("contactsDetails").classList.add("showDetails");
    showOwnContactCardDetails(contact);
  });
}

/**
 * Zeigt die Details des eigenen Kontakts im rechten Bereich.
 * @param {Contact} contact
 */
function showOwnContactCardDetails(contact) {
  const detailsContainer = document.getElementById("contactsDetails");
  detailsContainer.innerHTML = getOwnContactCardDetailsHtml(contact);

  document.getElementById("ownEditButton").addEventListener("click", () => {
    editOwnContact(contact);
  });

  if (window.innerWidth < 799) {
    showOwnContactDetailsMobile()
  } 
}

function showOwnContactDetailsMobile() {
  const container = document.querySelector(".contactsContainer");
  container.style.display = "flex"; // Sichtbar machen

  const btn = document.getElementById("mobileAddBtn");
  btn.setAttribute("onclick", "toggleMobileMenu()");
  document.getElementById("mobileBtnIcon").src = "../img/more_vert.png"; // ← Dein Zurück-Icon
}

/**
 * Rendert alle Kontakte aus einem Objekt.
 * @param {Object.<string, Contact>} data
 */
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

/**
 * Sortiert Kontakte alphabetisch nach Namen.
 * @param {Object.<string, Contact>} data
 * @returns {[string, Contact][]}
 */
function sortContactsByName(data) {
  return Object.entries(data).sort((a, b) => a[1].name.localeCompare(b[1].name));
}

/**
 * Fügt einen Buchstaben-Header in die Kontaktliste ein.
 * @param {HTMLElement} container
 * @param {string} letter
 */
function appendLetterHeader(container, letter) {
  const letterHeader = document.createElement("div");
  letterHeader.className = "letterHeader";
  letterHeader.innerText = letter;

  const separatorList = document.createElement("div");
  separatorList.className = "separatorList";

  container.appendChild(letterHeader);
  container.appendChild(separatorList);
}

/**
 * Erstellt eine einzelne Kontaktkarte.
 * @param {string} key
 * @param {Contact} contact
 * @returns {HTMLElement}
 */
function createContactCard(key, contact) {
  const initials = getInitials(contact.name);
  const card = document.createElement("div");
  card.className = "contactCard";
  card.setAttribute("data-key", key);

  card.innerHTML = getContendCardHtml(contact, initials, contact.color);

  card.addEventListener("click", () => {
    activeContactKey = key;
    deactivateAllContactCards();
    activateContactCard(card);
    if (window.innerWidth < 799) {
    showContactDetailsMobile(key); // 👉 Funktion für Mobile
  } else {
    showcontactCardDetails(key); // 👉 Funktion für Desktop
  }
  });

  return card;
}

function showContactDetailsMobile(key) {
  const container = document.querySelector(".contactsContainer");
  container.style.display = "flex"; // Sichtbar machen

  // Optional: Inhalt aktualisieren
  showcontactCardDetails(key);

  const btn = document.getElementById("mobileAddBtn");
  btn.setAttribute("onclick", "toggleMobileMenu()");
  document.getElementById("mobileBtnIcon").src = "../img/more_vert.png"; // ← Dein Zurück-Icon
}

function toggleMobileMenu() {
  const menu = document.getElementById("menuOverlay");
  menu.classList.toggle("open");
}

document.getElementById("menuOverlay").addEventListener("click", () => {
  document.getElementById("menuOverlay").classList.remove("open");
});



function closeMobileDetails() {
  const container = document.querySelector(".contactsContainer");
  container.style.display = "none"; // Sichtbar machen

  deactivateAllContactCards();

  const btn = document.getElementById("mobileAddBtn");
  btn.setAttribute("onclick", "openNewContactForm()");
  document.getElementById("mobileBtnIcon").src = "../img/person_add.png";
}

/**
 * Blendet alle Kontaktkarten als inaktiv.
 */
function deactivateAllContactCards() {
  document.querySelectorAll(".contactCard").forEach((card) => {
    card.classList.remove("activeCard");

    const circle = card.querySelector(".ownContactCircle"); // oder .contactCircle?
    if (circle) {
      circle.style.borderColor = "black";
    }
  });
}

/**
 * Aktiviert eine Kontaktkarte im UI.
 * @param {string|HTMLElement} keyOrElement
 */
function activateContactCard(keyOrElement) {
  let card = keyOrElement;

  if (typeof card === "string") {
    card = document.querySelector(`.contactCard[data-key="${card}"]`);
    if (!card) return;
  }

  card.classList.add("activeCard");

  const circle = card.querySelector(".contactCircle") || card.querySelector(".ownContactCircle");
  if (circle) {
    circle.style.borderColor = "white";
  }

  document.getElementById("contactsDetails").classList.add("showDetails");
}

/**
 * Zeigt die vollständigen Details eines Kontakts an.
 * @param {string} key
 */
function showcontactCardDetails(key) {
  const contact = contactsData[key];

  const detailsContainer = document.getElementById("contactsDetails");
  detailsContainer.innerHTML = getContentCardDetailsHtml(contact, key);
}

/**
 * Öffnet das Overlay zum Bearbeiten des eigenen Kontakts.
 * @param {Contact} contact
 */
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

/**
 * Öffnet das Overlay zum Bearbeiten eines anderen Kontakts.
 * @param {string} key
 */
function editContact(key) {
  const contact = contactsData[key];

  prefillFormWithContactData(contact, key);
  renderEditAvatar(contact);
  setupFormButtons("edit", key);
  toggleOverlay();
}

/**
 * Füllt das Formular mit bestehenden Kontaktdaten.
 * @param {Contact} contact
 * @param {string} key
 */
function prefillFormWithContactData(contact, key) {
  document.getElementById("contactKey").value = key;
  document.getElementById("name").value = contact.name;
  document.getElementById("email").value = contact.email;
  document.getElementById("phone").value = contact.phone;
}

/**
 * Zeigt den Avatar für den bearbeiteten Kontakt.
 * @param {Contact} contact
 */
function renderEditAvatar(contact) {
  const initials = getInitials(contact.name);
  const color = contact.color;

  const avatarContainer = document.getElementById("editAvatarContainer");
  avatarContainer.innerHTML = `
    <div class="BigContactCircle" style="background-color: ${color};">
      ${initials}
    </div>
  `;
}

/**
 * Löscht einen Kontakt aus Firebase.
 * @param {string} key
 * @param {boolean} [closeOverlay=false]
 */
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

/**
 * Lädt alle Kontakte erneut aus Firebase und rendert sie.
 */
async function loadDataAfterSave() {
  const newContacts = await loadData(`users/${USERKEY}/contacts`);
  contactsData = newContacts;
  renderContacts(newContacts);
}

function handleEditMobile() {
  if (editingOwnContact === true) {
    loadData(`users/${USERKEY}`).then((ownContact) => {
      editOwnContact(ownContact);
    });
    toggleMobileMenu(); // Menü schließen
    return;
  }

  if (activeContactKey) {
    editContact(activeContactKey);
    toggleMobileMenu(); // Menü schließen
  }
}

function handleDeleteMobile() {
  if (activeContactKey) {
    deleteContact(activeContactKey);
    toggleMobileMenu(); // Menü schließen
  }
  closeMobileDetails()
}