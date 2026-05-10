import { useState, memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Loader,
  Paperclip,
  X,
  ChevronDown,
  Code,
  Type
} from 'lucide-react';

/**
 * SendEmailNode - Enhanced node for sending emails via Gmail SMTP
 * Features:
 * - Template support with variables
 * - Attachments
 * - CC/BCC fields
 * - HTML/Text mode
 * - Connects to EmailAccountNode for credentials
 */
const SendEmailNode = memo(({ data, selected, id }) => {
  const [to, setTo] = useState(data.to || '');
  const [cc, setCc] = useState(data.cc || '');
  const [bcc, setBcc] = useState(data.bcc || '');
  const [subject, setSubject] = useState(data.subject || '');
  const [body, setBody] = useState(data.body || '');
  const [isHtmlMode, setIsHtmlMode] = useState(data.isHtmlMode || false);
  const [attachments, setAttachments] = useState(data.attachments || []);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useTemplate, setUseTemplate] = useState(data.useTemplate || false);
  const [templateVars, setTemplateVars] = useState(data.templateVars || {});
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null); // 'success' | 'error' | null
  const [statusMessage, setStatusMessage] = useState('');

  const {
    label = 'Send Email',
    hasInput = true,
    hasOutput = true,
    getNodes,
    getEdges
  } = data;

  // Extract template variables from subject and body
  const extractVariables = (text) => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = [...text.matchAll(regex)];
    return [...new Set(matches.map(m => m[1]))];
  };

  // Get all variables from subject and body
  const allVariables = [
    ...extractVariables(subject),
    ...extractVariables(body)
  ];

  // Render template with variables
  const renderTemplate = (text, vars) => {
    let rendered = text;
    Object.keys(vars).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      rendered = rendered.replace(regex, vars[key] || '');
    });
    return rendered;
  };

  // Handle file upload for attachments
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map(file => ({
      id: `${Date.now()}-${file.name}`,
      filename: file.name,
      contentType: file.type,
      size: file.size,
      file: file // Store file object for later upload
    }));
    
    const updated = [...attachments, ...newAttachments];
    setAttachments(updated);
    data.attachments = updated;
  };

  // Remove attachment
  const removeAttachment = (id) => {
    const updated = attachments.filter(a => a.id !== id);
    setAttachments(updated);
    data.attachments = updated;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get email credentials from connected EmailAccountNode
  const getEmailCredentials = () => {
    if (!getNodes || !getEdges) return null;

    const allNodes = getNodes();
    const allEdges = getEdges();
    const incomingEdges = allEdges.filter(e => e.target === id);

    for (const edge of incomingEdges) {
      const sourceNode = allNodes.find(n => n.id === edge.source);
      if (!sourceNode) continue;
      const nd = sourceNode.data;
      const val = nd.value || {};

      // OAuth mode
      if (val.mode === 'oauth' || nd.mode === 'oauth') {
        const gmailToken = localStorage.getItem('gmail_access_token');
        if (gmailToken) {
          return {
            mode: 'oauth',
            email: (val.email || nd.email || '').trim(),
            gmailAccessToken: gmailToken,
            gmailRefreshToken: localStorage.getItem('gmail_refresh_token') || undefined,
          };
        }
      }

      // SMTP mode (fallback)
      if (val.email && val.password) {
        return {
          mode: 'smtp',
          email:    val.email.trim(),
          password: val.password.trim(),
          host:     val.host || 'smtp.gmail.com',
          port:     val.port || 587,
        };
      }
      if (nd.email && nd.password) {
        return {
          mode: 'smtp',
          email:    nd.email.trim(),
          password: nd.password.trim(),
          host:     nd.host || 'smtp.gmail.com',
          port:     nd.port || 587,
        };
      }
    }
    return null;
  };

  // Handle send email with enhanced features
  const handleSendEmail = async () => {
    const credentials = getEmailCredentials();
    
    if (!credentials) {
      setSendStatus('error');
      setStatusMessage('Connect to Email Account node first');
      setTimeout(() => setSendStatus(null), 3000);
      return;
    }

    if (!to || !subject) {
      setSendStatus('error');
      setStatusMessage('To and Subject are required');
      setTimeout(() => setSendStatus(null), 3000);
      return;
    }

    // Validate template variables if using template
    if (useTemplate && allVariables.length > 0) {
      const missingVars = allVariables.filter(v => !templateVars[v]);
      if (missingVars.length > 0) {
        setSendStatus('error');
        setStatusMessage(`Missing variables: ${missingVars.join(', ')}`);
        setTimeout(() => setSendStatus(null), 3000);
        return;
      }
    }

    setIsSending(true);
    setSendStatus(null);

    try {
      const token = localStorage.getItem('office_weave_token') || localStorage.getItem('auth_token');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Render template if enabled
      const finalSubject = useTemplate ? renderTemplate(subject, templateVars) : subject;
      const finalBody = useTemplate ? renderTemplate(body, templateVars) : body;

      // Convert attachments to base64 if any
      const attachmentsData = await Promise.all(
        attachments.map(async (att) => {
          if (att.file) {
            const base64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result.split(',')[1]);
              reader.readAsDataURL(att.file);
            });
            return {
              filename: att.filename,
              content: base64,
              contentType: att.contentType
            };
          }
          return null;
        })
      );

      const validAttachments = attachmentsData.filter(a => a !== null);

      // Prepare email data — backend expects { address: string } not { email: string }
      const emailData = {
        to: to.split(',').map(e => ({ address: e.trim() })).filter(e => e.address),
        subject: finalSubject,
        body: {},
      };

      // Add CC/BCC if provided
      if (cc) {
        emailData.cc = cc.split(',').map(e => ({ address: e.trim() })).filter(e => e.address);
      }
      if (bcc) {
        emailData.bcc = bcc.split(',').map(e => ({ address: e.trim() })).filter(e => e.address);
      }

      // Add body based on mode — backend expects email.body.text / email.body.html
      if (isHtmlMode) {
        emailData.body.html = finalBody;
        emailData.body.text = finalBody.replace(/<[^>]*>/g, '');
      } else {
        emailData.body.text = finalBody;
        emailData.body.html = `<p>${finalBody.replace(/\n/g, '<br>')}</p>`;
      }

      // Add attachments if any
      if (validAttachments.length > 0) {
        emailData.attachments = validAttachments;
      }

      const clientId     = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
      const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';

      const requestBody = credentials.mode === 'oauth'
        ? {
            provider: 'gmail',
            config: {
              provider: 'gmail',
              clientId,
              clientSecret,
              credentials: {
                type: 'oauth2',
                accessToken: credentials.gmailAccessToken,
                refreshToken: credentials.gmailRefreshToken,
              },
            },
            email: emailData,
          }
        : {
            provider: 'smtp',
            config: {
              provider: 'smtp',
              host: credentials.host || 'smtp.gmail.com',
              port: credentials.port || 587,
              secure: (credentials.port || 587) === 465,
              credentials: {
                type: 'password',
                username: credentials.email,
                password: credentials.password,
              },
            },
            email: emailData,
          };

      console.log('📧 Sending email:', {
        to: emailData.to,
        subject: finalSubject,
        hasAttachments: validAttachments.length > 0,
        isHtml: isHtmlMode,
        useTemplate,
      });
      
      const response = await fetch('https://back-end-auto-office-f8xt.vercel.app/api/email/send', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      console.log('📬 Send email response:', response.status, JSON.stringify(result));

      if (response.ok && (result.success || result.data?.success)) {
        setSendStatus('success');
        setStatusMessage('Email sent successfully!');
        setTimeout(() => { setSendStatus(null); setStatusMessage(''); }, 5000);
        
        data.result = {
          success: true,
          messageId: result.messageId,
          timestamp: result.timestamp,
          to,
          subject: finalSubject,
          attachmentCount: validAttachments.length
        };
        
        if (data.onNodeResult) {
          data.onNodeResult(id, data.result);
        }
      } else {
        const isAuthError = response.status === 401 || result.code === 'AUTH_ERROR';
        setSendStatus('error');
        setStatusMessage(
          isAuthError
            ? 'Session expired — please log out and log in again'
            : result.error || result.message || `Error ${response.status}`
        );
      }
    } catch (error) {
      console.error('Send email error:', error);
      setSendStatus('error');
      setStatusMessage(error.message || 'Network error. Please try again.');
      setTimeout(() => { setSendStatus(null); setStatusMessage(''); }, 5000);
    } finally {
      setIsSending(false);
    }
  };

  // Update data when fields change (removed to prevent infinite loop)
  // Data is updated directly in onChange handlers

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        relative rounded-lg border backdrop-blur-md
        ${selected ? 'ring-2 ring-orange-400/50 ring-offset-1 ring-offset-black border-orange-400/60' : 'border-white/20'}
        bg-black/90 backdrop-blur-md
        shadow-xl transition-all duration-300
      `}
      style={{ width: 350 }}
    >
      {/* Input Handle */}
      {hasInput && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 border-2 border-orange-400/60 bg-orange-500/20 backdrop-blur-sm"
          style={{ left: -6 }}
        />
      )}

      {/* Output Handle */}
      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 border-2 border-orange-400/60 bg-orange-500/20 backdrop-blur-sm"
          style={{ right: -6 }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-orange-500/20 border border-orange-400/30">
            <Mail size={14} className="text-orange-400" />
          </div>
          <h3 className="text-xs font-semibold text-white truncate">
            {label}
          </h3>
        </div>

        {/* Status Indicator */}
        {sendStatus && (
          <div className="flex items-center">
            {sendStatus === 'success' ? (
              <CheckCircle size={16} className="text-green-400" />
            ) : (
              <AlertCircle size={16} className="text-red-400" />
            )}
          </div>
        )}
      </div>

      {/* Form */}
      <div className="p-3 space-y-3">
        {/* To */}
        <div>
          <label className="block text-[10px] text-white/60 mb-1">To (comma separated)</label>
          <input
            type="text"
            value={to}
            onChange={(e) => {
              const newTo = e.target.value;
              setTo(newTo);
              data.to = newTo;
            }}
            placeholder="recipient@example.com, another@example.com"
            className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 text-xs focus:border-orange-400/40 focus:outline-none focus:ring-1 focus:ring-orange-400/20 transition-all duration-200"
          />
        </div>

        {/* Advanced Fields Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-1 text-[10px] text-white/60 hover:text-white/80 transition-colors"
        >
          <ChevronDown size={12} className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          <span>Advanced options</span>
        </button>

        {/* CC/BCC Fields */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 overflow-hidden"
            >
              <div>
                <label className="block text-[10px] text-white/60 mb-1">CC (optional)</label>
                <input
                  type="text"
                  value={cc}
                  onChange={(e) => {
                    const newCc = e.target.value;
                    setCc(newCc);
                    data.cc = newCc;
                  }}
                  placeholder="cc@example.com"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 text-xs focus:border-orange-400/40 focus:outline-none focus:ring-1 focus:ring-orange-400/20 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-[10px] text-white/60 mb-1">BCC (optional)</label>
                <input
                  type="text"
                  value={bcc}
                  onChange={(e) => {
                    const newBcc = e.target.value;
                    setBcc(newBcc);
                    data.bcc = newBcc;
                  }}
                  placeholder="bcc@example.com"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 text-xs focus:border-orange-400/40 focus:outline-none focus:ring-1 focus:ring-orange-400/20 transition-all duration-200"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subject */}
        <div>
          <label className="block text-[10px] text-white/60 mb-1">
            Subject {useTemplate && <span className="text-orange-400">(Template mode)</span>}
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => {
              const newSubject = e.target.value;
              setSubject(newSubject);
              data.subject = newSubject;
            }}
            placeholder={useTemplate ? "Order {{orderId}} - {{customerName}}" : "Email subject"}
            className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 text-xs focus:border-orange-400/40 focus:outline-none focus:ring-1 focus:ring-orange-400/20 transition-all duration-200"
          />
        </div>

        {/* Body Mode Toggle */}
        <div className="flex items-center justify-between">
          <label className="block text-[10px] text-white/60">Message</label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setIsHtmlMode(!isHtmlMode);
                data.isHtmlMode = !isHtmlMode;
              }}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-[9px] transition-colors ${
                isHtmlMode 
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                  : 'bg-white/5 text-white/60 border border-white/10'
              }`}
            >
              {isHtmlMode ? <Code size={10} /> : <Type size={10} />}
              <span>{isHtmlMode ? 'HTML' : 'Text'}</span>
            </button>
            
            <button
              onClick={() => {
                setUseTemplate(!useTemplate);
                data.useTemplate = !useTemplate;
              }}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-[9px] transition-colors ${
                useTemplate 
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                  : 'bg-white/5 text-white/60 border border-white/10'
              }`}
            >
              <span>{'{{'}</span>
              <span>Template</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div>
          <textarea
            value={body}
            onChange={(e) => {
              const newBody = e.target.value;
              setBody(newBody);
              data.body = newBody;
            }}
            placeholder={
              useTemplate 
                ? "Hello {{name}},\n\nYour order {{orderId}} is ready!" 
                : isHtmlMode 
                  ? "<h1>Hello</h1>\n<p>Email body...</p>" 
                  : "Email body..."
            }
            rows={6}
            className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 text-xs resize-none focus:border-orange-400/40 focus:outline-none focus:ring-1 focus:ring-orange-400/20 transition-all duration-200 nodrag nowheel font-mono"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
          />
        </div>

        {/* Template Variables */}
        {useTemplate && allVariables.length > 0 && (
          <div className="space-y-2">
            <label className="block text-[10px] text-white/60">Template Variables</label>
            {allVariables.map((varName) => (
              <div key={varName} className="flex items-center space-x-2">
                <span className="text-[10px] text-purple-400 min-w-[80px]">{'{{' + varName + '}}'}</span>
                <input
                  type="text"
                  value={templateVars[varName] || ''}
                  onChange={(e) => {
                    const newVars = { ...templateVars, [varName]: e.target.value };
                    setTemplateVars(newVars);
                    data.templateVars = newVars;
                  }}
                  placeholder={`Enter ${varName}`}
                  className="flex-1 px-2 py-1 bg-gray-800/50 border border-white/10 rounded text-white placeholder-white/40 text-[10px] focus:border-purple-400/40 focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}

        {/* Attachments */}
        <div>
          <label className="block text-[10px] text-white/60 mb-1">Attachments</label>
          
          {/* Attachment List */}
          {attachments.length > 0 && (
            <div className="space-y-1 mb-2">
              {attachments.map((att) => (
                <div key={att.id} className="flex items-center justify-between px-2 py-1 bg-gray-800/50 border border-white/10 rounded text-[10px]">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <Paperclip size={10} className="text-orange-400 flex-shrink-0" />
                    <span className="text-white/80 truncate">{att.filename}</span>
                    <span className="text-white/40 flex-shrink-0">({formatFileSize(att.size)})</span>
                  </div>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="ml-2 p-1 hover:bg-red-500/20 rounded transition-colors flex-shrink-0"
                  >
                    <X size={10} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          <label className="flex items-center justify-center space-x-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-[10px] text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors cursor-pointer">
            <Paperclip size={12} />
            <span>Add attachment</span>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendEmail}
          disabled={isSending || !to || !subject}
          className="w-full flex items-center justify-center space-x-1 px-3 py-2 bg-orange-600/20 border border-orange-500/30 rounded text-[10px] text-orange-400 hover:bg-orange-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSending ? (
            <>
              <Loader size={12} className="animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send size={12} />
              <span>Send Email</span>
            </>
          )}
        </button>

        {/* Status Message */}
        {statusMessage && (
          <div className={`text-[9px] p-2 rounded ${
            sendStatus === 'success' 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {statusMessage}
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-white rounded-full" />
      </div>
    </motion.div>
  );
});

SendEmailNode.displayName = 'SendEmailNode';

export default SendEmailNode;
