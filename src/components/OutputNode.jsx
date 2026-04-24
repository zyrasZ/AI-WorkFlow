import { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, CheckCircle, ChevronDown, ChevronUp, Sparkles, FileText } from 'lucide-react';

/**
 * OutputNode - Hiển thị kết quả AI response trực quan cho người dùng
 */
const OutputNode = memo(({ data, selected }) => {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [displayResult, setDisplayResult] = useState(data.result || null);

  const { label = 'Kết quả AI', color = '#f59e0b', status = 'idle', lastExecuted } = data;

  // Sync khi App.jsx cập nhật data.result sau workflow
  useEffect(() => {
    if (data.result) setDisplayResult(data.result);
  }, [data.result]);

  const responseText =
    displayResult?.response ||
    displayResult?.findings ||
    displayResult?.generated ||
    displayResult?.strategy ||
    displayResult?.imagePrompt ||
    displayResult?.script ||
    displayResult?.prompt ||
    null;
  const handleCopy = () => {
    if (!responseText) return;
    navigator.clipboard.writeText(responseText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusBorder = {
    idle: 'border-white/15',
    running: 'border-yellow-400/60',
    success: 'border-green-400/50',
    error: 'border-red-400/50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`relative w-[340px] rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300
        ${statusBorder[status] || 'border-white/15'}
        ${selected ? 'ring-2 ring-yellow-400/40 ring-offset-1 ring-offset-black' : ''}
      `}
      style={{ background: 'linear-gradient(135deg, rgba(20,20,24,0.97) 0%, rgba(10,10,14,0.99) 100%)' }}
    >
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 border-2 border-yellow-400/60 bg-yellow-500/20"
        style={{ left: -6 }}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
            <FileText size={13} style={{ color }} />
          </div>
          <span className="text-sm font-semibold text-white">{label}</span>
          {status === 'success' && responseText && (
            <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2 py-0.5">
              <Sparkles size={9} /> Có kết quả
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {responseText && (
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Sao chép"
            >
              {copied
                ? <CheckCircle size={13} className="text-green-400" />
                : <Copy size={13} className="text-white/50 hover:text-white/80" />
              }
            </button>
          )}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            {collapsed
              ? <ChevronDown size={13} className="text-white/50" />
              : <ChevronUp size={13} className="text-white/50" />
            }
          </button>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Running state */}
            {status === 'running' && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="w-7 h-7 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-white/50">Đang xử lý...</p>
              </div>
            )}

            {/* Has result */}
            {status !== 'running' && responseText && (
              <div className="p-4">
                <div
                  className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap max-h-[320px] overflow-y-auto pr-1"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
                >
                  {responseText}
                </div>

                {/* Footer meta */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/8">
                  {displayResult?.model && (
                    <span className="text-[10px] text-white/30 font-mono">{displayResult.model}</span>
                  )}
                  {displayResult?.usage?.total_tokens && (
                    <span className="text-[10px] text-white/30">{displayResult.usage.total_tokens} tokens</span>
                  )}
                  {lastExecuted && (
                    <span className="text-[10px] text-white/30">
                      {new Date(lastExecuted).toLocaleTimeString('vi-VN')}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Empty state */}
            {status !== 'running' && !responseText && (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <FileText size={18} className="text-white/20" />
                </div>
                <p className="text-xs text-white/40">Chưa có kết quả</p>
                <p className="text-[10px] text-white/25">Nhấn Run Workflow để bắt đầu</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Running overlay glow */}
      {status === 'running' && (
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: '0 0 0 1px rgba(251,191,36,0.3), 0 0 20px rgba(251,191,36,0.08)' }}
        />
      )}
    </motion.div>
  );
});

OutputNode.displayName = 'OutputNode';
export default OutputNode;
