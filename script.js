const drawer = document.getElementById('drawer');
const shade = document.getElementById('drawerShade');
const menuBtn = document.getElementById('menuBtn');
const navItems = [...document.querySelectorAll('.nav-item')];
const pages = [...document.querySelectorAll('.page')];
const chips = [...document.querySelectorAll('.chip[data-filter]')];
const tipFilterButtons = [...document.querySelectorAll('[data-tip-filter]')];

const taskCards = document.getElementById('taskCards');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskTitleInput = document.getElementById('taskTitleInput');
const taskSubjectInput = document.getElementById('taskSubjectInput');
const taskPriorityInput = document.getElementById('taskPriorityInput');
const taskDateInput = document.getElementById('taskDateInput');

const cameraToggleBtn = document.getElementById('cameraToggleBtn');
const cameraVideo = document.getElementById('cameraVideo');
const cameraPlaceholder = document.getElementById('cameraPlaceholder');

const timerNumber = document.getElementById('timerNumber');
const timerLabel = document.getElementById('timerLabel');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetTimerBtn = document.getElementById('resetTimerBtn');
const breakBtn = document.getElementById('breakBtn');
const sessionMeta = document.getElementById('sessionMeta');

const memoSubject = document.getElementById('memoSubject');
const memoText = document.getElementById('memoText');
const saveSessionBtn = document.getElementById('saveSessionBtn');
const memoTotal = document.getElementById('memoTotal');
const teacherMessage = document.getElementById('teacherMessage');

const todayMinutes = document.getElementById('todayMinutes');
const weekTotal = document.getElementById('weekTotal');
const openTasks = document.getElementById('openTasks');
const streakDays = document.getElementById('streakDays');

const recordTotalHours = document.getElementById('recordTotalHours');
const recordSessionCount = document.getElementById('recordSessionCount');
const recordDailyAvg = document.getElementById('recordDailyAvg');
const recordSubjectCount = document.getElementById('recordSubjectCount');
const barsMount = document.getElementById('barsMount');
const legendList = document.getElementById('legendList');
const sessionList = document.getElementById('sessionList');

const goalTitleInput = document.getElementById('goalTitleInput');
const goalTargetInput = document.getElementById('goalTargetInput');
const goalSubjectInput = document.getElementById('goalSubjectInput');
const addGoalBtn = document.getElementById('addGoalBtn');
const goalList = document.getElementById('goalList');

const tipCategoryChip = document.getElementById('tipCategoryChip');
const tipCounter = document.getElementById('tipCounter');
const tipIconMount = document.getElementById('tipIconMount');
const tipTitle = document.getElementById('tipTitle');
const tipText = document.getElementById('tipText');
const prevTipBtn = document.getElementById('prevTipBtn');
const nextTipBtn = document.getElementById('nextTipBtn');
const randomTipBtn = document.getElementById('randomTipBtn');
const tipList = document.getElementById('tipList');

const LS_TASKS = 'studylab_v5_tasks';
const LS_SESSIONS = 'studylab_v5_sessions';
const LS_MEMO_SUBJECT = 'studylab_v5_memo_subject';
const LS_MEMO_TEXT = 'studylab_v5_memo_text';
const LS_GOALS = 'studylab_v5_goals';

let filter = 'all';
let tipFilter = 'all';
let tipIndex = 0;

let tasks = load(LS_TASKS, [
  {id:id(), title:'数学 第5章の問題集', subject:'数学', priority:'高', date:'2026/03/10', status:'doing'},
  {id:id(), title:'英語単語帳 Unit 12-15', subject:'英語', priority:'中', date:'2026/03/08', status:'todo'},
  {id:id(), title:'物理 力学レポート提出', subject:'物理', priority:'高', date:'2026/03/09', status:'todo'},
  {id:id(), title:'化学 有機の復習', subject:'化学', priority:'低', date:'2026/03/11', status:'done'},
]);
let goals = load(LS_GOALS, [
  {id:id(), title:'今週の数学 10時間', subject:'数学', targetHours:10, doneHours:3.5},
  {id:id(), title:'英語リスニング 5時間', subject:'英語', targetHours:5, doneHours:2},
]);
let sessions = load(LS_SESSIONS, []);
let timerSeconds = 25 * 60;
let timerInterval = null;
let timerRunning = false;
let isBreakMode = false;
let studySecondsBeforeBreak = 25 * 60;
let sessionCount = sessions.length;
let cameraStream = null;

const tips = [
  {category:'集中力', icon:'clock', color:'blue', title:'ポモドーロ・テクニック', text:'25分集中して5分休憩を繰り返すと、長時間でも集中を維持しやすくなります。'},
  {category:'記憶術', icon:'chart', color:'purple', title:'スペースド・リピティション', text:'復習の間隔を少しずつ空けると、短期記憶ではなく長期記憶へ移りやすくなります。'},
  {category:'健康', icon:'bulb', color:'blue', title:'学習前の水分補給', text:'軽い脱水でも集中力が下がりやすいので、学習前に少し水を飲むだけでも違います。'},
  {category:'勉強法', icon:'tasks', color:'blue', title:'最初の5分だけ始める', text:'やる気が出ない日は、まず5分だけ始めると着手の抵抗が減ります。'},
  {category:'集中力', icon:'camera', color:'blue', title:'視界から不要物を減らす', text:'机の上の情報が多いほど注意が散りやすくなるので、必要なもの以外は外すのが効果的です。'},
  {category:'記憶術', icon:'book', color:'purple', title:'説明できるかで確認する', text:'読んだ内容を自分の言葉で説明できるか確認すると、理解不足の部分が見えます。'},
  {category:'健康', icon:'target', color:'blue', title:'休憩は短く区切る', text:'だらだら休むより、5分前後で切り上げた方が集中への戻りがスムーズです。'},
  {category:'勉強法', icon:'calendar', color:'blue', title:'次にやることを先に決める', text:'学習終了前に次回の最初の1タスクを決めておくと、再開が速くなります。'},
];

function id(){ return Math.random().toString(36).slice(2, 9); }
function load(key, fallback){
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}
function openDrawer(){
  drawer.classList.add('open');
  shade.classList.add('show');
}
function closeDrawer(){
  drawer.classList.remove('open');
  shade.classList.remove('show');
}
function showPage(page){
  pages.forEach(p => p.classList.toggle('active', p.dataset.page === page));
  navItems.forEach(n => n.classList.toggle('active', n.dataset.page === page));
  closeDrawer();
  if (page === 'records' || page === 'dashboard') renderStats();
  if (page === 'goals') renderGoals();
  if (page === 'tips') {
    renderTipMonitor();
    renderTipList();
  }
}
if (menuBtn) menuBtn.addEventListener('click', openDrawer);
if (shade) shade.addEventListener('click', closeDrawer);
navItems.forEach(item => item.addEventListener('click', () => showPage(item.dataset.page)));
document.querySelectorAll('[data-go]').forEach(btn => btn.addEventListener('click', () => showPage(btn.dataset.go)));

function formatTimer(sec){
  const safe = Math.max(0, sec);
  const m = Math.floor(safe / 60).toString().padStart(2, '0');
  const s = (safe % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
function renderTimer(){
  timerNumber.textContent = formatTimer(timerSeconds);
}
function updateTimerLabel(text){
  timerLabel.textContent = text;
}
function stopTimerLoop(){
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
}
function startStudyLoop(){
  stopTimerLoop();
  timerRunning = true;
  timerInterval = setInterval(() => {
    if (timerSeconds > 0){
      timerSeconds -= 1;
      renderTimer();
    } else {
      stopTimerLoop();
      if (isBreakMode){
        timerSeconds = studySecondsBeforeBreak;
        isBreakMode = false;
        renderTimer();
        updateTimerLabel('学習再開待ち');
        teacherMessage.textContent = '休憩が終わりました。再開しましょう';
      } else {
        sessionCount += 1;
        sessionMeta.textContent = `${sessionCount}セッション完了`;
        updateTimerLabel('完了');
        teacherMessage.textContent = '1セッション完了です。良い流れです';
      }
    }
  }, 1000);
}
renderTimer();

startPauseBtn.addEventListener('click', () => {
  if (!timerRunning){
    if (timerSeconds <= 0 && !isBreakMode){
      timerSeconds = 25 * 60;
      renderTimer();
    }
    updateTimerLabel(isBreakMode ? '休憩中' : '学習中');
    teacherMessage.textContent = isBreakMode ? '休憩中です。戻ったら再開しましょう' : 'そのまま集中を維持しましょう';
    startStudyLoop();
  } else {
    stopTimerLoop();
    updateTimerLabel(isBreakMode ? '休憩を停止中' : '一時停止');
    teacherMessage.textContent = '少し整えてから再開しましょう';
  }
});
resetTimerBtn.addEventListener('click', () => {
  stopTimerLoop();
  isBreakMode = false;
  timerSeconds = 25 * 60;
  studySecondsBeforeBreak = timerSeconds;
  renderTimer();
  updateTimerLabel('待機中');
  teacherMessage.textContent = 'タイマーをリセットしました';
});
breakBtn.addEventListener('click', () => {
  if (!isBreakMode){
    studySecondsBeforeBreak = timerSeconds > 0 ? timerSeconds : 25 * 60;
    timerSeconds = 5 * 60;
    isBreakMode = true;
    stopTimerLoop();
    renderTimer();
    updateTimerLabel('休憩中');
    teacherMessage.textContent = '休憩に入りました。終わると元の学習時間に戻ります';
  } else {
    stopTimerLoop();
    timerSeconds = studySecondsBeforeBreak;
    isBreakMode = false;
    renderTimer();
    updateTimerLabel('学習再開待ち');
    teacherMessage.textContent = '休憩を終了しました。学習に戻りましょう';
  }
});

cameraToggleBtn.addEventListener('click', async () => {
  if (cameraStream){
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
    cameraVideo.srcObject = null;
    cameraVideo.classList.add('hidden');
    cameraPlaceholder.classList.remove('hidden');
    teacherMessage.textContent = 'カメラがオフです。再開しましょう';
    return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    cameraVideo.srcObject = cameraStream;
    cameraVideo.classList.remove('hidden');
    cameraPlaceholder.classList.add('hidden');
    teacherMessage.textContent = 'カメラ確認済みです。そのまま続けましょう';
  } catch (e) {
    alert('カメラ権限を許可してください。');
  }
});

memoSubject.value = localStorage.getItem(LS_MEMO_SUBJECT) || '';
memoText.value = localStorage.getItem(LS_MEMO_TEXT) || '';
memoSubject.addEventListener('input', () => localStorage.setItem(LS_MEMO_SUBJECT, memoSubject.value));
memoText.addEventListener('input', () => localStorage.setItem(LS_MEMO_TEXT, memoText.value));

saveSessionBtn.addEventListener('click', () => {
  const today = new Date().toISOString().slice(0,10);
  const usedMinutes = Math.max(0, Math.floor((25*60 - Math.min(studySecondsBeforeBreak, timerSeconds)) / 60));
  const subject = memoSubject.value.trim() || '未設定';
  const entry = {
    date: today,
    subject,
    note: memoText.value.trim(),
    minutes: usedMinutes
  };
  sessions.unshift(entry);
  save(LS_SESSIONS, sessions);
  memoText.value = '';
  localStorage.setItem(LS_MEMO_TEXT, '');
  teacherMessage.textContent = 'セッションを保存しました';
  applyMinutesToGoals(subject, usedMinutes);
  renderStats();
  renderGoals();
});

function renderTasks(){
  const filtered = tasks.filter(t => filter === 'all' ? true : t.status === filter);
  taskCards.innerHTML = filtered.map(task => `
    <div class="task-card">
      <div class="task-left">${task.status === 'done' ? '●' : task.status === 'doing' ? '◔' : '○'}</div>
      <div class="task-center">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-sub">${escapeHtml(task.subject)}　× ${escapeHtml(task.date || '日付なし')}</div>
        <div class="task-actions">
          <button class="mini-action" data-task="${task.id}" data-set="todo">未着手</button>
          <button class="mini-action" data-task="${task.id}" data-set="doing">進行中</button>
          <button class="mini-action" data-task="${task.id}" data-set="done">完了</button>
        </div>
      </div>
      <div class="priority ${task.priority === '高' ? 'high' : task.priority === '中' ? 'mid' : 'low'}">
        ${task.priority === '高' ? '↑ 高' : task.priority === '中' ? '→ 中' : '↓ 低'}
      </div>
    </div>
  `).join('');
  taskCards.querySelectorAll('[data-set]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = tasks.find(t => t.id === btn.dataset.task);
      if (!target) return;
      target.status = btn.dataset.set;
      save(LS_TASKS, tasks);
      renderTasks();
      renderStats();
    });
  });
}
function escapeHtml(str){
  return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}
chips.forEach(chip => chip.addEventListener('click', () => {
  chips.forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  filter = chip.dataset.filter;
  renderTasks();
}));
addTaskBtn.addEventListener('click', () => {
  const title = taskTitleInput.value.trim();
  const subject = taskSubjectInput.value.trim();
  if (!title || !subject) {
    alert('タスク名と科目を入力してください。');
    return;
  }
  tasks.unshift({
    id: id(),
    title,
    subject,
    priority: taskPriorityInput.value,
    date: taskDateInput.value.trim(),
    status: 'todo'
  });
  save(LS_TASKS, tasks);
  taskTitleInput.value = '';
  taskSubjectInput.value = '';
  taskDateInput.value = '';
  taskPriorityInput.value = '中';
  renderTasks();
  renderStats();
});

function renderGoals(){
  goalList.innerHTML = goals.length ? goals.map(goal => {
    const percent = Math.min(100, Math.round((goal.doneHours / goal.targetHours) * 100));
    return `
      <section class="goal-box">
        <div class="goal-main-title">${escapeHtml(goal.title)}</div>
        <div class="goal-subject">${escapeHtml(goal.subject)}</div>
        <div class="goal-progress-text">${goal.doneHours.toFixed(1)} / ${goal.targetHours}時間</div>
        <div class="progress-track"><div class="progress-fill" style="width:${percent}%"></div></div>
        <div class="goal-actions">
          <span>${percent}%</span>
          <div class="goal-btns">
            <button class="small-btn" data-goal="${goal.id}" data-add="1">+1h</button>
            <button class="small-btn" data-goal="${goal.id}" data-add="0.5">+0.5h</button>
            <button class="small-btn goal-delete" data-goal-delete="${goal.id}">削除</button>
          </div>
        </div>
      </section>
    `;
  }).join('') : '<section class="goal-box"><div class="goal-main-title">目標がまだありません</div><div class="goal-progress-text">上から追加できます。</div></section>';

  goalList.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const goal = goals.find(g => g.id === btn.dataset.goal);
      if (!goal) return;
      goal.doneHours = Math.min(goal.targetHours, goal.doneHours + Number(btn.dataset.add));
      save(LS_GOALS, goals);
      renderGoals();
    });
  });
  goalList.querySelectorAll('[data-goal-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      goals = goals.filter(g => g.id !== btn.dataset.goalDelete);
      save(LS_GOALS, goals);
      renderGoals();
    });
  });
}
addGoalBtn.addEventListener('click', () => {
  const title = goalTitleInput.value.trim();
  const targetHours = Number(goalTargetInput.value.trim());
  const subject = goalSubjectInput.value.trim();
  if (!title || !targetHours || !subject) {
    alert('目標名・目標時間・科目を入力してください。');
    return;
  }
  goals.unshift({ id:id(), title, targetHours, doneHours:0, subject });
  save(LS_GOALS, goals);
  goalTitleInput.value = '';
  goalTargetInput.value = '';
  goalSubjectInput.value = '';
  renderGoals();
});
function applyMinutesToGoals(subject, minutes){
  if (!minutes) return;
  const hours = minutes / 60;
  goals.forEach(goal => {
    if (goal.subject === subject) {
      goal.doneHours = Math.min(goal.targetHours, goal.doneHours + hours);
    }
  });
  save(LS_GOALS, goals);
}

function filteredTips(){
  return tipFilter === 'all' ? tips : tips.filter(t => t.category === tipFilter);
}
function iconMarkup(name){
  const map = {
    clock: '#i-clock',
    chart: '#i-chart',
    bulb: '#i-bulb',
    tasks: '#i-tasks',
    camera: '#i-camera',
    book: '#i-book',
    target: '#i-target',
    calendar: '#i-calendar',
  };
  return `<svg><use href="${map[name] || '#i-bulb'}"/></svg>`;
}
function renderTipMonitor(){
  const list = filteredTips();
  if (!list.length) return;
  if (tipIndex >= list.length) tipIndex = 0;
  const tip = list[tipIndex];
  tipCategoryChip.textContent = tip.category;
  tipCounter.textContent = `${tipIndex + 1} / ${list.length}`;
  tipIconMount.className = `tip-mark ${tip.color}`;
  tipIconMount.innerHTML = iconMarkup(tip.icon);
  tipTitle.textContent = tip.title;
  tipText.textContent = tip.text;
}
function renderTipList(){
  const list = filteredTips();
  tipList.innerHTML = list.map(tip => `
    <section class="tip-item">
      <div class="tip-item-top">
        <div class="tip-mark ${tip.color}">${iconMarkup(tip.icon)}</div>
        <div>
          <div class="tip-mini-category">${tip.category}</div>
          <div class="tip-box-title">${escapeHtml(tip.title)}</div>
        </div>
      </div>
      <div class="tip-box-text">${escapeHtml(tip.text)}</div>
    </section>
  `).join('');
}
tipFilterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tipFilterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tipFilter = btn.dataset.tipFilter;
    tipIndex = 0;
    renderTipMonitor();
    renderTipList();
  });
});
prevTipBtn.addEventListener('click', () => {
  const list = filteredTips();
  if (!list.length) return;
  tipIndex = (tipIndex - 1 + list.length) % list.length;
  renderTipMonitor();
});
nextTipBtn.addEventListener('click', () => {
  const list = filteredTips();
  if (!list.length) return;
  tipIndex = (tipIndex + 1) % list.length;
  renderTipMonitor();
});
randomTipBtn.addEventListener('click', () => {
  const list = filteredTips();
  if (!list.length) return;
  tipIndex = Math.floor(Math.random() * list.length);
  renderTipMonitor();
});

function minutesToday(){
  const today = new Date().toISOString().slice(0,10);
  return sessions.filter(s => s.date === today).reduce((sum,s) => sum + (s.minutes || 0), 0);
}
function renderStats(){
  const totalMinutes = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
  const uniqueDays = [...new Set(sessions.map(s => s.date))];
  const avg = uniqueDays.length ? Math.round(totalMinutes / uniqueDays.length) : 0;
  const openCount = tasks.filter(t => t.status !== 'done').length;
  const subjectMap = {};
  sessions.forEach(s => {
    subjectMap[s.subject] = (subjectMap[s.subject] || 0) + (s.minutes || 0);
  });
  const subjects = Object.keys(subjectMap);
  const recent = sessions.slice(0, 7).reverse();

  todayMinutes.textContent = `${minutesToday()}分`;
  weekTotal.textContent = `${(totalMinutes / 60).toFixed(1)}h`;
  openTasks.textContent = String(openCount);
  streakDays.textContent = `${Math.min(uniqueDays.length || 0, 6)}日`;

  recordTotalHours.textContent = `${(totalMinutes / 60).toFixed(1)}h`;
  recordSessionCount.textContent = String(sessions.length);
  recordDailyAvg.textContent = `${avg}分`;
  recordSubjectCount.textContent = String(subjects.length);
  memoTotal.textContent = `累計: ${totalMinutes}分`;

  barsMount.innerHTML = recent.length ? recent.map(s => {
    const h = Math.max(8, Math.min(100, Math.round((s.minutes || 0) / 120 * 100)));
    return `<div class="bar-wrap"><div class="bar" style="height:${h}%"></div></div>`;
  }).join('') : `<div class="bar-wrap"><div class="bar" style="height:0%"></div></div>`;

  const palette = ['blue','green','yellow','purple','red'];
  legendList.innerHTML = subjects.length ? subjects.map((name, idx) => `
    <div><span><span class="legend-dot ${palette[idx % palette.length]}"></span>${escapeHtml(name)}</span><b>${subjectMap[name]}分</b></div>
  `).join('') : '<div>データなし</div>';

  sessionList.innerHTML = sessions.length ? sessions.slice(0, 6).map(s => `
    <div class="session-row"><span>${emojiFor(s.subject)} ${escapeHtml(s.subject)}<br><small>${escapeHtml(s.date)}</small></span><b>${s.minutes}分</b></div>
  `).join('') : '<div class="session-row"><span>まだ記録がありません</span><b>0分</b></div>';
}
function emojiFor(subject){
  if (subject.includes('数')) return '😊';
  if (subject.includes('英')) return '😍';
  if (subject.includes('物')) return '🧪';
  if (subject.includes('化')) return '🧠';
  return '📘';
}

renderTimer();
renderTasks();
renderStats();
renderGoals();
renderTipMonitor();
renderTipList();
