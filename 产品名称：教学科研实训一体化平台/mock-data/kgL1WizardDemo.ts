/**
 * L1「创建专业培养图谱」向导 · 模拟管线文案（仅供前端进度动画拼接）
 */

export const L1_SCHEMA_NODE_TYPE_CHAIN_DESC =
  "产业需求 → 岗位能力 → 核心素养 → 能力 → 培养目标 → 课程标准";

/** 生成管线阶段标签（底部进度条） */
export const L1_WIZARD_STREAM_STAGES = [
  "解析资料",
  "对齐描述",
  "映射类型",
  "串联关系",
  "汇总草案",
] as const;

/** 与管线穿插输出的固定日志（不含用户句式，由前端拼接） */
export const L1_WIZARD_STREAM_FIXED_LOGS = [
  "合并所选资料条目（跳过解析与落库）。",
  `对齐 kgL1Schema 节点类型序列：${L1_SCHEMA_NODE_TYPE_CHAIN_DESC}。`,
  "应用约定图谱描述骨架，生成候选实体……",
  "绑定主线关系候选（isSpine 演示路径）。",
  "汇总第一层草案清单，等待人工核对。",
] as const;
