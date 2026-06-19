import "../styles/task-item.css";

export default function TaskItem({ task, onToggle, onEdit }) {
  const { task_name, start_time, end_time, completed } = task;

  // 編集はタスク名側クリック、チェックボックスは独立
  const handleRowClick = (e) => {
    if (e.target.closest(".task-check")) return;
    onEdit();
  };

  return (
    <div
      className={`task-item ${completed ? "is-done" : ""}`}
      onClick={handleRowClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") onEdit();
      }}
    >
      <button
        className="task-check"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={completed ? "未完了に戻す" : "完了にする"}
        aria-pressed={completed}
      >
        {completed && (
          <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true">
            <polyline
              points="2.5,8.5 6.5,12.5 13.5,4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div className="task-body">
        <div className="task-time">
          <span>{start_time}</span>
          <span className="task-time-sep">—</span>
          <span>{end_time}</span>
        </div>
        <div className="task-name">{task_name}</div>
      </div>
    </div>
  );
}
