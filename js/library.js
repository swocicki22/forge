// ════════════════════════════════
// LIBRARY
// ════════════════════════════════
var LIB=[
  {name:'Barbell Bench Press',muscle:'Chest',type:'Compound',tip:'Explosive concentric. Lower to mid-chest.'},
  {name:'Incline Dumbbell Press',muscle:'Chest',type:'Compound',tip:'30-45 degree incline. Upper chest emphasis.'},
  {name:'Decline Barbell Press',muscle:'Chest',type:'Compound',tip:'Targets lower chest. Keep glutes on bench.'},
  {name:'Cable Fly',muscle:'Chest',type:'Isolation',tip:'Constant tension. Slight bend in elbows.'},
  {name:'Pec Deck Machine',muscle:'Chest',type:'Isolation',tip:'Hold 1 sec at peak. Full stretch at open.'},
  {name:'Dumbbell Pullover',muscle:'Chest',type:'Isolation',tip:'Stretches chest and lat. Slight bend in elbows.'},
  {name:'Push-Up',muscle:'Chest',type:'Compound',tip:'Full ROM. Chest to floor. Explosive push.'},
  {name:'Deadlift',muscle:'Back',type:'Compound',tip:'Neutral spine. Bar close to shins. Drive through floor.'},
  {name:'Barbell Bent-Over Row',muscle:'Back',type:'Compound',tip:'Hinge at hips. Pull to lower chest. Overhand grip.'},
  {name:'Pull-Up',muscle:'Back',type:'Compound',tip:'Dead hang start. Chest to bar. Full ROM.'},
  {name:'Wide-Grip Lat Pulldown',muscle:'Back',type:'Compound',tip:'Pull to upper chest. Full stretch at top.'},
  {name:'Close-Grip Lat Pulldown',muscle:'Back',type:'Compound',tip:'Elbows drive to hips. Hits lower lats.'},
  {name:'Seated Cable Row',muscle:'Back',type:'Compound',tip:'Full stretch. Squeeze scapula. 2 sec hold.'},
  {name:'Single Arm Dumbbell Row',muscle:'Back',type:'Compound',tip:'Full ROM. Drive elbow to hip.'},
  {name:'Straight Arm Pulldown',muscle:'Back',type:'Isolation',tip:'Arms stay straight. Lat isolation.'},
  {name:'Face Pull',muscle:'Back',type:'Isolation',tip:'Pull to forehead. External rotation.'},
  {name:'T-Bar Row',muscle:'Back',type:'Compound',tip:'Chest supported or free-standing. Thickness builder.'},
  {name:'Rack Pull',muscle:'Back',type:'Compound',tip:'Partial ROM from knee height. Upper back thickness.'},
  {name:'Barbell Back Squat',muscle:'Legs',type:'Compound',tip:'Break parallel. Drive explosively. Knees track toes.'},
  {name:'Front Squat',muscle:'Legs',type:'Compound',tip:'Bar across front delts. More quad emphasis.'},
  {name:'Romanian Deadlift',muscle:'Legs',type:'Compound',tip:'Feel the hamstring stretch. Hip hinge pattern.'},
  {name:'Leg Press',muscle:'Legs',type:'Compound',tip:'High foot placement for more glute and hamstring.'},
  {name:'Hip Thrust',muscle:'Legs',type:'Compound',tip:'Drive hips explosively. Full extension at top.'},
  {name:'Bulgarian Split Squat',muscle:'Legs',type:'Compound',tip:'Rear foot elevated. Single leg power.'},
  {name:'Walking Lunge',muscle:'Legs',type:'Compound',tip:'Full stride. Drive knee forward. Torso upright.'},
  {name:'Sumo Deadlift',muscle:'Legs',type:'Compound',tip:'Wide stance. Toes out. More glute and inner thigh.'},
  {name:'Leg Extension',muscle:'Legs',type:'Isolation',tip:'Pause at top. Full ROM. Slow descent.'},
  {name:'Lying Leg Curl',muscle:'Legs',type:'Isolation',tip:'Full ROM. 2 sec hold. Point toes for more activation.'},
  {name:'Seated Leg Curl',muscle:'Legs',type:'Isolation',tip:'Seated version hits long head differently.'},
  {name:'Standing Calf Raise',muscle:'Legs',type:'Isolation',tip:'Full stretch at bottom. 4 sec hold at top.'},
  {name:'Seated Calf Raise',muscle:'Legs',type:'Isolation',tip:'Soleus emphasis. Different from standing.'},
  {name:'Glute Kickback Cable',muscle:'Legs',type:'Isolation',tip:'Full hip extension. Squeeze glute at top.'},
  {name:'Box Step-Up',muscle:'Legs',type:'Compound',tip:'Drive through heel. Single leg power.'},
  {name:'Overhead Press',muscle:'Shoulders',type:'Compound',tip:'Press from rack. Full lockout. Brace core.'},
  {name:'Dumbbell Push Press',muscle:'Shoulders',type:'Compound',tip:'Drive from legs. Explosive overhead.'},
  {name:'Arnold Press',muscle:'Shoulders',type:'Compound',tip:'Hits all 3 deltoid heads. Full rotation.'},
  {name:'Dumbbell Lateral Raise',muscle:'Shoulders',type:'Isolation',tip:'Lead with elbows. Slight forward lean.'},
  {name:'Cable Lateral Raise',muscle:'Shoulders',type:'Isolation',tip:'Constant tension vs dumbbell.'},
  {name:'Front Raise',muscle:'Shoulders',type:'Isolation',tip:'Alternate arms. Lead with pinky up.'},
  {name:'Rear Delt Fly',muscle:'Shoulders',type:'Isolation',tip:'Bend over 45 degrees. Lead with elbows.'},
  {name:'Upright Row',muscle:'Shoulders',type:'Compound',tip:'Pull to chin. Wide grip. Elbows flare out.'},
  {name:'Barbell Shrug',muscle:'Shoulders',type:'Isolation',tip:'2 sec hold at top. Straight up, no rolling.'},
  {name:'Barbell Curl',muscle:'Arms',type:'Isolation',tip:'Elbows fixed at sides. Full stretch.'},
  {name:'Dumbbell Curl',muscle:'Arms',type:'Isolation',tip:'Full supination at top. Full stretch at bottom.'},
  {name:'Hammer Curl',muscle:'Arms',type:'Isolation',tip:'Neutral grip. Brachialis and forearm thickness.'},
  {name:'Incline Dumbbell Curl',muscle:'Arms',type:'Isolation',tip:'Long head stretch. Arms hang fully at bottom.'},
  {name:'Preacher Curl',muscle:'Arms',type:'Isolation',tip:'Isolates bicep. Full stretch at bottom.'},
  {name:'Cable Curl',muscle:'Arms',type:'Isolation',tip:'Constant tension. Squeeze at top.'},
  {name:'Close-Grip Bench Press',muscle:'Arms',type:'Compound',tip:'Elbows tucked. Tricep mass builder.'},
  {name:'Skull Crusher',muscle:'Arms',type:'Isolation',tip:'Lower to forehead. Elbows narrow.'},
  {name:'Tricep Dips',muscle:'Arms',type:'Compound',tip:'Upright torso for tricep emphasis.'},
  {name:'Tricep Rope Pushdown',muscle:'Arms',type:'Isolation',tip:'Flare hands at bottom. Keep elbows pinned.'},
  {name:'Overhead Tricep Extension',muscle:'Arms',type:'Isolation',tip:'Long head stretch. Arms by ears.'},
  {name:'Pallof Press',muscle:'Core',type:'Athletic',tip:'Anti-rotation. Press out and hold 2 sec.'},
  {name:'Cable Woodchop',muscle:'Core',type:'Athletic',tip:'Rotational power. Mimics basketball drive.'},
  {name:'Ab Wheel Rollout',muscle:'Core',type:'Compound',tip:'Full extension. Pull back with abs.'},
  {name:'Hanging Leg Raise',muscle:'Core',type:'Isolation',tip:'Posterior pelvic tilt at top. No swinging.'},
  {name:'Cable Crunch',muscle:'Core',type:'Isolation',tip:'Pull with abs not arms. Round spine fully.'},
  {name:'Plank',muscle:'Core',type:'Compound',tip:'Squeeze everything. Neutral spine.'},
  {name:'Side Plank',muscle:'Core',type:'Compound',tip:'Hip up. Straight line head to feet.'},
  {name:'Dead Bug',muscle:'Core',type:'Compound',tip:'Lower back pressed to floor. Slow and controlled.'},
  {name:'Russian Twist',muscle:'Core',type:'Isolation',tip:'Lean back 45 degrees. Lead with ribs, rotate fully. Hold a plate to load it.'},
  {name:'Cable Woodchop (High-Low)',muscle:'Core',type:'Athletic',tip:'Rotational power for the drive and crossover. Pull stack hip-to-opposite-shoulder. Log the pin weight.'},
  {name:'Landmine Rotation',muscle:'Core',type:'Athletic',tip:'Explosive trunk rotation — direct carryover to shooting and passing force. Hips lead, arms follow.'},
  {name:'Pallof Press (Cable)',muscle:'Core',type:'Athletic',tip:'Anti-rotation. Resist the stack pulling you sideways. Press out, hold 2 sec. Builds the brace that protects the lower back.'},
  {name:'Cable Side Bend',muscle:'Core',type:'Isolation',tip:'Loaded lateral flexion for the obliques/sides. One side at a time, full stretch to full crunch.'},
  {name:'Suitcase Carry',muscle:'Core',type:'Athletic',tip:'Load one hand, walk tall, resist leaning. Hits obliques and deep core as anti-lateral-flexion.'},
  {name:'Hanging Knee Raise (Weighted)',muscle:'Core',type:'Isolation',tip:'Lower-ab focus. Posterior pelvic tilt to curl the hips up — do not just swing the knees. Hold a dumbbell between feet to load.'},
  {name:'Reverse Crunch',muscle:'Core',type:'Isolation',tip:'Targets the lower abs specifically. Curl hips off the floor, control the descent.'},
  {name:'Reverse Crunch',muscle:'Core',type:'Isolation',tip:'Posterior pelvic tilt. Bring hips off floor.'},
  // CHEST
  {name:'Dumbbell Fly',muscle:'Chest',type:'Isolation',tip:'Wide arc. Slight bend in elbows. Stretch at bottom.'},
  {name:'Landmine Press',muscle:'Chest',type:'Compound',tip:'Press at angle. Upper chest emphasis. Single or double arm.'},
  {name:'Machine Chest Press',muscle:'Chest',type:'Compound',tip:'Full ROM. Pause at contraction. Adjust seat for proper angle.'},
  {name:'Chest Dip',muscle:'Chest',type:'Compound',tip:'Lean forward for chest emphasis. Full depth.'},
  {name:'Cable Crossover',muscle:'Chest',type:'Isolation',tip:'Cross hands at bottom. Squeeze pecs hard.'},
  // BACK
  {name:'Meadows Row',muscle:'Back',type:'Compound',tip:'Single arm landmine row. Great for lats and upper back thickness.'},
  {name:'Chest Supported Row',muscle:'Chest',type:'Compound',tip:'Eliminates lower back strain. Pure upper back work.'},
  {name:'Cable Pullover',muscle:'Back',type:'Isolation',tip:'Arms straight. Pull from overhead to hips. Lat stretch.'},
  {name:'Inverted Row',muscle:'Back',type:'Compound',tip:'Body horizontal. Pull chest to bar. Bodyweight row.'},
  {name:'Seal Row',muscle:'Back',type:'Compound',tip:'Lying on elevated bench. Strict form, no body momentum.'},
  {name:'Dumbbell Shrug',muscle:'Shoulders',type:'Isolation',tip:'Hold at top 2 sec. No rolling — straight up.'},
  // LEGS
  {name:'Nordic Curl',muscle:'Legs',type:'Isolation',tip:'Eccentric hamstring. Lower slowly under control. Very advanced.'},
  {name:'Reverse Hack Squat',muscle:'Legs',type:'Compound',tip:'Face the machine. More glute and hamstring emphasis.'},
  {name:'Goblet Squat',muscle:'Legs',type:'Compound',tip:'Dumbbell at chest. Great for quad depth and posture.'},
  {name:'Step Up with Knee Drive',muscle:'Legs',type:'Power',tip:'Drive knee up at top. Single leg power and balance.'},
  {name:'Sissy Squat',muscle:'Legs',type:'Isolation',tip:'Extreme quad isolation. Control the descent.'},
  {name:'Glute Ham Raise',muscle:'Legs',type:'Compound',tip:'Hamstring and glute together. Full hip extension at top.'},
  {name:'Cable Kickback',muscle:'Legs',type:'Isolation',tip:'Full hip extension. Squeeze glute at top. Keep hips square.'},
  // SHOULDERS
  {name:'Cable Y-Raise',muscle:'Shoulders',type:'Isolation',tip:'Arms form Y shape. Targets lower traps and rear delts.'},
  {name:'Landmine Lateral Raise',muscle:'Shoulders',type:'Isolation',tip:'Arc motion with landmine. Constant tension on lateral delt.'},
  {name:'Machine Lateral Raise',muscle:'Shoulders',type:'Isolation',tip:'Constant tension. Adjust pad height to shoulder level.'},
  {name:'Plate Front Raise',muscle:'Shoulders',type:'Isolation',tip:'Hold plate with both hands. Raise to eye level. Control descent.'},
  {name:'Cable Face Pull',muscle:'Shoulders',type:'Isolation',tip:'Pull to forehead. External rotation. Rear delt and rotator cuff.'},
  // ARMS
  {name:'Spider Curl',muscle:'Arms',type:'Isolation',tip:'Lying on incline bench face down. Eliminates shoulder involvement.'},
  {name:'Concentration Curl',muscle:'Arms',type:'Isolation',tip:'Elbow on inner thigh. Full peak contraction. Slow descent.'},
  {name:'Cable Overhead Curl',muscle:'Arms',type:'Isolation',tip:'Arms extended overhead. Long head stretch. Unique angle.'},
  {name:'Reverse Curl',muscle:'Arms',type:'Isolation',tip:'Overhand grip. Brachialis and forearm emphasis.'},
  {name:'Tate Press',muscle:'Arms',type:'Isolation',tip:'Dumbbells touch chest. Flare elbows out. Tricep isolation.'},
  {name:'JM Press',muscle:'Arms',type:'Isolation',tip:'Bar to chin level. Hybrid of skull crusher and close-grip.'},
  {name:'Diamond Push-Up',muscle:'Arms',type:'Compound',tip:'Hands form diamond. Tricep emphasis. Keep elbows tight.'},
  {name:'Rope Hammer Curl',muscle:'Arms',type:'Isolation',tip:'Neutral grip on rope. Split at top for brachialis peak.'},
  // CORE
  {name:'Box Jump',muscle:'Plyo',type:'Athletic',tip:'Cardio-acceleration / explosive. Land soft, full hip extension. Step down, do not jump down. Vertical-jump carryover.'},
  {name:'Squat Jump',muscle:'Plyo',type:'Athletic',tip:'Cardio-acceleration. Explode up every rep, absorb the landing. Alactic power for fast breaks.'},
  {name:'Lateral Bound',muscle:'Plyo',type:'Athletic',tip:'Cardio-acceleration. Side-to-side power — mirrors defensive slides and crossovers. Stick each landing.'},
  {name:'Medicine Ball Slam',muscle:'Plyo',type:'Athletic',tip:'Cardio-acceleration. Full-body, core-driven. Slam hard, reset fast.'},
  {name:'Jump Rope',muscle:'Plyo',type:'Athletic',tip:'Cardio-acceleration default. Light, fast, continuous. Easiest minute-filler between sets.'},
  {name:'Mountain Climber',muscle:'Plyo',type:'Athletic',tip:'Cardio-acceleration. Drive knees fast, hips low, core tight.'},
  {name:'Skater Hops',muscle:'Plyo',type:'Athletic',tip:'Cardio-acceleration. Lateral single-leg bounds for change-of-direction strength.'},
  {name:'Depth Jump',muscle:'Plyo',type:'Athletic',tip:'Advanced reactive plyo. Step off box, land and immediately explode up. Minimize ground contact.'},
  {name:'Dragon Flag',muscle:'Core',type:'Compound',tip:'Full body lever. Lower under control. Advanced movement.'},
  {name:'Hollow Body Hold',muscle:'Core',type:'Compound',tip:'Lower back pressed down. Arms and legs extended. Full tension.'},
  {name:'L-Sit',muscle:'Core',type:'Compound',tip:'Legs parallel to floor. Hold position. Extreme core strength.'},
  {name:'Weighted Sit-Up',muscle:'Core',type:'Isolation',tip:'Hold plate on chest. Full ROM. Control descent.'},
  {name:'Cable Oblique Crunch',muscle:'Core',type:'Isolation',tip:'Side bend toward cable. Oblique isolation.'},
  {name:'Landmine Rotation',muscle:'Core',type:'Athletic',tip:'Rotational power. Arc plate from hip to hip. Core and shoulders.'},
  // CARDIO & CONDITIONING
  {name:'Sled Push',muscle:'Legs',type:'Cardio',tip:'Drive through legs. Stay low. Explosive power endurance.'},
  {name:'Assault Bike',muscle:'Chest',type:'Cardio',tip:'Full body conditioning. Arms and legs. Max effort intervals.'},
  {name:'Jump Rope',muscle:'Legs',type:'Cardio',tip:'Wrist rotation only. Land softly on balls of feet.'},
  {name:'Kettlebell Swing',muscle:'Legs',type:'Power',tip:'Hip hinge drive. Explosive glute contraction. Bell to shoulder height.'},
  {name:'Med Ball Slam',muscle:'Core',type:'Power',tip:'Full overhead extension. Slam with force. Core and shoulders.'},
  {name:'Box Jump',muscle:'Legs',type:'Power',tip:'Full hip extension at top. Land soft. Step down — never jump down.'},
  {name:'Burpee',muscle:'Chest',type:'Cardio',tip:'Full body. Chest to floor. Explosive jump at top.'},
  {name:'Mountain Climber',muscle:'Core',type:'Cardio',tip:'Hips level. Drive knees to chest alternating. Fast pace.'},
  {name:'Jump Squat',muscle:'Legs',type:'Power',tip:'Squat then explode up. Land soft with knees bent.'},
  {name:'Rowing Machine',muscle:'Back',type:'Cardio',tip:'Drive with legs first. Pull handle to lower chest. Full extension.'}
];

// ════════════════════════════════
// LIBRARY
// ════════════════════════════════
function uniqMuscles(){var seen={},out=['All'];for(var i=0;i<LIB.length;i++){if(!seen[LIB[i].muscle]){seen[LIB[i].muscle]=1;out.push(LIB[i].muscle);}}return out;}
function renderLib(){var muscles=uniqMuscles();var mf=el('mfilt');mf.innerHTML='';for(var i=0;i<muscles.length;i++){var m=muscles[i];var c=document.createElement('div');c.className='mc'+(m===aMuscle?' active':'');c.textContent=m;(function(mu){c.onclick=function(){aMuscle=mu;renderLib();};})(m);mf.appendChild(c);}filtLib();}
function filtLib(){var inp=el('srchi');var q=inp?inp.value.toLowerCase():'';var list=el('llist');list.innerHTML='';var out=[];for(var i=0;i<LIB.length;i++){var ex=LIB[i];var mm=aMuscle==='All'||ex.muscle===aMuscle;var ms=ex.name.toLowerCase().indexOf(q)>=0||ex.muscle.toLowerCase().indexOf(q)>=0;if(mm&&ms)out.push(ex);}if(!out.length){list.innerHTML='<div class="es"><div class="ei">NO RESULTS</div></div>';return;}for(var i=0;i<out.length;i++){var ex=out[i];var item=document.createElement('div');item.className='lbi';item.innerHTML='<div style="flex:1;"><div class="lbn">'+ex.name+'</div><div class="lbm">'+ex.type.toUpperCase()+' — '+ex.tip+'</div></div><div class="lbmu">'+ex.muscle.toUpperCase()+'</div>';list.appendChild(item);}}

// ════════════════════════════════
// EXERCISE SUBSTITUTIONS
// ════════════════════════════════
// Substitution map — keyed by exercise name, value is array of alternatives
var SUB_MAP = {
  'Barbell Bench Press':['Dumbbell Bench Press','Incline Dumbbell Press','Cable Fly','Push-Up','Pec Deck Machine'],
  'Incline Dumbbell Press':['Barbell Bench Press','Cable Fly','Incline Barbell Press','Push-Up'],
  'Cable Fly':['Pec Deck Machine','Dumbbell Fly','Incline Dumbbell Press','Dumbbell Pullover'],
  'Bent-Over Dumbbell Row':['Cable Seated Row','T-Bar Row','Single Arm Dumbbell Row','Barbell Bent-Over Row','Wide-Grip Lat Pulldown'],
  'Wide-Grip Lat Pulldown':['Pull-Up','Close-Grip Lat Pulldown','Cable Seated Row','Straight Arm Pulldown'],
  'Cable Seated Row':['Bent-Over Dumbbell Row','Single Arm Dumbbell Row','T-Bar Row','Wide-Grip Lat Pulldown'],
  'Single Arm Dumbbell Row':['Cable Seated Row','Bent-Over Dumbbell Row','T-Bar Row'],
  'Dumbbell Push Press':['Barbell Overhead Press','Arnold Press','Seated Dumbbell Press'],
  'Barbell Overhead Press':['Dumbbell Push Press','Arnold Press','Cable Lateral Raise'],
  'Dumbbell Lateral Raise':['Cable Lateral Raise','Upright Row','Front Raise'],
  'Barbell Back Squat':['Front Squat','Hack Squat Smith Machine','Leg Press','Bulgarian Split Squat'],
  'Romanian Deadlift':['Lying Leg Curl','Seated Leg Curl','Cable Pull-Through','Sumo Deadlift'],
  'Leg Press':['Barbell Back Squat','Hack Squat Smith Machine','Bulgarian Split Squat'],
  'Bulgarian Split Squat':['Walking Lunges','Leg Press','Barbell Back Squat','Reverse Lunge Knee Drive'],
  'Leg Extension':['Hack Squat Smith Machine','Barbell Back Squat'],
  'Lying Leg Curl':['Seated Leg Curl','Romanian Deadlift','Cable Pull-Through'],
  'Seated Leg Curl':['Lying Leg Curl','Romanian Deadlift'],
  'Hip Thrust Smith Machine':['Glute Kickback Cable','Cable Pull-Through','Romanian Deadlift'],
  'EZ Bar Curl':['Barbell Curl','Dumbbell Curl','Preacher Curl','Cable Curl'],
  'Barbell Curl':['EZ Bar Curl','Dumbbell Curl','Hammer Curl','Cable Curl'],
  'Dumbbell Curl':['Barbell Curl','EZ Bar Curl','Incline Dumbbell Curl','Cable Curl'],
  'Incline Dumbbell Curl':['Dumbbell Curl','Preacher Curl','Cable Curl'],
  'Hammer Curl':['Dumbbell Curl','Cable Curl','Barbell Curl'],
  'Weighted Tricep Dips':['Close-Grip Bench Press','Tricep Rope Pushdown','Overhead Tricep Extension','Skull Crusher'],
  'Tricep Rope Pushdown':['Skull Crusher','Close-Grip Bench Press','Overhead Tricep Extension','Weighted Tricep Dips'],
  'Overhead Tricep Extension':['Skull Crusher','Tricep Rope Pushdown','Close-Grip Bench Press'],
  'Rear Delt Cable Fly':['Face Pulls','Rear Delt Fly','Upright Row'],
  'Face Pulls':['Rear Delt Cable Fly','Rear Delt Fly'],
  'Walking Lunges':['Bulgarian Split Squat','Leg Press','Reverse Lunge Knee Drive'],
  'Hack Squat Smith Machine':['Barbell Back Squat','Leg Press','Front Squat'],
  'Standing Calf Raise':['Seated Calf Raise'],
  'Seated Calf Raise':['Standing Calf Raise'],
  'Glute Kickback Cable':['Hip Thrust Smith Machine','Cable Pull-Through'],
  'Cable Pull-Through':['Romanian Deadlift','Glute Kickback Cable','Hip Thrust Smith Machine'],
  'Dumbbell Squat to Press':['Barbell Back Squat','Dumbbell Push Press'],
  'Pallof Press':['Cable Woodchop','Dead Bug'],
  'Cable Woodchop High-Low':['Pallof Press','Russian Twist'],
  'Box Step-Up':['Bulgarian Split Squat','Walking Lunges'],
  'Dumbbell Squat to Press':['Barbell Back Squat','Dumbbell Push Press'],
  'Single Arm Dumbbell Row':['Cable Seated Row','Bent-Over Dumbbell Row','T-Bar Row']
};

var pendingSubExName = null;

function openSubstitute(exName){
  pendingSubExName = exName;
  el('sub-ex-title').textContent='SUBSTITUTE: '+exName.toUpperCase();
  var subs = SUB_MAP[exName] || [];
  var list = el('sub-ex-list');
  list.innerHTML='';
  if(!subs.length){
    list.innerHTML='<div class="es"><div class="ei">NO SUBSTITUTES</div><div class="esb">No mapped substitutes for this exercise.</div></div>';
    el('sub-ex-mo').classList.add('visible');
    return;
  }
  // Find muscle group from LIB
  var muscle='';
  for(var i=0;i<LIB.length;i++){if(LIB[i].name===exName){muscle=LIB[i].muscle;break;}}
  el('sub-ex-muscle').textContent=muscle?'MUSCLE GROUP: '+muscle.toUpperCase():'';
  for(var i=0;i<subs.length;i++){
    var subName=subs[i];
    var tip='';
    for(var j=0;j<LIB.length;j++){if(LIB[j].name===subName){tip=LIB[j].tip;break;}}
    var item=document.createElement('div');
    item.className='sub-ex-item';
    item.innerHTML='<div style="flex:1;"><div class="sub-ex-name">'+subName+'</div><div class="sub-ex-type">'+tip+'</div></div><div style="color:var(--hl);font-family:Orbitron,sans-serif;font-size:8px;">SWAP</div>';
    (function(name){item.onclick=function(){doSubstitute(name);};})(subName);
    list.appendChild(item);
  }
  el('sub-ex-mo').classList.add('visible');
}

function doSubstitute(newName){
  if(!pendingSubExName)return;
  if(newName===pendingSubExName){pendingSubExName=null;closeModal('sub-ex-mo');return;}
  if(S.sets[newName]){showToast('ALREADY IN THIS WORKOUT');return;}
  var day=S.activeDay;var wd=getWeekData();
  for(var i=0;i<day.ex.length;i++){
    if(day.ex[i].name===pendingSubExName){
      var oldEx=day.ex[i];
      var oldSets=S.sets[pendingSubExName]||[];
      var doneSets=[];
      for(var j=0;j<oldSets.length;j++){if(oldSets[j].done)doneSets.push(oldSets[j]);}
      var libEx=null;
      for(var j=0;j<LIB.length;j++){if(LIB[j].name===newName){libEx=LIB[j];break;}}
      // Build the incoming exercise with its own identity
      var newEx=JSON.parse(JSON.stringify(oldEx));
      newEx.name=newName;
      newEx.notes=libEx?(libEx.tip||''):'';
      if(libEx)newEx.type=libEx.type;
      if(newEx.type==='Core'){var ncf=coreFlags(newName);newEx.loaded=ncf.loaded;newEx.timed=ncf.timed;}
      else{delete newEx.loaded;delete newEx.timed;}
      // Fresh prescription: the NEW exercise's own e1RM history scaled to
      // this phase — never the old exercise's loaded weights
      // Keep the slot's own rep range across a substitution — swapping the
      // movement should not silently change the prescription.
      // newEx is a deep copy of the slot being replaced, so it already carries
      // that slot's repMin/repMax when the program defines one.
      var dr=resolveReps(newEx,wd).min;
      var tw=getTargetWeight(newName,wd);
      var dw=tw!==null?tw:'';
      var nSets=oldEx.ds||oldSets.length||3;
      var arr=[];
      for(var j=0;j<nSets;j++)arr.push({weight:dw,reps:dr,done:false,warmup:false,rpe:0});
      if(doneSets.length){
        // Sets you actually performed stay logged under the exercise you
        // performed them on — old exercise stays in the day, trimmed to
        // its completed work, new exercise slots in right after it
        S.sets[pendingSubExName]=doneSets;
        oldEx.ds=doneSets.length;
        day.ex.splice(i+1,0,newEx);
      }else{
        day.ex[i]=newEx;
        delete S.sets[pendingSubExName];
      }
      S.sets[newName]=arr;
      break;
    }
  }
  pendingSubExName=null;
  closeModal('sub-ex-mo');
  renderActive();saveActive();
  showToast('EXERCISE SWAPPED');
}
