import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, User, Settings as SettingsIcon, Users, Info } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { apiClient } from '../lib/api'

export default function Settings({ onBack }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('settings') // 'profile', 'settings', 'members'
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Get user data from useAuth or fallback to localStorage
  const getUserData = () => {
    if (user) return user
    
    try {
      const storedUserData = localStorage.getItem('user_data')
      if (storedUserData) {
        return JSON.parse(storedUserData)
      }
    } catch (e) {
      console.error('Failed to parse user_data:', e)
    }
    
    return null
  }

  const currentUser = getUserData()

  // Load user settings
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getSettings()
      setSettings(response.data)
    } catch (err) {
      console.error('Failed to load settings:', err)
      setError('Không thể tải settings')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'members', label: 'Members', icon: Users },
  ]

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#0a0a0c', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width: '280px', background: '#0d0d0f', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Back button */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: '14px', fontWeight: 600, color: '#fff',
              padding: '8px 0', transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <ArrowLeft size={18} />
            Nguyễn Lê Thái Phát's Workspace
          </button>
        </div>

        {/* Navigation tabs */}
        <nav style={{ padding: '16px 12px' }}>
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%', padding: '12px 16px', marginBottom: '4px',
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  fontSize: '14px', fontWeight: 500, color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                  textAlign: 'left', transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '48px 64px' }}>
        {activeTab === 'profile' && <ProfileTab user={currentUser} />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'members' && <MembersTab />}
      </div>
    </div>
  )
}

function ProfileTab({ user }) {
  const [name, setName] = useState(user?.email?.split('@')[0] || '')
  const [email, setEmail] = useState(user?.email || '')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: '600px' }}
    >
      {/* Avatar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '120px', height: '120px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '48px', fontWeight: 700, color: '#fff',
          border: '4px solid rgba(255,255,255,0.1)',
        }}>
          {(user?.email?.[0] || 'U').toUpperCase()}
        </div>
      </div>

      {/* Name field */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px', fontSize: '14px', color: '#fff',
            fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.15s',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
          onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
      </div>

      {/* Email field */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px', fontSize: '14px', color: '#fff',
            fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.15s',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
          onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
      </div>

      {/* Role field */}
      <div style={{ marginBottom: '32px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Role
        </label>
        <input
          type="text"
          defaultValue="Admin"
          disabled
          style={{
            width: '100%', padding: '12px 16px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '8px', fontSize: '14px', color: 'rgba(255,255,255,0.4)',
            fontFamily: 'inherit', outline: 'none', cursor: 'not-allowed',
          }}
        />
      </div>
    </motion.div>
  )
}

function SettingsTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: '800px' }}
    >
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>General</h2>
      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>Manage your workspace settings</p>

      {/* Workspace Name */}
      <div style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px', fontWeight: 700, color: '#fff',
            border: '2px solid rgba(255,255,255,0.1)',
          }}>
            N
          </div>
        </div>

        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Name
        </label>
        <input
          type="text"
          defaultValue="Nguyễn Lê Thái Phát's Workspace"
          style={{
            width: '100%', padding: '12px 16px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px', fontSize: '14px', color: '#fff',
            fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.15s',
          }}
          onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
          onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        />
      </div>

      {/* Credits Section */}
      <div style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '24px' }}>Credits</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Current amount</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>✦</span> 150
            </div>
          </div>
          <button style={{
            padding: '10px 20px', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
            fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.color = '#fff'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
          }}
          >
            Get more credits
          </button>
        </div>

        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px' }}>
          150 monthly credits
        </div>

        <button style={{
          background: 'transparent', border: 'none', padding: 0,
          fontSize: '13px', color: 'rgba(255,255,255,0.6)', textDecoration: 'underline',
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Download credits usage history
        </button>
      </div>

      {/* Plan Section */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '24px' }}>Plan</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>Plan</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Free</div>
          </div>
          <button style={{
            padding: '10px 24px', background: '#e2ff46', color: '#050507',
            border: 'none', borderRadius: '8px',
            fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            transition: 'transform 0.15s',
            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Upgrade plan
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
          <span>Monthly credits</span>
          <Info size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
        </div>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
          ✦ 150
        </div>
      </div>
    </motion.div>
  )
}

function MembersTab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: '800px' }}
    >
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>Upgrade required for team features</h2>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '32px', lineHeight: '1.6' }}>
        Your current plan is a personal plan and doesn't support adding additional members. In order to create together, upgrade your plan.
      </p>

      <button style={{
        width: '100%', maxWidth: '500px', padding: '14px 24px',
        background: '#e2ff46', color: '#050507',
        border: 'none', borderRadius: '8px',
        fontSize: '14px', fontWeight: 700, cursor: 'pointer',
        transition: 'transform 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        Upgrade plan
      </button>
    </motion.div>
  )
}
