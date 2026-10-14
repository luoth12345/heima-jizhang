// 左栏：分类导航
import { CATEGORIES } from "../categories";

interface Props {
  filterCat: string | null;
  onSelect: (name: string | null) => void;
  counts: Record<string, number>; // 本月各分类的笔数
}

export default function CategoryNav({ filterCat, onSelect, counts }: Props) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <nav className="nav">
      <div className="nav-logo">
        <div className="nav-logo-icon">🐴</div>
        <div className="nav-logo-title">黑马记账</div>
      </div>
      <div className="nav-group-label">分类</div>
      <button
        className={`nav-item${filterCat === null ? " active" : ""}`}
        onClick={() => onSelect(null)}
      >
        <span className="nav-item-emoji">🧾</span>
        <span>全部</span>
        <span className="nav-item-count">{total}</span>
      </button>
      {CATEGORIES.map((c) => (
        <button
          key={c.name}
          className={`nav-item${filterCat === c.name ? " active" : ""}`}
          onClick={() => onSelect(c.name)}
        >
          <span className="nav-item-emoji">{c.icon}</span>
          <span>{c.name}</span>
          {counts[c.name] ? <span className="nav-item-count">{counts[c.name]}</span> : null}
        </button>
      ))}
    </nav>
  );
}
