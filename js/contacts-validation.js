// contacts-validation.js
(() => {
  /**
   * Shorthand for `document.getElementById`.
   * @param {string} id - Element id.
   * @returns {HTMLElement|null}
   */
  const $ = (id) => document.getElementById(id);


  /**
   * Gets the input's container element (wrapper) used for styling and errors.
   * @param {HTMLElement} inputEl - Input element.
   * @returns {HTMLElement|null}
   */
  function getContainer(inputEl) {
    return inputEl.closest('.input-field') || inputEl.parentElement;
  }


  /**
   * Resolves the error text node for a given container.
   * @param {HTMLElement|null} container - Input container element.
   * @returns {HTMLElement|null}
   */
  function getErrorSlot(container) {
    return container?.querySelector(':scope > .error-text') || null;
  }


  /**
   * Displays an error message and invalid state for an input.
   * @param {HTMLElement} inputEl - The input element.
   * @param {string} msg - Error message to show.
   */
  function showError(inputEl, msg) {
    const box = getContainer(inputEl), slot = getErrorSlot(box);
    inputEl.classList.add('is-invalid');
    inputEl.setAttribute('aria-invalid','true');
    if (slot) { slot.textContent = msg || ''; slot.style.visibility = 'visible'; }
  }


  /**
   * Clears error message and removes invalid state from an input.
   * @param {HTMLElement} inputEl - The input element.
   */
  function clearError(inputEl) {
    const box = getContainer(inputEl), slot = getErrorSlot(box);
    inputEl.classList.remove('is-invalid');
    inputEl.removeAttribute('aria-invalid');
    if (slot) { slot.textContent = ''; slot.style.visibility = 'hidden'; }
  }


  /**
   * Validates the name input value.
   * @param {HTMLInputElement} el - Name input.
   * @returns {string} Empty if valid, otherwise message.
   */
  function validateName(el) {
    const v = el.value.trim();
    if (!v) return "Please enter a name.";
    if (v.length < 2) return "Name must be at least 2 characters.";
    return "";
  }


  /**
   * Splits an email string into local and domain parts.
   * @param {string} str - Email string.
   * @returns {{local:string,domain:string}|null}
   */
  function splitEmail(str) {
    const v = String(str||'').trim();
    if (!v) return null;
    const m = v.match(/^([A-Za-z0-9._%+-]{1,64})@([A-Za-z0-9.-]{1,253})$/);
    return m ? { local:m[1], domain:m[2] } : null;
  }


  /**
   * Checks email domain for basic structural validity.
   * @param {string} domain - Domain portion of email.
   * @returns {boolean}
   */
  function hasValidDomain(domain) {
    if (domain.includes('..')) return false;
    const parts = domain.split('.');
    if (parts.length < 2) return false;
    const tld = parts[parts.length-1];
    if (!/^[A-Za-z]{2,24}$/.test(tld)) return false;
    return parts.every(lbl =>
      /^[A-Za-z0-9-]{1,63}$/.test(lbl) && !lbl.startsWith('-') && !lbl.endsWith('-')
    );
  }


  /**
   * Validates if an email has a plausible format.
   * @param {string} str - Email string.
   * @returns {boolean}
   */
  function isPlausibleEmail(str) {
    const parts = splitEmail(str);
    if (!parts) return false;
    return hasValidDomain(parts.domain);
  }


  /**
   * Validates the email input value.
   * @param {HTMLInputElement} el - Email input.
   * @returns {string} Empty if valid, otherwise message.
   */
  function validateEmail(el) {
    const v = el.value.trim();
    if (!v) return "Please enter an email.";
    if (!isPlausibleEmail(v)) return "Please enter a valid email";
    return "";
  }


  /**
   * Validates the phone input value.
   * @param {HTMLInputElement} el - Phone input.
   * @returns {string} Empty if valid, otherwise message.
   */
  function validatePhone(el) {
    const v = el.value.trim();
    if (!v) return "Please enter a phone number.";
    if (!/^\+?[0-9]+$/.test(v))
      return "Only numbers and an optional leading '+' are allowed.";
    const digits = v.replace(/\D/g,'');
    if (digits.length < 6 || digits.length > 15)
      return "Phone should be 6–15 digits (e.g., +491712345678).";
    return "";
  }


  /**
   * Validates name/email/phone fields and shows inline errors.
   * @returns {boolean} True when all fields are valid.
   */
  function validateContactForm() {
    const triplets = [
      [$('name'),  validateName],
      [$('email'), validateEmail],
      [$('phone'), validatePhone],
    ];
    let firstErr = null;
    for (const [el, rule] of triplets) {
      const msg = rule(el);
      msg ? (showError(el,msg), firstErr ??= el) : clearError(el);
    }
    if (firstErr) { firstErr.focus?.(); return false; }
    return true;
  }


  /**
   * Binds input/blur events to show/hide validation errors live.
   * @returns {void}
   */
  function bindLiveValidation() {
    const nameEl=$('name'), emailEl=$('email'), phoneEl=$('phone');
    nameEl?.addEventListener('input', () => { if(!validateName(nameEl))  clearError(nameEl); });
    emailEl?.addEventListener('input', () => { if(!validateEmail(emailEl)) clearError(emailEl); });
    emailEl?.addEventListener('blur',  () => { const m=validateEmail(emailEl); m?showError(emailEl,m):clearError(emailEl); });
    phoneEl?.addEventListener('input', () => { if(!validatePhone(phoneEl)) clearError(phoneEl); });
    phoneEl?.addEventListener('blur',  () => { const m=validatePhone(phoneEl); m?showError(phoneEl,m):clearError(phoneEl); });
  }


  /**
   * Binds native form submit with validation gate.
   * @returns {void}
   */
  function bindSubmitA() {
    const form = $('contactForm');
    if (!form) return;
    form.noValidate = true;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateContactForm()) return;
      if (typeof window.submitContact === 'function') window.submitContact(e);
    });
  }


  /**
   * Wraps an existing global submit handler to enforce validation.
   * @returns {void}
   */
  function patchSubmitB() {
    if (typeof window.submitContact !== 'function') return;
    const orig = window.submitContact;
    window.submitContact = function(e) {
      e.preventDefault();
      const form = $('contactForm'); if(form) form.noValidate = true;
      if (!validateContactForm()) return;
      return orig.call(this, e);
    };
  }


  document.addEventListener('DOMContentLoaded', () => {
    bindLiveValidation();
    bindSubmitA();          
    addActiveBorderInteractions();
    bindPhoneSanitizer();
  });
})();


/**
 * Adds dynamic active border effects on the name field.
 * @returns {void}
 */
function addActiveBorderInteractions() {
  const nameEl = document.getElementById('name'); if(!nameEl) return;
  const on = () => nameEl.classList.add('active-border');
  nameEl.addEventListener('focus', on);
  nameEl.addEventListener('input', on);
  const reset = () => nameEl.classList.remove('active-border');
  document.getElementById('cancelBtn')?.addEventListener('click', reset);
  document.getElementById('submitBtn')?.addEventListener('click', reset);
}


/**
 * Cleans invalid characters from phone input values (allow + and digits).
 * @param {HTMLInputElement} el - Phone input element.
 * @returns {void}
 */
function cleanPhoneInput(el) {
  const old = el.value;
  let s = old.replace(/[^\d+]/g, ''); // Allow only digits and +
  const leadPlus = s.startsWith('+');
  s = s.replace(/\+/g, ''); // Remove all +
  if (leadPlus) s = '+' + s; // Add back one + if it was at the start
  if (s !== old) { el.value = s; }
}


/**
 * Binds phone input to automatically sanitize its content on input.
 * @returns {void}
 */
function bindPhoneSanitizer() {
  const phoneEl = document.getElementById('phone'); if(!phoneEl) return;
  phoneEl.addEventListener('input', () => cleanPhoneInput(phoneEl));
}


/**
 * Entfernt alle Fehlzustände & Meldungen im Formular.
 * @param {string} [formId="contactForm"] - Ziel-Formular-ID.
 * @returns {void}
 */
function clearFormValidationState(formId = "contactForm") {
  const form = document.getElementById(formId);
  if (!form) return;

  // Klassen & ARIA entfernen
  form.querySelectorAll(".is-invalid").forEach((el) => {
    el.classList.remove("is-invalid");
    el.removeAttribute("aria-invalid");
  });

  // Fehlermeldungen leeren & verstecken
  form.querySelectorAll(".error-text").forEach((slot) => {
    slot.textContent = "";
    slot.style.visibility = "hidden";
  });
}