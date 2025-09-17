/**
 * Detects if a click is within the toggle icon area on the right.
 * @param {MouseEvent} event
 * @param {HTMLInputElement} inputEl
 * @returns {boolean}
 */
function clickedToggleArea(event, inputEl) {
  const rightEdge = inputEl.getBoundingClientRect().right;
  return event.clientX > rightEdge - 40;
}


/**
 * Adds listeners that validate password match live and clears error on focus.
 * @returns {void}
 */
function setupLivePasswordValidation() {
  const password1 = document.getElementById('password');
  const password2 = document.getElementById('password2');
  const messageBox = document.getElementById('msgBox');
  if (!password1 || !password2 || !messageBox) return;
  ['beforeinput', 'input'].forEach(eventType => {
    password1.addEventListener(eventType, () => validateMatch(password1, password2, messageBox));
    password2.addEventListener(eventType, () => validateMatch(password1, password2, messageBox));
  });
  password2.addEventListener('focus', () => password2.classList.remove('input-error'));
}


/**
 * Checks if passwords match and toggles error styling and message.
 * @param {HTMLInputElement} password1
 * @param {HTMLInputElement} password2
 * @param {HTMLElement} messageBox
 */
function validateMatch(password1, password2, messageBox) {
  const isMatch = password1.getRealPassword?.() === password2.getRealPassword?.();
  password2.classList.toggle('input-error', !isMatch);
  messageBox.textContent = isMatch ? '' : 'Your passwords don’t match. Please try again.';
}


/**
 * Clears the password mismatch error styling and message.
 */
function resetPasswordError() {
  const password2 = document.getElementById('password2');
  const messageBox = document.getElementById('msgBox');
  if (password2) password2.classList.remove('input-error');
  if (messageBox) messageBox.textContent = '';
}


/**
 * Checks passwords equality or marks the confirmation field with an error.
 * @param {string} password1
 * @param {string} password2
 * @returns {boolean}
 */
function validatePasswords(password1, password2) {
  if (password1 === password2) return true;
  const password2El = document.getElementById('password2');
  const messageBox = document.getElementById('msgBox');
  password2El?.classList.add('input-error');
  messageBox.textContent = 'Your passwords don’t match. Please try again.';
  return false;
}


/**
 * Shows sign-up success overlay briefly, then redirects to login page.
 */
function showSignUpSuccessOverlay() {
  const overlay = document.getElementById('signUpSuccess');
  if (!overlay) return;

  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    window.location.href = '../../assets/index/login.html';
  }, 3000);
}


/**
 * Reads, trims, and returns an input value by element id.
 * @param {string} id
 * @returns {string}
 */
function getTrimmedValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/** Back-compat alias (typo): getTrimedValue -> getTrimmedValue */
function getTrimedValue(id) { return getTrimmedValue(id); }


/**
 * Orchestrates the sign-up flow: validation, user creation, preload, and redirect.
 */
async function signUp() {
  console.log('signUp startet');
  resetPasswordError();
  const { name, email, password1, password2, acceptChecked } = readSignUpFormValues();
  if (!checkSignupPreconditions(password1, password2, acceptChecked)) return;
  try {
    await performSignupFlow(name, email, password1);
  } catch (err) {
    console.error('SignUp error:', err);
    alert('Es ist ein Fehler aufgetreten.');
  }
}

/**
 * Validates acceptance and password equality for sign-up.
 * @param {string} password1
 * @param {string} password2
 * @param {boolean} acceptChecked
 * @returns {boolean} True if preconditions satisfied
 */
function checkSignupPreconditions(password1, password2, acceptChecked) {
  const ok = validatePasswords(password1, password2) && acceptChecked;
  if (!ok && !acceptChecked) alert('Please accept the privacy policy.');
  return ok;
}

/**
 * Creates user, sets session, preloads contacts, seeds tasks, shows success.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 */
async function performSignupFlow(name, email, password) {
  const response = await postData('users', { name, email, password });
  setLoggedInState(response.name);
  await preloadAndSeed(response.name);
  showSignUpSuccessOverlay();
}

/**
 * Reads current values from the sign-up form controls.
 * @returns {{name:string,email:string,password1:string,password2:string,acceptChecked:boolean}}
 */
function readSignUpFormValues() {
  return {
    name: getTrimmedValue('name'),
    email: getTrimmedValue('email'),
    password1: document.getElementById('password')?.getRealPassword() || '',
    password2: document.getElementById('password2')?.getRealPassword() || '',
    acceptChecked: !!document.getElementById('accept')?.checked,
  };
}

/**
 * Sets local session state after successful user creation.
 * @param {string} userKey
 */
function setLoggedInState(userKey) {
  localStorage.setItem('loggedInUserKey', userKey);
  window.USERKEY = userKey;
}

/**
 * Preloads demo contacts and seeds starter tasks for a user.
 * @param {string} userKey
 */
async function preloadAndSeed(userKey) {
  await preloadContacts(userKey);
  await seedUserTasksIfEmpty();
}

/**
 * Adds demo contacts under the provided user key.
 * @param {string} userKey
 */
async function preloadContacts(userKey) {
  for (const contact of demoContacts) {
    await postData(`users/${userKey}/contacts`, contact);
  }
}

/**
 * Renders contacts grouped by initial letter into the container.
 * @param {Record<string, any>|Array<any>} data
 */
function renderContacts(data) {
  const container = document.getElementById('contactCardsContainer');
  if (!container) return;
  container.innerHTML = '';
  if (isNoData(data)) return;
  const entries = sortEntries(normalizeEntries(data));
  if (!entries.length) return;
  container.appendChild(buildContactListFragment(entries));
}

/**
 * Builds a document fragment of contact sections and cards.
 * @param {Array<[string, any]>} entries
 * @returns {DocumentFragment}
 */
function buildContactListFragment(entries) {
  const fragment = document.createDocumentFragment();
  let currentLetter = null;
  for (const [key, contact] of entries) {
    const letter = getFirstLetter(contact?.name);
    if (letter !== currentLetter) {
      currentLetter = letter;
      fragment.appendChild(createSectionHeader(currentLetter));
    }
    fragment.appendChild(createContactCard(key, contact));
  }
  return fragment;
}

/**
 * Returns true if no meaningful contact data is available.
 * @param {unknown} data
 * @returns {boolean}
 */
function isNoData(data) {
  if (!data) return true;
  const values = Array.isArray(data) ? data : Object.values(data);
  return !values.some(value => value && typeof value === 'object' && (value.name || '').trim());
}

/**
 * Normalizes input into [key, value] entry tuples.
 * @param {Record<string, any>|Array<any>} data
 * @returns {Array<[string, any]>}
 */
function normalizeEntries(data) {
  if (Array.isArray(data))
    return data
      .map((contact, index) => [String(index), contact])
      .filter(([, item]) => item && typeof item === 'object');
  return Object.entries(data || {}).filter(([, item]) => item && typeof item === 'object');
}

/**
 * Sorts [key, contact] entries by name using de-DE locale.
 * @param {Array<[string, {name:string}]>} entries
 * @returns {Array<[string, any]>}
 */
function sortEntries(entries) {
  return entries
    .filter(([, contact]) => typeof contact.name === 'string' && contact.name.trim())
    .sort((entryA, entryB) => entryA[1].name.localeCompare(entryB[1].name, 'de-DE', { sensitivity: 'base', numeric: true }));
}

/**
 * Returns first letter of name (uppercase) or '#'.
 * @param {string} name
 * @returns {string}
 */
function getFirstLetter(name) {
  const trimmed = (name || '').trim();
  return trimmed ? trimmed[0].toLocaleUpperCase('de-DE') : '#';
}

/**
 * Creates a section header element for a letter group.
 * @param {string} letter
 * @returns {HTMLDivElement}
 */
function createSectionHeader(letter) {
  const wrapper = document.createElement('div');
  const divider = document.createElement('div');
  const label = document.createElement('div');
  wrapper.className = 'contact-section';
  divider.className = 'contact-section-divider';
  label.className = 'contact-section-label';
  label.textContent = letter;
  wrapper.append(divider, label);
  return wrapper;
}

/**
 * Builds a single contact card element.
 * @param {string} key
 * @param {{name?:string,email?:string,phone?:string,color?:string}} contact
 * @returns {HTMLDivElement}
 */
function createContactCard(key, contact) {
  const name = (contact?.name || '').trim();
  const email = (contact?.email || '').trim();
  const phone = (contact?.phone || '').trim();
  const color = (contact?.color || '#2A3647').trim();
  const card = document.createElement('div');
  const text = document.createElement('div');
  const title = document.createElement('div');
  card.className = 'contact-card'; card.tabIndex = 0; card.dataset.key = key;
  text.className = 'contact-text'; title.className = 'contact-name'; title.textContent = name || 'Unbekannt';
  text.append(title, createMeta(email, phone)); card.append(createAvatar(name, color), text);
  return card;
}

/**
 * Creates an avatar badge with initials and background color.
 * @param {string} name
 * @param {string} color
 * @returns {HTMLDivElement}
 */
function createAvatar(name, color) {
  const avatar = document.createElement('div');
  avatar.className = 'contact-avatar';
  avatar.style.backgroundColor = color || '#2A3647';
  avatar.textContent = getInitials(name || '');
  return avatar;
}

/**
 * Creates a metadata line containing email/phone anchors.
 * @param {string} email
 * @param {string} phone
 * @returns {HTMLDivElement}
 */
function createMeta(email, phone) {
  const meta = document.createElement('div');
  meta.className = 'contact-meta';
  if (email) {
    const anchor = document.createElement('a');
    anchor.className = 'contact-email';
    anchor.href = `mailto:${email}`;
    anchor.textContent = email;
    meta.appendChild(anchor);
  }
  if (phone) {
    const tel = document.createElement('a');
    tel.className = 'contact-phone';
    tel.href = `tel:${safeTel(phone)}`;
    tel.textContent = phone;
    meta.appendChild(tel);
  }
  return meta;
}

/** Initials (fallback, uses global getInitials if available) */
function getInitials(name) {
  if (typeof window.getInitials === 'function') return window.getInitials(name);
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Formats a phone string to a tel: URI by removing spaces.
 * @param {string} phone
 * @returns {string}
 */
function safeTel(phone) {
  return String(phone).replace(/\s+/g, '');
}


/**
 * Repositions cursor after password field update.
 * @param {HTMLInputElement} inputEl
 * @param {boolean} isVisible
 */
function updateCursorPosition(inputEl, isVisible) {
  requestAnimationFrame(() => {
    const pos = isVisible ? inputEl.selectionStart + 1 : inputEl.value.length;
    inputEl.setSelectionRange(pos, pos);
  });
}