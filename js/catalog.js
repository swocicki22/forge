// ════════════════════════════════
// EXERCISE CATALOG
//
// What the exercise picker offers, by muscle group and equipment.
//
// Names are not cosmetic. A lift's history, prefilled weights and records are
// all found by name + equipment (see liftKey), so every entry below uses the
// exact name already in the training log where one exists — "Smith Bench
// Press", "Leg Press", "Hack Squat Smith Machine" — or picking it would start
// a brand-new record line with no history behind it.
//
// Fields: n name · m muscle group · e equipment · t type · s seconds (timed)
//         c cardio (logged as minutes / miles / calories) · min default minutes
//   e: smith | barbell | dumbbell | cable | machine | bw
//   t: Compound | Isolation | Power | Core | Conditioning | Cardio
// ════════════════════════════════

var CAT_MUSCLES=['Chest','Back','Shoulders','Biceps','Triceps','Quads','Hamstrings',
                 'Glutes','Calves','Core','Power','Conditioning','Cardio'];
// Equipment filter. "Free weights" is barbell + dumbbell together.
var CAT_EQUIP=[['all','All equipment'],['smith','Smith machine'],['free','Free weights'],
               ['cable','Cable'],['machine','Machine'],['bw','Bodyweight']];
var CAT_EQUIP_LABEL={smith:'Smith',barbell:'Barbell',dumbbell:'Dumbbell',cable:'Cable',machine:'Machine',bw:'Bodyweight'};

var CATALOG=[
  // ── Chest
  {n:'Smith Bench Press',m:'Chest',e:'smith',t:'Compound'},
  {n:'Smith Incline Press',m:'Chest',e:'smith',t:'Compound'},
  {n:'Smith Decline Press',m:'Chest',e:'smith',t:'Compound'},
  {n:'Barbell Bench Press',m:'Chest',e:'barbell',t:'Compound'},
  {n:'Incline Barbell Press',m:'Chest',e:'barbell',t:'Compound'},
  {n:'Dumbbell Bench Press',m:'Chest',e:'dumbbell',t:'Compound'},
  {n:'Incline Dumbbell Press',m:'Chest',e:'dumbbell',t:'Compound'},
  {n:'Dumbbell Fly',m:'Chest',e:'dumbbell',t:'Isolation'},
  {n:'Incline Dumbbell Fly',m:'Chest',e:'dumbbell',t:'Isolation'},
  {n:'Dumbbell Pullover',m:'Chest',e:'dumbbell',t:'Isolation'},
  {n:'Cable Fly',m:'Chest',e:'cable',t:'Isolation'},
  {n:'Low-to-High Cable Fly',m:'Chest',e:'cable',t:'Isolation'},
  {n:'High-to-Low Cable Fly',m:'Chest',e:'cable',t:'Isolation'},
  {n:'Cable Chest Press',m:'Chest',e:'cable',t:'Compound'},
  {n:'Machine Chest Press',m:'Chest',e:'machine',t:'Compound'},
  {n:'Pec Deck Machine',m:'Chest',e:'machine',t:'Isolation'},
  {n:'Push-Up',m:'Chest',e:'bw',t:'Compound'},
  {n:'Chest Dip',m:'Chest',e:'bw',t:'Compound'},

  // ── Back
  {n:'Smith Bent-Over Row',m:'Back',e:'smith',t:'Compound'},
  {n:'Smith Shrug',m:'Back',e:'smith',t:'Isolation'},
  {n:'Deadlift',m:'Back',e:'barbell',t:'Compound'},
  {n:'Barbell Bent-Over Row',m:'Back',e:'barbell',t:'Compound'},
  {n:'Rack Pull',m:'Back',e:'barbell',t:'Compound'},
  {n:'Barbell Shrug',m:'Back',e:'barbell',t:'Isolation'},
  {n:'Bent-Over Dumbbell Row',m:'Back',e:'dumbbell',t:'Compound'},
  {n:'Single Arm Dumbbell Row',m:'Back',e:'dumbbell',t:'Compound'},
  {n:'Chest-Supported Dumbbell Row',m:'Back',e:'dumbbell',t:'Compound'},
  {n:'Dumbbell Shrug',m:'Back',e:'dumbbell',t:'Isolation'},
  {n:'Wide-Grip Lat Pulldown',m:'Back',e:'cable',t:'Compound'},
  {n:'Close-Grip Lat Pulldown',m:'Back',e:'cable',t:'Compound'},
  {n:'Seated Cable Row',m:'Back',e:'cable',t:'Compound'},
  {n:'Single Arm Cable Row',m:'Back',e:'cable',t:'Compound'},
  {n:'Straight Arm Pulldown',m:'Back',e:'cable',t:'Isolation'},
  {n:'Cable Pullover',m:'Back',e:'cable',t:'Isolation'},
  {n:'T-Bar Row',m:'Back',e:'machine',t:'Compound'},
  {n:'Chest-Supported Row',m:'Back',e:'machine',t:'Compound'},
  {n:'Assisted Pull-Up',m:'Back',e:'machine',t:'Compound'},
  {n:'Pull-Up',m:'Back',e:'bw',t:'Compound'},
  {n:'Chin-Up',m:'Back',e:'bw',t:'Compound'},
  {n:'Weighted Pull-Up',m:'Back',e:'bw',t:'Compound'},
  {n:'Inverted Row',m:'Back',e:'bw',t:'Compound'},

  // ── Shoulders
  {n:'Smith Overhead Press',m:'Shoulders',e:'smith',t:'Compound'},
  {n:'Barbell Overhead Press',m:'Shoulders',e:'barbell',t:'Compound'},
  {n:'Upright Row',m:'Shoulders',e:'barbell',t:'Compound'},
  {n:'Seated Dumbbell Press',m:'Shoulders',e:'dumbbell',t:'Compound'},
  {n:'Arnold Press',m:'Shoulders',e:'dumbbell',t:'Compound'},
  {n:'Dumbbell Push Press',m:'Shoulders',e:'dumbbell',t:'Power'},
  {n:'Dumbbell Lateral Raise',m:'Shoulders',e:'dumbbell',t:'Isolation'},
  {n:'Dumbbell Front Raise',m:'Shoulders',e:'dumbbell',t:'Isolation'},
  {n:'Rear Delt Dumbbell Fly',m:'Shoulders',e:'dumbbell',t:'Isolation'},
  {n:'Cable Shoulder Press',m:'Shoulders',e:'cable',t:'Compound'},
  {n:'Cable Lateral Raise',m:'Shoulders',e:'cable',t:'Isolation'},
  {n:'Rear Delt Cable Fly',m:'Shoulders',e:'cable',t:'Isolation'},
  {n:'Face Pulls',m:'Shoulders',e:'cable',t:'Isolation'},
  {n:'Cable Y-Raise',m:'Shoulders',e:'cable',t:'Isolation'},
  {n:'Machine Shoulder Press',m:'Shoulders',e:'machine',t:'Compound'},
  {n:'Machine Lateral Raise',m:'Shoulders',e:'machine',t:'Isolation'},
  {n:'Reverse Pec Deck',m:'Shoulders',e:'machine',t:'Isolation'},

  // ── Biceps
  {n:'EZ Bar Curl',m:'Biceps',e:'cable',t:'Isolation'},
  {n:'Cable Curl',m:'Biceps',e:'cable',t:'Isolation'},
  {n:'Rope Hammer Curl',m:'Biceps',e:'cable',t:'Isolation'},
  {n:'Cable Overhead Curl',m:'Biceps',e:'cable',t:'Isolation'},
  {n:'Barbell Curl',m:'Biceps',e:'barbell',t:'Isolation'},
  {n:'EZ Bar Preacher Curl',m:'Biceps',e:'barbell',t:'Isolation'},
  {n:'Dumbbell Curl',m:'Biceps',e:'dumbbell',t:'Isolation'},
  {n:'Hammer Curl',m:'Biceps',e:'dumbbell',t:'Isolation'},
  {n:'Incline Dumbbell Curl',m:'Biceps',e:'dumbbell',t:'Isolation'},
  {n:'Concentration Curl',m:'Biceps',e:'dumbbell',t:'Isolation'},
  {n:'Machine Preacher Curl',m:'Biceps',e:'machine',t:'Isolation'},

  // ── Triceps
  {n:'Tricep Rope Pushdown',m:'Triceps',e:'cable',t:'Isolation'},
  {n:'Straight Bar Pushdown',m:'Triceps',e:'cable',t:'Isolation'},
  {n:'Skull Crusher',m:'Triceps',e:'cable',t:'Isolation'},
  {n:'Cable Overhead Tricep Extension',m:'Triceps',e:'cable',t:'Isolation'},
  {n:'Dumbbell Overhead Tricep Extension',m:'Triceps',e:'dumbbell',t:'Isolation'},
  {n:'Dumbbell Skull Crusher',m:'Triceps',e:'dumbbell',t:'Isolation'},
  {n:'Dumbbell Kickback',m:'Triceps',e:'dumbbell',t:'Isolation'},
  {n:'EZ Bar Overhead Tricep Extension',m:'Triceps',e:'barbell',t:'Isolation'},
  {n:'Close-Grip Bench Press',m:'Triceps',e:'barbell',t:'Compound'},
  {n:'Smith Close-Grip Bench',m:'Triceps',e:'smith',t:'Compound'},
  {n:'Machine Tricep Extension',m:'Triceps',e:'machine',t:'Isolation'},
  {n:'Weighted Tricep Dips',m:'Triceps',e:'bw',t:'Compound'},
  {n:'Diamond Push-Up',m:'Triceps',e:'bw',t:'Compound'},

  // ── Quads
  {n:'Smith Back Squat',m:'Quads',e:'smith',t:'Compound'},
  {n:'Smith Front Squat',m:'Quads',e:'smith',t:'Compound'},
  {n:'Hack Squat Smith Machine',m:'Quads',e:'smith',t:'Compound'},
  {n:'Smith Split Squat',m:'Quads',e:'smith',t:'Compound'},
  {n:'Barbell Back Squat',m:'Quads',e:'barbell',t:'Compound'},
  {n:'Front Squat',m:'Quads',e:'barbell',t:'Compound'},
  {n:'Goblet Squat',m:'Quads',e:'dumbbell',t:'Compound'},
  {n:'Bulgarian Split Squat',m:'Quads',e:'dumbbell',t:'Compound'},
  {n:'Walking Lunge',m:'Quads',e:'dumbbell',t:'Compound'},
  {n:'Box Step-Up',m:'Quads',e:'dumbbell',t:'Compound'},
  {n:'Leg Press',m:'Quads',e:'machine',t:'Compound'},
  {n:'Single Leg Press',m:'Quads',e:'machine',t:'Compound'},
  {n:'Hack Squat Machine',m:'Quads',e:'machine',t:'Compound'},
  {n:'Leg Extension',m:'Quads',e:'machine',t:'Isolation'},

  // ── Hamstrings
  {n:'Smith Romanian Deadlift',m:'Hamstrings',e:'smith',t:'Compound'},
  {n:'Smith Good Morning',m:'Hamstrings',e:'smith',t:'Compound'},
  {n:'Barbell Romanian Deadlift',m:'Hamstrings',e:'barbell',t:'Compound'},
  {n:'Dumbbell Romanian Deadlift',m:'Hamstrings',e:'dumbbell',t:'Compound'},
  {n:'Lying Leg Curl',m:'Hamstrings',e:'machine',t:'Isolation'},
  {n:'Seated Leg Curl',m:'Hamstrings',e:'machine',t:'Isolation'},
  {n:'Cable Leg Curl',m:'Hamstrings',e:'cable',t:'Isolation'},
  {n:'Nordic Curl',m:'Hamstrings',e:'bw',t:'Isolation'},

  // ── Glutes
  {n:'Hip Thrust Smith Machine',m:'Glutes',e:'smith',t:'Compound'},
  {n:'Barbell Hip Thrust',m:'Glutes',e:'barbell',t:'Compound'},
  {n:'Cable Pull-Through',m:'Glutes',e:'cable',t:'Compound'},
  {n:'Glute Kickback Cable',m:'Glutes',e:'cable',t:'Isolation'},
  {n:'Hip Abduction Machine',m:'Glutes',e:'machine',t:'Isolation'},
  {n:'Glute Bridge',m:'Glutes',e:'bw',t:'Isolation'},
  {n:'Reverse Lunge Knee Drive',m:'Glutes',e:'bw',t:'Compound'},

  // ── Calves
  {n:'Standing Calf Raise',m:'Calves',e:'machine',t:'Isolation'},
  {n:'Seated Calf Raise',m:'Calves',e:'machine',t:'Isolation'},
  {n:'Leg Press Calf Raise',m:'Calves',e:'machine',t:'Isolation'},
  {n:'Smith Calf Raise',m:'Calves',e:'smith',t:'Isolation'},
  {n:'Single Leg Dumbbell Calf Raise',m:'Calves',e:'dumbbell',t:'Isolation'},

  // ── Core
  {n:'Cable Crunch',m:'Core',e:'cable',t:'Core'},
  {n:'Cable Woodchop High-Low',m:'Core',e:'cable',t:'Core'},
  {n:'Pallof Press',m:'Core',e:'cable',t:'Core'},
  {n:'Cable Oblique Crunch',m:'Core',e:'cable',t:'Core'},
  {n:'Ab Crunch Machine',m:'Core',e:'machine',t:'Core'},
  {n:'Suitcase Carry',m:'Core',e:'dumbbell',t:'Core',s:40},
  {n:'Hanging Leg Raise',m:'Core',e:'bw',t:'Core'},
  {n:'Decline Sit-Up',m:'Core',e:'bw',t:'Core'},
  {n:'Russian Twist',m:'Core',e:'bw',t:'Core'},
  {n:'Ab Wheel Rollout',m:'Core',e:'bw',t:'Core'},
  {n:'Reverse Crunch',m:'Core',e:'bw',t:'Core'},
  {n:'Dead Bug',m:'Core',e:'bw',t:'Core'},
  {n:'Plank',m:'Core',e:'bw',t:'Core',s:45},
  {n:'Side Plank',m:'Core',e:'bw',t:'Core',s:30},
  {n:'Hollow Body Hold',m:'Core',e:'bw',t:'Core',s:30},

  // ── Power (never to failure; full rest)
  {n:'Vertical Jump',m:'Power',e:'bw',t:'Power'},
  {n:'Broad Jump',m:'Power',e:'bw',t:'Power'},
  {n:'Box Jump',m:'Power',e:'bw',t:'Power'},
  {n:'Depth Jump',m:'Power',e:'bw',t:'Power'},
  {n:'Lateral Bound',m:'Power',e:'bw',t:'Power'},
  {n:'Plyo Push-Up',m:'Power',e:'bw',t:'Power'},
  {n:'Medicine Ball Chest Throw',m:'Power',e:'bw',t:'Power'},
  {n:'Medicine Ball Slam',m:'Power',e:'bw',t:'Power'},
  {n:'Dumbbell Jump Squat',m:'Power',e:'dumbbell',t:'Power'},
  {n:'Kettlebell Swing',m:'Power',e:'dumbbell',t:'Power'},
  {n:'Smith Speed Squat',m:'Power',e:'smith',t:'Power'},
  {n:'Smith Speed Bench',m:'Power',e:'smith',t:'Power'},
  {n:'Explosive Lat Pulldown',m:'Power',e:'cable',t:'Power'},
  {n:'Explosive Leg Press',m:'Power',e:'machine',t:'Power'},
  {n:'Dumbbell Squat to Press',m:'Power',e:'dumbbell',t:'Power'},

  // ── Conditioning (timed)
  {n:'Jump Rope',m:'Conditioning',e:'bw',t:'Conditioning',s:300},
  {n:'Mountain Climber',m:'Conditioning',e:'bw',t:'Conditioning',s:30},
  {n:'Burpee',m:'Conditioning',e:'bw',t:'Conditioning',s:30},
  {n:'Battle Rope Slams',m:'Conditioning',e:'bw',t:'Conditioning',s:30},
  {n:"Farmer's Carry",m:'Conditioning',e:'dumbbell',t:'Conditioning',s:45},
  {n:'Incline Treadmill Sprint',m:'Conditioning',e:'machine',t:'Conditioning',s:20},
  {n:'Stairmaster Intervals',m:'Conditioning',e:'machine',t:'Conditioning',s:900},

  // ── Cardio (steady state: minutes, distance, calories)
  {n:'Incline Treadmill Walk',m:'Cardio',e:'machine',t:'Cardio',c:1,min:30},
  {n:'Treadmill Walk',m:'Cardio',e:'machine',t:'Cardio',c:1,min:30},
  {n:'Treadmill Run',m:'Cardio',e:'machine',t:'Cardio',c:1,min:20},
  {n:'Stairmaster',m:'Cardio',e:'machine',t:'Cardio',c:1,min:20},
  {n:'Stationary Bike',m:'Cardio',e:'machine',t:'Cardio',c:1,min:30},
  {n:'Recumbent Bike',m:'Cardio',e:'machine',t:'Cardio',c:1,min:30},
  {n:'Elliptical',m:'Cardio',e:'machine',t:'Cardio',c:1,min:30},
  {n:'Arc Trainer',m:'Cardio',e:'machine',t:'Cardio',c:1,min:30},
  {n:'Rowing Machine',m:'Cardio',e:'machine',t:'Cardio',c:1,min:15},
  {n:'Assault Bike',m:'Cardio',e:'machine',t:'Cardio',c:1,min:15},
  {n:'Outdoor Walk',m:'Cardio',e:'bw',t:'Cardio',c:1,min:30},
  {n:'Outdoor Run',m:'Cardio',e:'bw',t:'Cardio',c:1,min:30},
  {n:'Hike',m:'Cardio',e:'bw',t:'Cardio',c:1,min:60},
  {n:'Cycling',m:'Cardio',e:'bw',t:'Cardio',c:1,min:45},
  {n:'Swimming',m:'Cardio',e:'bw',t:'Cardio',c:1,min:30},
  {n:'Pickup Basketball',m:'Cardio',e:'bw',t:'Cardio',c:1,min:60}
];

// Sensible starting sets/reps for a newly added exercise, by type.
var CAT_DEFAULTS={Power:{sets:4,reps:[3,3]},Compound:{sets:4,reps:[6,8]},
                  Isolation:{sets:3,reps:[10,12]},Core:{sets:3,reps:[12,15]},
                  Conditioning:{sets:1,reps:[1,1]},Cardio:{sets:1,reps:[30,30]}};

function catFind(name){
  for(var i=0;i<CATALOG.length;i++){if(CATALOG[i].n===name)return CATALOG[i];}
  return null;
}
function catEquipMatch(e,filter){
  if(!filter||filter==='all')return true;
  if(filter==='free')return e==='barbell'||e==='dumbbell';
  return e===filter;
}
function catFilter(muscle,equip){
  var out=[];
  for(var i=0;i<CATALOG.length;i++){
    var c=CATALOG[i];
    if(muscle&&muscle!=='all'&&c.m!==muscle)continue;
    if(!catEquipMatch(c.e,equip))continue;
    out.push(c);
  }
  return out;
}
// Your record for this exact lift, if you have one.
function catRecord(c){
  if(typeof liftKey!=='function'||!S||!S.prs)return null;
  return S.prs[liftKey(c.n,c.e).key]||null;
}
