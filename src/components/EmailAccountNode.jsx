import { useState, memo, useEffect, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Eye, EyeOff, CheckCircle, AlertCircle,
  Loader, Wifi, WifiOff, Trash2, Zap, Key, RefreshCw, ShieldCheck, PlusCircle
} from 'lucide-react';
import { signInWithGoogle, signInWithGoogleSelectAccount, getGmailToken, supabase } from '../lib/supabase';
import { API_BASE_URL } from '../lib/config.js';

const API = API_BASE_URL;

/**
 * EmailAccountNode
 * Mode 1 — Gmail OAuth : dùng token từ Google login (recommended)
 * Mode 2 — SMTP        : dùng App Password
 *
 * Nhiệm vụ: lưu credentials vào data.value để SendEmailNode / ReadEmailNode dùng.
 * Test Connection (OAuth) → verify token, KHÔNG gửi email.
 * Test Connection (SMTP)  → gửi 1 email test (có thông báo rõ).
 */
const EmailAccountNode = memo(({ data, id, selected }) => {
  const [mode, setMode]                 = useState(data.mode || 'oauth');
  const [email, setEmail]               = useState(data.email || '');
  const [password, setPassword]         = useState(data.password || '');
  const [smtpProvider, setSmtpProvider] = useState(data.smtpProvider || 'gmail');
  const [showPassword, setShowPassword] = useState(false);
  const [customHost, setCustomHost]     = useState(data.customHost || '');
  const [customPort, setCustomPort]     = useState(data.customPort || '587');
  const [isValidating, setIsValidating] = useState(false);
  const [connStatus, setConnStatus]     = useState(null); // null | 'authorized' | 'error'
  const [connMessage, setConnMessage]   = useState('');
  // Per-node OAuth token — stored in data so each node can have its own account
  const [gmailToken, setGmailToken]     = useState(() => data.value?.gmailAccessToken || localStorage.getItem('gmail_access_token'));
  const [gmailEmail, setGmailEmail]     = useState(data.email || '');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const [isNodeHovered, setIsNodeHovered] = useState(false);

  const { label = 'Email Account', hasOutput = true } = data;

  const SMTP_PROVIDERS = {
    gmail:   { host: 'smtp.gmail.com',     port: 587 },
    outlook: { host: 'smtp.office365.com', port: 587 },
    yahoo:   { host: 'smtp.mail.yahoo.com',port: 587 },
    custom:  { host: '',                   port: 587 },
  };

  // ── Sync state → data.value (consumed by Send/Read nodes) ──────────────
  const syncToData = useCallback((patch = {}) => {
    const resolvedMode     = patch.mode     ?? mode;
    const resolvedEmail    = (patch.email   ?? email).trim();
    const resolvedPassword = (patch.password ?? password).trim();
    const resolvedProvider = patch.smtpProvider ?? smtpProvider;
    const resolvedHost     = resolvedProvider === 'custom'
      ? (patch.customHost ?? customHost).trim()
      : SMTP_PROVIDERS[resolvedProvider]?.host || 'smtp.gmail.com';
    const resolvedPort     = resolvedProvider === 'custom'
      ? Number(patch.customPort ?? customPort)
      : SMTP_PROVIDERS[resolvedProvider]?.port || 587;
    // Per-node token: use patch token, or current node token, or global fallback
    const resolvedToken    = patch.gmailAccessToken
      ?? gmailToken
      ?? localStorage.getItem('gmail_access_token')
      ?? '';
    const resolvedRefresh  = patch.gmailRefreshToken
      ?? localStorage.getItem('gmail_refresh_token')
      ?? '';

    Object.assign(data, patch, {
      mode:         resolvedMode,
      email:        resolvedEmail,
      password:     resolvedPassword,
      smtpProvider: resolvedProvider,
      value: {
        mode:              resolvedMode,
        email:             resolvedEmail,
        password:          resolvedPassword,
        host:              resolvedHost,
        port:              resolvedPort,
        gmailAccessToken:  resolvedToken,
        gmailRefreshToken: resolvedRefresh,
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, email, password, smtpProvider, customHost, customPort, gmailToken]);

  // ── On mount: load token + email ──────────────────────────────────────
  useEffect(() => {
    // Priority: per-node token saved in data.value → global localStorage
    const nodeToken = data.value?.gmailAccessToken;
    const globalToken = localStorage.getItem('gmail_access_token');
    const token = nodeToken || globalToken;

    const userData = (() => {
      try { return JSON.parse(localStorage.getItem('user_data') || '{}'); } catch { return {}; }
    })();

    if (token) {
      setGmailToken(token);
      const resolvedEmail = data.email || userData.email || '';
      setGmailEmail(resolvedEmail);
      if (!email) { setEmail(resolvedEmail); data.email = resolvedEmail; }
    }

    // Also check Supabase session for user email (available even without provider_token)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email && !gmailEmail) {
        setGmailEmail(session.user.email);
        setEmail(session.user.email);
        data.email = session.user.email;
      }
      if (session?.provider_token) {
        setGmailToken(session.provider_token);
        localStorage.setItem('gmail_access_token', session.provider_token);
      }
      if (session?.provider_refresh_token) {
        localStorage.setItem('gmail_refresh_token', session.provider_refresh_token);
      }
    }).catch(() => {});

    syncToData();

    // Listen for global token updates (only apply if this node has no per-node token)
    const onTokenUpdate = () => {
      if (data.value?.gmailAccessToken) return; // node has its own token, ignore global
      const t = localStorage.getItem('gmail_access_token');
      setGmailToken(t);
      if (t) {
        const ud = (() => {
          try { return JSON.parse(localStorage.getItem('user_data') || '{}'); } catch { return {}; }
        })();
        setGmailEmail(ud.email || '');
      }
    };

    // Listen for per-node token update (after "Use different account" redirect)
    const onNodeTokenUpdate = (e) => {
      const nodeId = data.id || id;
      if (e.detail?.nodeId !== nodeId) return;
      const { accessToken, refreshToken, email: newEmail } = e.detail;
      setGmailToken(accessToken);
      setGmailEmail(newEmail);
      setEmail(newEmail);
      data.email = newEmail;
      data.isConnected = true;
      syncToData({ email: newEmail, gmailAccessToken: accessToken, gmailRefreshToken: refreshToken });
      flashStatus('authorized', `Authorized as ${newEmail}`, 6000);
    };

    window.addEventListener('gmail-token-updated', onTokenUpdate);
    window.addEventListener('gmail-node-token-updated', onNodeTokenUpdate);
    return () => {
      window.removeEventListener('gmail-token-updated', onTokenUpdate);
      window.removeEventListener('gmail-node-token-updated', onNodeTokenUpdate);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAuthToken = () =>
    localStorage.getItem('office_weave_token') || localStorage.getItem('auth_token');

  const flashStatus = (status, message, ms = 5000) => {
    setConnStatus(status);
    setConnMessage(message);
    setTimeout(() => { setConnStatus(null); setConnMessage(''); }, ms);
  };

  // ── Open Google account selector via Supabase OAuth (redirect flow) ───
  const authorizeAnotherAccount = async () => {
    setIsAuthorizing(true);
    try {
      // Pass this node's id so after redirect we know which node to update
      await signInWithGoogleSelectAccount(data.id || id);
      // Page will redirect — isAuthorizing stays true until redirect
    } catch (err) {
      flashStatus('error', 'Authorization failed: ' + err.message);
      setIsAuthorizing(false);
    }
  };

  // ── Verify Gmail token (NO email sent) ─────────────────────────────────
  const verifyOAuth = async () => {
    setIsValidating(true);
    setConnStatus(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Get best available token: session > localStorage
      const token = session?.provider_token
        || gmailToken
        || localStorage.getItem('gmail_access_token');

      const refreshToken = session?.provider_refresh_token
        || localStorage.getItem('gmail_refresh_token');

      if (!token) {
        data.isConnected = false;
        flashStatus('error', 'No Gmail token — please sign in again');
        return;
      }

      // Save fresh tokens if available from session
      if (session?.provider_token) {
        localStorage.setItem('gmail_access_token', session.provider_token);
        setGmailToken(session.provider_token);
      }
      if (refreshToken) {
        localStorage.setItem('gmail_refresh_token', refreshToken);
      }

      // Verify token with Google
      const res = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
      const info = await res.json();

      if (res.ok && info.email) {
        setGmailEmail(info.email);
        setEmail(info.email);
        data.email = info.email;
        data.isConnected = true;
        syncToData({ email: info.email, gmailAccessToken: token, gmailRefreshToken: refreshToken });
        flashStatus('authorized', `Authorized as ${info.email}`, 6000);
      } else {
        // Token invalid — but we still have it, mark as needing re-auth
        data.isConnected = false;
        flashStatus('error', 'Token expired — please sign out and sign in again to get a fresh token');
      }
    } catch (err) {
      flashStatus('error', 'Network error: ' + err.message);
    } finally {
      setIsValidating(false);
    }
  };

  // ── Test SMTP (sends 1 test email — user is warned) ────────────────────
  const testSMTP = async () => {
    const trimmedEmail    = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      flashStatus('error', 'Email and App Password are required');
      return;
    }
    const host = smtpProvider === 'custom' ? customHost.trim() : SMTP_PROVIDERS[smtpProvider].host;
    const port = smtpProvider === 'custom' ? Number(customPort) : SMTP_PROVIDERS[smtpProvider].port;
    if (!host) { flashStatus('error', 'SMTP host is required'); return; }

    setIsValidating(true);
    setConnStatus(null);

    try {
      const res = await fetch(`${API}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          provider: 'smtp',
          config: {
            provider: 'smtp', host, port,
            secure: port === 465,
            credentials: { type: 'password', username: trimmedEmail, password: trimmedPassword },
          },
          email: {
            to: [{ address: trimmedEmail }],
            subject: 'NOMADS — SMTP Connection Test',
            body: {
              text: 'SMTP connection verified successfully.',
              html: '<p>SMTP connection verified successfully.</p>',
            },
          },
        }),
      });

      const result = await res.json();
      if (res.ok && (result.success || result.data?.success)) {
        data.isConnected = true;
        syncToData();
        flashStatus('authorized', 'SMTP verified! Test email sent to ' + trimmedEmail, 6000);
      } else {
        data.isConnected = false;
        const isAuth = res.status === 401 || result.code === 'AUTH_ERROR';
        flashStatus('error', isAuth
          ? 'Auth failed. Check your App Password.'
          : result.error || result.data?.error || `Error ${res.status}`
        );
      }
    } catch (err) {
      flashStatus('error', 'Network error: ' + err.message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleTest = () => mode === 'oauth' ? verifyOAuth() : testSMTP();

  const clearAll = () => {
    setEmail(''); setPassword('');
    setGmailToken(null); setGmailEmail('');
    setConnStatus(null); setConnMessage('');
    data.isConnected = false;
    syncToData({ email: '', password: '', gmailAccessToken: '', gmailRefreshToken: '' });
  };

  const canTest = mode === 'oauth'
    ? !!gmailToken
    : !!email && !!password;

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`relative rounded-xl border backdrop-blur-md bg-black/90 shadow-2xl transition-all duration-200 ${
        selected
          ? 'ring-2 ring-purple-400/50 ring-offset-1 ring-offset-black border-purple-400/60'
          : 'border-white/15'
      }`}
      style={{ width: 300 }}
      onMouseEnter={() => setIsNodeHovered(true)}
      onMouseLeave={() => setIsNodeHovered(false)}
    >
      {hasOutput && (
        <div
          className="absolute"
          style={{ right: -6, top: '50%', transform: 'translateY(-50%)' }}
        >
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 border-2 border-purple-400/60 bg-purple-500/20 !relative !transform-none !inset-auto"
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
                <span className="text-xs font-semibold text-purple-400" style={{ textShadow: '0 0 10px rgba(192,132,252,0.9)' }}>
                  Credentials
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-400/30">
            <Mail size={13} className="text-purple-400" />
          </div>
          <span className="text-xs font-semibold text-white">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {data.isConnected && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/25 rounded-full">
              <ShieldCheck size={9} className="text-green-400" />
              <span className="text-[9px] text-green-400 font-medium">Authorized</span>
            </div>
          )}
          <button
            onClick={clearAll}
            className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Clear credentials"
          >
            <Trash2 size={12} className="text-white/25 hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-3 space-y-3">

        {/* Auth Method toggle */}
        <div>
          <p className="text-[10px] text-white/50 mb-1.5 font-medium">Auth Method</p>
          <div className="grid grid-cols-2 gap-1">
            {[
              { id: 'oauth', icon: <Zap size={10} />, label: 'Gmail OAuth', active: 'bg-blue-500/25 border-blue-400/50 text-blue-300' },
              { id: 'smtp',  icon: <Key  size={10} />, label: 'SMTP',        active: 'bg-purple-500/25 border-purple-400/50 text-purple-300' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); syncToData({ mode: m.id }); }}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-medium border transition-all ${
                  mode === m.id ? m.active : 'bg-white/4 border-white/10 text-white/40 hover:bg-white/8 hover:text-white/60'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── OAuth panel ── */}
        <AnimatePresence mode="wait">
          {mode === 'oauth' && (
            <motion.div
              key="oauth"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="space-y-2.5"
            >
              {/* Missing env credentials warning — removed, backend handles credentials server-side */}
              {gmailToken ? (
                /* Token present */
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/8 border border-emerald-500/20 rounded-lg">
                    <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-emerald-300 font-semibold">Gmail authorized</p>
                      {gmailEmail && (
                        <p className="text-[9px] text-emerald-400/60 truncate">{gmailEmail}</p>
                      )}
                    </div>
                    <button
                      onClick={async () => {
                        const t = await getGmailToken();
                        const resolved = t || localStorage.getItem('gmail_access_token');
                        setGmailToken(resolved);
                        syncToData({ gmailAccessToken: resolved });
                      }}
                      className="p-1 hover:bg-emerald-500/15 rounded-md transition-colors flex-shrink-0"
                      title="Refresh token from session"
                    >
                      <RefreshCw size={10} className="text-emerald-400" />
                    </button>
                  </div>

                  {/* Switch to another Google account */}
                  <button
                    onClick={authorizeAnotherAccount}
                    disabled={isAuthorizing}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium border border-white/10 bg-white/4 text-white/50 hover:bg-white/8 hover:text-white/70 disabled:opacity-40 transition-all"
                  >
                    {isAuthorizing ? (
                      <><Loader size={10} className="animate-spin" /><span>Opening Google...</span></>
                    ) : (
                      <><PlusCircle size={10} /><span>Use a different Google account</span></>
                    )}
                  </button>
                </div>
              ) : (
                /* No token */
                <div className="space-y-2">
                  <div className="flex items-start gap-2 px-3 py-2 bg-amber-500/8 border border-amber-500/20 rounded-lg">
                    <AlertCircle size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-amber-300 font-semibold">Gmail not authorized</p>
                      <p className="text-[9px] text-amber-400/60 leading-relaxed">
                        Click below to grant Gmail access via Google
                      </p>
                    </div>
                  </div>

                  {/* Authorize button — Google brand colors */}
                  <button
                    onClick={async () => {
                      setIsAuthorizing(true);
                      try {
                        await signInWithGoogle();
                      } catch (err) {
                        flashStatus('error', 'Authorization failed: ' + err.message);
                      } finally {
                        setIsAuthorizing(false);
                      }
                    }}
                    disabled={isAuthorizing}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[10px] font-semibold
                      bg-white/95 text-gray-800 hover:bg-white border border-white/20
                      disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    {isAuthorizing ? (
                      <><Loader size={11} className="animate-spin text-gray-600" /><span>Redirecting...</span></>
                    ) : (
                      <>
                        {/* Google G icon */}
                        <svg width="12" height="12" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Sign in with Google</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ── SMTP panel ── */}
          {mode === 'smtp' && (
            <motion.div
              key="smtp"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="space-y-2.5"
            >
              {/* Provider selector */}
              <div>
                <p className="text-[10px] text-white/50 mb-1.5 font-medium">Provider</p>
                <div className="grid grid-cols-4 gap-1">
                  {Object.keys(SMTP_PROVIDERS).map(key => (
                    <button
                      key={key}
                      onClick={() => { setSmtpProvider(key); syncToData({ smtpProvider: key }); }}
                      className={`py-1 rounded-lg text-[9px] font-medium capitalize border transition-all ${
                        smtpProvider === key
                          ? 'bg-purple-500/25 border-purple-400/50 text-purple-300'
                          : 'bg-white/4 border-white/10 text-white/40 hover:bg-white/8'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom host/port */}
              <AnimatePresence>
                {smtpProvider === 'custom' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <p className="text-[10px] text-white/50 mb-1">Host</p>
                        <input
                          type="text"
                          value={customHost}
                          onChange={e => { setCustomHost(e.target.value); syncToData({ customHost: e.target.value }); }}
                          placeholder="smtp.example.com"
                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/25 text-[10px] focus:border-purple-400/40 focus:outline-none focus:ring-1 focus:ring-purple-400/20 transition-all"
                        />
                      </div>
                      <div className="w-16">
                        <p className="text-[10px] text-white/50 mb-1">Port</p>
                        <input
                          type="number"
                          value={customPort}
                          onChange={e => { setCustomPort(e.target.value); syncToData({ customPort: e.target.value }); }}
                          placeholder="587"
                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/25 text-[10px] focus:border-purple-400/40 focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <p className="text-[10px] text-white/50 mb-1">Email Address</p>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); syncToData({ email: e.target.value }); }}
                  placeholder="your-email@gmail.com"
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/25 text-xs focus:border-purple-400/40 focus:outline-none focus:ring-1 focus:ring-purple-400/20 transition-all"
                />
              </div>

              {/* App Password */}
              <div>
                <p className="text-[10px] text-white/50 mb-1">App Password</p>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); syncToData({ password: e.target.value }); }}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full px-3 py-2 pr-9 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/25 text-xs focus:border-purple-400/40 focus:outline-none focus:ring-1 focus:ring-purple-400/20 transition-all"
                  />
                  <button
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-md transition-colors"
                  >
                    {showPassword
                      ? <EyeOff size={12} className="text-white/40" />
                      : <Eye    size={12} className="text-white/40" />}
                  </button>
                </div>
                <p className="text-[9px] text-white/30 mt-1">
                  Use Gmail App Password, not your login password.{' '}
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank" rel="noreferrer"
                    className="text-purple-400/80 hover:text-purple-300 underline underline-offset-2 transition-colors"
                  >
                    Get one →
                  </a>
                </p>
              </div>

              {/* SMTP test warning */}
              <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white/4 border border-white/8 rounded-lg">
                <AlertCircle size={10} className="text-white/30 flex-shrink-0" />
                <p className="text-[9px] text-white/30 leading-relaxed">
                  Test will send 1 email to verify credentials
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Test / Verify button ── */}
        <button
          onClick={handleTest}
          disabled={isValidating || !canTest}
          className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-medium border
            disabled:opacity-40 disabled:cursor-not-allowed transition-all ${
            mode === 'oauth'
              ? 'bg-blue-600/15 border-blue-500/25 text-blue-400 hover:bg-blue-600/25 hover:border-blue-400/40'
              : 'bg-purple-600/15 border-purple-500/25 text-purple-400 hover:bg-purple-600/25 hover:border-purple-400/40'
          }`}
        >
          {isValidating ? (
            <><Loader size={11} className="animate-spin" /><span>Verifying...</span></>
          ) : connStatus === 'authorized' ? (
            <><CheckCircle size={11} /><span>{mode === 'oauth' ? 'Token valid' : 'SMTP verified'}</span></>
          ) : connStatus === 'error' ? (
            <><WifiOff size={11} /><span>Verification failed</span></>
          ) : (
            <><Wifi size={11} /><span>{mode === 'oauth' ? 'Verify Token' : 'Test Connection'}</span></>
          )}
        </button>

        {/* Status message */}
        <AnimatePresence>
          {connMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className={`text-[9px] px-2.5 py-2 rounded-lg leading-relaxed ${
                connStatus === 'authorized'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {connMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status dot */}
      <div className={`absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border-2 border-gray-900 transition-colors ${
        data.isConnected ? 'bg-green-500 shadow-[0_0_6px_rgba(74,222,128,0.6)]' : 'bg-purple-500'
      }`} />
    </motion.div>
  );
});

EmailAccountNode.displayName = 'EmailAccountNode';
export default EmailAccountNode;
