import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  FolderOpen,
  FileText,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";
import type {
  CourseChapter,
  ChapterNodeType,
  PublishStatus,
} from "@mock";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a map of nodeId -> level (root = 0) by walking the tree */
function buildLevelMap(
  nodes: CourseChapter[],
  level = 0,
  out = new Map<string, number>(),
): Map<string, number> {
  for (const n of nodes) {
    out.set(n.id, level);
    buildLevelMap(n.children, level + 1, out);
  }
  return out;
}

/** Count total leaf + non-leaf nodes */
function countNodes(nodes: CourseChapter[]): number {
  let c = 0;
  for (const n of nodes) {
    c += 1;
    c += countNodes(n.children);
  }
  return c;
}

// ---------------------------------------------------------------------------
// TreeNode — single row in the tree
// ---------------------------------------------------------------------------

interface TreeNodeProps {
  node: CourseChapter;
  level: number;
  maxLevel: number;
  selectedId: string | null;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onAdd: (parentId: string | null, afterId?: string) => void;
  onDelete: (id: string) => void;
}

function TreeNode({
  node,
  level,
  maxLevel,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
  onAdd,
  onDelete,
}: TreeNodeProps) {
  const isLeaf = node.children.length === 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const [hovered, setHovered] = useState(false);

  const statusDot =
    node.publishStatus === "published" ? (
      <span className="inline-block size-2 rounded-full bg-emerald-500 shrink-0" />
    ) : (
      <span className="inline-block size-2 rounded-full bg-slate-300 shrink-0" />
    );

  return (
    <li>
      <div
        className={`group flex items-center gap-1 py-1.5 pr-2 rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? "bg-indigo-50 text-indigo-700"
            : "hover:bg-slate-100 text-slate-700"
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(node.id)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Expand / Collapse chevron */}
        {isLeaf ? (
          <span className="w-4 shrink-0" />
        ) : (
          <button
            type="button"
            className="shrink-0 p-0 text-slate-400 hover:text-slate-600"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.id);
            }}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}

        {/* Icon */}
        {isLeaf ? (
          <FileText size={14} className="shrink-0 text-slate-400" />
        ) : (
          <FolderOpen size={14} className="shrink-0 text-amber-500" />
        )}

        {/* Title */}
        <span className="flex-1 min-w-0 truncate text-sm">{node.title}</span>

        {/* Status dot */}
        {statusDot}

        {/* Hover actions */}
        <span
          className={`flex items-center gap-0.5 transition-opacity ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {level < maxLevel && (
            <button
              type="button"
              title="添加子节点"
              className="p-0.5 rounded hover:bg-indigo-100 text-indigo-500"
              onClick={(e) => {
                e.stopPropagation();
                onAdd(node.id);
              }}
            >
              <Plus size={14} />
            </button>
          )}
          <button
            type="button"
            title="删除"
            className="p-0.5 rounded hover:bg-red-100 text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
          >
            <Trash2 size={14} />
          </button>
        </span>
      </div>

      {/* Children */}
      {!isLeaf && isExpanded && (
        <ul>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              maxLevel={maxLevel}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
              onAdd={onAdd}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// ChapterTree — exported component
// ---------------------------------------------------------------------------

interface ChapterTreeProps {
  nodes: CourseChapter[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (parentId: string | null, afterId?: string) => void;
  onDelete: (id: string) => void;
  maxLevel?: number;
}

export function ChapterTree({
  nodes,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  maxLevel = 3,
}: ChapterTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Auto-expand root nodes by default
    const s = new Set<string>();
    for (const n of nodes) s.add(n.id);
    return s;
  });

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (nodes.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">
        暂无章节，点击上方按钮添加
      </div>
    );
  }

  return (
    <ul className="select-none">
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          maxLevel={maxLevel}
          selectedId={selectedId}
          expandedIds={expandedIds}
          onSelect={onSelect}
          onToggle={toggle}
          onAdd={onAdd}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
