
const $ = (id) => document.getElementById(id);
const lineProfileName = $('lineProfileName');
const launchMode = $('launchMode');
const coachNameInline = $('coachNameInline');
const coachNameInput = $('coachNameInput');
const coachStatePill = $('coachStatePill');
const coachWidgetStatus = $('coachWidgetStatus');
const monitoringText = $('monitoringText');
const monitoringSubText = $('monitoringSubText');
const teacherAlertText = $('teacherAlertText');
const surveillanceBannerText = $('surveillanceBannerText');
const watchState = $('watchState');
const coachMessageState = $('coachMessageState');
const sessionType = $('sessionType');
const focusMessage = $('focusMessage');
const goalMinutesSelect = $('goalMinutesSelect');
const breakMinutesSelect = $('breakMinutesSelect');
const nextGoalInput = $('nextGoalInput');
const saveNextGoalBtn = $('saveNextGoalBtn');
const taskTitleInput = $('taskTitleInput');
const taskGoalInput = $('taskGoalInput');
const taskEstimateSelect = $('taskEstimateSelect');
const taskPrioritySelect = $('taskPrioritySelect');
const taskMemoInput = $('taskMemoInput');
const addTaskBtn = $('addTaskBtn');
const taskManagerList = $('taskManagerList');
const taskOverviewList = $('taskOverviewList');
const taskSummaryCount = $('taskSummaryCount');
const taskTabListBtn = $('taskTabListBtn');
const taskTabAddBtn = $('taskTabAddBtn');
const taskTabList = $('taskTabList');
const taskTabAdd = $('taskTabAdd');
const selfVideoThumb = $('selfVideoThumb');
const selfVideoMain = $('selfVideoMain');
const cameraStatus = $('cameraStatus');
const hiddenOverlay = $('hiddenOverlay');
const startBtn = $('startBtn');
const toggleCamBtn = $('toggleCamBtn');
const pauseTimerBtn = $('pauseTimerBtn');
const breakBtn = $('breakBtn');
const endBreakBtn = $('endBreakBtn');
const nextMsgBtn = $('nextMsgBtn');
const restartSessionBtn = $('restartSessionBtn');
const wakeLockBtn = $('wakeLockBtn');
const fullscreenBtn = $('fullscreenBtn');
const leaveBtn = $('leaveBtn');
const soundModeSelect = $('soundModeSelect');
const soundVolumeRange = $('soundVolumeRange');
const soundToggleBtn = $('soundToggleBtn');
const elapsedTimeEl = $('elapsedTime');
const goalTimerEl = $('goalTimer');
const blurCountEl = $('blurCount');
const dailyTotalEl = $('dailyTotal');
const focusScoreEl = $('focusScore');
const completionRateEl = $('completionRate');
const streakDaysEl = $('streakDays');
const dailyComparisonEl = $('dailyComparison');
const weeklyTotalEl = $('weeklyTotal');
const breakCountEl = $('breakCount');
const pauseCountEl = $('pauseCount');
const camOffTimeEl = $('camOffTime');
const activeTaskName = $('activeTaskName');
const activeTaskMeta = $('activeTaskMeta');
const reportModal = $('reportModal');
const reportBody = $('reportBody');
const closeReportBtn = $('closeReportBtn');
const copyReportBtn = $('copyReportBtn');
const historyModal = $('historyModal');
const historyBody = $('historyBody');
const openHistoryBtn = $('openHistoryBtn');
const closeHistoryBtn = $('closeHistoryBtn');
const exportLogsBtn = $('exportLogsBtn');
const openSettingsBtn = $('openSettingsBtn');
const sectionActions = $('sectionActions');
const sectionTasks = $('sectionTasks');
const sectionRoom = $('sectionRoom');
const sectionStats = $('sectionStats');
const sectionSettings = $('sectionSettings');
const tabActionsBtn = $('tabActionsBtn');
const tabTasksBtn = $('tabTasksBtn');
const tabRoomBtn = $('tabRoomBtn');
const tabStatsBtn = $('tabStatsBtn');
const tabSettingsBtn = $('tabSettingsBtn');
const userWidget = $('userWidget');
const userWidgetHandle = $('userWidgetHandle');

const APP_CONFIG = window.APP_CONFIG || {};
const LIFF_ID = APP_CONFIG.LIFF_ID || "";
const ALLOW_NON_LIFF_MODE = APP_CONFIG.ALLOW_NON_LIFF_MODE !== false;

const STORAGE_KEYS = {
  coachName: 'focus-room-v14-coach-name',
  goalMinutes: 'focus-room-v14-goal-minutes',
  breakMinutes: 'focus-room-v14-break-minutes',
  nextGoal: 'focus-room-v14-next-goal',
  taskDraftTitle: 'focus-room-v14-draft-title',
  taskDraftGoal: 'focus-room-v14-draft-goal',
  taskDraftMemo: 'focus-room-v14-draft-memo',
  taskDraftEstimate: 'focus-room-v14-draft-estimate',
  taskDraftPriority: 'focus-room-v14-draft-priority',
  tasks: 'focus-room-v14-tasks',
  activeTaskTab: 'focus-room-v14-active-task-tab',
  activeSection: 'focus-room-v14-active-section',
  userWidgetPos: 'focus-room-v14-user-widget-pos',
  sessions: 'focus-room-v14-sessions',
  weeklyLogs: 'focus-room-v14-weekly-logs'
};

let tasks = [];
let selectedGoalMinutes = 25;
let selectedBreakMinutes = 5;
let stream = null;
let camEnabled = true;
let wakeLock = null;
let sessionStartedAt = null;
let elapsedInterval = null;
let timerInterval = null;
let messageInterval = null;
let monitorInterval = null;
let camOffInterval = null;
let blurCount = 0;
let pauseCount = 0;
let breakCount = 0;
let camOffSeconds = 0;
let timerPaused = false;
let onBreak = false;
let remainingSeconds = 25 * 60;
let breakRemaining = 0;
let activeTaskTab = 'list';
let activeSection = 'actions';
let currentSessionLog = null;
let audioContext = null;
let noiseNode = null;
let gainNode = null;
let toneOscillator = null;

const roomMessages = [
  '今のタスクを1つだけ進めましょう。',
  '机に戻ったら、そのまま30秒だけ続けましょう。',
  '迷ったら、いちばん小さい作業から始めましょう。',
  'いま進めるべきタスクを1件だけ選んで集中しましょう。',
  '完璧より前進です。今日の目標を少しでも進めましょう。'
];
const monitorTexts = ['在席確認中', '学習状況監視中', '視線確認中', '離席警戒中'];
const subMonitorTexts = ['離席検知 有効', '画面切替 検知中', 'カメラ監視 有効', '集中確認 有効'];
const teacherAlerts = [
  'このルームでは離席・画面切替・学習停止を前提に確認しながら進行します。今のタスクに集中してください。',
  '姿勢が崩れないようにして、このまま画面を前面に保ってください。',
  '手が止まっているなら、まずは1問・1ページだけ進めてください。',
  'このセッション中は在席前提で進みます。今の学習を継続してください。'
];
const bannerTexts = [
  'このルームは在席確認つきで進行しています',
  '離席検知と学習確認を前提に進行しています',
  '監視前提の集中ルームです。画面を前面に保ってください'
];

function formatClock(totalSeconds) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
function formatMinSec(totalSeconds) {
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}
function todayKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
function loadDailyTotal(key = todayKey()) {
  const raw = localStorage.getItem(`focus-room-total-${key}`);
  return raw ? Number(raw) : 0;
}
function saveDailyTotal(seconds) {
  localStorage.setItem(`focus-room-total-${todayKey()}`, String(seconds));
  const min = Math.floor(seconds / 60);
  const h = String(Math.floor(min / 60)).padStart(2, '0');
  const m = String(min % 60).padStart(2, '0');
  dailyTotalEl.textContent = `${h}:${m}`;
}
function setStoredValue(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function getStoredValue(key, defaultValue) {
  const raw = localStorage.getItem(key);
  if (raw === null) return defaultValue;
  try { return JSON.parse(raw); } catch { return defaultValue; }
}
function uid() { return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`; }
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
function randomFrom(list) { return list[Math.floor(Math.random() * list.length)]; }
function updateMessage(force = false, customText = "") {
  const text = customText || randomFrom(roomMessages);
  focusMessage.textContent = text;
  if (force) {
    focusMessage.animate(
      [{ opacity: 0.2, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 280, easing: 'ease-out' }
    );
  }
}
function setCoachWidgetStatus(text) { coachWidgetStatus.textContent = text; }
function setMonitorText(text) { monitoringText.textContent = text; }
function setTeacherAlert(text) { teacherAlertText.textContent = text; }
function setBannerText(text) { surveillanceBannerText.textContent = text; }
function setSubMonitorText(text) { monitoringSubText.textContent = text; }

function applySection() {
  const mapping = {
    actions: [sectionActions, tabActionsBtn],
    tasks: [sectionTasks, tabTasksBtn],
    room: [sectionRoom, tabRoomBtn],
    stats: [sectionStats, tabStatsBtn],
    settings: [sectionSettings, tabSettingsBtn]
  };
  Object.entries(mapping).forEach(([key, [section, btn]]) => {
    const active = key === activeSection;
    section.classList.toggle('active', active);
    btn.classList.toggle('active', active);
  });
  setStoredValue(STORAGE_KEYS.activeSection, activeSection);
}
function openSection(name) { activeSection = name; applySection(); }
function applyTaskTab() {
  const listOpen = activeTaskTab === 'list';
  taskTabListBtn.classList.toggle('active', listOpen);
  taskTabAddBtn.classList.toggle('active', !listOpen);
  taskTabList.classList.toggle('active', listOpen);
  taskTabAdd.classList.toggle('active', !listOpen);
  setStoredValue(STORAGE_KEYS.activeTaskTab, activeTaskTab);
}
function openTaskTab(name) { activeTaskTab = name; applyTaskTab(); }

function applyCoachName() {
  const name = coachNameInput.value.trim() || 'SENSEI ROOM';
  coachNameInline.textContent = name;
  setStoredValue(STORAGE_KEYS.coachName, name);
}
function applyGoalMinutes(save = true) {
  selectedGoalMinutes = Number(goalMinutesSelect.value || 25);
  if (save) setStoredValue(STORAGE_KEYS.goalMinutes, selectedGoalMinutes);
  if (!onBreak) {
    remainingSeconds = selectedGoalMinutes * 60;
    goalTimerEl.textContent = formatMinSec(remainingSeconds);
    if (!stream) sessionType.textContent = '未開始';
  }
}
function applyBreakMinutes(save = true) {
  selectedBreakMinutes = Number(breakMinutesSelect.value || 5);
  if (save) setStoredValue(STORAGE_KEYS.breakMinutes, selectedBreakMinutes);
}
function saveDraftInputs() {
  setStoredValue(STORAGE_KEYS.taskDraftTitle, taskTitleInput.value.trim());
  setStoredValue(STORAGE_KEYS.taskDraftGoal, taskGoalInput.value.trim());
  setStoredValue(STORAGE_KEYS.taskDraftMemo, taskMemoInput.value.trim());
  setStoredValue(STORAGE_KEYS.taskDraftEstimate, taskEstimateSelect.value);
  setStoredValue(STORAGE_KEYS.taskDraftPriority, taskPrioritySelect.value);
}
function loadSavedSettings() {
  coachNameInput.value = getStoredValue(STORAGE_KEYS.coachName, 'SENSEI ROOM');
  goalMinutesSelect.value = String(getStoredValue(STORAGE_KEYS.goalMinutes, 25));
  breakMinutesSelect.value = String(getStoredValue(STORAGE_KEYS.breakMinutes, 5));
  nextGoalInput.value = getStoredValue(STORAGE_KEYS.nextGoal, '');
  taskTitleInput.value = getStoredValue(STORAGE_KEYS.taskDraftTitle, '');
  taskGoalInput.value = getStoredValue(STORAGE_KEYS.taskDraftGoal, '');
  taskMemoInput.value = getStoredValue(STORAGE_KEYS.taskDraftMemo, '');
  taskEstimateSelect.value = getStoredValue(STORAGE_KEYS.taskDraftEstimate, '30');
  taskPrioritySelect.value = getStoredValue(STORAGE_KEYS.taskDraftPriority, '高');
  tasks = getStoredValue(STORAGE_KEYS.tasks, []);
  activeTaskTab = getStoredValue(STORAGE_KEYS.activeTaskTab, 'list');
  activeSection = getStoredValue(STORAGE_KEYS.activeSection, 'actions');
}
function persistTasks() { setStoredValue(STORAGE_KEYS.tasks, tasks); }
function sortTasks(list) {
  const priorityOrder = { '高': 0, '中': 1, '低': 2 };
  return [...list].sort((a, b) => {
    if (a.status === '進行中' && b.status !== '進行中') return -1;
    if (a.status !== '進行中' && b.status === '進行中') return 1;
    if (a.status === '完了' && b.status !== '完了') return 1;
    if (a.status !== '完了' && b.status === '完了') return -1;
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) return priorityOrder[a.priority] - priorityOrder[b.priority];
    return a.createdAt - b.createdAt;
  });
}
function addTask() {
  const title = taskTitleInput.value.trim();
  const goal = taskGoalInput.value.trim();
  const memo = taskMemoInput.value.trim();
  const estimate = Number(taskEstimateSelect.value || 30);
  const priority = taskPrioritySelect.value || '高';
  if (!title) { alert('タスク名を入力してください。'); return; }
  tasks.push({ id: uid(), title, goal: goal || '未設定', memo: memo || '未設定', estimate, priority, status: '未開始', createdAt: Date.now() });
  persistTasks();
  renderTasks();
  updateMessage(true, `「${title}」を追加しました。`);
  taskTitleInput.value = '';
  taskGoalInput.value = '';
  taskMemoInput.value = '';
  taskEstimateSelect.value = '30';
  taskPrioritySelect.value = '高';
  saveDraftInputs();
  openTaskTab('list');
}
function updateTaskStatus(taskId, status) {
  tasks = tasks.map(task => task.id === taskId ? { ...task, status } : task);
  persistTasks();
  renderTasks();
  const changedTask = tasks.find(task => task.id === taskId);
  if (changedTask) updateMessage(true, `「${changedTask.title}」を${status}にしました。`);
}
function deleteTask(taskId) {
  const deletingTask = tasks.find(task => task.id === taskId);
  tasks = tasks.filter(task => task.id !== taskId);
  persistTasks();
  renderTasks();
  if (deletingTask) updateMessage(true, `「${deletingTask.title}」を削除しました。`);
}
function getActiveTask() { return sortTasks(tasks).find(task => task.status === '進行中') || null; }
function getCompletionRate() {
  if (tasks.length === 0) return 0;
  const done = tasks.filter(t => t.status === '完了').length;
  return Math.round((done / tasks.length) * 100);
}
function taskCardHtml(task) {
  return `
    <div class="task-item">
      <div class="task-item-top">
        <div>
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div class="task-meta">目標：${escapeHtml(task.goal)}</div>
          <div class="task-extra">予定時間：${task.estimate}分 / 優先度：${escapeHtml(task.priority)}</div>
          <div class="task-note">メモ：${escapeHtml(task.memo)}</div>
        </div>
        <span class="task-chip">${escapeHtml(task.status)}</span>
      </div>
      <div class="task-actions">
        <button class="btn btn-secondary" data-action="todo" data-id="${task.id}">未開始</button>
        <button class="btn btn-secondary" data-action="doing" data-id="${task.id}">進行中</button>
        <button class="btn btn-secondary" data-action="done" data-id="${task.id}">完了</button>
        <button class="btn btn-secondary" data-action="delete" data-id="${task.id}">削除</button>
      </div>
    </div>`;
}
function updateActiveTaskBox() {
  const active = getActiveTask();
  if (!active) {
    activeTaskName.textContent = 'まだありません';
    activeTaskMeta.textContent = 'タスクを追加して進行中にするとここに固定表示されます。';
    return;
  }
  activeTaskName.textContent = active.title;
  activeTaskMeta.textContent = `予定時間 ${active.estimate}分 / 優先度 ${active.priority} / 目標 ${active.goal}`;
}
function renderTasks() {
  const sorted = sortTasks(tasks);
  taskSummaryCount.textContent = `${tasks.length}件`;
  completionRateEl.textContent = `${getCompletionRate()}%`;
  updateActiveTaskBox();
  if (sorted.length === 0) {
    const empty = '<p class="empty-text">追加したタスクはここに表示されます。</p>';
    taskManagerList.innerHTML = empty;
    taskOverviewList.innerHTML = empty;
    return;
  }
  const html = sorted.map(taskCardHtml).join('');
  taskManagerList.innerHTML = html;
  taskOverviewList.innerHTML = html;
}
function bindTaskActions(target) {
  target.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const taskId = button.dataset.id;
    const action = button.dataset.action;
    if (action === 'todo') updateTaskStatus(taskId, '未開始');
    if (action === 'doing') updateTaskStatus(taskId, '進行中');
    if (action === 'done') updateTaskStatus(taskId, '完了');
    if (action === 'delete') deleteTask(taskId);
  });
}

function getWeeklyLogs() { return getStoredValue(STORAGE_KEYS.weeklyLogs, {}); }
function setWeeklyLogs(logs) { setStoredValue(STORAGE_KEYS.weeklyLogs, logs); }
function updateWeeklyStats() {
  const logs = getWeeklyLogs();
  const days = Array.from({ length: 7 }, (_, i) => todayKey(-i));
  const totalMin = days.reduce((sum, key) => sum + (logs[key]?.minutes || 0), 0);
  weeklyTotalEl.textContent = `${totalMin}分`;
  const yesterday = loadDailyTotal(todayKey(-1));
  const today = loadDailyTotal(todayKey());
  const diff = Math.round((today - yesterday) / 60);
  dailyComparisonEl.textContent = `${diff >= 0 ? '+' : ''}${diff}分`;
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const mins = logs[todayKey(-i)]?.minutes || 0;
    if (mins > 0) streak += 1;
    else break;
  }
  streakDaysEl.textContent = `${streak}日`;
}
function updateFocusScore() {
  let score = 100;
  score -= blurCount * 8;
  score -= pauseCount * 5;
  score -= breakCount * 3;
  score -= Math.floor(camOffSeconds / 30) * 4;
  score = Math.max(0, Math.min(100, score));
  focusScoreEl.textContent = String(score);
}
function recordWeeklyMinutes() {
  const logs = getWeeklyLogs();
  logs[todayKey()] = { minutes: Math.round(loadDailyTotal(todayKey()) / 60), updatedAt: Date.now() };
  setWeeklyLogs(logs);
  updateWeeklyStats();
}
function updateCountersUI() {
  breakCountEl.textContent = String(breakCount);
  pauseCountEl.textContent = String(pauseCount);
  camOffTimeEl.textContent = `${camOffSeconds}秒`;
  blurCountEl.textContent = String(blurCount);
  updateFocusScore();
}
function clearTimers() {
  clearInterval(elapsedInterval);
  clearInterval(timerInterval);
  clearInterval(messageInterval);
  clearInterval(monitorInterval);
  clearInterval(camOffInterval);
}
function setRoomButtonsStarted(started) {
  toggleCamBtn.disabled = !started;
  pauseTimerBtn.disabled = !started;
  breakBtn.disabled = !started || onBreak;
  endBreakBtn.disabled = !started || !onBreak;
}
function startMonitorEffects() {
  clearInterval(monitorInterval);
  monitorInterval = setInterval(() => {
    setMonitorText(randomFrom(monitorTexts));
    setSubMonitorText(randomFrom(subMonitorTexts));
    setTeacherAlert(randomFrom(teacherAlerts));
    setBannerText(randomFrom(bannerTexts));
  }, 8000);
}
function startCamOffCounter() {
  clearInterval(camOffInterval);
  camOffInterval = setInterval(() => {
    if (stream && !camEnabled) {
      camOffSeconds += 1;
      updateCountersUI();
    }
  }, 1000);
}
function playNotification() {
  try {
    const ctx = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    audioContext = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 880; gain.gain.value = 0.02;
    osc.start(); osc.stop(ctx.currentTime + 0.2);
  } catch {}
}
function startRoomTimers(resetElapsed = true) {
  clearTimers();
  if (resetElapsed || !sessionStartedAt) sessionStartedAt = Date.now();
  timerPaused = false;
  pauseTimerBtn.textContent = 'タイマー一時停止';
  const baselineDaily = loadDailyTotal();
  saveDailyTotal(baselineDaily);

  elapsedInterval = setInterval(() => {
    if (timerPaused) return;
    const elapsedSec = Math.floor((Date.now() - sessionStartedAt) / 1000);
    elapsedTimeEl.textContent = formatClock(elapsedSec);
    if (!onBreak) {
      saveDailyTotal(baselineDaily + elapsedSec);
      recordWeeklyMinutes();
    }
  }, 1000);

  timerInterval = setInterval(() => {
    if (timerPaused) return;
    if (onBreak) {
      breakRemaining -= 1;
      goalTimerEl.textContent = formatMinSec(breakRemaining);
      if (breakRemaining <= 0) {
        playNotification();
        endBreak();
      }
      return;
    }
    remainingSeconds -= 1;
    goalTimerEl.textContent = formatMinSec(remainingSeconds);
    if (remainingSeconds <= 0) {
      remainingSeconds = 0;
      goalTimerEl.textContent = formatMinSec(remainingSeconds);
      sessionType.textContent = '目標時間に到達';
      setCoachWidgetStatus('学習時間に到達');
      setMonitorText('確認強化中');
      setTeacherAlert('目標時間に到達しました。離席せず、タスクの進み具合を確認してください。');
      setBannerText('学習時間到達後も在席確認を継続しています');
      updateMessage(true, '目標時間に到達しました。タスクの進み具合を確認しましょう。');
    }
  }, 1000);

  messageInterval = setInterval(() => {
    if (timerPaused) return;
    updateMessage(true);
  }, 60000);

  startMonitorEffects();
  startCamOffCounter();
}

function beginSessionLog() {
  currentSessionLog = {
    id: uid(),
    startedAt: new Date().toISOString(),
    goalMinutes: selectedGoalMinutes,
    nextGoal: nextGoalInput.value.trim() || '',
    blurCount: 0, pauseCount: 0, breakCount: 0, camOffSeconds: 0,
    tasks: tasks.map(t => ({ title: t.title, status: t.status, estimate: t.estimate, priority: t.priority }))
  };
}
function finalizeSessionLog() {
  if (!currentSessionLog) return null;
  currentSessionLog.endedAt = new Date().toISOString();
  currentSessionLog.dailyTotalMinutes = Math.round(loadDailyTotal(todayKey()) / 60);
  currentSessionLog.blurCount = blurCount;
  currentSessionLog.pauseCount = pauseCount;
  currentSessionLog.breakCount = breakCount;
  currentSessionLog.camOffSeconds = camOffSeconds;
  currentSessionLog.focusScore = Number(focusScoreEl.textContent || '0');
  currentSessionLog.completionRate = getCompletionRate();
  currentSessionLog.tasks = tasks.map(t => ({ title: t.title, status: t.status, estimate: t.estimate, priority: t.priority }));
  const sessions = getStoredValue(STORAGE_KEYS.sessions, []);
  sessions.unshift(currentSessionLog);
  setStoredValue(STORAGE_KEYS.sessions, sessions.slice(0, 50));
  return currentSessionLog;
}
function renderReport(log) {
  if (!log) return;
  const done = log.tasks.filter(t => t.status === '完了').length;
  reportBody.innerHTML = `
    <div class="report-item"><strong>集中スコア</strong><div>${log.focusScore}</div></div>
    <div class="report-item"><strong>達成率</strong><div>${log.completionRate}%（完了 ${done}/${log.tasks.length}）</div></div>
    <div class="report-item"><strong>離席 / 停止 / 休憩</strong><div>離席 ${log.blurCount}回 / 停止 ${log.pauseCount}回 / 休憩 ${log.breakCount}回</div></div>
    <div class="report-item"><strong>カメラ停止時間</strong><div>${log.camOffSeconds}秒</div></div>
    <div class="report-item"><strong>次回目標</strong><div>${escapeHtml(log.nextGoal || '未設定')}</div></div>
  `;
  reportModal.classList.remove('hidden');
}
function renderHistory() {
  const sessions = getStoredValue(STORAGE_KEYS.sessions, []);
  if (sessions.length === 0) {
    historyBody.innerHTML = '<p class="empty-text">履歴はまだありません。</p>';
  } else {
    historyBody.innerHTML = sessions.map(s => `
      <div class="history-item">
        <strong>${new Date(s.startedAt).toLocaleString('ja-JP')}</strong>
        <div>集中スコア ${s.focusScore} / 達成率 ${s.completionRate}% / 離席 ${s.blurCount}回</div>
      </div>
    `).join('');
  }
  historyModal.classList.remove('hidden');
}
function exportLogs() {
  const data = { sessions: getStoredValue(STORAGE_KEYS.sessions, []), weekly: getWeeklyLogs(), tasks };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'focus-room-log.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function ensureAudioContext() {
  if (!audioContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) throw new Error('AudioContext unsupported');
    audioContext = new Ctx();
  }
  if (audioContext.state === 'suspended') await audioContext.resume();
}
function createNoiseBuffer(ctx, type = 'white') {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    if (type === 'brown') {
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    } else {
      output[i] = white;
    }
  }
  return buffer;
}
async function toggleSound() {
  const mode = soundModeSelect.value;
  if (mode === 'off') { stopSound(); return; }
  if (noiseNode || toneOscillator) { stopSound(); return; }
  await ensureAudioContext();
  gainNode = audioContext.createGain();
  gainNode.gain.value = Number(soundVolumeRange.value) / 1000;
  gainNode.connect(audioContext.destination);
  if (mode === 'tone') {
    toneOscillator = audioContext.createOscillator();
    toneOscillator.type = 'sine';
    toneOscillator.frequency.value = 180;
    toneOscillator.connect(gainNode);
    toneOscillator.start();
  } else {
    noiseNode = audioContext.createBufferSource();
    noiseNode.buffer = createNoiseBuffer(audioContext, mode);
    noiseNode.loop = true;
    noiseNode.connect(gainNode);
    noiseNode.start();
  }
  soundToggleBtn.textContent = 'サウンド停止';
}
function stopSound() {
  try { noiseNode?.stop?.(); } catch {}
  try { toneOscillator?.stop?.(); } catch {}
  noiseNode = null;
  toneOscillator = null;
  gainNode?.disconnect?.();
  gainNode = null;
  soundToggleBtn.textContent = 'サウンド開始';
}
function updateSoundVolume() {
  if (gainNode) gainNode.gain.value = Number(soundVolumeRange.value) / 1000;
}

async function startCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('このブラウザではカメラ取得に対応していません。');
    return;
  }
  if (tasks.length === 0) {
    alert('先にタスクを1件以上追加してください。');
    openSection('tasks');
    openTaskTab('add');
    return;
  }
  applyCoachName(); applyGoalMinutes(); applyBreakMinutes(); beginSessionLog();
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });
    selfVideoThumb.srcObject = stream;
    selfVideoMain.srcObject = stream;
    cameraStatus.textContent = '稼働中';
    watchState.textContent = '入室中';
    coachMessageState.textContent = '表示中';
    coachStatePill.textContent = '監視中';
    sessionType.textContent = `${selectedGoalMinutes}分の学習中`;
    setCoachWidgetStatus('学習状況をリアルタイムで確認しています');
    setMonitorText('在席確認中');
    setSubMonitorText('離席検知 有効');
    setTeacherAlert('このルームでは離席・画面切替・学習停止を前提に確認しながら進行します。今のタスクに集中してください。');
    setBannerText('このルームは在席確認つきで進行しています');
    startBtn.disabled = true;
    setRoomButtonsStarted(true);
    camEnabled = true;
    toggleCamBtn.textContent = 'カメラ停止';
    onBreak = false;
    remainingSeconds = selectedGoalMinutes * 60;
    goalTimerEl.textContent = formatMinSec(remainingSeconds);
    const firstTodo = sortTasks(tasks).find(task => task.status === '未開始');
    if (firstTodo) updateTaskStatus(firstTodo.id, '進行中');
    startRoomTimers(true);
    updateMessage(true, '入室しました。今日のタスクを順番に進めましょう。');
    openSection('actions');
  } catch (error) {
    console.error(error);
    alert('カメラ許可が必要です。ブラウザの権限を確認してください。');
  }
}
function stopCamera() {
  if (stream) stream.getTracks().forEach(track => track.stop());
  selfVideoThumb.srcObject = null;
  selfVideoMain.srcObject = null;
  stream = null;
  cameraStatus.textContent = '待機中';
  watchState.textContent = '待機中';
  coachMessageState.textContent = '表示中';
  coachStatePill.textContent = '接続中';
  sessionType.textContent = '未開始';
  setCoachWidgetStatus('ルーム待機中');
  setMonitorText('在席確認前');
  setSubMonitorText('離席検知 有効');
  setTeacherAlert('目標時間を設定して、今日のタスクを追加してから入室してください。');
  setBannerText('このルームは在席確認つきで進行しています');
  startBtn.disabled = false;
  setRoomButtonsStarted(false);
  breakBtn.disabled = true;
  endBreakBtn.disabled = true;
  onBreak = false;
  clearTimers();
  const log = finalizeSessionLog();
  if (log) renderReport(log);
}
function toggleCameraEnabled() {
  if (!stream) return;
  const track = stream.getVideoTracks()[0];
  if (!track) return;
  camEnabled = !camEnabled;
  track.enabled = camEnabled;
  toggleCamBtn.textContent = camEnabled ? 'カメラ停止' : 'カメラ再開';
  cameraStatus.textContent = camEnabled ? '稼働中' : '一時停止';
  setMonitorText(camEnabled ? '映像確認中' : '映像停止中');
  setSubMonitorText(camEnabled ? '離席検知 有効' : '映像停止 記録中');
}
function toggleTimerPause() {
  if (!stream) return;
  timerPaused = !timerPaused;
  pauseCount += 1;
  pauseTimerBtn.textContent = timerPaused ? 'タイマー再開' : 'タイマー一時停止';
  coachMessageState.textContent = timerPaused ? '停止中' : '表示中';
  setCoachWidgetStatus(timerPaused ? '一時停止中' : '学習状況をリアルタイムで確認しています');
  setMonitorText(timerPaused ? '確認待機中' : '在席確認中');
  updateCountersUI();
  updateMessage(true, timerPaused ? 'タイマーを一時停止しました。' : 'タイマーを再開しました。');
}
function startBreak() {
  if (!stream || onBreak) return;
  onBreak = true;
  breakCount += 1;
  breakRemaining = selectedBreakMinutes * 60;
  sessionType.textContent = '休憩中';
  breakBtn.disabled = true;
  endBreakBtn.disabled = false;
  setCoachWidgetStatus('休憩中');
  setMonitorText('休憩確認中');
  setTeacherAlert('休憩中です。戻ったらすぐに学習を再開してください。');
  setBannerText('休憩中も在席状態の確認を継続しています');
  updateCountersUI();
  playNotification();
  updateMessage(true, '休憩に入りました。戻ったら「休憩終了」を押してください。');
}
function endBreak() {
  if (!stream || !onBreak) return;
  onBreak = false;
  sessionType.textContent = `${selectedGoalMinutes}分の学習中`;
  breakBtn.disabled = false;
  endBreakBtn.disabled = true;
  setCoachWidgetStatus('学習状況をリアルタイムで確認しています');
  setMonitorText('在席確認中');
  setTeacherAlert('休憩終了です。姿勢と視線を整えて学習を再開してください。');
  setBannerText('このルームは在席確認つきで進行しています');
  playNotification();
  updateMessage(true, '休憩を終了しました。学習を再開しましょう。');
}
function restartSessionFromSettings() {
  applyCoachName(); applyGoalMinutes(); applyBreakMinutes();
  elapsedTimeEl.textContent = '00:00:00';
  sessionStartedAt = Date.now();
  onBreak = false;
  breakBtn.disabled = !stream;
  endBreakBtn.disabled = true;
  remainingSeconds = selectedGoalMinutes * 60;
  goalTimerEl.textContent = formatMinSec(remainingSeconds);
  if (stream) {
    sessionType.textContent = `${selectedGoalMinutes}分の学習中`;
    setCoachWidgetStatus('学習状況をリアルタイムで確認しています');
    setMonitorText('在席確認中');
    setTeacherAlert('設定を更新しました。このまま学習を継続してください。');
    startRoomTimers(true);
    updateMessage(true, '設定内容でセッションを再開始しました。');
  } else {
    sessionType.textContent = '未開始';
    setCoachWidgetStatus('ルーム待機中');
    updateMessage(true, '設定を更新しました。');
  }
}
async function requestFullscreen() {
  const elem = document.documentElement;
  if (!document.fullscreenElement) await elem.requestFullscreen?.();
  else await document.exitFullscreen?.();
}
async function requestWakeLock() {
  if (!('wakeLock' in navigator)) {
    alert('この端末では画面スリープ防止に未対応です。');
    return;
  }
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLockBtn.textContent = 'スリープ防止中';
    wakeLock.addEventListener('release', () => { wakeLockBtn.textContent = '画面スリープ防止'; });
  } catch (error) {
    console.error(error);
    alert('画面スリープ防止を有効にできませんでした。');
  }
}
async function initLiffApp() {
  if (!window.liff) {
    lineProfileName.textContent = '通常ブラウザで利用中';
    launchMode.textContent = '通常ブラウザ';
    return;
  }
  if (!LIFF_ID) {
    lineProfileName.textContent = '通常ブラウザで利用中';
    launchMode.textContent = '通常ブラウザ';
    return;
  }
  try {
    await liff.init({ liffId: LIFF_ID });
    launchMode.textContent = liff.isInClient() ? 'LINE内ブラウザ' : '外部ブラウザ';
    if (!liff.isLoggedIn()) {
      if (ALLOW_NON_LIFF_MODE) {
        lineProfileName.textContent = 'ログインなしで利用中';
        return;
      }
      liff.login();
      return;
    }
    const profile = await liff.getProfile();
    lineProfileName.textContent = `${profile.displayName} さん`;
  } catch (error) {
    console.error('LIFF初期化失敗', error);
    lineProfileName.textContent = 'ユーザー情報の取得に失敗しました';
  }
}
function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
function applyUserWidgetPosition(x, y, save = true) {
  const margin = 10;
  const maxX = window.innerWidth - userWidget.offsetWidth - margin;
  const maxY = window.innerHeight - userWidget.offsetHeight - margin;
  const finalX = clamp(x, margin, maxX);
  const finalY = clamp(y, margin, maxY);
  userWidget.style.left = `${finalX}px`;
  userWidget.style.top = `${finalY}px`;
  userWidget.style.right = 'auto';
  if (save) setStoredValue(STORAGE_KEYS.userWidgetPos, { x: finalX, y: finalY });
}
function restoreUserWidgetPosition() {
  const saved = getStoredValue(STORAGE_KEYS.userWidgetPos, null);
  if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') applyUserWidgetPosition(saved.x, saved.y, false);
  else {
    const margin = 14;
    const x = window.innerWidth - userWidget.offsetWidth - margin;
    applyUserWidgetPosition(x, 14, false);
  }
}
function initDragWidget() {
  let startX = 0, startY = 0, originX = 0, originY = 0, dragging = false;
  const onPointerMove = (event) => {
    if (!dragging) return;
    const nextX = originX + (event.clientX - startX);
    const nextY = originY + (event.clientY - startY);
    applyUserWidgetPosition(nextX, nextY, false);
  };
  const onPointerUp = () => {
    if (!dragging) return;
    dragging = false;
    const rect = userWidget.getBoundingClientRect();
    const snapLeft = rect.left < window.innerWidth / 2;
    const targetX = snapLeft ? 10 : window.innerWidth - rect.width - 10;
    applyUserWidgetPosition(targetX, rect.top, true);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  };
  userWidgetHandle.addEventListener('pointerdown', (event) => {
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    const rect = userWidget.getBoundingClientRect();
    originX = rect.left;
    originY = rect.top;
    userWidgetHandle.setPointerCapture?.(event.pointerId);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  });
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    blurCount += 1;
    updateCountersUI();
    hiddenOverlay.classList.remove('hidden');
    setMonitorText('離席検知');
    setSubMonitorText('警告表示中');
    setTeacherAlert('画面から離れています。すぐに戻って学習を再開してください。');
    setBannerText('離席検知中です。画面へ戻ってください');
    updateMessage(true, 'この画面に戻って、そのまま学習を続けましょう。');
  } else {
    hiddenOverlay.classList.add('hidden');
    if (stream && !timerPaused && !onBreak) {
      setMonitorText('在席確認中');
      setSubMonitorText('離席検知 有効');
    }
  }
});
document.addEventListener('visibilitychange', async () => {
  if (wakeLock !== null && document.visibilityState === 'visible') {
    try { wakeLock = await navigator.wakeLock.request('screen'); } catch (error) { console.error(error); }
  }
});
window.addEventListener('beforeunload', (event) => {
  if (stream) {
    event.preventDefault();
    event.returnValue = '';
  }
});
window.addEventListener('resize', () => {
  const rect = userWidget.getBoundingClientRect();
  applyUserWidgetPosition(rect.left, rect.top, true);
});

tabActionsBtn.addEventListener('click', () => openSection('actions'));
tabTasksBtn.addEventListener('click', () => openSection('tasks'));
tabRoomBtn.addEventListener('click', () => openSection('room'));
tabStatsBtn.addEventListener('click', () => openSection('stats'));
tabSettingsBtn.addEventListener('click', () => openSection('settings'));
openSettingsBtn.addEventListener('click', () => openSection('settings'));
taskTabListBtn.addEventListener('click', () => openTaskTab('list'));
taskTabAddBtn.addEventListener('click', () => openTaskTab('add'));
addTaskBtn.addEventListener('click', addTask);
taskTitleInput.addEventListener('input', saveDraftInputs);
taskGoalInput.addEventListener('input', saveDraftInputs);
taskEstimateSelect.addEventListener('change', saveDraftInputs);
taskPrioritySelect.addEventListener('change', saveDraftInputs);
taskMemoInput.addEventListener('input', saveDraftInputs);
goalMinutesSelect.addEventListener('change', () => applyGoalMinutes(true));
breakMinutesSelect.addEventListener('change', () => applyBreakMinutes(true));
coachNameInput.addEventListener('input', applyCoachName);
saveNextGoalBtn.addEventListener('click', () => {
  setStoredValue(STORAGE_KEYS.nextGoal, nextGoalInput.value.trim());
  alert('次回目標を保存しました。');
});
openHistoryBtn.addEventListener('click', renderHistory);
closeHistoryBtn.addEventListener('click', () => historyModal.classList.add('hidden'));
exportLogsBtn.addEventListener('click', exportLogs);
closeReportBtn.addEventListener('click', () => reportModal.classList.add('hidden'));
copyReportBtn.addEventListener('click', async () => {
  const text = reportBody.innerText;
  await navigator.clipboard.writeText(text);
  alert('レポートをコピーしました。');
});
soundToggleBtn.addEventListener('click', toggleSound);
soundVolumeRange.addEventListener('input', updateSoundVolume);
soundModeSelect.addEventListener('change', stopSound);
startBtn.addEventListener('click', startCamera);
toggleCamBtn.addEventListener('click', toggleCameraEnabled);
pauseTimerBtn.addEventListener('click', toggleTimerPause);
breakBtn.addEventListener('click', startBreak);
endBreakBtn.addEventListener('click', endBreak);
nextMsgBtn.addEventListener('click', () => {
  setTeacherAlert(randomFrom(teacherAlerts));
  setBannerText(randomFrom(bannerTexts));
  updateMessage(true);
});
restartSessionBtn.addEventListener('click', restartSessionFromSettings);
wakeLockBtn.addEventListener('click', requestWakeLock);
fullscreenBtn.addEventListener('click', requestFullscreen);
leaveBtn.addEventListener('click', () => {
  stopCamera();
  if (document.fullscreenElement) document.exitFullscreen?.();
  alert('退出しました。おつかれさまでした。');
});

window.addEventListener('DOMContentLoaded', async () => {
  saveDailyTotal(loadDailyTotal());
  loadSavedSettings();
  applyCoachName();
  applyGoalMinutes(false);
  applyBreakMinutes(false);
  renderTasks();
  bindTaskActions(taskManagerList);
  bindTaskActions(taskOverviewList);
  setRoomButtonsStarted(false);
  breakBtn.disabled = true;
  endBreakBtn.disabled = true;
  applyTaskTab();
  applySection();
  restoreUserWidgetPosition();
  initDragWidget();
  updateWeeklyStats();
  updateCountersUI();
  setCoachWidgetStatus('学習状況をリアルタイムで確認しています');
  setMonitorText('在席確認前');
  setSubMonitorText('離席検知 有効');
  setTeacherAlert('このルームでは離席・画面切替・学習停止を前提に確認しながら進行します。今のタスクに集中してください。');
  setBannerText('このルームは在席確認つきで進行しています');
  nextGoalInput.value = getStoredValue(STORAGE_KEYS.nextGoal, '');
  await initLiffApp();
});
