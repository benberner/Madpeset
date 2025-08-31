
(function(){
  let models = [];

  function by(id){ return document.getElementById(id); }

  function toDataUrl(m){
    // try imageUrl field; else image base64 (if exists)
    if (m.imageUrl) return m.imageUrl;
    if (m.image && typeof m.image==='string' && m.image.startsWith('data:')) return m.image;
    if (m.image && /^[A-Za-z0-9+/]+=*$/.test(m.image.slice(0,64))) return 'data:image/jpeg;base64,'+m.image;
    return '';
  }

  function render(){
    const list = by('list');
    list.innerHTML = '';
    models.forEach((m, idx)=>{
      const el = document.createElement('div');
      el.className = 'item';
      el.draggable = true;
      el.dataset.index = String(idx);
      el.innerHTML = `
        <div class="drag">☰</div>
        <img class="thumb" src="${toDataUrl(m)}" alt="">
        <div class="title">${m.title || m.name || ('דגם #' + (idx+1))}</div>
        <div class="pos">#${idx+1}</div>
      `;
      addDrag(el);
      list.appendChild(el);
    });
  }

  function addDrag(el){
    el.addEventListener('dragstart', (e)=>{
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', el.dataset.index);
      el.classList.add('ghost');
    });
    el.addEventListener('dragend', ()=> el.classList.remove('ghost'));
    el.addEventListener('dragover', (e)=> e.preventDefault());
    el.addEventListener('drop', (e)=>{
      e.preventDefault();
      const from = Number(e.dataTransfer.getData('text/plain'));
      const to = Number(el.dataset.index);
      if (isNaN(from) || isNaN(to) || from===to) return;
      const item = models.splice(from,1)[0];
      models.splice(to,0,item);
      render();
    });
  }

  async function load(){
    try{
      const res = await fetch('data/models.json', {cache:'no-store'});
      if (!res.ok) throw new Error('HTTP '+res.status);
      models = await res.json();
    }catch(e){
      alert('לא הצלחתי לטעון data/models.json — אפשר לייבא קובץ ידנית.');
      models = [];
    }
    render();
  }

  function download(filename, text){
    const blob = new Blob([text], {type:'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 500);
  }

  by('loadBtn').addEventListener('click', load);
  by('exportBtn').addEventListener('click', ()=>{
    // export array in the new order AS-IS (no schema change)
    download('models.json', JSON.stringify(models, null, 2));
  });
  const importBtn = by('importBtn');
  const importFile= by('importFile');
  importBtn.addEventListener('click', ()=> importFile.click());
  importFile.addEventListener('change', ()=>{
    const f = importFile.files && importFile.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try{ models = JSON.parse(String(ev.target.result||'[]')); render(); alert('נטען בהצלחה'); }
      catch(e){ alert('כשל בייבוא'); }
    };
    reader.readAsText(f, 'utf-8');
  });

  // auto-load on open
  load();
})();
