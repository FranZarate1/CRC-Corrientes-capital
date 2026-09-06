'use strict';
const $ = id => document.getElementById(id);
const money = n => '$' + n.toLocaleString('es-AR');
const state = { people:2, seats:[], standing:null, zoom:1, mapView:'all' };
const sectors = {rio:{name:'Platea Río',color:'#88bfdf',base:18000},parque:{name:'Platea Parque',color:'#b1c5e7',base:15000}};
const rows = ['A','B','C','D'];
const inventory = [];
for (const sector of Object.keys(sectors)) for (let r=0;r<4;r++) for (let n=1;n<=18;n++) {
 const occupied = ((n*7+r*11+(sector==='rio'?3:8))%17<3) || (sector==='rio' && r===0 && n>=7&&n<=9);
 inventory.push({id:`${sector}-${rows[r]}-${n}`,sector,row:rows[r],n,price:sectors[sector].base+(r<2?6000:0),occupied});
}
function seatMarkup(seat){
 const r=rows.indexOf(seat.row); const x=189+(seat.n-1)*25+(seat.n>9?24:0); const y=seat.sector==='rio'?142-r*25:317+r*25;
 const chosen=state.seats.includes(seat.id);const cl=seat.occupied?'occupied':chosen?'selected':'';
 const label=`${sectors[seat.sector].name}, fila ${seat.row}, butaca ${seat.n}, ${money(seat.price)}${seat.occupied?', ocupada':''}`;
 return `<g><rect class="seat ${cl}" x="${x}" y="${y}" width="22" height="22" rx="5" fill="${sectors[seat.sector].color}" data-seat="${seat.id}" role="button" tabindex="${seat.occupied?'-1':'0'}" aria-label="${label}" aria-disabled="${seat.occupied}" aria-pressed="${chosen}"></rect><text class="seat-number ${cl}" x="${x+11}" y="${y+14}" text-anchor="middle">${seat.n}</text></g>`;
}
function renderMap(){
 let svg=`<text x="425" y="30" text-anchor="middle" fill="#75828e" font-size="12" font-weight="650" letter-spacing="2">≈  PLATEA RÍO</text><text x="425" y="48" text-anchor="middle" fill="#8b9691" font-size="10">${money(18000)} – ${money(24000)}</text>`;
 for(let r=0;r<4;r++){svg+=`<text x="164" y="${154-r*25}" fill="#9aa49c" font-size="10">${rows[r]}</text><text x="686" y="${154-r*25}" fill="#9aa49c" font-size="10">${rows[r]}</text><text x="164" y="${329+r*25}" fill="#9aa49c" font-size="10">${rows[r]}</text><text x="686" y="${329+r*25}" fill="#9aa49c" font-size="10">${rows[r]}</text>`}
 svg+=inventory.map(seatMarkup).join('');
 svg+=`<rect x="208" y="184" width="435" height="109" rx="8" fill="#f2eee3" stroke="#e5dfcf"/><rect x="227" y="191" width="396" height="95" fill="#e9e1ce" rx="2"/><g fill="none" stroke="#fffdf4" stroke-width="1.4"><rect x="231" y="195" width="388" height="87"/><path d="M425 195v87"/><circle cx="425" cy="238.5" r="22"/><path d="M231 216h62v45h-62M619 216h-62v45h62"/><circle cx="293" cy="238.5" r="19"/><circle cx="557" cy="238.5" r="19"/><path d="M231 201h21a43 43 0 0 1 0 75h-21M619 201h-21a43 43 0 0 0 0 75h21"/><path d="M247 230v17M603 230v17"/><circle cx="253" cy="238.5" r="4"/><circle cx="597" cy="238.5" r="4"/></g><text x="425" y="243" fill="#c5b99b" font-size="11" font-weight="700" letter-spacing="1" text-anchor="middle">REGATAS</text><text x="425" y="177" text-anchor="middle" fill="#a9afa4" font-size="8" letter-spacing="1.2">LÍNEA LATERAL</text>`;
 for(const [key,x,label] of [['norte',63,'NORTE'],['sur',718,'SUR']]){
 const chosen=state.standing===key;
 svg+=`<g><rect class="zone ${chosen?'selected':''}" x="${x}" y="168" width="70" height="140" rx="13" fill="#f3ead6" stroke="#e5d8b8" stroke-dasharray="4 3" role="button" tabindex="0" aria-label="General ${label}, de pie, ${money(9000)} por persona, 80 lugares disponibles" aria-pressed="${chosen}" data-zone="${key}"></rect><g class="zone-text" text-anchor="middle"><text x="${x+35}" y="208" font-size="9" letter-spacing="1">GENERAL</text><text x="${x+35}" y="225" font-size="13">${label}</text><text x="${x+35}" y="249" font-size="10" font-weight="400">De pie</text><text x="${x+35}" y="270" font-size="11">$9.000</text></g></g>`;
 }
 svg+=`<text x="425" y="435" text-anchor="middle" fill="#6d8c7b" font-size="12" font-weight="650" letter-spacing="2">♧  PLATEA PARQUE</text><text x="425" y="454" text-anchor="middle" fill="#8b9691" font-size="10">${money(15000)} – ${money(21000)}</text><text x="425" y="478" text-anchor="middle" fill="#a9b1a8" font-size="9">ACCESO PRINCIPAL ↑</text>`;
 $('arena').innerHTML=svg;
}
function selected(){return state.seats.map(id=>inventory.find(s=>s.id===id))}
function count(){return state.standing?state.people:state.seats.length}
function subtotal(){return state.standing?9000*state.people:selected().reduce((a,s)=>a+s.price,0)}
function groups(){
 if(state.standing)return [{key:'standing',name:`General ${state.standing==='norte'?'Norte':'Sur'}`,detail:`${state.people} ${state.people===1?'entrada':'entradas'} de pie · Sin asiento asignado`,amount:subtotal()}];
 const result=[];
 for(const seat of selected()){
  let group=result.find(g=>g.key===`${seat.sector}-${seat.row}`);
  if(!group){group={key:`${seat.sector}-${seat.row}`,name:sectors[seat.sector].name,row:seat.row,numbers:[],amount:0};result.push(group)}
  group.numbers.push(seat.n);group.amount+=seat.price;
 }
 return result.map(g=>({...g,detail:`Fila ${g.row} · ${g.numbers.length===1?'Butaca':'Butacas'} ${g.numbers.sort((a,b)=>a-b).join(', ')}`}));
}
function renderTicket(){
 const n=count(),sub=subtotal(),fee=Math.round(sub*.08);
 $('ticketCount').textContent=`${n} ${n===1?'entrada':'entradas'}`;$('quantityLabel').textContent=n?`(${n})`:'';$('subtotal').textContent=money(sub);$('fees').textContent=money(fee);$('total').textContent=money(sub+fee);$('continue').disabled=n!==state.people;
 const missing=state.people-n;
 $('selectionProgress').textContent=missing?'Completá tu grupo':'Grupo completo';
 $('selectionFraction').textContent=`${n} de ${state.people}`;
 $('selectionMeter').max=state.people;$('selectionMeter').value=n;
 $('selectionHelp').textContent=missing?`Elegiste para ${state.people} ${state.people===1?'persona':'personas'}. ${missing===1?'Falta 1 lugar':`Faltan ${missing} lugares`} para ver tu ticket.`:'Ya podés ver tu ticket.';
 document.querySelector('.group-progress').classList.toggle('is-complete',!missing);
 if(!n)$('ticketItems').innerHTML='<div class="empty-ticket"><span class="empty-seat" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="9" y="5" width="14" height="14" rx="4"/><path d="M6 15v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-8M7 21h18M10 26v3m12-3v3"/></svg></span><strong>Tu lugar te espera</strong><p>Elegí tus butacas en el mapa.</p></div>';
 else $('ticketItems').innerHTML=groups().map(g=>`<div class="selection-item"><div class="selection-item-heading"><strong><i class="selection-dot ${g.key.split('-')[0]}" aria-hidden="true"></i>${g.name}</strong><button class="remove" data-remove="${g.key}" aria-label="Quitar ${g.name}, ${g.detail}" title="Quitar selección">×</button></div><div class="selection-location">${g.row?`<span class="row-chip">Fila <b>${g.row}</b></span><div class="seat-chips" aria-label="Butacas ${g.numbers.join(', ')}">${g.numbers.map(n=>`<span aria-hidden="true">${n}</span>`).join('')}</div>`:`<span class="standing-detail">${state.people} ${state.people===1?'entrada':'entradas'} · De pie</span>`}</div><div class="selection-item-price"><small>${g.row?`${g.numbers.length} × ${money(g.amount/g.numbers.length)}`:'Ubicación libre'}</small><strong>${money(g.amount)}</strong></div></div>`).join('');
}
function notice(text,error=false){$('notice').textContent=text;$('notice').classList.toggle('error',error)}
function render(){hideTooltip();renderMap();renderTicket();$('people').textContent=state.people;$('personLabel').textContent=state.people===1?'persona':'personas';$('less').disabled=state.people===1;$('more').disabled=state.people===8}
function toggleSeat(id){
 const seat=inventory.find(s=>s.id===id);if(!seat||seat.occupied)return;
 if(state.seats.includes(id)){state.seats=state.seats.filter(s=>s!==id);notice('Butaca quitada de tu selección.')}else{
  if(state.seats.length>=state.people){notice(`Ya elegiste ${state.people} ${state.people===1?'lugar':'lugares'}. Quitá una butaca o aumentá la cantidad de personas.`,true);return}
  state.standing=null;state.seats.push(id);notice(`${sectors[seat.sector].name} · Fila ${seat.row} · Butaca ${seat.n} · ${money(seat.price)} + servicio.`)
 }
 render();document.querySelector(`[data-seat="${id}"]`)?.focus({preventScroll:true});
}
function chooseStanding(zone){state.standing=state.standing===zone?null:zone;state.seats=[];render();notice(state.standing?`${state.people} ${state.people===1?'entrada':'entradas'} en General ${zone==='norte'?'Norte':'Sur'}. Pueden ingresar juntos; la ubicación es libre, sin butacas.`:'Sector de pie quitado de tu selección.');document.querySelector(`[data-zone="${zone}"]`)?.focus({preventScroll:true})}
function findTogether(preference){
 if(preference==='standing'){state.standing='norte';state.seats=[];render();notice(`General Norte: ${state.people} entradas de pie. El grupo puede ingresar junto; la ubicación se elige al llegar.`);return}
 const candidates=[];
 for(const sector of Object.keys(sectors)){
  if((preference==='rio'||preference==='parque')&&preference!==sector)continue;
  for(let r=0;r<4;r++) for(let start=1;start<=19-state.people;start++){
   const end=start+state.people-1;if(start<=9&&end>9)continue;
   const seats=inventory.filter(s=>s.sector===sector&&s.row===rows[r]&&s.n>=start&&s.n<=end);
   if(seats.length!==state.people||seats.some(s=>s.occupied))continue;
   const center=Math.abs((start+end)/2-9.5);
   const score=preference==='price'?seats[0].price*100+r*10+center:r*100+center+(sector==='rio'?0:.1);
   candidates.push({seats,score});
  }
 }
 candidates.sort((a,b)=>a.score-b.score);
 if(!candidates.length){notice(`No hay ${state.people} butacas consecutivas con esa preferencia. Probá otra platea o elegí “Sector de pie”.`,true);return}
 state.standing=null;state.seats=candidates[0].seats.map(s=>s.id);render();
 const first=candidates[0].seats[0],last=candidates[0].seats.at(-1);
 notice(`${state.people===1?'Encontramos tu lugar':`¡${state.people} lugares juntos!`} ${sectors[first.sector].name}, fila ${first.row}, ${first.n===last.n?`butaca ${first.n}`:`butacas ${first.n} a ${last.n}`}. ${money(first.price)} por persona + servicio.`);
}
$('arena').addEventListener('click',e=>{const seat=e.target.closest('[data-seat]'),zone=e.target.closest('[data-zone]');if(seat)toggleSeat(seat.dataset.seat);if(zone)chooseStanding(zone.dataset.zone)});
$('arena').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[role="button"]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}))}});
function changePeople(delta){const next=Math.min(8,Math.max(1,state.people+delta));state.people=next;if(state.seats.length>next)state.seats=state.seats.slice(0,next);render();notice(`Grupo de ${next} ${next===1?'persona':'personas'}. ${state.standing?'Actualizamos tus entradas de pie.':'Usá “Buscar juntos” para buscar butacas juntas.'}`)}
$('less').onclick=()=>changePeople(-1);$('more').onclick=()=>changePeople(1);$('suggest').onclick=()=>findTogether($('priority').value);
for(const button of document.querySelectorAll('[data-sector]'))button.onclick=()=>{const sector=button.dataset.sector;$('priority').value=sector;findTogether(sector)};
$('ticketItems').onclick=e=>{const button=e.target.closest('[data-remove]');if(!button)return;const key=button.dataset.remove;if(key==='standing')state.standing=null;else state.seats=state.seats.filter(id=>!id.startsWith(key+'-'));render();notice('Selección actualizada. Podés elegir otros lugares en el mapa.')};
function zoom(value){
 const viewport=$('mapViewport'),arena=$('arena');
 const previousWidth=arena.getBoundingClientRect().width||640;
 const center=(viewport.scrollLeft+viewport.clientWidth/2)/previousWidth;
 state.zoom=Math.round(Math.min(2.4,Math.max(1,value))*10)/10;
 arena.style.width=(Math.max(viewport.clientWidth,640)*state.zoom)+'px';
 $('zoomLevel').textContent=Math.round(state.zoom*100)+'%';
 $('zoomOut').disabled=state.zoom===1;$('zoomIn').disabled=state.zoom===2.4;
 viewport.scrollLeft=center*arena.getBoundingClientRect().width-viewport.clientWidth/2;
 hideTooltip();
}
function setMapView(view){
 state.mapView=view;
 const boxes={all:'0 0 850 490',rio:'150 50 550 120',parque:'150 305 550 120',general:'35 155 780 165'};
 $('arena').setAttribute('viewBox',boxes[view]);
 for(const button of document.querySelectorAll('[data-map-view]'))button.setAttribute('aria-pressed',String(button.dataset.mapView===view));
 zoom(1);$('mapViewport').scrollTo({left:0,top:0});
}
for(const button of document.querySelectorAll('[data-map-view]'))button.onclick=()=>setMapView(button.dataset.mapView);
$('zoomIn').onclick=()=>zoom(state.zoom+.2);$('zoomOut').onclick=()=>zoom(state.zoom-.2);$('resetView').onclick=()=>setMapView('all');
$('continue').onclick=()=>{
 if(count()!==state.people){notice(`Elegiste ${count()} de ${state.people} lugares. Completá la selección o ajustá la cantidad de personas.`,true);return}
 hideTooltip();
 renderReview(false);
 document.body.classList.add('modal-open');$('review').showModal();
};
function renderReview(confirmed){
 const fee=Math.round(subtotal()*.08);
 $('reviewContent').innerHTML=`<article class="ticket"><div class="ticket-top"><div class="ticket-brand"><img src="assets/regatas.png" alt="">REGATAS <span>CORRIENTES</span></div><p class="ticket-league">BÁSQUET · TEMPORADA 2026</p><h2 id="reviewTitle">REGATAS<br><span>VS.</span> PARQUE CLUB</h2><div class="ticket-event"><div><small>FECHA Y HORA</small><strong>24 OCT · 21:00 H</strong></div><div><small>ESTADIO</small><strong>José Jorge Contte</strong></div></div></div><div class="perforation"></div><div class="ticket-body"><div class="ticket-status">${confirmed?'✓ SELECCIÓN CONFIRMADA':'TUS '+count()+' ENTRADAS'}</div>${groups().map(g=>`<div class="review-line"><div><strong>${g.name}</strong><small>${g.detail}</small></div><strong>${money(g.amount)}</strong></div>`).join('')}<div class="ticket-totals"><div><span>Servicio (8%)</span><strong>${money(fee)}</strong></div><div class="total"><span>Total <small>ARS</small></span><strong>${money(subtotal()+fee)}</strong></div></div><div class="barcode" aria-hidden="true"></div><p class="barcode-label">DEMO · NO VÁLIDO PARA INGRESAR</p><button id="ticketAction" class="continue">${confirmed?'Volver al mapa':'Confirmar selección'} <span>${confirmed?'↗':'→'}</span></button><p class="checkout-note">Sin cobros ni reservas reales.</p></div></article>`;
 $('ticketAction').onclick=()=>confirmed?$('review').close():renderReview(true);
}
$('closeDialog').onclick=()=>$('review').close();$('review').addEventListener('click',e=>{if(e.target===$('review')){const r=$('review').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('review').close()}});$('review').addEventListener('close',()=>{document.body.classList.remove('modal-open');$('continue').focus()});
$('review').addEventListener('beforetoggle',e=>document.body.classList.toggle('modal-open',e.newState==='open'));
function hideTooltip(){ $('seatTooltip').hidden=true; }
function showTooltip(target){
 if(!target)return;
 const seat=inventory.find(s=>s.id===target.dataset.seat);
 const zone=target.dataset.zone;
 if(!seat&&!zone)return;
 const chosen=seat?state.seats.includes(seat.id):state.standing===zone;
 const tip=$('seatTooltip');
 tip.innerHTML=`<span class="tooltip-status ${seat?.occupied?'is-occupied':''}">${seat?.occupied?'Ocupada':chosen?'Seleccionada':'Disponible'}</span><strong>${seat?sectors[seat.sector].name:'General '+(zone==='norte'?'Norte':'Sur')}</strong><div class="tooltip-location">${seat?`Fila <b>${seat.row}</b><span></span> Butaca <b>${seat.n}</b>`:'De pie · Ubicación libre'}</div><div class="tooltip-price">${money(seat?seat.price:9000)} <small>+ servicio</small></div>`;
 tip.hidden=false;
 const rect=target.getBoundingClientRect(),box=tip.getBoundingClientRect();
 tip.style.left=Math.max(12,Math.min(innerWidth-box.width-12,rect.left+rect.width/2-box.width/2))+'px';
 tip.style.top=Math.max(12,rect.top-box.height-12<12?Math.min(innerHeight-box.height-12,rect.bottom+12):rect.top-box.height-12)+'px';
}
$('arena').addEventListener('pointerover',e=>{if(e.pointerType!=='touch')showTooltip(e.target.closest('[data-seat],[data-zone]'))});
$('arena').addEventListener('pointerout',hideTooltip);
$('arena').addEventListener('focusin',e=>showTooltip(e.target.closest('[data-seat],[data-zone]')));
$('arena').addEventListener('focusout',hideTooltip);
$('mapViewport').addEventListener('scroll',hideTooltip);
window.addEventListener('scroll',hideTooltip,{passive:true});
window.addEventListener('resize',()=>{hideTooltip();zoom(state.zoom)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')hideTooltip()});
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#arena'))hideTooltip()});
render();zoom(1);
