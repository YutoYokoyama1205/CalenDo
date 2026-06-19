import { useState, useEffect, useRef } from "react";
import { parseDateKey, isValidTime, timeToMinutes } from "../utils/date.js";
import "../styles/modal.css";

export default function TaskModal({ date, task, onClose, onSave, onDelete }) {
  const isEdit = !!task;
  const [taskName, setTaskName] = useState(task?.task_name || "");
  const [startTime, setStartTime] = useState(task?.start_time || "09:00");
  const [endTime, setEndTime] = useState(task?.end_time || "10:00");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    // 初回フォーカス
    setTimeout(() => nameRef.current?.focus(), 50);
  }, []);

  // ESCで閉じる
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const validate = () => {
    if (!taskName.trim()) return "タスク名を入力してください";
    if (!isValidTime(startTime)) return "開始時間の形式が不正です";
    if (!isValidTime(endTime)) return "終了時間の形式が不正です";
    if (timeToMinutes(startTime) >= timeToMinutes(endTime))
      return "開始時間は終了時間より前である必要があります";
    return null;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await onSave(taskName.trim(), startTime, endTime);
    } catch (err) {
      setError(err.message || "保存に失敗しました");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!window.confirm("このタスクを削除しますか？")) return;
    try {
      setSaving(true);
      await onDelete();
    } catch (err) {
      setError(err.message || "削除に失敗しました");
      setSaving(false);
    }
  };

  const dateObj = parseDateKey(date);
  const dateLabel = `${dateObj.getFullYear()}.${String(
    dateObj.getMonth() + 1
  ).padStart(2, "0")}.${String(dateObj.getDate()).padStart(2, "0")}`;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <header className="modal-head">
          <div>
            <span className="modal-eyebrow">
              {isEdit ? "edit task" : "new task"}
            </span>
            <h2 className="modal-title">{dateLabel}</h2>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="閉じる"
          >
            ✕
          </button>
        </header>

        <div className="modal-body">
          <div className="field">
            <label className="field-label" htmlFor="task-name">
              task
            </label>
            <input
              id="task-name"
              ref={nameRef}
              type="text"
              className="field-input"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit(e);
              }}
              maxLength={80}
              placeholder="例: 線形代数 演習問題"
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label" htmlFor="start-time">
                start
              </label>
              <input
                id="start-time"
                type="time"
                className="field-input field-input-time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="field-arrow">→</div>
            <div className="field">
              <label className="field-label" htmlFor="end-time">
                end
              </label>
              <input
                id="end-time"
                type="time"
                className="field-input field-input-time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="field-error">⚠ {error}</div>}
        </div>

        <footer className="modal-foot">
          {isEdit && (
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={saving}
            >
              削除
            </button>
          )}
          <div className="modal-foot-right">
            <button
              className="btn btn-ghost"
              onClick={onClose}
              disabled={saving}
            >
              キャンセル
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "保存中..." : isEdit ? "更新" : "追加"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
