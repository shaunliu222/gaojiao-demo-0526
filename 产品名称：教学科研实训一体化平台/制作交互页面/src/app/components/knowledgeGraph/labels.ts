/** 知识图谱节点旁文字截断（全库/计划路径/向导可共用不同 max） */
export function truncateGraphLabel(name: string, maxLen: number): string {
  return name.length > maxLen ? name.slice(0, maxLen) + "…" : name;
}
