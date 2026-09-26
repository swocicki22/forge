// ════════════════════════════════
// PROGRAM UI
// The program strip on the protocol screen, the program picker, and the
// one-time notice describing what the schema migration changed.
// ════════════════════════════════

// ── migration notice ──────────────────────────────────────────
// Shown once, after the v2→v3 migration. Every change is reversible from
// Settings → Restore Backup, and the notice says so.
function showMigrationNotice(){
  if(!lastMigrationReport||!lastMigrationReport.length)return;
  var body=el('mig-body');
  if(!body)return;
  var h='<div style="font-family:\'Share Tech Mono\',monospace;font-size:8px;'+
        'letter-spacing:.1em;color:var(--s2);text-transform:uppercase;margin-bottom:8px;">'+
        lastMigrationReport.length+' change'+(lastMigrationReport.length===1?'':'s')+'</div>';
  h+='<div style="max-height:46vh;overflow-y:auto;">';
  for(var i=0;i<lastMigrationReport.length;i++){
    var t=lastMigrationReport[i];
    var warn=/WARNING|corrected|discarded|unconfirmed/i.test(t);
    h+='<div style="display:flex;gap:7px;align-items:flex-start;padding:5px 0;'+
       'border-bottom:1px solid var(--border);">'+
       '<div style="width:3px;flex-shrink:0;align-self:stretch;background:'+
       (warn?'var(--am)':'var(--s3)')+';"></div>'+
       '<div style="font-family:\'Rajdhani\',sans-serif;font-size:11px;line-height:1.35;color:'+
       (warn?'var(--st)':'var(--t2)')+';">'+esc(t)+'</div></div>';
  }
  h+='</div><div style="font-family:\'Rajdhani\',sans-serif;font-size:10px;color:var(--s2);'+
     'margin-top:9px;line-height:1.4;">A full copy of your data from before these changes '+
     'was saved first. Settings &rarr; Restore Backup puts it all back.</div>';
  body.innerHTML=h;
  el('mig-mo').classList.add('visible');
}
function dismissMigrationNotice(){
  closeModal('mig-mo');
  lastMigrationReport=null;
}

// ── program strip ─────────────────────────────────────────────
// Sits at the top of the protocol grid. For a scheduled program it shows
// where you are in the block; for a free one, the periodization week.
function buildProgramStrip(){
  var p=activeProgram();
  var strip=document.createElement('div');
  strip.style.cssText='grid-column:1/-1;background:var(--card);border:1px solid var(--bl);'+
    'border-radius:2px;padding:9px 11px;display:flex;align-items:center;justify-content:space-between;gap:9px;';
  var left,right;
  if(p&&p.mode==='scheduled'){
    var nx=nextWorkout(p),pr=programProgress(p),phs=phaseCount(p),st=progState(p.id);
    var curPh=nx?phaseOf(nx):phs;
    // one segment per phase, filled by the share of its workouts done
    var bar='<div class="ph-bar">';
    for(var q=1;q<=phs;q++){
      var dd=phaseDays(p,q),rq=0,dn=0;
      for(var z=0;z<dd.length;z++){if(!dd[z].optional){rq++;if(isDone(st,dd[z]))dn++;}}
      var pct=rq?Math.round(dn/rq*100):0;
      bar+='<div class="ph-seg'+(q===curPh&&nx?' cur':'')+'"><div style="width:'+pct+'%"></div></div>';
    }
    bar+='</div>';
    left='<div style="flex:1;min-width:0;"><div class="strip-k">'+esc(p.name)+'</div>'+
         '<div class="strip-v">'+(nx?'PHASE '+curPh+' OF '+phs:'COMPLETE')+'</div>'+bar+
         '<div class="strip-s">'+pr.done+' of '+pr.total+' workouts done</div></div>';
    right='<div style="display:flex;gap:5px;flex-shrink:0;">'+
          (p.custom?'<button class="mini-btn" onclick="openProgramEditor(\''+p.id+'\')">EDIT</button>'
                   :'<button class="mini-btn" onclick="editBuiltinProgram()">EDIT</button>')+
          '<button class="mini-btn" onclick="openProgramPicker()">SWITCH</button></div>';
  }else if(p&&p.peri==='slot'){
    // A free custom program carries its own reps on every exercise, so the
    // global periodization week has nothing to say about it.
    var nd=0;for(var z=0;z<p.days.length;z++)if(!p.days[z].rest)nd++;
    left='<div><div style="font-family:\'Share Tech Mono\',monospace;font-size:7px;'+
         'letter-spacing:.12em;color:var(--s2);text-transform:uppercase;">'+esc(p.name)+'</div>'+
         '<div style="font-family:\'Orbitron\',sans-serif;font-size:11px;color:var(--am);margin-top:2px;">'+
         nd+' DAY'+(nd===1?'':'S')+' \u2014 PICK ANY</div></div>';
    right='<div style="display:flex;gap:5px;">'+
          (p.custom?'<button class="mini-btn" onclick="openProgramEditor(\''+p.id+'\')">EDIT</button>':'')+
          '<button class="mini-btn" onclick="openProgramPicker()">SWITCH</button></div>';
  }else{
    var wd=getWeekData();
    left='<div><div style="font-family:\'Share Tech Mono\',monospace;font-size:7px;'+
         'letter-spacing:.12em;color:var(--s2);text-transform:uppercase;">'+
         esc(p?p.name:'Forge')+' &middot; periodization</div>'+
         '<div style="font-family:\'Orbitron\',sans-serif;font-size:11px;color:var(--am);margin-top:2px;">'+
         'WEEK '+wd.week+' — '+(wd.repMin||wd.reps)+'-'+(wd.repMax||wd.reps)+' REPS — '+wd.label+'</div></div>';
    right='<div style="display:flex;gap:5px;">'+
          '<button class="mini-btn" onclick="advanceWeek()">ADVANCE</button>'+
          '<button class="mini-btn" onclick="openProgramPicker()">SWITCH</button></div>';
  }
  strip.innerHTML=left+right;
  return strip;
}

// ── picker ────────────────────────────────────────────────────
function openProgramPicker(){
  renderProgramPicker();
  el('prog-mo').classList.add('visible');
}
function renderProgramPicker(){
  var c=el('prog-body');if(!c)return;
  var h='<button class="add-ex-btn" style="margin-bottom:10px;" onclick="openNewProgram()">+ NEW PROGRAM</button>';
  for(var i=0;i<S.programs.length;i++){
    var p=S.programs[i];
    var on=(p.id===S.activeProgramId);
    var tr=0;
    for(var j=0;j<p.days.length;j++){if(!p.days[j].rest)tr++;}
    var meta=(p.mode==='scheduled')
      ? (p.weeks+' phase'+(p.weeks===1?'':'s')+' &middot; '+(p.perWeek||0)+' workouts each')
      : (tr+' days &middot; pick any, any time');
    var badge=on?'<div class="pp-badge on">ACTIVE</div>'
                :'<div class="pp-badge">'+esc(p.custom?'CUSTOM':(p.level||''))+'</div>';
    // Actions stop propagation so they never also switch the active program.
    var acts='<div class="pp-acts">'+
      '<button class="mini-btn" onclick="event.stopPropagation();dupProgram(\''+p.id+'\')">DUPLICATE</button>'+
      (p.custom?'<button class="mini-btn" onclick="event.stopPropagation();openProgramEditor(\''+p.id+'\')">EDIT</button>':'')+
      '</div>';
    h+='<div class="pp-card'+(on?' on':'')+'" onclick="chooseProgram(\''+p.id+'\')">'+
       '<div class="pp-head"><div class="pp-name">'+esc(p.name.toUpperCase())+'</div>'+badge+'</div>'+
       '<div class="pp-meta">'+meta+'</div>'+
       (p.desc?'<div class="pp-desc">'+esc(p.desc)+'</div>':'')+
       (p.notes?'<div class="pp-notes">'+esc(p.notes)+'</div>':'')+
       acts+'</div>';
  }
  c.innerHTML=h;
}
function dupProgram(pid){
  var src=getProgram(pid);if(!src)return;
  var p=duplicateProgram(pid,src.name+' (copy)',false);
  if(!p)return;
  showToast('DUPLICATED');
  closeModal('prog-mo');
  openProgramEditor(p.id);
}

// ── new program ───────────────────────────────────────────────
var npMode='scheduled';
function openNewProgram(){
  closeModal('prog-mo');
  el('np-name').value='';el('np-weeks').value='6';
  setNpMode('scheduled');
  el('new-prog-mo').classList.add('visible');
}
function setNpMode(m){
  npMode=m;
  el('np-mode-sched').classList.toggle('on',m==='scheduled');
  el('np-mode-free').classList.toggle('on',m==='free');
  el('np-weeks-row').style.display=(m==='scheduled')?'block':'none';
  el('np-mode-help').textContent=(m==='scheduled')
    ? 'A sequence of workouts repeated across phases. Finish one and the next is up. Reps can progress from phase to phase. Like Shred Athletic.'
    : 'A set of days you pick from freely, any time. Like your original Forge days.';
}
function createNewProgram(){
  var name=el('np-name').value.trim();if(!name){showToast('NAME REQUIRED');return;}
  var p=createCustomProgram({name:name,mode:npMode,weeks:parseInt(el('np-weeks').value,10)||6});
  closeModal('new-prog-mo');
  openProgramEditor(p.id);
}

// ── program editor ────────────────────────────────────────────
var pePid=null;
function openProgramEditor(pid){
  pePid=pid;renderProgramEditor();
  el('prog-edit-mo').classList.add('visible');
}
function peProg(){return getProgram(pePid);}
function renderProgramEditor(){
  var p=peProg(),c=el('pe-body');if(!p||!c)return;
  var sched=(p.mode==='scheduled');
  var h='<div class="fl">Program name</div><input class="fi" id="pe-name" value="'+escAttr(p.name)+'" onchange="peSetName(this.value)"/>';
  if(sched){
    h+='<div class="fl">Phases</div><input class="fi" id="pe-weeks" type="number" inputmode="numeric" min="1" max="52" value="'+p.weeks+'" onchange="peSetWeeks(this.value)"/>';
    h+='<div class="pe-help">Each phase runs every workout below once, in order. Reps can progress from phase 1 to the last phase.</div>';
    if((p.order||[]).length)
      h+='<button class="add-ex-btn" style="margin-top:10px;" onclick="openPhaseReps(\''+p.id+'\')">&#9776; EDIT REPS BY PHASE</button>';
    h+='<div class="pe-sec">WORKOUTS IN EACH PHASE</div>';
    var ord=p.order||[];
    if(!ord.length)h+='<div class="pe-help">Add a workout below and it appears here. Reorder with the arrows.</div>';
    for(var d=0;d<ord.length;d++){
      var opts='';
      for(var k=0;k<p.sessions.length;k++){
        var ss=p.sessions[k];
        opts+='<option value="'+ss.sid+'"'+(ord[d]===ss.sid?' selected':'')+'>'+esc(ss.name)+'</option>';
      }
      h+='<div class="pe-day"><div class="pe-dlbl">#'+(d+1)+'</div>'+
         '<select class="fi pe-sel" onchange="peSetOrder('+d+',this.value)">'+opts+'</select>'+
         '<button class="pe-mv" onclick="peMove('+d+',-1)"'+(d===0?' disabled':'')+'>&#9650;</button>'+
         '<button class="pe-mv" onclick="peMove('+d+',1)"'+(d===ord.length-1?' disabled':'')+'>&#9660;</button>'+
         '<button class="pe-x" onclick="peRemoveOrder('+d+')">&#10005;</button></div>';
    }
    if(p.sessions.length&&ord.length)
      h+='<button class="pe-link" onclick="peAddOrder()">+ Repeat a workout in the phase</button>';
  }
  h+='<div class="pe-sec">'+(sched?'WORKOUTS':'DAYS')+'</div>';
  if(!p.sessions.length){
    h+='<div class="pe-help">'+(sched?'No workouts yet. Name one below and add it \u2014 then tap EXERCISES to fill it.':'No days yet. Add one and fill it with exercises.')+'</div>';
  }
  for(var i=0;i<p.sessions.length;i++){
    var s=p.sessions[i],uses=0;
    if(sched)for(var q=0;q<(p.order||[]).length;q++)if(p.order[q]===s.sid)uses++;
    var info=s.ex.length+' ex'+(sched?(uses?(uses>1?' · '+uses+'× per phase':''):' · not in the phase'):'');
    h+='<div class="pe-sess"><div style="flex:1;min-width:0;"><div class="pe-sname">'+esc(s.name)+'</div>'+
       '<div class="pe-sinfo'+(sched&&!uses?' warn':'')+'">'+info+'</div></div>'+
       '<button class="edit-btn" onclick="openSessionEditor(\''+p.id+'\',\''+s.sid+'\')">EXERCISES</button>'+
       '<button class="pe-x" onclick="peDeleteSession(\''+s.sid+'\')">&#10005;</button></div>';
  }
  h+='<div class="pe-add"><input class="fi" id="pe-new" placeholder="'+(sched?'New workout name, e.g. Lower A':'New day name')+'"/>'+
     '<button class="mini-btn" onclick="peAddSession()">ADD</button></div>';
  var active=(p.id===S.activeProgramId);
  h+='<button class="mb" style="margin-top:14px;" onclick="peUse()">'+(active?'DONE':'USE THIS PROGRAM')+'</button>';
  h+='<button class="mb-red" onclick="peDelete()">DELETE PROGRAM</button>';
  c.innerHTML=h;
}
function peSetName(v){var p=peProg();v=(v||'').trim();if(!p||!v)return;p.name=v;p.tag=v.toUpperCase().slice(0,12);saveState();}
function peSetWeeks(v){var p=peProg();if(!p)return;setCustomWeeks(p,v);renderProgramEditor();}
function peSetOrder(i,sid){var p=peProg();if(!p)return;setOrderSlot(p,i,sid);renderProgramEditor();}
function peMove(i,dir){var p=peProg();if(!p)return;moveOrderSlot(p,i,dir);renderProgramEditor();}
function peRemoveOrder(i){var p=peProg();if(!p)return;removeOrderSlot(p,i);renderProgramEditor();}
function peAddOrder(){var p=peProg();if(!p||!p.sessions.length)return;addOrderSlot(p,p.sessions[0].sid);renderProgramEditor();}
function peAddSession(){
  var p=peProg(),inp=el('pe-new');if(!p)return;
  var name=(inp.value||'').trim();if(!name){showToast('NAME REQUIRED');return;}
  addCustomSession(p,name);renderProgramEditor();
}
function peDeleteSession(sid){
  var p=peProg();if(!p)return;
  var s=getCustomSession(p,sid);if(!s)return;
  // Two taps: the first arms, the second deletes. No native confirm dialog —
  // those block the whole app on iOS PWAs.
  if(peArmed!==sid){peArmed=sid;showToast('TAP ✕ AGAIN TO DELETE '+s.name.toUpperCase());setTimeout(function(){if(peArmed===sid)peArmed=null;},3000);return;}
  peArmed=null;deleteCustomSession(p,sid);renderProgramEditor();showToast('DELETED');
}
var peArmed=null;
function peUse(){
  var p=peProg();if(!p)return;
  // A live session is never interrupted by switching programs.
  if(p.id!==S.activeProgramId)setActiveProgram(p.id);
  closeModal('prog-edit-mo');renderSel();renderHome();
  showToast(p.name.toUpperCase()+' ACTIVE');
}
function peDelete(){
  var p=peProg();if(!p)return;
  if(peArmed!=='__prog'){peArmed='__prog';showToast('TAP DELETE AGAIN TO REMOVE '+p.name.toUpperCase());setTimeout(function(){if(peArmed==='__prog')peArmed=null;},3000);return;}
  peArmed=null;
  if(hasLiveSession()&&S.activeDay&&S.activeDay.pid===p.id){showToast('FINISH THE CURRENT SESSION FIRST');return;}
  deleteProgram(p.id);closeModal('prog-edit-mo');renderSel();renderHome();showToast('PROGRAM DELETED');
}

// A built-in can't be edited in place; EDIT offers the same make-it-yours copy
// that editing one of its days does.
function editBuiltinProgram(){edPid=null;offerDuplicateToEdit('');}

// ── reps by phase ─────────────────────────────────────────────
// Change the rep range of a whole group of lifts, phase by phase, in one go.
// Groups are offered three ways: lifts already on the same track (the usual
// case — "every heavy lift"), everything in one workout, or everything.
var prPid=null, prChecked={}, prScope='';
function prProg(){return getProgram(prPid);}
function openPhaseReps(pid){
  prPid=pid;var p=prProg();if(!p)return;
  var g=prGroups(p);
  prScope=g.length?g[0].id:'';
  prSelectScope(prScope,true);
  closeModal('prog-edit-mo');
  el('pr-mo').classList.add('visible');
}
function closePhaseReps(){
  closeModal('pr-mo');
  if(prPid)openProgramEditor(prPid);
}
var PR_BLK={power:'Power',heavy:'Heavy',pump:'Pump',core:'Core'};
function prRangeTxt(r){return r.min===r.max?String(r.min):r.min+'-'+r.max;}
function prTrackTxt(ex,phases){
  var a=exPhaseRow(ex,1,phases),b=exPhaseRow(ex,phases,phases);
  return prRangeTxt(a)===prRangeTxt(b)?prRangeTxt(a)+' every phase':prRangeTxt(a)+' \u2192 '+prRangeTxt(b);
}
function prGroups(p){
  var phases=p.weeks||1,ts=phaseRepTargets(p),out=[],bySig={},sigs=[];
  for(var i=0;i<ts.length;i++){
    var sig=repSignature(ts[i].ex,phases);
    if(!bySig[sig]){bySig[sig]=[];sigs.push(sig);}
    bySig[sig].push(ts[i]);
  }
  sigs.sort(function(a,b){return bySig[b].length-bySig[a].length;});
  for(var k=0;k<sigs.length;k++){
    var items=bySig[sigs[k]],blk=items[0].ex.blk||'',type=items[0].ex.type||'',sameB=true,sameT=true,names={},uniq=0;
    for(var j=0;j<items.length;j++){
      if((items[j].ex.blk||'')!==blk)sameB=false;
      if((items[j].ex.type||'')!==type)sameT=false;
      if(!names[items[j].ex.name]){names[items[j].ex.name]=1;uniq++;}
    }
    var nm=(sameB&&PR_BLK[blk])?PR_BLK[blk]+' lifts':(sameT&&type?type+' lifts':'Lifts');
    out.push({id:'sig:'+k,kind:'track',label:nm+' \u00b7 '+prTrackTxt(items[0].ex,phases)+' ('+items.length+')',
              keys:items.map(function(t){return t.key;})});
  }
  var seen={};
  for(var o=0;o<(p.order||[]).length;o++){
    var sid=p.order[o];if(seen[sid])continue;seen[sid]=1;
    var ss=getCustomSession(p,sid);if(!ss)continue;
    var ks=[];for(var x=0;x<ts.length;x++)if(ts[x].sid===sid)ks.push(ts[x].key);
    if(ks.length)out.push({id:'wk:'+sid,kind:'workout',label:ss.name+' ('+ks.length+')',keys:ks});
  }
  var lifts=[],all=[];
  for(var y=0;y<ts.length;y++){all.push(ts[y].key);if(ts[y].ex.type!=='Core')lifts.push(ts[y].key);}
  if(lifts.length&&lifts.length<all.length)out.push({id:'all:lifts',kind:'all',label:'Every lift, not core work ('+lifts.length+')',keys:lifts});
  out.push({id:'all:all',kind:'all',label:'Every exercise ('+all.length+')',keys:all});
  return out;
}
function prSelectScope(id,prefill){
  var p=prProg();if(!p)return;
  var g=prGroups(p),grp=null;
  for(var i=0;i<g.length;i++)if(g[i].id===id)grp=g[i];
  if(!grp)grp=g[0];
  prScope=grp?grp.id:'';prChecked={};
  if(grp)for(var k=0;k<grp.keys.length;k++)prChecked[grp.keys[k]]=1;
  renderPhaseReps(prefill!==false);
}
function prCheckedTargets(p){
  var ts=phaseRepTargets(p),out=[];
  for(var i=0;i<ts.length;i++)if(prChecked[ts[i].key])out.push(ts[i]);
  return out;
}
function renderPhaseReps(prefill){
  var p=prProg(),c=el('pr-body');if(!p||!c)return;
  var phases=p.weeks||1,g=prGroups(p),ts=phaseRepTargets(p),sel=prCheckedTargets(p);
  // keep whatever was typed unless the scope changed
  var typed=prefill?null:prReadRows(phases);
  var h='<div class="fl">Apply to</div><select class="fi" onchange="prSelectScope(this.value)">';
  var groups=[['track','Lifts on the same progression'],['workout','One workout'],['all','Everything']];
  for(var q=0;q<groups.length;q++){
    var opts='';
    for(var i=0;i<g.length;i++)if(g[i].kind===groups[q][0])
      opts+='<option value="'+g[i].id+'"'+(g[i].id===prScope?' selected':'')+'>'+esc(g[i].label)+'</option>';
    if(opts)h+='<optgroup label="'+groups[q][1]+'">'+opts+'</optgroup>';
  }
  h+='</select>';
  // the exact list, adjustable
  h+='<details class="pr-list"><summary>'+sel.length+' exercise'+(sel.length===1?'':'s')+' selected \u2014 tap to adjust</summary>';
  var lastSid=null;
  for(var t=0;t<ts.length;t++){
    var it=ts[t];
    if(it.sid!==lastSid){h+='<div class="pr-sess">'+esc(it.sess.name)+'</div>';lastSid=it.sid;}
    h+='<label class="pr-item"><input type="checkbox"'+(prChecked[it.key]?' checked':'')+
       ' onchange="prToggle(\''+it.key+'\',this.checked)"/><span class="pr-nm">'+esc(it.ex.name)+'</span>'+
       '<span class="pr-cur">'+esc(prTrackTxt(it.ex,phases))+'</span></label>';
  }
  h+='</details>';
  // one row per phase
  h+='<div class="pr-grid"><div class="pr-hd"></div><div class="pr-hd">SETS</div><div class="pr-hd">MIN</div><div class="pr-hd">MAX</div>';
  for(var ph=1;ph<=phases;ph++){
    var v;
    if(typed)v=typed[ph-1];
    else{
      v={sets:'',min:'',max:''};
      if(sel.length){
        var r0=exPhaseRow(sel[0].ex,ph,phases),same=true;
        for(var s=1;s<sel.length;s++)if(exPhaseRow(sel[s].ex,ph,phases).sets!==r0.sets){same=false;break;}
        v={sets:same?r0.sets:'',min:r0.min,max:r0.max};
      }
    }
    h+='<div class="pr-ph">PHASE '+ph+'</div>'+
       '<input class="fi" id="pr-s-'+ph+'" type="number" inputmode="numeric" placeholder="keep" value="'+v.sets+'"/>'+
       '<input class="fi" id="pr-a-'+ph+'" type="number" inputmode="numeric" value="'+v.min+'"/>'+
       '<input class="fi" id="pr-b-'+ph+'" type="number" inputmode="numeric" value="'+v.max+'"/>';
  }
  h+='</div>';
  if(phases>2)h+='<button class="pe-link" onclick="prFillEven()">Fill phases 2\u2013'+(phases-1)+' evenly from phase 1 and phase '+phases+'</button>';
  h+='<div class="pe-help">Blank sets keep each exercise\u2019s own sets. Timed holds like planks aren\u2019t listed \u2014 their numbers are seconds.</div>';
  h+='<button class="mb" style="margin-top:12px;"'+(sel.length?'':' disabled')+' onclick="prApply()">APPLY TO '+sel.length+' EXERCISE'+(sel.length===1?'':'S')+'</button>';
  c.innerHTML=h;
}
function prReadRows(phases){
  var rows=[];
  for(var ph=1;ph<=phases;ph++){
    var s=el('pr-s-'+ph),a=el('pr-a-'+ph),b=el('pr-b-'+ph);
    rows.push({sets:s?s.value:'',min:a?a.value:'',max:b?b.value:''});
  }
  return rows;
}
function prToggle(key,on){
  if(on)prChecked[key]=1;else delete prChecked[key];
  var d=document.querySelector('#pr-body details');var open=d&&d.open;
  renderPhaseReps(false);
  if(open){d=document.querySelector('#pr-body details');if(d)d.open=true;}
}
function prFillEven(){
  var p=prProg();if(!p)return;var n=p.weeks||1;if(n<3)return;
  var lerp=function(id){
    var a=parseFloat(el(id+1).value),b=parseFloat(el(id+n).value);
    if(!isFinite(a)||!isFinite(b))return;
    for(var ph=2;ph<n;ph++)el(id+ph).value=Math.round(a+(b-a)*(ph-1)/(n-1));
  };
  lerp('pr-a-');lerp('pr-b-');lerp('pr-s-');
}
function prApply(){
  var p=prProg();if(!p)return;var phases=p.weeks||1,rows=prReadRows(phases);
  for(var i=0;i<rows.length;i++){
    if(!(parseInt(rows[i].min,10)>0)){showToast('PHASE '+(i+1)+' NEEDS REPS');return;}
    if(!(parseInt(rows[i].max,10)>0))rows[i].max=rows[i].min;
  }
  var keys=[];for(var k in prChecked)keys.push(k);
  var n=applyPhaseReps(p,keys,rows);
  closeModal('pr-mo');openProgramEditor(p.id);renderSel();renderHome();
  showToast('UPDATED '+n+' EXERCISE'+(n===1?'':'S'));
}

function chooseProgram(pid){
  if(pid===S.activeProgramId){closeModal('prog-mo');return;}
  var p=getProgram(pid);
  if(!p)return;
  setActiveProgram(pid);
  closeModal('prog-mo');
  renderSel();renderHome();
  showToast(p.name.toUpperCase()+' ACTIVE');
}
