// 日付ユーティリティ
// バックエンドが要求するフォーマット: "YYYY-MM-DD"

const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];
const WEEKDAYS_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// Date → "YYYY-MM-DD"
export function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// "YYYY-MM-DD" → Date (タイムゾーン安全)
export function parseDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// 指定日が属する週の月曜日を返す
export function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  // 日曜=0 のとき前週月曜へ
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// 月曜起点で7日分のDateを返す
export function getWeekDates(monday) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// 週を移動した新しい月曜を返す
export function shiftWeek(monday, offset) {
  const d = new Date(monday);
  d.setDate(d.getDate() + offset * 7);
  return d;
}

export function getWeekdayJa(date) {
  return WEEKDAYS_JA[date.getDay()];
}

export function getWeekdayEn(date) {
  return WEEKDAYS_EN[date.getDay()];
}

export function isSameDay(a, b) {
  return formatDateKey(a) === formatDateKey(b);
}

export function isToday(date) {
  return isSameDay(date, new Date());
}

// 月の表記 "May 2026"
const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export function getMonthLabel(date) {
  return `${MONTHS_EN[date.getMonth()]} ${date.getFullYear()}`;
}

// 週レンジ表示 "May 13 – 19"
export function getWeekRangeLabel(monday) {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const m1 = MONTHS_EN[monday.getMonth()].slice(0, 3);
  const m2 = MONTHS_EN[sunday.getMonth()].slice(0, 3);
  if (monday.getMonth() === sunday.getMonth()) {
    return `${m1} ${monday.getDate()} – ${sunday.getDate()}`;
  }
  return `${m1} ${monday.getDate()} – ${m2} ${sunday.getDate()}`;
}

// 時刻バリデーション "HH:MM"
export function isValidTime(t) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
}

// "HH:MM" を分に変換
export function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
