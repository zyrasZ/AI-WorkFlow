import { Handle, Position } from 'reactflow'
import { motion } from 'framer-motion'
import {
  FileText, Brain, GitBranch, Table2, Mail,
  CheckCircle2, Clock, AlertCircle,
  Scissors, Languages, PenSquare, Megaphone, Search,
  Image, Bell, SendHorizonal, Sheet, Zap
} from 'lucide-react'

const iconMap = {
  'pdf-loader': FileText,
  'excel-connector': Table2,
  'email-reader': Mail,
  'summarizer': Brain,
  'data-extractor': Scissors,
  'translator': Languages,
  'fb-post': PenSquare,
  'ad-copy': Megaphone,
  'seo-gen': Search,
  'image-gen': Image,
  'diagram-maker': GitBranch,
  'slack-notify': Bell,
  'send-email': SendHorizonal,
  'update-sheet': Sheet,
  'condition': GitBranch,
  default: Zap,
}

const statusConfig = {
  idle: { icon: Clock, color: '#64748b', label: 'Idle' },
  running: { icon: Zap, color: '#eab308', label: 'Running' },
  done: { icon: CheckCircle2, color: '#22c55e', label: 'Done' },
  error: { icon: AlertCircle, color: '#ef4444', label: 'Error' },
}

// Diamond shape for condition nodes
function DiamondNode({ data, isSelected }) {
  const status = statusConfig[data.status || 'idle']
  const StatusIcon = status.icon

  return (
    <div className="relative flex flex-col items-center" style={{ width: 140 }}>
      {/* Diamond */}
      <div
        className="cursor-pointer transition-all duration-200"
        style={{
          width: 100, height: 100,
          background: `rgba(234,179,8,0.12)`,
          border: `2px solid rgba(234,179,8,0.5)`,
          transform: 'rotate(45deg)',
          borderRadius: 8,
          boxShadow: isSelected ? `0 0 20px rgba(234,179,8,0.4), 0 0 40px rgba(234,179,8,0.15)` : `0 0 10px rgba(234,179,8,0.2)`,
          backdropFilter: 'blur(12px)',
        }}>
      </div>
      {/* Inner content (counter-rotated) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ top: 0 }}>
        <GitBranch size={18} style={{ color: '#eab308' }} />
        <span className="text-xs font-semibold text-white mt-1 text-center px-2 leading-tight">{data.label}</span>
        <div className="flex items-center gap-1 mt-1">
          <StatusIcon size={9} style={{ color: status.color }} />
          <span className="text-[9px]" style={{ color: status.color }}>{status.label}</span>
        </div>
      </div>

      {/* Condition text below */}
      {data.condition && (
        <div className="mt-2 px-2 py-1 rounded text-[10px] text-center"
          style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', color: '#fbbf24' }}>
          {data.condition}
        </div>
      )}

      <Handle type="target" position={Position.Top} style={{ top: 0, left: '50%', transform: 'translate(-50%, -50%)' }} />
      <Handle type="source" id="true" position={Position.Right} style={{ right: -5, top: '50%', transform: 'translateY(-50%)' }} />
      <Handle type="source" id="false" position={Position.Bottom} style={{ bottom: -5, left: '50%', transform: 'translateX(-50%)' }} />

      {/* Branch labels */}
      <div className="absolute text-[9px] font-bold" style={{ right: -28, top: '42%', color: '#22c55e' }}>TRUE</div>
      <div className="absolute text-[9px] font-bold" style={{ bottom: -18, left: '50%', transform: 'translateX(-50%)', color: '#ef4444' }}>FALSE</div>
    </div>
  )
}

export default function CustomNode({ data, selected }) {
  const color = data.color || '#3b82f6'
  const Icon = iconMap[data.nodeType] || iconMap.default
  const status = statusConfig[data.status || 'idle']
  const StatusIcon = status.icon

  if (data.nodeType === 'condition') {
    return <DiamondNode data={data} isSelected={selected} />
  }

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="ghost-node rounded-lg overflow-hidden cursor-pointer"
      style={{
        minWidth: 120,
        maxWidth: 140,
        borderColor: selected ? color : 'rgba(255,255,255,0.12)',
        borderWidth: selected ? 1.5 : 1,
        boxShadow: selected
          ? `0 0 0 1px ${color}40, 0 0 20px ${color}30, 0 8px 32px rgba(0,0,0,0.4)`
          : `0 4px 24px rgba(0,0,0,0.3)`,
      }}>

      {/* Color accent bar */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}00)` }} />

      {/* Header */}
      <div className="flex items-center gap-1 px-1.5 py-1">
        <div className="w-4 h-4 rounded flex items-center justify-center shrink-0"
          style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
          <Icon size={8} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-semibold text-white truncate leading-tight">{data.label}</p>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <StatusIcon size={7} style={{ color: status.color }} />
        </div>
      </div>

      {/* Handles */}
      {data.hasInput !== false && (
        <Handle type="target" position={Position.Left}
          style={{ left: -5, top: '50%', transform: 'translateY(-50%)' }} />
      )}
      {data.hasOutput !== false && (
        <Handle type="source" position={Position.Right}
          style={{ right: -5, top: '50%', transform: 'translateY(-50%)' }} />
      )}
    </motion.div>
  )
}
