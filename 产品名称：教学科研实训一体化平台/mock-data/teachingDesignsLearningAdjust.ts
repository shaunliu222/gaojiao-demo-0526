import type { TeachingDesign } from "./types";
import { DEMO_DESIGN_PLAN_ID } from "./teachingDesigns";

/**
 * 仅从「学情分析 → 调整教学设计」进入时使用的设计假数据，
 * 与常规入口下同一小节的 {@link teachingDesigns} 内容区分，突出学情驱动话术与编排。
 *
 * 当前覆盖：plan-main · sec-2-4（与班级画像 progress / 巩固小节演示一致）
 */
export const teachingDesignsLearningAdjust: TeachingDesign[] = [
  {
    id: "design-sec-2-4-la-handout",
    planId: DEMO_DESIGN_PLAN_ID,
    sectionId: "sec-2-4",
    tab: "讲义",
    personaId: "persona-li-custom-1",
    knowledgeFiles: [
      { source: "resource_library", refId: "res-m-030", name: "点线面投影互动课件（H5）" },
      { source: "resource_library", refId: "res-m-022", name: "投影基础练习题库（100 题）" },
      { source: "knowledge_base", refId: "kb-engdrawing", name: "工程制图知识库（全文检索）" },
    ],
    skillIds: ["skill-gen-mindmap", "skill-gen-microvideo"],
    mcpIds: ["mcp-textbook"],
    chatHistory: [
      {
        id: "msg-la-h-1",
        role: "user",
        content:
          "班级刚学完 2.3 点线投影，但学情显示「几何作图（2.1）」仍薄弱。要在 2.4 讲义里插入约 8 分钟的巩固块，再进入面的投影，避免脱节。",
        createdAt: "2026-03-11T08:30:00+08:00",
      },
      {
        id: "msg-la-h-2",
        role: "assistant",
        content:
          "已按「学情补丁」重排讲义：开篇用 1 页「2.1 快练」——圆弧连接与线段分析各 1 题（附答案要点），约 8 分钟；随后用半页承接 2.3 的点线可见性，再展开三类平面的投影与相对位置，共 7 页。快练放在课前发 PDF，课上聚焦错因小结，并保留「错因→面投影」过渡句；已生成衔接版思维导图（2.1→2.3→2.4 一条线），右栏可预览讲义与导图初稿。",
        createdAt: "2026-03-11T08:32:00+08:00",
      },
    ],
    outputsBeforeInitialAiReply: [
      {
        id: "out-la-h-draft",
        type: "讲义pdf",
        title: "2.4 面及相对位置 · 讲义草案.pdf",
        previewUrl: "/previews/out-h-001.png",
        sizeLabel: "3.2 MB",
        createdAt: "2026-03-11T08:30:00+08:00",
        summary: "三类平面投影与相对位置主干，尚未插入学情要求的 2.1 巩固块与衔接导图。",
        tags: ["草案"],
      },
    ],
    outputs: [
      {
        id: "out-la-h-1",
        type: "讲义pdf",
        title: "2.4 面及相对位置 · 学情衔接版讲义 v1.pdf",
        previewUrl: "/previews/out-h-001.png",
        sizeLabel: "4.1 MB",
        createdAt: "2026-03-11T08:35:30+08:00",
        summary: "含 2.1 课前快练 + 2.3→2.4 过渡 + 面投影主干。",
        tags: ["讲义", "学情衔接"],
      },
      {
        id: "out-la-h-2",
        type: "思维导图",
        title: "2.1→2.3→2.4 衔接 · 导图.png",
        previewUrl: "/previews/out-h-002.png",
        sizeLabel: "1.1 MB",
        createdAt: "2026-03-11T08:36:00+08:00",
        summary: "班级薄弱点与本节目标的对应关系。",
        tags: ["学情", "导图"],
      },
    ],
    updatedAt: "2026-03-11T08:36:00+08:00",
  },
  {
    id: "design-sec-2-4-la-class",
    planId: DEMO_DESIGN_PLAN_ID,
    sectionId: "sec-2-4",
    tab: "课堂",
    personaId: "persona-preset-facilitator",
    knowledgeFiles: [
      { source: "resource_library", refId: "res-m-030", name: "点线面投影互动课件（H5）" },
    ],
    skillIds: ["skill-gen-quiz", "skill-gen-h5"],
    mcpIds: [],
    chatHistory: [
      {
        id: "msg-la-c-1",
        role: "user",
        content:
          "课堂前 10 分钟要做 2.1 快问快答，照顾后排基础弱的学生；然后接 2.3 回顾，再讲平面。互动次数不要太密，避免拖堂。",
        createdAt: "2026-03-11T09:00:00+08:00",
      },
      {
        id: "msg-la-c-2",
        role: "assistant",
        content:
          "已生成「分层课堂」教案：0–10min 2.1 快问快答（4 题举牌）；10–18min 2.3 可见性口诀；18–75min 三类平面 + H5 探究（两人一机）；75–90min 例题板演。附「后排提示卡」一页（教师用）。",
        createdAt: "2026-03-11T09:03:00+08:00",
      },
    ],
    outputsBeforeInitialAiReply: [
      {
        id: "out-la-c-draft",
        type: "教案",
        title: "2.4 · 课堂教案（草案）.docx",
        previewUrl: "/previews/out-c-001.png",
        sizeLabel: "210 KB",
        createdAt: "2026-03-11T08:58:00+08:00",
        summary: "三类平面与 H5 探究时段已排定，尚未写入 2.1 快问快答与后排分层提示。",
        tags: ["草案"],
      },
    ],
    outputs: [
      {
        id: "out-la-c-1",
        type: "教案",
        title: "2.4 · 学情分层课堂教案.docx",
        previewUrl: "/previews/out-c-001.png",
        sizeLabel: "290 KB",
        createdAt: "2026-03-11T09:03:00+08:00",
        summary: "含 2.1 快答脚本与 H5 探究时段。",
        tags: ["教案", "学情"],
      },
      {
        id: "out-la-c-2",
        type: "PPT",
        title: "2.4 · 学情衔接课堂 PPT.pptx",
        previewUrl: "/previews/out-c-002.png",
        sizeLabel: "11.2 MB",
        createdAt: "2026-03-11T09:03:10+08:00",
        summary: "前段侧重基础回顾，后段与常规版一致。",
        tags: ["PPT"],
      },
    ],
    updatedAt: "2026-03-11T09:03:10+08:00",
  },
  {
    id: "design-sec-2-4-la-homework",
    planId: DEMO_DESIGN_PLAN_ID,
    sectionId: "sec-2-4",
    tab: "作业",
    personaId: "persona-preset-examiner",
    knowledgeFiles: [
      { source: "resource_library", refId: "res-m-022", name: "投影基础练习题库（100 题）" },
    ],
    skillIds: ["skill-gen-quiz", "skill-assign-grader"],
    mcpIds: [],
    chatHistory: [
      {
        id: "msg-la-w-1",
        role: "user",
        content:
          "作业里加一道「2.1 类」小作图（10 分），再考 2.4 读图，让巩固可测。",
        createdAt: "2026-03-11T14:00:00+08:00",
      },
      {
        id: "msg-la-w-2",
        role: "assistant",
        content:
          "已组卷：① 几何作图小题 10 分 ② 平面投影读图 2 题 ③ 相对位置简述 1 题；教师版注明「2.1 类」评分侧重尺规规范。",
        createdAt: "2026-03-11T14:02:00+08:00",
      },
    ],
    outputsBeforeInitialAiReply: [
      {
        id: "out-la-w-draft",
        type: "客观题组卷",
        title: "2.4 · 课后作业（草案）.pdf",
        previewUrl: "/previews/out-w-001.png",
        sizeLabel: "520 KB",
        createdAt: "2026-03-11T13:55:00+08:00",
        summary: "平面读图与相对位置为主，尚未加入可测「2.1 类」巩固作图题与配套评分说明。",
        tags: ["草案"],
      },
    ],
    outputs: [
      {
        id: "out-la-w-1",
        type: "客观题组卷",
        title: "2.4 · 学情巩固版作业（学生版）.pdf",
        previewUrl: "/previews/out-w-001.png",
        sizeLabel: "710 KB",
        createdAt: "2026-03-11T14:01:40+08:00",
        summary: "含 2.1 类作图 + 2.4 读图。",
        tags: ["作业", "学情"],
      },
      {
        id: "out-la-w-2",
        type: "主观题",
        title: "2.4 · 学情巩固版 · 评分说明.pdf",
        previewUrl: "/previews/out-w-002.png",
        sizeLabel: "360 KB",
        createdAt: "2026-03-11T14:02:00+08:00",
        summary: "尺规与相对位置表述分项。",
        tags: ["rubric"],
      },
    ],
    updatedAt: "2026-03-11T14:02:00+08:00",
  },
];

export const designsBySectionLearningAdjust: Record<string, TeachingDesign[]> =
  teachingDesignsLearningAdjust.reduce(
    (acc, d) => {
      const key = `${d.planId}::${d.sectionId}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(d);
      return acc;
    },
    {} as Record<string, TeachingDesign[]>,
  );
