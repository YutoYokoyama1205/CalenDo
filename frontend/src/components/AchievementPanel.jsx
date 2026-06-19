import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Dot,
} from "recharts";
import {
  formatDateKey,
  getWeekdayEn,
  isToday,
} from "../utils/date.js";
import "../styles/achievement-panel.css";

export default function AchievementPanel({ weekDates, weekData }) {
  // --- グラフ用データ整形 ---
  const chartData = useMemo(() => {
    return weekDates.map((date) => {
      const key = formatDateKey(date);
      const data = weekData[key];
      return {
        label: getWeekdayEn(date),
        date: date.getDate(),
        dateKey: key,
        rate: data?.achievement_rate ?? 0,
        completed: data?.completed_task ?? 0,
        total: (data?.completed_task ?? 0) + (data?.uncompleted_task ?? 0),
        isToday: isToday(date),
      };
    });
  }, [weekDates, weekData]);

  // --- 週合計サマリー ---
  const weekSummary = useMemo(() => {
    let totalCompleted = 0;
    let totalTasks = 0;
    let activeDays = 0;
    let rateSum = 0;
    chartData.forEach((d) => {
      totalCompleted += d.completed;
      totalTasks += d.total;
      if (d.total > 0) {
        activeDays += 1;
        rateSum += d.rate;
      }
    });
    return {
      totalCompleted,
      totalTasks,
      avgRate: activeDays === 0 ? 0 : Math.round(rateSum / activeDays),
      activeDays,
    };
  }, [chartData]);

  // 今日のポイントを目立たせる
  const renderDot = (props) => {
    const { cx, cy, payload, index } = props;
    if (cx == null || cy == null) return null;
    if (payload.isToday) {
      return (
        <g key={`dot-today-${index}`}>
          <circle
            cx={cx}
            cy={cy}
            r="7"
            fill="var(--color-accent-dim)"
            opacity="0.7"
          />
          <circle
            cx={cx}
            cy={cy}
            r="4"
            fill="var(--color-ink)"
            stroke="var(--color-paper)"
            strokeWidth="2"
          />
        </g>
      );
    }
    return (
      <circle
        key={`dot-${index}`}
        cx={cx}
        cy={cy}
        r="4"
        fill="var(--color-paper)"
        stroke="var(--color-accent)"
        strokeWidth="2"
      />
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0].payload;
    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip-head">
          {d.label} · {d.date}
        </div>
        <div className="chart-tooltip-rate">
          <strong>{d.rate}%</strong> achieved
        </div>
        <div className="chart-tooltip-sub">
          {d.completed} of {d.total} tasks
        </div>
      </div>
    );
  };

  return (
    <section className="achievement-panel">
      {/* --- 左: サマリー --- */}
      <div className="ach-summary">
        <span className="ach-eyebrow">weekly recap</span>
        <h2 className="ach-title">
          達成の<em>うねり</em>
        </h2>
        <p className="ach-lead">
          7日間の達成率を折れ線で確認できます。継続のリズムを掴みましょう。
        </p>

        <dl className="ach-stats">
          <div className="ach-stat">
            <dt>平均達成率</dt>
            <dd>
              <span className="ach-stat-val">{weekSummary.avgRate}</span>
              <span className="ach-stat-unit">%</span>
            </dd>
          </div>
          <div className="ach-stat">
            <dt>完了タスク</dt>
            <dd>
              <span className="ach-stat-val">{weekSummary.totalCompleted}</span>
              <span className="ach-stat-unit">
                / {weekSummary.totalTasks}
              </span>
            </dd>
          </div>
          <div className="ach-stat">
            <dt>取り組み日数</dt>
            <dd>
              <span className="ach-stat-val">{weekSummary.activeDays}</span>
              <span className="ach-stat-unit">days</span>
            </dd>
          </div>
        </dl>
      </div>

      {/* --- 右: グラフ --- */}
      <div className="ach-chart">
        <div className="ach-chart-head">
          <span className="ach-chart-axis-label">achievement %</span>
          <span className="ach-chart-range">0 — 100</span>
        </div>
        <div className="ach-chart-canvas">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 20, bottom: 12, left: 0 }}
            >
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#c8932e" />
                  <stop offset="100%" stopColor="#e8c547" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="var(--color-line)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--color-ink-mute)",
                  fontSize: 10,
                  fontFamily: "JetBrains Mono",
                  letterSpacing: "0.15em",
                }}
                dy={6}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "var(--color-ink-mute)",
                  fontSize: 10,
                  fontFamily: "JetBrains Mono",
                }}
                width={32}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  stroke: "var(--color-ink)",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
              />
              <ReferenceLine
                y={100}
                stroke="var(--color-success)"
                strokeDasharray="4 4"
                strokeOpacity={0.4}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="url(#lineGrad)"
                strokeWidth={2.5}
                dot={renderDot}
                activeDot={{
                  r: 6,
                  fill: "var(--color-ink)",
                  stroke: "var(--color-paper)",
                  strokeWidth: 2,
                }}
                isAnimationActive={true}
                animationDuration={600}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
