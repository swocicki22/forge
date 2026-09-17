// ════════════════════════════════
// SHRED ATHLETIC — 6-week explosive cut
//
// Built on two methods that work well in a deficit, applied to an athletic
// structure rather than a bodybuilding split:
//
//   CARDIOACCELERATION — low-impact cardio in the rest periods instead of
//   standing around. This is the fat-loss engine. It runs ONLY on the pump
//   and core blocks: cardio between sets destroys force output, so putting
//   it anywhere near the power work would quietly kill the explosiveness
//   this program exists to build.
//
//   DUAL PERIODIZATION — two rep tracks running at once. The heavy block
//   marches DOWN (10-12 reps in week 1 to 3-4 in week 6) as load climbs. The
//   pump block marches UP (8-10 to 20-25) as load falls. Strength and
//   metabolic work progress in opposite directions inside the same session.
//
// Each day runs four blocks, in this order and for this reason:
//   1. POWER  — jumps and throws, full rest, never to fatigue. First, while
//               the nervous system is fresh. No cardioacceleration.
//   2. HEAVY  — the main lift (or speed work). Full rest, linear.
//   3. PUMP   — accessories with cardioacceleration. Reverse linear.
//   4. CORE   — the AB-X circuit, high rep, cheap to recover from.
//
// Weekly cycle: Lower A · Upper A · Rest · Lower B · Upper B · Athletic · Rest
//
// Every slot stores its own repMin/repMax for its own week. Nothing here is
// derived from a global week value at render time.
// ════════════════════════════════

var HW_CYCLE=['lower_a','upper_a',null,'lower_b','upper_b','athletic',null];
var HW_WEEKS=6;

// Linear track — heavy block. Reps fall, intensity climbs.
var HW_LINEAR=[{r:[10,12],p:70},{r:[8,10],p:75},{r:[6,8],p:80},
               {r:[5,6],p:85},{r:[4,5],p:88},{r:[3,4],p:92}];
// Reverse linear track — pump block. Reps climb, load falls.
var HW_REVERSE=[{r:[8,10],p:65},{r:[10,12],p:60},{r:[12,15],p:55},
                {r:[15,18],p:50},{r:[18,20],p:45},{r:[20,25],p:40}];
// Speed work waves load only; reps stay at 3.
var HW_SPEED=[{s:8,p:50},{s:8,p:52},{s:8,p:55},{s:8,p:57},{s:6,p:45},{s:8,p:55}];

function hwLinear(w){var x=HW_LINEAR[w-1]||HW_LINEAR[0];return {ds:4,repMin:x.r[0],repMax:x.r[1],pct:x.p};}
function hwReverse(w){var x=HW_REVERSE[w-1]||HW_REVERSE[0];return {ds:3,repMin:x.r[0],repMax:x.r[1],pct:x.p};}
function hwSpeed(w){var x=HW_SPEED[w-1]||HW_SPEED[0];return {ds:x.s,repMin:3,repMax:3,pct:x.p};}
// Power never periodizes. Low reps, high quality, every single week.
function hwPower(w,sets){return {ds:(sets||4),repMin:3,repMax:3};}
function hwCore(w,lo,hi,sets){return {ds:(sets||3),repMin:lo,repMax:hi};}

var HW_CA='CARDIOACCELERATION — 45 sec between every set: jump rope, high knees, mountain climbers, or fast step-ups. Keep moving. This is what turns a lifting session into a fat-loss session without adding a minute to it.';
var HW_CA_SHORT='Cardioacceleration: 45 sec low-impact cardio between sets.';
var HW_NOCA='Full rest, 2-3 min. No cardio between these sets — you cannot express power on a fatigued system, and this is the block that keeps you explosive.';
var HW_BLOCKS='Blocks: POWER (full rest) → HEAVY (full rest) → PUMP (cardioacceleration) → CORE. ';

function buildHardwoodSessions(){
  return [

    // ── DAY 1 — LOWER A ────────────────────────────────────────
    {sid:'lower_a',name:'Lower Power + Heavy',tag:'LOWER A',mins:55,focus:'power',
     cardio:HW_BLOCKS+HW_CA,ex:[
      {name:'Vertical Jump',impl:'bw',type:'Power',dw:0,blk:'power',power:true,sets:5,
       notes:'5 sets of 3. Maximum height every rep, full rest between sets. The moment height drops, the exercise is over — this is skill practice, not conditioning. Reach for a fixed target so you can watch it improve. '+HW_NOCA},
      {name:'Broad Jump',impl:'bw',type:'Power',dw:0,blk:'power',power:true,sets:4,
       notes:'Horizontal power. Land soft, absorb through the hips, fully reset between reps.'},
      {name:'Smith Back Squat',impl:'smith',type:'Power',dw:235,blk:'heavy',lin:true,
       alt:'Barbell Back Squat',altImpl:'barbell',
       notes:'The main lift. Reps fall and weight climbs every week. Break parallel. If a rack is open, use the barbell and log it as the BB variant — the two track as separate lifts on purpose. '+HW_NOCA},
      {name:'Smith Romanian Deadlift',impl:'smith',type:'Strength',dw:155,blk:'heavy',lin:true,
       alt:'Barbell Romanian Deadlift',altImpl:'barbell',
       notes:'Hips back, soft knees, feel the hamstring stretch. Stop the set when your lower back rounds — that is the end of your range, not a rep to fight for.'},
      {name:'Leg Press',impl:'machine',type:'Hypertrophy',dw:360,blk:'pump',rev:true,
       notes:'Pump block starts here. '+HW_CA_SHORT+' Feet mid-platform, knees tracking over toes.'},
      {name:'Lying Leg Curl',impl:'machine',type:'Hypertrophy',dw:185,blk:'pump',rev:true,
       notes:'Hamstrings resist knee injury and produce sprint speed. Full range, 3 sec negative. '+HW_CA_SHORT},
      {name:'Bulgarian Split Squat',impl:'dumbbell',type:'Strength',dw:45,blk:'pump',rev:true,
       notes:'Each leg. You jump and land off one leg constantly on the court — single-leg strength transfers more directly than anything else here.'},
      {name:'Standing Calf Raise',impl:'machine',type:'Hypertrophy',dw:215,blk:'pump',rev:true,
       notes:'2 sec pause at the top, full stretch at the bottom. Ankle stiffness is a large share of your vertical. '+HW_CA_SHORT}
    ]},

    // ── DAY 2 — UPPER A ────────────────────────────────────────
    {sid:'upper_a',name:'Upper Power + Heavy',tag:'UPPER A',mins:55,focus:'power',
     cardio:HW_BLOCKS+HW_CA,ex:[
      {name:'Plyo Push-Up',impl:'bw',type:'Power',dw:0,blk:'power',power:true,sets:4,
       notes:'Hands leave the floor. Drop to your knees if that is what keeps them explosive. Quality over count. '+HW_NOCA},
      {name:'Dumbbell Push Press',impl:'dumbbell',type:'Power',dw:70,blk:'power',power:true,sets:4,
       notes:'Dip with the legs, drive overhead. The closest thing to a clean and jerk available to you here.'},
      {name:'Smith Bench Press',impl:'smith',type:'Power',dw:160,blk:'heavy',lin:true,
       alt:'Barbell Bench Press',altImpl:'barbell',
       notes:'The main upper lift. Reps fall and weight climbs weekly. Controlled down, drive hard off the chest. '+HW_NOCA},
      {name:'Wide-Grip Lat Pulldown',impl:'machine',type:'Strength',dw:180,blk:'heavy',lin:true,
       alt:'Weighted Pull-Up',altImpl:'bw',
       notes:'Pull to the upper chest, full stretch at the top. Swap in weighted pull-ups whenever you can do 8 clean.'},
      {name:'Smith Overhead Press',impl:'smith',type:'Strength',dw:95,blk:'pump',rev:true,
       alt:'Barbell Overhead Press',altImpl:'barbell',
       notes:'Pump block starts here. Brace hard, full lockout, do not lean back to move the weight. '+HW_CA_SHORT},
      {name:'Cable Seated Row',impl:'cable',type:'Hypertrophy',dw:160,blk:'pump',rev:true,
       notes:'Full stretch forward, hard squeeze back. '+HW_CA_SHORT},
      {name:'Incline Dumbbell Press',impl:'dumbbell',type:'Hypertrophy',dw:145,blk:'pump',rev:true,
       notes:'30-45 degree bench, full stretch at the bottom. '+HW_CA_SHORT},
      {name:'Dumbbell Lateral Raise',impl:'dumbbell',type:'Isolation',dw:15,blk:'pump',rev:true,
       notes:'Light, strict, no swinging. '+HW_CA_SHORT},
      {name:'EZ Bar Curl',impl:'smith',type:'Isolation',dw:140,blk:'pump',rev:true,
       notes:'Elbows pinned to your sides. '+HW_CA_SHORT}
    ]},

    // ── DAY 4 — LOWER B ────────────────────────────────────────
    {sid:'lower_b',name:'Lower Speed + Pump',tag:'LOWER B',mins:50,focus:'power',
     cardio:'Blocks: POWER → SPEED (both full rest) → PUMP (cardioacceleration) → CORE. '+HW_CA,ex:[
      {name:'Dumbbell Jump Squat',impl:'dumbbell',type:'Power',dw:30,blk:'power',power:true,sets:4,
       notes:'Light dumbbells at your sides. Jump for height, land soft, reset. Never to fatigue. '+HW_NOCA},
      {name:'Box Step-Up',impl:'dumbbell',type:'Power',dw:40,blk:'power',power:true,sets:3,
       notes:'Each leg. Drive up fast off the working leg, come down slow. Knee-height bench.'},
      {name:'Smith Speed Squat',impl:'smith',type:'Power',dw:120,blk:'speed',spd:true,
       alt:'Barbell Speed Squat',altImpl:'barbell',
       notes:'Light weight moved as fast as you possibly can, 45 sec between sets. If the bar slows down, stop — speed is the entire stimulus and grinding it defeats the purpose. '+HW_NOCA},
      {name:'Single Leg Press',impl:'machine',type:'Hypertrophy',dw:140,blk:'pump',rev:true,
       notes:'Pump block starts here. Each leg. '+HW_CA_SHORT},
      {name:'Seated Leg Curl',impl:'machine',type:'Hypertrophy',dw:132,blk:'pump',rev:true,
       notes:'Full range, 3 sec negative. '+HW_CA_SHORT},
      {name:'Leg Extension',impl:'machine',type:'Hypertrophy',dw:235,blk:'pump',rev:true,
       notes:'Quad volume. Pause 1 sec at the top. '+HW_CA_SHORT},
      {name:'Seated Calf Raise',impl:'machine',type:'Hypertrophy',dw:205,blk:'pump',rev:true,
       notes:'Soleus work — the seated version hits what the standing one misses. '+HW_CA_SHORT},
      {name:'Farmer\'s Carry',impl:'dumbbell',type:'Conditioning',dw:50,blk:'pump',timed:true,secs:45,sets:4,
       notes:'4 trips, 45 sec each. Grip, core and upper back, with a conditioning cost and almost no recovery cost.'}
    ]},

    // ── DAY 5 — UPPER B ────────────────────────────────────────
    {sid:'upper_b',name:'Upper Speed + Pump',tag:'UPPER B',mins:50,focus:'power',
     cardio:'Blocks: POWER → SPEED (both full rest) → PUMP (cardioacceleration) → CORE. '+HW_CA,ex:[
      {name:'Medicine Ball Chest Throw',impl:'bw',type:'Power',dw:0,blk:'power',power:true,sets:4,
       notes:'Against a wall, as hard as you can. If your gym has no medicine ball, do a second set of plyo push-ups instead. '+HW_NOCA},
      {name:'Smith Speed Bench',impl:'smith',type:'Power',dw:95,blk:'speed',spd:true,
       alt:'Barbell Speed Bench',altImpl:'barbell',
       notes:'Explosive off the chest, 45 sec rest. Same rule as speed squats — when the bar slows, you are done for the day. '+HW_NOCA},
      {name:'Explosive Lat Pulldown',impl:'machine',type:'Power',dw:140,blk:'speed',power:true,sets:5,
       notes:'Pull fast, return under control. Speed matters on the pulling side too.'},
      {name:'Incline Dumbbell Press',impl:'dumbbell',type:'Hypertrophy',dw:145,blk:'pump',rev:true,
       notes:'Pump block starts here. '+HW_CA_SHORT},
      {name:'T-Bar Row',impl:'machine',type:'Hypertrophy',dw:170,blk:'pump',rev:true,
       notes:'Chest supported so your lower back stays out of it. '+HW_CA_SHORT},
      {name:'Rear Delt Cable Fly',impl:'cable',type:'Isolation',dw:100,blk:'pump',rev:true,
       notes:'Rear delts and rotator cuff. Light and strict — this keeps your shoulders healthy under all the pressing. '+HW_CA_SHORT},
      {name:'Incline Dumbbell Curl',impl:'dumbbell',type:'Isolation',dw:35,blk:'pump',rev:true,
       notes:'Full stretch at the bottom — the incline is the point. '+HW_CA_SHORT},
      {name:'Skull Crusher',impl:'smith',type:'Isolation',dw:125,blk:'pump',rev:true,
       notes:'Elbows fixed, lower to the forehead. '+HW_CA_SHORT}
    ]},

    // ── DAY 6 — ATHLETIC (optional) ────────────────────────────
    {sid:'athletic',name:'Athletic (Optional)',tag:'ATHLETIC',mins:35,focus:'conditioning',
     optional:true,
     cardio:'Optional fifth day. Take it when you feel good, skip it without guilt when you do not — the four lifting days are the program and this is a bonus. Everything here is low impact by design, so it never competes with your jumping.',ex:[
      {name:'Jump Rope',impl:'bw',type:'Conditioning',dw:0,blk:'power',timed:true,secs:600,sets:1,
       notes:'10 minutes, varied — steady, then bursts of double-unders or high knees. Stiff ankles, minimal ground contact time. This is the cheapest vertical-jump training there is.'},
      {name:'Incline Treadmill Sprint',impl:'machine',type:'Conditioning',dw:0,blk:'pump',timed:true,secs:20,sets:8,
       notes:'8 rounds: 20 sec hard at 10-12% incline, 90 sec walking recovery. The incline keeps speed and impact low while the heart rate still climbs.'},
      {name:'Stairmaster Intervals',impl:'machine',type:'Conditioning',dw:0,blk:'pump',timed:true,secs:900,sets:1,
       notes:'15 min — 2 min moderate (lvl 7) / 1 min hard (lvl 12), repeating. Hands off the rails.'},
      {name:'Hip Flexor Lunge Stretch',impl:'bw',type:'Mobility',dw:0,blk:'core',timed:true,secs:60,sets:1,
       notes:'30 sec each side. Desk work shortens these, and tight hip flexors steal the hip extension you jump with.'},
      {name:'Pigeon Pose',impl:'bw',type:'Mobility',dw:0,blk:'core',timed:true,secs:60,sets:1,
       notes:'60 sec each side. Deep glute and hip opener.'}
    ]}

  ];
}

// The Ab Protocol, appended to every lifting day — four times a week, not
// once. This pulls from the app's own AB_PRESETS so it stays in sync with the
// difficulty selector rather than forking a second copy of the same circuit.
// The 'standard' tier is what the training log actually shows being run.
function hwCoreBlock(){
  var src=(typeof AB_PRESETS!=='undefined'&&AB_PRESETS.standard)?AB_PRESETS.standard:[];
  var out=[];
  for(var i=0;i<src.length;i++){
    var e=src[i];
    // A core slot carrying dr as seconds (plank, side plank) is timed.
    var timed=/plank/i.test(e.name);
    out.push({name:e.name,impl:'bw',type:'Core',dw:e.dw||0,
              ss:'X'+(i+1),blk:'core',
              loaded:!!e.loaded,
              timed:timed,secs:timed?e.dr:null,
              sets:e.ds,
              core:timed?null:[e.dr,e.dr],
              notes:(e.notes||'')+(timed?'':' '+HW_CA_SHORT)});
  }
  return out;
}

// Materialize all 42 days. Every training slot is written out with its own
// resolved reps for its own week, so the workout screen only ever reads what
// is already stored.
function buildHardwoodSchedule(sessions){
  var byId={},i;
  for(i=0;i<sessions.length;i++)byId[sessions[i].sid]=sessions[i];
  var sched=[];
  for(var d=0;d<HW_WEEKS*7;d++){
    var week=Math.floor(d/7)+1, sid=HW_CYCLE[d%7], n=d+1;
    var lbl=n<10?'0'+n:''+n;
    if(!sid){
      sched.push({id:'hw_d'+n,lbl:lbl,day:n,week:week,sid:null,name:'Rest Day',
                  tag:'REST',rest:true,cardio:null,ex:[]});
      continue;
    }
    var s=byId[sid];
    var src=s.ex.slice();
    if(!s.optional)src=src.concat(hwCoreBlock());   // AB-X on every lifting day
    var slots=[];
    for(var j=0;j<src.length;j++){
      var e=src[j],w;
      if(e.lin)        w=hwLinear(week);
      else if(e.rev)   w=hwReverse(week);
      else if(e.spd)   w=hwSpeed(week);
      else if(e.power) w=hwPower(week,e.sets);
      else if(e.core)  w=hwCore(week,e.core[0],e.core[1],e.sets);
      else             w={ds:(e.sets||3),repMin:12,repMax:15};
      var slot={name:e.name,type:e.type,impl:e.impl,blk:e.blk||'pump',
                ds:w.ds,dw:e.dw||0,ss:e.ss||'',notes:e.notes||'',
                repMin:w.repMin,repMax:w.repMax};
      if(w.pct!=null)slot.pct=w.pct;
      if(e.alt){slot.alt=e.alt;slot.altImpl=e.altImpl;}
      if(e.power)slot.power=true;
      // A timed slot logs seconds, not reps — matching how the existing core
      // presets store a 45 sec plank as dr:45.
      if(e.timed){
        slot.timed=true;slot.secs=e.secs;
        slot.ds=(e.sets||w.ds||3);
        slot.repMin=e.secs;slot.repMax=e.secs;
      }
      if(e.loaded)slot.loaded=true;
      // Cardioacceleration runs on the pump and core blocks only — never on
      // power, speed or heavy work.
      slot.ca=(slot.blk==='pump'||slot.blk==='core');
      slot.dr=slot.repMin;
      slots.push(slot);
    }
    sched.push({id:'hw_d'+n,lbl:lbl,day:n,week:week,sid:sid,name:s.name,tag:s.tag,
                rest:false,mins:s.mins,focus:s.focus,optional:!!s.optional,
                cardio:s.cardio||null,ex:slots});
  }
  return sched;
}

function buildHardwoodProgram(){
  var sessions=buildHardwoodSessions();
  return {
    id:HW_PID,name:'Shred Athletic',tag:'SHRED',builtin:true,level:'Athletic',
    desc:'Six weeks of explosive work and cardioacceleration, built for a cut. Power first and fresh, heavy work marching reps down, pump work marching them up, and cardio filling the rest periods where it cannot cost you any jump height.',
    mode:'scheduled',peri:'slot',weeks:HW_WEEKS,cycleLen:7,perWeek:4,
    notes:'Cardioacceleration runs on the pump and core blocks only. Never between power, speed or heavy sets — cardio there costs you force output, which is the whole thing you are training. In a deficit, cut sets before you cut weight.',
    sessions:sessions,days:buildHardwoodSchedule(sessions)
  };
}
