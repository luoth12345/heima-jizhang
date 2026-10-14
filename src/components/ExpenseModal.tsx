// 弹窗：记一笔 / 编辑账单
import { useState } from "react";
import { CATEGORIES, getCategory } from "../categories";
import type { Expense } from "../db";
import { todayStr } from "../format";

interface Props {
  mode: "add" | "edit";
  expense?: Expense;
  onClose: () => void;
  onSave: (data: Omit<Expense, "id">) => void;
}

export default function ExpenseModal({ mode, expense, onClose, onSave }: Props) {
  const [amountStr, setAmountStr] = useState(
    expense ? (expense.amountCents / 100).toFixed(2) : ""
  );
  const [date, setDate] = useState(expense?.date ?? todayStr());
  const [catName, setCatName] = useState(expense?.category ?? CATEGORIES[0].name);
  const [subName, setSubName] = useState(expense?.subcategory ?? CATEGORIES[0].subs[0]);
  const [note, setNote] = useState(expense?.note ?? "");
  const [error, setError] = useState("");

  const cat = getCategory(catName);

  function selectCategory(name: string) {
    setCatName(name);
    const c = getCategory(name);
    if (!c.subs.includes(subName)) setSubName(c.subs[0]);
  }

  function save() {
    const n = Number(amountStr);
    if (!amountStr.trim() || !Number.isFinite(n) || n <= 0) {
      setError("请输入大于 0 的金额");
      return;
    }
    if (n > 9999999) {
      setError("金额过大，请检查");
      return;
    }
    onSave({
      amountCents: Math.round(n * 100),
      category: catName,
      subcategory: subName,
      date,
      note: note.trim(),
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{mode === "add" ? "记一笔" : "编辑账单"}</div>

        <div className="field">
          <label className="field-label">金额（元）</label>
          <input
            className={`amount-input${error ? " error" : ""}`}
            value={amountStr}
            onChange={(e) => {
              const v = e.target.value;
              if (/^\d*\.?\d{0,2}$/.test(v)) {
                setAmountStr(v);
                if (error) setError("");
              }
            }}
            placeholder="0.00"
            inputMode="decimal"
            autoFocus
          />
          {error ? <div className="field-error">{error}</div> : null}
        </div>

        <div className="field">
          <label className="field-label">分类</label>
          <div className="cat-grid">
            {CATEGORIES.map((c) => (
              <button
                key={c.name}
                className={`cat-chip${catName === c.name ? " selected" : ""}`}
                onClick={() => selectCategory(c.name)}
              >
                <span className="cat-chip-emoji">{c.icon}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">细分类</label>
          <div className="sub-grid">
            {cat.subs.map((s) => (
              <button
                key={s}
                className={`sub-chip${subName === s ? " selected" : ""}`}
                onClick={() => setSubName(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">日期</label>
          <input
            type="date"
            className="date-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="field-label">备注（可选）</label>
          <input
            className="note-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例如：和朋友聚餐"
            maxLength={50}
          />
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>取消</button>
          <button className="btn-primary" onClick={save}>保存</button>
        </div>
      </div>
    </div>
  );
}
