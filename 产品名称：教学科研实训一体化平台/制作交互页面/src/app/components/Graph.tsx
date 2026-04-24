import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, BookOpen, Film, FileText, FlaskConical, Image as ImageIcon, Music, Code2, Database, ListChecks, Sparkles, Pencil, Upload } from "lucide-react";
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
import { colorOfCluster, clusterColor } from "../data/graphLayout";
import { PageHeader, AiBadge, type Role } from "./Layout";
import {
  GraphNodeShapeBrowse,
  KnowledgeGraphCanvas,
  truncateGraphLabel,
} from "./knowledgeGraph";

const SVG_H = 520;

export function GraphBrowse({
  onOpenResource,
  role = "teacher",
}: {
  onOpenResource: (id: string) => void;
  role?: Role;
}) {
  const canManageGraph = role === "college_admin";
  const [profId, setProfId] = useState<string>("prof-mech");
  const [selected, setSelected] = useState<string | null>("kn-mech-031");
  const [hiddenClusters, setHiddenClusters] = useState<Set<string>>(() => new Set());
  const [nodeOverrides, setNodeOverrides] = useState<
    Record<string, { name?: string; description?: string }>
  >({});
  const [genOpen, setGenOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [actionHint, setActionHint] = useState<string | null>(null);
  const graphAreaRef = useRef<HTMLDivElement>(null);
  const [viewBox, setViewBox] = useState({ w: 900, h: 400 });

  const prof = professions.find((p) => p.id === profId);
  const baseNodes = nodesByProfession[profId] ?? [];
  const edges = edgesByProfession[profId] ?? [];
  const nodes = useMemo(
    () => baseNodes.map((n) => ({ ...n, ...nodeOverrides[n.id] })),
    [baseNodes, nodeOverrides],
  );

  const focusIds = useMemo(() => new Set<string>(), []);

  const node = selected ? nodes.find((n) => n.id === selected) : undefined;

  // 当前图谱真正出现的簇（用于图例，避免全局簇色盘太长）
  const clustersInGraph = useMemo(() => {
    const set = new Set<string>();
    for (const n of nodes) set.add(n.cluster);
    return Array.from(set);
  }, [nodes]);

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
    () => nodes.filter((n) => !hiddenClusters.has(n.cluster)),
    [nodes, hiddenClusters],
  );
  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((n) => n.id)),
    [visibleNodes],
  );
  const visibleEdges = useMemo(
    () =>
      edges.filter(
        (e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to),
      ),
    [edges, visibleNodeIds],
  );

  const toggleCluster = useCallback((name: string) => {
    setHiddenClusters((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const showAllClusters = useCallback(() => {
    setHiddenClusters(new Set());
  }, []);

  useEffect(() => {
    if (!selected) return;
    const n = nodes.find((x) => x.id === selected);
    if (n && hiddenClusters.has(n.cluster)) setSelected(null);
  }, [selected, hiddenClusters, nodes]);

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
                setHiddenClusters(new Set());
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
                  生成图谱
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
              <div className="shrink-0 border-b border-slate-100 px-3 py-2">
                <div className="text-[0.625rem] text-slate-400 mb-1.5">
                  点击图例可显示/隐藏该知识簇
                </div>
                <div className="flex max-h-20 flex-wrap items-center gap-2 overflow-y-auto pr-0.5">
                  {hiddenClusters.size > 0 && (
                    <button
                      type="button"
                      onClick={showAllClusters}
                      className="shrink-0 text-[0.6875rem] text-indigo-600 hover:text-indigo-800"
                    >
                      全部显示
                    </button>
                  )}
                  {clustersInGraph.map((k) => {
                    const off = hiddenClusters.has(k);
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => toggleCluster(k)}
                        title={off ? "点击在图中显示" : "点击在图中隐藏"}
                        className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-left text-[0.75rem] transition
                          ${
                            off
                              ? "border-slate-200 bg-slate-50/90 opacity-50 line-through"
                              : "border-slate-200 bg-slate-50/90 hover:border-indigo-300"
                          }`}
                      >
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{
                            background: clusterColor[k] ?? colorOfCluster(k),
                            opacity: off ? 0.4 : 1,
                          }}
                        />
                        <span className="text-slate-600">{k}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div
                ref={graphAreaRef}
                className="relative min-h-0 w-full flex-1"
              >
                {visibleNodes.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                    当前已隐藏全部分簇，请点图例或「全部显示」
                  </div>
                ) : (
                  <KnowledgeGraphCanvas
                    nodes={visibleNodes}
                    edges={visibleEdges}
                    width={viewBox.w}
                    height={viewBox.h}
                    edgeStrokeMode="neutral"
                    onNodeClick={(n) => setSelected(n.id)}
                    renderNode={({ node, x, y }) => {
                      const color = colorOfCluster(node.cluster);
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
        <div className="text-slate-900 font-medium">按培养计划生成知识图谱</div>
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
              从培养规格中梳理知识点、技能点与能力模块之间的结构关系。
            </>
          ) : (
            "请上传文件"
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
            开始生成
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
