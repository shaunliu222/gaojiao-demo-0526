import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  FlaskConical,
  Network,
} from "lucide-react";
import { personas } from "@mock";
import type { Persona } from "@mock";
import { PageHeader, AiBadge } from "../Layout";
import { classById, graphNodeById, planById, studentById, trainingById } from "../../data/lookups";
import {
  mockTrainingCoachReply,
  findPlanSection,
  type ChatRole,
  type LearnCenterAgentMessage,
} from "../../data/learnCenterSession";
import { trainingAssignmentById, type TrainingAssignmentStatus } from "../../data/studentMock";
import { ShellChatPanel, ShellChatRoleButtons } from "./learnSessionShared";

function pickCoachPersonas(): Persona[] {
  const mentor = personas.find((p) => p.id === "persona-preset-lecturer") ?? personas[0];
  const peer: Persona = {
    id: "persona-peer-mentor",
    name: "同伴参考",
    description: "",
    systemPrompt: "",
    isPreset: true,
    scene: "通用",
  };
  return [mentor, peer];
}

function statusLabel(s: TrainingAssignmentStatus): { text: string; tone: string } {
  switch (s) {
    case "submitted":
      return { text: "已提交", tone: "bg-emerald-50 text-emerald-800 border-emerald-200" };
    case "in_progress":
      return { text: "进行中", tone: "bg-indigo-50 text-indigo-800 border-indigo-200" };
    default:
      return { text: "未开始", tone: "bg-slate-50 text-slate-700 border-slate-200" };
  }
}

export function TrainingWorkbench({
  studentId,
  assignmentId,
  onBack,
}: {
  studentId: string;
  assignmentId: string;
  onBack: () => void;
}) {
  const student = studentById(studentId);
  const assignment = trainingAssignmentById(assignmentId);
  const project = assignment ? trainingById(assignment.trainingProjectId) : undefined;
  const cls = assignment ? classById(assignment.classId) : undefined;
  const plan = assignment?.planId ? planById(assignment.planId) : undefined;
  const sectionTitle = useMemo(() => {
    if (!assignment?.planId || !assignment.sectionId) return undefined;
    return findPlanSection(assignment.planId, assignment.sectionId).section?.title;
  }, [assignment?.planId, assignment?.sectionId]);

  const steps = assignment?.stepTitles ?? project?.goals ?? [];
  const [stepDone, setStepDone] = useState<boolean[]>(() => steps.map(() => false));
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<LearnCenterAgentMessage[]>([]);
  const [chatRole, setChatRole] = useState<ChatRole>("teacher");
  const coachPersonas = useMemo(() => pickCoachPersonas(), []);
  const [personaId, setPersonaId] = useState(coachPersonas[0].id);
  const peerName = coachPersonas.find((p) => p.id === "persona-peer-mentor")?.name ?? "同伴";

  if (!assignment || !project) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <PageHeader
          title={
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft size={16} /> 返回
            </button>
          }
        />
        <div className="flex-1 flex items-center justify-center text-slate-500">
          未找到实训派发记录
        </div>
      </div>
    );
  }

  const st = statusLabel(assignment.status);
  const coachName = coachPersonas.find((p) => p.id === personaId)?.name ?? "实训教练";

  const sendCoach = () => {
    const text = input.trim();
    if (!text) return;
    const base = Date.now();
    const replyName =
      chatRole === "teacher" ? coachName : chatRole === "assistant" ? "实训助教" : peerName;
    setChat((c) => [
      ...c,
      {
        id: `st-${base}`,
        speaker: "student",
        name: student?.name ?? "我",
        content: text,
      },
      {
        id: `rp-${base + 1}`,
        speaker: chatRole,
        name: replyName,
        content: mockTrainingCoachReply(text, { peerName }),
      },
    ]);
    setInput("");
  };

  const changeChatRole = (nextRole: ChatRole) => {
    if (nextRole === chatRole) return;
    setChatRole(nextRole);
    setChat([]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader
        title={
          <div className="flex flex-col gap-1 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="self-start inline-flex items-center gap-1 text-[0.8125rem] text-indigo-600 hover:text-indigo-800"
            >
              <ArrowLeft size={14} /> 返回学习中心
            </button>
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <FlaskConical size={18} className="text-emerald-600 shrink-0" />
              <span className="text-slate-900 font-medium truncate">{project.name}</span>
              <span className={`text-[0.6875rem] px-2 py-0.5 rounded-md border ${st.tone}`}>{st.text}</span>
            </div>
          </div>
        }
        actions={
          <span className="text-slate-500 text-[0.8125rem]">
            {student?.name} · {cls?.name ?? assignment.classId}
          </span>
        }
      />

      <div className="flex-1 min-h-0 p-4 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shrink-0">
            <div className="text-slate-500 text-[0.75rem] mb-1">教师派发说明</div>
            <p className="text-slate-800 leading-relaxed">{assignment.instruction}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-[0.75rem] text-slate-500">
              {assignment.assignedAt && <span>布置 {assignment.assignedAt}</span>}
              {assignment.dueAt && <span>截止 {assignment.dueAt}</span>}
              {plan && sectionTitle && (
                <span>
                  关联：{plan.title} · {sectionTitle}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shrink-0">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="text-slate-900 font-medium">实操步骤</div>
              <AiBadge>按勾选记录进度（本地演示）</AiBadge>
            </div>
            <ol className="space-y-2">
              {steps.map((title, idx) => {
                const done = stepDone[idx];
                return (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() =>
                        setStepDone((prev) => {
                          const next = [...prev];
                          next[idx] = !next[idx];
                          return next;
                        })
                      }
                      className={`w-full text-left flex items-start gap-3 rounded-xl border px-3 py-2.5 transition ${
                        done
                          ? "border-emerald-200 bg-emerald-50/60"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Circle size={18} className="text-slate-300 shrink-0 mt-0.5" />
                      )}
                      <span className={`text-[0.875rem] ${done ? "text-emerald-900" : "text-slate-800"}`}>
                        {idx + 1}. {title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <ShellChatPanel
            stretch
            subtitle="实训教练 · 分步与安全提示，不代做实操"
            messages={chat}
            emptyHint="描述你卡在哪一步，或问安全 / 交付物相关的问题。"
            inputValue={input}
            onInputChange={setInput}
            onSend={sendCoach}
            placeholder="提问… Cmd+Enter"
            roleSlot={<ShellChatRoleButtons chatRole={chatRole} onRoleChange={changeChatRole} />}
            belowInput={
              <select
                value={personaId}
                onChange={(e) => setPersonaId(e.target.value)}
                className="w-full rounded-md border border-slate-200/90 bg-white text-[0.75rem] px-2 py-1.5 text-slate-700"
              >
                {coachPersonas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            }
          />

          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 flex gap-2 text-[0.8125rem] text-amber-900 shrink-0">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">安全与现场规范</div>
              <p className="mt-1 opacity-90 leading-relaxed">
                实训前确认图板固定、工具摆放与教材一致；现场安排以教师与实验室管理员说明为准。
              </p>
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-[min(380px,34vw)] shrink-0 flex flex-col gap-4 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-slate-900 font-medium text-[0.875rem] mb-2">交付物（项目要求）</div>
            <ul className="list-disc pl-4 space-y-1 text-[0.8125rem] text-slate-700">
              {project.deliverables.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-sm">
            <div className="text-emerald-900 font-medium text-[0.8125rem] mb-2">绑定实训资源</div>
            <p className="text-[0.8125rem] text-slate-800 leading-relaxed">
              本任务已关联环境与器材：
              <span className="font-medium text-emerald-950"> {project.environment}</span>
              。实验室已按班级派发预留工位与耗材，无需在设备中心再次预约；若现场调整以任课教师说明为准。
            </p>
          </div>

          {project.knowledgeNodeIds.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-slate-500 text-[0.75rem] mb-2 flex items-center gap-1">
                <Network size={14} className="text-indigo-500" /> 关联知识点
              </div>
              <div className="flex flex-wrap gap-1.5">
                {project.knowledgeNodeIds.slice(0, 12).map((nid) => {
                  const n = graphNodeById(nid);
                  return (
                    <span
                      key={nid}
                      className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-800 text-[0.75rem] border border-indigo-100"
                    >
                      {n?.name ?? nid}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
