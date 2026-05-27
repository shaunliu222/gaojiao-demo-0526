import { LayoutGrid, List } from "lucide-react";

export function CourseViewToggle({
  view,
  onChange,
}: {
  view: "table" | "card";
  onChange: (v: "table" | "card") => void;
}) {
  return (
    <div className="inline-flex items-center border border-slate-200 rounded-md overflow-hidden">
      <button
        type="button"
        onClick={() => onChange("table")}
        className={`p-1.5 transition ${
          view === "table"
            ? "bg-indigo-50 text-indigo-700"
            : "bg-white text-slate-400 hover:text-slate-600"
        }`}
        title="列表视图"
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => onChange("card")}
        className={`p-1.5 transition ${
          view === "card"
            ? "bg-indigo-50 text-indigo-700"
            : "bg-white text-slate-400 hover:text-slate-600"
        }`}
        title="卡片视图"
      >
        <LayoutGrid size={16} />
      </button>
    </div>
  );
}
