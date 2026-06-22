import { useState, memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Plus,
  Trash2,
  Play,
  AlertCircle,
  Loader,
  CheckCircle,
  ChevronDown
} from 'lucide-react';
import { API_BASE_URL } from '../lib/config.js';

const FIELDS = [
  { value: 'from',    label: 'From' },
  { value: 'to',      label: 'To' },
  { value: 'subject', label: 'Subject' },
  { value: 'body',    label: 'Body' },
  { value: 'date',    label: 'Date' },
  { value: 'flag',    label: 'Flag' },
];

const OPERATORS = {
  from:    ['contains', 'equals', 'startsWith', 'matches'],
  to:      ['contains', 'equals', 'startsWith', 'matches'],
  subject: ['contains', 'equals', 'startsWith', 'endsWith', 'matches'],
  body:    ['contains', 'equals', 'matches'],
  date:    ['before', 'after', 'equals'],
  flag:    ['equals'],
};

const newRule = () => ({ id: Date.now(), field: 'subject', operator: 'contains', value: '' });

/**
 * FilterEmailNode - Filters an array of emails by rules
 * Input:  emails array from ReadEmailNode
 * Output: { matched, unmatched } arrays
 */
const FilterEmailNode = memo(({ data, selected, id }) => {
  const [logic, setLogic]   = useState(data.logic || 'AND');
  const [rules, setRules]   = useState(data.rules?.length ? data.rules : [newRule()]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(data.filterResult || null);
  const [error, setError]   = useState('');
  const [isNodeHovered, setIsNodeHovered] = useState(false);

  const { label = 'Filter Email', hasInput = true, hasOutput = true } = data;

  const syncRules = (updated) => {
    setRules(updated);
    data.rules = updated;
  };

  const addRule = () => syncRules([...rules, newRule()]);

  const removeRule = (ruleId) => syncRules(rules.filter(r => r.id !== ruleId));

  const updateRule = (ruleId, patch) => {
    syncRules(rules.map(r => r.id === ruleId ? { ...r, ...patch } : r));
  };

  // Get emails from connected ReadEmailNode
  const getInputEmails = () => {
    if (!data.getNodes || !data.getEdges) return null;
    const nodes = data.getNodes();
    const edges = data.getEdges();
    const incoming = edges.filter(e => e.target === id);
    for (const edge of incoming) {
      const src = nodes.find(n => n.id === edge.source);
      if (src?.data?.result && Array.isArray(src.data.result)) {
        return src.data.result;
      }
      if (src?.data?.emails && Array.isArray(src.data.emails)) {
        return src.data.emails;
      }
    }
    return null;
  };

  const runFilter = async () => {
    const emails = getInputEmails();
    if (!emails) {
      setError('Connect a Read Email node with fetched emails first');
      return;
    }
    if (emails.length === 0) {
      setError('No emails to filter');
      return;
    }

    const emptyRules = rules.filter(r => !r.value && r.field !== 'isUnread');
    if (emptyRules.length > 0) {
      setError('Fill in all rule values');
      return;
    }

    setIsRunning(true);
    setError('');

    try {
      const token = localStorage.getItem('office_weave_token') || localStorage.getItem('auth_token');

      const response = await fetch(`${API_BASE_URL}/api/email/filter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          emails,
          config: {
            logic,
            rules: rules.map(({ field, operator, value }) => ({ field, operator, value })),
          },
        }),
      });

      const res = await response.json();
      // Backend wraps response in { data: { matched, unmatched, ... } }
      const payload = res.data || res;

      if (response.ok) {
        const filterResult = {
          matched:        payload.matched        || [],
          unmatched:      payload.unmatched      || [],
          matchedCount:   payload.matchedCount   ?? (payload.matched?.length || 0),
          unmatchedCount: payload.unmatchedCount ?? (payload.unmatched?.length || 0),
        };
        setResult(filterResult);
        data.filterResult = filterResult;
        data.result       = filterResult.matched;
        if (data.onNodeResult) data.onNodeResult(id, filterResult.matched);
      } else {
        setError(res.error || res.data?.error || 'Filter failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        relative rounded-lg border backdrop-blur-md
        ${selected
          ? 'ring-2 ring-yellow-400/50 ring-offset-1 ring-offset-black border-yellow-400/60'
          : 'border-white/20'}
        bg-black/90 shadow-xl transition-all duration-300
      `}
      style={{ width: 340 }}
      onMouseEnter={() => setIsNodeHovered(true)}
      onMouseLeave={() => setIsNodeHovered(false)}
    >
      {hasInput && (
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
                  Emails
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      {hasOutput && (
        <div
          className="absolute"
          style={{ right: -6, top: '50%', transform: 'translateY(-50%)' }}
        >
          <Handle type="source" position={Position.Right}
            className="w-3 h-3 border-2 border-yellow-400/60 bg-yellow-500/20 !relative !transform-none !inset-auto"
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
                <span className="text-xs font-semibold text-yellow-400" style={{ textShadow: '0 0 10px rgba(251,191,36,0.9)' }}>
                  Filtered
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-yellow-500/20 border border-yellow-400/30">
            <Filter size={14} className="text-yellow-400" />
          </div>
          <h3 className="text-xs font-semibold text-white">{label}</h3>
        </div>
        {result && (
          <div className="flex items-center space-x-1">
            <span className="px-1.5 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-[9px] text-green-400">
              ✓ {result.matchedCount}
            </span>
            <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-white/40">
              ✗ {result.unmatchedCount}
            </span>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-3 space-y-3">

        {/* Logic toggle */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-white/60">Match</span>
          <div className="flex rounded overflow-hidden border border-white/10">
            {['AND', 'OR'].map(l => (
              <button
                key={l}
                onClick={() => { setLogic(l); data.logic = l; }}
                className={`px-3 py-1 text-[10px] font-medium transition-colors ${
                  logic === l
                    ? 'bg-yellow-500/30 text-yellow-300'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <span className="text-[10px] text-white/60">rules</span>
        </div>

        {/* Rules */}
        <div className="space-y-2">
          {rules.map((rule, idx) => (
            <div key={rule.id} className="flex items-center space-x-1.5">
              {/* Field */}
              <select
                value={rule.field}
                onChange={(e) => updateRule(rule.id, { field: e.target.value, operator: OPERATORS[e.target.value][0] })}
                className="flex-1 px-2 py-1.5 bg-gray-800/50 border border-white/10 rounded text-white text-[10px] focus:border-yellow-400/40 focus:outline-none"
              >
                {FIELDS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>

              {/* Operator */}
              <select
                value={rule.operator}
                onChange={(e) => updateRule(rule.id, { operator: e.target.value })}
                className="flex-1 px-2 py-1.5 bg-gray-800/50 border border-white/10 rounded text-white text-[10px] focus:border-yellow-400/40 focus:outline-none"
              >
                {(OPERATORS[rule.field] || ['contains']).map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>

              {/* Value */}
              {rule.field === 'flag' ? (
                <select
                  value={rule.value}
                  onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                  className="flex-1 px-2 py-1.5 bg-gray-800/50 border border-white/10 rounded text-white text-[10px] focus:border-yellow-400/40 focus:outline-none"
                >
                  <option value="seen">seen</option>
                  <option value="flagged">flagged</option>
                  <option value="answered">answered</option>
                  <option value="draft">draft</option>
                  <option value="deleted">deleted</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={rule.value}
                  onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                  placeholder="value"
                  className="flex-1 px-2 py-1.5 bg-gray-800/50 border border-white/10 rounded text-white placeholder-white/30 text-[10px] focus:border-yellow-400/40 focus:outline-none"
                />
              )}

              {/* Remove */}
              <button
                onClick={() => removeRule(rule.id)}
                disabled={rules.length === 1}
                className="p-1 hover:bg-red-500/20 rounded transition-colors disabled:opacity-30"
              >
                <Trash2 size={11} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>

        {/* Add rule */}
        <button
          onClick={addRule}
          className="flex items-center space-x-1 text-[10px] text-white/50 hover:text-white/70 transition-colors"
        >
          <Plus size={11} />
          <span>Add rule</span>
        </button>

        {/* Run button */}
        <button
          onClick={runFilter}
          disabled={isRunning}
          className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-yellow-600/20 border border-yellow-500/30 rounded text-[10px] text-yellow-400 hover:bg-yellow-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning
            ? <><Loader size={11} className="animate-spin" /><span>Filtering...</span></>
            : <><Play size={11} /><span>Run Filter</span></>}
        </button>

        {/* Error */}
        {error && (
          <div className="flex items-start space-x-1.5 p-2 bg-red-500/10 border border-red-500/20 rounded text-[9px] text-red-400">
            <AlertCircle size={10} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Result summary */}
        {result && (
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-center">
              <div className="text-sm font-bold text-green-400">{result.matchedCount}</div>
              <div className="text-[9px] text-green-400/70">Matched</div>
            </div>
            <div className="p-2 bg-white/5 border border-white/10 rounded text-center">
              <div className="text-sm font-bold text-white/50">{result.unmatchedCount}</div>
              <div className="text-[9px] text-white/40">Unmatched</div>
            </div>
          </div>
        )}
      </div>

      {/* Status dot */}
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-yellow-500 rounded-full border-2 border-gray-900" />
    </motion.div>
  );
});

FilterEmailNode.displayName = 'FilterEmailNode';
export default FilterEmailNode;
