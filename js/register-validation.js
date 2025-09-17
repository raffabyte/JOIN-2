/**
 * Shorthand for `document.getElementById`.
 * @param {string} id - Element ID to query.
 * @returns {HTMLElement|null} The element if found, otherwise null.
 */
const $$ = (id) => document.getElementById(id);

/**
 * Retrieves the "real" password value from an input element.
 * Supports custom password components that expose `getRealPassword()`.
 * Falls back to `el.value` if no getter is present.
 *
 * @param {HTMLInputElement & { getRealPassword?: () => string }} el - Password input (or wrapper).
 * @returns {string} The password string (may be empty).
 */
const getRealPw = (el) => (el?.getRealPassword?.() ?? el?.value ?? "");

/**
 * Marks an input as invalid and sets ARIA state.
 * @param {HTMLElement} inputEl - The input element to mark invalid.
 * @returns {void}
 */
function showError(inputEl) {
  if (!inputEl) return;
  inputEl.classList.add('is-invalid');
  inputEl.setAttribute('aria-invalid', 'true');
}

/**
 * Clears invalid state and ARIA attributes from an input.
 * @param {HTMLElement} inputEl - The input element to clear.
 * @returns {void}
 */
function clearError(inputEl) {
  if (!inputEl) return;
  inputEl.classList.remove('is-invalid');
  inputEl.removeAttribute('aria-invalid');
}


/**
 * Validates the "name" field.
 * @param {HTMLInputElement} el - Name input.
 * @returns {string} Empty string if valid, otherwise the error message.
 */
function validateName(el) {
  const v = el.value.trim();
  if (!v) return "Please enter your name.";
  if (v.length < 2) return "Name must be at least 2 characters.";
  return "";
}

/**
 * Validates the format of an email address.
 * @param {string} str - Email candidate.
 * @returns {boolean} True if the format looks plausible, otherwise false.
 */
/**
 * Checks whether a string is a plausibly valid email address.
 * @param {string} str - Email candidate.
 * @returns {boolean} True if the format looks plausible.
 */
function isPlausibleEmail(str) {
  const v = String(str || '').trim();
  if (!v) return false;
  const parsed = parseEmailAddress(v);
  if (!parsed) return false;
  return isValidEmailDomain(parsed.domain);
}

/**
 * Parses an email into local and domain parts.
 * @param {string} email
 * @returns {{local:string,domain:string}|null}
 */
function parseEmailAddress(email) {
  const m = email.match(/^([A-Za-z0-9._%+-]{1,64})@([A-Za-z0-9.-]{1,253})$/);
  return m ? { local: m[1], domain: m[2] } : null;
}

/**
 * Validates an email domain according to simple label/TLD rules.
 * @param {string} domain
 * @returns {boolean}
 */
function isValidEmailDomain(domain) {
  if (domain.includes('..')) return false;
  const parts = domain.split('.');
  if (parts.length < 2) return false;
  const tld = parts[parts.length - 1];
  if (!/^[A-Za-z]{2,24}$/.test(tld)) return false;
  return parts.every(lbl => /^[A-Za-z0-9-]{1,63}$/.test(lbl) && !lbl.startsWith('-') && !lbl.endsWith('-'));
}

/**
 * Validates the "email" field using {@link isPlausibleEmail}.
 * @param {HTMLInputElement} el - Email input.
 * @returns {string} Empty string if valid, otherwise the error message.
 */
function validateEmail(el) {
  const v = el.value.trim();
  if (!v) return "Please enter an email.";
  if (!isPlausibleEmail(v)) return "Check your email";
  return "";
}

/**
 * Validates the "password" field.
 * 
 * @param {HTMLInputElement} el - Password input (or compatible wrapper).
 * @returns {string} Empty string if valid, otherwise the error message.
 */
function validatePassword(el) {
  const v = getRealPw(el);
  if (!v) return "Please enter a password.";
  if (v.includes(' ')) return "Password cannot contain spaces.";
  if (v.length < 3) return "Password must be at least 3 characters.";
  return "";
}

/**
 * Validates that the password confirmation matches the original password.
 *
 * @param {HTMLInputElement} pwEl - Original password input.
 * @param {HTMLInputElement} pw2El - Repeat password input.
 * @returns {string} Empty string if valid, otherwise the error message.
 */
function validatePasswordRepeat(pwEl, pw2El) {
  const pw1 = getRealPw(pwEl);
  const pw2 = getRealPw(pw2El);
  if (!pw2) return "Please confirm the password.";
  if (pw1 !== pw2) return "Your passwords don’t match. Please try again.";
  return "";
}

/**
 * Validates the acceptance checkbox (e.g., privacy policy).
 * @param {HTMLInputElement} el - Checkbox input.
 * @returns {string} Empty string if checked or element missing, otherwise the error message.
 */
function validateAccept(el) {
  if (!el) return "";
  return el.checked ? "" : "Please accept the privacy policy.";
}

/**
 * Runs the ordered form validation and updates UI/ARIA states.
 * @returns {boolean} True if the form is valid; false otherwise.
 */
function validateForm() {
  const nameEl = $$("name"), emailEl = $$("email"), pwEl = $$("password"), pw2El = $$("password2"), acceptEl = $$("accept");
  const globalError = $$("globalError");
  const checks = buildValidationChecks(nameEl, emailEl, pwEl, pw2El, acceptEl);
  applyErrorStates(checks);
  const firstError = findFirstError(checks);
  updateGlobalErrorBox(globalError, firstError);
  if (firstError) { firstError.el?.focus?.(); return false; }
  return true;
}

/**
 * Builds validation result objects for all fields.
 * @returns {{el:HTMLElement|null,msg:string}[]}
 */
function buildValidationChecks(nameEl, emailEl, pwEl, pw2El, acceptEl) {
  return [
    { el: nameEl,   msg: validateName(nameEl) },
    { el: emailEl,  msg: validateEmail(emailEl) },
    { el: pwEl,     msg: validatePassword(pwEl) },
    { el: pw2El,    msg: validatePasswordRepeat(pwEl, pw2El) },
    { el: acceptEl, msg: validateAccept(acceptEl) }
  ];
}

/**
 * Applies per-field invalid/valid states.
 * @param {{el:HTMLElement|null,msg:string}[]} checks
 */
function applyErrorStates(checks) {
  checks.forEach(({ el, msg }) => (msg ? showError(el) : clearError(el)));
}

/**
 * Returns the first error from checks, if any.
 * @param {{el:HTMLElement|null,msg:string}[]} checks
 * @returns {{el:HTMLElement|null,msg:string}|null}
 */
function findFirstError(checks) {
  return checks.find(c => c.msg) || null;
}

/**
 * Updates the global error element visibility and text.
 * @param {HTMLElement|null} globalError
 * @param {{el:HTMLElement|null,msg:string}|null} firstError
 */
function updateGlobalErrorBox(globalError, firstError) {
  if (!globalError) return;
  if (firstError) {
    globalError.textContent = firstError.msg;
    globalError.classList.remove('is-hidden');
  } else {
    globalError.textContent = '';
    globalError.classList.add('is-hidden');
  }
}

/**
 * Binds input/blur/change listeners for live validation feedback.
 * @returns {void}
 */
function bindLiveValidation() {
  const nameEl = $$("name"), emailEl = $$("email"), pwEl = $$("password"), pw2El = $$("password2"), acceptEl = $$("accept");
  const globalError = $$("globalError");
  const refresh = makeGlobalRefresher(nameEl, emailEl, pwEl, pw2El, acceptEl, globalError);
  [nameEl, emailEl, pwEl, pw2El].forEach(el => {
    el?.addEventListener('input', refresh);
    el?.addEventListener('blur', refresh);
  });
  acceptEl?.addEventListener('change', refresh);
}

/**
 * Creates a function that recomputes all rules and updates the UI.
 * @returns {() => void}
 */
function makeGlobalRefresher(nameEl, emailEl, pwEl, pw2El, acceptEl, globalError) {
  return () => {
    const checks = buildValidationChecks(nameEl, emailEl, pwEl, pw2El, acceptEl);
    applyErrorStates(checks);
    updateGlobalErrorBox(globalError, findFirstError(checks));
  };
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



document.addEventListener('DOMContentLoaded', () => {
  ['password', 'password2'].forEach(id => {
    const inputEl = document.getElementById(id);
    if (inputEl) applyStarMaskToPassword(inputEl);
  });
  setupLivePasswordValidation();
  bindFormSubmit();
});


/**
 * Binds submit handler for the sign-up form and runs validation.
 * Prevents default submission and calls `signUp()` when valid.
 * @returns {void}
 */
function bindFormSubmit() {
  const form = document.getElementById('signUpForm');
  if (!form) return;

  form.noValidate = true;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const isValid = typeof window.validateForm === 'function' ? window.validateForm() : true;
    if (!isValid) return;
    signUp();
  });
}


/**
 * Initializes a password input with star masking and visibility toggle.
 * Attaches listeners to manage the real password value separately.
 * @param {HTMLInputElement} inputEl - The password input element.
 */
function applyStarMaskToPassword(inputEl) {
  let realPassword = '';
  let isVisible = false;
  inputEl.getRealPassword = () => realPassword;
  inputEl.type = 'text';
  const wrapper = inputEl.closest('.password-wrapper');
  const toggleSvg = wrapper?.querySelector('.toggle-password');

  bindPasswordInputEvents(
    inputEl,
    () => realPassword,
    (val) => (realPassword = val),
    () => isVisible,
    (val) => (isVisible = val)
  );
  bindPasswordToggleEvents(inputEl, toggleSvg, () => realPassword, () => isVisible, (val) => (isVisible = val));
  scheduleInitialPasswordSync(inputEl, (val) => (realPassword = val));
}

/**
 * Schedules an initial sync of the real password and masked UI.
 * @param {HTMLInputElement} inputEl
 * @param {(v:string)=>void} setReal
 */
function scheduleInitialPasswordSync(inputEl, setReal) {
  setTimeout(() => {
    const initial = inputEl.value;
    setReal(initial);
    updatePasswordField(inputEl, initial, false);
  }, 100);
}


/**
 * Attaches input and beforeinput handlers for password masking.
 * @param {HTMLInputElement} inputEl
 * @param {() => string} getReal
 * @param {(v:string) => void} setReal
 * @param {() => boolean} getVisible
 * @param {(v:boolean) => void} setVisible
 */
function bindPasswordInputEvents(inputEl, getReal, setReal, getVisible, setVisible) {
  ['beforeinput', 'input'].forEach(eventType => {
    inputEl.addEventListener(eventType, event => {
      if (eventType === 'beforeinput') setReal(handlePasswordInput(event, getReal(), inputEl));
      updatePasswordField(inputEl, getReal(), getVisible());
      updateCursorPosition(inputEl, getVisible());
    });
  });
}


/**
 * Handles click events on the inline SVG and the lock/eye icon area.
 * @param {HTMLInputElement} inputEl
 * @param {SVGElement|null} toggleSvg
 * @param {() => string} getReal
 * @param {() => boolean} getVisible
 * @param {(v:boolean) => void} setVisible
 */
function bindPasswordToggleEvents(inputEl, toggleSvg, getReal, getVisible, setVisible) {
  if (toggleSvg) {
    toggleSvg.addEventListener('click', event => {
      event.stopPropagation();
      if (getReal().length) {
        setVisible(!getVisible());
        updatePasswordField(inputEl, getReal(), getVisible());
      }
    });
  }
  inputEl.addEventListener('click', event => {
    if (toggleSvg && !toggleSvg.contains(event.target) && clickedToggleArea(event, inputEl) && getReal().length) {
      setVisible(!getVisible());
      updatePasswordField(inputEl, getReal(), getVisible());
    }
  });
}


/**
 * Intercepts password input mutations to maintain a separate real value.
 * @param {InputEvent} event
 * @param {string} realPassword
 * @param {HTMLInputElement} inputEl
 * @returns {string} Updated real password string.
 */
function handlePasswordInput(event, realPassword, inputEl) {
  const start = inputEl.selectionStart, end = inputEl.selectionEnd;
  if (event.inputType === 'insertText' && event.data)
    realPassword = realPassword.slice(0, start) + event.data + realPassword.slice(end);
  else if (event.inputType === 'deleteContentBackward')
    realPassword = realPassword.slice(0, start - 1) + realPassword.slice(end);
  else if (event.inputType === 'deleteContentForward')
    realPassword = realPassword.slice(0, start) + realPassword.slice(end + 1);
  event.preventDefault();
  return realPassword;
}


/**
 * Sets visible value for password input and toggles icon classes/SVG state.
 * @param {HTMLInputElement} inputEl
 * @param {string} realPassword
 * @param {boolean} isVisible
 */
function updatePasswordField(inputEl, realPassword, isVisible) {
  inputEl.value = isVisible ? realPassword : '*'.repeat(realPassword.length);
  inputEl.classList.remove('lock_icon', 'visibility_icon');
  inputEl.classList.add(isVisible ? 'lock_icon' : 'visibility_icon');
  const inlineSvg = inputEl.closest('.password-wrapper')?.querySelector('.toggle-password');
  if (inlineSvg) inlineSvg.classList.toggle('visible', !isVisible);
}