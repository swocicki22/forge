// ════════════════════════════════
// SPLASH SCREEN
// ════════════════════════════════
function renderSplash(){
  var bld=el('splash-build');if(bld)bld.textContent='BUILD v'+APP_VERSION;
  var users=loadUsers();
  var grid=el('user-grid');grid.innerHTML='';
  for(var i=0;i<users.length;i++){
    var u=users[i];
    var data=getUserData(u.id);
    var sessions=data.log?data.log.length:0;
    var card=document.createElement('div');card.className='user-card';
    card.innerHTML='<div class="user-avatar" style="background:'+u.color+'22;border-color:'+u.color+'44;color:'+u.color+'">'+esc(u.name.charAt(0).toUpperCase())+'</div>'
      +'<div class="user-name">'+esc(u.name.toUpperCase())+'</div>'
      +'<div class="user-sessions">'+sessions+' sessions</div>';
    (function(uid){card.onclick=function(){selectUser(uid);};})(u.id);
    grid.appendChild(card);
  }
  if(users.length<5){
    var add=document.createElement('div');add.className='add-user-card';
    add.innerHTML='<div class="add-user-plus">+</div><div class="add-user-label">NEW PROFILE</div>';
    add.onclick=function(){openCreateUser();};
    grid.appendChild(add);
  }
}

function selectUser(userId){
  var users=loadUsers();var user=null;
  for(var i=0;i<users.length;i++){if(users[i].id===userId){user=users[i];break;}}
  if(!user)return;
  pendingUserId=userId;
  pinBuffer='';pinMode='verify';
  el('pin-title').textContent='ENTER PIN';
  el('pin-sub').textContent=user.name.toUpperCase()+' — Identify yourself';
  updatePinDots();
  el('pin-screen').classList.remove('hidden');
}

function openCreateUser(){
  el('cu-name').value='';el('cu-pin').value='';
  var cp=el('color-picker');cp.innerHTML='';
  for(var i=0;i<AVATAR_COLORS.length;i++){
    var btn=document.createElement('div');
    btn.setAttribute('data-color',AVATAR_COLORS[i]);
    btn.setAttribute('data-selected',i===0?'1':'0');
    btn.style.cssText='width:34px;height:34px;border-radius:50%;background:'+AVATAR_COLORS[i]+';cursor:pointer;border:3px solid '+(i===0?'#fff':'transparent')+';transition:border .15s;flex-shrink:0;';
    btn.onclick=function(){
      var bs=el('color-picker').children;
      for(var j=0;j<bs.length;j++){bs[j].style.border='3px solid transparent';bs[j].setAttribute('data-selected','0');}
      this.style.border='3px solid #fff';this.setAttribute('data-selected','1');
    };
    cp.appendChild(btn);
  }
  el('create-user-mo').classList.add('visible');
}

function createUser(){
  var name=el('cu-name').value.trim();
  var pinVal=el('cu-pin').value.trim();
  if(!name){showToast('NAME REQUIRED');return;}
  if(name.length>20)name=name.slice(0,20);
  if(!/^\d{4}$/.test(pinVal)){showToast('4-DIGIT PIN REQUIRED');return;}
  var users=loadUsers();
  if(users.length>=5){showToast('MAX 5 PROFILES');return;}
  var color=AVATAR_COLORS[0];
  var bs=el('color-picker').children;
  for(var i=0;i<bs.length;i++){if(bs[i].getAttribute('data-selected')==='1'){color=bs[i].getAttribute('data-color');break;}}
  var uid='u_'+Date.now();
  var salt=genSalt();
  hashPin(pinVal,salt).then(function(h){
    users.push({id:uid,name:name,color:color,pinSalt:salt,pinHash:h,failCount:0,lockUntil:0});
    saveUsers(users);
    closeModal('create-user-mo');
    renderSplash();
    showToast('PROFILE CREATED');
  });
}

function pinPress(digit){
  if(pinBuffer.length>=4)return;
  pinBuffer+=digit;
  updatePinDots();
  if(pinBuffer.length===4){setTimeout(function(){processPIN();},120);}
}
function pinDel(){pinBuffer=pinBuffer.slice(0,-1);updatePinDots();}
function updatePinDots(){
  for(var i=0;i<4;i++){
    var dot=el('pd'+i);dot.classList.remove('filled','error');
    if(i<pinBuffer.length)dot.classList.add('filled');
  }
}
function processPIN(){
  var users=loadUsers();var user=null;
  for(var i=0;i<users.length;i++){if(users[i].id===pendingUserId){user=users[i];break;}}
  if(!user)return;
  var now=Date.now();
  if(user.lockUntil&&now<user.lockUntil){
    var secs=Math.ceil((user.lockUntil-now)/1000);
    pinBuffer='';updatePinDots();
    showToast('LOCKED — RETRY IN '+secs+'S');
    return;
  }
  var entered=pinBuffer;
  function pinResult(ok){
    if(ok){
      user.failCount=0;user.lockUntil=0;
      if(user.pin!==undefined){
        // Migrate legacy plaintext PIN to salted hash, then purge plaintext
        var salt=genSalt();
        hashPin(entered,salt).then(function(h){
          user.pinSalt=salt;user.pinHash=h;delete user.pin;saveUsers(users);
        });
      }else{saveUsers(users);}
      currentUserId=pendingUserId;
      el('pin-screen').classList.add('hidden');
      el('splash').classList.add('hidden');
      el('main-app').style.display='flex';
      pinBuffer='';updatePinDots();
      loadUserIntoApp(user);
    }else{
      user.failCount=(user.failCount||0)+1;
      if(user.failCount>=5){
        user.lockUntil=Date.now()+30000;user.failCount=0;
        showToast('TOO MANY ATTEMPTS — LOCKED 30S');
      }else{
        showToast('INCORRECT PIN');
      }
      saveUsers(users);
      for(var i=0;i<4;i++)el('pd'+i).classList.add('error');
      setTimeout(function(){pinBuffer='';updatePinDots();},600);
    }
  }
  if(user.pinHash&&user.pinSalt){
    hashPin(entered,user.pinSalt).then(function(h){pinResult(h===user.pinHash);});
  }else if(user.pin!==undefined){
    pinResult(entered===user.pin);
  }else{
    pinResult(false);
  }
}

function backToSplash(){
  releaseWakeLock();
  currentUserId=null;pinBuffer='';
  el('pin-screen').classList.add('hidden');
  el('main-app').style.display='none';
  el('splash').classList.remove('hidden');
  if(S.tint)clearInterval(S.tint);
  if(S.rint)clearInterval(S.rint);
  skipRest();
  renderSplash();
}
