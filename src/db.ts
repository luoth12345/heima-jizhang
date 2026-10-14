// 本地 SQLite 数据库访问（数据存在电脑的 heima.db 文件里）
import Database from "@tauri-apps/plugin-sql";

export interface Expense {
  id: number;
  amountCents: number; // 金额，单位：分
  category: string; // 一级分类
  subcategory: string; // 二级分类
  date: string; // YYYY-MM-DD
  note: string; // 备注
}

interface ExpenseRow {
  id: number;
  amount_cents: number;
  category: string;
  subcategory: string;
  date: string;
  note: string;
}

let dbPromise: Promise<Database> | null = null;

function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await Database.load("sqlite:heima.db");
      await db.execute(
        `CREATE TABLE IF NOT EXISTS expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount_cents INTEGER NOT NULL,
          category TEXT NOT NULL,
          subcategory TEXT NOT NULL,
          date TEXT NOT NULL,
          note TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        )`
      );
      return db;
    })();
  }
  return dbPromise;
}

function toExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    amountCents: row.amount_cents,
    category: row.category,
    subcategory: row.subcategory,
    date: row.date,
    note: row.note,
  };
}

/** 读取某个月（YYYY-MM）的全部账单，按日期和录入顺序倒序 */
export async function listExpenses(month: string): Promise<Expense[]> {
  const db = await getDb();
  const rows = await db.select<ExpenseRow[]>(
    "SELECT id, amount_cents, category, subcategory, date, note FROM expenses WHERE date LIKE ? ORDER BY date DESC, id DESC",
    [`${month}-%`]
  );
  return rows.map(toExpense);
}

/** 新增一笔账单 */
export async function addExpense(e: Omit<Expense, "id">): Promise<void> {
  const db = await getDb();
  await db.execute(
    "INSERT INTO expenses (amount_cents, category, subcategory, date, note) VALUES (?, ?, ?, ?, ?)",
    [e.amountCents, e.category, e.subcategory, e.date, e.note]
  );
}

/** 修改一笔账单 */
export async function updateExpense(e: Expense): Promise<void> {
  const db = await getDb();
  await db.execute(
    "UPDATE expenses SET amount_cents = ?, category = ?, subcategory = ?, date = ?, note = ? WHERE id = ?",
    [e.amountCents, e.category, e.subcategory, e.date, e.note, e.id]
  );
}

/** 删除一笔账单 */
export async function deleteExpense(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM expenses WHERE id = ?", [id]);
}
