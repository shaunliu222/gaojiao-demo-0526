import { useState } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import type { Course, CourseType } from "@mock";
import { subjects, professions } from "@mock";

const courseTypeOptions: CourseType[] = [
  "专业基础课",
  "专业课",
  "选修课",
  "实训课",
  "导论课",
];

export function CourseFormDrawer({
  open,
  course,
  onClose,
  onSave,
}: {
  open: boolean;
  course?: Course;
  onClose: () => void;
  onSave: (data: {
    name: string;
    courseType: CourseType;
    subjectId: string;
    professionId: string;
    summary: string;
  }) => void;
}) {
  const [name, setName] = useState(course?.name ?? "");
  const [courseType, setCourseType] = useState<CourseType>(course?.courseType ?? "专业基础课");
  const [subjectId, setSubjectId] = useState(course?.subjectId ?? "");
  const [professionId, setProfessionId] = useState(course?.professionId ?? "");
  const [summary, setSummary] = useState(course?.summary ?? "");

  if (!open) return null;

  const isEdit = !!course;
  const title = isEdit ? "编辑课程" : "新建课程";

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), courseType, subjectId, professionId, summary: summary.trim() });
    onClose();
  };

  const labelCls = "block text-sm font-medium text-slate-700 mb-1";
  const inputCls =
    "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200";
  const selectCls =
    "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_8px_center] bg-no-repeat";

  return (
    <>
      <div
        role="presentation"
        className="fixed inset-0 z-50 bg-slate-900/40"
        onClick={onClose}
      />
      <aside className="fixed top-0 right-0 z-[51] h-full w-[min(100vw,28rem)] bg-white border-l border-slate-200 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <label className={labelCls}>课程名称</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入课程名称"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>课程封面</label>
            <div className="w-full h-32 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition cursor-pointer">
              <ImageIcon size={24} />
              <span className="text-sm">上传封面</span>
              <span className="text-xs text-slate-300">支持 JPG/PNG，建议 800×400</span>
            </div>
          </div>

          <div>
            <label className={labelCls}>课程类型</label>
            <select
              value={courseType}
              onChange={(e) => setCourseType(e.target.value as CourseType)}
              className={selectCls}
            >
              {courseTypeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>适用学科</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className={selectCls}
            >
              <option value="">请选择学科</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>适用专业</label>
            <select
              value={professionId}
              onChange={(e) => setProfessionId(e.target.value)}
              className={selectCls}
            >
              <option value="">请选择专业</option>
              {professions.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>课程摘要</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="请输入课程摘要"
              rows={4}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex justify-end gap-2 shrink-0 bg-slate-50/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>
      </aside>
    </>
  );
}
