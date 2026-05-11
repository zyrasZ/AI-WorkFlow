import { useState, memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreHorizontal,
  Plus,
  Type,
  Copy,
  Edit3,
  Trash2,
  Settings
} from 'lucide-react';

/**
 * PromptNode - Specialized node for AI prompt input
 * Features large text area and variable management
 */
const PromptNode = memo(({ data, selected, id }) => {
  const [promptText, setPromptText] = useState(data.prompt || '');
  const [showMenu, setShowMenu] = useState(false);
  const [variables, setVariables] = useState(data.variables || []);
  const [isEditing, setIsEditing] = useState(false);
  const [nodeSize, setNodeSize] = useState({ width: data.width || 280, height: data.height || 'auto' });
  const [isResizing, setIsResizing] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(data.textareaHeight || 200);
  const [isResizingHeight, setIsResizingHeight] = useState(false);
  const [isNodeHovered, setIsNodeHovered] = useState(false);

  const {
    label = 'Prompt',
    color = '#8b5cf6',
    hasOutput = true,
    onDataChange,
    onPromptChange, // Callback để trigger update cho connected nodes
    getNodes,
    getEdges
  } = data;

  // Handle prompt text change and propagate to parent
  const handlePromptChange = (e) => {
    const newValue = e.target.value;
    setPromptText(newValue);
    
    // Update data directly for immediate access
    data.value = newValue;
    data.prompt = newValue;
    
    // Notify parent component about data change
    if (onDataChange) {
      onDataChange(id, { value: newValue, prompt: newValue, variables });
    }

    // Trigger update for connected AI nodes
    if (onPromptChange && getNodes && getEdges) {
      const allEdges = getEdges();
      const connectedTargets = allEdges
        .filter(e => e.source === id)
        .map(e => e.target);
      
      if (connectedTargets.length > 0) {
        console.log('📤 Prompt changed, notifying connected nodes:', connectedTargets);
        onPromptChange(id, newValue, connectedTargets);
      }
    }
  };

  // Add variable functionality
  const addVariable = () => {
    const variableName = prompt('Enter variable name:');
    if (variableName && !variables.includes(variableName)) {
      const newVariables = [...variables, variableName];
      setVariables(newVariables);
      
      // Insert variable placeholder in prompt
      const placeholder = `{${variableName}}`;
      const newPrompt = promptText + (promptText ? ' ' : '') + placeholder;
      setPromptText(newPrompt);
      
      // Update data directly
      data.value = newPrompt;
      data.prompt = newPrompt;
      data.variables = newVariables;
      
      // Notify parent about changes
      if (onDataChange) {
        onDataChange(id, { value: newPrompt, prompt: newPrompt, variables: newVariables });
      }
    }
  };

  // Menu actions
  const menuActions = [
    { icon: Copy, label: 'Copy Prompt', action: () => navigator.clipboard.writeText(promptText) },
    { icon: Edit3, label: 'Edit Mode', action: () => setIsEditing(!isEditing) },
    { icon: Settings, label: 'Settings', action: () => console.log('Settings') },
    { icon: Trash2, label: 'Clear', action: () => setPromptText('') }
  ];

  // Handle resize
  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = nodeSize.width;
    
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(350, Math.min(700, startWidth + deltaX));
      setNodeSize({ ...nodeSize, width: newWidth });
      
      // Update data
      if (onDataChange) {
        onDataChange(id, { ...data, width: newWidth });
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle node bottom resize
  const handleBottomResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizingHeight(true);
    
    const startY = e.clientY;
    const startHeight = textareaHeight;
    
    const handleMouseMove = (e) => {
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(150, Math.min(700, startHeight + deltaY));
      setTextareaHeight(newHeight);
      
      // Update data
      if (onDataChange) {
        onDataChange(id, { ...data, textareaHeight: newHeight });
      }
    };
    
    const handleMouseUp = () => {
      setIsResizingHeight(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        relative rounded-lg border backdrop-blur-md
        ${selected ? 'ring-2 ring-purple-400/50 ring-offset-1 ring-offset-black border-purple-400/60' : 'border-white/20'}
        bg-black/90 backdrop-blur-md
        shadow-xl transition-all duration-300
      `}
      style={{ width: nodeSize.width }}
      onMouseEnter={() => setIsNodeHovered(true)}
      onMouseLeave={() => setIsNodeHovered(false)}
    >
      {/* Output Handle */}
      {hasOutput && (
        <div
          className="absolute"
          style={{ right: -6, top: '50%', transform: 'translateY(-50%)' }}
        >
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 border-2 border-purple-400/60 bg-purple-500/20 backdrop-blur-sm !relative !transform-none !inset-auto"
          />
          <AnimatePresence>
            {isNodeHovered && (
              <motion.div
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.15 }}
                style={{ left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)', position: 'absolute' }}
                className="whitespace-nowrap pointer-events-none"
              >
                <span className="text-xs font-semibold text-purple-400" style={{ textShadow: '0 0 10px rgba(192,132,252,0.9)' }}>
                  Prompt
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-purple-500/20 border border-purple-400/30">
            <Type size={14} className="text-purple-400" />
          </div>
          <h3 className="text-xs font-semibold text-white truncate">
            {label}
          </h3>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <MoreHorizontal size={16} className="text-white/60" />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="absolute top-full right-0 mt-2 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg py-2 min-w-[140px] z-50 shadow-xl"
              >
                {menuActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        action.action();
                        setShowMenu(false);
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-[10px] text-white/70 hover:bg-white/10 transition-colors"
                    >
                      <Icon size={11} />
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Prompt Text Area */}
      <div className="p-3">
        <textarea
          value={promptText}
          onChange={handlePromptChange}
          placeholder="Enter prompt..."
          className={`
            w-full p-3
            bg-gray-800/50 border border-white/10 rounded-lg
            text-white placeholder-white/40
            resize-none backdrop-blur-sm 
            focus:border-purple-400/40 focus:outline-none focus:ring-1 focus:ring-purple-400/20
            transition-all duration-200
            ${isEditing ? 'border-purple-400/60 bg-gray-800/70' : ''}
          `}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '12px',
            lineHeight: '1.6',
            height: `${textareaHeight}px`,
            maxHeight: '700px'
          }}
        />

        {/* Variables Display */}
        {variables.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {variables.map((variable, index) => (
              <span
                key={index}
                className="px-2 py-1 text-[10px] bg-purple-500/20 border border-purple-400/30 rounded text-purple-300"
              >
                {`{${variable}}`}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Add Variable Button */}
      <div className="px-3 pb-3">
        <button
          onClick={addVariable}
          className="flex items-center space-x-1 text-[10px] text-white/60 hover:text-white/80 transition-colors group"
        >
          <Plus size={12} className="group-hover:scale-110 transition-transform" />
          <span>Add variable</span>
        </button>
      </div>

      {/* Bottom Resize Handle */}
      <div
        onMouseDown={handleBottomResize}
        className={`
          nodrag
          absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize
          flex items-center justify-center
          hover:bg-purple-500/10 transition-colors
          ${isResizingHeight ? 'bg-purple-500/20' : ''}
        `}
        style={{ borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}
      >
        <div className="w-16 h-1 bg-white/30 rounded-full" />
      </div>

      {/* Character Count */}
      <div className="absolute bottom-4 right-3 text-[10px] text-white/40">
        {promptText.length}
      </div>

      {/* Status Indicator */}
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-purple-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
      </div>
    </motion.div>
  );
});

PromptNode.displayName = 'PromptNode';

export default PromptNode;