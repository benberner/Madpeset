/* === v2.3.3 — stable gallery, correct pricing, back-to-gallery, visible price badges === */

window.DEFAULT_MODELS = window.DEFAULT_MODELS || [
  { id:"cat",  title:"cat",  description:"מחזיק מפתחות חתול 15×15 מ״מ", image:"cat.jpeg",  price:30 },
  { id:"boat", title:"boat", description:"מודל סירה בסיסי 25×25 מ״מ",   image:"boat.jpeg", price:30 }
];


// Load default models from external JSON so updating defaults is as simple as replacing one file
async function preloadDefaultModels(){
  try{
    const res = await fetch("data/models.json", { cache: "no-store" });
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

    // default color to colorful on existing model
    try {
      var c = document.querySelector('input[name="color"][value="colorful"]');
      if (c){ c.checked = true; }
      if (typeof updateColorLines === "function") { updateColorLines(); }
    } catch(e){}

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

  window.scrollTo({ top: 0, behavior: "auto" });
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



// v5.7: show small preview when user selects an image in Step 1
(function(){
  function bindPreview(){
    var input = document.getElementById('image');
    var img   = document.getElementById('preview');
    if (!input || !img) return;
    input.addEventListener('change', function(){
      var file = this.files && this.files[0];
      if (!file) return;
      try{
        var url = URL.createObjectURL(file);
        img.src = url;
        img.style.display = 'block';
      }catch(e){ /* ignore */ }
    }, false);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindPreview);
  else bindPreview();
})();



// v5.8: Direct skip to Step 1 when creating new model
document.addEventListener('DOMContentLoaded', ()=>{
  const btn = document.getElementById('createNew');
  if(btn){
    btn.addEventListener('click', ()=>{
      try{
        document.getElementById('galleryTop').style.display='none';
      }catch(_){}
      try{
        showNewWizard();
        setStep(1);
      }catch(e){ console.error(e); }
    });
  }
});
