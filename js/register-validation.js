
// register-validation.js

// --- Helpers ---------------------------------------------------------
const $$ = (id) => document.getElementById(id);
const getRealPw = (el) => (el?.getRealPassword?.() ?? el?.value ?? "");
function installErrorSlots(){
  const plan = [
    { sel: '#name',       into: null },                 // direkt nach Input
    { sel: '#email',      into: null },
    { sel: '#password',   into: '.password-field' },    // unter den ganzen PW-Block
    { sel: '#password2',  into: '.password-field' },
    { sel: '#accept',     into: '.accept_div' },        // unter Checkbox-Zeile
  ];
  plan.forEach(({sel, into}) => {
    const input = document.querySelector(sel);
    if(!input) return;
    const container = into ? input.closest(into) : input;
    // existiert schon ein Slot?
    let slot = into
      ? container.querySelector(':scope > .error-text')
      : input.nextElementSibling?.classList?.contains('error-text') ? input.nextElementSibling : null;
    if(!slot){
      slot = document.createElement('div');
      slot.className = 'error-text';
      if(into) container.appendChild(slot);
      else input.insertAdjacentElement('afterend', slot);
    }
    // initial unsichtbar, aber Platz da
    slot.style.visibility = 'hidden';
    slot.textContent = '';
  });
}

document.addEventListener('DOMContentLoaded', installErrorSlots);
/** zeigt/aktualisiert den Fehler unterhalb des Feldes */
function getErrorSlot(inputEl){
  const pwdField = inputEl.closest('.password-field');
  if(pwdField) return pwdField.querySelector(':scope > .error-text');
  const accept = inputEl.closest('.accept_div');
  if(accept) return accept.querySelector(':scope > .error-text');
  const sib = inputEl.nextElementSibling;
  return (sib && sib.classList?.contains('error-text')) ? sib : null;
}

function showError(inputEl, message){
  if(!inputEl) return;
  inputEl.classList.add('is-invalid');
  inputEl.setAttribute('aria-invalid','true');
  const slot = getErrorSlot(inputEl);
  if(slot){
    slot.textContent = message || '';
    slot.style.visibility = 'visible';
  }
}

function clearError(inputEl){
  if(!inputEl) return;
  inputEl.classList.remove('is-invalid');
  inputEl.removeAttribute('aria-invalid');
  const slot = getErrorSlot(inputEl);
  if(slot){
    slot.textContent = '';
    slot.style.visibility = 'hidden'; // Platz bleibt, kein Shift
  }
}

// --- Feldregeln ------------------------------------------------------
function validateName(el) {
  const v = el.value.trim();
  if (!v) return "Please enter your name.";
  if (v.length < 2) return "Name must be at least 2 characters.";
  return "";
}
function isPlausibleEmail(str){
  const v = String(str || '').trim();
  if (!v) return false;

  // Grundstruktur local@domain (max. Längen grob eingehalten)
  const m = v.match(/^([A-Za-z0-9._%+-]{1,64})@([A-Za-z0-9.-]{1,253})$/);
  if (!m) return false;

  const local = m[1];
  const domain = m[2];

  // Keine doppelten Punkte
  if (domain.includes('..')) return false;

  // Domain in Labels splitten (mind. 2: z.B. example + com)
  const parts = domain.split('.');
  if (parts.length < 2) return false;

  // TLD: 2–24 Buchstaben
  const tld = parts[parts.length - 1];
  if (!/^[A-Za-z]{2,24}$/.test(tld)) return false;

  // Jedes Label: 1–63, alnum oder '-', nicht mit '-' starten/enden
  if (!parts.every(lbl =>
    /^[A-Za-z0-9-]{1,63}$/.test(lbl) && !lbl.startsWith('-') && !lbl.endsWith('-')
  )) return false;

  return true;
}

function validateEmail(el){
  const v = el.value.trim();
  if (!v) return "Please enter an email.";
  if (!isPlausibleEmail(v)) return "Please enter a valid email (e.g., name@example.com).";
  return "";
}

function validatePassword(el) {
  const v = getRealPw(el);
  if (!v) return "Please enter a password.";
  const strong = v.length >= 10 && /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v);
  if (!strong) return "At least 10 chars with upper/lowercase and a number.";
  return "";
}
function validatePasswordRepeat(pwEl, pw2El) {
  const pw1 = getRealPw(pwEl);
  const pw2 = getRealPw(pw2El);
  if (!pw2) return "Please confirm the password.";
  if (pw1 !== pw2) return "Your passwords don’t match. Please try again.";
  return "";
}
function validateAccept(el) {
  // Checkbox ist in deinem Snippet nicht drin – falls vorhanden:
  if (!el) return "";
  return el.checked ? "" : "Please accept the privacy policy.";
}

// --- Gesamte Validierung --------------------------------------------
function validateForm() {
  const nameEl = $$("name");
  const emailEl = $$("email");
  const pwEl = $$("password");
  const pw2El = $$("password2");
  const acceptEl = $$("accept");      // optional vorhanden
  const msgBox = $$("msgBox");        // existiert unter dem 2. Passwort

  const errors = [];

  // Name
  const nMsg = validateName(nameEl);
  if (nMsg) { showError(nameEl, nMsg); errors.push(nameEl); } else { clearError(nameEl); }

  // Email
  const eMsg = validateEmail(emailEl);
  if (eMsg) { showError(emailEl, eMsg); errors.push(emailEl); } else { clearError(emailEl); }

  // Passwort
  const pMsg = validatePassword(pwEl);
  if (pMsg) { showError(pwEl, pMsg); errors.push(pwEl); } else { clearError(pwEl); }

  // Passwort-Wiederholung (+ msgBox benutzen)
  const p2Msg = validatePasswordRepeat(pwEl, pw2El);
  if (p2Msg) { showError(pw2El, p2Msg); errors.push(pw2El); if (msgBox) msgBox.textContent = p2Msg; }
  else { clearError(pw2El); if (msgBox) msgBox.textContent = ""; }

  // Privacy (falls vorhanden)
  const aMsg = validateAccept(acceptEl);
  if (aMsg && acceptEl) { showError(acceptEl, aMsg); errors.push(acceptEl); } 
  else if (acceptEl) { clearError(acceptEl); }

  if (errors.length) {
    errors[0].focus?.();
    return false;
  }
  return true;
}

// --- Live-Validierung (Fehler beim Tippen/Klicken entfernen) --------
function bindLiveValidation() {
  const nameEl = $$("name");
  const emailEl = $$("email");
  const pwEl = $$("password");
  const pw2El = $$("password2");
  const acceptEl = $$("accept");
  const msgBox = $$("msgBox");

  nameEl?.addEventListener("input", () => {
    if (!validateName(nameEl)) clearError(nameEl);
  });
  emailEl?.addEventListener("input", () => {
    if (!validateEmail(emailEl)) clearError(emailEl);
  });

  // deine PW-Felder arbeiten mit beforeinput/input (Masking) → hier auf beide hören
  ["beforeinput","input"].forEach(evt => {
    pwEl?.addEventListener(evt, () => {
      if (!validatePassword(pwEl)) clearError(pwEl);
      const m = validatePasswordRepeat(pwEl, pw2El);
      if (!m) { clearError(pw2El); if (msgBox) msgBox.textContent = ""; }
    });
    pw2El?.addEventListener(evt, () => {
      const m = validatePasswordRepeat(pwEl, pw2El);
      if (!m) { clearError(pw2El); if (msgBox) msgBox.textContent = ""; }
      else if (msgBox) msgBox.textContent = m;
    });
  });

  acceptEl?.addEventListener("change", () => {
    if (!validateAccept(acceptEl)) clearError(acceptEl);
  });
}

// --- Submit abfangen und (sofern ok) deine signUp() aufrufen --------
document.addEventListener("DOMContentLoaded", () => {
  bindLiveValidation();
  const form = $$("signUpForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Wenn du bereits eine signUp() Funktion hast, ruf sie jetzt auf:
    if (typeof window.signUp === "function") {
      window.signUp();
    } 
  });
});
