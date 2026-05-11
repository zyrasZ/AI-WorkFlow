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
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase.js';

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
  const [attachments, setAttachments] = useState(data.attachments || []);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null); // 'success' | 'error' | null
  const [statusMessage, setStatusMessage] = useState('');
  const [isNodeHovered, setIsNodeHovered] = useState(false);

  const {
    label = 'Send Email',
    hasInput = true,
    hasOutput = true,
    getNodes,
    getEdges
  } = data;

  // Get AI-generated body from connected AI node (via "ai-input" handle)
  const getAIBody = () => {
    if (!getNodes || !getEdges) return null;
    const allNodes = getNodes();
    const allEdges = getEdges();
    const aiEdge = allEdges.find(e => e.target === id && e.targetHandle === 'ai-input');
    if (!aiEdge) return null;
    const sourceNode = allNodes.find(n => n.id === aiEdge.source);
    if (!sourceNode) return null;
    const nd = sourceNode.data;

    // GhostNode stores AI result in data.result with various field names
    if (nd.result) {
      return nd.result.response      // AI chat response (most common)
          || nd.result.generated     // Code generator
          || nd.result.findings      // Research node
          || nd.result.strategy      // Marketing node
          || nd.result.imagePrompt   // Image node
          || nd.result.script        // Video node
          || nd.result.output        // Generic output
          || (typeof nd.result === 'string' ? nd.result : null);
    }

    // PromptNode stores text directly in data.value / data.prompt
    if (typeof nd.value === 'string' && nd.value) return nd.value;
    if (typeof nd.prompt === 'string' && nd.prompt) return nd.prompt;

    // EmailTemplateNode
    if (nd.renderedText) return nd.renderedText;
    if (nd.renderedHtml) return nd.renderedHtml;

    return null;
  };

  // Get recipient address from connected node (via "to-input" handle)
  const getRecipientFromNode = () => {
    if (!getNodes || !getEdges) return null;
    const allNodes = getNodes();
    const allEdges = getEdges();
    const toEdge = allEdges.find(e => e.target === id && e.targetHandle === 'to-input');
    if (!toEdge) return null;
    const sourceNode = allNodes.find(n => n.id === toEdge.source);
    if (!sourceNode) return null;
    const nd = sourceNode.data;
    // Support common fields: email, to, address, output, value
    return nd.email || nd.to || nd.address || nd.output || nd.value || null;
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

    // Refresh Gmail access token using Supabase session
  const refreshGmailToken = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.provider_token) {
        localStorage.setItem('gmail_access_token', session.provider_token);
        if (session.provider_refresh_token) {
          localStorage.setItem('gmail_refresh_token', session.provider_refresh_token);
        }
        return {
          accessToken: session.provider_token,
          refreshToken: session.provider_refresh_token || localStorage.getItem('gmail_refresh_token'),
        };
      }
    } catch (e) {
      console.warn('Could not refresh via Supabase session:', e.message);
    }
    return null;
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
        // Priority: per-node token stored in data.value → global localStorage fallback
        const nodeToken = val.gmailAccessToken || nd.gmailAccessToken;
        const gmailToken = nodeToken || localStorage.getItem('gmail_access_token');
        if (gmailToken) {
          return {
            mode: 'oauth',
            email: (val.email || nd.email || '').trim(),
            gmailAccessToken: gmailToken,
            gmailRefreshToken: val.gmailRefreshToken || localStorage.getItem('gmail_refresh_token') || undefined,
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

    if (!to && !getRecipientFromNode()) {
      setSendStatus('error');
      setStatusMessage('To and Subject are required');
      setTimeout(() => setSendStatus(null), 3000);
      return;
    }

    if (!subject) {
      setSendStatus('error');
      setStatusMessage('Subject is required');
      setTimeout(() => setSendStatus(null), 3000);
      return;
    }

    // Get body from AI node or fallback to empty
    const aiBody = getAIBody();
    const finalBody = typeof aiBody === 'string' ? aiBody : (aiBody ? JSON.stringify(aiBody) : '');

    // Always get freshest tokens from Supabase session first
    if (credentials.mode === 'oauth') {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.provider_token) {
          credentials.gmailAccessToken = session.provider_token;
          localStorage.setItem('gmail_access_token', session.provider_token);
        }
        if (session?.provider_refresh_token) {
          credentials.gmailRefreshToken = session.provider_refresh_token;
          localStorage.setItem('gmail_refresh_token', session.provider_refresh_token);
        }
      } catch (e) {
        console.warn('Could not get tokens from Supabase session:', e.message);
      }
    }

    // Merge recipient: node connection takes priority, fallback to manual input
    const nodeRecipient = getRecipientFromNode();
    const finalTo = nodeRecipient
      ? (typeof nodeRecipient === 'string' ? nodeRecipient : JSON.stringify(nodeRecipient))
      : to;

    setIsSending(true);
    setSendStatus(null);

    try {
      // Use office_weave_token as Authorization — matches backend expectation
      const token = localStorage.getItem('office_weave_token') || localStorage.getItem('auth_token');
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };

      // Render template if enabled
      const finalSubject = subject;

      // Convert attachments to base64 if any
      const attachmentsData = await Promise.all(
        attachments.map(async (att) => {
          // att.file must be a real File/Blob — skip if missing or invalid (e.g. restored from saved state)
          if (!att.file || !(att.file instanceof Blob)) return null;
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = () => reject(new Error(`Failed to read file: ${att.filename}`));
            reader.readAsDataURL(att.file);
          });
          return {
            filename: att.filename,
            content: base64,
            contentType: att.contentType
          };
        })
      );

      const validAttachments = attachmentsData.filter(a => a !== null);

      // Prepare email data — backend expects { address: string } not { email: string }
      const emailData = {
        to: finalTo.split(',').map(e => ({ address: e.trim() })).filter(e => e.address),
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

      // Add body — always plain text from AI output
      emailData.body.text = finalBody;
      emailData.body.html = `<p>${finalBody.replace(/\n/g, '<br>')}</p>`;

      // Add attachments if any
      if (validAttachments.length > 0) {
        emailData.attachments = validAttachments;
      }

      const requestBody = credentials.mode === 'oauth'
        ? {
            provider: 'gmail',
            config: {
              provider: 'gmail',
              credentials: {
                type: 'oauth2',
                accessToken: credentials.gmailAccessToken,
                ...(credentials.gmailRefreshToken ? { refreshToken: credentials.gmailRefreshToken } : {}),
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
        aiBodyLength: finalBody.length,
        accessToken: credentials.gmailAccessToken?.slice(0, 20) + '...',
        hasRefreshToken: !!credentials.gmailRefreshToken,
        refreshTokenPreview: credentials.gmailRefreshToken?.slice(0, 20) + '...',
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
        const isTokenExpired = response.status === 503 && result.error?.includes('clientId');
        setSendStatus('error');
        if (isTokenExpired) {
          setStatusMessage('Gmail token expired — please sign out and sign in again to refresh');
        } else {
          setStatusMessage(
            isAuthError
              ? 'Session expired — please log out and log in again'
              : result.error || result.message || `Error ${response.status}`
          );
        }
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
      onMouseEnter={() => setIsNodeHovered(true)}
      onMouseLeave={() => setIsNodeHovered(false)}
    >
      {/* Input Handle - Email Account / main flow */}
      {hasInput && (
        <div
          className="absolute"
          style={{ left: -6, top: '25%', transform: 'translateY(-50%)' }}
        >
          <Handle
            type="target"
            position={Position.Left}
            className="w-4 h-4 border-2 border-orange-400/60 bg-orange-500/20 backdrop-blur-sm !relative !transform-none !inset-auto"
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
                  Email Account
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* To Address Handle - receive recipient from another node */}
      <div
        className="absolute"
        style={{ left: -6, top: '50%', transform: 'translateY(-50%)' }}
      >
        <Handle
          type="target"
          id="to-input"
          position={Position.Left}
          className="w-4 h-4 border-2 border-cyan-400/70 bg-cyan-500/30 backdrop-blur-sm !relative !transform-none !inset-auto"
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
                To Address
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Input Handle - connect AI/Prompt node to generate email body */}
      <div
        className="absolute"
        style={{ left: -6, top: '75%', transform: 'translateY(-50%)' }}
      >
        <Handle
          type="target"
          id="ai-input"
          position={Position.Left}
          className="w-4 h-4 border-2 border-purple-400/70 bg-purple-500/30 backdrop-blur-sm !relative !transform-none !inset-auto"
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
              <span className="text-xs font-semibold text-purple-400" style={{ textShadow: '0 0 10px rgba(192,132,252,0.9)' }}>
                AI Content
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {hasOutput && (
        <div
          className="absolute"
          style={{ right: -6, top: '50%', transform: 'translateY(-50%)' }}
        >
          <Handle
            type="source"
            position={Position.Right}
            className="w-4 h-4 border-2 border-orange-400/60 bg-orange-500/20 backdrop-blur-sm !relative !transform-none !inset-auto"
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
          <label className="block text-[10px] text-white/60 mb-1">
            To (comma separated)
            {getRecipientFromNode() && (
              <span className="ml-2 text-cyan-400">● from node</span>
            )}
          </label>
          <input
            type="text"
            value={to}
            onChange={(e) => {
              const newTo = e.target.value;
              setTo(newTo);
              data.to = newTo;
            }}
            placeholder="recipient@example.com, another@example.com"
            disabled={!!getRecipientFromNode()}
            className={`w-full px-3 py-2 bg-gray-800/50 border rounded-lg text-white placeholder-white/40 text-xs focus:outline-none transition-all duration-200 ${
              getRecipientFromNode()
                ? 'border-cyan-400/30 text-cyan-300/70 cursor-not-allowed opacity-60'
                : 'border-white/10 focus:border-orange-400/40 focus:ring-1 focus:ring-orange-400/20'
            }`}
          />
          {getRecipientFromNode() && (
            <p className="mt-1 text-[9px] text-cyan-400/70 truncate">
              → {typeof getRecipientFromNode() === 'string' ? getRecipientFromNode() : JSON.stringify(getRecipientFromNode())}
            </p>
          )}
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
          <label className="block text-[10px] text-white/60 mb-1">Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => {
              const newSubject = e.target.value;
              setSubject(newSubject);
              data.subject = newSubject;
            }}
            placeholder="Email subject"
            className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 text-xs focus:border-orange-400/40 focus:outline-none focus:ring-1 focus:ring-orange-400/20 transition-all duration-200"
          />
        </div>

        {/* AI Body indicator */}
        {(() => {
          const aiBody = getAIBody();
          return aiBody ? (
            <div className="space-y-1">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-purple-500/15 border border-purple-500/30 rounded-lg">
                <Sparkles size={11} className="text-purple-400 flex-shrink-0" />
                <span className="text-[10px] text-purple-300 font-medium">AI content ready</span>
              </div>
              <div className="px-3 py-2 bg-black/40 border border-white/8 rounded-lg max-h-20 overflow-y-auto nodrag nowheel"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                <p className="text-[9px] text-white/60 whitespace-pre-wrap leading-relaxed">{aiBody}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <Sparkles size={12} className="text-purple-400 flex-shrink-0" />
              <span className="text-[10px] text-purple-300">
                Connect an AI node to the <span className="text-purple-400 font-semibold">purple handle</span> to generate email content
              </span>
            </div>
          );
        })()}

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
