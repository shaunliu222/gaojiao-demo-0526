import { useMemo } from "react";
import {
  ClipboardList,
  FileText,
  FlaskConical,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import type { ExamEvalSummary, HomeworkEvalSummary } from "@mock";
import { PageHeader } from "../Layout";
import { classById, trainingById } from "../../data/lookups";
import {
  aiPushesByStudent,
  findResumeSectionId,
  getPlanProgressSummary,
  getSectionProgress,
  trainingAssignmentsForStudent,
} from "../../data/studentMock";
import {
  courseNameForPlan,
  findHandoutDesign,
  findPlanSection,
  findSectionIdByKnowledgeNode,
  getExamStudentSummary,
  getHomeworkStudentSummary,
  getStudentExams,
  getStudentHomeworks,
  getStudentPlans,
} from "../../data/learnCenterSession";

function learnHubToneClass(tone: "cheer" | "warn" | "info") {
  if (tone === "warn") return "border-amber-200 bg-amber-50/80 text-amber-900";
  if (tone === "cheer") return "border-emerald-200 bg-emerald-50/80 text-emerald-900";
  return "border-slate-200 bg-white text-slate-800";
}

function LearnCenterHub({
  studentId,
  onEnterClassStudy,
  onEnterHomeworkWorkbench,
  onEnterTrainingWorkbench,
  onEnterExamWeak,
}: {
  studentId: string;
  onEnterClassStudy: (args: {
    planId: string;
    sectionId: string;
    focus: "课堂" | "讲义";
    goalNodeIds?: string[];
  }) => void;
  onEnterHomeworkWorkbench: (homeworkId: string) => void;
  onEnterTrainingWorkbench: (assignmentId: string) => void;
  onEnterExamWeak: (exam: ExamEvalSummary) => void;
}) {
  const plans = useMemo(() => getStudentPlans(studentId), [studentId]);
  const homeworks = useMemo(() => getStudentHomeworks(studentId), [studentId]);
  const exams = useMemo(() => getStudentExams(studentId), [studentId]);
  const trainings = useMemo(() => trainingAssignmentsForStudent(studentId), [studentId]);
  const pushes = aiPushesByStudent[studentId]?.slice(0, 2) ?? [];

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="max-w-5xl mx-auto w-full space-y-8 pb-8">
        {pushes.length > 0 && (
          <section>
            <div className="text-slate-500 text-[0.75rem] mb-2 flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-500" /> AI 学习提示
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {pushes.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-xl border px-4 py-3 ${learnHubToneClass(p.tone)}`}
                >
                  <div className="font-medium text-[0.875rem]">{p.title}</div>
                  <p className="text-[0.8125rem] mt-1 opacity-90 leading-relaxed">{p.summary}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap size={18} className="text-indigo-600" />
            <h2 className="text-slate-900 font-medium">我的课程</h2>
          </div>
          {plans.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
              暂无进行中的班级课程计划
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {plans.map((plan) => {
                const summary = getPlanProgressSummary(studentId, plan.id);
                const denom = Math.max(summary.total, 1);
                const resumeId = findResumeSectionId(studentId, plan);
                const { section: resumeSec } = findPlanSection(plan.id, resumeId);
                const sp = resumeId ? getSectionProgress(studentId, plan.id, resumeId) : undefined;
                const hasHandout = Boolean(resumeId && findHandoutDesign(plan.id, resumeId));
                return (
                  <div
                    key={plan.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-3"
                  >
                    <div>
                      <div className="text-indigo-600 text-[0.6875rem] font-medium">
                        {courseNameForPlan(plan)}
                      </div>
                      <div className="text-slate-900 font-medium mt-0.5">{plan.title}</div>
                      <div className="text-slate-500 text-[0.75rem] mt-2 leading-relaxed">
                        建议学习：{resumeSec?.title ?? "首小节"}
                        {sp?.note ? ` · ${sp.note}` : ""}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
                        <div
                          className="bg-emerald-500 h-full transition-all"
                          style={{ width: `${(summary.mastered / denom) * 100}%` }}
                        />
                        <div
                          className="bg-indigo-400 h-full transition-all"
                          style={{ width: `${(summary.inProgress / denom) * 100}%` }}
                        />
                        <div
                          className="bg-rose-400 h-full transition-all"
                          style={{ width: `${(summary.weak / denom) * 100}%` }}
                        />
                        <div
                          className="bg-slate-200 h-full transition-all"
                          style={{ width: `${(summary.pending / denom) * 100}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[0.6875rem] text-slate-500">
                        <span>已掌握 {summary.mastered}</span>
                        <span>进行中 {summary.inProgress}</span>
                        <span>薄弱 {summary.weak}</span>
                        <span>未开始 {summary.pending}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-auto pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const sectionId = findResumeSectionId(studentId, plan);
                          if (!sectionId) return;
                          const section = findPlanSection(plan.id, sectionId).section;
                          onEnterClassStudy({
                            planId: plan.id,
                            sectionId,
                            focus: "课堂",
                            goalNodeIds: section?.knowledgeNodeIds,
                          });
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-[0.8125rem] hover:bg-indigo-700"
                      >
                        进入课堂
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const sectionId = findResumeSectionId(studentId, plan);
                          if (!sectionId) return;
                          const section = findPlanSection(plan.id, sectionId).section;
                          onEnterClassStudy({
                            planId: plan.id,
                            sectionId,
                            focus: "讲义",
                            goalNodeIds: section?.knowledgeNodeIds,
                          });
                        }}
                        disabled={!hasHandout}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white text-slate-700 px-3 py-1.5 text-[0.8125rem] hover:bg-slate-50 disabled:opacity-45 disabled:pointer-events-none"
                      >
                        按讲义预习
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={18} className="text-indigo-600" />
            <h2 className="text-slate-900 font-medium">收到的作业</h2>
          </div>
          {homeworks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
              本班暂无作业记录
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
              {homeworks.map((hw) => {
                const mine = getHomeworkStudentSummary(studentId, hw);
                const cls = classById(hw.classId);
                return (
                  <div
                    key={hw.id}
                    className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-slate-900 text-[0.875rem] font-medium">{hw.homeworkTitle}</div>
                      <div className="text-slate-500 text-[0.75rem] mt-1">
                        {cls?.name ?? hw.classId} · 布置 {hw.assignedAt} · 截止 {hw.dueAt}
                      </div>
                      <div className="text-slate-600 text-[0.75rem] mt-1">
                        {mine.submitted
                          ? `已提交${mine.totalScore != null ? ` · 得分 ${mine.totalScore}/${hw.maxScore || 100}` : ""}`
                          : "未提交"}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onEnterHomeworkWorkbench(hw.id)}
                      className="shrink-0 inline-flex items-center justify-center rounded-lg bg-indigo-600 text-white px-3 py-1.5 text-[0.8125rem] hover:bg-indigo-700"
                    >
                      作业工作台
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical size={18} className="text-emerald-600" />
            <h2 className="text-slate-900 font-medium">实训任务</h2>
          </div>
          {trainings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
              暂无派发到你所在班级的实训
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
              {trainings.map((ta) => {
                const proj = trainingById(ta.trainingProjectId);
                const cls = classById(ta.classId);
                const st =
                  ta.status === "submitted"
                    ? "已提交"
                    : ta.status === "in_progress"
                      ? "进行中"
                      : "未开始";
                return (
                  <div
                    key={ta.id}
                    className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-slate-900 text-[0.875rem] font-medium">
                        {proj?.name ?? ta.trainingProjectId}
                      </div>
                      <div className="text-slate-500 text-[0.75rem] mt-1">
                        {cls?.name ?? ta.classId} · 布置 {ta.assignedAt}
                        {ta.dueAt ? ` · 截止 ${ta.dueAt}` : ""} · {st}
                      </div>
                      <p className="text-slate-600 text-[0.75rem] mt-1 line-clamp-2">{ta.instruction}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onEnterTrainingWorkbench(ta.id)}
                      className="shrink-0 inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 px-3 py-1.5 text-[0.8125rem] hover:bg-emerald-100"
                    >
                      实训工作台
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileText size={18} className="text-indigo-600" />
            <h2 className="text-slate-900 font-medium">考试</h2>
          </div>
          {exams.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400 text-sm">
              暂无考试安排
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden">
              {exams.map((exam) => {
                const mine = getExamStudentSummary(studentId, exam);
                const tookPlace = exam.submittedCount > 0 && exam.averageScore > 0;
                const canWeak =
                  tookPlace &&
                  mine.submitted &&
                  exam.hotWrongPoints[0] &&
                  getStudentPlans(studentId).some((p) => p.courseId === exam.courseId);
                return (
                  <div
                    key={exam.id}
                    className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-slate-900 text-[0.875rem] font-medium">{exam.examTitle}</div>
                      <div className="text-slate-500 text-[0.75rem] mt-1">考试日 {exam.examAt}</div>
                      <div className="text-slate-600 text-[0.75rem] mt-1">
                        {!tookPlace
                          ? "尚未开考或成绩未出"
                          : mine.submitted
                            ? `已参考${mine.totalScore != null ? ` · 得分 ${mine.totalScore}` : ""}`
                            : "缺考或未录入"}
                      </div>
                    </div>
                    {canWeak ? (
                      <button
                        type="button"
                        onClick={() => onEnterExamWeak(exam)}
                        className="shrink-0 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 px-3 py-1.5 text-[0.8125rem] hover:bg-slate-50"
                      >
                        薄弱点续学
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function LearnCenter({
  studentId,
  onEnterClassStudy,
  onEnterHomeworkWorkbench,
  onEnterTrainingWorkbench,
}: {
  studentId: string;
  onEnterClassStudy: (args: {
    planId: string;
    sectionId: string;
    focus: "课堂" | "讲义";
    goalNodeIds?: string[];
  }) => void;
  onEnterHomeworkWorkbench: (homeworkId: string) => void;
  onEnterTrainingWorkbench: (assignmentId: string) => void;
}) {
  const enterExamWeakFromHub = (exam: ExamEvalSummary) => {
    const plan = getStudentPlans(studentId).find((p) => p.courseId === exam.courseId);
    if (!plan) return;
    const nodeId = exam.hotWrongPoints[0]?.knowledgeNodeId;
    const sectionId =
      findSectionIdByKnowledgeNode(plan, nodeId) ?? findResumeSectionId(studentId, plan);
    if (!sectionId) return;
    const section = findPlanSection(plan.id, sectionId).section;
    onEnterClassStudy({
      planId: plan.id,
      sectionId,
      focus: "课堂",
      goalNodeIds: section?.knowledgeNodeIds,
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader title={<span>学习中心</span>} />
      <LearnCenterHub
        studentId={studentId}
        onEnterClassStudy={onEnterClassStudy}
        onEnterHomeworkWorkbench={onEnterHomeworkWorkbench}
        onEnterTrainingWorkbench={onEnterTrainingWorkbench}
        onEnterExamWeak={enterExamWeakFromHub}
      />
    </div>
  );
}
