/* register.js
 * Handles user registration with universal password masking via '*'.
 */
/**
 * Predefined demo contacts for new users.
 * @type {Array<{ name: string, email: string, phone: string, color: string }>}
 */
const demoContacts = [
  { name: "Anna Becker", email: "anna@example.com", phone: "123456789", color: "#FF7A00" },
  { name: "Tom Meier", email: "tom@example.com", phone: "987654321", color: "#FF5EB3" },
  { name: "Lisa Schmidt", email: "lisa@example.com", phone: "555123456", color: "#6E52FF" },
  { name: "Peter Braun", email: "peter@example.com", phone: "333222111", color: "#9327FF" },
  { name: "Nina Keller", email: "nina@example.com", phone: "444555666", color: "#00BEE8" },
  { name: "Max Fischer", email: "max@example.com", phone: "666777888", color: "#1FD7C1" },
  { name: "Julia König", email: "julia@example.com", phone: "777888999", color: "#FF745E" },
  { name: "Leon Wagner", email: "leon@example.com", phone: "111222333", color: "#FFA35E" },
  { name: "Emma Roth", email: "emma@example.com", phone: "222333444", color: "#FC71FF" },
  { name: "Paul Weber", email: "paul@example.com", phone: "999000111", color: "#462F8A" }
];

document.addEventListener('DOMContentLoaded', () => {
  ['password','password2'].forEach(id=>{
    const i=document.getElementById(id);
    if(i) applyStarMaskToPassword(i);
  });
  setupLivePasswordValidation();
  bindFormSubmit();
});


/**
 * Binds form submit to signUp.
 */
function bindFormSubmit(){
  const f = document.getElementById('signUpForm');
  if(!f) return;

  f.noValidate = true;

  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = typeof window.validateForm === 'function' ? window.validateForm() : true;
    if (!ok) return;       
    signUp();             
  });
}


/**
 * Init password field with masking and toggle listeners
 * @param {HTMLInputElement} i
 */
function applyStarMaskToPassword(i) {
  i.getRealPassword = () => r;
  i.type = 'text';
  const w = i.closest('.password-wrapper');
  const svg = w?.querySelector('.toggle-password');
  let r = '', v = false;

  bindPasswordInputEvents(i, () => r, (val) => r = val, () => v, (val) => v = val);
  bindPasswordToggleEvents(i, svg, () => r, () => v, (val) => v = val);
  setTimeout(() => {
    r = i.value;
    updatePasswordField(i, r, false);
  }, 100);
}


/**
 * Handles input & beforeinput events for password masking.
 */
function bindPasswordInputEvents(i, getR, setR, getV, setV) {
  ['beforeinput', 'input'].forEach(evt => {
    i.addEventListener(evt, e => {
      if (evt === 'beforeinput') setR(handlePasswordInput(e, getR(), i, getV()));
      updatePasswordField(i, getR(), getV());
      updateCursorPosition(i, getV());
    });
  });
}


/**
 * Handles click events on SVG and lock icon area.
 */
function bindPasswordToggleEvents(i, svg, getR, getV, setV) {
  if (svg) {
    svg.addEventListener('click', e => {
      e.stopPropagation();
      if (getR().length) {
        setV(!getV());
        updatePasswordField(i, getR(), getV());
      }
    });
  }
  i.addEventListener('click', e => {
    if (svg && !svg.contains(e.target) && clickedToggleArea(e, i) && getR().length) {
      setV(!getV());
      updatePasswordField(i, getR(), getV());
    }
  });
}


/**
 * Prevents default and updates real password.
 */
function handlePasswordInput(e,r,i,v){
  const s=i.selectionStart,E=i.selectionEnd;
  if(e.inputType==='insertText'&&e.data) r=r.slice(0,s)+e.data+r.slice(E);
  else if(e.inputType==='deleteContentBackward') r=r.slice(0,s-1)+r.slice(E);
  else if(e.inputType==='deleteContentForward') r=r.slice(0,s)+r.slice(E+1);
  e.preventDefault();return r;
}


/**
 * Sets field value to mask or real.
 */
/**
 * Sets field value to mask or real, toggles eye icon and CSS background.
 * @param {HTMLInputElement} i
 * @param {string} r
 * @param {boolean} v
 */
/**
 * Sets field value to mask or real, toggles background icon and ensures eye icon always visible for toggling.
 * @param {HTMLInputElement} i
 * @param {string} r
 * @param {boolean} v
 */
/**
 * Sets field value to mask or real, toggles background icon and inline SVG visibility.
 * @param {HTMLInputElement} i
 * @param {string} r
 * @param {boolean} v
 */
function updatePasswordField(i, r, v) {
  i.value = v ? r : '*'.repeat(r.length);
  i.classList.remove('lock_icon', 'visibility_icon');
  i.classList.add(v ? 'lock_icon' : 'visibility_icon');
  const svg = i.closest('.password-wrapper')?.querySelector('.toggle-password');
  if (svg) svg.classList.toggle('visible', !v);
}


/**
 * Repositions cursor after update.
 */
function updateCursorPosition(i,v){
  requestAnimationFrame(()=>{const p=v?i.selectionStart+1:i.value.length;i.setSelectionRange(p,p);});
}


/**
 * Detects click in toggle icon area.
 */
function clickedToggleArea(e,i){return e.clientX>i.getBoundingClientRect().right-40;}


/**
 * Adds listeners to validate password match on input events and clear errors on focus.
 */
function setupLivePasswordValidation(){
  const p1=document.getElementById('password'),p2=document.getElementById('password2'),m=document.getElementById('msgBox');
  if(!p1||!p2||!m) return;
  ['beforeinput','input'].forEach(evt=>{
    p1.addEventListener(evt,()=>validateMatch(p1,p2,m));
    p2.addEventListener(evt,()=>validateMatch(p1,p2,m));
  });
  p2.addEventListener('focus',()=>p2.classList.remove('input-error'));
}


/**
 * Checks if passwords match and toggles error styling.
 * @param {HTMLInputElement} p1
 * @param {HTMLInputElement} p2
 * @param {HTMLElement} msg
 */
function validateMatch(p1,p2,msg){
  const ok=p1.getRealPassword?.()===p2.getRealPassword?.();
  p2.classList.toggle('input-error',!ok);
  msg.textContent=ok?'':'Your passwords don’t match. Please try again.';
}


/**
 * Clears error and resets match state.
 */
function resetPasswordError(){
  const p2=document.getElementById('password2');
  const m=document.getElementById('msgBox');
  if(p2) p2.classList.remove('input-error');
  if(m) m.textContent='';
}


/**
 * Checks passwords equal or marks error.
 */
function validatePasswords(pw1,pw2){
  if(pw1===pw2) return true;
  const p2=document.getElementById('password2');
  const m=document.getElementById('msgBox');
  p2?.classList.add('input-error');
  m.textContent='Your passwords don’t match. Please try again.';
  return false;
}


/**
 * Shows success overlay temporarily.
 */
function showSignUpSuccessOverlay() {
  const o = document.getElementById('signUpSuccess');
  if (!o) return;

  o.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    o.style.display = 'none';
    document.body.style.overflow = '';
    window.location.href = '../../assets/index/login.html';
  }, 3000);
}


/**
 * Reads the value of an input, trims spaces and returns it.
 * @param {string} id 
 * @returns {string}
 */
function getTrimedValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}


/**
 * Submits user and preloads contacts.
 */
async function signUp(){
  console.log('signUp startet');

  resetPasswordError();
  const n = getTrimedValue('name');
  const e = getTrimedValue('email');
  const pw1 = document.getElementById('password')?.getRealPassword()||'';
  const pw2 = document.getElementById('password2')?.getRealPassword()||'';
  const ok = document.getElementById('accept')?.checked;

  if(!validatePasswords(pw1,pw2)||!ok){
    if(!ok) alert('Please accept the privacy policy.');
    return;
  }

  try {
    const r = await postData('users',{name:n,email:e,password:pw1});
    localStorage.setItem('userKey', r.name); 
    window.USERKEY = r.name;

    await preloadContacts(r.name);

    showSignUpSuccessOverlay();

  } catch(err) {
    console.error("SignUp error:", err);
    alert('Es ist ein Fehler aufgetreten.');
  }
}

/**
 * Adds demo contacts under user key with unique keys.
 * @param {string} uk
 */
async function preloadContacts(uk){
  for(const c of demoContacts){
    await postData(`users/${uk}/contacts`, c);
  }
}

/** Render contacts (grouped by initial letter) */
function renderContacts(date) {
  const c = document.getElementById("contactCardsContainer");
  if (!c) return;
  c.innerHTML = "";
  if (isNoData(date)) return;
  const entries = sortEntries(normalizeEntries(date));
  if (!entries.length) return; 
  const frag = document.createDocumentFragment();
  let cur = null;
  for (const [key, contact] of entries) {
    const letter = getFirstLetter(contact?.name);
    if (letter !== cur) { cur = letter; frag.appendChild(createSectionHeader(cur)); }
    frag.appendChild(createContactCard(key, contact));
  }
  c.appendChild(frag);
}

/** true if no meaningful data is available */
function isNoData(d) {
  if (!d) return true;
  const vals = Array.isArray(d) ? d : Object.values(d);
  return !vals.some(v => v && typeof v === "object" && (v.name || "").trim());
}

/** normalized to [key, value] tuples*/
function normalizeEntries(data) {
  if (Array.isArray(data))
    return data.map((c, i) => [String(i), c]).filter(([, c]) => c && typeof c === "object");
  return Object.entries(data || {}).filter(([, c]) => c && typeof c === "object");
}

/** sorted by name (de-DE, case-insensitive, numeric) */
function sortEntries(entries) {
  return entries
    .filter(([, c]) => typeof c.name === "string" && c.name.trim())
    .sort((a, b) => a[1].name.localeCompare(b[1].name, "de-DE", { sensitivity: "base", numeric: true }));
}

/** first letter or '#' */
function getFirstLetter(name) {
  const n = (name || "").trim();
  return n ? n[0].toLocaleUpperCase("de-DE") : "#";
}

/** Section header (divider + letter) */
function createSectionHeader(letter) {
  const w = document.createElement("div");
  const hr = document.createElement("div");
  const l = document.createElement("div");
  w.className = "contact-section";
  hr.className = "contact-section-divider";
  l.className = "contact-section-label";
  l.textContent = letter;
  w.append(hr, l);
  return w;
}

/** assemble a single contact card */
function createContactCard(key, contact) {
  const name = (contact?.name || "").trim();
  const email = (contact?.email || "").trim();
  const phone = (contact?.phone || "").trim();
  const color = (contact?.color || "#2A3647").trim();
  const card = document.createElement("div");
  const text = document.createElement("div");
  const title = document.createElement("div");
  card.className = "contact-card"; card.tabIndex = 0; card.dataset.key = key;
  text.className = "contact-text"; title.className = "contact-name"; title.textContent = name || "Unbekannt";
  text.append(title, createMeta(email, phone)); card.append(createAvatar(name, color), text);
  return card;
}

/** Avatar badge (initials + color) */
function createAvatar(name, color) {
  const a = document.createElement("div");
  a.className = "contact-avatar";
  a.style.backgroundColor = color || "#2A3647";
  a.textContent = getInitials(name || "");
  return a;
}

/** Email/Phone line */
function createMeta(email, phone) {
  const m = document.createElement("div");
  m.className = "contact-meta";
  if (email) { const a = document.createElement("a"); a.className = "contact-email"; a.href = `mailto:${email}`; a.textContent = email; m.appendChild(a); }
  if (phone) { const t = document.createElement("a"); t.className = "contact-phone"; t.href = `tel:${safeTel(phone)}`; t.textContent = phone; m.appendChild(t); }
  return m;
}

/** Initials (fallback, uses global getInitials if available) */
function getInitials(name) {
  if (typeof window.getInitials === "function") return window.getInitials(name);
  return name.split(/\s+/).filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

/** Tel-URI without spaces */
function safeTel(phone) {
  return String(phone).replace(/\s+/g, "");
}