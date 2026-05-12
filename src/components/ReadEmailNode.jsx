import { useState, memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import {
  Mail,
  MailOpen,
  Paperclip,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Loader,
  Calendar,
  User,
  RefreshCw,
  CheckSquare,
  Square,
} from 'lucide-react';

/**
 * ReadEmailNode — Reads emails from IMAP / Gmail OAuth
 * Design: matches design (3).md spec
 *   • Account dropdown (from connected EmailAccountNode)
 *   • Folder dropdown: INBOX | Sent | Drafts | Spam | Trash | Custom
 *   • Limit input
 *   • "Only unread emails" checkbox
 *   • Filters (optional): From, Subject, Since (date preset)
 */
const FOLDER_OPTIONS = ['INBOX', 'Sent', 'Drafts', 'Spam', 'Trash', 'Custom'];

const SINCE_OPTIONS = [
  { label: 'Last 7 days',  days: 7  },
  { label: 'Last 14 days', days: 14 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'All time',     days: 0  },
];

const ReadEmailNode = memo(({ data, selected, id }) => {
  const [folder,      setFolder]      = useState(data.folder      || 'INBOX');
  const [limit,       setLimit]       = useState(data.limit       || 10);
  const [unreadOnly,  setUnreadOnly]  = useState(data.unreadOnly  ?? true);
  const [filterFrom,  setFilterFrom]  = useState(data.filterFrom  || '');
  const [filterSubj,  setFilterSubj]  = useState(data.filterSubj  || '');
  const [sinceIdx,    setSinceIdx]    = useState(data.sinceIdx    ?? 0);   // index into SINCE_OPTIONS
  const [showFilters, setShowFilters] = useState(false);
  const [isFetching,  setIsFetching]  = useState(false);
  const [emails,      setEmails]      = useState(data.emails      || []);
  const [error,       setError]       = useState('');
  const [expandedId,  setExpandedId]  = useState(null);
  const [isNodeHovered, setIsNodeHovered] = useState(false);

  const { label = 'Read Email', hasInput = true, hasOutput = true } = data;

  /* ── helpers ─────────────────────────────────────────────── */

  /** Resolve connected EmailAccountNode credentials */
  const getCredentials = () => {
    if (!data.getNodes || !data.getEdges) return null;
    const nodes = data.getNodes();
    const edges = data.getEdges();
    const incoming = edges.filter(e => e.target === id);
    for (const edge of incoming) {
      const src = nodes.find(n => n.id === edge.source);
      if (!src) continue;
      const nd  = src.data;
      const val = nd.value || {};

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

      const email    = (val.email    || nd.email    || '').trim();
      const password = (val.password || nd.password || '').trim();
      if (email && password) {
        const imapHosts = {
          gmail:   { host: 'imap.gmail.com',        port: 993 },
          outlook: { host: 'outlook.office365.com', port: 993 },
          yahoo:   { host: 'imap.mail.yahoo.com',   port: 993 },
        };
        const prov     = val.smtpProvider || nd.smtpProvider || 'gmail';
        const defaults = imapHosts[prov] || imapHosts.gmail;
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

  /** Label shown in Account row */
  const getAccountLabel = () => {
    const creds = getCredentials();
    if (!creds) return 'No account connected';
    return creds.email
      ? `${creds.mode === 'oauth' ? 'Gmail' : 'IMAP'} — ${creds.email}`
      : creds.mode === 'oauth' ? 'Gmail (OAuth)' : 'IMAP account';
  };

  /** Compute dateFrom from sinceIdx */
  const computeDateFrom = () => {
    const opt = SINCE_OPTIONS[sinceIdx];
    if (!opt || opt.days === 0) return undefined;
    const d = new Date();
    d.setDate(d.getDate() - opt.days);
    return d.toISOString().split('T')[0];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
      });
    } catch { return dateStr; }
  };

  /* ── fetch ───────────────────────────────────────────────── */

  const fetchEmails = async () => {
    const creds = getCredentials();
    if (!creds) { setError('Connect an Email Account node first'); return; }

    setIsFetching(true);
    setError('');

    try {
      // Always get fresh token from Supabase session (auto-refreshes if expired)
      let token = localStorage.getItem('office_weave_token') || localStorage.getItem('auth_token');
      
      // Refresh token via existing Supabase client
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          token = session.access_token;
          localStorage.setItem('office_weave_token', token);
          if (session.provider_token) {
            localStorage.setItem('gmail_access_token', session.provider_token);
          }
        }
      } catch (e) {
        console.warn('⚠️ Could not refresh token:', e.message);
      }

      if (!token) {
        setError('Not authenticated. Please log out and log in again.');
        setIsFetching(false);
        return;
      }

      const dateFrom = computeDateFrom();

      const options = {
        folder,
        limit:      Number(limit),
        unreadOnly,
        ...(filterFrom ? { sender:  filterFrom } : {}),
        ...(filterSubj ? { subject: filterSubj } : {}),
        ...(dateFrom   ? { dateRange: { start: new Date(dateFrom).toISOString() } } : {}),
      };

      // Build Gmail config — only include clientId/clientSecret when they are
      // actually configured; the backend can work with just the accessToken.
      const clientId     = import.meta.env.VITE_GOOGLE_CLIENT_ID     || '';
      const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';
      
      // Get fresh gmail token from localStorage (may have been refreshed above)
      const freshGmailToken = localStorage.getItem('gmail_access_token');
      if (creds.mode === 'oauth' && !freshGmailToken) {
        setError('Gmail token not available. Please log out → log in with Google again.');
        setIsFetching(false);
        return;
      }

      const gmailConfig  = {
        provider: 'gmail',
        credentials: {
          type:         'oauth2',
          accessToken:  freshGmailToken || creds.gmailAccessToken,
          ...(creds.gmailRefreshToken ? { refreshToken: creds.gmailRefreshToken } : {}),
        },
        ...(clientId     ? { clientId }     : {}),
        ...(clientSecret ? { clientSecret } : {}),
      };

      const body = creds.mode === 'oauth'
        ? {
            provider: 'gmail',
            config:   gmailConfig,
            options,
          }
        : {
            provider: 'imap',
            config: {
              provider: 'imap',
              host:   creds.host,
              port:   creds.port,
              secure: creds.port === 993 || creds.port === 465,
              credentials: {
                type:     'password',
                username: creds.email,
                password: creds.password,
              },
            },
            options,
          };

      const response = await fetch('https://back-end-auto-office-f8xt.vercel.app/api/email/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const result  = await response.json();
      const payload = result.data || result;

      if (response.ok) {
        const fetched = payload.emails || [];
        setEmails(fetched);
        data.emails = fetched;
        data.result = fetched;
        data.count  = payload.count || fetched.length;
        if (data.onNodeResult) data.onNodeResult(id, fetched);
      } else {
        const isAuth = response.status === 401 || response.status === 403 || result.code === 'AUTH_ERROR';
        if (isAuth) {
          setError('Session expired — please log out and log in again to refresh your token.');
        } else if (response.status === 500) {
          const detail = result.error || result.message || '';
          if (detail.includes('token') || detail.includes('auth') || detail.includes('credential')) {
            setError('Gmail token expired. Please log out → log in again with Google.');
          } else {
            setError(`Server error: ${detail || 'Unknown error. Check backend logs.'}`);
          }
        } else {
          setError(result.error || result.message || `Error ${response.status}`);
        }
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsFetching(false);
    }
  };

  /* ── render ──────────────────────────────────────────────── */

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      onMouseEnter={() => setIsNodeHovered(true)}
      onMouseLeave={() => setIsNodeHovered(false)}
      className={`
        relative rounded-xl border backdrop-blur-md
        ${selected
          ? 'ring-2 ring-blue-400/50 ring-offset-1 ring-offset-black border-blue-400/60'
          : 'border-white/15'}
        bg-[#0d0d0d]/95 shadow-2xl transition-all duration-300
      `}
      style={{ width: 300 }}
    >
      {/* ── Handles ── */}
      {hasInput && (
        <div className="absolute" style={{ left: -6, top: '50%', transform: 'translateY(-50%)' }}>
          <Handle
            type="target"
            position={Position.Left}
            className="w-4 h-4 border-2 border-blue-400/60 bg-blue-500/20 backdrop-blur-sm !relative !transform-none !inset-auto"
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
                <span className="text-xs font-semibold text-blue-400" style={{ textShadow: '0 0 10px rgba(96,165,250,0.9)' }}>
                  Email Account
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {hasOutput && (
        <div className="absolute" style={{ right: -6, top: '50%', transform: 'translateY(-50%)' }}>
          <Handle
            type="source"
            position={Position.Right}
            className="w-4 h-4 border-2 border-blue-400/60 bg-blue-500/20 backdrop-blur-sm !relative !transform-none !inset-auto"
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
                <span className="text-xs font-semibold text-blue-400" style={{ textShadow: '0 0 10px rgba(96,165,250,0.9)' }}>
                  Emails Out
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-400/30">
            <Mail size={13} className="text-blue-400" />
          </div>
          <span className="text-xs font-semibold text-white tracking-wide">{label}</span>
        </div>
        {emails.length > 0 && (
          <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-[9px] text-blue-400 font-medium">
            {emails.length} emails
          </span>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-3 space-y-2.5">

        {/* Account row */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/50 w-16 flex-shrink-0">Account:</span>
          <div className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white/70 truncate">
            {getAccountLabel()}
          </div>
        </div>

        {/* Folder row */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/50 w-16 flex-shrink-0">Folder:</span>
          <div className="relative flex-1">
            <select
              value={folder}
              onChange={(e) => { setFolder(e.target.value); data.folder = e.target.value; }}
              className="w-full appearance-none px-2 py-1.5 pr-6 border border-white/10 rounded-lg text-[10px] text-white focus:border-blue-400/40 focus:outline-none focus:ring-1 focus:ring-blue-400/20 transition-all cursor-pointer"
              style={{ backgroundColor: '#1a1a2e', color: '#ffffff' }}
            >
              {FOLDER_OPTIONS.map(f => (
                <option key={f} value={f.toUpperCase()} style={{ backgroundColor: '#1a1a2e', color: '#ffffff' }}>{f}</option>
              ))}
            </select>
            <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
        </div>

        {/* Limit row */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/50 w-16 flex-shrink-0">Limit:</span>
          <input
            type="number"
            min={1}
            max={100}
            value={limit}
            onChange={(e) => { setLimit(e.target.value); data.limit = Number(e.target.value); }}
            className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white focus:border-blue-400/40 focus:outline-none focus:ring-1 focus:ring-blue-400/20 transition-all"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-white/8" />

        {/* Only unread checkbox */}
        <button
          onClick={() => { setUnreadOnly(!unreadOnly); data.unreadOnly = !unreadOnly; }}
          className="flex items-center space-x-2 w-full group"
        >
          <div className={`flex-shrink-0 w-4 h-4 rounded flex items-center justify-center border transition-colors ${
            unreadOnly
              ? 'bg-blue-500 border-blue-400'
              : 'bg-white/5 border-white/20 group-hover:border-white/40'
          }`}>
            {unreadOnly && (
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-[10px] text-white/70 group-hover:text-white/90 transition-colors select-none">
            Only unread emails
          </span>
        </button>

        {/* Divider */}
        <div className="border-t border-white/8" />

        {/* Filters toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-between w-full group"
        >
          <span className="text-[10px] text-white/50 group-hover:text-white/70 transition-colors">
            Filters (optional):
          </span>
          <ChevronDown
            size={11}
            className={`text-white/30 group-hover:text-white/50 transition-all ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-2.5 border border-white/10 rounded-lg bg-white/3 space-y-2">
                {/* From */}
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-white/50 w-14 flex-shrink-0">From:</span>
                  <input
                    type="text"
                    value={filterFrom}
                    onChange={(e) => { setFilterFrom(e.target.value); data.filterFrom = e.target.value; }}
                    placeholder="sender@example.com"
                    className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-white placeholder-white/25 focus:border-blue-400/40 focus:outline-none transition-all"
                  />
                </div>

                {/* Subject */}
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-white/50 w-14 flex-shrink-0">Subject:</span>
                  <input
                    type="text"
                    value={filterSubj}
                    onChange={(e) => { setFilterSubj(e.target.value); data.filterSubj = e.target.value; }}
                    placeholder="keyword..."
                    className="flex-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-white placeholder-white/25 focus:border-blue-400/40 focus:outline-none transition-all"
                  />
                </div>

                {/* Since */}
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] text-white/50 w-14 flex-shrink-0">Since:</span>
                  <div className="relative flex-1">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Calendar size={9} className="text-blue-400/70" />
                    </div>
                    <select
                      value={sinceIdx}
                      onChange={(e) => { const v = Number(e.target.value); setSinceIdx(v); data.sinceIdx = v; }}
                      className="w-full appearance-none pl-6 pr-5 py-1 border border-white/10 rounded text-[10px] text-white focus:border-blue-400/40 focus:outline-none transition-all cursor-pointer"
                      style={{ backgroundColor: '#1a1a2e', color: '#ffffff' }}
                    >
                      {SINCE_OPTIONS.map((opt, i) => (
                        <option key={i} value={i} style={{ backgroundColor: '#1a1a2e', color: '#ffffff' }}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fetch button */}
        <button
          onClick={fetchEmails}
          disabled={isFetching}
          className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-blue-600/15 border border-blue-500/25 rounded-lg text-[10px] text-blue-400 hover:bg-blue-600/25 hover:border-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isFetching
            ? <><Loader size={11} className="animate-spin" /><span>Fetching...</span></>
            : <><RefreshCw size={11} /><span>Fetch Emails</span></>}
        </button>

        {/* OAuth note */}
        <p className="text-[9px] text-white/25 leading-relaxed">
          ⚠️ Requires Gmail OAuth — IMAP/password not supported on this server.
        </p>

        {/* Error */}
        {error && (
          <div className="flex items-start space-x-1.5 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-[9px] text-red-400">
            <AlertCircle size={10} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email list */}
        {emails.length > 0 && (
          <div
            className="space-y-1 max-h-44 overflow-y-auto nodrag nowheel"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
          >
            {emails.map((email, idx) => {
              const key        = email.id || idx;
              const isExpanded = expandedId === key;
              const isUnread   = !email.flags?.seen;

              return (
                <div key={key} className="bg-white/4 border border-white/8 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : key)}
                    className="w-full flex items-start space-x-2 p-2 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isUnread
                        ? <Mail size={10} className="text-blue-400" />
                        : <MailOpen size={10} className="text-white/25" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10px] truncate ${isUnread ? 'text-white font-medium' : 'text-white/55'}`}>
                          {email.headers?.subject || '(no subject)'}
                        </span>
                        {email.attachments?.length > 0 && (
                          <Paperclip size={9} className="text-white/35 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[9px] text-white/35 truncate">
                          {email.headers?.from?.address || email.headers?.from || ''}
                        </span>
                        <span className="text-[9px] text-white/25 flex-shrink-0 ml-1">
                          {formatDate(email.headers?.date)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      size={10}
                      className={`text-white/25 flex-shrink-0 mt-0.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-white/8"
                      >
                        <div className="p-2 space-y-1">
                          <div className="flex items-center space-x-1 text-[9px] text-white/45">
                            <User size={9} className="flex-shrink-0" />
                            <span className="truncate">{email.headers?.from?.address || email.headers?.from}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-[9px] text-white/45">
                            <Calendar size={9} className="flex-shrink-0" />
                            <span>{formatDate(email.headers?.date)}</span>
                          </div>
                          {email.attachments?.length > 0 && (
                            <div className="flex items-center space-x-1 text-[9px] text-white/45">
                              <Paperclip size={9} className="flex-shrink-0" />
                              <span>{email.attachments.length} attachment(s)</span>
                            </div>
                          )}
                          <p className="text-[9px] text-white/55 leading-relaxed line-clamp-3">
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
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#0d0d0d]" />
    </motion.div>
  );
});

ReadEmailNode.displayName = 'ReadEmailNode';
export default ReadEmailNode;
