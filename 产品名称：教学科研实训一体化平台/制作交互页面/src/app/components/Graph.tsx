import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Film, FileText, Image as ImageIcon,
  Music, Code2, Database, ListChecks, Sparkles, Pencil,
  Network,
  Upload, ArrowLeft, GraduationCap,
} from "lucide-react";
import {
  professions,
  l1Edges, l1NodesByProfession,
  kgSourceMaterials,
  nodesByProfession,
  edgesByProfession,
} from "@mock";
import type {
  L1Node, L1Edge,
  L1NodeTypeCode, KGSourceMaterial,
  GraphEdge, GraphNode,
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
import {
  KnowledgeGraphCanvas,
} from "./knowledgeGraph/KnowledgeGraphCanvas";
import { GraphNodeShapeBrowse } from "./knowledgeGraph/GraphNodeShapes";
import { truncateGraphLabel } from "./knowledgeGraph/labels";
import { colorOfGraphNodeLayer } from "../data/graphLayout";

function wizardDelay(ms: number, cancelled?: () => boolean) {
  return new Promise<void>((resolve) => {
    window.setTimeout(() => {
      if (!cancelled?.()) resolve();
    }, ms);
  });
}

// ============================================================
// 颜色常量（向导草案列表标签）
// ============================================================

const L1_TYPE_LABEL: Record<L1NodeTypeCode, string> = {
  industry_demand:  "产业需求",
  job_competency:   "岗位能力",
  core_literacy:    "核心素养",
  ability:          "能力",
  training_goal:    "培养目标",
  course_standard:  "课程标准",
};

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

function sortGraphNodesByName(nodes: GraphNode[]): GraphNode[] {
  return [...nodes].sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"));
}

function KnowledgeGraphNodeDetail({
  node,
  professionEdges,
  professionNodes,
  onPickNode,
  onOpenCourse,
  onOpenTraining,
}: {
  node: GraphNode | null;
  professionEdges: GraphEdge[];
  professionNodes: GraphNode[];
  onPickNode: (id: string) => void;
  onOpenCourse?: (courseId: string) => void;
  onOpenTraining?: (trainingId: string) => void;
}) {
  const nodeMap = useMemo(
    () => new Map(professionNodes.map((n) => [n.id, n] as const)),
    [professionNodes],
  );

  const parsed = useMemo(() => {
    if (!node) return null;

    const edges = professionEdges;
    const containParents = (nid: string) =>
      edges.filter((e) => e.relation === "contain" && e.to === nid).map((e) => e.from);
    const containChildren = (nid: string) =>
      edges.filter((e) => e.relation === "contain" && e.from === nid).map((e) => e.to);

    if (node.layer === "knowledge") {
      const abilityIds = containParents(node.id).filter(
        (id) => nodeMap.get(id)?.layer === "ability",
      );
      const coreIds = new Set<string>();
      for (const aid of abilityIds) {
        for (const cid of containParents(aid)) {
          if (nodeMap.get(cid)?.layer === "core") coreIds.add(cid);
        }
      }
      const ctFromIds = edges
        .filter((e) => e.relation === "Map to" && e.to === node.id)
        .map((e) => e.from);
      const courses = sortGraphNodesByName(
        ctFromIds
          .map((id) => nodeMap.get(id))
          .filter((n): n is GraphNode => !!n && n.kind === "course"),
      );
      const trainings = sortGraphNodesByName(
        ctFromIds
          .map((id) => nodeMap.get(id))
          .filter((n): n is GraphNode => !!n && n.kind === "training"),
      );
      return {
        kind: "knowledge" as const,
        abilities: abilityIds
          .map((id) => nodeMap.get(id))
          .filter((n): n is GraphNode => !!n),
        cores: sortGraphNodesByName(
          [...coreIds].map((id) => nodeMap.get(id)).filter((n): n is GraphNode => !!n),
        ),
        courses,
        trainings,
      };
    }

    if (node.layer === "ability") {
      const cores = containParents(node.id)
        .filter((id) => nodeMap.get(id)?.layer === "core")
        .map((id) => nodeMap.get(id))
        .filter((n): n is GraphNode => !!n);
      const knowledge = sortGraphNodesByName(
        containChildren(node.id)
          .filter((id) => nodeMap.get(id)?.layer === "knowledge")
          .map((id) => nodeMap.get(id))
          .filter((n): n is GraphNode => !!n),
      );
      const ctSet = new Set<string>();
      for (const kn of knowledge) {
        for (const e of edges) {
          if (e.relation === "Map to" && e.to === kn.id) ctSet.add(e.from);
        }
      }
      const relatedCt = sortGraphNodesByName(
        [...ctSet].map((id) => nodeMap.get(id)).filter((n): n is GraphNode => !!n),
      );
      return {
        kind: "ability" as const,
        cores: sortGraphNodesByName(cores),
        knowledge,
        relatedCt,
      };
    }

    if (node.layer === "core") {
      const abilities = sortGraphNodesByName(
        containChildren(node.id)
          .filter((id) => nodeMap.get(id)?.layer === "ability")
          .map((id) => nodeMap.get(id))
          .filter((n): n is GraphNode => !!n),
      );
      return { kind: "core" as const, abilities };
    }

    return { kind: "other" as const };
  }, [node, professionEdges, nodeMap]);

  const chipNavCls =
    "inline-flex max-w-full cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-left text-xs text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/50";

  if (!node) {
    return (
      <div className="p-4 text-sm leading-relaxed text-slate-500">
        点击左侧图谱中的节点，查看核心素养、能力、知识点，以及知识点绑定的课程与实训。
      </div>
    );
  }

  if (!parsed || parsed.kind === "other") {
    return (
      <div className="p-4 text-sm text-slate-500">
        该节点不在当前主图范围内。
      </div>
    );
  }

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: ReactNode;
  }) => (
    <div className="space-y-2">
      <div className="text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </div>
      {children}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <div className="text-xs font-medium text-slate-500">{node.nodeType}</div>
        <h3 className="mt-1 text-sm font-semibold leading-snug text-slate-900">
          {node.name}
        </h3>
        {node.description ? (
          <p className="mt-2 text-xs leading-relaxed text-slate-600">{node.description}</p>
        ) : null}
      </div>

      {parsed.kind === "knowledge" && (
        <>
          <Section title="所属能力">
            <div className="flex flex-wrap gap-1.5">
              {parsed.abilities.map((n) => (
                <button key={n.id} type="button" className={chipNavCls} onClick={() => onPickNode(n.id)}>
                  <span className="truncate">{n.name}</span>
                </button>
              ))}
              {parsed.abilities.length === 0 && (
                <span className="text-xs text-slate-400">暂无</span>
              )}
            </div>
          </Section>
          <Section title="所属素养">
            <div className="flex flex-wrap gap-1.5">
              {parsed.cores.map((n) => (
                <button key={n.id} type="button" className={chipNavCls} onClick={() => onPickNode(n.id)}>
                  <span className="truncate">{n.name}</span>
                </button>
              ))}
              {parsed.cores.length === 0 && (
                <span className="text-xs text-slate-400">暂无</span>
              )}
            </div>
          </Section>
          <Section title="绑定课程">
            <div className="flex flex-wrap gap-1.5">
              {parsed.courses.map((n) => {
                const cid = n.refCourseId ?? n.id;
                const btn = (
                  <span className="truncate">{n.name}</span>
                );
                if (onOpenCourse) {
                  return (
                    <button
                      key={n.id}
                      type="button"
                      className={chipNavCls}
                      onClick={() => onOpenCourse(cid)}
                    >
                      {btn}
                    </button>
                  );
                }
                return (
                  <span key={n.id} className={`${chipNavCls} cursor-default hover:border-slate-200 hover:bg-slate-50`}>
                    {btn}
                  </span>
                );
              })}
              {parsed.courses.length === 0 && (
                <span className="text-xs text-slate-400">暂无</span>
              )}
            </div>
          </Section>
          <Section title="绑定实训">
            <div className="flex flex-wrap gap-1.5">
              {parsed.trainings.map((n) => {
                const tid = n.refTrainingId ?? n.id;
                const btn = <span className="truncate">{n.name}</span>;
                if (onOpenTraining) {
                  return (
                    <button
                      key={n.id}
                      type="button"
                      className={chipNavCls}
                      onClick={() => onOpenTraining(tid)}
                    >
                      {btn}
                    </button>
                  );
                }
                return (
                  <span key={n.id} className={`${chipNavCls} cursor-default hover:border-slate-200 hover:bg-slate-50`}>
                    {btn}
                  </span>
                );
              })}
              {parsed.trainings.length === 0 && (
                <span className="text-xs text-slate-400">暂无</span>
              )}
            </div>
          </Section>
        </>
      )}

      {parsed.kind === "ability" && (
        <>
          <Section title="所属素养">
            <div className="flex flex-wrap gap-1.5">
              {parsed.cores.map((n) => (
                <button key={n.id} type="button" className={chipNavCls} onClick={() => onPickNode(n.id)}>
                  <span className="truncate">{n.name}</span>
                </button>
              ))}
              {parsed.cores.length === 0 && (
                <span className="text-xs text-slate-400">暂无</span>
              )}
            </div>
          </Section>
          <Section title="包含知识点">
            <div className="flex flex-wrap gap-1.5">
              {parsed.knowledge.map((n) => (
                <button key={n.id} type="button" className={chipNavCls} onClick={() => onPickNode(n.id)}>
                  <span className="truncate">{n.name}</span>
                </button>
              ))}
              {parsed.knowledge.length === 0 && (
                <span className="text-xs text-slate-400">暂无</span>
              )}
            </div>
          </Section>
          <Section title="相关课程 / 实训（经知识点映射）">
            <div className="flex flex-wrap gap-1.5">
              {parsed.relatedCt.map((n) => {
                const inner = <span className="truncate">{n.name}</span>;
                if (n.kind === "course" && onOpenCourse) {
                  return (
                    <button
                      key={n.id}
                      type="button"
                      className={chipNavCls}
                      onClick={() => onOpenCourse(n.refCourseId ?? n.id)}
                    >
                      {inner}
                    </button>
                  );
                }
                if (n.kind === "training" && onOpenTraining) {
                  return (
                    <button
                      key={n.id}
                      type="button"
                      className={chipNavCls}
                      onClick={() => onOpenTraining(n.refTrainingId ?? n.id)}
                    >
                      {inner}
                    </button>
                  );
                }
                return (
                  <span key={n.id} className={`${chipNavCls} cursor-default hover:border-slate-200 hover:bg-slate-50`}>
                    {inner}
                  </span>
                );
              })}
              {parsed.relatedCt.length === 0 && (
                <span className="text-xs text-slate-400">暂无</span>
              )}
            </div>
          </Section>
        </>
      )}

      {parsed.kind === "core" && (
        <Section title="下属能力">
          <div className="flex flex-wrap gap-1.5">
            {parsed.abilities.map((n) => (
              <button key={n.id} type="button" className={chipNavCls} onClick={() => onPickNode(n.id)}>
                <span className="truncate">{n.name}</span>
              </button>
            ))}
            {parsed.abilities.length === 0 && (
              <span className="text-xs text-slate-400">暂无</span>
            )}
          </div>
        </Section>
      )}
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
  void currentTeacherId;

  const [profId, setProfId] = useState("prof-mech");
  const [l1WizardActive, setL1WizardActive] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const wizardShellRef = useRef<HTMLDivElement>(null);
  const canvasPaneRef = useRef<HTMLDivElement>(null);
  const [canvasBox, setCanvasBox] = useState({ w: 720, h: 520 });

  const curL1Nodes = useMemo(
    () => (l1NodesByProfession[profId] ?? []),
    [profId],
  );
  const curL1Edges = useMemo(
    () => l1Edges.filter((e) => e.professionId === profId),
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

  const professionNodes = useMemo(
    () => nodesByProfession[profId] ?? [],
    [profId],
  );
  const professionEdges = useMemo(
    () => edgesByProfession[profId] ?? [],
    [profId],
  );

  const canvasNodes = useMemo(
    () =>
      professionNodes.filter(
        (n) =>
          n.layer === "core" ||
          n.layer === "ability" ||
          n.layer === "knowledge",
      ),
    [professionNodes],
  );

  const canvasIdSet = useMemo(
    () => new Set(canvasNodes.map((n) => n.id)),
    [canvasNodes],
  );

  const canvasEdges = useMemo(
    () =>
      professionEdges.filter(
        (e) =>
          canvasIdSet.has(e.from) &&
          canvasIdSet.has(e.to) &&
          (e.relation === "contain" || e.relation === "Influence"),
      ),
    [professionEdges, canvasIdSet],
  );

  const prof = professions.find((p) => p.id === profId);
  const hasL1Data = curL1Nodes.length > 0;
  const hasMainGraph = professionNodes.length > 0;

  useEffect(() => {
    setL1WizardActive(!hasMainGraph);
  }, [profId, hasMainGraph]);

  useEffect(() => {
    setSelectedNodeId(null);
  }, [profId]);

  useEffect(() => {
    const el = canvasPaneRef.current;
    if (!el || l1WizardActive) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        if (width > 48 && height > 48) {
          setCanvasBox({ w: Math.floor(width), h: Math.floor(height) });
        }
      }
    });
    ro.observe(el);
    const { width, height } = el.getBoundingClientRect();
    if (width > 48 && height > 48) {
      setCanvasBox({ w: Math.floor(width), h: Math.floor(height) });
    }
    return () => ro.disconnect();
  }, [l1WizardActive, profId]);

  useEffect(() => {
    if (!focusNodeId) return;
    const n = graphNodeById(focusNodeId);
    if (!n) return;
    setL1WizardActive(false);
    setProfId(n.professionId);
    setSelectedNodeId(focusNodeId);
  }, [focusNodeId]);

  const selectedNode = selectedNodeId ? graphNodeById(selectedNodeId) ?? null : null;
  const canvasFocusId =
    selectedNode &&
    (selectedNode.layer === "core" ||
      selectedNode.layer === "ability" ||
      selectedNode.layer === "knowledge")
      ? selectedNode.id
      : null;

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
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm"
            >
              {professions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {(nodesByProfession[p.id]?.length ?? 0) === 0 ? "（暂无图谱）" : ""}
                </option>
              ))}
            </select>
            {hasL1Data && !l1WizardActive && (
              <button
                type="button"
                onClick={() => setL1WizardActive(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-sm text-indigo-900 hover:bg-indigo-100"
              >
                <Sparkles size={14} />
                创建专业培养图谱
              </button>
            )}
            {role === "college_admin" && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm text-white hover:bg-indigo-700"
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
            ref={wizardShellRef}
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
          <div className="flex min-h-[min(560px,calc(100dvh-12rem))] flex-col gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white lg:flex-row">
            <div
              ref={canvasPaneRef}
              className="min-h-[min(480px,55vh)] min-w-0 flex-1 lg:min-h-[560px]"
            >
              {canvasNodes.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-16 text-center">
                  <p className="max-w-md text-sm text-slate-600">
                    本专业暂无图谱节点数据。
                  </p>
                </div>
              ) : (
                <KnowledgeGraphCanvas
                  nodes={canvasNodes}
                  edges={canvasEdges}
                  width={canvasBox.w}
                  height={canvasBox.h}
                  edgeStrokeMode="byRelation"
                  focusNodeId={canvasFocusId}
                  onNodeClick={(n) => setSelectedNodeId(n.id)}
                  renderNode={({ node: n, x, y }) => (
                    <g>
                      <GraphNodeShapeBrowse
                        type={n.nodeType}
                        x={x}
                        y={y}
                        color={colorOfGraphNodeLayer(n)}
                        selected={n.id === selectedNodeId}
                        status={n.status}
                      />
                      <text
                        x={x}
                        y={y + 22}
                        textAnchor="middle"
                        fontSize={10}
                        fill="#334155"
                        className="pointer-events-none"
                      >
                        {truncateGraphLabel(n.name, 10)}
                      </text>
                    </g>
                  )}
                />
              )}
            </div>
            <aside className="shrink-0 border-t border-slate-200 lg:w-[min(100%,320px)] lg:border-l lg:border-t-0 lg:border-slate-200">
              <div className="sticky top-0 max-h-[min(70vh,560px)] overflow-y-auto overscroll-contain border-slate-100 lg:max-h-none">
                <div className="border-b border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                    <Network size={16} className="text-indigo-600" />
                    节点详情
                  </div>
                  <p className="mt-1 text-[0.6875rem] text-slate-500">
                    中心为核心素养与能力，外层为知识点；课程与实训在详情中查看。
                  </p>
                </div>
                <KnowledgeGraphNodeDetail
                  node={selectedNode}
                  professionEdges={professionEdges}
                  professionNodes={professionNodes}
                  onPickNode={(id) => setSelectedNodeId(id)}
                  onOpenCourse={onOpenCourse}
                  onOpenTraining={onOpenTraining}
                />
              </div>
            </aside>
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
