import { useCallback, useMemo, useState } from "react";
import {
  FlaskConical,
  Clock,
  Target,
  CheckCircle2,
  PlayCircle,
  CircleDashed,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  History,
} from "lucide-react";
import { trainingProjects } from "@mock";
import type { TrainingProject } from "@mock";
import { PageHeader, AiBadge } from "../Layout";
import {
  studentById,
  professionById,
} from "../../data/lookups";
import {
  hardwareDevices,
  deviceUsageByStudent,
  aiPushesByStudent,
  getSectionProgress,
  AiPush,
} from "../../data/studentMock";
import { TrainingDevicesPanel } from "./trainingDevicesPanel";

function pushTone(tone: AiPush["tone"]) {
  switch (tone) {
    case "cheer":
      return "from-violet-500 to-indigo-500";
    case "warn":
      return "from-rose-500 to-orange-500";
    default:
      return "from-sky-500 to-indigo-500";
  }
}

// ======== 主组件 ========

export function TrainingLab({
  studentId,
  onOpenTraining,
  onGoLearn,
}: {
  studentId: string;
  onOpenTraining: (id: string) => void;
  onGoLearn: () => void;
}) {
  const student = studentById(studentId);

  // 我的实训项目：按学生班级反查 teachingPlan -> courseIds -> trainingProjects
  const myTrainings = useMemo(() => {
    // 策略：以主线课程 course-mech-draw 为准；扩展时可打开下方注释按所在班级计划推导
    const courseId = "course-mech-draw";
    const related = trainingProjects.filter((t) =>
      t.courseIds.includes(courseId),
    );
    // 非主线课程同学切过来时 fallback 到全部（不至于空白）
    if (related.length === 0) return trainingProjects.slice(0, 6);
    return related;
  }, []);

  const myDeviceUsage = deviceUsageByStudent[studentId] ?? [];
  const pushes = aiPushesByStudent[studentId] ?? [];
  const [pendingOpenDeviceId, setPendingOpenDeviceId] = useState<string | null>(null);
  const clearPendingDevice = useCallback(() => setPendingOpenDeviceId(null), []);

  // 陈浩宇视角：薄弱学情分支
  const isWeakStudent = studentId === "s-mech2302-01";

  const trainingStatus = (t: TrainingProject): {
    label: string;
    progress: number;
    tone: string;
  } => {
    // 用主线小节进度粗略推导训练状态：
    //  - 焦点小节 sec-3-2 已掌握 -> 已完成
    //  - 焦点小节进行中 -> 进行中
    //  - 否则 -> 未开始
    const focus = getSectionProgress(studentId, "plan-main", "sec-3-2");
    if (t.id === "train-m-003") {
      if (focus?.status === "mastered")
        return {
          label: "已完成",
          progress: 1,
          tone: "bg-emerald-50 text-emerald-700",
        };
      if (focus?.status === "in_progress")
        return {
          label: "进行中",
          progress: 0.6,
          tone: "bg-indigo-50 text-indigo-700",
        };
      if (focus?.status === "weak")
        return {
          label: "需要重做",
          progress: 0.3,
          tone: "bg-rose-50 text-rose-700",
        };
      return {
        label: "未开始",
        progress: 0,
        tone: "bg-slate-100 text-slate-600",
      };
    }
    // 其他项目按难度随机但稳定
    const seed = t.id.charCodeAt(t.id.length - 1);
    const r = seed % 3;
    if (r === 0)
      return {
        label: "已完成",
        progress: 1,
        tone: "bg-emerald-50 text-emerald-700",
      };
    if (r === 1)
      return {
        label: "进行中",
        progress: 0.5,
        tone: "bg-indigo-50 text-indigo-700",
      };
    return {
      label: "未开始",
      progress: 0,
      tone: "bg-slate-100 text-slate-600",
    };
  };

  return (
    <div>
      <PageHeader
        title="实训中心"
        actions={
          <span className="text-slate-500">
            {student?.name} · 机械实训资源
          </span>
        }
      />
      <div className="p-6 grid grid-cols-12 gap-4">
        {/* 主区：左 + 中 */}
        <div className="col-span-9 space-y-5">
          {isWeakStudent && (
            <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-orange-50 p-4 flex items-start gap-3">
              <div className="size-9 rounded-lg bg-white/70 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div className="flex-1">
                <div className="text-rose-900">
                  AI 建议：先在「组合体实体模型柜」摸一摸再回来做虚拟实训
                </div>
                <div className="text-rose-700 text-[0.8125rem] mt-1">
                  根据你的作业错题，从实体模型入手比直接从软件学更有效。
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingOpenDeviceId("hw-model-01")}
                className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 shrink-0 inline-flex items-center gap-1 text-[0.8125rem]"
              >
                查看模型柜 <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* 我的实训项目 */}
          <section>
            <SectionHead title="我的实训项目" hint={`${myTrainings.length} 个与我的课程相关`} />
            <div className="grid grid-cols-2 gap-4 mt-3">
              {myTrainings.slice(0, 6).map((t) => {
                const status = trainingStatus(t);
                const prof = professionById(t.professionId);
                return (
                  <button
                    key={t.id}
                    onClick={() => onOpenTraining(t.id)}
                    className="text-left bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-indigo-300 transition flex flex-col"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md ${
                          t.difficulty === "入门"
                            ? "bg-emerald-50 text-emerald-700"
                            : t.difficulty === "进阶"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {t.difficulty}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md ${status.tone}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="text-slate-900 mt-3 flex items-center gap-1.5">
                      <FlaskConical size={14} className="text-emerald-500" />
                      {t.name}
                    </div>
                    <p className="text-slate-500 text-[0.75rem] line-clamp-2 mt-1 leading-relaxed">
                      {t.description}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} /> {t.estimatedHours}h
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Target size={12} /> {t.goals.length} 目标
                      </span>
                      <span className="inline-flex items-center gap-1">
                        {prof?.name ?? "—"}
                      </span>
                    </div>
                    {status.progress > 0 && status.progress < 1 && (
                      <div className="mt-3">
                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                            style={{ width: `${status.progress * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[0.8125rem]">
                      <span className="text-slate-500 inline-flex items-center gap-1">
                        {status.label === "已完成" ? (
                          <CheckCircle2 size={14} className="text-emerald-500" />
                        ) : status.label === "进行中" ? (
                          <PlayCircle size={14} className="text-indigo-500" />
                        ) : (
                          <CircleDashed size={14} className="text-slate-400" />
                        )}
                        <span>
                          {status.label === "已完成"
                            ? "可复盘 / 再做一次"
                            : status.label === "进行中"
                            ? "继续上次进度"
                            : "查看步骤引导"}
                        </span>
                      </span>
                      <span className="text-indigo-600 inline-flex items-center gap-1">
                        预约硬件 <ChevronRight size={14} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <TrainingDevicesPanel
            studentId={studentId}
            pendingOpenDeviceId={pendingOpenDeviceId}
            onPendingOpenHandled={clearPendingDevice}
          />

          {/* 最近使用 */}
          {myDeviceUsage.length > 0 && (
            <section>
              <SectionHead title="我最近的硬件使用" />
              <div className="mt-3 bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-[0.8125rem]">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="text-left px-4 py-2 font-normal">时间</th>
                      <th className="text-left px-4 py-2 font-normal">设备</th>
                      <th className="text-left px-4 py-2 font-normal">任务</th>
                      <th className="text-left px-4 py-2 font-normal">用时</th>
                      <th className="text-left px-4 py-2 font-normal">AI 评分</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myDeviceUsage.map((u, idx) => {
                      const d = hardwareDevices.find((x) => x.id === u.deviceId);
                      return (
                        <tr
                          key={idx}
                          className="border-t border-slate-100 hover:bg-slate-50/70"
                        >
                          <td className="px-4 py-2.5 text-slate-500">
                            {u.startedAt.slice(0, 16).replace("T", " ")}
                          </td>
                          <td className="px-4 py-2.5 text-slate-800">
                            {d?.name ?? u.deviceId}
                          </td>
                          <td className="px-4 py-2.5 text-slate-700">{u.task}</td>
                          <td className="px-4 py-2.5 text-slate-500">
                            {u.durationMinutes} 分钟
                          </td>
                          <td className="px-4 py-2.5">
                            {u.score !== undefined ? (
                              <span
                                className={
                                  u.score >= 85
                                    ? "text-emerald-700"
                                    : u.score >= 70
                                    ? "text-amber-700"
                                    : "text-rose-700"
                                }
                              >
                                {u.score}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        {/* 右：AI 推送 */}
        <aside className="col-span-3 space-y-4">
          <div className="text-slate-500 px-1 flex items-center justify-between">
            <span>AI 推送</span>
            <AiBadge>为你定制</AiBadge>
          </div>
          {pushes.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400">
              暂无推送
            </div>
          ) : (
            pushes.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition"
              >
                <div
                  className={`h-1.5 bg-gradient-to-r ${pushTone(p.tone)}`}
                />
                <div className="p-4">
                  <div className="flex items-start gap-2">
                    <div
                      className={`size-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${pushTone(
                        p.tone,
                      )} text-white`}
                    >
                      <Sparkles size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-900 leading-snug">
                        {p.title}
                      </div>
                      <p className="text-slate-500 text-[0.75rem] mt-1 leading-relaxed">
                        {p.summary}
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-400 text-[0.6875rem] mt-2 inline-flex items-center gap-1">
                    <History size={11} /> {p.reason}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-slate-500 text-[0.75rem]">
                      {p.actionHint}
                    </span>
                    <button
                      onClick={() => {
                        if (p.title.includes("学习")) onGoLearn();
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-[0.75rem]"
                    >
                      {p.actionLabel}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-slate-500 mb-1.5 text-[0.75rem]">
              实训学时汇总
            </div>
            <div className="text-slate-900 text-[1.125rem] leading-tight">
              {myDeviceUsage.reduce(
                (sum, u) => sum + u.durationMinutes,
                0,
              ) / 60 || 0}{" "}
              <span className="text-slate-400 text-[0.75rem]">小时 · 本学期</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[0.75rem] text-slate-500">
              <span>完成实训</span>
              <span className="text-slate-800">
                {myTrainings.filter((t) => trainingStatus(t).label === "已完成").length}
                /{myTrainings.length}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionHead({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-end justify-between">
      <h2 className="text-slate-900 text-[0.9375rem]">{title}</h2>
      {hint && <div className="text-slate-400 text-[0.75rem]">{hint}</div>}
    </div>
  );
}
