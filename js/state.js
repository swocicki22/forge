// ════════════════════════════════
// APP STATE (per user)
// ════════════════════════════════
var S={log:[],prs:{},days:null,bio:{},suppLog:{},waterLog:{},bwLog:[],peptides:[],pepLog:{},activeDay:null,sets:{},start:null,tint:null,rint:null,rdur:90};
var aTab='volume';
var aMuscle='All';
var rRem=0;
var editingDayId=null;
var editingExIdx=null;
var viewingSessionIdx=null;

var lastMigrationReport=null;

function loadUserIntoApp(user){
  var data=getUserData(user.id);

  // Schema v2 → v3. Writes its own untouched backup first, repairs the known
  // data faults, and wraps the existing day list as the 'Forge' program.
  // Anything it changed is held in lastMigrationReport for the user to review.
  var mig=migrateUserData(data,user.id);
  data=mig.data;
  lastMigrationReport=mig.migrated?mig.report:null;

  S.log=data.log||[];S.prs=data.prs||{};S.days=data.days||null;S.bio=data.bio||{};
  S.suppLog=data.suppLog||{};S.waterLog=data.waterLog||{};S.bwLog=data.bwLog||[];
  S.peptides=(data.peptides===undefined||data.peptides===null)?defaultPeptides():data.peptides;
  S.pepLog=data.pepLog||{};
  S.weekStart=data.weekStart||null;
  S.lastExport=data.lastExport||null;
  S.schema=data.schema||SCHEMA_VERSION;
  S.activeDay=null;S.sets={};S.start=null;

  // Program layer. S.days is a live reference into the active program's day
  // list, so every existing S.days caller keeps working untouched.
  S.programs=data.programs||buildDefaultPrograms(data.days||null);
  S.activeProgramId=data.activeProgramId||FORGE_PID;
  S.progState=data.progState||{};
  var ap=activeProgram();
  if(ap)S.days=ap.days;

  // Periodization week was once a single global key shared by all profiles.
  if(!S.weekStart){
    var legacy=null;try{legacy=localStorage.getItem('forge_week_start');}catch(e){}
    S.weekStart=legacy?(parseInt(legacy)||Date.now()):Date.now();
  }
  // Legacy unpadded date keys (2026-6-9 → 2026-06-09). The v3 migration
  // handles these, but this stays for data arriving through import.
  migrateDateKeys(S.suppLog);migrateDateKeys(S.waterLog);migrateDateKeys(S.pepLog);
  if(S.bio&&S.bio.ifData&&S.bio.ifData.log)migrateDateKeys(S.bio.ifData.log);
  if(S.bio&&S.bio.dietLog)migrateDateKeys(S.bio.dietLog);

  if(!S.days)S.days=buildPresets();
  else if(!ap||ap.id===FORGE_PID){
    var synced=syncMissingDays();if(synced)showToast('NEW DAYS ADDED');
  }
  saveState();
  if(lastMigrationReport&&lastMigrationReport.length)showMigrationNotice();
  el('chip-name').textContent=user.name.toUpperCase();
  el('chip-dot').style.background=user.color;
  aTab='volume';
  renderHome();renderSel();renderLib();
  checkActiveSession();
}
function migrateDateKeys(obj){
  if(!obj)return;
  var keys=[];for(var k in obj)keys.push(k);
  for(var i=0;i<keys.length;i++){
    var k=keys[i];
    var m=k.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if(m&&(m[2].length===1||m[3].length===1)){
      var nk=m[1]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[3]).slice(-2);
      if(obj[nk]===undefined)obj[nk]=obj[k];
      delete obj[k];
    }
  }
}

// ════════════════════════════════
// ACTIVE SESSION PERSISTENCE
// Mid-workout state survives refreshes, tab kills, and PWA eviction.
// ════════════════════════════════
var _saT=null;
function saveActive(){
  if(!currentUserId||!S.start||!S.activeDay)return;
  lsSet('forge_active_'+currentUserId,JSON.stringify({day:S.activeDay,sets:S.sets,removedSets:S.removedSets||{},start:S.start,savedAt:Date.now()}));
}
function saveActiveDebounced(){if(_saT)clearTimeout(_saT);_saT=setTimeout(saveActive,400);}
function clearActive(){
  if(_saT){clearTimeout(_saT);_saT=null;}
  if(!currentUserId)return;
  try{localStorage.removeItem('forge_active_'+currentUserId);}catch(e){}
}
function checkActiveSession(){
  var raw=null;try{raw=localStorage.getItem('forge_active_'+currentUserId);}catch(e){}
  if(!raw)return;
  var snap=null;try{snap=JSON.parse(raw);}catch(e){clearActive();return;}
  if(!snap||!snap.day||!snap.sets||!snap.start){clearActive();return;}
  if(Date.now()-(snap.savedAt||0)>12*3600*1000){clearActive();return;}
  pendingResume=snap;
  var mins=Math.floor((Date.now()-snap.start)/60000);
  el('resume-info').textContent=(snap.day.name||'SESSION').toUpperCase()+' — STARTED '+mins+' MIN AGO';
  el('resume-mo').classList.add('visible');
}
function resumeActiveSession(){
  if(!pendingResume){closeModal('resume-mo');return;}
  S.activeDay=pendingResume.day;S.sets=pendingResume.sets;S.removedSets=pendingResume.removedSets||{};S.start=pendingResume.start;
  pendingResume=null;
  var wd=getWeekData();
  el('wtitle').textContent='DAY '+S.activeDay.lbl+' — '+S.activeDay.name.toUpperCase();
  updateWkChip();
  closeModal('resume-mo');
  renderActive();showScreen('s-active');startTmr();requestWakeLock();
  showToast('SESSION RESUMED');
}
function discardActiveSession(){
  pendingResume=null;clearActive();closeModal('resume-mo');
  showToast('SESSION DISCARDED');
}

// ════════════════════════════════
// SCREEN WAKE LOCK — keep display on during a session
// ════════════════════════════════
var _wakeLock=null;
function requestWakeLock(){
  try{
    if(navigator.wakeLock&&navigator.wakeLock.request){
      navigator.wakeLock.request('screen').then(function(wl){_wakeLock=wl;}).catch(function(){});
    }
  }catch(e){}
}
function releaseWakeLock(){
  try{if(_wakeLock){_wakeLock.release().catch(function(){});_wakeLock=null;}}catch(e){}
}
document.addEventListener('visibilitychange',function(){
  if(!document.hidden&&S.start&&currentUserId)requestWakeLock();
});

function saveState(){
  if(!currentUserId)return;
  saveUserData(currentUserId,{log:S.log,prs:S.prs,days:S.days,bio:S.bio,
    suppLog:S.suppLog,waterLog:S.waterLog,bwLog:S.bwLog,peptides:S.peptides,
    pepLog:S.pepLog,weekStart:S.weekStart,lastExport:S.lastExport,
    schema:S.schema||SCHEMA_VERSION,programs:S.programs,
    activeProgramId:S.activeProgramId,progState:S.progState});
}

function el(id){return document.getElementById(id);}
function dateKey(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
function todayKey(){return dateKey(new Date());}

// ════════════════════════════════
// SESSION-ONLY DAY COPY
// ════════════════════════════════
// startWkt() deep-copies the day it starts, so edits made during a session
// never reach the saved program structure. An abandoned wrapper used to be
// captured here (`var originalStartWkt = startWkt`) but was never called, and
// as a cross-file load-time reference it threw before workout.js had loaded.
// The deep copy it was meant to add is already inline in startWkt itself.
