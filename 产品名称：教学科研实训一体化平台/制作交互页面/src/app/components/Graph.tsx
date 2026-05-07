import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Film, FileText, Image as ImageIcon,
  Music, Code2, Database, ListChecks, Sparkles, Pencil,
  ChevronDown, ChevronRight, Layers, Network,
  ClipboardList, Brain,
  Upload, ArrowLeft, GraduationCap,
} from "lucide-react";
import {
  professions,
  l1Edges, l1NodesByProfession, l1NodeById,
  l2StandardCoursePlans, l2PlanById,
  l3Nodes, l3Edges, l3NodeById,
  kgSourceMaterials,
} from "@mock";
import type {
  L1Node, L1Edge, L2StandardCoursePlan,
  L3Node, L3Edge, L3NodeKind,
  L1NodeTypeCode, KGSourceMaterial,
  ResourceType,
  Resource,
} from "@mock";
import {
  resourceById,
  teacherById,
  courseById,
  trainingById,
  graphNodeById,
  teacherSeesAllScopedContent,
} from "../data/lookups";
import { PageHeader, AiBadge, type Role } from "./Layout";
import { AssociatedKnowledgeNodes } from "./AssociatedKnowledgeNodes";

function wizardDelay(ms: number, cancelled?: () => boolean) {
  return new Promise<void>((resolve) => {
    window.setTimeout(() => {
      if (!cancelled?.()) resolve();
    }, ms);
  });
}

// ============================================================
// 颜色常量
// ============================================================
const L1_TYPE_COLOR: Record<L1NodeTypeCode, string> = {
  industry_demand:  "#4f46e5", // 靛蓝
  job_competency:   "#7c3aed", // 紫
  core_literacy:    "#db2777", // 粉
  ability:          "#2563eb", // 蓝
  training_goal:    "#059669", // 绿
  course_standard:  "#d97706", // 琥珀
};
const L1_TYPE_LABEL: Record<L1NodeTypeCode, string> = {
  industry_demand:  "产业需求",
  job_competency:   "岗位能力",
  core_literacy:    "核心素养",
  ability:          "能力",
  training_goal:    "培养目标",
  course_standard:  "课程标准",
};

const L3_KIND_COLOR: Record<L3NodeKind, string> = {
  knowledge_point: "#0f766e",
  skill_point:     "#0284c7",
  literacy_point:  "#9333ea",
};

// ============================================================
// 简单力学布局（按 cluster 环形排布节点）
// ============================================================
type NodePos = { id: string; x: number; y: number; };

function layoutNodes<T extends { id: string; cluster?: string }>(
  nodes: T[],
  w: number,
  h: number,
): NodePos[] {
  if (nodes.length === 0) return [];
  const clusters: Record<string, T[]> = {};
  for (const n of nodes) {
    const c = n.cluster ?? "default";
    if (!clusters[c]) clusters[c] = [];
    clusters[c].push(n);
  }
  const clusterNames = Object.keys(clusters);
  const cx = w / 2;
  const cy = h / 2;
  const macroR = Math.min(w, h) * 0.34;
  const result: NodePos[] = [];

  clusterNames.forEach((cname, ci) => {
    const cNodes = clusters[cname]!;
    const macroAngle = (2 * Math.PI * ci) / clusterNames.length - Math.PI / 2;
    const clusterCx = clusterNames.length === 1 ? cx : cx + macroR * Math.cos(macroAngle);
    const clusterCy = clusterNames.length === 1 ? cy : cy + macroR * Math.sin(macroAngle);
    const microR = Math.max(28, Math.min(60, 28 * cNodes.length));
    cNodes.forEach((n, ni) => {
      const angle = (2 * Math.PI * ni) / cNodes.length - Math.PI / 2;
      const x = cNodes.length === 1 ? clusterCx : clusterCx + microR * Math.cos(angle);
      const y = cNodes.length === 1 ? clusterCy : clusterCy + microR * Math.sin(angle);
      result.push({ id: n.id, x: Math.max(18, Math.min(w - 18, x)), y: Math.max(18, Math.min(h - 18, y)) });
    });
  });
  return result;
}

// ============================================================
// 层标题条组件
// ============================================================
function LayerBar({
  layer, label, icon, expanded, nodeCount, onToggle, extra,
}: {
  layer: "L1" | "L2" | "L3";
  label: string;
  icon: React.ReactNode;
  expanded: boolean;
  nodeCount: number;
  onToggle: () => void;
  extra?: React.ReactNode;
}) {
  const bg: Record<string, string> = {
    L1: "bg-indigo-50 border-indigo-200",
    L2: "bg-violet-50 border-violet-200",
    L3: "bg-teal-50 border-teal-200",
  };
  const text: Record<string, string> = {
    L1: "text-indigo-800",
    L2: "text-violet-800",
    L3: "text-teal-800",
  };
  const countBadge =
    layer === "L2" ? `${nodeCount} 份` : `${nodeCount} 项`;
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${bg[layer]} cursor-pointer select-none`} onClick={onToggle}>
      <span className={`${text[layer]}`}>{icon}</span>
      <span className={`font-semibold text-sm ${text[layer]}`}>{label}</span>
      <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full bg-white/60 ${text[layer]}`}>{countBadge}</span>
      {extra && <span className="ml-auto flex items-center gap-2">{extra}</span>}
      <span className={`${extra ? "" : "ml-auto"} ${text[layer]}`}>
        {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
      </span>
    </div>
  );
}

// ============================================================
// L1 画布
// ============================================================
function L1Canvas({
  nodes, edges, spineOnly, width, height,
}: {
  nodes: L1Node[];
  edges: L1Edge[];
  spineOnly: boolean;
  width: number;
  height: number;
}) {
  const displayNodes = useMemo(
    () => spineOnly ? nodes.filter((n) => n.onSpine) : nodes,
    [nodes, spineOnly],
  );
  const displayEdges = useMemo(() => {
    const ids = new Set(displayNodes.map((n) => n.id));
    return edges.filter((e) => {
      const pass = ids.has(e.from) && ids.has(e.to);
      return spineOnly ? pass && e.isSpine : pass;
    });
  }, [edges, displayNodes, spineOnly]);

  const positions = useMemo(
    () => layoutNodes(displayNodes, width, height),
    [displayNodes, width, height],
  );
  const posById = useMemo(
    () => Object.fromEntries(positions.map((p) => [p.id, p])),
    [positions],
  );

  return (
    <svg
      width={width}
      height={height}
      className="w-full h-full"
    >
      <defs>
        <marker id="l1-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8" />
        </marker>
      </defs>
      {/* 边 */}
      {displayEdges.map((e) => {
        const from = posById[e.from];
        const to = posById[e.to];
        if (!from || !to) return null;
        const isSpineEdge = e.isSpine;
        return (
          <g key={e.id}>
            <line
              x1={from.x} y1={from.y} x2={to.x} y2={to.y}
              stroke={isSpineEdge ? "#6366f1" : "#cbd5e1"}
              strokeWidth={isSpineEdge ? 2 : 1}
              strokeDasharray={isSpineEdge ? undefined : "4 3"}
              markerEnd="url(#l1-arrow)"
              opacity={isSpineEdge ? 0.9 : 0.5}
            />
            <text
              x={(from.x + to.x) / 2}
              y={(from.y + to.y) / 2 - 3}
              textAnchor="middle"
              fontSize={9}
              fill="#94a3b8"
              className="pointer-events-none"
            >
              {e.relation}
            </text>
          </g>
        );
      })}
      {/* 节点 */}
      {displayNodes.map((node) => {
        const pos = posById[node.id];
        if (!pos) return null;
        const color = L1_TYPE_COLOR[node.schemaTypeCode];
        const isSpineNode = node.onSpine;
        const dim = (!spineOnly && !isSpineNode) ? 0.45 : 1;
        return (
          <g
            key={node.id}
            transform={`translate(${pos.x},${pos.y})`}
          >
            {/* 菱形 */}
            <path
              d="M0,-12 L12,0 L0,12 L-12,0 Z"
              fill={color}
              fillOpacity={dim}
            />
            {node.status === "ai_draft" && (
              <circle cx={10} cy={-10} r={5} fill="#7c3aed" />
            )}
            {node.status === "ai_draft" && (
              <text x={10} y={-7} textAnchor="middle" fontSize={6} fill="white">AI</text>
            )}
            <text
              y={18}
              textAnchor="middle"
              fontSize={9.5}
              fill="#334155"
              fillOpacity={dim}
              className="pointer-events-none"
            >
              {node.name.length > 8 ? node.name.slice(0, 8) + "…" : node.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================
// L3 画布
// ============================================================
function L3Canvas({
  nodes, edges, width, height,
}: {
  nodes: L3Node[];
  edges: L3Edge[];
  width: number;
  height: number;
}) {
  const positions = useMemo(
    () => layoutNodes(nodes, width, height),
    [nodes, width, height],
  );
  const posById = useMemo(
    () => Object.fromEntries(positions.map((p) => [p.id, p])),
    [positions],
  );
  const nodeIds = useMemo(() => new Set(nodes.map((n) => n.id)), [nodes]);
  const visEdges = useMemo(
    () => edges.filter((e) => nodeIds.has(e.from) && nodeIds.has(e.to)),
    [edges, nodeIds],
  );

  return (
    <svg
      width={width}
      height={height}
      className="w-full h-full"
    >
      <defs>
        <marker id="l3-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#94a3b8" />
        </marker>
      </defs>
      {/* 边 */}
      {visEdges.map((e) => {
        const from = posById[e.from];
        const to = posById[e.to];
        if (!from || !to) return null;
        const dashMap: Record<string, string | undefined> = {
          "先修": undefined, "关联": "4 3", "同质": "2 2", "支撑": "6 2",
        };
        return (
          <line
            key={e.id}
            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray={dashMap[e.relation]}
            markerEnd="url(#l3-arrow)"
            opacity={0.65}
          />
        );
      })}
      {/* 节点 */}
      {nodes.map((node) => {
        const pos = posById[node.id];
        if (!pos) return null;
        const color = L3_KIND_COLOR[node.kind];
        const R = 11;
        return (
          <g
            key={node.id}
            transform={`translate(${pos.x},${pos.y})`}
          >
            {node.kind === "knowledge_point" && (
              <circle r={R} fill={color} fillOpacity={0.85} />
            )}
            {node.kind === "skill_point" && (
              <rect x={-R} y={-R} width={R * 2} height={R * 2} rx={2} fill={color} fillOpacity={0.85} />
            )}
            {node.kind === "literacy_point" && (
              <path d={`M0,${-R} L${R},${R} L${-R},${R} Z`} fill={color} fillOpacity={0.85} />
            )}
            <text
              y={R + 11}
              textAnchor="middle"
              fontSize={9}
              fill="#334155"
              className="pointer-events-none"
            >
              {node.name.length > 7 ? node.name.slice(0, 7) + "…" : node.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ============================================================
// L2 课程计划卡片列表
// ============================================================
const l2StatusLabel: Record<L2StandardCoursePlan["status"], string> = {
  draft: "草稿",
  released: "已发布",
};

function L2Cards({ plans }: { plans: L2StandardCoursePlan[] }) {
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  return (
    <div className="px-4 py-3">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {plans.map((plan) => {
          const isExpanded = expandedPlanId === plan.id;
          return (
            <div
              key={plan.id}
              className="shrink-0 w-64 rounded-xl border border-slate-200 bg-white transition hover:border-violet-300 hover:shadow-sm"
            >
              <div className="p-4">
                <div className="flex items-start gap-2">
                  <ClipboardList size={16} className="text-violet-500 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-900 leading-tight line-clamp-2">
                      {plan.title}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <span className={`text-[0.625rem] px-1.5 py-0.5 rounded font-medium ${
                        plan.status === "released"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {l2StatusLabel[plan.status]}
                      </span>
                      {plan.generatedBy === "ai_synthesis" && (
                        <span className="text-[0.625rem] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 font-medium flex items-center gap-0.5">
                          <Sparkles size={8} />AI 合成
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-2.5 flex gap-3 text-[0.6875rem] text-slate-500">
                  <span>{plan.totalHours} 学时</span>
                  <span>{plan.chapters.length} 章</span>
                </div>
              </div>
              {/* 章节展开 */}
              <div className="border-t border-slate-100">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-2 text-[0.6875rem] text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                >
                  <span>章节大纲</span>
                  {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-3 space-y-1 max-h-48 overflow-y-auto">
                    {plan.chapters.map((ch) => (
                      <div key={ch.id}>
                        <div className="text-[0.6875rem] font-medium text-slate-700">{ch.title}</div>
                        {ch.sections.map((sec) => (
                          <div key={sec.id} className="text-[0.625rem] text-slate-500 pl-2 py-0.5 border-l border-slate-100">
                            {sec.title}
                            <span className="ml-1 text-slate-400">{sec.durationMinutes}min</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {plans.length === 0 && (
          <div className="text-slate-400 text-sm py-4">该专业暂无标准课程计划</div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 创建专业培养图谱 · 引导式向导（体验流程，非说明文案）
// ============================================================
const MATERIAL_KIND_CN: Record<string, string> = {
  industry_demand: "产业需求",
  talent_scheme: "培养方案",
  core_material: "核心材料",
  job_jd: "岗位 JD",
  lab_ue_coop_project: "实验室校企合作项目",
  textbook: "教材",
  case_archive: "案例",
  industry_case: "产业案例",
  industry_outlook: "形势简报",
  legacy_course_plan_meta: "旧课程元数据",
};

function ProfessionalGraphWizard({
  professionName,
  suggestMaterials,
  previewNodes,
  previewEdges,
  onComplete,
}: {
  professionName: string;
  suggestMaterials: KGSourceMaterial[];
  previewNodes: L1Node[];
  previewEdges: L1Edge[];
  onComplete: () => void;
}) {
  type SchemaPhase = "edit" | "stream" | "review";

  const [step, setStep] = useState<1 | 2>(1);
  const [schemaPhase, setSchemaPhase] = useState<SchemaPhase>("edit");
  const [streamRevealCount, setStreamRevealCount] = useState(0);

  const [pickedIds, setPickedIds] = useState<string[]>(() =>
    suggestMaterials.length ? suggestMaterials.map((m) => m.id) : [],
  );
  const [jobFocus, setJobFocus] = useState(
    "装备制造业工艺设计、现场技术支持及相关数字化协作岗位",
  );
  const [talentLine, setTalentLine] = useState(
    "具备工程图样表达与数字化协同能力的应用型本科人才",
  );
  const [skillLine, setSkillLine] = useState(
    "掌握机械制图与 CAD、公差与测量、工艺规程编制与质量意识等核心技能与素养",
  );

  const togglePick = (id: string) => {
    setPickedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const schemaPreview = useMemo(
    () => `${jobFocus.trim()}需要${talentLine.trim()}，${skillLine.trim()}。`,
    [jobFocus, talentLine, skillLine],
  );

  useEffect(() => {
    if (step !== 2) {
      setSchemaPhase("edit");
      setStreamRevealCount(0);
    }
  }, [step]);

  useEffect(() => {
    if (schemaPhase !== "stream") return;
    let cancelled = false;
    const isCancelled = () => cancelled;

    const run = async () => {
      setStreamRevealCount(0);

      const nodeDelay =
        previewNodes.length > 0
          ? Math.min(200, Math.max(90, Math.floor(2200 / previewNodes.length)))
          : 0;

      for (let i = 0; i < previewNodes.length; i++) {
        setStreamRevealCount(i + 1);
        await wizardDelay(nodeDelay, isCancelled);
        if (cancelled) return;
      }

      await wizardDelay(160, isCancelled);
      if (cancelled) return;
      setSchemaPhase("review");
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [schemaPhase, previewNodes]);

  const headerDraftCounts = useMemo(() => {
    if (schemaPhase === "review") {
      return {
        nodes: previewNodes.length,
        edges: previewEdges.length,
      };
    }
    if (schemaPhase === "stream") {
      return {
        nodes: streamRevealCount,
        edges: previewEdges.length,
      };
    }
    return { nodes: 0, edges: 0 };
  }, [
    schemaPhase,
    previewNodes.length,
    previewEdges.length,
    streamRevealCount,
  ]);

  const phaseHint =
    step === 1 ? "资料就绪后，后续生成将以此为依据" : "";

  const taClass =
    "mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-300";

  const navSecondaryCls =
    "rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50";
  const navPrimaryCls =
    "rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40";

  const goMaterialsNext = () => {
    setSchemaPhase("edit");
    setStreamRevealCount(0);
    setStep(2);
  };

  const resetStreamAndGoEdit = () => {
    setSchemaPhase("edit");
    setStreamRevealCount(0);
  };

  let wizardNav: ReactNode = null;
  if (step === 1) {
    wizardNav = (
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        {suggestMaterials.length > 0 ? (
          <button
            type="button"
            className={navSecondaryCls}
            onClick={() => setPickedIds(suggestMaterials.map((m) => m.id))}
          >
            全选
          </button>
        ) : null}
        <button
          type="button"
          disabled={suggestMaterials.length > 0 && pickedIds.length === 0}
          className={navPrimaryCls}
          onClick={goMaterialsNext}
        >
          下一步
        </button>
      </div>
    );
  } else if (step === 2 && schemaPhase === "edit") {
    wizardNav = (
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <button type="button" className={navSecondaryCls} onClick={() => setStep(1)}>
          <span className="inline-flex items-center gap-1">
            <ArrowLeft size={14} /> 上一步
          </span>
        </button>
        <button
          type="button"
          className={navPrimaryCls}
          onClick={() => setSchemaPhase("stream")}
        >
          下一步
        </button>
      </div>
    );
  } else if (step === 2 && schemaPhase === "review") {
    wizardNav = (
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <button type="button" className={navSecondaryCls} onClick={resetStreamAndGoEdit}>
          <span className="inline-flex items-center gap-1">
            <ArrowLeft size={14} /> 上一步
          </span>
        </button>
        <button
          type="button"
          className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          onClick={onComplete}
        >
          确认
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-slate-100 bg-slate-50/90 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-800">创建专业培养图谱</div>
            <div className="mt-0.5 text-sm text-slate-600">{professionName}</div>
          </div>
          {wizardNav}
        </div>
        {step === 2 && schemaPhase !== "edit" && (
          <div className="mt-2 rounded-md border border-slate-200 bg-white px-2.5 py-2 shadow-sm">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <Network size={14} className="shrink-0 text-indigo-600" />
              <span className="font-semibold text-slate-900">约定图谱描述</span>
              <span className="rounded bg-slate-100 px-1.5 py-0 text-[0.6875rem] font-medium text-slate-600">
                示例
              </span>
              {schemaPhase === "stream" && (
                <span className="text-xs font-medium text-indigo-600">生成中…</span>
              )}
              <span className="ml-auto shrink-0 tabular-nums text-slate-600">
                {headerDraftCounts.nodes} 节点 · {headerDraftCounts.edges} 关系
              </span>
            </div>
            <p className="mt-1.5 max-h-[3rem] overflow-y-auto text-[0.6875rem] leading-snug text-slate-700 [-webkit-overflow-scrolling:touch]">
              {schemaPreview}
            </p>
          </div>
        )}
        {phaseHint && (
          <p className="mt-2 text-sm text-slate-600">{phaseHint}</p>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden py-3 sm:py-4">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
        {step === 1 && (
          <div className="mx-auto flex min-h-0 w-full max-w-[880px] flex-1 flex-col px-4 sm:px-6">
            <h3 className="text-base font-semibold text-slate-900">上传资料</h3>
            <p className="mt-1 text-sm text-slate-600">
              从资料库勾选或拖拽上传产业案例文档：企业现场问题、产线情境、工程变更与质量处置等真实材料。
            </p>
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
              <Upload className="mx-auto size-8 text-slate-400" strokeWidth={1.5} />
              <p className="mt-2 text-sm text-slate-600">将文件拖拽到此处，或点击下方从资料库勾选</p>
            </div>
            <div className="mt-4 space-y-2">
              {suggestMaterials.length === 0 ? (
                <p className="text-sm text-slate-500">暂无可用资料，可先进入下一步继续。</p>
              ) : (
                suggestMaterials.map((m) => (
                  <label
                    key={m.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 hover:border-indigo-200"
                  >
                    <input
                      type="checkbox"
                      checked={pickedIds.includes(m.id)}
                      onChange={() => togglePick(m.id)}
                      className="mt-0.5 rounded border-slate-300"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-slate-800">{m.fileName}</span>
                      <span className="text-[0.6875rem] text-slate-500">
                        {MATERIAL_KIND_CN[m.kind] ?? m.kind}
                      </span>
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col gap-4">
            {schemaPhase === "edit" && (
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-2 sm:px-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">约定图谱描述</h3>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <label className="text-xs font-semibold text-slate-900">岗位面向</label>
                    <textarea
                      value={jobFocus}
                      onChange={(e) => setJobFocus(e.target.value)}
                      rows={2}
                      className={taClass}
                    />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <label className="text-xs font-semibold text-slate-900">人才规格（培养产出）</label>
                    <textarea
                      value={talentLine}
                      onChange={(e) => setTalentLine(e.target.value)}
                      rows={2}
                      className={taClass}
                    />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <label className="text-xs font-semibold text-slate-900">核心技能与素养要点</label>
                    <textarea
                      value={skillLine}
                      onChange={(e) => setSkillLine(e.target.value)}
                      rows={3}
                      className={taClass}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-indigo-100 bg-white px-4 py-3 shadow-sm">
                  <div className="text-xs font-semibold text-indigo-900">预览</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-800 sm:text-[0.9375rem]">{schemaPreview}</p>
                </div>
              </div>
            )}

            {(schemaPhase === "stream" || schemaPhase === "review") && (
              <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden border-t border-slate-100 bg-white">
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
                  {previewNodes.length === 0 ? (
                    schemaPhase === "review" ? (
                      <p className="py-6 text-center text-sm text-slate-600">
                        本专业暂无草案数据。确认后将进入图谱页。
                      </p>
                    ) : null
                  ) : (
                    <ul className="flex w-full min-w-0 flex-col gap-2">
                      {(schemaPhase === "stream"
                        ? previewNodes.slice(0, streamRevealCount)
                        : previewNodes
                      ).map((n) => (
                        <li
                          key={n.id}
                          className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50/90 px-3 py-2.5 sm:px-4 sm:py-3"
                        >
                          <input
                            type="checkbox"
                            defaultChecked
                            disabled
                            className="mt-0.5 size-3.5 shrink-0 rounded border-slate-300 opacity-80"
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                              <span className="text-sm font-semibold leading-snug text-slate-900">
                                {n.name}
                              </span>
                              <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-violet-900">
                                {L1_TYPE_LABEL[n.schemaTypeCode]}
                              </span>
                            </div>
                            {n.description ? (
                              <p className="text-xs leading-relaxed text-slate-700">
                                {n.description}
                              </p>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
// ============================================================
// GraphBrowse 主组件
// ============================================================
export function GraphBrowse({
  onOpenResource,
  onOpenCourse,
  onOpenTraining,
  focusNodeId,
  role = "teacher",
  currentTeacherId,
}: {
  onOpenResource: (id: string) => void;
  onOpenCourse?: (id: string) => void;
  onOpenTraining?: (id: string) => void;
  focusNodeId?: string | null;
  role?: Role;
  currentTeacherId?: string;
}) {
  void onOpenResource;
  void onOpenCourse;
  void onOpenTraining;
  void currentTeacherId;

  const [profId, setProfId] = useState("prof-mech");
  const [layerExpanded, setLayerExpanded] = useState({ L1: true, L2: true, L3: true });
  const [spineOnly, setSpineOnly] = useState(false);
  const [l1WizardActive, setL1WizardActive] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasW, setCanvasW] = useState(620);

  // 按专业过滤数据
  const curL1Nodes = useMemo(
    () => (l1NodesByProfession[profId] ?? []),
    [profId],
  );
  const curL1Edges = useMemo(
    () => l1Edges.filter((e) => e.professionId === profId),
    [profId],
  );
  const curL2Plans = useMemo(
    () => l2StandardCoursePlans.filter((p) => p.professionId === profId),
    [profId],
  );
  const curL3Nodes = useMemo(
    () => l3Nodes.filter((n) => n.professionId === profId),
    [profId],
  );
  const curL3Edges = useMemo(
    () => l3Edges.filter((e) => e.professionId === profId),
    [profId],
  );
  const l1MaterialsForWorkflow = useMemo(
    () =>
      kgSourceMaterials.filter(
        (m) =>
          m.professionId === profId &&
          m.primaryLayer === "L1" &&
          m.kind === "industry_case",
      ),
    [profId],
  );

  const prof = professions.find((p) => p.id === profId);
  const hasL1Data = curL1Nodes.length > 0;

  useEffect(() => {
    const nodes = l1NodesByProfession[profId] ?? [];
    setL1WizardActive(nodes.length === 0);
  }, [profId]);
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const w = e.contentRect.width;
        if (w > 20) setCanvasW(Math.round(w));
      }
    });
    ro.observe(el);
    setCanvasW(el.clientWidth || 620);
    return () => ro.disconnect();
  }, []);

  // 支持从外页 deep link 定位（进入浏览态）
  useEffect(() => {
    if (!focusNodeId) return;
    setL1WizardActive(false);
    const l1n = l1NodeById[focusNodeId];
    if (l1n) {
      setProfId(l1n.professionId);
      setLayerExpanded((p) => ({ ...p, L1: true }));
      return;
    }
    const l2p = l2PlanById[focusNodeId];
    if (l2p) {
      setProfId(l2p.professionId);
      setLayerExpanded((p) => ({ ...p, L2: true }));
      return;
    }
    const l3n = l3NodeById[focusNodeId];
    if (l3n) {
      setProfId(l3n.professionId);
      setLayerExpanded((p) => ({ ...p, L3: true }));
      return;
    }
    const legacy = graphNodeById(focusNodeId);
    if (legacy) setProfId(legacy.professionId);
  }, [focusNodeId]);

  const toggleLayer = useCallback((layer: "L1" | "L2" | "L3") => {
    setLayerExpanded((p) => ({ ...p, [layer]: !p[layer] }));
  }, []);

  const L1_H = 320;
  const L3_H = 300;

  return (
    <div>
      <PageHeader
        title="知识图谱"
        actions={
          <>
            <select
              value={profId}
              onChange={(e) => {
                setProfId(e.target.value);
              }}
              className="bg-white border border-slate-200 rounded-md px-2 py-1 text-sm"
            >
              {professions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}{l1NodesByProfession[p.id]?.length === 0 ? "（待建第一层）" : ""}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSpineOnly((s) => !s)}
              disabled={l1WizardActive || !hasL1Data}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
                spineOnly
                  ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Layers size={14} />
              {spineOnly ? "主线视图" : "完整视图"}
            </button>
            {hasL1Data && !l1WizardActive && (
              <button
                type="button"
                onClick={() => setL1WizardActive(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-indigo-200 bg-indigo-50 text-sm text-indigo-900 hover:bg-indigo-100"
              >
                <Sparkles size={14} />
                创建专业培养图谱
              </button>
            )}
            {role === "college_admin" && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
              >
                <Pencil size={14} />
                编辑图谱
              </button>
            )}
          </>
        }
      />

      {!prof ? (
        <div className="p-16 text-center text-slate-500">无效专业</div>
      ) : l1WizardActive ? (
        <div className="px-0 py-4 sm:py-6">
          <div
            className="flex h-[min(920px,calc(100dvh-10rem))] min-h-[min(560px,calc(100dvh-12rem))] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            ref={canvasRef}
          >
            <ProfessionalGraphWizard
              key={profId}
              professionName={prof.name}
              suggestMaterials={l1MaterialsForWorkflow}
              previewNodes={curL1Nodes}
              previewEdges={curL1Edges}
              onComplete={() => setL1WizardActive(false)}
            />
          </div>
          {!hasL1Data && (
            <p className="mt-3 text-center text-xs text-slate-400">
              可随时通过顶部「创建专业培养图谱」再次进入。
            </p>
          )}
        </div>
      ) : (
        <div className="p-6">
          <div
            className="flex flex-col gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white"
            ref={canvasRef}
          >
            <LayerBar
              layer="L1"
              label="产业培养图谱"
              icon={<Network size={15} />}
              expanded={layerExpanded.L1}
              nodeCount={curL1Nodes.length}
              onToggle={() => toggleLayer("L1")}
              extra={
                <span className="text-[0.6rem] font-normal text-indigo-400">
                  产业需求 · 岗位能力 · 核心素养 · 能力 · 培养目标 · 课程标准
                </span>
              }
            />
            {layerExpanded.L1 &&
              (hasL1Data ? (
                <div style={{ height: L1_H }}>
                  <L1Canvas
                    nodes={curL1Nodes}
                    edges={curL1Edges}
                    spineOnly={spineOnly}
                    width={canvasW}
                    height={L1_H}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 border-b border-slate-100 px-6 py-16">
                  <p className="max-w-md text-center text-sm text-slate-600">
                    尚未创建第一层产业培养图谱。点击「创建专业培养图谱」，系统将协助您完成资料与约定图谱描述、草案核对。
                  </p>
                  <button
                    type="button"
                    onClick={() => setL1WizardActive(true)}
                    className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    创建专业培养图谱
                  </button>
                </div>
              ))}

            <LayerBar
              layer="L2"
              label="标准课程计划"
              icon={<ClipboardList size={15} />}
              expanded={layerExpanded.L2}
              nodeCount={curL2Plans.length}
              onToggle={() => toggleLayer("L2")}
            />
            {layerExpanded.L2 && <L2Cards plans={curL2Plans} />}

            <LayerBar
              layer="L3"
              label="教学单元图谱"
              icon={<Brain size={15} />}
              expanded={layerExpanded.L3}
              nodeCount={curL3Nodes.length}
              onToggle={() => toggleLayer("L3")}
              extra={
                <span className="text-[0.6rem] font-normal text-teal-500">
                  ● 知识点 &nbsp;■ 技能点 &nbsp;▲ 素养点
                </span>
              }
            />
            {layerExpanded.L3 && (
              <div style={{ height: L3_H }}>
                <L3Canvas
                  nodes={curL3Nodes}
                  edges={curL3Edges}
                  width={canvasW}
                  height={L3_H}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// ResourceDetail（独立导出，供 App.tsx 复用，不依赖三层数据）
// ============================================================
export function ResourceDetail({
  id,
  sessionResources = [],
  currentTeacherId,
  onBack,
  onOpenKnowledgeInGraph,
}: {
  id: string;
  /** 与资源库页「新增」会话合并，用于展示刚创建的线上课程等 */
  sessionResources?: Resource[];
  currentTeacherId: string;
  onBack: () => void;
  onOpenKnowledgeInGraph: (nodeId: string) => void;
}) {
  const r = sessionResources.find((x) => x.id === id) ?? resourceById(id);
  if (!r) {
    return (
      <div>
        <PageHeader back={onBack} title="资源详情" />
        <div className="p-16 text-center text-slate-500">未找到资源 {id}</div>
      </div>
    );
  }

  if (
    !teacherSeesAllScopedContent(currentTeacherId) &&
    r.uploaderTeacherId !== currentTeacherId
  ) {
    return (
      <div>
        <PageHeader back={onBack} title="资源详情" />
        <div className="p-16 text-center text-slate-500">
          当前账号仅可查看本人上传的资源。
        </div>
      </div>
    );
  }

  const uploader = teacherById(r.uploaderTeacherId);
  const courses = r.courseIds.map(courseById).filter(Boolean);
  const trainings = (r.trainingIds ?? []).map(trainingById).filter(Boolean);
  const resourceNodeIds = [...r.courseIds, ...(r.trainingIds ?? [])];

  const resourceTypeLabel =
    r.type === "online_course"
      ? "线上课程"
      : `${r.type.toUpperCase()} 资源`;

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
            {r.type === "online_course" && r.moocLink ? (
              <a
                href={r.moocLink.courseUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-md border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
              >
                前往慕课平台学习
              </a>
            ) : (
              <button className="px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50">
                下载
              </button>
            )}
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
            <div className="text-slate-600">{resourceTypeLabel}预览</div>
            <div className="text-slate-400 mt-1 max-w-md">
              {r.description || "暂无描述。可在下方操作下载或插入到教学设计。"}
            </div>
            {r.moocLink && (
              <div className="mt-5 space-y-2 text-sm">
                <div className="text-slate-600">
                  源站课程：<span className="text-slate-800">{r.moocLink.externalTitle}</span>
                </div>
                <a
                  href={r.moocLink.courseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-indigo-600 hover:underline"
                >
                  {r.moocLink.platformName} · 打开链接
                </a>
              </div>
            )}
          </div>
        </div>
        <aside className="col-span-4 bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-slate-500 mb-3">信息面板</div>
          <dl className="space-y-2.5">
            <Info2 k="类型" v={r.type === "online_course" ? "线上课程" : r.type.toUpperCase()} />
            {r.moocLink && (
              <>
                <Info2 k="慕课平台" v={r.moocLink.platformName} />
                <Info2 k="源站课程" v={r.moocLink.externalTitle} />
              </>
            )}
            {r.sizeMb != null && r.sizeMb > 0 && <Info2 k="大小" v={`${r.sizeMb} MB`} />}
            {r.duration && <Info2 k="时长" v={r.duration} />}
            <Info2 k="上传人" v={uploader?.name ?? r.uploaderTeacherId} />
            <Info2 k="上传时间" v={r.uploadedAt.slice(0, 10)} />
            <Info2
              k="所属课程"
              v={courses.length > 0 ? courses.map((c) => `《${c!.name}》`).join("、") : "—"}
            />
            <Info2
              k="所属实训"
              v={trainings.length > 0 ? trainings.map((t) => t!.name).join("、") : "—"}
            />
          </dl>
          <div className="mt-4 border-t border-slate-100 pt-4 max-h-[min(40vh,22rem)] overflow-y-auto pr-0.5">
            <AssociatedKnowledgeNodes
              knowledgeNodeIds={resourceNodeIds}
              onNodeClick={onOpenKnowledgeInGraph}
              emptyMessage="资源关联的课程/实训节点在专业图谱中未找到，或该专业尚未建图谱。"
            />
          </div>
          {r.tags.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="text-slate-500 mb-2">标签</div>
              <div className="flex flex-wrap gap-1.5">
                {r.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
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

function ResourceTypeIcon({ type }: { type: ResourceType }) {
  const common = "shrink-0";
  switch (type) {
    case "video":   return <Film size={14} className={`${common} text-rose-500`} />;
    case "audio":   return <Music size={14} className={`${common} text-rose-400`} />;
    case "image":   return <ImageIcon size={14} className={`${common} text-sky-500`} />;
    case "code":    return <Code2 size={14} className={`${common} text-violet-500`} />;
    case "dataset": return <Database size={14} className={`${common} text-emerald-500`} />;
    case "quiz":    return <ListChecks size={14} className={`${common} text-amber-500`} />;
    case "ppt":     return <FileText size={14} className={`${common} text-orange-500`} />;
    case "online_course": return <GraduationCap size={14} className={`${common} text-indigo-600`} />;
    default:        return <FileText size={14} className={`${common} text-indigo-500`} />;
  }
}
