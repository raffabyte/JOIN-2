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