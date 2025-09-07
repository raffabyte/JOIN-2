// contacts-validation.js
(() => {
  const $ = (id) => document.getElementById(id);


  /** Gets the container element for the input field. */
  function getContainer(inputEl) {
    return inputEl.closest('.input-field') || inputEl.parentElement;
  }


  /** Gets the error message slot for a given input container. */
  function getErrorSlot(container) {
    return container?.querySelector(':scope > .error-text') || null;
  }


  /** Displays an error message for the specified input. */
  function showError(inputEl, msg) {
    const box = getContainer(inputEl), slot = getErrorSlot(box);
    inputEl.classList.add('is-invalid');
    inputEl.setAttribute('aria-invalid','true');
    if (slot) { slot.textContent = msg || ''; slot.style.visibility = 'visible'; }
  }


  /** Clears any displayed error message for the specified input. */
  function clearError(inputEl) {
    const box = getContainer(inputEl), slot = getErrorSlot(box);
    inputEl.classList.remove('is-invalid');
    inputEl.removeAttribute('aria-invalid');
    if (slot) { slot.textContent = ''; slot.style.visibility = 'hidden'; }
  }


  /** Validates the name field value. */
  function validateName(el) {
    const v = el.value.trim();
    if (!v) return "Please enter a name.";
    if (v.length < 2) return "Name must be at least 2 characters.";
    return "";
  }


  /** Splits an email string into local and domain parts. */
  function splitEmail(str) {
    const v = String(str||'').trim();
    if (!v) return null;
    const m = v.match(/^([A-Za-z0-9._%+-]{1,64})@([A-Za-z0-9.-]{1,253})$/);
    return m ? { local:m[1], domain:m[2] } : null;
  }


  /** Checks if the email domain is valid. */
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


  /** Validates if an email string has a plausible format. */
  function isPlausibleEmail(str) {
    const parts = splitEmail(str);
    if (!parts) return false;
    return hasValidDomain(parts.domain);
  }


  /** Validates the email field value. */
  function validateEmail(el) {
    const v = el.value.trim();
    if (!v) return "Please enter an email.";
    if (!isPlausibleEmail(v)) return "Please enter a valid email (e.g., name@example.com).";
    return "";
  }


  /** Validates the phone number field value. */
  function validatePhone(el) {
    const v = el.value.trim();
    if (!v) return "Please enter a phone number.";
    if (!/^\+?[0-9().\-\s]+$/.test(v))
      return "Only digits, spaces, (), -, . and one leading + are allowed.";
    if ((v.match(/\+/g) || []).length > 1)
      return "Only one '+' allowed and it must be at the start.";
    const digits = v.replace(/\D/g,'');
    if (digits.length < 6 || digits.length > 15)
      return "Phone should be 6–15 digits (e.g., +49 171 2345678).";
    return "";
  }


  /** Validates the contact form fields and handles error display. */
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


  /** Adds live input validation to the contact form fields. */
  function bindLiveValidation() {
    const nameEl=$('name'), emailEl=$('email'), phoneEl=$('phone');
    nameEl?.addEventListener('input', () => { if(!validateName(nameEl))  clearError(nameEl); });
    emailEl?.addEventListener('input', () => { if(!validateEmail(emailEl)) clearError(emailEl); });
    emailEl?.addEventListener('blur',  () => { const m=validateEmail(emailEl); m?showError(emailEl,m):clearError(emailEl); });
    phoneEl?.addEventListener('input', () => { if(!validatePhone(phoneEl)) clearError(phoneEl); });
    phoneEl?.addEventListener('blur',  () => { const m=validatePhone(phoneEl); m?showError(phoneEl,m):clearError(phoneEl); });
  }


  /** Binds form submission and validates before submitting. */
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


  /** Patches the default form submit handler to include validation. */
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


/** Adds dynamic active border effects on the name field. */
function addActiveBorderInteractions() {
  const nameEl = document.getElementById('name'); if(!nameEl) return;
  const on = () => nameEl.classList.add('active-border');
  nameEl.addEventListener('focus', on);
  nameEl.addEventListener('input', on);
  const reset = () => nameEl.classList.remove('active-border');
  document.getElementById('cancelBtn')?.addEventListener('click', reset);
  document.getElementById('submitBtn')?.addEventListener('click', reset);
}


/** Cleans invalid characters from phone input values. */
function cleanPhoneInput(el) {
  const old = el.value;
  let s = old.replace(/[^\d()\-\s+\.]/g, '');
  const leadPlus = s.startsWith('+');
  s = s.replace(/\+/g, '');
  if (leadPlus) s = '+' + s;
  if (s !== old) { el.value = s; }
}


/** Binds phone input to automatically sanitize its content. */
function bindPhoneSanitizer() {
  const phoneEl = document.getElementById('phone'); if(!phoneEl) return;
  phoneEl.addEventListener('input', () => cleanPhoneInput(phoneEl));
}