// ════════════════════════════════
// DIET PLAN — AGGRESSIVE CUT
// ════════════════════════════════
var CUT_MEALS=[
  {id:'m1', time:'12:00 PM', name:'Break Fast — Protein Bowl',      p:50,c:30,f:10, desc:'6 egg whites + 2 whole eggs scrambled, 1 cup greek yogurt, berries'},
  {id:'m2', time:'2:30 PM',  name:'Pre-Workout Meal',               p:40,c:50,f:8,  desc:'Chicken breast 6oz, 1 cup white rice, handful of spinach'},
  {id:'m3', time:'POST',     name:'Post-Workout Shake',             p:45,c:25,f:3,  desc:'2 scoops whey protein, 1 banana, water — within 30min of training'},
  {id:'m4', time:'7:00 PM',  name:'Final Meal — Protein + Fats',    p:50,c:15,f:20, desc:'Salmon 6oz or lean beef 6oz, large salad, olive oil dressing, avocado'},
];

var HUEL_OPTS=[
  {name:'Breakfast \u2014 Huel Black RTD',
   desc:'1 bottle Huel Black Edition Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster',
   p:35,c:29,f:16},
  {name:'Breakfast \u2014 Huel RTD',
   desc:'1 bottle Huel Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster\nLower protein than Black \u2014 expect to run under target today',
   p:21,c:39,f:18}
];

// Single source of truth for "which plan am I looking at".
// A generated plan replaces the static one wholesale, so the Huel breakfast
// options are grafted on here rather than baked into the static data only —
// otherwise anyone with a custom plan never sees them.
function getPlanDays(){
  var days=(S.bio&&S.bio.generatedPlan&&S.bio.generatedPlan.days)?S.bio.generatedPlan.days:WEEK_MEAL_PLAN;
  if(!days||!days.length)return WEEK_MEAL_PLAN;
  for(var i=0;i<days.length;i++){
    var d=days[i];
    if(!d||!d.meals||!d.meals.length)continue;
    var m=d.meals[0];
    if(!m||(m.opts&&m.opts.length))continue;
    m.opts=[HUEL_OPTS[0],HUEL_OPTS[1],
            {name:m.name,desc:m.desc,p:m.p||0,c:m.c||0,f:m.f||0}];
  }
  return days;
}

// A meal may carry `opts`: interchangeable versions of the same slot.
// The chosen index is remembered per plan-day so it sticks between sessions.
function mealOptIdx(dayIdx,mealIdx){
  var m=S.bio.mealOpt;
  if(!m)return 0;
  var v=m[dayIdx+'_'+mealIdx];
  return (typeof v==='number')?v:0;
}
function setMealOpt(dayIdx,mealIdx,optIdx){
  if(!S.bio)S.bio={};
  if(!S.bio.mealOpt)S.bio.mealOpt={};
  S.bio.mealOpt[dayIdx+'_'+mealIdx]=optIdx;
  saveState();
}
// Resolve a meal to the version actually being eaten.
function mealVariant(meal,dayIdx,mealIdx){
  if(!meal||!meal.opts||!meal.opts.length)return meal;
  var o=meal.opts[mealOptIdx(dayIdx,mealIdx)]||meal.opts[0];
  return {time:meal.time,name:o.name,desc:o.desc,p:o.p,c:o.c,f:o.f,opts:meal.opts};
}
// Day totals computed from the selected variants, not the stored header
// numbers — so swapping breakfast moves the targets honestly.
function dayTotals(day,dayIdx){
  var t={p:0,c:0,f:0},i,v;
  if(!day||!day.meals)return {p:0,c:0,f:0,calories:0};
  for(i=0;i<day.meals.length;i++){
    v=mealVariant(day.meals[i],dayIdx,i);
    t.p+=(v.p||0);t.c+=(v.c||0);t.f+=(v.f||0);
  }
  t.calories=t.p*4+t.c*4+t.f*9;
  return t;
}
function getDietLog(){
  var today=todayKey();
  if(!S.bio.dietLog)S.bio.dietLog={};
  if(!S.bio.dietLog[today])S.bio.dietLog[today]={};
  return S.bio.dietLog[today];
}

function calcMacroTargets(){
  var weight=parseFloat(S.bio.weight)||185;
  var protein=Math.round(weight*1.0);    // 1g per lb
  var calories=Math.round(weight*12);    // aggressive cut: ~12 cal/lb
  var fat=Math.round(weight*0.35);       // 0.35g per lb
  var carbs=Math.round((calories - protein*4 - fat*9)/4);
  return {protein:protein,carbs:Math.max(50,carbs),fat:fat,calories:calories};
}

function getSelectedDayIdx(){
  return parseInt(S.bio.selectedDayIdx||0);
}

function getDayMeals(){
  var plan=getPlanDays();
  var idx=getSelectedDayIdx();
  if(idx>=0&&idx<plan.length)return plan[idx].meals;
  return WEEK_MEAL_PLAN[0].meals;
}

function renderDietSection(cont){
  var targets=calcMacroTargets();
  var log=getDietLog();
  var plan=getPlanDays();
  var selectedIdx=getSelectedDayIdx();
  var dayMeals=getDayMeals();

  // Calculate consumed macros from selected day meals
  var consumed={p:0,c:0,f:0};
  for(var i=0;i<dayMeals.length;i++){
    var mealId='dm_'+i;
    if(log[mealId]){
      var mv=mealVariant(dayMeals[i],selectedIdx,i);
      consumed.p+=(mv.p||0);
      consumed.c+=(mv.c||0);
      consumed.f+=(mv.f||0);
    }
  }
  var consumedCal=consumed.p*4+consumed.c*4+consumed.f*9;

  var title=document.createElement('div');
  title.className='bio-title';title.textContent='Cut Protocol — Diet';
  cont.appendChild(title);

  // Day selector
  var selLabel=document.createElement('div');
  selLabel.style.cssText='font-family:Share Tech Mono,monospace;font-size:7px;letter-spacing:.14em;text-transform:uppercase;color:var(--s2);margin-bottom:6px;';
  selLabel.textContent='SELECT YOUR TRAINING DAY';
  cont.appendChild(selLabel);

  var selWrap=document.createElement('div');
  selWrap.className='day-sel-wrap';
  for(var i=0;i<plan.length;i++){
    var d=plan[i];
    var isRest=d.type==='R';
    var btn=document.createElement('button');
    btn.className='day-sel-btn'+(isRest?' rest':'')+(i===selectedIdx?' active':'');
    var line1=d.label.substring(0,2);
    var shortName=d.label.replace(/^\d+ — /,'');
    var words=shortName.split(' ');
    var line2=words.slice(0,2).join(' ');
    btn.innerHTML=line1+'<br><span style="font-size:5px;">'+line2+'</span>';
    (function(idx){btn.onclick=function(){
      if(!S.bio)S.bio={};
      S.bio.selectedDayIdx=idx;
      if(!S.bio.dietLog)S.bio.dietLog={};
      S.bio.dietLog[todayKey()]={};
      saveState();renderBody();
    };})(i);
    selWrap.appendChild(btn);
  }
  cont.appendChild(selWrap);

  // Cutting goal progress
  var startWeight=parseFloat(S.bio.cutStartWeight)||parseFloat(S.bio.weight)||185;
  var currentWeight=S.bwLog.length?S.bwLog[S.bwLog.length-1].w:parseFloat(S.bio.weight)||185;
  var goalWeight=parseFloat(S.bio.goalweight)||(startWeight-12);
  var totalLoss=startWeight-goalWeight;
  var achieved=Math.max(0,startWeight-currentWeight);
  var pct=totalLoss>0?Math.min(100,Math.round(achieved/totalLoss*100)):0;

  var goalCard=document.createElement('div');goalCard.className='cut-goal-bar';
  goalCard.innerHTML='<div class="cut-goal-title">CUTTING GOAL</div>'
    +'<div style="display:flex;justify-content:space-between;font-family:Share Tech Mono,monospace;font-size:8px;color:var(--s2);">'
    +'<span>Start: '+startWeight+'lb</span><span>Goal: '+goalWeight+'lb</span></div>'
    +'<div class="cut-progress"><div class="cut-progress-fill" style="width:'+pct+'%;"></div></div>'
    +'<div style="display:flex;justify-content:space-between;font-family:Share Tech Mono,monospace;font-size:8px;">'
    +'<span style="color:var(--hl);">Lost: '+achieved.toFixed(1)+'lb</span>'
    +'<span style="color:var(--s2);">Remaining: '+(Math.max(0,totalLoss-achieved)).toFixed(1)+'lb</span></div>';
  cont.appendChild(goalCard);

  // Macro targets
  var macroDiv=document.createElement('div');macroDiv.className='macro-grid';
  var macros=[
    {label:'Calories',val:consumedCal+'/'+targets.calories,unit:'kcal',color:'#4fc3f7',pct:Math.min(100,Math.round(consumedCal/targets.calories*100))},
    {label:'Protein', val:consumed.p+'/'+targets.protein,  unit:'g',   color:'#4caf50',pct:Math.min(100,Math.round(consumed.p/targets.protein*100))},
    {label:'Carbs',   val:consumed.c+'/'+targets.carbs,    unit:'g',   color:'#ffb300',pct:Math.min(100,Math.round(consumed.c/targets.carbs*100))},
    {label:'Fat',     val:consumed.f+'/'+targets.fat,      unit:'g',   color:'#ef5350',pct:Math.min(100,Math.round(consumed.f/targets.fat*100))},
  ];
  for(var i=0;i<macros.length;i++){
    var m=macros[i];
    var mc=document.createElement('div');mc.className='macro-card';
    mc.innerHTML='<div class="macro-val" style="color:'+m.color+';font-size:12px;">'+m.val+'</div>'
      +'<div class="macro-unit">'+m.unit+'</div>'
      +'<div class="macro-label">'+m.label+'</div>'
      +'<div class="macro-bar-wrap"><div class="macro-bar-fill" style="width:'+m.pct+'%;background:'+m.color+';"></div></div>';
    macroDiv.appendChild(mc);
  }
  cont.appendChild(macroDiv);

  // Meal checklist
  var mealTitle=document.createElement('div');
  mealTitle.style.cssText='font-family:Share Tech Mono,monospace;font-size:7px;letter-spacing:.16em;text-transform:uppercase;color:var(--s2);margin-bottom:6px;';
  var dayLabel=plan[selectedIdx]?plan[selectedIdx].label:'';
  mealTitle.textContent="TODAY'S MEALS — "+dayLabel;
  cont.appendChild(mealTitle);

  for(var i=0;i<dayMeals.length;i++){
    var meal=mealVariant(dayMeals[i],selectedIdx,i);
    var mealId='dm_'+i;
    var on=!!log[mealId];
    var mealDesc=meal.desc?meal.desc.split('\\n').join(' · '):'';
    var item=document.createElement('div');item.className='meal-item';
    item.innerHTML='<div class="meal-check'+(on?' on':'')+'">'+( on?'&#10003;':'')+'</div>'
      +'<div style="flex:1;">'
      +'<div class="meal-name">'+meal.name+'</div>'
      +'<div class="meal-macros">P:'+(meal.p||0)+'g  C:'+(meal.c||0)+'g  F:'+(meal.f||0)+'g'+(mealDesc?' — '+mealDesc:'')+'</div>'
      +'</div>'
      +'<div class="meal-time">'+meal.time+'</div>';
    (function(mid){item.onclick=function(){
      var log=getDietLog();
      log[mid]=!log[mid];
      if(!S.bio.dietLog)S.bio.dietLog={};
      S.bio.dietLog[todayKey()]=log;
      saveState();renderBody();
    };})(mealId);
    cont.appendChild(item);

    // Swap chips for slots that have interchangeable options
    var opts=dayMeals[i].opts;
    if(opts&&opts.length>1){
      var swapRow=document.createElement('div');swapRow.className='meal-swap';
      var cur=mealOptIdx(selectedIdx,i);
      for(var q=0;q<opts.length;q++){
        (function(optIdx,mealIdx,o){
          var chip=document.createElement('div');
          chip.className='meal-swap-chip'+(optIdx===cur?' on':'');
          var short=o.name.replace(/^Breakfast \u2014 /,'').replace(/^Break Fast \u2014 /,'');
          chip.innerHTML=esc(short)+' <b>'+o.p+'P</b>';
          chip.onclick=function(e){
            e.stopPropagation();
            setMealOpt(selectedIdx,mealIdx,optIdx);
            renderBody();
          };
          swapRow.appendChild(chip);
        })(q,i,opts[q]);
      }
      cont.appendChild(swapRow);
    }
  }

  // Tips
  var tipsCard=document.createElement('div');tipsCard.className='cc';tipsCard.style.marginTop='8px';
  tipsCard.innerHTML='<div class="ct">CUTTING TIPS</div>'
    +'<div style="font-family:Share Tech Mono,monospace;font-size:8px;color:var(--st);line-height:2;letter-spacing:.04em;">'
    +'&#9654; Hit protein target every day — non-negotiable<br>'
    +'&#9654; Eat carbs around training only (pre + post workout)<br>'
    +'&#9654; Keep fats from quality sources (salmon, eggs, avocado)<br>'
    +'&#9654; Zero Ultra Monsters are fine during fasting window<br>'
    +'&#9654; Aim for 1-1.5 lb loss per week — faster risks muscle loss<br>'
    +'&#9654; Weigh yourself same time each morning (after waking, before eating)'
    +'</div>';
  cont.appendChild(tipsCard);
}

// ════════════════════════════════
// 7-DAY MEAL PLAN
// ════════════════════════════════
// T = Training day (higher carbs), R = Rest/Mobility day (lower carbs)
var WEEK_MEAL_PLAN = [
  {
    day:'01', label:'Day 01 — Upper Power', type:'T',
    calories:2100, protein:185, carbs:175, fat:65,
    meals:[
      {time:'12:00 PM', name:'Breakfast \u2014 Huel Black RTD',
       desc:'1 bottle Huel Black Edition Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster',
       p:35,c:29,f:16,
       opts:[{name:'Breakfast \u2014 Huel Black RTD',desc:'1 bottle Huel Black Edition Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster',p:35,c:29,f:16},
             {name:'Breakfast \u2014 Huel RTD',desc:'1 bottle Huel Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster\nLower protein than Black \u2014 expect to run under target today',p:21,c:39,f:18},
             {name:'Break Fast — Power Eggs',desc:'6 egg whites + 2 whole eggs scrambled in 1 tbsp butter\n1 cup Kirkland Greek yogurt (plain)\n1/2 cup frozen mixed berries (thawed)\nBlack coffee or Zero Ultra Monster',p:55,c:25,f:18}]},
      {time:'2:30 PM', name:'Pre-Workout — Rice & Chicken',
       desc:'7oz Kirkland chicken breast (grilled)\n1 cup white rice\nHandful Kirkland baby spinach + olive oil drizzle\n16oz water',
       p:58,c:60,f:9},
      {time:'POST', name:'Post-Workout Shake',
       desc:'2 scoops Kirkland whey protein\n1 banana\n8oz water or almond milk\nWithin 30 min of finishing',
       p:48,c:32,f:3},
      {time:'7:00 PM', name:'Final Meal — Beef & Avocado Bowl',
       desc:'7oz 93% lean ground beef (seasoned)\nLarge mixed greens salad\n1/2 avocado\n2 tbsp olive oil + lemon dressing\n1/2 cup Kirkland frozen broccoli (steamed)',
       p:52,c:12,f:30}
    ]
  },
  {
    day:'02', label:'Day 02 — Lower Power', type:'T',
    calories:2200, protein:185, carbs:190, fat:65,
    meals:[
      {time:'12:00 PM', name:'Breakfast \u2014 Huel Black RTD',
       desc:'1 bottle Huel Black Edition Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster',
       p:35,c:29,f:16,
       opts:[{name:'Breakfast \u2014 Huel Black RTD',desc:'1 bottle Huel Black Edition Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster',p:35,c:29,f:16},
             {name:'Breakfast \u2014 Huel RTD',desc:'1 bottle Huel Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster\nLower protein than Black \u2014 expect to run under target today',p:21,c:39,f:18},
             {name:'Break Fast — Protein Oats',desc:'1 cup rolled oats cooked\n1 scoop Kirkland whey stirred in\n1 tbsp Kirkland almond butter\n1/2 banana sliced\nBlack coffee or Zero Ultra Monster',p:45,c:65,f:12}]},
      {time:'2:30 PM', name:'Pre-Workout — Turkey Rice Bowl',
       desc:'7oz lean ground turkey (93%)\n1.5 cups white rice\n1/2 cup black beans\nSalsa, lime juice\n16oz water',
       p:58,c:75,f:11},
      {time:'POST', name:'Post-Workout Shake',
       desc:'2 scoops Kirkland whey protein\n1 banana\n8oz water\nWithin 30 min of finishing',
       p:48,c:32,f:3},
      {time:'7:00 PM', name:'Final Meal — Ground Beef & Veg',
       desc:'7oz 93% lean ground beef\n1 cup Kirkland frozen broccoli + cauliflower (steamed)\n1/2 avocado\nSalt, pepper, garlic powder',
       p:50,c:15,f:30}
    ]
  },
  {
    day:'03', label:'Day 03 — Upper Mobility', type:'R',
    calories:1800, protein:185, carbs:100, fat:70,
    meals:[
      {time:'12:00 PM', name:'Breakfast \u2014 Huel Black RTD',
       desc:'1 bottle Huel Black Edition Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster',
       p:35,c:29,f:16,
       opts:[{name:'Breakfast \u2014 Huel Black RTD',desc:'1 bottle Huel Black Edition Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster',p:35,c:29,f:16},
             {name:'Breakfast \u2014 Huel RTD',desc:'1 bottle Huel Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster\nLower protein than Black \u2014 expect to run under target today',p:21,c:39,f:18},
             {name:'Break Fast — Egg & Avocado',desc:'3 whole eggs scrambled in 1 tbsp butter\n1/2 avocado sliced\n2 slices turkey bacon\nBlack coffee or Zero Ultra Monster',p:38,c:8,f:30}]},
      {time:'3:00 PM', name:'Midday — Cottage Cheese Bowl',
       desc:'1.5 cups Kirkland cottage cheese\n1/4 cup Kirkland walnuts\n1/2 cup frozen blueberries (thawed)\nCinnamon',
       p:48,c:22,f:18},
      {time:'6:00 PM', name:'Dinner — Chicken & Salad',
       desc:'8oz Kirkland chicken breast (grilled)\nLarge mixed greens salad with olive oil\n1/2 cup cherry tomatoes\nSalt, pepper, herbs',
       p:58,c:12,f:19},
      {time:'7:45 PM', name:'Evening Snack — Casein & Almonds',
       desc:'1 scoop casein protein in water\n1/4 cup Kirkland almonds\nHerbal tea',
       p:32,c:8,f:9}
    ]
  },
  {
    day:'04', label:'Day 04 — Upper Hypertrophy', type:'T',
    calories:2100, protein:185, carbs:175, fat:65,
    meals:[
      {time:'12:00 PM', name:'Breakfast \u2014 Huel Black RTD',
       desc:'1 bottle Huel Black Edition Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster',
       p:35,c:29,f:16,
       opts:[{name:'Breakfast \u2014 Huel Black RTD',desc:'1 bottle Huel Black Edition Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster',p:35,c:29,f:16},
             {name:'Breakfast \u2014 Huel RTD',desc:'1 bottle Huel Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster\nLower protein than Black \u2014 expect to run under target today',p:21,c:39,f:18},
             {name:'Break Fast — Power Eggs',desc:'6 egg whites + 2 whole eggs scrambled in 1 tbsp butter\n1 cup Kirkland Greek yogurt (plain)\n1/2 cup frozen strawberries (thawed)\nBlack coffee or Zero Ultra Monster',p:55,c:25,f:18}]},
      {time:'2:30 PM', name:'Pre-Workout — Chicken & Sweet Potato',
       desc:'7oz Kirkland chicken breast\n1 medium sweet potato (baked)\nHandful Kirkland baby spinach\n16oz water',
       p:56,c:55,f:6},
      {time:'POST', name:'Post-Workout Shake',
       desc:'2 scoops Kirkland whey protein\n1 apple\n8oz water\nWithin 30 min of finishing',
       p:48,c:30,f:3},
      {time:'7:00 PM', name:'Final Meal — Ground Turkey & Greens',
       desc:'7oz lean ground turkey\nLarge mixed greens\n1/2 avocado\n1 tbsp olive oil + apple cider vinegar\nCucumber, red onion',
       p:54,c:10,f:24}
    ]
  },
  {
    day:'05', label:'Day 05 — Lower Hypertrophy', type:'T',
    calories:2200, protein:185, carbs:190, fat:65,
    meals:[
      {time:'12:00 PM', name:'Breakfast \u2014 Huel Black RTD',
       desc:'1 bottle Huel Black Edition Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster',
       p:35,c:29,f:16,
       opts:[{name:'Breakfast \u2014 Huel Black RTD',desc:'1 bottle Huel Black Edition Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster',p:35,c:29,f:16},
             {name:'Breakfast \u2014 Huel RTD',desc:'1 bottle Huel Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster\nLower protein than Black \u2014 expect to run under target today',p:21,c:39,f:18},
             {name:'Break Fast — Protein Pancakes',desc:'3 Kirkland eggs + 1 scoop whey + 1/2 banana blended\nCook in 1 tbsp butter\n1/4 cup sugar-free maple syrup\nBlack coffee or Zero Ultra Monster',p:52,c:40,f:15}]},
      {time:'2:30 PM', name:'Pre-Workout — Beef & Rice',
       desc:'7oz 93% lean ground beef\n1.5 cups white rice\n1/2 cup black beans\nSoy sauce, garlic\n16oz water',
       p:58,c:72,f:13},
      {time:'POST', name:'Post-Workout Shake',
       desc:'2 scoops Kirkland whey protein\n1 banana\n8oz water\nWithin 30 min',
       p:48,c:32,f:3},
      {time:'7:00 PM', name:'Final Meal — Chicken & Roasted Veg',
       desc:'7oz Kirkland chicken breast (baked)\n1 cup Kirkland frozen brussels sprouts (roasted)\n1/2 avocado\nOlive oil, lemon, salt, pepper',
       p:52,c:12,f:24}
    ]
  },
  {
    day:'06', label:'Day 06 — Full Athletic', type:'T',
    calories:2100, protein:185, carbs:170, fat:65,
    meals:[
      {time:'12:00 PM', name:'Breakfast \u2014 Huel Black RTD',
       desc:'1 bottle Huel Black Edition Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster',
       p:35,c:29,f:16,
       opts:[{name:'Breakfast \u2014 Huel Black RTD',desc:'1 bottle Huel Black Edition Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster',p:35,c:29,f:16},
             {name:'Breakfast \u2014 Huel RTD',desc:'1 bottle Huel Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster\nLower protein than Black \u2014 expect to run under target today',p:21,c:39,f:18},
             {name:'Break Fast — Greek Yogurt Bowl',desc:'1.5 cups Kirkland Greek yogurt (plain)\n1 scoop Kirkland whey stirred in\n1/4 cup low sugar granola\n1/2 cup frozen mixed berries (thawed)\nBlack coffee or Zero Ultra Monster',p:58,c:45,f:10}]},
      {time:'2:30 PM', name:'Pre-Workout — Turkey Rice Bowl',
       desc:'7oz lean ground turkey\n1.5 cups white rice\nKirkland baby spinach\nSalsa, lime\n16oz water',
       p:58,c:55,f:11},
      {time:'POST', name:'Post-Workout Shake',
       desc:'2 scoops Kirkland whey protein\n1 banana\n8oz water\nWithin 30 min',
       p:48,c:32,f:3},
      {time:'7:00 PM', name:'Final Meal — Beef Stir Fry',
       desc:'7oz 93% lean ground beef\nStir fry with bell peppers, Kirkland frozen broccoli, snap peas\n1 tbsp olive oil + soy sauce + garlic\n1/2 cup white rice',
       p:52,c:35,f:18}
    ]
  },
  {
    day:'07', label:'Day 07 — Lower Mobility', type:'R',
    calories:1800, protein:185, carbs:95, fat:72,
    meals:[
      {time:'12:00 PM', name:'Breakfast \u2014 Huel Black RTD',
       desc:'1 bottle Huel Black Edition Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster',
       p:35,c:29,f:16,
       opts:[{name:'Breakfast \u2014 Huel Black RTD',desc:'1 bottle Huel Black Edition Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster',p:35,c:29,f:16},
             {name:'Breakfast \u2014 Huel RTD',desc:'1 bottle Huel Ready-to-Drink (500ml)\nShake well, drink cold\nBlack coffee or Zero Ultra Monster\nLower protein than Black \u2014 expect to run under target today',p:21,c:39,f:18},
             {name:'Break Fast — Cottage Cheese & Eggs',desc:'3 whole Kirkland eggs scrambled in 1 tbsp butter\n1/2 cup Kirkland cottage cheese\n1/2 avocado\nBlack coffee or Zero Ultra Monster',p:42,c:5,f:28}]},
      {time:'3:00 PM', name:'Midday — Chicken Salad',
       desc:'7oz Kirkland chicken breast (shredded or diced)\nMixed greens, cucumber, cherry tomatoes\n1 tbsp olive oil + lemon\n1/4 cup Kirkland almonds',
       p:54,c:10,f:19},
      {time:'6:00 PM', name:'Dinner — Ground Turkey & Quinoa',
       desc:'8oz lean ground turkey\n1/2 cup quinoa\n1 cup Kirkland frozen brussels sprouts (roasted)\n1 tbsp olive oil\nSalt, pepper, herbs',
       p:60,c:28,f:15},
      {time:'7:45 PM', name:'Evening — Casein & Walnuts',
       desc:'1 scoop casein protein in water (slow digesting — good before bed)\n1/4 cup Kirkland walnuts\nHerbal tea',
       p:32,c:6,f:13}
    ]
  }
];

// Shopping list organized by category

var SHOPPING_LIST = {
  'PROTEINS': [
    {name:'Kirkland Chicken Breast', qty:'6 lb bag', id:'s1', role:'protein', label:'Chicken Breast'},
    {name:'93% Lean Ground Beef', qty:'2 x 2lb packs', id:'s3', role:'protein', label:'Ground Beef'},
    {name:'93% Lean Ground Turkey', qty:'2 x 1lb packs', id:'s4', role:'protein', label:'Ground Turkey'},
    {name:'Kirkland Large Eggs', qty:'2 dozen pack', id:'s6', role:'protein', label:'Eggs'},
    {name:'Kirkland Liquid Egg Whites', qty:'32oz carton', id:'s7', role:'protein', label:'Egg Whites'},
    {name:'Turkey Bacon', qty:'1 pack', id:'s10', role:'protein', label:'Turkey Bacon'},
    {name:'Kirkland Whey Protein', qty:'1 container', id:'s11', role:'shake', label:'Whey Protein'},
    {name:'Casein Protein Powder', qty:'1 container', id:'s12', role:'casein', label:'Casein Protein'},
    {name:'Kirkland Greek Yogurt (plain)', qty:'3 lb tub', id:'s13', role:'protein', label:'Greek Yogurt'},
    {name:'Kirkland Cottage Cheese', qty:'2-pack tubs', id:'s14', role:'protein', label:'Cottage Cheese'},
  ],
  'CARBS & PRODUCE': [
    {name:'Kirkland White Rice', qty:'25 lb bag', id:'s15', role:'carb', label:'White Rice'},
    {name:'Sweet Potatoes', qty:'3-4 medium', id:'s16', role:'carb', label:'Sweet Potato'},
    {name:'Rolled Oats', qty:'1 large container', id:'s17', role:'carb', label:'Oats'},
    {name:'Quinoa', qty:'1 lb bag', id:'s18', role:'carb', label:'Quinoa'},
    {name:'Bananas', qty:'2 bunches', id:'s19', role:'fruit', label:'Banana'},
    {name:'Kirkland Frozen Mixed Berries', qty:'3 lb bag', id:'s20', role:'fruit', label:'Mixed Berries'},
    {name:'Apples', qty:'3-4', id:'s23', role:'fruit', label:'Apple'},
    {name:'Black Beans (canned)', qty:'2 cans', id:'s24', role:'carb', label:'Black Beans'},
    {name:'Low Sugar Granola', qty:'1 bag', id:'s26', role:'carb', label:'Granola'},
  ],
  'FATS & OILS': [
    {name:'Avocados', qty:'5-6 pack', id:'s27', role:'fat', label:'Avocado'},
    {name:'Kirkland Extra Virgin Olive Oil', qty:'2-pack bottles', id:'s28', role:'fat', label:'Olive Oil'},
    {name:'Kirkland Unsalted Butter', qty:'4-pack sticks', id:'s29', role:'fat', label:'Butter'},
    {name:'Kirkland Almond Butter', qty:'1 large jar', id:'s30', role:'fat', label:'Almond Butter'},
    {name:'Kirkland Walnuts', qty:'1 large bag', id:'s31', role:'fat', label:'Walnuts'},
    {name:'Kirkland Almonds', qty:'1 large bag', id:'s32', role:'fat', label:'Almonds'},
  ],
  'VEGETABLES': [
    {name:'Kirkland Baby Spinach', qty:'2 lb bag', id:'s34', role:'veg', label:'Baby Spinach'},
    {name:'Kirkland Mixed Greens', qty:'1 large bag', id:'s35', role:'veg', label:'Mixed Greens'},
    {name:'Kirkland Frozen Broccoli', qty:'4 lb bag', id:'s36', role:'veg', label:'Broccoli'},
    {name:'Kirkland Frozen Cauliflower Rice', qty:'4 lb bag', id:'s37', role:'veg', label:'Cauliflower Rice'},
    {name:'Kirkland Frozen Brussels Sprouts', qty:'2 lb bag', id:'s38', role:'veg', label:'Brussels Sprouts'},
    {name:'Bell Peppers', qty:'3-4', id:'s40', role:'veg', label:'Bell Peppers'},
    {name:'Cherry Tomatoes', qty:'1 pint', id:'s41', role:'veg', label:'Cherry Tomatoes'},
    {name:'Cucumber', qty:'2', id:'s42', role:'veg', label:'Cucumber'},
    {name:'Red Onion', qty:'1', id:'s43', role:'veg', label:'Red Onion'},
    {name:'Snap Peas', qty:'1 bag', id:'s44', role:'veg', label:'Snap Peas'},
  ],
  'PANTRY & SAUCES': [
    {name:'Kirkland Low Sodium Soy Sauce', qty:'1 bottle', id:'s45', role:'sauce', label:'Soy Sauce'},
    {name:'Salsa', qty:'1 jar', id:'s46', role:'sauce', label:'Salsa'},
    {name:'Apple Cider Vinegar', qty:'1 bottle', id:'s47', role:'sauce', label:'ACV'},
    {name:'Sugar-Free Maple Syrup', qty:'1 bottle', id:'s48', role:'sauce', label:'Sugar-Free Syrup'},
    {name:'Lemons / Limes', qty:'4-5', id:'s50', role:'sauce', label:'Lemon/Lime'},
    {name:'Garlic Powder + Herbs', qty:'As needed', id:'s52', role:'sauce', label:'Garlic + Herbs'},
    {name:'Kirkland Unsweetened Almond Milk', qty:'1 carton', id:'s53', role:'liquid', label:'Almond Milk'},
  ],
  'DRINKS': [
    {name:'Monster Zero Ultra (24-pack)', qty:'1 case', id:'s54', role:'drink', label:'Zero Ultra Monster'},
    {name:'Kirkland Sparkling Water', qty:'1 case', id:'s55', role:'drink', label:'Sparkling Water'},
    {name:'Black Coffee / Herbal Tea', qty:'As needed', id:'s56', role:'drink', label:'Coffee/Tea'},
  ]
};

var openMealDays = {};

function renderMealPlan(cont){
  // Use generated plan if available, otherwise use static plan
  var planDays = getPlanDays();
  var isGenerated = !!(S.bio.generatedPlan && S.bio.generatedPlan.days);

  var title=document.createElement('div');
  title.className='bio-title';
  title.textContent=isGenerated?'My Custom Meal Plan':'7-Day Meal Plan';
  cont.appendChild(title);

  // Day type legend
  var legend=document.createElement('div');
  legend.style.cssText='display:flex;gap:10px;margin-bottom:10px;';
  legend.innerHTML='<div style="font-family:Share Tech Mono,monospace;font-size:7px;color:var(--hl);">&#9632; TRAINING DAY — higher carbs</div>'
    +'<div style="font-family:Share Tech Mono,monospace;font-size:7px;color:var(--am);">&#9632; REST DAY — lower carbs</div>';
  cont.appendChild(legend);

  for(var i=0;i<planDays.length;i++){
    var day=planDays[i];
    var isOpen=openMealDays[day.day];
    var typeColor=day.type==='T'?'var(--hl)':'var(--am)';

    var dayDiv=document.createElement('div');
    dayDiv.className='meal-plan-day';

    var hdr=document.createElement('div');
    hdr.className='meal-plan-day-header';
    var dt=dayTotals(day,i);
    hdr.innerHTML='<div>'
      +'<div class="meal-plan-day-title" style="color:'+typeColor+';">'+day.label+'</div>'
      +'<div class="meal-plan-day-meta">'+dt.calories+' cal &nbsp;·&nbsp; P:'+dt.p+'g C:'+dt.c+'g F:'+dt.f+'g</div>'
      +'</div>'
      +'<div style="color:var(--hl);font-family:Orbitron,sans-serif;font-size:10px;">'+(isOpen?'&#9660;':'&#9654;')+'</div>';

    var body=document.createElement('div');
    body.className='meal-plan-day-body'+(isOpen?' open':'');

    for(var j=0;j<day.meals.length;j++){
      var meal=day.meals[j];
      var mDiv=document.createElement('div');mDiv.className='meal-plan-meal';
      mDiv.innerHTML='<div class="meal-plan-meal-time">'+meal.time+'</div>'
        +'<div class="meal-plan-meal-name">'+meal.name+'</div>'
        +'<div class="meal-plan-meal-desc">'+meal.desc.split('\\n').join('<br>')+'</div>'
        +'<div class="meal-plan-meal-macros">P:'+meal.p+'g &nbsp; C:'+meal.c+'g &nbsp; F:'+meal.f+'g</div>';
      body.appendChild(mDiv);
    }

    (function(dayKey, b, h){
      h.onclick=function(){
        openMealDays[dayKey]=!openMealDays[dayKey];
        b.classList.toggle('open');
        h.querySelector('div:last-child').innerHTML=openMealDays[dayKey]?'&#9660;':'&#9654;';
      };
    })(day.day, body, hdr);

    dayDiv.appendChild(hdr);
    dayDiv.appendChild(body);
    cont.appendChild(dayDiv);
  }

  // Shopping list
  var shopTitle=document.createElement('div');
  shopTitle.className='bio-title';shopTitle.textContent='Weekly Shopping List';
  cont.appendChild(shopTitle);

  // Build my plan button
  var buildWrap=document.createElement('div');
  buildWrap.style.cssText='display:flex;gap:6px;margin-bottom:10px;';
  var buildBtn=document.createElement('button');
  buildBtn.style.cssText='flex:1;background:transparent;border:1px solid var(--hlbr);color:var(--hlb);border-radius:2px;padding:11px;font-family:Orbitron,sans-serif;font-size:9px;letter-spacing:.12em;cursor:pointer;';
  buildBtn.textContent='BUILD MY PLAN';
  buildBtn.onclick=function(){generateMealPlan();};
  buildWrap.appendChild(buildBtn);
  if(S.bio.generatedPlan&&S.bio.generatedPlan.days){
    var clearPlanBtn=document.createElement('button');
    clearPlanBtn.style.cssText='background:transparent;border:1px solid var(--border);color:var(--s2);border-radius:2px;padding:11px 14px;font-family:Orbitron,sans-serif;font-size:8px;letter-spacing:.1em;cursor:pointer;';
    clearPlanBtn.textContent='RESET';
    clearPlanBtn.onclick=function(){clearGeneratedPlan();};
    buildWrap.appendChild(clearPlanBtn);
  }
  cont.appendChild(buildWrap);

  // Instruction
  var buildHint=document.createElement('div');
  buildHint.style.cssText='font-family:Share Tech Mono,monospace;font-size:7px;color:var(--s2);margin-bottom:10px;line-height:1.7;';
  buildHint.textContent='Check off items you have below, then tap BUILD MY PLAN to generate a custom 7-day plan from your available ingredients.';
  cont.appendChild(buildHint);

  // Clear all button
  var clearBtn=document.createElement('button');
  clearBtn.style.cssText='background:none;border:1px solid var(--border);border-radius:2px;color:var(--s2);padding:5px 12px;font-family:Orbitron,sans-serif;font-size:7px;letter-spacing:.1em;cursor:pointer;margin-bottom:10px;';
  clearBtn.textContent='CLEAR ALL CHECKS';
  clearBtn.onclick=function(){
    if(!S.bio.shopLog)S.bio.shopLog={};
    S.bio.shopLog={};
    saveState();renderBody();
  };
  cont.appendChild(clearBtn);

  if(!S.bio.shopLog)S.bio.shopLog={};
  var categories=Object.keys(SHOPPING_LIST);
  for(var i=0;i<categories.length;i++){
    var cat=categories[i];
    var catTitle=document.createElement('div');
    catTitle.className='shop-category';catTitle.textContent=cat;
    cont.appendChild(catTitle);

    var items=SHOPPING_LIST[cat];
    for(var j=0;j<items.length;j++){
      var item=items[j];
      var on=!!S.bio.shopLog[item.id];
      var row=document.createElement('div');
      row.className='shop-item'+(on?' checked':'');
      row.innerHTML='<div class="shop-check'+(on?' on':'')+'">'+( on?'&#10003;':'')+'</div>'
        +'<div class="shop-item-name">'+item.name+'</div>'
        +'<div class="shop-item-qty">'+item.qty+'</div>';
      (function(iid,r){row.onclick=function(){
        if(!S.bio.shopLog)S.bio.shopLog={};
        S.bio.shopLog[iid]=!S.bio.shopLog[iid];
        saveState();renderBody();
      };})(item.id,row);
      cont.appendChild(row);
    }
  }
}

// ════════════════════════════════
// BUILD MY PLAN — DYNAMIC MEAL GENERATOR
// ════════════════════════════════

// Flat lookup of all shop items by id
function getAllShopItems(){
  var all=[];
  var cats=Object.keys(SHOPPING_LIST);
  for(var i=0;i<cats.length;i++){
    for(var j=0;j<SHOPPING_LIST[cats[i]].length;j++){
      all.push(SHOPPING_LIST[cats[i]][j]);
    }
  }
  return all;
}

function getCheckedItems(){
  if(!S.bio.shopLog)return[];
  var all=getAllShopItems();
  return all.filter(function(item){return S.bio.shopLog[item.id];});
}

function getCheckedByRole(role){
  return getCheckedItems().filter(function(i){return i.role===role;});
}

function pick(arr,idx){return arr.length?arr[idx%arr.length]:null;}

function buildMealName(protein, carb, veg, fat, mealType){
  var names={
    breakfast:'Break Fast',
    preWkt:'Pre-Workout',
    postWkt:'Post-Workout Shake',
    final:'Final Meal'
  };
  var prefix=names[mealType]||'Meal';
  var parts=[];
  if(protein)parts.push(protein.label);
  if(carb)parts.push(carb.label);
  return prefix+' — '+(parts.join(' & ')||'Protein Meal');
}

function rr(arr,i){return arr.length?arr[i%arr.length]:null;}

function buildMealDesc(protein, carb, veg, fat, sauce, mealType, isTraining, fruit, extras){
  var lines=[];extras=extras||{};
  if(mealType==='postWkt'){
    var shakes=getCheckedByRole('shake');
    var fruits=getCheckedByRole('fruit');
    var liquids=getCheckedByRole('liquid');
    var shake=rr(shakes,extras.idx||0);
    var fr=rr(fruits,extras.idx||0);
    var liq=rr(liquids,extras.idx||0);
    lines.push('2 scoops '+(shake?shake.label:'whey protein'));
    if(fr)lines.push('1 '+fr.label);
    lines.push((liq?liq.label:'Water')+' — 8oz');
    lines.push('Within 30 min of finishing');
    return lines.join('\n');
  }
  if(mealType==='preBed'){
    var casein=getCheckedByRole('casein');
    if(casein.length){lines.push('1 scoop '+casein[0].label+' with water or almond milk');}
    else {
      var pp=protein;
      if(pp&&pp.label==='Cottage Cheese')lines.push('1 cup Cottage Cheese');
      else if(pp&&pp.label==='Greek Yogurt')lines.push('1 cup Greek Yogurt');
      else lines.push('1 cup Cottage Cheese or Greek Yogurt');
    }
    if(fat&&fat.label!=='Olive Oil'&&fat.label!=='Butter'){
      if(fat.label==='Almonds')lines.push('Small handful almonds');
      else if(fat.label==='Walnuts')lines.push('Small handful walnuts');
      else if(fat.label==='Almond Butter')lines.push('1 tbsp almond butter');
    }
    lines.push('Slow-digesting protein before the fast');
    return lines.join('\n');
  }
  // Protein
  if(protein&&protein.role==='protein'){
    if(protein.label==='Eggs'){
      var hasWhites=getCheckedByRole('protein').filter(function(p){return p.label==='Egg Whites';}).length>0;
      lines.push('3 whole eggs'+(hasWhites?' + 4 egg whites':''));
    } else if(protein.label==='Egg Whites'){
      lines.push('6 egg whites + 1 whole egg');
    } else if(protein.label==='Greek Yogurt'){
      lines.push('1.5 cups '+protein.label);
    } else if(protein.label==='Cottage Cheese'){
      lines.push('1.5 cups '+protein.label);
    } else if(protein.label==='Turkey Bacon'){
      lines.push('4 strips '+protein.label);
    } else {
      lines.push('6oz '+protein.label+(mealType==='final'?' (seasoned)':mealType==='preWkt'?' (grilled)':' (cooked)'));
    }
  }
  // Cooking fat for eggs/beef/turkey
  if(fat&&protein&&(protein.label==='Eggs'||protein.label==='Egg Whites'||protein.label==='Ground Beef'||protein.label==='Ground Turkey')){
    if(fat.label==='Olive Oil'||fat.label==='Butter')lines.push('1 tbsp '+fat.label+' (to cook)');
  }
  // Carb
  if(carb&&mealType!=='final'){
    if(carb.label==='White Rice')lines.push('1 cup white rice');
    else if(carb.label==='Sweet Potato')lines.push('1 medium sweet potato (baked)');
    else if(carb.label==='Oats')lines.push('1 cup oats (cooked)');
    else if(carb.label==='Quinoa')lines.push('3/4 cup quinoa');
    else if(carb.label==='Black Beans')lines.push('1/2 cup black beans');
    else if(carb.label==='Granola')lines.push('1/4 cup '+carb.label);
    else lines.push(carb.label);
  }
  // Fruit — breakfast topping or a side, finally placed
  if(fruit&&(mealType==='breakfast'||mealType==='preWkt')){
    if(fruit.label==='Banana')lines.push('1 banana');
    else if(fruit.label==='Mixed Berries')lines.push('1/2 cup mixed berries');
    else if(fruit.label==='Apple')lines.push('1 apple');
    else lines.push('1 serving '+fruit.label);
  }
  // Veg
  if(veg){
    var prep=veg.label.indexOf('Frozen')>=0?' (steamed)':(veg.label==='Mixed Greens'||veg.label==='Baby Spinach'||veg.label==='Cherry Tomatoes'||veg.label==='Cucumber')?' (fresh)':' (cooked)';
    lines.push('1 cup '+veg.label+prep);
  }
  // Fat topping (non-cooking)
  if(fat&&!(protein&&(protein.label==='Eggs'||protein.label==='Egg Whites'))){
    if(fat.label==='Avocado')lines.push('1/2 avocado');
    else if(fat.label==='Olive Oil')lines.push('1 tbsp olive oil');
    else if(fat.label==='Almonds')lines.push('1/4 cup almonds');
    else if(fat.label==='Walnuts')lines.push('1/4 cup walnuts');
    else if(fat.label==='Almond Butter')lines.push('1 tbsp almond butter');
  }
  // Sauce
  if(sauce)lines.push(sauce.label+' to taste');
  // Drink — rotate through everything bought, not just coffee
  if(mealType==='breakfast'){
    var drinks=getCheckedByRole('drink');
    var dr2=rr(drinks,extras.idx||0);
    lines.push(dr2?('Black coffee or '+dr2.label):'Black coffee');
  }
  return lines.join('\n')||'Prepare with available ingredients';
}

function generateMealPlan(){
  var proteins=getCheckedByRole('protein');
  var carbs=getCheckedByRole('carb');
  var vegs=getCheckedByRole('veg');
  var fats=getCheckedByRole('fat');
  var sauces=getCheckedByRole('sauce');
  var shakes=getCheckedByRole('shake');
  var fruits=getCheckedByRole('fruit');

  var missing=[];
  if(!proteins.length)missing.push('a protein source');
  if(!shakes.length)missing.push('whey protein (for post-workout shakes)');
  if(missing.length){
    showToast('MISSING: '+missing.join(', ').toUpperCase());
    if(!proteins.length)return;
  }

  var days=['01','02','03','04','05','06','07'];
  var labels=['Day 01 — Upper Power','Day 02 — Lower Power','Day 03 — Upper Mobility',
              'Day 04 — Upper Hypertrophy','Day 05 — Lower Hypertrophy','Day 06 — Full Athletic','Day 07 — Lower Mobility'];
  var types=['T','T','R','T','T','T','R'];

  // Round-robin counters per role so every purchased item rotates in across
  // the week rather than repeating index 0
  var pc=0,cc=0,vc=0,fc=0,sc=0,frc=0;
  var generated=[];
  for(var d=0;d<7;d++){
    var isTraining=types[d]==='T';
    var meals=[];

    // Breakfast: protein + fruit topping (+ carb only on training days)
    var bP=rr(proteins,pc++);
    var bFr=rr(fruits,frc++);
    var bC=isTraining?rr(carbs,cc++):null;
    var bF=rr(fats,fc++);
    meals.push({
      time:'12:00 PM',
      name:'Break Fast — '+(bP?bP.label:'Protein'),
      desc:buildMealDesc(bP,bC,null,bF,null,'breakfast',isTraining,bFr,{idx:d}),
      p:50,c:isTraining?30:12,f:15
    });

    if(isTraining){
      // Pre-workout: protein + carb + veg
      var preP=rr(proteins,pc++);
      var preC=rr(carbs,cc++);
      var preV=rr(vegs,vc++);
      meals.push({
        time:'2:30 PM',
        name:'Pre-Workout — '+(preP?preP.label:'')+' & '+(preC?preC.label:'Rice'),
        desc:buildMealDesc(preP,preC,preV,null,rr(sauces,sc++),'preWkt',true,null,{idx:d}),
        p:48,c:55,f:6
      });
      // Post-workout shake (rotates shake + fruit + liquid)
      meals.push({
        time:'POST',
        name:'Post-Workout Shake',
        desc:buildMealDesc(null,null,null,null,null,'postWkt',true,null,{idx:d}),
        p:45,c:28,f:3
      });
      // Final meal: protein + veg + fat
      var fP=rr(proteins,pc++);
      var fV=rr(vegs,vc++);
      var fF=rr(fats,fc++);
      meals.push({
        time:'7:00 PM',
        name:'Final Meal — '+(fP?fP.label:'Protein')+' & Greens',
        desc:buildMealDesc(fP,null,fV,fF,rr(sauces,sc++),'final',true,null,{idx:d}),
        p:45,c:15,f:20
      });
      // Pre-bed casein/slow protein before the fast (only if bought)
      if(getCheckedByRole('casein').length||proteins.filter(function(x){return x.label==='Cottage Cheese'||x.label==='Greek Yogurt';}).length){
        meals.push({
          time:'9:30 PM',
          name:'Pre-Fast — Slow Protein',
          desc:buildMealDesc(rr(proteins,pc++),null,null,rr(fats,fc++),null,'preBed',true,null,{idx:d}),
          p:30,c:6,f:9
        });
      }
    } else {
      // Rest day: a protein+veg+fat midday, plus a fruit/nut snack so rest-day
      // fruit and nuts you bought get used
      var mP=rr(proteins,pc++);
      var mV=rr(vegs,vc++);
      var mF=rr(fats,fc++);
      meals.push({
        time:'2:00 PM',
        name:'Midday — '+(mP?mP.label:'Protein')+' Plate',
        desc:buildMealDesc(mP,null,mV,mF,rr(sauces,sc++),'preWkt',false,null,{idx:d}),
        p:42,c:12,f:16
      });
      var snackFr=rr(fruits,frc++);
      var snackF=rr(fats,fc++);
      var snackLines=[];
      if(snackFr)snackLines.push('1 '+snackFr.label);
      if(snackF&&snackF.label==='Almonds')snackLines.push('1/4 cup almonds');
      else if(snackF&&snackF.label==='Walnuts')snackLines.push('1/4 cup walnuts');
      else if(snackF&&snackF.label==='Almond Butter')snackLines.push('1 tbsp almond butter');
      var snackProt=proteins.filter(function(x){return x.label==='Greek Yogurt'||x.label==='Cottage Cheese';});
      if(snackProt.length)snackLines.unshift('1 cup '+snackProt[0].label);
      meals.push({
        time:'4:30 PM',
        name:'Snack — Fruit & Protein',
        desc:snackLines.join('\n')||'1 cup Greek yogurt + berries',
        p:25,c:20,f:10
      });
      // Final meal
      var rP=rr(proteins,pc++);
      var rV=rr(vegs,vc++);
      meals.push({
        time:'7:00 PM',
        name:'Final Meal — '+(rP?rP.label:'Protein')+' & Greens',
        desc:buildMealDesc(rP,null,rV,rr(fats,fc++),rr(sauces,sc++),'final',false,null,{idx:d}),
        p:45,c:8,f:20
      });
    }

    generated.push({
      day:days[d],
      label:labels[d],
      type:types[d],
      calories:isTraining?2100:1800,
      protein:185,
      carbs:isTraining?175:95,
      fat:65,
      meals:meals,
      generated:true
    });
  }

  // Coverage pass: any checked item that never landed in a description gets
  // appended as an "options" note to a relevant day, so nothing you bought
  // is silently ignored.
  var allChecked=getCheckedItems();
  var planText=JSON.stringify(generated).toLowerCase();
  var unused=allChecked.filter(function(it){
    return planText.indexOf(it.label.toLowerCase())<0;
  });
  if(unused.length){
    var byRole={};
    for(var i=0;i<unused.length;i++){(byRole[unused[i].role]=byRole[unused[i].role]||[]).push(unused[i].label);}
    var noteLines=[];
    for(var r in byRole)noteLines.push(byRole[r].join(', '));
    generated[0].meals.push({
      time:'NOTE',
      name:'Also In Your Cart — Rotate These In',
      desc:'These purchased items can swap into any meal of the same type:\n'+noteLines.join('\n'),
      p:0,c:0,f:0
    });
  }

// Save generated plan
  if(!S.bio.generatedPlan)S.bio.generatedPlan={};
  S.bio.generatedPlan.days=generated;
  S.bio.generatedPlan.date=new Date().toISOString();
  saveState();
  // Coverage diagnostic: how many checked items actually landed in the plan
  var _all=getCheckedItems();
  var _txt=JSON.stringify(generated).toLowerCase();
  var _placed=_all.filter(function(it){return _txt.indexOf(it.label.toLowerCase())>=0;}).length;
  if(!_all.length){
    showToast('NO ITEMS CHECKED — CHECK FOODS FIRST');
  } else if(_placed<_all.length){
    showToast('PLAN BUILT — '+_placed+'/'+_all.length+' ITEMS USED (see Day 01 note)');
  } else {
    showToast('PLAN BUILT — ALL '+_all.length+' ITEMS USED');
  }
  renderBody();
}

function clearGeneratedPlan(){
  if(S.bio.generatedPlan)delete S.bio.generatedPlan;
  saveState();
  showToast('PLAN CLEARED');
  renderBody();
}
