import { useEffect, useMemo, useState } from "react";
import { BookMarked, Map } from "lucide-react";
import { getPlanKnowledgePathGraph, teachingPlans } from "@mock";
import type { GraphEdge, GraphNode, PlanKGraphEdge, PlanKGraphNode } from "@mock";
import {
  colorOfGraphNodeLayer,
  graphVisualLayerColor,
  graphVisualLayerLabel,
  graphVisualLayerOrder,
  visualLayerOfNode,
} from "../data/graphLayout";
import {
  GraphNodeShapePath,
  KnowledgeGraphCanvas,
  truncateGraphLabel,
} from "./knowledgeGraph";

function toGraphNodes(
  nodes: PlanKGraphNode[],
  professionId: string,
): GraphNode[] {
  return nodes.map((n) => ({
    id: n.id,
    professionId,
    name: n.name,
    nodeType: n.nodeType,
    layer: n.layer,
    kind: n.kind,
    cluster: n.cluster,
    description: n.description,
    status: n.status ?? "confirmed",
    locked: true,
    sources: [],
  }));
}

function toGraphEdges(
  data: PlanKGraphEdge[],
  professionId: string,
): GraphEdge[] {
  return data.map((e) => ({
    id: e.id,
    professionId,
    from: e.from,
    to: e.to,
    relation: e.relation,
  }));
}

type Props = {
  planIds: string[];
  emptyHint?: string;
  variant: "teacher" | "student";
  layout?: "default" | "detail";
};

const LAYOUT = {
  default: { w: 960, h: 260, macro: 0.26, micro: 52, grow: 5, short: 8, fs: 9 },
  detail: { w: 1120, h: 420, macro: 0.3, micro: 58, grow: 5, short: 10, fs: 9.5 },
} as const;

/**
 * 教学计划专属知识路径（虚拟数据，与专业库图谱无 ID 级对应），用于计划详情等场景。
 */
export function PlanKnowledgePathPreview({
  planIds,
  emptyHint = "暂无可展示的计划路径",
  variant,
  layout = "default",
}: Props) {
  const planKey = planIds.join("\0");
  const valid = useMemo(
    () => planIds.filter((id) => getPlanKnowledgePathGraph(id)),
    [planKey, planIds],
  );
  const L = LAYOUT[layout];
  const { w: SVG_W, h: SVG_H } = L;
  const [activePlanId, setActivePlanId] = useState(valid[0] ?? "");
  const [selId, setSelId] = useState<string | null>(null);

  useEffect(() => {
    if (valid.length === 0) {
      setActivePlanId("");
      return;
    }
    setActivePlanId((cur) => (valid.includes(cur) ? cur : valid[0]!));
  }, [valid]);

  const gData = getPlanKnowledgePathGraph(activePlanId);
  const planRow = teachingPlans.find((p) => p.id === activePlanId);
  const profId = planRow?.professionId ?? "prof-mech";

  const layoutOverrides = useMemo(
    () => ({
      macroRadius: Math.min(SVG_W, SVG_H) * L.macro,
      microRadius: L.micro,
      microRadiusGrow: L.grow,
    }),
    [SVG_W, SVG_H, L.macro, L.micro, L.grow],
  );

  const { layoutNodes, layoutEdges, layers } = useMemo(() => {
    if (!gData) {
      return {
        layoutNodes: [] as GraphNode[],
        layoutEdges: [] as GraphEdge[],
        layers: [] as ReturnType<typeof visualLayerOfNode>[],
      };
    }
    const layoutNodes = toGraphNodes(gData.nodes, profId);
    const layoutEdges = toGraphEdges(gData.edges, profId);
    const layerSet = new Set(layoutNodes.map((n) => visualLayerOfNode(n)));
    const layers = graphVisualLayerOrder.filter((layer) =>
      layerSet.has(layer),
    );
    return { layoutNodes, layoutEdges, layers };
  }, [gData, profId]);

  const title =
    variant === "teacher" ? "教学计划 · 知识路径" : "学习计划 · 知识路径";
  const sub =
    "节点与专业知识引擎中本专业主图一致；本图展示教师从主图切出的素养、能力、知识点、课程/实训路径。";

  if (valid.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-8 text-center text-slate-500 text-sm">
        {emptyHint}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/80 to-white overflow-hidden">
      <div className="px-5 pt-4 pb-2 flex flex-wrap items-start gap-3">
        <div className="size-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
          <Map size={20} />
        </div>
        <div className="flex-1 min-w-[12.5rem]">
          <div className="text-slate-900 flex items-center gap-2">
            {title}
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
              计划专属
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">{sub}</p>
        </div>
        {valid.length > 1 && (
          <div className="flex flex-wrap gap-1.5 justify-end w-full sm:w-auto">
            {valid.map((pid) => {
              const p = teachingPlans.find((x) => x.id === pid);
              const short =
                p?.title
                  .replace(/^《|》$/g, "")
                  .split("·")
                  .slice(0, 1)
                  .join("")
                  .trim() ?? pid;
              return (
                <button
                  key={pid}
                  type="button"
                  onClick={() => {
                    setActivePlanId(pid);
                    setSelId(null);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition ${
                    activePlanId === pid
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  {short}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {gData?.caption && (
        <div className="px-5 pb-2 text-slate-600 text-sm leading-relaxed">
          {gData.caption}
        </div>
      )}
      <div
        className="relative border-t border-indigo-100/80 bg-white/50"
        style={{ height: Math.min(SVG_H + 12, layout === "detail" ? 500 : 300) }}
      >
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5 z-10 max-w-[90%] items-center">
          {layout === "detail" && (
            <div className="hidden md:flex items-center gap-2 mr-1 text-[0.625rem] text-slate-500 border border-slate-200 rounded-full bg-white/95 px-2 py-0.5">
              <span className="inline-flex items-center gap-0.5">
                <span className="text-indigo-300">—</span> Depend
              </span>
              <span className="text-slate-300">|</span>
              <span className="inline-flex items-center gap-0.5">
                <span className="text-amber-300">—</span> Influence
              </span>
              <span className="text-slate-300">|</span>
              <span className="inline-flex items-center gap-0.5">
                <span className="text-emerald-300">—</span> Support
              </span>
              <span className="text-slate-300">|</span>
              <span>contain</span>
            </div>
          )}
          {layers.map((layer) => (
            <div
              key={layer}
              className="flex items-center gap-1.5 bg-white/95 border border-slate-200 rounded-full px-2 py-0.5"
            >
              <span
                className="size-2.5 rounded-full"
                style={{ background: graphVisualLayerColor[layer] }}
              />
              <span className="text-slate-500 text-xs">
                {graphVisualLayerLabel[layer]}
              </span>
            </div>
          ))}
        </div>
        <KnowledgeGraphCanvas
          nodes={layoutNodes}
          edges={layoutEdges}
          width={SVG_W}
          height={SVG_H}
          edgeStrokeMode="byRelation"
          layoutOverrides={layoutOverrides}
          focusNodeId={selId}
          onNodeClick={(n) => setSelId((s) => (s === n.id ? null : n.id))}
          renderNode={({ node, x, y }) => {
            const isSel = node.id === selId;
            const planFocus = Boolean(
              gData?.nodes.find((z) => z.id === node.id)?.focus,
            );
            return (
              <>
                <title>{node.name}</title>
                <GraphNodeShapePath
                  type={node.nodeType}
                  x={x}
                  y={y}
                  color={colorOfGraphNodeLayer(node)}
                  planFocus={planFocus}
                  selected={isSel}
                />
                <text
                  x={x}
                  y={y + 18}
                  textAnchor="middle"
                  fontSize={L.fs}
                  fill="#475569"
                  className="pointer-events-none"
                >
                  {truncateGraphLabel(node.name, L.short)}
                </text>
              </>
            );
          }}
        />
        {selId && gData && (
          <div className="absolute bottom-2 left-3 right-3 text-center text-xs text-slate-600 bg-white/90 border border-slate-200 rounded-md py-1.5 px-2">
            <span className="text-slate-500">当前节点 · </span>
            <span className="text-slate-800">
              {gData.nodes.find((x) => x.id === selId)?.name}
            </span>
            {gData.nodes.find((x) => x.id === selId)?.description && (
              <span className="text-slate-500">
                {" "}
                — {gData.nodes.find((x) => x.id === selId)!.description}
              </span>
            )}
          </div>
        )}
        {!selId && (
          <div className="absolute bottom-2 right-3 text-slate-400 text-xs">
            点击节点查看介绍
            <span className="inline-flex items-center gap-0.5 ml-2">
              <BookMarked size={12} className="opacity-60" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
