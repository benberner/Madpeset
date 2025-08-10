(function(){
  // --- Data access ---
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
    try{ localStorage.setItem('adminModels', JSON.stringify(arr)); }catch(e){}
  }

  const container = document.getElementById('modelsAdmin');
  let models = getModels();

  // --- Render cards ---
  function render(){
    if (!container) return;
    container.innerHTML = '';
    models.forEach((m, idx)=>{
      const card = document.createElement('div');
      card.className = 'card-admin';

      const img = document.createElement('img');
      img.src = m.image || '';
      card.appendChild(img);

      const file = document.createElement('input');
      file.type = 'file'; file.accept = 'image/*';
      file.addEventListener('change', ()=>{
        const f = file.files && file.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = ev => { m.image = String(ev.target.result||''); img.src = m.image; };
        reader.readAsDataURL(f);
      });
      card.appendChild(file);

      const title = document.createElement('input');
      title.type='text'; title.value = m.title || ''; title.placeholder='כותרת קצרה';
      title.addEventListener('input', ()=> m.title = title.value);
      card.appendChild(title);

      const desc = document.createElement('textarea');
      desc.rows = 3; desc.value = m.description || ''; desc.placeholder='תיאור';
      desc.addEventListener('input', ()=> m.description = desc.value);
      card.appendChild(desc);

      const price = document.createElement('input');
      price.type='number'; price.min='0'; price.step='1'; price.placeholder='מחיר (₪)';
      price.value = (m.price != null ? m.price : '');
      price.addEventListener('input', ()=> m.price = Number(price.value||0));
      card.appendChild(price);

      const row = document.createElement('div'); row.className='row';
      const del = document.createElement('button'); del.className='btn danger'; del.textContent='מחק';
      del.addEventListener('click', ()=>{ models.splice(idx,1); render(); });
      row.appendChild(del);
      card.appendChild(row);

      container.appendChild(card);
    });
  }

  // --- Toolbar actions ---
  const addBtn = document.getElementById('addBtn');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');

  if (addBtn){
    addBtn.addEventListener('click', ()=>{ models.push({ id: 'm'+Date.now(), title:'', description:'', image:'', price:0 }); render(); });
  }
  if (saveBtn){
    saveBtn.addEventListener('click', ()=>{
      models = models.map((m,i)=>({ id: m.id || ('m'+Date.now()+i), title: m.title||'', description:m.description||'', image:m.image||'', price:(m.price!=null?Number(m.price):0) }));
      setModels(models);
      alert('נשמר!');
    });
  }
  if (resetBtn){
    resetBtn.addEventListener('click', ()=>{
      if (!confirm('לאפס לרשימת ברירת המחדל?')) return;
      localStorage.removeItem('adminModels');
      models = getModels();
      render();
    });
  }
  if (exportBtn){
    exportBtn.addEventListener('click', ()=>{
      try{
        const json = JSON.stringify(models, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = 'models.json';
        document.body.appendChild(link);
        link.click();
        setTimeout(()=>{ URL.revokeObjectURL(url); link.remove(); }, 1000);
      }catch(e){
        try{
          const w = window.open('', '_blank');
          w.document.write('<pre>'+JSON.stringify(models, null, 2).replace(/[&<>]/g, s=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[s]))+'</pre>');
          w.document.close();
        }catch(err){ alert('ייצוא נכשל'); }
      }
    });
  }
  if (importBtn && importFile){
    importBtn.addEventListener('click', ()=> importFile.click());
    importFile.addEventListener('change', ()=>{
      const f = importFile.files && importFile.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try{
          let arr = JSON.parse(String(ev.target.result||'[]'));
          if (!Array.isArray(arr) && arr && arr.models) arr = arr.models;
          if (!Array.isArray(arr)) throw new Error('מבנה לא חוקי');
          models = arr.map((m,i)=>({ id: m.id || ('m'+Date.now()+i), title: m.title||'', description:m.description||'', image:m.image||'', price:(m.price!=null?Number(m.price):0) }));
          setModels(models);
          render();
          alert('נטען בהצלחה');
        }catch(e){ alert('ייבוא נכשל: '+e.message); }
      };
      reader.readAsText(f, 'utf-8');
    });
  }

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
    return 'hero.jpg';
  }

  function refresh(){
    if (!preview) return;
    try{
      const v = localStorage.getItem(KEY);
      preview.src = v || loadDefaultHeroSrc();
    }catch(e){
      preview.src = loadDefaultHeroSrc();
    }
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
      try{ localStorage.setItem(KEY, preview.src); alert('תמונה נשמרה. רעננו את דף הבית כדי לראות.'); }catch(e){ alert('שמירה נכשלה'); }
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
