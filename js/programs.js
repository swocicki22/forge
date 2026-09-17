// ════════════════════════════════
// PRESETS
// ════════════════════════════════
var AB_PRESET=[
  {name:'Cable Crunch',type:'Core',loaded:true,ds:3,dr:15,dw:50,ss:'',notes:'Kneel at cable. Pull elbows to knees with the stack — log the pin weight. Round spine fully, 3 sec negative. Add weight as 15 reps gets easy.'},
  {name:'Hanging Leg Raise',type:'Core',ds:3,dr:15,dw:0,ss:'',notes:'Dead hang. Raise legs to 90 degrees or higher. Posterior pelvic tilt at top. No swinging.'},
  {name:'Decline Sit-Up',type:'Core',loaded:true,ds:3,dr:15,dw:25,ss:'',notes:'Hold plate on chest — log the plate weight. Full ROM. Control descent, 3 sec negative.'},
  {name:'Russian Twist',type:'Core',loaded:true,ds:3,dr:20,dw:25,ss:'',notes:'20 total reps. Hold plate or dumbbell — log the weight. Lean back 45 degrees, lead with the ribs, rotate fully side to side.'},
  {name:'Plank',type:'Core',ds:3,dr:45,dw:0,ss:'',notes:'45 sec hold. Squeeze glutes and core. Neutral spine. Build to 60+ sec over time.'},
  {name:'Side Plank',type:'Core',ds:2,dr:30,dw:0,ss:'',notes:'30 sec each side. Hips up. Straight line head to feet. Progress to weighted hip dips.'}
];

function buildPresets(){
  return [
    {id:'d1',lbl:'01',name:'Upper Power',tag:'UPPER POWER',rest:false,cardio:'15 min Stairmaster — 2 min moderate (lvl 7) / 1 min hard (lvl 12) x5 — Red Light Therapy: 10-15 min full body post-workout',ex:[
      {name:'Barbell Bench Press',type:'Power',ds:5,dr:5,dw:155,ss:'A1',notes:'Explosive concentric. Slow 3 sec descent. Grip slightly wider than shoulder width.'},
      {name:'Bent-Over Dumbbell Row',type:'Power',ds:5,dr:5,dw:70,ss:'A2',notes:'Pull explosively. 3-1-1 tempo. Hinge at hips, chest up.'},
      {name:'Dumbbell Push Press',type:'Power',ds:4,dr:5,dw:55,ss:'B1',notes:'Drive from legs into overhead press. Full lockout at top.'},
      {name:'Wide-Grip Lat Pulldown',type:'Strength',ds:4,dr:6,dw:130,ss:'B2',notes:'Pull explosively to chest. Full stretch at top.'},
      {name:'EZ Bar Curl',type:'Strength',ds:3,dr:6,dw:65,ss:'C1',notes:'Explosive curl. Slow 3 sec descent. Drop set on final set.'},
      {name:'Weighted Tricep Dips',type:'Strength',ds:3,dr:8,dw:0,ss:'C2',notes:'Explosive push. Lean slightly forward for chest engagement.'},
      {name:'Barbell Overhead Press',type:'Strength',ds:3,dr:6,dw:95,ss:'',notes:'Press from rack. Full lockout. Brace core throughout.'},
      {name:'Face Pulls',type:'Isolation',ds:3,dr:20,dw:40,ss:'',notes:'Pull to forehead level. External rotation. Critical for rotator cuff health.'}
    ]}
    ,{id:'d2',lbl:'02',name:'Lower Power',tag:'LOWER POWER',rest:false,cardio:'Red Light Therapy: 10-15 min full body post-workout',ex:[
      {name:'Barbell Back Squat',type:'Power',ds:5,dr:5,dw:185,ss:'A1',notes:'Explosive drive out of the hole. 3-0-X tempo. Break parallel.'},
      {name:'Romanian Deadlift',type:'Power',ds:5,dr:5,dw:155,ss:'A2',notes:'Hamstring loading. Feel the stretch. Hip hinge pattern.'},
      {name:'Hip Thrust Smith Machine',type:'Power',ds:4,dr:8,dw:135,ss:'B1',notes:'Drive hips explosively. Full extension at top.'},
      {name:'Bulgarian Split Squat',type:'Strength',ds:4,dr:8,dw:40,ss:'B2',notes:'Single-leg stability. Reduces bilateral deficit.'},
      {name:'Explosive Leg Press',type:'Hypertrophy',ds:3,dr:10,dw:270,ss:'C1',notes:'Drive weight fast on concentric. Slow 3 sec return. High foot placement.'},
      {name:'Seated Leg Curl',type:'Hypertrophy',ds:3,dr:12,dw:90,ss:'C2',notes:'Full ROM. Prevents quad/ham imbalance.'},
      {name:'Standing Calf Raise',type:'Hypertrophy',ds:4,dr:15,dw:135,ss:'',notes:'4 sec hold at top. Full stretch at bottom.'},
      {name:'Leg Extension',type:'Isolation',ds:3,dr:15,dw:100,ss:'',notes:'Quad isolation. Pause 1 sec at top.'}
    ].concat(AB_PRESET)}
    ,{id:'d3',lbl:'03',name:'Upper Body Mobility',tag:'ACTIVE REST',rest:false,
      cardio:'1) 15 min Incline Treadmill Walk — easy pace, zone 1-2 heart rate\n2) Upper Body Stretch Circuit — hold each 30 sec:\n   • Chest opener (doorway stretch)\n   • Cross-body shoulder stretch\n   • Overhead lat stretch\n   • Thoracic spine rotation\n   • Neck side stretch\n   • Wrist & forearm flexor stretch\n3) Foam Rolling — 60 sec each:\n   • Upper back / thoracic spine\n   • Pecs & anterior shoulders\n   • Lats\n4) Massage Bed — 10-15 min\n5) Red Light Therapy — 10-15 min full body',
      ex:[
        {name:'Cat-Cow Stretch',type:'Mobility',ds:1,dr:10,dw:0,ss:'',notes:'On hands and knees. Arch and round spine slowly. Breathe through each rep.'},
        {name:'Thoracic Rotation',type:'Mobility',ds:1,dr:10,dw:0,ss:'',notes:'10 each side. Seated or kneeling. Rotate upper back, keep hips still.'},
        {name:'Doorway Chest Stretch',type:'Mobility',ds:1,dr:30,dw:0,ss:'',notes:'Hold 30 sec each arm. Find tension without pain. Breathe deeply.'},
        {name:'Overhead Lat Stretch',type:'Mobility',ds:1,dr:30,dw:0,ss:'',notes:'Hold 30 sec each side. Reach overhead, lean away. Feel the lat stretch.'},
        {name:'Cross-Body Shoulder Stretch',type:'Mobility',ds:1,dr:30,dw:0,ss:'',notes:'Hold 30 sec each arm. Pull arm across chest. Feel posterior shoulder.'},
        {name:'Band Pull-Apart',type:'Mobility',ds:3,dr:15,dw:0,ss:'',notes:'Light band. Arms straight. Squeeze shoulder blades at end range.'},
        {name:'Wrist Circles & Flexor Stretch',type:'Mobility',ds:1,dr:30,dw:0,ss:'',notes:'30 sec circles each direction, then hold flexor stretch 30 sec each wrist.'},
        {name:'Child\'s Pose',type:'Mobility',ds:1,dr:60,dw:0,ss:'',notes:'Hold 60 sec. Arms extended overhead. Focus on breathing and relaxing.'}
      ]
    }
    ,{id:'d4',lbl:'04',name:'Upper Hypertrophy',tag:'UPPER HYPER',rest:false,cardio:'20 min Incline Treadmill — 12% incline, 3.2 mph — Red Light Therapy: 10-15 min full body post-workout',ex:[
      {name:'Incline Dumbbell Press',type:'Hypertrophy',ds:4,dr:12,dw:65,ss:'A1',notes:'3-1-1 tempo. Drop set on final set — drop 20% and hit failure.'},
      {name:'Cable Seated Row',type:'Hypertrophy',ds:4,dr:12,dw:120,ss:'A2',notes:'Full stretch. 2 sec hold at contraction. Squeeze scapula.'},
      {name:'Dumbbell Lateral Raise',type:'Hypertrophy',ds:4,dr:15,dw:20,ss:'B1',notes:'Rest-pause on final set. Lead with elbows. Slight forward lean.'},
      {name:'Rear Delt Cable Fly',type:'Hypertrophy',ds:4,dr:15,dw:15,ss:'B2',notes:'Shoulder health and posture. Pinch shoulder blades.'},
      {name:'Incline Dumbbell Curl',type:'Hypertrophy',ds:3,dr:12,dw:30,ss:'C1',notes:'Long head stretch. Arms hang fully at bottom.'},
      {name:'Overhead Tricep Extension',type:'Hypertrophy',ds:3,dr:12,dw:40,ss:'C2',notes:'Long head loading. Arms by ears. Full stretch at bottom.'},
      {name:'Cable Fly',type:'Isolation',ds:3,dr:15,dw:35,ss:'',notes:'Constant tension. Slight bend in elbows. Squeeze at peak.'},
      {name:'Hammer Curl',type:'Isolation',ds:3,dr:12,dw:30,ss:'',notes:'Neutral grip. Builds brachialis and arm thickness.'},
      {name:'Tricep Rope Pushdown',type:'Isolation',ds:3,dr:15,dw:50,ss:'',notes:'Flare hands at bottom for full contraction.'}
    ]}
    ,{id:'d5',lbl:'05',name:'Lower Hypertrophy',tag:'LOWER HYPER',rest:false,cardio:'Red Light Therapy: 10-15 min full body post-workout',ex:[
      {name:'Hack Squat Smith Machine',type:'Hypertrophy',ds:4,dr:12,dw:135,ss:'A1',notes:'Narrow stance. Feet forward. Deep quad loading.'},
      {name:'Lying Leg Curl',type:'Hypertrophy',ds:4,dr:12,dw:80,ss:'A2',notes:'Full ROM. 2 sec hold. Drop set on final set.'},
      {name:'Cable Pull-Through',type:'Hypertrophy',ds:3,dr:15,dw:60,ss:'B1',notes:'Hip hinge pattern. Glute and hamstring together.'},
      {name:'Single Leg Press',type:'Hypertrophy',ds:3,dr:12,dw:140,ss:'B2',notes:'One leg at a time. Closes strength gap between legs.'},
      {name:'Walking Lunges',type:'Hypertrophy',ds:3,dr:12,dw:40,ss:'',notes:'12 each leg. Full stride. Drive knee forward on step.'},
      {name:'Leg Extension',type:'Isolation',ds:3,dr:15,dw:100,ss:'',notes:'Quad isolation. Pause 1 sec at top.'},
      {name:'Seated Calf Raise',type:'Isolation',ds:4,dr:20,dw:90,ss:'',notes:'Soleus focus. 4 sec hold at top.'},
      {name:'Glute Kickback Cable',type:'Isolation',ds:3,dr:15,dw:30,ss:'',notes:'Full hip extension. Squeeze glute at top.'}
    ].concat(AB_PRESET)}
    ,{id:'d6',lbl:'06',name:'Full Athletic',tag:'ATHLETIC',rest:false,cardio:'20 min HIIT Bike — 20 sec all-out / 40 sec recovery x15 — Red Light Therapy: 10-15 min full body post-workout',ex:[
      {name:'Dumbbell Squat to Press',type:'Power',ds:3,dr:12,dw:35,ss:'A1',notes:'Squat down, explode up, press overhead at top. Full body power chain.'},
      {name:'Cable Woodchop High-Low',type:'Athletic',ds:3,dr:12,dw:40,ss:'A2',notes:'Rotational core power. Mimics basketball drive motion.'},
      {name:'Lateral Band Walk',type:'Athletic',ds:3,dr:15,dw:0,ss:'A3',notes:'Hip abductor strength for lateral defense. Stay low.'},
      {name:'Rowing Machine 30 sec',type:'Cardio',ds:3,dr:1,dw:0,ss:'A4',notes:'30 sec max effort. Upper body conditioning.'},
      {name:'Single Arm Dumbbell Row',type:'Strength',ds:3,dr:10,dw:65,ss:'B1',notes:'Core anti-rotation stability. Full ROM.'},
      {name:'Pallof Press',type:'Athletic',ds:3,dr:12,dw:30,ss:'B2',notes:'Anti-rotation core. Press out and hold 2 sec.'},
      {name:'Reverse Lunge Knee Drive',type:'Power',ds:3,dr:10,dw:0,ss:'B3',notes:'Step back into lunge, drive knee up explosively.'},
      {name:"Farmer's Carry",type:'Athletic',ds:3,dr:40,dw:50,ss:'B4',notes:'Heavy dumbbells. Walk 40 steps. Grip and core conditioning.'},
      {name:'Box Step-Up',type:'Power',ds:3,dr:10,dw:30,ss:'',notes:'Drive through heel. Single leg power. Knee level box.'},
      {name:'Battle Rope Slams',type:'Cardio',ds:3,dr:20,dw:0,ss:'',notes:'Full body power. Drive from hips. 20 slams per set.'}
    ]}
    ,{id:'d7',lbl:'07',name:'Lower Body Mobility',tag:'ACTIVE REST',rest:false,
      cardio:'1) 15 min Incline Treadmill Walk — easy pace, zone 1-2 heart rate\n2) Lower Body Stretch Circuit — hold each 30 sec:\n   • Hip flexor lunge stretch\n   • Pigeon pose (each side)\n   • Seated hamstring stretch\n   • Standing quad stretch\n   • Calf stretch (straight & bent knee)\n   • Glute figure-4 stretch\n3) Foam Rolling — 60 sec each:\n   • Quads\n   • IT band\n   • Hamstrings\n   • Calves\n   • Glutes\n4) Massage Bed — 10-15 min\n5) Red Light Therapy — 10-15 min full body',
      ex:[
        {name:'Hip Flexor Lunge Stretch',type:'Mobility',ds:1,dr:30,dw:0,ss:'',notes:'Hold 30 sec each side. Drive hips forward gently. Keep torso upright.'},
        {name:'Pigeon Pose',type:'Mobility',ds:1,dr:60,dw:0,ss:'',notes:'Hold 60 sec each side. Deep glute and hip opener. Breathe and relax into it.'},
        {name:'Seated Hamstring Stretch',type:'Mobility',ds:1,dr:30,dw:0,ss:'',notes:'Hold 30 sec each leg. Hinge at hips, keep back flat. Feel the hamstring.'},
        {name:'Standing Quad Stretch',type:'Mobility',ds:1,dr:30,dw:0,ss:'',notes:'Hold 30 sec each leg. Pull heel to glute. Squeeze standing glute for balance.'},
        {name:'Calf Stretch',type:'Mobility',ds:1,dr:30,dw:0,ss:'',notes:'30 sec each — straight knee (gastrocnemius) then bent knee (soleus).'},
        {name:'Glute Bridge',type:'Mobility',ds:2,dr:15,dw:0,ss:'',notes:'Slow and controlled. Activate glutes at top. Good for hip mobility and activation.'},
        {name:'Lateral Band Walk',type:'Mobility',ds:2,dr:15,dw:0,ss:'',notes:'Light band. Stay low. Hip abductor activation and glute warmup.'},
        {name:'Figure-4 Glute Stretch',type:'Mobility',ds:1,dr:60,dw:0,ss:'',notes:'Hold 60 sec each side. Lying on back. Cross ankle over opposite knee and pull.'}
      ]
    }
  ];
}

// ════════════════════════════════
// SYNC MISSING PRESET DAYS
// ════════════════════════════════
function syncMissingDays(){
  var presets=buildPresets();
  var changed=false;

  // Step 1: Remove duplicate days (same name appearing more than once)
  var seenNames={};
  var deduped=[];
  for(var i=0;i<S.days.length;i++){
    var dname=S.days[i].name;
    if(!seenNames[dname]){
      seenNames[dname]=true;
      deduped.push(S.days[i]);
    } else {
      changed=true; // removed a duplicate
    }
  }
  S.days=deduped;

  // Step 2: For each preset, check if a day with same NAME exists
  for(var i=0;i<presets.length;i++){
    var preset=presets[i];
    var exists=false;
    for(var j=0;j<S.days.length;j++){
      if(S.days[j].name===preset.name){
        exists=true;
        // Update lbl and id to match new ordering
        if(S.days[j].lbl!==preset.lbl){S.days[j].lbl=preset.lbl;changed=true;}
        if(S.days[j].id!==preset.id){S.days[j].id=preset.id;changed=true;}
        // Update cardio if missing RLT
        if(preset.cardio&&(!S.days[j].cardio||S.days[j].cardio.indexOf('Red Light')===-1)){
          S.days[j].cardio=preset.cardio;changed=true;
        }
        break;
      }
    }
    if(!exists){
      S.days.push(JSON.parse(JSON.stringify(preset)));
      changed=true;
    }
  }

  // Step 3: Re-sort by lbl
  S.days.sort(function(a,b){return parseInt(a.lbl)-parseInt(b.lbl);});

  if(changed){saveState();return true;}
  return false;
}

// ════════════════════════════════
// FIX DUPLICATE DAYS
// ════════════════════════════════
function fixDuplicateDays(){
  var seen={};
  var clean=[];
  var changed=false;
  for(var i=0;i<S.days.length;i++){
    var name=S.days[i].name;
    if(!seen[name]){
      seen[name]=true;
      clean.push(S.days[i]);
    } else {
      changed=true;
    }
  }
  if(changed){
    S.days=clean;
    // Now run full sync to add missing and reorder
    syncMissingDays();
    saveState();
    renderHome();renderSel();
    showToast('DAYS FIXED');
  } else {
    showToast('NO DUPLICATES FOUND');
  }
}

// ════════════════════════════════
// PROGRAM LAYER
//
// A program owns its own day list, cycle length and periodization mode.
//   mode 'free'      — pick any day, any time (how Forge has always worked)
//   mode 'scheduled' — a fixed day 1..N sequence; rest days are real entries
//   peri 'global'    — reps come from the CYCLE table
//   peri 'slot'      — every slot carries its own repMin/repMax, stored at
//                      rest. Nothing in the render path derives reps from a
//                      global week value. This is the rule for every new
//                      program; 'global' survives only so the original Forge
//                      days keep behaving exactly as they always have.
// ════════════════════════════════
var FORGE_PID='p_forge';
var HW_PID='p_hardwood';

// PRs are keyed by exercise AND implement, so a Smith bench never overwrites
// a free-barbell bench. Counterbalanced Smith bars weigh well under 45 lb and
// remove the stabilization demand entirely — the two numbers are not the same
// lift and must not share a record.
var IMPL_LABEL={smith:'SM',barbell:'BB',dumbbell:'DB',machine:'MCH',
                cable:'CBL',bw:'BW',band:'BND',other:''};
function implTag(ex){
  if(!ex) return '';
  var i=(typeof ex==='string')?ex:ex.impl;
  return i?(IMPL_LABEL[i]!==undefined?IMPL_LABEL[i]:i.toUpperCase()):'';
}
function prKey(ex){
  var n=(typeof ex==='string')?ex:(ex&&ex.name);
  var t=(typeof ex==='string')?'':implTag(ex);
  return t?(n+' ['+(typeof ex==='string'?'':ex.impl)+']'):n;
}

// Resolve the rep target for one slot. Slot-level values always win; the
// CYCLE fallback is reached only by legacy days that carry none.
function resolveReps(ex,wd){
  if(ex&&ex.repMin!=null)
    return {min:ex.repMin,max:(ex.repMax!=null?ex.repMax:ex.repMin),slot:true};
  wd=wd||getWeekData();
  return {min:(wd.repMin||wd.reps),max:(wd.repMax||wd.reps),slot:false};
}
function repLabel(ex,wd){
  var r=resolveReps(ex,wd);
  return r.min===r.max?(''+r.min):(r.min+'-'+r.max);
}

// Bump this whenever a built-in program definition changes. Built-in programs
// are persisted into each profile's data, so without a version to compare
// against, an updated definition would never reach anyone who had already
// loaded the old one — their stored copy would win forever.
var BUILTIN_VERSION=2;

// Refresh built-in programs whose stored definition is older than the code's.
// The user's place in a block (progState) is keyed separately by program id,
// so it survives the swap. The Forge program is never touched: it holds the
// user's own days and edits, and those are theirs.
function syncBuiltinPrograms(){
  if(!S.programs)return false;
  var fresh=buildDefaultPrograms(null),changed=false,i;
  for(i=0;i<fresh.length;i++){
    var f=fresh[i];
    if(f.id===FORGE_PID)continue;
    f.bv=BUILTIN_VERSION;
    var cur=getProgram(f.id);
    if(!cur){S.programs.push(f);changed=true;continue;}
    if((cur.bv||0)<BUILTIN_VERSION){
      S.programs[S.programs.indexOf(cur)]=f;
      changed=true;
    }
  }
  return changed;
}

function buildForgeProgram(days){
  return {id:FORGE_PID,name:'Forge',tag:'FORGE',builtin:true,level:'Custom',
    desc:'Your original rotation — pick any day, any time.',
    mode:'free',peri:'global',cycleLen:7,days:days||buildPresets()};
}
function buildDefaultPrograms(existingDays){
  var hw=buildHardwoodProgram();
  hw.bv=BUILTIN_VERSION;
  return [buildForgeProgram(existingDays),hw];
}
function getProgram(pid){
  if(!S.programs)return null;
  for(var i=0;i<S.programs.length;i++){if(S.programs[i].id===pid)return S.programs[i];}
  return null;
}
function activeProgram(){
  return getProgram(S.activeProgramId)||(S.programs&&S.programs[0])||null;
}
function progState(pid){
  if(!S.progState)S.progState={};
  if(!S.progState[pid])S.progState[pid]={startedAt:null,cursor:1,completed:{}};
  return S.progState[pid];
}
// Which day of a scheduled program is up next.
function currentCycleDay(p){
  if(!p||p.mode!=='scheduled')return null;
  var st=progState(p.id),c=st.cursor||1;
  return c<1?1:(c>p.days.length?p.days.length:c);
}
function advanceCycle(p){
  if(!p||p.mode!=='scheduled')return;
  var st=progState(p.id);
  st.cursor=(st.cursor||1)+1;
  if(st.cursor>p.days.length)st.cursor=p.days.length;
  saveState();
}
function setActiveProgram(pid){
  var p=getProgram(pid);
  if(!p)return false;
  S.activeProgramId=pid;
  S.days=p.days;
  var st=progState(pid);
  if(!st.startedAt)st.startedAt=Date.now();
  saveState();
  return true;
}

function updateWkChip(){
  var p=activeProgram(),c=el('wk-chip');
  if(!c)return;
  if(p&&p.mode==='scheduled'){
    var d=S.activeDay&&S.activeDay.day?S.activeDay:p.days[currentCycleDay(p)-1];
    c.textContent='D'+d.day+' / WK'+d.week+' OF '+p.weeks;
  }else{
    var wd=getWeekData();
    c.textContent='WK'+wd.week+' / '+(wd.repMin||wd.reps)+'-'+(wd.repMax||wd.reps)+'R';
  }
}

// ════════════════════════════════
// COMPLETION STATE
// A scheduled program records each day it finishes, so a card can show that
// the session is behind you. A free-form program has no fixed schedule, so it
// falls back to the log and shows how long ago that day was last trained.
// ════════════════════════════════
function agoLabel(d){
  if(d<=0)return 'TODAY';
  if(d===1)return 'YESTERDAY';
  if(d<7)return d+'D AGO';
  if(d<56)return Math.round(d/7)+'W AGO';
  return Math.max(1,Math.round(d/30))+'MO AGO';
}
function dayCompletion(day){
  if(!day||day.rest)return null;
  var p=activeProgram();
  if(p&&p.mode==='scheduled'){
    var st=progState(p.id);
    var t=st.completed&&st.completed[day.id];
    if(!t)return null;
    return {done:true,date:t,daysAgo:Math.floor((Date.now()-t)/864e5)};
  }
  for(var i=S.log.length-1;i>=0;i--){
    if(S.log[i].dayId===day.id){
      var ms=new Date(S.log[i].date).getTime();
      var d=Math.floor((Date.now()-ms)/864e5);
      // On a free program "done" means done recently enough to still count as
      // this week's session — older than that and it is just history.
      return {done:d<=6,date:ms,daysAgo:d};
    }
  }
  return null;
}
// Called when a session is committed.
function markDayComplete(dayId){
  var p=activeProgram();
  if(!p)return;
  var st=progState(p.id);
  if(!st.completed)st.completed={};
  st.completed[dayId]=Date.now();
  if(!st.startedAt)st.startedAt=Date.now();
  if(p.mode!=='scheduled')return;
  var idx=-1,i;
  for(i=0;i<p.days.length;i++){if(p.days[i].id===dayId){idx=i;break;}}
  if(idx<0)return;
  // Advance to the next day that still needs doing, stepping over rest days
  // and anything already logged.
  var n=idx+2;
  while(n<=p.days.length){
    var d=p.days[n-1];
    if(!d.rest&&!st.completed[d.id])break;
    n++;
  }
  st.cursor=Math.min(n,p.days.length);
}
