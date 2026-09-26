// ════════════════════════════════
// NAVIGATION
// ════════════════════════════════
function showScreen(id){
  var ss=document.querySelectorAll('.screen');for(var i=0;i<ss.length;i++)ss[i].classList.remove('active');
  el(id).classList.add('active');
  var ns=document.querySelectorAll('.ni');for(var i=0;i<ns.length;i++)ns[i].classList.remove('active');
  var m={'s-home':'ni-home','s-workout':'ni-workout','s-active':'ni-workout','s-editor':'ni-workout','s-progress':'ni-progress','s-library':'ni-library','s-body':'ni-body'};
  if(m[id])el(m[id]).classList.add('active');
  if(id==='s-home')renderHome();
  if(id==='s-workout')renderSel();
  if(id==='s-progress')renderProg();
  if(id==='s-library')renderLib();
  if(id==='s-body')renderBody();
  updateLivePill();
}

// ── Live session pill ──
// Shown on every screen except the session itself whenever a session is
// running, so there is always a way back to it.
function updateLivePill(t){
  var pill=el('live-pill');if(!pill)return;
  var onActive=el('s-active').classList.contains('active');
  if(!hasLiveSession()||onActive){pill.classList.remove('visible');return;}
  if(!t){var e=Math.floor((Date.now()-S.start)/1000),s=e%60;t=Math.floor(e/60)+':'+(s<10?'0':'')+s;}
  pill.innerHTML='<span class="lp-dot"></span><span class="lp-name">'+esc((S.activeDay.name||'SESSION').toUpperCase())+
                 '</span><span class="lp-time">'+t+'</span><span class="lp-go">RETURN &#9656;</span>';
  pill.classList.add('visible');
}

// ════════════════════════════════
// INIT
// ════════════════════════════════
(function initApp(){
  // Ask the browser not to evict our storage (Safari purges idle origins after ~7 days otherwise)
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){}
  // Service worker — offline shell + font caching (HTTPS / localhost only)
  if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
    try{navigator.serviceWorker.register('sw.js');}catch(e){}
  }
  renderSplash();
})();
