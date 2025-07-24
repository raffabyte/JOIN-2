/**
 * register2.js
 * Handles user registration with universal password masking via '*'.
 */

const demoContacts = [/* ... contacts ... */];

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
  const f=document.getElementById('signUpForm');
  if(!f) return;
  f.addEventListener('submit',e=>{e.preventDefault();signUp();});
}

/**
 * Masks input with '*' and toggles visibility on click.
 * @param {HTMLInputElement} i
 */
/**
 * Masks input with '*' and toggles visibility on SVG click.
 * @param {HTMLInputElement} i
 */
/**
 * Masks input with '*' and toggles visibility on SVG or background click.
 * @param {HTMLInputElement} i
 */
function applyStarMaskToPassword(i){
  let r='', v=false;
  i.getRealPassword = () => r;
  i.type = 'text';
  const w = i.closest('.password-wrapper');
  const svg = w?.querySelector('.toggle-password');
  // Update on input
  ['beforeinput','input'].forEach(evt=>{
    i.addEventListener(evt, e=>{
      if(evt==='beforeinput') r = handlePasswordInput(e, r, i, v);
      updatePasswordField(i, r, v);
      updateCursorPosition(i, v);
    });
  });
  // Toggle on SVG click
  if(svg) svg.addEventListener('click', e=>{
    e.stopPropagation();
    if(r.length){ v = !v; updatePasswordField(i, r, v); }
  });
  // Toggle on input background click (lock icon area)
  i.addEventListener('click', e=>{
    if(svg && !svg.contains(e.target) && clickedToggleArea(e, i) && r.length){
      v = !v; updatePasswordField(i, r, v);
    }
  });
  // Initialize
  setTimeout(()=>{ r = i.value; updatePasswordField(i, r, false); }, 100);
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
  // Update masked or real text
  i.value = v ? r : '*'.repeat(r.length);
  // Swap background icon: lock when visible, eye when masked
  i.classList.remove('lock_icon', 'visibility_icon');
  i.classList.add(v ? 'lock_icon' : 'visibility_icon');
  // Show inline SVG (eye) only in masked mode
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
 * Validates passwords match on both fields' input.
 */
/**
 * Validates password match and toggles error style on wrapper.
 */
/**
 * Adds listeners to validate password match and clear errors on focus.
 */
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
function showSignUpSuccessOverlay(){
  console.log('Overlay wird angezeigt');

  const o=document.getElementById('signUpSuccess');
  if(!o) return;
  o.style.display='flex';document.body.style.overflow='hidden';
  setTimeout(()=>{o.style.display='none';document.body.style.overflow='';window.location.href='../../assets/index/login.html';},3000);
}


/**
 * Liest den Wert eines Inputs aus, trimmt Leer­zeichen und gibt ihn zurück.
 * @param {string} id – die ID des Input‑Elements
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
  const n=getTrimedValue('name');
  const e=getTrimedValue('email');
  const pw1=document.getElementById('password')?.getRealPassword()||'';
  const pw2=document.getElementById('password2')?.getRealPassword()||'';
  const ok=document.getElementById('accept')?.checked;
  if(!validatePasswords(pw1,pw2)||!ok){if(!ok)alert('Please accept the privacy policy.');return;}  
  try{const r=await postData('users',{name:n,email:e,password:pw1});await preloadContacts(r.name);localStorage.setItem('loggedInUserKey',r.name);showSignUpSuccessOverlay();}catch{alert('Es ist ein Fehler aufgetreten.');}
}

/**
 * Adds demo contacts under user key.
 * @param {string} uk
 */
async function preloadContacts(uk){
  for(const c of demoContacts)await postData(`users/${uk}/contacts`,c);
}

