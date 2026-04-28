import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ClipboardList, MapPin, Paperclip } from "lucide-react";
import { PageHeader } from "../Layout";
import { ReadonlyEvalNarratives } from "../EvalCoopCommon";
import {
  classById,
  graphNodeById,
  homeworkById,
  personaById,
  studentById,
} from "../../data/lookups";
import {
  buildStudentHomeworkTask,
  findPlanSection,
  mockHomeworkCoachReply,
  type ChatRole,
  type LearnCenterAgentMessage,
} from "../../data/learnCenterSession";
import { ShellChatPanel, ShellChatRoleButtons } from "./learnSessionShared";

export function HomeworkWorkbench({
  studentId,
  homeworkId,
  onBack,
}: {
  studentId: string;
  homeworkId: string;
  onBack: () => void;
}) {
  const hw = homeworkById(homeworkId);
  const task = useMemo(
    () => (hw ? buildStudentHomeworkTask(studentId, homeworkId) : null),
    [studentId, homeworkId, hw],
  );
  const student = studentById(studentId);
  const studentRow = hw?.studentResults.find((r) => r.studentId === studentId);
  const cls = hw ? classById(hw.classId) : undefined;

  const goalNodeIds = useMemo(() => {
    if (!hw) return [];
    return Array.from(
      new Set(
        hw.questionAccuracy.map((q) => q.knowledgeNodeId).filter((id): id is string => Boolean(id)),
      ),
    ).slice(0, 6);
  }, [hw]);

  const [activeQ, setActiveQ] = useState(0);
  const [chatRole, setChatRole] = useState<ChatRole>("teacher");
  const [chat, setChat] = useState<LearnCenterAgentMessage[]>([]);
  const [input, setInput] = useState("");

  const [draftByQ, setDraftByQ] = useState<Record<number, string>>({});
  const [submittedDemo, setSubmittedDemo] = useState(false);
  const [attachHint, setAttachHint] = useState<string | null>(null);

  useEffect(() => {
    setDraftByQ({});
    setSubmittedDemo(false);
    setActiveQ(0);
    setAttachHint(null);
  }, [homeworkId]);

  const teacherLabel = personaById("persona-preset-lecturer")?.name ?? "智能教师";

  const send = () => {
    const content = input.trim();
    if (!content) return;
    const baseId = Date.now();
    const peerName = "同学";
    const reply = mockHomeworkCoachReply(content, chatRole, { teacherName: teacherLabel, peerName });
    const replyName =
      chatRole === "teacher"
        ? `${teacherLabel}·教练`
        : chatRole === "assistant"
          ? "作业助教"
          : peerName;
    setChat((prev) => [
      ...prev,
      {
        id: `st-${baseId}`,
        speaker: "student",
        name: student?.name ?? "我",
        content,
      },
      {
        id: `rp-${baseId}`,
        speaker: chatRole,
        name: replyName,
        content: reply,
      },
    ]);
    setInput("");
  };

  if (!hw || !task) {
    return (
      <div className="p-8 text-center text-slate-500">
        未找到作业 <code className="text-xs">{homeworkId}</code>
        <button type="button" onClick={onBack} className="block mx-auto mt-4 text-indigo-600">
          返回
        </button>
      </div>
    );
  }

  const questions = hw.questionAccuracy;
  const attempts = studentRow?.questionAttempts ?? [];
  const qn = Math.max(questions.length, 1);
  const safeQ = Math.min(activeQ, qn - 1);
  const q = questions[safeQ];
  const att = q ? attempts.find((a) => a.questionNo === q.questionNo) : undefined;
  const sectionMeta =
    hw.planId && hw.sectionId ? findPlanSection(hw.planId, hw.sectionId) : null;

  const effectiveSubmitted = task.submitted || submittedDemo;
  const showSubmitFlow = !task.submitted;
  const headerScore =
    task.score ??
    (submittedDemo && studentRow?.totalScore != null ? studentRow.totalScore : undefined);

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader
        title={
          <div className="min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 text-[0.8125rem] text-indigo-600 hover:text-indigo-800 mb-1"
            >
              <ArrowLeft size={14} /> 返回学习中心
            </button>
            <div className="text-slate-900 font-medium truncate">作业工作台 · {hw.homeworkTitle}</div>
            <div className="text-slate-500 text-[0.75rem] mt-0.5">
              {cls?.name ?? hw.classId} · 截止 {hw.dueAt}
              {effectiveSubmitted
                ? ` · 已提交${
                    headerScore != null
                      ? ` ${headerScore}/${task.maxScore}`
                      : submittedDemo
                        ? "（待批阅）"
                        : ""
                  }`
                : " · 未提交"}
            </div>
          </div>
        }
      />

      <div className="flex-1 min-h-0 p-4 overflow-hidden">
        <div className="grid h-full min-h-0 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,6fr)_minmax(0,4fr)] lg:gap-4">
          <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 flex flex-col min-h-0 flex-1 shadow-sm overflow-hidden h-full min-h-[280px] lg:min-h-0">
            {showSubmitFlow && !submittedDemo ? (
              <div className="shrink-0 mb-3 pb-3 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubmittedDemo(true)}
                  className="rounded-lg bg-indigo-600 text-white text-[0.8125rem] font-medium px-4 py-2 hover:bg-indigo-700"
                >
                  提交作业
                </button>
              </div>
            ) : null}

            {hw.planId && hw.sectionId ? (
              <div className="shrink-0 text-[0.75rem] text-slate-600 flex flex-wrap items-start gap-x-2 gap-y-1 mb-3">
                <span className="inline-flex items-center gap-1 text-indigo-700 font-medium">
                  <MapPin size={12} /> {sectionMeta?.section?.title ?? hw.sectionId}
                </span>
                {sectionMeta?.chapterTitle ? (
                  <span className="text-slate-400">· {sectionMeta.chapterTitle}</span>
                ) : null}
                {goalNodeIds.length > 0 ? (
                  <span className="flex flex-wrap gap-1 items-center">
                    {goalNodeIds.map((nid) => {
                      const n = graphNodeById(nid);
                      return (
                        <span
                          key={nid}
                          className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[0.7rem]"
                        >
                          {n?.name ?? nid}
                        </span>
                      );
                    })}
                  </span>
                ) : null}
              </div>
            ) : null}

            {effectiveSubmitted &&
            studentRow &&
            (studentRow.submitted || submittedDemo) &&
            (studentRow.aiEval || studentRow.teacherEval || studentRow.totalScore != null) ? (
              <div className="shrink-0 mb-3">
                <ReadonlyEvalNarratives
                  ai={studentRow.aiEval}
                  teacher={studentRow.teacherEval}
                  scoreFallback={studentRow.totalScore}
                />
              </div>
            ) : null}

            <div className="shrink-0 flex flex-wrap items-center gap-2 mb-2">
              <div className="text-slate-500 text-[0.75rem] flex items-center gap-1.5">
                <ClipboardList size={14} /> 题目
              </div>
              <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                {questions.map((qu, idx) => (
                  <button
                    key={qu.questionNo}
                    type="button"
                    onClick={() => {
                      setActiveQ(idx);
                      setAttachHint(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[0.75rem] border ${
                      idx === safeQ
                        ? "border-indigo-400 bg-indigo-50 text-indigo-800"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    第 {qu.questionNo} 题
                    {studentRow?.questionCorrect?.[idx] === false ? (
                      <span className="text-rose-600 ml-1">×</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-h-[10rem] overflow-y-auto pr-0.5">
              {q ? (
                <>
                  <div className="text-slate-900 font-medium text-[0.9375rem]">{q.title}</div>

                  {effectiveSubmitted && att ? (
                    <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-[0.8125rem] text-slate-700 leading-relaxed">
                      <div className="text-slate-500 text-[0.7rem] mb-1">我的作答（示意）</div>
                      <div className="whitespace-pre-wrap">{att.studentAnswer || "（未录入）"}</div>
                      <div className="mt-2 text-emerald-700 text-[0.75rem]">
                        参考要点：{att.correctAnswer}
                      </div>
                      <div className="mt-1 text-slate-600 text-[0.75rem]">AI 批注：{att.aiComment}</div>
                      <div className="mt-1 text-slate-500 text-[0.7rem]">
                        得分 {att.score}/{att.maxScore}
                      </div>
                    </div>
                  ) : effectiveSubmitted && !att ? (
                    <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-[0.8125rem] text-slate-600">
                      已提交，教师批阅与逐题反馈将在截止后更新。
                    </div>
                  ) : showSubmitFlow ? (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="text-slate-500 text-[0.7rem] block mb-1">本题作答（文字要点或步骤）</label>
                        <textarea
                          value={draftByQ[q.questionNo] ?? ""}
                          onChange={(e) =>
                            setDraftByQ((prev) => ({ ...prev, [q.questionNo]: e.target.value }))
                          }
                          rows={5}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[0.8125rem] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                          placeholder="可写关键步骤、尺寸链或自检结论…"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setAttachHint("已选择本地文件（未实际上传）")}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[0.75rem] text-slate-700 hover:bg-slate-50"
                        >
                          <Paperclip size={14} /> 本地上传
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachHint("已关联实训平台草稿")}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[0.75rem] text-slate-700 hover:bg-slate-50"
                        >
                          实训草稿
                        </button>
                      </div>
                      {attachHint ? (
                        <div className="text-[0.7rem] text-indigo-700 bg-indigo-50/80 rounded-md px-2 py-1.5">
                          {attachHint}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-[0.8125rem] text-slate-600">
                      本题暂无逐题明细。
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
          </div>

          <div className="flex min-h-0 min-w-0 flex-col overflow-hidden h-full min-h-[320px] lg:min-h-0">
            <ShellChatPanel
              stretch
              subtitle="作业教练 · 分步提示，不代做完整答案"
              messages={chat}
              emptyHint="说说卡在第几步、或需要哪条量规的解读；教练会按思路拆解，不直接给可抄答案。"
              inputValue={input}
              onInputChange={setInput}
              onSend={send}
              placeholder="描述卡住的步骤… Cmd+Enter"
              roleSlot={<ShellChatRoleButtons chatRole={chatRole} onRoleChange={setChatRole} />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
