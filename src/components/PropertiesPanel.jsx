import { motion, AnimatePresence } from 'framer-motion'
import { X, Settings2, Zap, Info, Sliders, Eye, Play } from 'lucide-react'

export default function PropertiesPanel({ node, onClose }) {
  const color = node?.data?.color || '#3b82f6'

  return (
    <AnimatePresence>
      {node && (
        <motion.aside
          key="props-panel"
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="w-80 flex flex-col border-l border-white/10 overflow-y-auto bg-black/60 backdrop-blur-sm">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Settings2 size={14} style={{ color }} />
              <span className="text-sm font-semibold text-white">Node Properties</span>
            </div>
            <button onClick={onClose}
              className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:bg-white/10 text-white/60">
              <X size={14} />
            </button>
          </div>

          {/* Preview Section */}
          {node.data.preview && (
            <div className="px-4 py-4 border-b border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Eye size={12} className="text-white/60" />
                <span className="text-xs font-medium text-white/80">Preview</span>
              </div>
              <div className="aspect-video bg-black/40 rounded-lg border border-white/10 overflow-hidden">
                {node.data.preview.type === 'image' ? (
                  <img 
                    src={node.data.preview.url || '/api/placeholder/300/200'} 
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : node.data.preview.type === 'video' ? (
                  <video 
                    src={node.data.preview.url}
                    className="w-full h-full object-cover"
                    controls
                    muted
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-xs text-white/40 mb-1">No Preview</div>
                      <div className="text-xs text-white/60">{node.data.label}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Node Identity */}
          <div className="px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{node.data.label}</div>
                <div className="text-xs text-white/60">{node.data.subtitle || node.data.pillar}</div>
              </div>
            </div>
            <div className="text-xs text-white/40 font-mono px-2 py-1 rounded bg-white/5 border border-white/10">
              ID: {node.id} • Type: {node.data.nodeType}
            </div>
          </div>

          {/* Status & Controls */}
          <div className="px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={12} className="text-white/60" />
              <span className="text-xs font-medium text-white/80">Status & Controls</span>
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2 mb-3">
              <div className={`
                w-2 h-2 rounded-full
                ${node.data.status === 'running' ? 'bg-blue-400 animate-pulse' : ''}
                ${node.data.status === 'success' ? 'bg-green-400' : ''}
                ${node.data.status === 'error' ? 'bg-red-400' : ''}
                ${node.data.status === 'idle' ? 'bg-white/40' : ''}
              `} />
              <span className="text-xs text-white/80 capitalize">{node.data.status}</span>
            </div>

            {/* Run Button */}
            <button 
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-medium text-white transition-colors"
            >
              <Play size={12} />
              Run Model
            </button>
          </div>

          {/* Configuration Fields */}
          {node.data.fields?.length > 0 && (
            <div className="px-4 py-4 border-b border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Sliders size={12} className="text-white/60" />
                <span className="text-xs font-medium text-white/80">Configuration</span>
              </div>
              <div className="space-y-3">
                {node.data.fields.map((field, i) => (
                  <div key={i}>
                    <label className="text-xs text-white/70 font-medium block mb-1.5">{field.label}</label>
                    {field.type === 'select' ? (
                      <select
                        className="w-full text-xs rounded-lg px-3 py-2 outline-none bg-black/40 border border-white/20 text-white focus:border-white/40 transition-colors"
                        defaultValue={field.value}>
                        {field.options?.map(opt => (
                          <option key={opt} value={opt} className="bg-black text-white">{opt}</option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea 
                        rows={3}
                        className="w-full text-xs rounded-lg px-3 py-2 outline-none resize-none bg-black/40 border border-white/20 text-white placeholder-white/40 focus:border-white/40 transition-colors"
                        defaultValue={field.value}
                        placeholder={field.placeholder}
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        className="w-full text-xs rounded-lg px-3 py-2 outline-none bg-black/40 border border-white/20 text-white placeholder-white/40 focus:border-white/40 transition-colors"
                        defaultValue={field.value}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Node Information */}
          <div className="px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Info size={12} className="text-white/60" />
              <span className="text-xs font-medium text-white/80">Node Information</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Pillar</span>
                <span className="text-white/80 capitalize">{node.data.pillar}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Position</span>
                <span className="text-white/80 font-mono">
                  {Math.round(node.position?.x)}, {Math.round(node.position?.y)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Color</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: color }} />
                  <span className="text-white/80 font-mono text-xs">{color}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Connections</span>
                <span className="text-white/80">
                  {node.data.hasInput ? 'Input' : ''} {node.data.hasInput && node.data.hasOutput ? '• ' : ''} {node.data.hasOutput ? 'Output' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 py-4 mt-auto space-y-2">
            <button 
              className="w-full py-2.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 text-white"
              style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
            >
              Apply Changes
            </button>
            <button className="w-full py-2.5 rounded-lg text-xs font-medium transition-all hover:bg-white/10 bg-white/5 border border-white/10 text-white/80">
              Duplicate Node
            </button>
            <button className="w-full py-2.5 rounded-lg text-xs font-medium transition-all hover:bg-red-500/20 bg-red-500/10 border border-red-500/20 text-red-400">
              Delete Node
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
