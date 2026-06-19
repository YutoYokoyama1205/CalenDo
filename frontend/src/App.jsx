import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header.jsx";
import WeekGrid from "./components/WeekGrid.jsx";
import AchievementPanel from "./components/AchievementPanel.jsx";
import TaskModal from "./components/TaskModal.jsx";
import DatePickerModal from "./components/DatePickerModal.jsx";
import {
  formatDateKey,
  getMondayOf,
  getWeekDates,
  shiftWeek,
} from "./utils/date.js";
import {
  fetchWeekTasks,
  addTask,
  editTask,
  deleteTask,
  toggleCheck,
} from "./api/client.js";
import "./styles/app.css";

export default function App() {
  // --- 状態管理 ---
  const [monday, setMonday] = useState(() => getMondayOf(new Date()));
  const [weekData, setWeekData] = useState({}); // { "YYYY-MM-DD": { tasks, achievement_rate, ... } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // モーダル状態
  const [modalState, setModalState] = useState(null); // { date, task? }
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const weekDates = getWeekDates(monday);
  const weekKeys = weekDates.map(formatDateKey);

  // --- 週データロード ---
  const loadWeek = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchWeekTasks(weekKeys);
      setWeekData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monday]);

  useEffect(() => {
    setLoading(true);
    loadWeek();
  }, [loadWeek]);

  // --- 週切替 ---
  const goPrevWeek = () => setMonday((m) => shiftWeek(m, -1));
  const goNextWeek = () => setMonday((m) => shiftWeek(m, 1));
  const goToday = () => setMonday(getMondayOf(new Date()));
  const jumpToDate = (date) => setMonday(getMondayOf(date));

  // --- タスク操作 ---
  const handleAdd = async (date, task_name, start_time, end_time) => {
    await addTask(date, task_name, start_time, end_time);
    await loadWeek();
  };

  const handleEdit = async (date, task_id, task_name, start_time, end_time) => {
    await editTask(date, task_id, task_name, start_time, end_time);
    await loadWeek();
  };

  const handleDelete = async (date, task_id) => {
    await deleteTask(date, task_id);
    await loadWeek();
  };

  const handleToggle = async (date, task_id) => {
    // 楽観的UI更新でレスポンス感を出す
    setWeekData((prev) => {
      const day = prev[date];
      if (!day) return prev;
      const tasks = day.tasks.map((t) =>
        t.task_id === task_id ? { ...t, completed: !t.completed } : t
      );
      const completed = tasks.filter((t) => t.completed).length;
      const total = tasks.length;
      return {
        ...prev,
        [date]: {
          ...day,
          tasks,
          completed_task: completed,
          uncompleted_task: total - completed,
          achievement_rate:
            total === 0 ? 0 : Math.round((completed / total) * 1000) / 10,
        },
      };
    });
    try {
      await toggleCheck(date, task_id);
      // バックエンド状態と再同期（達成率の小数誤差調整含む）
      loadWeek();
    } catch (err) {
      setError(err.message);
      loadWeek();
    }
  };

  return (
    <div className="app">
      <Header
        monday={monday}
        onPrev={goPrevWeek}
        onNext={goNextWeek}
        onToday={goToday}
        onPickDate={() => setDatePickerOpen(true)}
      />

      <main className="app-main">
        {error && (
          <div className="error-banner">
            <span>⚠ バックエンド接続エラー: {error}</span>
            <button onClick={loadWeek}>再試行</button>
          </div>
        )}

        <WeekGrid
          weekDates={weekDates}
          weekData={weekData}
          loading={loading}
          onAddTask={(date) => setModalState({ date, task: null })}
          onEditTask={(date, task) => setModalState({ date, task })}
          onToggle={handleToggle}
        />

        <AchievementPanel weekDates={weekDates} weekData={weekData} />
      </main>

      {modalState && (
        <TaskModal
          date={modalState.date}
          task={modalState.task}
          onClose={() => setModalState(null)}
          onSave={async (taskName, start, end) => {
            if (modalState.task) {
              await handleEdit(
                modalState.date,
                modalState.task.task_id,
                taskName,
                start,
                end
              );
            } else {
              await handleAdd(modalState.date, taskName, start, end);
            }
            setModalState(null);
          }}
          onDelete={
            modalState.task
              ? async () => {
                  await handleDelete(modalState.date, modalState.task.task_id);
                  setModalState(null);
                }
              : null
          }
        />
      )}

      {datePickerOpen && (
        <DatePickerModal
          initialDate={monday}
          onClose={() => setDatePickerOpen(false)}
          onSelect={(date) => {
            jumpToDate(date);
            setDatePickerOpen(false);
          }}
        />
      )}
    </div>
  );
}
