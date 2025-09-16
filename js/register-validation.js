// register-validation.js

/**
 * Lightweight helpers for registration form validation and live feedback.
 * 
 * Expectations:
 * - The form contains inputs with IDs: "name", "email", "password", "password2", "accept".
 * - A global error container with ID "globalError" exists and uses the CSS class "is-hidden" to hide.
 * - Error styling relies on toggling the "is-invalid" class and ARIA attributes.
 */

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

// --- Field rules ------------------------------------------------------

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
 * Lightweight, pragmatic email format check.
 * Validates local@domain structure, disallows double dots, requires a TLD of 2–24 letters,
 * and enforces label length/character constraints.
 *
 * @param {string} str - Email candidate.
 * @returns {boolean} True if the format looks plausible, otherwise false.
 */
function isPlausibleEmail(str) {
  const v = String(str || '').trim();
  if (!v) return false;

  const m = v.match(/^([A-Za-z0-9._%+-]{1,64})@([A-Za-z0-9.-]{1,253})$/);
  if (!m) return false;

  const domain = m[2];
  if (domain.includes('..')) return false;

  const parts = domain.split('.');
  if (parts.length < 2) return false;

  const tld = parts[parts.length - 1];
  if (!/^[A-Za-z]{2,24}$/.test(tld)) return false;

  const labelsOk = parts.every(lbl =>
    /^[A-Za-z0-9-]{1,63}$/.test(lbl) && !lbl.startsWith('-') && !lbl.endsWith('-')
  );
  if (!labelsOk) return false;

  return true;
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
 * (Trim is not applied to preserve intentional leading/trailing characters.)
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

// --- Validation --------------------------------------------

/**
 * Runs the ordered form validation and updates UI/ARIA states.
 * Shows only the first error message in the global error container if available.
 *
 * Expects:
 *  - Inputs with IDs: "name", "email", "password", "password2", "accept"
 *  - Global error element with ID: "globalError" (hidden via "is-hidden" class)
 *
 * @returns {boolean} True if the form is valid; false otherwise.
 */
function validateForm() {
  const nameEl = $$("name");
  const emailEl = $$("email");
  const pwEl = $$("password");
  const pw2El = $$("password2");
  const acceptEl = $$("accept");
  const globalError = $$("globalError");

  /** @type {{ el: HTMLElement|null, msg: string }[]} */
  const checks = [
    { el: nameEl,   msg: validateName(nameEl) },
    { el: emailEl,  msg: validateEmail(emailEl) },
    { el: pwEl,     msg: validatePassword(pwEl) },
    { el: pw2El,    msg: validatePasswordRepeat(pwEl, pw2El) },
    { el: acceptEl, msg: validateAccept(acceptEl) }
  ];

  /** @type {{ el: HTMLElement|null, msg: string } | null} */
  let firstError = null;

  checks.forEach(({ el, msg }) => {
    if (msg) {
      showError(el);
      if (!firstError) firstError = { el, msg };
    } else {
      clearError(el);
    }
  });

  if (firstError) {
    if (globalError) {
      globalError.textContent = firstError.msg;
      globalError.classList.remove('is-hidden');
    }
    firstError.el?.focus?.();
    return false;
  } else if (globalError) {
    globalError.textContent = '';
    globalError.classList.add('is-hidden');
  }
  return true;
}

// --- Live validation (remove typing/clicking errors) --------

/**
 * Binds input/blur/change listeners for live validation feedback.
 * Re-evaluates all rules in order and shows only the first error
 * in the global error container while toggling per-field invalid styles.
 *
 * @returns {void}
 */
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
      { el: nameEl,   msg: validateName(nameEl) },
      { el: emailEl,  msg: validateEmail(emailEl) },
      { el: pwEl,     msg: validatePassword(pwEl) },
      { el: pw2El,    msg: validatePasswordRepeat(pwEl, pw2El) },
      { el: acceptEl, msg: validateAccept(acceptEl) }
    ];

    const first = rules.find(r => r.msg);
    rules.forEach(r => (r.msg ? showError(r.el) : clearError(r.el)));

    if (globalError) {
      if (first) {
        globalError.textContent = first.msg;
        globalError.classList.remove('is-hidden');
      } else {
        globalError.textContent = '';
        globalError.classList.add('is-hidden');
      }
    }
  };

  [nameEl, emailEl, pwEl, pw2El].forEach(el => {
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
