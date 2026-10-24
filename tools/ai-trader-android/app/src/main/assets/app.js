const DEFAULT_ASSETS=[
  {symbol:'NAS100',name:'Nasdaq 100',price:25140.2,vol:.0009,decimals:2},
  {symbol:'SPX500',name:'S&P 500',price:6898.4,vol:.00045,decimals:2},
  {symbol:'EURUSD',name:'EUR/USD',price:1.1674,vol:.00018,decimals:5},
  {symbol:'BTCUSD',name:'Bitcoin',price:110420,vol:.0017,decimals:2},
  {symbol:'XAUUSD',name:'Or',price:2743.8,vol:.0006,decimals:2}
];
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const STORAGE_KEY='ai-trader-v21-state';
const LEGACY_KEYS=['ai-trader-v2-state','ai-trader-state'];
const round=(n,d=2)=>Number(n).toFixed(d);
const money=n=>`${Number(n||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})} €`;
const parseNum=v=>{if(typeof v==='number')return Number.isFinite(v)?v:NaN;const s=String(v??'').trim().replace(/\s/g,'').replace(',','.');return s===''?NaN:Number(s)};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
function makeSeries(base,n=110){const a=[];let p=base;for(let i=0;i<n;i++){p=Math.max(.00001,p+(Math.random()-.49)*base*.00145);a.push(p)}return a}
function avg(a,n){const x=a.slice(-n);return x.reduce((s,v)=>s+v,0)/Math.max(1,x.length)}
function calcRsi(a,p=14){if(a.length<p+1)return 50;let g=0,l=0;for(let i=a.length-p;i<a.length;i++){const d=a[i]-a[i-1];if(d>0)g+=d;else l-=d}if(!l)return 70;return 100-(100/(1+g/l))}
function atr(a,n=14){const x=a.slice(-(n+1));if(x.length<2)return 0;let s=0;for(let i=1;i<x.length;i++)s+=Math.abs(x[i]-x[i-1]);return s/(x.length-1)}
let market=DEFAULT_ASSETS.map(x=>({...x,series:makeSeries(x.price),open:x.price,change:0}));
let state={
  cash:25000,positions:[],journal:[],selected:'NAS100',side:'BUY',riskPct:.5,currentTab:'trade',
  chat:[{role:'assistant',text:'V2.1 Premium : LONG = acheter, SHORT = vendre. Les données sont simulées et les ordres restent en compte démo.',source:'local'}],
  orderDraft:{qty:'1',sl:'',tp:''},scrollByTab:{trade:0,positions:0,assistant:0,broker:0,journal:0}
};
function loadState(){
  let loaded=null;
  for(const k of [STORAGE_KEY,...LEGACY_KEYS]){try{loaded=JSON.parse(localStorage.getItem(k)||'null')}catch{}if(loaded)break}
  if(loaded){
    state={...state,...loaded,orderDraft:{...state.orderDraft,...(loaded.orderDraft||{})},scrollByTab:{...state.scrollByTab,...(loaded.scrollByTab||{})}};
    if(loaded.settings) delete state.settings;
  }
  if(!DEFAULT_ASSETS.some(x=>x.symbol===state.selected))state.selected='NAS100';
  state.side=state.side==='SELL'?'SELL':'BUY';
  if(!['trade','positions','assistant','broker','journal'].includes(state.currentTab))state.currentTab='trade';
}
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}catch{}}
loadState();
function asset(){return market.find(x=>x.symbol===state.selected)||market[0]}
function fmtPrice(a,p=a.price){return round(p,a.decimals||2)}
function unrealized(){return state.positions.reduce((s,p)=>{const m=market.find(x=>x.symbol===p.symbol);return s+(m?(m.price-p.entry)*(p.side==='BUY'?1:-1)*p.qty:0)},0)}
function equity(){return state.cash+unrealized()}
function closedPnl(){return state.journal.filter(x=>x.type==='CLOSE'&&Number.isFinite(Number(x.pnl))).reduce((s,x)=>s+Number(x.pnl),0)}
function riskAmount(){return Math.max(0,equity()*state.riskPct/100)}
function openRisk(){return state.positions.reduce((s,p)=>p.sl==null?s:s+Math.abs(p.entry-p.sl)*p.qty,0)}
function updateHero(){
  const u=unrealized(),c=closedPnl();
  if(q('#equity'))q('#equity').textContent=money(equity());
  if(q('#unreal')){q('#unreal').textContent=(u>=0?'+':'')+money(u);q('#unreal').className=u>=0?'pos':'neg'}
  if(q('#closed-pnl')){q('#closed-pnl').textContent=(c>=0?'+':'')+money(c);q('#closed-pnl').className=c>=0?'pos':'neg'}
  if(q('#open-risk'))q('#open-risk').textContent=money(openRisk());
  if(q('#position-count'))q('#position-count').textContent=String(state.positions.length);
}
function chartSVG(series){const w=900,h=300,p=24,min=Math.min(...series),max=Math.max(...series),sp=max-min||1;const pts=series.map((v,i)=>`${p+(i/(series.length-1))*(w-p*2)},${h-p-((v-min)/sp)*(h-p*2)}`).join(' ');const area=`${p},${h-p} ${pts} ${w-p},${h-p}`;return `<svg class="chart" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity=".30"/><stop offset="100%" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>${[.2,.4,.6,.8].map(x=>`<line x1="${p}" x2="${w-p}" y1="${h*x}" y2="${h*x}" class="gridline"/>`).join('')}<polygon points="${area}" fill="url(#fill)"/><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></svg>`}
function kpi(l,v,s='',id=''){return `<div class="kpi"><span>${l}</span><strong ${id?`id="${id}"`:''}>${v}</strong>${s?`<small>${s}</small>`:''}</div>`}
function marketBias(a){const r=calcRsi(a.series),m20=avg(a.series,20),m50=avg(a.series,50);let bias='Neutre';if(a.price>m20&&m20>m50)bias='Haussière';else if(a.price<m20&&m20<m50)bias='Baissière';return{r,bias,m20,m50}}
function draftNumbers(){
  const qty=parseNum(state.orderDraft.qty),sl=parseNum(state.orderDraft.sl),tp=parseNum(state.orderDraft.tp);
  return {qty:Number.isFinite(qty)?qty:0,sl:Number.isFinite(sl)?sl:null,tp:Number.isFinite(tp)?tp:null};
}
function orderMetrics(){
  const a=asset(),d=draftNumbers();
  const validSL=d.sl!=null&&d.sl>0,validTP=d.tp!=null&&d.tp>0;
  const stopDist=validSL?Math.abs(a.price-d.sl):0,targetDist=validTP?Math.abs(d.tp-a.price):0;
  const autoQty=stopDist>0?riskAmount()/stopDist:0,rr=stopDist>0&&targetDist>0?targetDist/stopDist:0,riskAtQty=stopDist*Math.max(0,d.qty);
  const slSideOk=!validSL||(state.side==='BUY'?d.sl<a.price:d.sl>a.price);
  const tpSideOk=!validTP||(state.side==='BUY'?d.tp>a.price:d.tp<a.price);
  return {...d,validSL,validTP,stopDist,targetDist,autoQty,rr,riskAtQty,slSideOk,tpSideOk};
}
function sideLabel(){return state.side==='BUY'?'ACHETER / LONG':'VENDRE / SHORT'}
function updateOrderPreview(){
  const m=orderMetrics(),guard=q('#order-guard');
  if(q('#risk-amount'))q('#risk-amount').textContent=money(riskAmount());
  if(q('#risk-current'))q('#risk-current').textContent=m.validSL&&m.qty>0?money(m.riskAtQty):'—';
  if(q('#rr-value'))q('#rr-value').textContent=m.rr?`1:${round(m.rr,2)}`:'—';
  if(q('#auto-qty')){q('#auto-qty').textContent=m.autoQty>0?round(m.autoQty,3):'—';q('#auto-qty').dataset.qty=String(m.autoQty||0)}
  if(q('#place')){q('#place').textContent=sideLabel();q('#place').className='primary'+(state.side==='SELL'?' danger':'')}
  if(!guard)return;
  let text=`${sideLabel()} • ordre démo prêt`,cls='guard good';
  if(m.qty<=0){text='Renseigne une quantité supérieure à 0.';cls='guard danger'}
  else if(m.validSL&&!m.slSideOk){text=state.side==='BUY'?'Pour un LONG, le stop doit être sous le prix.':'Pour un SHORT, le stop doit être au-dessus du prix.';cls='guard danger'}
  else if(m.validTP&&!m.tpSideOk){text=state.side==='BUY'?'Pour un LONG, le TP doit être au-dessus du prix.':'Pour un SHORT, le TP doit être sous le prix.';cls='guard danger'}
  else if(!m.validSL){text=`${sideLabel()} • stop facultatif en démo, mais recommandé.`;cls='guard neutral'}
  else if(m.riskAtQty>riskAmount()*1.05){text=`Ordre possible en démo, mais risque ${money(m.riskAtQty)} > cible ${money(riskAmount())}.`;cls='guard danger'}
  else if(m.validSL&&m.validTP){text=`Configuration cohérente • R/R ${round(m.rr,2)} • risque ${money(m.riskAtQty)}`;cls='guard good'}
  guard.className=cls;guard.textContent=text;
}
function tickerHtml(){return market.map(m=>`<button data-symbol="${m.symbol}" class="${state.selected===m.symbol?'active':''}"><b>${m.symbol}</b><span data-price="${m.symbol}">${fmtPrice(m)}</span><em data-change="${m.symbol}" class="${m.change>=0?'pos':'neg'}">${m.change>=0?'+':''}${round(m.change,2)}%</em></button>`).join('')}
function renderTrade(){
  const a=asset(),b=marketBias(a),m=orderMetrics();
  q('#view').innerHTML=`<section class="tickerbar">${tickerHtml()}</section><section class="grid mainGrid"><div class="panel chartPanel"><div class="panelHead"><div><span>${a.name}</span><strong id="main-price">${fmtPrice(a)}</strong></div><div id="main-change" class="delta ${a.change>=0?'pos':'neg'}">${a.change>=0?'▲':'▼'} ${round(Math.abs(a.change),2)}%</div></div><div id="chart-wrap">${chartSVG(a.series)}</div><div class="metrics">${kpi('Tendance',b.bias,'simulation','trend-kpi')}${kpi('RSI (14)',round(b.r,1),'simulation','rsi-kpi')}${kpi('Risque cible',money(riskAmount()),state.riskPct+'% equity','risk-kpi')}</div></div><div class="panel orderPanel"><div class="panelTitle"><div><b>Ticket d’ordre démo</b><span>V2.1 • sens explicite</span></div><span class="secureTag">PAPER</span></div><div class="seg"><button id="buy" class="buy ${state.side==='BUY'?'active':''}">ACHETER<br><small>LONG</small></button><button id="sell" class="sell ${state.side==='SELL'?'active':''}">VENDRE<br><small>SHORT</small></button></div><div class="sideExplain"><b>${state.side==='BUY'?'LONG sélectionné':'SHORT sélectionné'}</b><span>${state.side==='BUY'?'Tu gagnes si le prix monte.':'Tu gagnes si le prix baisse.'}</span></div><label>Quantité<input id="qty" value="${esc(state.orderDraft.qty)}" inputmode="decimal" autocomplete="off"></label><div class="twocol"><label>Stop loss<input id="sl" value="${esc(state.orderDraft.sl)}" placeholder="facultatif" inputmode="decimal"></label><label>Take profit<input id="tp" value="${esc(state.orderDraft.tp)}" placeholder="facultatif" inputmode="decimal"></label></div><div class="riskPreset"><span>Risque cible</span><div>${[.25,.5,1].map(v=>`<button data-risk="${v}" class="${state.riskPct===v?'active':''}">${v}%</button>`).join('')}</div></div><div class="riskbox premiumRisk"><div><span>Perte cible max</span><b id="risk-amount">${money(riskAmount())}</b></div><div><span>Risque ordre</span><b id="risk-current">${m.validSL&&m.qty>0?money(m.riskAtQty):'—'}</b></div><div><span>R/R</span><b id="rr-value">${m.rr?`1:${round(m.rr,2)}`:'—'}</b></div></div><div class="autoSize"><div><span>Taille calculée par stop</span><b id="auto-qty" data-qty="${m.autoQty||0}">${m.autoQty>0?round(m.autoQty,3):'—'}</b></div><button id="use-auto" ${m.autoQty>0?'':'disabled'}>Utiliser</button></div><div id="order-guard" class="guard neutral"></div><button id="place" class="primary ${state.side==='SELL'?'danger':''}">${sideLabel()}</button><button id="ask-ai" class="ghost">Analyser avant d’entrer</button></div></section>`;
  bindTrade();updateOrderPreview();
}
function captureDraft(){for(const id of ['qty','sl','tp']){const el=q('#'+id);if(el)state.orderDraft[id]=el.value}}
function setSide(side){
  captureDraft();state.side=side;
  const a=asset(),sl=parseNum(state.orderDraft.sl),tp=parseNum(state.orderDraft.tp);
  let reset=false;
  if(Number.isFinite(sl)&&sl>0){const ok=side==='BUY'?sl<a.price:sl>a.price;if(!ok){state.orderDraft.sl='';reset=true}}
  if(Number.isFinite(tp)&&tp>0){const ok=side==='BUY'?tp>a.price:tp<a.price;if(!ok){state.orderDraft.tp='';reset=true}}
  saveState();renderTrade();restoreTabScroll();
  if(reset)showToast('SL/TP incompatibles avec ce sens : champs réinitialisés.');
}
function bindTrade(){
  qa('[data-symbol]').forEach(b=>b.onclick=()=>{captureDraft();state.selected=b.dataset.symbol;saveState();renderTrade();restoreTabScroll()});
  q('#buy').onclick=()=>setSide('BUY');q('#sell').onclick=()=>setSide('SELL');
  qa('[data-risk]').forEach(b=>b.onclick=()=>{state.riskPct=Number(b.dataset.risk);saveState();qa('[data-risk]').forEach(x=>x.classList.toggle('active',x===b));updateOrderPreview();updateDynamicTrade()});
  for(const id of ['qty','sl','tp']){q('#'+id).addEventListener('input',()=>{captureDraft();saveState();updateOrderPreview()})}
  q('#use-auto').onclick=()=>{const v=parseNum(q('#auto-qty').dataset.qty);if(Number.isFinite(v)&&v>0){state.orderDraft.qty=round(v,3);q('#qty').value=state.orderDraft.qty;saveState();updateOrderPreview()}};
  q('#place').onclick=placeDemoOrder;
  q('#ask-ai').onclick=()=>{captureDraft();switchTab('assistant',true);setTimeout(()=>askLocal(`Analyse ${state.selected} pour ${sideLabel()}, SL ${state.orderDraft.sl||'non défini'}, TP ${state.orderDraft.tp||'non défini'}.`),0)};
}
function validateOrder(){
  captureDraft();const m=orderMetrics();
  if(m.qty<=0)return{ok:false,msg:'Quantité invalide. Entre une valeur supérieure à 0.'};
  if(state.orderDraft.sl.trim()!==''&&!m.validSL)return{ok:false,msg:'Stop loss invalide. Utilise un nombre, par ex. 25000 ou 25000,5.'};
  if(state.orderDraft.tp.trim()!==''&&!m.validTP)return{ok:false,msg:'Take profit invalide. Utilise un nombre, par ex. 25500 ou 25500,5.'};
  if(m.validSL&&!m.slSideOk)return{ok:false,msg:state.side==='BUY'?'LONG : le stop doit être SOUS le prix actuel.':'SHORT : le stop doit être AU-DESSUS du prix actuel.'};
  if(m.validTP&&!m.tpSideOk)return{ok:false,msg:state.side==='BUY'?'LONG : le take profit doit être AU-DESSUS du prix actuel.':'SHORT : le take profit doit être SOUS le prix actuel.'};
  return{ok:true,m};
}
function placeDemoOrder(){
  const v=validateOrder();if(!v.ok){showToast(v.msg,true);pulseGuard(v.msg);return}
  const a=asset(),m=v.m;
  const body=`<div class="confirmTrade"><div class="confirmSide ${state.side==='BUY'?'long':'short'}">${sideLabel()}</div><div><span>Actif</span><b>${state.selected}</b></div><div><span>Entrée simulée</span><b>${fmtPrice(a)}</b></div><div><span>Quantité</span><b>${m.qty}</b></div><div><span>SL</span><b>${m.validSL?fmtPrice(a,m.sl):'Aucun'}</b></div><div><span>TP</span><b>${m.validTP?fmtPrice(a,m.tp):'Aucun'}</b></div>${m.validSL?`<div><span>Risque estimé</span><b>${money(m.riskAtQty)}</b></div>`:''}</div>`;
  openModal('Confirmer l’ordre DÉMO',body,'Confirmer',()=>executeDemoOrder(m));
}
function executeDemoOrder(m){
  const a=asset();
  const p={id:`${Date.now()}-${Math.random().toString(16).slice(2)}`,symbol:state.selected,side:state.side,qty:m.qty,entry:a.price,sl:m.validSL?m.sl:null,tp:m.validTP?m.tp:null,openedAt:new Date().toISOString()};
  state.positions.unshift(p);state.journal.unshift({...p,type:'OPEN'});saveState();updateHero();renderTrade();showToast(`${sideLabel()} ouvert en démo.`);
}
function pulseGuard(msg){const g=q('#order-guard');if(!g)return;g.textContent=msg;g.className='guard danger';g.animate?.([{transform:'translateX(0)'},{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:220})}
function positionPnl(p){const m=market.find(x=>x.symbol===p.symbol);return m?(m.price-p.entry)*(p.side==='BUY'?1:-1)*p.qty:0}
function renderPositions(){
  q('#view').innerHTML=`<section class="panel pagePanel"><div class="panelTitle"><div><b>Positions démo ouvertes</b><span>${state.positions.length} position(s)</span></div><span class="secureTag">LIVE P/L SIM</span></div>${!state.positions.length?'<div class="empty premiumEmpty">Aucune position ouverte.</div>':`<div class="positionCards">${state.positions.map(p=>{const m=market.find(x=>x.symbol===p.symbol),pnl=positionPnl(p);return `<article class="positionCard" data-pos="${p.id}"><div class="positionTop"><div><b>${p.symbol}</b><span class="${p.side==='BUY'?'pos':'neg'}">${p.side==='BUY'?'LONG / ACHAT':'SHORT / VENTE'}</span></div><strong data-pnl="${p.id}" class="${pnl>=0?'pos':'neg'}">${pnl>=0?'+':''}${money(pnl)}</strong></div><div class="positionMeta"><span>Entrée <b>${fmtPrice(m,p.entry)}</b></span><span>Cours <b data-pos-price="${p.id}">${fmtPrice(m)}</b></span><span>Qté <b>${p.qty}</b></span><span>SL <b>${p.sl!=null?fmtPrice(m,p.sl):'—'}</b></span><span>TP <b>${p.tp!=null?fmtPrice(m,p.tp):'—'}</b></span></div><button class="mini closeBtn" data-close="${p.id}">Clôturer la position</button></article>`}).join('')}</div>`}</section>`;
  qa('[data-close]').forEach(b=>b.onclick=()=>{const p=state.positions.find(x=>x.id===b.dataset.close);if(!p)return;const pnl=positionPnl(p);openModal('Clôturer la position',`<div class="confirmTrade"><div class="confirmSide ${p.side==='BUY'?'long':'short'}">${p.side==='BUY'?'LONG':'SHORT'} ${p.symbol}</div><div><span>P/L actuel</span><b class="${pnl>=0?'pos':'neg'}">${pnl>=0?'+':''}${money(pnl)}</b></div></div>`,'Clôturer',()=>closePosition(p.id,'MANUEL'))});
}
function closePosition(id,reason){
  const p=state.positions.find(x=>x.id===id);if(!p)return;const m=market.find(x=>x.symbol===p.symbol);if(!m)return;const pnl=positionPnl(p);state.cash+=pnl;state.positions=state.positions.filter(x=>x.id!==id);state.journal.unshift({...p,type:'CLOSE',exit:m.price,pnl,reason,closedAt:new Date().toISOString()});saveState();updateHero();if(state.currentTab==='positions')renderPositions();showToast(`Position clôturée : ${pnl>=0?'+':''}${money(pnl)}`);
}
function localAnalysis(){
  const a=asset(),b=marketBias(a),m=orderMetrics(),moment=(a.price/a.series[a.series.length-10]-1)*100,A=atr(a.series);
  let bias='ATTENDRE',score=50;if(a.price>b.m20&&b.m20>b.m50&&b.r<70){bias='LONG';score=70}else if(a.price<b.m20&&b.m20<b.m50&&b.r>30){bias='SHORT';score=70}
  return `${a.symbol} — analyse locale V2.1\n\nBiais technique : ${bias} • score heuristique ${score}/100\nPrix simulé : ${fmtPrice(a)}\nRSI 14 : ${round(b.r,1)}\nMomentum court : ${moment>=0?'+':''}${round(moment,2)} %\nATR simplifié : ${fmtPrice(a,A)}\n\nTicket actuel : ${sideLabel()} × ${m.qty||0}\nSL : ${m.validSL?fmtPrice(a,m.sl):'non défini'} • TP : ${m.validTP?fmtPrice(a,m.tp):'non défini'}\nR/R : ${m.rr?round(m.rr,2):'—'}\nRisque cible : ${money(riskAmount())}\n\nCes données sont simulées. Ce score n’est pas une probabilité de gain.`;
}
function renderAssistant(){
  const a=asset(),b=marketBias(a);
  q('#view').innerHTML=`<section class="assistantGrid"><div class="panel contextPanel"><div class="panelTitle"><div><b>Contexte</b><span>simulation locale</span></div><span class="secureTag">V2.1</span></div>${kpi('Actif',state.selected)}${kpi('Sens ticket',sideLabel())}${kpi('Prix',fmtPrice(a))}${kpi('Tendance',b.bias)}${kpi('RSI',round(b.r,1))}${kpi('Equity',money(equity()))}<div class="chips"><button data-prompt="Analyse ${state.selected} maintenant.">Analyse rapide</button><button data-prompt="Analyse un LONG sur ${state.selected}.">Scénario LONG</button><button data-prompt="Analyse un SHORT sur ${state.selected}.">Scénario SHORT</button></div></div><div class="panel chatPanel"><div class="panelTitle"><div><b>Assistant trading</b><span>analyse locale</span></div></div><div class="messages" id="messages">${state.chat.map(m=>`<div class="msg ${m.role}"><div>${esc(m.text)}</div>${m.role==='assistant'?'<small>analyse locale</small>':''}</div>`).join('')}</div><div class="composer"><textarea id="chat-input" placeholder="Ex. Est-ce que mon LONG est cohérent ?"></textarea><button id="chat-send">Envoyer</button></div></div></section>`;
  qa('[data-prompt]').forEach(b=>b.onclick=()=>askLocal(b.dataset.prompt));q('#chat-send').onclick=()=>askLocal(q('#chat-input').value);q('#chat-input').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();askLocal(e.target.value)}};setTimeout(()=>{const m=q('#messages');if(m)m.scrollTop=m.scrollHeight},0);
}
function askLocal(text){text=String(text||'').trim();if(!text)return;state.chat.push({role:'user',text});state.chat.push({role:'assistant',text:localAnalysis(),source:'local'});saveState();renderAssistant()}
function renderBroker(){q('#view').innerHTML=`<section class="brokerGrid"><div class="panel brokerHero"><p class="eyebrow">COMPTE RÉEL</p><h2>Mode réel toujours verrouillé</h2><p>Cette APK V2.1 sert au paper trading. Les identifiants broker ne sont jamais stockés dans l’application.</p></div><div class="panel brokerCard"><div class="brokerName"><b>SAXO</b><span>SIM / LIVE</span></div><p>Connexion réelle à activer plus tard via backend sécurisé.</p><div class="brokerActions"><a class="primary link" href="https://www.home.saxo/fr-fr/accounts">Compte Saxo</a><a class="outline link" href="https://www.saxotrader.com/">SaxoTrader ↗</a></div></div><div class="panel brokerCard"><div class="brokerName"><b>INTERACTIVE BROKERS</b><span>IBKR</span></div><p>Exécution manuelle via IBKR Mobile / Client Portal.</p><div class="brokerActions"><a class="outline link" href="https://www.interactivebrokers.com/en/accounts/open_account_country_list.php">Compte IBKR ↗</a></div></div></section>`}
function renderJournal(){
  const closes=state.journal.filter(x=>x.type==='CLOSE'),wins=closes.filter(x=>Number(x.pnl)>0).length,winrate=closes.length?wins/closes.length*100:0;
  q('#view').innerHTML=`<section class="panel pagePanel"><div class="panelTitle"><div><b>Journal</b><span>${state.journal.length} événement(s)</span></div><span class="secureTag">Win rate ${round(winrate,0)}%</span></div>${!state.journal.length?'<div class="empty premiumEmpty">Aucune opération enregistrée.</div>':state.journal.map(j=>`<div class="journalRow"><span class="badge">${j.type}</span><b>${j.symbol}</b><span>${j.side==='BUY'?'LONG':'SHORT'} × ${j.qty}</span><span>${j.type==='OPEN'?`Entrée ${round(j.entry,4)}`:`Sortie ${round(j.exit,4)}`}</span>${j.pnl!=null?`<strong class="${j.pnl>=0?'pos':'neg'}">${j.pnl>=0?'+':''}${money(j.pnl)}</strong>`:'<span></span>'}<small>${new Date(j.closedAt||j.openedAt).toLocaleString('fr-FR')}</small></div>`).join('')}</section>`;
}
function renderCurrent(){({trade:renderTrade,positions:renderPositions,assistant:renderAssistant,broker:renderBroker,journal:renderJournal}[state.currentTab]||renderTrade)()}
function switchTab(t,resetScroll=false){
  state.scrollByTab[state.currentTab]=window.scrollY||0;state.currentTab=t;if(resetScroll)state.scrollByTab[t]=0;saveState();qa('#tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));renderCurrent();restoreTabScroll();
}
function restoreTabScroll(){requestAnimationFrame(()=>window.scrollTo(0,state.scrollByTab[state.currentTab]||0))}
function updateDynamicTrade(){
  if(state.currentTab!=='trade')return;const a=asset(),b=marketBias(a);
  market.forEach(m=>{const p=q(`[data-price="${m.symbol}"]`),c=q(`[data-change="${m.symbol}"]`);if(p)p.textContent=fmtPrice(m);if(c){c.textContent=`${m.change>=0?'+':''}${round(m.change,2)}%`;c.className=m.change>=0?'pos':'neg'}});
  if(q('#main-price'))q('#main-price').textContent=fmtPrice(a);if(q('#main-change')){q('#main-change').textContent=`${a.change>=0?'▲':'▼'} ${round(Math.abs(a.change),2)}%`;q('#main-change').className=`delta ${a.change>=0?'pos':'neg'}`}
  if(q('#chart-wrap'))q('#chart-wrap').innerHTML=chartSVG(a.series);if(q('#trend-kpi'))q('#trend-kpi').textContent=b.bias;if(q('#rsi-kpi'))q('#rsi-kpi').textContent=round(b.r,1);if(q('#risk-kpi'))q('#risk-kpi').textContent=money(riskAmount());updateOrderPreview();
}
function updateDynamicPositions(){
  if(state.currentTab!=='positions')return;for(const p of state.positions){const m=market.find(x=>x.symbol===p.symbol),pnl=positionPnl(p),pe=q(`[data-pnl="${p.id}"]`),pr=q(`[data-pos-price="${p.id}"]`);if(pe){pe.textContent=`${pnl>=0?'+':''}${money(pnl)}`;pe.className=pnl>=0?'pos':'neg'}if(pr&&m)pr.textContent=fmtPrice(m)}
}
function checkStops(){
  const hits=[];for(const p of state.positions){const m=market.find(x=>x.symbol===p.symbol);if(!m)continue;const sl=p.sl!=null&&(p.side==='BUY'?m.price<=p.sl:m.price>=p.sl),tp=p.tp!=null&&(p.side==='BUY'?m.price>=p.tp:m.price<=p.tp);if(sl||tp)hits.push([p.id,sl?'SL':'TP'])}
  for(const [id,r] of hits)closePosition(id,r);
}
function showToast(text,error=false){
  let t=q('#toast');if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t)}t.className='toast show'+(error?' error':'');t.textContent=text;clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.className='toast',2600)
}
function ensureOverlayStyles(){
  if(q('#v21-style'))return;const s=document.createElement('style');s.id='v21-style';s.textContent=`.sideExplain{display:flex;justify-content:space-between;gap:10px;padding:10px 11px;margin:-4px 0 10px;border:1px solid var(--line);border-radius:11px;background:#081522}.sideExplain span{color:var(--muted);font-size:12px}.seg button small{font-size:9px;opacity:.8}.modalBack{position:fixed;inset:0;background:#000b;z-index:9998;display:grid;place-items:end center;padding:16px}.modalCard{width:min(520px,100%);background:#0c1928;border:1px solid #29445f;border-radius:20px;padding:16px;box-shadow:0 30px 90px #000}.modalCard h3{margin:0 0 12px}.modalActions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}.modalActions button{border:0;border-radius:11px;padding:12px;font-weight:900}.modalActions .cancel{background:#142337;color:#dbeaff;border:1px solid #284057}.modalActions .confirm{background:linear-gradient(135deg,var(--cyan),#22b7da);color:#04121b}.confirmTrade{display:grid;gap:8px}.confirmTrade>div:not(.confirmSide){display:flex;justify-content:space-between;gap:12px;padding:9px;background:#081522;border-radius:10px}.confirmTrade span{color:var(--muted)}.confirmSide{padding:10px;border-radius:10px;font-weight:900;text-align:center}.confirmSide.long{background:#0c4638;color:#56efbe}.confirmSide.short{background:#542431;color:#ff8798}.toast{position:fixed;left:50%;bottom:82px;transform:translate(-50%,20px);opacity:0;pointer-events:none;z-index:10000;background:#10283a;color:#eaf7ff;border:1px solid #2d526b;border-radius:999px;padding:10px 15px;font-weight:800;max-width:90vw;text-align:center;transition:.2s}.toast.show{opacity:1;transform:translate(-50%,0)}.toast.error{background:#421b27;border-color:#8c3e53}.positionCards{display:grid;gap:10px;margin-top:12px}.positionCard{background:#081522;border:1px solid #1a3348;border-radius:14px;padding:12px}.positionTop,.positionMeta{display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}.positionTop>div{display:flex;gap:8px;align-items:center}.positionMeta{margin:10px 0;color:var(--muted);font-size:12px}.positionMeta span{background:#0d1d2c;border:1px solid #183248;border-radius:9px;padding:7px}.closeBtn{width:100%}@media(min-width:761px){.modalBack{place-items:center}.modalCard{width:460px}}`;document.head.appendChild(s)
}
function openModal(title,body,confirmText,onConfirm){
  closeModal();const back=document.createElement('div');back.id='modal-back';back.className='modalBack';back.innerHTML=`<div class="modalCard"><h3>${esc(title)}</h3><div>${body}</div><div class="modalActions"><button class="cancel" id="modal-cancel">Annuler</button><button class="confirm" id="modal-confirm">${esc(confirmText)}</button></div></div>`;document.body.appendChild(back);q('#modal-cancel').onclick=closeModal;q('#modal-confirm').onclick=()=>{closeModal();onConfirm?.()};back.addEventListener('click',e=>{if(e.target===back)closeModal()});
}
function closeModal(){q('#modal-back')?.remove()}
qa('#tabs button').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
q('#reset-demo').onclick=()=>openModal('Réinitialiser le compte démo','<p>Le capital repassera à <b>25 000 €</b> et les positions/journal seront effacés.</p>','Réinitialiser',()=>{state.cash=25000;state.positions=[];state.journal=[];state.orderDraft={qty:'1',sl:'',tp:''};saveState();updateHero();renderCurrent();showToast('Compte démo réinitialisé.')});
setInterval(()=>{market=market.map(x=>{const last=x.series[x.series.length-1],next=Math.max(.00001,last+(Math.random()-.495)*last*x.vol);return{...x,price:next,series:[...x.series.slice(-109),next],change:(next-x.open)/x.open*100}});checkStops();updateHero();updateDynamicTrade();updateDynamicPositions()},1200);
window.addEventListener('scroll',()=>{state.scrollByTab[state.currentTab]=window.scrollY||0},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveState()});window.addEventListener('beforeunload',saveState);
ensureOverlayStyles();updateHero();qa('#tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.currentTab));renderCurrent();restoreTabScroll();
