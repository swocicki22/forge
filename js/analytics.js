// ════════════════════════════════
// PROGRESS
// ════════════════════════════════
function maxA(arr){var m=1;for(var i=0;i<arr.length;i++){if(arr[i]>m)m=arr[i];}return m;}
function swTab(tab,btn){aTab=tab;viewingSessionIdx=null;if(tab!=='heatmap')hmSel=null;var ts=document.querySelectorAll('.ptb');for(var i=0;i<ts.length;i++)ts[i].classList.remove('active');if(btn)btn.classList.add('active');renderProg();}
function renderProg(){
  var c=el('pcontent');c.innerHTML='';
  if(aTab==='history'){if(viewingSessionIdx!==null)renderHistoryDetail(c,viewingSessionIdx);else renderHistoryList(c);return;}
  if(aTab==='bodywt'){renderBodyWt(c);return;}
  if(!S.log.length){c.innerHTML='<div class="es"><div class="ei">NO DATA YET</div><div class="esb">Complete sessions to build telemetry.</div></div>';return;}
  if(aTab==='volume')renderVol(c);else if(aTab==='prs')renderPRs(c);else if(aTab==='1rm')render1RM(c);else if(aTab==='heatmap')renderHeatmap(c);else if(aTab==='deload')renderDeload(c);else if(aTab==='timeline')renderTimeline(c);else renderFreq(c);
}
function renderVol(cont){
  var recent=S.log.slice(-10);
  var card=document.createElement('div');card.className='cc';card.innerHTML='<div class="ct">VOLUME — LAST '+recent.length+' SESSIONS</div><canvas id="vc" height="120" style="width:100%;"></canvas>';cont.appendChild(card);
  setTimeout(function(){
    var cv=el('vc');if(!cv)return;cv.width=cv.offsetWidth;cv.height=120;var ctx=cv.getContext('2d');var vols=[];for(var i=0;i<recent.length;i++)vols.push(recent[i].vol);
    var mx=maxA(vols);var W=cv.width,H=120,pt=6,pb=22,pl=5,pr=5;var cW=W-pl-pr,cH=H-pt-pb,st=vols.length>1?cW/(vols.length-1):cW;
    ctx.clearRect(0,0,W,H);ctx.strokeStyle='#132030';ctx.lineWidth=1;for(var i=0;i<=4;i++){var y=pt+cH-(i/4)*cH;ctx.beginPath();ctx.moveTo(pl,y);ctx.lineTo(W-pr,y);ctx.stroke();}
    var g=ctx.createLinearGradient(0,pt,0,pt+cH);g.addColorStop(0,'rgba(79,195,247,.18)');g.addColorStop(1,'rgba(79,195,247,0)');
    ctx.beginPath();for(var i=0;i<vols.length;i++){var x=pl+i*st,y=pt+cH-(vols[i]/mx)*cH;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.lineTo(pl+(vols.length-1)*st,pt+cH);ctx.lineTo(pl,pt+cH);ctx.closePath();ctx.fillStyle=g;ctx.fill();
    ctx.beginPath();ctx.strokeStyle='#4fc3f7';ctx.lineWidth=2;ctx.lineJoin='round';for(var i=0;i<vols.length;i++){var x=pl+i*st,y=pt+cH-(vols[i]/mx)*cH;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
    for(var i=0;i<vols.length;i++){var x=pl+i*st,y=pt+cH-(vols[i]/mx)*cH;ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle='#4fc3f7';ctx.fill();ctx.fillStyle='#2e3f4a';ctx.font='7px monospace';ctx.textAlign='center';var d=new Date(recent[i].date);ctx.fillText((d.getMonth()+1)+'/'+(d.getDate()),x,H-4);}
  },80);
  var pc=document.createElement('div');pc.className='cc';pc.innerHTML='<div class="ct">VOLUME BY TRAINING PHASE</div>';
  var pv={};for(var i=0;i<CYCLE.length;i++)pv[CYCLE[i].label]=0;for(var i=0;i<S.log.length;i++){if(S.log[i].phase&&pv[S.log[i].phase]!==undefined)pv[S.log[i].phase]+=S.log[i].vol;}
  var pvals=[];for(var k in pv)pvals.push(pv[k]);var mpv=maxA(pvals);
  for(var i=0;i<CYCLE.length;i++){var ph=CYCLE[i];var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:7px;margin-bottom:7px;';var pct=Math.round((pv[ph.label]||0)/mpv*100);row.innerHTML='<div style="width:90px;font-family:\'Orbitron\',sans-serif;font-size:6px;color:var(--s2);flex-shrink:0;">WK'+ph.week+' '+ph.label+'</div><div style="flex:1;height:3px;background:var(--border);overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:var(--am);"></div></div><div style="font-family:monospace;font-size:7px;color:var(--s2);width:46px;text-align:right;">'+((pv[ph.label]||0)).toLocaleString()+'</div>';pc.appendChild(row);}
  cont.appendChild(pc);
  var bar=document.createElement('div');bar.className='cc';bar.innerHTML='<div class="ct">VOLUME BY PROTOCOL</div>';
  var dv={};for(var i=0;i<S.days.length;i++)dv[S.days[i].id]=0;for(var i=0;i<S.log.length;i++){if(dv[S.log[i].dayId]!==undefined)dv[S.log[i].dayId]+=S.log[i].vol;}
  var vals=[];for(var k in dv)vals.push(dv[k]);var mdv=maxA(vals);
  for(var i=0;i<S.days.length;i++){var day=S.days[i];var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:7px;margin-bottom:7px;';var pct=Math.round((dv[day.id]||0)/mdv*100);row.innerHTML='<div style="width:56px;font-family:monospace;font-size:7px;color:var(--s2);flex-shrink:0;">DAY '+day.lbl+'</div><div style="flex:1;height:3px;background:var(--border);overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:var(--hl);"></div></div><div style="font-family:monospace;font-size:7px;color:var(--s2);width:46px;text-align:right;">'+((dv[day.id]||0)).toLocaleString()+'</div>';bar.appendChild(row);}
  cont.appendChild(bar);
}
function renderPRs(cont){
  var keys=Object.keys(S.prs);if(!keys.length){cont.innerHTML='<div class="es"><div class="ei">NO RECORDS YET</div><div class="esb">Log weights to track PRs.</div></div>';return;}
  var grid=document.createElement('div');grid.className='prg';
  for(var i=0;i<keys.length;i++){var k=keys[i];var pr=S.prs[k];var d=new Date(pr.date);var c=document.createElement('div');c.className='prc';c.style.position='relative';c.innerHTML='<div class="pre">'+k+'</div><div class="prw">'+pr.weight+'<span style="font-size:8px;color:var(--s3);">LB</span></div>'+(pr.orm?'<div style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--am);margin-top:2px;">e1RM: '+pr.orm+'lb</div>':'')+'<div class="prd">'+d.toLocaleDateString()+'</div>';grid.appendChild(c);}
  cont.appendChild(grid);
}
function render1RM(cont){
  var orms={};
  for(var i=0;i<S.log.length;i++){var w=S.log[i];if(!w.rawSets)continue;for(var exName in w.rawSets){var sets=w.rawSets[exName];for(var j=0;j<sets.length;j++){var s=sets[j];if(!s.done||s.warmup)continue;var orm=calcEpley(parseFloat(s.weight)||0,parseFloat(s.reps)||0);if(!orms[exName]||orm>orms[exName].orm)orms[exName]={orm:orm,weight:parseFloat(s.weight)||0,reps:parseFloat(s.reps)||0,date:w.date};}}}
  var keys=Object.keys(orms);if(!keys.length){cont.innerHTML='<div class="es"><div class="ei">NO 1RM DATA</div><div class="esb">Complete working sets to calculate estimated 1RM.</div></div>';return;}
  var card=document.createElement('div');card.className='cc';card.innerHTML='<div class="ct">ESTIMATED 1RM (EPLEY FORMULA)</div><div style="font-family:\'Share Tech Mono\',monospace;font-size:8px;color:var(--s2);margin-bottom:12px;">e1RM = weight x (1 + reps/30)</div>';
  keys.sort(function(a,b){return orms[b].orm-orms[a].orm;});
  for(var i=0;i<keys.length;i++){var k=keys[i];var o=orms[k];var d=new Date(o.date);var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);';row.innerHTML='<div style="flex:1;font-family:\'Rajdhani\',sans-serif;font-weight:600;font-size:12px;color:var(--tx);">'+k+'</div><div style="text-align:right;"><div style="font-family:\'Orbitron\',sans-serif;font-size:14px;color:var(--am);">'+o.orm+'<span style="font-size:8px;color:var(--s3);">lb</span></div><div style="font-family:\'Share Tech Mono\',monospace;font-size:7px;color:var(--s2);">'+o.weight+'lb x '+o.reps+' reps</div></div>';card.appendChild(row);}
  cont.appendChild(card);
  var pctCard=document.createElement('div');pctCard.className='cc';pctCard.style.marginTop='8px';pctCard.innerHTML='<div class="ct">TRAINING PERCENTAGES — SELECT EXERCISE</div>';
  var sel=document.createElement('select');sel.style.cssText='width:100%;background:var(--card2);border:1px solid var(--bl);border-radius:2px;padding:8px 10px;color:var(--tx);font-family:\'Share Tech Mono\',monospace;font-size:11px;outline:none;margin-bottom:10px;-webkit-appearance:none;';sel.innerHTML='<option value="">-- Select --</option>';for(var i=0;i<keys.length;i++){sel.innerHTML+='<option value="'+keys[i]+'">'+keys[i]+'</option>';}
  pctCard.appendChild(sel);var pctTable=document.createElement('div');pctTable.id='pct-table';pctCard.appendChild(pctTable);
  sel.onchange=function(){var exName=this.value;var tbl=el('pct-table');tbl.innerHTML='';if(!exName||!orms[exName])return;var orm=orms[exName].orm;var pcts=[100,95,90,85,80,75,70,65,60,55,50];for(var i=0;i<pcts.length;i++){var p=pcts[i];var w=Math.round(orm*p/100/2.5)*2.5;var row=document.createElement('div');row.style.cssText='display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);font-family:\'Share Tech Mono\',monospace;font-size:10px;';row.innerHTML='<span style="color:var(--s2);">'+p+'%</span><span style="color:var(--tx);">'+w+' lb</span>';tbl.appendChild(row);}};
  cont.appendChild(pctCard);
}
function renderFreq(cont){
  var counts={};for(var i=0;i<S.days.length;i++)counts[S.days[i].id]=0;for(var i=0;i<S.log.length;i++){if(counts[S.log[i].dayId]!==undefined)counts[S.log[i].dayId]++;}
  var vals=[];for(var k in counts)vals.push(counts[k]);var mc=maxA(vals);
  var card=document.createElement('div');card.className='cc';card.innerHTML='<div class="ct">SESSION FREQUENCY</div>';
  for(var i=0;i<S.days.length;i++){var day=S.days[i];var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:7px;margin-bottom:9px;';var pct=Math.round((counts[day.id]||0)/mc*100);row.innerHTML='<div style="width:56px;font-family:monospace;font-size:7px;color:var(--s2);flex-shrink:0;">DAY '+day.lbl+'</div><div style="flex:1;height:3px;background:var(--border);overflow:hidden;"><div style="height:100%;width:'+pct+'%;background:var(--hl);"></div></div><div style="font-family:monospace;font-size:9px;color:var(--hl);width:22px;text-align:right;">'+counts[day.id]+'x</div>';card.appendChild(row);}
  cont.appendChild(card);
}
function renderBodyWt(cont){
  var btn=document.createElement('button');btn.className='fin';btn.style.marginTop='0';btn.style.marginBottom='10px';btn.textContent='+ LOG BODY WEIGHT';btn.onclick=function(){el('bw-inp').value='';el('bw-mo').classList.add('visible');};cont.appendChild(btn);
  if(!S.bwLog.length){var e=document.createElement('div');e.className='es';e.innerHTML='<div class="ei">NO ENTRIES YET</div><div class="esb">Log your weight to track changes over time.</div>';cont.appendChild(e);return;}
  var card=document.createElement('div');card.className='cc';card.innerHTML='<div class="ct">BODY WEIGHT HISTORY</div><canvas id="bwc" height="110" style="width:100%;"></canvas>';cont.appendChild(card);
  setTimeout(function(){
    var cv=el('bwc');if(!cv)return;cv.width=cv.offsetWidth;cv.height=110;var ctx=cv.getContext('2d');var recent=S.bwLog.slice(-14);var vals=recent.map(function(e){return e.w;});var mx=maxA(vals);var mn=vals[0];for(var i=0;i<vals.length;i++){if(vals[i]<mn)mn=vals[i];}mn=mn-2;
    var W=cv.width,H=110,pt=6,pb=20,pl=5,pr=5;var cW=W-pl-pr,cH=H-pt-pb;var st=recent.length>1?cW/(recent.length-1):cW;
    ctx.clearRect(0,0,W,H);ctx.beginPath();ctx.strokeStyle='#ffb300';ctx.lineWidth=2;ctx.lineJoin='round';for(var i=0;i<recent.length;i++){var x=pl+i*st,y=pt+cH-((recent[i].w-mn)/(mx-mn+1))*cH;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
    for(var i=0;i<recent.length;i++){var x=pl+i*st,y=pt+cH-((recent[i].w-mn)/(mx-mn+1))*cH;ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle='#ffb300';ctx.fill();ctx.fillStyle='#2e3f4a';ctx.font='7px monospace';ctx.textAlign='center';var d=new Date(recent[i].date);ctx.fillText((d.getMonth()+1)+'/'+(d.getDate()),x,H-3);}
  },80);
  var listCard=document.createElement('div');listCard.className='cc';listCard.innerHTML='<div class="ct">ENTRIES</div>';
  var entries=S.bwLog.slice().reverse().slice(0,10);
  for(var i=0;i<entries.length;i++){var e=entries[i];var idx=S.bwLog.length-1-i;var d=new Date(e.date);var row=document.createElement('div');row.className='bw-entry';row.innerHTML='<div class="bw-date">'+(d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear()+'</div><div class="bw-val">'+e.w+' lb</div>';var db=document.createElement('button');db.className='bw-del';db.innerHTML='&#10005;';(function(ii){db.onclick=function(){S.bwLog.splice(ii,1);saveState();renderProg();};})(idx);row.appendChild(db);listCard.appendChild(row);}
  cont.appendChild(listCard);
}
function logBodyWeight(){var v=parseFloat(el('bw-inp').value);if(!v||v<50||v>500){showToast('INVALID WEIGHT');return;}S.bwLog.push({date:new Date().toISOString(),w:v});saveState();closeModal('bw-mo');renderProg();showToast('LOGGED');}

// ════════════════════════════════
// MUSCLE HEATMAP
// ════════════════════════════════

// Primary = full credit, Secondary = 0.5 credit
var MUSCLE_MAP = {
  // CHEST
  'Barbell Bench Press':      {primary:['Chest'],secondary:['Shoulders','Triceps']},
  'Incline Dumbbell Press':   {primary:['Chest'],secondary:['Shoulders','Triceps']},
  'Decline Barbell Press':    {primary:['Chest'],secondary:['Triceps']},
  'Cable Fly':                {primary:['Chest'],secondary:[]},
  'Pec Deck Machine':         {primary:['Chest'],secondary:[]},
  'Dumbbell Pullover':        {primary:['Chest'],secondary:['Back']},
  'Push-Up':                  {primary:['Chest'],secondary:['Shoulders','Triceps']},
  'Dumbbell Bench Press':     {primary:['Chest'],secondary:['Shoulders','Triceps']},
  // BACK
  'Deadlift':                 {primary:['Back'],secondary:['Glutes','Hamstrings']},
  'Barbell Bent-Over Row':    {primary:['Back'],secondary:['Biceps']},
  'Bent-Over Dumbbell Row':   {primary:['Back'],secondary:['Biceps']},
  'Pull-Up':                  {primary:['Back'],secondary:['Biceps']},
  'Wide-Grip Lat Pulldown':   {primary:['Back'],secondary:['Biceps']},
  'Close-Grip Lat Pulldown':  {primary:['Back'],secondary:['Biceps']},
  'Cable Seated Row':         {primary:['Back'],secondary:['Biceps']},
  'Seated Cable Row':         {primary:['Back'],secondary:['Biceps']},
  'Single Arm Dumbbell Row':  {primary:['Back'],secondary:['Biceps']},
  'Straight Arm Pulldown':    {primary:['Back'],secondary:[]},
  'Face Pull':                {primary:['Back'],secondary:['Shoulders']},
  'Face Pulls':               {primary:['Back'],secondary:['Shoulders']},
  'T-Bar Row':                {primary:['Back'],secondary:['Biceps']},
  'Rack Pull':                {primary:['Back'],secondary:[]},
  'Rear Delt Cable Fly':      {primary:['Back'],secondary:['Shoulders']},
  'Rear Delt Fly':            {primary:['Back'],secondary:['Shoulders']},
  // SHOULDERS
  'Barbell Overhead Press':   {primary:['Shoulders'],secondary:['Triceps']},
  'Dumbbell Push Press':      {primary:['Shoulders'],secondary:['Triceps']},
  'Arnold Press':             {primary:['Shoulders'],secondary:['Triceps']},
  'Dumbbell Lateral Raise':   {primary:['Shoulders'],secondary:[]},
  'Cable Lateral Raise':      {primary:['Shoulders'],secondary:[]},
  'Front Raise':              {primary:['Shoulders'],secondary:[]},
  'Upright Row':              {primary:['Shoulders'],secondary:['Biceps']},
  'Barbell Shrug':            {primary:['Shoulders'],secondary:[]},
  'Overhead Press':           {primary:['Shoulders'],secondary:['Triceps']},
  // BICEPS
  'EZ Bar Curl':              {primary:['Biceps'],secondary:[]},
  'Barbell Curl':             {primary:['Biceps'],secondary:[]},
  'Dumbbell Curl':            {primary:['Biceps'],secondary:[]},
  'Hammer Curl':              {primary:['Biceps'],secondary:['Forearms']},
  'Incline Dumbbell Curl':    {primary:['Biceps'],secondary:[]},
  'Preacher Curl':            {primary:['Biceps'],secondary:[]},
  'Cable Curl':               {primary:['Biceps'],secondary:[]},
  // TRICEPS
  'Weighted Tricep Dips':     {primary:['Triceps'],secondary:['Chest','Shoulders']},
  'Tricep Dips':              {primary:['Triceps'],secondary:['Chest']},
  'Tricep Rope Pushdown':     {primary:['Triceps'],secondary:[]},
  'Overhead Tricep Extension':{primary:['Triceps'],secondary:[]},
  'Skull Crusher':            {primary:['Triceps'],secondary:[]},
  'Close-Grip Bench Press':   {primary:['Triceps'],secondary:['Chest']},
  // LEGS - QUADS
  'Barbell Back Squat':       {primary:['Quads'],secondary:['Glutes','Hamstrings']},
  'Front Squat':              {primary:['Quads'],secondary:['Glutes']},
  'Hack Squat Smith Machine': {primary:['Quads'],secondary:['Glutes']},
  'Leg Press':                {primary:['Quads'],secondary:['Glutes','Hamstrings']},
  'Explosive Leg Press':      {primary:['Quads'],secondary:['Glutes','Hamstrings']},
  'Single Leg Press':         {primary:['Quads'],secondary:['Glutes']},
  'Leg Extension':            {primary:['Quads'],secondary:[]},
  'Bulgarian Split Squat':    {primary:['Quads'],secondary:['Glutes','Hamstrings']},
  'Walking Lunges':           {primary:['Quads'],secondary:['Glutes','Hamstrings']},
  'Walking Lunge':            {primary:['Quads'],secondary:['Glutes','Hamstrings']},
  'Box Step-Up':              {primary:['Quads'],secondary:['Glutes']},
  'Reverse Lunge Knee Drive': {primary:['Quads'],secondary:['Glutes']},
  // LEGS - HAMSTRINGS
  'Romanian Deadlift':        {primary:['Hamstrings'],secondary:['Glutes','Back']},
  'Lying Leg Curl':           {primary:['Hamstrings'],secondary:[]},
  'Seated Leg Curl':          {primary:['Hamstrings'],secondary:[]},
  'Sumo Deadlift':            {primary:['Hamstrings'],secondary:['Glutes','Back']},
  'Cable Pull-Through':       {primary:['Hamstrings'],secondary:['Glutes']},
  // GLUTES
  'Hip Thrust Smith Machine': {primary:['Glutes'],secondary:['Hamstrings']},
  'Hip Thrust':               {primary:['Glutes'],secondary:['Hamstrings']},
  'Glute Kickback Cable':     {primary:['Glutes'],secondary:[]},
  'Glute Bridge':             {primary:['Glutes'],secondary:['Hamstrings']},
  'Lateral Band Walk':        {primary:['Glutes'],secondary:[]},
  // CALVES
  'Standing Calf Raise':      {primary:['Calves'],secondary:[]},
  'Seated Calf Raise':        {primary:['Calves'],secondary:[]},
  // CORE
  'Pallof Press':             {primary:['Core'],secondary:[]},
  'Cable Woodchop':           {primary:['Core'],secondary:[]},
  'Cable Woodchop High-Low':  {primary:['Core'],secondary:[]},
  'Ab Wheel Rollout':         {primary:['Core'],secondary:[]},
  'Hanging Leg Raise':        {primary:['Core'],secondary:[]},
  'Cable Crunch':             {primary:['Core'],secondary:[]},
  'Plank':                    {primary:['Core'],secondary:[]},
  'Side Plank':               {primary:['Core'],secondary:[]},
  'Dead Bug':                 {primary:['Core'],secondary:[]},
  'Russian Twist':            {primary:['Core'],secondary:[]},
  'Reverse Crunch':           {primary:['Core'],secondary:[]},
  'In & Outs':                {primary:['Core'],secondary:[]},
  'Bicycle Crunch':           {primary:['Core'],secondary:[]},
  'Reverse Bicycle':          {primary:['Core'],secondary:[]},
  'Crunchy Frog':             {primary:['Core'],secondary:[]},
  'Wide Leg Sit-Up':          {primary:['Core'],secondary:[]},
  'Fifer Scissors':           {primary:['Core'],secondary:[]},
  'Hip Rock & Raise':         {primary:['Core'],secondary:[]},
  'Pulse Ups':                {primary:['Core'],secondary:[]},
  'V-Up Roll Up':             {primary:['Core'],secondary:[]},
  'Oblique V-Up':             {primary:['Core'],secondary:[]},
  'Leg Climbers':             {primary:['Core'],secondary:[]},
  'Mason Twist':              {primary:['Core'],secondary:[]},
  // ATHLETIC / COMPOUND
  'Dumbbell Squat to Press':  {primary:['Quads','Shoulders'],secondary:['Glutes','Triceps']},
  'Battle Rope Slams':        {primary:['Shoulders'],secondary:['Core','Back']},
  "Farmer's Carry":           {primary:['Forearms'],secondary:['Core','Shoulders']},
  'Single Arm Dumbbell Row':  {primary:['Back'],secondary:['Biceps','Core']}
};

var ALL_MUSCLES=['Chest','Back','Shoulders','Biceps','Triceps','Forearms','Quads','Hamstrings','Glutes','Calves','Core'];
// Detailed sub-muscles rendered on the body map and stat panel
var DETAIL_MUSCLES=['Upper Chest','Mid Chest','Front Delts','Side Delts','Rear Delts','Traps','Lats','Lower Back','Biceps','Triceps','Forearms','Abs','Obliques','Quads','Hamstrings','Glutes','Calves'];

// Resolve a coarse muscle group to sub-muscles using the exercise name.
// Falls back to a sensible default for each group.
function detailMuscles(exName,group){
  var n=exName.toLowerCase();
  if(group==='Chest'){
    if(n.indexOf('incline')>=0)return ['Upper Chest'];
    if(n.indexOf('decline')>=0||n.indexOf('dip')>=0)return ['Mid Chest'];
    return ['Mid Chest'];
  }
  if(group==='Shoulders'){
    if(n.indexOf('shrug')>=0)return ['Traps'];
    if(n.indexOf('upright row')>=0)return ['Side Delts','Traps'];
    if(n.indexOf('lateral')>=0||n.indexOf('side raise')>=0)return ['Side Delts'];
    if(n.indexOf('rear delt')>=0||n.indexOf('reverse fly')>=0||n.indexOf('face pull')>=0)return ['Rear Delts'];
    if(n.indexOf('front raise')>=0)return ['Front Delts'];
    if(n.indexOf('press')>=0||n.indexOf('arnold')>=0)return ['Front Delts','Side Delts'];
    return ['Front Delts','Side Delts'];
  }
  if(group==='Back'){
    if(n.indexOf('shrug')>=0)return ['Traps'];
    if(n.indexOf('face pull')>=0)return ['Rear Delts','Traps'];
    if(n.indexOf('deadlift')>=0||n.indexOf('rack pull')>=0||n.indexOf('good morning')>=0||n.indexOf('hyperextension')>=0||n.indexOf('back extension')>=0)return ['Lower Back','Traps'];
    if(n.indexOf('row')>=0||n.indexOf('pulldown')>=0||n.indexOf('pull-up')>=0||n.indexOf('pull up')>=0||n.indexOf('pullup')>=0||n.indexOf('pullover')>=0||n.indexOf('straight arm')>=0)return ['Lats'];
    return ['Lats'];
  }
  if(group==='Core'){
    if(n.indexOf('oblique')>=0||n.indexOf('twist')>=0||n.indexOf('side ')>=0||n.indexOf('woodchop')>=0||n.indexOf('wood chop')>=0)return ['Obliques'];
    return ['Abs'];
  }
  // Biceps/Triceps/Forearms/Quads/Hamstrings/Glutes/Calves are already detailed
  return [group];
}

// Keyword fallback for custom exercises missing from MUSCLE_MAP
function guessMuscleGroups(exName){
  var n=exName.toLowerCase();
  if(n.indexOf('curl')>=0&&n.indexOf('leg')<0&&n.indexOf('hamstring')<0)return {primary:['Biceps'],secondary:['Forearms']};
  if(n.indexOf('leg curl')>=0||n.indexOf('hamstring')>=0||n.indexOf('nordic')>=0)return {primary:['Hamstrings'],secondary:[]};
  if(n.indexOf('pushdown')>=0||n.indexOf('tricep')>=0||n.indexOf('skull')>=0||n.indexOf('skullcrusher')>=0)return {primary:['Triceps'],secondary:[]};
  if(n.indexOf('squat')>=0||n.indexOf('lunge')>=0||n.indexOf('leg press')>=0||n.indexOf('leg extension')>=0)return {primary:['Quads'],secondary:['Glutes']};
  if(n.indexOf('calf')>=0)return {primary:['Calves'],secondary:[]};
  if(n.indexOf('glute')>=0||n.indexOf('hip thrust')>=0)return {primary:['Glutes'],secondary:['Hamstrings']};
  if(n.indexOf('row')>=0||n.indexOf('pulldown')>=0||n.indexOf('pull')>=0||n.indexOf('shrug')>=0||n.indexOf('deadlift')>=0)return {primary:['Back'],secondary:['Biceps']};
  if(n.indexOf('bench')>=0||n.indexOf('chest')>=0||n.indexOf('fly')>=0||n.indexOf('push-up')>=0||n.indexOf('push up')>=0||n.indexOf('dip')>=0)return {primary:['Chest'],secondary:['Triceps']};
  if(n.indexOf('shoulder')>=0||n.indexOf('delt')>=0||n.indexOf('raise')>=0||n.indexOf('overhead')>=0||n.indexOf('ohp')>=0)return {primary:['Shoulders'],secondary:['Triceps']};
  if(n.indexOf('plank')>=0||n.indexOf('crunch')>=0||n.indexOf('ab ')>=0||n.indexOf('sit-up')>=0||n.indexOf('leg raise')>=0||n.indexOf('knee raise')>=0||n.indexOf('woodchop')>=0||n.indexOf('wood chop')>=0||n.indexOf('pallof')>=0||n.indexOf('landmine rotation')>=0||n.indexOf('side bend')>=0||n.indexOf('suitcase')>=0||n.indexOf('russian twist')>=0)return {primary:['Core'],secondary:[]};
  if(n.indexOf('jump')>=0||n.indexOf('bound')>=0||n.indexOf('hop')>=0||n.indexOf('slam')>=0||n.indexOf('climber')>=0||n.indexOf('skater')>=0||n.indexOf('plyo')>=0)return {primary:['Quads'],secondary:['Glutes','Calves']};
  if(n.indexOf('wrist')>=0||n.indexOf('forearm')>=0||n.indexOf('grip')>=0||n.indexOf('farmer')>=0)return {primary:['Forearms'],secondary:[]};
  return null;
}

// Full detailed breakdown: weighted sets, volume, contributing exercises,
// and last-trained timestamps per sub-muscle
function getDetailedMuscleVolume(days){
  var detail={};
  for(var i=0;i<DETAIL_MUSCLES.length;i++)detail[DETAIL_MUSCLES[i]]={sets:0,vol:0,ex:{},last:null};
  var cutoff=Date.now()-(days*24*60*60*1000);
  for(var i=S.log.length-1;i>=0;i--){
    var session=S.log[i];
    var t=new Date(session.date).getTime();
    if(t<cutoff)break;
    if(!session.rawSets)continue;
    for(var exName in session.rawSets){
      var sets=session.rawSets[exName];
      var doneSets=sets.filter(function(s){return s.done&&!s.warmup;});
      if(!doneSets.length)continue;
      var exVol=0;
      for(var j=0;j<doneSets.length;j++)exVol+=(parseFloat(doneSets[j].weight)||0)*(parseFloat(doneSets[j].reps)||0);
      var map=MUSCLE_MAP[exName]||guessMuscleGroups(exName);
      if(!map)continue;
      function add(group,factor){
        var subs=detailMuscles(exName,group);
        for(var k=0;k<subs.length;k++){
          var m=subs[k];
          if(!detail[m])continue;
          detail[m].sets+=doneSets.length*factor/subs.length;
          detail[m].vol+=exVol*factor/subs.length;
          detail[m].ex[exName]=(detail[m].ex[exName]||0)+doneSets.length;
          if(!detail[m].last||t>detail[m].last)detail[m].last=t;
        }
      }
      for(var j=0;j<map.primary.length;j++)add(map.primary[j],1);
      for(var j=0;j<map.secondary.length;j++)add(map.secondary[j],0.5);
    }
  }
  return detail;
}

function getMuscleVolume(days){
  // days = number of days to look back (7 = last week)
  var scores={};
  for(var i=0;i<ALL_MUSCLES.length;i++)scores[ALL_MUSCLES[i]]=0;
  var cutoff=Date.now()-(days*24*60*60*1000);
  for(var i=S.log.length-1;i>=0;i--){
    var session=S.log[i];
    if(new Date(session.date).getTime()<cutoff)break;
    if(!session.rawSets)continue;
    for(var exName in session.rawSets){
      var sets=session.rawSets[exName];
      var doneSets=sets.filter(function(s){return s.done&&!s.warmup;});
      if(!doneSets.length)continue;
      var map=MUSCLE_MAP[exName];
      if(!map)continue;
      for(var j=0;j<map.primary.length;j++){
        if(scores[map.primary[j]]!==undefined)
          scores[map.primary[j]]+=doneSets.length;
      }
      for(var j=0;j<map.secondary.length;j++){
        if(scores[map.secondary[j]]!==undefined)
          scores[map.secondary[j]]+=doneSets.length*0.5;
      }
    }
  }
  return scores;
}

function muscleColor(score, max){
  if(score===0)return '#132030'; // untrained
  var pct=score/max;
  if(pct<0.25)return '#1a4060';  // very light
  if(pct<0.5) return '#1a6080';  // light
  if(pct<0.75)return '#2490b0';  // moderate
  if(pct<1.0) return '#4fc3f7';  // strong - hl color
  return '#ffb300';              // peak/overtrained - amber
}

var hmDays=7;var hmSel=null;
function renderHeatmap(cont){
  var detail=getDetailedMuscleVolume(hmDays);
  var maxScore=1;
  for(var m in detail){if(detail[m].sets>maxScore)maxScore=detail[m].sets;}

  // Header + period toggle
  var hdr=document.createElement('div');
  hdr.className='cc';
  hdr.innerHTML='<div class="ct">MUSCLE ACTIVATION — LAST '+hmDays+' DAYS</div>';
  var toggle=document.createElement('div');
  toggle.className='hm-toggle';
  toggle.innerHTML='<button class="hm-tbtn'+(hmDays===7?' active':'')+'" data-days="7">7 DAYS</button><button class="hm-tbtn'+(hmDays===30?' active':'')+'" data-days="30">30 DAYS</button>';
  toggle.onclick=function(e){
    var b=e.target.closest?e.target.closest('[data-days]'):null;
    if(!b)return;
    hmDays=parseInt(b.getAttribute('data-days'));
    renderProg();
  };
  hdr.appendChild(toggle);

  // Legend
  var legend=document.createElement('div');
  legend.className='heatmap-legend';
  var legendItems=[
    {color:'#132030',label:'Not trained'},
    {color:'#1a6080',label:'Light'},
    {color:'#4fc3f7',label:'Strong'},
    {color:'#ffb300',label:'Peak'}
  ];
  for(var i=0;i<legendItems.length;i++){
    legend.innerHTML+='<div class="legend-item"><div class="legend-swatch" style="background:'+legendItems[i].color+'"></div>'+legendItems[i].label+'</div>';
  }
  hdr.appendChild(legend);

  // Front + back body maps
  var bodyWrap=document.createElement('div');
  bodyWrap.className='heatmap-wrap';
  var frontDiv=document.createElement('div');
  frontDiv.className='heatmap-body';
  frontDiv.innerHTML='<div class="heatmap-label">FRONT</div>'+buildFrontSVG(detail,maxScore);
  var backDiv=document.createElement('div');
  backDiv.className='heatmap-body';
  backDiv.innerHTML='<div class="heatmap-label">BACK</div>'+buildBackSVG(detail,maxScore);
  bodyWrap.appendChild(frontDiv);
  bodyWrap.appendChild(backDiv);
  hdr.appendChild(bodyWrap);

  // Tap-to-inspect: one delegated listener for both SVGs and the stat rows
  hdr.addEventListener('click',function(e){
    var r=e.target.closest?e.target.closest('[data-m]'):null;
    if(!r)return;
    var m=r.getAttribute('data-m');
    hmSel=(hmSel===m)?null:m;
    renderProg();
  });

  // Detail panel for the selected muscle
  if(hmSel&&detail[hmSel]){
    var d=detail[hmSel];
    var panel=document.createElement('div');
    panel.className='hm-detail';
    var lastTxt='NEVER';
    if(d.last){
      var daysAgo=Math.floor((Date.now()-d.last)/864e5);
      lastTxt=daysAgo===0?'TODAY':daysAgo===1?'YESTERDAY':daysAgo+' DAYS AGO';
    }
    var html='<div class="hm-detail-title">'+esc(hmSel.toUpperCase())+'</div>'
      +'<div class="hm-detail-meta">WEIGHTED SETS: '+(Math.round(d.sets*10)/10)
      +' &nbsp;&middot;&nbsp; VOLUME: '+Math.round(d.vol).toLocaleString()+' LBS'
      +'<br>LAST TRAINED: '+lastTxt+'</div>';
    panel.innerHTML=html;
    var exNames=Object.keys(d.ex).sort(function(a,b){return d.ex[b]-d.ex[a];});
    if(exNames.length){
      for(var i=0;i<exNames.length;i++){
        var row=document.createElement('div');
        row.className='hm-ex-row';
        row.innerHTML='<div class="hm-ex-name">'+esc(exNames[i])+'</div><div class="hm-ex-sets">'+d.ex[exNames[i]]+' SETS</div>';
        panel.appendChild(row);
      }
    }else{
      var none=document.createElement('div');
      none.className='hm-detail-meta';
      none.textContent='No exercises hit this muscle in the window.';
      panel.appendChild(none);
    }
    hdr.appendChild(panel);
  }else{
    var hint=document.createElement('div');
    hint.className='hm-hint';
    hint.textContent='TAP A MUSCLE FOR DETAIL';
    hdr.appendChild(hint);
  }
  cont.appendChild(hdr);

  // Detailed muscle stat bars — tappable, synced with the body map
  var statsCard=document.createElement('div');
  statsCard.className='cc';
  statsCard.innerHTML='<div class="ct">SETS PER MUSCLE — DETAILED</div>';
  var grid=document.createElement('div');
  grid.className='muscle-stats';
  var sorted=DETAIL_MUSCLES.slice().sort(function(a,b){return detail[b].sets-detail[a].sets;});
  for(var i=0;i<sorted.length;i++){
    var muscle=sorted[i];
    var score=Math.round(detail[muscle].sets*10)/10;
    var pct=Math.round(detail[muscle].sets/maxScore*100);
    var color=muscleColor(detail[muscle].sets,maxScore);
    var row=document.createElement('div');
    row.className='muscle-stat-row';
    row.setAttribute('data-m',muscle);
    row.style.cursor='pointer';
    if(hmSel===muscle)row.style.borderColor='var(--am)';
    row.innerHTML='<div class="muscle-stat-name">'+muscle.toUpperCase()+'</div>'
      +'<div class="muscle-stat-bar"><div class="muscle-stat-fill" style="width:'+pct+'%;background:'+color+';"></div></div>'
      +'<div class="muscle-stat-val" style="color:'+color+';">'+score+'</div>';
    grid.appendChild(row);
  }
  statsCard.appendChild(grid);
  statsCard.addEventListener('click',function(e){
    var r=e.target.closest?e.target.closest('[data-m]'):null;
    if(!r)return;
    var m=r.getAttribute('data-m');
    hmSel=(hmSel===m)?null:m;
    renderProg();
  });
  cont.appendChild(statsCard);
}

function hmRegion(path,muscle,detail,max,extra){
  var sel=hmSel===muscle?' sel':'';
  return '<path d="'+path+'" fill="'+muscleColor(detail[muscle]?detail[muscle].sets:0,max)+'" stroke="#0a0e14" stroke-width="1.5" class="hm-region'+sel+'" data-m="'+muscle+'"'+(extra||'')+'/>';
}
function hmEllipse(cx,cy,rx,ry,muscle,detail,max){
  var sel=hmSel===muscle?' sel':'';
  return '<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" fill="'+muscleColor(detail[muscle]?detail[muscle].sets:0,max)+'" stroke="#0a0e14" stroke-width="1.5" class="hm-region'+sel+'" data-m="'+muscle+'"/>';
}
function buildFrontSVG(detail, max){
  return '<svg width="130" height="280" viewBox="0 0 130 280" xmlns="http://www.w3.org/2000/svg">'
  // Head
  +'<ellipse cx="65" cy="22" rx="18" ry="20" fill="#1a2a3a" stroke="#2e3f4a" stroke-width="1"/>'
  // Neck
  +'<rect x="58" y="40" width="14" height="12" rx="3" fill="#1a2a3a" stroke="#2e3f4a" stroke-width="1"/>'
  // Upper chest band
  +hmRegion('M35,52 Q65,48 95,52 L96,70 Q65,73 34,70 Z','Upper Chest',detail,max)
  // Mid/lower chest band
  +hmRegion('M34,70 Q65,73 96,70 L98,90 Q65,95 32,90 Z','Mid Chest',detail,max)
  // Front delts (front view shows the anterior head)
  +hmEllipse(25,65,13,16,'Front Delts',detail,max)
  +hmEllipse(105,65,13,16,'Front Delts',detail,max)
  // Biceps
  +hmRegion('M13,80 Q8,95 10,115 L22,115 Q24,95 22,80 Z','Biceps',detail,max)
  +hmRegion('M117,80 Q122,95 120,115 L108,115 Q106,95 108,80 Z','Biceps',detail,max)
  // Forearms
  +hmRegion('M10,116 Q6,135 8,155 L20,155 Q22,135 22,116 Z','Forearms',detail,max)
  +hmRegion('M120,116 Q124,135 122,155 L110,155 Q108,135 108,116 Z','Forearms',detail,max)
  // Obliques — side strips
  +hmRegion('M38,90 L46,92 L46,138 L40,140 Z','Obliques',detail,max)
  +hmRegion('M92,90 L84,92 L84,138 L90,140 Z','Obliques',detail,max)
  // Abs — center column
  +hmRegion('M46,92 Q65,95 84,92 L84,138 Q65,142 46,138 Z','Abs',detail,max)
  // Quads
  +hmRegion('M40,144 Q38,145 35,175 Q34,195 38,210 L58,210 Q60,195 60,175 Q60,150 55,144 Z','Quads',detail,max)
  +hmRegion('M90,144 Q92,145 95,175 Q96,195 92,210 L72,210 Q70,195 70,175 Q70,150 75,144 Z','Quads',detail,max)
  // Knees
  +'<ellipse cx="48" cy="215" rx="10" ry="8" fill="#1a2a3a" stroke="#2e3f4a" stroke-width="1"/>'
  +'<ellipse cx="82" cy="215" rx="10" ry="8" fill="#1a2a3a" stroke="#2e3f4a" stroke-width="1"/>'
  // Calves
  +hmRegion('M38,223 Q35,245 37,265 L58,265 Q60,245 58,223 Z','Calves',detail,max)
  +hmRegion('M92,223 Q95,245 93,265 L72,265 Q70,245 72,223 Z','Calves',detail,max)
  // Labels
  +'<text x="65" y="63" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="4.5" fill="#040608" opacity=".7" pointer-events="none">UP CHEST</text>'
  +'<text x="65" y="82" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="4.5" fill="#040608" opacity=".7" pointer-events="none">CHEST</text>'
  +'<text x="65" y="118" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="5" fill="#040608" opacity=".7" pointer-events="none">ABS</text>'
  +'<text x="48" y="182" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="5" fill="#040608" opacity=".7" pointer-events="none">QUAD</text>'
  +'<text x="82" y="182" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="5" fill="#040608" opacity=".7" pointer-events="none">QUAD</text>'
  +'<text x="48" y="246" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="5" fill="#040608" opacity=".7" pointer-events="none">CALF</text>'
  +'<text x="82" y="246" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="5" fill="#040608" opacity=".7" pointer-events="none">CALF</text>'
  +'</svg>';
}

function buildBackSVG(detail, max){
  return '<svg width="130" height="280" viewBox="0 0 130 280" xmlns="http://www.w3.org/2000/svg">'
  // Head
  +'<ellipse cx="65" cy="22" rx="18" ry="20" fill="#1a2a3a" stroke="#2e3f4a" stroke-width="1"/>'
  // Neck
  +'<rect x="58" y="40" width="14" height="12" rx="3" fill="#1a2a3a" stroke="#2e3f4a" stroke-width="1"/>'
  // Traps — upper band
  +hmRegion('M35,52 Q65,48 95,52 L96,72 Q65,70 34,72 Z','Traps',detail,max)
  // Rear delts
  +hmEllipse(25,65,13,16,'Rear Delts',detail,max)
  +hmEllipse(105,65,13,16,'Rear Delts',detail,max)
  // Triceps
  +hmRegion('M13,80 Q8,95 10,115 L22,115 Q24,95 22,80 Z','Triceps',detail,max)
  +hmRegion('M117,80 Q122,95 120,115 L108,115 Q106,95 108,80 Z','Triceps',detail,max)
  // Forearms
  +hmRegion('M10,116 Q6,135 8,155 L20,155 Q22,135 22,116 Z','Forearms',detail,max)
  +hmRegion('M120,116 Q124,135 122,155 L110,155 Q108,135 108,116 Z','Forearms',detail,max)
  // Lats — two side panels
  +hmRegion('M34,72 Q48,74 50,76 L50,122 Q42,124 38,118 Q34,100 34,72 Z','Lats',detail,max)
  +hmRegion('M96,72 Q82,74 80,76 L80,122 Q88,124 92,118 Q96,100 96,72 Z','Lats',detail,max)
  // Mid spine column (structure)
  +'<path d="M50,76 Q65,74 80,76 L80,118 Q65,120 50,118 Z" fill="#1a2a3a" stroke="#0a0e14" stroke-width="1.5"/>'
  // Lower back
  +hmRegion('M40,118 Q65,124 90,118 L90,140 Q65,144 40,140 Z','Lower Back',detail,max)
  // Glutes
  +hmRegion('M40,140 Q38,142 36,165 Q35,180 40,185 L60,185 Q64,175 62,155 Q60,142 55,140 Z','Glutes',detail,max)
  +hmRegion('M90,140 Q92,142 94,165 Q95,180 90,185 L70,185 Q66,175 68,155 Q70,142 75,140 Z','Glutes',detail,max)
  // Hamstrings
  +hmRegion('M38,185 Q35,200 36,210 L58,210 Q60,200 60,185 Z','Hamstrings',detail,max)
  +hmRegion('M92,185 Q95,200 94,210 L72,210 Q70,200 70,185 Z','Hamstrings',detail,max)
  // Knees
  +'<ellipse cx="48" cy="215" rx="10" ry="8" fill="#1a2a3a" stroke="#2e3f4a" stroke-width="1"/>'
  +'<ellipse cx="82" cy="215" rx="10" ry="8" fill="#1a2a3a" stroke="#2e3f4a" stroke-width="1"/>'
  // Calves
  +hmRegion('M38,223 Q35,245 37,265 L58,265 Q60,245 58,223 Z','Calves',detail,max)
  +hmRegion('M92,223 Q95,245 93,265 L72,265 Q70,245 72,223 Z','Calves',detail,max)
  // Labels
  +'<text x="65" y="63" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="5" fill="#040608" opacity=".7" pointer-events="none">TRAPS</text>'
  +'<text x="42" y="98" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="4.5" fill="#040608" opacity=".7" pointer-events="none">LAT</text>'
  +'<text x="88" y="98" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="4.5" fill="#040608" opacity=".7" pointer-events="none">LAT</text>'
  +'<text x="65" y="132" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="4.5" fill="#040608" opacity=".7" pointer-events="none">LOW BACK</text>'
  +'<text x="48" y="165" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="5" fill="#040608" opacity=".7" pointer-events="none">GLUTE</text>'
  +'<text x="82" y="165" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="5" fill="#040608" opacity=".7" pointer-events="none">GLUTE</text>'
  +'<text x="48" y="200" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="5" fill="#040608" opacity=".7" pointer-events="none">HAM</text>'
  +'<text x="82" y="200" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="5" fill="#040608" opacity=".7" pointer-events="none">HAM</text>'
  +'<text x="48" y="246" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="5" fill="#040608" opacity=".7" pointer-events="none">CALF</text>'
  +'<text x="82" y="246" text-anchor="middle" font-family="Orbitron,sans-serif" font-size="5" fill="#040608" opacity=".7" pointer-events="none">CALF</text>'
  +'</svg>';
}
