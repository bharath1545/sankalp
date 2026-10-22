/* ================= SETTINGS ================= */
const START = new Date("2026-11-27T10:30:00+05:30"); // Hackathon opening, IST
const SUBMISSION_ENDPOINT = "/api/submit";
const MAX_ABSTRACT_MB = 3;

/* ============== page navigation ============== */
const pageAliases={top:'home',committee:'organisers',submit:'registration'};
const pageLinks=[...document.querySelectorAll('nav a[href^="#"]')];
const mobileMenuToggle=document.querySelector('.mobile-menu-toggle');
const navigation=document.querySelector('nav');
const viewGroups={
  home:['home'],
  organisers:['organisers'],
  registration:['registration'],
  dates:['dates'],
};

let navigationSequence=0;
let currentView='';

function closeMobileMenu(){
  navigation.classList.remove('mobile-menu-open');
  mobileMenuToggle.setAttribute('aria-expanded','false');
  mobileMenuToggle.setAttribute('aria-label','Open navigation menu');
  mobileMenuToggle.querySelector('span:last-child').textContent='Menu';
}

function playPageTurn(elements,keyframes,duration,easing){
  const animations=elements.map(el=>el.animate(keyframes,{duration,easing,fill:'forwards'}));
  return new Promise(resolve=>{
    let settled=false;
    const finish=()=>{
      if(settled)return;
      settled=true;
      clearTimeout(fallback);
      animations.forEach(animation=>animation.cancel());
      resolve();
    };
    const fallback=setTimeout(finish,duration+120);
    Promise.all(animations.map(animation=>animation.finished.catch(()=>{}))).then(finish);
  });
}

function showPage(animate=false){
  const requested=location.hash.slice(1)||'home';
  const view=pageAliases[requested]||requested;
  const available=[...new Set([...document.querySelectorAll('[data-view]')].map(el=>el.dataset.view))];
  const activeView=available.includes(view)?view:'home';
  const activeGroup=viewGroups[activeView]||[activeView];
  const sequence=++navigationSequence;
  const views=[...document.querySelectorAll('[data-view]')];
  const outgoing=views.filter(el=>!el.hidden&&!activeGroup.includes(el.dataset.view));
  const incoming=views.filter(el=>el.hidden&&activeGroup.includes(el.dataset.view));

  async function turnPages(){
    const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(animate&&!reducedMotion&&outgoing.length){
      document.body.classList.add('page-turning');
      await playPageTurn(outgoing,
        [{transform:'perspective(1500px) rotateY(0deg)',opacity:1,filter:'brightness(1)'},{transform:'perspective(1500px) rotateY(-82deg)',opacity:.25,filter:'brightness(.55)'}],
        460,'cubic-bezier(.7,0,.3,1)');
      if(sequence!==navigationSequence)return;
    }

    views.forEach(el=>{
      el.hidden=!activeGroup.includes(el.dataset.view);
    });
    if(animate&&!reducedMotion){
      await playPageTurn(incoming,
        [{transform:'perspective(1500px) rotateY(82deg)',opacity:.25,filter:'brightness(.55)'},{transform:'perspective(1500px) rotateY(0deg)',opacity:1,filter:'brightness(1)'}],
        520,'cubic-bezier(.2,.7,.25,1)');
      if(sequence!==navigationSequence)return;
    }
    incoming.forEach(el=>el.getAnimations().forEach(animation=>animation.cancel()));
    currentView=activeView;
    document.body.classList.remove('page-turning');
    window.scrollTo({top:0,behavior:'instant'});
  }

  turnPages();
  pageLinks.forEach(link=>{
    const target=link.getAttribute('href').slice(1);
    const targetView=pageAliases[target]||target;
    if(target===requested)link.setAttribute('aria-current','page');
    else link.removeAttribute('aria-current');
  });
  closeMobileMenu();
}

if(!location.hash)history.replaceState(null,'','#home');
window.addEventListener('hashchange',()=>showPage(true));
showPage();
mobileMenuToggle.addEventListener('click',()=>{
  const open=mobileMenuToggle.getAttribute('aria-expanded')!=='true';
  navigation.classList.toggle('mobile-menu-open',open);
  mobileMenuToggle.setAttribute('aria-expanded',String(open));
  mobileMenuToggle.setAttribute('aria-label',open?'Close navigation menu':'Open navigation menu');
  mobileMenuToggle.querySelector('span:last-child').textContent=open?'Close':'Menu';
});
pageLinks.forEach(link=>link.addEventListener('click',closeMobileMenu));
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){
    closeMobileMenu();
  }
});

/* ============== team registration and abstract submission ============== */
const registrationForm=document.getElementById('registrationForm');
const abstractFile=document.getElementById('abstractFile');
const abstractFileName=document.getElementById('abstractFileName');
const formMessage=document.getElementById('formMessage');
const sendButton=document.getElementById('sendBtn');
const registrationSuccess=document.getElementById('registrationSuccess');
const allowedAbstract=/\.(pdf|docx?)$/i;

function showFormMessage(text,type=''){
  formMessage.textContent=text;
  formMessage.className=type;
}

function showRegistrationSuccess(){
  const registrationSection=registrationForm.closest('.wrap');
  registrationSection.querySelector('h2').hidden=true;
  registrationSection.querySelector('.lead').hidden=true;
  registrationForm.hidden=true;
  registrationSuccess.hidden=false;
}

abstractFile.addEventListener('change',()=>{
  const file=abstractFile.files[0];
  abstractFileName.textContent=file?`Selected: ${file.name} (${(file.size/1048576).toFixed(2)} MB)`:''; 
});

async function fileToBase64(file){
  const bytes=new Uint8Array(await file.arrayBuffer());
  let binary='';
  for(let offset=0;offset<bytes.length;offset+=0x8000){
    binary+=String.fromCharCode(...bytes.subarray(offset,offset+0x8000));
  }
  return btoa(binary);
}

registrationForm.addEventListener('submit',async event=>{
  event.preventDefault();
  const invalid=[];
  ['teamName','collegeName','leaderPhone','themeChoice'].forEach(id=>{
    const input=document.getElementById(id);
    if(!input.value.trim())invalid.push(input);
  });
  const phone=document.getElementById('leaderPhone');
  if(!/^[6-9]\d{9}$/.test(phone.value.replace(/\D/g,'').slice(-10)))invalid.push(phone);

  const emails=new Set();
  const usns=new Set();
  registrationForm.querySelectorAll('[data-member]').forEach((member,index)=>{
    const inputs=[...member.querySelectorAll('input')];
    const values=inputs.map(input=>input.value.trim());
    const hasAnyValue=values.some(Boolean);
    if(index===0||hasAnyValue){
      inputs.forEach((input,inputIndex)=>{
        if(!values[inputIndex])invalid.push(input);
      });
    }
    const [name,usn,email]=inputs;
    if(usn.value.trim()){
      if(!/^[A-Za-z0-9]{8,12}$/.test(usn.value.trim()))invalid.push(usn);
      const normalizedUsn=usn.value.trim().toUpperCase();
      if(usns.has(normalizedUsn))invalid.push(usn);
      usns.add(normalizedUsn);
    }
    if(email.value.trim()){
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()))invalid.push(email);
      const normalizedEmail=email.value.trim().toLowerCase();
      if(emails.has(normalizedEmail))invalid.push(email);
      emails.add(normalizedEmail);
    }
  });

  const file=abstractFile.files[0];
  if(!file||!allowedAbstract.test(file.name)||file.size>MAX_ABSTRACT_MB*1048576){
    event.preventDefault();
    showFormMessage(`Attach a PDF, DOC, or DOCX abstract no larger than ${MAX_ABSTRACT_MB} MB.`,'err');
    abstractFile.focus();
    return;
  }
  if(invalid.length){
    event.preventDefault();
    showFormMessage('Complete the required team details. Optional members must have all three fields completed. USNs and emails must be valid and unique.','err');
    invalid[0].focus();
    return;
  }
  sendButton.disabled=true;
  sendButton.textContent='Submitting…';
  showFormMessage('Sending your registration details and abstract to the organizer…');

  try{
    const data=new FormData(registrationForm);
    const file=abstractFile.files[0];
    const payload={
      teamName:data.get('Team name'),
      college:data.get('College'),
      leaderPhone:data.get('Leader phone'),
      theme:data.get('Challenge theme'),
      members:[1,2,3].map(number=>({
        name:data.get(`Member ${number} name`),
        usn:data.get(`Member ${number} USN`),
        email:data.get(`Member ${number} email`),
      })),
      website:data.get('_honey'),
      attachment:{
        name:file.name,
        type:file.type,
        content:await fileToBase64(file),
      },
    };
    const response=await fetch(SUBMISSION_ENDPOINT,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(payload),
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok||result.success!==true){
      throw new Error(result.error||'Email service could not accept the registration.');
    }

    registrationForm.reset();
    abstractFileName.textContent='';
    showRegistrationSuccess();
  }catch(error){
    console.error('Registration email failed:',error);
    const reason=error instanceof Error?error.message:'Unknown network error';
    showFormMessage(`Your registration was not sent: ${reason}`,'err');
  }finally{
    sendButton.disabled=false;
    sendButton.textContent='Submit registration details';
  }
});

/* ============== countdown ============== */
(function(){
  const d=document.getElementById('cd-d'),h=document.getElementById('cd-h'),m=document.getElementById('cd-m'),s=document.getElementById('cd-s'),note=document.getElementById('cd-note');
  function tick(){
    let diff=START-new Date();
    if(diff<=0){[d,h,m,s].forEach(e=>e.textContent='0');note.textContent='Sankalp’26 has begun!';return}
    const p=n=>String(n).padStart(2,'0');
    d.textContent=Math.floor(diff/864e5);
    h.textContent=p(Math.floor(diff/36e5)%24);
    m.textContent=p(Math.floor(diff/6e4)%60);
    s.textContent=p(Math.floor(diff/1e3)%60);
  }
  tick(); setInterval(tick,1000);
})();
