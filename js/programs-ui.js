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
    var n=currentCycleDay(p),d=p.days[n-1];
    var done=0,st=progState(p.id);
    for(var k in (st.completed||{}))done++;
    left='<div><div style="font-family:\'Share Tech Mono\',monospace;font-size:7px;'+
         'letter-spacing:.12em;color:var(--s2);text-transform:uppercase;">'+esc(p.name)+
         ' &middot; week '+d.week+' of '+p.weeks+'</div>'+
         '<div style="font-family:\'Orbitron\',sans-serif;font-size:11px;color:var(--am);margin-top:2px;">'+
         'DAY '+n+' — '+esc(d.rest?'REST':d.name.toUpperCase())+'</div>'+
         '<div style="font-family:\'Rajdhani\',sans-serif;font-size:9px;color:var(--s2);margin-top:1px;">'+
         done+' of '+p.days.filter(function(x){return !x.rest;}).length+' sessions logged</div></div>';
    right='<div style="display:flex;gap:5px;">'+
          (p.custom?'<button class="mini-btn" onclick="openProgramEditor(\''+p.id+'\')">EDIT</button>':'')+
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
      ? (p.weeks+' weeks &middot; '+(p.perWeek||0)+'x/week &middot; '+tr+' sessions')
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
    ? 'A fixed weekly pattern that repeats for a set number of weeks, with reps that can progress week to week. Like Shred Athletic.'
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
    h+='<div class="fl">Length (weeks)</div><input class="fi" id="pe-weeks" type="number" inputmode="numeric" min="1" max="52" value="'+p.weeks+'" onchange="peSetWeeks(this.value)"/>';
    h+='<div class="pe-sec">WEEKLY PATTERN</div><div class="pe-help">What happens on each day of the week. The pattern repeats every week.</div>';
    for(var d=0;d<p.cycle.length;d++){
      var cur=p.cycle[d];
      var opts='<option value="">Rest</option>';
      for(var k=0;k<p.sessions.length;k++){
        var ss=p.sessions[k];
        opts+='<option value="'+ss.sid+'"'+(cur===ss.sid?' selected':'')+'>'+esc(ss.name)+'</option>';
      }
      h+='<div class="pe-day"><div class="pe-dlbl">DAY '+(d+1)+'</div><select class="fi pe-sel" onchange="peSetCycle('+d+',this.value)">'+opts+'</select></div>';
    }
  }
  h+='<div class="pe-sec">'+(sched?'SESSIONS':'DAYS')+'</div>';
  if(!p.sessions.length){
    h+='<div class="pe-help">'+(sched?'No sessions yet. Add one, fill it with exercises, then place it in the weekly pattern.':'No days yet. Add one and fill it with exercises.')+'</div>';
  }
  for(var i=0;i<p.sessions.length;i++){
    var s=p.sessions[i],uses=0;
    if(sched)for(var q=0;q<p.cycle.length;q++)if(p.cycle[q]===s.sid)uses++;
    var info=s.ex.length+' ex'+(sched?(uses?' · '+uses+'x/week':' · not scheduled'):'');
    h+='<div class="pe-sess"><div style="flex:1;min-width:0;"><div class="pe-sname">'+esc(s.name)+'</div>'+
       '<div class="pe-sinfo'+(sched&&!uses?' warn':'')+'">'+info+'</div></div>'+
       '<button class="edit-btn" onclick="openSessionEditor(\''+p.id+'\',\''+s.sid+'\')">EXERCISES</button>'+
       '<button class="pe-x" onclick="peDeleteSession(\''+s.sid+'\')">&#10005;</button></div>';
  }
  h+='<div class="pe-add"><input class="fi" id="pe-new" placeholder="'+(sched?'New session name, e.g. Lower A':'New day name')+'"/>'+
     '<button class="mini-btn" onclick="peAddSession()">ADD</button></div>';
  var active=(p.id===S.activeProgramId);
  h+='<button class="mb" style="margin-top:14px;" onclick="peUse()">'+(active?'DONE':'USE THIS PROGRAM')+'</button>';
  h+='<button class="mb-red" onclick="peDelete()">DELETE PROGRAM</button>';
  c.innerHTML=h;
}
function peSetName(v){var p=peProg();v=(v||'').trim();if(!p||!v)return;p.name=v;p.tag=v.toUpperCase().slice(0,12);saveState();}
function peSetWeeks(v){var p=peProg();if(!p)return;setCustomWeeks(p,v);renderProgramEditor();}
function peSetCycle(d,sid){var p=peProg();if(!p)return;setCycleSlot(p,d,sid||null);renderProgramEditor();}
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

function chooseProgram(pid){
  if(pid===S.activeProgramId){closeModal('prog-mo');return;}
  var p=getProgram(pid);
  if(!p)return;
  setActiveProgram(pid);
  closeModal('prog-mo');
  renderSel();renderHome();
  showToast(p.name.toUpperCase()+' ACTIVE');
}
