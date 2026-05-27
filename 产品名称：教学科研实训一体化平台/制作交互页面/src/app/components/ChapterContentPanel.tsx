import { useState, useCallback } from "react";
import {
  Upload,
  FolderOpen,
  FileText,
  Trash2,
  Plus,
  Sparkles,
  BookOpen,
  Lightbulb,
  Wrench,
  Brain,
  Link2,
  File,
  Video,
  Image as ImageIcon,
  Headphones,
  Code2,
  Database,
} from "lucide-react";
import type {
  CourseChapter,
  CoursewareItem,
  ExerciseItem,
  ExerciseType,
  ExerciseDifficulty,
  ReferenceItem,
} from "@mock";
import { l3NodeById } from "../data/lookups";

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const TABS = ["课件内容", "随堂练习", "技能点", "知识点", "参考资料"] as const;
type TabKey = (typeof TABS)[number];

const EXERCISE_TYPE_LABELS: Record<ExerciseType, string> = {
  single_choice: "单选",
  multi_choice: "多选",
  true_false: "判断",
  fill_blank: "填空",
  short_answer: "简答",
};

const EXERCISE_DIFFICULTY_COLORS: Record<ExerciseDifficulty, string> = {
  easy: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  hard: "bg-red-50 text-red-700",
};

const EXERCISE_DIFFICULTY_LABELS: Record<ExerciseDifficulty, string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

function fileTypeIcon(fileType: string) {
  switch (fileType) {
    case "video":
      return <Video size={14} className="text-blue-500" />;
    case "ppt":
      return <FileText size={14} className="text-orange-500" />;
    case "doc":
      return <File size={14} className="text-slate-500" />;
    case "image":
      return <ImageIcon size={14} className="text-purple-500" />;
    case "audio":
      return <Headphones size={14} className="text-pink-500" />;
    case "code":
      return <Code2 size={14} className="text-green-500" />;
    case "dataset":
      return <Database size={14} className="text-cyan-500" />;
    default:
      return <File size={14} className="text-slate-400" />;
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ChapterContentPanelProps {
  chapter: CourseChapter | undefined;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ChapterContentPanel({ chapter }: ChapterContentPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("课件内容");

  // Local state mirrors so we can add/remove items in the demo
  const [coursewares, setCoursewares] = useState<CoursewareItem[]>(
    chapter?.coursewares ?? [],
  );
  const [exercises, setExercises] = useState<ExerciseItem[]>(
    chapter?.exercises ?? [],
  );
  const [references, setReferences] = useState<ReferenceItem[]>(
    chapter?.references ?? [],
  );
  const [skillPointIds, setSkillPointIds] = useState<string[]>(
    chapter?.skillPointIds ?? [],
  );
  const [knowledgePointIds, setKnowledgePointIds] = useState<string[]>(
    chapter?.knowledgePointIds ?? [],
  );

  // Sync when chapter changes
  const prevId = chapter?.id;
  if (prevId && prevId !== (chapter as any)?._prevId) {
    // Force re-sync state on chapter switch
    // We use a key-based approach in the parent instead
  }

  // -- handlers (demo only) --

  const addCourseware = () => {
    const id = `cw-new-${Date.now()}`;
    setCoursewares((prev) => [
      ...prev,
      {
        id,
        title: "新上传课件",
        source: "local_upload",
        fileName: "新课件.pptx",
        fileType: "ppt",
        sizeMb: 2.4,
        uploadedAt: new Date().toISOString(),
      },
    ]);
  };

  const removeCourseware = (id: string) => {
    setCoursewares((prev) => prev.filter((c) => c.id !== id));
  };

  const addExercise = () => {
    const id = `ex-new-${Date.now()}`;
    setExercises((prev) => [
      ...prev,
      {
        id,
        type: "single_choice",
        difficulty: "medium",
        question: "新建练习题（点击编辑）",
        options: ["选项A", "选项B", "选项C", "选项D"],
        answer: "选项A",
        knowledgePointIds: [],
      },
    ]);
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const addSkillPoint = () => {
    const fakeId = `l3-sk-new-${Date.now()}`;
    setSkillPointIds((prev) => [...prev, fakeId]);
  };

  const removeSkillPoint = (id: string) => {
    setSkillPointIds((prev) => prev.filter((s) => s !== id));
  };

  const addKnowledgePoint = () => {
    const fakeId = `l3-kn-new-${Date.now()}`;
    setKnowledgePointIds((prev) => [...prev, fakeId]);
  };

  const removeKnowledgePoint = (id: string) => {
    setKnowledgePointIds((prev) => prev.filter((k) => k !== id));
  };

  const addReference = () => {
    const id = `ref-new-${Date.now()}`;
    setReferences((prev) => [
      ...prev,
      {
        id,
        title: "新参考资料",
        source: "resource_library",
        fileName: "参考资料.pdf",
        fileType: "doc",
        sizeMb: 1.2,
        uploadedAt: new Date().toISOString(),
      },
    ]);
  };

  const removeReference = (id: string) => {
    setReferences((prev) => prev.filter((r) => r.id !== id));
  };

  // -- guards --

  if (!chapter) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        选择一个小节查看内容
      </div>
    );
  }

  const isLeaf = chapter.children.length === 0;
  if (!isLeaf) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
        选择一个小节查看内容
      </div>
    );
  }

  // -- render --

  const btnCls =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition";
  const primaryBtn = `${btnCls} bg-indigo-600 text-white hover:bg-indigo-700`;
  const secondaryBtn = `${btnCls} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;
  const aiBtn = `${btnCls} bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600`;

  return (
    <div className="flex flex-col h-full" key={chapter.id}>
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{chapter.title}</h3>
        <p className="text-sm text-slate-500 mt-0.5">
          {chapter.nodeType === "chapter"
            ? "章"
            : chapter.nodeType === "section"
            ? "节"
            : "小节"}
          {" · "}
          {chapter.publishStatus === "published" ? "已发布" : "草稿"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`px-3 py-2 text-sm font-medium rounded-t-lg transition -mb-px border-b-2 ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-700 bg-indigo-50/60"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "课件内容" && (
          <CoursewareTab
            items={coursewares}
            onAdd={addCourseware}
            onRemove={removeCourseware}
          />
        )}
        {activeTab === "随堂练习" && (
          <ExerciseTab
            items={exercises}
            onAdd={addExercise}
            onRemove={removeExercise}
          />
        )}
        {activeTab === "技能点" && (
          <PointTab
            ids={skillPointIds}
            onAdd={addSkillPoint}
            onRemove={removeSkillPoint}
            label="技能点"
            Icon={Wrench}
          />
        )}
        {activeTab === "知识点" && (
          <PointTab
            ids={knowledgePointIds}
            onAdd={addKnowledgePoint}
            onRemove={removeKnowledgePoint}
            label="知识点"
            Icon={Brain}
          />
        )}
        {activeTab === "参考资料" && (
          <ReferenceTab
            items={references}
            onAdd={addReference}
            onRemove={removeReference}
          />
        )}
      </div>
    </div>
  );
}

// ===========================================================================
// Tab: Courseware
// ===========================================================================

function CoursewareTab({
  items,
  onAdd,
  onRemove,
}: {
  items: CoursewareItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition">
          <Upload size={14} />
          本地上传
        </button>
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition">
          <FolderOpen size={14} />
          从资料库选取
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">暂无课件</div>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-100 bg-white hover:border-slate-200 transition group"
            >
              {fileTypeIcon(item.fileType)}
              <span className="flex-1 min-w-0 truncate text-sm text-slate-800">
                {item.fileName}
              </span>
              {item.sizeMb != null && (
                <span className="text-xs text-slate-400">{item.sizeMb} MB</span>
              )}
              <button
                type="button"
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-red-400 transition"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ===========================================================================
// Tab: Exercises
// ===========================================================================

function ExerciseTab({
  items,
  onAdd,
  onRemove,
}: {
  items: ExerciseItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition">
          <Plus size={14} />
          添加题目
        </button>
        <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 transition">
          <Sparkles size={14} />
          出题助手(AI)
        </button>
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition">
          <Upload size={14} />
          批量上传
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">暂无练习题</div>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-100 bg-white hover:border-slate-200 transition group"
            >
              {/* Type badge */}
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700">
                {EXERCISE_TYPE_LABELS[item.type]}
              </span>
              {/* Difficulty badge */}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${EXERCISE_DIFFICULTY_COLORS[item.difficulty]}`}>
                {EXERCISE_DIFFICULTY_LABELS[item.difficulty]}
              </span>
              {/* Question */}
              <span className="flex-1 min-w-0 truncate text-sm text-slate-800">
                {item.question}
              </span>
              {item.isAiGenerated && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[0.625rem] bg-gradient-to-r from-violet-500 to-indigo-500 text-white">
                  AI
                </span>
              )}
              <button
                type="button"
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-red-400 transition"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ===========================================================================
// Tab: Skill Points / Knowledge Points (shared)
// ===========================================================================

function PointTab({
  ids,
  onAdd,
  onRemove,
  label,
  Icon,
}: {
  ids: string[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  label: string;
  Icon: typeof Wrench;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition">
          <Plus size={14} />
          添加{label}
        </button>
      </div>

      {ids.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">
          暂无关联{label}
        </div>
      ) : (
        <ul className="space-y-1.5">
          {ids.map((id) => {
            const node = l3NodeById(id);
            return (
              <li
                key={id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-100 bg-white hover:border-slate-200 transition group"
              >
                <Icon size={14} className="text-indigo-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="block text-sm text-slate-800 truncate">
                    {node?.name ?? `未知${label} (${id})`}
                  </span>
                  {node?.description && (
                    <span className="block text-xs text-slate-400 truncate mt-0.5">
                      {node.description}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-red-400 transition"
                  onClick={() => onRemove(id)}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ===========================================================================
// Tab: Reference Materials (same structure as Courseware)
// ===========================================================================

function ReferenceTab({
  items,
  onAdd,
  onRemove,
}: {
  items: ReferenceItem[];
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition">
          <Upload size={14} />
          本地上传
        </button>
        <button type="button" onClick={onAdd} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition">
          <FolderOpen size={14} />
          从资料库选取
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm">暂无参考资料</div>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-100 bg-white hover:border-slate-200 transition group"
            >
              {fileTypeIcon(item.fileType)}
              <span className="flex-1 min-w-0 truncate text-sm text-slate-800">
                {item.fileName}
              </span>
              {item.sizeMb != null && (
                <span className="text-xs text-slate-400">{item.sizeMb} MB</span>
              )}
              <button
                type="button"
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-red-400 transition"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
