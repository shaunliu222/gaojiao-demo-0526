import { useState } from "react";
import { Search, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { professions, subjects } from "@mock";
import type { CourseType, PublishStatus } from "@mock";

export interface CourseFilterState {
  name: string;
  courseType: CourseType | "";
  college: string;
  subjectId: string;
  professionId: string;
  publishStatus: PublishStatus | "";
}

const defaultFilters: CourseFilterState = {
  name: "",
  courseType: "",
  college: "",
  subjectId: "",
  professionId: "",
  publishStatus: "",
};

export const courseTypeOptions: CourseType[] = [
  "专业基础课",
  "专业课",
  "选修课",
  "实训课",
  "导论课",
];
export const publishStatusOptions: { value: PublishStatus; label: string }[] = [
  { value: "published", label: "已上架" },
  { value: "draft", label: "草稿" },
  { value: "unpublished", label: "已下架" },
];

export function CourseFilterBar({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
}: {
  filters: CourseFilterState;
  onFiltersChange: (f: CourseFilterState) => void;
  onSearch: () => void;
  onReset: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const set = (patch: Partial<CourseFilterState>) =>
    onFiltersChange({ ...filters, ...patch });

  const uniqueColleges = Array.from(
    new Set(professions.map((p) => p.college)),
  );

  const filteredSubjects = filters.college
    ? subjects.filter((s) => {
        const prof = professions.find((p) => p.id === s.professionId);
        return prof?.college === filters.college;
      })
    : subjects;

  const filteredProfessions = filters.college
    ? professions.filter((p) => p.college === filters.college)
    : professions;

  const selectCls =
    "h-8 rounded-md border border-slate-200 bg-white text-sm text-slate-700 px-2 pr-7 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_6px_center] bg-no-repeat";

  return (
    <div className="space-y-3">
      {/* 第一行筛选条件 */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2 h-8 min-w-[10rem] max-w-xs">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            value={filters.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="课程名称"
            className="w-full min-w-0 bg-transparent text-sm outline-none"
          />
        </div>

        <select
          value={filters.courseType}
          onChange={(e) => set({ courseType: e.target.value as CourseType | "" })}
          className={selectCls}
        >
          <option value="">课程类型</option>
          {courseTypeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={filters.college}
          onChange={(e) => set({ college: e.target.value, subjectId: "", professionId: "" })}
          className={selectCls}
        >
          <option value="">学院</option>
          {uniqueColleges.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filters.subjectId}
          onChange={(e) => set({ subjectId: e.target.value })}
          className={selectCls}
        >
          <option value="">学科</option>
          {filteredSubjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-700 px-2"
        >
          {expanded ? "收起" : "展开"}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-600 text-sm hover:bg-slate-50"
          >
            <RotateCcw size={13} />
            重置
          </button>
          <button
            type="button"
            onClick={onSearch}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-900 text-white text-sm hover:bg-slate-800"
          >
            <Search size={13} />
            查询
          </button>
        </div>
      </div>

      {/* 展开的更多筛选条件 */}
      {expanded && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.professionId}
            onChange={(e) => set({ professionId: e.target.value })}
            className={selectCls}
          >
            <option value="">专业</option>
            {filteredProfessions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={filters.publishStatus}
            onChange={(e) => set({ publishStatus: e.target.value as PublishStatus | "" })}
            className={selectCls}
          >
            <option value="">上架状态</option>
            {publishStatusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export { defaultFilters };
