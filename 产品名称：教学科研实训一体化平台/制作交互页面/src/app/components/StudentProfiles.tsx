import { ChevronRight, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { students, studentProfiles } from "@mock";
import { classById, studentProfileByStudentId } from "../data/lookups";
import { colorOfCluster } from "../data/graphLayout";
import { nodeById } from "@mock";
import { PageHeader, AiBadge } from "./Layout";

export function StudentDetail({
  id,
  onBack,
  variant = "page",
}: {
  id: string;
  onBack: () => void;
  /** hub：学情主区内嵌，带返回班级画像 */
  variant?: "page" | "hub";
}) {
  const rootCls = variant === "hub" ? "min-w-0" : undefined;
  const s = students.find((x) => x.id === id);
  const p = studentProfileByStudentId(id);
  if (!s) {
    return (
      <div className={rootCls}>
        <PageHeader back={onBack} title="学情分析" />
        <div className="p-16 text-center text-slate-500">未找到学生 {id}</div>
      </div>
    );
  }
  const cls = classById(s.classId);
  if (!p) {
    return (
      <div className={rootCls}>
        <PageHeader
          back={onBack}
          title={
            <span>
              {s.name} · {cls?.name} · {s.studentNo}
            </span>
          }
        />
        <div className="p-16 text-center text-slate-500">
          该学生尚未生成画像，可在班级评价完成后自动生成。
        </div>
      </div>
    );
  }

  const trend = [...p.recentScores].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className={rootCls}>
      <PageHeader
        back={onBack}
        title={
          <span>
            {s.name} · {cls?.name} · {s.studentNo}
          </span>
        }
      />
      <div className="p-6 grid grid-cols-12 gap-4">
        <div className="col-span-4 bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-slate-500 mb-2">基础信息</div>
          <ul className="space-y-1.5 text-slate-700">
            <li>性别 {s.gender}</li>
            <li>班级 {cls?.name ?? "—"}</li>
            <li>学号 {s.studentNo}</li>
            <li>入学 {s.enrollYear} 级</li>
            <li>学习风格 {p.learningStyle}</li>
            <li>课堂活跃度 {p.activity}</li>
          </ul>
          {p.interests.length > 0 && (
            <>
              <div className="text-slate-500 mt-4 mb-1.5">兴趣</div>
              <div className="flex flex-wrap gap-1.5">
                {p.interests.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </>
          )}
          {p.goodAt.length > 0 && (
            <>
              <div className="text-slate-500 mt-4 mb-1.5">擅长</div>
              <div className="flex flex-wrap gap-1.5">
                {p.goodAt.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="col-span-8 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-900">近期成绩</span>
            <span className="text-slate-500 inline-flex items-center gap-1">
              <TrendingUp size={14} /> {trend.length} 次
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-12 bg-white rounded-xl border border-slate-200 p-5">
          <div className="text-slate-900 mb-3">知识点掌握热力图</div>
          <div className="grid grid-cols-2 gap-2">
            {p.masteryHeatmap.map((m) => {
              const node = nodeById[m.knowledgePointId];
              const color = node ? colorOfCluster(node.cluster) : "#94a3b8";
              return (
                <div
                  key={m.knowledgePointId}
                  className="flex items-center gap-3 p-2 border border-slate-200 rounded-lg"
                >
                  <span className="size-2.5 rounded-full" style={{ background: color }} />
                  <span className="flex-1 text-slate-800 truncate">
                    {m.knowledgePointName}
                    {node && (
                      <span className="text-slate-400 ml-1">· {node.cluster}</span>
                    )}
                  </span>
                  <div className="w-40 h-4 bg-slate-100 rounded overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${m.masteryLevel}%`,
                        background: masteryBar(m.masteryLevel),
                      }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-700">{m.masteryLevel}</span>
                </div>
              );
            })}
            {p.masteryHeatmap.length === 0 && (
              <div className="col-span-2 text-slate-400">暂无掌握度数据</div>
            )}
          </div>
        </div>

        <div className="col-span-12 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AiBadge>AI 总结</AiBadge>
          </div>
          <p className="text-slate-700 leading-relaxed whitespace-pre-line">{p.aiSummary}</p>
          <div className="mt-3 flex gap-2">
            <Quick label="查看本班作业评价" />
            <Quick label="查看所在知识图谱节点" />
          </div>
        </div>
      </div>
    </div>
  );
}

function masteryBar(level: number): string {
  if (level >= 85) return "#10b981";
  if (level >= 70) return "#6366f1";
  if (level >= 60) return "#f59e0b";
  return "#f43f5e";
}

function Quick({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-slate-700">
      {label} <ChevronRight size={14} className="text-slate-400" />
    </button>
  );
}

// ensure we exercise the studentProfiles import so linter doesn't complain
export const _allStudentProfilesRef = studentProfiles;
