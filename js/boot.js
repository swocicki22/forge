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
