// ════════════════════════════════
// HARDWOOD — 6-week basketball block
//
// Goals, in priority order:
//   1. hold and build maximal strength while in a calorie deficit
//   2. keep power output high — trained fresh, never to failure
//   3. drive fat loss with conditioning that spares the legs
//
// Structured around what actually gets done: four lifting days with the
// conditioning attached as a finisher, because standalone conditioning days
// get skipped and finishers do not. Day 6 is optional by design.
//
// Weekly cycle: ME Lower · ME Upper · Rest · DE Lower · DE Upper · Optional · Rest
//
// Every slot stores its own repMin/repMax for its own week. Nothing here is
// derived from a global week value at render time.
// ════════════════════════════════

var HW_CYCLE=['me_lower','me_upper',null,'de_lower','de_upper','athletic',null];
var HW_WEEKS=6;

// Max effort: intensity climbs, reps fall, week 5 deloads, week 6 retests.
var HW_ME=[{r:5,p:80},{r:4,p:85},{r:3,p:87},{r:2,p:92},{r:5,p:65},{r:3,p:90}];
// Dynamic effort: load stays light. Bar speed is the entire point.
var HW_DE=[{s:8,r:3,p:50},{s:8,r:3,p:52},{s:8,r:3,p:55},{s:8,r:3,p:57},{s:6,r:3,p:45},{s:8,r:3,p:55}];

function hwME(w){var x=HW_ME[w-1]||HW_ME[0];return {ds:3,repMin:x.r,repMax:x.r,pct:x.p};}
function hwDE(w){var x=HW_DE[w-1]||HW_DE[0];return {ds:x.s,repMin:x.r,repMax:x.r,pct:x.p};}
function hwAcc(w,lo,hi,sets){
  var o={ds:(sets||3),repMin:lo,repMax:hi};
  if(w===5){o.ds=Math.max(2,(sets||3)-1);o.deload=true;}   // back off in the deload
  return o;
}

var HW_FINISH_LOWER='Finisher — 12 min Stairmaster: 2 min moderate (lvl 7) / 1 min hard (lvl 12), repeating. Low impact on purpose: your knees and Achilles already absorb enough, and this keeps your legs fresh for jumping.';
var HW_FINISH_UPPER='Finisher — 15 min incline treadmill: 12% grade, 3.2 mph, steady. Zone 2. Read something. This is fat loss with no recovery cost.';
var HW_FINISH_DEL='Finisher — 8 rounds: 20 sec hard on the bike, 90 sec easy. Bike, not sprints — your legs just did speed work and hamstrings tear when they are fatigued.';
var HW_FINISH_DEU='Finisher — 10 min jump rope, mixed: steady, then bursts of double-unders or high knees. Ankle stiffness is a large share of your vertical, and this is the cheapest way to train it. Bring your own rope.';

function buildHardwoodSessions(){
  return [
    {sid:'me_lower',name:'Lower Max Effort',tag:'ME LOWER',mins:55,focus:'strength',
     cardio:HW_FINISH_LOWER,ex:[
      {name:'Smith Back Squat',impl:'smith',type:'Power',dw:235,ss:'',me:true,
       alt:'Barbell Back Squat',altImpl:'barbell',
       notes:'Top set for the week, then two back-off sets at 85% of it. Break parallel. If a rack is open, use the barbell and log it as the BB variant — the two track as separate lifts on purpose.'},
      {name:'Smith Romanian Deadlift',impl:'smith',type:'Power',dw:155,ss:'',acc:[6,8],
       alt:'Barbell Romanian Deadlift',altImpl:'barbell',
       notes:'Hips back, soft knees, feel the hamstring stretch. Stop the set when your lower back rounds — that is the end of your range, not a rep to fight for.'},
      {name:'Leg Press',impl:'machine',type:'Strength',dw:360,ss:'',acc:[8,10],
       notes:'Heavy and controlled. Feet mid-platform, knees tracking over toes. Do not slam the lockout.'},
      {name:'Seated Leg Curl',impl:'machine',type:'Hypertrophy',dw:132,ss:'A1',acc:[10,12],
       notes:'Full range, 3 sec negative. Strong hamstrings are what keep you from pulling one the week you start playing again.'},
      {name:'Bulgarian Split Squat',impl:'dumbbell',type:'Strength',dw:45,ss:'A2',acc:[8,10],
       notes:'8-10 each leg. You jump and land off one leg constantly on the court — single-leg strength transfers more directly than anything else here.'},
      {name:'Standing Calf Raise',impl:'machine',type:'Hypertrophy',dw:215,ss:'',acc:[12,15],
       notes:'2 sec pause at the top, full stretch at the bottom. Do not skip these.'}
    ]},

    {sid:'me_upper',name:'Upper Max Effort',tag:'ME UPPER',mins:50,focus:'strength',
     cardio:HW_FINISH_UPPER,ex:[
      {name:'Smith Bench Press',impl:'smith',type:'Power',dw:160,ss:'',me:true,
       alt:'Barbell Bench Press',altImpl:'barbell',
       notes:'Top set, then two back-offs at 85%. Controlled down, drive hard off the chest.'},
      {name:'Smith Overhead Press',impl:'smith',type:'Strength',dw:95,ss:'',acc:[5,6],
       alt:'Barbell Overhead Press',altImpl:'barbell',
       notes:'Brace hard, full lockout. Do not lean back to move the weight.'},
      {name:'Wide-Grip Lat Pulldown',impl:'machine',type:'Strength',dw:180,ss:'B1',acc:[6,8],
       alt:'Weighted Pull-Up',altImpl:'bw',
       notes:'Pull to the upper chest, full stretch at the top. Swap in weighted pull-ups whenever you can do 8 clean.'},
      {name:'T-Bar Row',impl:'machine',type:'Strength',dw:170,ss:'B2',acc:[8,10],
       notes:'Chest supported so your lower back stays out of it. Squeeze the shoulder blades, 1 sec hold.'},
      {name:'Incline Dumbbell Press',impl:'dumbbell',type:'Hypertrophy',dw:145,ss:'',acc:[8,10],
       notes:'30-45 degree bench. Full stretch at the bottom.'},
      {name:'Face Pulls',impl:'cable',type:'Isolation',dw:75,ss:'C1',acc:[15,20],
       notes:'To forehead height, with external rotation. Light and high-rep — this is shoulder insurance, not a lift to chase.'},
      {name:'Tricep Rope Pushdown',impl:'cable',type:'Isolation',dw:52,ss:'C2',acc:[10,12],
       notes:'Elbows pinned. Arms are an accessory here, not the point of the session.'}
    ]},

    {sid:'de_lower',name:'Lower Dynamic',tag:'DE LOWER',mins:50,focus:'power',
     cardio:HW_FINISH_DEL,ex:[
      {name:'Vertical Jump',impl:'bw',type:'Power',dw:0,ss:'',power:true,sets:5,acc:[3,3],
       notes:'5 sets of 3, maximum height every rep, full rest between sets. The moment height drops the exercise is over — this is skill practice, not conditioning. Reach for a fixed target so you can see it improve.'},
      {name:'Broad Jump',impl:'bw',type:'Power',dw:0,ss:'',power:true,sets:4,acc:[3,3],
       notes:'Horizontal power. Land soft, absorb through the hips, fully reset between reps.'},
      {name:'Smith Speed Squat',impl:'smith',type:'Power',dw:120,ss:'',de:true,
       alt:'Barbell Speed Squat',altImpl:'barbell',
       notes:'Light weight moved as fast as you possibly can, 45 sec between sets. If the bar slows down, stop — speed is the whole stimulus and grinding it defeats the purpose.'},
      {name:'Dumbbell Jump Squat',impl:'dumbbell',type:'Power',dw:30,ss:'',power:true,sets:4,acc:[5,5],
       notes:'Light dumbbells at your sides. Jump for height, land soft, reset. Never to fatigue.'},
      {name:'Box Step-Up',impl:'dumbbell',type:'Power',dw:40,ss:'D1',acc:[6,6],
       notes:'6 each leg. Drive up fast, come down slow. Knee-height bench.'},
      {name:'Lying Leg Curl',impl:'machine',type:'Hypertrophy',dw:185,ss:'D2',acc:[10,12],
       notes:'Hamstring volume on the day you did the most explosive work. This is the injury-prevention slot.'}
    ]},

    {sid:'de_upper',name:'Upper Dynamic',tag:'DE UPPER',mins:45,focus:'power',
     cardio:HW_FINISH_DEU,ex:[
      {name:'Smith Speed Bench',impl:'smith',type:'Power',dw:95,ss:'',de:true,
       alt:'Barbell Speed Bench',altImpl:'barbell',
       notes:'Explosive off the chest, 45 sec rest. Same rule as speed squats — when the bar slows, you are done for the day.'},
      {name:'Plyo Push-Up',impl:'bw',type:'Power',dw:0,ss:'',power:true,sets:4,acc:[5,5],
       notes:'Hands leave the floor. Drop to your knees if that is what keeps them explosive. Quality over count.'},
      {name:'Dumbbell Push Press',impl:'dumbbell',type:'Power',dw:70,ss:'',power:true,sets:4,acc:[5,5],
       notes:'Dip with the legs, drive overhead. The closest thing to a clean and jerk available to you here.'},
      {name:'Explosive Lat Pulldown',impl:'machine',type:'Power',dw:140,ss:'E1',acc:[5,5],
       notes:'Pull fast, return under control. Speed matters on the pulling side too.'},
      {name:'Seated Cable Row',impl:'cable',type:'Strength',dw:160,ss:'E2',acc:[8,10],
       notes:'Full stretch forward, hard squeeze back. Upper back health and posture.'},
      {name:'Rear Delt Cable Fly',impl:'cable',type:'Isolation',dw:100,ss:'F1',acc:[15,15],
       notes:'Light. Rear delts and cuff keep your shoulders healthy under all this pressing.'},
      {name:'Hammer Curl',impl:'dumbbell',type:'Isolation',dw:37,ss:'F2',acc:[10,12],
       notes:'Elbows still. Brief arm work to finish.'}
    ]},

    {sid:'athletic',name:'Athletic (Optional)',tag:'ATHLETIC',mins:35,focus:'conditioning',
     optional:true,
     cardio:'Optional fifth day. Take it when you feel good, skip it without guilt when you do not — the four lifting days are the program, and this is a bonus. Everything here is low impact.',ex:[
      {name:'Jump Rope',impl:'bw',type:'Conditioning',dw:0,ss:'',timed:true,secs:600,acc:[1,1],
       notes:'10 minutes, varied. Stiff ankles, minimal ground contact time.'},
      {name:'Incline Treadmill Sprint',impl:'machine',type:'Conditioning',dw:0,ss:'',timed:true,secs:20,sets:8,acc:[1,1],
       notes:'8 rounds: 20 sec hard at 10-12% incline, 90 sec walking recovery. The incline keeps the speed low and the impact low while the heart rate still climbs.'},
      {name:'Farmer\'s Carry',impl:'dumbbell',type:'Conditioning',dw:50,ss:'',timed:true,secs:45,sets:4,acc:[1,1],
       notes:'4 trips, 45 sec each. Grip, core and upper back, with a conditioning cost and almost no recovery cost.'},
      {name:'Hip Flexor Lunge Stretch',impl:'bw',type:'Mobility',dw:0,ss:'',timed:true,secs:60,acc:[1,1],
       notes:'30 sec each side. Desk work shortens these, and tight hip flexors steal the hip extension you jump with.'},
      {name:'Hanging Leg Raise',impl:'bw',type:'Core',dw:0,ss:'',acc:[12,15],
       notes:'Dead hang, no swinging, posterior pelvic tilt at the top.'},
      {name:'Plank',impl:'bw',type:'Core',dw:0,ss:'',timed:true,secs:45,sets:3,acc:[1,1],
       notes:'45 sec. Braced, glutes squeezed, neutral spine.'}
    ]}
  ];
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
    var s=byId[sid],slots=[];
    for(var j=0;j<s.ex.length;j++){
      var src=s.ex[j],w;
      if(src.me)      w=hwME(week);
      else if(src.de) w=hwDE(week);
      else            w=hwAcc(week,(src.acc?src.acc[0]:8),(src.acc?src.acc[1]:12),src.sets);
      var slot={name:src.name,type:src.type,impl:src.impl,
                ds:w.ds,dw:src.dw||0,ss:src.ss||'',notes:src.notes||'',
                repMin:w.repMin,repMax:w.repMax};
      if(w.pct!=null)   slot.pct=w.pct;
      if(w.deload)      slot.deload=true;
      if(src.alt){slot.alt=src.alt;slot.altImpl=src.altImpl;}
      if(src.power)     slot.power=true;
      if(src.timed){slot.timed=true;slot.secs=src.secs;}
      slot.dr=slot.repMin;                // legacy field kept in sync
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
    id:HW_PID,name:'Hardwood',tag:'HARDWOOD',builtin:true,level:'Athletic',
    desc:'Six weeks built to hold strength in a deficit, keep power sharp for basketball, and lose fat with conditioning that spares your legs. Smith-first, with barbell swaps written into every main lift.',
    mode:'scheduled',peri:'slot',weeks:HW_WEEKS,cycleLen:7,perWeek:4,
    notes:'Power work goes first and never to failure. In a deficit, cut sets before you cut weight — strength is neural and survives a cut; it does not survive junk volume. Weeks 1-4 build, week 5 deloads, week 6 retests.',
    sessions:sessions,days:buildHardwoodSchedule(sessions)
  };
}
