
// register-validation.js

// --- Helpers ---------------------------------------------------------
const $$ = (id) => document.getElementById(id);
const getRealPw = (el) => (el?.getRealPassword?.() ?? el?.value ?? "");

function showError(inputEl){
  if(!inputEl) return;
  inputEl.classList.add('is-invalid');
  inputEl.setAttribute('aria-invalid','true');
}

function clearError(inputEl){
  if(!inputEl) return;
  inputEl.classList.remove('is-invalid');
  inputEl.removeAttribute('aria-invalid');
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
  if (v.includes(' ')) return "Password cannot contain spaces.";
  if (v.length < 3) return "Password must be at least 3 characters.";
  return ""; // Alles ok
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
  const globalError = $$("globalError");

  const checks = [
  { el: nameEl, msg: validateName(nameEl) },
  { el: emailEl, msg: validateEmail(emailEl) },
  { el: pwEl, msg: validatePassword(pwEl) },
  { el: pw2El, msg: validatePasswordRepeat(pwEl, pw2El) },
  { el: acceptEl, msg: validateAccept(acceptEl) }
  ];

  let firstError = null;
  checks.forEach(({el,msg}) => {
  if (msg) { showError(el); if(!firstError) firstError = {el,msg}; }
    else clearError(el);
  });

  if (firstError) {
    if (globalError){
      globalError.textContent = firstError.msg;
      globalError.classList.remove('is-hidden');
    }
    firstError.el?.focus?.();
    return false;
  } else if (globalError){
    globalError.textContent = '';
    globalError.classList.add('is-hidden');
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
  const globalError = $$("globalError");
  const refreshGlobal = () => {
    // Re-run the ordered rules, show first error only
    const rules = [
      { el: nameEl, msg: validateName(nameEl) },
      { el: emailEl, msg: validateEmail(emailEl) },
      { el: pwEl, msg: validatePassword(pwEl) },
      { el: pw2El, msg: validatePasswordRepeat(pwEl, pw2El) },
      { el: acceptEl, msg: validateAccept(acceptEl) }
    ];
    let first = rules.find(r => r.msg);
  rules.forEach(r => r.msg ? showError(r.el) : clearError(r.el));
    if (first) { globalError.textContent = first.msg; globalError.classList.remove('is-hidden'); }
    else { globalError.textContent=''; globalError.classList.add('is-hidden'); }
  };
  [nameEl,emailEl,pwEl,pw2El].forEach(el => {
    el?.addEventListener('input', refreshGlobal);
    el?.addEventListener('blur', refreshGlobal);
  });
  acceptEl?.addEventListener('change', refreshGlobal);
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