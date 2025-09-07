
// register-validation.js

// --- Helpers ---------------------------------------------------------
const $$ = (id) => document.getElementById(id);
const getRealPw = (el) => (el?.getRealPassword?.() ?? el?.value ?? "");
function installErrorSlots(){
  const plan = [
    { sel: '#name',       into: null },                
    { sel: '#email',      into: null },
    { sel: '#password',   into: '.password-field' },  
    { sel: '#password2',  into: '.password-field' },
    { sel: '#accept',     into: '.accept_div' },       
  ];
  plan.forEach(({sel, into}) => {
    const input = document.querySelector(sel);
    if(!input) return;
    const container = into ? input.closest(into) : input;
   
    let slot = into
      ? container.querySelector(':scope > .error-text')
      : input.nextElementSibling?.classList?.contains('error-text') ? input.nextElementSibling : null;
    if(!slot){
      slot = document.createElement('div');
      slot.className = 'error-text';
      if(into) container.appendChild(slot);
      else input.insertAdjacentElement('afterend', slot);
    }
   
    slot.style.visibility = 'hidden';
    slot.textContent = '';
  });
}

document.addEventListener('DOMContentLoaded', installErrorSlots);
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
    slot.style.visibility = 'hidden'; 
  }
}

// --- Field rules ------------------------------------------------------
function validateName(el) {
  const v = el.value.trim();
  if (!v) return "Please enter your name.";
  if (v.length < 2) return "Name must be at least 2 characters.";
  return "";
}
function isPlausibleEmail(str){
  const v = String(str || '').trim();
  if (!v) return false;

  const m = v.match(/^([A-Za-z0-9._%+-]{1,64})@([A-Za-z0-9.-]{1,253})$/);
  if (!m) return false;

  const local = m[1];
  const domain = m[2];

  if (domain.includes('..')) return false;

  const parts = domain.split('.');
  if (parts.length < 2) return false;

  const tld = parts[parts.length - 1];
  if (!/^[A-Za-z]{2,24}$/.test(tld)) return false;

  if (!parts.every(lbl =>
    /^[A-Za-z0-9-]{1,63}$/.test(lbl) && !lbl.startsWith('-') && !lbl.endsWith('-')
  )) return false;

  return true;
}

function validateEmail(el){
  const v = el.value.trim();
  if (!v) return "Please enter an email.";
  if (!isPlausibleEmail(v)) return "Check your email";
  return "";
}

function validatePassword(el) {
  const v = getRealPw(el);
  if (!v) return "Please enter a password.";
  const strong = v.length >= 8 && /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v);
  if (!strong) return;
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
  if (!el) return "";
  return el.checked ? "" : "Please accept the privacy policy.";
}

// --- Validation --------------------------------------------
function validateForm() {
  const nameEl = $$("name");
  const emailEl = $$("email");
  const pwEl = $$("password");
  const pw2El = $$("password2");
  const acceptEl = $$("accept");      
  const msgBox = $$("msgBox");       

  const errors = [];

  const nMsg = validateName(nameEl);
  if (nMsg) { showError(nameEl, nMsg); errors.push(nameEl); } else { clearError(nameEl); }

  const eMsg = validateEmail(emailEl);
  if (eMsg) { showError(emailEl, eMsg); errors.push(emailEl); } else { clearError(emailEl); }

  const pMsg = validatePassword(pwEl);
  if (pMsg) { showError(pwEl, pMsg); errors.push(pwEl); } else { clearError(pwEl); }

  const p2Msg = validatePasswordRepeat(pwEl, pw2El);
  if (p2Msg) { showError(pw2El, p2Msg); errors.push(pw2El); if (msgBox) msgBox.textContent = p2Msg; }
  else { clearError(pw2El); if (msgBox) msgBox.textContent = ""; }

  const aMsg = validateAccept(acceptEl);
  if (aMsg && acceptEl) { showError(acceptEl, aMsg); errors.push(acceptEl); } 
  else if (acceptEl) { clearError(acceptEl); }

  if (errors.length) {
    errors[0].focus?.();
    return false;
  }
  return true;
}

// --- Live validation (remove typing/clicking errors) --------
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

document.addEventListener("DOMContentLoaded", () => {
  bindLiveValidation();
  const form = $$("signUpForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (typeof window.signUp === "function") {
      window.signUp();
    } 
  });
});