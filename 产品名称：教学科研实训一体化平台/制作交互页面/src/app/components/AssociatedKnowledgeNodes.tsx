import { useMemo } from "react";
import { Network } from "lucide-react";
import { graphNodeById } from "../data/lookups";
import { colorOfCluster } from "../data/graphLayout";

const chipBase =
  "px-2 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-700 text-left transition";
const chipButton = `${chipBase} hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer`;
const chipStatic = chipBase;

export function AssociatedKnowledgeNodes({
  knowledgeNodeIds,
  onNodeClick,
  emptyMessage = "该专业尚未建立知识图谱，暂无关联节点。",
  unmappedHint = "未解析到图谱中的节点",
  className = "",
  showHeader = true,
}: {
  knowledgeNodeIds: string[];
  onNodeClick?: (nodeId: string) => void;
  /** 有 id 但全部无法解析为图谱节点时 */
  emptyMessage?: string;
  /** 部分 id 无法解析时的小标题 */
  unmappedHint?: string;
  className?: string;
  /** 为 false 时仅输出列表（用于与外层已带标题的侧栏配合） */
  showHeader?: boolean;
}) {
  const { byCluster, unmappedIds } = useMemo(() => {
    const map: Record<string, Array<{ id: string; name: string; cluster: string }>> = {};
    const unmapped: string[] = [];
    for (const nid of knowledgeNodeIds) {
      const n = graphNodeById(nid);
      if (!n) {
        unmapped.push(nid);
        continue;
      }
      if (!map[n.cluster]) map[n.cluster] = [];
      map[n.cluster].push({ id: n.id, name: n.name, cluster: n.cluster });
    }
    return { byCluster: map, unmappedIds: unmapped };
  }, [knowledgeNodeIds]);

  const hasMapped = Object.keys(byCluster).length > 0;

  const renderNodeChip = (nid: string, label: string, cluster?: string) => {
    const color = cluster ? colorOfCluster(cluster) : undefined;
    const inner = (
      <>
        {color && (
          <span
            className="size-2 rounded-full shrink-0"
            style={{ background: color }}
          />
        )}
        <span className="truncate max-w-[14rem]">{label}</span>
      </>
    );
    if (onNodeClick) {
      return (
        <button
          key={nid}
          type="button"
          onClick={() => onNodeClick(nid)}
          className={`inline-flex items-center gap-1.5 max-w-full ${chipButton}`}
        >
          {inner}
        </button>
      );
    }
    return (
      <span
        key={nid}
        className={`inline-flex items-center gap-1.5 max-w-full ${chipStatic}`}
      >
        {inner}
      </span>
    );
  };

  if (knowledgeNodeIds.length === 0) {
    return (
      <div className={className}>
        {showHeader && (
          <div className="flex items-center gap-2 mb-3">
            <Network size={16} className="text-indigo-500" />
            <span className="text-slate-900">关联知识点</span>
            <span className="text-slate-400">（0）</span>
          </div>
        )}
        <div className="text-slate-400">暂无关联知识点</div>
      </div>
    );
  }

  if (!hasMapped && unmappedIds.length > 0) {
    return (
      <div className={className}>
        {showHeader && (
          <div className="flex items-center gap-2 mb-3">
            <Network size={16} className="text-indigo-500" />
            <span className="text-slate-900">关联知识点</span>
            <span className="text-slate-400">（{knowledgeNodeIds.length}）</span>
          </div>
        )}
        <div className="text-slate-400 mb-2">{emptyMessage}</div>
        <div className="text-slate-500 text-sm mb-1.5">{unmappedHint}</div>
        <div className="flex flex-wrap gap-1.5">
          {unmappedIds.map((nid) => renderNodeChip(nid, nid))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="flex items-center gap-2 mb-3">
          <Network size={16} className="text-indigo-500" />
          <span className="text-slate-900">关联知识点</span>
          <span className="text-slate-400">（{knowledgeNodeIds.length}）</span>
        </div>
      )}
      <div className="space-y-3">
        {Object.entries(byCluster).map(([cluster, ns]) => (
          <div key={cluster}>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="size-2.5 rounded-full shrink-0"
                style={{ background: colorOfCluster(cluster) }}
              />
              <span className="text-slate-700">{cluster}</span>
              <span className="text-slate-400">（{ns.length}）</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ns.map((n) => renderNodeChip(n.id, n.name, n.cluster))}
            </div>
          </div>
        ))}
        {unmappedIds.length > 0 && (
          <div>
            <div className="text-slate-500 text-sm mb-1.5">{unmappedHint}</div>
            <div className="flex flex-wrap gap-1.5">
              {unmappedIds.map((nid) => renderNodeChip(nid, nid))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
