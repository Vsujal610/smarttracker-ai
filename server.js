// ============================================================
// SMARTTRACKER AI - Express Backend Server
// ============================================================
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { v4: uuidv4 } = require('uuid');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── In-memory database (replace with MongoDB/PostgreSQL for production)
let db = {
  users: [
    { id: 'u1', name: 'Vsuja', email: 'vsuja@email.com', password: '1234', plan: 'Premium' }
  ],
  transactions: [
    { id:'t1',  userId:'u1', cat:'Food',          desc:'Zomato Order',        amt:-450,   date:'2026-07-07', type:'expense', upi:true,  icon:'🍕', note:'' },
    { id:'t2',  userId:'u1', cat:'Salary',        desc:'July Salary',         amt:85000,  date:'2026-07-01', type:'income',  upi:false, icon:'💼', note:'Main job' },
    { id:'t3',  userId:'u1', cat:'Transport',     desc:'Ola Cab',             amt:-320,   date:'2026-07-06', type:'expense', upi:true,  icon:'🚕', note:'' },
    { id:'t4',  userId:'u1', cat:'Shopping',      desc:'Amazon Purchase',     amt:-2800,  date:'2026-07-05', type:'expense', upi:true,  icon:'🛍️', note:'Laptop bag' },
    { id:'t5',  userId:'u1', cat:'Freelance',     desc:'Client Payment',      amt:15000,  date:'2026-07-04', type:'income',  upi:true,  icon:'💻', note:'Website project' },
    { id:'t6',  userId:'u1', cat:'Food',          desc:'Swiggy Breakfast',    amt:-180,   date:'2026-07-04', type:'expense', upi:true,  icon:'🍳', note:'' },
    { id:'t7',  userId:'u1', cat:'Healthcare',    desc:'Apollo Pharmacy',     amt:-650,   date:'2026-07-03', type:'expense', upi:true,  icon:'💊', note:'' },
    { id:'t8',  userId:'u1', cat:'Entertainment', desc:'Netflix',             amt:-499,   date:'2026-07-02', type:'expense', upi:false, icon:'🎬', note:'Monthly sub' },
    { id:'t9',  userId:'u1', cat:'Investment',    desc:'Zerodha SIP',         amt:-5000,  date:'2026-07-02', type:'expense', upi:false, icon:'📈', note:'NIFTY 50' },
    { id:'t10', userId:'u1', cat:'Food',          desc:'BigBasket Groceries', amt:-1200,  date:'2026-07-01', type:'expense', upi:true,  icon:'🛒', note:'' },
    { id:'t11', userId:'u1', cat:'Rent',          desc:'House Rent',          amt:-12000, date:'2026-07-01', type:'expense', upi:false, icon:'🏠', note:'2BHK' },
    { id:'t12', userId:'u1', cat:'Bonus',         desc:'Performance Bonus',   amt:10000,  date:'2026-06-30', type:'income',  upi:false, icon:'🎁', note:'Q2 bonus' },
    { id:'t13', userId:'u1', cat:'Transport',     desc:'Metro Card Recharge', amt:-500,   date:'2026-06-29', type:'expense', upi:true,  icon:'🚇', note:'' },
    { id:'t14', userId:'u1', cat:'Shopping',      desc:'Myntra Sale',         amt:-3500,  date:'2026-06-28', type:'expense', upi:true,  icon:'👗', note:'Summer sale' },
    { id:'t15', userId:'u1', cat:'Utilities',     desc:'Electricity Bill',    amt:-1800,  date:'2026-06-27', type:'expense', upi:true,  icon:'⚡', note:'BESCOM' },
    { id:'t16', userId:'u1', cat:'Food',          desc:'Starbucks Coffee',    amt:-380,   date:'2026-06-25', type:'expense', upi:true,  icon:'☕', note:'' },
    { id:'t17', userId:'u1', cat:'Healthcare',    desc:'Gym Membership',      amt:-2000,  date:'2026-06-25', type:'expense', upi:false, icon:'💪', note:'Monthly' },
    { id:'t18', userId:'u1', cat:'Investment',    desc:'Gold ETF',            amt:-3000,  date:'2026-06-24', type:'expense', upi:false, icon:'🥇', note:'' },
    { id:'t19', userId:'u1', cat:'Utilities',     desc:'Broadband Bill',      amt:-999,   date:'2026-06-20', type:'expense', upi:true,  icon:'📡', note:'Jio Fiber' },
    { id:'t20', userId:'u1', cat:'Freelance',     desc:'Design Project',      amt:8000,   date:'2026-06-18', type:'income',  upi:true,  icon:'🎨', note:'Logo design' },
  ],
  bills: [
    { id:'b1', userId:'u1', name:'Netflix',        amt:499,   dueDay:2,  icon:'🎬', paid:true,  cat:'Entertainment' },
    { id:'b2', userId:'u1', name:'Jio Fiber',      amt:999,   dueDay:20, icon:'📡', paid:true,  cat:'Utilities'     },
    { id:'b3', userId:'u1', name:'Gym Membership', amt:2000,  dueDay:25, icon:'💪', paid:true,  cat:'Healthcare'    },
    { id:'b4', userId:'u1', name:'House Rent',     amt:12000, dueDay:1,  icon:'🏠', paid:true,  cat:'Rent'          },
    { id:'b5', userId:'u1', name:'Amazon Prime',   amt:299,   dueDay:14, icon:'📦', paid:false, cat:'Entertainment' },
    { id:'b6', userId:'u1', name:'Zerodha SIP',    amt:5000,  dueDay:5,  icon:'📈', paid:false, cat:'Investment'    },
    { id:'b7', userId:'u1', name:'Car Insurance',  amt:4200,  dueDay:28, icon:'🚗', paid:false, cat:'Insurance'     },
  ],
  budgets: [
    { id:'bg1', userId:'u1', cat:'Food',          budget:5000, spent:2210, color:'#f59e0b', icon:'🍕' },
    { id:'bg2', userId:'u1', cat:'Shopping',      budget:5000, spent:6300, color:'#ef4444', icon:'🛍️' },
    { id:'bg3', userId:'u1', cat:'Transport',     budget:2000, spent:820,  color:'#10b981', icon:'🚕' },
    { id:'bg4', userId:'u1', cat:'Entertainment', budget:1500, spent:499,  color:'#8b5cf6', icon:'🎬' },
    { id:'bg5', userId:'u1', cat:'Healthcare',    budget:3000, spent:2650, color:'#06b6d4', icon:'💊' },
    { id:'bg6', userId:'u1', cat:'Utilities',     budget:3500, spent:2799, color:'#6366f1', icon:'⚡' },
  ],
  goals: [
    { id:'g1', userId:'u1', name:'Emergency Fund', current:45000, target:100000, color:'#6366f1', deadline:'Dec 2026' },
    { id:'g2', userId:'u1', name:'Vacation 2026',  current:18000, target:50000,  color:'#06b6d4', deadline:'Oct 2026' },
    { id:'g3', userId:'u1', name:'New Laptop',     current:30000, target:60000,  color:'#8b5cf6', deadline:'Aug 2026' },
  ]
};

// Simple session tokens (use JWT in production)
const sessions = {};

// ── AUTH: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'User not found' });
  // In demo, any password works. In production: bcrypt.compare(password, user.password)
  const token = uuidv4();
  sessions[token] = user.id;
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } });
});

// ── AUTH: Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (db.users.find(u => u.email === email))
    return res.status(400).json({ error: 'Email already exists' });
  const user = { id: uuidv4(), name, email, password, plan: 'Free' };
  db.users.push(user);
  const token = uuidv4();
  sessions[token] = user.id;
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, plan: user.plan } });
});

// ── Middleware: Auth check
function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !sessions[token]) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = sessions[token];
  next();
}

// ── TRANSACTIONS
app.get('/api/transactions', auth, (req, res) => {
  const { search, cat, type } = req.query;
  let data = db.transactions.filter(t => t.userId === req.userId);
  if (search) data = data.filter(t => t.desc.toLowerCase().includes(search.toLowerCase()) || t.cat.toLowerCase().includes(search.toLowerCase()));
  if (cat && cat !== 'All') data = data.filter(t => t.cat === cat);
  if (type && type !== 'all') data = data.filter(t => t.type === type);
  res.json(data);
});

app.post('/api/transactions', auth, (req, res) => {
  const t = { id: uuidv4(), userId: req.userId, ...req.body, date: new Date().toISOString().split('T')[0] };
  db.transactions.unshift(t);
  res.status(201).json(t);
});

app.delete('/api/transactions/:id', auth, (req, res) => {
  const idx = db.transactions.findIndex(t => t.id === req.params.id && t.userId === req.userId);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.transactions.splice(idx, 1);
  res.json({ success: true });
});

// ── BILLS
app.get('/api/bills', auth, (req, res) => {
  res.json(db.bills.filter(b => b.userId === req.userId));
});

app.patch('/api/bills/:id', auth, (req, res) => {
  const b = db.bills.find(b => b.id === req.params.id && b.userId === req.userId);
  if (!b) return res.status(404).json({ error: 'Not found' });
  Object.assign(b, req.body);
  res.json(b);
});

app.post('/api/bills', auth, (req, res) => {
  const b = { id: uuidv4(), userId: req.userId, ...req.body };
  db.bills.push(b);
  res.status(201).json(b);
});

// ── BUDGETS
app.get('/api/budgets', auth, (req, res) => {
  res.json(db.budgets.filter(b => b.userId === req.userId));
});

app.patch('/api/budgets/:id', auth, (req, res) => {
  const b = db.budgets.find(b => b.id === req.params.id && b.userId === req.userId);
  if (!b) return res.status(404).json({ error: 'Not found' });
  Object.assign(b, req.body);
  res.json(b);
});

// ── GOALS
app.get('/api/goals', auth, (req, res) => {
  res.json(db.goals.filter(g => g.userId === req.userId));
});

app.post('/api/goals', auth, (req, res) => {
  const g = { id: uuidv4(), userId: req.userId, current: 0, ...req.body };
  db.goals.push(g);
  res.status(201).json(g);
});

app.delete('/api/goals/:id', auth, (req, res) => {
  const idx = db.goals.findIndex(g => g.id === req.params.id && g.userId === req.userId);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.goals.splice(idx, 1);
  res.json({ success: true });
});

// ── DASHBOARD SUMMARY
app.get('/api/summary', auth, (req, res) => {
  const txns = db.transactions.filter(t => t.userId === req.userId);
  const income  = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amt, 0);
  const expense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amt), 0);
  res.json({ income, expense, balance: income - expense, savingsRate: ((( income - expense) / income) * 100).toFixed(1), txnCount: txns.length });
});

// ── AI CHAT
const aiReplies = {
  food:    '🍕 Food spending: ₹2,210 this month — 22% more than June.\nTop: BigBasket ₹1,200, Zomato ₹450, Swiggy ₹180.\n💡 Set a weekly food budget of ₹1,500 to save ₹500/month.',
  shop:    '🛍️ Shopping: ₹6,300 this month — ₹1,300 over budget!\nAmazon ₹2,800 + Myntra ₹3,500.\n💡 Try the 24-hour rule before buying.',
  save:    '💡 You can save ₹22,000 (20%) this month based on income ₹1,10,000.\nCurrently saving ₹85,701. Cancel unused subscriptions!',
  invest:  '📈 Invested ₹8,000 this month: SIP ₹5,000 + Gold ETF ₹3,000.\nAt 12% annual return your portfolio could reach ₹1.2L in 12 months!',
  balance: '💰 Total balance across all accounts: ₹1,67,001\n• Zerodha: ₹89,600\n• SBI: ₹45,231\n• HDFC: ₹28,750\n• Paytm: ₹3,420',
  report:  '📊 July 2026 Report:\n• Income: ₹1,10,000\n• Expenses: ₹24,299\n• Savings: ₹85,701 (77.9%)\nTop expense: Rent (49.4%). Great month! 🎉',
  budget:  '📋 Budget Status:\n✅ Food: 44% used\n❌ Shopping: 126% EXCEEDED!\n✅ Transport: 41%\n✅ Entertainment: 33%\n⚠️ Healthcare: 88% nearly full!',
  bills:   '🧾 Upcoming Bills:\n• Amazon Prime: ₹299 (14th)\n• Zerodha SIP: ₹5,000 (5th)\n• Car Insurance: ₹4,200 (28th)\nTotal: ₹9,499',
  hello:   '👋 Hello! I am your AI Financial Advisor.\nI can help with spending analysis, budgets, bills and savings tips.\nJust ask me anything!',
  help:    '💡 Try asking me:\n• How much did I spend on food?\n• What is my savings rate?\n• Show my budget status\n• When are my bills due?\n• Give me a monthly report\n• How much do I have invested?',
  default: '🤔 Based on your July data: Income ₹1,10,000 | Expenses ₹24,299 | Savings ₹85,701.\nType "help" to see what I can answer!'
};

app.post('/api/ai/chat', auth, (req, res) => {
  const msg = (req.body.message || '').toLowerCase();
  let reply = aiReplies.default;
  if (msg.includes('food') || msg.includes('eat') || msg.includes('zomato') || msg.includes('swiggy')) reply = aiReplies.food;
  else if (msg.includes('shop') || msg.includes('amazon') || msg.includes('myntra')) reply = aiReplies.shop;
  else if (msg.includes('save') || msg.includes('saving')) reply = aiReplies.save;
  else if (msg.includes('invest') || msg.includes('sip') || msg.includes('portfolio')) reply = aiReplies.invest;
  else if (msg.includes('balance') || msg.includes('account')) reply = aiReplies.balance;
  else if (msg.includes('report') || msg.includes('summary') || msg.includes('month')) reply = aiReplies.report;
  else if (msg.includes('budget') || msg.includes('limit')) reply = aiReplies.budget;
  else if (msg.includes('bill') || msg.includes('due') || msg.includes('upcoming')) reply = aiReplies.bills;
  else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) reply = aiReplies.hello;
  else if (msg.includes('help') || msg.includes('what can')) reply = aiReplies.help;

  // Simulate slight delay for realism
  setTimeout(() => res.json({ reply, timestamp: new Date().toISOString() }), 800 + Math.random() * 600);
});

// ── Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── START SERVER
app.listen(PORT, () => {
  const url = process.env.PORT ? `https://your-app.onrender.com` : `http://localhost:${PORT}`;
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║   💰 SmartTracker AI - Server Running    ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║   URL: ${url.padEnd(33)}║`);
  console.log('║   Press Ctrl+C to stop                   ║');
  console.log('╚══════════════════════════════════════════╝\n');
});
