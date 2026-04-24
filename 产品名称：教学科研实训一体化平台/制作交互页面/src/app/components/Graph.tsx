import { useMemo, useState } from "react";
import { X, BookOpen, Film, FileText, FlaskConical, Image as ImageIcon, Music, Code2, Database, ListChecks } from "lucide-react";
import {
  professions,
  nodesByProfession,
  edgesByProfession,
} from "@mock";
import type { GraphNode, ResourceType } from "@mock";
import {
  resourceById,
  coursesByNode,
  resourcesByNode,
  trainingsByNode,
  teacherById,
  courseById,
} from "../data/lookups";
import {
  computeGraphLayout,
  colorOfCluster,
  computeFocusNodes,
  clusterColor,
} from "../data/graphLayout";
import { teachingPlans } from "@mock";
import { PageHeader, AiBadge } from "./Layout";

const SVG_W = 900;
const SVG_H = 520;

export function GraphBrowse({ onOpenResource }: { onOpenResource: (id: string) => void }) {
  const [profId, setProfId] = useState<string>("prof-mech");
  const [planId, setPlanId] = useState<string>("plan-main");
  const [sectionId, setSectionId] = useState<string>("sec-3-2");
  const [selected, setSelected] = useState<string | null>("kn-mech-031");

  const prof = professions.find((p) => p.id === profId);
  const nodes = nodesByProfession[profId] ?? [];
  const edges = edgesByProfession[profId] ?? [];

  const coords = useMemo(
    () => computeGraphLayout(nodes, edges, { width: SVG_W, height: SVG_H }),
    [nodes, edges],
  );

  // focus 集合
  const focusIds = useMemo(() => {
    const plan = teachingPlans.find((p) => p.id === planId);
    if (!plan || plan.professionId !== profId) return new Set<string>();
    return computeFocusNodes(plan, sectionId);
  }, [planId, sectionId, profId]);

  const node = selected ? nodes.find((n) => n.id === selected) : undefined;

  // 当前图谱真正出现的簇（用于图例，避免全局簇色盘太长）
  const clustersInGraph = useMemo(() => {
    const set = new Set<string>();
    for (const n of nodes) set.add(n.cluster);
    return Array.from(set);
  }, [nodes]);

  // 当前专业相关的教学计划（供上下文切换）
  const profPlans = teachingPlans.filter((p) => p.professionId === profId);
  const currentPlan = teachingPlans.find((p) => p.id === planId);

  return (
    <div>
      <PageHeader
        title="知识图谱"
        actions={
          <>
            <select
              value={profId}
              onChange={(e) => {
                const nid = e.target.value;
                setProfId(nid);
                const firstPlan = teachingPlans.find((p) => p.professionId === nid);
                setPlanId(firstPlan?.id ?? "");
                setSectionId("");
                setSelected(null);
              }}
              className="bg-white border border-slate-200 rounded-md px-2 py-1"
            >
              {professions.map((p) => (
                <option key={p.id} value={p.id}>
                  专业：{p.name}
                  {!p.hasKnowledgeGraph ? "（未建图谱）" : ""}
                </option>
              ))}
            </select>
            {profPlans.length > 0 && (
              <select
                value={planId}
                onChange={(e) => {
                  setPlanId(e.target.value);
                  setSectionId("");
                }}
                className="bg-white border border-slate-200 rounded-md px-2 py-1"
              >
                {profPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    上下文计划：{p.title.split(" · ").slice(0, 2).join(" · ")}
                  </option>
                ))}
              </select>
            )}
            {currentPlan && (
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="bg-white border border-slate-200 rounded-md px-2 py-1"
              >
                <option value="">全部已设计小节</option>
                {currentPlan.chapters.flatMap((c) =>
                  c.sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  )),
                )}
              </select>
            )}
            <button className="px-3 py-1.5 rounded-md bg-indigo-600 text-white">编辑图谱</button>
          </>
        }
      />
      <div className="p-6 grid grid-cols-12 gap-4">
        <div
          className="col-span-8 bg-white rounded-xl border border-slate-200 relative overflow-hidden"
          style={{ height: SVG_H }}
        >
          {prof && !prof.hasKnowledgeGraph ? (
            <EmptyGraph professionName={prof.name} />
          ) : nodes.length === 0 ? (
            <EmptyGraph professionName={prof?.name ?? "该专业"} />
          ) : (
            <>
              <div className="absolute top-3 left-3 flex gap-2 z-10 flex-wrap max-w-[70%]">
                {clustersInGraph.map((k) => (
                  <div
                    key={k}
                    className="flex items-center gap-1.5 bg-white/90 border border-slate-200 rounded-full px-2 py-0.5"
                  >
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: clusterColor[k] ?? colorOfCluster(k) }}
                    />
                    <span className="text-slate-600">{k}</span>
                  </div>
                ))}
              </div>
              <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full">
                {edges.map((e) => {
                  const a = coords.get(e.from);
                  const b = coords.get(e.to);
                  if (!a || !b) return null;
                  return (
                    <line
                      key={e.id}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke="#cbd5e1"
                      strokeWidth={1}
                    />
                  );
                })}
                {nodes.map((n) => {
                  const xy = coords.get(n.id);
                  if (!xy) return null;
                  const color = colorOfCluster(n.cluster);
                  const isSel = n.id === selected;
                  const isFocus = focusIds.has(n.id);
                  return (
                    <g
                      key={n.id}
                      onClick={() => setSelected(n.id)}
                      style={{ cursor: "pointer" }}
                    >
                      {isFocus && (
                        <circle
                          cx={xy.x}
                          cy={xy.y}
                          r={22}
                          fill="none"
                          stroke="#6366f1"
                          strokeDasharray="3 3"
                        />
                      )}
                      <NodeShape
                        type={n.nodeType}
                        x={xy.x}
                        y={xy.y}
                        color={color}
                        selected={isSel}
                      />
                      <text
                        x={xy.x}
                        y={xy.y + 24}
                        textAnchor="middle"
                        fontSize={10}
                        fill="#334155"
                        className="pointer-events-none"
                      >
                        {shortLabel(n.name)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </>
          )}
        </div>
        <aside
          className="col-span-4 bg-white rounded-xl border border-slate-200 p-5"
          style={{ height: SVG_H, overflow: "auto" }}
        >
          {node ? (
            <NodeDetailPanel
              node={node}
              isFocus={focusIds.has(node.id)}
              onOpenResource={onOpenResource}
              onClose={() => setSelected(null)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              {prof && !prof.hasKnowledgeGraph ? "该专业尚未建设图谱" : "点击节点查看详情"}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function shortLabel(name: string): string {
  return name.length > 6 ? name.slice(0, 6) + "…" : name;
}

function EmptyGraph({ professionName }: { professionName: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center p-8">
      <div className="size-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
        <BookOpen size={28} />
      </div>
      <div className="text-slate-900 mb-1">{professionName}尚未建设知识图谱</div>
      <p className="text-slate-500 max-w-md">
        该专业当前没有可视化的图谱节点。可在"编辑图谱"中导入专业培养方案，由 AI 协助生成初稿后进入人工校对流程。
      </p>
      <button className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white">立即建设图谱</button>
    </div>
  );
}

function NodeShape({
  type,
  x,
  y,
  color,
  selected,
}: {
  type: GraphNode["nodeType"];
  x: number;
  y: number;
  color: string;
  selected: boolean;
}) {
  const stroke = selected ? "#1e293b" : "white";
  const strokeWidth = 2;
  if (type === "知识点") {
    return (
      <circle cx={x} cy={y} r={selected ? 14 : 10} fill={color} stroke={stroke} strokeWidth={strokeWidth} />
    );
  }
  if (type === "技能点") {
    return (
      <rect
        x={x - (selected ? 12 : 10)}
        y={y - (selected ? 12 : 10)}
        width={selected ? 24 : 20}
        height={selected ? 24 : 20}
        rx={3}
        fill={color}
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }
  const r = selected ? 14 : 11;
  return (
    <polygon
      points={`${x},${y - r} ${x - r},${y + r * 0.75} ${x + r},${y + r * 0.75}`}
      fill={color}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}

function NodeDetailPanel({
  node,
  isFocus,
  onOpenResource,
  onClose,
}: {
  node: GraphNode;
  isFocus: boolean;
  onOpenResource: (id: string) => void;
  onClose: () => void;
}) {
  const rs = resourcesByNode(node.id);
  const cs = coursesByNode(node.id);
  const ts = trainingsByNode(node.id);
  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-slate-900">{node.name}</div>
          <div className="mt-1 flex gap-1.5 flex-wrap">
            <span
              className="px-2 py-0.5 rounded-md text-white"
              style={{ background: colorOfCluster(node.cluster) }}
            >
              {node.nodeType}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {node.cluster}
            </span>
            {isFocus && <AiBadge>主线焦点</AiBadge>}
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
          <X size={16} />
        </button>
      </div>
      <p className="mt-3 text-slate-600 leading-relaxed">{node.description}</p>

      <div className="mt-4">
        <div className="flex items-center gap-1.5 text-slate-500 mb-2">
          <BookOpen size={14} /> 挂载课程（{cs.length}）
        </div>
        <div className="space-y-1.5">
          {cs.map((c) => (
            <div key={c.id} className="px-3 py-2 rounded-lg border border-slate-200">
              《{c.name}》 · {c.credit} 学分
            </div>
          ))}
          {cs.length === 0 && <div className="text-slate-400">暂无课程挂载</div>}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-1.5 text-slate-500 mb-2">
          <FileText size={14} /> 挂载资源（{rs.length}）
        </div>
        <div className="space-y-1.5">
          {rs.slice(0, 8).map((r) => (
            <button
              key={r.id}
              onClick={() => onOpenResource(r.id)}
              className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 flex items-center gap-2"
            >
              <ResourceTypeIcon type={r.type} />
              <span className="flex-1 truncate">{r.title}</span>
              <span className="text-slate-400">{r.type}</span>
              {r.isAiGenerated && <AiBadge>AI</AiBadge>}
            </button>
          ))}
          {rs.length === 0 && <div className="text-slate-400">该节点暂未挂载资源</div>}
          {rs.length > 8 && (
            <div className="text-slate-400">还有 {rs.length - 8} 个资源…</div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-1.5 text-slate-500 mb-2">
          <FlaskConical size={14} /> 挂载实训（{ts.length}）
        </div>
        <div className="space-y-1.5">
          {ts.map((t) => (
            <div key={t.id} className="px-3 py-2 rounded-lg border border-slate-200">
              {t.name} · {t.difficulty} · {t.estimatedHours}h
            </div>
          ))}
          {ts.length === 0 && <div className="text-slate-400">暂无实训挂载</div>}
        </div>
      </div>
    </div>
  );
}

function ResourceTypeIcon({ type }: { type: ResourceType }) {
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

// =============================================================================
// ResourceDetail（按 id 渲染，复用于图谱/资源库/课程详情）
// =============================================================================

export function ResourceDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const r = resourceById(id);
  if (!r) {
    return (
      <div>
        <PageHeader back={onBack} title="资源详情" />
        <div className="p-16 text-center text-slate-500">未找到资源 {id}</div>
      </div>
    );
  }
  const uploader = teacherById(r.uploaderTeacherId);
  const courses = r.courseIds.map(courseById).filter(Boolean);
  const nodes = r.knowledgeNodeIds;

  return (
    <div>
      <PageHeader
        back={onBack}
        title={
          <div className="flex items-center gap-2">
            <span>{r.title}</span>
            {r.isAiGenerated && <AiBadge>AI 生成</AiBadge>}
          </div>
        }
        actions={
          <>
            <button className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50">
              下载
            </button>
            <button className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
              插入到教学设计
            </button>
          </>
        }
      />
      <div className="p-6 grid grid-cols-12 gap-4">
        <div className="col-span-8 bg-white rounded-xl border border-slate-200 h-[520px] flex items-center justify-center text-slate-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100" />
          <div className="relative text-center">
            <div className="mx-auto size-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-3">
              <ResourceTypeIcon type={r.type} />
            </div>
            <div className="text-slate-600">{r.type.toUpperCase()} 资源预览</div>
            <div className="text-slate-400 mt-1 max-w-md">
              {r.description || "演示占位 · 点击下载或插入到教学设计"}
            </div>
          </div>
        </div>
        <aside className="col-span-4 bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-slate-500 mb-3">信息面板</div>
          <dl className="space-y-2.5">
            <Info2 k="类型" v={r.type.toUpperCase()} />
            {r.sizeMb != null && <Info2 k="大小" v={`${r.sizeMb} MB`} />}
            {r.duration && <Info2 k="时长" v={r.duration} />}
            <Info2 k="上传人" v={uploader?.name ?? r.uploaderTeacherId} />
            <Info2 k="上传时间" v={r.uploadedAt.slice(0, 10)} />
            <Info2
              k="所属课程"
              v={courses.length > 0 ? courses.map((c) => `《${c!.name}》`).join("、") : "—"}
            />
          </dl>
          <div className="mt-4 border-t border-slate-100 pt-4">
            <div className="text-slate-500 mb-2">挂载知识点（{nodes.length}）</div>
            <ul className="space-y-1.5">
              {nodes.slice(0, 6).map((nid) => (
                <li
                  key={nid}
                  className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-800 text-sm"
                >
                  {nid}
                </li>
              ))}
              {nodes.length > 6 && (
                <li className="text-slate-400 text-sm">还有 {nodes.length - 6} 个…</li>
              )}
              {nodes.length === 0 && <li className="text-slate-400">—</li>}
            </ul>
          </div>
          {r.tags.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="text-slate-500 mb-2">标签</div>
              <div className="flex flex-wrap gap-1.5">
                {r.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          <button className="mt-4 w-full py-2 rounded-lg border border-indigo-200 text-indigo-700 hover:bg-indigo-50">
            查看图谱中位置 →
          </button>
        </aside>
      </div>
    </div>
  );
}

function Info2({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-slate-500">{k}</dt>
      <dd className="text-slate-800 text-right truncate max-w-[60%]">{v}</dd>
    </div>
  );
}
