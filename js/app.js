/* ================================================================
   个人空间 v5.0 — 半透明渐变 · 层次阴影 · 周月日历
   ================================================================ */

/* ========== 日夜模式 ========== */
const THEME_KEY = 'personal_site_theme';
const html = document.documentElement;

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return getSystemTheme();
}

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  const isDark = theme === 'dark';
  // Swap sun/moon SVG icon
  const icon = document.getElementById('themeIcon');
  if (icon) {
    icon.innerHTML = isDark
      ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
      : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  }
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.content = isDark ? '#06040A' : '#F8F6FA';
}

function toggleTheme() {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

applyTheme(getTheme());
document.getElementById('themeBtn').addEventListener('click', toggleTheme);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? 'dark' : 'light');
});

/* ========== 数据存储 ========== */
const storage = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
};

/* ========== 页面切换（记事 | 记账 | 资料） ========== */
const contents = document.querySelectorAll('.tab-content');

function switchTab(tabName) {
  contents.forEach(c => c.classList.remove('active'));
  document.getElementById('tab-' + tabName).classList.add('active');
  document.querySelectorAll('.bottom-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabName);
  });
  if (tabName === 'accounting') renderAccounting();
}

document.querySelectorAll('.bottom-tab').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

/* ========== Reduced Motion ========== */
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let prefersReducedMotion = motionQuery.matches;
motionQuery.addEventListener('change', e => { prefersReducedMotion = e.matches; });

/* ========== 工具 ========== */
function formatDate(iso) { if (!iso) return ''; const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function todayStr() { return new Date().toISOString().split('T')[0]; }
function escapeHtml(str) { if (!str) return ''; const div = document.createElement('div'); div.textContent = str; return div.innerHTML; }

function showToast(msg) {
  const existing = document.querySelector('.toast-msg'); if (existing) existing.remove();
  const toast = document.createElement('div'); toast.className = 'toast-msg'; toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity='0'; toast.style.transition='opacity .3s ease'; setTimeout(() => toast.remove(),300); }, 4000);
}

/* ================================================================
   一、个人资料模块
   ================================================================ */
const PROFILE_KEY = 'personal_site_profile';
const defaultProfile = { avatar:'👤',nickname:'你的昵称',qq:'',mbti:'',hobbies:[],goal:'' };
let profile = storage.get(PROFILE_KEY, defaultProfile);

function renderProfile() {
  document.getElementById('profileAvatar').textContent = profile.avatar;
  document.getElementById('headerAvatar').textContent = profile.avatar;
  document.getElementById('displayNickname').textContent = profile.nickname;
  document.getElementById('headerTitle').textContent = profile.nickname || '个人空间';
  document.getElementById('displayQq').textContent = profile.qq || '未填写';
  document.getElementById('displayGoal').textContent = profile.goal || '未填写';
  document.getElementById('displayMbti').textContent = profile.mbti || 'MBTI';
  document.getElementById('displayMbti').style.display = profile.mbti ? 'inline-block' : 'none';
  const hobbies = Array.isArray(profile.hobbies) ? profile.hobbies : [];
  document.getElementById('displayHobbies').innerHTML = hobbies.filter(Boolean).map(s => `<span class="tag">${s.trim()}</span>`).join('') || '<span class="tag">未填写</span>';
}

document.getElementById('editProfileBtn').addEventListener('click', () => {
  document.getElementById('editAvatar').value = profile.avatar;
  document.getElementById('editNickname').value = profile.nickname;
  document.getElementById('editQq').value = profile.qq;
  document.getElementById('editMbti').value = profile.mbti;
  document.getElementById('editHobbies').value = Array.isArray(profile.hobbies) ? profile.hobbies.join(', ') : '';
  document.getElementById('editGoal').value = profile.goal;
  document.getElementById('profileModal').classList.add('show');
});

function closeProfileModal() { document.getElementById('profileModal').classList.remove('show'); }
document.getElementById('closeProfileModal').addEventListener('click', closeProfileModal);
document.getElementById('cancelProfileBtn').addEventListener('click', closeProfileModal);
document.getElementById('profileModal').addEventListener('click', function(e) { if (e.target===this) closeProfileModal(); });

document.getElementById('saveProfileBtn').addEventListener('click', () => {
  profile.avatar = document.getElementById('editAvatar').value || '👤';
  profile.nickname = document.getElementById('editNickname').value || '未命名';
  profile.qq = document.getElementById('editQq').value;
  profile.mbti = document.getElementById('editMbti').value;
  profile.hobbies = document.getElementById('editHobbies').value.split(',').map(s=>s.trim()).filter(Boolean);
  profile.goal = document.getElementById('editGoal').value;
  storage.set(PROFILE_KEY, profile); renderProfile(); closeProfileModal();
});

/* ================================================================
   二、记事模块（原备忘录）
   ================================================================ */
const MEMO_KEY = 'personal_site_memos';
let memos = storage.get(MEMO_KEY, []);
let editingMemoId = null;
let memoColor = '#4f46e5';

function saveMemos() { storage.set(MEMO_KEY, memos); }

function renderMemos(filter='', category='all') {
  const grid = document.getElementById('memoGrid'), empty = document.getElementById('memoEmpty');
  let filtered = memos;
  if (category!=='all') filtered = filtered.filter(m => m.category===category);
  if (filter) { const kw=filter.toLowerCase(); filtered = filtered.filter(m => m.title.toLowerCase().includes(kw)||m.content.toLowerCase().includes(kw)); }
  filtered.sort((a,b) => (b.updatedAt||b.createdAt).localeCompare(a.updatedAt||a.createdAt));
  grid.querySelectorAll('.memo-card').forEach(c => c.remove());

  if (filtered.length===0) { empty.style.display='block'; }
  else {
    empty.style.display='none';
    filtered.forEach(m => {
      const card = document.createElement('div'); card.className='memo-card'; card.style.borderLeftColor=m.color||'#4f46e5';
      const hasReminder = m.reminder && new Date(m.reminder) > new Date();
      card.innerHTML=`<div class="memo-card-header"><span class="memo-card-category">${m.category||'其他'}</span>${hasReminder?'<span class="memo-reminder-badge" title="已设提醒">🔔</span>':''}</div>
        <div class="memo-card-title">${escapeHtml(m.title)||'无标题'}</div><div class="memo-card-content">${escapeHtml(m.content)}</div>
        <div class="memo-card-date">${formatDate(m.updatedAt||m.createdAt)}${hasReminder?' · ⏰ '+formatDateTime(m.reminder):''}</div>
        ${hasReminder?`<button class="btn btn-sm btn-calendar" onclick="event.stopPropagation();addToCalendar('${m.id}')">📅 加到日历</button>`:''}`;
      card.addEventListener('click',() => openMemoEditor(m.id)); grid.appendChild(card);
    });
  }
}

function openMemoEditor(id=null) {
  editingMemoId = id; const modal = document.getElementById('memoModal'), deleteBtn = document.getElementById('deleteMemoBtn');
  if (id) {
    const m = memos.find(x => x.id===id); if(!m) return;
    document.getElementById('memoTitle').value=m.title; document.getElementById('memoContent').value=m.content;
    document.getElementById('memoCategory').value=m.category||'其他'; document.getElementById('memoReminder').value=m.reminder||'';
    memoColor=m.color||'#4f46e5'; document.getElementById('memoModalTitle').textContent='编辑记事'; deleteBtn.style.display='inline-block';
  } else {
    document.getElementById('memoTitle').value=''; document.getElementById('memoContent').value='';
    document.getElementById('memoCategory').value='工作'; document.getElementById('memoReminder').value='';
    memoColor='#4f46e5'; document.getElementById('memoModalTitle').textContent='新建记事'; deleteBtn.style.display='none';
  }
  document.querySelectorAll('#memoColorPicker .color-dot').forEach(d => { d.classList.toggle('active', d.dataset.color===memoColor); });
  modal.classList.add('show');
}

function closeMemoModal() { document.getElementById('memoModal').classList.remove('show'); editingMemoId=null; }

document.getElementById('addMemoBtn').addEventListener('click',() => openMemoEditor());
document.getElementById('closeMemoModal').addEventListener('click',closeMemoModal);
document.getElementById('cancelMemoBtn').addEventListener('click',closeMemoModal);
document.getElementById('memoModal').addEventListener('click',function(e){ if(e.target===this) closeMemoModal(); });

document.querySelectorAll('#memoColorPicker .color-dot').forEach(dot => {
  dot.addEventListener('click',function(){
    document.querySelectorAll('#memoColorPicker .color-dot').forEach(d => d.classList.remove('active'));
    this.classList.add('active'); memoColor = this.dataset.color;
  });
});

document.getElementById('saveMemoBtn').addEventListener('click',() => {
  const title=document.getElementById('memoTitle').value.trim(), content=document.getElementById('memoContent').value.trim();
  const category=document.getElementById('memoCategory').value, reminder=document.getElementById('memoReminder').value;
  const now=new Date().toISOString(); if(!title&&!content) return;
  if(editingMemoId){ const m=memos.find(x=>x.id===editingMemoId); if(m){m.title=title;m.content=content;m.category=category;m.reminder=reminder;m.color=memoColor;m.updatedAt=now;} }
  else { memos.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),title,content,category,reminder,color:memoColor,createdAt:now,updatedAt:now}); }
  saveMemos(); closeMemoModal(); renderMemos(document.getElementById('memoSearch').value, document.getElementById('memoCategoryFilter').value);
});

document.getElementById('deleteMemoBtn').addEventListener('click',() => {
  if(!editingMemoId) return; if(!confirm('确定删除这条记事吗？')) return;
  memos=memos.filter(m=>m.id!==editingMemoId); saveMemos(); closeMemoModal();
  renderMemos(document.getElementById('memoSearch').value, document.getElementById('memoCategoryFilter').value);
});

document.getElementById('memoSearch').addEventListener('input',function(){ renderMemos(this.value, document.getElementById('memoCategoryFilter').value); });
document.getElementById('memoCategoryFilter').addEventListener('change',function(){ renderMemos(document.getElementById('memoSearch').value, this.value); });

/* ================================================================
   三、记账模块 + 可折叠日历 + SVG 折线图
   ================================================================ */
const ACCOUNT_KEY = 'personal_site_accounting';
let transactions = storage.get(ACCOUNT_KEY, []);
let editingTxId = null; let txType = 'expense';

function saveTransactions() { storage.set(ACCOUNT_KEY, transactions); }

/* ---------- 余额 ---------- */
function updateBalanceCards() {
  let totalIn=0,totalOut=0;
  transactions.forEach(t => { if(t.type==='income') totalIn+=t.amount; else totalOut+=t.amount; });
  document.getElementById('totalIncome').textContent='¥'+totalIn.toFixed(2);
  document.getElementById('totalExpense').textContent='¥'+totalOut.toFixed(2);
  document.getElementById('totalBalance').textContent='¥'+(totalIn-totalOut).toFixed(2);
}

function renderAccounting(){updateBalanceCards();populateMonthFilter();renderChart();applyTransactionFilters();}
function renderChart() {
  const svg = document.getElementById('spendingChart');
  const empty = document.getElementById('chartEmpty');
  const range = parseInt(document.getElementById('chartRange').value);

  const today = new Date(); today.setHours(23,59,59,999);
  const days = [];
  for (let i=range-1; i>=0; i--) {
    const d = new Date(today); d.setDate(d.getDate()-i);
    const dateStr = d.toISOString().split('T')[0];
    const total = transactions.filter(t => t.type==='expense' && t.date===dateStr).reduce((sum,t) => sum+t.amount, 0);
    days.push({ date:dateStr, day:d.getDate(), month:d.getMonth()+1, total });
  }

  const hasData = days.some(d => d.total>0);
  if (!hasData) { svg.innerHTML=''; empty.style.display='flex'; return; }
  empty.style.display='none';

  const maxAmount = Math.max(...days.map(d=>d.total), 1);
  const pad=32, top=18, bottom=34, right=10, w=600, h=220;
  const chartW=w-pad-right, chartH=h-top-bottom;

  let html = `<defs>
    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="var(--accent)" stop-opacity="0.02"/>
    </linearGradient>
  </defs>`;

  // Grid lines
  for (let i=0; i<=3; i++) {
    const y = top + (chartH/3)*i;
    html += `<line class="chart-grid-line" x1="${pad}" y1="${y}" x2="${pad+chartW}" y2="${y}"/>`;
    html += `<text class="chart-label" x="${pad-6}" y="${y+4}" text-anchor="end">¥${(maxAmount-(maxAmount/3)*i).toFixed(0)}</text>`;
  }

  // Data points
  const stepX = chartW / (days.length-1 || 1);
  const points = days.map((d,i) => {
    const x = pad + stepX*i;
    const y = top + chartH - (d.total/maxAmount)*chartH;
    return {x,y,...d};
  });

  // Area
  const areaPts = points.map(p=>`${p.x},${p.y}`).join(' ')+` ${points[points.length-1].x},${top+chartH} ${points[0].x},${top+chartH}`;
  html += `<polygon class="chart-area" points="${areaPts}"/>`;

  // Line
  html += `<polyline class="chart-line" points="${points.map(p=>`${p.x},${p.y}`).join(' ')}"/>`;

  // Dots + labels
  points.forEach((p,i) => {
    if (p.total>0) {
      html += `<circle class="chart-dot" cx="${p.x}" cy="${p.y}" r="4.5"/>`;
      html += `<text class="chart-tooltip" x="${p.x}" y="${p.y-11}" text-anchor="middle">¥${p.total.toFixed(0)}</text>`;
    }
    if (i%Math.ceil(days.length/7)===0 || i===days.length-1) {
      html += `<text class="chart-label" x="${p.x}" y="${h-6}" text-anchor="middle">${p.month}/${p.day}</text>`;
    }
  });

  svg.innerHTML = html;
}

document.getElementById('chartRange').addEventListener('change', renderChart);

/* ---------- 筛选 & 列表 ---------- */
function populateMonthFilter() {
  const sel = document.getElementById('monthFilter'), current = sel.value;
  const months = new Set(); transactions.forEach(t => { if(t.date) months.add(t.date.substring(0,7)); });
  sel.innerHTML='<option value="all">全部月份</option>';
  [...months].sort().reverse().forEach(m => { sel.innerHTML+=`<option value="${m}">${m}</option>`; });
  sel.value=current;
}

function applyTransactionFilters(filterDate=null) {
  const month=document.getElementById('monthFilter').value, type=document.getElementById('typeFilter').value;
  const category=document.getElementById('categoryFilter').value;
  let filtered=[...transactions];
  if(filterDate) filtered=filtered.filter(t=>t.date===filterDate);
  if(!filterDate&&month!=='all') filtered=filtered.filter(t=>t.date&&t.date.startsWith(month));
  if(type!=='all') filtered=filtered.filter(t=>t.type===type);
  if(category!=='all') filtered=filtered.filter(t=>t.category===category);
  filtered.sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt));

  const list=document.getElementById('transactionList'), empty=document.getElementById('transactionEmpty');
  list.querySelectorAll('.transaction-item').forEach(el=>el.remove());

  if(filtered.length===0){empty.style.display='block'}
  else{empty.style.display='none';
    filtered.forEach(t=>{
      const isIncome=t.type==='income', icon=isIncome?'📈':getCategoryIcon(t.category), sign=isIncome?'':'-';
      const item=document.createElement('div');item.className='transaction-item';
      item.innerHTML=`<div class="tx-icon ${t.type}">${icon}</div><div class="tx-info"><div class="tx-category">${t.category}</div><div class="tx-note">${escapeHtml(t.note||'')||'&nbsp;'}</div></div><div class="tx-date">${formatDate(t.date)}</div><div class="tx-amount ${t.type}">${sign}¥${t.amount.toFixed(2)}</div>`;
      item.addEventListener('click',()=>openTransactionEditor(t.id)); list.appendChild(item);
    });
  }
}

function getCategoryIcon(cat){ const map={'餐饮':'🍔','交通':'🚗','购物':'🛒','娱乐':'🎮','居住':'🏠','工资':'💼','兼职':'💡'}; return map[cat]||'💰'; }

document.getElementById('monthFilter').addEventListener('change',()=>applyTransactionFilters());
document.getElementById('typeFilter').addEventListener('change',()=>applyTransactionFilters());
document.getElementById('categoryFilter').addEventListener('change',()=>applyTransactionFilters());

/* ---------- 交易弹窗 ---------- */
document.getElementById('addTransactionBtn').addEventListener('click',()=>openTransactionEditor());
document.getElementById('closeTransactionModal').addEventListener('click',closeTransactionModal);
document.getElementById('cancelTransactionBtn').addEventListener('click',closeTransactionModal);
document.getElementById('transactionModal').addEventListener('click',function(e){if(e.target===this)closeTransactionModal();});

function openTransactionEditor(id=null){
  editingTxId=id;const deleteBtn=document.getElementById('deleteTransactionBtn');
  if(id){const t=transactions.find(x=>x.id===id);if(!t)return;txType=t.type;
    document.getElementById('transactionAmount').value=t.amount;document.getElementById('transactionCategory').value=t.category;
    document.getElementById('transactionDate').value=t.date;document.getElementById('transactionNote').value=t.note||'';
    document.getElementById('transactionModalTitle').textContent='编辑账单';deleteBtn.style.display='inline-block';}
  else{txType='expense';document.getElementById('transactionAmount').value='';document.getElementById('transactionCategory').value='餐饮';
    document.getElementById('transactionDate').value=todayStr();document.getElementById('transactionNote').value='';
    document.getElementById('transactionModalTitle').textContent='记一笔';deleteBtn.style.display='none';}
  document.querySelectorAll('.type-btn').forEach(b=>b.classList.toggle('active',b.dataset.type===txType));
  updateCategorySelect();document.getElementById('transactionModal').classList.add('show');
}

function updateCategorySelect(){const sel=document.getElementById('transactionCategory');
  if(txType==='income'){sel.innerHTML='<option value="工资">工资</option><option value="兼职">兼职</option><option value="其他收入">其他收入</option>';}
  else{sel.innerHTML='<option value="餐饮">餐饮</option><option value="交通">交通</option><option value="购物">购物</option><option value="娱乐">娱乐</option><option value="居住">居住</option><option value="其他支出">其他支出</option>';}}

function closeTransactionModal(){document.getElementById('transactionModal').classList.remove('show');editingTxId=null;}

document.querySelectorAll('.type-btn').forEach(btn=>{btn.addEventListener('click',function(){document.querySelectorAll('.type-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active');txType=this.dataset.type;updateCategorySelect();});});

document.getElementById('saveTransactionBtn').addEventListener('click',()=>{
  const amount=parseFloat(document.getElementById('transactionAmount').value),category=document.getElementById('transactionCategory').value;
  const date=document.getElementById('transactionDate').value||todayStr(),note=document.getElementById('transactionNote').value.trim();
  if(isNaN(amount)||amount<=0){alert('请输入有效金额');return;}const now=new Date().toISOString();
  if(editingTxId){const t=transactions.find(x=>x.id===editingTxId);if(t){t.type=txType;t.amount=amount;t.category=category;t.date=date;t.note=note;t.updatedAt=now;}}
  else{transactions.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),type:txType,amount,category,date,note,createdAt:now,updatedAt:now});}
  saveTransactions();closeTransactionModal();renderAccounting();
});

document.getElementById('deleteTransactionBtn').addEventListener('click',()=>{if(!editingTxId)return;if(!confirm('确定删除这条账单吗？'))return;transactions=transactions.filter(t=>t.id!==editingTxId);saveTransactions();closeTransactionModal();renderAccounting();});

/* ================================================================
   四、日历提醒 (.ics)
   ================================================================ */
function formatDateTime(iso){if(!iso)return'';const d=new Date(iso),pad=n=>String(n).padStart(2,'0');return`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;}
function toICSDate(iso){const d=new Date(iso),pad=n=>String(n).padStart(2,'0');return`${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;}

function addToCalendar(memoId){
  const m=memos.find(x=>x.id===memoId);if(!m||!m.reminder)return;const now=new Date();
  const dtStart=toICSDate(m.reminder),endDate=new Date(new Date(m.reminder).getTime()+30*60000),dtEnd=toICSDate(endDate.toISOString());
  const title=escapeICS(m.title||'记事提醒'),desc=escapeICS((m.content||'').replace(/\n/g,'\\n'));
  const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//个人空间//记事提醒//ZH','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',`UID:${memoId}@personal-space`,`DTSTART:${dtStart}`,`DTEND:${dtEnd}`,`DTSTAMP:${toICSDate(now.toISOString())}`,`SUMMARY:📝 ${title}`,`DESCRIPTION:${desc}`,`CATEGORIES:${escapeICS(m.category||'')}`,'BEGIN:VALARM','TRIGGER:-PT15M','ACTION:DISPLAY',`DESCRIPTION:🔔 ${title}`,'END:VALARM','END:VEVENT','END:VCALENDAR'].join('\r\n');
  const blob=new Blob([ics],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=(m.title||'记事提醒').replace(/[^一-龥\w]/g,'_')+'.ics';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
  if(/iPad|iPhone|iPod/.test(navigator.userAgent)){showToast('✅ 已下载日历文件\n点击文件 → 添加到日历 → iPhone 到时间自动弹通知');}
  else{showToast('✅ 日历文件已下载，双击打开即可添加到系统日历');}
}

function escapeICS(str){return str.replace(/[\\;,]/g,'\\$&').substring(0,500);}

/* ================================================================
   初始化
   ================================================================ */
function init(){renderProfile();renderMemos();renderAccounting();switchTab('memo');}
init();
