// ════════════════════════════════
// CONSTANTS
// ════════════════════════════════
var AVATAR_COLORS=['#4fc3f7','#f1a435','#4caf50','#e056f0','#ef5350'];
var COLOR_NAMES=['Blue','Amber','Green','Purple','Red'];

var CYCLE=[
  {week:1,reps:15,repMin:12,repMax:15,label:'ENDURANCE',intensity:.65},
  {week:2,reps:12,repMin:10,repMax:12,label:'HYPERTROPHY',intensity:.72},
  {week:3,reps:10,repMin:6,repMax:8,label:'STRENGTH',intensity:.80},
  {week:4,reps:8,repMin:4,repMax:6,label:'OVERLOAD',intensity:.87},
  {week:5,reps:15,repMin:12,repMax:15,label:'DELOAD',intensity:.55}
];

var SUPPS=[
  {id:'creatine',name:'Creatine Monohydrate',detail:'5g daily — any time, consistency matters'},
  {id:'d3k2',name:'Vitamin D3 + K2',detail:'5000 IU D3 / 100mcg K2 — with fattiest meal'},
  {id:'ksm66',name:'KSM-66 Ashwagandha',detail:'600mg — evening, with food'},
  {id:'omega3',name:'Omega-3 Fish Oil',detail:'2-3g EPA+DHA — with meals'},
  {id:'magnesium',name:'Magnesium Glycinate',detail:'160mg — 30-60 min before bed'},
  {id:'longevity',name:'Blueprint Longevity Mix',detail:'1 scoop in 6-24oz water — with food, morning. Contains creatine, CaAKG, taurine, glycine, L-theanine, glutathione, vitamin C, magnesium citrate (150mg) & more. Pineapple Yuzu.'}
];

var PEP_SITES=['L Abdo','R Abdo','L Delt','R Delt','L Thigh','R Thigh','L Glute','R Glute'];
var PEP_BAC_DEFAULT_DAYS=28;

// Starting protocol. Every field is editable in-app — these are only the
// values the vials were set up with, not a prescription.
function defaultPeptides(){
  return [
    {id:'klow',name:'KLOW Blend',active:true,
     vialMg:80,bacMl:3,reconDate:'2026-08-07',bacDays:28,
     comps:[{n:'GHK-Cu',mg:50},{n:'BPC-157',mg:10},{n:'TB-500',mg:10},{n:'KPV',mg:10}],
     doseUnits:5,presets:[5,8,10],freq:'training',days:[1,2,3,4,5],everyN:2,time:'AM',route:'SubQ',
     sites:['L Abdo','R Abdo','L Delt','R Delt','L Thigh','R Thigh'],siteIdx:0,
     cycleStart:'2026-08-07',cycleWeeks:16,
     notes:'80mg blend at 5:1:1:1 \u2014 GHK-Cu 50 / BPC-157 10 / TB-500 10 / KPV 10.\n\nMIXED WITH 3mL BAC WATER = 26.7mg/mL, so 1 unit = 267mcg of blend. Vial holds 300 units.\n\n5 units = 1333mcg: GHK-Cu 833mcg, BPC-157 167mcg, TB-500 167mcg, KPV 167mcg.\n8 units = 2133mcg: GHK-Cu 1.33mg, and 267mcg of each of the other three.\n10 units = 2667mcg: GHK-Cu 1.67mg, and 333mcg of each.\n\nTap the 5 / 8 / 10 chips on the card to change dose \u2014 the vial gauge recalculates instantly.\n\nTRAINING DAYS ONLY. At 5 days a week: 5u = 60 doses (12 wks), 8u = 37 (7.4 wks), 10u = 30 (6 wks).\nTrain less in a given week and the vial simply stretches further. The cycle bar is a loose guide \u2014 the VIAL gauge is the real endpoint.\n\nRotate sites every shot \u2014 GHK-Cu stings and can leave a temporary reddish weal. Food and time of day do not matter for this one.\n\nAT 5 UNITS BPC-157 IS 167mcg, under the usual 250-500mcg range. If you are chasing a specific injury, 8-10 units puts every component back in its normal window.'},
    {id:'cjcipa',name:'CJC-1295 no DAC + Ipamorelin',active:true,
     vialMg:10,bacMl:2,reconDate:'2026-08-07',bacDays:28,
     comps:[{n:'CJC-1295',mg:5},{n:'Ipamorelin',mg:5}],
     doseUnits:5,presets:[5,8,10],freq:'training',days:[1,2,3,4,5],everyN:2,time:'BED',route:'SubQ',
     sites:['L Abdo','R Abdo','L Delt','R Delt'],siteIdx:0,
     cycleStart:'2026-08-07',cycleWeeks:11,
     notes:'10mg blend, 5mg CJC-1295 + 5mg Ipamorelin.\n\nMIXED WITH 2mL BAC WATER = 5mg/mL, so 1 unit = 50mcg of blend (25mcg of each). Vial holds 200 units.\n\n5 units = 125mcg of each. 8 units = 200mcg of each. 10 units = 250mcg of each.\n\nTRAINING DAYS ONLY. At 5 days a week: 5u = 40 doses (8 wks), 8u = 25 (5 wks), 10u = 20 (4 wks).\nTrain less in a given week and the vial stretches further. Watch the VIAL gauge, not the cycle bar.\n\nTIMING IS THE WHOLE POINT: inject before bed, at least 2 hours after your last meal. Carbs and fat blunt the GH pulse this stack exists to create.\n\n5 units is already past the dose that saturates the GH pulse, so going higher mostly burns through the vial faster rather than buying more effect. This is the one where the low end is genuinely fine.\n\nNote: GH-stack protocols are usually run independently of training rather than only on lift days \u2014 tied to training here because that is how you asked for it.'}
  ];
}

// ════════════════════════════════
// UTILS
// ════════════════════════════════
function closeModal(id){el(id).classList.remove('visible');}
function showToast(msg){
  var t=el('toast');
  if(!t||el('main-app').style.display==='none'){var tmp=document.createElement('div');tmp.style.cssText='position:fixed;bottom:40px;left:50%;transform:translateX(-50%);background:#0f1520;border:1px solid rgba(79,195,247,.3);color:#4fc3f7;padding:8px 16px;border-radius:2px;font-family:Orbitron,sans-serif;font-size:9px;letter-spacing:.1em;z-index:700;white-space:nowrap;';tmp.textContent=msg;document.body.appendChild(tmp);setTimeout(function(){if(tmp.parentNode)tmp.parentNode.removeChild(tmp);},2200);return;}
  t.classList.remove('actionable');
  t.textContent=msg;t.classList.add('show');
  if(t._timer)clearTimeout(t._timer);
  t._timer=setTimeout(function(){t.classList.remove('show');},2200);
}
function showActionToast(msg,label,fn,dur){
  var t=el('toast');
  if(!t||el('main-app').style.display==='none'){showToast(msg);return;}
  t.textContent=msg+' ';
  var b=document.createElement('button');
  b.className='toast-act';b.textContent=label;
  b.onclick=function(){
    t.classList.remove('show','actionable');
    if(t._timer)clearTimeout(t._timer);
    fn();
  };
  t.appendChild(b);
  t.classList.add('show','actionable');
  if(t._timer)clearTimeout(t._timer);
  t._timer=setTimeout(function(){t.classList.remove('show','actionable');},dur||6000);
}
