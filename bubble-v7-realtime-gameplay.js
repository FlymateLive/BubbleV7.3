/* Bubble V7.2 — realtime interactive gameplay engine */
(() => {
'use strict';
const GP = {sessions:new Map(), raf:0, last:0};
const q=(s,r=document)=>r.querySelector(s);
const qa=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hash=(...xs)=>{let h=2166136261; for(const s of xs.join('|')) for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)} return h>>>0};
const rnd=(seed)=>{let x=seed||1;return()=>((x=Math.imul(1664525,x)+1013904223>>>0)/4294967296)};
const genres={Racing:'race',Taktik:'shooter',Action:'shooter',Sport:'football',Horror:'horror',RPG:'rpg',Sandbox:'sandbox',Cozy:'sandbox',Party:'party',Simulation:'sim'};
function gameInfo(id){
 const db=(typeof GAME_DB!=='undefined'?GAME_DB:[]);
 return db.find(g=>g.id===id)||{id:id||'game',name:'Game',genre:'Action',icon:'🎮'};
}
function makeState(key,game,elapsed=0){
 const r=rnd(hash(key,game.id,'v72')), kind=genres[game.genre]||'shooter';
 return {key,game,kind,t:elapsed||0,lastEventAt:elapsed||0,eventSeq:0,score:0,enemyScore:0,hp:100,ammo:30,
 x:.5,y:.62,aimX:.52,aimY:.43,speed:kind==='race'?190:0,pos:kind==='race'?8:0,lap:1,progress:0,
 ballX:.5,ballY:.52,possession:true,bossHp:100,danger:0,combo:0,objective:0,
 seed:r(),flash:0,shake:0,lastEvent:null,queued:[],manual:false};
}
function session(key,game,elapsed){let s=GP.sessions.get(key);if(!s||s.game.id!==game.id){s=makeState(key,game,elapsed);GP.sessions.set(key,s)}return s}
function emit(s,type,title,detail,intensity=1){
 const e={id:`${s.key}-${++s.eventSeq}`,type,title,detail,intensity,t:s.t};
 s.lastEvent=e;s.flash=Math.max(s.flash,.5*intensity);s.shake=Math.max(s.shake,4*intensity);s.queued.push(e);
 if(s.queued.length>8)s.queued.shift();
 return e;
}
function step(s,dt){
 dt=Math.min(dt,.05);s.t+=dt;s.flash=Math.max(0,s.flash-dt*2.2);s.shake*=.9;
 const r=rnd(hash(s.key,Math.floor(s.t*2),s.eventSeq,s.game.id));
 if(s.kind==='shooter'){
   s.aimX=clamp(s.aimX+(r()-.5)*dt*.35,.16,.84);s.aimY=clamp(s.aimY+(r()-.5)*dt*.25,.18,.7);
   s.x=clamp(s.x+Math.sin(s.t*.8+s.seed*9)*dt*.025,.28,.72);s.objective=(s.objective+dt*1.7)%100;
   if(s.t-s.lastEventAt>3.6+r()*3.8){s.lastEventAt=s.t;
     const hit=r()>.24;if(hit){s.ammo=Math.max(0,s.ammo-1);s.combo++;s.score++;emit(s,'kill',s.combo>2?`${s.combo}x KILLSTREAK`:'ELIMINIERT',r()>.75?'Headshot durch die Deckung.':'Gegner am Objective ausgeschaltet.',1.2)}
     else {s.hp=clamp(s.hp-(8+Math.floor(r()*27)),1,100);s.combo=0;emit(s,'damage',s.hp<20?'1 HP!':'TREFFER EINGESTECKT',s.hp<20?'Extrem knapp überlebt.':'Unter Beschuss – Deckung suchen.',1)}
     if(s.ammo<=3){s.ammo=30;emit(s,'reload','NACHLADEN','Magazin fast leer.',.6)}
   }
 } else if(s.kind==='race'){
   s.speed=clamp(s.speed+(r()-.43)*dt*45,110,312);s.progress+=dt*s.speed/125;s.x=.5+Math.sin(s.t*.9+s.seed*5)*.19;
   if(s.progress>100){s.progress-=100;s.lap++;s.pos=Math.max(1,s.pos-(r()>.42?1:0));emit(s,'lap',s.lap>3?'FINISH!':`RUNDE ${s.lap}`,s.pos===1?'Du führst das Rennen an.':`Aktuell P${s.pos}.`,1.2)}
   if(s.t-s.lastEventAt>4.8+r()*4){s.lastEventAt=s.t;if(r()>.32){s.pos=Math.max(1,s.pos-1);emit(s,'overtake','ÜBERHOLMANÖVER',`Vorbei – jetzt Platz ${s.pos}.`,1)}else{ s.speed*=.72;s.pos=Math.min(12,s.pos+1);emit(s,'crash','KONTAKT!','Zu spät gebremst – Position verloren.',1.3)}}
 } else if(s.kind==='football'){
   s.ballX=clamp(s.ballX+(s.possession?.11:-.1)*dt+Math.sin(s.t*2)*dt*.025,.08,.92);s.ballY=.5+Math.sin(s.t*1.4+s.seed*7)*.27;
   if(s.t-s.lastEventAt>5+r()*4){s.lastEventAt=s.t;
     if(s.possession&&r()>.42){s.score++;s.ballX=.5;s.possession=false;emit(s,'goal','TOOOR!',r()>.5?'Direkt unter die Latte.':'In der Nachspielzeit eiskalt verwandelt.',1.5)}
     else {s.possession=!s.possession;if(!s.possession&&r()>.65)s.enemyScore++;emit(s,'chance',s.possession?'BALL EROBERT':'GEGENANGRIFF',s.possession?'Jetzt schnell umschalten.':'Die Defensive muss zurück.',.9)}
   }
 } else if(s.kind==='horror'){
   s.danger=clamp(.45+.4*Math.sin(s.t*.35+s.seed*10),0,1);s.x=.5+Math.sin(s.t*.22)*.08;
   if(s.t-s.lastEventAt>5.5+r()*5){s.lastEventAt=s.t;if(r()<.3){s.hp=clamp(s.hp-20,1,100);emit(s,'jumpscare','JUMPSCARE!',r()>.5?'Direkt hinter der Tür.':'Etwas stand plötzlich im Flur.',1.6)}else emit(s,'horror',s.danger>.65?'SCHRITTE HINTER DIR':'GERÄUSCH',s.danger>.65?'Nicht umdrehen…':'Da war definitiv etwas.',1)}
 } else if(s.kind==='rpg'){
   s.bossHp=clamp(s.bossHp-dt*(1.5+r()*2.2),0,100);s.hp=clamp(s.hp-dt*(r()>.85?3:0),1,100);
   if(s.t-s.lastEventAt>4.7+r()*4){s.lastEventAt=s.t;if(r()>.35){s.bossHp=clamp(s.bossHp-(7+r()*13),0,100);emit(s,'crit','KRITISCHER TREFFER',`${Math.round(s.bossHp)} % Boss-Leben übrig.`,1)}else{s.hp=clamp(s.hp-18,1,100);emit(s,'damage',s.hp<20?'FAST TOT':'BOSS-ANGRIFF',`${Math.round(s.hp)} HP verbleiben.`,1.2)}}
   if(s.bossHp<=0){s.bossHp=100;s.score++;emit(s,'boss','BOSS BESIEGT','Legendärer Loot ist gedroppt.',1.6)}
 } else {
   s.progress=(s.progress+dt*4.2)%100;
   if(s.t-s.lastEventAt>6+r()*5){s.lastEventAt=s.t;emit(s,'build',r()>.35?'PROJEKT-FORTSCHRITT':'CHAOS-MOMENT',r()>.5?'Das Projekt nimmt Form an.':'Das war so definitiv nicht geplant.',.8)}
 }
}
function hud(s){
 if(s.kind==='shooter')return `<b>${s.hp} HP</b><span>${s.ammo}/30</span><span>K ${s.score}</span><span>OBJ ${Math.round(s.objective)}%</span>`;
 if(s.kind==='race')return `<b>${Math.round(s.speed)} KM/H</b><span>P${s.pos||8}</span><span>R ${s.lap}/3</span><span>${Math.round(s.progress)}%</span>`;
 if(s.kind==='football')return `<b>${s.score} : ${s.enemyScore}</b><span>${s.possession?'BALLBESITZ':'DEFENSIVE'}</span><span>${Math.floor(s.t/60)}:${String(Math.floor(s.t%60)).padStart(2,'0')}</span>`;
 if(s.kind==='horror')return `<b>${s.hp} HP</b><span>GEFAHR ${Math.round(s.danger*100)}%</span><span>🔦 ${Math.round(75-s.danger*35)}%</span>`;
 if(s.kind==='rpg')return `<b>${s.hp} HP</b><span>BOSS ${Math.round(s.bossHp)}%</span><span>SIEGE ${s.score}</span>`;
 return `<b>FORTSCHRITT ${Math.round(s.progress)}%</b><span>${s.game.genre}</span>`;
}
function scene(s){
 const stars=Array.from({length:10},(_,i)=>`<i style="--x:${(hash(s.key,i)%94)+3}%;--y:${(hash(i,s.key)%65)+8}%;--d:${1+(i%4)}"></i>`).join('');
 if(s.kind==='shooter')return `<div class="rt-map">${stars}<div class="rt-cover c1"></div><div class="rt-cover c2"></div><div class="rt-enemy" style="left:${s.aimX*100}%;top:${s.aimY*100}%"><span></span></div><div class="rt-gun"></div><div class="rt-cross" style="left:${s.aimX*100}%;top:${s.aimY*100}%"></div><div class="rt-minimap"><i></i><i></i><i></i></div></div>`;
 if(s.kind==='race')return `<div class="rt-sky">${stars}</div><div class="rt-road"><i></i><i></i><i></i><div class="rt-car" style="left:${s.x*100}%"></div><div class="rt-rival r1"></div><div class="rt-rival r2"></div></div>`;
 if(s.kind==='football')return `<div class="rt-pitch"><div class="rt-center"></div>${Array.from({length:8},(_,i)=>`<i class="rt-player p${i}"></i>`).join('')}<div class="rt-ball" style="left:${s.ballX*100}%;top:${s.ballY*100}%"></div></div>`;
 if(s.kind==='horror')return `<div class="rt-hall"><div class="rt-door"></div><div class="rt-light"></div>${s.danger>.72?'<div class="rt-figure"></div>':''}<div class="rt-flashlight"></div></div>`;
 if(s.kind==='rpg')return `<div class="rt-rpg">${stars}<div class="rt-boss">🐉<i style="width:${s.bossHp}%"></i></div><div class="rt-hero">⚔️</div><div class="rt-spell"></div></div>`;
 return `<div class="rt-sandbox">${stars}<div class="rt-build"><i></i><i></i><i></i><i></i><i></i></div><div class="rt-avatar"></div></div>`;
}
function render(el,s){
 el.innerHTML=`<div class="rt-scene ${s.kind}" style="--shake:${s.shake}px">${scene(s)}
 <div class="rt-gamebar"><b>${s.game.icon||'🎮'} ${esc(s.game.name)}</b><span>${esc(s.game.genre)} · LIVE</span></div>
 <div class="rt-hud">${hud(s)}</div>
 ${s.lastEvent&&s.t-s.lastEvent.t<2.8?`<div class="rt-event e-${s.lastEvent.type}"><b>${esc(s.lastEvent.title)}</b><span>${esc(s.lastEvent.detail)}</span></div>`:''}
 <div class="rt-live-dot">● LIVE</div></div>`;
}
function identify(el){
 const route=typeof currentRoute==='function'?currentRoute():{};
 let own=!!el.closest('[data-gameplay-own],.gameplay-stage-art');
 let id,elapsed=0,key,game;
 if(own&&S.live?.active){id=S.live.active.gameId||S.career?.games?.selected;elapsed=S.live.active.elapsed||0;key='own-'+(S.live.active.id||'live');game=gameInfo(id)}
 else {const room=route?.name==='live'&&route?.a==='watch'?S.live?.rooms?.[+route.b]:null;if(!room)return null;id=room.gameId||(typeof liveChannel==='function'?liveChannel(room.id)?.gameId:null);elapsed=room.elapsed||0;key='npc-'+room.id;game=gameInfo(id)}
 return {key,game,elapsed,own,room:own?null:(route?.name==='live'?S.live?.rooms?.[+route.b]:null)};
}
function drain(meta,s){
 if(!s.queued.length)return;
 const events=s.queued.splice(0);
 for(const e of events){
   if(s.t-e.t>1.2)continue;
   const reactions={
    kill:[`DER SHOT 😭🔥`,`okay das war clean`,`clippen!! ${e.title.toLowerCase()}`,`wie hast du den gesehen??`],
    damage:[`NEIN 😭`,`raus da!!`,`das war knapp`,`ich dachte das wars 💀`],
    goal:[`TOOOOOOR 🔥🔥`,`WAS EIN TOR`,`90+? ich raste aus`,`CLIP CLIP CLIP`],
    crash:[`💀💀💀`,`die Kurve war persönlich`,`P${s.pos} comeback jetzt`,`das Auto hat Familie 😭`],
    overtake:[`SAUBER 🔥`,`P${s.pos} LETS GO`,`der move war frech`,`noch einen!`],
    jumpscare:[`ICH BIN AUCH ERSCHROCKEN 😭`,`mach das licht an 💀`,`NEIN NEIN NEIN`,`chat hat kollektiv geschrien`],
    boss:[`W BOSSFIGHT`,`ENDLICH 😭🔥`,`der loot!!`,`das war verdient`],
    crit:[`CRIT 🔥`,`der damage!!`,`boss schmilzt`,`noch einmal so`]
   };
   const pool=reactions[e.type]||[`das war gerade wild 😭`,`clippen!`,`Chat hat das gesehen 👀`,`W moment`];
   if(meta.own&&S.live?.active?.pending&&typeof pickLiveNPC==='function'){
      const r=rnd(hash(e.id,'chat'));for(let i=0;i<Math.min(3,1+Math.floor(e.intensity*2));i++)S.live.active.pending.push({id:pickLiveNPC({int:(a,b)=>a+Math.floor(r()*(b-a+1)),pick:a=>a[Math.floor(r()*a.length)]}),text:pool[Math.floor(r()*pool.length)],at:(S.live.active.elapsed||0)+.3+i*.55});
      if(e.intensity>=1.3&&S.live.active.highlights){S.live.active.highlights.push(`${s.game.name}: ${e.title}`);S.live.active.highlights=S.live.active.highlights.slice(-12)}
   } else if(meta.room&&typeof guestMessage==='function'){
      const r=rnd(hash(e.id,'guest'));const crowd=meta.room.crowd||[];for(let i=0;i<2&&crowd.length;i++)guestMessage(meta.room,pool[Math.floor(r()*pool.length)],crowd[Math.floor(r()*crowd.length)]);
      if(e.intensity>=1.25)guestMessage(meta.room,`Chat… ${e.title.toLowerCase()} war gerade komplett verrückt.`,meta.room.id,'host');
   }
 }
}
function frame(ts){
 const dt=GP.last?Math.min((ts-GP.last)/1000,.05):.016;GP.last=ts;
 qa('.gameplay-sim').forEach(el=>{
   const meta=identify(el);if(!meta)return;const s=session(meta.key,meta.game,meta.elapsed);
   if(Math.abs((meta.elapsed||0)-s.t)>5)s.t=meta.elapsed||s.t;
   step(s,dt);render(el,s);drain(meta,s);
 });
 GP.raf=requestAnimationFrame(frame);
}
function start(){if(!GP.raf)GP.raf=requestAnimationFrame(frame)}
start();
window.BubbleRealtimeGameplay={GP,emit,session,gameInfo};
})();