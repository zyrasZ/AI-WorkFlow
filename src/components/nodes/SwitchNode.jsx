import { useState, memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Plus, Trash2, MoreHorizontal } from 'lucide-react';

/**
 * SwitchNode - Routes data to one of many output ports based on case matching
 * Input: 1 port (data to switch on)
 * Output: N case ports + 1 default port
 */
const SwitchNode = memo(({ data, selected, id }) => {
  const [switchKey, setSwitchKey] = useState(data.switchKey || '');
  const [cases, setCases] = useState(data.cases || ['case1', 'case2']);
  const [showMenu, setShowMenu] = useState(false);
  const [isNodeHovered, setIsNodeHovered] = useState(false);

  const { label = 'SWITCH', onDataChange } = data;

  const allPorts = [...cases, 'default'];

  const syncData = (newKey, newCases) => {
    data.switchKey = newKey;
    data.cases = newCases;
    if (onDataChange) onDataChange(id, { switchKey: newKey, cases: newCases });
  };

  const handleKeyChange = (e) => {
    setSwitchKey(e.target.value);
    syncData(e.target.value, cases);
  };

  const addCase = () => {
    const newCases = [...cases, `case${cases.length + 1}`];
    setCases(newCases);
    syncData(switchKey, newCases);
  };

  const removeCase = (idx) => {
    const newCases = cases.filter((_, i) => i !== idx);
    setCases(newCases);
    syncData(switchKey, newCases);
  };

  const updateCase = (idx, val) => {
    const newCases = cases.map((c, i) => (i === idx ? val : c));
    setCases(newCases);
    syncData(switchKey, newCases);
  };

  // Distribute output handles evenly
  const getPortTop = (portIdx, total) => {
    const step = 100 / (total + 1);
    return `${step * (portIdx + 1)}%`;
  };

  const portColors = ['#a78bfa', '#60a5fa', '#34d399', '#fb923c', '#f472b6', '#facc15'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`relative rounded-xl border backdrop-blur-md bg-black/90 shadow-2xl transition-all duration-200 ${
        selected
          ? 'ring-2 ring-violet-400/50 ring-offset-1 ring-offset-black border-violet-400/60'
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
          className="w-3 h-3 border-2 border-violet-400/60 bg-violet-500/20 !relative !transform-none !inset-auto"
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
              <span className="text-xs font-semibold text-violet-400" style={{ textShadow: '0 0 10px rgba(167,139,250,0.9)' }}>
                Input
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Output handles — one per case + default */}
      {allPorts.map((port, idx) => {
        const isDefault = port === 'default';
        const color = isDefault ? '#94a3b8' : portColors[idx % portColors.length];
        return (
          <div
            key={port}
            className="absolute"
            style={{ right: -6, top: getPortTop(idx, allPorts.length), transform: 'translateY(-50%)' }}
          >
            <Handle
              id={port}
              type="source"
              position={Position.Right}
              style={{ borderColor: `${color}99`, backgroundColor: `${color}33` }}
              className="w-3 h-3 border-2 !relative !transform-none !inset-auto"
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
                  <span className="text-xs font-semibold" style={{ color, textShadow: `0 0 10px ${color}99` }}>
                    {isDefault ? 'default' : port}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/20 border border-violet-400/30">
            <Shuffle size={13} className="text-violet-400" />
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
                className="absolute top-full right-0 mt-1 bg-black/90 border border-white/20 rounded-lg py-1.5 min-w-[120px] z-50 shadow-xl"
              >
                <button onClick={() => { addCase(); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-[10px] text-white/70 hover:bg-white/10 transition-colors">
                  <Plus size={10} /><span>Add Case</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2.5">
        {/* Switch key */}
        <div>
          <p className="text-[10px] text-white/50 font-medium mb-1">Switch on</p>
          <input
            type="text"
            value={switchKey}
            onChange={handleKeyChange}
            placeholder='e.g. data.status'
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/25 text-[11px] focus:border-violet-400/40 focus:outline-none focus:ring-1 focus:ring-violet-400/20 transition-all"
          />
        </div>

        {/* Cases */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] text-white/50 font-medium">Cases</p>
            <button
              onClick={addCase}
              className="flex items-center gap-1 text-[9px] text-violet-400/70 hover:text-violet-300 transition-colors"
            >
              <Plus size={10} /><span>Add</span>
            </button>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
            {cases.map((c, idx) => {
              const color = portColors[idx % portColors.length];
              return (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: `${color}99`, border: `1px solid ${color}66` }} />
                  <input
                    type="text"
                    value={c}
                    onChange={e => updateCase(idx, e.target.value)}
                    className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded-md text-white text-[10px] focus:border-violet-400/30 focus:outline-none transition-all"
                  />
                  <button
                    onClick={() => removeCase(idx)}
                    disabled={cases.length <= 1}
                    className="p-0.5 hover:bg-red-500/10 rounded transition-colors disabled:opacity-30"
                  >
                    <Trash2 size={10} className="text-white/30 hover:text-red-400 transition-colors" />
                  </button>
                </div>
              );
            })}
            {/* Default port indicator */}
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-2 h-2 rounded-full flex-shrink-0 bg-slate-400/50 border border-slate-400/30" />
              <span className="text-[10px] text-white/40 italic">default (always present)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status dot */}
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-violet-500 rounded-full border-2 border-gray-900" />
    </motion.div>
  );
});

SwitchNode.displayName = 'SwitchNode';
export default SwitchNode;
