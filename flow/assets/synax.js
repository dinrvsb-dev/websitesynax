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
    { id:'p41',   name:'Pakej 4+1',     short:'Pakej 4+1 · 5 Botol (150 biji)', tabs:150, price:80, old:100, img:'package-4plus1-botol', popular:true }
  ],
  upsellTo: 'p41'
};
/* ===================================================== */

const FLOW = Object.assign({ key:'synax', label:'anak', perDay:2, defaultPkg:'p41', meter:[] }, window.FLOW || {});
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const STATES=['Johor','Kedah','Kelantan','Melaka','Negeri Sembilan','Pahang','Perak','Perlis','Pulau Pinang','Selangor','Terengganu','W.P. Kuala Lumpur','W.P. Putrajaya','Sabah','Sarawak','W.P. Labuan'];
const rm=n=>'RM'+(Number.isInteger(n)?n:n.toFixed(2));
const waUrl=msg=>`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
const pkgBy=id=>CONFIG.packages.find(p=>p.id===id);
const daysOf=p=>Math.floor(p.tabs/FLOW.perDay);
const track=(ev,data)=>{try{window.fbq&&fbq('track',ev,data)}catch(e){}};

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

/* supply calculator */
(()=>{const seg=$('#calcSeg');if(!seg)return;
  CONFIG.packages.forEach(p=>{const b=document.createElement('button');b.type='button';b.dataset.id=p.id;b.textContent=p.id==='trial'?'Percubaan':p.id==='p41'?'4+1 Botol':p.name;seg.appendChild(b)});
  const show=id=>{const p=pkgBy(id),d=daysOf(p);$$('button',seg).forEach(b=>b.classList.toggle('on',b.dataset.id===id));
    $('#cDays').textContent=d;$('#cDay').textContent=rm(p.price/d);$('#cPrice').textContent=rm(p.price);
    $('#cNote').textContent=d>=28?`✅ Cukup untuk rutin ${Math.floor(d/7)} minggu berturut-turut.`:`⚠️ Cuma ${d} hari. Ramai mak ayah baru nak nampak rutin terbentuk, stok dah habis.`};
  seg.addEventListener('click',e=>{const b=e.target.closest('button');if(b)show(b.dataset.id)});show(FLOW.defaultPkg)})();

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

/* ================= ORDER FORM ================= */
const state={id:FLOW.defaultPkg};
const pkgBox=$('#pkgOpts');
CONFIG.packages.forEach(p=>{
  const l=document.createElement('label');l.className='opt';l.dataset.id=p.id;
  l.innerHTML=`<input type="radio" name="pkg" value="${p.id}">${p.popular?'<span class="ptag">⭐ PALING BERBALOI</span>':''}<span class="rd"></span><span class="t"><b>${p.short}</b><span>Cukup ±${daysOf(p)} hari untuk ${FLOW.label} · ${p.id==='trial'?'nak kenal dulu':rm(p.price/(p.tabs/30))+'/botol'}</span></span><span class="pr">${p.old?`<s>${rm(p.old)}</s>`:''}${rm(p.price)}</span>`;
  pkgBox.appendChild(l);
});
const sel=$('#fState');STATES.forEach(s=>sel.add(new Option(s,s)));

/* COD Time Gaji: next salary-week dates */
(()=>{const g=$('#fGaji');if(!g)return;const now=new Date(),out=[];
  for(let m=0;m<2&&out.length<4;m++)[25,28,1,7].forEach(d=>{const dt=new Date(now.getFullYear(),now.getMonth()+m+(d<15?1:0),d);if(dt-now>2*864e5&&out.length<4&&!out.some(x=>+x===+dt))out.push(dt)});
  out.sort((a,b)=>a-b).forEach(dt=>g.add(new Option(dt.toLocaleDateString('ms-MY',{weekday:'short',day:'numeric',month:'long'}),dt.toLocaleDateString('ms-MY',{day:'numeric',month:'long',year:'numeric'}))))})();

function setPkg(id){state.id=id;$$('.opt',pkgBox).forEach(o=>{const on=o.dataset.id===id;o.classList.toggle('on',on);$('input',o).checked=on});render()}
pkgBox.addEventListener('change',e=>setPkg(e.target.value));
$('#payOpts').addEventListener('change',()=>{$$('#payOpts .opt').forEach(o=>o.classList.toggle('on',$('input',o).checked));$('.gaji').classList.toggle('on',$('input[name=pay]:checked').value==='gaji');render()});

function render(){
  const p=pkgBy(state.id),up=pkgBy(CONFIG.upsellTo),showUp=p.id!==up.id;
  $('#summary').innerHTML=`
    <div class="srow"><span>${p.short}</span><b>${rm(p.price)}</b></div>
    ${p.old?`<div class="srow"><span>Jimat (beli 4 percuma 1)</span><span class="free">-${rm(p.old-p.price)}</span></div>`:''}
    <div class="srow"><span>Bekalan untuk ${FLOW.label}</span><span>±${daysOf(p)} hari</span></div>
    <div class="srow"><span>Penghantaran</span><span class="small">Ikut poskod, disahkan di WhatsApp</span></div>
    <div class="srow tot"><span>Harga produk</span><span>${rm(p.price)}</span></div>
    <div class="upsell ${showUp?'on':''}">💡 Tambah ${rm(up.price-p.price)} sahaja untuk <b>5 botol (±${daysOf(up)} hari)</b> pada RM16 sebotol. <button type="button" id="upBtn">Tukar ke Pakej 4+1</button></div>`;
  const ub=$('#upBtn');if(ub)ub.onclick=()=>{setPkg(up.id);toast('✅ Ditukar ke Pakej 4+1 (5 botol)')};
  $('#stickyPrice').textContent=`${p.name} · ${rm(p.price)}`;
}
setPkg(state.id);

/* pricing buttons → pick package & go to form */
$$('[data-pick]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();setPkg(b.dataset.pick);track('AddToCart',{value:pkgBy(b.dataset.pick).price,currency:'MYR'});
  toast('✅ '+pkgBy(b.dataset.pick).name+' dipilih');$('#order').scrollIntoView({behavior:'smooth'})}));

/* validate + send */
const F={name:$('#fName'),phone:$('#fPhone'),addr:$('#fAddr'),pc:$('#fPc'),city:$('#fCity'),state:sel};
const rules={name:v=>v.trim().length>=2,phone:v=>/^01\d{7,9}$/.test(v.replace(/[\s-]/g,'')),addr:v=>v.trim().length>=8,pc:v=>/^\d{5}$/.test(v.trim()),city:v=>v.trim().length>=2,state:v=>!!v};
Object.entries(F).forEach(([k,el])=>el.addEventListener('input',()=>el.closest('.fld').classList.toggle('bad',!rules[k](el.value))));
try{const d=JSON.parse(localStorage.getItem('synax_form')||'{}');Object.entries(F).forEach(([k,el])=>{if(d[k])el.value=d[k]})}catch(e){}

$('#orderForm').addEventListener('submit',e=>{
  e.preventDefault();
  let ok=true,first=null;
  Object.entries(F).forEach(([k,el])=>{const good=rules[k](el.value);el.closest('.fld').classList.toggle('bad',!good);if(!good){ok=false;first=first||el}});
  if(!ok){first.focus();first.scrollIntoView({behavior:'smooth',block:'center'});toast('Sila lengkapkan maklumat bertanda merah');return}
  try{const d={};Object.entries(F).forEach(([k,el])=>d[k]=el.value);localStorage.setItem('synax_form',JSON.stringify(d))}catch(e){}
  const p=pkgBy(state.id),pay=$('input[name=pay]:checked').value;
  const payTxt=pay==='cod'?'COD (bayar bila sampai)':pay==='gaji'?`COD Time Gaji (hantar sekitar ${$('#fGaji').value})`:'Online (FPX / DuitNow)';
  const msg=['Assalamualaikum, saya nak order SYNAX 🧠',`(Untuk: ${FLOW.label})`,'',
    `📦 Pakej: ${p.short}`,`💰 Harga produk: ${rm(p.price)}`,`💳 Bayaran: ${payTxt}`,'',
    `Nama: ${F.name.value.trim()}`,`Telefon: ${F.phone.value.trim()}`,`Alamat: ${F.addr.value.trim()}, ${F.pc.value.trim()} ${F.city.value.trim()}, ${F.state.value}`,'',
    'Mohon sahkan tempahan & caj penghantaran. Terima kasih! 🙏'].join('\n');
  const url=waUrl(msg);
  $('#waGo').href=url;$('#orderForm').hidden=true;$('#done').classList.add('on');
  track('Purchase',{value:p.price,currency:'MYR'});
  try{window.open(url,'_blank','noopener')}catch(err){}
});
$('#editOrder').addEventListener('click',()=>{$('#orderForm').hidden=false;$('#done').classList.remove('on')});
