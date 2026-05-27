import { X, BookOpen, FileText, ChevronRight } from "lucide-react";
import type { Course, CourseChapter } from "@mock";
import { courseById } from "../data/lookups";
import {
  subjectNameByCourse,
  professionNameByCourse,
  creatorNameByCourse,
  countCourseStats,
  getCourseChapters,
} from "../data/lookups";

export function CoursePreviewDialog({
  courseId,
  onClose,
}: {
  courseId: string;
  onClose: () => void;
}) {
  const course = courseById(courseId);
  if (!course) return null;

  const subjectName = subjectNameByCourse(courseId);
  const professionName = professionNameByCourse(courseId);
  const creatorName = creatorNameByCourse(courseId);
  const chapters = getCourseChapters(courseId);
  const stats = countCourseStats(chapters);

  return (
    <>
      <div
        role="presentation"
        className="fixed inset-0 z-50 bg-slate-900/50"
        onClick={onClose}
      />
      <div className="fixed inset-4 z-[51] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden sm:inset-8 md:inset-16">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">课程预览</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Cover */}
          <div className="h-48 bg-gradient-to-br from-indigo-100 via-sky-100 to-emerald-100 flex items-center justify-center">
            <BookOpen size={64} className="text-indigo-500/80" />
          </div>

          <div className="p-6 space-y-6">
            {/* Basic info */}
            <div>
              <h3 className="text-xl font-semibold text-slate-900">《{course.name}》</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-sm">{course.courseType}</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-sm">{subjectName}</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-sm">{professionName}</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-sm">{course.semester}</span>
              </div>
              {course.summary && (
                <p className="text-slate-600 mt-3 leading-relaxed">{course.summary}</p>
              )}
              <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                <span>学分: {course.credit}</span>
                <span>学时: {course.totalHours}</span>
                <span>创建人: {creatorName}</span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                <span>技能点: {stats.skillPointCount}</span>
                <span>知识点: {stats.knowledgePointCount}</span>
                <span>资源: {stats.resourceCount}</span>
              </div>
            </div>

            {/* Chapter outline */}
            {chapters.length > 0 && (
              <div>
                <h4 className="text-base font-semibold text-slate-900 mb-3">课程目录</h4>
                <div className="space-y-1">
                  {chapters.map((ch) => (
                    <ChapterPreviewNode key={ch.id} node={ch} level={0} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ChapterPreviewNode({ node, level }: { node: CourseChapter; level: number }) {
  const hasChildren = node.children.length > 0;
  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-slate-50 text-sm"
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {hasChildren ? (
          <ChevronRight size={14} className="text-slate-400 shrink-0" />
        ) : (
          <FileText size={14} className="text-slate-400 shrink-0" />
        )}
        <span className="text-slate-700">{node.title}</span>
        {node.publishStatus === "draft" && (
          <span className="text-xs text-slate-400">（草稿）</span>
        )}
      </div>
      {node.children.map((child) => (
        <ChapterPreviewNode key={child.id} node={child} level={level + 1} />
      ))}
    </div>
  );
}
