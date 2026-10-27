/* SYNAX sales flow — shared behaviour.
   Each page sets window.FLOW before loading this file (umur, dos sehari, teks meter). */

/* =====================================================
   TETAPAN — tukar di sini sahaja
   ===================================================== */
const CONFIG = {
  whatsapp: '601153087474',            // No. WhatsApp (format 60xxxxxxxxx)
  agentName: 'SYNAX OFFICIAL',
  packages: [
    { id:'trial', name:'Set Percubaan', short:'Set Percubaan (10 biji)', tabs:10,  price:10, old:null, img:'starter' },
    { id:'p1',    name:'1 Botol',       short:'1 Botol (30 biji)',       tabs:30,  price:20, old:null, img:'package-1-botol' },
    { id:'p2',    name:'2 Botol',       short:'2 Botol (60 biji)',       tabs:60,  price:40, old:null, img:'package-2-botol' },
    { id:'p3',    name:'3 Botol',       short:'3 Botol (90 biji)',       tabs:90,  price:60, old:null, img:'package-3-botol' },
    { id:'p41',   name:'Pakej 4+1',     short:'Pakej 4+1 · 5 Botol (150 biji)', tabs:150, price:80, old:null, img:'package-4plus1-botol', popular:true }
  ],
  upsellTo: 'p41'
};
/* ===================================================== */

const FLOW = Object.assign({ key:'synax', segment:'', label:'anak', perDay:2, defaultPkg:'p41', meter:[] }, window.FLOW || {});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const STATES=['Johor','Kedah','Kelantan','Melaka','Negeri Sembilan','Pahang','Perak','Perlis','Pulau Pinang','Selangor','Terengganu','W.P. Kuala Lumpur','W.P. Putrajaya','Sabah','Sarawak','W.P. Labuan'];
const rm=n=>'RM'+(Number.isInteger(n)?n:n.toFixed(2));
const waUrl=msg=>`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
const pkgBy=id=>(FLOW.packages||CONFIG.packages).find(p=>p.id===id);
const daysOf=p=>FLOW.perDay?Math.floor(p.tabs/FLOW.perDay):null;
const lpCtx=()=>{const q=new URLSearchParams(location.search),o={landing_segment:FLOW.segment,landing_path:location.pathname};['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(k=>{const v=q.get(k);if(v)o[k]=v});return o};
const track=(ev,data,eid)=>{try{if(window.fbq){const d=Object.assign(lpCtx(),data||{});eid?fbq('track',ev,d,{eventID:eid}):fbq('track',ev,d)}}catch(e){}};
/* page events (the Pixel base code is in <head>) */
track('PageView');track('ViewContent',{content_name:'SYNAX Chewable Tablet Health Supplements'});

/* misc */
$$('[data-yr]').forEach(e=>e.textContent=new Date().getFullYear());
$$('.wa-link').forEach(a=>{a.href=waUrl(a.dataset.msg||'Hi, saya nak tanya pasal SYNAX untuk '+FLOW.label+'.');a.target='_blank';a.rel='noopener';a.addEventListener('click',()=>track('Contact'))});
$$('[data-days]').forEach(e=>e.textContent=daysOf(pkgBy(e.dataset.days)));
$$('[data-perday]').forEach(e=>{const p=pkgBy(e.dataset.perday);e.textContent=rm(p.price/daysOf(p))});

/* duplicate marquee tracks for a seamless loop */
$$('.chips .track,.tm .track').forEach(t=>t.innerHTML+=t.innerHTML);
/* press & hold pauses testimonial rows */
$$('.tm').forEach(t=>{const on=()=>t.classList.add('paused'),off=()=>t.classList.remove('paused');
  t.addEventListener('pointerdown',on);['pointerup','pointerleave','pointercancel'].forEach(e=>t.addEventListener(e,off))});

/* top bar: one message at a time */
(()=>{const m=$$('.topbar span');if(!m.length)return;let i=0;m[0].classList.add('on');setInterval(()=>{m[i].classList.remove('on');i=(i+1)%m.length;m[i].classList.add('on')},3200)})();

function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2600)}

/* reveal on scroll — only items starting below the fold are hidden, so the first frame is complete */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('pre');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
$$('.rv').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add('pre');io.observe(el)}});

/* count up (numbers are already correct in the HTML; animate only when scrolled into view) */
const fmt=n=>n.toLocaleString('en-MY');
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target,to=+el.dataset.count,t0=performance.now(),dur=1400;
  const step=t=>{const p=Math.min((t-t0)/dur,1);el.textContent=fmt(Math.round(to*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step);cio.unobserve(el)}),{threshold:.6});
$$('[data-count]').forEach(el=>{if(el.getBoundingClientRect().top>innerHeight)cio.observe(el)});

/* generic tab groups: <div data-tabs="x"><button data-tab="id">…  + .pane-x#id */
$$('[data-tabs]').forEach(g=>{const btns=$$('button',g),group=g.dataset.tabs;
  btns.forEach(b=>b.addEventListener('click',()=>{btns.forEach(x=>x.classList.toggle('on',x===b));$$('[data-pane="'+group+'"]').forEach(p=>p.classList.toggle('on',p.id===b.dataset.tab))}))});

/* carousel auto-slide + dots; pauses when touched */
function isVisible(el){const r=el.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0}
function autoSlide(c,dots,ms){
  const items=[...c.children];items.forEach(()=>dots.appendChild(document.createElement('i')));
  let idx=0,pauseUntil=0;
  const set=i=>$$('i',dots).forEach((d,j)=>d.classList.toggle('on',j===i));
  const near=()=>{const cr=c.getBoundingClientRect(),mid=cr.left+cr.width/2;let best=0,bd=1e9;items.forEach((it,i)=>{const r=it.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-mid);if(d<bd){bd=d;best=i}});return best};
  const go=i=>{const cr=c.getBoundingClientRect(),r=items[i].getBoundingClientRect();c.scrollTo({left:c.scrollLeft+(r.left-cr.left)-(cr.width-r.width)/2,behavior:'smooth'})};
  c.addEventListener('scroll',()=>{idx=near();set(idx)},{passive:true});
  ['touchstart','pointerdown','wheel'].forEach(ev=>c.addEventListener(ev,()=>pauseUntil=Date.now()+6000,{passive:true}));
  $$('i',dots).forEach((d,i)=>d.addEventListener('click',()=>{pauseUntil=Date.now()+6000;go(i)}));
  set(0);
  setInterval(()=>{if(Date.now()<pauseUntil||!isVisible(c))return;go((idx+1)%items.length)},ms);
}
$$('[data-carousel]').forEach(c=>autoSlide(c,$('#'+c.dataset.carousel),+(c.dataset.ms||3000)));

/* self-check: tap the signs you see → meter */
(()=>{const pains=$$('.pain'),bar=$('#meterBar'),res=$('#meterRes'),box=$('.meter');if(!pains.length)return;
  const upd=()=>{const n=pains.filter(p=>p.classList.contains('on')).length,tot=pains.length;
    bar.style.width=(n/tot*100)+'%';
    const m=FLOW.meter, k=n===0?0:n<=2?1:n<=4?2:3;
    res.innerHTML=(m[k]||'').replace('{n}',n);box.classList.toggle('hot',n>=3)};
  pains.forEach(p=>p.addEventListener('click',()=>{p.classList.toggle('on');p.setAttribute('aria-pressed',p.classList.contains('on'));upd()}));upd()})();

/* lightbox */
$$('[data-zoom]').forEach(img=>img.addEventListener('click',()=>{$('#lb img').src=img.dataset.zoom||img.src;$('#lb').classList.add('on')}));
$('#lb')&&$('#lb').addEventListener('click',()=>$('#lb').classList.remove('on'));

/* FAQ */
$$('.qa button').forEach(b=>b.addEventListener('click',()=>{const q=b.parentElement,on=q.classList.contains('on');$$('.qa').forEach(x=>x.classList.remove('on'));if(!on)q.classList.add('on')}));
$('.qa')&&$('.qa').classList.add('on');

/* scroll: progress, sticky bar, timeline fill */
const hero=$('.hero'),orderSec=$('#order'),pricing=$('#pakej'),sticky=$('#sticky'),tl=$('#tl'),fill=$('#tlFill'),prog=$('#prog'),fab=$('.fab');
let ticking=false;
function onScroll(){
  const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
  prog.style.width=(h>0?y/h*100:0)+'%';
  const pastHero=hero.getBoundingClientRect().bottom<0;
  const pr=pricing.getBoundingClientRect(),or=orderSec.getBoundingClientRect();
  const inBuy=(pr.top<innerHeight*.6&&or.bottom>innerHeight*.3);
  sticky.classList.toggle('show',pastHero&&!inBuy);
  fab.style.opacity=inBuy?0:1;fab.style.pointerEvents=inBuy?'none':'';
  if(tl){const r=tl.getBoundingClientRect(),p=Math.min(Math.max((innerHeight*.7-r.top)/r.height,0),1);fill.style.height=(p*(r.height-16))+'px'}
  ticking=false;
}
addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(onScroll);ticking=true}},{passive:true});onScroll();

/* ================= ORDER FORM → ERP (rolevisionerp.com) / Billplz =================
   Same endpoint, product ids and payload as the main site's checkout (src/lib/orders.ts):
   the backend prices the order itself, so no prices are sent. Online → Billplz bill, back to
   /thank-you (which fires Purchase only if paid). COD / COD Time Gaji → order is the conversion. */
const ORDER_API='https://rolevisionerp.com/api/website/checkout';
const PROSPECT_API='https://rolevisionerp.com/api/website/prospect';
const SALES_ID='400', SALES_TOKEN='16c638839cd1d320';      // public pair, same as the main site bundle
const THANK_YOU='https://synaxhq.site/thank-you';
const PRODUCT_ID=18;   // bottle SKU. Quantity sent = the REAL number of bottles in the package (4+1 -> 5, 8+2 -> 10, 12 -> 12); the ERP prices the order.
const STATES_ERP=['Johor','Kedah','Kelantan','Melaka','Negeri Sembilan','Pahang','Perak','Perlis','Pulau Pinang','Sabah','Sarawak','Selangor','Terengganu','Wilayah Persekutuan Kuala Lumpur','Wilayah Persekutuan Labuan','Wilayah Persekutuan Putrajaya'];
const shipFee=pc=>{const d=(pc||'').replace(/\D/g,'');return d.length===5?(+d>=87000?10:7):null};
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const inDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const fmtDate=s=>{const [y,m,d]=s.split('-');return `${d}/${m}/${y}`};
const firstParam=(q,names)=>{for(const n of names){const v=(q.get(n)||'').trim();if(v)return v}return ''};
function attribution(){
  const q=new URLSearchParams(location.search),o={website_link:location.origin+location.pathname+location.search};
  const m={ad_link:['ad_link','ad_url'],fb_ad_id:['fb_ad_id','facebook_ad_id','ad_id'],utm_source:['utm_source'],utm_medium:['utm_medium'],utm_campaign:['utm_campaign'],utm_content:['utm_content'],utm_term:['utm_term']};
  Object.entries(m).forEach(([k,names])=>{const v=firstParam(q,names);if(v)o[k]=v});
  return o;
}
/* (landing_segment / landing_path go to the Pixel; the ERP gets website_link = this page's path + UTMs) */

const state={id:FLOW.defaultPkg};
const pkgBox=$('#pkgOpts');
FLOW.packages.forEach(p=>{
  const l=document.createElement('label');l.className='opt';l.dataset.id=p.id;
  l.innerHTML=`<input type="radio" name="pkg" value="${p.id}">${p.popular?'<span class="ptag">⭐ PALING POPULAR</span>':''}<span class="rd"></span><span class="t"><b>Bekalan ${p.supply} · ${p.name}</b><span>${p.buy?p.buy+' · ':''}${p.tag}</span></span><span class="pr">${rm(p.price)}</span>`;
  pkgBox.appendChild(l);
});
const sel=$('#fState');STATES_ERP.forEach(s=>sel.add(new Option(s,s)));
const gaji=$('#fGaji');gaji.min=inDays(1);gaji.max=inDays(14);

function setPkg(id){state.id=id;$$('.opt',pkgBox).forEach(o=>{const on=o.dataset.id===id;o.classList.toggle('on',on);$('input',o).checked=on});render()}
pkgBox.addEventListener('change',e=>setPkg(e.target.value));
$('#payOpts').addEventListener('change',()=>{$$('#payOpts .opt').forEach(o=>o.classList.toggle('on',$('input',o).checked));$('.gaji').classList.toggle('on',$('input[name=pay]:checked').value==='gaji');render()});

function render(){
  const p=pkgBy(state.id);
  const fee=shipFee(F.pc&&F.pc.value);
  $('#summary').innerHTML=`
    <div class="srow"><span>${p.name}${p.buy?' ('+p.buy+')':''}</span><b>${rm(p.price)}</b></div>
    <div class="srow"><span>Bekalan untuk ${FLOW.label}</span><span>${p.supply}</span></div>
    <div class="srow"><span>Penghantaran</span><span class="small">${fee===null?'Masukkan poskod':rm(fee)}</span></div>
    <div class="srow tot"><span>Jumlah</span><span>${fee===null?rm(p.price)+' + pos':rm(p.price+fee)}</span></div>`;
  $('#stickyPrice').textContent=`${p.name} · ${rm(p.price)}`;
}

/* InitiateCheckout fires ONCE per visit, with the package selected at that moment (no cart step; AddToCart is not used) */
function fireIC(){if(window.__ic)return;window.__ic=1;const p=pkgBy(state.id);track('InitiateCheckout',{value:p.price,currency:'MYR',content_name:'SYNAX '+p.name})}
/* pricing buttons → pick package & go to form */
$$('[data-pick]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();setPkg(b.dataset.pick);fireIC();
  toast('✅ '+pkgBy(b.dataset.pick).name+' dipilih');$('#order').scrollIntoView({behavior:'smooth'})}));
$('#orderForm').addEventListener('focusin',fireIC);

/* validate */
const F={name:$('#fName'),phone:$('#fPhone'),addr:$('#fAddr'),pc:$('#fPc'),city:$('#fCity'),state:sel};
const rules={name:v=>v.trim().length>=2,phone:v=>/^01\d{7,9}$/.test(v.replace(/[\s-]/g,'')),addr:v=>v.trim().length>=5,pc:v=>/^\d{5}$/.test(v.trim()),city:v=>v.trim().length>=2,state:v=>!!v};
Object.entries(F).forEach(([k,el])=>el.addEventListener('input',()=>{el.closest('.fld').classList.toggle('bad',!rules[k](el.value));if(k==='pc')render()}));
try{const d=JSON.parse(localStorage.getItem('synax_form')||'{}');Object.entries(F).forEach(([k,el])=>{if(d[k]&&(k!=='state'||STATES_ERP.includes(d[k])))el.value=d[k]})}catch(e){}
setPkg(state.id);

/* abandoned-cart capture (same prospect API as the main site) + Lead once, when a real snapshot is sent */
const SID_KEY='synax_session_id';
const sid=()=>{try{let v=sessionStorage.getItem(SID_KEY);if(!v){v=(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2));sessionStorage.setItem(SID_KEY,v)}return v}catch(e){return String(Date.now())}};
let leadFired=false,placed=false,pTimer=null;
function flushProspect(){
  if(placed)return;
  const phone=F.phone.value.replace(/[\s-]/g,'').replace(/^\+/,''),okPhone=phone.length>=7,okName=F.name.value.trim().length>=2;
  if(!okPhone&&!okName)return;
  const p=pkgBy(state.id);
  const a=attribution();
  const body=JSON.stringify(Object.assign({session_id:sid()},okPhone?{phone}:{},F.name.value?{name:F.name.value}:{},F.addr.value?{address:F.addr.value}:{},F.pc.value?{postcode:F.pc.value}:{},F.city.value?{district:F.city.value}:{},F.state.value?{state:F.state.value}:{},{product_id:PRODUCT_ID,quantity:p.qty},a,{sales_id:SALES_ID,sales_token:SALES_TOKEN}));
  let sent=false;try{sent=navigator.sendBeacon&&navigator.sendBeacon(PROSPECT_API,body)}catch(e){}
  if(!sent){fetch(PROSPECT_API,{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true}).catch(()=>{})}
  if(!leadFired){leadFired=true;track('Lead',{content_name:'SYNAX '+p.name})}
}
const schedule=()=>{clearTimeout(pTimer);pTimer=setTimeout(flushProspect,1500)};
Object.values(F).forEach(el=>el.addEventListener('input',schedule));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flushProspect()});
addEventListener('pagehide',flushProspect);

/* submit */
const orderForm=$('#orderForm'),submitBtn=$('button[type=submit]',orderForm),errBox=$('#orderErr');
const showErr=(msg)=>{const wa=waUrl('Hi, saya nak buat tempahan SYNAX untuk '+FLOW.label+' tetapi borang tak berjaya. Boleh bantu?');errBox.innerHTML='⚠️ '+msg+' <a href="'+wa+'" target="_blank" rel="noopener">Hantar tempahan melalui WhatsApp sebaliknya</a>.';errBox.hidden=false;errBox.scrollIntoView({behavior:'smooth',block:'center'})};
orderForm.addEventListener('submit',async e=>{
  e.preventDefault();errBox.hidden=true;
  let ok=true,first=null;
  Object.entries(F).forEach(([k,el])=>{const good=rules[k](el.value);el.closest('.fld').classList.toggle('bad',!good);if(!good){ok=false;first=first||el}});
  const pay=$('input[name=pay]:checked').value;
  const gajiBad=pay==='gaji'&&!gaji.value;$('.gaji').classList.toggle('bad',gajiBad);if(gajiBad){ok=false;first=first||gaji}
  if(!ok){first.focus();first.scrollIntoView({behavior:'smooth',block:'center'});toast('Sila lengkapkan maklumat bertanda merah');return}
  try{const d={};Object.entries(F).forEach(([k,el])=>d[k]=el.value);localStorage.setItem('synax_form',JSON.stringify(d))}catch(e){}
  const p=pkgBy(state.id),method=pay==='online'?'online':'cod',eid=crypto.randomUUID?crypto.randomUUID():undefined;
  const body=Object.assign({name:F.name.value.trim(),phone:F.phone.value.trim(),address:F.addr.value.trim(),postcode:F.pc.value.trim(),district:F.city.value.trim(),state:F.state.value,
    product_id:PRODUCT_ID,quantity:p.qty,payment_method:method},
    pay==='gaji'?{pos_pada_date:gaji.value}:{},
    {sales_id:SALES_ID,sales_token:SALES_TOKEN,redirect_url:THANK_YOU},eid?{client_event_id:eid}:{},attribution());
  const label=submitBtn.textContent;submitBtn.disabled=true;submitBtn.textContent='⏳ Menghantar…';
  try{
    const res=await fetch(ORDER_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const data=await res.json().catch(()=>null);
    if(!res.ok)throw new Error(data&&typeof data.error==='string'?data.error:'Pelayan memulangkan status '+res.status+'.');
    if(!data||typeof data.pending_id!=='number')throw new Error('Respons pelayan tidak lengkap.');
    if(typeof data.product_amount==='number'&&Math.round(data.product_amount)!==p.price)
      throw new Error('Harga pakej dalam sistem ('+rm(data.product_amount)+') tidak sepadan dengan harga dipaparkan ('+rm(p.price)+'). Anda belum dikenakan bayaran.');
    placed=true;clearTimeout(pTimer);
    const fee=shipFee(F.pc.value),amount=typeof data.amount==='number'?data.amount:p.price+(fee||0);
    const purchase={content_name:'SYNAX '+p.name,value:amount,currency:'MYR',order_id:data.pending_id};
    const payTxt=pay==='online'?'Online (Billplz)':pay==='gaji'?`COD Time Gaji (hantar pada ${fmtDate(gaji.value)})`:'COD (Bayar semasa terima)';
    const amtTxt=typeof data.amount_display==='string'?'RM'+data.amount_display:rm(amount);
    try{sessionStorage.setItem('synax_last_order',JSON.stringify({customerName:body.name,customerPhone:body.phone,address:body.address,postcode:body.postcode,city:body.district,state:body.state,packageLabel:p.name,bottles:p.qty,totalPrice:amount,amountDisplay:data.amount_display,paymentMethod:method,posPadaDate:pay==='gaji'?gaji.value:undefined}))}catch(e){}
    if(typeof data.payment_url==='string'&&data.payment_url){
      /* unpaid bill: Purchase is fired by /thank-you only if Billplz reports paid=true */
      try{sessionStorage.setItem('synax_pending_purchase',JSON.stringify(Object.assign({},lpCtx(),purchase,{event_id:eid})))}catch(e){}
      location.href=data.payment_url;return;
    }
    track('Purchase',purchase,eid);   /* COD: the confirmed order is the conversion */
    const msg=['Assalamualaikum, saya baru buat tempahan SYNAX. Nak sahkan butiran tempahan saya:','',`Nama: ${body.name}`,`Telefon: ${body.phone}`,`Pakej: ${p.name} (${p.qty} botol)`,`Jumlah: ${amtTxt}`,`Bayaran: ${payTxt}`,`Alamat: ${body.address}, ${body.postcode} ${body.district}, ${body.state}`,'','Sahkan tempahan saya ya, terima kasih! 🙏'].join('\n');
    $('#ref').textContent=data.pending_id;$('#waGo').href=waUrl(msg);
    orderForm.hidden=true;$('#done').classList.add('on');$('#done').scrollIntoView({behavior:'smooth',block:'center'});
  }catch(err){
    showErr((err&&err.message?err.message:'Tempahan tidak berjaya dihantar.'));
  }finally{
    if(!placed){submitBtn.disabled=false;submitBtn.textContent=label}
  }
});
