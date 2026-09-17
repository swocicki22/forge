// ════════════════════════════════
// PEPTIDE PROTOCOL
// ════════════════════════════════
function pepById(id){for(var i=0;i<S.peptides.length;i++){if(S.peptides[i].id===id)return S.peptides[i];}return null;}
function pepNewId(){return 'p'+Date.now().toString(36)+Math.floor(Math.random()*1000).toString(36);}
function parseKey(k){if(!k||typeof k!=='string')return null;var a=k.split('-');var d=new Date(+a[0],(+a[1])-1,+a[2]);return isNaN(d.getTime())?null:d;}
function dayDiff(a,b){return Math.round((b.getTime()-a.getTime())/86400000);}

// mcg delivered per 1 unit on a U-100 syringe (1 unit = 0.01 mL)
function pepConc(p){var mg=parseFloat(p.vialMg)||0,ml=parseFloat(p.bacMl)||0;if(!mg||!ml)return 0;return (mg*1000)/ml/100;}
function pepMcg(p,u){var units=(u===undefined||u===null)?(parseFloat(p.doseUnits)||0):(parseFloat(u)||0);return pepConc(p)*units;}
function fmtMcg(v){if(v>=1000)return (Math.round(v/10)/100)+'mg';return Math.round(v)+'mcg';}
function pepComps(p,u){
  var tot=0,i,out=[];var cs=p.comps||[];
  for(i=0;i<cs.length;i++)tot+=parseFloat(cs[i].mg)||0;
  var dose=pepMcg(p,u);
  for(i=0;i<cs.length;i++)out.push({n:cs[i].n,mcg:tot?((parseFloat(cs[i].mg)||0)/tot*dose):0});
  return out;
}
function pepFreqLabel(p){
  if(p.freq==='daily')return 'DAILY';
  if(p.freq==='training')return 'TRAINING DAYS';
  if(p.freq==='eod')return 'EVERY OTHER DAY';
  if(p.freq==='everyn')return 'EVERY '+(parseInt(p.everyN,10)||2)+' DAYS';
  var dn=['SU','MO','TU','WE','TH','FR','SA'],o=[],i;
  for(i=0;i<7;i++)if((p.days||[]).indexOf(i)>=0)o.push(dn[i]);
  if(o.length===7)return 'DAILY';
  return o.length?o.join(' '):'NO DAYS SET';
}
function pepCycle(p){
  var s=parseKey(p.cycleStart);if(!s)return null;
  var t=parseKey(todayKey());
  var total=(parseInt(p.cycleWeeks,10)||0)*7;
  var day=dayDiff(s,t)+1;
  return {day:day,total:total,left:total?(total-day+1):0,done:total?(day>total):false,pending:day<1};
}
function pepDue(p,key){
  if(!p.active)return false;
  var d=parseKey(key);if(!d)return false;
  var st=parseKey(p.cycleStart);
  if(st){
    if(dayDiff(st,d)<0)return false;
    var total=(parseInt(p.cycleWeeks,10)||0)*7;
    if(total&&dayDiff(st,d)>=total)return false;
  }
  if(p.freq==='daily')return true;
  if(p.freq==='training')return pepTrainedOn(key);
  if(p.freq==='days')return (p.days||[]).indexOf(d.getDay())>=0;
  var anchor=st||d;
  if(p.freq==='eod'){var df=dayDiff(anchor,d);return ((df%2)+2)%2===0;}
  if(p.freq==='everyn'){var n=parseInt(p.everyN,10)||2;if(n<1)n=1;var dn2=dayDiff(anchor,d);return ((dn2%n)+n)%n===0;}
  return true;
}
// Did a workout get logged on this date? Drives freq:'training'.
function pepTrainedOn(key){
  if(!S.log||!S.log.length)return false;
  for(var i=S.log.length-1;i>=0;i--){
    var d=S.log[i]&&S.log[i].date;
    if(!d)continue;
    var dd=new Date(d);
    if(isNaN(dd.getTime()))continue;
    if(dateKey(dd)===key)return true;
  }
  return false;
}
function pepLogsFor(pid,key){var d=S.pepLog[key];if(!d)return [];return d[pid]||[];}
function pepNextSite(p){var sl=(p.sites&&p.sites.length)?p.sites:PEP_SITES;return sl[((p.siteIdx||0)%sl.length+sl.length)%sl.length];}
function pepUsedMl(p){
  var tot=0,k,arr,i;
  for(k in S.pepLog){
    if(!S.pepLog.hasOwnProperty(k))continue;
    arr=S.pepLog[k][p.id];if(!arr)continue;
    for(i=0;i<arr.length;i++)tot+=(parseFloat(arr[i].u)||0)*0.01;
  }
  return tot;
}
function pepVial(p){
  var ml=parseFloat(p.bacMl)||0;
  var used=pepUsedMl(p);
  var left=Math.max(0,ml-used);
  // Summing 0.01mL increments accumulates float error; anything under a
  // microlitre is empty, and the dose count needs a tolerance wide enough
  // that a full final dose is not rounded away after dozens of draws.
  if(left<1e-6)left=0;
  var per=(parseFloat(p.doseUnits)||0)*0.01;
  return {ml:ml,used:used,left:left,doses:per?Math.floor(left/per+1e-6):0,pct:ml?Math.max(0,Math.min(100,Math.round(left/ml*100))):0};
}
function pepBacAge(p){var r=parseKey(p.reconDate);if(!r)return null;return dayDiff(r,parseKey(todayKey()));}

function logPepDose(pid,units,site,note,timeStr){
  var p=pepById(pid);if(!p)return;
  var key=todayKey();
  if(!S.pepLog[key])S.pepLog[key]={};
  if(!S.pepLog[key][pid])S.pepLog[key][pid]=[];
  var now=new Date();
  S.pepLog[key][pid].push({
    t:timeStr||(('0'+now.getHours()).slice(-2)+':'+('0'+now.getMinutes()).slice(-2)),
    u:parseFloat(units)||0,
    mcg:Math.round(pepMcg(p,units)),
    site:site||'',
    note:note||''
  });
  var sl=(p.sites&&p.sites.length)?p.sites:PEP_SITES;
  var idx=sl.indexOf(site);
  p.siteIdx=(((idx>=0?idx:(p.siteIdx||0))+1)%sl.length+sl.length)%sl.length;
  if(!p.reconDate)p.reconDate=key;
  if(!p.cycleStart)p.cycleStart=key;
  saveState();
}
function setPepDose(pid,units){
  var p=pepById(pid);if(!p)return;
  p.doseUnits=units;
  saveState();renderBody();
  showToast(units+'U = '+fmtMcg(pepMcg(p)));
}
function removePepDose(pid,key,i){
  var arr=(S.pepLog[key]||{})[pid];
  if(!arr)return;
  arr.splice(i,1);
  if(!arr.length)delete S.pepLog[key][pid];
  saveState();renderBody();
}

// ── SECTION RENDER ──────────────────────────────────────────────────────
function renderPeptideSection(cont){
  var t=document.createElement('div');t.className='bio-title';t.textContent='Peptide Protocol';cont.appendChild(t);
  var key=todayKey(),i;

  if(!S.peptides.length){
    var es=document.createElement('div');es.className='pep-empty';
    es.textContent='NO PEPTIDES CONFIGURED';
    cont.appendChild(es);
  }

  for(i=0;i<S.peptides.length;i++){
    (function(p){
      var logs=pepLogsFor(p.id,key);
      var due=pepDue(p,key);
      var cyc=pepCycle(p);
      var v=pepVial(p);
      var age=pepBacAge(p);
      var st='',lbl='OFF DAY';
      if(!p.active){st='';lbl='PAUSED';}
      else if(cyc&&cyc.done){st='';lbl='CYCLE DONE';}
      else if(cyc&&cyc.pending){st='';lbl='STARTS '+p.cycleStart.slice(5);}
      else if(logs.length){st='done';lbl='DONE '+logs[logs.length-1].t;}
      else if(due){st='due';lbl='DUE '+(p.time||'');}
      else if(p.freq==='training'){st='warn';lbl='AFTER LIFT';}

      var card=document.createElement('div');
      card.className='pep-card'+(logs.length?' done':((due||(p.freq==='training'&&p.active))&&p.active?' due':' off'));

      var h='<div class="pep-head"><div class="pep-name">'+esc(p.name)+'</div><div class="pep-pill '+st+'">'+esc(lbl)+'</div></div>';
      h+='<div class="pep-dose"><b>'+(parseFloat(p.doseUnits)||0)+'</b><span>units</span><span style="color:var(--s3);">/</span><span style="color:var(--hlb);">'+fmtMcg(pepMcg(p))+'</span><span style="color:var(--s3);">/</span><span>'+esc(p.route||'SubQ')+'</span></div>';
      h+='<div class="pep-sub">'+(parseFloat(p.vialMg)||0)+'mg in '+(parseFloat(p.bacMl)||0)+'mL &nbsp;=&nbsp; '+Math.round(pepConc(p))+'mcg per unit &nbsp;&middot;&nbsp; draw '+((parseFloat(p.doseUnits)||0)*0.01).toFixed(2)+'mL</div>';

      var cps=pepComps(p);
      if(cps.length>1){
        h+='<div class="pep-chips">';
        for(var j=0;j<cps.length;j++)h+='<div class="pep-chip">'+esc(cps[j].n)+' <b>'+fmtMcg(cps[j].mcg)+'</b></div>';
        h+='</div>';
      }
      h+='<div class="pep-sub" style="margin-top:7px;">'+pepFreqLabel(p)+' &nbsp;&middot;&nbsp; '+esc(p.time||'')+' &nbsp;&middot;&nbsp; NEXT SITE <span class="pep-site">'+esc(pepNextSite(p))+'</span></div>';

      if(cyc&&cyc.total){
        var cd=Math.max(0,Math.min(cyc.total,cyc.day));
        var cpct=Math.round(cd/cyc.total*100);
        h+='<div class="pep-meter"><div class="pep-meter-lbl"><span>CYCLE</span><span>DAY '+cd+' / '+cyc.total+(cyc.done?' &mdash; COMPLETE':(cyc.pending?'':' &middot; '+Math.max(0,cyc.left)+'D LEFT'))+'</span></div><div class="pep-bar"><div class="pep-bar-f" style="width:'+cpct+'%;background:'+(cyc.done?'var(--gr)':'var(--hl)')+';"></div></div></div>';
      }
      h+='<div class="pep-meter"><div class="pep-meter-lbl"><span>VIAL</span><span>'+v.left.toFixed(2)+'mL &middot; ~'+v.doses+' DOSES LEFT</span></div><div class="pep-bar"><div class="pep-bar-f" style="width:'+v.pct+'%;background:'+(v.pct<20?'var(--am)':'var(--hl)')+';"></div></div></div>';

      if(age!==null){
        var lim=parseInt(p.bacDays,10)||PEP_BAC_DEFAULT_DAYS;
        var rem=lim-age;
        h+='<div class="pep-sub" style="margin-top:6px;color:'+(rem<=5?'var(--am)':'var(--s2)')+';">MIXED '+age+'D AGO &middot; '+(rem>0?rem+'D BEFORE DISCARD':'PAST THE '+lim+'-DAY WINDOW')+'</div>';
      }

      var pre=(p.presets&&p.presets.length)?p.presets:[];
      if(pre.length){
        h+='<div class="pep-presets"><span class="pep-presets-lbl">DOSE</span>';
        for(var q=0;q<pre.length;q++){
          var pu=pre[q];
          h+='<div class="pep-preset'+((parseFloat(p.doseUnits)||0)===pu?' on':'')+'" data-pre="'+pu+'">'+pu+'u</div>';
        }
        h+='</div>';
        var curV=pepVial(p);
        h+='<div class="pep-sub" style="margin-top:4px;">at '+(parseFloat(p.doseUnits)||0)+'u &rarr; '+fmtMcg(pepMcg(p))+' per shot &middot; '+curV.doses+' doses left'+(curV.doses?' &middot; ~'+(Math.round(curV.doses/5*10)/10)+' wks at 5/wk':'')+'</div>';
      }
      h+='<div class="pep-grid14">';
      for(var d=13;d>=0;d--){
        var dd=new Date();dd.setDate(dd.getDate()-d);
        var kk=dateKey(dd);
        var wasDue=pepDue(p,kk);
        var hit=pepLogsFor(p.id,kk).length>0;
        var cls=hit?'hit':(wasDue?(d===0?'':'miss'):'na');
        h+='<div class="pep-d '+cls+(d===0?' today':'')+'"></div>';
      }
      h+='</div>';

      for(var L=0;L<logs.length;L++){
        h+='<div class="pep-logline"><span style="color:var(--gr);">&#10003;</span><span>'+esc(logs[L].t)+'</span><span>'+(logs[L].u)+'u</span><span style="color:var(--s3);">'+fmtMcg(logs[L].mcg||pepMcg(p,logs[L].u))+'</span><span style="color:var(--am);">'+esc(logs[L].site||'')+'</span><span class="x" data-rm="'+L+'">&#10005;</span></div>';
      }

      h+='<div class="pep-acts"><button class="pep-btn'+(logs.length?' g':'')+'" data-act="log">'+(logs.length?'LOG ANOTHER':'LOG DOSE')+'</button><button class="pep-btn sm" data-act="edit">EDIT</button></div>';

      card.innerHTML=h;
      var lb=card.querySelector('[data-act="log"]');
      lb.onclick=function(){openPepLog(p.id);};
      card.querySelector('[data-act="edit"]').onclick=function(){openPepEditor(p.id);};
      var pres=card.querySelectorAll('[data-pre]');
      for(var q2=0;q2<pres.length;q2++){
        (function(u){pres[q2].onclick=function(e){e.stopPropagation();setPepDose(p.id,u);};})(parseFloat(pres[q2].getAttribute('data-pre')));
      }
      var rms=card.querySelectorAll('[data-rm]');
      for(var r=0;r<rms.length;r++){
        (function(idx){rms[r].onclick=function(e){e.stopPropagation();removePepDose(p.id,key,idx);};})(parseInt(rms[r].getAttribute('data-rm'),10));
      }
      cont.appendChild(card);

      if(p.notes){
        var nb=document.createElement('div');
        nb.className='pep-sub';
        nb.style.cssText='padding:2px 4px 9px;white-space:pre-wrap;';
        nb.textContent=p.notes;
        cont.appendChild(nb);
      }
    })(S.peptides[i]);
  }

  var row=document.createElement('div');row.style.cssText='display:flex;gap:5px;margin-top:5px;';
  var b1=document.createElement('button');b1.className='pep-add';b1.textContent='+ ADD PEPTIDE';b1.onclick=function(){openPepEditor(null);};
  var b2=document.createElement('button');b2.className='pep-add';b2.textContent='RECON CALC';b2.onclick=openRecon;
  var b3=document.createElement('button');b3.className='pep-add';b3.textContent='HISTORY';b3.onclick=openPepHist;
  row.appendChild(b1);row.appendChild(b2);row.appendChild(b3);
  cont.appendChild(row);

  var warn=document.createElement('div');warn.className='pep-note';warn.style.marginTop='8px';
  warn.textContent='These are research compounds, not FDA-approved drugs. The app tracks the numbers you enter — it does not verify them. Confirm dose, cycle length and site technique with whoever supplied and supervises them.';
  cont.appendChild(warn);
}

// ── EDITOR ──────────────────────────────────────────────────────────────
var pepEditId=null,pepEditComps=[],pepEditFreq='daily',pepEditDays=[],pepEditSites=[],pepEditActive=true;

function openPepEditor(id){
  pepEditId=id;
  var p=id?pepById(id):null;
  el('pep-mo-title').textContent=p?'EDIT PEPTIDE':'ADD PEPTIDE';
  el('pf-del-btn').style.display=p?'block':'none';
  el('pf-name').value=p?p.name:'';
  el('pf-vial').value=p?p.vialMg:'';
  el('pf-bac').value=p?p.bacMl:'';
  el('pf-dose').value=p?p.doseUnits:'';
  el('pf-everyn').value=p?(p.everyN||2):2;
  el('pf-time').value=p?(p.time||'AM'):'AM';
  el('pf-route').value=p?(p.route||'SubQ'):'SubQ';
  el('pf-cyclestart').value=p&&p.cycleStart?p.cycleStart:'';
  el('pf-cycleweeks').value=p&&p.cycleWeeks?p.cycleWeeks:'';
  el('pf-recondate').value=p&&p.reconDate?p.reconDate:'';
  el('pf-bacdays').value=p&&p.bacDays?p.bacDays:PEP_BAC_DEFAULT_DAYS;
  el('pf-notes').value=p?(p.notes||''):'';
  pepEditComps=p?JSON.parse(JSON.stringify(p.comps||[])):[];
  pepEditDays=p?(p.days||[]).slice():[0,1,2,3,4,5,6];
  pepEditSites=p?(p.sites||PEP_SITES).slice():PEP_SITES.slice(0,6);
  pepEditActive=p?p.active!==false:true;
  pfSetFreq(p?(p.freq||'daily'):'daily');
  pfRenderComps();pfRenderSites();pfSyncActive();pfPreview();
  el('pep-mo').classList.add('visible');
}
function pfSyncActive(){var sw=el('pf-active-sw');if(pepEditActive)sw.classList.add('on');else sw.classList.remove('on');}
function pfToggleActive(){pepEditActive=!pepEditActive;pfSyncActive();}
function pfSetFreq(f){
  pepEditFreq=f;
  var btns=document.querySelectorAll('.pep-freq-btn[data-f]');
  for(var i=0;i<btns.length;i++){
    if(btns[i].getAttribute('data-f')===f)btns[i].classList.add('on');else btns[i].classList.remove('on');
  }
  el('pf-days-wrap').style.display=(f==='days')?'block':'none';
  el('pf-everyn-wrap').style.display=(f==='everyn')?'block':'none';
  el('pf-training-hint').style.display=(f==='training')?'block':'none';
  pfRenderDays();
}
function pfRenderDays(){
  var btns=el('pf-days').querySelectorAll('.pep-day-btn');
  for(var i=0;i<btns.length;i++){
    var d=parseInt(btns[i].getAttribute('data-d'),10);
    if(pepEditDays.indexOf(d)>=0)btns[i].classList.add('on');else btns[i].classList.remove('on');
  }
}
function pfToggleDay(d){
  var i=pepEditDays.indexOf(d);
  if(i>=0)pepEditDays.splice(i,1);else pepEditDays.push(d);
  pfRenderDays();
}
function pfRenderComps(){
  var w=el('pf-comps');w.innerHTML='';
  for(var i=0;i<pepEditComps.length;i++){
    (function(idx){
      var r=document.createElement('div');r.className='pep-comp-row';
      var a=document.createElement('input');a.className='fi';a.placeholder='Peptide';a.value=pepEditComps[idx].n||'';
      a.oninput=function(){pepEditComps[idx].n=a.value;};
      var b=document.createElement('input');b.className='fi';b.type='number';b.step='any';b.placeholder='mg';b.value=(pepEditComps[idx].mg===null||pepEditComps[idx].mg===undefined)?'':pepEditComps[idx].mg;
      b.oninput=function(){pepEditComps[idx].mg=parseFloat(b.value)||0;pfPreview();};
      var c=document.createElement('button');c.className='pep-comp-del';c.innerHTML='&#10005;';
      c.onclick=function(){pepEditComps.splice(idx,1);pfRenderComps();pfPreview();};
      r.appendChild(a);r.appendChild(b);r.appendChild(c);w.appendChild(r);
    })(i);
  }
}
function pfAddComp(n,mg){pepEditComps.push({n:n||'',mg:mg||0});pfRenderComps();}
function pfRenderSites(){
  var w=el('pf-sites');w.innerHTML='';
  for(var i=0;i<PEP_SITES.length;i++){
    (function(site){
      var b=document.createElement('div');
      b.className='pep-site-btn'+(pepEditSites.indexOf(site)>=0?' on':'');
      b.textContent=site;
      b.onclick=function(){
        var k=pepEditSites.indexOf(site);
        if(k>=0)pepEditSites.splice(k,1);else pepEditSites.push(site);
        pfRenderSites();
      };
      w.appendChild(b);
    })(PEP_SITES[i]);
  }
}
function pfPreview(){
  var mg=parseFloat(el('pf-vial').value)||0;
  var ml=parseFloat(el('pf-bac').value)||0;
  var u=parseFloat(el('pf-dose').value)||0;
  if(!mg||!ml){el('pf-preview').innerHTML='Enter vial mg and BAC water mL.';return;}
  var per=(mg*1000)/ml/100;
  var dose=per*u;
  var txt=Math.round(mg/ml*100)/100+' mg/mL &nbsp;&middot;&nbsp; '+Math.round(per)+' mcg per unit<br/>'+u+' units = <b>'+fmtMcg(dose)+'</b> ('+(u*0.01).toFixed(2)+' mL)';
  var tot=0,i;
  for(i=0;i<pepEditComps.length;i++)tot+=parseFloat(pepEditComps[i].mg)||0;
  if(pepEditComps.length>1&&tot>0){
    var parts=[];
    for(i=0;i<pepEditComps.length;i++)parts.push(esc(pepEditComps[i].n||'?')+' '+fmtMcg((parseFloat(pepEditComps[i].mg)||0)/tot*dose));
    txt+='<br/>'+parts.join(' &middot; ');
    if(Math.abs(tot-mg)>0.001)txt+='<br/><span style="color:var(--am);">Components total '+tot+'mg but vial says '+mg+'mg.</span>';
  }
  if(u>0){
    var doses=Math.floor((ml+1e-9)/(u*0.01));
    txt+='<br/><span style="color:var(--s2);">Vial holds ~'+doses+' doses at this size.</span>';
  }
  el('pf-preview').innerHTML=txt;
}
function savePeptide(){
  var name=el('pf-name').value.trim();
  if(!name){showToast('NAME REQUIRED');return;}
  var mg=parseFloat(el('pf-vial').value)||0;
  var ml=parseFloat(el('pf-bac').value)||0;
  var u=parseFloat(el('pf-dose').value)||0;
  if(mg<=0||ml<=0){showToast('VIAL MG AND BAC ML REQUIRED');return;}
  if(u<=0){showToast('DOSE MUST BE > 0');return;}
  if(u>100){showToast('OVER 100 UNITS — CHECK THAT');return;}
  if(pepEditFreq==='days'&&!pepEditDays.length){showToast('PICK AT LEAST ONE DAY');return;}
  var comps=[];
  for(var i=0;i<pepEditComps.length;i++){
    if((pepEditComps[i].n||'').trim())comps.push({n:pepEditComps[i].n.trim(),mg:parseFloat(pepEditComps[i].mg)||0});
  }
  var p=pepEditId?pepById(pepEditId):null;
  var isNew=!p;
  if(!p){p={id:pepNewId(),siteIdx:0};S.peptides.push(p);}
  p.name=name;p.vialMg=mg;p.bacMl=ml;p.doseUnits=u;
  p.comps=comps;
  p.freq=pepEditFreq;
  p.days=pepEditDays.slice();
  if(!p.presets)p.presets=[5,8,10];
  p.everyN=parseInt(el('pf-everyn').value,10)||2;
  p.time=el('pf-time').value;
  p.route=el('pf-route').value;
  p.sites=pepEditSites.length?pepEditSites.slice():PEP_SITES.slice();
  p.cycleStart=el('pf-cyclestart').value||null;
  p.cycleWeeks=parseInt(el('pf-cycleweeks').value,10)||0;
  p.reconDate=el('pf-recondate').value||null;
  p.bacDays=parseInt(el('pf-bacdays').value,10)||PEP_BAC_DEFAULT_DAYS;
  p.notes=el('pf-notes').value;
  p.active=pepEditActive;
  if(p.siteIdx===undefined||p.siteIdx===null)p.siteIdx=0;
  saveState();closeModal('pep-mo');renderBody();
  showToast(isNew?'PEPTIDE ADDED':'SAVED');
}
function deletePeptide(){
  if(!pepEditId)return;
  if(!confirm('Delete this peptide? Logged doses stay in your history.'))return;
  for(var i=0;i<S.peptides.length;i++){
    if(S.peptides[i].id===pepEditId){S.peptides.splice(i,1);break;}
  }
  saveState();closeModal('pep-mo');renderBody();showToast('DELETED');
}

// ── LOG DOSE ────────────────────────────────────────────────────────────
var pepLogId=null,pepLogSite='';
function openPepLog(id){
  var p=pepById(id);if(!p)return;
  pepLogId=id;
  pepLogSite=pepNextSite(p);
  el('pep-log-title').textContent='LOG '+p.name.toUpperCase();
  el('pl-units').value=p.doseUnits;
  var now=new Date();
  el('pl-time').value=('0'+now.getHours()).slice(-2)+':'+('0'+now.getMinutes()).slice(-2);
  el('pl-note').value='';
  var tw=el('pl-ticks');tw.innerHTML='';
  for(var i=0;i<10;i++){var tk=document.createElement('div');tk.className='syr-tick';tw.appendChild(tk);}
  plRenderSites();plPreview();
  el('pep-log-mo').classList.add('visible');
}
function plRenderSites(){
  var p=pepById(pepLogId);if(!p)return;
  var sl=(p.sites&&p.sites.length)?p.sites:PEP_SITES;
  var w=el('pl-sites');w.innerHTML='';
  for(var i=0;i<sl.length;i++){
    (function(site){
      var b=document.createElement('div');
      b.className='pep-site-btn'+(site===pepLogSite?' on':'');
      b.textContent=site;
      b.onclick=function(){pepLogSite=site;plRenderSites();};
      w.appendChild(b);
    })(sl[i]);
  }
}
function plStep(d){
  var v=parseFloat(el('pl-units').value)||0;
  v=Math.round((v+d)*100)/100;
  if(v<0)v=0;
  el('pl-units').value=v;plPreview();
}
function plPreview(){
  var p=pepById(pepLogId);if(!p)return;
  var u=parseFloat(el('pl-units').value)||0;
  var txt=u+' units = <b>'+fmtMcg(pepMcg(p,u))+'</b> &nbsp;&middot;&nbsp; '+(u*0.01).toFixed(2)+' mL';
  var cps=pepComps(p,u);
  if(cps.length>1){
    var parts=[];
    for(var i=0;i<cps.length;i++)parts.push(esc(cps[i].n)+' '+fmtMcg(cps[i].mcg));
    txt+='<br/>'+parts.join(' &middot; ');
  }
  var v=pepVial(p);
  if(v.left<u*0.01)txt+='<br/><span style="color:var(--am);">Only '+v.left.toFixed(2)+'mL left in this vial.</span>';
  el('pl-preview').innerHTML=txt;
  el('pl-syr').style.width=Math.max(0,Math.min(100,u))+'%';
}
function savePepDose(){
  var u=parseFloat(el('pl-units').value)||0;
  if(u<=0){showToast('DOSE MUST BE > 0');return;}
  if(u>100){showToast('OVER 100 UNITS — CHECK THAT');return;}
  logPepDose(pepLogId,u,pepLogSite,el('pl-note').value.trim(),el('pl-time').value);
  closeModal('pep-log-mo');renderBody();showToast('DOSE LOGGED');
}

// ── RECONSTITUTION CALCULATOR ───────────────────────────────────────────
var rcSolve='dose';
function openRecon(){
  var sel=el('rc-pick');
  sel.innerHTML='<option value="">— manual entry —</option>';
  for(var i=0;i<S.peptides.length;i++){
    var o=document.createElement('option');o.value=S.peptides[i].id;o.textContent=S.peptides[i].name;sel.appendChild(o);
  }
  var tw=el('rc-ticks');tw.innerHTML='';
  for(var j=0;j<10;j++){var tk=document.createElement('div');tk.className='syr-tick';tw.appendChild(tk);}
  rcCalc();
  el('recon-mo').classList.add('visible');
}
function rcLoad(){
  var p=pepById(el('rc-pick').value);
  if(!p){rcCalc();return;}
  el('rc-mg').value=p.vialMg;
  el('rc-ml').value=p.bacMl;
  el('rc-units').value=p.doseUnits;
  el('rc-dose').value=Math.round(pepMcg(p));
  el('rc-unit').value='mcg';
  rcCalc();
}
function rcMode(m){
  rcSolve=m;
  var btns=document.querySelectorAll('.pep-freq-btn[data-m]');
  for(var i=0;i<btns.length;i++){
    if(btns[i].getAttribute('data-m')===m)btns[i].classList.add('on');else btns[i].classList.remove('on');
  }
  el('rc-dose-wrap').style.display=(m==='dose')?'block':'none';
  el('rc-units-wrap').style.display=(m==='units')?'block':'none';
  rcCalc();
}
function rcCalc(){
  var mg=parseFloat(el('rc-mg').value)||0;
  var ml=parseFloat(el('rc-ml').value)||0;
  var big=el('rc-big'),lbl=el('rc-biglbl'),rows=el('rc-rows');
  if(!mg||!ml){big.innerHTML='&mdash;';rows.innerHTML='';el('rc-syr').style.width='0%';return;}
  var perUnit=(mg*1000)/ml/100;
  var units,doseMcg;
  if(rcSolve==='dose'){
    var raw=parseFloat(el('rc-dose').value)||0;
    doseMcg=el('rc-unit').value==='mg'?raw*1000:raw;
    units=perUnit?doseMcg/perUnit:0;
    big.textContent=Math.round(units*100)/100;
    lbl.textContent='UNITS ON A U-100 SYRINGE';
  }else{
    units=parseFloat(el('rc-units').value)||0;
    doseMcg=perUnit*units;
    big.textContent=fmtMcg(doseMcg);
    lbl.textContent='PER '+units+'-UNIT INJECTION';
  }
  el('rc-syr').style.width=Math.max(0,Math.min(100,units))+'%';
  var h='';
  h+='<div class="recon-row"><span>CONCENTRATION</span><span>'+(Math.round(mg/ml*1000)/1000)+' mg/mL</span></div>';
  h+='<div class="recon-row"><span>PER UNIT (0.01 mL)</span><span>'+(Math.round(perUnit*10)/10)+' mcg</span></div>';
  h+='<div class="recon-row"><span>VOLUME DRAWN</span><span>'+(units*0.01).toFixed(3)+' mL</span></div>';
  if(units>0)h+='<div class="recon-row"><span>DOSES PER VIAL</span><span>'+Math.floor((ml+1e-9)/(units*0.01))+'</span></div>';
  if(units>100)h+='<div class="recon-row"><span style="color:var(--am);">OVER SYRINGE CAPACITY</span><span style="color:var(--am);">ADD MORE BAC WATER</span></div>';
  if(units>0&&units<3)h+='<div class="recon-row"><span style="color:var(--am);">HARD TO MEASURE</span><span style="color:var(--am);">USE MORE BAC WATER</span></div>';
  var p=pepById(el('rc-pick').value);
  if(p&&p.comps&&p.comps.length>1){
    var tot=0,i;
    for(i=0;i<p.comps.length;i++)tot+=parseFloat(p.comps[i].mg)||0;
    for(i=0;i<p.comps.length;i++){
      h+='<div class="recon-row"><span>'+esc(p.comps[i].n)+'</span><span>'+fmtMcg(tot?((parseFloat(p.comps[i].mg)||0)/tot*doseMcg):0)+'</span></div>';
    }
  }
  rows.innerHTML=h;
}

// ── HISTORY / BACKFILL ──────────────────────────────────────────────────
function openPepHist(){renderPepHist();el('pep-hist-mo').classList.add('visible');}
function renderPepHist(){
  var cont=el('pep-hist-content');cont.innerHTML='';
  for(var i=0;i<14;i++){
    var d=new Date();d.setDate(d.getDate()-i);
    var key=dateKey(d);
    var block=document.createElement('div');block.className='pep-hist-day';
    var label=i===0?'Today':i===1?'Yesterday':d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
    var hd=document.createElement('div');hd.className='pep-hist-date';
    hd.innerHTML='<span>'+label+'</span><span style="color:var(--s3);">'+key+'</span>';
    block.appendChild(hd);
    if(!S.peptides.length){
      var e=document.createElement('div');e.className='pep-sub';e.textContent='No peptides configured.';block.appendChild(e);
    }
    for(var j=0;j<S.peptides.length;j++){
      (function(p,k){
        var logs=pepLogsFor(p.id,k);
        var on=logs.length>0;
        var due=pepDue(p,k);
        var item=document.createElement('div');item.className='supp-item';item.style.marginBottom='3px';
        var detail=on?(logs.length+'x &middot; '+logs[0].u+'u &middot; '+esc(logs[0].site||'')):(due?'due — not logged':'off day');
        item.innerHTML='<div class="supp-check'+(on?' on':'')+'">'+(on?'&#10003;':'')+'</div>'
          +'<div style="flex:1;"><div class="supp-name" style="font-size:12px;">'+esc(p.name)+'</div><div class="supp-detail">'+detail+'</div></div>';
        item.onclick=function(){
          if(!S.pepLog[k])S.pepLog[k]={};
          if(pepLogsFor(p.id,k).length){delete S.pepLog[k][p.id];}
          else{
            S.pepLog[k][p.id]=[{t:'--:--',u:parseFloat(p.doseUnits)||0,mcg:Math.round(pepMcg(p)),site:pepNextSite(p),note:'backfilled'}];
          }
          saveState();renderPepHist();
        };
        block.appendChild(item);
      })(S.peptides[j],key);
    }
    cont.appendChild(block);
  }
}

var BIO_LIMITS={weight:[50,1000],height:[20,300],age:[5,120],bf:[1,80],goalweight:[50,1000],waterGoal:[8,400]};
function saveBio(){
  var fields=['weight','height','age','bf','goalweight','waterGoal'];var bad=[];
  for(var i=0;i<fields.length;i++){
    var inp=el('bio-'+fields[i]);
    if(!inp||!inp.value)continue;
    var n=parseFloat(inp.value);
    var lim=BIO_LIMITS[fields[i]];
    if(!isFinite(n)||(lim&&(n<lim[0]||n>lim[1]))){bad.push(fields[i].toUpperCase());continue;}
    S.bio[fields[i]]=n;
  }
  var sex=el('bio-sex');if(sex&&sex.value)S.bio.sex=sex.value;
  saveState();
  if(bad.length)showToast('CHECK VALUES: '+bad.join(', '));
  else showToast('VITALS SAVED');
  renderBody();
}
