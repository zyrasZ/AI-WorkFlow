import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MoreVertical, Folder, Grid3x3, MessageCircle, ChevronDown, Trash2, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { apiClient } from '../lib/api'

const workflowTemplates = [
  { id: 't1', name: 'Figma Weave Welcome', thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=240&fit=crop', nodes: 5 },
  { id: 't2', name: 'Multiple Models', thumb: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=240&fit=crop', nodes: 8 },
  { id: 't3', name: 'PDF Analysis Flow', thumb: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=240&fit=crop', nodes: 6 },
  { id: 't4', name: 'Content Generator', thumb: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=240&fit=crop', nodes: 4 },
]

function formatTimeAgo(date) {
  const seconds = Math.floor((Date.now() - date) / 1000)
  if (seconds < 60) return `${seconds} seconds ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

function ProjectCard({ project, onOpen, onDelete, onRename }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(project.name)

  const handleRename = () => {
    if (editedName.trim() && editedName !== project.name) {
      onRename(project.id, editedName.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRename()
    } else if (e.key === 'Escape') {
      setEditedName(project.name)
      setIsEditing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false); }}
      style={{
        background: '#1a1a1c',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.2s',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Thumbnail */}
      <div onClick={() => onOpen(project)} style={{ position: 'relative', aspectRatio: '16/9', background: '#0d0d0f', overflow: 'hidden' }}>
        {project.thumbnail ? (
          <img src={project.thumbnail} alt={project.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Grid3x3 size={32} style={{ color: 'rgba(255,255,255,0.15)' }} />
          </div>
        )}
        {/* Overlay gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,12,0.8) 0%, transparent 50%)' }} />
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                fontSize: '14px',
                fontWeight: 600,
                color: '#fff',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(234,97,19,0.5)',
                borderRadius: '4px',
                padding: '4px 8px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          ) : (
            <h3 
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              style={{ 
                fontSize: '14px', 
                fontWeight: 600, 
                color: '#fff', 
                margin: 0, 
                flex: 1, 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                cursor: 'text'
              }}
            >
              {project.name}
            </h3>
          )}
          
          {/* Menu button */}
          <div style={{ position: 'relative' }}>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: hovered ? 1 : 0 }}
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              style={{
                width: '28px', height: '28px', borderRadius: '6px',
                background: menuOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.15s',
              }}
              whileHover={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <MoreVertical size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
            </motion.button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: '4px',
                    background: 'rgba(20,20,22,0.98)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                    padding: '4px', minWidth: '140px', zIndex: 50,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(project.id); }}
                    style={{
                      width: '100%', padding: '8px 12px', background: 'transparent',
                      border: 'none', borderRadius: '4px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '8px',
                      fontSize: '13px', color: '#ef4444', textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', margin: 0, fontFamily: 'monospace' }}>
          Last edited {formatTimeAgo(project.lastEdited)}
        </p>
      </div>
    </motion.div>
  )
}

function TemplateCard({ template }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -3 }}
      style={{
        minWidth: '280px', maxWidth: '280px',
        background: '#1a1a1c',
        border: `1px solid ${hovered ? 'rgba(234,97,19,0.3)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '16/9', background: '#0d0d0f', overflow: 'hidden' }}>
        <img src={template.thumb} alt={template.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
        <div style={{ position: 'absolute', top: '8px', right: '8px', padding: '4px 8px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', borderRadius: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>
          {template.nodes} nodes
        </div>
      </div>
      <div style={{ padding: '12px 14px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#fff', margin: 0 }}>{template.name}</h4>
      </div>
    </motion.div>
  )
}

// Initial timestamp to avoid impure function calls during render
const INITIAL_TIME = Date.now()

export default function ProjectManagement({ onOpenProject, onBack, onLogout, onSettings }) {
  const { user, loading: authLoading } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Get user data from useAuth or fallback to localStorage
  // This will re-calculate whenever 'user' changes
  const currentUser = user || (() => {
    try {
      const storedUserData = localStorage.getItem('user_data')
      if (storedUserData) {
        return JSON.parse(storedUserData)
      }
    } catch (e) {
      console.error('Failed to parse user_data:', e)
    }
    return null
  })()

  // Get workspace name from user data
  const workspaceName = currentUser?.name || 
                        currentUser?.user_metadata?.full_name ||
                        currentUser?.user_metadata?.name ||
                        currentUser?.email?.split('@')[0] || 
                        'My WorkSpace'
  
  // Get user avatar
  const userAvatar = currentUser?.avatar_url || 
                     currentUser?.user_metadata?.avatar_url ||
                     currentUser?.user_metadata?.picture ||
                     null
  
  // Get user display name
  const userDisplayName = currentUser?.name ||
                          currentUser?.user_metadata?.full_name ||
                          currentUser?.user_metadata?.name ||
                          currentUser?.email?.split('@')[0] ||
                          'User'

  // Debug: Log user data
  useEffect(() => {
    console.log('=== ProjectManagement User Debug ===')
    console.log('User from useAuth:', user)
    console.log('Current user (with fallback):', currentUser)
    console.log('Auth loading:', authLoading)
    console.log('User email:', currentUser?.email)
    console.log('User name:', currentUser?.name)
    console.log('User avatar:', currentUser?.avatar_url)
    console.log('User metadata:', currentUser?.user_metadata)
    
    const storedUserData = localStorage.getItem('user_data')
    console.log('LocalStorage user_data (raw):', storedUserData)
    
    if (storedUserData) {
      try {
        const parsedUser = JSON.parse(storedUserData)
        console.log('Parsed user data:', parsedUser)
        console.log('Parsed user email:', parsedUser.email)
        console.log('Parsed user name:', parsedUser.name)
        console.log('Parsed user avatar:', parsedUser.avatar_url)
        console.log('Parsed user metadata:', parsedUser.user_metadata)
      } catch (e) {
        console.error('Failed to parse user_data:', e)
      }
    }
    
    console.log('LocalStorage token:', localStorage.getItem('office_weave_token'))
    console.log('Computed values:')
    console.log('  - workspaceName:', workspaceName)
    console.log('  - userAvatar:', userAvatar)
    console.log('  - userDisplayName:', userDisplayName)
  }, [user, authLoading, currentUser, workspaceName, userAvatar, userDisplayName])

  // Load workflows from backend - wait for auth to be ready
  useEffect(() => {
    const token = localStorage.getItem('office_weave_token')
    if (token) {
      loadWorkflows()
    } else {
      setLoading(false)
      setError('Vui lòng đăng nhập để xem workflows')
    }
  }, [])

  // Reload when user changes (e.g. after Google OAuth)
  useEffect(() => {
    if (user) {
      loadWorkflows()
    }
  }, [user])

  const loadWorkflows = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('📥 Loading workflows from API...')
      
      const token = localStorage.getItem('office_weave_token')
      if (!token) {
        setError('Không có token xác thực')
        return
      }

      const response = await apiClient.getWorkflows({ limit: 50 })
      console.log('📦 API response:', response)
      
      const workflowList = response?.data?.workflows || response?.workflows || []
      
      const workflows = workflowList.map(workflow => {
        const nodes = workflow.metadata?.nodes || workflow.nodes || []
        const edges = workflow.metadata?.edges || workflow.edges || []
        const thumbnail = workflow.metadata?.thumbnail || null

        return {
          id: workflow.id,
          name: workflow.name || 'Untitled Workflow',
          thumbnail,
          lastEdited: new Date(workflow.updated_at || workflow.created_at).getTime(),
          description: workflow.description,
          nodeCount: nodes.length,
          nodes,
          edges
        }
      })
      
      console.log('✅ Loaded workflows:', workflows.length)
      setProjects(workflows)
    } catch (err) {
      console.error('❌ Failed to load workflows:', err)
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.')
      } else {
        setError('Không thể tải workflows: ' + err.message)
      }
    } finally {
      setLoading(false)
    }
  }



  const createNewProject = useCallback(async () => {
    try {
      // Check if user is authenticated first
      if (!user) {
        setError('Bạn cần đăng nhập để tạo workflow')
        return
      }

      console.log('Creating new workflow for user:', user)
      console.log('Auth token:', localStorage.getItem('auth_token'))
      
      const newWorkflow = {
        name: 'Untitled Workflow',
        description: 'New workflow created from dashboard',
        nodes: [],
        edges: [],
        metadata: {
          created_from: 'dashboard',
          version: '1.0.0'
        }
      }
      
      console.log('Sending workflow data:', newWorkflow)
      const response = await apiClient.createWorkflow(newWorkflow)
      console.log('Workflow created successfully:', response)
      
      const workflow = response.data
      
      const newProject = {
        id: workflow.id,
        name: workflow.name,
        thumbnail: null,
        lastEdited: new Date(workflow.created_at).getTime(),
        description: workflow.description,
        nodeCount: 0
      }
      
      setProjects(prev => [newProject, ...prev])
      
      // Open the new project immediately
      onOpenProject(newProject)
    } catch (err) {
      console.error('Failed to create workflow:', err)
      console.error('Error details:', {
        message: err.message,
        user: user,
        hasToken: !!localStorage.getItem('auth_token')
      })
      setError('Không thể tạo workflow mới: ' + err.message)
    }
  }, [onOpenProject, user])

  const deleteProject = useCallback(async (id) => {
    try {
      await apiClient.deleteWorkflow(id)
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Failed to delete workflow:', err)
      setError('Không thể xóa workflow')
    }
  }, [])

  const renameProject = useCallback(async (id, newName) => {
    try {
      await apiClient.updateWorkflow(id, { name: newName })
      setProjects(prev => prev.map(p => 
        p.id === id ? { ...p, name: newName } : p
      ))
    } catch (err) {
      console.error('Failed to rename workflow:', err)
      setError('Không thể đổi tên workflow')
    }
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#0a0a0c', fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '280px', background: '#0d0d0f', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* User profile */}
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              width: '100%', padding: '12px', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userDisplayName}
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '8px', 
                    objectFit: 'cover',
                    border: '1px solid rgba(255,255,255,0.1)',
                    flexShrink: 0
                  }} 
                />
              ) : (
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #EA6113, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                  {workspaceName.charAt(0).toUpperCase()}
                </div>
              )}
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{workspaceName}</span>
            </div>
            <ChevronDown size={14} style={{ color: 'rgba(255,255,255,0.4)', transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0, marginLeft: '8px' }} />
          </button>

          {/* User Dropdown Menu */}
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  position: 'absolute', left: '16px', right: '16px', top: '72px', zIndex: 100,
                  background: 'rgba(20,20,22,0.98)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
                  padding: '12px', boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                }}
              >
                {/* User Info */}
                <div style={{ padding: '12px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    {userAvatar ? (
                      <img 
                        src={userAvatar} 
                        alt={userDisplayName}
                        style={{ 
                          width: '48px', 
                          height: '48px', 
                          borderRadius: '10px', 
                          objectFit: 'cover',
                          border: '1px solid rgba(255,255,255,0.15)',
                          flexShrink: 0
                        }} 
                      />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {(currentUser?.email?.charAt(0) || 'U').toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                        {userDisplayName}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', wordBreak: 'break-all', lineHeight: '1.4' }}>
                        {currentUser?.email || 'No email'}
                      </div>
                    </div>
                  </div>

                  {/* Credits */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: 600 }}>Credits</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>✦ 150</span>
                      </div>
                      <button style={{
                        fontSize: '11px', color: '#EA6113', background: 'transparent',
                        border: 'none', cursor: 'pointer', fontWeight: 600,
                        textDecoration: 'underline', padding: 0,
                      }}>
                        Upgrade for more
                      </button>
                    </div>
                  </div>

                  {/* Plan */}
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', fontWeight: 600 }}>Plan</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', color: '#fff', fontWeight: 500 }}>Free</span>
                      <button style={{
                        fontSize: '11px', color: '#EA6113', background: 'transparent',
                        border: 'none', cursor: 'pointer', fontWeight: 600,
                        textDecoration: 'underline', padding: 0,
                      }}>
                        Upgrade
                      </button>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div style={{ padding: '4px' }}>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      onSettings()
                    }}
                    style={{
                      width: '100%', padding: '10px 12px', background: 'transparent',
                      border: 'none', borderRadius: '6px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '10px',
                      fontSize: '13px', color: 'rgba(255,255,255,0.8)', textAlign: 'left',
                      transition: 'background 0.15s', fontWeight: 500,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Settings size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
                    Settings
                  </button>

                  <button
                    onClick={onLogout}
                    style={{
                      width: '100%', padding: '10px 12px', background: 'transparent',
                      border: 'none', borderRadius: '6px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '10px',
                      fontSize: '13px', color: 'rgba(255,255,255,0.8)', textAlign: 'left',
                      transition: 'background 0.15s', fontWeight: 500,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} style={{ color: 'rgba(255,255,255,0.6)' }} />
                    Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Create button */}
        <div style={{ padding: '16px' }}>
          <motion.button
            onClick={createNewProject}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%', padding: '12px', background: '#EA6113', color: '#050507',
              border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
            }}
          >
            <Plus size={16} />
            Create New File
          </motion.button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0 12px', overflowY: 'auto' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Files ({projects.length})
              </span>
              <button 
                onClick={createNewProject}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
              >
                <Plus size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
              </button>
            </div>
            
            {/* Files List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {projects.slice(0, 10).map(project => (
                <button 
                  key={project.id}
                  onClick={() => onOpenProject(project)}
                  style={{
                    width: '100%', padding: '8px 12px', background: 'transparent',
                    border: 'none', borderRadius: '6px', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                    fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 500,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Folder size={14} style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {project.name}
                  </span>
                </button>
              ))}
              
              {projects.length === 0 && (
                <div style={{ padding: '20px 12px', textAlign: 'center' }}>
                  <Folder size={24} style={{ color: 'rgba(255,255,255,0.2)', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>
                    Chưa có workflow
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div style={{ padding: '8px 12px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tools</span>
            </div>
            <button style={{
              width: '100%', padding: '10px 12px', background: 'transparent',
              border: 'none', borderRadius: '6px', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
              fontSize: '13px', color: 'rgba(255,255,255,0.6)', fontWeight: 500,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Grid3x3 size={16} />
              Apps
            </button>
          </div>
        </nav>

        {/* Bottom utility */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button style={{
            width: '100%', padding: '10px 12px', background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px',
            display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
            fontSize: '13px', color: 'rgba(255,255,255,0.6)', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <MessageCircle size={16} />
            Support
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {onBack && (
              <button
                onClick={onBack}
                style={{
                  padding: '8px 12px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px',
                  fontSize: '12px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              >
                ← Back
              </button>
            )}
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>{workspaceName}</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <motion.button
              onClick={createNewProject}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '10px 20px', background: '#EA6113', color: '#050507',
                border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
              }}
            >
              <Plus size={14} />
              Create New File
            </motion.button>
          </div>
        </div>

        {/* Content scroll area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {/* My Files Grid */}
          <section>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '20px' }}>My Files</h2>
            
            {/* Error Message */}
            {error && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#ef4444',
                textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '2px solid rgba(255,255,255,0.1)',
                  borderTop: '2px solid #EA6113',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
            ) : error ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: 'rgba(239,68,68,0.8)',
                fontSize: '14px'
              }}>
                <p>{error}</p>
                <button
                  onClick={loadWorkflows}
                  style={{
                    marginTop: '16px',
                    padding: '8px 20px',
                    background: 'rgba(234,97,19,0.1)',
                    border: '1px solid rgba(234,97,19,0.3)',
                    borderRadius: '8px',
                    color: '#EA6113',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                <AnimatePresence mode="popLayout">
                  {projects.length === 0 ? (
                    <div style={{
                      gridColumn: '1 / -1',
                      textAlign: 'center',
                      padding: '60px 20px',
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: '14px'
                    }}>
                      <Folder size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                      <p>Chưa có workflow nào</p>
                      <p style={{ fontSize: '12px', marginTop: '8px' }}>
                        Tạo workflow đầu tiên của bạn bằng cách click nút "+ Create New File"
                      </p>
                    </div>
                  ) : (
                    projects.map(project => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onOpen={onOpenProject}
                        onDelete={deleteProject}
                        onRename={renameProject}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
