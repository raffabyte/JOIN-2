// contacts-validation.js
(() => {
  const $ = (id) => document.getElementById(id);

  function getContainer(inputEl){ return inputEl.closest('.input-field') || inputEl.parentElement; }
  function getErrorSlot(container){ return container?.querySelector(':scope > .error-text') || null; }

  function showError(inputEl, msg){
    const box = getContainer(inputEl), slot = getErrorSlot(box);
    inputEl.classList.add('is-invalid');
    inputEl.setAttribute('aria-invalid','true');
    if(slot){ slot.textContent = msg || ''; slot.style.visibility = 'visible'; }
  }

  function clearError(inputEl){
    const box = getContainer(inputEl), slot = getErrorSlot(box);
    inputEl.classList.remove('is-invalid');
    inputEl.removeAttribute('aria-invalid');
    if(slot){ slot.textContent = ''; slot.style.visibility = 'hidden'; }
  }

  // ---- Feldregeln ----
  function validateName(el){
    const v = el.value.trim();
    if(!v) return "Please enter a name.";
    if(v.length < 2) return "Name must be at least 2 characters.";
    return "";
  }

  function splitEmail(str){
    const v = String(str||'').trim();
    if(!v) return null;
    const m = v.match(/^([A-Za-z0-9._%+-]{1,64})@([A-Za-z0-9.-]{1,253})$/);
    return m ? { local:m[1], domain:m[2] } : null;
  }

  function hasValidDomain(domain){
    if(domain.includes('..')) return false;
    const parts = domain.split('.');
    if(parts.length < 2) return false;
    const tld = parts[parts.length-1];
    if(!/^[A-Za-z]{2,24}$/.test(tld)) return false;
    return parts.every(lbl =>
      /^[A-Za-z0-9-]{1,63}$/.test(lbl) && !lbl.startsWith('-') && !lbl.endsWith('-')
    );
  }

  function isPlausibleEmail(str){
    const parts = splitEmail(str);
    if(!parts) return false;
    return hasValidDomain(parts.domain);
  }

  function validateEmail(el){
    const v = el.value.trim();
    if(!v) return "Please enter an email.";
    if(!isPlausibleEmail(v)) return "Please enter a valid email (e.g., name@example.com).";
    return "";
  }

function validatePhone(el){
  const v = el.value.trim();
  if(!v) return "Please enter a phone number.";

  // Erlaubt: optionales + am Anfang, danach Ziffern, Leerzeichen, (), -, .
  if(!/^\+?[0-9().\-\s]+$/.test(v)) 
    return "Only digits, spaces, (), -, . and one leading + are allowed.";

  // Sicherstellen, dass nur EIN + existiert und zwar nur am Anfang
  if((v.match(/\+/g) || []).length > 1) 
    return "Only one '+' allowed and it must be at the start.";

  const digits = v.replace(/\D/g,'');
  if(digits.length < 6 || digits.length > 15)
    return "Phone should be 6–15 digits (e.g., +49 171 2345678).";

  return "";
}


  function validateContactForm(){
    const triplets = [
      [$('name'),  validateName],
      [$('email'), validateEmail],
      [$('phone'), validatePhone],
    ];
    let firstErr = null;
    for(const [el, rule] of triplets){
      const msg = rule(el);
      msg ? (showError(el,msg), firstErr ??= el) : clearError(el);
    }
    if(firstErr){ firstErr.focus?.(); return false; }
    return true;
  }

  function bindLiveValidation(){
    const nameEl=$('name'), emailEl=$('email'), phoneEl=$('phone');
    nameEl?.addEventListener('input', () => { if(!validateName(nameEl))  clearError(nameEl); });
    emailEl?.addEventListener('input', () => { if(!validateEmail(emailEl)) clearError(emailEl); });
    emailEl?.addEventListener('blur',  () => { const m=validateEmail(emailEl); m?showError(emailEl,m):clearError(emailEl); });
    phoneEl?.addEventListener('input', () => { if(!validatePhone(phoneEl)) clearError(phoneEl); });
    phoneEl?.addEventListener('blur',  () => { const m=validatePhone(phoneEl); m?showError(phoneEl,m):clearError(phoneEl); });
  }

  // ---- Submit-Flow: A oder B (nur EINE aktiv lassen) ----
  function bindSubmitA(){
    const form = $('contactForm');
    if(!form) return;
    form.noValidate = true;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if(!validateContactForm()) return;
      if(typeof window.submitContact === 'function') window.submitContact(e);
    });
  }

  function patchSubmitB(){
    if(typeof window.submitContact !== 'function') return;
    const orig = window.submitContact;
    window.submitContact = function(e){
      e.preventDefault();
      const form = $('contactForm'); if(form) form.noValidate = true;
      if(!validateContactForm()) return;
      return orig.call(this, e);
    };
  }

document.addEventListener('DOMContentLoaded', () => {
  bindLiveValidation();
  bindSubmitA();          // oder patchSubmitB(); aber nur eins aktiv
  addActiveBorderInteractions();
  bindPhoneSanitizer();
});
})();

function addActiveBorderInteractions(){
  const nameEl = document.getElementById('name'); if(!nameEl) return;
  const on = () => nameEl.classList.add('active-border');
  nameEl.addEventListener('focus', on);
  nameEl.addEventListener('input', on);
  const reset = () => nameEl.classList.remove('active-border');
  document.getElementById('cancelBtn')?.addEventListener('click', reset);
  document.getElementById('submitBtn')?.addEventListener('click', reset);
}

function cleanPhoneInput(el){
  const old = el.value;
  let s = old.replace(/[^\d()\-\s+\.]/g, '');   // nur erlaubte Zeichen behalten
  const leadPlus = s.startsWith('+');           // + nur am Anfang erlauben
  s = s.replace(/\+/g, '');                     // alle + entfernen
  if (leadPlus) s = '+' + s;                    // ggf. eins vorn hinzufügen
  if (s !== old) { el.value = s; }              // caret am Ende tolerieren
}
function bindPhoneSanitizer(){
  const phoneEl = document.getElementById('phone'); if(!phoneEl) return;
  phoneEl.addEventListener('input', () => cleanPhoneInput(phoneEl));
}
