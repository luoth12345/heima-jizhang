// 黑马记账 · 主界面：左（分类导航）+ 中（账单列表）+ 右（月度统计）
import { useCallback, useEffect, useMemo, useState } from "react";
import { addExpense, deleteExpense, listExpenses, updateExpense, type Expense } from "./db";
import CategoryNav from "./components/CategoryNav";
import BillList from "./components/BillList";
import StatsPanel from "./components/StatsPanel";
import ExpenseModal from "./components/ExpenseModal";
import { currentMonth, shiftMonth } from "./format";
import "./App.css";

type ModalState = { type: "add" } | { type: "edit"; expense: Expense } | null;

function App() {
  const [month, setMonth] = useState(currentMonth());
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [modal, setModal] = useState<ModalState>(null);

  const refresh = useCallback(async (m: string) => {
    try {
      setExpenses(await listExpenses(m));
    } catch (err) {
      console.error("加载账单失败:", err);
    }
  }, []);

  useEffect(() => {
    void refresh(month);
  }, [month, refresh]);

  // 左栏选中分类时，只显示该分类的账单
  const visible = useMemo(
    () => (filterCat ? expenses.filter((e) => e.category === filterCat) : expenses),
    [expenses, filterCat]
  );

  // 本月各分类笔数（供左栏显示）
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const e of expenses) c[e.category] = (c[e.category] ?? 0) + 1;
    return c;
  }, [expenses]);

  const handleSave = useCallback(
    async (data: Omit<Expense, "id">) => {
      if (modal?.type === "edit") {
        await updateExpense({ ...data, id: modal.expense.id });
      } else {
        await addExpense(data);
      }
      setModal(null);
      await refresh(month);
    },
    [modal, month, refresh]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      await deleteExpense(id);
      await refresh(month);
    },
    [month, refresh]
  );

  return (
    <div className="app">
      <CategoryNav filterCat={filterCat} onSelect={setFilterCat} counts={counts} />
      <BillList
        month={month}
        expenses={visible}
        filterCat={filterCat}
        onShiftMonth={(d) => setMonth((m) => shiftMonth(m, d))}
        onAdd={() => setModal({ type: "add" })}
        onEdit={(e) => setModal({ type: "edit", expense: e })}
        onDelete={handleDelete}
        onClearFilter={() => setFilterCat(null)}
      />
      <StatsPanel month={month} expenses={expenses} />
      {modal ? (
        <ExpenseModal
          key={modal.type === "edit" ? `edit-${modal.expense.id}` : "add"}
          mode={modal.type}
          expense={modal.type === "edit" ? modal.expense : undefined}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      ) : null}
    </div>
  );
}

export default App;
