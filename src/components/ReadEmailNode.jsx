import { useState, memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  RefreshCw,
  Mail,
  MailOpen,
  Paperclip,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Loader,
  Calendar,
  User,
  Hash
} from 'lucide-react';

/**
 * ReadEmailNode - Reads emails from IMAP/Gmail
 * Output: array of email objects passed to connected nodes
 */
const ReadEmailNode = memo(({ data, selected, id }) => {
  const [folder, setFolder]         = useState(data.folder || 'INBOX');
  const [limit, setLimit]           = useState(data.limit || 10);
  const [unreadOnly, setUnreadOnly] = useState(data.unreadOnly ?? false);
  const [dateFrom, setDateFrom]     = useState(data.dateFrom || '');
  const [dateTo, setDateTo]         = useState(data.dateTo || '');
  const [showFilters, setShowFilters] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [emails, setEmails]         = useState(data.emails || []);
  const [error, setError]           = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const { label = 'Read Email', hasInput = true, hasOutput = true } = data;

  // Get credentials from connected EmailAccountNode
  const getCredentials = () => {
    if (!data.getNodes || !data.getEdges) return null;
    const nodes = data.getNodes();
    const edges = data.getEdges();
    const incoming = edges.filter(e => e.target === id);
    for (const edge of incoming) {
      const src = nodes.find(n => n.id === edge.source);
      if (!src) continue;
      const nd = src.data;
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

      // SMTP/IMAP mode fallback
      const email    = (val.email    || nd.email    || '').trim();
      const password = (val.password || nd.password || '').trim();
      if (email && password) {
        const imapHosts = {
          gmail:   { host: 'imap.gmail.com',        port: 993 },
          outlook: { host: 'outlook.office365.com', port: 993 },
          yahoo:   { host: 'imap.mail.yahoo.com',   port: 993 },
        };
        const smtpProv = val.smtpProvider || nd.smtpProvider || 'gmail';
        const defaults = imapHosts[smtpProv] || imapHosts.gmail;
        return {
          mode: 'imap',
          email,
          password,
          host: val.host || defaults.host,
          port: val.port || defaults.port,
        };
      }
    }
    return null;
  };

  const fetchEmails = async () => {
    const creds = getCredentials();
    if (!creds) {
      setError('Connect an Email Account node first');
      return;
    }

    setIsFetching(true);
    setError('');

    try {
      const token = localStorage.getItem('office_weave_token') || localStorage.getItem('auth_token');
      const clientId     = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
      const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';

      const body = creds.mode === 'oauth'
        ? {
            provider: 'gmail',
            config: {
              provider: 'gmail',
              clientId,
              clientSecret,
              credentials: {
                type: 'oauth2',
                accessToken: creds.gmailAccessToken,
                refreshToken: creds.gmailRefreshToken,
              },
            },
            options: {
              folder,
              limit:      Number(limit),
              unreadOnly,
              ...(dateFrom || dateTo ? {
                dateRange: {
                  ...(dateFrom ? { start: dateFrom } : {}),
                  ...(dateTo   ? { end:   dateTo   } : {}),
                }
              } : {}),
            },
          }
        : {
            provider: 'imap',
            config: {
              provider: 'imap',
              host:     creds.host,
              port:     creds.port,
              secure:   creds.port === 993 || creds.port === 465,
              credentials: {
                type:     'password',
                username: creds.email,
                password: creds.password,
              },
            },
            options: {
              folder,
              limit:      Number(limit),
              unreadOnly,
              ...(dateFrom || dateTo ? {
                dateRange: {
                  ...(dateFrom ? { start: dateFrom } : {}),
                  ...(dateTo   ? { end:   dateTo   } : {}),
                }
              } : {}),
            },
          };

      const response = await fetch('https://back-end-auto-office-f8xt.vercel.app/api/email/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      console.log('📬 Read email response:', response.status, JSON.stringify(result));

      const payload = result.data || result;

      if (response.ok) {
        const fetched = payload.emails || [];
        setEmails(fetched);
        data.emails  = fetched;
        data.result  = fetched;
        data.count   = payload.count || fetched.length;
        if (data.onNodeResult) data.onNodeResult(id, fetched);
      } else {
        const isAuthError = response.status === 401 || result.code === 'AUTH_ERROR';
        setError(
          isAuthError
            ? 'Session expired — please log out and log in again'
            : result.error || result.message || `Error ${response.status}`
        );
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsFetching(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
      });
    } catch { return dateStr; }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        relative rounded-lg border backdrop-blur-md
        ${selected
          ? 'ring-2 ring-blue-400/50 ring-offset-1 ring-offset-black border-blue-400/60'
          : 'border-white/20'}
        bg-black/90 shadow-xl transition-all duration-300
      `}
      style={{ width: 300 }}
    >
      {hasInput && (
        <Handle type="target" position={Position.Left}
          className="w-3 h-3 border-2 border-blue-400/60 bg-blue-500/20"
          style={{ left: -6 }} />
      )}
      {hasOutput && (
        <Handle type="source" position={Position.Right}
          className="w-3 h-3 border-2 border-blue-400/60 bg-blue-500/20"
          style={{ right: -6 }} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-blue-500/20 border border-blue-400/30">
            <Inbox size={14} className="text-blue-400" />
          </div>
          <h3 className="text-xs font-semibold text-white">{label}</h3>
        </div>
        {emails.length > 0 && (
          <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-[9px] text-blue-400">
            {emails.length} emails
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3 space-y-3">

        {/* Folder + Limit */}
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-[10px] text-white/60 mb-1">Folder</label>
            <select
              value={folder}
              onChange={(e) => { setFolder(e.target.value); data.folder = e.target.value; }}
              className="w-full px-2 py-1.5 bg-gray-800/50 border border-white/10 rounded-lg text-white text-xs focus:border-blue-400/40 focus:outline-none focus:ring-1 focus:ring-blue-400/20 transition-all"
            >
              <option value="INBOX">INBOX</option>
              <option value="SENT">SENT</option>
              <option value="DRAFTS">DRAFTS</option>
              <option value="SPAM">SPAM</option>
              <option value="TRASH">TRASH</option>
            </select>
          </div>
          <div className="w-16">
            <label className="block text-[10px] text-white/60 mb-1">Limit</label>
            <input
              type="number"
              min={1} max={100}
              value={limit}
              onChange={(e) => { setLimit(e.target.value); data.limit = Number(e.target.value); }}
              className="w-full px-2 py-1.5 bg-gray-800/50 border border-white/10 rounded-lg text-white text-xs focus:border-blue-400/40 focus:outline-none focus:ring-1 focus:ring-blue-400/20 transition-all"
            />
          </div>
        </div>

        {/* Unread toggle */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/60">Unread only</span>
          <div
            onClick={() => { setUnreadOnly(!unreadOnly); data.unreadOnly = !unreadOnly; }}
            className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${unreadOnly ? 'bg-blue-500' : 'bg-white/20'}`}
          >
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${unreadOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </div>

        {/* Date filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-1 text-[10px] text-white/50 hover:text-white/70 transition-colors"
        >
          <ChevronDown size={11} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          <span>Date filter</span>
        </button>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-2"
            >
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className="block text-[10px] text-white/60 mb-1">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); data.dateFrom = e.target.value; }}
                    className="w-full px-2 py-1.5 bg-gray-800/50 border border-white/10 rounded-lg text-white text-[10px] focus:border-blue-400/40 focus:outline-none transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-white/60 mb-1">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); data.dateTo = e.target.value; }}
                    className="w-full px-2 py-1.5 bg-gray-800/50 border border-white/10 rounded-lg text-white text-[10px] focus:border-blue-400/40 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fetch button */}
        <button
          onClick={fetchEmails}
          disabled={isFetching}
          className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded text-[10px] text-blue-400 hover:bg-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isFetching
            ? <><Loader size={11} className="animate-spin" /><span>Fetching...</span></>
            : <><RefreshCw size={11} /><span>Fetch Emails</span></>}
        </button>

        {/* Note about IMAP on Vercel */}
        <p className="text-[9px] text-white/30 leading-relaxed">
          ⚠️ Requires Gmail OAuth — IMAP/password not supported on this server.
        </p>

        {/* Error */}
        {error && (
          <div className="flex items-start space-x-1.5 p-2 bg-red-500/10 border border-red-500/20 rounded text-[9px] text-red-400">
            <AlertCircle size={10} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email list */}
        {emails.length > 0 && (
          <div
            className="space-y-1 max-h-40 overflow-y-auto nodrag nowheel"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
          >
            {emails.map((email, idx) => {
              const isExpanded = expandedId === (email.id || idx);
              const isUnread   = !email.flags?.seen;
              return (
                <div key={email.id || idx} className="bg-gray-800/40 border border-white/10 rounded overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : (email.id || idx))}
                    className="w-full flex items-start space-x-2 p-2 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isUnread
                        ? <Mail size={10} className="text-blue-400" />
                        : <MailOpen size={10} className="text-white/30" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10px] truncate ${isUnread ? 'text-white font-medium' : 'text-white/60'}`}>
                          {email.headers?.subject || '(no subject)'}
                        </span>
                        {email.attachments?.length > 0 && (
                          <Paperclip size={9} className="text-white/40 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[9px] text-white/40 truncate">
                          {email.headers?.from?.address || email.headers?.from || ''}
                        </span>
                        <span className="text-[9px] text-white/30 flex-shrink-0 ml-1">
                          {formatDate(email.headers?.date)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={10} className={`text-white/30 flex-shrink-0 mt-0.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-white/10"
                      >
                        <div className="p-2 space-y-1">
                          <div className="flex items-center space-x-1 text-[9px] text-white/50">
                            <User size={9} className="flex-shrink-0" />
                            <span className="truncate">{email.headers?.from?.address || email.headers?.from}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-[9px] text-white/50">
                            <Calendar size={9} className="flex-shrink-0" />
                            <span>{formatDate(email.headers?.date)}</span>
                          </div>
                          {email.attachments?.length > 0 && (
                            <div className="flex items-center space-x-1 text-[9px] text-white/50">
                              <Paperclip size={9} className="flex-shrink-0" />
                              <span>{email.attachments.length} attachment(s)</span>
                            </div>
                          )}
                          <p className="text-[9px] text-white/60 leading-relaxed line-clamp-3">
                            {email.body?.text?.slice(0, 150) || '(no preview)'}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status dot */}
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-gray-900" />
    </motion.div>
  );
});

ReadEmailNode.displayName = 'ReadEmailNode';
export default ReadEmailNode;
