import { useState, memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { Merge, Plus, Minus, MoreHorizontal } from 'lucide-react';

/**
 * MergeNode - Combines data from multiple input branches into one output
 * Input: N ports (2+ from different branches)
 * Output: 1 port (merged data)
 */
const MergeNode = memo(({ data, selected, id }) => {
  const [inputCount, setInputCount] = useState(data.inputCount ?? 2);
  const [mergeStrategy, setMergeStrategy] = useState(data.mergeStrategy || 'array');
  const [showMenu, setShowMenu] = useState(false);
  const [isNodeHovered, setIsNodeHovered] = useState(false);

  const { label = 'MERGE', onDataChange } = data;

  const strategies = [
    { id: 'array',  label: 'Array',  desc: 'Wrap all inputs into an array' },
    { id: 'object', label: 'Object', desc: 'Merge as key-value object' },
    { id: 'concat', label: 'Concat', desc: 'Concatenate strings/arrays' },
  ];

  const syncData = (patch) => {
    Object.assign(data, patch);
    if (onDataChange) onDataChange(id, patch);
  };

  const addInput = () => {
    const n = Math.min(inputCount + 1, 8);
    setInputCount(n);
    syncData({ inputCount: n });
  };

  const removeInput = () => {
    const n = Math.max(inputCount - 1, 2);
    setInputCount(n);
    syncData({ inputCount: n });
  };

  // Distribute input handles evenly on the left
  const getPortTop = (idx, total) => {
    const step = 100 / (total + 1);
    return `${step * (idx + 1)}%`;
  };

  const portColors = ['#a78bfa', '#60a5fa', '#34d399', '#fb923c', '#f472b6', '#facc15', '#38bdf8', '#4ade80'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`relative rounded-xl border backdrop-blur-md bg-black/90 shadow-2xl transition-all duration-200 ${
        selected
          ? 'ring-2 ring-pink-400/50 ring-offset-1 ring-offset-black border-pink-400/60'
          : 'border-white/15'
      }`}
      style={{ width: 260 }}
      onMouseEnter={() => setIsNodeHovered(true)}
      onMouseLeave={() => setIsNodeHovered(false)}
    >
      {/* Input handles */}
      {Array.from({ length: inputCount }).map((_, idx) => {
        const color = portColors[idx % portColors.length];
        return (
          <div
            key={idx}
            className="absolute"
            style={{ left: -6, top: getPortTop(idx, inputCount), transform: 'translateY(-50%)' }}
          >
            <Handle
              id={`input-${idx}`}
              type="target"
              position={Position.Left}
              style={{ borderColor: `${color}99`, backgroundColor: `${color}33` }}
              className="w-3 h-3 border-2 !relative !transform-none !inset-auto"
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
                  <span className="text-xs font-semibold" style={{ color, textShadow: `0 0 10px ${color}99` }}>
                    In {idx + 1}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Output handle */}
      <div className="absolute" style={{ right: -6, top: '50%', transform: 'translateY(-50%)' }}>
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 border-2 border-pink-400/60 bg-pink-500/20 !relative !transform-none !inset-auto"
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
              <span className="text-xs font-semibold text-pink-400" style={{ textShadow: '0 0 10px rgba(244,114,182,0.9)' }}>
                Merged
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-pink-500/20 border border-pink-400/30">
            <Merge size={13} className="text-pink-400" />
          </div>
          <span className="text-xs font-semibold text-white">{label}</span>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-white/10 rounded transition-colors">
            <MoreHorizontal size={14} className="text-white/50" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -8 }}
                className="absolute top-full right-0 mt-1 bg-black/90 border border-white/20 rounded-lg py-1.5 min-w-[130px] z-50 shadow-xl"
              >
                <button onClick={() => { addInput(); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-[10px] text-white/70 hover:bg-white/10 transition-colors">
                  <Plus size={10} /><span>Add Input</span>
                </button>
                <button onClick={() => { removeInput(); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-[10px] text-white/70 hover:bg-white/10 transition-colors">
                  <Minus size={10} /><span>Remove Input</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2.5">
        {/* Input count control */}
        <div>
          <p className="text-[10px] text-white/50 font-medium mb-1.5">Input ports</p>
          <div className="flex items-center gap-2">
            <button
              onClick={removeInput}
              disabled={inputCount <= 2}
              className="w-7 h-7 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-all"
            >
              <Minus size={11} className="text-white/60" />
            </button>
            <div className="flex-1 text-center">
              <span className="text-sm font-bold text-white">{inputCount}</span>
              <span className="text-[10px] text-white/40 ml-1">inputs</span>
            </div>
            <button
              onClick={addInput}
              disabled={inputCount >= 8}
              className="w-7 h-7 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-all"
            >
              <Plus size={11} className="text-white/60" />
            </button>
          </div>
        </div>

        {/* Merge strategy */}
        <div>
          <p className="text-[10px] text-white/50 font-medium mb-1.5">Merge strategy</p>
          <div className="space-y-1">
            {strategies.map(s => (
              <button
                key={s.id}
                onClick={() => { setMergeStrategy(s.id); syncData({ mergeStrategy: s.id }); }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                  mergeStrategy === s.id
                    ? 'bg-pink-500/15 border-pink-400/40 text-pink-300'
                    : 'bg-white/4 border-white/8 text-white/40 hover:bg-white/8 hover:text-white/60'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${mergeStrategy === s.id ? 'bg-pink-400' : 'bg-white/20'}`} />
                <div>
                  <span className="text-[10px] font-medium">{s.label}</span>
                  <span className="text-[9px] text-white/30 ml-1.5">{s.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status dot */}
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-pink-500 rounded-full border-2 border-gray-900" />
    </motion.div>
  );
});

MergeNode.displayName = 'MergeNode';
export default MergeNode;
