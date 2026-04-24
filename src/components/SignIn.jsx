import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function SignIn({ onSignIn, onNavigateToSignUp }) {
  const { login, loading, error } = useAuth()
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setLocalError('Vui lòng nhập email và mật khẩu')
      return
    }

    try {
      setLocalError('')
      console.log('=== LOGIN ATTEMPT ===')
      console.log('Email:', email)
      
      const response = await login(email, password)
      console.log('Login response:', response)
      
      // Verify authentication was successful
      if (response && response.data) {
        console.log('Login successful, calling onSignIn')
        onSignIn() // Notify parent component
      } else {
        throw new Error('Invalid login response')
      }
    } catch (err) {
      console.error('Login error:', err)
      setLocalError(err.message)
    }
  }

  const handleAuth = (provider) => {
    if (provider === 'email') {
      setShowEmailForm(true)
      return
    }
    
    // TODO: Implement SSO when backend supports it
    setLocalError(`${provider} login chưa được hỗ trợ. Vui lòng dùng Email.`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: '#0a0a0c',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Dot grid background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        pointerEvents: 'none',
      }} />

      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(226,255,70,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Glassmorphic card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '440px',
          margin: '0 20px',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '48px 40px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo/Icon */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 24px',
            background: 'linear-gradient(135deg, rgba(226,255,70,0.15), rgba(226,255,70,0.05))',
            border: '1px solid rgba(226,255,70,0.2)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e2ff46" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#fff',
            textAlign: 'center',
            marginBottom: '8px',
            letterSpacing: '-0.01em',
          }}
        >
          Welcome to OfficeAI Weave
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            fontSize: '14px',
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: '36px',
            lineHeight: 1.6,
          }}
        >
          Đăng nhập để bắt đầu tự động hóa quy trình văn phòng của bạn.
        </motion.p>

        {/* Error Message */}
        {(error || localError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#ef4444',
              textAlign: 'center',
            }}
          >
            {error || localError}
          </motion.div>
        )}

        {/* Email Form or SSO Buttons */}
        {showEmailForm ? (
          <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontWeight: 500 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#fff',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#e2ff46'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', fontWeight: 500 }}>
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#fff',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#e2ff46'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: loading ? 'rgba(226,255,70,0.5)' : '#e2ff46',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#050507',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                marginTop: '8px',
              }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </motion.button>

            <button
              type="button"
              onClick={() => {
                setShowEmailForm(false)
                setLocalError('')
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '13px',
                cursor: 'pointer',
                padding: '8px',
              }}
            >
              ← Quay lại
            </button>
          </form>
        ) : (
          <>
        {/* SSO Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Microsoft 365 */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            onClick={() => handleAuth('microsoft')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#e2ff46'
              e.currentTarget.style.background = 'rgba(226,255,70,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="9" height="9" fill="#F25022"/>
              <rect x="13" y="2" width="9" height="9" fill="#7FBA00"/>
              <rect x="2" y="13" width="9" height="9" fill="#00A4EF"/>
              <rect x="13" y="13" width="9" height="9" fill="#FFB900"/>
            </svg>
            Tiếp tục với Microsoft Office 365
          </motion.button>

          {/* Google */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onClick={() => handleAuth('google')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#e2ff46'
              e.currentTarget.style.background = 'rgba(226,255,70,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Tiếp tục với Google
          </motion.button>

          {/* Email */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            onClick={() => handleAuth('email')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#e2ff46'
              e.currentTarget.style.background = 'rgba(226,255,70,0.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            }}
          >
            <Mail size={20} style={{ color: 'rgba(255,255,255,0.7)' }} />
            Đăng nhập bằng Email
          </motion.button>
        </div>

        {/* Divider */}
        <div style={{ margin: '28px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>hoặc</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Sign Up Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ textAlign: 'center', marginBottom: '24px' }}
        >
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            Chưa có tài khoản?{' '}
          </span>
          <button
            onClick={onNavigateToSignUp}
            style={{
              fontSize: '13px',
              color: '#e2ff46',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#f0ff6b'}
            onMouseLeave={e => e.currentTarget.style.color = '#e2ff46'}
          >
            Đăng ký ngay
          </button>
        </motion.div>

        {/* Forgot password link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ textAlign: 'center', marginBottom: '24px' }}
        >
          <a
            href="#"
            style={{
              fontSize: '13px',
              color: '#6b7280',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#e2ff46'}
            onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
          >
            Quên mật khẩu?
          </a>
        </motion.div>

        {/* Terms */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.25)',
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          By signing in, you agree to our{' '}
          <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Terms</a>
          {' '}and{' '}
          <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Privacy Policy</a>.
        </motion.p>
          </>
        )}
      </motion.div>
    </div>
  )
}
