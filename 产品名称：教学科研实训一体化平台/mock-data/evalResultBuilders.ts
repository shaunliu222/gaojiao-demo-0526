/**
 * 为作业/考试评价汇总行生成逐学生、逐题假数据，供协同评价详情页与汇总字段大致对齐（Demo 级）
 */

import type { Student } from "./types";
import type {
  EvalTierTag,
  HomeworkEvalInput,
  HomeworkEvalSummary,
  ExamEvalInput,
  ExamEvalSummary,
  QuestionAttempt,
  StudentEvalNarrative,
  StudentEvalResult,
} from "./types";
import { students } from "./students";

function idHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** 与协同评价 UI 卷面等级分界一致 */
function tierFromScore(score: number): EvalTierTag {
  if (score >= 90) return "excellent";
  if (score >= 80) return "good";
  if (score >= 60) return "pass";
  return "fail";
}

function wrongQuestionCount(row: StudentEvalResult): number {
  if (row.questionAttempts?.length) {
    return row.questionAttempts.filter((a) => a.score < a.maxScore).length;
  }
  if (row.questionCorrect?.length) {
    return row.questionCorrect.filter((x) => x === false).length;
  }
  return 0;
}

function questionTotalCount(row: StudentEvalResult): number {
  if (row.questionAttempts?.length) return row.questionAttempts.length;
  if (row.questionCorrect?.length) return row.questionCorrect.length;
  return 0;
}

function buildAiEvalForRow(row: StudentEvalResult): StudentEvalNarrative {
  const score = row.totalScore ?? 0;
  const tier = tierFromScore(score);
  const wrongQ = wrongQuestionCount(row);
  const totalQ = questionTotalCount(row);
  const wrongHint =
    totalQ > 0 && wrongQ > 0
      ? ` 本次共 ${totalQ} 题，其中 ${wrongQ} 题未得满分。`
      : "";
  const body =
    tier === "excellent"
      ? `卷面表现优秀，整体掌握扎实。${wrongHint || " 继续保持当前学习节奏。"}`
      : tier === "good"
        ? `整体良好，主要知识点基本到位。${wrongHint || " 可对易错点做针对性回顾。"}`
        : tier === "pass"
          ? `已达到及格要求，基础尚可巩固。${wrongHint || " 建议补齐薄弱章节并完成同类练习。"}`
          : `本次未达及格线，需加强基础训练。${wrongHint || " 建议先回顾核心概念与例题，再重练同类题。"}`;
  return { tier, comment: body.trim() };
}

/** 与 homeworks 中 scoreBuckets 的 range 字符串一致 */
const BUCKET_RANGES = ["90-100", "80-89", "70-79", "60-69", "<60"] as const;

function bucketIndexFromRange(r: string): number {
  const i = BUCKET_RANGES.findIndex((x) => x === r);
  return i < 0 ? 0 : i;
}

function scoreRangeForBucket(
  range: string,
  gMin: number,
  gMax: number,
): [number, number] {
  if (range === "<60") {
    return [gMin, Math.min(59, gMax)];
  }
  if (range === "60-69") return [Math.max(60, gMin), Math.min(69, gMax)];
  if (range === "70-79") return [Math.max(70, gMin), Math.min(79, gMax)];
  if (range === "80-89") return [Math.max(80, gMin), Math.min(89, gMax)];
  if (range === "90-100") {
    return [Math.max(90, gMin), Math.min(100, gMax)];
  }
  return [gMin, gMax];
}

/** 生成按桶计数展开的桶 id 序列表，并做轻量乱序以分散同分段 */
function buildBucketOrder(
  scoreBuckets: { range: string; count: number }[],
  seed: string,
): number[] {
  const out: number[] = [];
  for (let b = 0; b < BUCKET_RANGES.length; b++) {
    const range = BUCKET_RANGES[b]!;
    const found = scoreBuckets.find((x) => x.range === range);
    const c = found?.count ?? 0;
    for (let k = 0; k < c; k++) out.push(b);
  }
  const h0 = idHash(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = (h0 + i * 11) % (i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function pickWrongIndices(
  n: number,
  wrongCount: number,
  q: number,
  seed: string,
): number[] {
  if (n <= 0 || wrongCount <= 0) return [];
  const w = Math.min(n, wrongCount);
  const arr = Array.from({ length: n }, (_, i) => i);
  const h = idHash(`${seed}::q${q}`);
  arr.sort(
    (a, b) =>
      ((a * 31 + h + q) % 997) - ((b * 31 + h + q) % 997),
  );
  return arr.slice(0, w);
}

function buildQuestionCorrects(
  n: number,
  questionAcc: { accuracy: number }[],
  seed: string,
): boolean[][] {
  const nQ = questionAcc.length;
  const perQ: boolean[][] = Array.from(
    { length: nQ },
    () => Array<boolean>(n).fill(true),
  );
  for (let q = 0; q < nQ; q++) {
    const acc = questionAcc[q]!.accuracy;
    const wr = Math.min(n, Math.max(0, Math.round((1 - acc) * n)));
    const wrongI = pickWrongIndices(n, wr, q, seed + `::q${q}`);
    for (const i of wrongI) {
      if (i < n) perQ[q]![i] = false;
    }
  }
  return perQ;
}

function perStudentCorrectFromColumns(
  perQ: boolean[][],
  n: number,
  nQ: number,
): boolean[][] {
  const rows: boolean[][] = [];
  for (let i = 0; i < n; i++) {
    const r: boolean[] = [];
    for (let q = 0; q < nQ; q++) {
      r.push(perQ[q]![i]!);
    }
    rows.push(r);
  }
  return rows;
}

type QuestionMeta = {
  questionNo: number;
  title: string;
  knowledgeNodeId?: string;
};

type AttemptTemplate = {
  maxScore: number;
  correctAnswer: string;
  correctAnswers: string[];
  wrongAnswers: string[];
  correctComments: string[];
  wrongComments: string[];
  partialScores: number[];
};

const HW_M_003_ATTEMPTS: Record<number, AttemptTemplate> = {
  1: {
    maxScore: 10,
    correctAnswer: "应识别该组合体以叠加、切割为主，局部存在相切过渡关系。",
    correctAnswers: [
      "该组合体主要由底板、立柱和肋板叠加形成，并存在局部切割特征。",
      "采用形体分析法，可分为底板、圆柱凸台、支架肋板三部分，连接处有相切过渡。",
    ],
    wrongAnswers: [
      "将整体看成单一回转体，未拆分底板和支架结构。",
      "只判断为简单叠加，忽略了圆柱切割和过渡关系。",
    ],
    correctComments: [
      "形体拆分完整，能为后续三视图投影建立清晰结构。",
      "构成方式判断准确，说明空间分解能力较稳定。",
    ],
    wrongComments: [
      "形体分析不充分，后续轮廓线和可见性判断容易连锁失分。",
      "建议先按基本体分块，再判断叠加、切割、相切三类关系。",
    ],
    partialScores: [4, 5],
  },
  2: {
    maxScore: 10,
    correctAnswer: "应先拆基本体，再按主视方向逐一投影并校核长对正、高平齐、宽相等。",
    correctAnswers: [
      "先分解为底板、圆柱座、肋板，再按三投影规律逐块组合。",
      "使用形体分析法从主视图入手，三视图对应关系保持一致。",
    ],
    wrongAnswers: [
      "直接照着立体图描外轮廓，未按基本体逐块投影。",
      "主视图和俯视图分别绘制，缺少长对正、宽相等校核。",
    ],
    correctComments: [
      "解题步骤清楚，投影对应关系控制较好。",
      "能使用形体分析法拆解复杂结构，步骤具备可复用性。",
    ],
    wrongComments: [
      "作答方法偏经验描摹，建议用辅助线逐块校核投影关系。",
      "三视图对应关系薄弱，需回到基本投影规律进行复盘。",
    ],
    partialScores: [4, 6],
  },
  3: {
    maxScore: 12,
    correctAnswer: "轴承座三视图需完整表达圆柱孔、底板轮廓、可见线与不可见线。",
    correctAnswers: [
      "主视图完整表达轴承座外形与孔位，俯视图保留圆柱孔投影，侧视图线型正确。",
      "三视图中孔轴线、底板边界、圆柱台阶均对应准确。",
    ],
    wrongAnswers: [
      "俯视图遗漏圆柱孔中心线，侧视图孔轮廓未用虚线表达。",
      "主视图底板高度正确，但圆柱孔投影位置偏移。",
    ],
    correctComments: [
      "关键轮廓和孔位关系表达完整，线型选择较规范。",
      "孔、台阶、底板三类结构对应准确，读图能力较好。",
    ],
    wrongComments: [
      "孔位投影与线型规范是主要失分点，需加强轴线和虚线表达。",
      "建议先定位孔中心线，再补轮廓线，避免局部错位。",
    ],
    partialScores: [5, 7],
  },
  4: {
    maxScore: 12,
    correctAnswer: "支架三视图需体现肋板厚度、孔位中心线，并按定形/定位/总体尺寸分层标注。",
    correctAnswers: [
      "支架肋板厚度、孔位中心线表达完整，尺寸标注按定形、定位、总体三层组织。",
      "三视图中肋板轮廓对应准确，尺寸没有重复标注。",
    ],
    wrongAnswers: [
      "肋板厚度在侧视图中表达不清，尺寸标注出现重复。",
      "孔位中心线遗漏，定位尺寸和总体尺寸混在一起。",
    ],
    correctComments: [
      "图形表达和尺寸层次都较清晰，已具备规范制图意识。",
      "支架结构识读准确，尺寸组织符合工程图基本要求。",
    ],
    wrongComments: [
      "尺寸标注层级不清，建议先标定形尺寸，再补定位和总体尺寸。",
      "支架肋板表达不完整，会影响读图者判断真实结构。",
    ],
    partialScores: [5, 6],
  },
  5: {
    maxScore: 14,
    correctAnswer: "连接座综合绘制应完整处理底板、立柱、孔、圆角过渡，并保持三视图对应。",
    correctAnswers: [
      "连接座底板、立柱、孔和圆角过渡均表达完整，三视图对应关系正确。",
      "综合视图结构完整，过渡线处理自然，尺寸与轮廓没有明显冲突。",
    ],
    wrongAnswers: [
      "连接座底板与立柱过渡处画成直角，圆角过渡线遗漏。",
      "立柱位置在俯视图中偏移，导致三视图宽度对应错误。",
    ],
    correctComments: [
      "综合题完成度高，能兼顾结构识别与工程表达规范。",
      "过渡关系处理较成熟，说明组合体空间想象较稳定。",
    ],
    wrongComments: [
      "综合绘制中忽略工艺过渡，是本题主要扣分点。",
      "建议先锁定立柱中心线，再处理底板与圆角细节。",
    ],
    partialScores: [5, 8],
  },
  6: {
    maxScore: 10,
    correctAnswer: "读图时应由已知两视图反推空间形体，再补第三视图关键轮廓。",
    correctAnswers: [
      "根据主、俯两视图反推空间结构，补出的侧视图轮廓与孔位一致。",
      "能通过对应关系判断凹槽与孔的位置，第三视图补线完整。",
    ],
    wrongAnswers: [
      "将凹槽判断为凸台，补出的侧视图方向相反。",
      "只补外轮廓，未补孔位和局部不可见线。",
    ],
    correctComments: [
      "读图推理过程正确，能从二维视图还原空间结构。",
      "第三视图补全较完整，线型表达基本规范。",
    ],
    wrongComments: [
      "空间反推方向出现偏差，需用简单模型辅助理解凹凸关系。",
      "补线时缺少孔位和隐含轮廓，建议按结构逐层检查。",
    ],
    partialScores: [4, 6],
  },
  7: {
    maxScore: 16,
    correctAnswer: "截交线应根据切平面与回转体相交关系确定，并投影到所有相关视图。",
    correctAnswers: [
      "识别出斜切圆柱产生截交线，并在主视、俯视中完整表达其投影。",
      "截交线形态判断正确，关键控制点位置清晰。",
    ],
    wrongAnswers: [
      "把截交线画成普通轮廓线，俯视图中未形成完整投影。",
      "只在主视图画出斜切边，遗漏其他视图中的截交线。",
    ],
    correctComments: [
      "能抓住「平面切割回转体」这一触发条件，截交线表达较完整。",
      "控制点和投影关系处理准确，是本次作业的关键亮点。",
    ],
    wrongComments: [
      "截交线触发条件掌握不牢，建议结合 3D 切割模型重新观察投影变化。",
      "只画可见轮廓而忽略截交线在多视图中的对应，是典型失分原因。",
    ],
    partialScores: [3, 6],
  },
  8: {
    maxScore: 16,
    correctAnswer: "相贯线应按两回转体轴线关系确定走向，不能简单画成圆弧或直线。",
    correctAnswers: [
      "判断为两圆柱正交相贯，相贯线走向和对称关系表达正确。",
      "相贯线位置与圆柱轴线关系匹配，未误画成规则圆弧。",
    ],
    wrongAnswers: [
      "将两圆柱相贯线画成简单圆弧，未体现非圆曲线特征。",
      "只画交界轮廓，未根据轴线关系确定相贯线走向。",
    ],
    correctComments: [
      "相贯线形态判断准确，能避免机械套用圆弧画法。",
      "能结合轴线正交关系判断曲线走向，空间关系理解较好。",
    ],
    wrongComments: [
      "相贯线不能简化为圆弧，需通过辅助点或投影规律确定走向。",
      "建议加强两回转体相贯的典型例题训练。",
    ],
    partialScores: [4, 7],
  },
};

function genericAttemptTemplate(
  q: QuestionMeta,
  maxScore: number,
): AttemptTemplate {
  return {
    maxScore,
    correctAnswer: `围绕「${q.title}」完整作答，关键步骤、结论与规范表达均正确。`,
    correctAnswers: [
      `对「${q.title}」的关键概念判断准确，答案结构完整。`,
      `能够抓住题干要求，按步骤完成「${q.title}」。`,
    ],
    wrongAnswers: [
      `对「${q.title}」的核心条件判断不完整，结论存在偏差。`,
      `作答覆盖了部分要点，但关键步骤遗漏，导致结果不准确。`,
    ],
    correctComments: [
      "AI 判定：本题作答完整，关键依据清晰，表达较规范。",
      "AI 判定：知识点掌握稳定，可进入更高阶综合题训练。",
    ],
    wrongComments: [
      "AI 判定：本题主要问题是关键条件识别不足，建议回看对应知识点。",
      "AI 判定：答案有部分合理思路，但缺少必要论证或规范表达。",
    ],
    partialScores: [Math.max(1, Math.round(maxScore * 0.35)), Math.max(1, Math.round(maxScore * 0.55))],
  };
}

function maxScoresForQuestions(evalId: string, nQ: number): number[] {
  if (evalId === "hw-m-003" && nQ === 8) {
    return [10, 10, 12, 12, 14, 10, 16, 16];
  }
  if (nQ <= 0) return [];
  const base = Math.floor(100 / nQ);
  const out = Array.from({ length: nQ }, () => base);
  out[nQ - 1] += 100 - base * nQ;
  return out;
}

function buildQuestionAttempts(
  evalId: string,
  studentId: string,
  questions: QuestionMeta[],
  corrects: boolean[] | undefined,
): QuestionAttempt[] | undefined {
  if (!corrects || questions.length === 0) return undefined;
  const maxScores = maxScoresForQuestions(evalId, questions.length);
  return questions.map((q, i) => {
    const maxScore = maxScores[i] ?? 10;
    const tpl =
      evalId === "hw-m-003"
        ? HW_M_003_ATTEMPTS[q.questionNo] ?? genericAttemptTemplate(q, maxScore)
        : genericAttemptTemplate(q, maxScore);
    const ok = corrects[i] ?? true;
    const h = idHash(`${evalId}::${studentId}::${q.questionNo}`);
    const studentAnswer = ok
      ? tpl.correctAnswers[h % tpl.correctAnswers.length]!
      : tpl.wrongAnswers[h % tpl.wrongAnswers.length]!;
    const aiComment = ok
      ? tpl.correctComments[h % tpl.correctComments.length]!
      : tpl.wrongComments[h % tpl.wrongComments.length]!;
    const score = ok
      ? tpl.maxScore
      : tpl.partialScores[h % tpl.partialScores.length] ?? 0;
    return {
      questionNo: q.questionNo,
      score,
      maxScore: tpl.maxScore,
      studentAnswer,
      correctAnswer: tpl.correctAnswer,
      aiComment,
      knowledgeNodeId: q.knowledgeNodeId,
    };
  });
}

function assignScoresInBuckets(
  bucketOrder: number[],
  h: Pick<HomeworkEvalInput, "id" | "minScore" | "maxScore" | "scoreBuckets">,
): number[] {
  const n = bucketOrder.length;
  const scores: number[] = [];
  for (let i = 0; i < n; i++) {
    const b = bucketOrder[i]!;
    const range = BUCKET_RANGES[b]!;
    const found = h.scoreBuckets.find((x) => x.range === range);
    if (!found || found.count === 0) {
      scores.push(70);
      continue;
    }
    const [lo, hi] = scoreRangeForBucket(
      found.range,
      h.minScore,
      h.maxScore,
    );
    const span = Math.max(0, hi - lo);
    const t = (idHash(h.id) + i * 13) % (span + 1);
    let s = lo + t;
    s = Math.max(h.minScore, Math.min(h.maxScore, s));
    scores.push(s);
  }
  if (n > 0) {
    let li = 0;
    let hi2 = 0;
    for (let i = 0; i < n; i++) {
      if (scores[i]! <= scores[li]!) li = i;
      if (scores[i]! >= scores[hi2]!) hi2 = i;
    }
    scores[li] = h.minScore;
    scores[hi2] = h.maxScore;
  }
  return scores;
}

export function buildHomeworkStudentResults(
  h: HomeworkEvalInput,
  all: readonly Student[] = students,
): StudentEvalResult[] {
  const inClass = all
    .filter((s) => s.classId === h.classId)
    .sort((a, b) => a.studentNo.localeCompare(b.studentNo, "zh-CN", { numeric: true }));
  if (inClass.length === 0) return [];

  const nSub = Math.min(h.submissionCount, inClass.length);
  const bucketOrder = buildBucketOrder(h.scoreBuckets, h.id);
  if (bucketOrder.length < nSub) {
    while (bucketOrder.length < nSub) bucketOrder.push(2);
  }
  bucketOrder.length = nSub;
  const scores = assignScoresInBuckets(bucketOrder, h);

  const submittedIds = inClass
    .slice(0, nSub)
    .map((s) => s.id);
  const nQ = h.questionAccuracy.length;
  const perQ = buildQuestionCorrects(
    nSub,
    h.questionAccuracy.map((x) => ({ accuracy: x.accuracy })),
    h.id,
  );
  const rows = perStudentCorrectFromColumns(perQ, nSub, nQ);

  const byId = new Map<string, StudentEvalResult>();
  for (let i = 0; i < nSub; i++) {
    const sid = submittedIds[i]!;
    const row: StudentEvalResult = {
      studentId: sid,
      submitted: true,
      totalScore: scores[i],
      questionCorrect: nQ > 0 ? rows[i] : undefined,
      questionAttempts: buildQuestionAttempts(
        h.id,
        sid,
        h.questionAccuracy,
        rows[i],
      ),
    };
    for (const k of h.keyStudents) {
      if (k.studentId === sid && k.score != null) {
        row.totalScore = k.score;
      }
    }
    row.aiEval = buildAiEvalForRow(row);
    byId.set(sid, row);
  }

  for (const s of inClass) {
    if (byId.has(s.id)) continue;
    byId.set(s.id, { studentId: s.id, submitted: false });
  }
  return inClass.map((s) => byId.get(s.id)!);
}

function studentsForExamClassIds(
  classIds: string[],
  all: readonly Student[],
): Student[] {
  const set = new Set(classIds);
  return all
    .filter((s) => set.has(s.classId))
    .sort((a, b) => {
      const ca = a.classId.localeCompare(b.classId);
      if (ca !== 0) return ca;
      return a.studentNo.localeCompare(b.studentNo, "zh-CN", { numeric: true });
    });
}

export function buildExamStudentResults(
  e: ExamEvalInput,
  all: readonly Student[] = students,
): StudentEvalResult[] {
  const inPool = studentsForExamClassIds(e.classIds, all);
  if (e.submittedCount === 0 || !e.questionAccuracy?.length) {
    return inPool.map((s) => ({ studentId: s.id, submitted: false }));
  }

  const nSub = Math.min(e.submittedCount, inPool.length);
  const bucketOrder = buildBucketOrder(e.scoreBuckets, e.id);
  if (bucketOrder.length < nSub) {
    while (bucketOrder.length < nSub) bucketOrder.push(2);
  }
  bucketOrder.length = nSub;

  const hLike: Pick<
    HomeworkEvalInput,
    "id" | "minScore" | "maxScore" | "scoreBuckets"
  > = {
    id: e.id,
    minScore: e.minScore,
    maxScore: e.maxScore,
    scoreBuckets: e.scoreBuckets,
  };
  const scores = assignScoresInBuckets(bucketOrder, hLike);

  const submitted = inPool.slice(0, nSub);
  const perQ = buildQuestionCorrects(
    nSub,
    (e.questionAccuracy ?? []).map((x) => ({ accuracy: x.accuracy })),
    e.id,
  );
  const nQ = (e.questionAccuracy ?? []).length;
  const rows = perStudentCorrectFromColumns(perQ, nSub, nQ);

  const byId = new Map<string, StudentEvalResult>();
  for (let i = 0; i < nSub; i++) {
    const sid = submitted[i]!.id;
    const row: StudentEvalResult = {
      studentId: sid,
      submitted: true,
      totalScore: scores[i],
      questionCorrect: nQ > 0 ? rows[i] : undefined,
      questionAttempts: buildQuestionAttempts(
        e.id,
        sid,
        e.questionAccuracy ?? [],
        rows[i],
      ),
    };
    for (const k of e.keyStudents) {
      if (k.studentId === sid && k.score != null) row.totalScore = k.score;
    }
    row.aiEval = buildAiEvalForRow(row);
    byId.set(sid, row);
  }
  for (const s of inPool) {
    if (byId.has(s.id)) continue;
    byId.set(s.id, { studentId: s.id, submitted: false });
  }
  return inPool.map((s) => byId.get(s.id)!);
}

export function withHomeworkStudentResults(
  h: HomeworkEvalInput,
  all: readonly Student[] = students,
): HomeworkEvalSummary {
  return { ...h, studentResults: buildHomeworkStudentResults(h, all) };
}

export function withExamStudentResults(
  e: ExamEvalInput,
  all: readonly Student[] = students,
): ExamEvalSummary {
  return { ...e, studentResults: buildExamStudentResults(e, all) };
}
