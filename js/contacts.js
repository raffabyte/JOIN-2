// Redirect unauthenticated users to index page
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
 * Loads contacts and the signed-in user's own contact, then renders UI.
 * Initializes global `contactsData` and triggers initial render.
 */
document.addEventListener("DOMContentLoaded", async () => {
  const contacts = await loadData(`users/${USERKEY}/contacts`);
  const ownContact = await loadData(`users/${USERKEY}`);
  contactsData = contacts;
  renderContacts(contacts);
  renderOwnContact(ownContact);
});

/**
 * Reads current form fields and returns trimmed values.
 * @returns {{name:string,email:string,phone:string,contactKey:string}}
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
 * Toggles the contacts overlay open/closed with transition.
 */
function toggleOverlay() {
  const overlay = document.getElementById("overlay");
  overlay.classList.contains("show") ? hideOverlay(overlay) : showOverlay(overlay);
}

/**
 * Hides the contacts overlay with a small delay.
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
 * Shows the contacts overlay.
 * @param {HTMLElement} overlay
 */
function showOverlay(overlay) {
  overlay.classList.remove("d_none");
  setTimeout(() => overlay.classList.add("show"), 100);
}

/**
 * Visual success toast overlay.
 * @param {string} [message="Contact saved successfully!"]
 */
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


/**
 * Submits the contact form: updates own contact or saves/updates regular contact.
 * @param {SubmitEvent} event - Form submit event.
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
 * Updates the signed-in user's own contact information in storage and UI.
 * @param {{name:string,email:string,phone:string}} formData - Form payload.
 */
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


/**
 * Creates a new contact or updates an existing one depending on form state.
 * @param {{name:string,email:string,phone:string,contactKey?:string}} formData - Form data.
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
 * Updates an existing contact in Firebase and refreshes UI.
 * Also updates tasks that reference the old contact name.
 * @param {string} name
 * @param {string} email
 * @param {string} phone
 * @param {string} contactKey
 */
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


/**
 * Creates a new contact in Firebase and activates its details view.
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
 * Renders the own-contact card into the dedicated container.
 * @param {{name:string,email?:string,phone?:string,color?:string}} ownContact
 */
function renderOwnContact(ownContact) {
  const container = document.getElementById("ownContactArea");
  container.innerHTML = "";
  const { card } = buildOwnContactCardElement(ownContact);
  wireOwnCardClick(card, ownContact);
  container.appendChild(card);
}




/**
 * Displays details for the own contact in the details panel.
 * @param {{name:string,email?:string,phone?:string}} contact
 */
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

/**
 * Renders all contacts grouped alphabetically with letter headers.
 * @param {Record<string, {name:string,email?:string,phone?:string,color?:string}>} data
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
 * Sorts contacts alphabetically by name.
 * @param {Record<string, {name:string}>} data
 * @returns {[string, any][]}
 */
function sortContactsByName(data) {
  return Object.entries(data).sort((a, b) => a[1].name.localeCompare(b[1].name));
}

/**
 * Appends a letter header and separator.
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



document.getElementById("menuOverlay").addEventListener("click", () => {
  document.getElementById("menuOverlay").classList.remove("open");
});


/**
 * Displays the details for a selected contact in the details panel.
 * @param {string} key - Contact key
 */
function showcontactCardDetails(key) {
  const contact = contactsData[key];
  const detailsContainer = document.getElementById("contactsDetails");
  detailsContainer.innerHTML = getContentCardDetailsHtml(contact, key);
}

/**
 * Remove active state from all contact cards.
 */
function deactivateAllContactCards() {
  document.querySelectorAll(".contactCard").forEach((card) => {
    card.classList.remove("activeCard");
    const circle = card.querySelector(".ownContactCircle");
    if (circle) circle.style.borderColor = "black";
  });
}

/**
 * Activate a contact card by key or element.
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
  if (circle) circle.style.borderColor = "white";
  document.getElementById("contactsDetails").classList.add("showDetails");
}

/**
 * Open the form in create mode and reset.
 */
function openNewContactForm() {
  document.getElementById("contactForm").reset();
  document.getElementById("contactKey").value = "";
  clearFormValidationState();
  const avatarContainer = document.getElementById("editAvatarContainer");
  avatarContainer.innerHTML = `<img class="pb" src="../img/Group 13.png" alt="" />`;
  setupFormButtons("create");
  toggleOverlay();
}

/**
 * Configure form buttons for mode.
 * @param {"create"|"edit"} mode
 * @param {string|null} [contactKey=null]
 */
function setupFormButtons(mode, contactKey = null) {
  currentMode = mode;
  currentEditKey = contactKey;
  if (mode === "edit") setupEditButtons(contactKey);
  else setupCreateButtons();
}

/**
 * Set edit-mode button labels/handlers.
 * @param {string} contactKey
 */
function setupEditButtons(contactKey) {
  document.getElementById("cancelText").textContent = "Delete";
  document.getElementById("submitText").textContent = "Save";
  document.getElementById("cancelIcon").style.display = "none";
  document.getElementById("cancelBtn").onclick = () => deleteContact(contactKey, true);
}

/**
 * Set create-mode button labels/handlers.
 */
function setupCreateButtons() {
  document.getElementById("cancelText").textContent = "Cancel";
  document.getElementById("submitText").textContent = "Create contact";
  document.getElementById("submitIcon").src = "../img/check.png";
  document.getElementById("cancelBtn").onclick = toggleOverlay;
}

/**
 * Open overlay to edit own contact.
 * @param {{name:string,email?:string,phone?:string}} contact
 */
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

/**
 * Open overlay to edit a contact by key.
 * @param {string} key
 */
function editContact(key) {
  const contact = contactsData[key];
  prefillFormWithContactData(contact, key);
  renderEditAvatar(contact);
  clearFormValidationState();
  setupFormButtons("edit", key);
  toggleOverlay();
}
