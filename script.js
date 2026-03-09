const APP_CONFIG = window.APP_CONFIG || {};
const LS = {
  tasks: "studylab_v7_tasks",
  sessions: "studylab_v7_sessions",
  memoSubject: "studylab_v7_memo_subject",
  memoText: "studylab_v7_memo_text",
  preset: "studylab_v7_preset"
};

const drawer = document.getElementById("drawer");
const drawerShade = document.getElementById("drawerShade");
const menuBtn = document.getElementById("menuBtn");
const navItems = [...document.querySelectorAll(".nav-item")];
const pages = [...document.querySelectorAll(".page")];

const todayMinutes = document.getElementById("todayMinutes");
const totalHours = document.getElementById("totalHours");
const openTasks = document.getElementById("openTasks");
const completionRate = document.getElementById("completionRate");
const priorityTasks = document.getElementById("priorityTasks");

const cameraToggleBtn = document.getElementById("cameraToggleBtn");
const cameraVideo = document.getElementById("cameraVideo");
const cameraPlaceholder = document.getElementById("cameraPlaceholder");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const wakeLockBtn = document.getElementById("wakeLockBtn");
const activeTaskSelect = document.getElementById("activeTaskSelect");
const timerNumber = document.getElementById("timerNumber");
const timerLabel = document.getElementById("timerLabel");
const startPauseBtn = document.getElementById("startPauseBtn");
const resetTimerBtn = document.getElementById("resetTimerBtn");
const breakBtn = document.getElementById("breakBtn");
const sessionMeta = document.getElementById("sessionMeta");
const memoSubject = document.getElementById("memoSubject");
const memoText = document.getElementById("memoText");
const memoTotal = document.getElementById("memoTotal");
const saveSessionBtn = document.getElementById("saveSessionBtn");
const studyMessage = document.getElementById("studyMessage");
const presetChips = [...document.querySelectorAll(".preset-chip")];

const taskTitleInput = document.getElementById("taskTitleInput");
const taskSubjectInput = document.getElementById("taskSubjectInput");
const taskDateInput = document.getElementById("taskDateInput");
const taskPriorityInput = document.getElementById("taskPriorityInput");
const taskEstimateInput = document.getElementById("taskEstimateInput");
const taskNoteInput = document.getElementById("taskNoteInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskSearchInput = document.getElementById("taskSearchInput");
const filterChips = [...document.querySelectorAll(".filter-chip")];
const taskList = document.getElementById("taskList");

const recordTotalHours = document.getElementById("recordTotalHours");
const recordSessionCount = document.getElementById("recordSessionCount");
const recordDailyAvg = document.getElementById("recordDailyAvg");
const recordSubjectCount = document.getElementById("recordSubjectCount");
const barsMount = document.getElementById("barsMount");
const legendList = document.getElementById("legendList");
const sessionList = document.getElementById("sessionList");

const tipCategoryChip = document.getElementById("tipCategoryChip");
const tipCounter = document.getElementById("tipCounter");
const tipTitle = document.getElementById("tipTitle");
const tipText = document.getElementById("tipText");
const prevTipBtn = document.getElementById("prevTipBtn");
const nextTipBtn = document.getElementById("nextTipBtn");
const randomTipBtn = document.getElementById("randomTipBtn");
const tipChips = [...document.querySelectorAll(".tip-chip")];
const tipList = document.getElementById("tipList");

const exportDataBtn = document.getElementById("exportDataBtn");
const importDataInput = document.getElementById("importDataInput");
const resetAllDataBtn = document.getElementById("resetAllDataBtn");

let tasks = loadJSON(LS.tasks, [
  {id:id(), title:"数学 第5章", subject:"数学", due:"2026/03/10", priority:"高", estimate:40, note:"問題集を10ページ", status:"doing", loggedMinutes:20},
  {id:id(), title:"英単語 Unit12-15", subject:"英語", due:"2026/03/12", priority:"中", estimate:30, note:"発音も確認", status:"todo", loggedMinutes:0},
  {id:id(), title:"理科ワーク", subject:"理科", due:"2026/03/14", priority:"低", estimate:25, note:"復習用", status:"todo", loggedMinutes:0}
]);
let sessions = loadJSON(LS.sessions, []);
let cameraStream = null;
let wakeLock = null;
let currentPreset = Number(localStorage.getItem(LS.preset) || 25);
let timerSeconds = currentPreset * 60;
let breakSnapshotSeconds = currentPreset * 60;
let timerInterval = null;
let timerRunning = false;
let breakMode = false;
let taskFilter = "all";
let tipFilter = "all";
let tipIndex = 0;

const tips = [
  {category:"集中力", title:"ポモドーロ", text:"25分集中して5分休憩を挟むだけでも、集中の波を作りやすくなります。"},
  {category:"記憶術", title:"説明できるか確認する", text:"読んだ内容を自分の言葉で説明できるかを見ると、理解不足が見えます。"},
  {category:"健康", title:"学習前に水を飲む", text:"軽い脱水でも集中しづらくなるので、始める前に少し水分を取ると安定しやすいです。"},
  {category:"勉強法", title:"最初の5分だけ始める", text:"やる気が出なくても、5分だけ始めると着手のハードルが下がります。"},
  {category:"集中力", title:"視界から不要物を減らす", text:"机の上の情報量を減らすだけでも、注意散漫になりにくくなります。"},
  {category:"記憶術", title:"間隔を空けて復習する", text:"詰め込みより、少し日を空けて繰り返す方が長く残りやすいです。"},
  {category:"健康", title:"休憩は短く切る", text:"長く休むより、短く切って戻る方が学習の流れを保ちやすいです。"},
  {category:"勉強法", title:"次回の最初の1タスクを決める", text:"終わる前に次に何をするか決めておくと、翌回の着手が早くなります。"}
];

function id(){ return Math.random().toString(36).slice(2,10); }
function loadJSON(key, fallback){
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function saveJSON(key, value){
  localStorage.setItem(key, JSON.stringify(value));
}
function escapeHtml(str){
  return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}
function openDrawer(){
  drawer.classList.add("open");
  drawerShade.classList.add("show");
}
function closeDrawer(){
  drawer.classList.remove("open");
  drawerShade.classList.remove("show");
}
function showPage(page){
  pages.forEach(p => p.classList.toggle("active", p.dataset.page === page));
  navItems.forEach(n => n.classList.toggle("active", n.dataset.page === page));
  closeDrawer();
  if (page === "dashboard" || page === "records") renderStats();
}
menuBtn.addEventListener("click", openDrawer);
drawerShade.addEventListener("click", closeDrawer);
navItems.forEach(btn => btn.addEventListener("click", () => showPage(btn.dataset.page)));
document.querySelectorAll("[data-go]").forEach(btn => btn.addEventListener("click", () => showPage(btn.dataset.go)));

function formatTimer(seconds){
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2,"0")}:${String(safe % 60).padStart(2,"0")}`;
}
function renderTimer(){
  timerNumber.textContent = formatTimer(timerSeconds);
}
function setPlayButton(){
  startPauseBtn.innerHTML = timerRunning ? '<svg><use href="#i-pause"/></svg>' : '<svg><use href="#i-play"/></svg>';
}
function updateTimerLabel(text){
  timerLabel.textContent = text;
}
function stopTimerLoop(){
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  setPlayButton();
}
function startTimerLoop(){
  stopTimerLoop();
  timerRunning = true;
  setPlayButton();
  timerInterval = setInterval(() => {
    if (timerSeconds > 0){
      timerSeconds -= 1;
      renderTimer();
      return;
    }
    stopTimerLoop();
    if (breakMode){
      timerSeconds = breakSnapshotSeconds;
      breakMode = false;
      renderTimer();
      updateTimerLabel("学習再開待ち");
      studyMessage.textContent = "休憩が終わりました。再開しましょう。";
    } else {
      updateTimerLabel("完了");
      studyMessage.textContent = "1セッション完了です。保存して記録に残せます。";
      sessionMeta.textContent = `${sessions.length}件保存済み`;
    }
  }, 1000);
}
renderTimer();
setPlayButton();

presetChips.forEach(chip => chip.addEventListener("click", () => {
  presetChips.forEach(c => c.classList.remove("active"));
  chip.classList.add("active");
  currentPreset = Number(chip.dataset.preset);
  localStorage.setItem(LS.preset, String(currentPreset));
  stopTimerLoop();
  breakMode = false;
  timerSeconds = currentPreset * 60;
  breakSnapshotSeconds = timerSeconds;
  renderTimer();
  updateTimerLabel("待機中");
}));

startPauseBtn.addEventListener("click", () => {
  if (!timerRunning){
    if (timerSeconds <= 0 && !breakMode){
      timerSeconds = currentPreset * 60;
      renderTimer();
    }
    updateTimerLabel(breakMode ? "休憩中" : "学習中");
    studyMessage.textContent = breakMode ? "休憩中です。戻ったらそのまま再開できます。" : "そのまま集中を維持しましょう。";
    startTimerLoop();
  } else {
    stopTimerLoop();
    updateTimerLabel(breakMode ? "休憩停止中" : "一時停止");
    studyMessage.textContent = "少し整えてから再開しましょう。";
  }
});
resetTimerBtn.addEventListener("click", () => {
  stopTimerLoop();
  breakMode = false;
  timerSeconds = currentPreset * 60;
  breakSnapshotSeconds = timerSeconds;
  renderTimer();
  updateTimerLabel("待機中");
  studyMessage.textContent = "タイマーをリセットしました。";
});
breakBtn.addEventListener("click", () => {
  if (!breakMode){
    breakSnapshotSeconds = timerSeconds > 0 ? timerSeconds : currentPreset * 60;
    timerSeconds = 5 * 60;
    breakMode = true;
    stopTimerLoop();
    renderTimer();
    updateTimerLabel("休憩中");
    studyMessage.textContent = "5分休憩です。終わると元の残り時間に戻れます。";
  } else {
    stopTimerLoop();
    timerSeconds = breakSnapshotSeconds;
    breakMode = false;
    renderTimer();
    updateTimerLabel("学習再開待ち");
    studyMessage.textContent = "休憩を終了しました。学習に戻りましょう。";
  }
});

cameraToggleBtn.addEventListener("click", async () => {
  if (cameraStream){
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
    cameraVideo.srcObject = null;
    cameraVideo.classList.add("hidden");
    cameraPlaceholder.classList.remove("hidden");
    studyMessage.textContent = "カメラをオフにしました。";
    return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({video:true, audio:false});
    cameraVideo.srcObject = cameraStream;
    cameraVideo.classList.remove("hidden");
    cameraPlaceholder.classList.add("hidden");
    studyMessage.textContent = "カメラをオンにしました。";
  } catch {
    alert("カメラ権限を許可してください。");
  }
});

fullscreenBtn.addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  } catch {}
});

wakeLockBtn.addEventListener("click", async () => {
  if (!("wakeLock" in navigator)) {
    alert("この端末では画面維持に対応していません。");
    return;
  }
  try {
    if (wakeLock){
      await wakeLock.release();
      wakeLock = null;
      wakeLockBtn.innerHTML = '<svg><use href="#i-lock"/></svg><span>画面維持</span>';
    } else {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLockBtn.innerHTML = '<svg><use href="#i-lock"/></svg><span>維持中</span>';
    }
  } catch {
    alert("画面維持を有効にできませんでした。");
  }
});

memoSubject.value = localStorage.getItem(LS.memoSubject) || "";
memoText.value = localStorage.getItem(LS.memoText) || "";
memoSubject.addEventListener("input", () => localStorage.setItem(LS.memoSubject, memoSubject.value));
memoText.addEventListener("input", () => localStorage.setItem(LS.memoText, memoText.value));

function renderActiveTaskSelect(){
  const available = tasks.filter(t => t.status !== "done");
  activeTaskSelect.innerHTML = available.length
    ? ['<option value="">進行中タスクを選択</option>'].concat(available.map(task => `<option value="${task.id}">${escapeHtml(task.title)} / ${escapeHtml(task.subject)}</option>`)).join("")
    : '<option value="">タスクがありません</option>';
}
saveSessionBtn.addEventListener("click", () => {
  const usedMinutes = Math.max(0, Math.floor((currentPreset * 60 - Math.min(breakSnapshotSeconds, timerSeconds)) / 60));
  const subject = (memoSubject.value || "").trim() || "未設定";
  const taskId = activeTaskSelect.value || "";
  const entry = {
    id: id(),
    date: new Date().toISOString().slice(0,10),
    subject,
    note: memoText.value.trim(),
    minutes: usedMinutes,
    taskId
  };
  sessions.unshift(entry);
  saveJSON(LS.sessions, sessions);

  if (taskId){
    const target = tasks.find(t => t.id === taskId);
    if (target){
      target.loggedMinutes = (target.loggedMinutes || 0) + usedMinutes;
      if (target.loggedMinutes > 0 && target.status === "todo") target.status = "doing";
      if ((target.loggedMinutes || 0) >= (Number(target.estimate) || 0) && Number(target.estimate || 0) > 0) target.status = "done";
      saveJSON(LS.tasks, tasks);
    }
  }

  memoText.value = "";
  localStorage.setItem(LS.memoText, "");
  studyMessage.textContent = "セッションを保存しました。";
  sessionMeta.textContent = `${sessions.length}件保存済み`;
  renderAll();
});

function priorityRank(priority){
  return ({高:0, 中:1, 低:2})[priority] ?? 9;
}
function filteredTasks(){
  const query = (taskSearchInput.value || "").trim().toLowerCase();
  return tasks
    .filter(task => taskFilter === "all" ? true : task.status === taskFilter)
    .filter(task => !query ? true : `${task.title} ${task.subject}`.toLowerCase().includes(query))
    .sort((a,b) => {
      if (a.status !== b.status) {
        const rank = {doing:0, todo:1, done:2};
        return rank[a.status] - rank[b.status];
      }
      if (priorityRank(a.priority) !== priorityRank(b.priority)) return priorityRank(a.priority) - priorityRank(b.priority);
      return (a.due || "").localeCompare(b.due || "");
    });
}
function renderTaskList(){
  const rows = filteredTasks();
  taskList.innerHTML = rows.length ? rows.map(task => {
    const progress = Number(task.estimate || 0) > 0 ? Math.min(100, Math.round(((task.loggedMinutes || 0) / Number(task.estimate)) * 100)) : 0;
    return `
      <div class="task-item">
        <div class="task-item-top">
          <div class="task-main">
            <div class="task-title-row">
              <div class="task-name">${escapeHtml(task.title)}</div>
              <span class="priority-tag ${task.priority === "高" ? "high" : task.priority === "中" ? "mid" : "low"}">${task.priority}</span>
            </div>
            <div class="task-meta">${escapeHtml(task.subject)} / 期限: ${escapeHtml(task.due || "未設定")}</div>
            ${task.note ? `<div class="task-note">${escapeHtml(task.note)}</div>` : ""}
            <div class="task-progress-meta">${task.loggedMinutes || 0} / ${task.estimate || 0} 分</div>
            <div class="task-progress"><div class="task-progress-fill" style="width:${progress}%"></div></div>
          </div>
          <div class="task-state ${task.status}">${task.status === "todo" ? "未着手" : task.status === "doing" ? "進行中" : "完了"}</div>
        </div>
        <div class="task-actions">
          <button class="mini-action" data-task="${task.id}" data-set="todo">未着手</button>
          <button class="mini-action" data-task="${task.id}" data-set="doing">進行中</button>
          <button class="mini-action" data-task="${task.id}" data-set="done">完了</button>
          <button class="mini-action danger-action" data-delete-task="${task.id}">削除</button>
        </div>
      </div>
    `;
  }).join("") : '<div class="empty-card">一致するタスクがありません。</div>';

  taskList.querySelectorAll("[data-set]").forEach(btn => btn.addEventListener("click", () => {
    const target = tasks.find(task => task.id === btn.dataset.task);
    if (!target) return;
    target.status = btn.dataset.set;
    saveJSON(LS.tasks, tasks);
    renderAll();
  }));
  taskList.querySelectorAll("[data-delete-task]").forEach(btn => btn.addEventListener("click", () => {
    tasks = tasks.filter(task => task.id !== btn.dataset.deleteTask);
    saveJSON(LS.tasks, tasks);
    renderAll();
  }));
}
addTaskBtn.addEventListener("click", () => {
  const title = taskTitleInput.value.trim();
  const subject = taskSubjectInput.value.trim();
  const due = taskDateInput.value.trim();
  const estimate = Number(taskEstimateInput.value || 0);
  if (!title || !subject || !estimate){
    alert("タスク名・科目・予定分数を入力してください。");
    return;
  }
  tasks.unshift({
    id:id(),
    title,
    subject,
    due,
    priority: taskPriorityInput.value,
    estimate,
    note: taskNoteInput.value.trim(),
    status:"todo",
    loggedMinutes:0
  });
  saveJSON(LS.tasks, tasks);
  taskTitleInput.value = "";
  taskSubjectInput.value = "";
  taskDateInput.value = "";
  taskEstimateInput.value = "";
  taskNoteInput.value = "";
  taskPriorityInput.value = "中";
  renderAll();
});
filterChips.forEach(chip => chip.addEventListener("click", () => {
  filterChips.forEach(c => c.classList.remove("active"));
  chip.classList.add("active");
  taskFilter = chip.dataset.filter;
  renderTaskList();
}));
taskSearchInput.addEventListener("input", renderTaskList);

function renderPriorityTasks(){
  const rows = tasks.filter(t => t.status !== "done").sort((a,b) => priorityRank(a.priority) - priorityRank(b.priority)).slice(0,3);
  priorityTasks.innerHTML = rows.length ? rows.map(task => `
    <button class="quick-task" data-go="tasks">
      <div class="quick-task-main">
        <div class="quick-task-name">${escapeHtml(task.title)}</div>
        <div class="quick-task-meta">${escapeHtml(task.subject)} / ${escapeHtml(task.due || "期限未設定")}</div>
      </div>
      <span class="quick-task-arrow"><svg><use href="#i-chevron-right"/></svg></span>
    </button>
  `).join("") : '<div class="empty-inline">未完了タスクはありません。</div>';
  priorityTasks.querySelectorAll("[data-go]").forEach(btn => btn.addEventListener("click", () => showPage(btn.dataset.go)));
}

function renderStats(){
  const totalMinutesValue = sessions.reduce((sum, s) => sum + (s.minutes || 0), 0);
  const today = new Date().toISOString().slice(0,10);
  const todayValue = sessions.filter(s => s.date === today).reduce((sum, s) => sum + (s.minutes || 0), 0);
  const openCountValue = tasks.filter(t => t.status !== "done").length;
  const completedCount = tasks.filter(t => t.status === "done").length;
  const completion = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const uniqueDays = [...new Set(sessions.map(s => s.date))];
  const avg = uniqueDays.length ? Math.round(totalMinutesValue / uniqueDays.length) : 0;

  todayMinutes.textContent = `${todayValue}分`;
  totalHours.textContent = `${(totalMinutesValue / 60).toFixed(1)}h`;
  openTasks.textContent = String(openCountValue);
  completionRate.textContent = `${completion}%`;

  recordTotalHours.textContent = `${(totalMinutesValue / 60).toFixed(1)}h`;
  recordSessionCount.textContent = String(sessions.length);
  recordDailyAvg.textContent = `${avg}分`;
  recordSubjectCount.textContent = String(new Set(sessions.map(s => s.subject)).size);
  memoTotal.textContent = `累計: ${totalMinutesValue}分`;
  streakDays.textContent = `${uniqueDays.length}日`;

  const recent = sessions.slice(0,7).reverse();
  barsMount.innerHTML = recent.length ? recent.map(s => {
    const h = Math.max(8, Math.min(100, Math.round((s.minutes || 0) / 120 * 100)));
    return `<div class="bar-wrap"><div class="bar" style="height:${h}%"></div></div>`;
  }).join("") : '<div class="empty-inline">データがありません。</div>';

  const subjectMap = {};
  sessions.forEach(s => { subjectMap[s.subject] = (subjectMap[s.subject] || 0) + (s.minutes || 0); });
  const palette = ["blue","green","amber","purple"];
  const subjects = Object.keys(subjectMap);
  legendList.innerHTML = subjects.length ? subjects.map((name, idx) => `
    <div><span><span class="legend-dot ${palette[idx % palette.length]}"></span>${escapeHtml(name)}</span><b>${subjectMap[name]}分</b></div>
  `).join("") : '<div class="empty-inline">データがありません。</div>';

  sessionList.innerHTML = sessions.length ? sessions.slice(0,6).map(s => `
    <div class="session-row">
      <span>${escapeHtml(s.subject)}<br><small>${escapeHtml(s.date)}</small></span>
      <b>${s.minutes}分</b>
    </div>
  `).join("") : '<div class="empty-card">まだ記録がありません。</div>';
}

function filteredTips(){
  return tipFilter === "all" ? tips : tips.filter(t => t.category === tipFilter);
}
function renderTipMonitor(){
  const list = filteredTips();
  if (!list.length) return;
  if (tipIndex >= list.length) tipIndex = 0;
  const tip = list[tipIndex];
  tipCategoryChip.textContent = tip.category;
  tipCounter.textContent = `${tipIndex + 1} / ${list.length}`;
  tipTitle.textContent = tip.title;
  tipText.textContent = tip.text;
}
function renderTipList(){
  const list = filteredTips();
  tipList.innerHTML = list.map(tip => `
    <div class="tip-item">
      <div class="tip-mini-category">${tip.category}</div>
      <div class="tip-title">${escapeHtml(tip.title)}</div>
      <div class="tip-text">${escapeHtml(tip.text)}</div>
    </div>
  `).join("");
}
tipChips.forEach(chip => chip.addEventListener("click", () => {
  tipChips.forEach(c => c.classList.remove("active"));
  chip.classList.add("active");
  tipFilter = chip.dataset.tipFilter;
  tipIndex = 0;
  renderTipMonitor();
  renderTipList();
}));
prevTipBtn.addEventListener("click", () => {
  const list = filteredTips();
  if (!list.length) return;
  tipIndex = (tipIndex - 1 + list.length) % list.length;
  renderTipMonitor();
});
nextTipBtn.addEventListener("click", () => {
  const list = filteredTips();
  if (!list.length) return;
  tipIndex = (tipIndex + 1) % list.length;
  renderTipMonitor();
});
randomTipBtn.addEventListener("click", () => {
  const list = filteredTips();
  if (!list.length) return;
  tipIndex = Math.floor(Math.random() * list.length);
  renderTipMonitor();
});

function renderAll(){
  saveJSON(LS.tasks, tasks);
  renderTaskList();
  renderPriorityTasks();
  renderActiveTaskSelect();
  renderStats();
}
renderAll();
renderTipMonitor();
renderTipList();

exportDataBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({
    tasks, sessions,
    memoSubject: memoSubject.value,
    memoText: memoText.value,
    preset: currentPreset,
    exportedAt: new Date().toISOString()
  }, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "studylab-backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
});

importDataInput.addEventListener("change", async () => {
  const file = importDataInput.files?.[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    tasks = Array.isArray(data.tasks) ? data.tasks : tasks;
    sessions = Array.isArray(data.sessions) ? data.sessions : sessions;
    memoSubject.value = data.memoSubject || "";
    memoText.value = data.memoText || "";
    currentPreset = Number(data.preset || currentPreset);
    localStorage.setItem(LS.memoSubject, memoSubject.value);
    localStorage.setItem(LS.memoText, memoText.value);
    localStorage.setItem(LS.preset, String(currentPreset));
    timerSeconds = currentPreset * 60;
    breakSnapshotSeconds = timerSeconds;
    renderTimer();
    presetChips.forEach(chip => chip.classList.toggle("active", Number(chip.dataset.preset) === currentPreset));
    renderAll();
    alert("バックアップを復元しました。");
  } catch {
    alert("バックアップを読み込めませんでした。");
  }
  importDataInput.value = "";
});

resetAllDataBtn.addEventListener("click", () => {
  if (!confirm("この端末のデータをすべて削除します。")) return;
  tasks = [];
  sessions = [];
  memoSubject.value = "";
  memoText.value = "";
  localStorage.removeItem(LS.tasks);
  localStorage.removeItem(LS.sessions);
  localStorage.removeItem(LS.memoSubject);
  localStorage.removeItem(LS.memoText);
  renderAll();
  alert("データを削除しました。");
});

const profileLine = document.getElementById("profileLine");
if (APP_CONFIG.LIFF_ID && window.liff){
  (async () => {
    try {
      await liff.init({ liffId: APP_CONFIG.LIFF_ID });
      if (liff.isLoggedIn()) {
        const profile = await liff.getProfile();
        profileLine.textContent = `${profile.displayName} さんの学習ルーム`;
      }
    } catch {}
  })();
}
