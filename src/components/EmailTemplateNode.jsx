import { useState, memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Play,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  AlertCircle,
  Loader,
  CheckCircle,
  Code,
  Type,
  RefreshCw
} from 'lucide-react';

/**
 * EmailTemplateNode - Build & render email templates with variables
 * Output: { subject, text, html } rendered template
 */
const EmailTemplateNode = memo(({ data, selected, id }) => {
  const [templateName, setTemplateName] = useState(data.templateName || '');
  const [subject, setSubject]           = useState(data.subject || '');
  const [body, setBody]                 = useState(data.body || '');
  const [bodyType, setBodyType]         = useState(data.bodyType || 'text'); // 'text'|'html'|'both'
  const [variables, setVariables]       = useState(data.variables || []); // [{key, value}]
  const [showPreview, setShowPreview]   = useState(false);
  const [preview, setPreview]           = useState(null);
  const [isRendering, setIsRendering]   = useState(false);
  const [isSaving, setIsSaving]         = useState(false);
  const [savedId, setSavedId]           = useState(data.savedTemplateId || null);
  const [error, setError]               = useState('');
  const [activeTab, setActiveTab]       = useState('edit'); // 'edit'|'vars'|'preview'
  const [isNodeHovered, setIsNodeHovered] = useState(false);

  const { label = 'Email Template', hasInput = true, hasOutput = true } = data;

  // Extract {{variable}} from text
  const detectVars = (text) => {
    const matches = [...text.matchAll(/\{\{(\w+)\}\}/g)];
    return [...new Set(matches.map(m => m[1]))];
  };

  // Auto-sync variable keys when subject/body changes
  const syncVarKeys = (newSubject, newBody) => {
    const detected = [...new Set([...detectVars(newSubject), ...detectVars(newBody)])];
    setVariables(prev => {
      const existing = Object.fromEntries(prev.map(v => [v.key, v.value]));
      return detected.map(key => ({ key, value: existing[key] || '' }));
    });
  };

  const handleSubjectChange = (val) => {
    setSubject(val);
    data.subject = val;
    syncVarKeys(val, body);
  };

  const handleBodyChange = (val) => {
    setBody(val);
    data.body = val;
    syncVarKeys(subject, val);
  };

  const updateVarValue = (key, value) => {
    const updated = variables.map(v => v.key === key ? { ...v, value } : v);
    setVariables(updated);
    data.variables = updated;
  };

  // Render template via API
  const renderTemplate = async () => {
    if (!subject || !body) {
      setError('Subject and body are required');
      return;
    }

    setIsRendering(true);
    setError('');

    try {
      const token = localStorage.getItem('office_weave_token') || localStorage.getItem('auth_token');
      const varData = Object.fromEntries(variables.map(v => [v.key, v.value]));

      const response = await fetch('https://back-end-auto-office-f8xt.vercel.app/api/email/template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          template: {
            subject,
            body,
            bodyType,
          },
          data: varData,
        }),
      });

      const res = await response.json();
      // Backend wraps response in { data: { subject, text, html, ... } }
      const payload = res.data || res;

      if (response.ok) {
        const rendered = {
          subject: payload.subject || subject,
          text:    payload.text,
          html:    payload.html,
        };
        setPreview(rendered);
        setShowPreview(true);
        setActiveTab('preview');
        data.result          = rendered;
        data.renderedSubject = rendered.subject;
        data.renderedHtml    = rendered.html;
        data.renderedText    = rendered.text;
        if (data.onNodeResult) data.onNodeResult(id, rendered);
      } else {
        // Fallback: render locally
        const varData2 = Object.fromEntries(variables.map(v => [v.key, v.value]));
        const renderLocal = (text) => {
          let out = text;
          Object.entries(varData2).forEach(([k, v]) => {
            out = out.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v || `{{${k}}}`);
          });
          return out;
        };
        const rendered = {
          subject: renderLocal(subject),
          text:    bodyType !== 'html' ? renderLocal(body) : undefined,
          html:    bodyType !== 'text' ? renderLocal(body) : undefined,
        };
        setPreview(rendered);
        setShowPreview(true);
        setActiveTab('preview');
        data.result = rendered;
        if (data.onNodeResult) data.onNodeResult(id, rendered);
      }
    } catch (err) {
      // Render locally on network error
      const varData2 = Object.fromEntries(variables.map(v => [v.key, v.value]));
      const renderLocal = (text) => {
        let out = text;
        Object.entries(varData2).forEach(([k, v]) => {
          out = out.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v || `{{${k}}}`);
        });
        return out;
      };
      const rendered = {
        subject: renderLocal(subject),
        text:    renderLocal(body),
        html:    `<p>${renderLocal(body).replace(/\n/g, '<br>')}</p>`,
      };
      setPreview(rendered);
      setShowPreview(true);
      setActiveTab('preview');
      data.result = rendered;
      if (data.onNodeResult) data.onNodeResult(id, rendered);
    } finally {
      setIsRendering(false);
    }
  };

  // Save template to backend
  const saveTemplate = async () => {
    if (!templateName || !subject || !body) {
      setError('Name, subject and body are required to save');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('office_weave_token') || localStorage.getItem('auth_token');
      const varKeys = variables.map(v => v.key);

      const method  = savedId ? 'PATCH' : 'POST';
      const url     = savedId
        ? `https://back-end-auto-office-f8xt.vercel.app/api/email/templates/${savedId}`
        : 'https://back-end-auto-office-f8xt.vercel.app/api/email/templates';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name:      templateName,
          subject,
          body_text: bodyType !== 'html' ? body : undefined,
          body_html: bodyType !== 'text' ? body : undefined,
          body_type: bodyType,
          variables: varKeys,
        }),
      });

      const res = await response.json();

      if (response.ok) {
        const tid = res.template?.id || savedId;
        setSavedId(tid);
        data.savedTemplateId = tid;
      } else {
        setError(res.error || 'Failed to save template');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const TABS = ['edit', 'vars', 'preview'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        relative rounded-lg border backdrop-blur-md
        ${selected
          ? 'ring-2 ring-emerald-400/50 ring-offset-1 ring-offset-black border-emerald-400/60'
          : 'border-white/20'}
        bg-black/90 shadow-xl transition-all duration-300
      `}
      style={{ width: 360 }}
      onMouseEnter={() => setIsNodeHovered(true)}
      onMouseLeave={() => setIsNodeHovered(false)}
    >
      {hasInput && (
        <div
          className="absolute"
          style={{ left: -6, top: '50%', transform: 'translateY(-50%)' }}
        >
          <Handle type="target" position={Position.Left}
            className="w-3 h-3 border-2 border-emerald-400/60 bg-emerald-500/20 !relative !transform-none !inset-auto"
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
                <span className="text-xs font-semibold text-emerald-400" style={{ textShadow: '0 0 10px rgba(52,211,153,0.9)' }}>
                  Variables
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
            className="w-3 h-3 border-2 border-emerald-400/60 bg-emerald-500/20 !relative !transform-none !inset-auto"
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
                <span className="text-xs font-semibold text-emerald-400" style={{ textShadow: '0 0 10px rgba(52,211,153,0.9)' }}>
                  Template
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-emerald-500/20 border border-emerald-400/30">
            <FileText size={14} className="text-emerald-400" />
          </div>
          <h3 className="text-xs font-semibold text-white">{label}</h3>
        </div>
        {savedId && (
          <span className="flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] text-emerald-400">
            <CheckCircle size={9} />
            <span>Saved</span>
          </span>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-white/10">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 text-[10px] font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Edit Tab ── */}
      <AnimatePresence mode="wait">
        {activeTab === 'edit' && (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 space-y-3"
          >
            {/* Template name */}
            <div>
              <label className="block text-[10px] text-white/60 mb-1">Template Name</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => { setTemplateName(e.target.value); data.templateName = e.target.value; }}
                placeholder="Welcome Email, Order Confirmation..."
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded text-white placeholder-white/30 text-xs focus:border-emerald-400/40 focus:outline-none"
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[10px] text-white/60 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                placeholder="Hello {{name}}, your order {{orderId}} is ready!"
                className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded text-white placeholder-white/30 text-xs focus:border-emerald-400/40 focus:outline-none"
              />
            </div>

            {/* Body type toggle */}
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-white/60">Body</label>
              <div className="flex rounded overflow-hidden border border-white/10">
                {['text', 'html', 'both'].map(t => (
                  <button
                    key={t}
                    onClick={() => { setBodyType(t); data.bodyType = t; }}
                    className={`px-2 py-1 text-[9px] transition-colors ${
                      bodyType === t
                        ? 'bg-emerald-500/30 text-emerald-300'
                        : 'bg-white/5 text-white/40 hover:bg-white/10'
                    }`}
                  >
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Body textarea */}
            <textarea
              value={body}
              onChange={(e) => handleBodyChange(e.target.value)}
              placeholder={
                bodyType === 'html'
                  ? '<h1>Hello {{name}}</h1>\n<p>Your order {{orderId}} is confirmed.</p>'
                  : 'Hello {{name}},\n\nYour order {{orderId}} is confirmed.\n\nThank you!'
              }
              rows={7}
              className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded text-white placeholder-white/30 text-[10px] resize-none focus:border-emerald-400/40 focus:outline-none nodrag nowheel font-mono leading-relaxed"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
            />

            {/* Detected vars hint */}
            {variables.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {variables.map(v => (
                  <span key={v.key} className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[9px] text-emerald-400">
                    {`{{${v.key}}}`}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={renderTemplate}
                disabled={isRendering || !subject || !body}
                className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded text-[10px] text-emerald-400 hover:bg-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRendering
                  ? <><Loader size={11} className="animate-spin" /><span>Rendering...</span></>
                  : <><Play size={11} /><span>Render</span></>}
              </button>
              <button
                onClick={saveTemplate}
                disabled={isSaving || !templateName || !subject || !body}
                className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded text-[10px] text-white/60 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving
                  ? <><Loader size={11} className="animate-spin" /><span>Saving...</span></>
                  : <><CheckCircle size={11} /><span>{savedId ? 'Update' : 'Save'}</span></>}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Variables Tab ── */}
        {activeTab === 'vars' && (
          <motion.div
            key="vars"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 space-y-3"
          >
            {variables.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-[10px] text-white/40">No variables detected.</p>
                <p className="text-[9px] text-white/30 mt-1">Use {'{{variableName}}'} in subject or body.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] text-white/50">Fill in values for template variables:</p>
                {variables.map(v => (
                  <div key={v.key} className="flex items-center space-x-2">
                    <span className="text-[10px] text-emerald-400 font-mono min-w-[90px] truncate">
                      {`{{${v.key}}}`}
                    </span>
                    <input
                      type="text"
                      value={v.value}
                      onChange={(e) => updateVarValue(v.key, e.target.value)}
                      placeholder={`Enter ${v.key}`}
                      className="flex-1 px-2 py-1.5 bg-gray-800/50 border border-white/10 rounded text-white placeholder-white/30 text-[10px] focus:border-emerald-400/40 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={renderTemplate}
              disabled={isRendering || !subject || !body}
              className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded text-[10px] text-emerald-400 hover:bg-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRendering
                ? <><Loader size={11} className="animate-spin" /><span>Rendering...</span></>
                : <><Play size={11} /><span>Render Preview</span></>}
            </button>
          </motion.div>
        )}

        {/* ── Preview Tab ── */}
        {activeTab === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 space-y-3"
          >
            {!preview ? (
              <div className="text-center py-6">
                <p className="text-[10px] text-white/40">No preview yet.</p>
                <p className="text-[9px] text-white/30 mt-1">Click Render in the Edit tab.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[9px] text-white/40 mb-1 uppercase tracking-wider">Subject</label>
                  <div className="px-3 py-2 bg-gray-800/50 border border-white/10 rounded text-white text-[10px]">
                    {preview.subject}
                  </div>
                </div>
                {preview.text && (
                  <div>
                    <label className="block text-[9px] text-white/40 mb-1 uppercase tracking-wider">Text</label>
                    <div className="px-3 py-2 bg-gray-800/50 border border-white/10 rounded text-white/80 text-[10px] whitespace-pre-wrap max-h-32 overflow-y-auto nodrag nowheel"
                      style={{ scrollbarWidth: 'thin' }}>
                      {preview.text}
                    </div>
                  </div>
                )}
                {preview.html && (
                  <div>
                    <label className="block text-[9px] text-white/40 mb-1 uppercase tracking-wider">HTML Preview</label>
                    <div
                      className="px-3 py-2 bg-white rounded text-gray-800 text-[10px] max-h-32 overflow-y-auto nodrag nowheel"
                      style={{ scrollbarWidth: 'thin' }}
                      dangerouslySetInnerHTML={{ __html: preview.html }}
                    />
                  </div>
                )}
                <button
                  onClick={renderTemplate}
                  className="flex items-center space-x-1 text-[10px] text-white/50 hover:text-white/70 transition-colors"
                >
                  <RefreshCw size={10} />
                  <span>Re-render</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="mx-3 mb-3 flex items-start space-x-1.5 p-2 bg-red-500/10 border border-red-500/20 rounded text-[9px] text-red-400">
          <AlertCircle size={10} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Status dot */}
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-gray-900" />
    </motion.div>
  );
});

EmailTemplateNode.displayName = 'EmailTemplateNode';
export default EmailTemplateNode;
