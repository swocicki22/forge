// ════════════════════════════════
// DAY EDITOR
//
// Every edit goes through two functions:
//   edTarget()  — the object whose exercise list is being edited
//   edCommit()  — how that edit is saved
//
// What the target is depends on the program:
//   Forge (free, the user's own days)  → the day itself; save directly
//   a custom program                   → the SESSION TEMPLATE behind the day;
//                                        regenerate every week from it
//   a built-in scheduled program       → not editable in place. Its days are
//                                        materialized copies, so an edit would
//                                        change one of 24 and be overwritten
//                                        by the next program update. Tapping
//                                        EDIT offers to duplicate it instead.
//
// Exercises are always MERGED on save, never rebuilt from the form: the form
// only covers some fields, and rebuilding silently dropped the implement,
// barbell alternate and rep range of any exercise that was edited.
// ════════════════════════════════

var edPid=null;   // program being edited, when opened from the program editor
var edSid=null;   // session template being edited, likewise

function edProgram(){return (edPid&&getProgram(edPid))||activeProgram();}
function edIsTemplate(){var p=edProgram();return !!(p&&p.custom);}
function edIsLocked(){var p=edProgram();return !!(p&&p.builtin&&p.mode==='scheduled');}
function edIsScheduled(){var p=edProgram();return !!(p&&p.mode==='scheduled');}

function edTarget(){
  var p=edProgram();
  if(p&&p.custom){
    var sid=edSid;
    if(!sid){var d=getDay(editingDayId);sid=d&&d.sid;}
    return getCustomSession(p,sid);
  }
  return getDay(editingDayId);
}
function edCommit(){
  var p=edProgram();
  if(p&&p.custom)regenerateCustomDays(p);
  saveState();
}

// ── reading and writing an exercise, whichever shape it has ──
// Templates store sets/reps/repsEnd; days store ds/dr/repMin/repMax.
function exFields(ex){
  if(!ex)return {sets:3,rmin:10,rmax:10,emin:'',emax:''};
  if(edIsTemplate()){
    var r=ex.reps||[10,10];
    return {sets:ex.sets||3,rmin:r[0],rmax:r[1],
            emin:ex.repsEnd?ex.repsEnd[0]:'',emax:ex.repsEnd?ex.repsEnd[1]:''};
  }
  var mn=(ex.repMin!=null?ex.repMin:(ex.dr||10)), mx=(ex.repMax!=null?ex.repMax:mn);
  return {sets:ex.ds||3,rmin:mn,rmax:mx,emin:'',emax:''};
}
function exSummary(ex){
  var f=exFields(ex);
  var reps=(f.rmin===f.rmax?f.rmin:f.rmin+'-'+f.rmax);
  if(ex.timed)reps=(ex.secs||f.rmin)+'s';
  var s=f.sets+'x'+reps;
  if(f.emin!==''){s+=' → '+(f.emin===f.emax?f.emin:f.emin+'-'+f.emax);}
  if(ex.wave){var w0=ex.wave[0],wn=ex.wave[ex.wave.length-1];
    s=f.sets+'x'+(w0.min===w0.max?w0.min:w0.min+'-'+w0.max)+' → '+(wn.min===wn.max?wn.min:wn.min+'-'+wn.max)+' by week';}
  else if(ex.perWeek)s+=' · custom plan by phase';
  return s;
}

// ── opening ───────────────────────────────────────────────────
function openEditor(dayId){
  edPid=null;edSid=null;editingDayId=dayId;
  if(edIsLocked()){offerDuplicateToEdit(dayId);return;}
  var t=edTarget();if(!t)return;
  el('editor-title').textContent=t.name.toUpperCase();
  renderEditor();showScreen('s-editor');
}
// Edit a session template directly, from the program editor. Works even for
// a workout not yet placed in the phase order, which has no day at all.
function openSessionEditor(pid,sid){
  edPid=pid;edSid=sid;editingDayId=null;
  var t=edTarget();if(!t)return;
  closeModal('prog-edit-mo');
  el('editor-title').textContent=t.name.toUpperCase();
  renderEditor();showScreen('s-editor');
}
function closeEditor(){
  var back=edPid;
  edSid=null;
  if(back){edPid=null;openProgramEditor(back);showScreen('s-workout');return;}
  showScreen('s-workout');
}

function offerDuplicateToEdit(dayId){
  var p=edProgram();
  el('dup-edit-msg').textContent=p.name+' is a built-in program, so it can’t be edited in place — '+
    'its days are fixed copies, and an update to the program would overwrite your changes. '+
    'Make it yours: duplicate it, keep your place in the block, and edit freely.';
  el('dup-edit-mo').setAttribute('data-day',dayId||'');
  el('dup-edit-mo').classList.add('visible');
}
function confirmDuplicateToEdit(){
  var src=activeProgram();
  var dayId=el('dup-edit-mo').getAttribute('data-day');
  var idx=-1;
  for(var i=0;i<src.days.length;i++){if(src.days[i].id===dayId){idx=i;break;}}
  var p=duplicateProgram(src.id,'My '+src.name,true);
  closeModal('dup-edit-mo');
  if(!p)return;
  setActiveProgram(p.id);
  renderSel();
  showToast('NOW EDITING YOUR COPY');
  if(idx>=0&&p.days[idx]&&!p.days[idx].rest)openEditor(p.days[idx].id);
  else openProgramEditor(p.id);   // opened from the program strip, not a day
}

// ── rendering ─────────────────────────────────────────────────
function renderEditor(){
  var t=edTarget();var cont=el('editor-content');cont.innerHTML='';
  if(!t){cont.innerHTML='<div class="empty">Nothing to edit.</div>';return;}
  var tpl=edIsTemplate(), sched=edIsScheduled();

  if(tpl&&sched){
    // In a phased program, where a workout runs is set by the phase order,
    // not by a rest flag on the workout itself.
    var info=document.createElement('div');info.className='ed-note';
    var used=0,p=edProgram();
    for(var c=0;c<(p.order||[]).length;c++)if(p.order[c]===t.sid)used++;
    info.innerHTML=used
      ? 'Runs in every one of '+p.weeks+' phases'+(used>1?' ('+used+'\u00d7 each)':'')+'. Changes here apply to all of them.'
      : '<span style="color:var(--am)">Not in the phase yet.</span> Add it from the program editor.';
    cont.appendChild(info);
  }else{
    var rt=document.createElement('div');rt.className='rest-toggle';
    rt.innerHTML='<div><div class="rtl">REST DAY</div><div class="rts">Mark as recovery — no workout</div></div><div class="toggle-sw'+(t.rest?' on':'')+'" onclick="toggleRest()"></div>';
    cont.appendChild(rt);
  }
  var editInfo=document.createElement('button');editInfo.className='add-ex-btn';editInfo.style.marginBottom='6px';
  editInfo.innerHTML='&#9998; EDIT NAME &amp; NOTES';editInfo.onclick=function(){openEditDay();};cont.appendChild(editInfo);

  if(!t.rest){
    var main=[],core=[];
    for(var i=0;i<t.ex.length;i++){(t.ex[i].type==='Core'?core:main).push({ex:t.ex[i],idx:i});}
    var sd1=document.createElement('div');sd1.className='section-div';sd1.textContent='EXERCISES';cont.appendChild(sd1);
    for(var i=0;i<main.length;i++)cont.appendChild(buildEditorRow(main[i].ex,main[i].idx));
    var ab=document.createElement('button');ab.className='add-ex-btn';ab.innerHTML='+ ADD EXERCISE';ab.onclick=function(){openAddExercise(false);};cont.appendChild(ab);
    if(core.length){
      var sd2=document.createElement('div');sd2.className='section-div';sd2.textContent='CORE WORK';cont.appendChild(sd2);
      for(var i=0;i<core.length;i++)cont.appendChild(buildEditorRow(core[i].ex,core[i].idx));
    }
    var ac=document.createElement('button');ac.className='add-ex-btn';ac.style.borderColor='var(--en)';ac.style.color='var(--en)';
    ac.innerHTML='+ ADD AB WORKOUT';ac.onclick=function(){openAbDiff();};cont.appendChild(ac);
  }
  // Reset only means something for the original Forge days.
  var p0=edProgram();
  if(p0&&p0.id===FORGE_PID){
    var resetBtn=document.createElement('button');resetBtn.className='ed-reset';
    resetBtn.textContent='RESET TO DEFAULT PRESET';resetBtn.onclick=function(){resetDayToPreset();};cont.appendChild(resetBtn);
  }
}
function buildEditorRow(ex,idx){
  var row=document.createElement('div');row.className='edit-ex-item';
  var ssLabel=ex.ss?'<span class="ed-ss">'+esc(ex.ss)+'</span>':'';
  var tag=implTag(ex.impl||'');
  row.innerHTML='<div style="display:flex;flex-direction:column;gap:2px;flex-shrink:0;">'+
    '<button class="move-btn" onclick="moveEx('+idx+',-1)">&#9650;</button>'+
    '<button class="move-btn" onclick="moveEx('+idx+',1)">&#9660;</button></div>'+
    '<div style="flex:1;min-width:0;"><div class="edit-ex-name">'+esc(ex.name)+ssLabel+
    (tag?' <span class="impl-tag">'+esc(tag)+'</span>':'')+'</div>'+
    '<div class="edit-ex-meta">'+esc(ex.type||'')+' — '+esc(exSummary(ex))+(ex.dw?' — '+ex.dw+'lb':'')+'</div></div>'+
    '<button class="edit-btn" onclick="openEditExercise('+idx+')">EDIT</button>';
  return row;
}

// ── day-level edits ───────────────────────────────────────────
function moveEx(idx,dir){
  var t=edTarget();if(!t)return;var ni=idx+dir;if(ni<0||ni>=t.ex.length)return;
  var tmp=t.ex[idx];t.ex[idx]=t.ex[ni];t.ex[ni]=tmp;edCommit();renderEditor();
}
function toggleRest(){var t=edTarget();if(!t)return;t.rest=!t.rest;edCommit();renderEditor();}
function openEditDay(){
  var t=edTarget();if(!t)return;
  el('ed-name').value=t.name;el('ed-tag').value=t.tag||'';el('ed-cardio').value=t.cardio||'';
  el('edit-day-mo').classList.add('visible');
}
function saveDayEdit(){
  var t=edTarget();if(!t)return;
  var name=el('ed-name').value.trim();if(!name){showToast('NAME REQUIRED');return;}
  t.name=name;t.tag=el('ed-tag').value.trim()||name.toUpperCase();t.cardio=el('ed-cardio').value.trim()||null;
  el('editor-title').textContent=t.name.toUpperCase();
  edCommit();closeModal('edit-day-mo');renderEditor();showToast('UPDATED');
}
function deleteDay(){
  var p=edProgram();
  if(p&&p.custom){
    var t=edTarget();if(!t)return;
    deleteCustomSession(p,t.sid);
    closeModal('edit-day-mo');showToast('DELETED');closeEditor();
    return;
  }
  var idx=getDayIdx(editingDayId);if(idx===-1)return;
  S.days.splice(idx,1);
  for(var i=0;i<S.days.length;i++)S.days[i].lbl=(i+1<10?'0'+(i+1):''+(i+1));
  saveState();closeModal('edit-day-mo');showScreen('s-workout');showToast('DELETED');
}

// ── exercise edits ────────────────────────────────────────────
var IMPL_OPTIONS=[['auto','Detect from name'],['smith','Smith machine'],['barbell','Barbell'],
  ['dumbbell','Dumbbell'],['machine','Machine'],['cable','Cable'],['bw','Bodyweight'],
  ['band','Band'],['other','Other']];
function fillImplSelect(val){
  var s=el('ef-impl');if(!s)return;
  if(!s.options.length){
    for(var i=0;i<IMPL_OPTIONS.length;i++){
      var o=document.createElement('option');o.value=IMPL_OPTIONS[i][0];o.textContent=IMPL_OPTIONS[i][1];s.appendChild(o);
    }
  }
  s.value=val||'auto';
}
var EF_PROG_HELP='Phases in between step evenly. 12&rarr;4 marches reps down as weight climbs; 8&rarr;20 marches them up.';
function syncProgressionRow(){
  var r=el('ef-prog-row');if(r)r.style.display=(edIsTemplate()&&edIsScheduled())?'block':'none';
}
function openAddExercise(isCore){
  editingExIdx=null;el('edit-ex-title').textContent='ADD EXERCISE';
  el('ef-name').value='';el('ef-type').value=isCore?'Core':'';el('ef-ss').value='';
  el('ef-sets').value='3';el('ef-reps').value='10';el('ef-reps-max').value='';
  el('ef-reps-end').value='';el('ef-reps-end-max').value='';
  el('ef-weight').value='';el('ef-notes').value='';
  fillImplSelect('auto');syncProgressionRow();pkSetup(null);
  var ph=el('ef-prog-help');if(ph)ph.innerHTML=EF_PROG_HELP;
  el('del-ex-btn').style.display='none';setEfLoaded(!isCore);syncEfLoadedRow();
  el('edit-ex-mo').classList.add('visible');
}
function openEditExercise(idx){
  var t=edTarget();if(!t)return;var ex=t.ex[idx];editingExIdx=idx;var f=exFields(ex);
  el('edit-ex-title').textContent='EDIT: '+ex.name;
  el('ef-name').value=ex.name;el('ef-type').value=ex.type||'';el('ef-ss').value=ex.ss||'';
  el('ef-sets').value=f.sets;el('ef-reps').value=f.rmin;el('ef-reps-max').value=(f.rmax!==f.rmin?f.rmax:'');
  el('ef-reps-end').value=f.emin;el('ef-reps-end-max').value=(f.emax!==''&&f.emax!==f.emin?f.emax:'');
  el('ef-weight').value=ex.dw||'';el('ef-notes').value=ex.notes||'';
  fillImplSelect(ex.impl||'auto');syncProgressionRow();pkSetup(ex.name);
  var ph=el('ef-prog-help');
  if(ph&&ex.wave&&edIsTemplate())ph.innerHTML='<span style="color:var(--am)">This lift follows a weekly rep wave.</span> Changing sets or reps here removes it. To change the weeks, use EDIT REPS BY WEEK in the program editor.';
  else if(ph)ph.innerHTML=(ex.perWeek&&edIsTemplate())
    ?'<span style="color:var(--am)">This lift has its own plan for each phase.</span> Changing sets or reps here replaces it with an even step from phase 1 to the last. To change phases one by one, use EDIT REPS BY PHASE in the program editor.'
    :EF_PROG_HELP;
  el('del-ex-btn').style.display='block';setEfLoaded(exIsLoaded(ex));syncEfLoadedRow();
  el('edit-ex-mo').classList.add('visible');
}
function num(v,d){var n=parseInt(v,10);return isFinite(n)&&n>0?n:d;}
function saveExercise(){
  var name=el('ef-name').value.trim();if(!name){showToast('NAME REQUIRED');return;}
  var t=edTarget();if(!t)return;
  var type=el('ef-type').value.trim()||'Custom';
  var sets=num(el('ef-sets').value,3);
  var rmin=num(el('ef-reps').value,10), rmax=num(el('ef-reps-max').value,rmin);
  if(rmax<rmin){var sw=rmin;rmin=rmax;rmax=sw;}
  var impl=el('ef-impl').value;
  if(impl==='auto')impl=(typeof mgImplFor==='function')?mgImplFor(name):'other';

  // Start from the existing exercise so fields the form doesn't show survive.
  var old=(editingExIdx!==null)?t.ex[editingExIdx]:null;
  var ex=old?JSON.parse(JSON.stringify(old)):{};
  // A renamed exercise is a different lift — its old alternate no longer applies.
  if(old&&old.name!==name){delete ex.alt;delete ex.altImpl;}
  ex.name=name;ex.type=type;ex.ss=el('ef-ss').value.trim();
  ex.dw=parseFloat(el('ef-weight').value)||0;ex.notes=el('ef-notes').value.trim();
  ex.impl=impl;ex.loaded=efLoaded;
  if(type==='Core'){ex.timed=coreFlags(name).timed;}
  var _cc=(typeof catFind==='function')?catFind(name):null;
  if(_cc&&_cc.s){ex.timed=true;ex.secs=rmin;}
  // Cardio: from the catalog, or any exercise typed as "Cardio".
  if((_cc&&_cc.c)||/^cardio$/i.test(type)){ex.cardio=true;ex.type='Cardio';ex.loaded=false;delete ex.timed;}
  else delete ex.cardio;

  if(edIsTemplate()){
    // A week-by-week table (from duplicating a program with a deload week or a
    // stepped wave) survives edits to name, notes or weight. Changing the sets
    // or reps replaces it with the start-to-end progression typed here.
    if(old&&old.perWeek){
      var of=exFields(old);
      var endTyped=parseInt(el('ef-reps-end').value,10);
      var changed=(sets!==of.sets||rmin!==of.rmin||rmax!==of.rmax||
                   (isFinite(endTyped)?endTyped:'')!==(of.emin===''?'':of.emin));
      if(changed)delete ex.perWeek;
    }
    if(old&&old.wave){
      var ow=exFields(old);
      if(sets!==ow.sets||rmin!==ow.rmin||rmax!==ow.rmax)delete ex.wave;
    }
    ex.sets=sets;ex.reps=[rmin,rmax];
    delete ex.ds;delete ex.dr;delete ex.repMin;delete ex.repMax;
    var emin=parseInt(el('ef-reps-end').value,10), emax=parseInt(el('ef-reps-end-max').value,10);
    if(edIsScheduled()&&isFinite(emin)&&emin>0){
      if(!isFinite(emax)||emax<=0)emax=emin;
      if(emax<emin){var s2=emin;emin=emax;emax=s2;}
      ex.repsEnd=[emin,emax];
    }else delete ex.repsEnd;
    if(ex.timed&&!ex.secs)ex.secs=rmin;
  }else{
    // Writing the range onto the slot is what makes the reps you type the
    // reps you see — without it, the workout screen fell back to the global
    // periodization table and ignored this field.
    ex.ds=sets;ex.dr=rmin;ex.repMin=rmin;ex.repMax=rmax;
  }
  if(editingExIdx!==null){t.ex[editingExIdx]=ex;showToast('UPDATED');}
  else{t.ex.push(ex);showToast('ADDED');}
  edCommit();closeModal('edit-ex-mo');renderEditor();
}
function deleteExercise(){
  if(editingExIdx===null)return;var t=edTarget();if(!t)return;
  t.ex.splice(editingExIdx,1);edCommit();closeModal('edit-ex-mo');renderEditor();showToast('REMOVED');
}
// Add-ab-workout: presets are stored day-shaped; templates need their shape.
function applyAbPreset(preset){
  var t=edTarget();if(!t)return;
  t.ex=t.ex.filter(function(ex){return ex.type!=='Core';});
  for(var i=0;i<preset.length;i++){
    var e=JSON.parse(JSON.stringify(preset[i]));
    if(!e.impl)e.impl=/cable/i.test(e.name)?'cable':'bw';
    if(edIsTemplate()){
      var timed=/plank/i.test(e.name);
      t.ex.push({name:e.name,type:'Core',impl:e.impl,dw:e.dw||0,ss:e.ss||'',notes:e.notes||'',
                 loaded:!!e.loaded,sets:e.ds||3,reps:[e.dr||10,e.dr||10],
                 timed:timed||undefined,secs:timed?e.dr:undefined});
    }else{
      e.repMin=e.dr;e.repMax=e.dr;t.ex.push(e);
    }
  }
  edCommit();
}

// ── adding days ───────────────────────────────────────────────
function openAddDay(){el('nd-name').value='';el('nd-tag').value='';el('nd-cardio').value='';el('add-day-mo').classList.add('visible');}
function saveNewDay(){
  var name=el('nd-name').value.trim();if(!name){showToast('NAME REQUIRED');return;}
  var p=activeProgram();
  if(p&&p.custom){
    var s=addCustomSession(p,name);
    s.tag=el('nd-tag').value.trim()||name.toUpperCase();s.cardio=el('nd-cardio').value.trim()||null;
    regenerateCustomDays(p);saveState();
  }else{
    var n=S.days.length+1;
    S.days.push({id:'c_'+Date.now(),lbl:(n<10?'0':'')+n,name:name,tag:el('nd-tag').value.trim()||name.toUpperCase(),
                 rest:false,cardio:el('nd-cardio').value.trim()||null,ex:[]});
    saveState();
  }
  closeModal('add-day-mo');renderSel();showToast('CREATED');
}
function resetDayToPreset(){
  var idx=getDayIdx(editingDayId);var presets=buildPresets();
  if(idx>=0&&idx<presets.length){var oid=S.days[idx].id;S.days[idx]=presets[idx];S.days[idx].id=oid;saveState();renderEditor();showToast('RESET');}
  else showToast('NO PRESET FOR THIS DAY');
}

// ════════════════════════════════
// EXERCISE PICKER
// Muscle group → equipment → exercise, from CATALOG. Picking fills the form;
// the name stays editable, and "Custom exercise…" leaves it free-typed.
// ════════════════════════════════
var pkMuscle='all',pkEquip='all';
function pkSetup(currentName){
  var ms=el('pk-muscle'),es=el('pk-equip');if(!ms||!es)return;
  if(!ms.options.length){
    var o=document.createElement('option');o.value='all';o.textContent='All muscle groups';ms.appendChild(o);
    for(var i=0;i<CAT_MUSCLES.length;i++){o=document.createElement('option');o.value=CAT_MUSCLES[i];o.textContent=CAT_MUSCLES[i];ms.appendChild(o);}
    for(var j=0;j<CAT_EQUIP.length;j++){o=document.createElement('option');o.value=CAT_EQUIP[j][0];o.textContent=CAT_EQUIP[j][1];es.appendChild(o);}
  }
  // Editing a catalog exercise opens on its own muscle group and equipment.
  var c=currentName?catFind(currentName):null;
  pkMuscle=c?c.m:(pkMuscle||'all');
  pkEquip=c?(c.e==='barbell'||c.e==='dumbbell'?'free':c.e):(pkEquip||'all');
  ms.value=pkMuscle;es.value=pkEquip;
  pkRender(currentName);
}
function pkRender(selected){
  var sel=el('pk-ex');if(!sel)return;
  sel.innerHTML='';
  var list=catFilter(pkMuscle,pkEquip);
  var mine=[],rest=[];
  for(var i=0;i<list.length;i++)(catRecord(list[i])?mine:rest).push(list[i]);
  var head=document.createElement('option');head.value='';
  head.textContent=list.length?('— Pick an exercise ('+list.length+') —'):'— Nothing matches —';
  sel.appendChild(head);
  function add(group,label){
    if(!group.length)return;
    var g=document.createElement('optgroup');g.label=label;
    for(var k=0;k<group.length;k++){
      var o=document.createElement('option');o.value=group[k].n;
      // Equipment is only worth repeating when the filter doesn't already say it.
      var eq=(pkEquip==='all'||pkEquip==='free')?' · '+CAT_EQUIP_LABEL[group[k].e]:'';
      var mu=(pkMuscle==='all')?' · '+group[k].m:'';
      o.textContent=group[k].n+eq+mu;
      g.appendChild(o);
    }
    sel.appendChild(g);
  }
  add(mine,'Your lifts');
  add(rest,mine.length?'More exercises':'Exercises');
  var cu=document.createElement('option');cu.value='__custom';cu.textContent='✎ Custom exercise…';sel.appendChild(cu);
  sel.value=(selected&&catFind(selected)&&list.indexOf(catFind(selected))>=0)?selected:'';
  pkHint(sel.value?catFind(sel.value):null);
}
function pkMuscleChanged(v){pkMuscle=v;pkRender(el('ef-name').value);}
function pkEquipChanged(v){pkEquip=v;pkRender(el('ef-name').value);}
function pkPicked(v){
  if(v==='__custom'){
    el('ef-name').value='';el('ef-name').focus();pkHint(null,true);return;
  }
  var c=catFind(v);if(!c)return;
  el('ef-name').value=c.n;
  el('ef-type').value=(c.t==='Compound'?'Strength':c.t);
  fillImplSelect(c.e);
  // Bodyweight moves log no load unless the name says otherwise.
  setEfLoaded(c.e!=='bw'||/weighted/i.test(c.n));syncEfLoadedRow();
  if(editingExIdx===null){
    // A new exercise gets a sensible starting prescription; an edited one
    // keeps the sets and reps already set on it.
    var dft=CAT_DEFAULTS[c.t]||CAT_DEFAULTS.Isolation;
    el('ef-sets').value=dft.sets;
    if(c.c){el('ef-reps').value=c.min||30;el('ef-reps-max').value='';}
    else if(c.s){el('ef-reps').value=c.s;el('ef-reps-max').value='';}
    else{el('ef-reps').value=dft.reps[0];el('ef-reps-max').value=(dft.reps[1]!==dft.reps[0]?dft.reps[1]:'');}
  }
  pkHint(c);
}
// "Last time: 32 min · 2.1 mi" for a cardio pick, from the log.
function catCardioLast(name){
  for(var i=(S.log||[]).length-1;i>=0;i--){
    var ss=S.log[i].rawSets&&S.log[i].rawSets[name];if(!ss)continue;
    var m=0,d=0;for(var j=0;j<ss.length;j++){if(ss[j].done){m+=parseFloat(ss[j].mins)||0;d+=parseFloat(ss[j].dist)||0;}}
    if(m||d)return 'Last time: '+(m?m+' min':'')+(d?(m?' · ':'')+d+' mi':'')+'.';
  }
  return null;
}
function pkHint(c,custom){
  var h=el('pk-hint');if(!h)return;
  if(custom){h.innerHTML='Type any name below. A name the app hasn’t seen starts its own history.';return;}
  if(!c){h.textContent='';return;}
  var r=catRecord(c),t='';
  if(r){
    var d=r.date?new Date(r.date):null;
    t='Your record: <b>'+r.weight+' lb × '+(r.reps||'?')+'</b>'+(d?' ('+(d.getMonth()+1)+'/'+d.getDate()+')':'')+
      ' — weights will prefill from your history.';
  }else t='New lift for you — no history yet.';
  if(c.c)t=(catCardioLast(c.n)||'Cardio.')+' Reps field is target minutes; you log minutes, miles and calories.';
  else if(c.s)t+=' Timed: reps field is seconds.';
  h.innerHTML=t;
}
