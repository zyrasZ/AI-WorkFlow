import { useState, memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, MoreHorizontal, Trash2, Copy } from 'lucide-react';

/**
 * IfElseNode - Evaluates a condition and routes to true/false output
 * Input: 1 port (data to evaluate)
 * Output: 2 ports — "true" and "false"
 */
const IfElseNode = memo(({ data, selected, id }) => {
  const [condition, setCondition] = useState(data.condition || '');
  const [showMenu, setShowMenu] = useState(false);
  const [isNodeHovered, setIsNodeHovered] = useState(false);

  const { label = 'IF / ELSE', color = '#f59e0b', onDataChange } = data;

  const handleConditionChange = (e) => {
    const val = e.target.value;
    setCondition(val);
    data.condition = val;
    if (onDataChange) onDataChange(id, { condition: val });
  };

  const menuActions = [
    { icon: Copy,   label: 'Copy',  action: () => navigator.clipboard.writeText(condition) },
    { icon: Trash2, label: 'Clear', action: () => { setCondition(''); data.condition = ''; } },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`relative rounded-xl border backdrop-blur-md bg-black/90 shadow-2xl transition-all duration-200 ${
        selected
          ? 'ring-2 ring-yellow-400/50 ring-offset-1 ring-offset-black border-yellow-400/60'
          : 'border-white/15'
      }`}
      style={{ width: 260 }}
      onMouseEnter={() => setIsNodeHovered(true)}
      onMouseLeave={() => setIsNodeHovered(false)}
    >
      {/* Input handle */}
      <div className="absolute" style={{ left: -6, top: '50%', transform: 'translateY(-50%)' }}>
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 border-2 border-yellow-400/60 bg-yellow-500/20 !relative !transform-none !inset-auto"
        />
        <AnimatePresence>
          {isNodeHovered && (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              style={{ right: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)', position: 'absolute' }}
              className="whitespace-nowrap pointer-events-none"
            >
              <span className="text-xs font-semibold text-yellow-400" style={{ textShadow: '0 0 10px rgba(251,191,36,0.9)' }}>
                Input
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Output TRUE handle */}
      <div className="absolute" style={{ right: -6, top: '35%', transform: 'translateY(-50%)' }}>
        <Handle
          id="true"
          type="source"
          position={Position.Right}
          className="w-3 h-3 border-2 border-green-400/60 bg-green-500/20 !relative !transform-none !inset-auto"
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
              <span className="text-xs font-semibold text-green-400" style={{ textShadow: '0 0 10px rgba(74,222,128,0.9)' }}>
                True
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Output FALSE handle */}
      <div className="absolute" style={{ right: -6, top: '65%', transform: 'translateY(-50%)' }}>
        <Handle
          id="false"
          type="source"
          position={Position.Right}
          className="w-3 h-3 border-2 border-red-400/60 bg-red-500/20 !relative !transform-none !inset-auto"
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
              <span className="text-xs font-semibold text-red-400" style={{ textShadow: '0 0 10px rgba(248,113,113,0.9)' }}>
                False
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-yellow-500/20 border border-yellow-400/30">
            <GitBranch size={13} className="text-yellow-400" />
          </div>
          <span className="text-xs font-semibold text-white">{label}</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <MoreHorizontal size={14} className="text-white/50" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -8 }}
                className="absolute top-full right-0 mt-1 bg-black/90 border border-white/20 rounded-lg py-1.5 min-w-[120px] z-50 shadow-xl"
              >
                {menuActions.map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <button key={i} onClick={() => { a.action(); setShowMenu(false); }}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-[10px] text-white/70 hover:bg-white/10 transition-colors">
                      <Icon size={10} /><span>{a.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        <p className="text-[10px] text-white/50 font-medium">Condition</p>
        <input
          type="text"
          value={condition}
          onChange={handleConditionChange}
          placeholder='e.g. data.value > 10'
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/25 text-[11px] focus:border-yellow-400/40 focus:outline-none focus:ring-1 focus:ring-yellow-400/20 transition-all"
        />

        {/* Port labels */}
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400/70 border border-green-400/50" />
            <span className="text-[10px] text-white/40">True → condition is met</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-400/70 border border-red-400/50" />
            <span className="text-[10px] text-white/40">False → condition not met</span>
          </div>
        </div>
      </div>

      {/* Status dot */}
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-yellow-500 rounded-full border-2 border-gray-900" />
    </motion.div>
  );
});

IfElseNode.displayName = 'IfElseNode';
export default IfElseNode;
