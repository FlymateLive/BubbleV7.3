/* Bubble V6.1 — visible gameplay simulation and context-aware live reactions */
(() => {
'use strict';
const GAME_DB=[
{id:'neon-drift',name:'Neon Drift',icon:'🏎️',genre:'Racing'},{id:'blockbound',name:'Blockbound',icon:'🧱',genre:'Sandbox'},{id:'last-signal',name:'Last Signal',icon:'👻',genre:'Horror'},{id:'strikepoint',name:'Strikepoint',icon:'🎯',genre:'Taktik'},{id:'cozy-county',name:'Cozy County',icon:'🌱',genre:'Cozy'},{id:'goal-rush',name:'Goal Rush 27',icon:'⚽',genre:'Sport'},{id:'skyforge',name:'Skyforge Legends',icon:'🐉',genre:'RPG'},{id:'party-panic',name:'Party Panic!',icon:'🎉',genre:'Party'},{id:'frontier-ops',name:'Frontier Ops',icon:'🪖',genre:'Action'},{id:'metro-manager',name:'Metro Manager',icon:'🚇',genre:'Simulation'}];
const GAME_EVENTS={
 Racing:[['🏁','LETZTE RUNDE','Nur noch eine Runde bis zum Ziel.'],['⚡','PERFEKTER DRIFT','Die Kurve sitzt auf den Zentimeter.'],['💥','KONTAKT!','Seitlicher Treffer – zwei Plätze verloren.'],['🥇','FÜHRUNG','Platz 1, aber direkt dahinter klebt die Konkurrenz.']],
 Horror:[['🔦','LICHT FLACKERT','Irgendetwas bewegt sich im Korridor.'],['👣','SCHRITTE','Die Schritte kommen näher.'],['😱','JUMPSCARE','Direkt aus dem Nichts.'],['🗝️','SCHLÜSSEL GEFUNDEN','Jetzt fehlt nur noch der Ausgang.']],
 Taktik:[['🎯','1 VS 2','Clutch-Situation. Der Chat hält den Atem an.'],['💣','ZIEL AKTIV','Noch wenige Sekunden.'],['💀','KNOCKOUT','Der Peek war zu aggressiv.'],['🏆','CLUTCH!','Die Runde ist tatsächlich gewonnen.']],
 Sport:[['⚽','90. MINUTE','Eine letzte Chance auf das Tor.'],['🥅','TOOOR!','Der Ball ist drin – Last-Minute-Treffer.'],['🧤','PARADE','Unglaublich gehalten.'],['🟨','FOUL','Das war deutlich zu spät.']],
 RPG:[['🐉','BOSS · PHASE 2','Der Boss hat noch 18 % Leben.'],['❤️','1 HP','Ein Treffer und alles ist vorbei.'],['✨','LEGENDÄRER LOOT','Extrem seltener Drop.'],['⚔️','BOSS BESIEGT','Nach mehreren Versuchen ist es geschafft.']],
 Sandbox:[['🧱','BUILD MODE','Das Projekt wird größer als geplant.'],['💣','OH NEIN','Ein Teil des Builds ist gerade explodiert.'],['✨','FERTIG','Der Build steht – irgendwie.'],['🤖','CHAOS','Die Simulation macht plötzlich ihr eigenes Ding.']],
 Cozy:[['🌱','ERNTEZEIT','Die neue Ernte ist bereit.'],['🐄','NEUER BEWOHNER','Ein neues Tier zieht ein.'],['🏡','UPGRADE','Die Farm wird erweitert.'],['☕','COZY MOMENT','Einfach kurz nichts tun und die Welt genießen.']],
 Party:[['🎉','FINALE','Nur noch zwei Spieler sind übrig.'],['🍌','FAIL','Das Hindernis war eigentlich nicht schwer.'],['👑','SIEG!','Völliges Chaos – aber gewonnen.'],['😂','CHAT-MOMENT','Niemand versteht, was gerade passiert ist.']],
 Action:[['🪖','MISSION LÄUFT','Das Ziel liegt hinter der nächsten Deckung.'],['🚁','VERSTÄRKUNG','Neue Gegner treffen ein.'],['💥','KNAPP','Die Explosion war deutlich zu nah.'],['✅','MISSION ERFÜLLT','Ziel gesichert.']],
 Simulation:[['🚇','STÖRUNG','Eine Linie steht – Fahrgäste werden unruhig.'],['📈','REKORDTAG','So viele Fahrgäste wie noch nie.'],['🚧','BAUSTELLE','Die neue Strecke kostet mehr als gedacht.'],['✅','NETZ STABIL','Alle Linien fahren wieder planmäßig.']]
};
function gById(id){return GAME_DB.find(g=>g.id===id)||GAME_DB[0];}
function npcGame(id){return GAME_DB[h32(S.seed,id,'npc-game')%GAME_DB.length];}
function eventFor(game,slot){const a=GAME_EVENTS[game.genre]||GAME_EVENTS.Action;return a[h32(game.id,slot,'event')%a.length];}
function slotOf(sec){return Math.floor((sec||0)/9);}
function gameplayHTML(game,sec,owner='me'){
 const slot=slotOf(sec), ev=eventFor(game,slot), scoreA=h32(game.id,owner,slot,'a')%12, scoreB=h32(game.id,owner,slot,'b')%10;
 const pct=18+h32(game.id,slot,'pct')%77;
 return `<div class="gameplay-sim gp-${game.genre.toLowerCase()}"><div class="gp-world"><div class="gp-horizon"></div><div class="gp-object">${game.icon}</div><div class="gp-particles">✦　·　✧　·　✦</div></div><div class="gp-top"><b>${esc(game.name)}</b><span>LIVE GAMEPLAY · ${esc(game.genre)}</span></div><div class="gp-event"><span>${ev[0]}</span><div><b>${esc(ev[1])}</b><small>${esc(ev[2])}</small></div></div><div class="gp-hud"><span>RUN ${String(slot+1).padStart(2,'0')}</span><i><em style="width:${pct}%"></em></i><b>${scoreA} : ${scoreB}</b></div></div>`;
}
function gameReaction(game,sec,who='viewer'){
 const ev=eventFor(game,slotOf(sec)), k=h32(game.id,slotOf(sec),who,'react');
 const viewer=[`${ev[1]} 😭 das war viel zu knapp!`,`Chat, habt ihr DAS gesehen?! ${ev[0]}`,`${game.name} ist heute wirklich Content 😂`,`Bitte clippen: ${ev[1].toLowerCase()}!`,`Ich hätte bei ${ev[1].toLowerCase()} komplett die Nerven verloren.`,`Noch ein Versuch, das war machbar 👀`,`W ${game.name}-Stream 🔥`];
 const host=[`Okay Chat… ${ev[1].toLowerCase()} war nicht geplant 😂`,`Habt ihr das gesehen?! ${ev[2]}`,`Das ist genau der Grund, warum ich ${game.name} streame.`,`Clippt das bitte – ${ev[1]}!`,`Chat, was mache ich jetzt? ${ev[2]}`];
 return (who==='host'?host:viewer)[k%(who==='host'?host.length:viewer.length)];
}
function ensureOwnGameplay(s){if(!s||s.category!=='Gaming')return; s.gameId ||= S.career?.games?.selected || 'cozy-county'; s.gameplay ||= {lastSlot:-1};}
const prevTick=tickLive; tickLive=function(now=Date.now(),forcedSeconds=0){
 const before=S.live?.active?.elapsed||0; prevTick(now,forcedSeconds); const s=S.live?.active;if(!s)return; ensureOwnGameplay(s);
 if(s.category==='Gaming'&&!s.paused&&!S.settings.paused){const sl=slotOf(s.elapsed);if(sl!==s.gameplay.lastSlot){s.gameplay.lastSlot=sl;const g=gById(s.gameId),ev=eventFor(g,sl); if(sl>0){const r=RNG(h32(s.id,sl,'game-react')); const count=Math.min(3,1+(h32(s.id,sl,'count')%3)); for(let i=0;i<count;i++)s.pending.push({id:pickLiveNPC(r),text:gameReaction(g,s.elapsed,'viewer'),at:s.elapsed+.6+i*1.1}); if(h32(s.id,sl,'highlight')%100<38){const title=`${g.name}: ${ev[1]}`;s.highlights.push(title);s.highlights=s.highlights.slice(-8);}}}}
};
function ownGameplayArt(s){ensureOwnGameplay(s);return gameplayHTML(gById(s.gameId),s.elapsed,'me');}
const prevStageArt=liveStageArt; liveStageArt=function(s){if(s?.category==='Gaming'&&s?.hosting==null)return `<div class="live-stage-art gameplay-stage-art" data-gameplay-own>${ownGameplayArt(s)}</div>`;return prevStageArt(s);};
const prevRefresh=refreshLiveUI; refreshLiveUI=function(){prevRefresh();const s=S.live?.active,el=$('[data-gameplay-own]');if(el&&s?.category==='Gaming')el.innerHTML=ownGameplayArt(s);};

// Give every NPC Gaming channel a concrete game and preserve it in the room.
const prevLiveChannel=liveChannel; liveChannel=function(id){const c=prevLiveChannel(id);if(c.category==='Gaming'&&!c.gameId)c.gameId=npcGame(id).id;return c;};
const prevGuestRoom=guestRoom; guestRoom=function(id){const room=prevGuestRoom(id),c=liveChannel(id);if(c.category==='Gaming'){room.gameId ||= c.gameId || npcGame(id).id;room.gameplay ||= {lastSlot:-1};}return room;};
const prevGuestTick=tickGuestLive; tickGuestLive=function(now,forcedSeconds=0){prevGuestTick(now,forcedSeconds);const route=currentRoute();if(route.name!=='live'||route.a!=='watch')return;const room=S.live.rooms[+route.b],c=room&&liveChannel(room.id);if(!room||c?.category!=='Gaming')return;const sl=slotOf(room.elapsed);if(sl===room.gameplay.lastSlot)return;room.gameplay.lastSlot=sl;if(sl>0){const g=gById(room.gameId),r=RNG(h32(room.id,sl,'npc-game-react'));guestMessage(room,gameReaction(g,room.elapsed,'host'),room.id,'host');for(let i=0;i<2;i++)guestMessage(room,gameReaction(g,room.elapsed,'viewer'),r.pick(room.crowd));}markDirty();};

const prevWatch=liveWatchView; liveWatchView=function(rawId){let html=prevWatch(rawId);const id=Number(rawId),room=S.live?.rooms?.[id],c=Number.isFinite(id)?liveChannel(id):null;if(c?.category==='Gaming'){const g=gById(room?.gameId||c.gameId||npcGame(id).id);html=html.replace(/<img class="guest-scene"[^>]*>/,gameplayHTML(g,room?.elapsed||0,id));html=html.replace(`<span class="live-stage-category">Gaming</span>`,`<span class="live-stage-category">${g.icon} ${esc(g.name)} · Gaming</span>`).replace('Simulierter Stream · Sprich mit',`Live-Gameplay · ${esc(g.name)} · Sprich mit`);}return html;};
const prevGuestRefresh=refreshGuestUI; refreshGuestUI=function(){prevGuestRefresh();const route=currentRoute(),room=S.live?.rooms?.[+route.b],c=room&&liveChannel(room.id);if(c?.category!=='Gaming')return;const stage=$('.guest-stage .gameplay-sim');if(stage){const g=gById(room.gameId||c.gameId);stage.outerHTML=gameplayHTML(g,room.elapsed,room.id);}};

// Make manual Gaming moments describe actual gameplay rather than generic hype.
const prevMoment=liveMoment; liveMoment=function(kind){const s=S.live?.active;if(s?.category==='Gaming'&&kind==='win'){ensureOwnGameplay(s);const g=gById(s.gameId),ev=eventFor(g,slotOf(s.elapsed));s.nextMoment=0;const title=`${g.name}: ${ev[1]}`;s.highlights.push(title);s.highlights=s.highlights.slice(-8);addLiveMessage(`${ev[0]} ${title} — ${ev[2]}`,'me','moment');const r=RNG(h32(s.id,s.elapsed,'manual-game'));for(let i=0;i<3;i++)s.pending.push({id:pickLiveNPC(r),at:s.elapsed+1+i*1.4,text:gameReaction(g,s.elapsed,'viewer')});s.hypeUntil=s.elapsed+35;s.nextMoment=s.elapsed+10;markDirty();refreshLiveUI();return;}return prevMoment(kind);};
ACT['live-moment']=b=>liveMoment(b.dataset.kind);
})();
