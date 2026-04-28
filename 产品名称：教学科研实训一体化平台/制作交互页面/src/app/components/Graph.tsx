import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, BookOpen, Film, FileText, FlaskConical, Image as ImageIcon, Music, Code2, Database, ListChecks, Sparkles, Pencil, Upload, ChevronDown } from "lucide-react";
import {
  professions,
  nodesByProfession,
  edgesByProfession,
  knowledgeGraphTrainingPlanDocumentById,
  allowedGraphEdgeRelations,
} from "@mock";
import type {
  GraphEdgeRelation,
  GraphNode,
  KnowledgeGraphTrainingPlanAttachmentKind,
  ResourceType,
} from "@mock";
import {
  resourceById,
  coursesByNode,
  resourcesByNode,
  trainingsByNode,
  teacherById,
  courseById,
  trainingById,
  graphNodeById,
  teacherSeesAllScopedContent,
} from "../data/lookups";
import {
  colorOfGraphNodeLayer,
  graphVisualLayerColor,
  graphVisualLayerLabel,
  graphVisualLayerOrder,
  visualLayerOfNode,
  type GraphVisualLayer,
} from "../data/graphLayout";
import { PageHeader, AiBadge, type Role } from "./Layout";
import { AssociatedKnowledgeNodes } from "./AssociatedKnowledgeNodes";
import {
  GraphNodeShapeBrowse,
  KnowledgeGraphCanvas,
  truncateGraphLabel,
} from "./knowledgeGraph";

const SVG_H = 720;

const attachmentKindLabel: Record<
  KnowledgeGraphTrainingPlanAttachmentKind,
  string
> = {
  talent_scheme: "培养方案",
  job_analysis: "岗位分析",
  introductory: "概论导引",
  industry_outlook: "形势简报",
};

const statusLabel: Record<GraphNode["status"], string> = {
  ai_draft: "AI 草稿",
  edited: "人工编辑",
  confirmed: "已确认",
};
const edgeRelationLabel: Record<GraphEdgeRelation, string> = {
  contain: "包含",
  guide: "引导",
  Influence: "影响",
  Cultivate: "培养",
  Support: "支撑",
  "Map to": "映射",
  Depend: "依赖",
  Decide: "决定",
  "Belong to": "归属",
};
const allEdgeRelations = Object.keys(allowedGraphEdgeRelations) as GraphEdgeRelation[];

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
  /** 从外页 deep link 时：切换专业并选中该节点 */
  focusNodeId?: string | null;
  role?: Role;
  /** 教师端数据范围；学院管理 / 学生端可不传 */
  currentTeacherId?: string;
}) {
  const canManageGraph = role === "college_admin";
  const scopeTeacherId = role === "teacher" ? currentTeacherId : undefined;
  const [profId, setProfId] = useState<string>("prof-mech");
  const [selected, setSelected] = useState<string | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<Set<GraphVisualLayer>>(
    () => new Set(graphVisualLayerOrder),
  );
  const [visibleRelations, setVisibleRelations] = useState<Set<GraphEdgeRelation>>(
    () => new Set(allEdgeRelations),
  );
  const [statusFilter, setStatusFilter] = useState<"" | GraphNode["status"]>("");
  const [nodeOverrides, setNodeOverrides] = useState<
    Record<string, { name?: string; description?: string }>
  >({});
  const [genOpen, setGenOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [planDocOpenId, setPlanDocOpenId] = useState<string | null>(null);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [actionHint, setActionHint] = useState<string | null>(null);
  const graphAreaRef = useRef<HTMLDivElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const [viewBox, setViewBox] = useState({ w: 900, h: 400 });

  const prof = professions.find((p) => p.id === profId);
  const trainingPlanDocs = useMemo(() => {
    const ids = prof?.knowledgeGraphTrainingPlanDocumentIds;
    if (!ids?.length) return [];
    return ids
      .map((id) => knowledgeGraphTrainingPlanDocumentById(id))
      .filter((d): d is NonNullable<typeof d> => d != null);
  }, [prof]);
  const openPlanDoc = planDocOpenId
    ? knowledgeGraphTrainingPlanDocumentById(planDocOpenId)
    : undefined;
  const baseNodes = nodesByProfession[profId] ?? [];
  const edges = edgesByProfession[profId] ?? [];
  const nodes = useMemo(
    () => baseNodes.map((n) => ({ ...n, ...nodeOverrides[n.id] })),
    [baseNodes, nodeOverrides],
  );

  const focusIds = useMemo(() => new Set<string>(), []);

  const node = selected ? nodes.find((n) => n.id === selected) : undefined;

  const relationsInGraph = useMemo(() => {
    const set = new Set<GraphEdgeRelation>();
    for (const e of edges) set.add(e.relation);
    return allEdgeRelations.filter((relation) => set.has(relation));
  }, [edges]);

  useEffect(() => {
    if (focusNodeId == null || focusNodeId === "") return;
    const n = graphNodeById(focusNodeId);
    if (!n) return;
    setProfId(n.professionId);
    setVisibleLayers(new Set(graphVisualLayerOrder));
    setVisibleRelations(new Set(allEdgeRelations));
    setSelected(n.id);
  }, [focusNodeId]);

  useEffect(() => {
    if (!attachmentMenuOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (
        attachmentMenuRef.current &&
        !attachmentMenuRef.current.contains(e.target as Node)
      ) {
        setAttachmentMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAttachmentMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [attachmentMenuOpen]);

  useEffect(() => {
    const el = graphAreaRef.current;
    if (!el) return;
    const apply = (w: number, h: number) => {
      if (w < 2 || h < 2) return;
      setViewBox({ w: Math.round(w), h: Math.round(h) });
    };
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) apply(e.contentRect.width, e.contentRect.height);
    });
    ro.observe(el);
    apply(el.clientWidth, el.clientHeight);
    return () => ro.disconnect();
  }, []);

  const visibleNodes = useMemo(
    () =>
      nodes.filter(
        (n) =>
          visibleLayers.has(visualLayerOfNode(n)) &&
          (!statusFilter || n.status === statusFilter),
      ),
    [nodes, statusFilter, visibleLayers],
  );
  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((n) => n.id)),
    [visibleNodes],
  );
  const visibleEdges = useMemo(
    () =>
      edges.filter(
        (e) =>
          visibleNodeIds.has(e.from) &&
          visibleNodeIds.has(e.to) &&
          visibleRelations.has(e.relation),
      ),
    [edges, visibleNodeIds, visibleRelations],
  );

  const toggleLayer = useCallback((layer: GraphVisualLayer) => {
    setVisibleLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  }, []);

  const toggleRelation = useCallback((relation: GraphEdgeRelation) => {
    setVisibleRelations((prev) => {
      const next = new Set(prev);
      if (next.has(relation)) next.delete(relation);
      else next.add(relation);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    const n = nodes.find((x) => x.id === selected);
    if (n && !visibleLayers.has(visualLayerOfNode(n))) setSelected(null);
  }, [selected, visibleLayers, nodes]);

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
                setVisibleLayers(new Set(graphVisualLayerOrder));
                setVisibleRelations(new Set(allEdgeRelations));
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
            {canManageGraph && (
              <>
                <button
                  type="button"
                  onClick={() => setGenOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100"
                >
                  <Sparkles size={14} />
                  重新生成
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!selected) {
                      setActionHint("请先在图中选中要编辑的节点。");
                      return;
                    }
                    setEditOpen(true);
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <Pencil size={14} />
                  编辑图谱
                </button>
              </>
            )}
          </>
        }
      />
      {actionHint && (
        <div className="px-6 py-2 text-sm text-amber-700 bg-amber-50 border-b border-amber-100">
          {actionHint}
          <button
            type="button"
            className="ml-2 text-amber-900 underline"
            onClick={() => setActionHint(null)}
          >
            关闭
          </button>
        </div>
      )}
      <div className="p-6 grid grid-cols-12 gap-4">
        <div
          className="col-span-8 flex flex-col overflow-hidden bg-white rounded-xl border border-slate-200"
          style={{ height: SVG_H }}
        >
          {prof && !prof.hasKnowledgeGraph ? (
            <EmptyGraph
              professionName={prof.name}
              canShowBuild={canManageGraph}
              onBuild={() => setGenOpen(true)}
            />
          ) : nodes.length === 0 ? (
            <EmptyGraph
              professionName={prof?.name ?? "该专业"}
              canShowBuild={canManageGraph}
              onBuild={() => setGenOpen(true)}
            />
          ) : (
            <>
              {trainingPlanDocs.length > 0 && (
                <div className="shrink-0 border-b border-slate-100 bg-slate-50/50 px-3 py-2">
                  <div
                    ref={attachmentMenuRef}
                    className="flex min-h-[2rem] items-center gap-2"
                  >
                    <FileText
                      className="size-4 shrink-0 text-slate-400"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <p className="min-w-0 flex-1 truncate text-[0.8125rem] text-slate-600">
                      <span className="text-slate-500">
                        {prof?.name ?? "本专业"}
                        图谱依据：
                      </span>
                      培养方案、岗位研判与概论等教学档案共{" "}
                      <span className="tabular-nums text-slate-800">
                        {trainingPlanDocs.length}
                      </span>{" "}
                      份
                    </p>
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setAttachmentMenuOpen((open) => !open)
                        }
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[0.75rem] font-medium text-slate-700 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-900"
                        aria-expanded={attachmentMenuOpen}
                        aria-haspopup="true"
                        aria-controls="kg-attachment-menu"
                      >
                        附件清单
                        <ChevronDown
                          className={`size-3.5 text-slate-500 transition-transform ${attachmentMenuOpen ? "rotate-180" : ""}`}
                          aria-hidden
                        />
                      </button>
                      {attachmentMenuOpen && (
                        <div
                          id="kg-attachment-menu"
                          role="menu"
                          className="absolute right-0 top-[calc(100%+0.25rem)] z-30 w-[min(calc(100vw-3rem),22rem)] rounded-lg border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5"
                        >
                          <div className="max-h-[min(50vh,280px)] overflow-y-auto px-1">
                            {trainingPlanDocs.map((doc) => (
                              <button
                                key={doc.id}
                                type="button"
                                role="menuitem"
                                className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-[0.8125rem] hover:bg-slate-50"
                                onClick={() => {
                                  setPlanDocOpenId(doc.id);
                                  setAttachmentMenuOpen(false);
                                }}
                              >
                                <span className="mt-0.5 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[0.625rem] font-medium text-slate-600">
                                  {attachmentKindLabel[doc.kind]}
                                </span>
                                <span className="min-w-0 break-words text-slate-800">
                                  {doc.fileName}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="shrink-0 border-b border-slate-100 px-3 py-2">
                <div className="text-[0.625rem] text-slate-400 mb-1.5">
                  层级自中心向外扩散；点击标签可显示/隐藏节点或边
                </div>
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  {graphVisualLayerOrder.map((layer) => {
                    const on = visibleLayers.has(layer);
                    return (
                      <button
                        key={layer}
                        type="button"
                        onClick={() => toggleLayer(layer)}
                        className={`rounded-full border px-2 py-0.5 text-[0.6875rem] ${
                          on
                            ? "border-slate-200 bg-white text-slate-700"
                            : "border-slate-200 bg-slate-50 text-slate-400 line-through"
                        }`}
                      >
                        <span
                          className="mr-1.5 inline-block size-2 rounded-full align-middle"
                          style={{ background: graphVisualLayerColor[layer] }}
                        />
                        {graphVisualLayerLabel[layer]}
                      </button>
                    );
                  })}
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as "" | GraphNode["status"])
                    }
                    className="ml-auto rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[0.6875rem] text-slate-600"
                    aria-label="按节点状态筛选"
                  >
                    <option value="">全部状态</option>
                    <option value="ai_draft">AI 草稿</option>
                    <option value="edited">人工编辑</option>
                    <option value="confirmed">已确认</option>
                  </select>
                </div>
                <div className="flex max-h-20 flex-wrap items-center gap-2 overflow-y-auto pr-0.5">
                  <span className="text-[0.6875rem] text-slate-400">边关系</span>
                  {relationsInGraph.map((relation) => {
                    const on = visibleRelations.has(relation);
                    return (
                      <button
                        key={relation}
                        type="button"
                        onClick={() => toggleRelation(relation)}
                        title={on ? "点击隐藏该类边" : "点击显示该类边"}
                        className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-left text-[0.75rem] transition
                          ${
                            on
                              ? "border-slate-200 bg-slate-50/90 hover:border-indigo-300"
                              : "border-slate-200 bg-slate-50/90 opacity-50 line-through"
                          }`}
                      >
                        <span className="text-slate-600">{edgeRelationLabel[relation]}</span>
                      </button>
                    );
                  })}
                  {visibleRelations.size < relationsInGraph.length && (
                    <button
                      type="button"
                      onClick={() => setVisibleRelations(new Set(allEdgeRelations))}
                      className="shrink-0 text-[0.6875rem] text-indigo-600 hover:text-indigo-800"
                    >
                      显示全部边
                    </button>
                  )}
                  {visibleLayers.size < graphVisualLayerOrder.length && (
                    <button
                      type="button"
                      onClick={() => setVisibleLayers(new Set(graphVisualLayerOrder))}
                      className="shrink-0 text-[0.6875rem] text-indigo-600 hover:text-indigo-800"
                    >
                      显示全部节点
                    </button>
                  )}
                </div>
              </div>
              <div
                ref={graphAreaRef}
                className="relative min-h-0 w-full flex-1"
              >
                {visibleNodes.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                    当前已隐藏全部节点，请点层级标签或「显示全部节点」
                  </div>
                ) : (
                  <KnowledgeGraphCanvas
                    nodes={visibleNodes}
                    edges={visibleEdges}
                    width={viewBox.w}
                    height={viewBox.h}
                    edgeStrokeMode="byRelation"
                    layoutOverrides={{
                      nodeMinCenterDistance: 82,
                      layoutEdgePadding: 42,
                    }}
                    focusNodeId={selected}
                    onNodeClick={(n) =>
                      setSelected((s) => (s === n.id ? null : n.id))
                    }
                    renderNode={({ node, x, y }) => {
                      const color = colorOfGraphNodeLayer(node);
                      const isSel = node.id === selected;
                      const isFocus = focusIds.has(node.id);
                      return (
                        <>
                          {isFocus && (
                            <circle
                              cx={x}
                              cy={y}
                              r={22}
                              fill="none"
                              stroke="#6366f1"
                              strokeDasharray="3 3"
                            />
                          )}
                          <GraphNodeShapeBrowse
                            type={node.nodeType}
                            x={x}
                            y={y}
                            color={color}
                            selected={isSel}
                            status={node.status}
                          />
                          <text
                            x={x}
                            y={y + 24}
                            textAnchor="middle"
                            fontSize={10}
                            fill="#334155"
                            className="pointer-events-none"
                          >
                            {truncateGraphLabel(node.name, 6)}
                          </text>
                        </>
                      );
                    }}
                  />
                )}
              </div>
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
              scopeTeacherId={scopeTeacherId}
              onOpenResource={onOpenResource}
              onOpenCourse={onOpenCourse}
              onOpenTraining={onOpenTraining}
              onClose={() => setSelected(null)}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              {prof && !prof.hasKnowledgeGraph ? "该专业尚未建设图谱" : "点击节点查看详情"}
            </div>
          )}
        </aside>
      </div>
      {openPlanDoc && (
        <TrainingPlanDocumentDialog
          fileName={openPlanDoc.fileName}
          kindLabel={attachmentKindLabel[openPlanDoc.kind]}
          content={openPlanDoc.content}
          onClose={() => setPlanDocOpenId(null)}
        />
      )}
      {genOpen && prof && canManageGraph && (
        <GenerateGraphDialog
          onClose={() => setGenOpen(false)}
          onConfirm={(uploadedName) => {
            setGenOpen(false);
            setActionHint(`已依据《${uploadedName}》提交知识图谱生成任务。`);
          }}
        />
      )}
      {editOpen && selected && node && canManageGraph && (
        <EditGraphNodeDialog
          key={selected}
          initialName={node.name}
          initialDescription={node.description}
          onClose={() => setEditOpen(false)}
          onSave={({ name, description }) => {
            setNodeOverrides((prev) => ({
              ...prev,
              [selected]: { name, description },
            }));
            setEditOpen(false);
            setActionHint("已保存节点信息。");
          }}
        />
      )}
    </div>
  );
}

function TrainingPlanDocumentDialog({
  fileName,
  kindLabel,
  content,
  onClose,
}: {
  fileName: string;
  kindLabel?: string;
  content: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[min(85vh,720px)] shadow-xl border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="training-plan-doc-title"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 shrink-0">
          <div className="min-w-0 pr-2">
            {kindLabel && (
              <div className="mb-1 text-[0.6875rem] font-medium text-indigo-700">
                {kindLabel}
              </div>
            )}
            <div
              id="training-plan-doc-title"
              className="text-slate-900 font-medium truncate"
              title={fileName}
            >
              {fileName}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <pre className="whitespace-pre-wrap font-sans text-[0.8125rem] leading-relaxed text-slate-700">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
}

function GenerateGraphDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (uploadedFileName: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-slate-900 font-medium">选择材料重新生成知识图谱</div>
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
            >
              <Upload size={16} />
              选择文件
            </button>
            {file && (
              <span className="text-sm text-slate-600 truncate max-w-[min(100%,240px)]" title={file.name}>
                已选：{file.name}
              </span>
            )}
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600 leading-relaxed">
          {file ? (
            <>
              将依据
              <span className="text-slate-800 font-medium">《{file.name}》</span>
              从培养方案、岗位 JD、教学大纲中重新梳理「素养 → 能力 → 知识点 → 课程/实训」路径；已锁定节点默认保留。
            </>
          ) : (
            "请上传培养方案、JD、教学大纲或课程体系文件"
          )}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!file}
            onClick={() => file && onConfirm(file.name)}
            className="px-3 py-1.5 rounded-md bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            开始重新生成
          </button>
        </div>
      </div>
    </div>
  );
}

function EditGraphNodeDialog({
  initialName,
  initialDescription,
  onClose,
  onSave,
}: {
  initialName: string;
  initialDescription: string;
  onClose: () => void;
  onSave: (v: { name: string; description: string }) => void;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-slate-900 font-medium">编辑节点</div>
        <div className="mt-3 space-y-2">
          <div className="text-xs text-slate-500">显示名称</div>
          <input
            className="w-full border border-slate-200 rounded-md px-2 py-1.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="text-xs text-slate-500">说明</div>
          <textarea
            className="w-full border border-slate-200 rounded-md px-2 py-1.5 min-h-[100px] text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={() => onSave({ name, description })}
            className="px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyGraph({
  professionName,
  canShowBuild,
  onBuild,
}: {
  professionName: string;
  canShowBuild: boolean;
  onBuild: () => void;
}) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center text-center p-8">
      <div className="size-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-3">
        <BookOpen size={28} />
      </div>
      <div className="text-slate-900 mb-1">{professionName}尚未建设知识图谱</div>
      <p className="text-slate-500 max-w-md">
        该专业当前没有可视化的图谱节点。学院管理员可上传专业人才培养方案等文件，通过「按培养方案生成」创建图谱；其他用户可浏览已建设完成的专业数据。
      </p>
      {canShowBuild && (
        <button
          type="button"
          onClick={onBuild}
          className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white"
        >
          按培养方案生成
        </button>
      )}
    </div>
  );
}

function NodeDetailPanel({
  node,
  isFocus,
  scopeTeacherId,
  onOpenResource,
  onOpenCourse,
  onOpenTraining,
  onClose,
}: {
  node: GraphNode;
  isFocus: boolean;
  scopeTeacherId?: string;
  onOpenResource: (id: string) => void;
  onOpenCourse?: (id: string) => void;
  onOpenTraining?: (id: string) => void;
  onClose: () => void;
}) {
  const seesAll =
    !scopeTeacherId || teacherSeesAllScopedContent(scopeTeacherId);
  const rs = resourcesByNode(node.id).filter(
    (r) => seesAll || r.uploaderTeacherId === scopeTeacherId,
  );
  const cs = coursesByNode(node.id).filter(
    (c) => seesAll || c.ownerTeacherId === scopeTeacherId,
  );
  const ts = trainingsByNode(node.id).filter(
    (t) => seesAll || t.ownerTeacherId === scopeTeacherId,
  );
  const visualLayer = visualLayerOfNode(node);
  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-slate-900">{node.name}</div>
          <div className="mt-1 flex gap-1.5 flex-wrap">
            <span
              className="px-2 py-0.5 rounded-md text-white"
              style={{ background: graphVisualLayerColor[visualLayer] }}
            >
              {graphVisualLayerLabel[visualLayer]}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md ${
                node.status === "ai_draft"
                  ? "bg-violet-50 text-violet-700"
                  : node.status === "edited"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {statusLabel[node.status]}
            </span>
            {node.locked && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                已锁定
              </span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
          <X size={16} />
        </button>
      </div>
      <p className="mt-3 text-slate-600 leading-relaxed">{node.description}</p>
      {node.sources.length > 0 && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="text-slate-500 text-xs mb-1">来源依据</div>
          <div className="text-slate-700 text-sm">
            {node.sources[0]!.fileName} · {node.sources[0]!.locator}
          </div>
          <div className="mt-1 text-slate-500 text-xs line-clamp-2">
            {node.sources[0]!.excerpt}
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="flex items-center gap-1.5 text-slate-500 mb-2">
          <BookOpen size={14} /> 挂载课程（{cs.length}）
        </div>
        <div className="space-y-1.5">
          {cs.map((c) =>
            onOpenCourse ? (
              <button
                key={c.id}
                type="button"
                onClick={() => onOpenCourse(c.id)}
                className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40"
              >
                《{c.name}》 · {c.credit} 学分
              </button>
            ) : (
              <div key={c.id} className="px-3 py-2 rounded-lg border border-slate-200">
                《{c.name}》 · {c.credit} 学分
              </div>
            ),
          )}
          {cs.length === 0 && <div className="text-slate-400">暂无课程挂载</div>}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-1.5 text-slate-500 mb-2">
          <FileText size={14} /> 课程/实训资料（{rs.length}）
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
          {rs.length === 0 && <div className="text-slate-400">该节点关联的课程/实训暂无资料</div>}
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
          {ts.map((t) =>
            onOpenTraining ? (
              <button
                key={t.id}
                type="button"
                onClick={() => onOpenTraining(t.id)}
                className="w-full text-left px-3 py-2 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40"
              >
                {t.name} · {t.difficulty} · {t.estimatedHours}h
              </button>
            ) : (
              <div key={t.id} className="px-3 py-2 rounded-lg border border-slate-200">
                {t.name} · {t.difficulty} · {t.estimatedHours}h
              </div>
            ),
          )}
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

export function ResourceDetail({
  id,
  currentTeacherId,
  onBack,
  onOpenKnowledgeInGraph,
}: {
  id: string;
  currentTeacherId: string;
  onBack: () => void;
  onOpenKnowledgeInGraph: (nodeId: string) => void;
}) {
  const r = resourceById(id);
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
              {r.description || "暂无描述。可在下方操作下载或插入到教学设计。"}
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
