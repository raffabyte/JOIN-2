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
  if (!userKey) {
    console.error("UserKey is required to fetch assignable people.");
    return [];
  }
  try {
    const [allUsersData, personalContactsData] = await fetchPeopleData(userKey);
    const peopleMap = new Map();

    processUsersInMap(peopleMap, allUsersData);
    processContactsInMap(peopleMap, personalContactsData);

    return finalizePeopleList(peopleMap);
  } catch (error) {
    console.error("Error loading assignable people:", error);
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
    loadData('users'),
    loadData(`users/${userKey}/contacts`)
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
    if (user && user.email) {
      peopleMap.set(user.email, {
        name: extractNameFromEmail(user.email),
        email: user.email,
        color: user.color || getRandomColor()
      });
    }
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
    if (contact && contact.email) {
      const existingPerson = peopleMap.get(contact.email) || {};
      peopleMap.set(contact.email, {
        name: contact.name,
        email: contact.email,
        phone: contact.phone || '',
        color: contact.color || existingPerson.color || getRandomColor()
      });
    }
  });
}


/**
 * Converts the final map of people into a sorted array.
 * @param {Map<string, object>} peopleMap 
 * @returns {Array<object>} 
 */
function finalizePeopleList(peopleMap) {
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