
(function(){
  let model = null;
  function blank(){
    return {
      version:'גרסה 6.3',
      font:{family:'Alef, Arial, Helvetica, sans-serif',base_px:16,h1_px:32,p_px:18},
      hero:{title:'',subtitle:''},
      header:{line:''},
      modeChooser:{existing:'',new:''},
      steps:{'1':'','2':'','3':'','4':'','5':'','6':'','7':'','8':''},
      step1:{desc_label:'',desc_placeholder:'',upload_label:''},
      step2:{opt_colorful:'',opt_white:'',opt_black_unavailable:'',opt_macaron_soon:'',opt_custom:'',custom_placeholder:''},
      step3:{width_label:'',height_label:'',price_note:''},
      step4:{opt_light:'',opt_mid:'',opt_strong:'',note:''},
      step5:{low:'',medium:'',high:''},
      step6:{material:'',size:'',resolution:'',hardness:'',quantity:'',total:''},
      step7:{label:'',placeholder:''},
      step8:{name_label:'',phone_label:'',email_label:'',address_label:'',city_label:'',thankyou:''},
      notices:{self_pickup:'',payment:''},
      cta:{whatsapp:''}
    };
  }
  function by(id){ return document.getElementById(id); }
  async function load(){
    try{
      const res = await fetch('data/texts.json', {cache:'no-store'});
      model = res.ok ? await res.json() : blank();
    }catch(e){ model = blank(); }
    bind();
  }
  function bind(){
    const m = model || blank();
    by('version').value = m.version || '';
    by('fontFamily').value = m.font?.family || '';
    by('fontBase').value = m.font?.base_px || '';
    by('fontH1').value = m.font?.h1_px || '';
    by('fontP').value = m.font?.p_px || '';
    by('heroTitleInput').value = m.hero?.title || '';
    by('heroSubInput').value = m.hero?.subtitle || '';
    by('headerLineInput').value = m.header?.line || '';
    by('existingBtnInput').value = m.modeChooser?.existing || '';
    by('newBtnInput').value = m.modeChooser?.new || '';
    ['1','2','3','4','5','6','7','8'].forEach(k=> by('s'+k).value = m.steps?.[k] || '');
    by('step1Label').value = m.step1?.desc_label || '';
    by('step1PH').value    = m.step1?.desc_placeholder || '';
    by('step1Upload').value= m.step1?.upload_label || '';
    by('s2colorful').value = m.step2?.opt_colorful || '';
    by('s2white').value    = m.step2?.opt_white || '';
    by('s2black').value    = m.step2?.opt_black_unavailable || '';
    by('s2macaron').value  = m.step2?.opt_macaron_soon || '';
    by('s2custom').value   = m.step2?.opt_custom || '';
    by('s2customPH').value = m.step2?.custom_placeholder || '';
    by('s3width').value    = m.step3?.width_label || '';
    by('s3height').value   = m.step3?.height_label || '';
    by('s3priceNote').value= m.step3?.price_note || '';
    by('s4light').value    = m.step4?.opt_light || '';
    by('s4mid').value      = m.step4?.opt_mid || '';
    by('s4strong').value   = m.step4?.opt_strong || '';
    by('s4note').value     = m.step4?.note || '';
    by('s5low').value      = m.step5?.low || '';
    by('s5medium').value   = m.step5?.medium || '';
    by('s5high').value     = m.step5?.high || '';
    by('s6material').value = m.step6?.material || '';
    by('s6size').value     = m.step6?.size || '';
    by('s6resolution').value= m.step6?.resolution || '';
    by('s6hardness').value = m.step6?.hardness || '';
    by('s6quantity').value = m.step6?.quantity || '';
    by('s6total').value    = m.step6?.total || '';
    by('s7label').value    = m.step7?.label || '';
    by('s7ph').value       = m.step7?.placeholder || '';
    by('s8name').value     = m.step8?.name_label || '';
    by('s8phone').value    = m.step8?.phone_label || '';
    by('s8email').value    = m.step8?.email_label || '';
    by('s8address').value  = m.step8?.address_label || '';
    by('s8city').value     = m.step8?.city_label || '';
    by('s8thank').value    = m.step8?.thankyou || '';
    by('noticePickup').value = m.notices?.self_pickup || '';
    by('noticePayment').value= m.notices?.payment || '';
    by('ctaWhatsApp').value  = m.cta?.whatsapp || '';
  }
  function collect(){
    const m = blank();
    m.version = by('version').value || m.version;
    m.font.family = by('fontFamily').value || m.font.family;
    m.font.base_px = Number(by('fontBase').value || m.font.base_px);
    m.font.h1_px   = Number(by('fontH1').value || m.font.h1_px);
    m.font.p_px    = Number(by('fontP').value || m.font.p_px);
    m.hero.title   = by('heroTitleInput').value;
    m.hero.subtitle= by('heroSubInput').value;
    m.header.line  = by('headerLineInput').value;
    m.modeChooser.existing = by('existingBtnInput').value;
    m.modeChooser.new      = by('newBtnInput').value;
    ['1','2','3','4','5','6','7','8'].forEach(k=> m.steps[k] = by('s'+k).value);
    m.step1.desc_label = by('step1Label').value;
    m.step1.desc_placeholder = by('step1PH').value;
    m.step1.upload_label = by('step1Upload').value;
    m.step2.opt_colorful = by('s2colorful').value;
    m.step2.opt_white    = by('s2white').value;
    m.step2.opt_black_unavailable = by('s2black').value;
    m.step2.opt_macaron_soon      = by('s2macaron').value;
    m.step2.opt_custom  = by('s2custom').value;
    m.step2.custom_placeholder = by('s2customPH').value;
    m.step3.width_label = by('s3width').value;
    m.step3.height_label= by('s3height').value;
    m.step3.price_note  = by('s3priceNote').value;
    m.step4.opt_light   = by('s4light').value;
    m.step4.opt_mid     = by('s4mid').value;
    m.step4.opt_strong  = by('s4strong').value;
    m.step4.note        = by('s4note').value;
    m.step5.low         = by('s5low').value;
    m.step5.medium      = by('s5medium').value;
    m.step5.high        = by('s5high').value;
    m.step6.material    = by('s6material').value;
    m.step6.size        = by('s6size').value;
    m.step6.resolution  = by('s6resolution').value;
    m.step6.hardness    = by('s6hardness').value;
    m.step6.quantity    = by('s6quantity').value;
    m.step6.total       = by('s6total').value;
    m.step7.label       = by('s7label').value;
    m.step7.placeholder = by('s7ph').value;
    m.step8.name_label  = by('s8name').value;
    m.step8.phone_label = by('s8phone').value;
    m.step8.email_label = by('s8email').value;
    m.step8.address_label = by('s8address').value;
    m.step8.city_label    = by('s8city').value;
    m.step8.thankyou      = by('s8thank').value;
    m.notices.self_pickup = by('noticePickup').value;
    m.notices.payment     = by('noticePayment').value;
    m.cta.whatsapp        = by('ctaWhatsApp').value;
    return m;
  }
  function download(filename, text){
    const blob = new Blob([text], {type:'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 500);
  }
  document.getElementById('loadBtn').addEventListener('click', load);
  document.getElementById('exportBtn').addEventListener('click', ()=>{
    const m = collect();
    download('texts.json', JSON.stringify(m, null, 2));
  });
  const importBtn = document.getElementById('importBtn');
  const importFile= document.getElementById('importFile');
  importBtn.addEventListener('click', ()=> importFile.click());
  importFile.addEventListener('change', ()=>{
    const f = importFile.files && importFile.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try{ model = JSON.parse(String(ev.target.result||'{}')); bind(); alert('נטען בהצלחה'); }
      catch(e){ alert('כשל בייבוא'); }
    };
    reader.readAsText(f, 'utf-8');
  });
  load();
})();
