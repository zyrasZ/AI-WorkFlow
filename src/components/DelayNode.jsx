import { useState, memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MoreHorizontal, Trash2 } from 'lucide-react';

/**
 * DelayNode - Passes data through after a configurable delay
 * Input: 1 port (data to delay)
 * Output: 1 port (same data, unchanged)
 */
const DelayNode = memo(({ data, selected, id }) => {
  const [delayAmount, setDelayAmount] = useState(data.delayAmount ?? 1000);
  const [unit, setUnit] = useState(data.unit || 'ms');
  const [showMenu, setShowMenu] = useState(false);
  const [isNodeHovered, setIsNodeHovered] = useState(false);

  const { label = 'DELAY', onDataChange } = data;

  const units = ['ms', 's', 'min'];

  const syncData = (patch) => {
    Object.assign(data, patch);
    if (onDataChange) onDataChange(id, patch);
  };

  const getDisplayMs = () => {
    if (unit === 'ms') return delayAmount;
    if (unit === 's') return delayAmount * 1000;
    if (unit === 'min') return delayAmount * 60000;
    return delayAmount;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`relative rounded-xl border backdrop-blur-md bg-black/90 shadow-2xl transition-all duration-200 ${
        selected
          ? 'ring-2 ring-orange-400/50 ring-offset-1 ring-offset-black border-orange-400/60'
          : 'border-white/15'
      }`}
      style={{ width: 240 }}
      onMouseEnter={() => setIsNodeHovered(true)}
      onMouseLeave={() => setIsNodeHovered(false)}
    >
      {/* Input handle */}
      <div className="absolute" style={{ left: -6, top: '50%', transform: 'translateY(-50%)' }}>
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 border-2 border-orange-400/60 bg-orange-500/20 !relative !transform-none !inset-auto"
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
              <span className="text-xs font-semibold text-orange-400" style={{ textShadow: '0 0 10px rgba(251,146,60,0.9)' }}>
                Input
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Output handle */}
      <div className="absolute" style={{ right: -6, top: '50%', transform: 'translateY(-50%)' }}>
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 border-2 border-orange-400/60 bg-orange-500/20 !relative !transform-none !inset-auto"
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
              <span className="text-xs font-semibold text-orange-400" style={{ textShadow: '0 0 10px rgba(251,146,60,0.9)' }}>
                Output
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/20 border border-orange-400/30">
            <Clock size={13} className="text-orange-400" />
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
                <button onClick={() => { setDelayAmount(1000); setUnit('ms'); syncData({ delayAmount: 1000, unit: 'ms' }); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-[10px] text-white/70 hover:bg-white/10 transition-colors">
                  <Trash2 size={10} /><span>Reset</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2.5">
        <p className="text-[10px] text-white/50 font-medium">Wait duration</p>

        {/* Amount + unit */}
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            value={delayAmount}
            onChange={e => { const v = Number(e.target.value); setDelayAmount(v); syncData({ delayAmount: v }); }}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-[11px] focus:border-orange-400/40 focus:outline-none focus:ring-1 focus:ring-orange-400/20 transition-all"
          />
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            {units.map(u => (
              <button
                key={u}
                onClick={() => { setUnit(u); syncData({ unit: u }); }}
                className={`px-2.5 py-1 text-[10px] font-medium transition-all ${
                  unit === u
                    ? 'bg-orange-500/25 text-orange-300'
                    : 'bg-white/4 text-white/40 hover:bg-white/8 hover:text-white/60'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-2 px-2.5 py-2 bg-orange-500/5 border border-orange-500/15 rounded-lg">
          <Clock size={10} className="text-orange-400/60 flex-shrink-0" />
          <p className="text-[9px] text-white/35">
            Data passes through after{' '}
            <span className="text-orange-400/80 font-semibold">
              {delayAmount} {unit}
            </span>
            {' '}({getDisplayMs().toLocaleString()} ms total)
          </p>
        </div>
      </div>

      {/* Status dot */}
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-gray-900" />
    </motion.div>
  );
});

DelayNode.displayName = 'DelayNode';
export default DelayNode;
