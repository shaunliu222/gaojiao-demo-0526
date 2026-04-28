import type { GraphNode } from "@mock";

const strokeBrowseSel = "#1e293b";
const strokeBrowse = "white";
const strokePath = "white";
const pathSw = 1.5;

function LayerShape({
  x,
  y,
  color,
  selected,
  stroke,
  strokeWidth,
  status,
  opacity = 1,
}: {
  type?: GraphNode["nodeType"];
  x: number;
  y: number;
  color: string;
  selected: boolean;
  stroke: string;
  strokeWidth: number;
  status?: GraphNode["status"];
  opacity?: number;
}) {
  const r = selected ? 14 : 10;
  const strokeDasharray = status === "ai_draft" ? "4 2" : undefined;
  const activeStroke = selected ? strokeBrowseSel : stroke;

  return (
    <circle
      cx={x}
      cy={y}
      r={r}
      fill={color}
      stroke={activeStroke}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      opacity={opacity}
    />
  );
}

/**
 * 知识图谱页使用的节点形：节点统一圆形，颜色由调用方按层级传入。
 */
export function GraphNodeShapeBrowse({
  type,
  x,
  y,
  color,
  selected,
  status,
}: {
  type: GraphNode["nodeType"];
  x: number;
  y: number;
  color: string;
  selected: boolean;
  status?: GraphNode["status"];
}) {
  return (
    <LayerShape
      type={type}
      x={x}
      y={y}
      color={color}
      selected={selected}
      stroke={strokeBrowse}
      strokeWidth={2}
      status={status}
    />
  );
}

/**
 * 教学计划路径预览：可带 plan 内「焦点」虚线外圈。
 */
export function GraphNodeShapePath({
  type,
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
      <LayerShape
        type={type}
        x={x}
        y={y}
        color={color}
        selected={selected}
        stroke={strokePath}
        strokeWidth={pathSw}
      />
    </g>
  );
}

/**
 * 新建计划向导第 4 步：未引用/弱化。
 */
export function GraphNodeShapeWizard({
  type,
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
  return (
    <LayerShape
      type={type}
      x={x}
      y={y}
      color={color}
      selected={false}
      stroke="white"
      strokeWidth={1.5}
      opacity={muted ? 0.4 : 1}
    />
  );
}
