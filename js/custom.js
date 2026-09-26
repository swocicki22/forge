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
//   order     the workouts in one phase, in sequence (sids; no rest days)
//   weeks     how many PHASES — times the order repeats. The field keeps its
//             old name so stored programs and every reader stay compatible;
//             everything user-facing calls it a phase.
//   days      DERIVED — never edited directly, always rebuilt
//
// There is no calendar. Finishing a workout makes the next one in the
// sequence "up next"; rest happens whenever you rest.
//
// Each exercise carries its own progression as two rep ranges:
//   reps     [min,max] in phase 1
//   repsEnd  [min,max] in the final phase (omit for flat)
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

  migrateCycleToOrder(p);
  var order=(p.order||[]).filter(function(sid){return !!byId[sid];});
  // A phase can last several weeks: the week's workouts repeat `rounds`
  // times inside it, all at that phase's reps. Ids number workouts within the
  // phase straight through, so with one week per phase they are unchanged.
  var phases=p.weeks||1, R=Math.max(1,p.rounds||1), days=[], n=0;
  for(var ph=1;ph<=phases;ph++){
    for(var r=1;r<=R;r++){
      for(var k=0;k<order.length;k++){
        var sess=byId[order[k]];n++;
        var pos=(r-1)*order.length+k+1;
        days.push({id:'cp'+ph+'_'+pos,lbl:(n<10?'0':'')+n,day:n,week:ph,phase:ph,idx:pos,
                   wk:r,wks:R,wkIdx:k+1,
                   sid:sess.sid,name:sess.name,tag:sess.tag||sess.name.toUpperCase(),rest:false,
                   optional:!!sess.optional,mins:sess.mins||null,cardio:sess.cardio||null,
                   ex:buildCustomSlots(sess,ph,phases,r)});
      }
    }
  }
  p.days=days;
}

// Programs built before phases stored a 7-slot weekly cycle with nulls for
// rest days. Convert it to an order, and carry completed workouts across:
// old day ids were calendar positions ('cd'+n), new ones are 'cp'+phase+'_'+k.
function migrateCycleToOrder(p){
  if(p.order||!p.cycle)return;
  var cyc=p.cycle, order=cyc.filter(function(x){return !!x;});
  var st=(typeof S!=='undefined'&&S.progState&&S.progState[p.id])||null;
  if(st&&st.completed){
    var moved={}, n=0;
    for(var w=1;w<=(p.weeks||1);w++){
      var k=0;
      for(var c=0;c<cyc.length;c++){
        n++;
        if(!cyc[c])continue;
        k++;
        var t=st.completed['cd'+n];
        if(t)moved['cp'+w+'_'+k]=t;
      }
    }
    st.completed=moved;delete st.cursor;
  }
  p.order=order;
  p.perWeek=order.length;
  delete p.cycle;delete p.cycleLen;
}

function buildCustomSlots(sess,week,weeks,wk){
  var out=[];
  for(var j=0;j<(sess.ex||[]).length;j++){
    var e=sess.ex[j];
    var r=interpReps(e,week,weeks), sets=interpSets(e,week,weeks);
    // An explicit week-by-week table wins over interpolation. Duplicating a
    // program with a non-linear wave (a deload week, a stepped track) stores
    // one, so the copy is identical to the original rather than smoothed.
    var pw=e.perWeek&&e.perWeek[week-1];
    if(pw){r={min:pw.min,max:pw.max};sets=pw.sets;}
    // A weekly wave (reps change week to week inside each phase, and every
    // phase runs the same wave) wins over everything above.
    var wv=wk&&e.wave&&e.wave[wk-1];
    if(wv){r={min:wv.min,max:wv.max};sets=wv.sets;}
    var slot={name:e.name,type:e.type||'Custom',impl:e.impl||'other',
              ds:sets,dw:e.dw||0,ss:e.ss||'',
              notes:e.notes||'',repMin:r.min,repMax:r.max,
              blk:e.blk||null};
    if(e.loaded)slot.loaded=true;
    if(e.timed){slot.timed=true;slot.secs=e.secs;slot.repMin=e.secs;slot.repMax=e.secs;}
    if(e.ca)slot.ca=true;
    if(e.cardio){slot.cardio=true;slot.loaded=false;}
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
    perWeek:0,
    order:scheduled?[]:null,
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
    weeks:weeks,perWeek:src.perWeek||0,rounds:src.rounds||1,
    order:null,sessions:[],days:[]
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

  // A custom program already stores templates: copy them exactly (weekly
  // waves, per-phase tables and all) rather than reverse-engineering days.
  if(src.custom&&src.sessions){
    var map={};
    for(var ci=0;ci<src.sessions.length;ci++){
      var cs=JSON.parse(JSON.stringify(src.sessions[ci]));
      var nsid=newSid()+ci;map[cs.sid]=nsid;cs.sid=nsid;p.sessions.push(cs);
    }
    p.order=(src.order||[]).map(function(x){return map[x];}).filter(function(x){return !!x;});
    p.perWeek=p.order.length;
    regenerateCustomDays(p);
    S.programs.push(p);
    if(copyProgress)copyProgramProgress(src,p);
    saveState();
    return p;
  }
  // Scheduled: phase 1's workouts, in order, are the order. Pair each with
  // its final-phase counterpart to recover the progression.
  var order=[],sidMap={};
  for(var c=0;c<src.days.length;c++){
    var day=src.days[c];
    if((day.phase||day.week)!==1)continue;
    if(day.wk&&day.wk!==1)continue;          // later weeks of phase 1 repeat the first
    if(day.rest||!day.sid)continue;
    if(!sidMap[day.sid]){
      var last=findDayForSession(src,day.sid,weeks);
      var sid=newSid();
      sidMap[day.sid]=sid;
      var tplEx=slotsToTemplate(day.ex,last?last.ex:day.ex);
      attachPerWeek(tplEx,src,day.sid,weeks);
      p.sessions.push({sid:sid,name:day.name,tag:day.tag,rest:false,optional:!!day.optional,
                       mins:day.mins||null,cardio:day.cardio||null,
                       ex:tplEx});
    }
    order.push(sidMap[day.sid]);
  }
  p.order=order;p.perWeek=order.length;
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
  b.startedAt=a.startedAt;b.completed={};b.skipped={};
  for(var i=0;i<src.days.length&&i<dst.days.length;i++){
    var t=a.completed&&a.completed[src.days[i].id];
    if(t)b.completed[dst.days[i].id]=t;
    var sk=a.skipped&&a.skipped[src.days[i].id];
    if(sk)b.skipped[dst.days[i].id]=sk;
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
    if(p.days[i].sid===sid&&(p.days[i].phase||p.days[i].week)===week)return p.days[i];
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
    if(a.cardio)t.cardio=true;
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
  // In a phased program a new workout joins the sequence straight away.
  if(p.mode==='scheduled'){if(!p.order)p.order=[];p.order.push(s.sid);p.perWeek=p.order.length;}
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
  if(p.order)p.order=p.order.filter(function(x){return x!==sid;});
  regenerateCustomDays(p);
  saveState();
}
function orderChanged(p){p.perWeek=(p.order||[]).length;regenerateCustomDays(p);saveState();}
function setOrderSlot(p,idx,sid){
  if(!p||!p.order||idx<0||idx>=p.order.length||!sid)return;
  p.order[idx]=sid;orderChanged(p);
}
function addOrderSlot(p,sid){if(!p||!p.order||!sid)return;p.order.push(sid);orderChanged(p);}
function removeOrderSlot(p,idx){if(!p||!p.order||idx<0||idx>=p.order.length)return;p.order.splice(idx,1);orderChanged(p);}
function moveOrderSlot(p,idx,dir){
  if(!p||!p.order)return;var j=idx+dir;if(j<0||j>=p.order.length)return;
  var t=p.order[idx];p.order[idx]=p.order[j];p.order[j]=t;orderChanged(p);
}
function setCustomWeeks(p,weeks){
  if(!p||!p.custom)return;
  p.weeks=Math.max(1,Math.min(52,parseInt(weeks,10)||1));
  regenerateCustomDays(p);
  saveState();
}
function setCustomRounds(p,n){
  if(!p||!p.custom)return;
  p.rounds=Math.max(1,Math.min(12,parseInt(n,10)||1));
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

// ── reps by phase, in bulk ────────────────────────────────────
// What one exercise actually gets in a given phase: the explicit table if it
// has one, otherwise the start-to-end interpolation.
function exPhaseRow(ex,ph,phases){
  var pw=ex.perWeek&&ex.perWeek[ph-1];
  if(pw)return {sets:pw.sets,min:pw.min,max:pw.max};
  var r=interpReps(ex,ph,phases);
  return {sets:interpSets(ex,ph,phases),min:r.min,max:r.max};
}
// Every exercise a rep scheme can apply to. Timed holds are left out: their
// number is seconds, and a rep plan written for lifts would wreck them.
function phaseRepTargets(p){
  var out=[];if(!p||!p.sessions)return out;
  var used={};for(var o=0;o<(p.order||[]).length;o++)used[p.order[o]]=1;
  for(var s=0;s<p.sessions.length;s++){
    var ss=p.sessions[s];if(!used[ss.sid])continue;
    for(var i=0;i<ss.ex.length;i++){
      var e=ss.ex[i];if(e.timed||e.cardio)continue;
      out.push({key:ss.sid+':'+i,sid:ss.sid,i:i,ex:e,sess:ss});
    }
  }
  return out;
}
// The rep numbers across every phase, as one string. Exercises that share
// it are on the same track — change the track and they all move together.
function repSignature(ex,phases){
  var a=[];for(var ph=1;ph<=phases;ph++){var r=exPhaseRow(ex,ph,phases);a.push(r.min+'-'+r.max);}
  return a.join('|');
}
// When a phase spans several weeks, the rep table is one row per WEEK of the
// phase (the weekly wave). Otherwise it is one row per phase.
function repMode(p){return (p&&p.rounds>1)?'week':'phase';}
function repRowCount(p){return repMode(p)==='week'?p.rounds:(p.weeks||1);}
function exRepRow(p,ex,i){
  if(repMode(p)==='week'){
    var wv=ex.wave&&ex.wave[i-1];
    if(wv)return {sets:wv.sets,min:wv.min,max:wv.max};
    return exPhaseRow(ex,1,p.weeks||1);
  }
  return exPhaseRow(ex,i,p.weeks||1);
}
function repSig(p,ex){
  var n=repRowCount(p),a=[];
  for(var i=1;i<=n;i++){var r=exRepRow(p,ex,i);a.push(r.min+'-'+r.max);}
  return a.join('|');
}
// Write one per-phase plan onto a set of exercises. rows[k] = {min,max,sets}
// where sets may be null, meaning "leave this exercise's own sets alone".
function applyPhaseReps(p,keys,rows){
  if(!p||!p.custom)return 0;
  var phases=p.weeks||1,want={},n=0;
  for(var k=0;k<keys.length;k++)want[keys[k]]=1;
  var ts=phaseRepTargets(p);
  if(repMode(p)==='week'){
    for(var t2=0;t2<ts.length;t2++){
      if(!want[ts[t2].key])continue;
      var ex2=ts[t2].ex,wave=[];
      for(var w=1;w<=p.rounds;w++){
        var cur2=exRepRow(p,ex2,w),r2=rows[w-1]||rows[rows.length-1];
        var a2=Math.max(1,parseInt(r2.min,10)||cur2.min), b2=Math.max(1,parseInt(r2.max,10)||a2);
        if(b2<a2){var sw2=a2;a2=b2;b2=sw2;}
        var s2=(r2.sets!=null&&r2.sets!=='')?Math.max(1,parseInt(r2.sets,10)||cur2.sets):cur2.sets;
        wave.push({sets:s2,min:a2,max:b2});
      }
      // The wave replaces any phase-to-phase progression on this lift; the
      // start fields mirror week 1 so the exercise form reads correctly.
      ex2.wave=wave;ex2.sets=wave[0].sets;ex2.reps=[wave[0].min,wave[0].max];
      delete ex2.perWeek;delete ex2.repsEnd;delete ex2.setsEnd;
      n++;
    }
    regenerateCustomDays(p);saveState();
    return n;
  }
  for(var t=0;t<ts.length;t++){
    if(!want[ts[t].key])continue;
    var ex=ts[t].ex,table=[];
    for(var ph=1;ph<=phases;ph++){
      var cur=exPhaseRow(ex,ph,phases),r=rows[ph-1]||rows[rows.length-1];
      var mn=Math.max(1,parseInt(r.min,10)||cur.min), mx=Math.max(1,parseInt(r.max,10)||mn);
      if(mx<mn){var sw=mn;mn=mx;mx=sw;}
      var st=(r.sets!=null&&r.sets!=='')?Math.max(1,parseInt(r.sets,10)||cur.sets):cur.sets;
      table.push({sets:st,min:mn,max:mx});
    }
    // Start and end ranges are kept in step with the table so the exercise
    // form and the editor summary describe the same plan.
    var a=table[0],b=table[table.length-1];
    ex.sets=a.sets;ex.reps=[a.min,a.max];
    if(b.sets!==a.sets)ex.setsEnd=b.sets;else delete ex.setsEnd;
    if(b.min!==a.min||b.max!==a.max)ex.repsEnd=[b.min,b.max];else delete ex.repsEnd;
    // Only keep the table when an even progression can't reproduce it.
    var even=true;
    for(var q=1;q<=phases;q++){
      var ir=interpReps(ex,q,phases);
      if(ir.min!==table[q-1].min||ir.max!==table[q-1].max||interpSets(ex,q,phases)!==table[q-1].sets){even=false;break;}
    }
    if(even)delete ex.perWeek;else ex.perWeek=table;
    delete ex.wave;
    n++;
  }
  regenerateCustomDays(p);saveState();
  return n;
}

if(typeof module!=='undefined'&&module.exports){
  module.exports={interpReps:interpReps,interpSets:interpSets};
}
