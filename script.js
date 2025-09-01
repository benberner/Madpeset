/* === v2.3.3 — stable gallery, correct pricing, back-to-gallery, visible price badges === */

window.DEFAULT_MODELS = window.DEFAULT_MODELS || [
  { id:"cat",  title:"cat",  description:"מחזיק מפתחות חתול 15×15 מ״מ", image:"cat.jpeg",  price:30 },
  { id:"boat", title:"boat", description:"מודל סירה בסיסי 25×25 מ״מ",   image:"boat.jpeg", price:30 }
];


// Load default models from external JSON so updating defaults is as simple as replacing one file
async function preloadDefaultModels(){
  try{
    const MODELS_VER = "5.9";
    const res = await fetch(`data/models.json?v=${MODELS_VER}`, { cache: "no-store" });
    if (res.ok){
      const arr = await res.json();
      if (Array.isArray(arr)) { window.DEFAULT_MODELS = arr; }
    }
  }catch(e){ /* keep built-in defaults if fetch fails */ }
}

let readySelection = false, readyPrice = null, readyModelTitle = null;

/* --- Data helpers --- */
function getModels(){
  try{
    const raw = localStorage.getItem("adminModels");
    if (raw){
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length>0) return arr;
    }
  }catch(e){}
  return window.DEFAULT_MODELS || [];
}

/* --- Gallery --- */
function renderModels(){
  const el = document.getElementById("galleryTop");
  if (!el) return;
  el.innerHTML = "";
  const models = getModels();
  if (!models || !models.length){
    const empty = document.createElement("div");
    empty.className = "muted";
    empty.textContent = "אין מודלים להצגה כרגע. היכנסו לאזור המנהל והוסיפו מודלים.";
    el.appendChild(empty);
    return;
  }
  models.forEach(m=>{
    const card = document.createElement("div");
    card.className = "model-card";
    card.dataset.title = m.title || "";
    card.dataset.description = m.description || "";
    card.dataset.image = m.image || "";
    card.dataset.price = (m.price!=null ? m.price : "");

    const img = document.createElement("img");
    img.src = m.image; img.alt = m.title || "model";
    card.appendChild(img);

    const hasPrice = (m.price!==undefined && m.price!==null && m.price!=="" && !Number.isNaN(Number(m.price)));
    if (hasPrice){
      const badge = document.createElement("div");
      badge.className = "price-badge";
      badge.textContent = Number(m.price) + " ש״ח";
      card.appendChild(badge);
    }

    const info = document.createElement("div");
    info.className = "info";
    const h4 = document.createElement("h4"); h4.textContent = m.title || "מודל";
    const p  = document.createElement("p");  p.textContent  = m.description || "";
    info.appendChild(h4); info.appendChild(p);
    card.appendChild(info);

    el.appendChild(card);
  });
}

function enableGallerySelection(){
  const grid = document.getElementById("galleryTop");
  if (!grid) return;
  grid.addEventListener("click", (ev)=>{
    const card = ev.target.closest(".model-card");
    if (!card) return;
    grid.querySelectorAll(".model-card.selected").forEach(c=> c.classList.remove("selected"));
    card.classList.add("selected");

    // persist
    try{
      const sel = {
        title: card.dataset.title || (card.querySelector('h4')?.textContent || ''),
        description: card.dataset.description || (card.querySelector('p')?.textContent || ''),
        image: card.dataset.image || (card.querySelector('img')?.src || ''),
        price: (card.dataset.price!=='' ? Number(card.dataset.price) : null)
      };
      localStorage.setItem("selectedModel", JSON.stringify(sel));
    }catch(e){}

    // price
    let price = 30;
    if (card.dataset.price!==undefined && card.dataset.price!==""){
      const n = Number(card.dataset.price);
      if (!Number.isNaN(n)) price = n;
    }

    readySelection = true;
    readyPrice = price;
    readyModelTitle = (card.dataset.title || (card.querySelector('h4')?.textContent || 'דגם נבחר'));

    showNewWizard();
    setStep(6);
    setFixedPriceForReady(price, readyModelTitle);

    const priceEl = document.getElementById("priceBox");
    if (priceEl && priceEl.scrollIntoView) priceEl.scrollIntoView({behavior:"smooth"});
  });
}

/* --- Views --- */
function showExisting(){
  const chooser = document.getElementById("modeChooserTop") || document.querySelector(".mode-chooser");
  const gallery = document.getElementById("galleryTop");
  const steps   = document.getElementById("stepsPills") || document.querySelector("ol.steps");
  const card    = document.getElementById("card");
  const nav     = document.getElementById("stepsNav") || document.querySelector("nav.footer-nav");
  const backFab = document.getElementById("backToGallery") || document.getElementById("backToExistingFab");

  if (chooser) chooser.style.display = "flex";
  if (gallery) gallery.style.display = "grid";
  if (steps)   steps.style.display   = "none";
  if (card)    card.style.display    = "none";
  if (nav)     nav.style.display     = "none";
  if (backFab) backFab.style.display = "none";

  const be = document.getElementById("chooseExisting");
  const bn = document.getElementById("createNew");
  if (be) be.classList.add("active");
  if (bn) bn.classList.remove("active");

  readySelection = false; readyPrice = null; readyModelTitle = null;
}

function showNewWizard(){
  const chooser = document.getElementById("modeChooserTop") || document.querySelector(".mode-chooser");
  const gallery = document.getElementById("galleryTop");
  const steps   = document.getElementById("stepsPills") || document.querySelector("ol.steps");
  const card    = document.getElementById("card");
  const nav     = document.getElementById("stepsNav") || document.querySelector("nav.footer-nav");
  const backFab = document.getElementById("backToGallery") || document.getElementById("backToExistingFab");

  if (chooser) chooser.style.display = "none";
  if (gallery) gallery.style.display = "none";
  if (steps)   steps.style.display   = "grid";
  if (card)    card.style.display    = "";
  if (nav)     nav.style.display     = "";
  if (backFab) backFab.style.display = "block";
  setStep(1);
}

/* --- Wizard + Pricing --- */
let currentStep = 1;
const MAX_STEP = 8;

function setStep(n){
  /* existing-model skip */
  if (readySelection && Number(n)===7 && Number(currentStep)===6) { n = MAX_STEP; }
  currentStep = Math.max(1, Math.min(MAX_STEP, Number(n)||1));
  document.querySelectorAll("#card .step").forEach(s=>{
    const k = Number(s.getAttribute("data-step"));
    s.classList.toggle("active", k===currentStep);
    s.style.display = (k===currentStep) ? "block" : "none";
  });
  const stepNum = document.getElementById("stepNum");
  if (stepNum) stepNum.textContent = String(currentStep);

  const pills = document.getElementById("stepsPills") || document.querySelector("ol.steps");
  if (pills){
    pills.querySelectorAll("li").forEach(li=>{
      const k = Number(li.getAttribute("data-step"));
      li.classList.toggle("active", k===currentStep);
    });
  }
  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");
  if (backBtn) backBtn.disabled = (currentStep===1);
  if (nextBtn) nextBtn.style.display = (currentStep===MAX_STEP) ? "none" : "";

  updatePriceUI();
  /* hide email on last for existing */
  try {
    if (readySelection && currentStep===MAX_STEP) {
      var email = document.getElementById("email");
      if (email) { email.removeAttribute("required"); var wrap = email.closest("div"); if (wrap) wrap.style.display="none"; }
    }
  } catch(e) {}

}

function getNumber(id, def=0){
  const el = document.getElementById(id);
  if (!el) return def;
  const n = Number(el.value);
  return Number.isFinite(n) ? n : def;
}

function selectedValue(name){
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : null;
}

function priceDifficulty(){
  const v = selectedValue("difficulty");
  if (v==="above50") return 10;   // בינונית (לשימוש)
  if (v==="full100") return 20;   // חייב להחזיק משקל
  return 0;                       // קלה (לנוי)
}

function priceResolution(){
  const v = selectedValue("resolution");
  if (v==="medium") return 5;
  if (v==="high") return 10;
  return 0;
}

function priceBaseBySize(){
  const w = getNumber("width", 50);
  const h = getNumber("height", 50);
  return (w<=50 && h<=50) ? 30 : 50;
}

function setPriceText(id, amount){
  const el = document.getElementById(id);
  if (el) el.textContent = String(amount) + " ש״ח";
}

function setBaseLabels(text){
  try{
    const lbl1 = document.querySelector('#priceBox .row span:first-child');
    const lbl2 = document.querySelector('#priceBox2 .row span:first-child');
    if (lbl1) lbl1.textContent = text;
    if (lbl2) lbl2.textContent = text;
  }catch(e){}
}

function updatePriceUI(){
  if (readySelection && readyPrice!=null){
    setBaseLabels(readyModelTitle || "דגם נבחר");
    setPriceText("basePrice", readyPrice);
    setPriceText("difficultyExtra", 0);
    setPriceText("resolutionExtra", 0);
    setPriceText("totalPrice", readyPrice);
    setPriceText("basePrice2", readyPrice);
    setPriceText("difficultyExtra2", 0);
    setPriceText("resolutionExtra2", 0);
    setPriceText("totalPrice2", readyPrice);
    return;
  }
  setBaseLabels("בסיס לפי גודל");
  const base = priceBaseBySize();
  const diff = priceDifficulty();
  const res  = priceResolution();
  const total = base + diff + res;

  setPriceText("basePrice", base);
  setPriceText("difficultyExtra", diff);
  setPriceText("resolutionExtra", res);
  setPriceText("totalPrice", total);
  setPriceText("basePrice2", base);
  setPriceText("difficultyExtra2", diff);
  setPriceText("resolutionExtra2", res);
  setPriceText("totalPrice2", total);
}

function bindPriceEvents(){
  ["width","height"].forEach(id=>{
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", ()=>{ readySelection=false; readyPrice=null; readyModelTitle=null; updatePriceUI(); });
  });
  ["difficulty","resolution"].forEach(name=>{
    document.querySelectorAll(`input[name="${name}"]`).forEach(r=>{
      r.addEventListener("change", ()=>{ readySelection=false; readyPrice=null; readyModelTitle=null; updatePriceUI(); });
    });
  });
}

/* --- Back actions --- */
function bindHeroClick(){
  const hero = document.querySelector(".hero");
  if (!hero) return;
  hero.addEventListener("click", ()=>{
    showExisting();
    window.scrollTo({top:0, behavior:"smooth"});
  });
}
function bindBackToGallery(){
  const btn1 = document.getElementById("backToGallery");
  const btn2 = document.getElementById("backToExistingFab");
  [btn1, btn2].forEach(btn=>{
    if (!btn) return;
    btn.addEventListener("click", ()=>{
      showExisting();
      window.scrollTo({top:0, behavior:"smooth"});
    });
  });
}

/* --- Init --- */
document.addEventListener("DOMContentLoaded", async function(){
  await preloadDefaultModels();
  try{ renderModels(); }catch(e){}
  try{ enableGallerySelection(); }catch(e){}
  try{ bindPriceEvents(); }catch(e){}
  try{ bindHeroClick(); }catch(e){}
  try{ bindBackToGallery(); }catch(e){}

  showExisting();

  document.addEventListener("click", function(ev){
    const t = ev.target.closest("#chooseExisting, #createNew, [data-mode]");
    if (!t) return;
    const mode = (t.id==="chooseExisting" || t.dataset.mode==="existing") ? "existing"
               : (t.id==="createNew"   || t.dataset.mode==="new")      ? "new"
               : null;
    if (!mode) return;
    if (mode==="existing"){
      showExisting();
    }else{
      readySelection=false; readyPrice=null; readyModelTitle=null;
      showNewWizard();
      setStep(1);
      updatePriceUI();
    }
  }, true);

  const backBtn = document.getElementById("backBtn");
  const nextBtn = document.getElementById("nextBtn");
  if (nextBtn) nextBtn.addEventListener("click", ()=>{ if (readySelection && currentStep===6) { setStep(MAX_STEP); } else if (currentStep<MAX_STEP) { setStep(currentStep+1); } });
  if (backBtn) backBtn.addEventListener("click", ()=>{
    if (currentStep>1) setStep(currentStep-1);
    else showExisting();
  });

  const pills = document.getElementById("stepsPills") || document.querySelector("ol.steps");
  if (pills){
    pills.addEventListener("click", (e)=>{
      const li = e.target.closest("li[data-step]"); if (!li) return;
      const n = Number(li.getAttribute("data-step")); if (!n) return;
      setStep(n);
    });
  }

  updatePriceUI();
});

// ===== GitHub Save: push admin models to data/models.json =====
function toBase64Utf8(str){ return btoa(unescape(encodeURIComponent(str))); }

function getCurrentAdminModels(){
  try{
    const raw = localStorage.getItem("adminModels");
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  }catch(e){ return []; }
}

async function saveModelsToGitHub(models){
  const repoEl = document.getElementById('ghRepo');
  const branchEl = document.getElementById('ghBranch');
  const pathEl = document.getElementById('ghPath');
  const tokenEl = document.getElementById('ghToken');

  const repo = (repoEl && repoEl.value || '').trim();
  const branch = (branchEl && branchEl.value || 'main').trim();
  const path = (pathEl && pathEl.value || 'data/models.json').trim();
  const token = (tokenEl && tokenEl.value || '').trim();

  if(!repo || !token){
    showToast('נא למלא Repo ו‑Token', 'error');
    return;
  }

  // Fetch existing to get sha (if exists)
  let sha = undefined;
  try{
    const r = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`, {
      headers: { 'Accept': 'application/vnd.github+json', 'Authorization': `token ${token}` }
    });
    if(r.ok){
      const j = await r.json();
      sha = j.sha;
    }
  }catch(e){}

  const content = toBase64Utf8(JSON.stringify(models, null, 2));
  const body = { message: `chore: update ${path} via admin (${new Date().toISOString()})`, content, branch };
  if(sha) body.sha = sha;

  const put = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { 'Accept': 'application/vnd.github+json', 'Authorization': `token ${token}` },
    body: JSON.stringify(body)
  });

  if(!put.ok){
    const err = await put.text();
    console.error('GitHub save failed:', err);
    showToast('השמירה ל‑GitHub נכשלה. בדוק הרשאות/branch/path/Repo/Token.', 'error');
    return;
  }
  showToast('המודלים נשמרו בהצלחה ל‑GitHub ✅', 'success');
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('ghSaveBtn');
  if(btn){
    btn.addEventListener('click', async () => {
      const models = getCurrentAdminModels();
      await saveModelsToGitHub(models);
    });
  }
});


// ===== Toast helpers =====
function showToast(msg, type='success') {
  try {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('error');
    if (type === 'error') el.classList.add('error');
    // show
    requestAnimationFrame(() => {
      el.classList.add('show');
      setTimeout(() => { el.classList.remove('show'); }, 2200);
    });
  } catch (e) {}
}


/* === existing-flow inline fix ===
   Behavior: for "existing model" (readySelection===true)
   - Step 6 is shown; clicking Next on step 6 jumps directly to LAST step (skip 7)
   - On LAST step, email field is hidden and not required
*/
(function(){
  var LAST_STEP = (typeof window.MAX_STEP === 'number' ? window.MAX_STEP : 8);

  function hideEmailIfReady(){
    try{
      if (!window.readySelection) return;
      var lastStepEl = document.querySelector('.step[data-step="'+LAST_STEP+'"]');
      if (!lastStepEl || lastStepEl.style.display === 'none') return;
      var email = document.getElementById('email');
      if (email){
        email.removeAttribute('required');
        var wrap = email.closest('div');
        if (wrap) wrap.style.display = 'none';
      }
    }catch(e){}
  }

  // Intercept Next button on step 6
  document.addEventListener('DOMContentLoaded', function(){
    var nextBtn = document.getElementById('nextBtn');
    if (nextBtn && !nextBtn.__existingFixApplied){
      nextBtn.__existingFixApplied = true;
      nextBtn.addEventListener('click', function(){
        try{
          if (window.readySelection && window.currentStep === 6){
            if (typeof window.setStep === 'function'){
              window.setStep(LAST_STEP);
              setTimeout(hideEmailIfReady, 0);
              return;
            }
          }
        }catch(e){}
        setTimeout(hideEmailIfReady, 0);
      }, true);
    }
    hideEmailIfReady();
  });

  // Wrap setStep so attempts to go from 6->7 in readySelection will skip to LAST_STEP
  (function(){
    var orig = window.setStep;
    window.setStep = function(n){
      try{
        if (window.readySelection){
          if (window.currentStep === 6 && (n === 7)) n = LAST_STEP;
        }
      }catch(e){}
      if (typeof orig === 'function') return orig(n);
      // Fallback show/hide if orig missing
      try{
        document.querySelectorAll('.step').forEach(function(el){
          el.style.display = (String(el.getAttribute('data-step')) === String(n)) ? '' : 'none';
        });
        window.currentStep = n;
      }catch(e){}
    };
  })();

  // Keep hiding email if UI mutates
  try{
    var mo = new MutationObserver(function(){ hideEmailIfReady(); });
    mo.observe(document.body, { subtree:true, childList:true, attributes:true });
  }catch(e){}
})();



// === v6.35 texts.json loader ===
async function loadTexts(){
  try{
    const res = await fetch(new URL('data/texts.json', document.baseURI).href + '?ts=' + Date.now(), {cache:'no-store'});
    if (!res.ok) return;
    const t = await res.json();

    if (t.version){
      const v = document.getElementById('siteVersion');
      if (v) v.textContent = t.version;
    }
    try{
      const r = document.documentElement;
      if (t.font){
        if (t.font.family)   r.style.setProperty('--font-family', t.font.family);
        if (t.font.base_px)  r.style.setProperty('--font-size-base', (t.font.base_px|0)+'px');
        if (t.font.h1_px)    r.style.setProperty('--font-size-h1', (t.font.h1_px|0)+'px');
        if (t.font.p_px)     r.style.setProperty('--font-size-p', (t.font.p_px|0)+'px');
      }
    }catch(e){}
    if (t.hero){
      const h1 = document.getElementById('heroTitle');
      const p  = document.getElementById('heroSubtitle');
      if (h1 && t.hero.title) h1.textContent = t.hero.title;
      if (p && t.hero.subtitle) p.textContent = t.hero.subtitle;
    }
    if (t.header && t.header.line){
      const el = document.getElementById('siteHeaderLine'); if (el) el.textContent = t.header.line;
    }
    if (t.modeChooser){
      const be = document.getElementById('chooseExisting');
      const bn = document.getElementById('createNew');
      if (be && t.modeChooser.existing) be.textContent = t.modeChooser.existing;
      if (bn && t.modeChooser.new)      bn.textContent = t.modeChooser.new;
    }
    if (t.steps){
      document.querySelectorAll('ol.steps li[data-step]').forEach(li=>{
        const k = li.getAttribute('data-step');
        if (k && t.steps[k]) li.textContent = t.steps[k];
      });
      document.querySelectorAll('.step[data-step] > h2').forEach(h2=>{
        const k = h2.parentElement?.getAttribute('data-step');
        if (k && t.steps[k]) h2.textContent = t.steps[k];
      });
    }
    const setAfterInputLabel = (root, selector, text) => {
      const inp = root.querySelector(selector);
      if (!inp) return;
      const lab = inp.closest('label') || inp.parentElement;
      if (!lab) return;
      const toRemove=[]; lab.childNodes.forEach(n=>{ if(n.nodeType===3) toRemove.push(n); });
      toRemove.forEach(n=> lab.removeChild(n));
      lab.appendChild(document.createTextNode(' '+text));
    };
    if (t.step1){
      const root = document.querySelector('.step[data-step="1"]');
      if (root){
        const lab = root.querySelector('label');
        if (lab && t.step1.desc_label) lab.textContent = t.step1.desc_label;
        const ta = document.getElementById('desc');
        if (ta && t.step1.desc_placeholder) ta.placeholder = t.step1.desc_placeholder;
        const upl = root.querySelector('.mt label');
        if (upl && t.step1.upload_label) upl.textContent = t.step1.upload_label;
      }
    }
    if (t.step2){
      const root = document.querySelector('.step[data-step="2"]');
      if (root){
        if (t.step2.opt_colorful) setAfterInputLabel(root, 'input[value="colorful"]', t.step2.opt_colorful);
        if (t.step2.opt_white) setAfterInputLabel(root, 'input[value="white"]', t.step2.opt_white);
        const macaronLabel = (t.step2.opt_macaron || t.step2.opt_macaron_soon || 'צבע מקרון - חדש!');
        setAfterInputLabel(root, 'input[value="macaron"]', macaronLabel);
        if (t.step2.opt_custom) setAfterInputLabel(root, 'input[value="custom"]', t.step2.opt_custom);
        const ctext = document.getElementById('customColorText');
        if (ctext && t.step2.custom_placeholder) ctext.placeholder = t.step2.custom_placeholder;
      }
    }
    if (t.step3){
      const root = document.querySelector('.step[data-step="3"]');
      if (root){
        const labs = root.querySelectorAll('label');
        if (labs[0] && t.step3.width_label)  labs[0].textContent = t.step3.width_label;
        if (labs[1] && t.step3.height_label) labs[1].textContent = t.step3.height_label;
        const note = root.querySelector('.note-red');
        if (note && t.step3.price_note) note.textContent = t.step3.price_note;
      }
    }
    if (t.step4){
      const root = document.querySelector('.step[data-step="4"]');
      if (root){
        if (t.step4.opt_light) setAfterInputLabel(root, 'input[value="light"]', t.step4.opt_light);
        if (t.step4.opt_mid) setAfterInputLabel(root, 'input[value="mid"]', t.step4.opt_mid);
        if (t.step4.opt_strong) setAfterInputLabel(root, 'input[value="strong"]', t.step4.opt_strong);
        const note = root.querySelector('.note-red');
        if (note && t.step4.note) note.textContent = t.step4.note;
      }
    }
    if (t.step5){
      const root = document.querySelector('.step[data-step="5"]');
      if (root){
        if (t.step5.low) setAfterInputLabel(root, 'input[value="low"]', t.step5.low);
        if (t.step5.medium) setAfterInputLabel(root, 'input[value="medium"]', t.step5.medium);
        if (t.step5.high) setAfterInputLabel(root, 'input[value="high"]', t.step5.high);
      }
    }
    if (t.step6){
      const root = document.querySelector('.step[data-step="6"]');
      if (root){
        const rows = root.querySelectorAll('.price-row .label');
        if (rows.length){
          if (t.step6.material && rows[0]) rows[0].textContent = t.step6.material;
          if (t.step6.size && rows[1]) rows[1].textContent = t.step6.size;
          if (t.step6.resolution && rows[2]) rows[2].textContent = t.step6.resolution;
          if (t.step6.hardness && rows[3]) rows[3].textContent = t.step6.hardness;
          if (t.step6.quantity && rows[4]) rows[4].textContent = t.step6.quantity;
        }
        const total = root.querySelector('.total .label');
        if (total && t.step6.total) total.textContent = t.step6.total;
      }
    }
    if (t.step7){
      const root = document.querySelector('.step[data-step="7"]');
      if (root){
        const ta = root.querySelector('textarea');
        if (ta && t.step7.placeholder) ta.placeholder = t.step7.placeholder;
        const label = root.querySelector('label');
        if (label && t.step7.label) label.textContent = t.step7.label;
      }
    }
    if (t.step8){
      const root = document.querySelector('.step[data-step="8"]');
      if (root){
        const map = [['name','name_label'],['phone','phone_label'],['email','email_label'],['address','address_label'],['city','city_label']];
        map.forEach(([id, key])=>{
          const lab = root.querySelector('label[for="'+id+'"]');
          if (lab && t.step8[key]) lab.textContent = t.step8[key];
        });
        const thank = document.getElementById('thankyouText');
        if (thank && t.step8.thankyou) thank.textContent = t.step8.thankyou;
      }
    }
    if (t.notices){
      const pick = document.getElementById('selfPickupNote');
      if (pick && t.notices.self_pickup) pick.textContent = t.notices.self_pickup;
      const pay = document.getElementById('paymentNote');
      if (pay && t.notices.payment) pay.textContent = t.notices.payment;
    }
    if (t.cta && t.cta.whatsapp){
      const btn = document.getElementById('submitBtn');
      if (btn) btn.textContent = t.cta.whatsapp;
    }
  }catch(e){}
}

function placeMacaronBeforeBlack(){
  try{
    const root = document.querySelector('.step[data-step="2"]');
    if (!root) return;
    const mac = root.querySelector('input[value="macaron"]');
    const blk = root.querySelector('input[value="black"], input[value="black_unavailable"]');
    const macLabel = mac && (mac.closest('label') || mac.parentElement);
    const blkLabel = blk && (blk.closest('label') || blk.parentElement);
    if (macLabel && blkLabel && macLabel.nextSibling !== blkLabel){
      blkLabel.parentNode.insertBefore(macLabel, blkLabel);
    }
  }catch(e){}
}

document.addEventListener('DOMContentLoaded', ()=>{ try{ loadTexts(); }catch(e){} placeMacaronBeforeBlack(); });


// v6.7.2: texts binder with hard no-cache
function _getByPath(obj, path){
  try{ return path.split('.').reduce((o,k)=> (o && k in o) ? o[k] : undefined, obj); }catch(e){ return undefined; }
}
async function applyTextsGeneric(){
  try{
    const url = new URL('data/texts.json', document.baseURI).href + '?ts=' + Date.now();
    const res = await fetch(url, {cache:'no-store'});
    if (!res.ok) return;
    const t = await res.json();

    const v = document.getElementById('siteVersion');
    if (v && t.version) v.textContent = t.version;

    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      const attr = el.getAttribute('data-i18n-attr') || 'textContent';
      const val = _getByPath(t, key);
      if (val == null) return;
      if (attr === 'placeholder') el.setAttribute('placeholder', String(val));
      else if (attr === 'value') el.setAttribute('value', String(val));
      else el.textContent = String(val);
    });

    if (t.steps){
      document.querySelectorAll('ol.steps li[data-step]').forEach(li=>{
        const k = li.getAttribute('data-step'); if (k && t.steps[k]) li.textContent = t.steps[k];
      });
      document.querySelectorAll('.step[data-step] > h2').forEach(h2=>{
        const k = h2.parentElement?.getAttribute('data-step'); if (k && t.steps[k]) h2.textContent = t.steps[k];
      });
    }

    const setAfterInputLabel = (root, selector, text) => {
      const inp = root.querySelector(selector); if (!inp) return;
      const lab = inp.closest('label') || inp.parentElement; if (!lab) return;
      const rm=[]; lab.childNodes.forEach(n=>{ if(n.nodeType===3) rm.push(n); }); rm.forEach(n=> lab.removeChild(n));
      lab.appendChild(document.createTextNode(' '+text));
    };
    const step2 = document.querySelector('.step[data-step="2"]');
    if (step2){
      const mac = (t.step2 && (t.step2.opt_macaron || t.step2.opt_macaron_soon));
      if (t.step2?.opt_colorful) setAfterInputLabel(step2, 'input[value="colorful"]', t.step2.opt_colorful);
      if (t.step2?.opt_white) setAfterInputLabel(step2, 'input[value="white"]', t.step2.opt_white);
      if (mac) setAfterInputLabel(step2, 'input[value="macaron"]', mac);
      if (t.step2?.opt_custom) setAfterInputLabel(step2, 'input[value="custom"]', t.step2.opt_custom);
    }
  }catch(e){ console.warn('applyTextsGeneric failed', e); }
}
document.addEventListener('DOMContentLoaded', ()=>{ try{ applyTextsGeneric(); }catch(e){} });


// v6.7.2: model image resolver (URL or base64)
function getModelImageSrc(m){
  if (!m) return '';
  if (m.imageUrl) return m.imageUrl;
  if (m.image){
    const s = String(m.image);
    if (s.startsWith('data:')) return s;
    if (/^[A-Za-z0-9+/=\s]+$/.test(s.slice(0,120))) return 'data:image/jpeg;base64,'+s;
  }
  return '';
}


// v6.7.2: selected model preview above Step 6
function renderSelectedModelCard(model){
  const box = document.getElementById('selectedModelPreview');
  if (!box) return;
  if (!model){ box.style.display='none'; box.innerHTML=''; return; }
  const imgSrc = getModelImageSrc(model);
  const title = model.title || model.name || 'מודל';
  const desc  = model.description || '';
  box.innerHTML = `
    <div class="preview-wrap" style="display:flex;gap:12px;align-items:flex-start">
      ${imgSrc ? `<img src="${imgSrc}" alt="" style="width:96px;height:96px;object-fit:cover;border-radius:10px;border:1px solid #e5e7eb">` : ''}
      <div>
        <div style="font-weight:700">${title}</div>
        ${desc ? `<div style="opacity:.8;font-size:.95rem">${desc}</div>` : ''}
      </div>
    </div>`;
  box.style.display='block';
}

function syncSelectedModelFromStorage(){
  try{
    const raw = localStorage.getItem('selectedModel');
    if (!raw){ renderSelectedModelCard(null); return; }
    const m = JSON.parse(raw);
    renderSelectedModelCard(m && typeof m==='object' ? m : null);
  }catch(e){ renderSelectedModelCard(null); }
}

document.addEventListener('DOMContentLoaded', ()=>{ try{ syncSelectedModelFromStorage(); }catch(e){} });
window.addEventListener('storage', (e)=>{ if (e.key==='selectedModel') syncSelectedModelFromStorage(); });

document.addEventListener('click', (e)=>{
  const hit = e.target.closest('.model-card, [data-model-index], [data-model-id], #galleryTop, .models, .gallery');
  if (!hit) return;
  let n=0; const id=setInterval(()=>{ syncSelectedModelFromStorage(); if(++n>10) clearInterval(id); }, 250);
});
