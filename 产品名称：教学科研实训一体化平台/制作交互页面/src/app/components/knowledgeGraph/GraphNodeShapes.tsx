import type { GraphNode } from "@mock";

const strokeBrowseSel = "#1e293b";
const strokeBrowse = "white";

/**
 * 知识图谱页（GraphBrowse）使用的节点形：全圆点，靠 fill 区分簇；选中放大描边
 */
export function GraphNodeShapeBrowse({
  type: _nodeType,
  x,
  y,
  color,
  selected,
}: {
  type: GraphNode["nodeType"];
  x: number;
  y: number;
  color: string;
  selected: boolean;
}) {
  const sw = 2;
  const r = selected ? 14 : 10;
  return (
    <circle
      cx={x}
      cy={y}
      r={r}
      fill={color}
      stroke={selected ? strokeBrowseSel : strokeBrowse}
      strokeWidth={sw}
    />
  );
}

const strokePath = "white";
const pathSw = 1.5;

/**
 * 教学计划路径预览：可带 plan 内「焦点」虚线外圈
 */
export function GraphNodeShapePath({
  type: _nodeType,
  x,
  y,
  color,
  planFocus,
  selected,
}: {
  type: GraphNode["nodeType"];
  x: number;
  y: number;
  color: string;
  planFocus: boolean;
  selected: boolean;
}) {
  const r = selected ? 12 : 9;
  const focusR = 18;
  return (
    <g>
      {planFocus && (
        <circle
          cx={x}
          cy={y}
          r={focusR}
          fill="none"
          stroke="#6366f1"
          strokeWidth={1.5}
          strokeDasharray="3 2"
          opacity={0.9}
        />
      )}
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={color}
        stroke={selected ? "#0f172a" : strokePath}
        strokeWidth={pathSw}
      />
    </g>
  );
}

/**
 * 新建计划向导第 4 步：未引用/弱化
 */
export function GraphNodeShapeWizard({
  type: _nodeType,
  x,
  y,
  color,
  muted,
}: {
  type: GraphNode["nodeType"];
  x: number;
  y: number;
  color: string;
  muted: boolean;
}) {
  const opacity = muted ? 0.4 : 1;
  const strokeW = 1.5;
  const r = muted ? 5 : 9;
  return (
    <circle
      cx={x}
      cy={y}
      r={r}
      fill={color}
      stroke="white"
      strokeWidth={strokeW}
      opacity={opacity}
    />
  );
}
