// 中栏：账单列表（按日期分组）
import { useMemo, useState } from "react";
import { getCategory } from "../categories";
import type { Expense } from "../db";
import { dayLabel, fmtMoney, monthLabel } from "../format";

interface Props {
  month: string;
  expenses: Expense[];
  filterCat: string | null;
  onShiftMonth: (delta: number) => void;
  onAdd: () => void;
  onEdit: (e: Expense) => void;
  onDelete: (id: number) => void;
  onClearFilter: () => void;
}

export default function BillList({
  month,
  expenses,
  filterCat,
  onShiftMonth,
  onAdd,
  onEdit,
  onDelete,
  onClearFilter,
}: Props) {
  const [confirming, setConfirming] = useState<number | null>(null);

  const totalCents = useMemo(() => expenses.reduce((a, e) => a + e.amountCents, 0), [expenses]);

  // 账单已按日期倒序返回，这里按日期分组
  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const e of expenses) {
      const arr = map.get(e.date) ?? [];
      arr.push(e);
      map.set(e.date, arr);
    }
    return [...map.entries()];
  }, [expenses]);

  return (
    <main className="main">
      <div className="bill-header">
        <div className="month-nav">
          <button className="month-arrow" onClick={() => onShiftMonth(-1)}>‹</button>
          <span className="month-title">{monthLabel(month)}</span>
          <button className="month-arrow" onClick={() => onShiftMonth(1)}>›</button>
          {filterCat ? (
            <button className="filter-chip" onClick={onClearFilter}>
              筛选：{filterCat} ✕
            </button>
          ) : null}
        </div>
        <button className="btn-primary" onClick={onAdd}>＋ 记一笔</button>
      </div>
      <div className="bill-total">
        共 <b>{expenses.length}</b> 笔 · 合计 <b>¥{fmtMoney(totalCents)}</b>
      </div>
      <div className="bill-list">
        {expenses.length === 0 ? (
          <div className="empty">
            <span className="empty-emoji">🐴</span>
            {filterCat ? "这个分类下还没有账单" : "这个月还没有账单"}
            {!filterCat ? <><br />点右上角「＋ 记一笔」开始记账吧</> : null}
          </div>
        ) : (
          groups.map(([date, items]) => {
            const daySum = items.reduce((a, e) => a + e.amountCents, 0);
            return (
              <div className="day-group" key={date}>
                <div className="day-head">
                  {dayLabel(date)}
                  <span className="day-subtotal">{items.length}笔 · ¥{fmtMoney(daySum)}</span>
                </div>
                {items.map((e) => {
                  const cat = getCategory(e.category);
                  return (
                    <div
                      className="bill-item"
                      key={e.id}
                      onMouseLeave={() => confirming === e.id && setConfirming(null)}
                    >
                      <div className="bill-emoji" style={{ background: `${cat.color}1f` }}>
                        {cat.icon}
                      </div>
                      <div className="bill-info">
                        <div className="bill-title">
                          {e.subcategory}
                          {e.note ? <span className="bill-note"> · {e.note}</span> : null}
                        </div>
                        <div className="bill-meta">{e.category}</div>
                      </div>
                      <div className="bill-amount">-¥{fmtMoney(e.amountCents)}</div>
                      <div className="bill-actions">
                        <button className="bill-action" onClick={() => onEdit(e)}>编辑</button>
                        {confirming === e.id ? (
                          <button
                            className="bill-action danger confirm"
                            onClick={() => {
                              setConfirming(null);
                              onDelete(e.id);
                            }}
                          >
                            确认删除？
                          </button>
                        ) : (
                          <button className="bill-action danger" onClick={() => setConfirming(e.id)}>
                            删除
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
