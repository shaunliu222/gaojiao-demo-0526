import { useMemo, useState } from "react";
import {
  BookOpen,
  Clock,
  FileText,
  Film,
  FlaskConical,
  Image as ImageIcon,
  ListChecks,
  Music,
  Code2,
  Database,
  Network,
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

export function CourseList({ onOpen }: { onOpen: (id: string) => void }) {
  const [profId, setProfId] = useState<string>("all");
  const list = useMemo(() => {
    if (profId === "all") return courses;
    return courses.filter((c) => c.professionId === profId);
  }, [profId]);

  return (
    <div>
      <PageHeader
        title="课程中心"
        actions={
          <select
            value={profId}
            onChange={(e) => setProfId(e.target.value)}
            className="bg-white border border-slate-200 rounded-md px-2 py-1"
          >
            <option value="all">全部专业</option>
            {professions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        }
      />
      <div className="p-6 grid grid-cols-3 gap-4">
        {list.map((c) => {
          const owner = teacherById(c.ownerTeacherId);
          const prof = professionById(c.professionId);
          const resCount = resourcesByCourse(c.id).length;
          const trainCount = trainingsByCourse(c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => onOpen(c.id)}
              className="text-left bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-indigo-300 hover:shadow-md transition"
            >
              <div className="h-32 bg-gradient-to-br from-indigo-100 via-sky-100 to-emerald-100 flex items-center justify-center">
                <BookOpen size={36} className="text-indigo-500/70" />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 truncate">《{c.name}》</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0 ml-2">
                    {c.credit} 学分
                  </span>
                </div>
                <div className="mt-1 text-slate-500 truncate">
                  {prof?.name} · {c.semester}
                </div>
                <div className="mt-2 flex items-center gap-3 text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} /> {c.totalHours} 学时
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <User size={12} /> {owner?.name ?? "—"}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  {c.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-3 text-slate-500 border-t border-slate-100 pt-3">
                  <span>知识点 {c.knowledgeNodeIds.length}</span>
                  <span>资源 {resCount}</span>
                  <span>实训 {trainCount}</span>
                </div>
              </div>
            </button>
          );
        })}
        {list.length === 0 && (
          <div className="col-span-3 p-12 text-center text-slate-400">该专业暂无课程</div>
        )}
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
