import { useEffect, useRef, useState } from "react";
import {
  FolderTree,
  Edit3,
  Eye,
  MoreHorizontal,
  Copy,
  ArrowUpDown,
  Trash2,
} from "lucide-react";
import type { Course, PublishStatus } from "@mock";
import {
  subjectById,
  professionById,
  teacherById,
  countCourseStats,
  creatorNameByCourse,
  subjectNameByCourse,
  professionNameByCourse,
} from "../data/lookups";

// ---------------------------------------------------------------------------
// Publish-status badge
// ---------------------------------------------------------------------------

function PublishBadge({ status }: { status: PublishStatus }) {
  switch (status) {
    case "published":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          已上架
        </span>
      );
    case "draft":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
          草稿
        </span>
      );
    case "unpublished":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
          已下架
        </span>
      );
  }
}

// ---------------------------------------------------------------------------
// "More" dropdown per row
// ---------------------------------------------------------------------------

function MoreDropdown({
  courseId,
  publishStatus,
  onCopy,
  onDelete,
  onPublishToggle,
}: {
  courseId: string;
  publishStatus: PublishStatus;
  onCopy: (id: string) => void;
  onDelete: (id: string) => void;
  onPublishToggle: (id: string) => void;
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

  const isPublished = publishStatus === "published";
  const isDraft = publishStatus === "draft";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        title="更多操作"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+4px)] z-20 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCopy(courseId);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
          >
            <Copy size={14} />
            复制
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPublishToggle(courseId);
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowUpDown size={14} />
            {isPublished ? "下架" : "上架"}
          </button>
          {!isPublished && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(courseId);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition"
            >
              <Trash2 size={14} />
              删除
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main table component
// ---------------------------------------------------------------------------

export interface CourseTableProps {
  courses: Course[];
  currentTeacherId: string;
  onChapterManage: (courseId: string) => void;
  onEdit: (courseId: string) => void;
  onPreview: (courseId: string) => void;
  onCopy: (courseId: string) => void;
  onDelete: (courseId: string) => void;
  onPublishToggle: (courseId: string) => void;
}

export function CourseTable({
  courses,
  currentTeacherId,
  onChapterManage,
  onEdit,
  onPreview,
  onCopy,
  onDelete,
  onPublishToggle,
}: CourseTableProps) {
  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
      <div className="overflow-x-auto max-h-[min(70vh,calc(100vh-12rem))] overflow-y-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0 z-10">
              <th className="px-3 py-2.5 font-medium whitespace-nowrap text-center w-14">
                序号
              </th>
              <th className="px-3 py-2.5 font-medium whitespace-nowrap min-w-[12rem]">
                课程名称
              </th>
              <th className="px-3 py-2.5 font-medium whitespace-nowrap">课程类型</th>
              <th className="px-3 py-2.5 font-medium whitespace-nowrap">适用学科</th>
              <th className="px-3 py-2.5 font-medium whitespace-nowrap">适用专业</th>
              <th className="px-3 py-2.5 font-medium whitespace-nowrap min-w-[10rem]">
                课程摘要
              </th>
              <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">
                技能点数
              </th>
              <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">
                知识点数
              </th>
              <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">
                资源数
              </th>
              <th className="px-3 py-2.5 font-medium whitespace-nowrap">上架状态</th>
              <th className="px-3 py-2.5 font-medium whitespace-nowrap">上架时间</th>
              <th className="px-3 py-2.5 font-medium whitespace-nowrap">创建人</th>
              <th className="px-3 py-2.5 font-medium whitespace-nowrap text-center min-w-[12rem]">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.length === 0 && (
              <tr>
                <td colSpan={13} className="px-3 py-16 text-center text-slate-400">
                  暂无课程数据
                </td>
              </tr>
            )}
            {courses.map((c, idx) => {
              const stats = countCourseStats(c.chapters);
              const subjectName = subjectNameByCourse(c.id);
              const professionName = professionNameByCourse(c.id);
              const creatorName = creatorNameByCourse(c.id);

              return (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50/80 text-slate-800"
                >
                  {/* 序号 */}
                  <td className="px-3 py-2.5 text-center text-slate-500 tabular-nums">
                    {idx + 1}
                  </td>
                  {/* 课程名称 */}
                  <td className="px-3 py-2.5 max-w-[14rem]">
                    <span className="line-clamp-2 font-medium" title={c.name}>
                      {c.name}
                    </span>
                  </td>
                  {/* 课程类型 */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {c.courseType}
                    </span>
                  </td>
                  {/* 适用学科 */}
                  <td
                    className="px-3 py-2.5 text-slate-600 whitespace-nowrap max-w-[8rem] truncate"
                    title={subjectName}
                  >
                    {subjectName}
                  </td>
                  {/* 适用专业 */}
                  <td
                    className="px-3 py-2.5 text-slate-600 whitespace-nowrap max-w-[8rem] truncate"
                    title={professionName}
                  >
                    {professionName}
                  </td>
                  {/* 课程摘要 */}
                  <td
                    className="px-3 py-2.5 text-slate-500 max-w-[10rem] truncate"
                    title={c.summary}
                  >
                    {c.summary || "—"}
                  </td>
                  {/* 技能点数 */}
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600">
                    {stats.skillPointCount}
                  </td>
                  {/* 知识点数 */}
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600">
                    {stats.knowledgePointCount}
                  </td>
                  {/* 资源数 */}
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600">
                    {stats.resourceCount}
                  </td>
                  {/* 上架状态 */}
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <PublishBadge status={c.publishStatus} />
                  </td>
                  {/* 上架时间 */}
                  <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap tabular-nums">
                    {c.publishedAt
                      ? new Date(c.publishedAt).toLocaleDateString("zh-CN")
                      : "—"}
                  </td>
                  {/* 创建人 */}
                  <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                    {creatorName}
                  </td>
                  {/* 操作 */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChapterManage(c.id);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-600 hover:bg-slate-100 hover:text-indigo-700 transition"
                        title="章节管理"
                      >
                        <FolderTree size={14} />
                        <span>章节管理</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(c.id);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-600 hover:bg-slate-100 hover:text-indigo-700 transition"
                        title="编辑"
                      >
                        <Edit3 size={14} />
                        <span>编辑</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreview(c.id);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-slate-600 hover:bg-slate-100 hover:text-indigo-700 transition"
                        title="预览"
                      >
                        <Eye size={14} />
                        <span>预览</span>
                      </button>
                      <MoreDropdown
                        courseId={c.id}
                        publishStatus={c.publishStatus}
                        onCopy={onCopy}
                        onDelete={onDelete}
                        onPublishToggle={onPublishToggle}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
