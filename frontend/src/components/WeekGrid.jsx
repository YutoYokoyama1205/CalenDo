import DayColumn from "./DayColumn.jsx";
import { formatDateKey } from "../utils/date.js";
import "../styles/week-grid.css";

export default function WeekGrid({
  weekDates,
  weekData,
  loading,
  onAddTask,
  onEditTask,
  onToggle,
}) {
  return (
    <section className="week-grid" aria-label="週間タスク">
      {weekDates.map((date) => {
        const key = formatDateKey(date);
        const data = weekData[key] || {
          tasks: [],
          achievement_rate: 0,
          completed_task: 0,
          uncompleted_task: 0,
        };
        return (
          <DayColumn
            key={key}
            date={date}
            dateKey={key}
            data={data}
            loading={loading}
            onAddTask={() => onAddTask(key)}
            onEditTask={(task) => onEditTask(key, task)}
            onToggle={(taskId) => onToggle(key, taskId)}
          />
        );
      })}
    </section>
  );
}
