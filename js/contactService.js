// js/services/contactService.js
/**
 * Selects a random color from the global predefined list. 
 * The color remains permanently assigned to the contact.
 * @returns {string} 
 */
function getRandomColor() {
  //Accesses the global array from main.js
  return predefinedColors[Math.floor(Math.random() * predefinedColors.length)];
}


/**
 * Orchestrates the fetching and processing of all assignable people.
 * This is the main entry point function.
 */
async function getAssignablePeople(userKey) {
  if (!userKey) { console.error("UserKey required"); return []; }
  try {
    const [allUsersData, personalContactsData, ownUser] = await fetchPeopleData(userKey);
    const peopleMap = new Map();

    processUsersInMap(peopleMap, allUsersData);

    // Eigener User immer hinzufügen (falls vorhanden)
    if (ownUser) {
      const eml = (ownUser.email || "").trim().toLowerCase();
      const key = eml || (ownUser.name || "").trim().toLowerCase();
      if (key) {
        peopleMap.set(key, {
          name: ownUser.name || extractNameFromEmail(eml),
          email: eml,
          color: ownUser.color || getRandomColor()
        });
      }
    }

    processContactsInMap(peopleMap, personalContactsData);

    const out = finalizePeopleList(peopleMap);
    // kurze Sichtprüfung
    console.log("[assignable] users:", !!allUsersData, "contacts:", !!personalContactsData, "own:", !!ownUser, "len:", out.length);
    return out;
  } catch (e) {
    console.error("Error loading assignable people:", e);
    return [];
  }
}



/**
 * Fetches global users and personal contacts data in parallel.
 * @param {string} userKey 
 * @returns {Promise<[object, object]>}
 */
async function fetchPeopleData(userKey) {
  return await Promise.all([
    loadData('users'),                    // alle Nutzer (global)
    loadData(`users/${userKey}/contacts`),// deine Kontakte
    loadData(`users/${userKey}`)          // dein eigenes User-Objekt
  ]);
}


/**
 * Processes the list of global users and adds them to the map.
 * @param {Map<string, object>} peopleMap 
 * @param {object} allUsersData
 */
function processUsersInMap(peopleMap, allUsersData) {
  if (!allUsersData) return;

  Object.values(allUsersData).forEach(user => {
    const eml = (user?.email || "").trim().toLowerCase();
    if (!eml) return;
    const key = eml;
    peopleMap.set(key, {
      name: extractNameFromEmail(eml),
      email: eml,
      color: user.color || getRandomColor()
    });
  });
}


/**
 * Processes the list of personal contacts and adds or updates them in the map.
 * @param {Map<string, object>} peopleMap 
 * @param {object} personalContactsData 
 */
function processContactsInMap(peopleMap, personalContactsData) {
  if (!personalContactsData) return;

  Object.values(personalContactsData).forEach(contact => {
    const name  = (contact?.name || "").trim();
    const email = (contact?.email || "").trim().toLowerCase();

    // Key darf Email ODER Name sein (falls Email fehlt)
    const key = (email || name).toLowerCase();
    if (!key) return;

    const existing = peopleMap.get(key) || {};
    peopleMap.set(key, {
      name:  name || extractNameFromEmail(email),
      email: email, // kann leer bleiben
      phone: contact.phone || "",
      color: contact.color || existing.color || getRandomColor()
    });
  });
}



/**
 * Converts the final map of people into a sorted array.
 * @param {Map<string, object>} peopleMap 
 * @returns {Array<object>} 
 */
function finalizePeopleList(peopleMap) {
  console.log('[contactService] finalize length=', Array.from(peopleMap.values()).length);

  const finalList = Array.from(peopleMap.values());
  finalList.sort((a, b) => a.name.localeCompare(b.name));
  return finalList;
}

// --- Utility functions that moved here from addTask.js ---

/**
* Extracts and formats a name from an email address.
 * @param {string} email
 * @returns {string}
 */
function extractNameFromEmail(email) {
  if (!email) return "Unknown";
  return email
    .split("@")[0]
    .replace(/[._]/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}


/**
* Gets the initials from a full name.
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/**
 * Builds the element for the own contact card and wires click behavior.
 * @param {{name:string,email?:string}} contact
 * @returns {{card: HTMLElement, initials: string}}
 */
function buildOwnContactCardElement(contact) {
  const initials = getInitials(contact.name);
  const card = document.createElement("div");
  card.className = "contactCard";
  card.setAttribute("data-key", "ownContact");
  card.innerHTML = getOwnContactCardHtml(contact, initials);
  return { card, initials };
}

/**
 * Adds the standard click listener for own-contact display and activation.
 * @param {HTMLElement} card
 * @param {{name:string,email?:string,phone?:string}} contact
 */
function wireOwnCardClick(card, contact) {
  card.addEventListener("click", () => {
    editingOwnContact = true;
    deactivateAllContactCards();
    activateContactCard(card);
    document.getElementById("contactsDetails").classList.add("showDetails");
    showOwnContactCardDetails(contact);
  });
}

/**
 * Creates a contact list card element with common attributes filled.
 * @param {string} key
 * @param {{name:string,email?:string,color?:string}} contact
 * @returns {HTMLElement}
 */
function createContactCardElement(key, contact) {
  const initials = getInitials(contact.name);
  const card = document.createElement("div");
  card.className = "contactCard";
  card.setAttribute("data-key", key);
  card.innerHTML = getContendCardHtml(contact, initials, contact.color);
  return card;
}

/**
 * Applies the mobile-specific setup for showing details of a contact.
 * @param {string} key
 */
function applyMobileDetailsSetup(key) {
  const container = document.querySelector(".contactsContainer");
  container.style.display = "flex";
  showcontactCardDetails(key);
  const btn = document.getElementById("mobileAddBtn");
  btn.setAttribute("onclick", "toggleMobileMenu()");
  document.getElementById("mobileBtnIcon").src = "../img/more_vert.png";
}



/**
 * Deletes a contact from Firebase and updates the UI.
 * @param {string} key - Contact key
 * @param {boolean} [closeOverlay=false] - Whether to close the overlay afterward.
 */
async function deleteContact(key, closeOverlay = false) {
  await deleteData(`users/${USERKEY}/contacts/${key}`);
  document.getElementById("contactsDetails").innerHTML = "";
  document.getElementById("contactsDetails").classList.remove("showDetails");
  await loadDataAfterSave();
  if (closeOverlay) {
    toggleOverlay();
  }
  closeMobileDetails()
  showSuccessOverlay("Contact deleted!");
}


/**
 * Reloads contacts from Firebase and re-renders the list.
 */
async function loadDataAfterSave() {
  const newContacts = await loadData(`users/${USERKEY}/contacts`);
  contactsData = newContacts;
  renderContacts(newContacts);
}


/**
 * Mobile edit handler.
 */
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

/**
 * Mobile delete handler.
 */
function handleDeleteMobile() {
  if (activeContactKey) {
    deleteContact(activeContactKey);
    toggleMobileMenu();
  }
  closeMobileDetails();
}


/**
 * Prefill edit form fields.
 * @param {{name:string,email?:string,phone?:string}} contact
 * @param {string} key
 */
function prefillFormWithContactData(contact, key) {
  document.getElementById("contactKey").value = key;
  document.getElementById("name").value = contact.name;
  document.getElementById("email").value = contact.email;
  document.getElementById("phone").value = contact.phone;
}

/**
 * Render the edit avatar with initials.
 * @param {{name:string,color?:string}} contact
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
 * Adjust UI for own-contact details on mobile.
 */
function showOwnContactDetailsMobile() {
  const container = document.querySelector(".contactsContainer");
  container.style.display = "flex";
  const btn = document.getElementById("mobileAddBtn");
  btn.setAttribute("onclick", "toggleMobileMenu()");
  document.getElementById("mobileBtnIcon").src = "../img/more_vert.png";
}

/**
 * Toggle mobile menu overlay.
 */
function toggleMobileMenu() {
  const menu = document.getElementById("menuOverlay");
  menu.classList.toggle("open");
}

/**
 * Close mobile details and reset FAB.
 */
function closeMobileDetails() {
  const container = document.querySelector(".contactsContainer");
  if (window.matchMedia("(max-width: 899px)").matches && container) {
  container.style.display = "none";
}
  deactivateAllContactCards();
  const btn = document.getElementById("mobileAddBtn");
  btn.setAttribute("onclick", "openNewContactForm()");
  document.getElementById("mobileBtnIcon").src = "../img/person_add.png";
}


/**
 * Creates a single contact list card.
 * @param {string} key - Contact key
 * @param {{name:string,email?:string,color?:string}} contact
 * @returns {HTMLElement}
 */
function createContactCard(key, contact) {
  const card = createContactCardElement(key, contact);
  card.addEventListener("click", () => {
    activeContactKey = key;
    deactivateAllContactCards();
    activateContactCard(card);
    if (window.innerWidth < 799) {
      applyMobileDetailsSetup(key);
    } else {
      showcontactCardDetails(key);
    }
  });
  return card;
}
