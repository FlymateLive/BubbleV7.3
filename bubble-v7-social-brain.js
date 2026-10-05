/* Bubble V7.3 — Social Brain: context-aware local NPC reactions */
(() => {
'use strict';
const SB={last:new Map()};
const lex={
 positive:['gut','geil','stark','nice','liebe','feier','mega','cool','danke','freue','glücklich','beste','respekt','verdient','w'],
 negative:['schlecht','nervt','scheiße','scheisse','hasse','enttäuscht','traurig','müll','muell','langweilig','cringe','peinlich','fail','l'],
 angry:['idiot','dumm','halt die','fresse','opfer','lappen','lächerlich','laecherlich','verpiss','fuck','wtf','bodenlos'],
 apology:['sorry','entschuld','tut mir leid','mein fehler','war nicht so gemeint'],
 gratitude:['danke','dankeschön','danke euch','thx','dankbar'],
 hype:['lets go','let’s go','hype','endlich','wir schaffen','kommt schon','auf geht','🔥'],
 doubt:['glaube nicht','bezweifle','niemals','fake','lüge','luege','stimmt nicht','quatsch'],
 gaming:['game','spiel','zocken','ranked','boss','kill','clutch','runde','level','stream','gameplay','fps','tor','rennen'],
 money:['geld','abo','subs','donation','spende','kooperation','werbung','sponsor','bezahlt'],
 community:['community','chat','zuschauer','follower','euch','ihr','crew','bubble']
};
function hasAny(t,a){return a.some(x=>t.includes(x))}
function analyze(text,ctx={}){
 const raw=(text||'').trim(),t=raw.toLowerCase(), words=t.match(/[a-zäöüß0-9@#]+/gi)||[];
 const caps=(raw.match(/[A-ZÄÖÜ]{2,}/g)||[]).join('').length/Math.max(1,raw.replace(/\s/g,'').length);
 const ex=(raw.match(/!/g)||[]).length,q=(raw.match(/\?/g)||[]).length,emoji=(raw.match(/\p{Extended_Pictographic}/gu)||[]).length;
 const mentions=[...raw.matchAll(/@([\w.]+)/g)].map(m=>m[1].toLowerCase());
 let val=(hasAny(t,lex.positive)?2:0)-(hasAny(t,lex.negative)?2:0)-(hasAny(t,lex.angry)?3:0)+(hasAny(t,lex.gratitude)?1:0)+(hasAny(t,lex.apology)?1:0);
 const tone=hasAny(t,lex.apology)?'apology':hasAny(t,lex.angry)||caps>.28&&ex>0?'hostile':hasAny(t,lex.hype)||ex>1||emoji>2?'hype':val>=2?'positive':val<=-2?'negative':q?'curious':'neutral';
 const intent=hasAny(t,lex.apology)?'apology':hasAny(t,lex.gratitude)?'thanks':hasAny(t,lex.doubt)?'challenge':q?'question':hasAny(t,lex.angry)?'attack':hasAny(t,lex.positive)&&/\b(du|ihr|euch|dein|euer)\b/.test(t)?'praise':hasAny(t,lex.hype)?'hype':'statement';
 const topics=[];for(const [k,a] of Object.entries({gaming:lex.gaming,money:lex.money,community:lex.community}))if(hasAny(t,a))topics.push(k);
 if(/\b(heute|gestern|morgen|woche|monat)\b/.test(t))topics.push('life');
 if(/\b(essen|pizza|kaffee|arbeit|schule|uni|freund|familie|urlaub)\b/.test(t))topics.push('personal');
 return {raw,t,words:words.length,tone,intent,valence:val,questions:q,exclaims:ex,caps,emoji,mentions,topics,ctx,
   direct:mentions.length>0||/\b(du|dein|dir|dich)\b/.test(t),strong:Math.abs(val)>=3||caps>.28||ex>=3};
}
function worldPerson(id){
 try{
  const c=S?.career?.living?.people?.[id]||S?.living?.people?.[id]||S?.world?.people?.[id];
  return c||{};
 }catch{return{}}
}
function disposition(id,a){
 const n=npc(id),p=worldPerson(id);
 const rel=p.relationship||p.rel||{};
 const loyalty=Number(rel.loyalty??p.loyalty??50),like=Number(rel.sympathy??rel.like??p.sympathy??50),respect=Number(rel.respect??p.respect??50),envy=Number(rel.envy??p.envy??15);
 const base=(like-50)*.025+(loyalty-50)*.018+(respect-50)*.012-(envy-20)*.012;
 const contrarian=((id%11)-5)*.055;
 return {n,p,score:base+contrarian,loyalty,like,respect,envy};
}
const pick=(arr,seed)=>arr[Math.abs(seed>>>0)%arr.length];
function contextLine(a,d,seed,role='viewer'){
 const name=d.n?.handle||'';
 const subject=a.topics.includes('gaming')?'dem Game':a.topics.includes('money')?'dem Geld/der Kooperation':a.topics.includes('community')?'der Community':a.topics.includes('personal')?'dem Thema':'dem Punkt';
 const supportive={
 question:[`Ich würde bei ${subject} eher ja sagen – aber kommt drauf an, was genau du meinst.`,`Gute Frage. Ich sehe das bei ${subject} tatsächlich ähnlich.`,`Wenn du mich fragst: eher ja. Warum fragst du?`],
 praise:[`Das kommt gerade echt sympathisch rüber, danke 🫶`,`So ein Satz ist der Grund, warum ich gern hier bin.`,`W ${role==='host'?'Chat':'Take'} 💜`],
 thanks:[`Gerne. Man merkt, dass du die Leute hier nicht als Zahl siehst.`,`Immer gern 💜 Genau dafür ist die Community doch da.`,`Das kam ehrlich rüber. Gern.`],
 apology:[`Fair, dass du das so sagst. Für mich ist die Sache damit okay.`,`Respekt fürs Entschuldigen. Macht nicht jeder.`,`Kann passieren. Dass du es ansprichst, zählt.`],
 challenge:[`Ich verstehe deinen Zweifel, aber bei ${subject} bin ich nicht ganz bei dir.`,`Hm, da würde ich widersprechen. So eindeutig ist das nicht.`,`Kann ich nachvollziehen, sehe ich aber anders.`],
 attack:[`Okay, das war gerade unnötig persönlich.`,`Kritik okay, aber so muss man nicht reden.`,`Uff. Der Ton war jetzt schon ziemlich drüber.`],
 hype:[`OKAY CHAT JETZT BIN ICH AUCH DRIN 🔥`,`Die Energie gerade 😭🔥`,`WIR SIND DABEI. LET'S GO.`],
 statement:[`Bei ${subject} verstehe ich, was du meinst.`,`Interessanter Punkt – vor allem wie du das formulierst.`,`Kann ich nachvollziehen. Ich würde nur einen Teil davon anders sehen.`]
 };
 const critical={
 question:[`Kommt drauf an. So wie du es gerade formulierst, eher nein.`,`Ich würde da ehrlich widersprechen.`,`Warum gehst du davon aus? Ich sehe ${subject} anders.`],
 praise:[`Freut mich für die Person, aber ein bisschen sehr dick aufgetragen 😅`,`Kann man so sehen. Ich bin da nicht ganz so begeistert.`,`Okay, fair – sehe ich persönlich anders.`],
 thanks:[`Kein Ding.`,`Gern.`,`Passt.`],
 apology:[`Gut, dass du dich entschuldigst. Ganz vergessen ist es für mich aber noch nicht.`,`Fair. Ich will erstmal sehen, ob sich das auch zeigt.`,`Entschuldigung ist ein Anfang.`],
 challenge:[`Da bin ich tatsächlich bei dir. Das wirkt auf mich auch fragwürdig.`,`Genau DAS meine ich. Endlich spricht es jemand an.`,`Ja. Bei ${subject} passt für mich einiges nicht zusammen.`],
 attack:[`Und genau wegen so einem Ton verliere ich gerade Respekt.`,`Man kann anderer Meinung sein, ohne Leute so anzugehen.`,`Das war kein guter Look.`],
 hype:[`Beruhigt euch 😂 Erstmal schauen, ob es wirklich so gut läuft.`,`Ich warte noch mit dem Hype.`,`Chat übertreibt wieder komplett 😭`],
 statement:[`Ich sehe ${subject} ehrlich gesagt anders.`,`Da fehlt mir ein Teil der Geschichte.`,`Kann sein, überzeugt mich so aber noch nicht.`]
 };
 const playful={
 question:[`ChatGPT-Level Frage gerade 😭 Ich sag: ${seed%2?'ja':'nein'}, keine Rückfragen.`,`Schwierige Frage für ${new Date().getHours()} Uhr 😂`,`Ich stimme zu, solange danach niemand einen 40-Minuten-Thread macht.`],
 praise:[`Bro verteilt heute Sidequests mit Komplimenten 😭`,`W wholesome moment, seltene Bubble-Sichtung.`,`Okay das war süß, Screenshot ist gemacht 😂`],
 thanks:[`Rechnung kommt per DM 😭`,`Immer doch 🫡`,`Dafür will ich jetzt aber einen Founder-Badge 😂`],
 apology:[`Character development unlocked ✨`,`Okay, Redemption-Arc beginnt jetzt 😂`,`Accepted. Aber Chat hat Screenshots 💀`],
 challenge:[`Bubble-Debattenclub ist eröffnet 💀`,`Oh oh, jetzt kommen die 38-teiligen Antworten.`,`Ich hol Popcorn, das wird ein Thread.`],
 attack:[`Bruder hat heute Konflikt auf 200% gestellt 💀`,`Das eskalierte von 0 auf Kommentarspalte in 2 Sekunden.`,`Management tippt schon die Krisenmail 😭`],
 hype:[`CHATTTTT 🔥🔥🔥`,`W ENERGY`,`ICH WAR HIER bevor das geclippt wird 😭`],
 statement:[`Das ist so ein Satz, unter dem gleich 200 Leute diskutieren 😭`,`Ich sehe die Quote-Posts schon kommen 💀`,`Fairer Take… gefährliche Worte auf Bubble 😂`]
 };
 let pool=d.score<-.45?critical:(d.n?.tone==='chaos'||d.n?.tone==='funny'||idStyle(d.n)==='playful'?playful:supportive);
 if(a.tone==='hostile'&&d.loyalty>70) pool=supportive;
 return pick(pool[a.intent]||pool.statement,seed);
}
function idStyle(n){return (n?.tone||n?.style||'').toLowerCase()}
function socialReply(text,id,seed,ctx={}){
 const a=analyze(text,ctx),d=disposition(id,a);
 let out=contextLine(a,d,seed,ctx.role);
 if(a.mentions.includes((d.n?.handle||'').toLowerCase())) out=`@${S.me?.handle||'du'} ${out}`;
 if(a.strong&&d.loyalty>75&&a.tone==='negative') out=pick([`Ich bin nicht bei allem deiner Meinung, aber ich verstehe, warum dich das aufregt.`,`Man merkt, dass dich das gerade wirklich beschäftigt. ${out}`,out],seed+17);
 remember(id,a,ctx);
 return out;
}
function remember(id,a,ctx){
 try{
  if(typeof careerEncounter==='function'&&(a.strong||a.direct||a.intent==='apology'||a.intent==='praise')) careerEncounter(id,a.tone==='hostile'?'conflict':'reply',a.raw);
  const key=`${id}`;let mem=SB.last.get(key)||[];mem.push({at:Date.now(),tone:a.tone,intent:a.intent,topics:a.topics,text:a.raw.slice(0,100),where:ctx.where||'social'});SB.last.set(key,mem.slice(-8));
 }catch{}
}
window.BubbleSocialBrain={analyze,reply:socialReply,remember};

// Replace the generic answer generator everywhere it is already used (comments, replies, DMs, lobby).
if(typeof npcAnswer==='function'){
 const old=npcAnswer;
 npcAnswer=function(text,n,seed,ctx={}){try{return socialReply(text,n.id,seed,{...ctx,where:ctx.where||'comment'});}catch{return old(text,n,seed,ctx)}};
}
// Live: preserve existing scheduling, but make every generated response semantic/contextual.
if(typeof liveResponse==='function'){
 const old=liveResponse;
 liveResponse=function(text,id,r){try{return socialReply(text,id,h32(text,id,S.live?.active?.chatCount||0),{where:'own-live',role:'viewer'});}catch{return old(text,id,r)}};
}
if(typeof guestResponse==='function'){
 const old=guestResponse;
 guestResponse=function(text,id,c,isHost,seed){try{return socialReply(text,id,seed,{where:'npc-live',role:isHost?'host':'viewer',category:c?.category});}catch{return old(text,id,c,isHost,seed)}};
}

// Player posts: seed early reactions from the actual post meaning, not just generic post categories.
if(typeof onSocialPost==='function'){
 const old=onSocialPost;
 onSocialPost=function(p){
   const r=old(p),a=analyze(p.text,{where:'post'});
   p.socialBrain={tone:a.tone,intent:a.intent,topics:a.topics,strong:a.strong};
   // Meaning affects controversy/trust lightly, so wording has consequences without dominating balance.
   if(S.career){
     if(a.tone==='hostile'){S.career.trust=Math.max(0,(S.career.trust||50)-1);S.career.controversy=Math.min(100,(S.career.controversy||0)+2)}
     else if(a.intent==='apology'||a.intent==='thanks'){S.career.trust=Math.min(100,(S.career.trust||50)+.5)}
   }
   return r;
 };
}

// Comments/replies already call npcAnswer; increase response likelihood when directly addressing someone or asking a real question.
if(ACT?.sendcomment){
 const old=ACT.sendcomment;
 ACT.sendcomment=function(b){const ta=$('#reply-ta'),text=ta?.value?.trim()||'',a=analyze(text,{where:'comment'});const before=S.pending.length;old(b);
   if(text&&(a.direct||a.questions||a.strong)&&S.pending.length===before){const key=b.dataset.key,v=viewPost(key),it=interOf(key),idx=(it.c?.length||1)-1,id=!v.mine?v.author.id:(S.followers?followerId(Math.floor(Math.random()*S.followers)):(Math.random()*4e9)>>>0);S.pending.push({type:'answer',key,path:['mc',idx],id,text,seed:(Math.random()*4e9)>>>0,due:gameNow()+7000+Math.random()*25000});markDirty();}
 };
}
})();