/**
 * 学情分析「成绩分布」柱状图色谱；作业/考试评价的 scoreBuckets.range 映射到同一套视觉体系。
 */

/** 柱状图横轴统一为分数由低到高（与班级画像「成绩分布」一致） */
export const SCORE_BUCKET_CHART_ORDER = [
  "<60",
  "60-69",
  "70-79",
  "80-89",
  "90-100",
] as const;

export function sortScoreBucketsForChart<T extends { range: string }>(
  buckets: T[],
): T[] {
  const rank = new Map(
    SCORE_BUCKET_CHART_ORDER.map((r, i) => [r, i] as const),
  );
  return [...buckets].sort((a, b) => {
    const ia = rank.get(a.range) ?? 999;
    const ib = rank.get(b.range) ?? 999;
    return ia - ib;
  });
}
export const SCORE_BIN_BAR_COLORS = {
  "<60": "#f43f5e",
  "60-69": "#fb923c",
  "70-84": "#eab308",
  "≥85": "#10b981",
} as const;

/** 作业/考试 mock 中五段制 range → 与 SCORE_BIN_BAR_COLORS 一致的填充色 */
export function scoreBucketRangeFill(range: string): string {
  switch (range) {
    case "<60":
      return SCORE_BIN_BAR_COLORS["<60"];
    case "60-69":
      return SCORE_BIN_BAR_COLORS["60-69"];
    case "70-79":
    case "70-84":
      return SCORE_BIN_BAR_COLORS["70-84"];
    case "80-89":
      return "#34d399";
    case "90-100":
    case "≥85":
      return SCORE_BIN_BAR_COLORS["≥85"];
    default:
      return "#6366f1";
  }
}
