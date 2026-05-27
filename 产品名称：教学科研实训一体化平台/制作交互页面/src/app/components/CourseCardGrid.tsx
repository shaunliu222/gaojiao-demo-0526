import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Copy,
  Edit3,
  Eye,
  FolderTree,
  MoreHorizontal,
  Trash2,
  ArrowUpDown,
} from "lucide-react";
import type { Course } from "@mock";
import {
  subjectById,
  professionById,
  teacherById,
  countCourseStats,
  creatorNameByCourse,
  subjectNameByCourse,
  professionNameByCourse,
  getCourseChapters,
} from "../data/lookups";

// ---------------------------------------------------------------------------
// Publish status badge
// ---------------------------------------------------------------------------

const publishStatusConfig: Record<
  Course["publishStatus"],
  { label: string; cls: string }
> = {
  published: {
    label: "已上架",
    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  draft: {
    label: "草稿",
    cls: "bg-slate-100 text-slate-600 border border-slate-200",
  },
  unpublished: {
    label: "已下架",
    cls: "bg-orange-50 text-orange-700 border border-orange-200",
  },
};

function PublishBadge({ status }: { status: Course["publishStatus"] }) {
  const cfg = publishStatusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${cfg.cls}`}
    >
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// "更多" dropdown (per-card)
// ---------------------------------------------------------------------------

function MoreDropdown({
  courseId,
  isPublished,
  onAction,
}: {
  courseId: string;
  isPublished: boolean;
  onAction: (action: string, courseId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const itemCls =
    "flex items-center gap-2 w-full px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 text-left transition";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        title="更多"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-20 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
          <button
            type="button"
            className={itemCls}
            onClick={() => {
              onAction("copy", courseId);
              setOpen(false);
            }}
          >
            <Copy size={14} />
            复制
          </button>
          <button
            type="button"
            className={itemCls}
            onClick={() => {
              onAction("togglePublish", courseId);
              setOpen(false);
            }}
          >
            <ArrowUpDown size={14} />
            {isPublished ? "下架" : "上架"}
          </button>
          <button
            type="button"
            className={`${itemCls} ${
              isPublished
                ? "text-slate-300 cursor-not-allowed"
                : "text-red-600 hover:bg-red-50"
            }`}
            disabled={isPublished}
            onClick={() => {
              if (!isPublished) {
                onAction("delete", courseId);
                setOpen(false);
              }
            }}
          >
            <Trash2 size={14} />
            删除
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single course card
// ---------------------------------------------------------------------------

function CourseCard({
  course,
  onAction,
}: {
  course: Course;
  onAction: (action: string, courseId: string) => void;
}) {
  const subjectName = subjectNameByCourse(course.id);
  const professionName = professionNameByCourse(course.id);
  const creatorName = creatorNameByCourse(course.id);
  const chapters = getCourseChapters(course.id);
  const stats = countCourseStats(chapters);
  const isPublished = course.publishStatus === "published";

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col">
      {/* Cover area */}
      <div className="h-32 bg-gradient-to-br from-indigo-100 via-sky-100 to-emerald-100 flex items-center justify-center shrink-0">
        <BookOpen size={40} className="text-indigo-500/80" />
      </div>

      {/* Content area */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        {/* Course name */}
        <h3
          className="font-semibold text-slate-900 text-sm leading-snug line-clamp-1"
          title={course.name}
        >
          {course.name}
        </h3>

        {/* Course type badge (indigo) */}
        <span className="inline-flex self-start items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
          {course.courseType}
        </span>

        {/* Subject + Profession tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs">
            {subjectName}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs">
            {professionName}
          </span>
        </div>

        {/* Summary */}
        {course.summary && (
          <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
            {course.summary}
          </p>
        )}

        {/* Stats row */}
        <div className="text-xs text-slate-400 flex items-center gap-1">
          <span>
            技能点 {stats.skillPointCount}
          </span>
          <span className="text-slate-300">·</span>
          <span>
            知识点 {stats.knowledgePointCount}
          </span>
          <span className="text-slate-300">·</span>
          <span>
            资源 {stats.resourceCount}
          </span>
        </div>

        {/* Status + publish time */}
        <div className="flex items-center gap-2">
          <PublishBadge status={course.publishStatus} />
          {course.publishedAt && (
            <span className="text-xs text-slate-400">
              {new Date(course.publishedAt).toLocaleDateString("zh-CN")}
            </span>
          )}
        </div>

        {/* Creator */}
        <div className="text-xs text-slate-500">
          创建人：{creatorName}
        </div>
      </div>

      {/* Footer: action buttons */}
      <div className="border-t border-slate-100 px-3 py-2 flex items-center gap-1 bg-slate-50/60 shrink-0">
        <button
          type="button"
          onClick={() => onAction("chapters", course.id)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-600 hover:bg-slate-100 hover:text-indigo-700 transition"
          title="章节管理"
        >
          <FolderTree size={14} />
          <span className="hidden sm:inline">章节管理</span>
        </button>
        <button
          type="button"
          onClick={() => onAction("edit", course.id)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-600 hover:bg-slate-100 hover:text-indigo-700 transition"
          title="编辑"
        >
          <Edit3 size={14} />
          <span className="hidden sm:inline">编辑</span>
        </button>
        <button
          type="button"
          onClick={() => onAction("preview", course.id)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-600 hover:bg-slate-100 hover:text-indigo-700 transition"
          title="预览"
        >
          <Eye size={14} />
          <span className="hidden sm:inline">预览</span>
        </button>
        <div className="ml-auto">
          <MoreDropdown
            courseId={course.id}
            isPublished={isPublished}
            onAction={onAction}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid component
// ---------------------------------------------------------------------------

export interface CourseCardGridProps {
  courses: Course[];
  onAction: (action: string, courseId: string) => void;
}

export function CourseCardGrid({ courses, onAction }: CourseCardGridProps) {
  if (courses.length === 0) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        当前筛选条件下暂无课程
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} onAction={onAction} />
      ))}
    </div>
  );
}
