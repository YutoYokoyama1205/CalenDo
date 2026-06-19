import { getWeekRangeLabel, getMonthLabel } from "../utils/date.js";
import "../styles/header.css";

export default function Header({ monday, onPrev, onNext, onToday, onPickDate }) {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="brand-mark">
          <svg viewBox="0 0 32 32" width="34" height="34" aria-hidden="true">
            <rect
              x="3"
              y="6"
              width="26"
              height="22"
              rx="2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="3"
              y1="13"
              x2="29"
              y2="13"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="10"
              y1="2"
              x2="10"
              y2="9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="22"
              y1="2"
              x2="22"
              y2="9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="11" cy="19" r="1.6" fill="var(--color-accent)" />
            <circle cx="16" cy="19" r="1.6" fill="var(--color-accent)" />
            <circle cx="21" cy="19" r="1.6" fill="var(--color-accent)" />
            <circle cx="11" cy="24" r="1.6" fill="var(--color-accent)" />
          </svg>
        </div>
        <div className="brand-text">
          <h1 className="brand-name">CalenDo</h1>
          <span className="brand-tag">a weekly tempo</span>
        </div>
      </div>

      <nav className="header-nav" aria-label="週ナビゲーション">
        <button
          className="nav-arrow"
          onClick={onPrev}
          aria-label="前の週"
          title="前の週"
        >
          ←
        </button>

        <button
          className="nav-date-display"
          onClick={onPickDate}
          aria-label="日付を選択"
        >
          <span className="nav-month">{getMonthLabel(monday)}</span>
          <span className="nav-range">{getWeekRangeLabel(monday)}</span>
        </button>

        <button
          className="nav-arrow"
          onClick={onNext}
          aria-label="次の週"
          title="次の週"
        >
          →
        </button>
      </nav>

      <div className="header-actions">
        <button className="btn-today" onClick={onToday}>
          Today
        </button>
      </div>
    </header>
  );
}
