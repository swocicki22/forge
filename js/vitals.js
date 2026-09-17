// ════════════════════════════════
// VITALS
// ════════════════════════════════
function renderBody(){
  var cont=el('body-content');cont.innerHTML='';
  // IF Tracker
  renderIFSection(cont);
  // Diet Plan
  renderDietSection(cont);
  // Meal Plan
  renderMealPlan(cont);
  var bt=document.createElement('div');bt.className='bio-title';bt.textContent='Body Composition';cont.appendChild(bt);
  if(S.bio.weight||S.bio.height){var g=document.createElement('div');g.className='bio-grid-3';g.style.marginBottom='10px;';if(S.bio.weight){var c=document.createElement('div');c.className='bio-card';c.innerHTML='<div class="bio-label">Weight</div><div class="bio-val">'+S.bio.weight+'</div><div class="bio-unit">lbs</div>';g.appendChild(c);}if(S.bio.height){var c=document.createElement('div');c.className='bio-card';c.innerHTML='<div class="bio-label">Height</div><div class="bio-val">'+S.bio.height+'</div><div class="bio-unit">in</div>';g.appendChild(c);}if(S.bio.age){var c=document.createElement('div');c.className='bio-card';c.innerHTML='<div class="bio-label">Age</div><div class="bio-val">'+S.bio.age+'</div><div class="bio-unit">yrs</div>';g.appendChild(c);}if(S.bio.bf){var c=document.createElement('div');c.className='bio-card';c.innerHTML='<div class="bio-label">Body Fat</div><div class="bio-val">'+S.bio.bf+'</div><div class="bio-unit">%</div>';g.appendChild(c);}cont.appendChild(g);}
  function bioRow(label,field,type,ph,opts){var row=document.createElement('div');row.className='bio-row';row.innerHTML='<div class="bio-row-lbl">'+label+'</div>';if(opts){var sel=document.createElement('select');sel.className='bio-sel';sel.id='bio-'+field;sel.innerHTML='<option value="">Select</option>';for(var i=0;i<opts.length;i++)sel.innerHTML+='<option value="'+opts[i]+'"'+(S.bio[field]===opts[i]?' selected':'')+'>'+opts[i]+'</option>';row.appendChild(sel);}else{var inp=document.createElement('input');inp.className='bio-inp';inp.id='bio-'+field;inp.type=type||'text';inp.placeholder=ph||'';if(type==='number')inp.inputMode='decimal';inp.value=S.bio[field]||'';row.appendChild(inp);}return row;}
  cont.appendChild(bioRow('Weight (lbs)','weight','number','e.g. 185'));cont.appendChild(bioRow('Height (in)','height','number','e.g. 72'));cont.appendChild(bioRow('Age','age','number','e.g. 28'));cont.appendChild(bioRow('Sex','sex',null,null,['Male','Female']));cont.appendChild(bioRow('Body Fat %','bf','number','e.g. 18'));cont.appendChild(bioRow('Goal Weight','goalweight','number','e.g. 175'));
  if(S.bio.weight&&S.bio.height){var bmi=Math.round((S.bio.weight/((S.bio.height*S.bio.height)*703))*10)/10;var bmiCat=bmi<18.5?'Underweight':bmi<25?'Normal':bmi<30?'Overweight':'Obese';var bmiDiv=document.createElement('div');bmiDiv.style.cssText='background:var(--card);border:1px solid var(--bl);border-radius:2px;padding:10px 12px;margin-bottom:5px;display:flex;align-items:center;justify-content:space-between;';bmiDiv.innerHTML='<div><div class="bio-label">BMI</div><div style="font-family:\'Orbitron\',sans-serif;font-size:16px;color:var(--hlb);margin-top:2px;">'+bmi+'</div></div><div style="font-family:\'Share Tech Mono\',monospace;font-size:9px;color:var(--s2);">'+bmiCat+'</div>';cont.appendChild(bmiDiv);}
  var wt=document.createElement('div');wt.className='bio-title';wt.textContent='Water Intake';cont.appendChild(wt);
  var today=todayKey();var oz=S.waterLog[today]||0;var goal=S.bio.waterGoal||64;var pct=Math.min(100,Math.round(oz/goal*100));
  var wdiv=document.createElement('div');wdiv.className='water-track';wdiv.innerHTML='<div style="display:flex;align-items:flex-end;justify-content:space-between;"><div><div class="bio-label">Today</div><div style="font-family:\'Orbitron\',sans-serif;font-size:20px;color:var(--hl);line-height:1;">'+oz+'<span style="font-size:10px;color:var(--s2);"> oz</span></div></div><div style="text-align:right;"><div class="bio-label">Goal</div><div style="font-family:\'Orbitron\',sans-serif;font-size:14px;color:var(--s2);">'+goal+' oz</div></div></div><div class="water-bar-wrap"><div class="water-bar" style="width:'+pct+'%;"></div></div><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><div style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--s2);">'+pct+'% of goal</div><button style="background:none;border:none;color:var(--s3);font-family:\'Orbitron\',sans-serif;font-size:7px;cursor:pointer;letter-spacing:.08em;" onclick="resetWater()">RESET</button></div><div class="water-btns"><button class="water-btn" onclick="addWater(8)">+8oz</button><button class="water-btn" onclick="addWater(16)">+16oz</button><button class="water-btn" onclick="addWater(20)">+20oz</button><button class="water-btn" onclick="addWater(-8)">-8oz</button></div>';cont.appendChild(wdiv);
  var wgr=document.createElement('div');wgr.className='bio-row';wgr.style.marginTop='5px;';wgr.innerHTML='<div class="bio-row-lbl">Daily Goal</div><input class="bio-inp" id="bio-waterGoal" type="number" inputmode="numeric" placeholder="64" value="'+(S.bio.waterGoal||64)+'"/><span style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--s2);margin-left:5px;">oz</span>';cont.appendChild(wgr);
  var st=document.createElement('div');st.className='bio-title';st.textContent='Daily Supplements';cont.appendChild(st);
  var todaySupp=S.suppLog[today]||{};
  for(var i=0;i<SUPPS.length;i++){var supp=SUPPS[i];var on=todaySupp[supp.id]||false;var streak=getSuppStreak(supp.id);var item=document.createElement('div');item.className='supp-item';item.innerHTML='<div class="supp-check'+(on?' on':'')+'">'+( on?'&#10003;':'')+'</div><div style="flex:1;"><div class="supp-name">'+supp.name+'</div><div class="supp-detail">'+supp.detail+'</div></div><div class="supp-streak">'+streak+'d</div>';(function(sid){item.onclick=function(){toggleSupp(sid);renderBody();};})(supp.id);cont.appendChild(item);}
  var compCard=document.createElement('div');compCard.className='bio-card';compCard.style.marginTop='10px;';compCard.innerHTML='<div class="bio-label" style="margin-bottom:8px;">7-DAY COMPLIANCE</div>';
  for(var i=0;i<SUPPS.length;i++){var supp=SUPPS[i];var comp=get7DayComp(supp.id);var row2=document.createElement('div');row2.style.cssText='display:flex;align-items:center;gap:7px;margin-bottom:6px;';row2.innerHTML='<div style="width:90px;font-family:\'Rajdhani\',sans-serif;font-size:11px;color:var(--t2);flex-shrink:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+supp.name.split(' ')[0]+'</div><div style="flex:1;height:3px;background:var(--border);border-radius:2px;overflow:hidden;"><div style="height:100%;width:'+comp+'%;background:var(--gr);border-radius:2px;"></div></div><div style="font-family:\'Orbitron\',sans-serif;font-size:8px;color:var(--gr);width:26px;text-align:right;">'+comp+'%</div>';compCard.appendChild(row2);}
  cont.appendChild(compCard);
  renderPeptideSection(cont);
}
function addWater(oz){var today=todayKey();S.waterLog[today]=(S.waterLog[today]||0)+oz;if(S.waterLog[today]<0)S.waterLog[today]=0;saveState();renderBody();}
function resetWater(){var today=todayKey();S.waterLog[today]=0;saveState();renderBody();}
function toggleSupp(sid){var today=todayKey();if(!S.suppLog[today])S.suppLog[today]={};S.suppLog[today][sid]=!S.suppLog[today][sid];saveState();}
function getSuppStreak(sid){var streak=0;var d=new Date();for(var i=0;i<30;i++){var dd=new Date(d);dd.setDate(dd.getDate()-i);var key=dateKey(dd);if(S.suppLog[key]&&S.suppLog[key][sid])streak++;else break;}return streak;}
function get7DayComp(sid){var hits=0;var d=new Date();for(var i=0;i<7;i++){var dd=new Date(d);dd.setDate(dd.getDate()-i);var key=dateKey(dd);if(S.suppLog[key]&&S.suppLog[key][sid])hits++;}return Math.round(hits/7*100);}

// ════════════════════════════════
// INTERMITTENT FASTING TRACKER
// ════════════════════════════════
var IF_PROTOCOLS={
  '16:8': {fast:16,eat:8,label:'16:8'},
  '18:6': {fast:18,eat:6,label:'18:6'},
  '20:4': {fast:20,eat:4,label:'20:4'},
  'OMAD':  {fast:23,eat:1,label:'OMAD'},
  'Custom':{fast:16,eat:8,label:'Custom'}
};

function getIFData(){
  if(!S.bio.ifData)S.bio.ifData={
    protocol:'16:8',
    fastStart:null,
    isFasting:false,
    log:{},
    customFast:16
  };
  return S.bio.ifData;
}

function renderIFSection(cont){
  var ifd=getIFData();
  var proto=IF_PROTOCOLS[ifd.protocol]||IF_PROTOCOLS['16:8'];
  var fastHours=ifd.protocol==='Custom'?(ifd.customFast||16):proto.fast;

  var title=document.createElement('div');
  title.className='bio-title';title.textContent='Intermittent Fasting';
  cont.appendChild(title);

  // Protocol selector
  var protoWrap=document.createElement('div');
  protoWrap.className='if-protocol-row';
  var protocols=Object.keys(IF_PROTOCOLS);
  for(var i=0;i<protocols.length;i++){
    var p=protocols[i];
    var btn=document.createElement('button');
    btn.className='if-protocol-btn'+(ifd.protocol===p?' active':'');
    btn.textContent=p;
    (function(proto){btn.onclick=function(){
      var ifd=getIFData();
      ifd.protocol=proto;
      saveState();renderBody();
    };})(p);
    protoWrap.appendChild(btn);
  }
  cont.appendChild(protoWrap);

  // Timer card
  var card=document.createElement('div');
  card.className='if-timer-card';

  var now=Date.now();
  var elapsed=ifd.fastStart&&ifd.isFasting?Math.floor((now-ifd.fastStart)/1000):0;
  var totalSecs=fastHours*3600;
  var remaining=Math.max(0,totalSecs-elapsed);
  var pct=ifd.isFasting?Math.min(100,Math.round(elapsed/totalSecs*100)):0;

  var hrs=Math.floor(remaining/3600);
  var mins=Math.floor((remaining%3600)/60);
  var timeStr=(hrs<10?'0':'')+hrs+':'+(mins<10?'0':'')+mins;

  var fillColor=pct>=100?'var(--gr)':pct>=75?'var(--hl)':pct>=50?'var(--am)':'var(--s2)';
  var statusText=!ifd.isFasting?'NOT FASTING':pct>=100?'FAST COMPLETE!':'FASTING';
  var statusColor=!ifd.isFasting?'var(--s2)':pct>=100?'var(--gr)':'var(--hl)';

  card.innerHTML='<div class="if-status-label" style="color:'+statusColor+';">'+statusText+'</div>'
    +'<div class="if-timer-display">'+timeStr+'</div>'
    +'<div class="if-progress-bar"><div class="if-progress-fill" style="width:'+pct+'%;background:'+fillColor+';"></div></div>'
    +'<div class="if-sub">'+(ifd.isFasting?pct+'% of '+fastHours+'h fast complete':'Tap START FAST to begin your '+fastHours+'h fast')+'</div>'
    +'<div class="monster-badge">&#9989; Zero Ultra Monster — Safe during fast</div>';

  var btnRow=document.createElement('div');btnRow.className='if-btn-row';btnRow.style.marginTop='12px';
  if(!ifd.isFasting){
    var startBtn=document.createElement('button');startBtn.className='if-btn';startBtn.textContent='START FAST';
    startBtn.onclick=function(){var ifd=getIFData();ifd.fastStart=Date.now();ifd.isFasting=true;saveState();renderBody();};
    btnRow.appendChild(startBtn);
  } else {
    var breakBtn=document.createElement('button');breakBtn.className='if-btn';breakBtn.textContent='BREAK FAST';
    breakBtn.onclick=function(){
      var ifd=getIFData();
      var today=todayKey();
      var elapsed2=Math.floor((Date.now()-ifd.fastStart)/1000);
      var success=elapsed2>=(fastHours*3600*0.9); // 90% completion = success
      if(!ifd.log[today])ifd.log[today]={};
      ifd.log[today].completed=success;
      ifd.log[today].hours=Math.round(elapsed2/3600*10)/10;
      ifd.isFasting=false;ifd.fastStart=null;
      saveState();renderBody();
    };
    var cancelBtn=document.createElement('button');cancelBtn.className='if-btn danger';cancelBtn.textContent='CANCEL';
    cancelBtn.onclick=function(){var ifd=getIFData();ifd.isFasting=false;ifd.fastStart=null;saveState();renderBody();};
    btnRow.appendChild(breakBtn);
    btnRow.appendChild(cancelBtn);
  }
  card.appendChild(btnRow);
  cont.appendChild(card);

  // 7-day IF compliance
  var compCard=document.createElement('div');compCard.className='bio-card';compCard.style.marginBottom='8px';
  compCard.innerHTML='<div class="bio-label" style="margin-bottom:8px;">7-DAY FASTING LOG</div>';
  var streak=0;var d=new Date();var hitToday=false;
  for(var i=0;i<7;i++){
    var dd=new Date(d);dd.setDate(dd.getDate()-i);
    var key=dateKey(dd);
    var dayData=ifd.log&&ifd.log[key];
    var success=dayData&&dayData.completed;
    if(success&&i===0)hitToday=true;
    if(success)streak++;else if(i>0)streak=0; // only count consecutive from today back
    var dayRow=document.createElement('div');
    dayRow.style.cssText='display:flex;align-items:center;gap:8px;margin-bottom:5px;';
    var dateStr=i===0?'Today':i===1?'Yesterday':dd.toLocaleDateString(undefined,{weekday:'short'});
    var hoursStr=dayData&&dayData.hours?dayData.hours+'h':'—';
    dayRow.innerHTML='<div style="font-family:Share Tech Mono,monospace;font-size:8px;color:var(--s2);width:65px;flex-shrink:0;">'+dateStr+'</div>'
      +'<div style="flex:1;height:3px;background:var(--border);border-radius:2px;overflow:hidden;"><div style="height:100%;width:'+(success?'100':'0')+'%;background:'+(success?'var(--gr)':'var(--border)')+';;border-radius:2px;"></div></div>'
      +'<div style="font-family:Orbitron,sans-serif;font-size:7px;color:'+(success?'var(--gr)':'var(--s3)')+';">'+hoursStr+'</div>';
    compCard.appendChild(dayRow);
  }
  var streakDiv=document.createElement('div');
  streakDiv.style.cssText='font-family:Orbitron,sans-serif;font-size:9px;color:var(--am);margin-top:6px;';
  streakDiv.textContent=streak+' DAY STREAK';
  compCard.appendChild(streakDiv);
  cont.appendChild(compCard);
}

// ════════════════════════════════
// PAST SUPPLEMENTS EDITOR
// ════════════════════════════════
function openPastSupps(){
  renderPastSupps();
  el('past-supp-mo').classList.add('visible');
}

function renderPastSupps(){
  var cont=el('past-supp-content');cont.innerHTML='';
  // Show last 7 days
  var days=[];
  for(var i=0;i<7;i++){
    var d=new Date();d.setDate(d.getDate()-i);
    var key=dateKey(d);
    days.push({key:key,date:d});
  }
  for(var i=0;i<days.length;i++){
    var dayData=days[i];var key=dayData.key;var d=dayData.date;
    var block=document.createElement('div');block.className='past-supp-day';
    var dateLabel=i===0?'Today':i===1?'Yesterday':d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
    block.innerHTML='<div class="past-supp-date">'+dateLabel+'</div>';
    var todaySupp=S.suppLog[key]||{};
    for(var j=0;j<SUPPS.length;j++){
      var supp=SUPPS[j];var on=todaySupp[supp.id]||false;
      var item=document.createElement('div');item.className='supp-item';item.style.marginBottom='3px';
      item.innerHTML='<div class="supp-check'+(on?' on':'')+'">'+( on?'&#10003;':'')+'</div>'
        +'<div style="flex:1;"><div class="supp-name" style="font-size:12px;">'+supp.name+'</div></div>';
      (function(k,sid){item.onclick=function(){
        if(!S.suppLog[k])S.suppLog[k]={};
        S.suppLog[k][sid]=!S.suppLog[k][sid];
        saveState();
        renderPastSupps();
      };})(key,supp.id);
      block.appendChild(item);
    }
    cont.appendChild(block);
  }
}
