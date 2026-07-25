// FlaskバックエンドAPIクライアント
// 開発時はViteプロキシ経由で http://127.0.0.1:5000 へ
const BASE_URL = "";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

export function getCurrentUser() {
  return request("/auth/me");
}

export function register(username, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function login(username, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logout() {
  return request("/auth/logout", { method: "POST" });
}

// --- タスク取得 ---
export function fetchTasks(date) {
  return request(`/tasks?date=${date}`);
}

// --- 週データ取得 ---
export function fetchWeekTasks(dates) {
  return request("/week_tasks", {
    method: "POST",
    body: JSON.stringify({ dates }),
  });
}

// --- 達成率取得 ---
export function fetchAchievement(date) {
  return request(`/achievement_rate?date=${date}`);
}

// --- タスク追加 ---
export function addTask(date, task_name, start_time, end_time) {
  return request("/add_task", {
    method: "POST",
    body: JSON.stringify({ date, task_name, start_time, end_time }),
  });
}

// --- タスク編集 ---
export function editTask(date, task_id, task_name, start_time, end_time) {
  return request("/edit_task", {
    method: "POST",
    body: JSON.stringify({ date, task_id, task_name, start_time, end_time }),
  });
}

// --- タスク削除 ---
export function deleteTask(date, task_id) {
  return request("/delete_task", {
    method: "POST",
    body: JSON.stringify({ date, task_id }),
  });
}

// --- チェック切替 ---
export function toggleCheck(date, task_id) {
  return request("/check_box", {
    method: "POST",
    body: JSON.stringify({ date, task_id }),
  });
}
