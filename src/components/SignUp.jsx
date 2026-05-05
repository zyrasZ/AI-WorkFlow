import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, User, Lock, ArrowLeft, Briefcase } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function SignUp({ onSignUp, onNavigateToSignIn }) {
  const { signup, loading, error } = useAuth()
  const [signupStep, setSignupStep] = useState('form') // 'form' | 'workspace'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [workspaceName, setWorkspaceName] = useState('')
  const [localError, setLocalError] = useState('')

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error || localError) {
      setLocalError('') // Clear error when user types
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setLocalError('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp')
      return
    }

    if (formData.password.length < 6) {
      setLocalError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    try {
      setLocalError('')
      console.log('=== SIGNUP ATTEMPT ===')
      console.log('Email:', formData.email)
      
      const response = await signup(formData.email, formData.password)
      console.log('Signup response:', response)
      
      // Verify authentication was successful
      if (response && response.data) {
        console.log('Signup successful, moving to workspace step')
        // Move to workspace name step instead of calling onSignUp immediately
        setSignupStep('workspace')
      } else {
        throw new Error('Invalid signup response')
      }
    } catch (err) {
      console.error('Signup error:', err)
      setLocalError(err.message)
    }
  }

  const handleWorkspaceSubmit = async (e) => {
    e.preventDefault()
    
    if (!workspaceName.trim()) {
      setLocalError('Vui lòng nhập tên workspace')
      return
    }

    try {
      setLocalError('')
      console.log('Creating workspace:', workspaceName)
      
      // TODO: Call API to create workspace if backend supports it
      // For now, just store in localStorage
      localStorage.setItem('workspace_name', workspaceName.trim())
      
      console.log('Workspace created, calling onSignUp')
      onSignUp() // Now complete the signup flow
    } catch (err) {
      console.error('Workspace creation error:', err)
      setLocalError(err.message)
    }
  }

  // Render workspace name step
  if (signupStep === 'workspace') {
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
          background: 'radial-gradient(ellipse, rgba(234,97,19,0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Workspace Name Card */}
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
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 24px',
              background: 'linear-gradient(135deg, rgba(234,97,19,0.15), rgba(234,97,19,0.05))',
              border: '1px solid rgba(234,97,19,0.2)',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Briefcase size={28} color="#EA6113" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#fff',
              textAlign: 'center',
              marginBottom: '8px',
              letterSpacing: '-0.01em',
            }}
          >
            Đặt tên Workspace
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={{
              fontSize: '14px',
              color: '#6b7280',
              textAlign: 'center',
              marginBottom: '36px',
              lineHeight: 1.6,
            }}
          >
            Tạo workspace để quản lý các dự án và quy trình làm việc của bạn.
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

          {/* Workspace Name Form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={handleWorkspaceSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* Workspace Name */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '13px', 
                color: 'rgba(255,255,255,0.6)', 
                marginBottom: '8px', 
                fontWeight: 500 
              }}>
                Tên Workspace
              </label>
              <div style={{ position: 'relative' }}>
                <Briefcase 
                  size={16} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'rgba(255,255,255,0.4)' 
                  }} 
                />
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => {
                    setWorkspaceName(e.target.value)
                    if (error || localError) setLocalError('')
                  }}
                  placeholder="Công ty ABC, Team Marketing..."
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 40px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#fff',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = '#EA6113'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: loading ? 'rgba(234,97,19,0.5)' : '#EA6113',
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
              {loading ? 'Đang tạo workspace...' : 'Hoàn tất'}
            </motion.button>
          </motion.form>

          {/* Progress indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginTop: '24px',
            }}
          >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EA6113' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EA6113' }} />
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // Render signup form
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
        background: 'radial-gradient(ellipse, rgba(234,97,19,0.03) 0%, transparent 70%)',
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
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={onNavigateToSignIn}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
          }}
        >
          <ArrowLeft size={16} />
        </motion.button>

        {/* Logo/Icon */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 24px',
            background: 'linear-gradient(135deg, rgba(234,97,19,0.15), rgba(234,97,19,0.05))',
            border: '1px solid rgba(234,97,19,0.2)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EA6113" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#fff',
            textAlign: 'center',
            marginBottom: '8px',
            letterSpacing: '-0.01em',
          }}
        >
          Tạo tài khoản mới
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{
            fontSize: '14px',
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: '36px',
            lineHeight: 1.6,
          }}
        >
          Tham gia Nomads để tự động hóa quy trình làm việc của bạn.
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

        {/* Sign Up Form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {/* Full Name */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '13px', 
              color: 'rgba(255,255,255,0.6)', 
              marginBottom: '8px', 
              fontWeight: 500 
            }}>
              Họ và tên
            </label>
            <div style={{ position: 'relative' }}>
              <User 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'rgba(255,255,255,0.4)' 
                }} 
              />
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Nguyễn Văn A"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#fff',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#EA6113'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '13px', 
              color: 'rgba(255,255,255,0.6)', 
              marginBottom: '8px', 
              fontWeight: 500 
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'rgba(255,255,255,0.4)' 
                }} 
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@company.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#fff',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#EA6113'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '13px', 
              color: 'rgba(255,255,255,0.6)', 
              marginBottom: '8px', 
              fontWeight: 500 
            }}>
              Mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'rgba(255,255,255,0.4)' 
                }} 
              />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#fff',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#EA6113'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '13px', 
              color: 'rgba(255,255,255,0.6)', 
              marginBottom: '8px', 
              fontWeight: 500 
            }}>
              Xác nhận mật khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'rgba(255,255,255,0.4)' 
                }} 
              />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#fff',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#EA6113'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            style={{
              width: '100%',
              padding: '14px 20px',
              background: loading ? 'rgba(234,97,19,0.5)' : '#EA6113',
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
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </motion.button>
        </motion.form>

        {/* Sign In Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ textAlign: 'center', marginTop: '24px' }}
        >
          <span style={{ fontSize: '13px', color: '#6b7280' }}>
            Đã có tài khoản?{' '}
          </span>
          <button
            onClick={onNavigateToSignIn}
            style={{
              fontSize: '13px',
              color: '#EA6113',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#F88F22'}
            onMouseLeave={e => e.currentTarget.style.color = '#EA6113'}
          >
            Đăng nhập ngay
          </button>
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
            marginTop: '20px',
          }}
        >
          Bằng việc tạo tài khoản, bạn đồng ý với{' '}
          <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Điều khoản</a>
          {' '}và{' '}
          <a href="#" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Chính sách bảo mật</a> của chúng tôi.
        </motion.p>

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '16px',
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EA6113' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
        </motion.div>
      </motion.div>
    </div>
  )
}
