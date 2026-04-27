import { useMemo, useState } from "react";
import {
  Search,
  Clock,
  FlaskConical,
  Target,
  Package,
  Settings2,
  BookOpen,
} from "lucide-react";
import { trainingProjects, professions } from "@mock";
import type { TrainingProject } from "@mock";
import {
  teacherById,
  professionById,
  courseById,
  teacherSeesAllScopedContent,
} from "../data/lookups";
import { PageHeader } from "./Layout";
import { AssociatedKnowledgeNodes } from "./AssociatedKnowledgeNodes";

type Difficulty = TrainingProject["difficulty"];

export function TrainingList({
  currentTeacherId,
  onOpen,
}: {
  currentTeacherId: string;
  onOpen: (id: string) => void;
}) {
  const [profFilter, setProfFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");
  const [q, setQ] = useState<string>("");

  const list = useMemo(() => {
    const seesAll = teacherSeesAllScopedContent(currentTeacherId);
    return trainingProjects.filter((t) => {
      if (!seesAll && t.ownerTeacherId !== currentTeacherId) return false;
      if (profFilter !== "all" && t.professionId !== profFilter) return false;
      if (difficultyFilter !== "all" && t.difficulty !== difficultyFilter) return false;
      if (q.trim()) {
        const k = q.trim().toLowerCase();
        if (
          !t.name.toLowerCase().includes(k) &&
          !t.description.toLowerCase().includes(k) &&
          !t.tags.some((tag) => tag.toLowerCase().includes(k))
        ) {
          return false;
        }
      }
      return true;
    });
  }, [profFilter, difficultyFilter, q, currentTeacherId]);

  return (
    <div>
      <PageHeader
        title="实训项目库"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1 w-56">
              <Search size={14} className="text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="搜索项目名/描述"
                className="w-full outline-none"
              />
            </div>
          </div>
        }
      />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap gap-1.5">
            <Chip
              active={profFilter === "all"}
              label="全部专业"
              onClick={() => setProfFilter("all")}
            />
            {professions.map((p) => (
              <Chip
                key={p.id}
                active={profFilter === p.id}
                label={p.name}
                onClick={() => setProfFilter(p.id)}
              />
            ))}
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex flex-wrap gap-1.5">
            <Chip
              active={difficultyFilter === "all"}
              label="全部难度"
              onClick={() => setDifficultyFilter("all")}
            />
            {(["入门", "进阶", "综合"] as const).map((d) => (
              <Chip
                key={d}
                active={difficultyFilter === d}
                label={d}
                onClick={() => setDifficultyFilter(d)}
              />
            ))}
          </div>
        </div>

        <div className="text-slate-500 mb-3">共 {list.length} 个实训项目</div>
        <div className="grid grid-cols-3 gap-4">
          {list.map((t) => {
            const owner = teacherById(t.ownerTeacherId);
            const prof = professionById(t.professionId);
            return (
              <button
                key={t.id}
                onClick={() => onOpen(t.id)}
                className="text-left bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-emerald-300 hover:shadow-md transition"
              >
                <div className="h-32 relative bg-gradient-to-br from-emerald-100 via-sky-100 to-indigo-100 flex items-center justify-center">
                  <FlaskConical size={40} className="text-emerald-600/70" />
                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-md ${
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
                <div className="p-4">
                  <div className="text-slate-900 truncate">{t.name}</div>
                  <div className="text-slate-500 truncate mt-0.5">
                    {prof?.name} · {owner?.name ?? "—"}
                  </div>
                  <p className="mt-2 text-slate-600 text-[0.8125rem] line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={12} /> {t.estimatedHours}h
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Target size={12} /> {t.goals.length} 目标
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Package size={12} /> {t.deliverables.length} 交付物
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
          {list.length === 0 && (
            <div className="col-span-3 p-12 text-center text-slate-400">
              未找到符合条件的实训项目
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function TrainingDetail({
  id,
  currentTeacherId,
  onBack,
  onOpenCourse,
  onOpenKnowledgeInGraph,
}: {
  id: string;
  /** 教师端传入；学生端不传则不做负责教师校验 */
  currentTeacherId?: string;
  onBack: () => void;
  onOpenCourse: (id: string) => void;
  /** 教师端：从知识点进入图谱；学生端可不传 */
  onOpenKnowledgeInGraph?: (nodeId: string) => void;
}) {
  const t = trainingProjects.find((x) => x.id === id);
  if (!t) {
    return (
      <div>
        <PageHeader back={onBack} title="实训项目详情" />
        <div className="p-16 text-center text-slate-500">未找到实训项目 {id}</div>
      </div>
    );
  }

  if (
    currentTeacherId !== undefined &&
    !teacherSeesAllScopedContent(currentTeacherId) &&
    t.ownerTeacherId !== currentTeacherId
  ) {
    return (
      <div>
        <PageHeader back={onBack} title="实训项目详情" />
        <div className="p-16 text-center text-slate-500">
          当前账号仅可查看本人负责的实训项目。
        </div>
      </div>
    );
  }

  const owner = teacherById(t.ownerTeacherId);
  const prof = professionById(t.professionId);
  const relatedCourses = t.courseIds.map(courseById).filter(Boolean);

  return (
    <div>
      <PageHeader back={onBack} title={t.name} />
      <div className="p-6 grid grid-cols-12 gap-4">
        <div className="col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-emerald-100 via-sky-100 to-indigo-100 flex items-center justify-center">
            <FlaskConical size={56} className="text-emerald-600/80" />
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2 py-0.5 rounded-md ${
                  t.difficulty === "入门"
                    ? "bg-emerald-50 text-emerald-700"
                    : t.difficulty === "进阶"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {t.difficulty}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 inline-flex items-center gap-1">
                <Clock size={12} /> {t.estimatedHours} 学时
              </span>
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                {prof?.name}
              </span>
              {t.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-slate-700 mt-3 leading-relaxed">{t.description}</p>
          </div>
        </div>

        <aside className="col-span-4 bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-slate-500 mb-3">项目信息</div>
          <dl className="space-y-2.5">
            <Info k="负责教师" v={owner ? `${owner.name} · ${owner.title}` : "—"} />
            <Info k="所属专业" v={prof?.name ?? "—"} />
            <Info k="难度" v={t.difficulty} />
            <Info k="预估学时" v={`${t.estimatedHours} 学时`} />
            <Info k="关联知识点" v={`${t.knowledgeNodeIds.length} 个`} />
          </dl>
          {t.environment && (
            <>
              <div className="mt-4 border-t border-slate-100 pt-4 flex items-center gap-1.5 text-slate-500 mb-1.5">
                <Settings2 size={14} /> 实训环境
              </div>
              <div className="text-slate-700">{t.environment}</div>
            </>
          )}
        </aside>

        <section className="col-span-6 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target size={16} className="text-indigo-500" />
            <span className="text-slate-900">实训目标</span>
          </div>
          <ul className="space-y-2">
            {t.goals.map((g, i) => (
              <li key={i} className="flex gap-2 text-slate-700">
                <span className="mt-1 size-1.5 rounded-full bg-indigo-500 shrink-0" />
                <span>{g}</span>
              </li>
            ))}
            {t.goals.length === 0 && <li className="text-slate-400">—</li>}
          </ul>
        </section>

        <section className="col-span-6 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-emerald-500" />
            <span className="text-slate-900">交付物</span>
          </div>
          <ul className="space-y-2">
            {t.deliverables.map((d, i) => (
              <li key={i} className="flex gap-2 text-slate-700">
                <span className="mt-1 size-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>{d}</span>
              </li>
            ))}
            {t.deliverables.length === 0 && <li className="text-slate-400">—</li>}
          </ul>
        </section>

        <section className="col-span-12 bg-white rounded-xl border border-slate-200 p-5">
          <AssociatedKnowledgeNodes
            knowledgeNodeIds={t.knowledgeNodeIds}
            onNodeClick={onOpenKnowledgeInGraph}
            emptyMessage="该实训所属专业尚未建立知识图谱，暂无关联节点。"
          />
        </section>

        <section className="col-span-12 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={16} className="text-indigo-500" />
            <span className="text-slate-900">关联课程</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {relatedCourses.map((c) => (
              <button
                key={c!.id}
                onClick={() => onOpenCourse(c!.id)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-700"
              >
                《{c!.name}》
              </button>
            ))}
            {relatedCourses.length === 0 && (
              <span className="text-slate-400">暂无关联课程</span>
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

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md transition ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {label}
    </button>
  );
}
