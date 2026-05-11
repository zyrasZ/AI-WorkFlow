import { useState, memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, MoreHorizontal, Trash2 } from 'lucide-react';

/**
 * LoopNode - Iterates over an array and collects results
 * Input: 1 port (array data)
 * Output: 1 port (results array from each iteration)
 */
const LoopNode = memo(({ data, selected, id }) => {
  const [iteratorKey, setIteratorKey] = useState(data.iteratorKey || '');
  const [itemVar, setItemVar] = useState(data.itemVar || 'item');
  const [showMenu, setShowMenu] = useState(false);
  const [isNodeHovered, setIsNodeHovered] = useState(false);

  const { label = 'LOOP', onDataChange } = data;

  const syncData = (patch) => {
    Object.assign(data, patch);
    if (onDataChange) onDataChange(id, patch);
  };

  const menuActions = [
    { icon: Trash2, label: 'Reset', action: () => { setIteratorKey(''); setItemVar('item'); syncData({ iteratorKey: '', itemVar: 'item' }); } },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`relative rounded-xl border backdrop-blur-md bg-black/90 shadow-2xl transition-all duration-200 ${
        selected
          ? 'ring-2 ring-cyan-400/50 ring-offset-1 ring-offset-black border-cyan-400/60'
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
          className="w-3 h-3 border-2 border-cyan-400/60 bg-cyan-500/20 !relative !transform-none !inset-auto"
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
              <span className="text-xs font-semibold text-cyan-400" style={{ textShadow: '0 0 10px rgba(34,211,238,0.9)' }}>
                Array
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
          className="w-3 h-3 border-2 border-cyan-400/60 bg-cyan-500/20 !relative !transform-none !inset-auto"
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
              <span className="text-xs font-semibold text-cyan-400" style={{ textShadow: '0 0 10px rgba(34,211,238,0.9)' }}>
                Results
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/30">
            <RefreshCw size={13} className="text-cyan-400" />
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
      <div className="p-3 space-y-2.5">
        <div>
          <p className="text-[10px] text-white/50 font-medium mb-1">Array path</p>
          <input
            type="text"
            value={iteratorKey}
            onChange={e => { setIteratorKey(e.target.value); syncData({ iteratorKey: e.target.value }); }}
            placeholder='e.g. data.emails'
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/25 text-[11px] focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 transition-all"
          />
        </div>
        <div>
          <p className="text-[10px] text-white/50 font-medium mb-1">Item variable name</p>
          <input
            type="text"
            value={itemVar}
            onChange={e => { setItemVar(e.target.value); syncData({ itemVar: e.target.value }); }}
            placeholder='item'
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/25 text-[11px] focus:border-cyan-400/40 focus:outline-none focus:ring-1 focus:ring-cyan-400/20 transition-all"
          />
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 px-2.5 py-2 bg-cyan-500/5 border border-cyan-500/15 rounded-lg">
          <RefreshCw size={10} className="text-cyan-400/60 flex-shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '3s' }} />
          <p className="text-[9px] text-white/35 leading-relaxed">
            Iterates over each <span className="text-cyan-400/70">{itemVar || 'item'}</span> in the array and collects all results.
          </p>
        </div>
      </div>

      {/* Status dot */}
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-cyan-500 rounded-full border-2 border-gray-900" />
    </motion.div>
  );
});

LoopNode.displayName = 'LoopNode';
export default LoopNode;
