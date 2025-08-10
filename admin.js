(function(){
  function getModels(){
    try{
      const raw = localStorage.getItem('adminModels');
      if (raw){
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr;
      }
    }catch(e){}
    return (window.DEFAULT_MODELS || []);
  }
  function setModels(arr){
    localStorage.setItem('adminModels', JSON.stringify(arr));
  }

  const container = document.getElementById('modelsAdmin');
  let models = getModels();

  function render(){
    container.innerHTML='';
    models.forEach((m, idx)=>{
      const card = document.createElement('div');
      card.className = 'card-admin';
      const img = document.createElement('img');
      img.src = m.image || '';
      const file = document.createElement('input');
      file.type = 'file'; file.accept = 'image/*';
      file.addEventListener('change', e=>{
        const f = file.files && file.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = ev => { m.image = String(ev.target.result||''); img.src = m.image; };
        reader.readAsDataURL(f);
      });

      const title = document.createElement('input');
      title.type='text'; title.value = m.title || ''; title.placeholder='כותרת קצרה';
      title.addEventListener('input', ()=> m.title = title.value);

      const desc = document.createElement('textarea');
      desc.rows = 3; desc.value = m.description || ''; desc.placeholder='תיאור';
      desc.addEventListener('input', ()=> m.description = desc.value);


      const price = document.createElement('input');
      price.type='number'; price.min='0'; price.step='1'; price.placeholder='מחיר (₪)';
      price.value = (m.price != null ? m.price : '');
      price.addEventListener('input', ()=> m.price = Number(price.value||0));
      const row = document.createElement('div'); row.className='row';
      const del = document.createElement('button'); del.className='btn danger'; del.textContent='מחק';
      del.addEventListener('click', ()=>{ models.splice(idx,1); render(); });

      card.appendChild(img);
      card.appendChild(file);
      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(price);
      card.appendChild(row);
      row.appendChild(del);
      container.appendChild(card);
    });
  }

  document.getElementById('addBtn').addEventListener('click', ()=>{
    models.push({ id: 'm'+Date.now(), title:'', description:'', image:'' });
    render();
  });
  document.getElementById('saveBtn').addEventListener('click', ()=>{
    models = models.map((m,i)=>({ id: m.id || ('m'+Date.now()+i), title:m.title||'', description:m.description||'', image:m.image||'', price: (m.price!=null?Number(m.price):0) }));
    setModels(models);
    alert('נשמר!');
  });
  document.getElementById('resetBtn').addEventListener('click', ()=>{
    if (!confirm('לאפס לרשימת ברירת המחדל?')) return;
    localStorage.removeItem('adminModels');
    models = getModels();
    render();
  });

  render();
})();

  // --- Hero image admin ---
  (function(){
    const KEY = 'adminHeroImage';
    const preview = document.getElementById('heroPreview');
    const file = document.getElementById('heroFile');
    const saveBtn = document.getElementById('heroSave');
    const resetBtn = document.getElementById('heroReset');

    function loadDefaultHeroSrc(){
      // Try to find current hero image path in index.html (fallback to assets/hero.jpg or images/hero.jpg)
      try {
        const img = document.createElement('img');
        img.src = 'assets/hero.jpg';
        return 'assets/hero.jpg';
      } catch(e) { return 'assets/hero.jpg'; }
    }

    function refresh(){
      try{
        const stored = localStorage.getItem(KEY);
        if (stored){
          preview.src = stored;
        } else {
          preview.src = loadDefaultHeroSrc();
        }
      }catch(e){}
    }

    if (file){
      file.addEventListener('change', ()=>{
        const f = file.files && file.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = ev => { preview.src = String(ev.target.result || ''); };
        reader.readAsDataURL(f);
      });
    }
    if (saveBtn){
      saveBtn.addEventListener('click', ()=>{
        if (!preview.src){ alert('בחרו תמונה קודם'); return; }
        try{ localStorage.setItem(KEY, preview.src); alert('תמונת ה-Hero נשמרה! רעננו את דף הבית כדי לראות.'); }catch(e){ alert('שמירה נכשלה'); }
      });
    }
    if (resetBtn){
      resetBtn.addEventListener('click', ()=>{
        localStorage.removeItem(KEY);
        refresh();
        alert('שוחזר לברירת מחדל.');
      });
    }
    refresh();
  })();
