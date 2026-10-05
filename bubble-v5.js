/* Bubble V5 expansion — economy, creator inbox and humanized NPC behaviour. */
(() => {
  const V5_VERSION = 5;
  const oldMigrate = migrateCareer;
  migrateCareer = function(st) {
    oldMigrate(st);
    const c = st.career;
    c.version = Math.max(V5_VERSION, c.version || 1);
    c.incomeEvents ||= [];
    c.subscribers ||= {};
    c.membershipPrice ||= 5;
    c.business ||= { promoBoostUntil: 0, editorUntil: 0, managerLevel: 0 };
    c.npcMemory ||= {};
    c.metrics.giftSubs ||= 0;
    c.metrics.donations ||= 0;
    c.metrics.members ||= 0;
  };

  function v5Ensure() { if (S?.career) migrateCareer(S); }
  function npcTraits(id) {
    const n = npc(id), r = h32(S.seed, id, 'v5-personality');
    const styles = ['ruhig','enthusiastisch','trocken','direkt','herzlich','neugierig'];
    return { style: styles[r % styles.length], generosity: ((r >>> 4) % 100) / 100, loyalty: ((r >>> 11) % 100) / 100, talk: ((r >>> 18) % 100) / 100, niche: n.niche };
  }
  function relationMemory(id) {
    v5Ensure();
    const r = S.career.relations[id];
    const mem = S.career.npcMemory[id] ||= { visits:0, gifts:0, donated:0, lastSeen:0, lastEvent:'', mood:0 };
    return { r, mem };
  }
  function rememberV5(id, text, delta=0) {
    const {r,mem} = relationMemory(id); mem.lastSeen = gameNow(); mem.lastEvent = text; mem.mood = clamp((mem.mood||0)+delta,-10,10);
    const rel = r || careerEncounter(id,'support',text);
    if (rel) { rel.score = clamp(rel.score + delta,-50,100); rel.history.unshift({t:gameNow(),text}); rel.history=rel.history.slice(0,10); }
  }
  function supportNPC(salt='support') {
    const rels = Object.values(S.career.relations||{}).filter(r=>r.id!=null);
    if (rels.length && Math.random()<.7) return rels[Math.floor(Math.random()*rels.length)].id;
    return (h32(S.seed, salt, Math.floor(gameNow()/60000), Math.floor(Math.random()*1e6))>>>0) % POOL;
  }
  function pushIncomeEvent(ev) {
    v5Ensure(); S.career.incomeEvents.unshift(ev); S.career.incomeEvents=S.career.incomeEvents.slice(0,80); markDirty();
  }
  function donationEvent(s) {
    const id=supportNPC('tip'), n=npc(id), tr=npcTraits(id), rel=S.career.relations[id];
    const base = Math.max(1, Math.round(2 + Math.log10(10+Math.max(1,totalFollowers())) * 2));
    const amounts=[2,5,10,20,25,50], cap=Math.min(amounts.length-1,Math.floor(Math.log10(10+totalFollowers())));
    let amount=amounts[Math.min(cap, Math.floor(tr.generosity*(cap+1)))]; amount=Math.max(2,Math.round(amount*(.8+S.career.trust/250)));
    const msgs = rel?.score>=25 ? ['Danke für die ganzen Streams 💜','Für die Crew!','Gönn dir davon was fürs Studio 😄','Bin gern wieder dabei!'] : ['Starker Stream!','Danke für die Unterhaltung 🙌','Weiter so!','Für den nächsten Kaffee ☕'];
    const msg=msgs[h32(id,s.id,Math.floor(s.elapsed/30))%msgs.length];
    careerBook(amount,`Donation von @${n.handle}`,`donation:${s.id}:${Math.floor(s.elapsed)}:${id}`); S.career.metrics.tips+=amount; S.career.metrics.donations++;
    s.economy ||= {ads:0,subs:0,tips:0,credits:{ads:0,subs:0,tips:0}}; s.economy.tips+=amount;
    pushIncomeEvent({type:'donation',npcId:id,amount,text:msg,t:gameNow()}); rememberV5(id,`Hat dir ${credits(amount)} gespendet: „${msg}“`,2);
    addLiveMessage(`💜 ${credits(amount)} Donation — ${msg}`,id,'npc',{badge:'Donator'}); careerSound();
  }
  function giftSubEvent(s) {
    const id=supportNPC('gift'), n=npc(id), tr=npcTraits(id); const max=totalFollowers()>10000?10:totalFollowers()>1000?5:3;
    const count=Math.max(1,Math.min(max,1+Math.floor(tr.generosity*max))); const amount=count*S.career.membershipPrice;
    careerBook(amount,`${count} Gift-Sub${count>1?'s':''} von @${n.handle}`,`giftsub:${s.id}:${Math.floor(s.elapsed)}:${id}`); S.career.metrics.subs+=amount; S.career.metrics.giftSubs+=count;
    s.economy ||= {ads:0,subs:0,tips:0,credits:{ads:0,subs:0,tips:0}}; s.economy.subs+=amount;
    pushIncomeEvent({type:'giftsub',npcId:id,count,amount,t:gameNow()}); rememberV5(id,`Hat ${count} kostenpflichtige Abos an die Community verschenkt.`,Math.min(4,count));
    addLiveMessage(`🎁 verschenkt ${count} ${count===1?'Abo':'Abos'} an die Community!`,id,'npc',{badge:'Supporter'}); careerSound();
  }
  function memberEvent(s) {
    const id=supportNPC('member'), n=npc(id); if(S.career.subscribers[id]) return;
    S.career.subscribers[id]={since:gameNow(),months:1}; const amount=S.career.membershipPrice; careerBook(amount,`Neues Kanal-Abo · @${n.handle}`,`member:${id}`); S.career.metrics.subs+=amount; S.career.metrics.members++;
    pushIncomeEvent({type:'member',npcId:id,amount,t:gameNow()}); rememberV5(id,'Hat ein kostenpflichtiges Kanal-Abo abgeschlossen.',2);
    addLiveMessage(`⭐ ist jetzt zahlendes Community-Mitglied!`,id,'npc',{badge:'Mitglied'}); careerSound();
  }

  const oldLiveTick=careerLiveTick;
  careerLiveTick=function(s,dt){
    v5Ensure(); oldLiveTick(s,dt); if(!s||s.paused||S.settings.paused||!(dt>0)) return;
    s.v5 ||= {tipAt:45+Math.random()*90,giftAt:100+Math.random()*180,memberAt:70+Math.random()*150};
    const audience=Math.max(0,s.viewers), trust=S.career.trust/100;
    if(s.elapsed>=s.v5.tipAt){ if(audience>=3 && Math.random()<Math.min(.8,.18+audience/500)*trust) donationEvent(s); s.v5.tipAt=s.elapsed+60+Math.random()*180; }
    if(s.elapsed>=s.v5.giftAt){ if(audience>=8 && Math.random()<Math.min(.65,.08+audience/1200)*trust) giftSubEvent(s); s.v5.giftAt=s.elapsed+150+Math.random()*300; }
    if(s.elapsed>=s.v5.memberAt){ if(audience>=5 && Math.random()<Math.min(.7,.12+audience/900)*trust) memberEvent(s); s.v5.memberAt=s.elapsed+90+Math.random()*240; }
  };

  const previousAnswer=npcAnswer;
  npcAnswer=function(text,n,seed,ctx={}){
    v5Ensure(); const base=previousAnswer(text,n,seed,ctx), tr=npcTraits(n.id), {r,mem}=relationMemory(n.id);
    let tail='';
    if(mem.lastEvent && gameNow()-mem.lastSeen<14*DAY && h32(seed,n.id,'recall')%3===0) {
      if(mem.gifts>0) tail=' Freut mich, wieder bei dir reinzuschauen.';
      else if(r?.score>=20) tail=' Ich erkenne deinen Namen inzwischen sofort.';
    }
    if(tr.style==='trocken' && base.length>90) return base.split(/[.!?]/)[0]+'.'+tail;
    if(tr.style==='enthusiastisch' && !/[🔥💜✨]/.test(base)) tail+=' 🔥';
    if(tr.style==='ruhig') tail=tail.replace(' 🔥','');
    return base+tail;
  };

  // Add useful recurring/consumable spending rather than cosmetics only.
  function spendService(kind){ v5Ensure(); const c=S.career, now=gameNow();
    const cfg={promo:[250,'Bubble-Promo für 24 Spielstunden'],editor:[450,'Freelance-Schnitt für 3 Spieltage'],manager:[1200,'Management-Ausbau']}[kind]; if(!cfg)return;
    if(!careerBook(-cfg[0],cfg[1],`service:${kind}:${now}`)) return note('Dafür reicht dein Guthaben noch nicht.');
    if(kind==='promo') c.business.promoBoostUntil=now+DAY;
    if(kind==='editor') c.business.editorUntil=now+3*DAY;
    if(kind==='manager') c.business.managerLevel=Math.min(3,(c.business.managerLevel||0)+1);
    markDirty(); save(); renderRoute(true); note(cfg[1]+' aktiviert.');
  }
  const oldPostFactor=careerPostFactor; careerPostFactor=function(p){ v5Ensure(); let f=oldPostFactor(p); if(S.career.business.promoBoostUntil>gameNow())f*=1.25; if(S.career.business.editorUntil>gameNow())f*=1.15; return f; };
  const oldOffers=careerOffers; careerOffers=function(){ v5Ensure(); const before=S.career.contracts.length; oldOffers(); const lvl=S.career.business.managerLevel||0; if(lvl && S.career.contracts.length>before) S.career.contracts.slice(0,S.career.contracts.length-before).forEach(d=>{d.fee=Math.round(d.fee*(1+lvl*.08));}); };

  if(!CREATOR_TABS.some(x=>x[0]==='inbox')) CREATOR_TABS.splice(1,0,['inbox','Anfragen']);
  function inboxView(){ careerOffers(); const offers=S.career.contracts.filter(d=>d.status==='offered');
    return creatorHead('inbox','Kooperationsanfragen')+`<div class="creator-workspace"><section class="creator-hero"><span class="live-eyebrow">DEIN POSTFACH</span><h2>${offers.length?offers.length+' offene Anfrage'+(offers.length===1?'':'n'):'Keine offenen Anfragen'}</h2><p>Hier siehst du auf einen Blick, was die Marke von dir möchte, wie lange du Zeit hast und welches Honorar du bekommst.</p></section>${offers.length?offers.map(d=>{const p=careerProduct(d);return `<article class="creator-card v5-inbox"><div class="creator-product"><span>${p.icon}</span><div><small>NEUE KOOPERATIONSANFRAGE</small><h3>${p.brand} · ${p.product}</h3></div><b>${credits(d.fee)}</b></div><p>${p.brief}</p><div class="v5-task"><b>Dein Auftrag</b>${d.requiredViews?`<span>📱 Werbepost · Ziel: ${fmtFull(d.requiredViews)} Aufrufe</span>`:''}${d.requiredSeconds?`<span>🔴 Live vorstellen · ${liveDuration(d.requiredSeconds)} ab ${d.minViewers} Zuschauern</span>`:''}<span>⏳ Nach Annahme: 7 Spieltage</span></div><div class="creator-actions"><button class="btn acc sm" data-act="contract-open" data-id="${d.id}">Details & annehmen</button><button class="btn ghost sm" data-act="contract-decline" data-id="${d.id}">Ablehnen</button></div></article>`}).join(''):'<section class="creator-card"><h3>Postfach leer</h3><p>Neue Anfragen entstehen mit deiner Reichweite und im Verlauf der Spielzeit. Größere Communities erhalten lukrativere Angebote.</p></section>'}</div>`;
  }
  const oldContractsView=careerContractsView; careerContractsView=function(){ const html=oldContractsView(); return html.replace('Ein Produkt. Deine Geschichte.','Deine laufenden Kooperationen.').replace('Wähle passende Partner, halte deine Zusagen ein','Erfülle deine angenommenen Aufträge, halte deine Zusagen ein'); };
  const oldShopView=careerShopView; careerShopView=function(){ v5Ensure(); const html=oldShopView(); const c=S.career,b=c.business; const services=`<section class="creator-card"><h3>Creator-Dienstleistungen</h3><p>Nutze dein Geld nicht nur für Optik. Diese Ausgaben beeinflussen Reichweite und zukünftige Deals.</p><div class="creator-shop-grid"><article class="creator-card creator-shop-item"><span class="creator-shop-icon">📣</span><h3>Bubble-Promo</h3><p>+25 % Post-Reichweite für 24 Spielstunden.</p><button class="btn acc sm" data-act="v5-service" data-kind="promo" ${c.balance<250?'disabled':''}>250 B¢</button></article><article class="creator-card creator-shop-item"><span class="creator-shop-icon">✂️</span><h3>Freelance-Schnitt</h3><p>+15 % Post-Reichweite für drei Spieltage.</p><button class="btn acc sm" data-act="v5-service" data-kind="editor" ${c.balance<450?'disabled':''}>450 B¢</button></article><article class="creator-card creator-shop-item"><span class="creator-shop-icon">💼</span><h3>Management Stufe ${(b.managerLevel||0)+1}</h3><p>Jede Stufe verhandelt bei neuen Kooperationen +8 % Honorar. Maximal Stufe 3.</p><button class="btn acc sm" data-act="v5-service" data-kind="manager" ${(b.managerLevel||0)>=3||c.balance<1200?'disabled':''}>${(b.managerLevel||0)>=3?'Maximum':'1.200 B¢'}</button></article></div></section>`; return html.replace('</div>',services+'</div>'); };
  function supportView(){ v5Ensure(); const c=S.career, events=c.incomeEvents.slice(0,40), members=Object.keys(c.subscribers).length;
    return creatorHead('support','Abos & Donations')+`<div class="creator-workspace"><section class="creator-hero"><span class="live-eyebrow">DEINE SUPPORTER</span><h2>${members} zahlende Mitglieder</h2><p>Gift-Subs, Kanal-Abos und Donations werden von konkreten NPCs ausgelöst. Stammzuschauer können dadurch eine echte Geschichte mit deinem Kanal entwickeln.</p></section><div class="creator-metrics"><div><small>Gift-Subs</small><b>${c.metrics.giftSubs||0}</b></div><div><small>Donations</small><b>${c.metrics.donations||0}</b></div><div><small>Abo-Preis</small><b>${credits(c.membershipPrice)}</b></div></div><section class="creator-card"><h3>Letzte Unterstützung</h3>${events.length?events.map(e=>{const n=e.npcId!=null?npc(e.npcId):null;return `<div class="creator-ledger"><div><b>${e.type==='donation'?'💜 Donation':e.type==='giftsub'?'🎁 Gift-Subs':'⭐ Neues Abo'}${n?' · @'+esc(n.handle):''}</b><small>${e.text?esc(e.text)+' · ':''}${ago(e.t)}</small></div><strong class="positive">+${credits(e.amount||0)}</strong></div>`}).join(''):'<p>Noch keine Support-Ereignisse. Geh live und baue dir wiederkehrende Zuschauer auf.</p>'}</section></div>`;
  }
  if(!CREATOR_TABS.some(x=>x[0]==='support')) CREATOR_TABS.splice(4,0,['support','Abos & Donations']);
  const oldCareerView=VIEWS.career; VIEWS.career=r=> r.a==='inbox'?inboxView():r.a==='support'?supportView():oldCareerView(r);
  ACT['v5-service']=b=>spendService(b.dataset.kind);

  // Surface unread collaboration requests in the money bar.
  const oldMoneyBar=careerMoneyBar; careerMoneyBar=function(){ v5Ensure(); const offers=S.career.contracts.filter(d=>d.status==='offered').length; return oldMoneyBar()+ (offers?`<a class="v5-request-pill" href="#/career/inbox">✉ ${offers} neue Kooperations${offers===1?'anfrage':'anfragen'}</a>`:''); };
})();
