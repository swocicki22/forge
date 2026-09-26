// ════════════════════════════════
// CUSTOM PROGRAMS
//
// A custom program stores SESSION TEMPLATES, not 42 finished days. The days
// are regenerated from the templates whenever anything changes.
//
// This matters: a built-in like Shred Athletic materializes every day up
// front, which is fine because nobody edits it. If a custom program worked
// that way, changing one exercise would mean changing it in 24 separate
// copies of the same session. Templates make an edit land in one place.
//
// Shape:
//   sessions  [{sid, name, tag, mins, cardio, ex:[...]}]
//   cycle     7 entries, each a sid or null for a rest day
//   weeks     how many times the cycle repeats
//   days      DERIVED — never edited directly, always rebuilt
//
// Each exercise carries its own progression as two rep ranges:
//   reps     [min,max] in week 1
//   repsEnd  [min,max] in the final week (omit for flat)
// Everything between is interpolated, which expresses linear (reps falling),
// reverse linear (reps climbing) and flat without needing named tracks.
// ════════════════════════════════

function newSid(){return 's'+Date.now().toString(36)+Math.floor(Math.random()*1000).toString(36);}
function newPid(){return 'p_c'+Date.now().toString(36);}

// Interpolate a rep range across the block. Week 1 gives the start range, the
// final week gives the end range, and the weeks between are spread evenly.
function interpReps(ex,week,weeks){
  var a=ex.reps||[10,10];
  var b=ex.repsEnd||a;
  if(weeks<=1)return {min:a[0],max:a[1]};
  var t=(week-1)/(weeks-1);
  return {
    min:Math.max(1,Math.round(a[0]+(b[0]-a[0])*t)),
    max:Math.max(1,Math.round(a[1]+(b[1]-a[1])*t))
  };
}
// Sets can taper too, the same way.
function interpSets(ex,week,weeks){
  var a=ex.sets||3, b=(ex.setsEnd!=null?ex.setsEnd:a);
  if(weeks<=1)return a;
  var t=(week-1)/(weeks-1);
  return Math.max(1,Math.round(a+(b-a)*t));
}

// Rebuild every day from the templates. Called after any edit.
function regenerateCustomDays(p){
  if(!p||!p.custom)return;
  try{_regen(p);}
  finally{
    // Regeneration builds a new array. S.days is a live reference to the
    // active program's days, so it has to follow or it goes stale.
    if(typeof S!=='undefined'&&S.activeProgramId===p.id)S.days=p.days;
  }
}
function _regen(p){
  var byId={},i;
  for(i=0;i<p.sessions.length;i++)byId[p.sessions[i].sid]=p.sessions[i];

  if(p.mode==='free'){
    // A free program is just its sessions, one day each, no schedule.
    p.days=[];
    for(i=0;i<p.sessions.length;i++){
      var s=p.sessions[i];
      p.days.push({
        id:'cd_'+s.sid,lbl:(i+1<10?'0':'')+(i+1),name:s.name,tag:s.tag||s.name.toUpperCase(),
        rest:!!s.rest,cardio:s.cardio||null,mins:s.mins||null,sid:s.sid,
        ex:buildCustomSlots(s,1,1)
      });
    }
    return;
  }

  var cyc=p.cycle&&p.cycle.length?p.cycle:[null];
  var total=(p.weeks||1)*cyc.length;
  var days=[];
  for(var d=0;d<total;d++){
    var week=Math.floor(d/cyc.length)+1;
    var sid=cyc[d%cyc.length];
    var n=d+1, lbl=n<10?'0'+n:''+n;
    if(!sid||!byId[sid]){
      days.push({id:'cd'+n,lbl:lbl,day:n,week:week,sid:null,name:'Rest Day',
                 tag:'REST',rest:true,cardio:null,ex:[]});
      continue;
    }
    var sess=byId[sid];
    days.push({id:'cd'+n,lbl:lbl,day:n,week:week,sid:sid,name:sess.name,
               tag:sess.tag||sess.name.toUpperCase(),rest:false,
               mins:sess.mins||null,cardio:sess.cardio||null,
               ex:buildCustomSlots(sess,week,p.weeks||1)});
  }
  p.days=days;
}

function buildCustomSlots(sess,week,weeks){
  var out=[];
  for(var j=0;j<(sess.ex||[]).length;j++){
    var e=sess.ex[j];
    var r=interpReps(e,week,weeks), sets=interpSets(e,week,weeks);
    // An explicit week-by-week table wins over interpolation. Duplicating a
    // program with a non-linear wave (a deload week, a stepped track) stores
    // one, so the copy is identical to the original rather than smoothed.
    var pw=e.perWeek&&e.perWeek[week-1];
    if(pw){r={min:pw.min,max:pw.max};sets=pw.sets;}
    var slot={name:e.name,type:e.type||'Custom',impl:e.impl||'other',
              ds:sets,dw:e.dw||0,ss:e.ss||'',
              notes:e.notes||'',repMin:r.min,repMax:r.max,
              blk:e.blk||null};
    if(e.loaded)slot.loaded=true;
    if(e.timed){slot.timed=true;slot.secs=e.secs;slot.repMin=e.secs;slot.repMax=e.secs;}
    if(e.ca)slot.ca=true;
    if(e.alt){slot.alt=e.alt;slot.altImpl=e.altImpl;}
    slot.dr=slot.repMin;
    out.push(slot);
  }
  return out;
}

// ── creating ──────────────────────────────────────────────────
function createCustomProgram(opts){
  opts=opts||{};
  var scheduled=(opts.mode==='scheduled');
  var p={
    id:newPid(),
    name:opts.name||'My Program',
    tag:(opts.tag||opts.name||'CUSTOM').toUpperCase().slice(0,12),
    builtin:false,custom:true,level:'Custom',
    desc:opts.desc||'',
    mode:scheduled?'scheduled':'free',
    peri:'slot',
    weeks:scheduled?(opts.weeks||6):1,
    cycleLen:scheduled?7:0,
    perWeek:0,
    cycle:scheduled?[null,null,null,null,null,null,null]:null,
    sessions:[],days:[]
  };
  regenerateCustomDays(p);
  S.programs.push(p);
  saveState();
  return p;
}

// ── duplicating ───────────────────────────────────────────────
// Turns any program, including a materialized built-in, into an editable
// template. For a scheduled program the progression is recovered by reading
// week 1 and the final week and treating them as the start and end ranges —
// which is exactly how the templates express progression anyway.
function duplicateProgram(pid,newName,copyProgress){
  var src=getProgram(pid);
  if(!src)return null;
  var scheduled=(src.mode==='scheduled');
  var weeks=src.weeks||1;
  var p={
    id:newPid(),
    name:newName||(src.name+' (copy)'),
    tag:(src.tag||'CUSTOM')+'*',
    builtin:false,custom:true,level:'Custom',
    desc:src.desc||'',notes:src.notes||'',
    mode:src.mode,peri:'slot',
    weeks:weeks,cycleLen:scheduled?(src.cycleLen||7):0,
    perWeek:src.perWeek||0,
    cycle:null,sessions:[],days:[]
  };

  if(!scheduled){
    // Free program: each day becomes a session verbatim.
    for(var i=0;i<src.days.length;i++){
      var d=src.days[i];
      p.sessions.push({sid:newSid(),name:d.name,tag:d.tag,rest:!!d.rest,
                       mins:d.mins||null,cardio:d.cardio||null,
                       ex:slotsToTemplate(d.ex,d.ex)});
    }
    regenerateCustomDays(p);
    S.programs.push(p);saveState();
    return p;
  }

  // Scheduled: walk the first cycle to learn the weekly pattern, then pair
  // each session's week-1 day with its final-week day to recover progression.
  var cycLen=src.cycleLen||7;
  var cycle=[],sidMap={};
  for(var c=0;c<cycLen;c++){
    var day=src.days[c];
    if(!day||day.rest||!day.sid){cycle.push(null);continue;}
    if(!sidMap[day.sid]){
      var last=findDayForSession(src,day.sid,weeks);
      var sid=newSid();
      sidMap[day.sid]=sid;
      var tplEx=slotsToTemplate(day.ex,last?last.ex:day.ex);
      attachPerWeek(tplEx,src,day.sid,weeks);
      p.sessions.push({sid:sid,name:day.name,tag:day.tag,rest:false,
                       mins:day.mins||null,cardio:day.cardio||null,
                       ex:tplEx});
    }
    cycle.push(sidMap[day.sid]);
  }
  p.cycle=cycle;
  regenerateCustomDays(p);
  S.programs.push(p);
  if(copyProgress)copyProgramProgress(src,p);
  saveState();
  return p;
}

// Carry the place in the block across. Day ids differ between the source and
// the copy, but the copy has the same number of days in the same order, so
// completions map across by position.
function copyProgramProgress(src,dst){
  var a=progState(src.id),b=progState(dst.id);
  b.startedAt=a.startedAt;b.cursor=a.cursor||1;b.completed={};
  for(var i=0;i<src.days.length&&i<dst.days.length;i++){
    var t=a.completed&&a.completed[src.days[i].id];
    if(t)b.completed[dst.days[i].id]=t;
  }
}

// For each exercise, check whether start/end interpolation reproduces every
// week of the source exactly. Where it doesn't, record the real table.
function attachPerWeek(tplEx,src,srcSid,weeks){
  for(var i=0;i<tplEx.length;i++){
    var t=tplEx[i],table=[],exact=true;
    if(t.timed)continue;
    for(var w=1;w<=weeks;w++){
      var d=findDayForSession(src,srcSid,w);
      var e=d&&d.ex[i]&&d.ex[i].name===t.name?d.ex[i]:null;
      if(!e){table=null;break;}
      var row={sets:e.ds,min:e.repMin,max:e.repMax};
      table.push(row);
      var r=interpReps(t,w,weeks),st=interpSets(t,w,weeks);
      if(r.min!==row.min||r.max!==row.max||st!==row.sets)exact=false;
    }
    if(table&&!exact)t.perWeek=table;
  }
}
function findDayForSession(p,sid,week){
  for(var i=0;i<p.days.length;i++){
    if(p.days[i].sid===sid&&p.days[i].week===week)return p.days[i];
  }
  return null;
}

// Pair a week-1 slot with its final-week counterpart to get start/end ranges.
function slotsToTemplate(firstEx,lastEx){
  var out=[];
  for(var i=0;i<(firstEx||[]).length;i++){
    var a=firstEx[i];
    var b=(lastEx&&lastEx[i]&&lastEx[i].name===a.name)?lastEx[i]:a;
    var t={name:a.name,type:a.type||'Custom',impl:a.impl||'other',
           dw:a.dw||0,ss:a.ss||'',notes:a.notes||'',
           blk:a.blk||null,
           sets:a.ds||3,
           reps:[a.repMin!=null?a.repMin:(a.dr||10),
                 a.repMax!=null?a.repMax:(a.dr||10)]};
    if(b.ds!=null&&b.ds!==a.ds)t.setsEnd=b.ds;
    if(b.repMin!=null&&(b.repMin!==a.repMin||b.repMax!==a.repMax))
      t.repsEnd=[b.repMin,b.repMax];
    if(a.loaded)t.loaded=true;
    if(a.timed){t.timed=true;t.secs=a.secs;}
    if(a.ca)t.ca=true;
    if(a.alt){t.alt=a.alt;t.altImpl=a.altImpl;}
    out.push(t);
  }
  return out;
}

// ── editing ───────────────────────────────────────────────────
function addCustomSession(p,name){
  if(!p||!p.custom)return null;
  var s={sid:newSid(),name:name||'New Day',tag:(name||'NEW DAY').toUpperCase(),
         rest:false,mins:null,cardio:null,ex:[]};
  p.sessions.push(s);
  regenerateCustomDays(p);
  saveState();
  return s;
}
function getCustomSession(p,sid){
  if(!p||!p.sessions)return null;
  for(var i=0;i<p.sessions.length;i++){if(p.sessions[i].sid===sid)return p.sessions[i];}
  return null;
}
function deleteCustomSession(p,sid){
  if(!p||!p.custom)return;
  for(var i=0;i<p.sessions.length;i++){
    if(p.sessions[i].sid===sid){p.sessions.splice(i,1);break;}
  }
  if(p.cycle){
    for(var j=0;j<p.cycle.length;j++){if(p.cycle[j]===sid)p.cycle[j]=null;}
  }
  regenerateCustomDays(p);
  saveState();
}
function setCycleSlot(p,idx,sid){
  if(!p||!p.cycle||idx<0||idx>=p.cycle.length)return;
  p.cycle[idx]=sid||null;
  var n=0;
  for(var i=0;i<p.cycle.length;i++)if(p.cycle[i])n++;
  p.perWeek=n;
  regenerateCustomDays(p);
  saveState();
}
function setCustomWeeks(p,weeks){
  if(!p||!p.custom)return;
  p.weeks=Math.max(1,Math.min(52,parseInt(weeks,10)||1));
  regenerateCustomDays(p);
  saveState();
}
function deleteProgram(pid){
  var p=getProgram(pid);
  if(!p||p.builtin)return false;          // built-ins are not deletable
  var idx=S.programs.indexOf(p);
  if(idx<0)return false;
  S.programs.splice(idx,1);
  if(S.progState)delete S.progState[pid];
  if(S.activeProgramId===pid){
    S.activeProgramId=FORGE_PID;
    var ap=activeProgram();
    if(ap)S.days=ap.days;
  }
  saveState();
  return true;
}

if(typeof module!=='undefined'&&module.exports){
  module.exports={interpReps:interpReps,interpSets:interpSets};
}
