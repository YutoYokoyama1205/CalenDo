import { useState } from "react";
import {
  formatDateKey,
  isSameDay,
  isToday,
  parseDateKey,
} from "../utils/date.js";
import "../styles/modal.css";
import "../styles/date-picker.css";

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
const WEEKDAY_HEAD = ["M", "T", "W", "T", "F", "S", "S"];

export default function DatePickerModal({ initialDate, onClose, onSelect }) {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(initialDate);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  // 月のグリッドを生成（月曜起点）
  const buildGrid = (firstOfMonth) => {
    const year = firstOfMonth.getFullYear();
    const month = firstOfMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const weekday = firstDay.getDay(); // 0=日
    const offset = weekday === 0 ? 6 : weekday - 1; // 月曜起点に合わせる
    const start = new Date(firstDay);
    start.setDate(1 - offset);

    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      cells.push(d);
    }
    return cells;
  };

  const cells = buildGrid(viewMonth);

  const shiftMonth = (delta) => {
    const d = new Date(viewMonth);
    d.setMonth(d.getMonth() + delta);
    setViewMonth(d);
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal modal-dp" role="dialog" aria-modal="true">
        <header className="modal-head">
          <div>
            <span className="modal-eyebrow">jump to date</span>
            <h2 className="modal-title">
              {MONTHS_EN[viewMonth.getMonth()]} {viewMonth.getFullYear()}
            </h2>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="閉じる"
          >
            ✕
          </button>
        </header>

        <div className="modal-body dp-body">
          <div className="dp-nav">
            <button onClick={() => shiftMonth(-1)} aria-label="前の月">
              ←
            </button>
            <button
              onClick={() => {
                const t = new Date();
                t.setDate(1);
                setViewMonth(t);
              }}
            >
              今月
            </button>
            <button onClick={() => shiftMonth(1)} aria-label="次の月">
              →
            </button>
          </div>

          <div className="dp-weekheader">
            {WEEKDAY_HEAD.map((w, i) => (
              <span
                key={i}
                className={`dp-wd ${i >= 5 ? "is-weekend" : ""}`}
              >
                {w}
              </span>
            ))}
          </div>

          <div className="dp-grid">
            {cells.map((d) => {
              const inMonth = d.getMonth() === viewMonth.getMonth();
              const today = isToday(d);
              const day = d.getDay();
              return (
                <button
                  key={formatDateKey(d)}
                  className={`dp-cell ${inMonth ? "" : "is-out"} ${
                    today ? "is-today" : ""
                  } ${day === 0 || day === 6 ? "is-weekend" : ""}`}
                  onClick={() => onSelect(d)}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <footer className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>
            キャンセル
          </button>
        </footer>
      </div>
    </div>
  );
}
