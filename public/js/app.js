// ═══════════════════════════════════════════════════════════════
// SMARTTRACKER AI — Frontend Application (Full Stack)
// Connects to Express backend at /api
// ═══════════════════════════════════════════════════════════════

const API = '';   // same origin
let token = localStorage.getItem('st_token') || '';
let currentUser = JSON.parse(localStorage.getItem('st_user') || 'null');
let darkMode   = localStorage.getItem('st_dark') === 'true';
let currentPage = 'dashboard';
let modalType  = 'expense';
let goalColor  = '#6366f1';
let chatMsgs   = [];

// Force logout & show login screen
function forceLogout() {
  token = ''; currentUser = null;
  localStorage.removeItem('st_token');
  localStorage.removeItem('st_user');
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('lspin').style.display = 'none';
  document.getElementById('lbl').textContent = 'Sign In →';
  toast('Session expired. Please sign in again.', 'error', '🔐');
}

const CATS = ['Food','Transport','Shopping','Salary','Freelance','Healthcare','Entertainment','Investment','Rent','Utilities','Bonus','Insurance'];
const CATICONS = {Food:'🍕',Transport:'🚕',Shopping:'🛍️',Salary:'💼',Freelance:'💻',Healthcare:'💊',Entertainment:'🎬',Investment:'📈',Rent:'🏠',Utilities:'⚡',Bonus:'🎁',Insurance:'🛡️'};
const GCOLS = ['#6366f1','#06b6d4','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899','#f97316'];
const PIE_COLORS = ['#6366f1','#06b6d4','#f59e0b','#ef4444','#10b981','#8b5cf6','#ec4899'];
const CHART_DATA = [
  {month:'Feb',income:82000,expenses:48000},{month:'Mar',income:90000,expenses:55000},
  {month:'Apr',income:88000,expenses:60000},{month:'May',income:95000,expenses:52000},
  {month:'Jun',income:87000,expenses:68000},{month:'Jul',income:110000,expenses:24299},
];
const NAV = [
  {id:'dashboard',   lbl:'Dashboard',    e:'🏠'},
  {id:'transactions',lbl:'Transactions', e:'💳'},
  {id:'budget',      lbl:'Budget',       e:'📊'},
  {id:'bills',       lbl:'Bills',        e:'🧾'},
  {id:'analytics',   lbl:'Analytics',    e:'📈'},
  {id:'accounts',    lbl:'Accounts',     e:'🏦'},
  {id:'goals',       lbl:'Goals',        e:'🎯'},
  {id:'ai-insights', lbl:'AI Insights',  e:'🤖'},
  {id:'ai-chat',     lbl:'AI Chat',      e:'💬'},
  {id:'settings',    lbl:'Settings',     e:'⚙️'},
];
const MOBNAV = [
  {id:'dashboard',   e:'🏠',lbl:'Home'},
  {id:'transactions',e:'💳',lbl:'Txns'},
  {id:'budget',      e:'📊',lbl:'Budget'},
  {id:'ai-chat',     e:'💬',lbl:'AI'},
  {id:'settings',    e:'⚙️',lbl:'More'},
];
const ACCOUNTS = [
  {name:'SBI Savings',       bal:45231,num:'****4521',grad:'linear-gradient(135deg,#3b82f6,#1d4ed8)',  ic:'🏦'},
  {name:'HDFC Salary',       bal:28750,num:'****9832',grad:'linear-gradient(135deg,#6366f1,#8b5cf6)', ic:'💳'},
  {name:'Paytm Wallet',      bal:3420, num:'****7100',grad:'linear-gradient(135deg,#06b6d4,#0d9488)', ic:'📱'},
  {name:'Zerodha Portfolio', bal:89600,num:'DEMAT',   grad:'linear-gradient(135deg,#f59e0b,#ea580c)', ic:'📈'},
];
const AI_INSIGHTS = [
  {icon:'🍕',title:'Food Spending Alert',  msg:'You spent ₹2,210 on food this month — 22% more than last month. Consider meal prepping to save ₹500+/month.',sev:'w'},
  {icon:'🛍️',title:'Shopping Spike',       msg:'Shopping jumped 45% vs last month (₹6,300). You exceeded your ₹5,000 budget by ₹1,300.',sev:'w'},
  {icon:'💡',title:'Savings Opportunity',  msg:'Based on income ₹1,10,000, you could save ₹22,000 (20%) this month. Currently on track for ₹85,701.',sev:'t'},
  {icon:'📈',title:'Investment Streak',    msg:'SIP maintained for 3 months! At 12% annual return portfolio could reach ₹1.2L in 12 months.',sev:'s'},
  {icon:'⚡',title:'Utility Bill Normal',  msg:'Electricity bill ₹1,800 is within normal seasonal range. No action needed.',sev:'s'},
];

// ══════════════════════════════════════════════
// API HELPERS
// ══════════════════════════════════════════════
async function api(method, path, body) {
  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API + path, opts);
    // ── 401 = server restarted / session expired → auto logout
    if (res.status === 401) {
      token = ''; currentUser = null;
      localStorage.removeItem('st_token');
      localStorage.removeItem('st_user');
      document.getElementById('app').style.display = 'none';
      document.getElementById('login-page').style.display = 'flex';
      toast('Session expired — please sign in again.', 'error', '🔐');
      throw new Error('Session expired');
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (e) {
    if (e.message !== 'Session expired') toast(e.message, 'error', '❌');
    throw e;
  }
}

// ══════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════
function fmt(n)  { return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Math.abs(n)); }
function fmtK(n) { return Math.abs(n)>=1000 ? '₹'+(Math.abs(n)/1000).toFixed(1)+'K' : fmt(n); }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}); }

function toast(msg, type='info', icon='🔔') {
  const el = document.createElement('div');
  el.className = `toast t${type[0]}`;
  el.innerHTML = `<span style="font-size:16px">${icon}</span><span style="flex:1">${msg}</span><span style="opacity:.6">✕</span>`;
  el.onclick = () => el.remove();
  document.getElementById('toast-wrap').appendChild(el);
  setTimeout(() => el.remove && el.remove(), 4000);
}

function exportCSV() {
  api('GET','/api/transactions').then(txns => {
    const hdr = ['ID','Date','Description','Category','Type','Amount','UPI','Note'];
    const rows = txns.map(t => [t.id,t.date,`"${t.desc}"`,t.cat,t.type,t.type==='income'?t.amt:-Math.abs(t.amt),t.upi?'Yes':'No',`"${t.note||''}"`]);
    const csv = [hdr,...rows].map(r=>r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'smarttracker_transactions.csv';
    a.click();
    toast('CSV downloaded!','success','📤');
  });
}

// ══════════════════════════════════════════════
// DARK MODE
// ══════════════════════════════════════════════
function applyDark() {
  document.body.classList.toggle('dark', darkMode);
  const b = document.getElementById('dkbtn');
  if (b) b.textContent = darkMode ? '☀️' : '🌙';
}
function toggleDark() {
  darkMode = !darkMode;
  localStorage.setItem('st_dark', darkMode);
  applyDark();
  renderPage();
}

// ══════════════════════════════════════════════
// LOGIN / LOGOUT
// ══════════════════════════════════════════════
let loginMode = 'login';

function setTab(t) {
  loginMode = t;
  document.getElementById('lt-in').classList.toggle('active', t==='login');
  document.getElementById('lt-up').classList.toggle('active', t==='signup');
  document.getElementById('snrow').style.display = t==='signup' ? 'block' : 'none';
  document.getElementById('lbl').textContent = t==='login' ? 'Sign In →' : 'Create Account →';
}
function togglePw() {
  const i = document.getElementById('pw');
  i.type = i.type === 'password' ? 'text' : 'password';
}
async function doLogin() {
  const email = document.getElementById('em').value.trim();
  const password = document.getElementById('pw').value || 'demo';
  const name  = document.getElementById('sn')?.value.trim() || email.split('@')[0];
  const spin = document.getElementById('lspin');
  const lbl  = document.getElementById('lbl');
  spin.style.display = 'block'; lbl.textContent = 'Please wait...';
  try {
    const endpoint = loginMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = loginMode === 'login' ? { email, password } : { name, email, password };
    const data = await api('POST', endpoint, body);
    token = data.token;
    currentUser = data.user;
    localStorage.setItem('st_token', token);
    localStorage.setItem('st_user', JSON.stringify(currentUser));
    initApp();
  } catch(e) {
    spin.style.display = 'none';
    lbl.textContent = loginMode === 'login' ? 'Sign In →' : 'Create Account →';
  }
}
function doLogout() {
  token = ''; currentUser = null;
  localStorage.removeItem('st_token');
  localStorage.removeItem('st_user');
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('lspin').style.display = 'none';
  document.getElementById('lbl').textContent = 'Sign In →';
}

// ══════════════════════════════════════════════
// SIDEBAR & NAVIGATION
// ══════════════════════════════════════════════
function openSidebar()  { document.getElementById('sidebar').classList.add('open'); document.getElementById('overlay').classList.add('open'); }
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay').classList.remove('open'); }

function buildNav(unpaidCount) {
  const nav = document.getElementById('snav');
  nav.innerHTML = NAV.map(n => {
    let badge = '';
    if (n.id==='bills' && unpaidCount>0) badge = `<span class="nbadge nbr">${unpaidCount}</span>`;
    if (n.id==='ai-chat') badge = `<span class="nbadge nbg">NEW</span>`;
    if (n.id==='ai-insights') badge = `<span style="width:8px;height:8px;background:var(--ind);border-radius:50%;display:inline-block;margin-left:auto" class="pulse"></span>`;
    return `<button class="nitem${currentPage===n.id?' active':''}" data-page="${n.id}" onclick="goPage('${n.id}')">
      <span style="font-size:16px">${n.e}</span><span>${n.lbl}</span>${badge}
    </button>`;
  }).join('');
  const mob = document.getElementById('mobnav');
  mob.innerHTML = MOBNAV.map(n => `
    <button class="mnbtn${currentPage===n.id?' active':''}" onclick="goPage('${n.id}')">
      <span>${n.e}</span><span>${n.lbl}</span>
    </button>`).join('');
}

function goPage(id) {
  currentPage = id;
  closeSidebar();
  const nav = NAV.find(n => n.id === id);
  document.getElementById('ptitle').textContent = nav ? nav.lbl : '';
  document.querySelectorAll('.nitem').forEach(el => el.classList.toggle('active', el.dataset.page === id));
  document.querySelectorAll('.mnbtn').forEach((el,i) => el.classList.toggle('active', MOBNAV[i]?.id === id));
  renderPage();
}

// ══════════════════════════════════════════════
// MODAL
// ══════════════════════════════════════════════
function openModal() {
  document.getElementById('modal').classList.add('open');
  const sel = document.getElementById('mcat');
  sel.innerHTML = CATS.map(c => `<option>${c}</option>`).join('');
}
function closeModal() { document.getElementById('modal').classList.remove('open'); }
function setType(t) {
  modalType = t;
  document.getElementById('ti').classList.toggle('active', t==='income');
  document.getElementById('te').classList.toggle('active', t==='expense');
}
async function submitModal() {
  const desc = document.getElementById('mdes').value.trim();
  const amt  = parseFloat(document.getElementById('mamt').value);
  const cat  = document.getElementById('mcat').value;
  const note = document.getElementById('mnot').value.trim();
  const upi  = document.getElementById('mupi').checked;
  if (!desc || !amt) { toast('Please fill description and amount.','error','❗'); return; }
  const btn = document.getElementById('modal-submit');
  btn.textContent = 'Saving...'; btn.disabled = true;
  try {
    await api('POST','/api/transactions',{
      cat, desc, note, upi, type: modalType, icon: CATICONS[cat]||'💸',
      amt: modalType==='income' ? amt : -Math.abs(amt)
    });
    closeModal();
    toast(`"${desc}" added!`,'success','✅');
    document.getElementById('mdes').value=''; document.getElementById('mamt').value='';
    document.getElementById('mnot').value=''; document.getElementById('mupi').checked=false;
    renderPage();
  } finally {
    btn.textContent = 'Add Transaction ✓'; btn.disabled = false;
  }
}

// ══════════════════════════════════════════════
// GOAL MODAL
// ══════════════════════════════════════════════
function openGoalModal() {
  document.getElementById('gmodal').classList.add('open');
  const wrap = document.getElementById('gcols');
  goalColor = GCOLS[0];
  wrap.innerHTML = '<span style="font-size:12px;color:var(--txt2);margin-right:4px">Color:</span>' +
    GCOLS.map(c => `<div class="cdot${c===goalColor?' sel':''}" style="background:${c}" data-c="${c}" onclick="pickGoalColor('${c}',this)"></div>`).join('');
}
function closeGoalModal() { document.getElementById('gmodal').classList.remove('open'); }
function pickGoalColor(c, el) {
  goalColor = c;
  document.querySelectorAll('.cdot').forEach(d => d.classList.remove('sel'));
  el.classList.add('sel');
}
async function submitGoal() {
  const name     = document.getElementById('gname').value.trim();
  const target   = parseFloat(document.getElementById('gtarget').value);
  const deadline = document.getElementById('gdl').value.trim() || 'Dec 2027';
  if (!name || !target) { toast('Please fill name and target.','error','❗'); return; }
  await api('POST','/api/goals',{ name, target, deadline, color: goalColor });
  closeGoalModal();
  toast(`"${name}" goal created!`,'success','🎯');
  document.getElementById('gname').value=''; document.getElementById('gtarget').value=''; document.getElementById('gdl').value='';
  renderPage();
}

// ══════════════════════════════════════════════
// SVG CHARTS
// ══════════════════════════════════════════════
function barChart() {
  const max = Math.max(...CHART_DATA.map(d => Math.max(d.income,d.expenses)));
  const H = 165;
  return `<div class="barchart">` +
    CHART_DATA.map(d => {
      const ih = Math.round((d.income/max)*H);
      const eh = Math.round((d.expenses/max)*H);
      return `<div class="bgrp">
        <div class="bpair">
          <div class="bar" style="height:${ih}px;background:#6366f1" title="Income: ${fmt(d.income)}"></div>
          <div class="bar" style="height:${eh}px;background:#f43f5e" title="Expenses: ${fmt(d.expenses)}"></div>
        </div>
        <div class="blbl">${d.month}</div>
      </div>`;
    }).join('') +
  `</div><div class="chlegend">
    <div class="chl"><div class="chdot2" style="background:#6366f1"></div>Income</div>
    <div class="chl"><div class="chdot2" style="background:#f43f5e"></div>Expenses</div>
  </div>`;
}

function areaChart() {
  const W=520,H=200,PX=40,PY=20;
  const areaData = CHART_DATA.map(d => ({...d, savings: d.income-d.expenses}));
  const maxV = Math.max(...areaData.map(d => d.income));
  const coords = (key) => areaData.map((d,i) => ({
    x: PX + (i/(areaData.length-1))*(W-2*PX),
    y: H-PY - (d[key]/maxV)*(H-PY-PY)
  }));
  const line = pts => pts.map((p,i) => `${i?'L':'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = (pts) => `${line(pts)} L${pts[pts.length-1].x},${H-PY} L${pts[0].x},${H-PY} Z`;
  const [iP,eP,sP] = ['income','expenses','savings'].map(coords);
  const lbls = areaData.map((d,i) => `<text x="${(PX+(i/(areaData.length-1))*(W-2*PX)).toFixed(1)}" y="${H-6}" text-anchor="middle" font-size="11" fill="var(--txt2)">${d.month}</text>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6366f1" stop-opacity=".35"/><stop offset="100%" stop-color="#6366f1" stop-opacity="0"/></linearGradient>
      <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#f43f5e" stop-opacity=".35"/><stop offset="100%" stop-color="#f43f5e" stop-opacity="0"/></linearGradient>
      <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#10b981" stop-opacity=".35"/><stop offset="100%" stop-color="#10b981" stop-opacity="0"/></linearGradient>
    </defs>
    <path d="${area(iP)}" fill="url(#gi)"/>
    <path d="${area(eP)}" fill="url(#ge)"/>
    <path d="${area(sP)}" fill="url(#gs)"/>
    <path d="${line(iP)}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="${line(eP)}" fill="none" stroke="#f43f5e" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="${line(sP)}" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linejoin="round"/>
    ${iP.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="#6366f1"/>`).join('')}
    ${eP.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="#f43f5e"/>`).join('')}
    ${sP.map(p=>`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="#10b981"/>`).join('')}
    ${lbls}
  </svg>
  <div class="chlegend">
    <div class="chl"><div class="chdot2" style="background:#6366f1"></div>Income</div>
    <div class="chl"><div class="chdot2" style="background:#f43f5e"></div>Expenses</div>
    <div class="chl"><div class="chdot2" style="background:#10b981"></div>Savings</div>
  </div>`;
}

function pieChart(data) {
  const total = data.reduce((s,d)=>s+d.v,0);
  let angle = -Math.PI/2, cx=90, cy=90, r=78, ri=38;
  const paths = data.map((d,i) => {
    const slice = (d.v/total)*Math.PI*2;
    const x1=cx+ri*Math.cos(angle), y1=cy+ri*Math.sin(angle);
    const x2=cx+r*Math.cos(angle),  y2=cy+r*Math.sin(angle);
    angle += slice;
    const x3=cx+r*Math.cos(angle),  y3=cy+r*Math.sin(angle);
    const x4=cx+ri*Math.cos(angle), y4=cy+ri*Math.sin(angle);
    const lg = slice>Math.PI?1:0;
    return `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)} A${r},${r} 0 ${lg},1 ${x3.toFixed(1)},${y3.toFixed(1)} L${x4.toFixed(1)},${y4.toFixed(1)} A${ri},${ri} 0 ${lg},0 ${x1.toFixed(1)},${y1.toFixed(1)} Z" fill="${PIE_COLORS[i%PIE_COLORS.length]}" stroke="var(--bg2)" stroke-width="2"><title>${d.n}: ${fmt(d.v)}</title></path>`;
  }).join('');
  const legend = data.map((d,i)=>`<div class="plrow"><div class="pldot" style="background:${PIE_COLORS[i%PIE_COLORS.length]}"></div><span class="plname">${d.n}</span><span class="plval">${fmt(d.v)}</span></div>`).join('');
  return `<div class="pie-area"><svg viewBox="0 0 180 180" style="width:170px;height:170px;flex-shrink:0">${paths}</svg><div class="pileg">${legend}</div></div>`;
}

function progBar(name, current, target, color, icon='', extra='') {
  const pct = Math.min(100,Math.round((current/target)*100));
  const over = current > target;
  return `<div class="prow">
    <div class="phead">
      <span class="pname">${icon?icon+' ':''}${name}${over?'<span class="obadge">OVER</span>':''}</span>
      <span class="ppct" style="color:${over?'#f43f5e':color}">${pct}%</span>
    </div>
    <div class="ptrack"><div class="pfill" style="width:${pct}%;background:${over?'#f43f5e':color}"></div></div>
    <div class="psub"><span>${fmt(current)} / ${fmt(target)}</span>${over?`<span style="color:var(--ros)">${fmt(current-target)} over</span>`:''}</div>
  </div>`;
}

function txRow(t, del=false) {
  const inc = t.type==='income';
  return `<div class="txrow">
    <div class="txic">${t.icon||'💸'}</div>
    <div style="flex:1;min-width:0">
      <div class="txdesc">${t.desc}</div>
      <div class="txcat">${t.cat}${t.upi?'<span class="upi-tag">UPI</span>':''}</div>
    </div>
    <span class="txdate">${fmtDate(t.date)}</span>
    <span class="txamt ${inc?'ain':'aout'}">${inc?'+':'-'}${fmt(t.amt)}</span>
    ${del?`<button class="delbtn" onclick="delTxn('${t.id}')">✕</button>`:'<div style="width:24px"></div>'}
  </div>`;
}

// ══════════════════════════════════════════════
// PAGE RENDERERS
// ══════════════════════════════════════════════
async function renderPage() {
  const el = document.getElementById('content');
  el.innerHTML = `<div class="page loading"><div class="lspin"></div> Loading...</div>`;
  try {
    const html = await getPageHTML(currentPage);
    el.innerHTML = `<div class="page">${html}</div>`;
    afterRender(currentPage);
  } catch(e) {
    // If session error → already handled by api() → shows login
    // If other error → show retry button instead of scary message
    if (document.getElementById('login-page').style.display !== 'flex') {
      el.innerHTML = `<div class="page">
        <div class="card" style="text-align:center;padding:40px">
          <div style="font-size:48px;margin-bottom:16px">⚠️</div>
          <div style="font-size:16px;font-weight:800;color:var(--txt);margin-bottom:8px">Session Expired</div>
          <div style="font-size:13px;color:var(--txt2);margin-bottom:24px">Your session has expired. Please sign in again.</div>
          <button onclick="forceLogout()" style="padding:12px 28px;border-radius:13px;border:none;background:linear-gradient(135deg,var(--ind),var(--pur));color:#fff;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 4px 18px rgba(99,102,241,.35)">
            🔐 Sign In Again
          </button>
        </div>
      </div>`;
    }
  }
}

async function getPageHTML(pg) {
  const hr = new Date().getHours();
  const greet = hr<12?'Morning':hr<17?'Afternoon':'Evening';

  // ── DASHBOARD
  if (pg === 'dashboard') {
    const [sum, txns, bills, goals] = await Promise.all([
      api('GET','/api/summary'),
      api('GET','/api/transactions'),
      api('GET','/api/bills'),
      api('GET','/api/goals'),
    ]);
    const unpaid = bills.filter(b=>!b.paid).length;
    const pieDat = [
      {n:'Rent',v:12000},{n:'Invest',v:8000},{n:'Shopping',v:6300},
      {n:'Food',v:2210},{n:'Health',v:2650},{n:'Utilities',v:2799}
    ];
    return `
    <div class="banner shimmer">
      <div class="ban-main">
        <div class="sub">Good ${greet}, ${currentUser?.name||'User'}! 👋</div>
        <h2>You saved ${sum.savingsRate}% this month 💪</h2>
        <p>Net balance: ${fmtK(sum.balance)} · ${sum.txnCount} transactions</p>
      </div>
      <div class="ban-score"><div class="sl">Spending Score</div><div class="sv">74</div><div class="sl">/100</div></div>
    </div>
    <div class="g4">
      <div class="sc gi" onclick="goPage('accounts')"><div class="blob b1"></div><div class="blob b2"></div><div class="sc-icon">💰</div><div class="sc-title">Balance</div><div class="sc-val">${fmtK(sum.balance)}</div><div class="sc-chg">▲ 12.4% vs last month</div></div>
      <div class="sc ge"><div class="blob b1"></div><div class="blob b2"></div><div class="sc-icon">📈</div><div class="sc-title">Income</div><div class="sc-val">${fmtK(sum.income)}</div><div class="sc-chg">▲ 26.3% vs last month</div></div>
      <div class="sc gr"><div class="blob b1"></div><div class="blob b2"></div><div class="sc-icon">💸</div><div class="sc-title">Expenses</div><div class="sc-val">${fmtK(sum.expense)}</div><div class="sc-chg">▼ 8.2% vs last month</div></div>
      <div class="sc ga"><div class="blob b1"></div><div class="blob b2"></div><div class="sc-icon">🎯</div><div class="sc-title">Savings</div><div class="sc-val">${sum.savingsRate}%</div><div class="sc-chg">▲ 4.1% vs last month</div></div>
    </div>
    <div class="g3">
      <div class="card"><div class="stitle">Income vs Expenses</div><div class="ssub">Last 6 months</div>${barChart()}</div>
      <div class="card"><div class="stitle">Spending Breakdown</div><div class="ssub">This month</div>${pieChart(pieDat)}</div>
    </div>
    <div class="g3b">
      <div class="card"><div class="fb" style="margin-bottom:12px"><div class="stitle">Recent Transactions</div><button class="lnk" onclick="goPage('transactions')">View All →</button></div>${txns.slice(0,6).map(t=>txRow(t,false)).join('')}</div>
      <div style="display:flex;flex-direction:column;gap:14px">
        <div class="card"><div class="fb" style="margin-bottom:12px"><div class="stitle">Savings Goals</div><button class="lnk" onclick="goPage('goals')">Manage →</button></div>${goals.map(g=>progBar(g.name,g.current,g.target,g.color)).join('')}</div>
        <div class="aibanner">🤖 <strong>AI Insight:</strong> At this savings rate you will reach your Emergency Fund in ~4 months! Consider auto-investing the surplus. <br><button class="lnk" onclick="goPage('ai-chat')" style="margin-top:4px;display:inline-block">Chat with AI →</button></div>
      </div>
    </div>`;
  }

  // ── TRANSACTIONS
  if (pg === 'transactions') {
    const txns = await api('GET','/api/transactions');
    return `<div class="card">
      <div class="sbar">
        <div class="sw"><span>🔍</span><input id="srch" class="fc" placeholder="Search..." oninput="filterTxns()" style="padding-left:36px"/></div>
        <select id="catf" class="fc" onchange="filterTxns()" style="width:auto"><option value="All">All Categories</option>${CATS.map(c=>`<option>${c}</option>`).join('')}</select>
        <select id="typef" class="fc" onchange="filterTxns()" style="width:auto"><option value="all">All Types</option><option value="income">Income</option><option value="expense">Expense</option></select>
        <button class="hb green" onclick="exportCSV()">📤 Export</button>
        <span id="txcount" style="font-size:12px;color:var(--txt2);align-self:center;white-space:nowrap">${txns.length} results</span>
      </div>
      <div id="txlist">${txns.map(t=>txRow(t,true)).join('')}</div>
    </div>`;
  }

  // ── BUDGET
  if (pg === 'budget') {
    const budgets = await api('GET','/api/budgets');
    const totB = budgets.reduce((s,b)=>s+b.budget,0);
    const totS = budgets.reduce((s,b)=>s+b.spent,0);
    return `
    <div class="srow3">
      <div class="ms" style="background:rgba(99,102,241,.08)"><div class="msv" style="color:var(--ind)">${fmt(totB)}</div><div class="msl">Total Budget</div></div>
      <div class="ms" style="background:rgba(244,63,94,.08)"><div class="msv" style="color:var(--ros)">${fmt(totS)}</div><div class="msl">Total Spent</div></div>
      <div class="ms" style="background:rgba(16,185,129,.08)"><div class="msv" style="color:var(--eme)">${fmt(totB-totS)}</div><div class="msl">Remaining</div></div>
    </div>
    <div class="card">
      <div class="stitle" style="margin-bottom:18px">Monthly Budget Tracker</div>
      ${budgets.map(b=>`
        <div class="prow" id="brow-${b.id}">
          <div class="phead">
            <span class="pname">${b.icon} ${b.cat}${b.spent>b.budget?'<span class="obadge">OVER</span>':''}</span>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:12px;color:${b.spent>b.budget?'var(--ros)':'var(--txt2)'}">${fmt(b.spent)} / <span id="blimit-${b.id}">${fmt(b.budget)}</span></span>
              <button onclick="editBudget('${b.id}','${b.cat}',${b.budget})" style="background:none;border:none;cursor:pointer;font-size:13px" title="Edit">✏️</button>
            </div>
          </div>
          <div class="ptrack"><div class="pfill" style="width:${Math.min(100,Math.round(b.spent/b.budget*100))}%;background:${b.spent>b.budget?'#ef4444':b.color}"></div></div>
          <div class="psub"><span>${Math.min(100,Math.round(b.spent/b.budget*100))}% used</span>${b.spent>b.budget?`<span style="color:var(--ros)">${fmt(b.spent-b.budget)} over</span>`:''}</div>
        </div>`).join('')}
    </div>`;
  }

  // ── BILLS
  if (pg === 'bills') {
    const bills = await api('GET','/api/bills');
    const unpaid = bills.filter(b=>!b.paid);
    const paid   = bills.filter(b=>b.paid);
    const due    = unpaid.reduce((s,b)=>s+b.amt,0);
    return `
    <div class="srow3">
      <div class="ms" style="background:rgba(244,63,94,.08)"><div class="msv" style="color:var(--ros)">${unpaid.length}</div><div class="msl">Unpaid Bills</div></div>
      <div class="ms" style="background:rgba(16,185,129,.08)"><div class="msv" style="color:var(--eme)">${paid.length}</div><div class="msl">Paid Bills</div></div>
      <div class="ms" style="background:rgba(245,158,11,.08)"><div class="msv" style="color:var(--amb);font-size:17px">${fmt(due)}</div><div class="msl">Amount Due</div></div>
    </div>
    <div class="card">
      <div class="stitle" style="margin-bottom:4px">Recurring Bills</div>
      <div class="ssub">Sorted by due date</div>
      <div id="billslist">${renderBillItems(bills)}</div>
      <button class="dbtn" onclick="toast('Add bill: use the API POST /api/bills','info','🧾')">+ Add New Bill</button>
    </div>`;
  }

  // ── ANALYTICS
  if (pg === 'analytics') {
    const txns = await api('GET','/api/transactions');
    const exp = txns.filter(t=>t.type==='expense').reduce((s,t)=>s+Math.abs(t.amt),0);
    const bal = txns.filter(t=>t.type==='income').reduce((s,t)=>s+t.amt,0) - exp;
    const pieDat = [
      {n:'Rent',v:12000},{n:'Invest',v:8000},{n:'Shopping',v:6300},
      {n:'Food',v:2210},{n:'Health',v:2650},{n:'Utilities',v:2799},{n:'Transport',v:820}
    ];
    return `
    <div class="card" style="margin-bottom:14px"><div class="stitle">Savings Trend</div><div class="ssub">Income vs Expenses vs Savings — 6 months</div>${areaChart()}</div>
    <div class="g2b">
      <div class="card"><div class="stitle" style="margin-bottom:14px">Category Distribution</div>${pieChart(pieDat)}</div>
      <div class="card"><div class="stitle" style="margin-bottom:14px">Key Statistics</div>
        ${[['📅','Avg. Daily Spend',fmt(exp/30)],['📱','UPI Transactions',txns.filter(t=>t.upi).length+' entries'],['🏠','Largest Expense','Rent (₹12,000)'],['🏦','Net Savings',fmt(bal)],['📋','Total Records',txns.length+' transactions'],].map(([ic,l,v])=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:12px;background:var(--bg3);margin-bottom:8px">
            <span style="font-size:12px;color:var(--txt2)">${ic} ${l}</span>
            <span style="font-size:12px;font-weight:800;color:var(--txt)">${v}</span>
          </div>`).join('')}
      </div>
    </div>`;
  }

  // ── ACCOUNTS
  if (pg === 'accounts') {
    const total = ACCOUNTS.reduce((s,a)=>s+a.bal,0);
    return `
    <div class="g2" style="margin-bottom:14px">
      ${ACCOUNTS.map(a=>`<div class="ac" style="background:${a.grad}">
        <div class="blob" style="width:90px;height:90px;top:-25px;right:-25px"></div>
        <div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:26px">${a.ic}</span><span class="acnum">${a.num}</span></div>
        <div class="acname">${a.name}</div><div class="acbal">${fmt(a.bal)}</div>
      </div>`).join('')}
    </div>
    <div class="card">
      <div class="fb" style="margin-bottom:16px"><div class="stitle">Net Worth Breakdown</div><div style="font-size:18px;font-weight:900;color:var(--ind)">${fmt(total)}</div></div>
      ${ACCOUNTS.map(a=>{const p=Math.round(a.bal/total*100);return `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          <span style="font-size:20px;flex-shrink:0">${a.ic}</span>
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
              <span style="color:var(--txt2)">${a.name}</span><span style="font-weight:800">${fmt(a.bal)}</span>
            </div>
            <div style="height:7px;background:var(--bg3);border-radius:20px;overflow:hidden">
              <div style="height:100%;width:${p}%;background:var(--ind);border-radius:20px;transition:.8s"></div>
            </div>
          </div>
          <span style="font-size:11px;color:var(--txt2);flex-shrink:0">${p}%</span>
        </div>`;}).join('')}
      <button class="dbtn" onclick="toast('Connect via Open Banking API (Plaid/Razorpay)','info','🔗')">+ Link New Account</button>
    </div>`;
  }

  // ── GOALS
  if (pg === 'goals') {
    const goals = await api('GET','/api/goals');
    return `
    <div class="g2" id="ggoals">
      ${goals.map(g=>{const p=Math.min(100,Math.round(g.current/g.target*100));return `
        <div class="gcrd">
          <div class="fb" style="margin-bottom:10px">
            <div class="stitle">${g.name}</div>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:18px;font-weight:900;color:${g.color}">${p}%</span>
              <button onclick="delGoal('${g.id}')" style="background:none;border:none;cursor:pointer;color:var(--txt3);font-size:12px" title="Delete">🗑️</button>
            </div>
          </div>
          <div class="ptrack" style="height:10px;margin-bottom:10px"><div class="pfill" style="width:${p}%;background:${g.color};height:10px"></div></div>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--txt2)">
            <span>Saved: <strong style="color:var(--txt)">${fmt(g.current)}</strong></span>
            <span>Target: <strong style="color:var(--txt)">${fmt(g.target)}</strong></span>
          </div>
          <p style="font-size:11px;color:var(--txt3);margin-top:6px">${fmt(g.target-g.current)} remaining · ${g.deadline}</p>
        </div>`}).join('')}
      <div class="gcrd" style="background:linear-gradient(135deg,var(--ind),var(--pur));color:#fff;display:flex;flex-direction:column;justify-content:space-between;min-height:150px">
        <div><div style="font-weight:800;margin-bottom:4px">🎯 New Goal</div><div style="font-size:12px;opacity:.75">Set your next savings target</div></div>
        <button onclick="openGoalModal()" style="background:rgba(255,255,255,.2);border:none;color:#fff;padding:9px 18px;border-radius:12px;font-weight:700;font-size:13px;cursor:pointer;align-self:flex-start">+ Create Goal</button>
      </div>
    </div>`;
  }

  // ── AI INSIGHTS
  if (pg === 'ai-insights') {
    const sevMap = {
      w:{c:'#f59e0b',bg:'rgba(245,158,11,.08)',l:'Alert'},
      t:{c:'var(--ind)',bg:'rgba(99,102,241,.08)',l:'Tip'},
      s:{c:'var(--eme)',bg:'rgba(16,185,129,.08)',l:'Good'},
    };
    return `
    <div class="banner shimmer" style="margin-bottom:16px">
      <div style="width:50px;height:50px;background:rgba(255,255,255,.2);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0">🤖</div>
      <div class="ban-main"><h2 style="font-size:18px">AI Financial Advisor</h2><p>Personalized insights for your July 2026 patterns</p></div>
      <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.2);padding:6px 14px;border-radius:20px;flex-shrink:0">
        <div style="width:8px;height:8px;background:#86efac;border-radius:50%" class="pulse"></div>
        <span style="font-size:12px;font-weight:700">Live Analysis</span>
      </div>
    </div>
    <div class="g2" style="margin-bottom:14px">
      ${AI_INSIGHTS.map(i=>{const s=sevMap[i.sev];return `<div class="ins" style="border-left-color:${s.c};background:${s.bg}">
        <div class="ins-head"><span style="font-size:20px">${i.icon}</span><span class="ins-t">${i.title}</span><span class="ins-badge" style="background:${s.bg};color:${s.c}">${s.l}</span></div>
        <div class="ins-m">${i.msg}</div>
      </div>`;}).join('')}
    </div>
    <div class="card">
      <div class="stitle" style="margin-bottom:14px">🧮 AI Monthly Score</div>
      <div class="g4" style="margin-bottom:14px">
        ${[['⭐','Spending Score','74/100','#f59e0b'],['💚','Savings Health','Good','#10b981'],['⚠️','Budget Alerts','2','#f43f5e'],['💡','AI Tips','5','#6366f1']].map(([e,l,v,c])=>`
          <div style="background:var(--bg3);border-radius:14px;padding:14px;text-align:center">
            <div style="font-size:26px;margin-bottom:4px">${e}</div>
            <div style="font-size:19px;font-weight:900;color:${c}">${v}</div>
            <div style="font-size:10px;color:var(--txt2);margin-top:2px">${l}</div>
          </div>`).join('')}
      </div>
      <button onclick="goPage('ai-chat')" class="sbtn">💬 Chat with AI Advisor →</button>
    </div>`;
  }

  // ── AI CHAT
  if (pg === 'ai-chat') {
    if (!chatMsgs.length) chatMsgs = [{role:'ai',text:'👋 Hello! I am your AI Financial Advisor.\nAsk me anything about your finances — spending, savings, budgets or bills!'}];
    return `<div class="chwrap">
      <div class="chhead">
        <div class="chava shimmer" style="font-size:22px">🤖</div>
        <div><div class="chname">AI Financial Advisor</div><div class="chst"><div class="chdot"></div>Online · Powered by SmartTracker AI</div></div>
      </div>
      <div class="chmsgs" id="chatmsgs">${renderChatMsgs()}</div>
      <div class="qchips">
        ${['How much did I spend on food?','What is my savings rate?','Show my budget status','When are my bills due?','Give me a monthly report'].map(q=>`<button class="chip" onclick="quickChat('${q}')">${q}</button>`).join('')}
      </div>
      <div class="chinrow">
        <input class="chin" id="chin" placeholder="Ask me anything about your finances... (Enter to send)" onkeydown="if(event.key==='Enter')sendChat()"/>
        <button class="csend" id="csend" onclick="sendChat()">▶</button>
      </div>
    </div>`;
  }

  // ── SETTINGS
  if (pg === 'settings') {
    const u = currentUser || {};
    return `<div style="max-width:520px">
      <div class="card" style="margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
          <div style="width:68px;height:68px;border-radius:20px;background:linear-gradient(135deg,#818cf8,var(--pur));display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:900">${(u.name||'U').slice(0,2).toUpperCase()}</div>
          <div>
            <div style="font-size:19px;font-weight:900;color:var(--txt)">${u.name||'User'}</div>
            <div style="font-size:12px;color:var(--txt2)">${u.email||''}</div>
            <span class="tag tagi" style="margin-top:5px;display:inline-block">${u.plan||'Free'} Plan ✨</span>
          </div>
        </div>
        <button class="dbtn" style="margin-top:0" onclick="toast('Profile editing coming soon!','info','✏️')">✏️ Edit Profile</button>
      </div>
      <div class="card" style="margin-bottom:14px">
        <div class="stitle" style="margin-bottom:14px">Appearance</div>
        <div class="setrow">
          <div><div class="setn">Dark Mode</div><div class="setd">Switch to dark theme</div></div>
          <button class="tog ${darkMode?'on':'off'}" id="dark-tog" onclick="toggleDark()"><div class="togk"></div></button>
        </div>
        <div class="setrow">
          <div><div class="setn">Currency</div><div class="setd">Indian Rupee (₹)</div></div>
          <span class="tag tagi">₹ INR</span>
        </div>
      </div>
      <div class="card" style="margin-bottom:14px">
        <div class="stitle" style="margin-bottom:14px">Data</div>
        <div class="setrow">
          <div><div class="setn">Export Transactions</div><div class="setd">Download all data as CSV</div></div>
          <button class="hb green" onclick="exportCSV()">📤 Export</button>
        </div>
        <div class="setrow">
          <div><div class="setn">API Status</div><div class="setd">Backend server connection</div></div>
          <span class="tag" style="background:rgba(16,185,129,.1);color:var(--eme)">🟢 Connected</span>
        </div>
      </div>
      <button onclick="doLogout()" style="width:100%;padding:14px;border-radius:14px;background:rgba(244,63,94,.08);color:var(--ros);border:1.5px solid rgba(244,63,94,.15);font-size:14px;font-weight:800;cursor:pointer;transition:.2s" onmouseover="this.style.background='rgba(244,63,94,.15)'" onmouseout="this.style.background='rgba(244,63,94,.08)'">⏏ Sign Out</button>
    </div>`;
  }

  return `<div class="card"><p style="color:var(--txt2)">Page not found.</p></div>`;
}

// ══════════════════════════════════════════════
// AFTER-RENDER HOOKS
// ══════════════════════════════════════════════
function afterRender(pg) {
  if (pg === 'ai-chat') {
    const msgs = document.getElementById('chatmsgs');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }
}

// ══════════════════════════════════════════════
// TRANSACTION ACTIONS
// ══════════════════════════════════════════════
async function delTxn(id) {
  if (!confirm('Delete this transaction?')) return;
  await api('DELETE', `/api/transactions/${id}`);
  toast('Transaction deleted.','warning','🗑️');
  renderPage();
}

function filterTxns() {
  const s   = document.getElementById('srch')?.value.toLowerCase() || '';
  const cf  = document.getElementById('catf')?.value || 'All';
  const tf  = document.getElementById('typef')?.value || 'all';
  api('GET',`/api/transactions?search=${encodeURIComponent(s)}&cat=${cf}&type=${tf}`).then(txns => {
    const el = document.getElementById('txlist');
    const ct = document.getElementById('txcount');
    if (el) el.innerHTML = txns.map(t=>txRow(t,true)).join('');
    if (ct) ct.textContent = `${txns.length} results`;
  });
}

// ══════════════════════════════════════════════
// BUDGET EDIT
// ══════════════════════════════════════════════
function editBudget(id, cat, current) {
  const newVal = prompt(`New budget limit for ${cat}:`, current);
  if (!newVal || isNaN(newVal)) return;
  api('PATCH',`/api/budgets/${id}`,{budget: parseFloat(newVal)}).then(()=>{
    toast(`Budget for ${cat} updated to ${fmt(+newVal)}!`,'success','✅');
    renderPage();
  });
}

// ══════════════════════════════════════════════
// BILLS
// ══════════════════════════════════════════════
function renderBillItems(bills) {
  return bills.slice().sort((a,b)=>a.dueDay-b.dueDay).map(b=>`
    <div class="bitem${b.paid?' paid':''}" id="bill-${b.id}">
      <span class="bic">${b.icon}</span>
      <div class="binfo">
        <div class="bname${b.paid?' paid':''}">${b.name}</div>
        <div class="bmeta">Due: ${b.dueDay}th every month · ${b.cat}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div class="bamt">${fmt(b.amt)}</div>
        <button class="bact ${b.paid?'bundo':'bmark'}" onclick="toggleBill('${b.id}',${!b.paid})">
          ${b.paid?'Mark Unpaid':'Mark Paid ✓'}
        </button>
      </div>
    </div>`).join('');
}

async function toggleBill(id, paid) {
  await api('PATCH',`/api/bills/${id}`,{paid});
  toast(paid ? 'Bill marked as paid ✓' : 'Bill marked unpaid','info', paid?'✅':'↩️');
  renderPage();
}

// ══════════════════════════════════════════════
// GOALS
// ══════════════════════════════════════════════
async function delGoal(id) {
  if (!confirm('Delete this goal?')) return;
  await api('DELETE',`/api/goals/${id}`);
  toast('Goal deleted.','warning','🗑️');
  renderPage();
}

// ══════════════════════════════════════════════
// AI CHAT
// ══════════════════════════════════════════════
function renderChatMsgs() {
  return chatMsgs.map(m => `
    <div class="cmsg${m.role==='user'?' u':''}">
      ${m.role==='ai'?'<div class="cava shimmer" style="font-size:14px">🤖</div>':''}
      <div class="bbl ${m.role==='ai'?'bai':'bu'}">${m.text}</div>
    </div>`).join('');
}

async function sendChat() {
  const inp = document.getElementById('chin');
  const btn = document.getElementById('csend');
  if (!inp || !inp.value.trim()) return;
  const msg = inp.value.trim();
  inp.value = '';
  chatMsgs.push({role:'user', text: msg});
  const el = document.getElementById('chatmsgs');
  if (el) { el.innerHTML = renderChatMsgs(); el.scrollTop = el.scrollHeight; }
  if (btn) btn.disabled = true;
  // Show typing dots
  if (el) {
    const typing = document.createElement('div');
    typing.id = 'typing';
    typing.className = 'cmsg';
    typing.innerHTML = '<div class="cava shimmer" style="font-size:14px">🤖</div><div class="tdots"><span></span><span></span><span></span></div>';
    el.appendChild(typing);
    el.scrollTop = el.scrollHeight;
  }
  try {
    const res = await api('POST','/api/ai/chat',{ message: msg });
    document.getElementById('typing')?.remove();
    chatMsgs.push({role:'ai', text: res.reply});
    if (el) { el.innerHTML = renderChatMsgs(); el.scrollTop = el.scrollHeight; }
  } catch(e) {
    document.getElementById('typing')?.remove();
  } finally {
    if (btn) btn.disabled = false;
  }
}

function quickChat(q) {
  const inp = document.getElementById('chin');
  if (inp) inp.value = q;
  sendChat();
}

// ══════════════════════════════════════════════
// APP INIT
// ══════════════════════════════════════════════
function initApp() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  document.getElementById('sava').textContent = (currentUser?.name||'U').slice(0,2).toUpperCase();
  document.getElementById('sun').textContent  = currentUser?.name || 'User';
  document.getElementById('pdate').textContent = new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  applyDark();
  // Build nav (load bill count for badge)
  api('GET','/api/bills').then(bills => {
    buildNav(bills.filter(b=>!b.paid).length);
  }).catch(()=> buildNav(0));
  goPage('dashboard');
}

// ── Auto-login: verify token with server first (handles server restarts)
window.addEventListener('DOMContentLoaded', async () => {
  applyDark();
  if (token && currentUser) {
    try {
      // Ping a protected endpoint to check if session is still valid
      await fetch('/api/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => {
        if (r.status === 401) throw new Error('expired');
      });
      initApp(); // token is valid — go to dashboard
    } catch {
      // Token invalid (server restarted) — clear and show login
      token = ''; currentUser = null;
      localStorage.removeItem('st_token');
      localStorage.removeItem('st_user');
      document.getElementById('login-page').style.display = 'flex';
    }
  } else {
    document.getElementById('login-page').style.display = 'flex';
  }
});
