import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Upload, 
  Download, 
  Eye,
  Brain,
  Layers,
  Palette,
  Crop,
  Sliders,
  Search,
  Code,
  TrendingUp,
  Lightbulb,
  Video,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import nodeRegistry from '../registry/NodeRegistry.js'

// Quick Access Tools
const quickAccessTools = [
  { icon: MessageSquare, label: 'Prompt', type: 'prompt', color: '#3b82f6' },
  { icon: Upload, label: 'Import', type: 'import', color: '#10b981' },
  { icon: Download, label: 'Export', type: 'export', color: '#f59e0b' },
  { icon: Eye, label: 'Preview', type: 'preview', color: '#8b5cf6' }
];

// Model Library
const modelLibrary = [
  { icon: Brain, label: 'GPT-4o', type: 'gpt4o', color: '#3b82f6', subtitle: 'Text Generation' },
  { icon: Sparkles, label: 'Runway Gen-4.5', type: 'runway', color: '#ef4444', subtitle: 'Video Generation' },
  { icon: Palette, label: 'DALL-E 3', type: 'dalle3', color: '#8b5cf6', subtitle: 'Image Generation' },
  { icon: Brain, label: 'Claude 3.5', type: 'claude', color: '#f59e0b', subtitle: 'Reasoning' }
];

// Editing Tools
const editingTools = [
  { icon: Sliders, label: 'Levels', type: 'levels', color: '#10b981' },
  { icon: Layers, label: 'Compositor', type: 'compositor', color: '#3b82f6' },
  { icon: Palette, label: 'Painter', type: 'painter', color: '#8b5cf6' },
  { icon: Crop, label: 'Crop', type: 'crop', color: '#f59e0b' }
];

// Pillar icons mapping
const pillarIcons = {
  research: Search,
  code: Code,
  marketing: TrendingUp,
  imagine: Lightbulb,
  video: Video
};

export default function Sidebar() {
  const [expandedSections, setExpandedSections] = useState(['quickAccess', 'models'])

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => 
      prev.includes(sectionName) 
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    )
  }

  const onDragStart = (event, item) => {
    const dragData = {
      type: item.type,
      label: item.label,
      color: item.color,
      subtitle: item.subtitle
    };
    
    event.dataTransfer.setData('application/reactflow', JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = 'move';
  }

  const renderToolGrid = (tools, columns = 2) => (
    <div className={`grid gap-2 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
      {tools.map((tool) => (
        <div
          key={tool.type}
          draggable
          onDragStart={(e) => onDragStart(e, tool)}
          className="aspect-square bg-white/5 border border-white/10 rounded-lg flex flex-col items-center justify-center cursor-grab active:cursor-grabbing hover:bg-white/10 transition-all group"
        >
          <tool.icon size={16} style={{ color: tool.color }} className="mb-1" />
          <span className="text-xs text-white/80 text-center leading-tight">{tool.label}</span>
        </div>
      ))}
    </div>
  );

  const renderModelList = (models) => (
    <div className="space-y-2">
      {models.map((model) => (
        <div
          key={model.type}
          draggable
          onDragStart={(e) => onDragStart(e, model)}
          className="p-3 bg-white/5 border border-white/10 rounded-lg cursor-grab active:cursor-grabbing hover:bg-white/10 transition-all group"
        >
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${model.color}20` }}
            >
              <model.icon size={14} style={{ color: model.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium">{model.label}</div>
              <div className="text-xs text-white/60">{model.subtitle}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-72 bg-black/60 backdrop-blur-sm border-r border-white/10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h1 className="text-lg font-semibold text-white mb-1">Weave Studio</h1>
        <p className="text-xs text-white/60">AI Workflow Builder</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Quick Access */}
        <div>
          <button
            onClick={() => toggleSection('quickAccess')}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <h3 className="text-sm font-medium text-white/90">Quick Access</h3>
            <motion.div
              animate={{ rotate: expandedSections.includes('quickAccess') ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={14} className="text-white/60" />
            </motion.div>
          </button>
          
          {expandedSections.includes('quickAccess') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {renderToolGrid(quickAccessTools)}
            </motion.div>
          )}
        </div>

        {/* Model Library */}
        <div>
          <button
            onClick={() => toggleSection('models')}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <h3 className="text-sm font-medium text-white/90">Model Library</h3>
            <motion.div
              animate={{ rotate: expandedSections.includes('models') ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={14} className="text-white/60" />
            </motion.div>
          </button>
          
          {expandedSections.includes('models') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {renderModelList(modelLibrary)}
            </motion.div>
          )}
        </div>

        {/* Editing Tools */}
        <div>
          <button
            onClick={() => toggleSection('editing')}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <h3 className="text-sm font-medium text-white/90">Toolbox (Editing)</h3>
            <motion.div
              animate={{ rotate: expandedSections.includes('editing') ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={14} className="text-white/60" />
            </motion.div>
          </button>
          
          {expandedSections.includes('editing') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {renderToolGrid(editingTools)}
            </motion.div>
          )}
        </div>

        {/* AI Components */}
        <div>
          <button
            onClick={() => toggleSection('components')}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <h3 className="text-sm font-medium text-white/90">AI Components</h3>
            <motion.div
              animate={{ rotate: expandedSections.includes('components') ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight size={14} className="text-white/60" />
            </motion.div>
          </button>
          
          {expandedSections.includes('components') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {Object.entries(nodeRegistry.getPillarCategories()).map(([pillarName, nodeTypes]) => {
                const Icon = pillarIcons[pillarName] || Search;
                
                return (
                  <div key={pillarName}>
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon size={12} className="text-white/60" />
                      <span className="text-xs text-white/60 uppercase tracking-wider">
                        {pillarName}
                      </span>
                    </div>
                    <div className="space-y-1 ml-4">
                      {nodeTypes.slice(0, 2).map((nodeConfig) => (
                        <div
                          key={nodeConfig.type}
                          draggable
                          onDragStart={(e) => onDragStart(e, {
                            type: nodeConfig.type,
                            label: nodeConfig.label,
                            color: nodeConfig.color,
                            subtitle: nodeConfig.subtitle
                          })}
                          className="p-2 bg-white/5 border border-white/10 rounded cursor-grab active:cursor-grabbing hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: nodeConfig.color }}
                            />
                            <span className="text-xs text-white/80">{nodeConfig.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-white/40 text-center">
          {nodeRegistry.getAllNodeTypes().length} components loaded
        </div>
      </div>
    </div>
  )
}