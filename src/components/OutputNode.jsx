import { memo, useState, useEffect, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, CheckCircle, ChevronDown, ChevronUp,
  FileText, Mail, Filter, LayoutTemplate, Inbox
} from 'lucide-react';

/**
 * OutputNode - Displays AI / Email results
 * - No polling interval (performance fix)
 * - Supports email result types
 */
const OutputNode = memo(({ data, selected, id }) => {
  const [copied, setCopied]           = useState(false);
  const [collapsed, setCollapsed]     = useState(false);
  const [displayResult, setDisplayResult] = useState(data.result || null);
  const [isUpdating, setIsUpdating]   = useState(false);
  const [isNodeHovered, setIsNodeHovered] = useState(false);
  const prevResultRef = useRef(null);

  const {
    label    = 'Output',
    color    = '#f59e0b',
    status   = 'idle',
  } = data;

  // React to result changes pushed from App.jsx (no polling)
  useEffect(() => {
    if (!data.result) return;
    const serialized = JSON.stringify(data.result);
    if (serialized === prevResultRef.current) return;
    prevResultRef.current = serialized;

    setIsUpdating(true);
    setDisplayResult(data.result);
    setTimeout(() => setIsUpdating(false), 1000);
  }, [data.result, data.lastExecuted]);

  // ── Resolve what to display ──────────────────────────────────────────────
  const result = displayResult;

  // Detect result type
  const isEmailList  = Array.isArray(result);
  const isEmailSent  = result?.success === true && result?.messageId;
  const isFiltered   = result?.matched !== undefined;
  const isTemplate   = result?.subject !== undefined && result?.text !== undefined;
  const isAiText     = result?.response || result?.findings || result?.generated ||
                       result?.strategy || result?.imagePrompt || result?.script;

  const responseText = isAiText
    ? (result.response || result.findings || result.generated ||
       result.strategy || result.imagePrompt || result.script)
    : null;

  const handleCopy = () => {
    const text = responseText || JSON.stringify(result, null, 2);
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusBorder = {
    idle:    'border-white/15',
    running: 'border-yellow-400/60',
    success: 'border-green-400/50',
    error:   'border-red-400/50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{
        opacity: 1,
        scale: 1,
        boxShadow: isUpdating
          ? '0 0 0 2px rgba(34,197,94,0.4), 0 0 20px rgba(34,197,94,0.2)'
          : '0 0 0 0px transparent',
      }}
      transition={{ duration: 0.25 }}
      className={`relative rounded-lg border backdrop-blur-md shadow-2xl transition-all duration-300
        ${statusBorder[status] || 'border-white/15'}
        ${selected ? 'ring-2 ring-yellow-400/40 ring-offset-1 ring-offset-black' : ''}
        ${isUpdating ? 'border-green-400/60' : ''}
      `}
      style={{
        background: 'linear-gradient(135deg,rgba(20,20,24,0.97) 0%,rgba(10,10,14,0.99) 100%)',
        width: 360,
      }}
      onMouseEnter={() => setIsNodeHovered(true)}
      onMouseLeave={() => setIsNodeHovered(false)}
    >
      <div
        className="absolute"
        style={{ left: -6, top: '50%', transform: 'translateY(-50%)' }}
      >
        <Handle type="target" position={Position.Left}
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

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
            <FileText size={12} style={{ color }} />
          </div>
          <span className="text-xs font-semibold text-white truncate">{label}</span>
          {isUpdating && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full text-[8px] text-green-400">
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
              Updated
            </span>
          )}
        </div>
        <button onClick={() => setCollapsed(v => !v)}
          className="p-1 rounded hover:bg-white/10 transition-colors">
          {collapsed
            ? <ChevronDown size={14} className="text-white/50" />
            : <ChevronUp   size={14} className="text-white/50" />}
        </button>
      </div>

      {/* ── Body ── */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Running */}
            {status === 'running' && (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] text-white/50">Processing...</p>
              </div>
            )}

            {/* ── Email Sent Result ── */}
            {status !== 'running' && isEmailSent && (
              <div className="p-3 space-y-2">
                <div className="flex items-center space-x-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-green-400">Email Sent!</p>
                    <p className="text-[9px] text-green-400/70 mt-0.5">ID: {result.messageId}</p>
                  </div>
                </div>
                <div className="space-y-1 text-[10px]">
                  {result.to && (
                    <div className="flex items-center space-x-2 text-white/60">
                      <span className="text-white/40 w-12">To:</span>
                      <span className="text-white/80">{result.to}</span>
                    </div>
                  )}
                  {result.subject && (
                    <div className="flex items-center space-x-2 text-white/60">
                      <span className="text-white/40 w-12">Subject:</span>
                      <span className="text-white/80 truncate">{result.subject}</span>
                    </div>
                  )}
                  {result.timestamp && (
                    <div className="flex items-center space-x-2 text-white/60">
                      <span className="text-white/40 w-12">Time:</span>
                      <span className="text-white/60">
                        {new Date(result.timestamp).toLocaleTimeString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Email List Result (from ReadEmailNode) ── */}
            {status !== 'running' && isEmailList && result.length > 0 && (
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Inbox size={12} className="text-blue-400" />
                    <span className="text-[10px] text-white/60">{result.length} emails</span>
                  </div>
                  <button onClick={handleCopy}
                    className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] text-white/50 hover:text-white/80 transition-colors">
                    <Copy size={9} />
                    <span>Copy JSON</span>
                  </button>
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto nodrag nowheel"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                  {result.slice(0, 10).map((email, i) => (
                    <div key={i} className="px-2 py-1.5 bg-gray-800/40 border border-white/10 rounded text-[10px]">
                      <p className="text-white/80 truncate font-medium">
                        {email.headers?.subject || '(no subject)'}
                      </p>
                      <p className="text-white/40 truncate">
                        {email.headers?.from?.address || email.headers?.from || ''}
                      </p>
                    </div>
                  ))}
                  {result.length > 10 && (
                    <p className="text-center text-[9px] text-white/30 py-1">
                      +{result.length - 10} more emails
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ── Filter Result ── */}
            {status !== 'running' && isFiltered && (
              <div className="p-3 space-y-2">
                <div className="flex items-center space-x-1.5 mb-2">
                  <Filter size={12} className="text-yellow-400" />
                  <span className="text-[10px] text-white/60">Filter Result</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-center">
                    <div className="text-lg font-bold text-green-400">{result.matchedCount ?? result.matched?.length}</div>
                    <div className="text-[9px] text-green-400/70">Matched</div>
                  </div>
                  <div className="p-2 bg-white/5 border border-white/10 rounded text-center">
                    <div className="text-lg font-bold text-white/50">{result.unmatchedCount ?? result.unmatched?.length}</div>
                    <div className="text-[9px] text-white/40">Unmatched</div>
                  </div>
                </div>
                {result.matched?.length > 0 && (
                  <div className="space-y-1 max-h-32 overflow-y-auto nodrag nowheel"
                    style={{ scrollbarWidth: 'thin' }}>
                    {result.matched.slice(0, 5).map((email, i) => (
                      <div key={i} className="px-2 py-1 bg-green-500/5 border border-green-500/10 rounded text-[9px] text-white/60 truncate">
                        {email.headers?.subject || '(no subject)'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Template Result ── */}
            {status !== 'running' && isTemplate && !isEmailSent && (
              <div className="p-3 space-y-2">
                <div className="flex items-center space-x-1.5 mb-1">
                  <LayoutTemplate size={12} className="text-emerald-400" />
                  <span className="text-[10px] text-white/60">Rendered Template</span>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <span className="text-[9px] text-white/40 uppercase tracking-wider">Subject</span>
                    <div className="mt-0.5 px-2 py-1.5 bg-gray-800/50 border border-white/10 rounded text-[10px] text-white/80">
                      {result.subject}
                    </div>
                  </div>
                  {result.text && (
                    <div>
                      <span className="text-[9px] text-white/40 uppercase tracking-wider">Body</span>
                      <div className="mt-0.5 px-2 py-1.5 bg-gray-800/50 border border-white/10 rounded text-[10px] text-white/70 max-h-24 overflow-y-auto nodrag nowheel whitespace-pre-wrap"
                        style={{ scrollbarWidth: 'thin' }}>
                        {result.text}
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/30 rounded text-[10px] text-emerald-400 hover:bg-emerald-600/30 transition-colors">
                  {copied ? <><CheckCircle size={11} /><span>Copied</span></> : <><Copy size={11} /><span>Copy</span></>}
                </button>
              </div>
            )}

            {/* ── AI Text Result ── */}
            {status !== 'running' && responseText && (
              <div className="p-3">
                <div
                  className="text-xs text-white/90 leading-relaxed whitespace-pre-wrap min-h-[100px] max-h-[250px] overflow-y-auto p-3 bg-gray-900/50 border border-white/10 rounded-lg mb-3 nodrag nowheel"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
                >
                  {responseText}
                </div>
                <div className="flex items-center justify-between">
                  <button onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-600/20 border border-yellow-500/30 rounded text-[10px] text-yellow-400 hover:bg-yellow-600/30 transition-colors">
                    {copied ? <><CheckCircle size={12} /><span>Copied</span></> : <><Copy size={12} /><span>Copy</span></>}
                  </button>
                  {result?.usage?.total_tokens && (
                    <span className="text-[8px] text-white/30">{result.usage.total_tokens} tokens</span>
                  )}
                </div>
              </div>
            )}

            {/* ── Empty state ── */}
            {status !== 'running' && !result && (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                  <FileText size={16} className="text-white/20" />
                </div>
                <p className="text-[10px] text-white/40">Waiting for result...</p>
                <p className="text-[9px] text-white/25">Connect a node and run it</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Running glow */}
      {status === 'running' && (
        <div className="absolute inset-0 rounded-lg pointer-events-none"
          style={{ boxShadow: '0 0 0 1px rgba(251,191,36,0.3),0 0 20px rgba(251,191,36,0.08)' }} />
      )}
    </motion.div>
  );
});

OutputNode.displayName = 'OutputNode';
export default OutputNode;
