import type { TeachingDesign } from "./types";
import { DEMO_DESIGN_PLAN_ID } from "./teachingDesigns";

/**
 * 仅从「协同评价 · 作业/考试评价详情 → 调整教学设计」进入时使用的设计假数据，
 * 与常规入口下同一小节的 {@link teachingDesigns} 内容区分，突出学情驱动话术与编排。
 *
 * 当前覆盖：plan-main · sec-3-2（班级画像 progress 为 sec-3-1 → 工作台默认下一堂「组合体三视图」）
 */
export const teachingDesignsLearningAdjust: TeachingDesign[] = [
  {
    id: "design-sec-3-2-la-handout",
    planId: DEMO_DESIGN_PLAN_ID,
    sectionId: "sec-3-2",
    tab: "讲义",
    personaId: "persona-li-custom-1",
    knowledgeFiles: [
      { source: "resource_library", refId: "res-m-041", name: "组合体三视图绘制示范 · 轴承座" },
      { source: "resource_library", refId: "res-m-022", name: "投影基础练习题库（精选）" },
      { source: "knowledge_base", refId: "kb-engdrawing", name: "工程制图知识库（全文检索）" },
    ],
    chatHistory: [
      {
        id: "msg-la32-h-1",
        role: "user",
        content:
          "班级昨天刚上完 3.1，今日课前测验显示「回转体轮廓可见性」「两面投影对应」仍有集中丢分；明天要讲 3.2 轴承座组合体，讲义必须在开篇插入约 12 分钟的补救块，再接形体分析法主干，避免后进生脱节。",
        createdAt: "2026-03-17T08:30:00+08:00",
      },
      {
        id: "msg-la32-h-2",
        role: "assistant",
        content:
          "已按「学情补丁」重排讲义：第 1～2 页为「3.1 快览」——圆柱/圆锥轮廓线与积聚性的对错对照各 1 例（附口诀）；第 3 页承接「可见性三步自检」，约 12 分钟课堂可由教师带领朗读；从第 4 页进入形体分析法流程图与轴承座分解；全文仍为 7 页以内，并已生成衔接导图（3.1 回转体 → 3.2 组合体拆解）。课前 PDF 可按 AB 层分两版附录难度。",
        createdAt: "2026-03-17T08:33:00+08:00",
      },
    ],
    outputsBeforeInitialAiReply: [
      {
        id: "out-la32-h-draft",
        type: "讲义pdf",
        title: "3.2 组合体三视图 · 讲义草案.pdf",
        previewUrl: "/previews/out-h-001.png",
        sizeLabel: "4.8 MB",
        createdAt: "2026-03-17T08:30:00+08:00",
        summary: "形体分析法与轴承座主干已定稿，尚未插入学情要求的「3.1 补救页」与衔接导图。",
        tags: ["草案"],
      },
    ],
    outputs: [
      {
        id: "out-la32-h-1",
        type: "讲义pdf",
        title: "3.2 组合体三视图 · 学情衔接版讲义 v1.pdf",
        previewUrl: "/previews/out-h-001.png",
        sizeLabel: "6.1 MB",
        createdAt: "2026-03-17T08:36:20+08:00",
        summary: "含 3.1 课前补救页 + 可见性自检 + 形体分析法 + 轴承座案例。",
        tags: ["讲义", "学情衔接"],
      },
      {
        id: "out-la32-h-2",
        type: "思维导图",
        title: "3.1→3.2 衔接 · 导图.png",
        previewUrl: "/previews/out-h-002.png",
        sizeLabel: "1.2 MB",
        createdAt: "2026-03-17T08:36:40+08:00",
        summary: "回转体投影特征与本节组合体任务的对应关系。",
        tags: ["学情", "导图"],
      },
    ],
    updatedAt: "2026-03-17T08:36:40+08:00",
  },
  {
    id: "design-sec-3-2-la-class",
    planId: DEMO_DESIGN_PLAN_ID,
    sectionId: "sec-3-2",
    tab: "课堂",
    personaId: "persona-preset-facilitator",
    knowledgeFiles: [
      { source: "resource_library", refId: "res-m-041", name: "组合体三视图绘制示范 · 轴承座" },
      { source: "resource_library", refId: "res-m-044", name: "轴承座 STL 模型" },
    ],
    chatHistory: [
      {
        id: "msg-la32-c-1",
        role: "user",
        content:
          "课堂开头 15 分钟插入「投影口诀 + 两道举牌快答」，照顾 2302 班尾部学生；再接预习作业反馈与轴承座形体命名；中段动手画三视图时间不要压缩，互动控制在每 18 分钟一次。",
        createdAt: "2026-03-17T09:10:00+08:00",
      },
      {
        id: "msg-la32-c-2",
        role: "assistant",
        content:
          "已生成「分层课堂」教案节奏：0–15min 口诀回放与快答（长对正 / 高平齐 / 宽相等）；15–35min 形体拆解小组挑战；35–105min 分层绘制轴承座三视图（薄弱组先发步骤卡）；105–135min 支架实战与互评；附后排分层提示卡一页（教师用）。",
        createdAt: "2026-03-17T09:13:00+08:00",
      },
    ],
    outputsBeforeInitialAiReply: [
      {
        id: "out-la32-c-draft",
        type: "教案",
        title: "3.2 · 课堂教案（草案）.docx",
        previewUrl: "/previews/out-c-001.png",
        sizeLabel: "240 KB",
        createdAt: "2026-03-17T09:08:00+08:00",
        summary: "形体分析法时段已定，尚未写入开场 15 分钟补救脚本与举牌快答题面。",
        tags: ["草案"],
      },
    ],
    outputs: [
      {
        id: "out-la32-c-1",
        type: "教案",
        title: "3.2 · 学情分层课堂教案.docx",
        previewUrl: "/previews/out-c-001.png",
        sizeLabel: "310 KB",
        createdAt: "2026-03-17T09:13:00+08:00",
        summary: "含开场口诀回放脚本与分层绘制指引。",
        tags: ["教案", "学情"],
      },
      {
        id: "out-la32-c-2",
        type: "PPT",
        title: "3.2 · 学情衔接课堂 PPT.pptx",
        previewUrl: "/previews/out-c-002.png",
        sizeLabel: "17.8 MB",
        createdAt: "2026-03-17T09:13:20+08:00",
        summary: "前段侧重补救与快答，后段与常规轴承座课堂一致的动画插件保留。",
        tags: ["PPT"],
      },
    ],
    updatedAt: "2026-03-17T09:13:20+08:00",
  },
  {
    id: "design-sec-3-2-la-homework",
    planId: DEMO_DESIGN_PLAN_ID,
    sectionId: "sec-3-2",
    tab: "作业",
    personaId: "persona-preset-examiner",
    knowledgeFiles: [
      { source: "resource_library", refId: "res-m-041", name: "组合体三视图绘制示范 · 轴承座" },
    ],
    chatHistory: [
      {
        id: "msg-la32-w-1",
        role: "user",
        content:
          "作业要有分层：全体完成轴承座类组合体一道；2302 班尾部同学额外加一页「投影对应」小题（源自 2.2），但不要喧宾夺主，分值控制在 15 分以内。",
        createdAt: "2026-03-17T14:05:00+08:00",
      },
      {
        id: "msg-la32-w-2",
        role: "assistant",
        content:
          "已组卷：① 形体命名与可见性简述（15 分）② 轴承座类组合体补线（核心，55 分）③ 分层附加：投影对应填空（15 分，可选档）；教师版注明加分档仅面向补课名单学生，评分侧重台阶完整性而非炫技。",
        createdAt: "2026-03-17T14:08:00+08:00",
      },
    ],
    outputsBeforeInitialAiReply: [
      {
        id: "out-la32-w-draft",
        type: "客观题组卷",
        title: "3.2 · 课后作业（草案）.pdf",
        previewUrl: "/previews/out-w-001.png",
        sizeLabel: "540 KB",
        createdAt: "2026-03-17T13:58:00+08:00",
        summary: "组合体主干题型已定，尚未并入分层附加投影小题与加分规则说明。",
        tags: ["草案"],
      },
    ],
    outputs: [
      {
        id: "out-la32-w-1",
        type: "客观题组卷",
        title: "3.2 · 学情巩固版作业（学生版）.pdf",
        previewUrl: "/previews/out-w-001.png",
        sizeLabel: "780 KB",
        createdAt: "2026-03-17T14:07:40+08:00",
        summary: "含轴承座组合体主线 + 可选投影补救小题。",
        tags: ["作业", "学情"],
      },
      {
        id: "out-la32-w-2",
        type: "主观题",
        title: "3.2 · 学情巩固版 · 评分说明.pdf",
        previewUrl: "/previews/out-w-002.png",
        sizeLabel: "380 KB",
        createdAt: "2026-03-17T14:08:00+08:00",
        summary: "形体分解步骤与分层加分细则。",
        tags: ["rubric"],
      },
    ],
    updatedAt: "2026-03-17T14:08:00+08:00",
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
