/* Bubble V7.1 — scroll fixes, real meme templates, gameplay scene richness */
(()=>{'use strict';
const memeLines={
 setup:['ICH: „nur eine Runde“','MEIN TEAM NACH 30 SEKUNDEN','POV: Du sagst „letztes Game“','DER EINE RANDOM IM RANKED','WENN DER CUTTER „ICH HAB DA WAS“ SAGT','ICH NACH EINEM GUTEN CLIP'],
 punch:['3 Stunden später: immer noch live.','…und plötzlich ist jeder Coach.','Das Matchmaking: „interessant.“','0 Calls. 14 Meinungen.','Karriere beendet, Meme geboren.','Selbstvertrauen +400 %, Skill unverändert.'],
 comments:['bro hat wirklich so getan als wäre das geplant 💀','ich wäre direkt offline gegangen','das MUSS in die highlights','warum passiert sowas immer live 😭','der stille blick danach sagt alles','NPC teammate des jahres'],
 headlines:['Streamer behauptet weiterhin, der Fail sei „Taktik“','Lokaler Creator verliert 1v1 gegen die eigene Entscheidung','Chat fordert Untersuchung nach historischem Gaming-Moment','Experten bestätigen: „Nur noch eine Runde“ war gelogen'],
 patch:['Selbstvertrauen +20 %','Aim bei Zuschauern -35 %','„Letzte Runde“ dauert jetzt 2 Stunden','Chat erkennt Ausreden 40 % schneller','Clutch-Chance unverändert mysteriös'],
 dm:['komm eine runde','wirklich nur eine','okay','*drei stunden später*','morgen arbeiten?','wir reden nicht darüber']
};
function pickA(a,s,k){return a[h32(s,k)%a.length]}
function realMeme(seed,g,text){const type=h32(seed,'real-meme')%6,setup=pickA(memeLines.setup,seed,'setup'),punch=pickA(memeLines.punch,seed,'punch'),game=g?.name||'Bubble';
 if(type===0)return `<div class="meme-real meme-news"><span class="meme-kicker">BUBBLE DAILY · EILMELDUNG</span><hr><div class="meme-big">${esc(pickA(memeLines.headlines,seed,'head'))}</div><p class="meme-sub">Zeugen berichten, der Chat habe bereits Sekunden vorher „NEIN“ geschrieben. Betroffenes Spiel: ${esc(game)}.</p><div class="meme-caption-bar">${esc(text)}</div></div>`;
 if(type===1)return `<div class="meme-real"><span class="meme-kicker">KOMMENTARSEKTION NACH DEM CLIP</span><div class="meme-panel">${[0,1,2,3].map((_,i)=>`<div class="meme-comment"><i></i><div><b>@${['pixelpaul','lea.exe','brotmitping','nichtdertim'][h32(seed,'u'+i)%4]}</b><span>${esc(pickA(memeLines.comments,seed,'c'+i))}</span></div></div>`).join('')}</div><div class="meme-big">${esc(punch)}</div></div>`;
 if(type===2)return `<div class="meme-real meme-pov"><span class="meme-kicker">POV · ${esc(game)}</span><div class="meme-big">${esc(setup)}</div><div class="scene-box"></div><div class="meme-caption-bar">${esc(punch)}</div></div>`;
 if(type===3)return `<div class="meme-real meme-tier"><span class="meme-kicker">OFFIZIELLE ${esc(game)} TIERLIST</span><div class="meme-big">Dinge, die im Stream garantiert passieren</div><div><div class="tier-row"><b>S</b><span>Chat sagt „clip das“ · komplett unnötiger Clutch</span></div><div class="tier-row"><b>A</b><span>Ausrede nach dem Tod · „Lag“</span></div><div class="tier-row"><b>B</b><span>Plan haben · Plan sofort vergessen</span></div></div><div class="meme-caption-bar">wissenschaftlich geprüft von niemandem</div></div>`;
 if(type===4)return `<div class="meme-real meme-patch"><span class="meme-kicker">${esc(game)} · PATCH NOTES v${1+h32(seed,'v')%9}.${h32(seed,'vv')%10}</span><div class="patch-window"><div class="patch-title">Änderungen speziell für diesen Stream</div><div class="patch-body"><ul>${[0,1,2,3].map((_,i)=>`<li>${esc(pickA(memeLines.patch,seed,'p'+i))}</li>`).join('')}</ul></div></div><div class="meme-big">Chat: „endlich balanced“</div></div>`;
 return `<div class="meme-real meme-dm"><span class="meme-kicker">DIREKTNACHRICHTEN · 02:17</span><div class="dm-window">${memeLines.dm.slice(0,5).map((x,i)=>`<div class="dm-line ${i%2?'me':''}">${esc(x)}</div>`).join('')}</div><div class="meme-big">${esc(punch)}</div></div>`;
}
// Replace all generated NPC meme visuals globally. Own drafts benefit too.
if(typeof memeVisual==='function'){memeVisual=(seed,g,text)=>realMeme(seed,g,text)}
// Guarantee scrolling after route changes, including iOS standalone/PWA.
const oldRenderRoute=renderRoute;renderRoute=function(...a){const r=oldRenderRoute.apply(this,a);document.documentElement.style.overflowY='auto';document.body.style.overflowY='auto';const v=document.querySelector('#view');if(v){v.style.overflowY='visible';v.style.maxHeight='none'}return r};
})();
