import { useMemo, useRef, useState } from "react";
import {
  Download,
  GraduationCap,
  Plus,
  Search,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import { teachers as seedTeachers, students as seedStudents, classes } from "@mock";
import type { Student, Teacher } from "@mock";
import { classById, subjectById } from "../data/lookups";
import { PageHeader } from "./Layout";

type AccountFilter = "all" | "teacher" | "student";

function nextTeacherId(existing: Teacher[]): string {
  let n = existing.filter((t) => /^t-import-\d+$/.test(t.id)).length;
  let id = `t-import-${n + 1}`;
  while (existing.some((t) => t.id === id)) {
    n += 1;
    id = `t-import-${n}`;
  }
  return id;
}

function nextStudentId(existing: Student[]): string {
  let n = existing.filter((s) => /^s-import-\d+$/.test(s.id)).length;
  let id = `s-import-${n + 1}`;
  while (existing.some((s) => s.id === id)) {
    n += 1;
    id = `s-import-${n}`;
  }
  return id;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let i = 0;
  while (i < line.length) {
    const c = line[i]!;
    if (c === '"') {
      i += 1;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          cur += '"';
          i += 2;
          continue;
        }
        if (line[i] === '"') {
          i += 1;
          break;
        }
        cur += line[i]!;
        i += 1;
      }
      continue;
    }
    if (c === ",") {
      out.push(cur.trim());
      cur = "";
      i += 1;
      continue;
    }
    cur += c;
    i += 1;
  }
  out.push(cur.trim());
  return out;
}

/** 学院管理人员管理：演示态会话数据，基于 mock 教师/学生并可新增、CSV 导入 */
export function PersonnelManagement() {
  const [teacherRows, setTeacherRows] = useState<Teacher[]>(() => [...seedTeachers]);
  const [studentRows, setStudentRows] = useState<Student[]>(() => [...seedStudents]);
  const [filter, setFilter] = useState<AccountFilter>("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const merged = useMemo(() => {
    const t = teacherRows.map((r) => ({
      kind: "teacher" as const,
      id: r.id,
      name: r.name,
      sub: r.email ?? r.title,
      detail: `${r.department} · ${r.title}`,
      raw: r,
    }));
    const s = studentRows.map((r) => {
      const cls = classById(r.classId);
      return {
        kind: "student" as const,
        id: r.id,
        name: r.name,
        sub: r.studentNo,
        detail: cls ? `${cls.name} · ${r.enrollYear} 级` : r.classId,
        raw: r,
      };
    });
    return [...t, ...s];
  }, [teacherRows, studentRows]);

  const visible = useMemo(() => {
    let rows = merged;
    if (filter === "teacher") rows = rows.filter((r) => r.kind === "teacher");
    if (filter === "student") rows = rows.filter((r) => r.kind === "student");
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.sub.toLowerCase().includes(q) ||
          r.detail.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [merged, filter, query]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3200);
  };

  const addDemoTeacher = () => {
    const id = nextTeacherId(teacherRows);
    const row: Teacher = {
      id,
      name: `演示教师 ${teacherRows.length + 1}`,
      gender: "男",
      title: "讲师",
      college: "机械工程学院",
      department: "制图教研室",
      subjectIds: ["subj-mech-drawing"],
      email: `${id}@univ.edu.cn`,
    };
    setTeacherRows((prev) => [...prev, row]);
    showToast(`已新增教师账号 ${id}（仅当前浏览器会话）`);
  };

  const addDemoStudent = () => {
    const id = nextStudentId(studentRows);
    const row: Student = {
      id,
      name: `演示学生 ${studentRows.length + 1}`,
      gender: "女",
      classId: "cls-mech-2301",
      studentNo: `2099${String(studentRows.length + 1).padStart(5, "0")}`,
      enrollYear: 2026,
    };
    setStudentRows((prev) => [...prev, row]);
    showToast(`已新增学生账号 ${id}（仅当前浏览器会话）`);
  };

  const runImport = () => {
    const lines = importText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      showToast("请粘贴或选择 CSV 内容");
      return;
    }
    let start = 0;
    if (lines[0]!.includes("类型") && lines[0]!.includes("账号")) start = 1;

    let addT = 0;
    let addS = 0;
    const nextTeachers = [...teacherRows];
    const nextStudents = [...studentRows];

    for (let li = start; li < lines.length; li += 1) {
      const cells = parseCsvLine(lines[li]!);
      if (cells.length < 3) continue;
      const kindRaw = cells[0]!.toLowerCase();
      const isTeacher = kindRaw === "教师" || kindRaw === "teacher";
      const isStudent = kindRaw === "学生" || kindRaw === "student";
      if (isTeacher) {
        const id = cells[1] || nextTeacherId(nextTeachers);
        const name = cells[2] || "未命名";
        const gender = (cells[3] === "女" ? "女" : "男") as "男" | "女";
        const title = cells[4] || "讲师";
        const department = cells[5] || "制图教研室";
        const email = cells[6] || `${id}@univ.edu.cn`;
        if (nextTeachers.some((t) => t.id === id)) continue;
        nextTeachers.push({
          id,
          name,
          gender,
          title,
          college: "机械工程学院",
          department,
          subjectIds: ["subj-mech-drawing"],
          email: email || undefined,
        });
        addT += 1;
      } else if (isStudent) {
        const id = cells[1] || nextStudentId(nextStudents);
        const name = cells[2] || "未命名";
        const gender = (cells[3] === "女" ? "女" : "男") as "男" | "女";
        const studentNo = cells[4] || `2099${String(nextStudents.length + 1).padStart(5, "0")}`;
        const classId = cells[5] || "cls-mech-2301";
        const enrollYear = Number(cells[6]) || 2026;
        if (!classes.some((c) => c.id === classId)) continue;
        if (nextStudents.some((s) => s.id === id)) continue;
        nextStudents.push({ id, name, gender, classId, studentNo, enrollYear });
        addS += 1;
      }
    }

    setTeacherRows(nextTeachers);
    setStudentRows(nextStudents);
    setImportOpen(false);
    setImportText("");
    showToast(`导入完成：新增教师 ${addT} 人、学生 ${addS} 人（会话数据）`);
  };

  const onPickFile = (f: File | null) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setImportText(text);
      setImportOpen(true);
    };
    reader.readAsText(f, "UTF-8");
    if (fileRef.current) fileRef.current.value = "";
  };

  const downloadTemplate = () => {
    const header = "类型,账号ID,姓名,性别,职称或学号,教研室或班级ID,邮箱或入学年";
    const exampleT = "教师,t-demo-001,张演示,男,讲师,制图教研室,demo@univ.edu.cn";
    const exampleS = "学生,s-demo-001,李演示,女,2099123456,cls-mech-2301,2026";
    const blob = new Blob([`${header}\n${exampleT}\n${exampleS}\n`], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "人员导入模板.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex flex-col min-h-0 h-full bg-slate-50">
      <PageHeader
        title={
          <div>
            <div className="text-base font-semibold">人员管理</div>
            <div className="text-[0.8125rem] text-slate-500 font-normal mt-0.5">
              统一管理教学端与学生端登录账号（演示数据，变更仅保存在当前会话）
            </div>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={downloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50"
            >
              <Download size={16} />
              模板
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50"
            >
              <Upload size={16} />
              导入 CSV
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={addDemoTeacher}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-sm hover:bg-amber-700"
            >
              <UserPlus size={16} />
              新增教师
            </button>
            <button
              type="button"
              onClick={addDemoStudent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
            >
              <Plus size={16} />
              新增学生
            </button>
          </div>
        }
      />

      <div className="flex-1 min-h-0 overflow-auto p-6">
        <div className="max-w-[1200px] mx-auto space-y-4">
          <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 text-slate-600 text-sm">
              <Users size={18} className="text-slate-400" />
              <span>
                共 <strong className="text-slate-900">{merged.length}</strong> 个账号（教师{" "}
                {teacherRows.length} · 学生 {studentRows.length}）
              </span>
            </div>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm ml-auto">
              {(
                [
                  ["all", "全部"],
                  ["teacher", "教师"],
                  ["student", "学生"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFilter(k)}
                  className={`px-3 py-1.5 transition ${
                    filter === k
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 min-w-[12rem] flex-1 basis-[200px] border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="按姓名、账号、学号、邮箱筛选…"
                className="flex-1 min-w-0 text-sm outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 font-medium">类型</th>
                    <th className="px-4 py-3 font-medium">登录账号</th>
                    <th className="px-4 py-3 font-medium">姓名</th>
                    <th className="px-4 py-3 font-medium">学号 / 邮箱</th>
                    <th className="px-4 py-3 font-medium">班级 / 教研室与职称</th>
                    <th className="px-4 py-3 font-medium">所教学科（教师）</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((row) => (
                    <tr key={`${row.kind}-${row.id}`} className="hover:bg-slate-50/80">
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {row.kind === "teacher" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs">
                            教师
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 text-violet-800 text-xs">
                            <GraduationCap size={12} />
                            学生
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-700">{row.id}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-900">{row.name}</td>
                      <td className="px-4 py-2.5 text-slate-600">{row.sub || "—"}</td>
                      <td className="px-4 py-2.5 text-slate-600 max-w-[14rem]">{row.detail}</td>
                      <td className="px-4 py-2.5 text-slate-500 text-xs">
                        {row.kind === "teacher"
                          ? (row.raw as Teacher).subjectIds
                              .map((sid) => subjectById(sid)?.name ?? sid)
                              .join("、") || "—"
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {visible.length === 0 && (
              <div className="py-16 text-center text-slate-400 text-sm">无匹配人员</div>
            )}
          </div>
        </div>
      </div>

      {importOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/35">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200">
            <div className="px-4 py-3 border-b border-slate-100 font-semibold">导入 CSV</div>
            <div className="p-4 space-y-2 text-sm text-slate-600">
              <p>
                首列为<strong>类型</strong>：<code className="bg-slate-100 px-1 rounded">教师</code> 或{" "}
                <code className="bg-slate-100 px-1 rounded">学生</code>。字段顺序与模板一致；学生
                <strong className="text-slate-800">班级ID</strong>须为现有班级（如 cls-mech-2301）。
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={10}
                className="w-full rounded-lg border border-slate-200 p-2 font-mono text-xs"
                placeholder="粘贴 CSV…"
              />
            </div>
            <div className="px-4 py-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setImportOpen(false);
                  setImportText("");
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-sm hover:bg-slate-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={runImport}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
              >
                解析并导入
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
