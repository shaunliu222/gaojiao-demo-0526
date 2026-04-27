import { useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, Search, XCircle } from "lucide-react";
import type { Student, StudentEvalResult } from "@mock";
import { classById, studentById } from "../data/lookups";
import { AiBadge } from "./Layout";

export function scoreInBucketRange(range: string, score: number): boolean {
  if (range === "<60") return score < 60;
  if (range === "60-69") return score >= 60 && score <= 69;
  if (range === "70-79") return score >= 70 && score <= 79;
  if (range === "80-89") return score >= 80 && score <= 89;
  if (range === "90-100") return score >= 90 && score <= 100;
  return true;
}

type Focus =
  | { k: "none" }
  | { k: "range"; range: string }
  | { k: "question"; questionNo: number; title: string; qIndex: number };

type KeyReason = { studentId: string; reason: string };

/**
 * 协同评价 · 作业/考试详情：右侧学情式名单
 */
export function EvalCoopRoster({
  classIds,
  results,
  questionAccuracy,
  rangeFilter,
  onRangeFilter,
  questionFocus,
  onQuestionFocus,
  selectedStudentId,
  onSelectStudent,
  disabled = false,
  disabledMessage,
}: {
  classIds: string | string[];
  results: StudentEvalResult[];
  questionAccuracy: { questionNo: number; title: string }[];
  rangeFilter: string | null;
  onRangeFilter: (r: string | null) => void;
  questionFocus: Focus;
  onQuestionFocus: (f: Focus) => void;
  selectedStudentId: string | null;
  onSelectStudent: (id: string | null) => void;
  disabled?: boolean;
  disabledMessage?: string;
}) {
  const [q, setQ] = useState("");

  const qIndex =
    questionFocus.k === "question" ? questionFocus.qIndex : -1;
  const focusQuestionNo =
    questionFocus.k === "question" ? questionFocus.questionNo : null;
  const focusTitle =
    questionFocus.k === "question" ? questionFocus.title : null;

  const classIdSet = useMemo(
    () =>
      new Set(
        Array.isArray(classIds) ? classIds : [classIds],
      ),
    [classIds],
  );

  const rosterSource = useMemo(() => {
    return results.filter((r) => {
      const s = studentById(r.studentId);
      if (!s || !classIdSet.has(s.classId)) return false;
      if (rangeFilter) {
        if (!r.submitted || r.totalScore == null) return false;
        if (!scoreInBucketRange(rangeFilter, r.totalScore)) return false;
      }
      if (qIndex >= 0) {
        if (!r.submitted) return false;
        if (r.questionCorrect?.[qIndex] !== false) return false;
      }
      return true;
    });
  }, [results, classIdSet, rangeFilter, qIndex]);

  const list = useMemo(() => {
    return rosterSource.filter((r) => {
      if (!q.trim()) return true;
      const s = studentById(r.studentId);
      if (!s) return false;
      const k = q.trim().toLowerCase();
      return (
        s.name.toLowerCase().includes(k) || s.studentNo.toLowerCase().includes(k)
      );
    });
  }, [rosterSource, q]);

  return (
    <aside
      className="w-80 max-lg:max-h-[min(50vh,22rem)] shrink-0 border-l border-slate-200 bg-slate-50/70 flex flex-col min-h-0 lg:h-full lg:max-h-none"
      aria-label="参考学生名单"
    >
      <div className="p-3 border-b border-slate-200/90 bg-white shrink-0">
        <div className="text-xs text-slate-500 mb-2">参考学生</div>
        {disabled && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5 mb-2">
            {disabledMessage ?? "当前暂不可筛选"}
          </p>
        )}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-1.5 w-full">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索姓名/学号"
            className="w-full min-w-0 text-sm outline-none"
          />
        </div>
        {!disabled && (rangeFilter != null || focusQuestionNo != null) && (
          <div className="mt-2 flex flex-wrap gap-1.5 text-[0.7rem]">
            {rangeFilter != null && (
              <button
                type="button"
                className="px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100"
                onClick={() => onRangeFilter(null)}
              >
                取消分段「{rangeFilter}」
              </button>
            )}
            {focusQuestionNo != null && (
              <button
                type="button"
                className="px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100"
                onClick={() => onQuestionFocus({ k: "none" })}
              >
                取消题目 Q{focusQuestionNo}
              </button>
            )}
          </div>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 space-y-1">
        {list.map((r) => {
          const s = studentById(r.studentId) as Student | undefined;
          if (!s) return null;
          const active = selectedStudentId === s.id;
          const cls = classById(s.classId);
          const res = r;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() =>
                onSelectStudent(active ? null : s.id)
              }
              className={`w-full text-left rounded-lg border px-2.5 py-2 text-sm transition ${
                active
                  ? "border-indigo-300 bg-indigo-50/90 shadow-sm"
                  : "border-slate-200/90 bg-white hover:border-indigo-200 hover:bg-indigo-50/40"
              }`}
            >
              <div className="flex items-start gap-2">
                <div
                  className={`size-8 rounded-full flex items-center justify-center text-white text-xs shrink-0 ${
                    s.gender === "男"
                      ? "bg-gradient-to-br from-blue-400 to-indigo-500"
                      : "bg-gradient-to-br from-pink-400 to-rose-500"
                  }`}
                >
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 flex items-center gap-1">
                    {s.name}
                    {cls && (Array.isArray(classIds) && classIds.length > 1) && (
                      <span className="text-xs font-normal text-slate-400">
                        {cls.name}
                      </span>
                    )}
                  </div>
                  <div className="text-slate-500 text-xs font-mono tabular-nums mt-0.5 truncate">
                    {s.studentNo}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                    {!res.submitted && <span className="text-slate-400">未提交</span>}
                    {res.submitted && res.totalScore != null && qIndex < 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          res.totalScore >= 90
                            ? "bg-emerald-50 text-emerald-700"
                            : res.totalScore >= 60
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        卷面 {res.totalScore}
                      </span>
                    )}
                    {qIndex >= 0 && focusTitle && res.submitted && (
                      <span
                        className={
                          res.questionCorrect?.[qIndex] === false
                            ? "text-rose-600 font-medium"
                            : "text-slate-500"
                        }
                      >
                        {`Q${focusQuestionNo} · ${res.questionCorrect?.[qIndex] === false ? "错" : "对"}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
        {list.length === 0 && !disabled && (
          <div className="p-4 text-center text-slate-400 text-sm">
            {q.trim() ? "无匹配学生" : "当前筛选项下无学生"}
          </div>
        )}
      </div>
    </aside>
  );
}

function gradeLabel(score: number | undefined) {
  if (score == null) return { text: "未评分", cls: "bg-slate-100 text-slate-500" };
  if (score >= 90) return { text: "优秀", cls: "bg-emerald-50 text-emerald-700" };
  if (score >= 80) return { text: "良好", cls: "bg-indigo-50 text-indigo-700" };
  if (score >= 60) return { text: "及格", cls: "bg-amber-50 text-amber-700" };
  return { text: "待帮扶", cls: "bg-rose-50 text-rose-700" };
}

export function EvalStudentSheet({
  studentId,
  results,
  questionAccuracy,
  keyReasons,
  title = "本卷",
  submittedAt,
  onBack,
}: {
  studentId: string;
  results: StudentEvalResult[];
  questionAccuracy: { questionNo: number; title: string; knowledgeNodeId?: string }[];
  keyReasons: KeyReason[];
  title?: string;
  submittedAt: string;
  onBack: () => void;
}) {
  const s = studentById(studentId);
  const res = results.find((r) => r.studentId === studentId);
  if (!s || !res) {
    return (
      <div className="p-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600"
        >
          <ChevronLeft size={16} /> 返回总览
        </button>
        <div className="mt-6 p-8 rounded-xl border border-slate-200 bg-white text-slate-500 text-center">
          未找到该生记录
        </div>
      </div>
    );
  }
  const cls = classById(s.classId);
  if (!res.submitted) {
    return (
      <div className="p-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600"
        >
          <ChevronLeft size={16} /> 返回总览
        </button>
        <div className="mt-6 p-8 rounded-xl border border-slate-200 bg-white">
          <div className="text-slate-900 font-medium">{s.name} · {title}</div>
          <p className="text-xs text-slate-500 mt-1 font-mono">{s.studentNo}</p>
          <p className="mt-4 text-slate-500">暂无成绩（未提交或缺考）。</p>
        </div>
      </div>
    );
  }
  const note = keyReasons.find((k) => k.studentId === studentId)?.reason;
  const grade = gradeLabel(res.totalScore);
  const attempts = res.questionAttempts;
  /** 错题优先，同组内按题号升序 */
  const attemptList = [...(attempts ?? [])];
  attemptList.sort((a, b) => {
    const wrongA = a.score < a.maxScore;
    const wrongB = b.score < b.maxScore;
    if (wrongA !== wrongB) return wrongA ? -1 : 1;
    return a.questionNo - b.questionNo;
  });

  let fallbackRows: { q: (typeof questionAccuracy)[0]; ok: boolean }[] = [];
  if (res.questionCorrect && questionAccuracy.length > 0) {
    fallbackRows = questionAccuracy.map((q, i) => ({
      q,
      ok: res.questionCorrect![i] ?? true,
    }));
    fallbackRows.sort((a, b) => {
      if (a.ok !== b.ok) return a.ok ? 1 : -1;
      return a.q.questionNo - b.q.questionNo;
    });
  }
  return (
    <div className="space-y-4">
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 mb-2"
        >
          <ChevronLeft size={16} /> 返回总览
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`size-11 rounded-full flex items-center justify-center text-white text-sm shrink-0 ${
                s.gender === "男"
                  ? "bg-gradient-to-br from-blue-400 to-indigo-500"
                  : "bg-gradient-to-br from-pink-400 to-rose-500"
              }`}
            >
              {s.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-lg font-medium text-slate-900 truncate">
                {s.name} · {title}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {s.studentNo}
                {cls ? ` · ${cls.name}` : ""}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {res.totalScore != null && (
              <span className="px-3 py-1 rounded-lg bg-slate-900 text-white">
                总分 {res.totalScore}
              </span>
            )}
            <span className={`px-3 py-1 rounded-lg ${grade.cls}`}>
              {grade.text}
            </span>
            <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600">
              提交 {submittedAt}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-4">
        {note && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 text-indigo-700">
            <div className="flex items-center gap-2 mb-1">
              <AiBadge />
              <span className="text-sm font-medium">教师重点备注</span>
            </div>
            <p className="text-sm leading-relaxed">{note}</p>
          </div>
        )}

        {attemptList.map((a) => {
          const q = questionAccuracy.find((item) => item.questionNo === a.questionNo);
          const ok = a.score >= a.maxScore;
          return (
            <section
              key={a.questionNo}
              className={`rounded-xl border overflow-hidden ${
                ok
                  ? "bg-white border-slate-200"
                  : "bg-rose-50/40 border-rose-300 ring-1 ring-rose-200/80 shadow-sm border-l-4 border-l-rose-500"
              }`}
            >
              <div
                className={`px-5 py-3 border-b flex items-center justify-between gap-3 ${
                  ok ? "border-slate-100" : "border-rose-200/90 bg-rose-50/60"
                }`}
              >
                <div className="min-w-0">
                  <div
                    className={`font-medium truncate ${
                      ok ? "text-slate-900" : "text-rose-900"
                    }`}
                  >
                    Q{a.questionNo} · {q?.title ?? `第 ${a.questionNo} 题`}
                    {!ok && (
                      <span className="ml-2 text-xs font-normal text-rose-600">
                        未得满分
                      </span>
                    )}
                  </div>
                  {a.knowledgeNodeId && (
                    <div className="text-xs text-slate-400 mt-0.5">
                      知识点 {a.knowledgeNodeId}
                    </div>
                  )}
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm shrink-0 ${
                    ok
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-100 text-rose-800 border border-rose-200"
                  }`}
                >
                  {ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  得分 {a.score}/{a.maxScore}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3 p-5 lg:grid-cols-2">
                <div
                  className={`rounded-lg p-4 border ${
                    ok
                      ? "bg-slate-50 border-slate-100"
                      : "bg-rose-50/90 border-rose-200"
                  }`}
                >
                  <div
                    className={`text-xs mb-2 ${
                      ok ? "text-slate-500" : "text-rose-700 font-medium"
                    }`}
                  >
                    学生答案
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${
                      ok ? "text-slate-700" : "text-rose-900"
                    }`}
                  >
                    {a.studentAnswer}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-50/70 border border-emerald-100 p-4">
                  <div className="text-xs text-emerald-700 mb-2">参考答案</div>
                  <p className="text-sm text-emerald-900 leading-relaxed">
                    {a.correctAnswer}
                  </p>
                </div>
              </div>
              <div
                className={`mx-5 mb-5 rounded-lg border p-3 ${
                  ok
                    ? "bg-indigo-50/70 border-indigo-100"
                    : "bg-rose-50/80 border-rose-200"
                }`}
              >
                <div
                  className={`flex items-center gap-2 mb-1 ${
                    ok ? "" : "text-rose-800"
                  }`}
                >
                  <AiBadge />
                  <span
                    className={`text-xs ${
                      ok ? "text-indigo-700" : "text-rose-800"
                    }`}
                  >
                    AI 批注
                  </span>
                </div>
                <p
                  className={`text-sm leading-relaxed ${
                    ok ? "text-indigo-800" : "text-rose-900"
                  }`}
                >
                  {a.aiComment}
                </p>
              </div>
            </section>
          );
        })}

        {!attempts?.length && res.questionCorrect && questionAccuracy.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="text-slate-900 mb-3">逐题结果</div>
            <p className="text-xs text-slate-500 mb-3">错题已置顶展示</p>
            <ul className="space-y-2 text-sm text-slate-700">
              {fallbackRows.map(({ q, ok }) => (
                <li
                  key={q.questionNo}
                  className={`flex justify-between gap-3 rounded-lg px-3 py-2 border ${
                    ok
                      ? "border-slate-100 bg-white"
                      : "border-rose-200 bg-rose-50/60 text-rose-900"
                  }`}
                >
                  <span>
                    Q{q.questionNo} {q.title}
                  </span>
                  <span
                    className={
                      ok
                        ? "text-emerald-600 font-medium"
                        : "text-rose-700 font-medium"
                    }
                  >
                    {ok ? "对" : "错"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export type { Focus };
