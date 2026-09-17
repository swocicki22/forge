// ════════════════════════════════
// PERIODIZATION
// ════════════════════════════════
function getCurrentWeek(){
  if(!S.weekStart){S.weekStart=Date.now();saveState();}
  var elapsed=Math.floor((Date.now()-S.weekStart)/(7*24*60*60*1000));
  return (elapsed%5)+1;
}
function getWeekData(){var w=getCurrentWeek();for(var i=0;i<CYCLE.length;i++){if(CYCLE[i].week===w)return CYCLE[i];}return CYCLE[0];}
function advanceWeek(){S.weekStart=(S.weekStart||Date.now())-(7*24*60*60*1000);saveState();renderHome();renderSel();showToast('WEEK '+getCurrentWeek());}

// ════════════════════════════════
// PROGRESSIVE OVERLOAD ENGINE
// ════════════════════════════════
function calcEpley(weight,reps){if(!weight||!reps||reps===1)return weight;return Math.round(weight*(1+reps/30));}
function getOverloadSuggestions(){
  // Progressive overload is only meaningful within the same rep range.
  // Compare the last two sessions logged in the CURRENT phase week, and
  // require hitting the TOP of that phase's range in both before
  // suggesting +2.5. Cross-phase weights are never compared.
  var suggestions=[];var wd=getWeekData();var curWeek=wd.week;
  var topTarget=wd.repMax||wd.reps;
  var exNames={};
  for(var i=0;i<S.days.length;i++){for(var j=0;j<S.days[i].ex.length;j++){var ex=S.days[i].ex[j];if(ex.type!=='Core')exNames[ex.name]=true;}}
  for(var exName in exNames){
    var sessions=[];
    for(var i=S.log.length-1;i>=0&&sessions.length<2;i--){
      var w=S.log[i];
      if((w.week||0)!==curWeek)continue;
      if(w.rawSets&&w.rawSets[exName]){
        var sets=w.rawSets[exName].filter(function(s){return s.done&&!s.warmup;});
        if(sets.length>0)sessions.push(sets);
      }
    }
    if(sessions.length<2)continue;
    var allHit=true;
    for(var i=0;i<sessions.length;i++){for(var j=0;j<sessions[i].length;j++){if((sessions[i][j].reps||0)<topTarget)allHit=false;}}
    if(allHit){
      var lastWeight=0;
      for(var j=0;j<sessions[0].length;j++){if((sessions[0][j].weight||0)>lastWeight)lastWeight=sessions[0][j].weight||0;}
      var suggest=Math.round((lastWeight+2.5)*10)/10;
      suggestions.push({name:exName,current:lastWeight,suggest:suggest});
    }
  }
  return suggestions;
}

// ════════════════════════════════
// PERIODIZED WEIGHT TARGETING
// Weight prescriptions scale with the current phase. The engine takes the
// best estimated 1RM from your last 3 sessions of an exercise and applies
// this week's programmed intensity (%1RM from the CYCLE table). A 270 e1RM
// becomes ~235 on an OVERLOAD week (.87) but ~175 on ENDURANCE (.65) —
// no more 4-6 rep loads showing up on 12-15 rep days.
// ════════════════════════════════
function bestRecentE1RM(exName,maxSessions){
  var found=0,best=0;
  for(var i=S.log.length-1;i>=0&&found<maxSessions;i--){
    var w=S.log[i];
    if(!w.rawSets||!w.rawSets[exName])continue;
    var sets=w.rawSets[exName];var has=false;
    for(var j=0;j<sets.length;j++){
      var s=sets[j];
      if(s.done&&!s.warmup&&s.weight&&s.reps){
        has=true;
        var e=calcEpley(parseFloat(s.weight)||0,parseFloat(s.reps)||0);
        if(e>best)best=e;
      }
    }
    if(has)found++;
  }
  return best;
}
function getTargetWeight(exName,wd){
  // Same-phase continuity: if this exercise was logged in the CURRENT
  // phase week within the last 35 days, carry that session's top working
  // weight forward unchanged — your logged numbers come back exactly.
  for(var i=S.log.length-1;i>=0;i--){
    var w=S.log[i];
    if(Date.now()-new Date(w.date).getTime()>35*864e5)break;
    if((w.week||0)!==wd.week)continue;
    if(!w.rawSets||!w.rawSets[exName])continue;
    var best=0;
    var sets=w.rawSets[exName];
    for(var j=0;j<sets.length;j++){
      var s=sets[j];
      if(s.done&&!s.warmup&&s.weight&&(parseFloat(s.weight)||0)>best)best=parseFloat(s.weight)||0;
    }
    if(best>0)return best;
  }
  // Cross-phase: rescale best recent e1RM to this week's intensity
  var e1=bestRecentE1RM(exName,3);
  if(!e1)return null;
  var t=Math.round(e1*(wd.intensity||0.7)/2.5)*2.5;
  return t>0?t:null;
}

// ════════════════════════════════
// DELOAD DETECTOR
// ════════════════════════════════
function analyzeDeloadNeed(){
  // Need at least 4 sessions to analyze
  if(S.log.length < 4) return {status:'insufficient', sessions: S.log.length};

  var recent = S.log.slice(-4);
  var older = S.log.slice(-8, -4);

  // Calculate average volume per session
  var recentVol = 0;
  for(var i=0;i<recent.length;i++) recentVol += recent[i].vol || 0;
  recentVol = recentVol / recent.length;

  var olderVol = 0;
  if(older.length > 0){
    for(var i=0;i<older.length;i++) olderVol += older[i].vol || 0;
    olderVol = olderVol / older.length;
  } else {
    olderVol = recentVol; // no comparison baseline
  }

  // Calculate average RPE trend from last 8 sessions
  var rpeScores = [];
  for(var i=Math.max(0,S.log.length-8);i<S.log.length;i++){
    if(S.log[i].avgRpe) rpeScores.push(S.log[i].avgRpe);
  }
  var avgRpe = rpeScores.length > 0 ? rpeScores.reduce(function(a,b){return a+b;},0)/rpeScores.length : null;

  // Check consecutive sessions count
  var consecutiveDays = 0;
  var today = new Date(); today.setHours(0,0,0,0);
  var dates = [];
  for(var i=0;i<S.log.length;i++){
    var d=new Date(S.log[i].date); d.setHours(0,0,0,0);
    dates.push(d.getTime());
  }
  dates = dates.filter(function(v,i,a){return a.indexOf(v)===i;}).sort(function(a,b){return b-a;});
  for(var i=0;i<dates.length;i++){
    var expected = new Date(today); expected.setDate(expected.getDate()-i);
    if(dates[i]===expected.getTime()) consecutiveDays++;
    else break;
  }

  // Scoring
  var volDrop = olderVol > 0 ? (olderVol - recentVol) / olderVol : 0;
  var score = 0;
  if(volDrop > 0.15) score += 2; // volume dropped >15%
  if(volDrop > 0.25) score += 1; // volume dropped >25%
  if(avgRpe !== null && avgRpe >= 8.5) score += 2; // consistently high RPE
  if(avgRpe !== null && avgRpe >= 9.0) score += 1;
  if(consecutiveDays >= 5) score += 1; // 5+ days straight
  if(consecutiveDays >= 7) score += 2;
  if(getCurrentWeek() === 4) score += 1; // week 4 = overload week

  return {
    status: score >= 5 ? 'deload' : score >= 3 ? 'warning' : 'good',
    score: score,
    volDrop: Math.round(volDrop*100),
    recentVol: Math.round(recentVol),
    olderVol: Math.round(olderVol),
    avgRpe: avgRpe ? Math.round(avgRpe*10)/10 : null,
    consecutiveDays: consecutiveDays,
    currentWeek: getCurrentWeek()
  };
}

function renderDeload(cont){
  var analysis = analyzeDeloadNeed();

  if(analysis.status === 'insufficient'){
    cont.innerHTML='<div class="es"><div class="ei">NOT ENOUGH DATA</div><div class="esb">Complete at least 4 sessions for deload analysis.</div></div>';
    return;
  }

  // Status card
  var statusCard = document.createElement('div');
  var statusConfig = {
    good:    {cls:'good',    icon:'&#9679;', title:'RECOVERY ON TRACK',      color:'var(--gr)', sub:'Your training load and recovery are well balanced. Keep pushing.'},
    warning: {cls:'warning', icon:'&#9888;', title:'MONITOR CLOSELY',         color:'var(--am)', sub:'Signs of accumulated fatigue. Consider a lighter session or extra rest day.'},
    deload:  {cls:'deload',  icon:'&#9888;', title:'DELOAD RECOMMENDED',      color:'var(--danger)', sub:'Multiple fatigue indicators detected. A deload week will help you recover and come back stronger.'}
  };
  var cfg = statusConfig[analysis.status];
  statusCard.className='deload-status '+cfg.cls;
  statusCard.innerHTML='<div class="deload-icon">'+cfg.icon+'</div>'
    +'<div class="deload-title" style="color:'+cfg.color+';">'+cfg.title+'</div>'
    +'<div class="deload-sub" style="color:'+cfg.color+';">'+cfg.sub+'</div>';
  cont.appendChild(statusCard);

  // Metrics
  var metricsCard = document.createElement('div');
  metricsCard.className='cc';
  metricsCard.innerHTML='<div class="ct">FATIGUE INDICATORS</div>';

  var metrics = [
    {
      label:'Volume Trend (last 4 vs prior 4)',
      val: analysis.volDrop > 0 ? '-'+analysis.volDrop+'%' : '+'+Math.abs(analysis.volDrop)+'%',
      color: analysis.volDrop > 20 ? 'var(--danger)' : analysis.volDrop > 10 ? 'var(--am)' : 'var(--gr)'
    },
    {
      label:'Avg Session Volume (recent)',
      val: analysis.recentVol.toLocaleString()+' lbs',
      color: 'var(--hl)'
    },
    {
      label:'Avg RPE (last 8 sessions)',
      val: analysis.avgRpe !== null ? analysis.avgRpe+'/10' : 'No RPE data',
      color: analysis.avgRpe >= 8.5 ? 'var(--danger)' : analysis.avgRpe >= 7 ? 'var(--am)' : 'var(--gr)'
    },
    {
      label:'Consecutive Training Days',
      val: analysis.consecutiveDays+' days',
      color: analysis.consecutiveDays >= 7 ? 'var(--danger)' : analysis.consecutiveDays >= 5 ? 'var(--am)' : 'var(--gr)'
    },
    {
      label:'Current Cycle Week',
      val: 'Week '+analysis.currentWeek+(analysis.currentWeek===4?' (OVERLOAD)':analysis.currentWeek===5?' (DELOAD)':''),
      color: analysis.currentWeek===4 ? 'var(--am)' : analysis.currentWeek===5 ? 'var(--gr)' : 'var(--hl)'
    }
  ];

  for(var i=0;i<metrics.length;i++){
    var m=metrics[i];
    var row=document.createElement('div');
    row.className='deload-metric';
    row.innerHTML='<div class="deload-metric-label">'+m.label+'</div>'
      +'<div class="deload-metric-val" style="color:'+m.color+';">'+m.val+'</div>';
    metricsCard.appendChild(row);
  }
  cont.appendChild(metricsCard);

  // Deload advice
  if(analysis.status === 'deload'){
    var adviceCard=document.createElement('div');
    adviceCard.className='cc';
    adviceCard.innerHTML='<div class="ct">DELOAD PROTOCOL</div>'
      +'<div style="font-family:Share Tech Mono,monospace;font-size:8px;color:var(--st);line-height:2;letter-spacing:.04em;">'
      +'&#9654; Reduce volume by 40-50% (cut sets in half)<br>'
      +'&#9654; Keep intensity at 60-70% of normal weight<br>'
      +'&#9654; Prioritize sleep — 8+ hours per night<br>'
      +'&#9654; Focus on mobility days (Days 03 and 07)<br>'
      +'&#9654; Increase protein intake to support recovery<br>'
      +'&#9654; Return to full training after 5-7 days'
      +'</div>';
    cont.appendChild(adviceCard);
  }
}
