// ════════════════════════════════
// USER SYSTEM
// ════════════════════════════════
var APP_VERSION='4.5';
var USERS_KEY='forge_users_v4';
var currentUserId=null;
var pinBuffer='';
var pinMode='verify';
var pendingUserId=null;
var newUserData=null;
var pendingResume=null;
var pendingImport=null;

// ── Hardened storage: quota failures are surfaced, never swallowed ──
var storageFailed=false;
function lsSet(key,val){
  try{localStorage.setItem(key,val);storageFailed=false;return true;}
  catch(e){
    if(!storageFailed){storageFailed=true;showToast('STORAGE FULL — EXPORT A BACKUP NOW');}
    return false;
  }
}

// ── HTML escaping: every user-typed string passes through these before innerHTML ──
function esc(s){
  if(s===null||s===undefined)return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
var escAttr=esc;

// ── Haptics ──
function vibe(p){try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}}

// ── PIN hashing (SHA-256 + per-user salt; FNV fallback when crypto.subtle is absent) ──
function genSalt(){
  var a=new Uint8Array(16);
  try{crypto.getRandomValues(a);}catch(e){for(var i=0;i<16;i++)a[i]=Math.floor(Math.random()*256);}
  var s='';for(var i=0;i<16;i++)s+=('0'+a[i].toString(16)).slice(-2);return s;
}
function fnvHash(str){
  var h=0x811c9dc5;
  for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}
  return 'fnv_'+h.toString(16);
}
function hashPin(pin,salt){
  var msg=salt+'::FORGE::'+pin;
  if(window.crypto&&crypto.subtle&&crypto.subtle.digest){
    try{
      var buf=new TextEncoder().encode(msg);
      return crypto.subtle.digest('SHA-256',buf).then(function(h){
        var a=new Uint8Array(h);var s='';
        for(var i=0;i<a.length;i++)s+=('0'+a[i].toString(16)).slice(-2);
        return s;
      }).catch(function(){return fnvHash(msg);});
    }catch(e){return Promise.resolve(fnvHash(msg));}
  }
  return Promise.resolve(fnvHash(msg));
}

function loadUsers(){
  try{var u=localStorage.getItem(USERS_KEY);if(u)return JSON.parse(u);}catch(e){}
  return [];
}
function saveUsers(users){
  lsSet(USERS_KEY,JSON.stringify(users));
}
function getUserData(userId){
  try{var d=localStorage.getItem('forge_user_'+userId);if(d)return JSON.parse(d);}catch(e){}
  return {log:[],prs:{},days:null,bio:{},suppLog:{},waterLog:{},bwLog:[],peptides:null,pepLog:{},weekStart:null,lastExport:null};
}
function saveUserData(userId,data){
  return lsSet('forge_user_'+userId,JSON.stringify(data));
}

// ════════════════════════════════
// USER SETTINGS & RESET
// ════════════════════════════════

// ════════════════════════════════
// USER SETTINGS & RESET
// ════════════════════════════════
var pendingResetType=null;

function openUserSettings(){
  if(!currentUserId)return;
  var users=loadUsers();var user=null;
  for(var i=0;i<users.length;i++){if(users[i].id===currentUserId){user=users[i];break;}}
  if(!user)return;
  var data=getUserData(currentUserId);
  var sessions=data.log?data.log.length:0;
  var prs=data.prs?Object.keys(data.prs).length:0;
  var info=el('us-profile-info');
  info.innerHTML='<div class="us-profile-header">'
    +'<div class="us-avatar" style="background:'+user.color+'22;border:2px solid '+user.color+'44;color:'+user.color+'">'+esc(user.name.charAt(0).toUpperCase())+'</div>'
    +'<div><div class="us-profile-name">'+esc(user.name.toUpperCase())+'</div>'
    +'<div class="us-profile-stats">'+sessions+' sessions &nbsp;&middot;&nbsp; '+prs+' PRs</div></div>'
    +'</div>';
  renderStorageInfo();
  el('user-settings-mo').classList.add('visible');
}

function confirmReset(type){
  pendingResetType=type;
  var titles={history:'RESET WORKOUT HISTORY',all:'RESET EVERYTHING',delete:'DELETE PROFILE'};
  var bodies={
    history:'This will permanently delete:\n— All logged sessions\n— All PRs\n— Body weight entries\n— Water, supplement & peptide dose logs\n\nYour workout days, exercises and peptide setups will be kept.',
    all:'This will permanently delete:\n— All logged sessions\n— All PRs\n— Body weight entries\n— Water, supplement & peptide dose logs\n— All custom workout days\n\nWorkouts will reset to default presets. Your profile stays.',
    delete:'This will permanently delete this entire profile including all sessions, PRs, and data.\n\nThis cannot be undone.'
  };
  el('confirm-reset-title').textContent=titles[type];
  el('confirm-reset-body').textContent=bodies[type];
  closeModal('user-settings-mo');
  el('confirm-reset-mo').classList.add('visible');
}

function executeReset(){
  closeModal('confirm-reset-mo');
  if(pendingResetType==='history'){
    S.log=[];S.prs={};S.bwLog=[];S.suppLog={};S.waterLog={};S.pepLog={};S.bio={};
    S.weekStart=Date.now();
    saveState();renderHome();renderSel();showToast('HISTORY CLEARED');
  } else if(pendingResetType==='all'){
    S.log=[];S.prs={};S.bwLog=[];S.suppLog={};S.waterLog={};S.pepLog={};S.bio={};S.days=buildPresets();
    S.weekStart=Date.now();
    saveState();renderHome();renderSel();showToast('FULL RESET COMPLETE');
  } else if(pendingResetType==='delete'){
    try{
      localStorage.removeItem('forge_user_'+currentUserId);
      localStorage.removeItem('forge_active_'+currentUserId);
      localStorage.removeItem('forge_preimport_'+currentUserId);
    }catch(e){}
    releaseWakeLock();
    var users=loadUsers();
    users=users.filter(function(u){return u.id!==currentUserId;});
    saveUsers(users);
    currentUserId=null;
    if(S.tint)clearInterval(S.tint);
    if(S.rint)clearInterval(S.rint);
    skipRest();
    el('main-app').style.display='none';
    el('splash').classList.remove('hidden');
    renderSplash();
    showToast('PROFILE DELETED');
  }
  pendingResetType=null;
}
