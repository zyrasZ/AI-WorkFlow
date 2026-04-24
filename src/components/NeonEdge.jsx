import { memo, useState, useCallback } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow
} from 'reactflow';

/**
 * NeonEdge - Figma Weave style edge
 * Features:
 *  - Hover to reveal X delete button at bezier midpoint
 *  - Wide invisible hit area for easy hovering
 *  - Color matches source node pillar
 *  - Data flow animation
 */
const NeonEdge = memo(({
  id,
  sourceX, sourceY,
  targetX, targetY,
  sourcePosition, targetPosition,
  style = {},
  data = {},
  markerEnd,
  selected,
}) => {
  const { setEdges } = useReactFlow();
  const [hovered, setHovered] = useState(false);

  const {
    color = '#3b82f6',
    label,
    animated = false,
    success = false,
    dataFlow = false,
  } = data;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const filterId = `weave-glow-${id}`;
  const flowFilterId = `weave-flow-${id}`;

  const onDelete = useCallback((e) => {
    e.stopPropagation();
    setEdges(eds => eds.filter(edge => edge.id !== id));
  }, [id, setEdges]);

  const isHighlighted = hovered || selected;

  return (
    <>
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <filter id={flowFilterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        <linearGradient id={`flow-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="50%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>

        <linearGradient id={`success-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.6">
            <animate attributeName="stop-opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
          </stop>
          <stop offset="50%" stopColor="#34d399" stopOpacity="1">
            <animate attributeName="stop-opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite"/>
          </stop>
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.6">
            <animate attributeName="stop-opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
          </stop>
        </linearGradient>
      </defs>

      {/* Invisible wide hit area for easy hover */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      {/* Glow base */}
      <BaseEdge
        path={edgePath}
        style={{
          stroke: isHighlighted ? color : 'rgba(255,255,255,0.08)',
          strokeWidth: isHighlighted ? 4 : 3,
          opacity: isHighlighted ? 0.25 : 0.4,
          filter: `url(#${filterId})`,
          transition: 'all 0.2s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Main visible edge */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: success
            ? `url(#success-gradient-${id})`
            : dataFlow
              ? `url(#flow-gradient-${id})`
              : color,
          strokeWidth: isHighlighted ? 2.5 : 1.5,
          opacity: isHighlighted ? 1 : (dataFlow ? 0.85 : 0.65),
          filter: `url(#${filterId})`,
          strokeDasharray: animated ? '8,4' : 'none',
          transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
          pointerEvents: 'none',
        }}
      />

      {/* Animated data flow dash */}
      {(dataFlow || success) && (
        <path
          d={edgePath}
          fill="none"
          stroke={success ? '#34d399' : color}
          strokeWidth={1}
          strokeDasharray="6 10"
          opacity={0.6}
          style={{ pointerEvents: 'none' }}
        >
          <animate
            attributeName="stroke-dashoffset"
            values="0;-16"
            dur="1.2s"
            repeatCount="indefinite"
          />
        </path>
      )}

      {/* Hover X delete button at midpoint */}
      <EdgeLabelRenderer>
        {/* Delete button */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
            zIndex: 10,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.15s ease',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <button
            onClick={onDelete}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'rgba(10,10,12,0.9)',
              border: `1px solid ${color}`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '10px',
              fontWeight: 700,
              lineHeight: 1,
              boxShadow: `0 0 8px ${color}60`,
              transition: 'background 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = color;
              e.currentTarget.style.color = '#050507';
              e.currentTarget.style.transform = 'scale(1.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(10,10,12,0.9)';
              e.currentTarget.style.color = color;
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            ×
          </button>
        </div>

        {/* Edge label */}
        {label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${hovered ? labelY - 18 : labelY}px)`,
              pointerEvents: 'none',
              transition: 'transform 0.15s ease',
            }}
            className="nodrag nopan"
          >
            <div style={{
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '10px',
              fontWeight: 500,
              background: 'rgba(0,0,0,0.8)',
              border: `1px solid ${success ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.15)'}`,
              color: success ? '#6ee7b7' : 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(8px)',
              whiteSpace: 'nowrap',
            }}>
              {label}
            </div>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
});

NeonEdge.displayName = 'NeonEdge';
export default NeonEdge;
