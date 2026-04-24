import { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, CheckCircle, ChevronDown, ChevronUp, Sparkles, FileText } from 'lucide-react';

/**
 * OutputNode - Hiển thị kết quả AI response trực quan cho người dùng
 * Tự động cập nhật liên tục khi nhận kết quả mới từ các node được nối
 */
const OutputNode = memo(({ data, selected, id }) => {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [displayResult, setDisplayResult] = useState(data.result || null);
  const [resultHistory, setResultHistory] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const { 
    label = 'Kết quả AI', 
    color = '#f59e0b', 
    status = 'idle', 
    lastExecuted,
    getNodes,
    getEdges 
  } = data;

  // Sync khi App.jsx cập nhật data.result sau workflow hoặc từ connected nodes
  useEffect(() => {
    if (data.result) {
      console.log('📥 OutputNode received new result:', id, data.result);
      
      // Show update animation
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 1000);
      
      setDisplayResult(data.result);
      
      // Add to history
      setResultHistory(prev => {
        const newHistory = [...prev, {
          result: data.result,
          timestamp: data.lastExecuted || new Date().toISOString()
        }];
        // Keep only last 5 results
        return newHistory.slice(-5);
      });
    }
  }, [data.result, data.lastExecuted, id]);

  // Poll for updates from connected source nodes
  useEffect(() => {
    if (!getNodes || !getEdges) return;

    const checkForUpdates = () => {
      const allNodes = getNodes();
      const allEdges = getEdges();
      
      // Find source nodes connected to this output node
      const incomingEdges = allEdges.filter(e => e.target === id);
      
      for (const edge of incomingEdges) {
        const sourceNode = allNodes.find(n => n.id === edge.source);
        if (sourceNode?.data?.result) {
          // Check if result is different from current
          const sourceResult = JSON.stringify(sourceNode.data.result);
          const currentResult = JSON.stringify(displayResult);
          
          if (sourceResult !== currentResult) {
            console.log('🔄 OutputNode detected new result from source:', edge.source);
            
            // Show update animation
            setIsUpdating(true);
            setTimeout(() => setIsUpdating(false), 1000);
            
            setDisplayResult(sourceNode.data.result);
            
            // Update data.result to sync with parent
            data.result = sourceNode.data.result;
            data.lastExecuted = sourceNode.data.lastExecuted;
            
            // Add to history
            setResultHistory(prev => {
              const newHistory = [...prev, {
                result: sourceNode.data.result,
                timestamp: sourceNode.data.lastExecuted || new Date().toISOString()
              }];
              return newHistory.slice(-5);
            });
          }
        }
      }
    };

    // Check immediately
    checkForUpdates();

    // Poll every 500ms for updates
    const interval = setInterval(checkForUpdates, 500);

    return () => clearInterval(interval);
  }, [getNodes, getEdges, id, displayResult, data]);

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
      animate={{ 
        opacity: 1, 
        scale: 1,
        boxShadow: isUpdating 
          ? '0 0 0 2px rgba(34, 197, 94, 0.4), 0 0 20px rgba(34, 197, 94, 0.2)'
          : '0 0 0 0px transparent'
      }}
      transition={{ duration: 0.25 }}
      className={`relative w-[340px] rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300
        ${statusBorder[status] || 'border-white/15'}
        ${selected ? 'ring-2 ring-yellow-400/40 ring-offset-1 ring-offset-black' : ''}
        ${isUpdating ? 'border-green-400/60' : ''}
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
          {resultHistory.length > 1 && (
            <span className="flex items-center gap-1 text-[10px] text-blue-400 bg-blue-400/10 border border-blue-400/20 rounded-full px-2 py-0.5">
              {resultHistory.length} updates
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
                {/* Update indicator */}
                {isUpdating && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-3 flex items-center gap-2 text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>Đang cập nhật kết quả mới...</span>
                  </motion.div>
                )}
                
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
