import { useState, useCallback } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import type {
  CourseChapter,
  ChapterNodeType,
  PublishStatus,
} from "@mock";
import {
  getCourseChapters,
  courseById,
  countCourseStats,
} from "../data/lookups";
import { PageHeader } from "./Layout";
import { ChapterTree } from "./ChapterTree";
import { ChapterContentPanel } from "./ChapterContentPanel";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Deep-clone a chapter tree so mutations are safe */
function cloneChapters(nodes: CourseChapter[]): CourseChapter[] {
  return nodes.map((n) => ({
    ...n,
    children: cloneChapters(n.children),
    coursewares: [...n.coursewares],
    exercises: [...n.exercises],
    skillPointIds: [...n.skillPointIds],
    knowledgePointIds: [...n.knowledgePointIds],
    references: [...n.references],
  }));
}

/** Count all nodes (for display) */
function countAllNodes(nodes: CourseChapter[]): number {
  let c = 0;
  for (const n of nodes) {
    c += 1;
    c += countAllNodes(n.children);
  }
  return c;
}

/** Recursively find and return the node with given id */
function findNode(
  nodes: CourseChapter[],
  id: string,
): CourseChapter | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNode(n.children, id);
    if (found) return found;
  }
  return undefined;
}

/** Recursively remove a node by id. Returns new array. */
function removeNode(nodes: CourseChapter[], id: string): CourseChapter[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({
      ...n,
      children: removeNode(n.children, id),
    }));
}

/** Insert a new child under parentId (or at root if null), after afterId if given */
function insertNode(
  nodes: CourseChapter[],
  parentId: string | null,
  newNode: CourseChapter,
  afterId?: string,
): CourseChapter[] {
  if (parentId === null) {
    // Insert at root level
    if (afterId) {
      const idx = nodes.findIndex((n) => n.id === afterId);
      if (idx >= 0) {
        return [
          ...nodes.slice(0, idx + 1),
          newNode,
          ...nodes.slice(idx + 1),
        ];
      }
    }
    return [...nodes, newNode];
  }

  return nodes.map((n) => {
    if (n.id === parentId) {
      if (afterId) {
        const idx = n.children.findIndex((c) => c.id === afterId);
        if (idx >= 0) {
          const children = [...n.children];
          children.splice(idx + 1, 0, newNode);
          return { ...n, children };
        }
      }
      return { ...n, children: [...n.children, newNode] };
    }
    return { ...n, children: insertNode(n.children, parentId, newNode, afterId) };
  });
}

/** Generate a unique-ish id */
let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `cc-new-${Date.now()}-${idCounter}`;
}

/** Determine the nodeType for a child of a given parent level */
function childNodeType(parentLevel: number): ChapterNodeType {
  if (parentLevel < 0) return "chapter";
  if (parentLevel === 0) return "section";
  return "subsection";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface CourseChapterManagerProps {
  courseId: string;
  currentTeacherId: string;
  onBack: () => void;
}

export function CourseChapterManager({
  courseId,
  currentTeacherId,
  onBack,
}: CourseChapterManagerProps) {
  const course = courseById(courseId);
  const courseName = course?.name ?? "课程";

  const [chapters, setChapters] = useState<CourseChapter[]>(() =>
    cloneChapters(getCourseChapters(courseId)),
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Resolve selected chapter from tree
  const selectedChapter = selectedNodeId
    ? findNode(chapters, selectedNodeId)
    : undefined;

  const totalCount = countAllNodes(chapters);
  const stats = countCourseStats(chapters);

  // ---- Handlers ----

  const handleAdd = useCallback(
    (parentId: string | null, afterId?: string) => {
      // Determine the depth of the new node
      const newNode: CourseChapter = {
        id: nextId(),
        title: "新章节",
        nodeType: parentId === null ? "chapter" : "section",
        publishStatus: "draft",
        sortOrder: 0,
        children: [],
        coursewares: [],
        exercises: [],
        skillPointIds: [],
        knowledgePointIds: [],
        references: [],
      };

      setChapters((prev) => insertNode(prev, parentId, newNode, afterId));
    },
    [],
  );

  const handleDelete = useCallback((id: string) => {
    setChapters((prev) => removeNode(prev, id));
    setSelectedNodeId((prev) => (prev === id ? null : prev));
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedNodeId(id);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <BookOpenIcon className="text-indigo-500" size={18} />
            <span>{courseName}</span>
            <span className="text-slate-400 font-normal text-sm">
              · 章节管理
            </span>
          </span>
        }
        back={onBack}
      />

      {/* Main content: left tree + right panel */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Tree panel */}
        <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
          {/* Tree header */}
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-slate-800">
                课程目录
              </span>
              <span className="ml-2 text-xs text-slate-400">{totalCount} 项</span>
            </div>
            <button
              type="button"
              onClick={() => handleAdd(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              <Plus size={12} />
              添加章
            </button>
          </div>

          {/* Tree */}
          <div className="flex-1 overflow-y-auto p-2">
            <ChapterTree
              nodes={chapters}
              selectedId={selectedNodeId}
              onSelect={handleSelect}
              onAdd={handleAdd}
              onDelete={handleDelete}
            />
          </div>

          {/* Stats bar */}
          <div className="px-4 py-2 border-t border-slate-200 text-xs text-slate-400 space-y-0.5">
            <div className="flex justify-between">
              <span>技能点</span>
              <span>{stats.skillPointCount}</span>
            </div>
            <div className="flex justify-between">
              <span>知识点</span>
              <span>{stats.knowledgePointCount}</span>
            </div>
            <div className="flex justify-between">
              <span>练习题</span>
              <span>{stats.exerciseCount}</span>
            </div>
            <div className="flex justify-between">
              <span>资源</span>
              <span>{stats.resourceCount}</span>
            </div>
          </div>
        </div>

        {/* Right: Content panel */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 p-6 min-h-full">
            <ChapterContentPanel
              key={selectedNodeId ?? "__empty__"}
              chapter={selectedChapter}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Small inline icon helper to avoid extra imports
function BookOpenIcon(props: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size ?? 24}
      height={props.size ?? 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}
