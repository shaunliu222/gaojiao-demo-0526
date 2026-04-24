import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Clock,
  CloudRain,
  FileText,
  Film,
  FlaskConical,
  Image as ImageIcon,
  ListChecks,
  Music,
  Code2,
  Database,
  Download,
  Network,
  Plus,
  School,
  Search,
  Sparkles,
  TreePine,
  User,
} from "lucide-react";
import { courses, professions } from "@mock";
import type { ResourceType } from "@mock";
import {
  teacherById,
  professionById,
  resourcesByCourse,
  trainingsByCourse,
  graphNodeById,
} from "../data/lookups";
import { colorOfCluster } from "../data/graphLayout";
import { PageHeader } from "./Layout";

const IMPORT_SOURCES: {
  key: string;
  name: string;
  description: string;
  icon: typeof Sparkles;
  iconCls: string;
  bgCls: string;
}[] = [
  {
    key: "chaoxing",
    name: "超星",
    description: "同步超星泛雅 / 学习通课程",
    icon: Sparkles,
    iconCls: "text-violet-600",
    bgCls: "bg-violet-50",
  },
  {
    key: "zhihuishu",
    name: "智慧树",
    description: "同步智慧树平台课程",
    icon: TreePine,
    iconCls: "text-emerald-600",
    bgCls: "bg-emerald-50",
  },
  {
    key: "yuketang",
    name: "雨课堂",
    description: "同步雨课堂课程",
    icon: CloudRain,
    iconCls: "text-sky-600",
    bgCls: "bg-sky-50",
  },
  {
    key: "jwxt",
    name: "教务系统",
    description: "从校内教务系统导入课表",
    icon: School,
    iconCls: "text-amber-600",
    bgCls: "bg-amber-50",
  },
];

function summarizeTags(tags: string[]): string {
  if (tags.length === 0) return "—";
  if (tags.length <= 2) return tags.join("、");
  return `${tags[0]}、${tags[1]} 等 ${tags.length} 项`;
}

export function CourseList({ onOpen }: { onOpen: (id: string) => void }) {
  const [selectedProfIds, setSelectedProfIds] = useState<Set<string>>(
    () => new Set(professions.map((p) => p.id))
  );
  const [courseQuery, setCourseQuery] = useState("");
  const [profPanelOpen, setProfPanelOpen] = useState(false);
  const [profSearch, setProfSearch] = useState("");

  const list = useMemo(() => {
    let rows = courses.filter((c) => selectedProfIds.has(c.professionId));
    const q = courseQuery.trim().toLowerCase();
    if (q) rows = rows.filter((c) => c.name.toLowerCase().includes(q));
    return rows;
  }, [selectedProfIds, courseQuery]);

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

  const [importOpen, setImportOpen] = useState(false);
  const importRef = useRef<HTMLDivElement>(null);
  const profRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!importOpen && !profPanelOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (importOpen && importRef.current && !importRef.current.contains(t)) {
        setImportOpen(false);
      }
      if (profPanelOpen && profRef.current && !profRef.current.contains(t)) {
        setProfPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [importOpen, profPanelOpen]);

  return (
    <div>
      <PageHeader
        title="课程中心"
        actions={
          <>
            {/* 导入数据下拉 */}
            <div ref={importRef} className="relative">
              <button
                onClick={() => setImportOpen((v) => !v)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md border transition ${
                  importOpen
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
                }`}
              >
                <Download size={14} />
                <span>导入数据</span>
                <ChevronDown
                  size={14}
                  className={`transition ${
                    importOpen ? "rotate-180 text-indigo-500" : "text-slate-400"
                  }`}
                />
              </button>
              {importOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-20">
                  <div className="px-3 py-1.5 text-slate-400 text-[0.6875rem] uppercase tracking-wider">
                    选择数据来源
                  </div>
                  {IMPORT_SOURCES.map((src) => {
                    const Icon = src.icon;
                    return (
                      <button
                        key={src.key}
                        onClick={() => setImportOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-slate-50"
                      >
                        <span
                          className={`size-7 rounded-md flex items-center justify-center ${src.bgCls}`}
                        >
                          <Icon size={14} className={src.iconCls} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-slate-800">{src.name}</div>
                          <div className="text-slate-400 text-[0.6875rem] truncate">
                            {src.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

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
          共 {list.length} 条
        </span>
      </div>

      <div className="px-6 pb-6 pt-3">
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
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">知识点</th>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">资源</th>
                  <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">实训</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((c) => {
                  const owner = teacherById(c.ownerTeacherId);
                  const prof = professionById(c.professionId);
                  const resCount = resourcesByCourse(c.id).length;
                  const trainCount = trainingsByCourse(c.id).length;
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
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap max-w-[10rem] truncate" title={prof?.name}>
                        {prof?.name ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{c.semester}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">{c.credit}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">{c.totalHours}</td>
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap max-w-[8rem] truncate" title={owner?.name}>
                        {owner?.name ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-500 max-w-[12rem] truncate" title={summarizeTags(c.tags)}>
                        {summarizeTags(c.tags)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                        {c.knowledgeNodeIds.length}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">{resCount}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-600">{trainCount}</td>
                    </tr>
                  );
                })}
                {list.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-3 py-16 text-center text-slate-400">
                      {selectedProfIds.size === 0
                        ? "请至少选择一个专业"
                        : "当前筛选条件下暂无课程"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CourseDetail({
  id,
  onBack,
  onOpenResource,
  onOpenTraining,
}: {
  id: string;
  onBack: () => void;
  onOpenResource: (id: string) => void;
  onOpenTraining: (id: string) => void;
}) {
  const c = courses.find((x) => x.id === id);

  const nodesByCluster = useMemo(() => {
    const map: Record<string, Array<{ id: string; name: string; cluster: string }>> = {};
    if (!c) return map;
    for (const nid of c.knowledgeNodeIds) {
      const n = graphNodeById(nid);
      if (!n) continue;
      if (!map[n.cluster]) map[n.cluster] = [];
      map[n.cluster].push({ id: n.id, name: n.name, cluster: n.cluster });
    }
    return map;
  }, [c]);

  if (!c) {
    return (
      <div>
        <PageHeader back={onBack} title="课程详情" />
        <div className="p-16 text-center text-slate-500">未找到课程 {id}</div>
      </div>
    );
  }
  const owner = teacherById(c.ownerTeacherId);
  const prof = professionById(c.professionId);
  const resources = resourcesByCourse(c.id);
  const trainings = trainingsByCourse(c.id);

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
              k="挂载知识点"
              v={`${c.knowledgeNodeIds.length} 个`}
            />
            <Info k="教学资源" v={`${resources.length} 个`} />
            <Info k="实训项目" v={`${trainings.length} 个`} />
          </dl>
        </aside>

        <section className="col-span-12 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Network size={16} className="text-indigo-500" />
            <span className="text-slate-900">挂载知识点</span>
            <span className="text-slate-400">（{c.knowledgeNodeIds.length}）</span>
          </div>
          {Object.keys(nodesByCluster).length === 0 ? (
            <div className="text-slate-400">
              该课程所属专业尚未建立知识图谱，暂无挂载节点。
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(nodesByCluster).map(([cluster, ns]) => (
                <div key={cluster}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: colorOfCluster(cluster) }}
                    />
                    <span className="text-slate-700">{cluster}</span>
                    <span className="text-slate-400">（{ns.length}）</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ns.map((n) => (
                      <span
                        key={n.id}
                        className="px-2 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-700"
                      >
                        {n.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="col-span-7 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-indigo-500" />
            <span className="text-slate-900">关联教学资源</span>
            <span className="text-slate-400">（{resources.length}）</span>
          </div>
          <div className="space-y-1.5 max-h-[420px] overflow-auto">
            {resources.map((r) => (
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
            {resources.length === 0 && (
              <div className="text-slate-400">该课程暂无关联资源</div>
            )}
          </div>
        </section>

        <section className="col-span-5 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical size={16} className="text-emerald-500" />
            <span className="text-slate-900">关联实训项目</span>
            <span className="text-slate-400">（{trainings.length}）</span>
          </div>
          <div className="space-y-1.5 max-h-[420px] overflow-auto">
            {trainings.map((t) => (
              <button
                key={t.id}
                onClick={() => onOpenTraining(t.id)}
                className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40"
              >
                <div className="flex items-center gap-2">
                  <span className="flex-1 truncate text-slate-800">{t.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md shrink-0 ${
                      t.difficulty === "入门"
                        ? "bg-emerald-50 text-emerald-700"
                        : t.difficulty === "进阶"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {t.difficulty}
                  </span>
                </div>
                <div className="text-slate-500 mt-0.5">
                  预估 {t.estimatedHours}h · {t.goals[0] ?? ""}
                </div>
              </button>
            ))}
            {trainings.length === 0 && (
              <div className="text-slate-400">该课程暂无关联实训</div>
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
    case "ppt":
      return <FileText size={14} className={`${common} text-orange-500`} />;
    default:
      return <FileText size={14} className={`${common} text-indigo-500`} />;
  }
}
