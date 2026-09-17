// ════════════════════════════════
// BACKUP & RESTORE
// ════════════════════════════════
function exportBackup(){
  if(!currentUserId)return;
  var users=loadUsers();
  var user=null;
  for(var i=0;i<users.length;i++){if(users[i].id===currentUserId){user=users[i];break;}}
  if(!user)return;
  S.lastExport=new Date().toISOString();
  saveState();
  var backup={
    version:2,
    exportDate:S.lastExport,
    profile:{id:user.id,name:user.name,color:user.color},
    data:{
      log:S.log,
      prs:S.prs,
      days:S.days,
      bio:S.bio,
      suppLog:S.suppLog,
      waterLog:S.waterLog,
      bwLog:S.bwLog,
      peptides:S.peptides,
      pepLog:S.pepLog,
      weekStart:S.weekStart
    }
  };
  var json=JSON.stringify(backup,null,2);
  var blob=new Blob([json],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;
  var d=new Date();
  var safeName=(user.name||'user').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'')||'user';
  a.download='forge_backup_'+safeName+'_'
    +d.getFullYear()+('0'+(d.getMonth()+1)).slice(-2)+('0'+d.getDate()).slice(-2)+'.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('BACKUP EXPORTED');
}

// Storage panel in profile settings
function renderStorageInfo(){
  var elInfo=el('us-storage-info');
  if(!elInfo)return;
  var localBytes=0;
  try{
    for(var i=0;i<localStorage.length;i++){
      var k=localStorage.key(i);
      if(k&&k.indexOf('forge_')===0)localBytes+=((localStorage.getItem(k)||'').length+k.length)*2;
    }
  }catch(e){}
  var kb=Math.round(localBytes/1024);
  var pct=Math.min(100,Math.round(localBytes/(5*1024*1024)*100));
  var html='BUILD: v'+APP_VERSION+'<br>APP DATA: '+kb+' KB OF ~5 MB ('+pct+'%)';
  if(S.lastExport)html+='<br>LAST EXPORT: '+new Date(S.lastExport).toLocaleDateString();
  else html+='<br>LAST EXPORT: NEVER';
  html+='<div class="storage-bar"><div class="storage-fill" style="width:'+Math.max(pct,2)+'%;'+(pct>80?'background:var(--danger);':'')+'"></div></div>';
  elInfo.innerHTML=html;
  if(navigator.storage&&navigator.storage.estimate){
    navigator.storage.estimate().then(function(est){
      if(!est||!est.quota)return;
      var line=document.createElement('div');
      line.style.cssText='margin-top:4px;color:var(--s3);';
      line.textContent='DEVICE QUOTA: '+Math.round((est.usage||0)/1048576)+' / '+Math.round(est.quota/1048576)+' MB';
      elInfo.appendChild(line);
    }).catch(function(){});
  }
}

function validateBackup(b){
  if(!b||typeof b!=='object'||Array.isArray(b))return 'INVALID STRUCTURE';
  if(!b.version)return 'MISSING VERSION';
  if(!b.data||typeof b.data!=='object'||Array.isArray(b.data))return 'MISSING DATA BLOCK';
  var d=b.data;
  function isObj(x){return x===undefined||(x!==null&&typeof x==='object'&&!Array.isArray(x));}
  function isArr(x){return x===undefined||Array.isArray(x);}
  if(!isArr(d.log))return 'SESSION LOG CORRUPT';
  if(!isArr(d.days))return 'PROTOCOL DAYS CORRUPT';
  if(!isArr(d.bwLog))return 'BODYWEIGHT LOG CORRUPT';
  if(!isObj(d.prs))return 'PR DATA CORRUPT';
  if(!isObj(d.bio))return 'BIO DATA CORRUPT';
  if(!isObj(d.suppLog))return 'SUPPLEMENT LOG CORRUPT';
  if(!isArr(d.peptides)&&d.peptides!==null)return 'PEPTIDE LIST CORRUPT';
  if(!isObj(d.pepLog))return 'PEPTIDE LOG CORRUPT';
  if(d.peptides){for(var pi=0;pi<d.peptides.length;pi++){var pp=d.peptides[pi];if(!pp||typeof pp!=='object'||Array.isArray(pp)||typeof pp.id!=='string')return 'PEPTIDE '+(pi+1)+' CORRUPT';}}
  if(!isObj(d.waterLog))return 'WATER LOG CORRUPT';
  if(d.log){
    for(var i=0;i<d.log.length;i++){
      var w=d.log[i];
      if(!w||typeof w!=='object'||typeof w.date!=='string')return 'SESSION '+(i+1)+' CORRUPT';
      if(w.rawSets!==undefined&&(w.rawSets===null||typeof w.rawSets!=='object'||Array.isArray(w.rawSets)))return 'SESSION '+(i+1)+' SET DATA CORRUPT';
    }
  }
  if(d.days){
    for(var i=0;i<d.days.length;i++){
      var day=d.days[i];
      if(!day||typeof day!=='object'||typeof day.name!=='string'||!Array.isArray(day.ex))return 'DAY '+(i+1)+' CORRUPT';
      for(var j=0;j<day.ex.length;j++){
        var ex=day.ex[j];
        if(!ex||typeof ex!=='object'||typeof ex.name!=='string')return 'DAY '+(i+1)+' EXERCISE '+(j+1)+' CORRUPT';
      }
    }
  }
  return null;
}
function importBackup(event){
  var file=event.target.files[0];
  if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    var backup=null;
    try{backup=JSON.parse(e.target.result);}
    catch(err){showToast('RESTORE FAILED — INVALID FILE');return;}
    var err=validateBackup(backup);
    if(err){showToast('INVALID BACKUP — '+err);return;}
    pendingImport=backup;
    var d=backup.data;
    el('import-confirm-body').innerHTML=
      'PROFILE: '+esc((backup.profile&&backup.profile.name?backup.profile.name:'UNKNOWN').toUpperCase())
      +'<br>EXPORTED: '+(backup.exportDate?new Date(backup.exportDate).toLocaleDateString():'UNKNOWN')
      +'<br>SESSIONS: '+(d.log?d.log.length:0)
      +'<br>PROTOCOL DAYS: '+(d.days?d.days.length:0)
      +'<br><br>This replaces all current data for this profile. A recovery snapshot is kept so you can undo.';
    el('import-confirm-mo').classList.add('visible');
  };
  reader.readAsText(file);
  // Reset input so same file can be selected again
  event.target.value='';
}
function confirmImport(){
  if(!pendingImport){closeModal('import-confirm-mo');return;}
  // Snapshot current data so a bad restore is reversible
  lsSet('forge_preimport_'+currentUserId,JSON.stringify({log:S.log,prs:S.prs,days:S.days,bio:S.bio,suppLog:S.suppLog,waterLog:S.waterLog,bwLog:S.bwLog,peptides:S.peptides,pepLog:S.pepLog,weekStart:S.weekStart,lastExport:S.lastExport}));
  var d=pendingImport.data;
  if(d.log!==undefined)S.log=d.log;
  if(d.prs!==undefined)S.prs=d.prs;
  if(d.days!==undefined)S.days=d.days;
  if(d.bio!==undefined)S.bio=d.bio;
  if(d.suppLog!==undefined)S.suppLog=d.suppLog;
  if(d.peptides!==undefined&&d.peptides!==null)S.peptides=d.peptides;
  if(d.pepLog!==undefined)S.pepLog=d.pepLog;
  if(d.waterLog!==undefined)S.waterLog=d.waterLog;
  if(d.bwLog!==undefined)S.bwLog=d.bwLog;
  if(d.weekStart)S.weekStart=d.weekStart;
  migrateDateKeys(S.suppLog);migrateDateKeys(S.waterLog);migrateDateKeys(S.pepLog);
  if(S.bio&&S.bio.ifData&&S.bio.ifData.log)migrateDateKeys(S.bio.ifData.log);
  pendingImport=null;
  saveState();
  closeModal('import-confirm-mo');closeModal('user-settings-mo');
  renderHome();renderSel();
  showActionToast('BACKUP RESTORED','UNDO',undoImport,8000);
}
function cancelImport(){pendingImport=null;closeModal('import-confirm-mo');}
function undoImport(){
  var raw=null;
  try{raw=localStorage.getItem('forge_preimport_'+currentUserId);}catch(e){}
  if(!raw){showToast('NO SNAPSHOT FOUND');return;}
  var snap=null;
  try{snap=JSON.parse(raw);}catch(e){showToast('SNAPSHOT CORRUPT');return;}
  S.log=snap.log||[];S.prs=snap.prs||{};S.days=snap.days||buildPresets();S.bio=snap.bio||{};
  S.suppLog=snap.suppLog||{};S.waterLog=snap.waterLog||{};S.bwLog=snap.bwLog||[];
  S.peptides=(snap.peptides===undefined||snap.peptides===null)?defaultPeptides():snap.peptides;S.pepLog=snap.pepLog||{};
  if(snap.weekStart)S.weekStart=snap.weekStart;
  if(snap.lastExport)S.lastExport=snap.lastExport;
  saveState();renderHome();renderSel();
  showToast('IMPORT REVERTED');
}
