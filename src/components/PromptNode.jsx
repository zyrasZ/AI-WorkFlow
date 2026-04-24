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
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        relative w-[400px] rounded-xl border backdrop-blur-md
        ${selected ? 'ring-2 ring-purple-400/50 ring-offset-2 ring-offset-black border-purple-400/60' : 'border-white/20'}
        bg-black/90 backdrop-blur-md
        shadow-xl transition-all duration-300
      `}
    >
      {/* Output Handle */}
      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 border-2 border-purple-400/60 bg-purple-500/20 backdrop-blur-sm"
          style={{ right: -6 }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-400/30">
            <Type size={14} className="text-purple-400" />
          </div>
          <h3 className="text-sm font-medium text-white">
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
                      className="flex items-center space-x-2 w-full px-3 py-2 text-xs text-white/70 hover:bg-white/10 transition-colors"
                    >
                      <Icon size={12} />
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
      <div className="p-4">
        <textarea
          value={promptText}
          onChange={handlePromptChange}
          placeholder="Enter your AI prompt here..."
          className={`
            w-full min-h-[200px] max-h-[400px] p-4 
            bg-gray-800/50 border border-white/10 rounded-lg 
            text-white placeholder-white/40 
            resize-none backdrop-blur-sm 
            focus:border-purple-400/40 focus:outline-none focus:ring-1 focus:ring-purple-400/20
            transition-all duration-200
            ${isEditing ? 'border-purple-400/60 bg-gray-800/70' : ''}
          `}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
        />

        {/* Variables Display */}
        {variables.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {variables.map((variable, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-purple-500/20 border border-purple-400/30 rounded-md text-purple-300"
              >
                {`{${variable}}`}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Add Variable Button */}
      <div className="p-4 pt-0">
        <button
          onClick={addVariable}
          className="flex items-center space-x-2 text-xs text-white/60 hover:text-white/80 transition-colors group"
        >
          <Plus size={14} className="group-hover:scale-110 transition-transform" />
          <span>Add variable</span>
        </button>
      </div>

      {/* Character Count */}
      <div className="absolute bottom-2 right-4 text-xs text-white/40">
        {promptText.length} chars
      </div>

      {/* Status Indicator */}
      <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
      </div>
    </motion.div>
  );
});

PromptNode.displayName = 'PromptNode';

export default PromptNode;