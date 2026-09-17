// ════════════════════════════════
// HOME
// ════════════════════════════════
function uniqDates(log){var seen={},out=[];for(var i=0;i<log.length;i++){var d=new Date(log[i].date);d.setHours(0,0,0,0);var t=d.getTime();if(!seen[t]){seen[t]=1;out.push(t);}}out.sort(function(a,b){return b-a;});return out;}

function renderHome(){
  var h=new Date().getHours();
  el('htag').textContent=h<12?'Morning Protocol':h<17?'Afternoon Protocol':'Evening Protocol';
  el('stw').textContent=S.log.length;
  el('stp').textContent=Object.keys(S.prs).length;
  var streak=0;var today=new Date();today.setHours(0,0,0,0);
  var ld=uniqDates(S.log);
  if(ld.length){
    var yesterday=new Date(today);yesterday.setDate(yesterday.getDate()-1);
    // Streak survives until a full day passes untrained: anchor the chain
    // at today if trained today, else at yesterday
    var anchor=null;
    if(ld[0]===today.getTime())anchor=today;
    else if(ld[0]===yesterday.getTime())anchor=yesterday;
    if(anchor){
      for(var i=0;i<ld.length;i++){
        var e2=new Date(anchor);e2.setDate(e2.getDate()-i);
        if(ld[i]===e2.getTime())streak++;else break;
      }
    }
  }
  el('sts').textContent=streak;
  var wd=getWeekData();
  el('week-banner-wrap').innerHTML='<div class="week-banner"><div><div style="font-family:\'Share Tech Mono\',monospace;font-size:7px;letter-spacing:.14em;color:var(--s2);text-transform:uppercase;margin-bottom:2px">Cycle</div><div class="week-num">WEEK '+wd.week+'</div></div><div style="text-align:right"><div style="font-family:\'Share Tech Mono\',monospace;font-size:7px;letter-spacing:.12em;color:var(--s2);text-transform:uppercase;margin-bottom:2px">Target Reps</div><div class="week-reps">'+(wd.repMin||wd.reps)+'-'+(wd.repMax||wd.reps)+' REPS</div><div class="week-phase">'+wd.label+'</div></div></div>';
  var alerts=getOverloadSuggestions();var alertDiv=el('overload-alerts');alertDiv.innerHTML='';
  if(alerts.length>0){var alertCard=document.createElement('div');alertCard.className='overload-alert';var txt='OVERLOAD READY: ';for(var i=0;i<alerts.length;i++){txt+=alerts[i].name+' ('+alerts[i].current+'lb → '+alerts[i].suggest+'lb)';if(i<alerts.length-1)txt+=', ';}alertCard.innerHTML='<div class="overload-icon">&#9650;</div><div class="overload-text">'+esc(txt)+'</div>';alertDiv.appendChild(alertCard);}
  var hl=el('hlist');hl.innerHTML='';
  for(var i=0;i<S.days.length;i++){
    var day=S.days[i];var mc=0;for(var j=0;j<day.ex.length;j++){if(day.ex[j].type!=='Core')mc++;}
    var hasAb=false;for(var j=0;j<day.ex.length;j++){if(day.ex[j].type==='Core'){hasAb=true;break;}}
    var c=document.createElement('div');c.className='pc'+(day.rest?' rest-day':'');
    c.innerHTML='<div class="pd">'+day.lbl+'</div><div class="pdv"></div><div class="pi"><div class="pn">'+esc(day.name)+'</div><div class="pm">'+esc(day.tag)+(day.rest?' — REST DAY':' — '+mc+' EX'+(hasAb?' + AB-X':''))+'</div></div><div class="pa">&#9658;</div>';
    (function(id){c.onclick=function(){var d=getDay(id);if(d&&!d.rest)startWkt(id);else showToast('REST DAY');};})(day.id);
    hl.appendChild(c);
  }
  var rl=el('rlist');
  if(!S.log.length){rl.innerHTML='<div class="es"><div class="ei">NO SESSIONS YET</div><div class="esb">Begin a training protocol.</div></div>';return;}
  rl.innerHTML='';
  var recent=S.log.slice().reverse().slice(0,5);
  for(var i=0;i<recent.length;i++){
    var w=recent[i];var d2=new Date(w.date);var globalIdx=S.log.length-1-i;
    var item=document.createElement('div');item.className='li';
    item.innerHTML='<div class="ld">'+w.lbl+'</div><div style="width:1px;height:20px;background:var(--bl);flex-shrink:0;"></div><div class="lin"><div class="ln">'+esc(w.name)+'<span style="font-family:\'Orbitron\',sans-serif;font-size:6px;color:var(--am);margin-left:7px">WK'+(w.week||1)+'</span></div><div class="lm">'+d2.toLocaleDateString()+' — '+w.dur+' — '+w.sets+' sets</div></div><div class="lv">'+w.vol.toLocaleString()+'<br><span style="font-size:6px;color:var(--s3)">LBS</span></div>';
    (function(idx){item.onclick=function(){viewSession(idx);};})(globalIdx);
    rl.appendChild(item);
  }
}

// ════════════════════════════════
// SESSION HISTORY DETAIL
// ════════════════════════════════
function viewSession(idx){viewingSessionIdx=idx;aTab='history';var tabs=document.querySelectorAll('.ptb');for(var i=0;i<tabs.length;i++)tabs[i].classList.remove('active');showScreen('s-progress');renderProg();}

function renderHistoryDetail(cont,idx){
  var w=S.log[idx];if(!w){renderHistoryList(cont);return;}
  var d=new Date(w.date);
  var back=document.createElement('button');back.className='hist-back';back.innerHTML='&#9666; ALL SESSIONS';back.onclick=function(){viewingSessionIdx=null;renderProg();};cont.appendChild(back);
  var header=document.createElement('div');header.className='hist-session-header';
  header.innerHTML='<div class="hist-day-num">'+w.lbl+'</div><div class="hist-day-name">'+esc(w.name)+'</div><div class="hist-meta">'+d.toLocaleDateString()+' &mdash; '+d.toLocaleTimeString()+'<br>Duration: '+w.dur+'<br>Volume: '+w.vol.toLocaleString()+' lbs<br>Week '+(w.week||1)+' &mdash; '+(w.phase||'')+'</div>';
  cont.appendChild(header);
  if(!w.rawSets){var empty=document.createElement('div');empty.className='es';empty.innerHTML='<div class="ei">NO SET DATA</div>';cont.appendChild(empty);return;}
  for(var exName in w.rawSets){
    var sets=w.rawSets[exName];if(!sets||!sets.length)continue;
    var doneSets=sets.filter(function(s){return s.done;});if(!doneSets.length)continue;
    var best1rm=0;for(var i=0;i<doneSets.length;i++){var orm=calcEpley(parseFloat(doneSets[i].weight)||0,parseFloat(doneSets[i].reps)||0);if(orm>best1rm)best1rm=orm;}
    var block=document.createElement('div');block.className='hist-ex-block';
    var hdr='<div class="hist-ex-name">'+esc(exName);if(best1rm>0)hdr+='<span class="orm-badge"> &mdash; e1RM: '+best1rm+'lb</span>';hdr+='</div>';
    hdr+='<div class="hist-set-hdr"><div>#</div><div>WEIGHT</div><div>REPS</div><div>VOL</div><div>TYPE</div></div>';
    block.innerHTML=hdr;
    for(var i=0;i<sets.length;i++){var s=sets[i];if(!s.done)continue;var vol=(parseFloat(s.weight)||0)*(parseFloat(s.reps)||0);var row=document.createElement('div');row.className='hist-set-row'+(s.warmup?' warmup-row':'');row.innerHTML='<div>'+(i+1)+'</div><div>'+(s.weight||0)+'lb</div><div>'+(s.reps||0)+'</div><div>'+vol+'</div><div>'+(s.warmup?'WU':'WK')+'</div>';block.appendChild(row);}
    cont.appendChild(block);
  }
}

function deleteWorkoutLog(idx){S.pendingDeleteLog=idx;var w=S.log[idx];el('del-log-name').textContent=w.name+' — '+new Date(w.date).toLocaleDateString();el('del-log-mo').classList.add('visible');}
function confirmDeleteLog(){
  if(S.pendingDeleteLog===null||S.pendingDeleteLog===undefined)return;
  var idx=S.pendingDeleteLog;
  var removed=S.log.splice(idx,1)[0];
  S.pendingDeleteLog=null;
  saveState();closeModal('del-log-mo');viewingSessionIdx=null;renderProg();
  showActionToast('SESSION DELETED','UNDO',function(){
    S.log.splice(Math.min(idx,S.log.length),0,removed);
    saveState();renderProg();renderHome();
    showToast('SESSION RESTORED');
  },6000);
}

function renderHistoryList(cont){
  if(!S.log.length){cont.innerHTML='<div class="es"><div class="ei">NO HISTORY YET</div><div class="esb">Complete sessions to build your log.</div></div>';return;}
  var card=document.createElement('div');card.className='cc';card.innerHTML='<div class="ct">SESSION LOG — TAP TO EXPAND &nbsp;&nbsp; &#10005; TO DELETE</div>';
  var sessions=S.log.slice().reverse();
  for(var i=0;i<sessions.length;i++){
    var w=sessions[i];var globalIdx=S.log.length-1-i;var d=new Date(w.date);
    var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid var(--border);';
    var inner=document.createElement('div');inner.style.cssText='display:flex;align-items:center;gap:9px;flex:1;cursor:pointer;';
    inner.innerHTML='<div style="font-family:\'Orbitron\',sans-serif;font-size:13px;color:var(--hl);width:24px;text-align:center;flex-shrink:0;">'+w.lbl+'</div><div style="flex:1;"><div style="font-family:\'Rajdhani\',sans-serif;font-weight:600;font-size:12px;">'+esc(w.name)+'</div><div style="font-family:\'Share Tech Mono\',monospace;font-size:7px;color:var(--s2);">'+d.toLocaleDateString()+' — '+w.dur+'</div></div><div style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--hl);text-align:right;">'+w.vol.toLocaleString()+'<br><span style="font-size:6px;color:var(--s3)">LBS</span></div><div style="color:var(--s3);font-size:10px;">&#9658;</div>';
    (function(idx){inner.onclick=function(){viewingSessionIdx=idx;renderProg();};})(globalIdx);
    var delBtn=document.createElement('button');delBtn.style.cssText='background:none;border:none;color:var(--s3);font-size:14px;cursor:pointer;padding:4px 6px;flex-shrink:0;';delBtn.innerHTML='&#10005;';
    (function(idx){delBtn.onclick=function(e){e.stopPropagation();deleteWorkoutLog(idx);};})(globalIdx);
    row.appendChild(inner);row.appendChild(delBtn);card.appendChild(row);
  }
  cont.appendChild(card);
}

// ════════════════════════════════
// EDIT PAST SESSION
// ════════════════════════════════
var editingSessionIdx = null;
var editingSessionMode = false;

function renderHistoryDetail(cont, idx){
  var w=S.log[idx];if(!w){renderHistoryList(cont);return;}
  var d=new Date(w.date);
  var back=document.createElement('button');back.className='hist-back';back.innerHTML='&#9666; ALL SESSIONS';
  back.onclick=function(){viewingSessionIdx=null;editingSessionMode=false;renderProg();};
  cont.appendChild(back);

  var header=document.createElement('div');header.className='hist-session-header';
  header.innerHTML='<div class="hist-day-num">'+w.lbl+'</div><div class="hist-day-name">'+esc(w.name)+'</div>'
    +'<div class="hist-meta">'+d.toLocaleDateString()+' &mdash; '+d.toLocaleTimeString()
    +'<br>Duration: '+w.dur+'<br>Volume: '+w.vol.toLocaleString()+' lbs'
    +'<br>Week '+(w.week||1)+' &mdash; '+(w.phase||'')+'</div>';
  cont.appendChild(header);

  // Edit toggle
  var editBtn=document.createElement('button');editBtn.className='hist-edit-btn';
  editBtn.textContent=editingSessionMode?'SAVE CHANGES':'EDIT SESSION';
  editBtn.onclick=function(){
    if(editingSessionMode){
      // Recalculate volume
      var vol=0,ts=0;
      if(w.rawSets){
        for(var exName in w.rawSets){
          var sets=w.rawSets[exName];
          for(var i=0;i<sets.length;i++){
            if(sets[i].done&&!sets[i].warmup){
              ts++;
              vol+=(parseFloat(sets[i].weight)||0)*(parseFloat(sets[i].reps)||0);
            }
          }
        }
      }
      w.vol=Math.round(vol);w.sets=ts;
      saveState();showToast('SESSION SAVED');
    }
    editingSessionMode=!editingSessionMode;
    viewingSessionIdx=idx;renderProg();
  };
  cont.appendChild(editBtn);

  if(!w.rawSets){
    var empty=document.createElement('div');empty.className='es';empty.innerHTML='<div class="ei">NO SET DATA</div>';cont.appendChild(empty);return;
  }

  for(var exName in w.rawSets){
    var sets=w.rawSets[exName];if(!sets||!sets.length)continue;
    var doneSets=sets.filter(function(s){return s.done;});if(!doneSets.length&&!editingSessionMode)continue;
    var best1rm=0;
    for(var i=0;i<doneSets.length;i++){
      var orm2=calcEpley(parseFloat(doneSets[i].weight)||0,parseFloat(doneSets[i].reps)||0);
      if(orm2>best1rm)best1rm=orm2;
    }
    var block=document.createElement('div');block.className='hist-ex-block';
    var hdr='<div class="hist-ex-name">'+esc(exName);
    if(best1rm>0)hdr+='<span class="orm-badge"> &mdash; e1RM: '+best1rm+'lb</span>';
    hdr+='</div>';
    if(editingSessionMode){
      hdr+='<div class="hist-set-hdr"><div>#</div><div>WEIGHT</div><div>REPS</div><div>DONE</div><div>WU</div></div>';
    }else{
      hdr+='<div class="hist-set-hdr"><div>#</div><div>WEIGHT</div><div>REPS</div><div>VOL</div><div>TYPE</div></div>';
    }
    block.innerHTML=hdr;

    for(var i=0;i<sets.length;i++){
      var s=sets[i];
      var row=document.createElement('div');
      if(editingSessionMode){
        row.className='hist-set-row';
        var wKey='hist-w-'+exName.replace(/[^a-z0-9]/gi,'_')+'-'+i;
        var rKey='hist-r-'+exName.replace(/[^a-z0-9]/gi,'_')+'-'+i;
        var doneChk=document.createElement('input');doneChk.type='checkbox';doneChk.checked=!!s.done;doneChk.style.cssText='width:16px;height:16px;accent-color:var(--hl);';
        (function(li,en,si){doneChk.onchange=function(){S.log[li].rawSets[en][si].done=this.checked;};})(idx,exName,i);
        var wuChk=document.createElement('input');wuChk.type='checkbox';wuChk.checked=!!s.warmup;wuChk.style.cssText='width:16px;height:16px;accent-color:var(--am);';
        (function(li,en,si){wuChk.onchange=function(){S.log[li].rawSets[en][si].warmup=this.checked;};})(idx,exName,i);
        row.innerHTML='<div>'+(i+1)+'</div>'
          +'<div><input class="hist-edit-inp" id="'+wKey+'" type="number" value="'+(s.weight||0)+'"/></div>'
          +'<div><input class="hist-edit-inp" id="'+rKey+'" type="number" value="'+(s.reps||0)+'"/></div>'
          +'<div></div><div></div>';
        row.children[3].appendChild(doneChk);
        row.children[4].appendChild(wuChk);
        // Wire up weight/rep inputs
        (function(logIdx,en,si,wk,rk){
          row.querySelector('#'+wk).oninput=function(){S.log[logIdx].rawSets[en][si].weight=parseFloat(this.value)||0;};
          row.querySelector('#'+rk).oninput=function(){S.log[logIdx].rawSets[en][si].reps=parseFloat(this.value)||0;};
        })(idx,exName,i,wKey,rKey);
      } else {
        if(!s.done)continue;
        row.className='hist-set-row'+(s.warmup?' warmup-row':'');
        var vol2=(parseFloat(s.weight)||0)*(parseFloat(s.reps)||0);
        row.innerHTML='<div>'+(i+1)+'</div><div>'+(s.weight||0)+'lb</div><div>'+(s.reps||0)+'</div><div>'+vol2+'</div><div>'+(s.warmup?'WU':'WK')+'</div>';
      }
      block.appendChild(row);
    }
    cont.appendChild(block);
  }
}

// ════════════════════════════════
// PR TIMELINE
// ════════════════════════════════
function getPRTimeline(exName){
  // Get all logged sets for this exercise across all sessions, sorted by date
  var entries=[];
  for(var i=0;i<S.log.length;i++){
    var session=S.log[i];
    if(!session.rawSets||!session.rawSets[exName])continue;
    var sets=session.rawSets[exName].filter(function(s){return s.done&&!s.warmup&&s.weight&&s.reps;});
    if(!sets.length)continue;
    // Find best set (highest weight)
    var best=sets[0];
    for(var j=1;j<sets.length;j++){if((sets[j].weight||0)>(best.weight||0))best=sets[j];}
    var orm=calcEpley(parseFloat(best.weight)||0,parseFloat(best.reps)||0);
    entries.push({
      date:session.date,
      weight:parseFloat(best.weight)||0,
      reps:parseFloat(best.reps)||0,
      orm:orm,
      week:session.week||1,
      phase:session.phase||''
    });
  }
  // Sort by date
  entries.sort(function(a,b){return new Date(a.date)-new Date(b.date);});
  // Mark PRs
  var maxWeight=0;
  for(var i=0;i<entries.length;i++){
    if(entries[i].weight>maxWeight){
      maxWeight=entries[i].weight;
      entries[i].isPR=true;
    }
  }
  return entries;
}

function getAllTrackedExercises(){
  var names={};
  for(var i=0;i<S.log.length;i++){
    var session=S.log[i];
    if(!session.rawSets)continue;
    for(var exName in session.rawSets){
      var sets=session.rawSets[exName].filter(function(s){return s.done&&!s.warmup&&s.weight;});
      if(sets.length)names[exName]=true;
    }
  }
  return Object.keys(names).sort();
}

function renderTimeline(cont){
  var exercises=getAllTrackedExercises();
  if(!exercises.length){
    cont.innerHTML='<div class="es"><div class="ei">NO DATA YET</div><div class="esb">Complete sessions with weights to build your timeline.</div></div>';
    return;
  }

  var card=document.createElement('div');
  card.className='cc';
  card.innerHTML='<div class="ct">PR TIMELINE — SELECT EXERCISE</div>';

  var sel=document.createElement('select');
  sel.className='timeline-ex-select';
  sel.innerHTML='<option value="">-- Select Exercise --</option>';
  for(var i=0;i<exercises.length;i++){
    sel.innerHTML+='<option value="'+exercises[i]+'">'+exercises[i]+'</option>';
  }
  card.appendChild(sel);

  var chartDiv=document.createElement('canvas');
  chartDiv.id='timeline-chart';
  chartDiv.height=120;
  chartDiv.style.cssText='width:100%;margin-bottom:10px;display:none;';
  card.appendChild(chartDiv);

  var statsDiv=document.createElement('div');
  statsDiv.id='timeline-stats';
  statsDiv.className='timeline-stat-row';
  statsDiv.style.display='none';
  card.appendChild(statsDiv);

  var listDiv=document.createElement('div');
  listDiv.id='timeline-list';
  card.appendChild(listDiv);

  cont.appendChild(card);

  sel.onchange=function(){
    var exName=this.value;
    var chart=el('timeline-chart');
    var stats=el('timeline-stats');
    var list=el('timeline-list');
    chart.style.display='none';
    stats.style.display='none';
    list.innerHTML='';
    if(!exName)return;

    var entries=getPRTimeline(exName);
    if(!entries.length){list.innerHTML='<div class="es"><div class="esb">No logged sets found.</div></div>';return;}

    // Stats row
    var maxWeight=Math.max.apply(null,entries.map(function(e){return e.weight;}));
    var maxOrm=Math.max.apply(null,entries.map(function(e){return e.orm;}));
    var totalSessions=entries.length;
    var firstDate=new Date(entries[0].date);
    var weightGain=entries[entries.length-1].weight-entries[0].weight;

    stats.style.display='flex';
    stats.innerHTML=''
      +'<div class="timeline-stat"><div class="timeline-stat-val">'+maxWeight+'<span style="font-size:9px;color:var(--s2);">lb</span></div><div class="timeline-stat-label">Best Weight</div></div>'
      +'<div class="timeline-stat"><div class="timeline-stat-val">'+maxOrm+'<span style="font-size:9px;color:var(--s2);">lb</span></div><div class="timeline-stat-label">Best e1RM</div></div>'
      +'<div class="timeline-stat"><div class="timeline-stat-val">'+(weightGain>=0?'+':'')+weightGain+'<span style="font-size:9px;color:var(--s2);">lb</span></div><div class="timeline-stat-label">Progress</div></div>'
      +'<div class="timeline-stat"><div class="timeline-stat-val">'+totalSessions+'</div><div class="timeline-stat-label">Sessions</div></div>';

    // Draw chart
    chart.style.display='block';
    chart.width=chart.offsetWidth||300;
    chart.height=120;
    setTimeout(function(){
      var ctx=chart.getContext('2d');
      var weights=entries.map(function(e){return e.weight;});
      var mx=Math.max.apply(null,weights);
      var mn=Math.min.apply(null,weights);
      mn=Math.max(0,mn-10);
      var W=chart.width,H=120,pt=8,pb=20,pl=5,pr=5;
      var cW=W-pl-pr,cH=H-pt-pb;
      var st=weights.length>1?cW/(weights.length-1):cW;
      ctx.clearRect(0,0,W,H);

      // Grid lines
      ctx.strokeStyle='#132030';ctx.lineWidth=1;
      for(var i=0;i<=4;i++){var y=pt+cH-(i/4)*cH;ctx.beginPath();ctx.moveTo(pl,y);ctx.lineTo(W-pr,y);ctx.stroke();}

      // Gradient fill
      var g=ctx.createLinearGradient(0,pt,0,pt+cH);
      g.addColorStop(0,'rgba(79,195,247,.18)');g.addColorStop(1,'rgba(79,195,247,0)');
      ctx.beginPath();
      for(var i=0;i<weights.length;i++){
        var x=pl+i*st,y=pt+cH-((weights[i]-mn)/(mx-mn+1))*cH;
        if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.lineTo(pl+(weights.length-1)*st,pt+cH);ctx.lineTo(pl,pt+cH);ctx.closePath();
      ctx.fillStyle=g;ctx.fill();

      // Line
      ctx.beginPath();ctx.strokeStyle='#4fc3f7';ctx.lineWidth=2;ctx.lineJoin='round';
      for(var i=0;i<weights.length;i++){
        var x=pl+i*st,y=pt+cH-((weights[i]-mn)/(mx-mn+1))*cH;
        if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }ctx.stroke();

      // Dots — PR dots in amber
      for(var i=0;i<entries.length;i++){
        var x=pl+i*st,y=pt+cH-((weights[i]-mn)/(mx-mn+1))*cH;
        ctx.beginPath();ctx.arc(x,y,entries[i].isPR?5:3,0,Math.PI*2);
        ctx.fillStyle=entries[i].isPR?'#ffb300':'#4fc3f7';ctx.fill();
        // Date label
        ctx.fillStyle='#2e3f4a';ctx.font='6px monospace';ctx.textAlign='center';
        var d=new Date(entries[i].date);
        ctx.fillText((d.getMonth()+1)+'/'+(d.getDate()),x,H-4);
      }
    },80);

    // History list
    var reversed=entries.slice().reverse();
    list.innerHTML='<div style="font-family:Share Tech Mono,monospace;font-size:6px;letter-spacing:.14em;color:var(--s2);text-transform:uppercase;padding:8px 0 4px;border-bottom:1px solid var(--border);display:grid;grid-template-columns:70px 1fr 1fr 60px;gap:4px;"><div>DATE</div><div>WEIGHT</div><div>e1RM</div><div>PHASE</div></div>';
    for(var i=0;i<reversed.length;i++){
      var e=reversed[i];
      var d=new Date(e.date);
      var row=document.createElement('div');
      row.className='timeline-entry';
      row.style.cssText='display:grid;grid-template-columns:70px 1fr 1fr 60px;gap:4px;align-items:center;';
      row.innerHTML='<div class="timeline-date">'+(d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear()+'</div>'
        +'<div class="timeline-weight">'+e.weight+'lb x '+e.reps+'r'+(e.isPR?'<span class="timeline-pr-badge">PR</span>':'')+'</div>'
        +'<div style="font-family:Share Tech Mono,monospace;font-size:8px;color:var(--am);">'+e.orm+'lb</div>'
        +'<div style="font-family:Orbitron,sans-serif;font-size:6px;color:var(--s2);">WK'+e.week+'</div>';
      list.appendChild(row);
    }
  };
}
