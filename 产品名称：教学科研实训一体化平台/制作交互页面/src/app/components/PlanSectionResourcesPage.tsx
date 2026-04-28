import { useCallback, useMemo, useRef, useState } from "react";
import { FileUp, FolderOpen, PenTool, Sparkles, Upload } from "lucide-react";
import type { PlanSectionResourceItem, ResourceType } from "@mock";
import { planSectionResourcesSeed } from "@mock";
import {
  courseById,
  planById,
  teacherById,
  teacherSeesAllScopedContent,
} from "../data/lookups";
import { PageHeader } from "./Layout";

const kindLabel: Record<ResourceType, string> = {
  doc: "文档",
  ppt: "演示",
  video: "视频",
  audio: "音频",
  image: "图像",
  code: "代码",
  dataset: "数据集",
  quiz: "题库",
};

function guessKindFromName(filename: string): ResourceType {
  const lower = filename.toLowerCase();
  if (/\.(pptx?|key)$/.test(lower)) return "ppt";
  if (/\.(mp4|mov|webm|mkv)$/.test(lower)) return "video";
  if (/\.(mp3|wav|m4a)$/.test(lower)) return "audio";
  if (/\.(png|jpe?g|gif|webp|svg)$/.test(lower)) return "image";
  if (/\.(zip|rar|7z)$/.test(lower)) return "dataset";
  return "doc";
}

function findSectionLabels(planId: string, sectionId: string) {
  const plan = planById(planId);
  if (!plan) return { sectionTitle: sectionId, chapterTitle: "" };
  for (const ch of plan.chapters) {
    const sec = ch.sections.find((s) => s.id === sectionId);
    if (sec) return { sectionTitle: sec.title, chapterTitle: ch.title };
  }
  return { sectionTitle: sectionId, chapterTitle: "" };
}

export function PlanSectionResourcesPage({
  planId,
  sectionId,
  currentTeacherId,
  onBack,
  onOpenTeachingDesign,
  onOpenResourceLibrary,
}: {
  planId: string;
  sectionId: string;
  currentTeacherId: string;
  onBack: () => void;
  onOpenTeachingDesign: () => void;
  onOpenResourceLibrary?: (resourceId: string) => void;
}) {
  const plan = planById(planId);
  const seed = useMemo(() => planSectionResourcesSeed(planId, sectionId), [planId, sectionId]);
  const [rows, setRows] = useState<PlanSectionResourceItem[]>(() => seed);

  const fileRef = useRef<HTMLInputElement>(null);

  const { sectionTitle, chapterTitle } = useMemo(
    () => findSectionLabels(planId, sectionId),
    [planId, sectionId],
  );

  const forbidden =
    plan &&
    !teacherSeesAllScopedContent(currentTeacherId) &&
    plan.creatorTeacherId !== currentTeacherId;

  const courseName = plan ? courseById(plan.courseId)?.name ?? plan.courseId : "";

  const publish = useCallback((id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "published" as const, updatedAt: new Date().toISOString() } : r,
      ),
    );
  }, []);

  const onPickFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length || !plan) return;
      const ts = Date.now();
      const added: PlanSectionResourceItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i]!;
        const base = f.name.replace(/\.[^/.]+$/, "") || "未命名附件";
        added.push({
          id: `upload-${ts}-${i}-${Math.random().toString(36).slice(2, 8)}`,
          planId,
          sectionId,
          title: base,
          displayName: f.name,
          kind: guessKindFromName(f.name),
          status: "draft",
          uploaderTeacherId: currentTeacherId,
          updatedAt: new Date().toISOString(),
          sizeMb: Math.round((f.size / (1024 * 1024)) * 100) / 100,
        });
      }
      setRows((prev) => [...added, ...prev]);
      e.target.value = "";
    },
    [planId, sectionId, plan, currentTeacherId],
  );

  const sorted = useMemo(() => [...rows].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), [rows]);

  if (!plan) {
    return (
      <div>
        <PageHeader back={onBack} title="本节资源" />
        <div className="p-16 text-center text-slate-500">未找到教学计划 {planId}</div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div>
        <PageHeader back={onBack} title="本节资源" />
        <div className="p-16 text-center text-slate-500">
          当前账号仅可查看本人创建的教学计划相关资料。
        </div>
      </div>
    );
  }

  const teacher = teacherById(plan.creatorTeacherId);

  return (
    <div>
      <PageHeader
        back={onBack}
        title={
          <span className="truncate">
            {sectionTitle}
            <span className="text-slate-400 font-normal"> · 本节资源</span>
          </span>
        }
        actions={
          <button
            type="button"
            onClick={onOpenTeachingDesign}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-sm"
          >
            <Sparkles size={14} />
            智能创建资源
          </button>
        }
      />
      <div className="p-6 space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-wrap gap-3 items-start justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="text-slate-900 font-medium">《{courseName}》</div>
            <div className="text-slate-500 text-sm">
              {chapterTitle && <span>{chapterTitle} · </span>}
              <span>{sectionTitle}</span>
              <span className="text-slate-300 mx-1.5">·</span>
              <span>{plan.semester}</span>
            </div>
            <div className="text-slate-400 text-[0.75rem]">
              主讲 {teacher?.name ?? "—"}
              ：先管理本节已有资源或上传附件；需要 AI 辅助编写讲义 / 课堂 / 作业时再进入教学设计工作台。
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={onPickFiles}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm"
            >
              <Upload size={14} /> 上传附件
            </button>
            <button
              type="button"
              onClick={onOpenTeachingDesign}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 text-sm"
            >
              <PenTool size={14} /> 教学设计工作台
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <FolderOpen size={16} className="text-indigo-600" />
            <span className="text-slate-900 font-medium">课程本节已有资源</span>
            <span className="text-slate-400 text-sm">（{sorted.length}）</span>
          </div>
          {sorted.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 py-14 text-center text-slate-500">
              暂无本节资源。可上传附件，或使用「智能创建资源」进入教学设计。
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
              {sorted.map((r) => (
                <div
                  key={r.id}
                  className="px-4 py-3 flex flex-wrap gap-3 items-start hover:bg-slate-50/80 transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-slate-900 font-medium">{r.title}</div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[0.8125rem] text-slate-500">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <FileUp size={12} className="opacity-70" />
                        {r.displayName}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span>{kindLabel[r.kind]}</span>
                      {typeof r.sizeMb === "number" ? (
                        <>
                          <span className="text-slate-300">·</span>
                          <span>{r.sizeMb} MB</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span
                      className={`text-[0.6875rem] px-2 py-0.5 rounded-full border ${
                        r.status === "published"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-amber-200 bg-amber-50 text-amber-900"
                      }`}
                    >
                      {r.status === "published" ? "已发布" : "草稿"}
                    </span>
                    {r.resourceId && onOpenResourceLibrary ? (
                      <button
                        type="button"
                        className="text-[0.8125rem] px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                        onClick={() => onOpenResourceLibrary(r.resourceId!)}
                      >
                        资源库条目
                      </button>
                    ) : null}
                    {r.status === "draft" ? (
                      <button
                        type="button"
                        className="text-[0.8125rem] px-2.5 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                        onClick={() => publish(r.id)}
                      >
                        发布资源
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
