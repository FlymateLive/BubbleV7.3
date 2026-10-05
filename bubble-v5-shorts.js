/* Bubble V5.2 — Shorts, games, cutter workflow and richer simulated content */
(() => {
'use strict';
const GAMES = [
 {id:'neon-drift',name:'Neon Drift',icon:'🏎️',price:280,genre:'Racing',hook:'knappe Überholmanöver'},
 {id:'blockbound',name:'Blockbound',icon:'🧱',price:190,genre:'Sandbox',hook:'absurde Builds'},
 {id:'last-signal',name:'Last Signal',icon:'👻',price:360,genre:'Horror',hook:'Jumpscares und Panik'},
 {id:'strikepoint',name:'Strikepoint',icon:'🎯',price:420,genre:'Taktik',hook:'Clutches und Teamplay'},
 {id:'cozy-county',name:'Cozy County',icon:'🌱',price:160,genre:'Cozy',hook:'entspannte Fortschritte'},
 {id:'goal-rush',name:'Goal Rush 27',icon:'⚽',price:390,genre:'Sport',hook:'Last-Minute-Tore'},
 {id:'skyforge',name:'Skyforge Legends',icon:'🐉',price:520,genre:'RPG',hook:'Bosskämpfe und Loot'},
 {id:'party-panic',name:'Party Panic!',icon:'🎉',price:230,genre:'Party',hook:'chaotische Fails'},
 {id:'frontier-ops',name:'Frontier Ops',icon:'🪖',price:470,genre:'Action',hook:'riskante Missionen'},
 {id:'metro-manager',name:'Metro Manager',icon:'🚇',price:210,genre:'Simulation',hook:'komplettes Verkehrschaos'}
];
const SHORT_LINES = [
 'POV: Du sagst „eine letzte Runde“ und plötzlich ist es 03:17 Uhr.',
 'Der Plan war perfekt. Die Ausführung hatte andere Pläne.',
 'Chat: „Das schaffst du niemals.“ Ich, 14 Sekunden später:',
 'Dieser Moment, wenn aus Skill ganz kurz pures Glück wird.',
 'Ich wollte entspannt spielen. Das Spiel wollte Content.',
 'Niemand: wirklich niemand: Mein Team genau in diesem Moment:',
 'Wenn der Boss nur noch 1 HP hat und du plötzlich alles vergisst.',
 'Tutorial: So verliert man in Rekordzeit die komplette Würde.',
 'Der Gesichtsausdruck war nicht geplant. Der Fail leider auch nicht.',
 'Chat hat abgestimmt. Ich bereue, Demokratie eingeführt zu haben.',
 'Man hört exakt den Moment, in dem mein Selbstvertrauen verschwindet.',
 'Ich dachte kurz, ich wäre gut. Sehr kurz.',
 'Das war entweder 200 IQ oder ein historischer Unfall.',
 'Wenn der Random-Mate plötzlich zum Hauptcharakter wird.',
 'Sekunde 1: „easy“. Sekunde 12: absolute Katastrophe.'
];
const MEME_TOP = ['ICH: NUR EINE RUNDE', 'DER CHAT: VERTRAU MIR', 'MEIN PLAN', 'DAS TUTORIAL', 'ICH NACH 2 STUNDEN', 'DER EINE TEAMMATE', 'ERWARTUNG', 'MEIN LETZTER NERV'];
const MEME_BOTTOM = ['AUCH ICH UM 3 UHR NACHTS', 'DAS WAR EINE LÜGE', 'DAS SPIEL: NEIN.', 'ICH: HAB NICHT ZUGEHÖRT', 'IMMER NOCH IM MENÜ', 'MACHT EINFACH SEIN EIGENES DING', 'REALITÄT:', 'HAT SICH VERABSCHIEDET'];
function ensureX(){
 if(!S?.career) return;
 const c=S.career;
 c.games ||= {owned:['cozy-county'],selected:'cozy-county'};
 c.games.owned ||= ['cozy-county']; if(!c.games.owned.length)c.games.owned=['cozy-county'];
 if(!c.games.owned.includes(c.games.selected)) c.games.selected=c.games.owned[0];
 c.cutter ||= {hired:false,nextPay:0,level:1};
 c.shorts ||= {mine:[],drafts:[],uploaded:0};
 c.shortReactions ||= {};
}
function game(id){ return GAMES.find(g=>g.id===id)||GAMES[0]; }
function ownedGames(){ensureX(); return GAMES.filter(g=>S.career.games.owned.includes(g.id));}
function shortStats(seed, mine=false, age=1){ const f=Math.max(1,totalFollowers()); const vir=.7+u01(seed,'vir')*3.4; const v=Math.floor((mine?Math.max(30,f*.28):120+u01(seed,'base')*18000)*vir*Math.min(1.8,.35+age/4)); return {v,l:Math.floor(v*(.045+u01(seed,'lr')*.14)),c:Math.floor(v*(.004+u01(seed,'cr')*.025)),s:Math.floor(v*(.002+u01(seed,'sr')*.018))}; }
function shortNPC(i){ const seed=h32(S.seed,'short',i,Math.floor(gameNow()/DAY)); const id=h32(seed,'author'); const n=npc(id); const gaming=u01(seed,'gaming')<.72; const g=GAMES[h32(seed,'game')%GAMES.length]; const meme=!gaming || u01(seed,'meme')<.38; return {id:'n'+seed,seed,n,g,meme,text:SHORT_LINES[h32(seed,'line')%SHORT_LINES.length],t:gameNow()-(i*17+u01(seed,'age')*40)*60e3}; }
function memeVisual(seed,g,text){ const top=MEME_TOP[h32(seed,'top')%MEME_TOP.length], bottom=MEME_BOTTOM[h32(seed,'bottom')%MEME_BOTTOM.length]; const variants=['gradient','chat','split','score','poster']; const type=variants[h32(seed,'type')%variants.length]; if(type==='chat') return `<div class="short-art art-chat"><div class="fake-chat"><span>CHAT</span><b>${esc(top.toLowerCase())}</b><i>@randomviewer: clip das bitte 😭</i><i>@${esc(S.me.handle)}: nein.</i></div><strong>${esc(bottom)}</strong></div>`; if(type==='score') return `<div class="short-art art-score"><small>${esc(g?.name||'BUBBLE')}</small><b>${(h32(seed,'a')%9)+1} : ${h32(seed,'b')%5}</b><span>${esc(top)}</span><strong>${esc(bottom)}</strong></div>`; if(type==='split') return `<div class="short-art art-split"><div><small>ERWARTUNG</small><b>😎</b></div><div><small>REALITÄT</small><b>${['💀','😭','🤡','😵'][h32(seed,'em')%4]}</b></div><strong>${esc(text)}</strong></div>`; return `<div class="short-art art-gradient"><small>${esc(g?.name||'BUBBLE MEME')}</small><b>${esc(top)}</b><span>${['🎮','💀','😭','🔥','🤡'][h32(seed,'emoji')%5]}</span><strong>${esc(bottom)}</strong></div>`; }
function clipVisual(seed,g){ const pct=30+h32(seed,'pct')%69; return `<div class="short-art art-clip"><div class="clip-hud"><span>REC ●</span><small>${esc(g.name)}</small></div><div class="clip-game">${g.icon}<i style="--p:${pct}%"></i><b>${['CLUTCH!','NO WAY','1 HP','CHAT?!','LET’S GO!'][h32(seed,'moment')%5]}</b></div><div class="clip-caption">${esc(SHORT_LINES[h32(seed,'line2')%SHORT_LINES.length])}</div></div>`; }
function shortCard(x,mine=false){ const age=Math.max(.2,(gameNow()-x.t)/HOUR), st=shortStats(x.seed,mine,age), n=mine?meObj():x.n, g=x.g||game(x.gameId); const reacted=S.career.shortReactions[x.id]||{}; return `<article class="short-card" data-short="${x.id}"><div class="short-video">${x.meme?memeVisual(x.seed,g,x.text):clipVisual(x.seed,g)}<span class="short-badge">${x.meme?'MEME':'CLIP'}</span></div><div class="short-meta"><div class="short-author"><img class="av s" src="${avatarSrc(n)}" alt=""><div><b>${esc(n.name)}</b><small>@${esc(n.handle)} · ${esc(g?.name||'Bubble')}</small></div></div><p>${esc(x.text)}</p><div class="short-actions"><button data-act="short-like" data-id="${x.id}" class="${reacted.l?'on':''}">♥ <span>${fmt(st.l+(reacted.l?1:0))}</span></button><button data-act="short-comment" data-id="${x.id}">💬 <span>${fmt(st.c)}</span></button><button data-act="short-share" data-id="${x.id}">↗ <span>${fmt(st.s)}</span></button><span>▶ ${fmt(st.v)}</span></div></div></article>`; }
function shortsView(){ensureX(); const npcShorts=Array.from({length:10},(_,i)=>shortNPC(i)); const mine=S.career.shorts.mine.map(x=>({...x,n:meObj(),g:game(x.gameId)})); const all=[...mine,...npcShorts].sort((a,b)=>b.t-a.t); return headHTML('Bubble Shorts','Kurzvideos & Memes')+`<div class="shorts-workspace"><section class="shorts-hero"><div><span class="live-eyebrow">BUBBLE SHORTS</span><h2>Clips, Memes und Momente.</h2><p>NPCs erstellen eigenständige Kurzvideos und Memes. Gaming-Streams können von deinem Cutter automatisch zu uploadfertigen Shorts verarbeitet werden.</p></div><a class="btn acc" href="#/career/shorts">Meine Shorts & Cutter</a></section><div class="short-feed">${all.map(x=>shortCard(x,!!x.mine)).join('')}</div></div>`; }
VIEWS.shorts=shortsView;
const oldTabs=platformTabs; platformTabs=function(){ const html=oldTabs(); const sel=currentRoute().name==='shorts'; return html.replace('<a href="#/live"',`<a href="#/shorts" class="platform-tab shorts-tab${sel?' selected':''}" ${sel?'aria-current="page"':''}><span>▶</span>Bubble Shorts</a><a href="#/live"`); };

// Rich visual posts: a substantial share of NPC media becomes a composed meme/post instead of a repeated static scene.
const oldMedia=mediaHTML; mediaHTML=function(v){ if(!v.mine && v.np && h32(v.seed,'rich-post')%100<46){ const g=GAMES[h32(v.seed,'postgame')%GAMES.length]; return `<div class="bubble-rich-post">${h32(v.seed,'richkind')%2?memeVisual(v.seed,g,v.text):clipVisual(v.seed,g)}</div>`; } return oldMedia(v); };

function gameShop(){ensureX(); const c=S.career; return `<section class="creator-card"><div class="live-section-title"><div><h3>Spielebibliothek</h3><p>Gekaufte Spiele kannst du als konkreten Titel live streamen. Gaming-Streams liefern außerdem Material für Shorts.</p></div><span>🎮</span></div><div class="game-grid">${GAMES.map(g=>{const own=c.games.owned.includes(g.id);return `<article class="game-item ${own?'owned':''}"><span>${g.icon}</span><div><b>${esc(g.name)}</b><small>${esc(g.genre)} · ${esc(g.hook)}</small></div><button class="btn ${own?'ghost':'acc'} sm" data-act="game-buy" data-id="${g.id}" ${own?'disabled':''}>${own?'Gekauft ✓':credits(g.price)}</button></article>`}).join('')}</div></section><section class="creator-card"><h3>✂️ Persönlicher Cutter</h3><p>${c.cutter.hired?'Dein Cutter analysiert beendete Gaming-Streams automatisch und legt fertige Shorts als Entwürfe ab. Wochenlohn: 120 B¢.':'Einmalig 900 B¢ Einstellung. Danach 120 B¢ pro Spielwoche. Nach Gaming-Streams erstellt er automatisch 1–3 uploadfertige Short-Entwürfe.'}</p><button class="btn ${c.cutter.hired?'ghost':'acc'} sm" data-act="cutter-toggle">${c.cutter.hired?'Cutter kündigen':'Cutter einstellen · 900 B¢'}</button></section>`; }
const oldShop=careerShopView; careerShopView=function(){ const html=oldShop(); return html.replace('</div>',gameShop()+'</div>'); };

function cutterPay(){ensureX(); const c=S.career;if(!c.cutter.hired)return; while(c.cutter.nextPay && gameNow()>=c.cutter.nextPay){ if(c.balance<120){c.cutter.hired=false;note('Dein Cutter wurde pausiert: Guthaben für den Wochenlohn reicht nicht.');break;} careerBook(-120,'Cutter · Wochenlohn','cutterpay:'+c.cutter.nextPay); c.cutter.nextPay+=7*DAY; }}
function makeDrafts(recap,gameId){ensureX(); if(!S.career.cutter.hired)return; const g=game(gameId), count=Math.min(3,Math.max(1,1+(recap.highlights?.length||0))); for(let i=0;i<count;i++){const seed=h32(S.seed,recap.id,i,'cut'); S.career.shorts.drafts.unshift({id:'d'+seed,seed,gameId:g.id,text:SHORT_LINES[h32(seed,'caption')%SHORT_LINES.length],meme:i===count-1&&count>1,t:gameNow(),source:recap.id});} S.career.shorts.drafts=S.career.shorts.drafts.slice(0,20); note(`Dein Cutter hat ${count} ${count===1?'Short':'Shorts'} vorbereitet.`);}
const oldFinish=finishLive; finishLive=function(){ const s=S.live.active, gid=s?.gameId; oldFinish(); if(gid&&S.live.history[0]){makeDrafts(S.live.history[0],gid);markDirty();save();} };
ACT['live-end']=finishLive;

// Add a game selector to Gaming streams.
const oldLiveView=VIEWS.live; VIEWS.live=function(r){ ensureX(); let html=oldLiveView(r); if(!S.live.active){ const opts=ownedGames().map(g=>`<option value="${g.id}" ${S.career.games.selected===g.id?'selected':''}>${g.icon} ${esc(g.name)}</option>`).join(''); html=html.replace('</select></label></div><button class="live-start"',`</select></label><label class="game-select-label">Spiel<select id="live-game" class="field">${opts}</select></label></div><button class="live-start"`); } else if(S.live.active.gameId){ const g=game(S.live.active.gameId); html=html.replace('class="live-stage-category">',`class="live-stage-category">${g.icon} ${esc(g.name)} · `); } return html; };
const oldStart=startLive; startLive=function(){ ensureX(); const el=$('#live-game'); if(el)S.career.games.selected=el.value; const gaming=$('#live-category')?.value==='Gaming'; oldStart(); if(S.live.active&&gaming){S.live.active.gameId=S.career.games.selected; const g=game(S.live.active.gameId); S.live.active.title=S.live.active.title||g.name; addLiveMessage(`🎮 Heute spielen wir ${g.name}.`,null,'event');} markDirty();}; ACT['live-start']=startLive;

function creatorShorts(){ensureX(); cutterPay(); const c=S.career; return creatorHead('shorts','Shorts & Cutter')+`<div class="creator-workspace"><section class="creator-hero"><span class="live-eyebrow">CONTENT PIPELINE</span><h2>${c.shorts.drafts.length} fertige Short-Entwürfe</h2><p>Dein Cutter verarbeitet Gaming-Streams automatisch. Du entscheidest nur noch, welcher Clip auf Bubble Shorts veröffentlicht wird.</p></section>${c.shorts.drafts.length?`<section class="creator-card"><h3>Bereit zum Hochladen</h3><div class="draft-grid">${c.shorts.drafts.map(d=>`<article class="draft-short">${d.meme?memeVisual(d.seed,game(d.gameId),d.text):clipVisual(d.seed,game(d.gameId))}<div><b>${esc(game(d.gameId).name)}</b><p>${esc(d.text)}</p><button class="btn acc sm" data-act="short-upload" data-id="${d.id}">Auf Bubble Shorts hochladen</button></div></article>`).join('')}</div></section>`:'<section class="creator-card"><h3>Noch keine Entwürfe</h3><p>Kaufe ein Spiel, stelle einen Cutter ein und beende anschließend einen Gaming-Stream. Der Cutter erledigt den Rest automatisch.</p></section>'}<section class="creator-card"><h3>Veröffentlichte Shorts</h3><p>${c.shorts.uploaded} Shorts veröffentlicht · Shorts können neue Bubble- und Live-Zuschauer auf deinen Kanal bringen.</p><a class="btn ghost sm" href="#/shorts">Bubble Shorts öffnen</a></section></div>`; }
if(!CREATOR_TABS.some(x=>x[0]==='shorts')) CREATOR_TABS.splice(4,0,['shorts','Shorts']);
const prevCareer=VIEWS.career; VIEWS.career=r=>r.a==='shorts'?creatorShorts():prevCareer(r);

ACT['game-buy']=b=>{ensureX();const g=game(b.dataset.id);if(S.career.games.owned.includes(g.id))return;if(!careerBook(-g.price,`Spiel gekauft · ${g.name}`,`game:${g.id}`))return note('Dafür reicht dein Guthaben noch nicht.');S.career.games.owned.push(g.id);S.career.games.selected=g.id;markDirty();save();renderRoute(true);note(`${g.name} gehört jetzt zu deiner Bibliothek.`);};
ACT['cutter-toggle']=()=>{ensureX();const c=S.career;if(c.cutter.hired){c.cutter.hired=false;markDirty();renderRoute(true);return;}if(!careerBook(-900,'Cutter eingestellt','cutter-hire:'+gameNow()))return note('Dafür reicht dein Guthaben noch nicht.');c.cutter.hired=true;c.cutter.nextPay=gameNow()+7*DAY;markDirty();save();renderRoute(true);};
ACT['short-upload']=b=>{ensureX();const i=S.career.shorts.drafts.findIndex(d=>d.id===b.dataset.id);if(i<0)return;const d=S.career.shorts.drafts.splice(i,1)[0];const x={...d,id:'m'+d.seed,mine:true,t:gameNow()};S.career.shorts.mine.unshift(x);S.career.shorts.mine=S.career.shorts.mine.slice(0,30);S.career.shorts.uploaded++;const st=shortStats(x.seed,true,1);const gain=Math.max(1,Math.floor(st.v*(.006+u01(x.seed,'gain')*.02)));S.followers+=gain;S.live.followers+=Math.floor(gain*.35);markDirty();save();location.hash='#/shorts';note(`Short veröffentlicht · erste Reichweite bringt etwa ${fmt(gain)} neue Follower.`);};
ACT['short-like']=b=>{ensureX();const r=S.career.shortReactions[b.dataset.id]||={};r.l=!r.l;markDirty();renderRoute(true);};
ACT['short-share']=b=>{ensureX();const r=S.career.shortReactions[b.dataset.id]||={};r.s=(r.s||0)+1;markDirty();note('Short geteilt');renderRoute(true);};
ACT['short-comment']=b=>{ const lines=['Das Timing 😭','Okay, der Clip ist stark 😂','Wie ist das bitte passiert?','Ich kann nicht mehr 💀','Das Ende hat mich komplett erwischt.','Bitte mehr davon.']; openModal('Kommentare',`<div class="short-comment-list">${lines.slice(0,3+h32(b.dataset.id,'cc')%4).map((t,i)=>{const n=npc(h32(b.dataset.id,i,'commenter'));return `<div class="cmt"><img class="av s" src="${avatarSrc(n)}"><div><b>@${esc(n.handle)}</b><p>${esc(t)}</p></div></div>`}).join('')}</div>`,'<button class="btn acc" data-act="close-modal">Schließen</button>');};

// Player comments/replies visibly earn reactions over time, not only textual replies.
const oldCommentHTML=commentHTML; commentHTML=function(c,v){ let html=oldCommentHTML(c,v); if(c.me){const age=Math.max(0,(gameNow()-c.t)/60000), seed=h32(c.cid,'player-react'), likes=Math.floor(Math.min(180,age*(.15+u01(seed,'rate')*.7))); const reacts=['💜','😂','🔥','👏','😭']; const chosen=reacts.slice(0,2+h32(seed,'n')%3).join(' '); html=html.replace('<div class="cf">',`<div class="player-comment-reactions"><span>${chosen}</span><b>${likes?fmt(likes)+' Reaktionen':'Reaktionen entstehen mit der Zeit'}</b></div><div class="cf">`);} return html; };
const oldReplyHTML=replyHTML; replyHTML=function(x,c,v){let html=oldReplyHTML(x,c,v);if(x.n?.me){const k=h32(c.cid,x.t,'replyreact'),n=h32(k,'likes')%24;if(n)html=html.replace('</div><span class="clike">',`<small class="reply-react">${['💜','😂','🔥'][k%3]} ${n}</small></div><span class="clike">`);}return html;};

// Broaden NPC phrasing by adding contextual tails from a larger deterministic pool.
const oldAnswer=npcAnswer; npcAnswer=function(text,n,seed,ctx={}){let a=oldAnswer(text,n,seed,ctx);const tails=['Das erinnert mich gerade an den Stream neulich.','Bin gespannt, was die anderen dazu sagen.','So hatte ich das tatsächlich noch nicht gesehen.','Ich musste darüber gerade mehr lachen als ich sollte.','Das ist genau mein Humor.','Da gehe ich diesmal nicht ganz mit 😅','Okay, den Punkt gebe ich dir.','Jetzt brauche ich die ganze Geschichte dazu.','Das wird im Chat garantiert noch Thema.','Ich speichere mir das gedanklich mal ab.'];if(h32(seed,n.id,'extra-variety')%100<34)a+=' '+tails[h32(seed,text,'tail')%tails.length];return a;};

// Persist/migrate new fields opportunistically and cutter wages during normal route changes.
const oldAfter=careerAfterRoute; careerAfterRoute=function(){ensureX();cutterPay();oldAfter();};
ensureX();
})();
