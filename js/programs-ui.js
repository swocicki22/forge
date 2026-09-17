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
    right='<button class="mini-btn" onclick="openProgramPicker()">SWITCH</button>';
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
  var h='';
  for(var i=0;i<S.programs.length;i++){
    var p=S.programs[i];
    var on=(p.id===S.activeProgramId);
    var tr=0;
    for(var j=0;j<p.days.length;j++){if(!p.days[j].rest)tr++;}
    var meta=(p.mode==='scheduled')
      ? (p.weeks+' weeks &middot; '+p.perWeek+'x/week &middot; '+tr+' sessions')
      : (tr+' days &middot; pick any, any time');
    h+='<div onclick="chooseProgram(\''+p.id+'\')" style="cursor:pointer;background:'+
       (on?'var(--hld)':'var(--card2)')+';border:1px solid '+(on?'var(--hl)':'var(--border)')+
       ';border-radius:2px;padding:11px;margin-bottom:8px;">'+
       '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">'+
       '<div style="font-family:\'Orbitron\',sans-serif;font-size:12px;color:'+
       (on?'var(--hl)':'var(--st)')+';">'+esc(p.name.toUpperCase())+'</div>'+
       (on?'<div style="font-family:\'Share Tech Mono\',monospace;font-size:7px;letter-spacing:.1em;color:var(--hl);">ACTIVE</div>'
          :'<div style="font-family:\'Share Tech Mono\',monospace;font-size:7px;letter-spacing:.1em;color:var(--s3);">'+esc(p.level||'')+'</div>')+
       '</div>'+
       '<div style="font-family:\'Share Tech Mono\',monospace;font-size:7px;letter-spacing:.1em;color:var(--s2);margin-top:3px;text-transform:uppercase;">'+meta+'</div>'+
       '<div style="font-family:\'Rajdhani\',sans-serif;font-size:11px;color:var(--t2);margin-top:6px;line-height:1.4;">'+esc(p.desc||'')+'</div>'+
       (p.notes?'<div style="font-family:\'Rajdhani\',sans-serif;font-size:10px;color:var(--s2);margin-top:6px;line-height:1.4;border-top:1px solid var(--border);padding-top:6px;">'+esc(p.notes)+'</div>':'')+
       '</div>';
  }
  c.innerHTML=h;
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
