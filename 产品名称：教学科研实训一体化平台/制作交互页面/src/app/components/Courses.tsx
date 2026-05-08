import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  BookOpen,
  ChevronDown,
  FileText,
  Film,
  GraduationCap,
  Image as ImageIcon,
  ListChecks,
  Music,
  Code2,
  Database,
  Plus,
  Search,
  Upload,
  X,
} from "lucide-react";
import { courses, professions, suggestedNewCourses } from "@mock";
import type { Course, ResourceType, SuggestedNewCourse } from "@mock";
import {
  teacherById,
  professionById,
  resourcesByCourse,
  teacherSeesAllScopedContent,
  teacherCanViewResource,
} from "../data/lookups";
import { PageHeader, AiBadge } from "./Layout";
import { AssociatedKnowledgeNodes } from "./AssociatedKnowledgeNodes";

function summarizeTags(tags: string[]): string {
  if (tags.length === 0) return "—";
  if (tags.length <= 2) return tags.join("、");
  return `${tags[0]}、${tags[1]} 等 ${tags.length} 项`;
}

function CourseAiSuggestionChips({ s }: { s: NonNullable<Course["aiSuggestion"]> }) {
  const chipBase = "inline-flex items-center px-2 py-0.5 rounded-md text-[0.6875rem] font-medium";
  const chips: ReactNode[] = [];
  if (s.kind === "add_resource" || s.kind === "add_resource_and_hours") {
    chips.push(
      <span key="res" className={`${chipBase} bg-orange-50 text-orange-800 border border-orange-200`}>
        待补资料
      </span>,
    );
  }
  if (s.kind === "adjust_hours" || s.kind === "add_resource_and_hours") {
    const delta = s.suggestedHoursDelta ?? 0;
    chips.push(
      <span key="hrs" className={`${chipBase} bg-sky-50 text-sky-800 border border-sky-200`}>
        待调课时{delta > 0 ? `（+${delta}h）` : ""}
      </span>,
    );
  }
  return <div className="flex flex-wrap gap-1 justify-end">{chips}</div>;
}

function NewCourseSuggestionDrawer({
  suggestion,
  onClose,
  onConfirm,
  onIgnore,
  onLater,
}: {
  suggestion: SuggestedNewCourse | null;
  onClose: () => void;
  onConfirm: () => void;
  onIgnore: () => void;
  onLater: () => void;
}) {
  if (!suggestion) return null;
  const prof = professionById(suggestion.professionId);

  return (
    <>
      <div
        role="presentation"
        className="fixed inset-0 z-50 bg-slate-900/40"
        onClick={onClose}
      />
      <aside className="fixed top-0 right-0 z-[51] h-full w-[min(100vw,30rem)] bg-white border-l border-slate-200 shadow-2xl flex flex-col">
        <div className="flex items-start justify-between gap-3 p-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <AiBadge>AI 建议新增课程</AiBadge>
              <span className="text-xs text-slate-500">
                {new Date(suggestion.generatedAt).toLocaleString("zh-CN")}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900 leading-snug">
              《{suggestion.name}》
            </h2>
            <p className="text-sm text-slate-500 mt-1">{prof?.name ?? suggestion.professionId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <dt className="text-slate-500">推荐学分</dt>
            <dd className="text-slate-800 text-right tabular-nums">{suggestion.recommendedCredit}</dd>
            <dt className="text-slate-500">推荐学时</dt>
            <dd className="text-slate-800 text-right tabular-nums">{suggestion.recommendedHours}</dd>
            <dt className="text-slate-500">拟开课学期</dt>
            <dd className="text-slate-800 text-right">{suggestion.semester}</dd>
          </dl>

          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">待覆盖知识点</div>
            <AssociatedKnowledgeNodes
              knowledgeNodeIds={suggestion.uncoveredNodeIds}
              showHeader={false}
              onNodeClick={undefined}
              emptyMessage="暂无解析节点"
            />
          </div>

          <div>
            <div className="text-sm font-medium text-slate-700 mb-1">AI 推荐理由</div>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {suggestion.reason}
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex flex-wrap gap-2 justify-end shrink-0 bg-slate-50/80">
          <button
            type="button"
            onClick={onIgnore}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50"
          >
            忽略
          </button>
          <button
            type="button"
            onClick={onLater}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50"
          >
            稍后处理
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          >
            确认创建
          </button>
        </div>
      </aside>
    </>
  );
}

export function CourseList({
  currentTeacherId,
  onOpen,
}: {
  currentTeacherId: string;
  onOpen: (id: string) => void;
}) {
  const [selectedProfIds, setSelectedProfIds] = useState<Set<string>>(
    () => new Set(professions.map((p) => p.id))
  );
  const [courseQuery, setCourseQuery] = useState("");
  const [profPanelOpen, setProfPanelOpen] = useState(false);
  const [profSearch, setProfSearch] = useState("");
  const [aiOnly, setAiOnly] = useState(false);
  const [pendingSuggestionId, setPendingSuggestionId] = useState<string | null>(null);
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [toast, setToast] = useState<string | null>(null);

  const scopeCourses = useMemo(() => {
    const seesAll = teacherSeesAllScopedContent(currentTeacherId);
    let rows = courses.filter((c) => selectedProfIds.has(c.professionId));
    if (!seesAll) {
      rows = rows.filter((c) => c.ownerTeacherId === currentTeacherId);
    }
    const q = courseQuery.trim().toLowerCase();
    if (q) rows = rows.filter((c) => c.name.toLowerCase().includes(q));
    return rows;
  }, [selectedProfIds, courseQuery, currentTeacherId]);

  const scopeSuggested = useMemo(
    () =>
      suggestedNewCourses.filter(
        (s) => selectedProfIds.has(s.professionId) && !dismissedSuggestionIds.has(s.id),
      ),
    [selectedProfIds, dismissedSuggestionIds],
  );

  const aiExistingCount = useMemo(
    () => scopeCourses.filter((c) => c.aiSuggestion).length,
    [scopeCourses],
  );

  const listCourses = useMemo(() => {
    if (!aiOnly) return scopeCourses;
    return scopeCourses.filter((c) => c.aiSuggestion);
  }, [scopeCourses, aiOnly]);

  const drawerSuggestion = useMemo(
    () => suggestedNewCourses.find((s) => s.id === pendingSuggestionId) ?? null,
    [pendingSuggestionId],
  );

  const professionsFiltered = useMemo(() => {
    const q = profSearch.trim().toLowerCase();
    if (!q) return professions;
    return professions.filter((p) => p.name.toLowerCase().includes(q));
  }, [profSearch]);

  const toggleProfession = (id: string) => {
    setSelectedProfIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllProfessions = () => {
    setSelectedProfIds(new Set(professions.map((p) => p.id)));
  };

  const clearProfessions = () => {
    setSelectedProfIds(new Set());
  };

  const courseImportInputRef = useRef<HTMLInputElement>(null);
  const profRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profPanelOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (profPanelOpen && profRef.current && !profRef.current.contains(t)) {
        setProfPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profPanelOpen]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const confirmSuggestion = () => {
    if (pendingSuggestionId) {
      setDismissedSuggestionIds((prev) => new Set(prev).add(pendingSuggestionId));
    }
    setToast("已记录创建意向（演示环境，未写入后台）");
    setPendingSuggestionId(null);
  };

  const ignoreSuggestion = () => {
    if (pendingSuggestionId) {
      setDismissedSuggestionIds((prev) => new Set(prev).add(pendingSuggestionId));
    }
    setPendingSuggestionId(null);
  };

  const laterSuggestion = () => setPendingSuggestionId(null);

  return (
    <div>
      <PageHeader
        title="课程中心"
        actions={
          <>
            <input
              ref={courseImportInputRef}
              type="file"
              className="sr-only"
              accept=".csv,.xlsx,.xls,.json,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/json"
              onChange={() => {
                const el = courseImportInputRef.current;
                if (el) el.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => courseImportInputRef.current?.click()}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700"
            >
              <Upload size={14} />
              <span>上传文件导入</span>
            </button>

            <button
              onClick={() => {}}
              className="inline-flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700"
            >
              <Plus size={14} /> 新建课程
            </button>
          </>
        }
      />
      <div className="px-6 pt-4 flex flex-wrap items-center gap-3">
        <div ref={profRef} className="relative">
          <button
            type="button"
            onClick={() => setProfPanelOpen((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm transition ${
              profPanelOpen
                ? "border-indigo-300 bg-indigo-50 text-indigo-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            专业筛选
            <span className="text-slate-400 font-normal tabular-nums">
              （{selectedProfIds.size}/{professions.length}）
            </span>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition ${profPanelOpen ? "rotate-180" : ""}`}
            />
          </button>
          {profPanelOpen && (
            <div className="absolute left-0 top-[calc(100%+6px)] w-[min(100vw-3rem,22rem)] bg-white border border-slate-200 rounded-xl shadow-lg z-30 flex flex-col max-h-[min(24rem,50vh)]">
              <div className="p-2 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 py-1">
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <input
                    value={profSearch}
                    onChange={(e) => setProfSearch(e.target.value)}
                    placeholder="搜索专业名称…"
                    className="w-full min-w-0 bg-transparent text-sm outline-none"
                  />
                </div>
              </div>
              <div className="overflow-y-auto flex-1 min-h-0 p-1">
                {professionsFiltered.length === 0 ? (
                  <div className="px-3 py-6 text-center text-slate-400 text-sm">
                    无匹配专业
                  </div>
                ) : (
                  professionsFiltered.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedProfIds.has(p.id)}
                        onChange={() => toggleProfession(p.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-800 truncate">{p.name}</span>
                    </label>
                  ))
                )}
              </div>
              <div className="flex items-center justify-between gap-2 px-2 py-1.5 border-t border-slate-100 text-xs shrink-0">
                <button
                  type="button"
                  onClick={selectAllProfessions}
                  className="text-indigo-600 hover:text-indigo-800 px-2 py-1"
                >
                  全选
                </button>
                <button
                  type="button"
                  onClick={clearProfessions}
                  className="text-slate-500 hover:text-slate-800 px-2 py-1"
                >
                  清空
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2 py-1 flex-1 min-w-[12rem] max-w-md">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            value={courseQuery}
            onChange={(e) => setCourseQuery(e.target.value)}
            placeholder="搜索课程名称…"
            className="w-full min-w-0 bg-transparent text-sm outline-none"
          />
        </div>

        <span className="text-slate-400 text-sm tabular-nums ml-auto">
          课程 {listCourses.length} 条 · AI 建议新增 {scopeSuggested.length} 条
        </span>
      </div>

      <div className="px-6 pb-3">
        <div className="rounded-lg border border-violet-200 bg-gradient-to-r from-violet-50 to-indigo-50 px-4 py-3 flex flex-wrap items-center gap-3">
          <p className="text-sm text-violet-950 flex-1 min-w-[12rem] leading-relaxed">
            <span className="font-medium">✦ AI 图谱差异分析：</span>
            检测到{" "}
            <strong className="tabular-nums">{aiExistingCount}</strong>{" "}
            门已有课程需补充资料或调整学时，另有{" "}
            <strong className="tabular-nums">{scopeSuggested.length}</strong>{" "}
            门课程建议新增立项（数据为演示预置）。
          </p>
          <button
            type="button"
            onClick={() => setAiOnly((v) => !v)}
            className={`shrink-0 px-3 py-1.5 rounded-md text-sm font-medium border transition ${
              aiOnly
                ? "border-violet-500 bg-violet-600 text-white shadow-sm"
                : "border-violet-200 bg-white/80 text-violet-900 hover:border-violet-300"
            }`}
          >
            {aiOnly ? "查看全部课程" : "仅看 AI 建议"}
          </button>
        </div>
      </div>
      <div className="px-6 pb-6 pt-1">
        <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
          <div className="overflow-x-auto max-h-[min(70vh,calc(100vh-12rem))] overflow-y-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 z-10">
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap">课程名称</th>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap">专业</th>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap">学期</th>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">学分</th>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">学时</th>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap">主讲</th>
                  <th className="px-3 py-2.5 font-medium min-w-[8rem]">标签摘要</th>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right min-w-[7rem]">
                    AI 建议
                  </th>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">知识点</th>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">资源</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopeSuggested.map((s) => {
                  const prof = professionById(s.professionId);
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setPendingSuggestionId(s.id)}
                      className="cursor-pointer bg-violet-50/40 text-violet-950 hover:bg-violet-50/80"
                    >
                      <td className="border-l-[3px] border-violet-400 px-3 py-2 max-w-[14rem]">
                        <div className="flex gap-2">
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-500"
                            aria-hidden
                          />
                          <div className="min-w-0">
                            <span className="line-clamp-2 font-medium" title={s.name}>
                              《{s.name}》
                            </span>
                            <div className="text-[0.6875rem] text-violet-700/90 mt-0.5">
                              AI 建议新增 · 推荐挂载 {s.uncoveredNodeIds.length} 个知识点
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        className="px-3 py-2 text-slate-600 whitespace-nowrap max-w-[10rem] truncate"
                        title={prof?.name}
                      >
                        {prof?.name ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{s.semester}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                        {s.recommendedCredit}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                        {s.recommendedHours}
                      </td>
                      <td className="px-3 py-2 text-slate-500 whitespace-nowrap">—</td>
                      <td className="px-3 py-2 text-violet-800 max-w-[12rem] truncate">AI 建议新增</td>
                      <td className="px-3 py-2 text-right">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[0.6875rem] font-medium bg-violet-100 text-violet-900 border border-violet-200">
                          建议新增
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                        {s.uncoveredNodeIds.length}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-400">—</td>
                    </tr>
                  );
                })}
                {listCourses.map((c) => {
                  const owner = teacherById(c.ownerTeacherId);
                  const prof = professionById(c.professionId);
                  const resCount = resourcesByCourse(c.id).filter((r) =>
                    teacherCanViewResource(r, currentTeacherId),
                  ).length;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => onOpen(c.id)}
                      className="hover:bg-slate-50/80 cursor-pointer text-slate-800"
                    >
                      <td className="px-3 py-2 max-w-[14rem]">
                        <span className="line-clamp-2" title={c.name}>
                          《{c.name}》
                        </span>
                      </td>
                      <td
                        className="px-3 py-2 text-slate-600 whitespace-nowrap max-w-[10rem] truncate"
                        title={prof?.name}
                      >
                        {prof?.name ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{c.semester}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">{c.credit}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                        {c.totalHours}
                      </td>
                      <td
                        className="px-3 py-2 text-slate-600 whitespace-nowrap max-w-[8rem] truncate"
                        title={owner?.name}
                      >
                        {owner?.name ?? "—"}
                      </td>
                      <td
                        className="px-3 py-2 text-slate-500 max-w-[12rem] truncate"
                        title={summarizeTags(c.tags)}
                      >
                        {summarizeTags(c.tags)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {c.aiSuggestion ? (
                          <CourseAiSuggestionChips s={c.aiSuggestion} />
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                        {c.knowledgeNodeIds.length}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">{resCount}</td>
                    </tr>
                  );
                })}
                {scopeSuggested.length === 0 && listCourses.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-3 py-16 text-center text-slate-400">
                      {selectedProfIds.size === 0
                        ? "请至少选择一个专业"
                        : aiOnly
                          ? "当前仅显示 AI 建议相关条目，暂无匹配项"
                          : "当前筛选条件下暂无课程"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <NewCourseSuggestionDrawer
        suggestion={drawerSuggestion}
        onClose={() => setPendingSuggestionId(null)}
        onConfirm={confirmSuggestion}
        onIgnore={ignoreSuggestion}
        onLater={laterSuggestion}
      />
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

export function CourseDetail({
  id,
  currentTeacherId,
  onBack,
  onOpenResource,
  onOpenKnowledgeInGraph,
}: {
  id: string;
  currentTeacherId: string;
  onBack: () => void;
  onOpenResource: (id: string) => void;
  onOpenKnowledgeInGraph: (nodeId: string) => void;
}) {
  const [aiFeedback, setAiFeedback] = useState<"adopt" | "dismiss" | null>(null);
  const c = courses.find((x) => x.id === id);

  useEffect(() => {
    setAiFeedback(null);
  }, [id]);

  if (!c) {
    return (
      <div>
        <PageHeader back={onBack} title="课程详情" />
        <div className="p-16 text-center text-slate-500">未找到课程 {id}</div>
      </div>
    );
  }

  const seesAll = teacherSeesAllScopedContent(currentTeacherId);
  if (!seesAll && c.ownerTeacherId !== currentTeacherId) {
    return (
      <div>
        <PageHeader back={onBack} title="课程详情" />
        <div className="p-16 text-center text-slate-500">
          当前账号仅可查看本人负责的课程。
        </div>
      </div>
    );
  }

  const owner = teacherById(c.ownerTeacherId);
  const prof = professionById(c.professionId);
  const resourcesList = resourcesByCourse(c.id).filter((r) =>
    teacherCanViewResource(r, currentTeacherId),
  );

  return (
    <div>
      <PageHeader back={onBack} title={<span>《{c.name}》</span>} />
      <div className="p-6 grid grid-cols-12 gap-4">
        <div className="col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-indigo-100 via-sky-100 to-emerald-100 flex items-center justify-center">
            <BookOpen size={56} className="text-indigo-500/80" />
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-900">《{c.name}》</span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                {prof?.name}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {c.semester}
              </span>
              {c.tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="text-slate-700 mt-3 leading-relaxed">{c.description}</p>
            {c.aiSuggestion && (
              <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/60 p-4">
                {aiFeedback === null ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <AiBadge>AI 课程优化建议</AiBadge>
                      <span className="text-sm font-medium text-violet-950">
                        {c.aiSuggestion.summary}
                      </span>
                      <span className="text-xs text-slate-500 ml-auto">
                        {new Date(c.aiSuggestion.generatedAt).toLocaleString("zh-CN")}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mb-1">图谱对比待加强覆盖的知识点</div>
                    <AssociatedKnowledgeNodes
                      knowledgeNodeIds={c.aiSuggestion.uncoveredNodeIds}
                      onNodeClick={onOpenKnowledgeInGraph}
                      showHeader={false}
                      emptyMessage="暂无解析节点"
                    />
                    <p className="text-sm text-slate-600 mt-3 leading-relaxed whitespace-pre-wrap">
                      {c.aiSuggestion.reason}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setAiFeedback("adopt")}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
                      >
                        采纳建议
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiFeedback("dismiss")}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm hover:bg-slate-50"
                      >
                        忽略
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-600">
                    {aiFeedback === "adopt"
                      ? "已记录采纳意向（演示环境，未持久化）。"
                      : "已标记忽略，可在学院课程委员会或培养方案复审中再次评估。"}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="col-span-4 bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-slate-500 mb-3">课程信息</div>
          <dl className="space-y-2.5">
            <Info k="学分" v={`${c.credit} 学分`} />
            <Info k="学时" v={`${c.totalHours} 学时`} />
            <Info k="开课学期" v={c.semester} />
            <Info k="主讲教师" v={owner ? `${owner.name} · ${owner.title}` : "—"} />
            <Info k="所属专业" v={prof?.name ?? "—"} />
            <Info
              k="关联知识点"
              v={`${c.knowledgeNodeIds.length} 个`}
            />
            <Info k="教学资源" v={`${resourcesList.length} 个`} />
          </dl>
        </aside>

        <section className="col-span-12 bg-white rounded-xl border border-slate-200 p-5">
          <AssociatedKnowledgeNodes
            knowledgeNodeIds={c.knowledgeNodeIds}
            onNodeClick={onOpenKnowledgeInGraph}
            emptyMessage="该课程所属专业尚未建立知识图谱，暂无关联节点。"
          />
        </section>

        <section className="col-span-12 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-indigo-500" />
            <span className="text-slate-900">关联教学资源</span>
            <span className="text-slate-400">（{resourcesList.length}）</span>
          </div>
          <div className="space-y-1.5 max-h-[420px] overflow-auto">
            {resourcesList.map((r) => (
              <button
                key={r.id}
                onClick={() => onOpenResource(r.id)}
                className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 flex items-center gap-2"
              >
                <CourseResIcon type={r.type} />
                <span className="flex-1 truncate">{r.title}</span>
                <span className="text-slate-400 shrink-0">
                  {r.type}
                  {r.sizeMb != null && ` · ${r.sizeMb} MB`}
                </span>
              </button>
            ))}
            {resourcesList.length === 0 && (
              <div className="text-slate-400">该课程暂无关联资源</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500 shrink-0">{k}</dt>
      <dd className="text-slate-800 text-right">{v}</dd>
    </div>
  );
}

function CourseResIcon({ type }: { type: ResourceType }) {
  const common = "shrink-0";
  switch (type) {
    case "video":
      return <Film size={14} className={`${common} text-rose-500`} />;
    case "audio":
      return <Music size={14} className={`${common} text-rose-400`} />;
    case "image":
      return <ImageIcon size={14} className={`${common} text-sky-500`} />;
    case "code":
      return <Code2 size={14} className={`${common} text-violet-500`} />;
    case "dataset":
      return <Database size={14} className={`${common} text-emerald-500`} />;
    case "quiz":
      return <ListChecks size={14} className={`${common} text-amber-500`} />;
    case "online_course":
      return <GraduationCap size={14} className={`${common} text-indigo-600`} />;
    case "ppt":
      return <FileText size={14} className={`${common} text-orange-500`} />;
    default:
      return <FileText size={14} className={`${common} text-indigo-500`} />;
  }
}
