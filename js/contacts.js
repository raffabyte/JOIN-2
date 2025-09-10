if (!USERKEY) {
  window.location.href = "../../index.html";
}
const basePath = `users/${USERKEY}/contacts`;

let editingOwnContact = false;
let contactsData = {};
let currentMode = "create";
let currentEditKey = null;
let activeContactKey = null;

/** Loads contacts and own contact, then renders the UI. */
document.addEventListener("DOMContentLoaded", async () => {
  const contacts = await loadData(`users/${USERKEY}/contacts`);
  const ownContact = await loadData(`users/${USERKEY}`);
  contactsData = contacts;
  renderContacts(contacts);
  renderOwnContact(ownContact);
});


/** Opens the contact form in “create new contact” mode. */
function openNewContactForm() {
  document.getElementById("contactForm").reset();
  document.getElementById("contactKey").value = "";
  clearFormValidationState();
  const avatarContainer = document.getElementById("editAvatarContainer");
  avatarContainer.innerHTML = `<img class="pb" src="../img/Group 13.png" alt="" />`;
  setupFormButtons("create");
  toggleOverlay();
}


/** Configures form buttons for create or edit mode. */
function setupFormButtons(mode, contactKey = null) {
  currentMode = mode;
  currentEditKey = contactKey;
  if (mode === "edit") {
    setupEditButtons(contactKey);
  } else {
    setupCreateButtons();
  }
}


/** Sets up the form for editing an existing contact. */
function setupEditButtons(contactKey) {
  document.getElementById("cancelText").textContent = "Delete";
  document.getElementById("submitText").textContent = "Save";
  document.getElementById("cancelIcon").style.display = "none";
  document.getElementById("cancelBtn").onclick = () => deleteContact(contactKey, true);
}


/** Sets up the form for creating a new contact. */
function setupCreateButtons() {
  document.getElementById("cancelText").textContent = "Cancel";
  document.getElementById("submitText").textContent = "Create contact";
  document.getElementById("submitIcon").src = "../img/check.png";
  document.getElementById("cancelBtn").onclick = toggleOverlay;
}


/** Toggles the visibility of the overlay. */
function toggleOverlay() {
  const overlay = document.getElementById("overlay");
  overlay.classList.contains("show") ? hideOverlay(overlay) : showOverlay(overlay);
}


/** Hides the overlay. */
function hideOverlay(overlay) {
  setTimeout(() => {
    overlay.classList.remove("show");
    setTimeout(() => overlay.classList.add("d_none"), 400);
  }, 100);
  editingOwnContact = false;
}


/** Shows the overlay. */
function showOverlay(overlay) {
  overlay.classList.remove("d_none");
  setTimeout(() => overlay.classList.add("show"), 100);
}


/** Submits the contact form to create or update a contact. */
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


/** Retrieves data from the contact form. */
function getFormData() {
  return {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    contactKey: document.getElementById("contactKey").value.trim()
  };
}


/** Updates the signed-in user’s own contact information. */
async function updateOwnUserContact(formData) {
  const { name, email, phone } = formData;
  const existingUserData = await loadData(`users/${USERKEY}`);
  const updatedUser = { ...existingUserData, name, email, phone };
  await putData(`users/${USERKEY}`, updatedUser);
  renderOwnContact(updatedUser);
  showOwnContactCardDetails(updatedUser);
  activateContactCard("ownContact");
  toggleOverlay();
  editingOwnContact = false;
}


/** Creates a new contact or updates an existing one. */
async function saveOrUpdateContact(formData) {
  const { name, email, phone, contactKey } = formData;
  if (contactKey) {
    await updateContact(name, email, phone, contactKey);
  } else {
    await createNewContact(name, email, phone);
  }
}


/** Updates an existing contact in Firebase. */
async function updateContact(name, email, phone, contactKey) {
  const existingContact = contactsData[contactKey] || {};
  const updatedContact = { ...existingContact, name, email, phone };
  await putData(`${basePath}/${contactKey}`, updatedContact);
  // update tasks that reference the old contact name
  await updateTasksAssigneeOnContactChange(existingContact.name, name);
  await loadDataAfterSave();
  showcontactCardDetails(contactKey);
  activateContactCard(contactKey);
  document.getElementById("contactsDetails").classList.add("showDetails");
}

/**
 * Replace assignee occurrences of an old contact name with the new name in all user tasks and refresh board.
 * @param {string} oldName
 * @param {string} newName
 * @returns {Promise<void>}
 */
async function updateTasksAssigneeOnContactChange(oldName, newName) {
  /**
   * Compact updater: uses helpers if defined, otherwise falls back to BASE_URL paths.
   */
  if (!oldName || oldName === newName) return;
  const tasksUrl = (typeof getUserTasksUrl === 'function') ? getUserTasksUrl() : `${window.BASE_URL}users/${USERKEY}/tasks.json`;
  const taskItem = id => (typeof getUserTaskItemUrl === 'function') ? getUserTaskItemUrl(id) : `${window.BASE_URL}users/${USERKEY}/tasks/${id}.json`;
  const tasks = await fetch(tasksUrl).then(r => r.json());
  const ops = Object.entries(tasks || {}).filter(([,t]) => Array.isArray(t.assignee) && t.assignee.includes(oldName))
    .map(([k,t]) => fetch(taskItem(k), { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ assignee: t.assignee.map(n => n === oldName ? newName : n) }) }));
  await Promise.all(ops);
  if (typeof updateBoard === 'function') updateBoard();
}


/** Creates a new contact in Firebase. */
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


/** Displays a temporary success overlay message. */
function showSuccessOverlay(message = "Contact saved successfully!") {
  const successOverlay = document.getElementById("successOverlay");
  const text = successOverlay.querySelector(".succesText");
  text.textContent = message;
  successOverlay.classList.remove("d_none");
  setTimeout(() => { successOverlay.classList.add("show"); }, 10);
  setTimeout(() => {
    successOverlay.classList.remove("show");
    setTimeout(() => { successOverlay.classList.add("d_none"); }, 400);
  }, 1500);
}


/** Renders the signed-in user’s own contact card. */
function renderOwnContact(ownContact) {
  const container = document.getElementById("ownContactArea");
  container.innerHTML = "";
  const contactCard = createOwnContactCard(ownContact);
  attachClickHandler(contactCard, ownContact);
  container.appendChild(contactCard);
}


/** Creates the card element for the own contact. */
function createOwnContactCard(contact) {
  const initials = getInitials(contact.name);
  const card = document.createElement("div");
  card.className = "contactCard";
  card.setAttribute("data-key", "ownContact");
  card.innerHTML = getOwnContactCardHtml(contact, initials);
  return card;
}


/** Attaches the click handler to a contact card. */
function attachClickHandler(card, contact) {
  card.addEventListener("click", () => {
    editingOwnContact = true;
    deactivateAllContactCards();
    activateContactCard(card);
    document.getElementById("contactsDetails").classList.add("showDetails");
    showOwnContactCardDetails(contact);
  });
}


/** Displays details for the own contact in the details panel. */
function showOwnContactCardDetails(contact) {
  const detailsContainer = document.getElementById("contactsDetails");
  detailsContainer.innerHTML = getOwnContactCardDetailsHtml(contact);
  document.getElementById("ownEditButton").addEventListener("click", () => {
    editOwnContact(contact);
  });
  if (window.innerWidth < 799) {
    showOwnContactDetailsMobile();
  }
}


/** Shows the own contact details in mobile layout. */
function showOwnContactDetailsMobile() {
  const container = document.querySelector(".contactsContainer");
  container.style.display = "flex";
  const btn = document.getElementById("mobileAddBtn");
  btn.setAttribute("onclick", "toggleMobileMenu()");
  document.getElementById("mobileBtnIcon").src = "../img/more_vert.png";
}


/** Renders all contacts grouped and listed in the UI. */
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


/** Sorts contacts alphabetically by name. */
function sortContactsByName(data) {
  return Object.entries(data).sort((a, b) => a[1].name.localeCompare(b[1].name));
}


/** Appends a letter header to the contact list. */
function appendLetterHeader(container, letter) {
  const letterHeader = document.createElement("div");
  letterHeader.className = "letterHeader";
  letterHeader.innerText = letter;
  const separatorList = document.createElement("div");
  separatorList.className = "separatorList";
  container.appendChild(letterHeader);
  container.appendChild(separatorList);
}


/** Creates a single contact card element. */
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
      showContactDetailsMobile(key);
    } else {
      showcontactCardDetails(key);
    }
  });
  return card;
}


/** Shows the contact details in mobile layout. */
function showContactDetailsMobile(key) {
  const container = document.querySelector(".contactsContainer");
  container.style.display = "flex";
  showcontactCardDetails(key);
  const btn = document.getElementById("mobileAddBtn");
  btn.setAttribute("onclick", "toggleMobileMenu()");
  document.getElementById("mobileBtnIcon").src = "../img/more_vert.png";
}


/** Toggles the mobile menu overlay. */
function toggleMobileMenu() {
  const menu = document.getElementById("menuOverlay");
  menu.classList.toggle("open");
}


document.getElementById("menuOverlay").addEventListener("click", () => {
  document.getElementById("menuOverlay").classList.remove("open");
});


/** Closes the mobile details panel and resets UI. */
function closeMobileDetails() {
  const container = document.querySelector(".contactsContainer");
  container.style.display = "none";
  deactivateAllContactCards();
  const btn = document.getElementById("mobileAddBtn");
  btn.setAttribute("onclick", "openNewContactForm()");
  document.getElementById("mobileBtnIcon").src = "../img/person_add.png";
}


/** Deactivates all contact cards. */
function deactivateAllContactCards() {
  document.querySelectorAll(".contactCard").forEach((card) => {
    card.classList.remove("activeCard");
    const circle = card.querySelector(".ownContactCircle");
    if (circle) {
      circle.style.borderColor = "black";
    }
  });
}


/** Activates a contact card by key or element. */
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


/** Displays the details for a selected contact. */
function showcontactCardDetails(key) {
  const contact = contactsData[key];
  const detailsContainer = document.getElementById("contactsDetails");
  detailsContainer.innerHTML = getContentCardDetailsHtml(contact, key);
}


/** Opens the overlay to edit the own contact. */
function editOwnContact(contact) {
  editingOwnContact = true;
  document.getElementById("name").value = contact.name;
  document.getElementById("email").value = contact.email;
  document.getElementById("phone").value = contact.phone;
  const initials = getInitials(contact.name);
  const avatarContainer = document.getElementById("editAvatarContainer");
  avatarContainer.innerHTML = `
    <div class="ownBigContactCircle">
      ${initials}
    </div>
  `;
  clearFormValidationState();
  setupFormButtons("edit", contact);
  toggleOverlay();
}


/** Opens the overlay to edit another contact. */
function editContact(key) {
  const contact = contactsData[key];
  prefillFormWithContactData(contact, key);
  renderEditAvatar(contact);
  clearFormValidationState();
  setupFormButtons("edit", key);
  toggleOverlay();
}


/** Prefills the form fields with an existing contact’s data. */
function prefillFormWithContactData(contact, key) {
  document.getElementById("contactKey").value = key;
  document.getElementById("name").value = contact.name;
  document.getElementById("email").value = contact.email;
  document.getElementById("phone").value = contact.phone;
}


/** Renders the avatar circle for the edited contact. */
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


/** Deletes a contact from Firebase. */
async function deleteContact(key, closeOverlay = false) {
  await deleteData(`users/${USERKEY}/contacts/${key}`);
  document.getElementById("contactsDetails").innerHTML = "";
  document.getElementById("contactsDetails").classList.remove("showDetails");
  await loadDataAfterSave();
  if (closeOverlay) {
    toggleOverlay();
  }
  showSuccessOverlay("Contact deleted!");
}


/** Reloads contacts from Firebase and re-renders the list. */
async function loadDataAfterSave() {
  const newContacts = await loadData(`users/${USERKEY}/contacts`);
  contactsData = newContacts;
  renderContacts(newContacts);
}


/** Handles the mobile edit action for current selection. */
function handleEditMobile() {
  if (editingOwnContact === true) {
    loadData(`users/${USERKEY}`).then((ownContact) => {
      editOwnContact(ownContact);
    });
    toggleMobileMenu();
    return;
  }
  if (activeContactKey) {
    editContact(activeContactKey);
    toggleMobileMenu();
  }
}


/** Handles the mobile delete action for current selection. */
function handleDeleteMobile() {
  if (activeContactKey) {
    deleteContact(activeContactKey);
    toggleMobileMenu();
  }
  closeMobileDetails();
}