// 右栏：月度统计（环形图 + 分类排名列表）
import { useMemo, useState } from "react";
import { CATEGORIES, getCategory } from "../categories";
import type { Expense } from "../db";
import { daysInMonth, fmtMoney, monthLabel } from "../format";

interface Props {
  month: string;
  expenses: Expense[];
}

/** 环形图：各分类占比，分类顺序固定（颜色跟着分类走，不随金额排名变化） */
function Donut({
  entries,
  totalCents,
}: {
  entries: readonly (readonly [string, number])[];
  totalCents: number;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const R = 46;
  const SW = 17;
  const C = 2 * Math.PI * R;
  const GAP = 2; // 相邻扇区之间的留白（像素）
  let acc = 0;

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 120 120" width="168" height="168" role="img" aria-label="各分类支出占比">
        <circle cx="60" cy="60" r={R} fill="none" stroke="#eef2ef" strokeWidth={SW} />
        {entries.map(([name, cents]) => {
          const cat = getCategory(name);
          const frac = totalCents > 0 ? cents / totalCents : 0;
          const segLen = Math.max(frac * C - GAP, 0.6);
          const dashoffset = -acc;
          acc += frac * C;
          return (
            <circle
              key={name}
              cx="60"
              cy="60"
              r={R}
              fill="none"
              stroke={cat.color}
              strokeWidth={hover === name ? SW + 3 : SW}
              strokeDasharray={`${segLen} ${C - segLen}`}
              strokeDashoffset={dashoffset}
              transform="rotate(-90 60 60)"
              onMouseEnter={() => setHover(name)}
              onMouseLeave={() => setHover(null)}
              style={{ transition: "stroke-width .15s ease", cursor: "default" }}
            >
              <title>{`${name} ¥${fmtMoney(cents)}（${(frac * 100).toFixed(1)}%）`}</title>
            </circle>
          );
        })}
      </svg>
      <div className="donut-center">
        <div className="dc-label">总支出</div>
      </div>
    </div>
  );
}

export default function StatsPanel({ month, expenses }: Props) {
  // 各分类合计金额与笔数
  const stats = useMemo(() => {
    const map = new Map<string, { cents: number; count: number }>();
    for (const e of expenses) {
      const s = map.get(e.category) ?? { cents: 0, count: 0 };
      s.cents += e.amountCents;
      s.count += 1;
      map.set(e.category, s);
    }
    return map;
  }, [expenses]);

  const totalCents = useMemo(() => expenses.reduce((a, e) => a + e.amountCents, 0), [expenses]);
  const count = expenses.length;
  const avg = Math.round(totalCents / daysInMonth(month));

  // 环形图：按固定分类顺序
  const donutEntries = useMemo(
    () => CATEGORIES.map((c) => [c.name, stats.get(c.name)?.cents ?? 0] as const).filter(([, v]) => v > 0),
    [stats]
  );

  // 排名列表：按金额从高到低
  const sorted = useMemo(
    () => [...stats.entries()].sort((a, b) => b[1].cents - a[1].cents),
    [stats]
  );

  if (totalCents === 0) {
    return (
      <aside className="stats">
        <div className="stats-title">{monthLabel(month)} · 支出统计</div>
        <div className="empty">
          <span className="empty-emoji">📊</span>
          记几笔账单后
          <br />
          这里会出现统计图表
        </div>
      </aside>
    );
  }

  return (
    <aside className="stats">
      <div className="stats-title">{monthLabel(month)} · 支出统计</div>
      <div className="stats-hero">¥{fmtMoney(totalCents)}</div>
      <div className="stats-sub">
        共 {count} 笔 · 日均 ¥{fmtMoney(avg)}
      </div>
      <Donut entries={donutEntries} totalCents={totalCents} />
      <div className="stats-list">
        {sorted.map(([name, s]) => {
          const cat = getCategory(name);
          const pct = (s.cents / totalCents) * 100;
          return (
            <div className="stats-row" key={name}>
              <div className="stats-row-top">
                <span className="stats-dot" style={{ background: cat.color }} />
                <span className="stats-name">{name}</span>
                <span className="stats-amount">¥{fmtMoney(s.cents)}</span>
                <span className="stats-pct">{pct.toFixed(1)}%</span>
              </div>
              <div className="stats-bar">
                <div className="stats-bar-fill" style={{ width: `${pct}%`, background: cat.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
