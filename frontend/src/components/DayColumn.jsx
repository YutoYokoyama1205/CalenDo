import {
  getWeekdayJa,
  getWeekdayEn,
  isToday,
  parseDateKey,
} from "../utils/date.js";
import TaskItem from "./TaskItem.jsx";
import "../styles/day-column.css";

export default function DayColumn({
  date,
  dateKey,
  data,
  loading,
  onAddTask,
  onEditTask,
  onToggle,
}) {
  const today = isToday(date);
  const weekday = date.getDay();
  const isWeekend = weekday === 0 || weekday === 6;
  const tasks = data.tasks || [];
  const total = tasks.length;
  const completed = data.completed_task || 0;
  const rate = data.achievement_rate || 0;

  return (
    <article
      className={`day-col ${today ? "is-today" : ""} ${
        isWeekend ? "is-weekend" : ""
      }`}
    >
      {/* --- ヘッダー --- */}
      <header className="day-head">
        <div className="day-head-top">
          <span className="day-en">{getWeekdayEn(date)}</span>
          {today && <span className="today-pip" aria-label="今日">●</span>}
        </div>
        <div className="day-date-row">
          <span className="day-num">{date.getDate()}</span>
          <span className="day-ja">{getWeekdayJa(date)}</span>
        </div>
        <div className="day-stats">
          <div className="day-rate">
            <span className="rate-val">{rate}</span>
            <span className="rate-pct">%</span>
          </div>
          <div className="day-count">
            {total === 0 ? (
              <span className="count-empty">no tasks</span>
            ) : (
              <span>
                <strong>{completed}</strong>
                <span className="count-sep">/</span>
                {total}
              </span>
            )}
          </div>
        </div>
        {/* 達成率プログレスバー */}
        <div className="day-progress" aria-hidden="true">
          <div
            className="day-progress-fill"
            style={{ width: `${rate}%` }}
          ></div>
        </div>
      </header>

      {/* --- タスクリスト --- */}
      <div className="day-tasks">
        {loading && total === 0 ? (
          <div className="day-empty">
            <span className="empty-dot">·</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="day-empty">
            <span className="empty-line"></span>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.task_id}
              task={task}
              onToggle={() => onToggle(task.task_id)}
              onEdit={() => onEditTask(task)}
            />
          ))
        )}
      </div>

      {/* --- 追加ボタン --- */}
      <button className="day-add" onClick={onAddTask} aria-label="タスクを追加">
        <span className="day-add-plus">＋</span>
        <span className="day-add-label">add task</span>
      </button>
    </article>
  );
}
