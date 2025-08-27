// contacts-validation.js
(() => {
  const $ = (id) => document.getElementById(id);

  function getContainer(inputEl){
    return inputEl.closest('.input-field') || inputEl.parentElement;
  }
  function getErrorSlot(container){
    return container?.querySelector(':scope > .error-text') || null;
  }
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

  function validatePhone(el){
    const v = el.value.trim();
    if(!v) return "Please enter a phone number.";
    if(!/^[+()\-.\s\d]+$/.test(v)) return "Only digits, spaces and +()- . are allowed.";
    const digits = v.replace(/\D/g,'');
    if(digits.length < 6 || digits.length > 15) return "Phone should be 6–15 digits (e.g., +49 171 2345678).";
    return "";
  }

  function validateContactForm(){
    const nameEl = $('name'), emailEl = $('email'), phoneEl = $('phone');
    const errors = [];

    const n = validateName(nameEl);
    if(n){ showError(nameEl, n); errors.push(nameEl); } else clearError(nameEl);

    const e = validateEmail(emailEl);
    if(e){ showError(emailEl, e); errors.push(emailEl); } else clearError(emailEl);

    const p = validatePhone(phoneEl);
    if(p){ showError(phoneEl, p); errors.push(phoneEl); } else clearError(phoneEl);

    if(errors.length){ errors[0].focus?.(); return false; }
    return true;
  }

  function bindLiveValidation(){
    const nameEl = $('name'), emailEl = $('email'), phoneEl = $('phone');

    nameEl?.addEventListener('input', () => { if(!validateName(nameEl))  clearError(nameEl); });
    emailEl?.addEventListener('input', () => { if(!validateEmail(emailEl)) clearError(emailEl); });
    // beim Verlassen zusätzlich prüfen & ggf. anzeigen
    emailEl?.addEventListener('blur',  () => { const m=validateEmail(emailEl); m?showError(emailEl,m):clearError(emailEl); });

    phoneEl?.addEventListener('input', () => { if(!validatePhone(phoneEl)) clearError(phoneEl); });
    phoneEl?.addEventListener('blur',  () => { const m=validatePhone(phoneEl); m?showError(phoneEl,m):clearError(phoneEl); });
  }

  // ---- Submit-Flow: wähle A oder B ----

  // A) Empfohlen: wir steuern Submit hier (entferne onsubmit="" im HTML)
  function bindSubmitA(){
    const form = document.getElementById('contactForm');
    if(!form) return;
    form.noValidate = true;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if(!validateContactForm()) return;
      // Rufe deine eigentliche Speicherfunktion auf:
      if(typeof window.submitContact === 'function'){
        window.submitContact(e); // deine vorhandene Logik
      }
    });
  }

  // B) Wenn du onsubmit="submitContact(event)" behalten willst:
  //   Passe submitContact so an, dass es zuerst validiert.
  function patchSubmitB(){
    if(typeof window.submitContact !== 'function') return;
    const orig = window.submitContact;
    window.submitContact = function(e){
      e.preventDefault();
      const form = document.getElementById('contactForm');
      if(form) form.noValidate = true;
      if(!validateContactForm()) return;
      return orig.call(this, e);
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindLiveValidation();
    // Wähle EINE der beiden Varianten:
    bindSubmitA();   // <- wenn du das onsubmit im HTML entfernst
    // patchSubmitB(); // <- wenn du onsubmit behalten willst
  });

})();
