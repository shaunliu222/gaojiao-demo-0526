import type { GraphNode } from "@mock";

const strokeBrowseSel = "#1e293b";
const strokeBrowse = "white";

/**
 * 知识图谱页（GraphBrowse）使用的节点形：选中放大描边
 */
export function GraphNodeShapeBrowse({
  type,
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
  if (type === "知识点") {
    return (
      <circle
        cx={x}
        cy={y}
        r={selected ? 14 : 10}
        fill={color}
        stroke={selected ? strokeBrowseSel : strokeBrowse}
        strokeWidth={sw}
      />
    );
  }
  if (type === "技能点") {
    return (
      <rect
        x={x - (selected ? 12 : 10)}
        y={y - (selected ? 12 : 10)}
        width={selected ? 24 : 20}
        height={selected ? 24 : 20}
        rx={3}
        fill={color}
        stroke={selected ? strokeBrowseSel : strokeBrowse}
        strokeWidth={sw}
      />
    );
  }
  const r = selected ? 14 : 11;
  return (
    <polygon
      points={`${x},${y - r} ${x - r},${y + r * 0.75} ${x + r},${y + r * 0.75}`}
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
  if (type === "知识点") {
    return (
      <g>
        {planFocus && (
          <circle
            cx={x}
            cy={y}
            r={18}
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
          r={selected ? 12 : 9}
          fill={color}
          stroke={selected ? "#0f172a" : strokePath}
          strokeWidth={pathSw}
        />
      </g>
    );
  }
  if (type === "技能点") {
    return (
      <g>
        {planFocus && (
          <rect
            x={x - 16}
            y={y - 16}
            width={32}
            height={32}
            rx={4}
            fill="none"
            stroke="#6366f1"
            strokeWidth={1.5}
            strokeDasharray="3 2"
            opacity={0.9}
          />
        )}
        <rect
          x={x - (selected ? 10 : 8)}
          y={y - (selected ? 10 : 8)}
          width={selected ? 20 : 16}
          height={selected ? 20 : 16}
          rx={2}
          fill={color}
          stroke={selected ? "#0f172a" : strokePath}
          strokeWidth={pathSw}
        />
      </g>
    );
  }
  const r = selected ? 11 : 9;
  return (
    <g>
      {planFocus && (
        <polygon
          points={`${x},${y - 20} ${x - 12},${y + 9} ${x + 12},${y + 9}`}
          fill="none"
          stroke="#6366f1"
          strokeWidth={1.5}
          strokeDasharray="3 2"
        />
      )}
      <polygon
        points={`${x},${y - r} ${x - r},${y + r * 0.7} ${x + r},${y + r * 0.7}`}
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
  const opacity = muted ? 0.4 : 1;
  const strokeW = 1.5;
  if (type === "知识点") {
    return (
      <circle
        cx={x}
        cy={y}
        r={muted ? 5 : 9}
        fill={color}
        stroke="white"
        strokeWidth={strokeW}
        opacity={opacity}
      />
    );
  }
  if (type === "技能点") {
    const s = muted ? 10 : 18;
    return (
      <rect
        x={x - s / 2}
        y={y - s / 2}
        width={s}
        height={s}
        rx={3}
        fill={color}
        stroke="white"
        strokeWidth={strokeW}
        opacity={opacity}
      />
    );
  }
  const r = muted ? 6 : 10;
  return (
    <polygon
      points={`${x},${y - r} ${x - r},${y + r * 0.75} ${x + r},${y + r * 0.75}`}
      fill={color}
      stroke="white"
      strokeWidth={strokeW}
      opacity={opacity}
    />
  );
}
