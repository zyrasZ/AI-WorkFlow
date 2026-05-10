import { useState, memo, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Eye, EyeOff, CheckCircle, AlertCircle,
  Loader, Wifi, WifiOff, Trash2, Zap, Key, RefreshCw
} from 'lucide-react';
import { signInWithGoogle, getGmailToken } from '../lib/supabase';

const API = 'https://back-end-auto-office-f8xt.vercel.app';

/**
 * EmailAccountNode
 * Mode 1 — Gmail OAuth: dùng token từ Google login (recommended)
 * Mode 2 — SMTP: dùng App Password
 */
const EmailAccountNode = memo(({ data, selected }) => {
  // mode: 'oauth' | 'smtp'
  const [mode, setMode]             = useState(data.mode || 'oauth');
  const [email, setEmail]           = useState(data.email || '');
  const [password, setPassword]     = useState(data.password || '');
  const [smtpProvider, setSmtpProvider] = useState(data.smtpProvider || 'gmail');
  const [showPassword, setShowPassword] = useState(false);
  const [customHost, setCustomHost] = useState(data.customHost || '');
  const [customPort, setCustomPort] = useState(data.customPort || '587');
  const [isValidating, setIsValidating] = useState(false);
  const [connStatus, setConnStatus] = useState(null);
  const [connMessage, setConnMessage] = useState('');
  const [gmailTokenState, setGmailTokenState] = useState(() => localStorage.getItem('gmail_access_token'));
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const { label = 'Email Account', hasOutput = true } = data;

  const SMTP_PROVIDERS = {
    gmail:   { host: 'smtp.gmail.com',        port: 587 },
    outlook: { host: 'smtp.office365.com',    port: 587 },
    yahoo:   { host: 'smtp.mail.yahoo.com',   port: 587 },
    custom:  { host: '',                      port: 587 },
  };

  // On mount: check if Gmail OAuth token exists
  useEffect(() => {
    const gmailToken = localStorage.getItem('gmail_access_token');
    const userDataStr = localStorage.getItem('user_data');
    if (gmailToken && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        if (!email && userData.email) {
          setEmail(userData.email);
          data.email = userData.email;
        }
      } catch {}
    } else {
      // Try to get token from Supabase session
      getGmailToken().then(token => {
        if (token) {
          setGmailTokenState(token);
          const userDataStr2 = localStorage.getItem('user_data');
          if (userDataStr2) {
            try {
              const userData = JSON.parse(userDataStr2);
              if (!email && userData.email) {
                setEmail(userData.email);
                data.email = userData.email;
              }
            } catch {}
          }
        }
      });
    }
    syncToData();

    // Listen for token updates
    const handleTokenUpdate = () => {
      const token = localStorage.getItem('gmail_access_token');
      setGmailTokenState(token);
    };
    window.addEventListener('gmail-token-updated', handleTokenUpdate);
    return () => window.removeEventListener('gmail-token-updated', handleTokenUpdate);
  }, []);

  const syncToData = (patch = {}) => {
    const resolvedMode = patch.mode ?? mode;
    const resolvedEmail = (patch.email ?? email).trim();
    const resolvedPassword = (patch.password ?? password).trim();
    const resolvedSmtpProvider = patch.smtpProvider ?? smtpProvider;
    const resolvedHost = resolvedSmtpProvider === 'custom'
      ? (patch.customHost ?? customHost).trim()
      : SMTP_PROVIDERS[resolvedSmtpProvider]?.host || 'smtp.gmail.com';
    const resolvedPort = resolvedSmtpProvider === 'custom'
      ? Number(patch.customPort ?? customPort)
      : SMTP_PROVIDERS[resolvedSmtpProvider]?.port || 587;

    Object.assign(data, patch, {
      mode: resolvedMode,
      email: resolvedEmail,
      password: resolvedPassword,
      smtpProvider: resolvedSmtpProvider,
      value: {
        mode: resolvedMode,
        email: resolvedEmail,
        password: resolvedPassword,
        host: resolvedHost,
        port: resolvedPort,
        // OAuth fields — populated at send/read time from localStorage
        gmailAccessToken: localStorage.getItem('gmail_access_token') || '',
        gmailRefreshToken: localStorage.getItem('gmail_refresh_token') || '',
      },
    });
  };

  const getAuthToken = () =>
    localStorage.getItem('office_weave_token') || localStorage.getItem('auth_token');

  // ── Test OAuth connection ──
  const testOAuth = async () => {
    const gmailToken = localStorage.getItem('gmail_access_token');
    if (!gmailToken) {
      setConnStatus('error');
      setConnMessage('No Gmail token found. Please log out and log in again with Google.');
      setTimeout(() => { setConnStatus(null); setConnMessage(''); }, 6000);
      return;
    }

    const userEmail = email.trim() || JSON.parse(localStorage.getItem('user_data') || '{}').email;
    if (!userEmail) {
      setConnStatus('error');
      setConnMessage('Could not determine email address.');
      setTimeout(() => { setConnStatus(null); setConnMessage(''); }, 6000);
      return;
    }

    setIsValidating(true);
    setConnStatus(null);

    try {
      const clientId     = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
      const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';

      const requestBody = {
        provider: 'gmail',
        config: {
          provider: 'gmail',
          clientId,
          clientSecret,
          credentials: {
            type: 'oauth2',
            accessToken: gmailToken,
            refreshToken: localStorage.getItem('gmail_refresh_token') || undefined,
          },
        },
        email: {
          to: [{ address: userEmail }],
          subject: 'Office Weave - Gmail Connection Test',
          body: {
            text: 'Gmail OAuth connection test successful!',
            html: '<p>Gmail OAuth connection test successful!</p>',
          },
        },
      };

      console.log('📤 OAuth test request (provider: gmail)');

      const response = await fetch(`${API}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log('🔍 OAuth test response:', response.status, result);

      if (response.ok && (result.success || result.data?.success)) {
        setConnStatus('connected');
        setConnMessage('Gmail OAuth connected! Test email sent.');
        data.isConnected = true;
        syncToData({ email: userEmail });
        setTimeout(() => { setConnStatus(null); setConnMessage(''); }, 6000);
      } else {
        setConnStatus('error');
        setConnMessage(result.error || result.data?.error || `Error ${response.status}`);
        data.isConnected = false;
        setTimeout(() => { setConnStatus(null); setConnMessage(''); }, 6000);
      }
    } catch (err) {
      setConnStatus('error');
      setConnMessage('Network error: ' + err.message);
      data.isConnected = false;
      setTimeout(() => { setConnStatus(null); setConnMessage(''); }, 6000);
    } finally {
      setIsValidating(false);
    }
  };

  // ── Test SMTP connection ──
  const testSMTP = async () => {
    const trimmedEmail    = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setConnStatus('error');
      setConnMessage('Email and App Password are required');
      setTimeout(() => { setConnStatus(null); setConnMessage(''); }, 5000);
      return;
    }

    const host = smtpProvider === 'custom' ? customHost.trim() : SMTP_PROVIDERS[smtpProvider].host;
    const port = smtpProvider === 'custom' ? Number(customPort) : SMTP_PROVIDERS[smtpProvider].port;

    if (!host) {
      setConnStatus('error');
      setConnMessage('SMTP host is required');
      setTimeout(() => { setConnStatus(null); setConnMessage(''); }, 5000);
      return;
    }

    setIsValidating(true);
    setConnStatus(null);

    try {
      const requestBody = {
        provider: 'smtp',
        config: {
          provider: 'smtp',
          host,
          port,
          secure: port === 465,
          credentials: {
            type: 'password',
            username: trimmedEmail,
            password: trimmedPassword,
          },
        },
        email: {
          to: [{ address: trimmedEmail }],
          subject: 'Office Weave - Connection Test',
          body: {
            text: 'SMTP connection test successful!',
            html: '<p>SMTP connection test successful!</p>',
          },
        },
      };

      console.log('📤 SMTP test request');

      const response = await fetch(`${API}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log('🔍 SMTP test response:', response.status, result);

      if (response.ok && (result.success || result.data?.success)) {
        setConnStatus('connected');
        setConnMessage('SMTP connected! Test email sent.');
        data.isConnected = true;
        syncToData();
        setTimeout(() => { setConnStatus(null); setConnMessage(''); }, 6000);
      } else {
        const isAuthErr = response.status === 401 || result.code === 'AUTH_ERROR';
        setConnStatus('error');
        setConnMessage(
          isAuthErr
            ? 'Session expired. Please log out and log in again.'
            : result.error || result.data?.error || `Error ${response.status}`
        );
        data.isConnected = false;
        setTimeout(() => { setConnStatus(null); setConnMessage(''); }, 6000);
      }
    } catch (err) {
      setConnStatus('error');
      setConnMessage('Network error: ' + err.message);
      data.isConnected = false;
      setTimeout(() => { setConnStatus(null); setConnMessage(''); }, 6000);
    } finally {
      setIsValidating(false);
    }
  };

  const testConnection = () => mode === 'oauth' ? testOAuth() : testSMTP();

  const clearAll = () => {
    setEmail(''); setPassword('');
    setConnStatus(null); setConnMessage('');
    data.isConnected = false;
    syncToData({ email: '', password: '' });
  };

  const canTestOAuth = mode === 'oauth' && !!gmailTokenState;
  const canTestSMTP  = mode === 'smtp' && !!email && !!password;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        relative rounded-lg border backdrop-blur-md
        ${selected
          ? 'ring-2 ring-purple-400/50 ring-offset-1 ring-offset-black border-purple-400/60'
          : 'border-white/20'}
        bg-black/90 shadow-xl transition-all duration-300
      `}
      style={{ width: 300 }}
    >
      {hasOutput && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 border-2 border-purple-400/60 bg-purple-500/20"
          style={{ right: -6 }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-purple-500/20 border border-purple-400/30">
            <Mail size={14} className="text-purple-400" />
          </div>
          <h3 className="text-xs font-semibold text-white">{label}</h3>
        </div>
        <div className="flex items-center space-x-1">
          {data.isConnected && (
            <div className="flex items-center space-x-1 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <Wifi size={9} className="text-green-400" />
              <span className="text-[9px] text-green-400">Connected</span>
            </div>
          )}
          <button onClick={clearAll} className="p-1 hover:bg-red-500/10 rounded transition-colors" title="Clear">
            <Trash2 size={13} className="text-white/30 hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 space-y-3">

        {/* Mode toggle */}
        <div>
          <label className="block text-[10px] text-white/60 mb-1">Auth Method</label>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => { setMode('oauth'); syncToData({ mode: 'oauth' }); }}
              className={`flex items-center justify-center space-x-1.5 py-1.5 rounded text-[10px] font-medium transition-colors ${
                mode === 'oauth'
                  ? 'bg-blue-500/30 border border-blue-400/50 text-blue-300'
                  : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
              }`}
            >
              <Zap size={10} />
              <span>Gmail OAuth</span>
            </button>
            <button
              onClick={() => { setMode('smtp'); syncToData({ mode: 'smtp' }); }}
              className={`flex items-center justify-center space-x-1.5 py-1.5 rounded text-[10px] font-medium transition-colors ${
                mode === 'smtp'
                  ? 'bg-purple-500/30 border border-purple-400/50 text-purple-300'
                  : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
              }`}
            >
              <Key size={10} />
              <span>SMTP</span>
            </button>
          </div>
        </div>

        {/* OAuth mode */}
        <AnimatePresence mode="wait">
          {mode === 'oauth' && (
            <motion.div
              key="oauth"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden space-y-3"
            >
              {gmailTokenState ? (
                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <CheckCircle size={12} className="text-blue-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] text-blue-300 font-medium">Gmail token detected</p>
                    <p className="text-[9px] text-blue-400/70">Logged in via Google OAuth</p>
                  </div>
                  <button
                    onClick={async () => {
                      const token = await getGmailToken();
                      setGmailTokenState(token || localStorage.getItem('gmail_access_token'));
                    }}
                    className="p-1 hover:bg-blue-500/20 rounded transition-colors"
                    title="Refresh token"
                  >
                    <RefreshCw size={10} className="text-blue-400" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertCircle size={12} className="text-yellow-400 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-yellow-300 font-medium">No Gmail token</p>
                      <p className="text-[9px] text-yellow-400/70">Authorize Gmail access below</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      setIsAuthorizing(true);
                      try {
                        await signInWithGoogle();
                      } catch (err) {
                        setConnStatus('error');
                        setConnMessage('Failed to authorize: ' + err.message);
                        setTimeout(() => { setConnStatus(null); setConnMessage(''); }, 5000);
                      } finally {
                        setIsAuthorizing(false);
                      }
                    }}
                    disabled={isAuthorizing}
                    className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded text-[10px] font-medium bg-orange-500/20 border border-orange-400/40 text-orange-300 hover:bg-orange-500/30 transition-colors disabled:opacity-50"
                  >
                    {isAuthorizing ? (
                      <><Loader size={11} className="animate-spin" /><span>Authorizing...</span></>
                    ) : (
                      <><Zap size={11} /><span>Authorize Gmail Access</span></>
                    )}
                  </button>
                </div>
              )}

              <div>
                <label className="block text-[10px] text-white/60 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); syncToData({ email: e.target.value }); }}
                  placeholder="your-email@gmail.com"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 text-xs focus:border-blue-400/40 focus:outline-none focus:ring-1 focus:ring-blue-400/20 transition-all"
                />
              </div>

              <p className="text-[9px] text-white/35 leading-relaxed">
                Uses your Google login token. No App Password needed.
              </p>
            </motion.div>
          )}

          {/* SMTP mode */}
          {mode === 'smtp' && (
            <motion.div
              key="smtp"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden space-y-3"
            >
              {/* SMTP provider */}
              <div>
                <label className="block text-[10px] text-white/60 mb-1">Provider</label>
                <div className="grid grid-cols-4 gap-1">
                  {Object.keys(SMTP_PROVIDERS).map(key => (
                    <button
                      key={key}
                      onClick={() => { setSmtpProvider(key); syncToData({ smtpProvider: key }); }}
                      className={`py-1 rounded text-[9px] font-medium capitalize transition-colors ${
                        smtpProvider === key
                          ? 'bg-purple-500/30 border border-purple-400/50 text-purple-300'
                          : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
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
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <label className="block text-[10px] text-white/60 mb-1">Host</label>
                        <input
                          type="text"
                          value={customHost}
                          onChange={(e) => { setCustomHost(e.target.value); syncToData({ customHost: e.target.value }); }}
                          placeholder="smtp.example.com"
                          className="w-full px-2 py-1.5 bg-gray-800/50 border border-white/10 rounded text-white placeholder-white/30 text-[10px] focus:border-purple-400/40 focus:outline-none"
                        />
                      </div>
                      <div className="w-16">
                        <label className="block text-[10px] text-white/60 mb-1">Port</label>
                        <input
                          type="number"
                          value={customPort}
                          onChange={(e) => { setCustomPort(e.target.value); syncToData({ customPort: e.target.value }); }}
                          placeholder="587"
                          className="w-full px-2 py-1.5 bg-gray-800/50 border border-white/10 rounded text-white placeholder-white/30 text-[10px] focus:border-purple-400/40 focus:outline-none"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className="block text-[10px] text-white/60 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); syncToData({ email: e.target.value }); }}
                  placeholder="your-email@gmail.com"
                  className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 text-xs focus:border-purple-400/40 focus:outline-none focus:ring-1 focus:ring-purple-400/20 transition-all"
                />
              </div>

              {/* App Password */}
              <div>
                <label className="block text-[10px] text-white/60 mb-1">App Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); syncToData({ password: e.target.value }); }}
                    placeholder="xxxx xxxx xxxx xxxx"
                    className="w-full px-3 py-2 pr-9 bg-gray-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 text-xs focus:border-purple-400/40 focus:outline-none focus:ring-1 focus:ring-purple-400/20 transition-all"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded"
                  >
                    {showPassword ? <EyeOff size={13} className="text-white/50" /> : <Eye size={13} className="text-white/50" />}
                  </button>
                </div>
                <p className="text-[9px] text-white/35 mt-1">
                  Use Gmail App Password, not your login password.{' '}
                  <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">
                    Get App Password →
                  </a>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Test Connection button */}
        <button
          onClick={testConnection}
          disabled={isValidating || (mode === 'oauth' ? !canTestOAuth : !canTestSMTP)}
          className={`w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded text-[10px] disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
            mode === 'oauth'
              ? 'bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30'
              : 'bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:bg-purple-600/30'
          }`}
        >
          {isValidating ? (
            <><Loader size={11} className="animate-spin" /><span>Testing...</span></>
          ) : connStatus === 'connected' ? (
            <><CheckCircle size={11} /><span>Connected!</span></>
          ) : connStatus === 'error' ? (
            <><WifiOff size={11} /><span>Failed</span></>
          ) : (
            <><Wifi size={11} /><span>Test Connection</span></>
          )}
        </button>

        {/* Status message */}
        {connMessage && (
          <div className={`text-[9px] p-2 rounded leading-relaxed ${
            connStatus === 'connected'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {connMessage}
          </div>
        )}
      </div>

      {/* Status dot */}
      <div className={`absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border-2 border-gray-900 ${
        data.isConnected ? 'bg-green-500' : 'bg-purple-500'
      }`} />
    </motion.div>
  );
});

EmailAccountNode.displayName = 'EmailAccountNode';
export default EmailAccountNode;
