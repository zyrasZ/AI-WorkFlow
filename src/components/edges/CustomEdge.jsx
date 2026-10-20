import { getBezierPath, EdgeLabelRenderer } from 'reactflow'

const colorMap = {
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  purple: '#a855f7',
  orange: '#f97316',
  default: '#60a5fa',
}

export default function CustomEdge({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  data = {},
  markerEnd,
}) {
  const color = colorMap[data.color] || colorMap.default
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })

  return (
    <>
      {/* Glow base */}
      <path
        id={`${id}-glow`}
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeOpacity={0.15}
        strokeLinecap="round"
      />
      {/* Solid line */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeOpacity={0.7}
        strokeLinecap="round"
        markerEnd={markerEnd}
      />
      {/* Animated dash flow */}
      <path
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeOpacity={0.9}
        strokeDasharray="6 10"
        strokeLinecap="round"
        className="animated-edge"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
      {/* Label */}
      {data.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              background: 'rgba(15,23,42,0.85)',
              border: `1px solid ${color}40`,
              color: color,
              fontSize: 10,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 6,
              backdropFilter: 'blur(8px)',
              whiteSpace: 'nowrap',
            }}
            className="nodrag nopan">
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
