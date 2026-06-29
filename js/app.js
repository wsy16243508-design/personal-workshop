/* ========== 日夜模式切换 ========== */
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
  const icon = isDark ? '☀️' : '🌙';
  const label = isDark ? '日间模式' : '夜间模式';

  // 更新侧边栏按钮
  const sidebarBtn = document.getElementById('themeToggleSidebar');
  if (sidebarBtn) {
    sidebarBtn.querySelector('.theme-icon').textContent = icon;
    sidebarBtn.childNodes[1] && (sidebarBtn.childNodes[1].textContent = ' ' + label);
  }

  // 更新移动端按钮
  const mobileBtn = document.getElementById('themeToggleMobile');
  if (mobileBtn) { mobileBtn.textContent = icon; }

  // 更新 PWA 主题色
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.content = isDark ? '#09090F' : '#FAFAFA';
  }
}

function toggleTheme() {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

// 初始化主题
applyTheme(getTheme());

// 绑定切换按钮
document.getElementById('themeToggleSidebar').addEventListener('click', toggleTheme);
document.getElementById('themeToggleMobile').addEventListener('click', toggleTheme);

// 监听系统主题变化（用户未手动设置时跟随系统）
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem(THEME_KEY)) {
    applyTheme(e.matches ? 'dark' : 'light');
  }
});

/* ========== 数据存储 ========== */
const storage = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
};

/* ========== 页面切换 ========== */
const tabs = document.querySelectorAll('.nav-item');
const contents = document.querySelectorAll('.tab-content');

function switchTab(tabName) {
  tabs.forEach(b => b.classList.remove('active'));
  contents.forEach(c => c.classList.remove('active'));

  const targetTab = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
  if (targetTab) targetTab.classList.add('active');
  document.getElementById('tab-' + tabName).classList.add('active');

  // 同步底部导航栏
  document.querySelectorAll('.bottom-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabName);
  });

  if (tabName === 'accounting') renderAccounting();

  // 移动端：切换页面后关闭侧边栏
  if (window.innerWidth <= 768) closeMobileSidebar();
}

tabs.forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// 底部导航栏
document.querySelectorAll('.bottom-tab').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

/* ========== 侧边栏展开/折叠 ========== */
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');

function updateSidebarToggleIcon() {
  const isCollapsed = sidebar.classList.contains('collapsed');
  sidebarToggle.innerHTML = isCollapsed ? '▶' : '◀';
  sidebarToggle.title = isCollapsed ? '展开菜单' : '收起菜单';
}

sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
  updateSidebarToggleIcon();
});

// 初始化图标状态
updateSidebarToggleIcon();

// 折叠状态下，点击侧边栏任意空白处即可展开（桌面端）
sidebar.addEventListener('click', (e) => {
  if (window.innerWidth > 768 && sidebar.classList.contains('collapsed')) {
    // 不拦截导航按钮的点击
    if (!e.target.closest('.nav-item')) {
      sidebar.classList.remove('collapsed');
      updateSidebarToggleIcon();
    }
  }
});

/* ========== 移动端：汉堡菜单 + 遮罩 ========== */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openMobileSidebar() {
  sidebar.classList.add('open');
  sidebar.classList.remove('collapsed');
  sidebarOverlay.classList.add('show');
  mobileMenuBtn.style.opacity = '0';
}

function closeMobileSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('show');
  mobileMenuBtn.style.opacity = '1';
}

mobileMenuBtn.addEventListener('click', openMobileSidebar);
sidebarOverlay.addEventListener('click', closeMobileSidebar);

// 窗口大小变化时重置移动端状态
let wasMobile = window.innerWidth <= 768;
window.addEventListener('resize', () => {
  const isMobile = window.innerWidth <= 768;
  if (isMobile && !wasMobile) {
    // Desktop → Mobile: close sidebar
    closeMobileSidebar();
  }
  if (!isMobile && wasMobile) {
    // Mobile → Desktop: ensure sidebar starts open
    sidebar.classList.remove('open', 'collapsed');
    sidebarOverlay.classList.remove('show');
    mobileMenuBtn.style.opacity = '1';
    updateSidebarToggleIcon();
  }
  wasMobile = isMobile;
});

/* ========== 无障碍：prefers-reduced-motion ========== */
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let prefersReducedMotion = motionQuery.matches;
motionQuery.addEventListener('change', (e) => {
  prefersReducedMotion = e.matches;
});

/* ========== 工具：日期格式化 ========== */
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function todayStr() { return new Date().toISOString().split('T')[0]; }

/* ================================================================
   一、个人资料模块
   ================================================================ */

const PROFILE_KEY = 'personal_site_profile';
const defaultProfile = {
  avatar: '👤', name: '你的名字', title: '职业 / 头衔',
  bio: '这里写一段个人简介...', email: 'email@example.com',
  phone: '', github: '', skills: ['HTML', 'CSS', 'JavaScript']
};

let profile = storage.get(PROFILE_KEY, defaultProfile);

function renderProfile() {
  document.getElementById('profileAvatar').textContent = profile.avatar;
  document.getElementById('sidebarAvatar').textContent = profile.avatar;
  document.getElementById('displayName').textContent = profile.name;
  document.getElementById('sidebarName').textContent = profile.name;
  document.getElementById('displayTitle').textContent = profile.title;
  document.getElementById('displayBio').textContent = profile.bio;
  document.getElementById('displayEmail').textContent = profile.email || '未填写';
  document.getElementById('displayPhone').textContent = profile.phone || '未填写';
  document.getElementById('displayGithub').textContent = profile.github ?
    'github.com/' + profile.github : '未填写';

  const skillsEl = document.getElementById('displaySkills');
  skillsEl.innerHTML = profile.skills.filter(Boolean).map(s =>
    `<span class="tag">${s.trim()}</span>`).join('') || '<span class="tag">无</span>';
}

// 编辑弹窗
document.getElementById('editProfileBtn').addEventListener('click', () => {
  document.getElementById('editAvatar').value = profile.avatar;
  document.getElementById('editName').value = profile.name;
  document.getElementById('editTitle').value = profile.title;
  document.getElementById('editBio').value = profile.bio;
  document.getElementById('editEmail').value = profile.email;
  document.getElementById('editPhone').value = profile.phone;
  document.getElementById('editGithub').value = profile.github;
  document.getElementById('editSkills').value = profile.skills.join(', ');
  document.getElementById('profileModal').classList.add('show');
});

function closeProfileModal() {
  document.getElementById('profileModal').classList.remove('show');
}

document.getElementById('closeProfileModal').addEventListener('click', closeProfileModal);
document.getElementById('cancelProfileBtn').addEventListener('click', closeProfileModal);
document.getElementById('profileModal').addEventListener('click', function(e) {
  if (e.target === this) closeProfileModal();
});

document.getElementById('saveProfileBtn').addEventListener('click', () => {
  profile.avatar = document.getElementById('editAvatar').value || '👤';
  profile.name = document.getElementById('editName').value || '未命名';
  profile.title = document.getElementById('editTitle').value;
  profile.bio = document.getElementById('editBio').value;
  profile.email = document.getElementById('editEmail').value;
  profile.phone = document.getElementById('editPhone').value;
  profile.github = document.getElementById('editGithub').value;
  profile.skills = document.getElementById('editSkills').value
    .split(',').map(s => s.trim()).filter(Boolean);
  storage.set(PROFILE_KEY, profile);
  renderProfile();
  closeProfileModal();
});

/* ================================================================
   二、备忘录模块
   ================================================================ */

const MEMO_KEY = 'personal_site_memos';
let memos = storage.get(MEMO_KEY, []);
let editingMemoId = null;
let memoColor = '#4f46e5';

function saveMemos() { storage.set(MEMO_KEY, memos); }

function renderMemos(filter = '', category = 'all') {
  const grid = document.getElementById('memoGrid');
  const empty = document.getElementById('memoEmpty');

  let filtered = memos;
  if (category !== 'all') filtered = filtered.filter(m => m.category === category);
  if (filter) {
    const kw = filter.toLowerCase();
    filtered = filtered.filter(m => m.title.toLowerCase().includes(kw) || m.content.toLowerCase().includes(kw));
  }

  filtered.sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));

  const cards = grid.querySelectorAll('.memo-card');
  cards.forEach(c => c.remove());

  if (filtered.length === 0) {
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    filtered.forEach(m => {
      const card = document.createElement('div');
      card.className = 'memo-card';
      card.style.borderLeftColor = m.color || '#4f46e5';
      const hasReminder = m.reminder && new Date(m.reminder) > new Date();
      card.innerHTML = `
        <div class="memo-card-header">
          <span class="memo-card-category">${m.category || '其他'}</span>
          ${hasReminder ? '<span class="memo-reminder-badge" title="已设提醒">🔔</span>' : ''}
        </div>
        <div class="memo-card-title">${escapeHtml(m.title) || '无标题'}</div>
        <div class="memo-card-content">${escapeHtml(m.content)}</div>
        <div class="memo-card-date">
          ${formatDate(m.updatedAt || m.createdAt)}
          ${hasReminder ? ' · ⏰ ' + formatDateTime(m.reminder) : ''}
        </div>
        ${hasReminder ? `
          <button class="btn btn-sm btn-calendar" onclick="event.stopPropagation();addToCalendar('${m.id}')">
            📅 加到日历
          </button>` : ''}
      `;
      card.addEventListener('click', () => openMemoEditor(m.id));
      grid.appendChild(card);
    });
  }
}

function openMemoEditor(id = null) {
  editingMemoId = id;
  const modal = document.getElementById('memoModal');
  const titleEl = document.getElementById('memoModalTitle');
  const deleteBtn = document.getElementById('deleteMemoBtn');

  if (id) {
    const m = memos.find(x => x.id === id);
    if (!m) return;
    document.getElementById('memoTitle').value = m.title;
    document.getElementById('memoContent').value = m.content;
    document.getElementById('memoCategory').value = m.category || '其他';
    document.getElementById('memoReminder').value = m.reminder || '';
    memoColor = m.color || '#4f46e5';
    titleEl.textContent = '编辑备忘';
    deleteBtn.style.display = 'inline-block';
  } else {
    document.getElementById('memoTitle').value = '';
    document.getElementById('memoContent').value = '';
    document.getElementById('memoCategory').value = '工作';
    document.getElementById('memoReminder').value = '';
    memoColor = '#4f46e5';
    titleEl.textContent = '新建备忘';
    deleteBtn.style.display = 'none';
  }

  document.querySelectorAll('#memoColorPicker .color-dot').forEach(d => {
    d.classList.toggle('active', d.dataset.color === memoColor);
  });

  modal.classList.add('show');
}

function closeMemoModal() {
  document.getElementById('memoModal').classList.remove('show');
  editingMemoId = null;
}

document.getElementById('addMemoBtn').addEventListener('click', () => openMemoEditor());
document.getElementById('closeMemoModal').addEventListener('click', closeMemoModal);
document.getElementById('cancelMemoBtn').addEventListener('click', closeMemoModal);
document.getElementById('memoModal').addEventListener('click', function(e) {
  if (e.target === this) closeMemoModal();
});

document.querySelectorAll('#memoColorPicker .color-dot').forEach(dot => {
  dot.addEventListener('click', function() {
    document.querySelectorAll('#memoColorPicker .color-dot').forEach(d => d.classList.remove('active'));
    this.classList.add('active');
    memoColor = this.dataset.color;
  });
});

document.getElementById('saveMemoBtn').addEventListener('click', () => {
  const title = document.getElementById('memoTitle').value.trim();
  const content = document.getElementById('memoContent').value.trim();
  const category = document.getElementById('memoCategory').value;
  const reminder = document.getElementById('memoReminder').value;
  const now = new Date().toISOString();

  if (!title && !content) return;

  if (editingMemoId) {
    const m = memos.find(x => x.id === editingMemoId);
    if (m) {
      m.title = title; m.content = content; m.category = category;
      m.reminder = reminder; m.color = memoColor; m.updatedAt = now;
    }
  } else {
    memos.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title, content, category, reminder, color: memoColor,
      createdAt: now, updatedAt: now
    });
  }

  saveMemos();
  closeMemoModal();
  renderMemos(
    document.getElementById('memoSearch').value,
    document.getElementById('memoCategoryFilter').value
  );
});

document.getElementById('deleteMemoBtn').addEventListener('click', () => {
  if (!editingMemoId) return;
  if (!confirm('确定删除这条备忘录吗？')) return;
  memos = memos.filter(m => m.id !== editingMemoId);
  saveMemos();
  closeMemoModal();
  renderMemos(
    document.getElementById('memoSearch').value,
    document.getElementById('memoCategoryFilter').value
  );
});

document.getElementById('memoSearch').addEventListener('input', function() {
  renderMemos(this.value, document.getElementById('memoCategoryFilter').value);
});

document.getElementById('memoCategoryFilter').addEventListener('change', function() {
  renderMemos(document.getElementById('memoSearch').value, this.value);
});

/* ================================================================
   三、记账模块
   ================================================================ */

const ACCOUNT_KEY = 'personal_site_accounting';
let transactions = storage.get(ACCOUNT_KEY, []);
let editingTxId = null;
let txType = 'expense';

function saveTransactions() { storage.set(ACCOUNT_KEY, transactions); }

function renderAccounting() {
  updateBalanceCards();
  populateMonthFilter();
  applyTransactionFilters();
}

function updateBalanceCards() {
  let totalIn = 0, totalOut = 0;
  transactions.forEach(t => {
    if (t.type === 'income') totalIn += t.amount;
    else totalOut += t.amount;
  });
  document.getElementById('totalIncome').textContent = '¥' + totalIn.toFixed(2);
  document.getElementById('totalExpense').textContent = '¥' + totalOut.toFixed(2);
  document.getElementById('totalBalance').textContent = '¥' + (totalIn - totalOut).toFixed(2);
}

function populateMonthFilter() {
  const sel = document.getElementById('monthFilter');
  const current = sel.value;
  const months = new Set();
  transactions.forEach(t => {
    if (t.date) months.add(t.date.substring(0, 7));
  });
  sel.innerHTML = '<option value="all">全部月份</option>';
  [...months].sort().reverse().forEach(m => {
    sel.innerHTML += `<option value="${m}">${m}</option>`;
  });
  sel.value = current;
}

function applyTransactionFilters() {
  const month = document.getElementById('monthFilter').value;
  const type = document.getElementById('typeFilter').value;
  const category = document.getElementById('categoryFilter').value;

  let filtered = [...transactions];
  if (month !== 'all') filtered = filtered.filter(t => t.date && t.date.startsWith(month));
  if (type !== 'all') filtered = filtered.filter(t => t.type === type);
  if (category !== 'all') filtered = filtered.filter(t => t.category === category);

  filtered.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

  const list = document.getElementById('transactionList');
  const empty = document.getElementById('transactionEmpty');
  list.querySelectorAll('.transaction-item').forEach(el => el.remove());

  if (filtered.length === 0) {
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    filtered.forEach(t => {
      const isIncome = t.type === 'income';
      const icon = isIncome ? '📈' : getCategoryIcon(t.category);
      const sign = isIncome ? '' : '-';
      const item = document.createElement('div');
      item.className = 'transaction-item';
      item.innerHTML = `
        <div class="tx-icon ${t.type}">${icon}</div>
        <div class="tx-info">
          <div class="tx-category">${t.category}</div>
          <div class="tx-note">${escapeHtml(t.note || '') || '&nbsp;'}</div>
        </div>
        <div class="tx-date">${formatDate(t.date)}</div>
        <div class="tx-amount ${t.type}">${sign}¥${t.amount.toFixed(2)}</div>
      `;
      item.addEventListener('click', () => openTransactionEditor(t.id));
      list.appendChild(item);
    });
  }
}

function getCategoryIcon(cat) {
  const map = { '餐饮': '🍔', '交通': '🚗', '购物': '🛒', '娱乐': '🎮', '居住': '🏠', '工资': '💼', '兼职': '💡' };
  return map[cat] || '💰';
}

document.getElementById('monthFilter').addEventListener('change', applyTransactionFilters);
document.getElementById('typeFilter').addEventListener('change', applyTransactionFilters);
document.getElementById('categoryFilter').addEventListener('change', applyTransactionFilters);

// 类型切换
document.querySelectorAll('.type-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    txType = this.dataset.type;

    // 切换分类选择
    const catSel = document.getElementById('transactionCategory');
    if (txType === 'income') {
      catSel.innerHTML = `
        <option value="工资">工资</option>
        <option value="兼职">兼职</option>
        <option value="其他收入">其他收入</option>`;
    } else {
      catSel.innerHTML = `
        <option value="餐饮">餐饮</option>
        <option value="交通">交通</option>
        <option value="购物">购物</option>
        <option value="娱乐">娱乐</option>
        <option value="居住">居住</option>
        <option value="其他支出">其他支出</option>`;
    }
  });
});

// 新建/编辑交易
document.getElementById('addTransactionBtn').addEventListener('click', () => openTransactionEditor());
document.getElementById('closeTransactionModal').addEventListener('click', closeTransactionModal);
document.getElementById('cancelTransactionBtn').addEventListener('click', closeTransactionModal);
document.getElementById('transactionModal').addEventListener('click', function(e) {
  if (e.target === this) closeTransactionModal();
});

function openTransactionEditor(id = null) {
  editingTxId = id;
  const modal = document.getElementById('transactionModal');
  const titleEl = document.getElementById('transactionModalTitle');
  const deleteBtn = document.getElementById('deleteTransactionBtn');

  if (id) {
    const t = transactions.find(x => x.id === id);
    if (!t) return;
    txType = t.type;
    document.getElementById('transactionAmount').value = t.amount;
    document.getElementById('transactionCategory').value = t.category;
    document.getElementById('transactionDate').value = t.date;
    document.getElementById('transactionNote').value = t.note || '';
    titleEl.textContent = '编辑账单';
    deleteBtn.style.display = 'inline-block';
  } else {
    txType = 'expense';
    document.getElementById('transactionAmount').value = '';
    document.getElementById('transactionCategory').value = '餐饮';
    document.getElementById('transactionDate').value = todayStr();
    document.getElementById('transactionNote').value = '';
    titleEl.textContent = '记一笔';
    deleteBtn.style.display = 'none';
  }

  document.querySelectorAll('.type-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.type === txType);
  });

  updateCategorySelect();
  modal.classList.add('show');
}

function updateCategorySelect() {
  const catSel = document.getElementById('transactionCategory');
  if (txType === 'income') {
    catSel.innerHTML = `
      <option value="工资">工资</option>
      <option value="兼职">兼职</option>
      <option value="其他收入">其他收入</option>`;
  } else {
    catSel.innerHTML = `
      <option value="餐饮">餐饮</option>
      <option value="交通">交通</option>
      <option value="购物">购物</option>
      <option value="娱乐">娱乐</option>
      <option value="居住">居住</option>
      <option value="其他支出">其他支出</option>`;
  }
}

function closeTransactionModal() {
  document.getElementById('transactionModal').classList.remove('show');
  editingTxId = null;
}

document.getElementById('saveTransactionBtn').addEventListener('click', () => {
  const amount = parseFloat(document.getElementById('transactionAmount').value);
  const category = document.getElementById('transactionCategory').value;
  const date = document.getElementById('transactionDate').value || todayStr();
  const note = document.getElementById('transactionNote').value.trim();

  if (isNaN(amount) || amount <= 0) { alert('请输入有效金额'); return; }

  const now = new Date().toISOString();

  if (editingTxId) {
    const t = transactions.find(x => x.id === editingTxId);
    if (t) {
      t.type = txType; t.amount = amount; t.category = category;
      t.date = date; t.note = note; t.updatedAt = now;
    }
  } else {
    transactions.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      type: txType, amount, category, date, note,
      createdAt: now, updatedAt: now
    });
  }

  saveTransactions();
  closeTransactionModal();
  renderAccounting();
});

document.getElementById('deleteTransactionBtn').addEventListener('click', () => {
  if (!editingTxId) return;
  if (!confirm('确定删除这条账单吗？')) return;
  transactions = transactions.filter(t => t.id !== editingTxId);
  saveTransactions();
  closeTransactionModal();
  renderAccounting();
});

/* ========== 日历提醒：生成 .ics 文件并下载 ========== */

function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toICSDate(iso) {
  // iCalendar format: 20260629T143000
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

function addToCalendar(memoId) {
  const m = memos.find(x => x.id === memoId);
  if (!m || !m.reminder) return;

  const now = new Date();
  const uid = memoId + '@personal-space';
  const dtStart = toICSDate(m.reminder);
  // 提醒时间往后30分钟作为结束
  const endDate = new Date(new Date(m.reminder).getTime() + 30 * 60000);
  const dtEnd = toICSDate(endDate.toISOString());
  const dtStamp = toICSDate(now.toISOString());

  const title = escapeICS(m.title || '备忘提醒');
  const desc = escapeICS((m.content || '').replace(/\n/g, '\\n'));
  const cat = escapeICS(m.category || '');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//个人空间//备忘提醒//ZH',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `DTSTAMP:${dtStamp}`,
    `SUMMARY:📝 ${title}`,
    `DESCRIPTION:${desc}`,
    `CATEGORIES:${cat}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    `DESCRIPTION:🔔 ${title}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  // 生成文件并触发下载
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (m.title || '备忘提醒').replace(/[^\\u4e00-\\u9fa5\\w]/g, '_') + '.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // iOS 提示
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    showToast('✅ 已下载日历文件\n点击文件 → 添加到日历 → 到时间 iPhone 会自动弹通知');
  } else {
    showToast('✅ 日历文件已下载，双击打开即可添加到系统日历');
  }
}

function escapeICS(str) {
  return str.replace(/[\\;,]/g, '\\$&').substring(0, 500);
}

function showToast(msg) {
  const existing = document.querySelector('.toast-msg');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.style.cssText = `
    position:fixed;bottom:30px;left:50%;transform:translateX(-50%);
    background:#1f2937;color:#fff;padding:14px 24px;border-radius:12px;
    font-size:14px;z-index:9999;text-align:center;max-width:90vw;
    box-shadow:0 8px 30px rgba(0,0,0,.25);white-space:pre-line;
    animation:toastIn .3s ease;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ========== 工具函数 ========== */
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ========== 初始化 ========== */
function init() {
  renderProfile();
  renderMemos();
  renderAccounting();
}

init();
