import { useMemo, useState } from "react";
import {
  Search,
  Film,
  FileText,
  Image as ImageIcon,
  Music,
  Code2,
  Database,
  ListChecks,
  Sparkles,
  Filter,
} from "lucide-react";
import { resources, professions } from "@mock";
import type { ResourceType } from "@mock";
import { teacherById, professionById } from "../data/lookups";
import { PageHeader, AiBadge } from "./Layout";

const TYPE_OPTIONS: { value: ResourceType | "all"; label: string }[] = [
  { value: "all", label: "全部类型" },
  { value: "doc", label: "文档" },
  { value: "ppt", label: "课件" },
  { value: "video", label: "视频" },
  { value: "audio", label: "音频" },
  { value: "image", label: "图片" },
  { value: "code", label: "代码" },
  { value: "dataset", label: "数据集" },
  { value: "quiz", label: "题库" },
];

export function ResourceLibrary({ onOpen }: { onOpen: (id: string) => void }) {
  const [typeFilter, setTypeFilter] = useState<ResourceType | "all">("all");
  const [profFilter, setProfFilter] = useState<string>("all");
  const [aiOnly, setAiOnly] = useState<boolean>(false);
  const [q, setQ] = useState<string>("");

  const list = useMemo(() => {
    return resources.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (profFilter !== "all" && r.professionId !== profFilter) return false;
      if (aiOnly && !r.isAiGenerated) return false;
      if (q.trim()) {
        const k = q.trim().toLowerCase();
        if (
          !r.title.toLowerCase().includes(k) &&
          !r.description.toLowerCase().includes(k) &&
          !r.tags.some((t) => t.toLowerCase().includes(k))
        ) {
          return false;
        }
      }
      return true;
    });
  }, [typeFilter, profFilter, aiOnly, q]);

  const typeStats = useMemo(() => {
    const out: Record<string, number> = {};
    for (const r of resources) out[r.type] = (out[r.type] ?? 0) + 1;
    return out;
  }, []);

  return (
    <div>
      <PageHeader
        title="教学资源库"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1 w-56">
              <Search size={14} className="text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="搜索标题/描述/标签"
                className="w-full outline-none"
              />
            </div>
            <button
              onClick={() => setAiOnly((v) => !v)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md border ${
                aiOnly
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Sparkles size={14} /> 仅看 AI 生成
            </button>
          </div>
        }
      />
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={14} className="text-slate-500" />
            <span className="text-slate-500">筛选</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-wrap gap-1.5">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTypeFilter(opt.value)}
                  className={`px-2.5 py-1 rounded-md transition ${
                    typeFilter === opt.value
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {opt.label}
                  {opt.value !== "all" && typeStats[opt.value] != null && (
                    <span className="ml-1 opacity-70">
                      ({typeStats[opt.value] ?? 0})
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setProfFilter("all")}
                className={`px-2.5 py-1 rounded-md transition ${
                  profFilter === "all"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                全部专业
              </button>
              {professions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProfFilter(p.id)}
                  className={`px-2.5 py-1 rounded-md transition ${
                    profFilter === p.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-slate-500 mb-3">共 {list.length} 个资源</div>
        <div className="grid grid-cols-4 gap-4">
          {list.map((r) => {
            const uploader = teacherById(r.uploaderTeacherId);
            const prof = professionById(r.professionId);
            return (
              <button
                key={r.id}
                onClick={() => onOpen(r.id)}
                className="text-left bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-indigo-300 hover:shadow-md transition"
              >
                <div className="h-28 relative bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <ResIcon type={r.type} size={32} />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/80 backdrop-blur text-slate-700 uppercase">
                    {r.type}
                  </span>
                  {r.isAiGenerated && (
                    <span className="absolute top-2 right-2">
                      <AiBadge>AI</AiBadge>
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-slate-900 truncate">{r.title}</div>
                  <div className="text-slate-500 truncate mt-0.5">
                    {prof?.name} · {uploader?.name ?? "—"}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-slate-400">
                    {r.duration && <span>{r.duration}</span>}
                    {r.sizeMb != null && <span>{r.sizeMb} MB</span>}
                    <span className="ml-auto">{r.uploadedAt.slice(0, 10)}</span>
                  </div>
                  {r.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {r.tags.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
          {list.length === 0 && (
            <div className="col-span-4 p-12 text-center text-slate-400">
              未找到符合条件的资源
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResIcon({ type, size = 14 }: { type: ResourceType; size?: number }) {
  switch (type) {
    case "video":
      return <Film size={size} className="text-rose-500" />;
    case "audio":
      return <Music size={size} className="text-rose-400" />;
    case "image":
      return <ImageIcon size={size} className="text-sky-500" />;
    case "code":
      return <Code2 size={size} className="text-violet-500" />;
    case "dataset":
      return <Database size={size} className="text-emerald-500" />;
    case "quiz":
      return <ListChecks size={size} className="text-amber-500" />;
    case "ppt":
      return <FileText size={size} className="text-orange-500" />;
    default:
      return <FileText size={size} className="text-indigo-500" />;
  }
}
