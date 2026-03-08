const drawer = document.getElementById('drawer');
const shade = document.getElementById('drawerShade');
const menuBtn = document.getElementById('menuBtn');
const navItems = [...document.querySelectorAll('.nav-item')];
const pages = [...document.querySelectorAll('.page')];
const chips = [...document.querySelectorAll('.chip[data-filter]')];

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

const LS_TASKS = 'studylab_v3_tasks';
const LS_SESSIONS = 'studylab_v3_sessions';
const LS_MEMO_SUBJECT = 'studylab_v3_memo_subject';
const LS_MEMO_TEXT = 'studylab_v3_memo_text';

let filter = 'all';
let tasks = load(LS_TASKS, [
  {id:id(), title:'数学 第5章の問題集', subject:'数学', priority:'高', date:'2026/03/10', status:'doing'},
  {id:id(), title:'英語単語帳 Unit 12-15', subject:'英語', priority:'中', date:'2026/03/08', status:'todo'},
  {id:id(), title:'物理 力学レポート提出', subject:'物理', priority:'高', date:'2026/03/09', status:'todo'},
  {id:id(), title:'化学 有機の復習', subject:'化学', priority:'低', date:'2026/03/11', status:'done'},
]);
let sessions = load(LS_SESSIONS, []);
let timerSeconds = 25 * 60;
let timerInterval = null;
let timerRunning = false;
let cameraStream = null;
let sessionCount = sessions.length;

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
function openDrawer(){ drawer.classList.add('open'); shade.classList.add('show'); }
function closeDrawer(){ drawer.classList.remove('open'); shade.classList.remove('show'); }
function showPage(page){
  pages.forEach(p => p.classList.toggle('active', p.dataset.page === page));
  navItems.forEach(n => n.classList.toggle('active', n.dataset.page === page));
  closeDrawer();
  if (page === 'records' || page === 'dashboard') renderStats();
}
menuBtn.addEventListener('click', openDrawer);
shade.addEventListener('click', closeDrawer);
navItems.forEach(item => item.addEventListener('click', () => showPage(item.dataset.page)));
document.querySelectorAll('[data-go]').forEach(btn => btn.addEventListener('click', () => showPage(btn.dataset.go)));

function formatTimer(sec){
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
function renderTimer(){
  timerNumber.textContent = formatTimer(timerSeconds);
}
function updateTimerLabel(text){
  timerLabel.textContent = text;
}
startPauseBtn.addEventListener('click', () => {
  if (!timerRunning){
    timerRunning = true;
    updateTimerLabel('学習中');
    teacherMessage.textContent = 'そのまま集中を維持しましょう';
    timerInterval = setInterval(() => {
      if (timerSeconds > 0){
        timerSeconds -= 1;
        renderTimer();
      } else {
        clearInterval(timerInterval);
        timerRunning = false;
        sessionCount += 1;
        sessionMeta.textContent = `${sessionCount}セッション完了`;
        updateTimerLabel('完了');
        teacherMessage.textContent = '1セッション完了です。良い流れです';
      }
    }, 1000);
  } else {
    timerRunning = false;
    clearInterval(timerInterval);
    updateTimerLabel('一時停止');
    teacherMessage.textContent = '短く整えてから再開しましょう';
  }
});
resetTimerBtn.addEventListener('click', () => {
  timerRunning = false;
  clearInterval(timerInterval);
  timerSeconds = 25 * 60;
  renderTimer();
  updateTimerLabel('待機中');
});
breakBtn.addEventListener('click', () => {
  timerRunning = false;
  clearInterval(timerInterval);
  timerSeconds = 5 * 60;
  renderTimer();
  updateTimerLabel('休憩中');
  teacherMessage.textContent = '休憩後にすぐ戻りましょう';
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
  const usedMinutes = Math.max(0, Math.floor((25*60 - timerSeconds) / 60));
  const entry = {
    date: today,
    subject: memoSubject.value.trim() || '未設定',
    note: memoText.value.trim(),
    minutes: usedMinutes
  };
  sessions.unshift(entry);
  save(LS_SESSIONS, sessions);
  memoText.value = '';
  localStorage.setItem(LS_MEMO_TEXT, '');
  teacherMessage.textContent = 'セッションを保存しました';
  renderStats();
});

function renderTasks(){
  const filtered = tasks.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });
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
  streakDays.textContent = `${Math.min(uniqueDays.length, 6)}日`;

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
