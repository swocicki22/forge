// ════════════════════════════════
// WORKOUT SELECT
// ════════════════════════════════
function renderSel(){
  var grid=el('dgrid');grid.innerHTML='';
  grid.appendChild(buildProgramStrip());

  var p=activeProgram();
  var scheduled=p&&p.mode==='scheduled';
  var cursor=scheduled?currentCycleDay(p):null;

  // A scheduled program shows a window around where you are rather than all
  // 42 days at once: the last completed day, the one that is up, and the rest
  // of that week.
  var list=S.days,from=0,to=list.length;
  if(scheduled){
    from=Math.max(0,cursor-2);
    to=Math.min(list.length,from+8);
  }

  for(var i=from;i<to;i++){
    var day=list[i];
    var mc=0,hasAb=false;
    for(var j=0;j<day.ex.length;j++){
      if(day.ex[j].type==='Core')hasAb=true; else mc++;
    }
    var isNow=scheduled&&(i===cursor-1);
    var isPast=scheduled&&(i<cursor-1);
    var c=document.createElement('div');
    c.className='dc'+(day.rest?' rest-day':'')+(isNow?' day-now':'')+(isPast?' day-past':'');

    var badge=day.rest?'<div class="rest-badge">REST DAY</div>'
                      :'<div class="dtag">'+esc(day.tag)+'</div>';
    var meta;
    if(day.rest)meta='Recovery';
    else{
      meta=mc+' ex'+(hasAb?' + AB-X':'');
      if(day.mins)meta+=' \u00b7 '+day.mins+' min';
    }
    var num=scheduled?('D'+day.day):day.lbl;
    var editBtn=day.rest?'':'<button class="edit-btn" onclick="openEditor(\''+day.id+'\');event.stopPropagation();">EDIT</button>';

    c.innerHTML='<div style="display:flex;justify-content:space-between;align-items:flex-start;">'+
      '<div class="dnx">'+esc(num)+'</div>'+editBtn+'</div>'+
      '<div class="dcn">'+esc(day.name)+'</div>'+
      '<div class="dcm">'+esc(meta)+'</div>'+
      (day.optional?'<div class="opt-badge">OPTIONAL</div>':'')+badge;

    (function(id){
      c.onclick=function(){
        var d=getDay(id);
        if(d&&!d.rest)startWkt(id);
        else showToast('REST DAY');
      };
    })(day.id);
    grid.appendChild(c);
  }

  // Custom days only make sense on a free-form program; a scheduled block has
  // a fixed shape and appending to it would break the day numbering.
  if(!scheduled&&S.days.length<10){
    var addBtn=document.createElement('div');
    addBtn.style.cssText='background:transparent;border:1px dashed var(--bl);border-radius:2px;padding:14px 11px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:110px;';
    addBtn.innerHTML='<div style="font-size:18px;color:var(--s3);font-family:\'Orbitron\',sans-serif;">+</div><div style="font-family:\'Orbitron\',sans-serif;font-size:6px;letter-spacing:.12em;color:var(--s2);">NEW DAY</div>';
    addBtn.onclick=function(){openAddDay();};
    grid.appendChild(addBtn);
  }
}

// ════════════════════════════════
// EDITOR
// ════════════════════════════════
function getDay(id){for(var i=0;i<S.days.length;i++){if(S.days[i].id===id)return S.days[i];}return null;}
function getDayIdx(id){for(var i=0;i<S.days.length;i++){if(S.days[i].id===id)return i;}return -1;}
function openEditor(dayId){editingDayId=dayId;var day=getDay(dayId);el('editor-title').textContent=day.name.toUpperCase();renderEditor();showScreen('s-editor');}
function renderEditor(){
  var day=getDay(editingDayId);var cont=el('editor-content');cont.innerHTML='';
  var rt=document.createElement('div');rt.className='rest-toggle';rt.innerHTML='<div><div class="rtl">REST DAY</div><div class="rts">Mark as recovery — no workout</div></div><div class="toggle-sw'+(day.rest?' on':'')+'" onclick="toggleRest()"></div>';cont.appendChild(rt);
  var editInfo=document.createElement('button');editInfo.className='add-ex-btn';editInfo.style.marginBottom='6px';editInfo.innerHTML='&#9998; EDIT NAME &amp; CARDIO';editInfo.onclick=function(){openEditDay();};cont.appendChild(editInfo);
  if(!day.rest){
    var main=[],core=[];for(var i=0;i<day.ex.length;i++){if(day.ex[i].type==='Core')core.push({ex:day.ex[i],idx:i});else main.push({ex:day.ex[i],idx:i});}
    var sd1=document.createElement('div');sd1.className='section-div';sd1.textContent='EXERCISES';cont.appendChild(sd1);
    for(var i=0;i<main.length;i++)cont.appendChild(buildEditorRow(main[i].ex,main[i].idx));
    var ab=document.createElement('button');ab.className='add-ex-btn';ab.innerHTML='+ ADD EXERCISE';ab.onclick=function(){openAddExercise(false);};cont.appendChild(ab);
    if(core.length){var sd2=document.createElement('div');sd2.className='section-div';sd2.textContent='CORE WORK';cont.appendChild(sd2);for(var i=0;i<core.length;i++)cont.appendChild(buildEditorRow(core[i].ex,core[i].idx));}
    var ac=document.createElement('button');ac.className='add-ex-btn';ac.style.borderColor='var(--en)';ac.style.color='var(--en)';ac.innerHTML='+ ADD AB WORKOUT';ac.onclick=function(){openAbDiff();};cont.appendChild(ac);
  }
  var resetBtn=document.createElement('button');resetBtn.style.cssText='width:100%;background:transparent;border:1px solid var(--border);color:var(--s2);border-radius:2px;padding:9px;font-family:\'Orbitron\',sans-serif;font-size:7px;letter-spacing:.1em;cursor:pointer;margin-top:16px;';resetBtn.textContent='RESET TO DEFAULT PRESET';resetBtn.onclick=function(){resetDayToPreset();};cont.appendChild(resetBtn);
}
function buildEditorRow(ex,idx){
  var row=document.createElement('div');row.className='edit-ex-item';
  var ssLabel=ex.ss?'<span style="font-family:\'Orbitron\',sans-serif;font-size:6px;color:var(--hl);margin-left:4px;">'+esc(ex.ss)+'</span>':'';
  row.innerHTML='<div style="display:flex;flex-direction:column;gap:2px;flex-shrink:0;"><button class="move-btn" onclick="moveEx('+idx+',-1)">&#9650;</button><button class="move-btn" onclick="moveEx('+idx+',1)">&#9660;</button></div><div style="flex:1;min-width:0;"><div class="edit-ex-name">'+esc(ex.name)+ssLabel+'</div><div class="edit-ex-meta">'+esc(ex.type)+' — '+ex.ds+'x'+ex.dr+(ex.dw?' — '+ex.dw+'lb':'')+'</div></div><button class="edit-btn" onclick="openEditExercise('+idx+')">EDIT</button>';
  return row;
}
function moveEx(idx,dir){var day=getDay(editingDayId);var ni=idx+dir;if(ni<0||ni>=day.ex.length)return;var tmp=day.ex[idx];day.ex[idx]=day.ex[ni];day.ex[ni]=tmp;saveState();renderEditor();}
function toggleRest(){var day=getDay(editingDayId);day.rest=!day.rest;saveState();renderEditor();}
function openEditDay(){var day=getDay(editingDayId);el('ed-name').value=day.name;el('ed-tag').value=day.tag;el('ed-cardio').value=day.cardio||'';el('edit-day-mo').classList.add('visible');}
function saveDayEdit(){var day=getDay(editingDayId);var name=el('ed-name').value.trim();if(!name){showToast('NAME REQUIRED');return;}day.name=name;day.tag=el('ed-tag').value.trim()||name.toUpperCase();day.cardio=el('ed-cardio').value.trim()||null;el('editor-title').textContent=day.name.toUpperCase();saveState();closeModal('edit-day-mo');renderEditor();showToast('UPDATED');}
function deleteDay(){var idx=getDayIdx(editingDayId);if(idx===-1)return;S.days.splice(idx,1);for(var i=0;i<S.days.length;i++)S.days[i].lbl=(i+1<10?'0'+(i+1):''+(i+1));saveState();closeModal('edit-day-mo');showScreen('s-workout');showToast('DELETED');}
var efLoaded=false;
function toggleEfLoaded(){efLoaded=!efLoaded;var sw=el('ef-loaded-sw');if(sw){if(efLoaded)sw.classList.add('on');else sw.classList.remove('on');}}
function syncEfLoadedRow(){
  // The Loaded toggle is only meaningful for Core movements; for everything
  // else weight is always on. Show it when type is Core (or blank-from-core).
  // The Loaded toggle applies to every movement now — pull-ups, dips and
  // push-ups all need a way to say "no external load".
  var row=el('ef-loaded-row');
  if(!row)return;
  row.style.display='flex';
}
function setEfLoaded(v){efLoaded=!!v;var sw=el('ef-loaded-sw');if(sw){if(efLoaded)sw.classList.add('on');else sw.classList.remove('on');}}
function openAddExercise(isCore){editingExIdx=null;el('edit-ex-title').textContent='ADD EXERCISE';el('ef-name').value='';el('ef-type').value=isCore?'Core':'';el('ef-ss').value='';el('ef-sets').value='3';el('ef-reps').value='10';el('ef-weight').value='';el('ef-notes').value='';el('del-ex-btn').style.display='none';setEfLoaded(!isCore);syncEfLoadedRow();el('edit-ex-mo').classList.add('visible');}
function openEditExercise(idx){var day=getDay(editingDayId);var ex=day.ex[idx];editingExIdx=idx;el('edit-ex-title').textContent='EDIT: '+ex.name;el('ef-name').value=ex.name;el('ef-type').value=ex.type;el('ef-ss').value=ex.ss||'';el('ef-sets').value=ex.ds;el('ef-reps').value=ex.dr;el('ef-weight').value=ex.dw||'';el('ef-notes').value=ex.notes||'';el('del-ex-btn').style.display='block';setEfLoaded(exIsLoaded(ex));syncEfLoadedRow();el('edit-ex-mo').classList.add('visible');}
function saveExercise(){var name=el('ef-name').value.trim();if(!name){showToast('NAME REQUIRED');return;}var type=el('ef-type').value.trim()||'Custom';var ex={name:name,type:type,ss:el('ef-ss').value.trim(),ds:parseInt(el('ef-sets').value)||3,dr:parseInt(el('ef-reps').value)||10,dw:parseFloat(el('ef-weight').value)||0,notes:el('ef-notes').value.trim()};ex.loaded=efLoaded;if(type==='Core'){ex.timed=coreFlags(name).timed;}var day=getDay(editingDayId);if(editingExIdx!==null){day.ex[editingExIdx]=ex;showToast('UPDATED');}else{day.ex.push(ex);showToast('ADDED');}saveState();closeModal('edit-ex-mo');renderEditor();}
function deleteExercise(){if(editingExIdx===null)return;var day=getDay(editingDayId);day.ex.splice(editingExIdx,1);saveState();closeModal('edit-ex-mo');renderEditor();showToast('REMOVED');}
function openAddDay(){el('nd-name').value='';el('nd-tag').value='';el('nd-cardio').value='';el('add-day-mo').classList.add('visible');}
function saveNewDay(){var name=el('nd-name').value.trim();if(!name){showToast('NAME REQUIRED');return;}var num=S.days.length+1;var lbl=num<10?'0'+num:''+num;S.days.push({id:'c_'+Date.now(),lbl:lbl,name:name,tag:el('nd-tag').value.trim()||name.toUpperCase(),rest:false,cardio:el('nd-cardio').value.trim()||null,ex:[]});saveState();closeModal('add-day-mo');renderSel();showToast('CREATED');}
function resetDayToPreset(){var idx=getDayIdx(editingDayId);var presets=buildPresets();if(idx>=0&&idx<presets.length){var oid=S.days[idx].id;S.days[idx]=presets[idx];S.days[idx].id=oid;saveState();renderEditor();showToast('RESET');}else showToast('NO PRESET FOR THIS DAY');}

// ════════════════════════════════
// ACTIVE WORKOUT
// ════════════════════════════════
function getLastLog(id){for(var i=S.log.length-1;i>=0;i--){if(S.log[i].dayId===id)return S.log[i];}return null;}
function startWkt(dayId){
  var day=getDay(dayId);var wd=getWeekData();
  S.activeDay=JSON.parse(JSON.stringify(day));S.activeDay.id=day.id;S.sets={};S.removedSets={};S.start=Date.now();
  var suggestions=getOverloadSuggestions();var suggestMap={};for(var i=0;i<suggestions.length;i++)suggestMap[suggestions[i].name]=suggestions[i].suggest;
  for(var i=0;i<day.ex.length;i++){
    var ex=day.ex[i];var dw=ex.dw;
    // Slot-level reps win. Only a legacy day with no stored range falls
    // back to the global CYCLE table.
    var dr=resolveReps(ex,wd).min;
    // Rep floors for specific muscle groups and exercise types
    var exNameLower=ex.name.toLowerCase();
    if(ex.type==='Core')dr=ex.dr;
    else if(exNameLower.indexOf('calf')>=0||exNameLower.indexOf('calf raise')>=0)dr=Math.max(15,dr);
    else if(exNameLower.indexOf('lateral raise')>=0)dr=Math.max(12,dr);
    else if(exNameLower.indexOf('face pull')>=0||exNameLower.indexOf('rear delt')>=0)dr=Math.max(15,dr);
    else if(exNameLower.indexOf('shrug')>=0)dr=Math.max(12,dr);
    // Phase-scaled target from your own e1RM history; falls back to the
    // day's prescribed default when there's no history yet
    var tw=getTargetWeight(ex.name,wd);
    if(tw!==null)dw=tw;
    // Phase-aware overload bump (same-phase comparison only)
    if(suggestMap[ex.name])dw=suggestMap[ex.name];
    var arr=[];for(var j=0;j<ex.ds;j++)arr.push({weight:dw,reps:dr,done:false,warmup:false,rpe:0});
    S.sets[ex.name]=arr;
  }
  el('wtitle').textContent='DAY '+day.lbl+' — '+day.name.toUpperCase();
  updateWkChip();
  renderActive();showScreen('s-active');startTmr();
  saveActive();requestWakeLock();
}

function ekOf(name){return name.replace(/[^a-zA-Z0-9]/g,'_');}
function exByName(name){var day=S.activeDay;if(!day)return null;for(var i=0;i<day.ex.length;i++){if(day.ex[i].name===name)return day.ex[i];}return null;}

function buildSetRowHTML(ex,set,j){
  var ek=ekOf(ex.name);var ea=escAttr(ex.name);
  if(ex.type==='Core'){
    var timed=(ex.timed!==undefined)?ex.timed:/plank|hold|l-sit|hollow|dead ?hang/i.test(ex.name);
    var repLabel=timed?'sec':'reps';
    // Weight column: editable stack/plate load when loaded, locked BW otherwise.
    // When the flag is absent (older saved exercises), infer from the name so
    // cable/weighted core is editable without needing a data migration.
    var isLoaded=exIsLoaded(ex);
    var wcol;
    if(isLoaded){
      wcol='<div class="step"><button class="sbtn" data-act="step" data-ex="'+ea+'" data-f="weight" data-idx="'+j+'" data-d="-5">-</button><input class="sinp" type="number" inputmode="decimal" placeholder="lbs" id="w-'+ek+'-'+j+'" value="'+(set.weight||'')+'" data-ex="'+ea+'" data-f="weight" data-idx="'+j+'"/><button class="sbtn" data-act="step" data-ex="'+ea+'" data-f="weight" data-idx="'+j+'" data-d="5">+</button></div>';
    }else{
      wcol='<div class="step" style="opacity:.3;pointer-events:none;"><button class="sbtn">-</button><input class="sinp" value="BW" readonly/><button class="sbtn">+</button></div>';
    }
    return '<div class="sr'+(set.done?' done':'')+'" id="sr-'+ek+'-'+j+'"><div class="sn">'+(j+1)+'</div>'+wcol+'<div class="step"><button class="sbtn" data-act="step" data-ex="'+ea+'" data-f="reps" data-idx="'+j+'" data-d="-1">-</button><input class="sinp" type="number" inputmode="numeric" placeholder="'+repLabel+'" id="r-'+ek+'-'+j+'" value="'+(set.reps||'')+'" data-ex="'+ea+'" data-f="reps" data-idx="'+j+'"/><button class="sbtn" data-act="step" data-ex="'+ea+'" data-f="reps" data-idx="'+j+'" data-d="1">+</button></div><div style="width:28px;"></div><button class="schk'+(set.done?' done':'')+'" data-act="chk" data-ex="'+ea+'" data-idx="'+j+'">'+(set.done?'&#10003;':'')+'</button></div>';
  }
  var rowClass='sr'+(set.done?' done':'')+(set.warmup?' warmup':'');var numDisplay=set.warmup?'WU':(j+1);
  var h='<div class="'+rowClass+'" id="sr-'+ek+'-'+j+'"><div class="sn">'+numDisplay+'</div>';
  if(exIsLoaded(ex)){
    h+='<div class="step"><button class="sbtn" data-act="step" data-ex="'+ea+'" data-f="weight" data-idx="'+j+'" data-d="-5">-</button><input class="sinp" type="number" inputmode="decimal" placeholder="lbs" id="w-'+ek+'-'+j+'" value="'+(set.weight||'')+'" data-ex="'+ea+'" data-f="weight" data-idx="'+j+'"/><button class="sbtn" data-act="step" data-ex="'+ea+'" data-f="weight" data-idx="'+j+'" data-d="5">+</button></div>';
  }else{
    h+='<div class="step" style="opacity:.3;pointer-events:none;"><button class="sbtn">-</button><input class="sinp" value="BW" readonly/><button class="sbtn">+</button></div>';
  }
  h+='<div class="step"><button class="sbtn" data-act="step" data-ex="'+ea+'" data-f="reps" data-idx="'+j+'" data-d="-1">-</button><input class="sinp" type="number" inputmode="numeric" placeholder="reps" id="r-'+ek+'-'+j+'" value="'+(set.reps||'')+'" data-ex="'+ea+'" data-f="reps" data-idx="'+j+'"/><button class="sbtn" data-act="step" data-ex="'+ea+'" data-f="reps" data-idx="'+j+'" data-d="1">+</button></div>';
  h+='<button class="wu-btn'+(set.warmup?' on':'')+'" data-act="wu" data-ex="'+ea+'" data-idx="'+j+'" title="Warm-up">WU</button>';
  h+='<button class="schk'+(set.done?' done':'')+'" data-act="chk" data-ex="'+ea+'" data-idx="'+j+'">'+(set.done?'&#10003;':'')+'</button></div>';
  return h;
}

// One delegated listener handles every control in the active workout list.
// Exercise names travel as data attributes, so apostrophes and any other
// characters in custom names are safe — no string-built inline handlers.
function bindActiveDelegation(){
  var list=el('alist');
  if(!list||list._bound)return;
  list._bound=true;
  list.addEventListener('click',function(e){
    var t=e.target.closest?e.target.closest('[data-act]'):null;
    if(!t)return;
    var act=t.getAttribute('data-act');
    var ex=t.getAttribute('data-ex');
    var idx=parseInt(t.getAttribute('data-idx'));
    if(act==='step')doStep(ex,t.getAttribute('data-f'),idx,parseFloat(t.getAttribute('data-d')));
    else if(act==='wu')togWarmup(ex,idx);
    else if(act==='chk')togS(ex,idx);
    else if(act==='notes')showNotes(t.getAttribute('data-ek'));
    else if(act==='sub')openSubstitute(ex);
    else if(act==='remex')removeExFromWorkout(ex);
    else if(act==='adds')addS(ex);
    else if(act==='rems')removeS(ex);
  });
  list.addEventListener('input',function(e){
    var t=e.target;
    if(t&&t.classList&&t.classList.contains('sinp')&&t.hasAttribute('data-ex')){
      updS(t.getAttribute('data-ex'),parseInt(t.getAttribute('data-idx')),t.getAttribute('data-f'),t.value);
    }
  });
}

function renderActive(){
  var list=el('alist');var day=S.activeDay;list.innerHTML='';updProg();
  bindActiveDelegation();
  var wd=getWeekData();var suggestions=getOverloadSuggestions();var suggestSet={};for(var i=0;i<suggestions.length;i++)suggestSet[suggestions[i].name]=true;
  var main=[],core=[];for(var i=0;i<day.ex.length;i++){if(day.ex[i].type==='Core')core.push(day.ex[i]);else main.push(day.ex[i]);}
  var lastSS='';
  for(var i=0;i<main.length;i++){
    var ex=main[i];var ek=ekOf(ex.name);var ea=escAttr(ex.name);var sets=S.sets[ex.name];if(!sets)continue;
    if(ex.ss){var sg=ex.ss.length>1?ex.ss.slice(0,-1):ex.ss;if(sg!==lastSS){lastSS=sg;var dv=document.createElement('div');dv.className='ssd';dv.innerHTML='<div class="ssdot"></div>SUPERSET '+esc(sg);list.appendChild(dv);}}
    var blk=document.createElement('div');blk.className='eb';if(ex.ss)blk.style.marginBottom='3px';
    var sh='';
    for(var j=0;j<sets.length;j++){sh+=buildSetRowHTML(ex,sets[j],j);}
    var ssb=ex.ss?'<div class="ssb">'+esc(ex.ss)+'</div>':'';
    var notesBtn=ex.notes?'<button class="info-btn" data-act="notes" data-ek="'+ek+'">i</button>':'';
    var _rr=resolveReps(ex,wd);
    var trg='<div class="target-reps">'+(_rr.min===_rr.max?_rr.min:_rr.min+'-'+_rr.max)+'</div>';
    var olBadge=suggestSet[ex.name]?'<div class="ex-overload">&#9650; INCREASE</div>':'';
    var subBtn='<button class="info-btn" data-act="sub" data-ex="'+ea+'" title="Substitute" style="border-color:var(--hlbr);color:var(--hl);">&#8652;</button>';
    blk.innerHTML='<div class="eh"><div style="flex:1;"><div class="en">'+esc(ex.name)+'</div><div class="et">'+esc(ex.type)+'</div></div>'+olBadge+trg+subBtn+notesBtn+ssb+'<button class="rem-ex-btn" data-act="remex" data-ex="'+ea+'">&#10005;</button></div><div class="shr"><div class="sc">#</div><div class="sc">WEIGHT</div><div class="sc">REPS</div><div class="sc">WU</div><div class="sc">&#10003;</div></div>'+sh+'<div style="display:flex;border-top:1px solid var(--border);"><button class="addbtn" style="border-top:none;border-right:1px solid var(--border);" data-act="adds" data-ex="'+ea+'">+ ADD SET</button><button class="addbtn" style="border-top:none;color:var(--danger);" data-act="rems" data-ex="'+ea+'">- REMOVE</button></div>';
    list.appendChild(blk);
  }
  if(core.length){
    var ah=document.createElement('div');ah.className='abh';ah.innerHTML='<div style="font-family:\'Orbitron\',sans-serif;font-size:11px;color:var(--en);flex-shrink:0;">AB</div><div><div class="abt">AB PROTOCOL</div><div class="abs2">25 REPS EACH — ~16 MIN — NO REST</div></div>';list.appendChild(ah);
    for(var i=0;i<core.length;i++){
      var ex=core[i];var ek=ekOf(ex.name);var sets=S.sets[ex.name];if(!sets)continue;
      var blk=document.createElement('div');blk.className='eb';blk.style.marginBottom='3px';
      var sh='';
      for(var j=0;j<sets.length;j++){sh+=buildSetRowHTML(ex,sets[j],j);}
      var notesBtn=ex.notes?'<button class="info-btn" data-act="notes" data-ek="'+ek+'">i</button>':'';
      var coreTimed=(ex.timed!==undefined)?ex.timed:/plank|hold|l-sit|hollow|dead ?hang/i.test(ex.name);
      var coreRepHdr=coreTimed?'SEC':'REPS';
      var coreIsLoaded=exIsLoaded(ex);
      var coreWtHdr=coreIsLoaded?'WEIGHT':'BW';
      blk.innerHTML='<div class="eh"><div class="en">'+esc(ex.name)+'</div><div class="et" style="color:var(--en);">CORE</div>'+notesBtn+'</div><div class="shr"><div class="sc">#</div><div class="sc">'+coreWtHdr+'</div><div class="sc">'+coreRepHdr+'</div><div class="sc"></div><div class="sc">&#10003;</div></div>'+sh;
      list.appendChild(blk);
    }
  }
  if(day.cardio){var cf=document.createElement('div');cf.className='cf';cf.innerHTML='<div style="font-family:\'Orbitron\',sans-serif;font-size:10px;color:var(--hl);flex-shrink:0;">CF</div><div><div class="cft">CARDIO FINISHER</div><div class="cfd">'+esc(day.cardio)+'</div></div>';list.appendChild(cf);}
  var addExBtn=document.createElement('button');addExBtn.className='add-ex-workout';addExBtn.innerHTML='+ ADD EXERCISE TO WORKOUT';addExBtn.onclick=function(){openAddExToWorkout();};list.appendChild(addExBtn);
  var fb=document.createElement('button');fb.className='fin';fb.textContent='COMMIT SESSION';fb.onclick=showFinMo;list.appendChild(fb);
}

function removeExFromWorkout(exName){
  var sets=S.sets[exName]||[];var hasDone=false;for(var i=0;i<sets.length;i++){if(sets[i].done){hasDone=true;break;}}
  if(hasDone){S.pendingRemoveEx=exName;el('rem-ex-name').textContent=exName;el('rem-ex-mo').classList.add('visible');}
  else{doRemoveExFromWorkout(exName,false);}
}
function doRemoveExFromWorkout(exName,keepSets){
  var day=S.activeDay;for(var i=0;i<day.ex.length;i++){if(day.ex[i].name===exName){day.ex.splice(i,1);break;}}
  if(!keepSets){delete S.sets[exName];}
  else{
    if(!S.removedSets)S.removedSets={};
    // Only completed work is worth preserving
    var kept=(S.sets[exName]||[]).filter(function(s){return s.done;});
    if(kept.length)S.removedSets[exName]=kept;
    delete S.sets[exName];
  }
  S.pendingRemoveEx=null;renderActive();saveActive();showToast('EXERCISE REMOVED');
}
function openAddExToWorkout(){
  el('aew-name').value='';el('aew-type').value='';el('aew-sets').value='3';el('aew-weight').value='';
  el('aew-search').value='';
  el('aew-selected-wrap').style.display='none';
  el('aew-selected-name').textContent='';
  filterAddExList();
  el('add-ex-workout-mo').classList.add('visible');
}

function filterAddExList(){
  var q=(el('aew-search').value||'').toLowerCase();
  var list=el('aew-lib-list');list.innerHTML='';
  var filtered=LIB.filter(function(ex){
    return !q||ex.name.toLowerCase().indexOf(q)>=0||ex.muscle.toLowerCase().indexOf(q)>=0;
  });
  filtered=filtered.slice(0,20); // show max 20 results
  for(var i=0;i<filtered.length;i++){
    var ex=filtered[i];
    var item=document.createElement('div');
    item.style.cssText='padding:8px 10px;border-bottom:1px solid var(--border);cursor:pointer;display:flex;align-items:center;gap:8px;';
    item.innerHTML='<div style="flex:1;"><div style="font-family:Rajdhani,sans-serif;font-weight:600;font-size:12px;color:var(--tx);">'+ex.name+'</div>'
      +'<div style="font-family:Share Tech Mono,monospace;font-size:7px;color:var(--s2);">'+ex.muscle.toUpperCase()+' — '+ex.type+'</div></div>'
      +'<div style="font-family:Orbitron,sans-serif;font-size:7px;color:var(--hl);">SELECT</div>';
    (function(exercise){item.onclick=function(){
      el('aew-name').value=exercise.name;
      el('aew-type').value=exercise.type;
      el('aew-selected-name').textContent=exercise.name;
      el('aew-selected-wrap').style.display='block';
      el('aew-search').value=exercise.name;
      filterAddExList();
    };})(ex);
    list.appendChild(item);
  }
  if(!filtered.length){
    list.innerHTML='<div style="font-family:Share Tech Mono,monospace;font-size:8px;color:var(--s2);padding:10px;text-align:center;">No results — use custom name below</div>';
  }
}
function confirmAddExToWorkout(){
  var name=el('aew-name').value.trim();if(!name){showToast('NAME REQUIRED');return;}
  var type=el('aew-type').value.trim()||'Custom';var sets=parseInt(el('aew-sets').value)||3;var weight=parseFloat(el('aew-weight').value)||0;var wd=getWeekData();
  // An exercise added mid-session inherits the day's own rep scheme when the
  // program defines one, so it does not drift back to the global week.
  var _ap=activeProgram(), _slotReps=null;
  if(_ap&&_ap.peri==='slot'&&S.activeDay&&S.activeDay.ex.length){
    var _f=S.activeDay.ex[S.activeDay.ex.length-1];
    if(_f&&_f.repMin!=null)_slotReps={min:_f.repMin,max:(_f.repMax!=null?_f.repMax:_f.repMin)};
  }
  var _dr=_slotReps?_slotReps.min:(wd.repMin||wd.reps);
  var newEx={name:name,type:type,ds:sets,dr:_dr,dw:weight,ss:'',notes:''};
  if(_slotReps){newEx.repMin=_slotReps.min;newEx.repMax=_slotReps.max;}
  if(type==='Core'){var cf=coreFlags(name);newEx.loaded=cf.loaded;newEx.timed=cf.timed;}
  S.activeDay.ex.push(newEx);var arr=[];for(var i=0;i<sets;i++)arr.push({weight:weight,reps:_dr,done:false,warmup:false,rpe:0});
  S.sets[name]=arr;closeModal('add-ex-workout-mo');renderActive();saveActive();showToast('EXERCISE ADDED');
}
function exIsLoaded(ex){
  if(!ex)return true;
  if(ex.loaded!==undefined)return !!ex.loaded;
  if(ex.type==='Core')return coreFlags(ex.name).loaded;
  return true;
}
function coreFlags(name){
  var n=name.toLowerCase();
  var loaded=/cable|woodchop|wood chop|pallof|weighted|landmine rotation|russian twist|decline sit|side bend|suitcase|knee raise|hip thrust|machine crunch|weighted crunch/.test(n);
  var timed=/plank|hold|l-sit|hollow|dead ?hang/.test(n);
  return {loaded:loaded,timed:timed};
}
function showNotes(ek){var day=S.activeDay;var ex=null;for(var i=0;i<day.ex.length;i++){if(day.ex[i].name.replace(/[^a-zA-Z0-9]/g,'_')===ek){ex=day.ex[i];break;}}if(!ex||!ex.notes)return;el('notes-ex-name').textContent=ex.name;el('notes-content').textContent=ex.notes;el('notes-mo').classList.add('visible');}
function updProg(){var day=S.activeDay;var tot=0,dn=0;for(var i=0;i<day.ex.length;i++){var sets=S.sets[day.ex[i].name];if(!sets)continue;for(var j=0;j<sets.length;j++){if(!sets[j].warmup)tot++;if(sets[j].done&&!sets[j].warmup)dn++;}}el('pfill').style.width=(tot?Math.round(dn/tot*100):0)+'%';}
function updS(exName,idx,field,val){
  if(!S.sets[exName]||!S.sets[exName][idx])return;
  if(val===''){S.sets[exName][idx][field]='';saveActiveDebounced();return;}
  var n=parseFloat(val);
  if(!isFinite(n)||n<0)return;
  var max=field==='weight'?2000:500;
  if(n>max)n=max;
  S.sets[exName][idx][field]=n;
  saveActiveDebounced();
}
function doStep(exName,field,idx,delta){
  if(!S.sets[exName]||!S.sets[exName][idx])return;
  var ek=ekOf(exName);
  var inp=el((field==='weight'?'w-':'r-')+ek+'-'+idx);
  var cur=parseFloat(S.sets[exName][idx][field])||0;
  var nv=Math.max(0,cur+delta);
  if(field==='weight')nv=Math.round(nv/2.5)*2.5;
  S.sets[exName][idx][field]=nv;
  if(inp)inp.value=nv||'';
  saveActiveDebounced();
}
function togWarmup(exName,idx){
  if(!S.sets[exName])return;
  S.sets[exName][idx].warmup=!S.sets[exName][idx].warmup;
  renderActive();saveActive();
}
function togS(exName,idx){
  if(!S.sets[exName])return;var set=S.sets[exName][idx];var ek=exName.replace(/[^a-zA-Z0-9]/g,'_');
  var wi=el('w-'+ek+'-'+idx);var ri=el('r-'+ek+'-'+idx);
  if(wi&&wi.value)set.weight=parseFloat(wi.value)||set.weight;if(ri&&ri.value)set.reps=parseFloat(ri.value)||set.reps;
  set.done=!set.done;
  if(set.done)vibe(15);
  if(set.done&&set.weight&&!set.warmup){var orm=calcEpley(parseFloat(set.weight)||0,parseFloat(set.reps)||0);if(!S.prs[exName]||set.weight>S.prs[exName].weight)S.prs[exName]={weight:set.weight,date:new Date().toISOString(),orm:orm};}
  var row=el('sr-'+ek+'-'+idx);
  if(row){if(set.done)row.classList.add('done');else row.classList.remove('done');var btn=row.querySelector('.schk');if(set.done)btn.classList.add('done');else btn.classList.remove('done');btn.innerHTML=set.done?'&#10003;':'';var num=row.querySelector('.sn');if(num)num.style.color=set.done?'var(--hl)':'';}
  updProg();saveActive();
  if(set.done&&!set.warmup){
    lastCheckedExName=exName;
    lastCheckedSetIdx=idx;
    initRPEGrid();
    startRest();
  }
}
function addS(exName){
  if(!S.sets[exName])return;
  var sets=S.sets[exName];var last=sets[sets.length-1];
  sets.push({weight:last?last.weight:'',reps:last?last.reps:'',done:false,warmup:false,rpe:0});
  // Surgical insert — full re-render would drop keyboard focus mid-entry
  var ex=exByName(exName);var j=sets.length-1;var ek=ekOf(exName);
  var prev=el('sr-'+ek+'-'+(j-1));
  if(ex&&prev)prev.insertAdjacentHTML('afterend',buildSetRowHTML(ex,sets[j],j));
  else renderActive();
  updProg();saveActive();
}
function removeS(exName){
  if(!S.sets[exName])return;
  var sets=S.sets[exName];
  if(sets.length<=1){showToast("MINIMUM 1 SET");return;}
  var j=sets.length-1;var ek=ekOf(exName);
  sets.pop();
  var row=el('sr-'+ek+'-'+j);
  if(row&&row.parentNode)row.parentNode.removeChild(row);
  else renderActive();
  updProg();saveActive();
}
function startTmr(){if(S.tint)clearInterval(S.tint);S.tint=setInterval(function(){var e=Math.floor((Date.now()-S.start)/1000);var s=e%60;el('wclock').textContent=Math.floor(e/60)+':'+(s<10?'0':'')+s;},1000);}
function endWkt(){
  var hasDone=false;
  for(var k in S.sets){
    var ss=S.sets[k];
    for(var j=0;j<ss.length;j++){if(ss[j].done){hasDone=true;break;}}
    if(hasDone)break;
  }
  if(hasDone){el('abort-mo').classList.add('visible');return;}
  doAbortWkt();
}
function doAbortWkt(){
  closeModal('abort-mo');
  if(S.tint)clearInterval(S.tint);
  skipRest();clearActive();releaseWakeLock();
  S.activeDay=null;S.sets={};S.removedSets={};S.start=null;
  showScreen('s-home');
}
function showFinMo(){
  var elapsed=Math.floor((Date.now()-S.start)/1000);var day=S.activeDay;var wd=getWeekData();var ts=0,ds=0,vol=0,warmups=0;
  for(var i=0;i<day.ex.length;i++){var sets=S.sets[day.ex[i].name];if(!sets)continue;for(var j=0;j<sets.length;j++){if(sets[j].warmup){warmups++;continue;}ts++;if(sets[j].done){ds++;vol+=(parseFloat(sets[j].weight)||0)*(parseFloat(sets[j].reps)||0);}}}
  if(S.removedSets){for(var rk in S.removedSets){var rs=S.removedSets[rk];for(var j=0;j<rs.length;j++){if(rs[j].warmup){warmups++;continue;}if(rs[j].done){ts++;ds++;vol+=(parseFloat(rs[j].weight)||0)*(parseFloat(rs[j].reps)||0);}}}}
  el('finsum').innerHTML='PROTOCOL: '+esc(day.name)+'<br>WEEK: '+wd.week+' ('+wd.label+')<br>DURATION: '+Math.floor(elapsed/60)+' MIN<br>WORKING SETS: '+ds+' / '+ts+'<br>WARM-UP SETS: '+warmups+'<br>VOLUME: '+vol.toLocaleString()+' LBS';
  el('finmo').classList.add('visible');
}
function confirmFin(){
  var elapsed=Math.floor((Date.now()-S.start)/1000);var day=S.activeDay;var wd=getWeekData();var ts=0,vol=0;var rawSets=JSON.parse(JSON.stringify(S.sets));
  // Exercises removed mid-session with "save sets to log" commit their completed work
  if(S.removedSets){
    for(var rk in S.removedSets){
      if(!rawSets[rk])rawSets[rk]=JSON.parse(JSON.stringify(S.removedSets[rk]));
      var rs=S.removedSets[rk];
      for(var j=0;j<rs.length;j++){if(rs[j].done&&!rs[j].warmup){ts++;vol+=(parseFloat(rs[j].weight)||0)*(parseFloat(rs[j].reps)||0);}}
    }
  }
  for(var i=0;i<day.ex.length;i++){var sets=S.sets[day.ex[i].name];if(!sets)continue;for(var j=0;j<sets.length;j++){if(sets[j].done&&!sets[j].warmup){ts++;vol+=(parseFloat(sets[j].weight)||0)*(parseFloat(sets[j].reps)||0);}}}
  S.log.push({date:new Date().toISOString(),dayId:day.id,lbl:day.lbl,name:day.name,dur:Math.floor(elapsed/60)+' min',sets:ts,vol:Math.round(vol),rawSets:rawSets,week:wd.week,phase:wd.label});
  saveState();clearActive();releaseWakeLock();
  S.activeDay=null;S.sets={};S.removedSets={};S.start=null;
  closeModal('finmo');if(S.tint)clearInterval(S.tint);skipRest();showToast('SESSION COMMITTED');showScreen('s-home');
  // Backup hygiene: nudge every 10 sessions if no recent export
  var n=S.log.length;
  if(n>0&&n%10===0){
    var lastMs=S.lastExport?new Date(S.lastExport).getTime():0;
    if(!lastMs||Date.now()-lastMs>14*864e5){
      setTimeout(function(){
        var msg=lastMs?'BACKUP REMINDER — LAST EXPORT '+Math.floor((Date.now()-lastMs)/864e5)+'D AGO':'BACKUP REMINDER — NEVER EXPORTED';
        showActionToast(msg,'EXPORT',exportBackup,8000);
      },2600);
    }
  }
}

// ════════════════════════════════
// REST TIMER
// ════════════════════════════════
// startRest replaced by background-aware version below,1000);}
function updRest(){el('rcnt').textContent=rRem;el('rfill').style.strokeDashoffset=490*(1-rRem/S.rdur);}
// skipRest replaced below
// setRD replaced below

// ════════════════════════════════
// BACKGROUND-AWARE REST TIMER
// ════════════════════════════════
var restStartTime = null;
var restDuration = 90;

function startRest(){
  if(S.rint)clearInterval(S.rint);
  restStartTime = Date.now();
  restDuration = S.rdur;
  rRem = S.rdur;
  updRest();
  el('resto').classList.add('visible');
  S.rint = setInterval(function(){
    var elapsed = Math.floor((Date.now() - restStartTime) / 1000);
    rRem = Math.max(0, restDuration - elapsed);
    updRest();
    if(rRem <= 0){vibe([120,60,120]);skipRest();}
  }, 500);
  // Handle page visibility changes
  document.removeEventListener('visibilitychange', onVisibilityChange);
  document.addEventListener('visibilitychange', onVisibilityChange);
}

function onVisibilityChange(){
  if(!document.hidden && restStartTime && el('resto').classList.contains('visible')){
    var elapsed = Math.floor((Date.now() - restStartTime) / 1000);
    rRem = Math.max(0, restDuration - elapsed);
    updRest();
    if(rRem <= 0){vibe([120,60,120]);skipRest();}
  }
}

function skipRest(){
  if(S.rint)clearInterval(S.rint);
  restStartTime=null;
  el('resto').classList.remove('visible');
}

function setRD(s,btn){
  S.rdur=s;restDuration=s;rRem=s;
  if(restStartTime)restStartTime=Date.now(); // reset start if timer running
  updRest();
  var bs=document.querySelectorAll('.rd');
  for(var i=0;i<bs.length;i++)bs[i].classList.remove('active');
  if(btn)btn.classList.add('active');
}

// ════════════════════════════════
// RPE SYSTEM
// ════════════════════════════════
var currentRPE = null;
var lastCheckedExName = null;
var lastCheckedSetIdx = null;

// RPE gradient colors: 1=green, 4-5=yellow, 7=orange, 10=red
var RPE_COLORS=[
  '#4caf50', // 1 - green
  '#8bc34a', // 2 - yellow-green
  '#cddc39', // 3 - lime
  '#ffeb3b', // 4 - yellow
  '#ffc107', // 5 - amber
  '#ff9800', // 6 - orange
  '#ff6f00', // 7 - dark orange
  '#f44336', // 8 - red-orange
  '#e53935', // 9 - red
  '#b71c1c'  // 10 - deep red
];

var RPE_MESSAGES=[
  '',
  'TOO EASY — INCREASE WEIGHT NEXT SESSION',   // 1
  'VERY LIGHT — NEXT SET +5 LBS',              // 2
  'LIGHT — NEXT SET +5 LBS',                   // 3
  'COMFORTABLE — NEXT SET +2.5 LBS',           // 4
  'ON TARGET — MAINTAIN WEIGHT',               // 5
  'WORKING HARD — MAINTAIN WEIGHT',            // 6
  'CHALLENGING — MAINTAIN WEIGHT',             // 7
  'VERY HARD — CONSIDER DROPPING WEIGHT',      // 8
  'NEAR LIMIT — DROP WEIGHT NEXT SET',         // 9
  'MAX EFFORT — DROP WEIGHT OR DELOAD'         // 10
];

var RPE_DELTAS=[0, 5, 5, 5, 2.5, 0, 0, 0, -2.5, -5, -5]; // index 0 unused

function initRPEGrid(){
  var grid = el('rpe-grid');
  if(!grid)return;
  grid.innerHTML='';
  for(var i=1;i<=10;i++){
    var color=RPE_COLORS[i-1];
    var btn=document.createElement('button');
    btn.className='rpe-btn';
    btn.textContent=i;
    btn.setAttribute('data-rpe',i);
    btn.style.borderColor=color;
    btn.style.color=color;
    btn.style.setProperty('--rpe-color',color);
    (function(rpe,col){btn.onclick=function(){selectRPE(rpe,col);};})(i,color);
    grid.appendChild(btn);
  }
  currentRPE=null;
  el('rpe-feedback').textContent='';
  el('rpe-feedback').style.color='';
}

function selectRPE(rpe,color){
  currentRPE=rpe;
  if(lastCheckedExName&&S.sets[lastCheckedExName]&&S.sets[lastCheckedExName][lastCheckedSetIdx]){
    S.sets[lastCheckedExName][lastCheckedSetIdx].rpe=rpe;
  }
  if(!color)color=RPE_COLORS[rpe-1];
  var btns=el('rpe-grid').querySelectorAll('.rpe-btn');
  for(var i=0;i<btns.length;i++){
    var b=btns[i];
    var bRpe=parseInt(b.getAttribute('data-rpe'));
    var bCol=RPE_COLORS[bRpe-1];
    b.classList.remove('selected');
    b.style.background='transparent';
    b.style.color=bCol;
    b.style.borderColor=bCol;
    if(bRpe===rpe){
      b.classList.add('selected');
      b.style.background=color;
      b.style.color='#000';
      b.style.borderColor=color;
    }
  }
  var fb=el('rpe-feedback');
  fb.textContent=RPE_MESSAGES[rpe]||'';
  fb.style.color=color;
  applyRPEAdjustment(RPE_DELTAS[rpe]||0);
}

function applyRPEAdjustment(delta){
  if(!lastCheckedExName||lastCheckedSetIdx===null)return;
  var sets=S.sets[lastCheckedExName];
  if(!sets)return;
  // Find next incomplete working set
  for(var i=lastCheckedSetIdx+1;i<sets.length;i++){
    if(!sets[i].done&&!sets[i].warmup){
      var cur=parseFloat(sets[i].weight)||0;
      var nw=Math.max(0,Math.round((cur+delta)/2.5)*2.5);
      sets[i].weight=nw;
      // Update the input on screen
      var ek=lastCheckedExName.replace(/[^a-zA-Z0-9]/g,'_');
      var inp=el('w-'+ek+'-'+i);
      if(inp)inp.value=nw||'';
      break;
    }
  }
  saveActive();
}

// ════════════════════════════════
// AB DIFFICULTY
// ════════════════════════════════
var abDiffSelected = 'standard';

var AB_PRESETS = {
  light: [
    {name:'Cable Crunch',type:'Core',loaded:true,ds:2,dr:15,dw:40,ss:'',notes:'Kneel at cable. Pull elbows to knees. Round spine fully.'},
    {name:'Hanging Leg Raise',type:'Core',ds:2,dr:12,dw:0,ss:'',notes:'Raise legs to 90 degrees. Posterior pelvic tilt at top.'},
    {name:'Plank',type:'Core',ds:3,dr:30,dw:0,ss:'',notes:'30 sec hold. Squeeze core and glutes. Neutral spine.'},
    {name:'Russian Twist',type:'Core',loaded:true,ds:2,dr:16,dw:10,ss:'',notes:'16 total reps. Lean back 45 degrees. Light weight.'}
  ],
  standard: [
    {name:'Cable Crunch',type:'Core',loaded:true,ds:3,dr:15,dw:50,ss:'',notes:'Kneel at cable. Pull elbows to knees. Round spine fully. 3 sec negative.'},
    {name:'Hanging Leg Raise',type:'Core',ds:3,dr:15,dw:0,ss:'',notes:'Dead hang. Raise legs to 90 degrees or higher. No swinging.'},
    {name:'Decline Sit-Up',type:'Core',loaded:true,ds:3,dr:15,dw:25,ss:'',notes:'Hold plate on chest. Full ROM. 3 sec negative.'},
    {name:'Russian Twist',type:'Core',loaded:true,ds:3,dr:20,dw:25,ss:'',notes:'20 total reps. Hold plate. Lean back 45 degrees. Rotate fully.'},
    {name:'Plank',type:'Core',ds:3,dr:45,dw:0,ss:'',notes:'45 sec hold. Squeeze glutes and core. Neutral spine.'},
    {name:'Side Plank',type:'Core',ds:2,dr:30,dw:0,ss:'',notes:'30 sec each side. Hips up. Straight line head to feet.'}
  ],
  heavy: [
    {name:'Cable Crunch',type:'Core',loaded:true,ds:4,dr:15,dw:70,ss:'',notes:'Kneel at cable. Pull elbows to knees. Heavy weight, full contraction. 3 sec negative.'},
    {name:'Hanging Leg Raise',type:'Core',ds:4,dr:15,dw:0,ss:'',notes:'Add ankle weights for progression. Full ROM. Slow and controlled.'},
    {name:'Decline Sit-Up',type:'Core',loaded:true,ds:4,dr:15,dw:45,ss:'',notes:'Heavy plate on chest. Full ROM. 3 sec negative. Feel the stretch.'},
    {name:'Russian Twist',type:'Core',loaded:true,ds:3,dr:24,dw:35,ss:'',notes:'24 total reps. Heavy plate or dumbbell. Explosive rotation.'},
    {name:'Plank',type:'Core',ds:3,dr:60,dw:0,ss:'',notes:'60 sec hold. Add weight plate on back for progression.'},
    {name:'Side Plank',type:'Core',ds:3,dr:45,dw:0,ss:'',notes:'45 sec each side. Add hip dips for extra oblique work.'},
    {name:'Ab Wheel Rollout',type:'Core',ds:3,dr:12,dw:0,ss:'',notes:'Full extension. Pull back with abs. Keep lower back from caving.'}
  ]
};

function openAbDiff(){
  abDiffSelected='standard';
  updateAbDiffUI();
  el('ab-diff-mo').classList.add('visible');
}

function selectAbDiff(diff){
  abDiffSelected=diff;
  updateAbDiffUI();
}

function updateAbDiffUI(){
  var btns=['light','standard','heavy'];
  var colors={light:'',standard:'warn',heavy:'danger'};
  for(var i=0;i<btns.length;i++){
    var btn=el('ab-diff-'+btns[i]);
    btn.className='ab-diff-btn'+(abDiffSelected===btns[i]?' active'+(colors[btns[i]]?' '+colors[btns[i]]:''):'');
  }
  var preset=AB_PRESETS[abDiffSelected];
  var preview='';
  for(var i=0;i<Math.min(preset.length,4);i++){
    preview+=preset[i].name+' — '+preset[i].dr+' reps\n';
  }
  if(preset.length>4)preview+='+ '+(preset.length-4)+' more exercises';
  el('ab-diff-preview').textContent=preview;
}

function confirmAddAb(){
  var day=getDay(editingDayId);
  var preset=AB_PRESETS[abDiffSelected];
  // Remove existing core exercises first
  day.ex=day.ex.filter(function(ex){return ex.type!=='Core';});
  // Add new ones
  for(var i=0;i<preset.length;i++){day.ex.push(JSON.parse(JSON.stringify(preset[i])));}
  saveState();
  closeModal('ab-diff-mo');
  renderEditor();
  showToast('AB WORKOUT ADDED — '+abDiffSelected.toUpperCase());
}
