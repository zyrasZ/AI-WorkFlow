import { useState, useEffect, memo, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Code,
  TrendingUp,
  Lightbulb,
  Video,
  Eye
} from 'lucide-react';
import engine from '../engine/Engine.js';

// Pillar icons mapping
const pillarIcons = {
  research: Search,
  code: Code,
  marketing: TrendingUp,
  imagine: Lightbulb,
  video: Video
};

// Status color mapping
const statusColors = {
  idle: 'border-white/20 bg-black/40',
  running: 'border-blue-400/60 bg-blue-900/20 shadow-blue-500/20',
  success: 'border-green-400/60 bg-green-900/20 shadow-green-500/20',
  error: 'border-red-400/60 bg-red-900/20 shadow-red-500/20'
};

const statusIcons = {
  idle: Clock,
  running: Play,
  success: CheckCircle,
  error: XCircle
};

/**
 * GhostNode - Figma Weave style node with preview and glassmorphism
 */
const GhostNode = memo(({ data, selected, id }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [localFields, setLocalFields] = useState(data.fields || []);
  const [localResult, setLocalResult] = useState(data.result || null);
  const [isNodeHovered, setIsNodeHovered] = useState(false);
  const isProcessingRef = useRef(false); // Ref to avoid stale closure issues

  // Thêm props để lấy nodes và edges từ React Flow
  const { getNodes, getEdges } = data;

  const {
    label,
    pillar = 'research',
    color = '#3b82f6',
    status = 'idle',
    hasInput = true,
    hasOutput = true,
    processor,
    preview,
    result,        // từ workflow execution (App.jsx setNodes)
    hasUpdatedInput = false, // Flag to show input has changed
    inputPrompt    // New input from connected PromptNode
  } = data;

  // Sync result từ workflow vào local state
  useEffect(() => {
    if (result) setLocalResult(result);
  }, [result]);

  // Safety reset: if node gets new inputPrompt while stuck, unblock
  useEffect(() => {
    if (data.inputPrompt && isProcessingRef.current === false) {
      setIsProcessing(false);
    }
  }, [data.inputPrompt]);

  // Luôn ưu tiên result mới nhất
  const displayResult = result || localResult;

  // Sync local fields with data.fields
  useEffect(() => {
    setLocalFields(data.fields || []);
  }, [data.fields]);

  // Get pillar icon
  const PillarIcon = pillarIcons[pillar] || Search;
  const StatusIcon = statusIcons[status] || Clock;

  // Execute the node's data processor
  const executeProcessor = async () => {
    // Get processor: from data directly, or look up in engine registry by nodeType
    const currentProcessor = data.processor
      || processor
      || engine.nodeRegistry.get(data.nodeType)
      || engine.nodeRegistry.get(data.pillar);

    if (!currentProcessor) {
      console.warn('⚠️ No processor found for node:', id, data.label, 'nodeType:', data.nodeType);
      alert(`Không tìm thấy processor cho node "${data.label}". Thử xóa và thêm lại node.`);
      return;
    }
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsProcessing(true);

    data.fields = localFields;
    data.hasUpdatedInput = false;

    // Tìm PromptNode được kết nối với node này
    let promptFromConnectedNode = '';
    if (getNodes && getEdges) {
      const allNodes = getNodes();
      const allEdges = getEdges();
      
      // Tìm edge nào có target là node hiện tại
      const incomingEdges = allEdges.filter(e => e.target === id);
      
      // Tìm PromptNode trong các source nodes
      for (const edge of incomingEdges) {
        const sourceNode = allNodes.find(n => n.id === edge.source);
        if (sourceNode && (sourceNode.type === 'promptNode' || sourceNode.data.nodeType === 'prompt-input')) {
          promptFromConnectedNode = sourceNode.data.value || sourceNode.data.prompt || '';
          console.log('📥 Found connected PromptNode:', sourceNode.data.label, 'with prompt:', promptFromConnectedNode);
          break;
        }
      }
    }

    // Tìm field có label "Prompt" (nếu có)
    const promptField = localFields.find(f =>
      f.label?.toLowerCase().includes('prompt') ||
      f.type === 'textarea'
    );
    const fieldPrompt = promptField?.value?.trim() || '';

    // Priority: inputPrompt (from update) > connected PromptNode > field prompt > data prompt
    const finalPrompt = data.inputPrompt || promptFromConnectedNode || fieldPrompt || (data.value || data.prompt || '').trim();

    console.log('🔍 executeProcessor debug:', {
      inputPrompt: data.inputPrompt,
      promptFromConnectedNode,
      fieldPrompt,
      finalPrompt,
      nodeId: id
    });

    const inputs = finalPrompt ? { prompt: finalPrompt, value: finalPrompt } : {};

    try {
      const result = await currentProcessor(data, inputs);
      console.log('✅ Node execution result:', result);
      setLocalResult(result);
      data.result = result;
      data.lastExecuted = new Date().toISOString();
      
      if (data.onNodeResult) {
        data.onNodeResult(id, result);
      }
    } catch (error) {
      console.error('❌ Node execution failed:', error);
      alert(`Lỗi: ${error.message}`);
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        relative min-w-[220px] max-w-[240px] rounded-lg border backdrop-blur-md
        ${statusColors[status]}
        ${selected ? 'ring-2 ring-blue-400/50 ring-offset-1 ring-offset-black' : ''}
        ${status === 'running' ? 'animate-pulse' : ''}
        transition-all duration-300 shadow-xl
      `}
      style={{
        background: `linear-gradient(135deg, 
          rgba(255,255,255,0.08) 0%, 
          rgba(255,255,255,0.02) 100%
        )`
      }}
      onMouseEnter={() => setIsNodeHovered(true)}
      onMouseLeave={() => setIsNodeHovered(false)}
    >
      {/* Input Handle */}
      {hasInput && (
        <div
          className="absolute"
          style={{ left: -6, top: '50%', transform: 'translateY(-50%)' }}
        >
          <Handle
            type="target"
            position={Position.Left}
            className="w-3 h-3 border-2 border-white/40 bg-black/60 backdrop-blur-sm !relative !transform-none !inset-auto"
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
                <span className="text-xs font-semibold text-white/70" style={{ textShadow: '0 0 10px rgba(255,255,255,0.9)' }}>
                  Input
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Output Handle */}
      {hasOutput && (
        <div
          className="absolute"
          style={{ right: -6, top: '50%', transform: 'translateY(-50%)' }}
        >
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 border-2 border-white/40 bg-black/60 backdrop-blur-sm !relative !transform-none !inset-auto"
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
                <span className="text-xs font-semibold text-white/70" style={{ textShadow: '0 0 10px rgba(255,255,255,0.9)' }}>
                  Output
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Preview Area */}
      {preview && (
        <div className="p-2 pb-0">
          <div className="aspect-video bg-black/60 rounded border border-white/10 overflow-hidden relative group">
            {preview.type === 'image' ? (
              <img 
                src={preview.url || '/api/placeholder/180/101'} 
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : preview.type === 'video' ? (
              <video 
                src={preview.url}
                className="w-full h-full object-cover"
                muted
                loop
                autoPlay
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <PillarIcon size={14} className="text-white/40 mx-auto mb-0.5" />
                  <p className="text-[9px] text-white/60">No preview</p>
                </div>
              </div>
            )}
            
            {/* Preview Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button className="p-1 bg-black/60 backdrop-blur-sm rounded-full border border-white/20">
                <Eye size={12} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5 flex-1">
            {/* Pillar Icon */}
            <div 
              className="p-1.5 rounded backdrop-blur-sm"
              style={{ 
                backgroundColor: `${color}20`, 
                border: `1px solid ${color}40`,
                color 
              }}
            >
              <PillarIcon size={14} />
            </div>

            {/* Node Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-medium text-white truncate">
                {label}
              </h3>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center">
            <StatusIcon 
              size={11} 
              className={`
                ${status === 'running' ? 'text-blue-400 animate-spin' : ''}
                ${status === 'success' ? 'text-green-400' : ''}
                ${status === 'error' ? 'text-red-400' : ''}
                ${status === 'idle' ? 'text-white/40' : ''}
              `}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <button
          onClick={executeProcessor}
          disabled={isProcessing}
          className={`
            w-full flex items-center justify-center space-x-0.5 px-2 py-1 text-[8px] font-medium 
            ${hasUpdatedInput ? 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-400/40 text-yellow-300' : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'}
            disabled:bg-white/5 disabled:opacity-50 rounded transition-colors border
          `}
        >
          {isProcessing ? (
            <>
              <div className="w-1.5 h-1.5 border border-white border-t-transparent rounded-full animate-spin" />
              <span>Run...</span>
            </>
          ) : (
            <>
              <Play size={7} />
              <span>{hasUpdatedInput ? 'Run*' : 'Run'}</span>
            </>
          )}
        </button>
      </div>

      {/* Expanded Content - REMOVED */}

      {/* Result Display */}
      {displayResult && (
        <div className="border-t border-white/10 p-2.5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-white/70">Result</span>
              <button
                onClick={() => {
                  const text = displayResult.response || displayResult.generated || displayResult.findings || displayResult.strategy || '';
                  if (text) navigator.clipboard.writeText(text);
                }}
                className="text-[9px] text-white/40 hover:text-white/70 px-1 py-0.5 rounded border border-white/10 hover:border-white/20 transition-colors"
              >
                Copy
              </button>
            </div>

            <div
              className="p-2 bg-black/50 border border-white/10 rounded max-h-[140px] overflow-y-auto text-[10px] leading-relaxed nodrag nowheel"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
            >
              {displayResult.response && (
                <p className="text-white/90 whitespace-pre-wrap">{displayResult.response}</p>
              )}
              {displayResult.generated && (
                <pre className="text-green-400 whitespace-pre-wrap font-mono">{displayResult.generated}</pre>
              )}
              {displayResult.findings && (
                <p className="text-blue-400 whitespace-pre-wrap">{displayResult.findings}</p>
              )}
              {displayResult.strategy && (
                <p className="text-purple-400 whitespace-pre-wrap">{displayResult.strategy}</p>
              )}
              {displayResult.imagePrompt && (
                <p className="text-pink-400 whitespace-pre-wrap">{displayResult.imagePrompt}</p>
              )}
              {displayResult.script && (
                <p className="text-orange-400 whitespace-pre-wrap">{displayResult.script}</p>
              )}
            </div>

            {displayResult.usage?.total_tokens && (
              <div className="text-[8px] text-white/30">
                {displayResult.usage.total_tokens}t
              </div>
            )}
          </div>
        </div> 
      )}

      {/* Pillar Badge - REMOVED */}

      {/* Processing Overlay */}
      {status === 'running' && (
        <div className="absolute inset-0 bg-blue-500/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-1" />
            <p className="text-[9px] text-blue-400">Processing...</p>
          </div>
        </div>
      )}
    </motion.div>
  );
});

GhostNode.displayName = 'GhostNode';

export default GhostNode;