import { useState, useCallback, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getGmailToken, listenForAuthChanges, supabase } from './lib/supabase'
import LandingPage from './components/LandingPage'
import NomadsBackground from './components/NomadsBackground'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import ProjectManagement from './components/ProjectManagement'
import Settings from './components/Settings'
import Documentation from './components/Documentation'
import ReactFlow, {
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'

import SidebarWrapper from './components/sidebar/SidebarWrapper'
import GhostNode from './components/GhostNode'
import PromptNode from './components/PromptNode'
import OutputNode from './components/OutputNode'
import FileInputNode from './components/FileInputNode'
import EmailAccountNode from './components/EmailAccountNode'
import SendEmailNode from './components/SendEmailNode'
import ReadEmailNode from './components/ReadEmailNode'
import FilterEmailNode from './components/FilterEmailNode'
import EmailTemplateNode from './components/EmailTemplateNode'
import IfElseNode from './components/IfElseNode'
import SwitchNode from './components/SwitchNode'
import LoopNode from './components/LoopNode'
import DelayNode from './components/DelayNode'
import MergeNode from './components/MergeNode'
import NeonEdge from './components/NeonEdge'
import FigmaWeaveBackground from './components/FigmaWeaveBackground'
import DebugInfo from './components/DebugInfo'
import nodeRegistry from './registry/NodeRegistry.js'
import engine from './engine/Engine.js'
import { useCanvasLogic } from './hooks/useCanvasLogic.js'
import { apiClient } from './lib/api.js'

// Page Transition Variants
const pageVariants = {
  initial: { 
    opacity: 0, 
    scale: 0.98,
    filter: 'blur(10px)'
  },
  animate: { 
    opacity: 1, 
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 1.02,
    filter: 'blur(10px)',
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1]
    }
  }
}

const nodeTypes = { 
  ghostNode: GhostNode,
  promptNode: PromptNode,
  outputNode: OutputNode,
  fileInputNode: FileInputNode,
  emailAccountNode: EmailAccountNode,
  sendEmailNode: SendEmailNode,
  readEmailNode: ReadEmailNode,
  filterEmailNode: FilterEmailNode,
  emailTemplateNode: EmailTemplateNode,
  ifElseNode: IfElseNode,
  switchNode: SwitchNode,
  loopNode: LoopNode,
  delayNode: DelayNode,
  mergeNode: MergeNode,
}
const edgeTypes = { neonEdge: NeonEdge }

// Canvas trống - user tự kéo node từ sidebar
const initialNodes = []
const initialEdges = []


export default function App() {
  // Check auth token on mount
  const hasAuthToken = typeof window !== 'undefined' && localStorage.getItem('office_weave_token')
  
  const [showLanding, setShowLanding] = useState(!hasAuthToken)
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [showProjectManagement, setShowProjectManagement] = useState(!!hasAuthToken)
  const [showSettings, setShowSettings] = useState(false)
  const [showDocumentation, setShowDocumentation] = useState(false)
  const [currentProject, setCurrentProject] = useState(null)
  const [navigationHistory, setNavigationHistory] = useState(hasAuthToken ? ['projects'] : ['landing'])
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionProgress, setExecutionProgress] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [projectManagementKey, setProjectManagementKey] = useState(0)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [zoomLevel, setZoomLevel] = useState(100)
  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const saveTimeoutRef = useRef(null)
  const lastSaveDataRef = useRef(null) // Track last saved data to avoid unnecessary saves

  // ✅ Initialize Supabase auth listener (stores provider_token on login/refresh)
  useEffect(() => {
    listenForAuthChanges();
    // Also try to get Gmail token from existing session on mount
    getGmailToken().then(token => {
      if (token) {
        console.log('✅ Gmail token available on mount');
      }
    });

    // Listen for auth-changed event from Supabase onAuthStateChange
    // This handles the case where Supabase detects SIGNED_IN before URL callback runs
    const handleAuthChanged = (e) => {
      const userData = e.detail;
      if (userData && userData.email && localStorage.getItem('office_weave_token')) {
        console.log('✅ Auth changed event — navigating to projects');
        setShowLanding(false);
        setShowSignIn(false);
        setShowSignUp(false);
        setShowProjectManagement(true);
        setProjectManagementKey(k => k + 1);
        setNavigationHistory(['projects']);
        window.history.replaceState({ page: 'projects' }, '', '#/projects');
      }
    };
    window.addEventListener('auth-changed', handleAuthChanged);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChanged);
    };
  }, []);

  // ✅ Handle Google OAuth callback at App level
  // Supabase redirects with tokens in URL hash: /#access_token=xxx&provider_token=yyy
  // OR in query params: /?access_token=xxx
  useEffect(() => {
    // Check both query params and hash fragment
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))

    const accessToken = params.get('access_token') || hashParams.get('access_token')
    const errorMsg = params.get('message') || hashParams.get('error_description')

    // Also grab provider_token from hash (Supabase puts it there)
    const providerToken = params.get('provider_token') || hashParams.get('provider_token')
    const providerRefreshToken = params.get('provider_refresh_token') || hashParams.get('provider_refresh_token')

    if (!accessToken && !errorMsg) return

    if (accessToken) {
      console.log('✅ Google OAuth callback detected, processing token...')
      console.log('🔍 provider_token from URL:', providerToken ? providerToken.slice(0, 30) + '...' : 'EMPTY/NULL')
      console.log('🔍 provider_refresh_token:', providerRefreshToken ? 'present' : 'EMPTY/NULL')
      
      // Store Supabase token
      localStorage.setItem('office_weave_token', accessToken)

      // Store Gmail provider_token if present (for Gmail API)
      if (providerToken) {
        localStorage.setItem('gmail_access_token', providerToken)
        console.log('✅ Gmail provider_token stored from URL')
      } else {
        console.warn('⚠️ provider_token is empty in URL — trying Supabase session fallback...')
        // Fallback: try to get provider_token from Supabase session
        getGmailToken().then(token => {
          if (token) {
            console.log('✅ Gmail token retrieved via Supabase session fallback')
          } else {
            console.warn('⚠️ No provider_token available — user may need to re-authorize Gmail')
          }
        })
      }
      if (providerRefreshToken) {
        localStorage.setItem('gmail_refresh_token', providerRefreshToken)
      }

      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname)

      // Fetch user info from backend
      const API_BASE = import.meta.env.VITE_API_URL || 'https://back-end-auto-office-f8xt.vercel.app'
      console.log('📥 Fetching user info from:', `${API_BASE}/api/auth/user`)
      
      fetch(`${API_BASE}/api/auth/user`, {
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
        .then(r => {
          console.log('Response status:', r.status)
          if (!r.ok) {
            throw new Error(`HTTP ${r.status}: ${r.statusText}`)
          }
          return r.json()
        })
        .then(data => {
          console.log('📦 User data response:', data)
          
          // Extract user data from response
          const userData = data.data || data.user || data
          
          if (userData && userData.email) {
            console.log('✅ User info received:', {
              email: userData.email,
              name: userData.name || userData.user_metadata?.name || userData.user_metadata?.full_name,
              avatar: userData.avatar_url || userData.user_metadata?.avatar_url,
              provider: userData.provider
            })
            
            // Store complete user data
            localStorage.setItem('user_data', JSON.stringify(userData))

            // Fetch Gmail token from Supabase session (provider_token)
            if (userData.provider === 'google') {
              getGmailToken().then(token => {
                if (token) {
                  console.log('✅ Gmail token ready:', token.slice(0, 20) + '...')
                } else {
                  console.warn('⚠️ No Gmail provider_token in session — user may need to re-login')
                }
              })
            }
            
            // Dispatch custom event to notify useAuth to refresh
            window.dispatchEvent(new CustomEvent('auth-changed', { detail: userData }))
            
            console.log('✅ Google login successful, navigating to projects')
            
            // Small delay to ensure auth state is updated before navigation
            setTimeout(() => {
              setShowLanding(false)
              setShowSignIn(false)
              setShowSignUp(false)
              setShowProjectManagement(true)
              setProjectManagementKey(k => k + 1)
              setNavigationHistory(['projects'])
              window.history.replaceState({ page: 'projects' }, '', '#/projects')
            }, 100) // 100ms delay
          } else {
            console.error('❌ Invalid user data format:', data)
            localStorage.removeItem('office_weave_token')
            localStorage.removeItem('user_data')
            alert('Không thể lấy thông tin người dùng từ Google. Vui lòng thử lại.')
            setShowLanding(false)
            setShowSignIn(true)
          }
        })
        .catch(err => {
          console.error('❌ OAuth user fetch error:', err)
          localStorage.removeItem('office_weave_token')
          localStorage.removeItem('user_data')
          alert('Lỗi khi lấy thông tin người dùng: ' + err.message)
          setShowLanding(false)
          setShowSignIn(true)
        })
    } else if (errorMsg) {
      console.error('OAuth error:', errorMsg)
      window.history.replaceState({}, '', window.location.pathname)
      alert('Đăng nhập Google thất bại: ' + errorMsg)
      // Show sign in page - setState in async callback is fine
      setTimeout(() => {
        setShowLanding(false)
        setShowSignIn(true)
      }, 0)
    }
  }, []) // Run once on mount

  // Sync results to connected nodes when a new connection is made
  const handleConnectionMade = useCallback((sourceNodeId, targetNodeId) => {
    console.log('🔗 Connection made:', sourceNodeId, '→', targetNodeId);
    
    // Get the source node's result
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode || !sourceNode.data.result) {
      console.log('⚠️ Source node has no result yet');
      return;
    }

    console.log('📤 Syncing result from', sourceNode.data.label, 'to target node');
    
    // Update target node with source result immediately
    setNodes(nds => nds.map(node => 
      node.id === targetNodeId 
        ? { 
            ...node, 
            data: { 
              ...node.data, 
              result: sourceNode.data.result,
              lastExecuted: sourceNode.data.lastExecuted,
              status: 'success'
            } 
          }
        : node
    ));
  }, [nodes, setNodes]);

  // Canvas logic: color-coded connect + grid snap
  const { onConnect, onNodeDragStop } = useCanvasLogic({ 
    nodes, 
    setNodes, 
    setEdges, 
    onConnectionMade: handleConnectionMade 
  })

  // Handle node data changes (for PromptNode)
  const handleNodeDataChange = useCallback((nodeId, newData) => {
    setNodes(nds => nds.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...newData } }
        : node
    ));
  }, [setNodes]);

  // Handle prompt change - update connected nodes with new input
  const handlePromptChange = useCallback((promptNodeId, newPrompt, connectedTargets) => {
    console.log('🔄 Prompt changed, updating connected nodes:', connectedTargets);
    
    // Update connected nodes to show they have new input
    setNodes(nds => nds.map(node => {
      if (connectedTargets.includes(node.id)) {
        // Mark node as having updated input
        return {
          ...node,
          data: {
            ...node.data,
            inputPrompt: newPrompt,
            hasUpdatedInput: true,
            // Clear old result to show it needs re-run
            // result: null, // Uncomment if you want to clear result on input change
          }
        };
      }
      return node;
    }));

    // Also update any Output Nodes connected to those AI nodes
    const currentEdges = reactFlowInstance?.getEdges() || edges;
    const outputTargets = currentEdges
      .filter(e => connectedTargets.includes(e.source))
      .map(e => e.target);
    
    if (outputTargets.length > 0) {
      console.log('📤 Also updating output nodes:', outputTargets);
      setNodes(nds => nds.map(node => {
        if (outputTargets.includes(node.id)) {
          return {
            ...node,
            data: {
              ...node.data,
              // Clear result to show it needs re-run
              // result: null, // Uncomment if you want to clear result on input change
            }
          };
        }
        return node;
      }));
    }
  }, [reactFlowInstance, edges, setNodes]);

  // Khi 1 node chạy xong, truyền result sang các node được kết nối phía sau
  const handleNodeResult = useCallback((sourceNodeId, result) => {
    console.log('📤 Node result ready, syncing to connected nodes:', sourceNodeId);
    
    // Get current edges
    const currentEdges = reactFlowInstance?.getEdges() || edges;
    
    // Find all target nodes connected to this source
    const targetIds = currentEdges
      .filter(e => e.source === sourceNodeId)
      .map(e => e.target);

    console.log('🎯 Target nodes to update:', targetIds);

    setNodes(nds => nds.map(node => {
      // Update the source node itself with result
      if (node.id === sourceNodeId) {
        return { 
          ...node, 
          data: { 
            ...node.data, 
            result, 
            lastExecuted: new Date().toISOString(), 
            status: 'success' 
          } 
        };
      }
      
      // Update all connected target nodes with the result
      if (targetIds.includes(node.id)) {
        console.log('✅ Updating target node:', node.id, node.data.label);
        return { 
          ...node, 
          data: { 
            ...node.data, 
            result, 
            lastExecuted: new Date().toISOString(),
            status: 'success'
          } 
        };
      }
      
      return node;
    }));

    // Animate edges to show data flow
    setEdges(eds => eds.map(edge => 
      edge.source === sourceNodeId 
        ? { ...edge, data: { ...edge.data, success: true, animated: true } }
        : edge
    ));

    // Reset edge animation after 2 seconds
    setTimeout(() => {
      setEdges(eds => eds.map(edge => 
        edge.source === sourceNodeId 
          ? { ...edge, data: { ...edge.data, success: false, animated: false } }
          : edge
      ));
    }, 2000);
  }, [reactFlowInstance, edges, setNodes, setEdges]);

  // Handle sign in
  const handleSignIn = useCallback(() => {
    // Token is already stored by apiClient.login in api.js
    // Just update UI state
    console.log('✅ Sign in successful, navigating to project management')
    setShowSignIn(false)
    setShowSignUp(false)
    setShowLanding(false)
    setShowProjectManagement(true)
    setProjectManagementKey(k => k + 1) // Force re-mount to reload data
    setNavigationHistory(['projects'])
    window.history.replaceState({ page: 'projects' }, '', '#/projects')
  }, [])

  // Handle logout
  const handleLogout = useCallback(async () => {
    // Sign out from Supabase — clears session from localStorage
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error:', e.message);
    }

    // Clear all local auth data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('office_weave_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('gmail_access_token');
    localStorage.removeItem('gmail_refresh_token');

    setShowProjectManagement(false);
    setShowLanding(true);
    setCurrentProject(null);
    setNavigationHistory(['landing']);
    window.history.pushState({ page: 'landing' }, '', '#/');
  }, []);

  // Navigate from landing to sign in
  const navigateToSignIn = useCallback(() => {
    setShowLanding(false)
    setShowSignIn(true)
    setShowSignUp(false)
    setNavigationHistory(prev => [...prev, 'signin'])
    window.history.pushState({ page: 'signin' }, '', '#/signin')
  }, [])

  // Navigate from sign in to sign up
  const navigateToSignUp = useCallback(() => {
    setShowSignIn(false)
    setShowSignUp(true)
    setNavigationHistory(prev => [...prev, 'signup'])
    window.history.pushState({ page: 'signup' }, '', '#/signup')
  }, [])

  // Navigate from sign up to sign in
  const navigateBackToSignIn = useCallback(() => {
    setShowSignUp(false)
    setShowSignIn(true)
    setNavigationHistory(prev => [...prev, 'signin'])
    window.history.pushState({ page: 'signin' }, '', '#/signin')
  }, [])

  // Navigate to settings
  const navigateToSettings = useCallback(() => {
    setShowProjectManagement(false)
    setShowSettings(true)
    setShowDocumentation(false)
    setCurrentProject(null)
    setNavigationHistory(prev => [...prev, 'settings'])
    window.history.pushState({ page: 'settings' }, '', '#/settings')
  }, [])

  // Navigate to documentation
  const navigateToDocumentation = useCallback(() => {
    setShowLanding(false)
    setShowProjectManagement(false)
    setShowSettings(false)
    setShowDocumentation(true)
    setCurrentProject(null)
    setNavigationHistory(prev => [...prev, 'docs'])
    window.history.pushState({ page: 'docs' }, '', '#/docs')
  }, [])

  // Sync with browser history
  useEffect(() => {
    // Set initial landing page state — but NOT if we're processing an OAuth callback
    const params = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(window.location.hash.replace('#', ''))
    const isOAuthCallback = !!(params.get('access_token') || hashParams.get('access_token'))

    if (!window.history.state && !isOAuthCallback) {
      window.history.replaceState({ page: 'landing' }, '', '#/')
    }

    const handlePopState = (e) => {
      if (e.state?.page) {
        const page = e.state.page
        if (page === 'landing') {
          setShowLanding(true)
          setShowSignIn(false)
          setShowProjectManagement(false)
          setShowSettings(false)
          setShowDocumentation(false)
          setCurrentProject(null)
          setNavigationHistory(['landing'])
        } else if (page === 'signin') {
          setShowLanding(false)
          setShowSignIn(true)
          setShowProjectManagement(false)
          setShowSettings(false)
          setShowDocumentation(false)
          setCurrentProject(null)
          setNavigationHistory(['landing', 'signin'])
        } else if (page === 'projects') {
          setShowLanding(false)
          setShowSignIn(false)
          setShowProjectManagement(true)
          setShowSettings(false)
          setShowDocumentation(false)
          setCurrentProject(null)
          setNavigationHistory(prev => {
            // Rebuild history up to projects
            const projectsIndex = prev.indexOf('projects')
            if (projectsIndex >= 0) {
              return prev.slice(0, projectsIndex + 1)
            }
            return ['landing', 'projects']
          })
        } else if (page === 'settings') {
          setShowLanding(false)
          setShowSignIn(false)
          setShowProjectManagement(false)
          setShowSettings(true)
          setShowDocumentation(false)
          setCurrentProject(null)
          setNavigationHistory(['landing', 'projects', 'settings'])
        } else if (page === 'docs') {
          setShowLanding(false)
          setShowSignIn(false)
          setShowProjectManagement(false)
          setShowSettings(false)
          setShowDocumentation(true)
          setCurrentProject(null)
          setNavigationHistory(['landing', 'docs'])
        } else if (page === 'canvas') {
          setShowLanding(false)
          setShowSignIn(false)
          setShowProjectManagement(false)
          setShowSettings(false)
          setShowDocumentation(false)
          setNavigationHistory(['landing', 'projects', 'canvas'])
          // Note: currentProject should already be set, but if not, we need to reload it
          if (e.state?.projectId && !currentProject) {
            // Reload project data
            apiClient.getWorkflow(e.state.projectId).then(response => {
              const project = {
                id: response.data.id,
                name: response.data.name,
                description: response.data.description,
                nodes: response.data.nodes || [],
                edges: response.data.edges || []
              };
              setCurrentProject(project);
              
              // Restore nodes with callbacks
              if (project.nodes && project.nodes.length > 0) {
                const restoredNodes = project.nodes.map(node => {
                  const registryNode = nodeRegistry.nodeTypes?.get(node.data?.nodeType);
                  const processor = registryNode?.processor || node.data?.processor || undefined;
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      processor,
                      onDataChange: handleNodeDataChange,
                      onNodeResult: handleNodeResult,
                      getNodes: () => reactFlowInstance?.getNodes() || [],
                      getEdges: () => reactFlowInstance?.getEdges() || [],
                    }
                  };
                });
                setNodes(restoredNodes);
              }
              
              if (project.edges) {
                setEdges(project.edges);
              }
            }).catch(err => {
              console.error('Failed to reload project:', err);
            });
          }
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [currentProject, handleNodeDataChange, handleNodeResult, reactFlowInstance, setEdges, setNodes])

  // Navigation helpers
  const navigateToCanvas = useCallback(async (project) => {
    console.log('🚀 Opening project:', project);
    
    setCurrentProject(project)
    setNavigationHistory(prev => [...prev, 'canvas'])
    window.history.pushState({ page: 'canvas', projectId: project.id }, '', `#/project/${project.id}`)
    
    // ALWAYS load full project data from API to get nodes/edges
    console.log('📥 Loading full project data from API...');
    try {
      const response = await apiClient.getWorkflow(project.id);
      console.log('📦 Full API response:', JSON.stringify(response, null, 2));
      
      const workflow = response.data;
      
      // Backend stores nodes/edges in metadata
      const nodes = workflow.metadata?.nodes || 
                   workflow.nodes || 
                   workflow.data?.nodes || 
                   [];
      
      const edges = workflow.metadata?.edges || 
                   workflow.edges || 
                   workflow.data?.edges || 
                   [];
      
      console.log('✅ Loaded project data:', {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        nodes: nodes,
        edges: edges
      });
      
      // Restore nodes with callbacks
      if (nodes && nodes.length > 0) {
        console.log('🔄 Restoring nodes...');
        const restoredNodes = nodes.map(node => {
          // Re-inject processor from registry (lost during JSON serialization)
          const registryNode = nodeRegistry.nodeTypes?.get(node.data?.nodeType);
          const processor = registryNode?.processor || node.data?.processor || undefined;
          return {
            ...node,
            data: {
              ...node.data,
              processor,
              onDataChange: handleNodeDataChange,
              onNodeResult: handleNodeResult,
              getNodes: () => reactFlowInstance?.getNodes() || [],
              getEdges: () => reactFlowInstance?.getEdges() || [],
            }
          };
        });
        setNodes(restoredNodes);
        console.log('✅ Restored nodes:', restoredNodes.length, restoredNodes);
      } else {
        setNodes([]);
        console.log('⚠️ No nodes to restore');
      }
      
      // Restore edges
      if (edges && edges.length > 0) {
        setEdges(edges);
        console.log('✅ Restored edges:', edges.length);
      } else {
        setEdges([]);
        console.log('⚠️ No edges to restore');
      }
    } catch (error) {
      console.error('❌ Failed to load project data:', error);
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges, handleNodeDataChange, handleNodeResult, reactFlowInstance])

  const navigateBack = useCallback(() => {
    window.history.back()
  }, [])

  // Rename project title
  const handleRenameProject = useCallback(async (newName) => {
    if (!currentProject || !newName.trim()) return;
    
    try {
      await apiClient.updateWorkflow(currentProject.id, { name: newName.trim() });
      setCurrentProject(prev => ({ ...prev, name: newName.trim() }));
      console.log('✅ Project renamed successfully');
    } catch (error) {
      console.error('❌ Failed to rename project:', error);
      alert('Không thể đổi tên project');
    }
  }, [currentProject]);

  const startEditingTitle = useCallback(() => {
    if (currentProject) {
      setEditedTitle(currentProject.name);
      setIsEditingTitle(true);
    }
  }, [currentProject]);

  const finishEditingTitle = useCallback(() => {
    if (editedTitle.trim() && editedTitle !== currentProject?.name) {
      handleRenameProject(editedTitle);
    }
    setIsEditingTitle(false);
  }, [editedTitle, currentProject, handleRenameProject]);

  const handleTitleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      finishEditingTitle();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setEditedTitle(currentProject?.name || '');
    }
  }, [finishEditingTitle, currentProject]);

  // Generate thumbnail from canvas
  const generateThumbnail = useCallback(async () => {
    if (!reactFlowInstance) {
      console.log('⚠️ No reactFlowInstance for thumbnail');
      return null;
    }
    
    try {
      const nodes = reactFlowInstance.getNodes();
      
      if (nodes.length === 0) {
        console.log('⚠️ No nodes to generate thumbnail');
        return null;
      }
      
      console.log('📸 Generating thumbnail for', nodes.length, 'nodes');
      
      // Try to use React Flow's toObject to get viewport
      const flowObject = reactFlowInstance.toObject();
      console.log('📦 Flow object:', flowObject);
      
      // Create canvas for thumbnail
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      
      // Draw background
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, 400, 240);
      
      // Calculate bounds of all nodes
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      nodes.forEach(node => {
        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxX = Math.max(maxX, node.position.x + 200);
        maxY = Math.max(maxY, node.position.y + 100);
      });
      
      const width = maxX - minX;
      const height = maxY - minY;
      const scale = Math.min(350 / width, 200 / height, 1);
      const offsetX = (400 - width * scale) / 2 - minX * scale;
      const offsetY = (240 - height * scale) / 2 - minY * scale;
      
      // Draw nodes
      nodes.forEach(node => {
        const x = node.position.x * scale + offsetX;
        const y = node.position.y * scale + offsetY;
        const w = 40 * scale;
        const h = 30 * scale;
        
        // Draw node
        ctx.fillStyle = node.data.color || '#3b82f6';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(x, y, w, h);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = node.data.color || '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
      });
      
      const thumbnail = canvas.toDataURL('image/png');
      console.log('✅ Thumbnail generated, size:', thumbnail.length, 'bytes');
      return thumbnail;
    } catch (error) {
      console.error('❌ Failed to generate thumbnail:', error);
      return null;
    }
  }, [reactFlowInstance]);

  // Auto-save project when nodes or edges change
  const saveProject = useCallback(async () => {
    if (!currentProject || !currentProject.id) {
      console.log('⚠️ No project to save:', { currentProject });
      return;
    }

    console.log('💾 Starting save process...');
    console.log('   Current nodes:', nodes.length);
    console.log('   Current edges:', edges.length);

    setIsSaving(true);
    
    try {
      // Generate thumbnail
      const thumbnail = await generateThumbnail();
      
      // Serialize nodes without callbacks
      const serializedNodes = nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          ...node.data,
          // Remove callbacks before saving
          onDataChange: undefined,
          onNodeResult: undefined,
          getNodes: undefined,
          getEdges: undefined,
        }
      }));

      const projectData = {
        name: currentProject.name,
        description: currentProject.description || '',
        // Store nodes/edges in metadata (backend seems to use this)
        metadata: {
          ...currentProject.metadata,
          nodes: serializedNodes,
          edges: edges,
          thumbnail: thumbnail,
          lastModified: new Date().toISOString(),
          nodeCount: nodes.length,
          edgeCount: edges.length
        }
      };

      console.log('💾 Saving project data:', {
        projectId: currentProject.id,
        nodeCount: serializedNodes.length,
        edgeCount: edges.length,
        hasThumbnail: !!thumbnail
      });
      
      const response = await apiClient.updateWorkflow(currentProject.id, projectData);
      console.log('✅ Save response:', response);
      
      setLastSaved(new Date());
      console.log('✅ Project saved successfully at', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('❌ Failed to save project:', error);
      console.error('   Error details:', error.message);
      // Don't show alert to avoid interrupting user workflow
    } finally {
      setIsSaving(false);
    }
  }, [currentProject, nodes, edges, generateThumbnail]);

  // Smart auto-save with debounce and change detection
  useEffect(() => {
    if (!currentProject || nodes.length === 0) return;

    // Create a snapshot of current data for comparison (exclude callbacks)
    const currentSnapshot = JSON.stringify({
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
          ...n.data,
          // Exclude callbacks from comparison
          onDataChange: undefined,
          onNodeResult: undefined,
          onPromptChange: undefined,
          getNodes: undefined,
          getEdges: undefined,
        }
      })),
      edges: edges
    });

    // Skip save if data hasn't actually changed
    if (lastSaveDataRef.current === currentSnapshot) {
      return;
    }

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Determine if this is a structural change or just data change
    let isStructuralChange = false;
    if (lastSaveDataRef.current) {
      try {
        const lastData = JSON.parse(lastSaveDataRef.current);
        isStructuralChange = lastData.nodes.length !== nodes.length || 
                           lastData.edges.length !== edges.length;
      } catch (e) {
        isStructuralChange = true;
      }
    } else {
      isStructuralChange = true; // First save
    }
    
    // Smart debounce timing:
    // - 2 seconds for structural changes (add/remove nodes/edges)
    // - 15 seconds for data changes (typing in fields)
    const debounceTime = isStructuralChange ? 2000 : 15000;

    saveTimeoutRef.current = setTimeout(() => {
      console.log(`💾 Auto-saving (${isStructuralChange ? 'structural' : 'data'} change)...`);
      lastSaveDataRef.current = currentSnapshot;
      saveProject();
    }, debounceTime);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [nodes, edges, currentProject, saveProject]);

  // Manual save with Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentProject) {
          saveProject();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProject, saveProject]);

  // Setup engine callbacks
  engine.onNodeStatusChange((nodeId, status) => {
    setNodes(nds => nds.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, status } }
        : node
    ));

    // Update edge animations for success states
    if (status === 'success') {
      setEdges(eds => eds.map(edge => 
        edge.source === nodeId 
          ? { ...edge, data: { ...edge.data, success: true, animated: true } }
          : edge
      ));
    }
  });

  const onNodeClick = useCallback(() => {
    // Node click handler - currently not used but kept for future features
  }, [])

  const onPaneClick = useCallback(() => {
    // Pane click handler - currently not used but kept for future features
  }, [])

  // Execute workflow with SERVER-SIDE execution
  const handleRunWorkflow = async () => {
    if (isExecuting) {
      // Cancel execution — just reset UI state (server will timeout on its own)
      setIsExecuting(false);
      setExecutionProgress(null);
      return;
    }

    // Check authentication before running
    const hasAuth = typeof window !== 'undefined' && localStorage.getItem('office_weave_token');
    if (!hasAuth) {
      alert('Vui lòng đăng nhập để chạy workflow');
      return;
    }

    // Must have a saved project to execute server-side
    if (!currentProject || !currentProject.id) {
      alert('Vui lòng lưu workflow trước khi chạy');
      return;
    }

    // Save current state to backend first (ensure latest nodes/edges are persisted)
    const currentNodes = reactFlowInstance?.getNodes() || nodes;
    const currentEdges = reactFlowInstance?.getEdges() || edges;

    console.log('🚀 Starting server-side workflow execution...');
    console.log('📋 Nodes:', currentNodes.map(n => ({ id: n.id, type: n.type, label: n.data.label })));

    setIsExecuting(true);
    setExecutionProgress({ current: 0, total: currentNodes.length, status: 'saving' });

    try {
      // Step 1: Save latest nodes/edges to backend
      const serializedNodes = currentNodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          label: node.data.label,
          nodeType: node.data.nodeType,
          color: node.data.color,
          // Node-specific config
          condition: node.data.condition,
          switchKey: node.data.switchKey,
          cases: node.data.cases,
          iteratorKey: node.data.iteratorKey,
          itemVar: node.data.itemVar,
          delayAmount: node.data.delayAmount,
          unit: node.data.unit,
          inputCount: node.data.inputCount,
          mergeStrategy: node.data.mergeStrategy,
          prompt: node.data.prompt,
          value: node.data.value,
          variables: node.data.variables,
          to: node.data.to,
          subject: node.data.subject,
          body: node.data.body,
          cc: node.data.cc,
          bcc: node.data.bcc,
          isHtmlMode: node.data.isHtmlMode,
          folder: node.data.folder,
          limit: node.data.limit,
          unreadOnly: node.data.unreadOnly,
          logic: node.data.logic,
          rules: node.data.rules,
          bodyType: node.data.bodyType,
          email: node.data.email,
          mode: node.data.mode,
          smtpProvider: node.data.smtpProvider,
          model: node.data.model,
          temperature: node.data.temperature,
          maxTokens: node.data.maxTokens,
          hasInput: node.data.hasInput,
          hasOutput: node.data.hasOutput,
        },
      }));

      const serializedEdges = currentEdges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type,
      }));

      await apiClient.updateWorkflow(currentProject.id, {
        nodes: serializedNodes,
        edges: serializedEdges,
        metadata: { nodes: serializedNodes, edges: serializedEdges },
      });

      console.log('✅ Workflow saved, starting validation...');
      setExecutionProgress({ current: 0, total: currentNodes.length, status: 'validating' });

      // Step 2: Validate workflow
      let validation;
      try {
        validation = await apiClient.validateWorkflow(currentProject.id);
        const validationData = validation.data || validation;

        if (validationData.valid === false) {
          const errors = validationData.errors || [];
          alert(`Workflow có lỗi:\n${errors.map(e => e.message).join('\n')}`);
          setIsExecuting(false);
          setExecutionProgress(null);
          return;
        }

        if (validationData.warnings && validationData.warnings.length > 0) {
          const proceed = confirm(
            `Workflow có cảnh báo:\n${validationData.warnings.map(w => w.message).join('\n')}\n\nBạn có muốn tiếp tục?`
          );
          if (!proceed) {
            setIsExecuting(false);
            setExecutionProgress(null);
            return;
          }
        }
      } catch (validateErr) {
        // If validate endpoint doesn't exist yet, skip validation and proceed
        console.warn('⚠️ Validate endpoint not available, skipping:', validateErr.message);
      }

      console.log('✅ Validation passed, executing...');
      setExecutionProgress({ current: 0, total: currentNodes.length, status: 'executing' });

      // Step 3: Execute workflow server-side
      const execResponse = await apiClient.executeWorkflow(currentProject.id, {});
      const execData = execResponse.data || execResponse;
      const executionId = execData.executionId || execData.id;

      if (!executionId) {
        throw new Error('Server did not return an execution ID');
      }

      console.log('🏃 Execution started, ID:', executionId);

      // Step 4: Poll for execution result
      let status = execData.status || 'running';
      let pollCount = 0;
      const maxPolls = 120; // Max 2 minutes (1s interval)

      while (status === 'running' && pollCount < maxPolls) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        pollCount++;

        try {
          const pollResponse = await apiClient.getExecution(executionId);
          const pollData = pollResponse.data || pollResponse;
          status = pollData.status;

          // Update progress based on node results
          const completedNodes = pollData.results ? Object.keys(pollData.results).length : 0;
          setExecutionProgress({
            current: completedNodes,
            total: currentNodes.length,
            status: status === 'running' ? 'executing' : status,
          });

          if (status === 'completed') {
            console.log('🎉 Workflow completed!', pollData.results);

            // Update nodes with results from server
            if (pollData.results) {
              setNodes(nds => nds.map(node => {
                const nodeResult = pollData.results[node.id];
                if (nodeResult && nodeResult.success) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      result: nodeResult.output || nodeResult,
                      lastExecuted: new Date().toISOString(),
                      status: 'success',
                    },
                  };
                } else if (nodeResult && !nodeResult.success) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      status: 'error',
                      error: nodeResult.error,
                    },
                  };
                }
                return node;
              }));
            }

            // Animate edges briefly
            setEdges(eds => eds.map(edge => ({
              ...edge,
              data: { ...edge.data, success: true, animated: true },
            })));
            setTimeout(() => {
              setEdges(eds => eds.map(edge => ({
                ...edge,
                data: { ...edge.data, success: false, animated: false },
              })));
            }, 3000);

            alert('Workflow hoàn thành thành công!');
            break;
          } else if (status === 'failed') {
            const errorMsg = pollData.error || 'Unknown error';
            console.error('❌ Workflow failed:', errorMsg);

            // Mark all nodes as idle
            setNodes(nds => nds.map(node => ({
              ...node,
              data: { ...node.data, status: 'idle' },
            })));

            alert(`Workflow thất bại: ${errorMsg}`);
            break;
          }
        } catch (pollErr) {
          console.warn('⚠️ Poll error (retrying):', pollErr.message);
          // Continue polling on transient errors
        }
      }

      if (pollCount >= maxPolls && status === 'running') {
        alert('Workflow đang chạy quá lâu. Kiểm tra lại trong Execution History.');
      }

    } catch (error) {
      console.error('❌ Workflow execution failed:', error);
      alert(`Lỗi khi chạy workflow: ${error.message}`);

      // Reset all node statuses
      setNodes(nds => nds.map(node => ({
        ...node,
        data: { ...node.data, status: 'idle' },
      })));
    } finally {
      setIsExecuting(false);
      setExecutionProgress(null);
    }
  };

  // Drag-and-drop from sidebar
  const onDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    // Add visual feedback to canvas
    const canvas = e.currentTarget;
    canvas.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
  }, [])

  const onDragLeave = useCallback((e) => {
    // Remove visual feedback
    const canvas = e.currentTarget;
    canvas.style.backgroundColor = 'transparent';
  }, [])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    const raw = e.dataTransfer.getData('application/reactflow')
    if (!raw) return
    
    try {
      const dragData = JSON.parse(raw)
      const { type, label, description } = dragData

      const position = reactFlowInstance.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      })

      // Create node using registry if available, otherwise create basic node
      let nodeData;
      let nodeType = 'ghostNode'; // Default node type
      
      if (nodeRegistry.hasNodeType(type)) {
        nodeData = nodeRegistry.createNode(type);
        // Use promptNode for prompt-input type
        if (type === 'prompt-input') {
          nodeType = 'promptNode';
          nodeData = {
            label: 'Prompt',
            color: '#8b5cf6',
            prompt: '',
            variables: [],
            hasOutput: true,
            nodeType: 'prompt-input',
          };
        }
      } else if (type === 'output-node') {
        nodeType = 'outputNode';
        nodeData = {
          label: 'Kết quả AI',
          color: '#f59e0b',
          status: 'idle',
          nodeType: 'output',
        };
      } else if (type === 'file-input') {
        nodeType = 'fileInputNode';
        nodeData = {
          label: 'File Input',
          color: '#f97316',
          files: [],
          fileUrl: '',
          hasOutput: true,
          nodeType: 'file-input',
        };
      } else if (type === 'email-account') {
        nodeType = 'emailAccountNode';
        nodeData = {
          label: 'Email Account',
          color: '#8b5cf6',
          email: '',
          password: '',
          hasOutput: true,
          nodeType: 'email-account',
        };
      } else if (type === 'send-email') {
        nodeType = 'sendEmailNode';
        nodeData = {
          label: 'Send Email',
          color: '#f97316',
          to: '',
          subject: '',
          body: '',
          hasInput: true,
          hasOutput: true,
          nodeType: 'send-email',
        };
      } else if (type === 'read-email') {
        nodeType = 'readEmailNode';
        nodeData = {
          label: 'Read Email',
          color: '#3b82f6',
          folder: 'INBOX',
          limit: 10,
          unreadOnly: false,
          hasInput: true,
          hasOutput: true,
          nodeType: 'read-email',
        };
      } else if (type === 'filter-email') {
        nodeType = 'filterEmailNode';
        nodeData = {
          label: 'Filter Email',
          color: '#eab308',
          logic: 'AND',
          rules: [],
          hasInput: true,
          hasOutput: true,
          nodeType: 'filter-email',
        };
      } else if (type === 'email-template') {
        nodeType = 'emailTemplateNode';
        nodeData = {
          label: 'Email Template',
          color: '#10b981',
          subject: '',
          body: '',
          bodyType: 'text',
          variables: [],
          hasInput: true,
          hasOutput: true,
          nodeType: 'email-template',
        };
      } else if (type === 'if-else') {
        nodeType = 'ifElseNode';
        nodeData = {
          label: 'IF / ELSE',
          color: '#f59e0b',
          condition: '',
          nodeType: 'if-else',
        };
      } else if (type === 'switch') {
        nodeType = 'switchNode';
        nodeData = {
          label: 'SWITCH',
          color: '#8b5cf6',
          switchKey: '',
          cases: ['case1', 'case2'],
          nodeType: 'switch',
        };
      } else if (type === 'loop') {
        nodeType = 'loopNode';
        nodeData = {
          label: 'LOOP',
          color: '#06b6d4',
          iteratorKey: '',
          itemVar: 'item',
          nodeType: 'loop',
        };
      } else if (type === 'delay') {
        nodeType = 'delayNode';
        nodeData = {
          label: 'DELAY',
          color: '#f97316',
          delayAmount: 1000,
          unit: 'ms',
          nodeType: 'delay',
        };
      } else if (type === 'merge') {
        nodeType = 'mergeNode';
        nodeData = {
          label: 'MERGE',
          color: '#ec4899',
          inputCount: 2,
          mergeStrategy: 'array',
          nodeType: 'merge',
        };
      } else {
        // Fallback for nodes not in registry
        nodeData = {
          label: label || 'New Node',
          subtitle: description || 'Custom node',
          nodeType: type,
          color: '#3b82f6',
          status: 'idle',
          pillar: 'research', // Default pillar
          fields: [
            { label: 'Configuration', type: 'textarea', value: '', placeholder: 'Enter configuration...' }
          ],
          hasInput: true,
          hasOutput: true
        };
      }

      const newNode = {
        id: `node-${Date.now()}`,
        type: nodeType,
        position,
        data: {
          ...nodeData,
          onDataChange: handleNodeDataChange, // Pass callback to nodes
          onPromptChange: handlePromptChange, // Pass prompt change callback
          onNodeResult: handleNodeResult, // Pass result callback
          getNodes: () => reactFlowInstance?.getNodes() || [],
          getEdges: () => reactFlowInstance?.getEdges() || [],
        }
      }
      
      setNodes(nds => [...nds, newNode])
      
      // Remove visual feedback
      const canvas = e.currentTarget;
      canvas.style.backgroundColor = 'transparent';
    } catch (error) {
      console.error('Error parsing drag data:', error);
    }
  }, [reactFlowInstance, setNodes, handleNodeDataChange, handleNodeResult])

  return (
    <>
      {/* ── Shared background — hiển thị xuyên suốt mọi trang ── */}
      <NomadsBackground />

      <AnimatePresence mode="wait">
        {showLanding && (
          <motion.div
            key="landing"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ position: 'absolute', inset: 0, zIndex: 100, overflowY: 'auto', overflowX: 'hidden' }}
            id="landing-scroller"
          >
            <LandingPage onEnter={navigateToSignIn} onNavigateToDocs={navigateToDocumentation} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showDocumentation && (
          <motion.div
            key="documentation"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ position: 'absolute', inset: 0, zIndex: 95, overflowY: 'auto', overflowX: 'hidden' }}
          >
            <Documentation onBack={navigateBack} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showSignIn && (
          <motion.div
            key="signin"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ position: 'absolute', inset: 0, zIndex: 95 }}
          >
            <SignIn onSignIn={handleSignIn} onNavigateToSignUp={navigateToSignUp} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showSignUp && (
          <motion.div
            key="signup"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ position: 'absolute', inset: 0, zIndex: 95 }}
          >
            <SignUp onSignUp={handleSignIn} onNavigateToSignIn={navigateBackToSignIn} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showProjectManagement && !currentProject && (
          <motion.div
            key="project-management"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'absolute', inset: 0, zIndex: 90 }}
          >
            <ProjectManagement 
              key={projectManagementKey}
              onOpenProject={navigateToCanvas}
              onBack={navigationHistory.length > 1 ? navigateBack : null}
              onLogout={handleLogout}
              onSettings={navigateToSettings}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showSettings && (
          <motion.div
            key="settings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'absolute', inset: 0, zIndex: 95 }}
          >
            <Settings onBack={navigateBack} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: '#0d0928', display: currentProject ? 'flex' : 'none' }}>
      
      {/* Top Bar - Full Width */}
      <div className="h-14 bg-black/40 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-4 z-50">
        {/* Left - Project Title */}
        <div className="flex items-center space-x-3">
          {(currentProject || showProjectManagement) && navigationHistory.length > 1 && (
            <button
              onClick={navigateBack}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/80 transition-colors"
            >
              ← Back
            </button>
          )}
          
          {currentProject && (
            isEditingTitle ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={finishEditingTitle}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                className="px-3 py-1.5 bg-white/5 border border-blue-400/50 rounded-lg text-sm font-semibold text-white outline-none"
                style={{ minWidth: '200px' }}
              />
            ) : (
              <button
                onClick={startEditingTitle}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold text-white transition-colors"
              >
                {currentProject.name}
              </button>
            )
          )}
        </div>
        
        {/* Right - Status indicators */}
        <div className="flex items-center space-x-3">
          {/* Auto-save indicator with better feedback */}
          {currentProject && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
              {isSaving ? (
                <>
                  <div className="w-2 h-2 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-blue-400">Đang lưu...</span>
                </>
              ) : lastSaved ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-white/60">
                    Đã lưu {new Date(lastSaved).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-white/30 rounded-full" />
                  <span className="text-xs text-white/40">Tự động lưu</span>
                </>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-xs text-white/80">Credits: 247</span>
          </div>
          
          <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/80 transition-colors">
            Share
          </button>
          
          <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/80 transition-colors">
            Tasks (2)
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <SidebarWrapper 
          onOpenFile={navigateToCanvas}
          onCreateFile={async () => {
            try {
              const newWorkflow = {
                name: 'Untitled Workflow',
                description: 'New workflow',
                metadata: { nodes: [], edges: [], nodeCount: 0, edgeCount: 0 }
              };
              const response = await apiClient.createWorkflow(newWorkflow);
              const project = {
                id: response.data.id,
                name: response.data.name,
                nodes: [],
                edges: []
              };
              navigateToCanvas(project);
            } catch (err) {
              console.error('Failed to create workflow:', err);
              alert('Không thể tạo workflow mới');
            }
          }}
        />

        {/* Main Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          {/* Custom Figma Weave Background */}
          <FigmaWeaveBackground 
            variant="infinite"
            gap={24}
            size={1}
            color="rgba(255,255,255,0.07)"
            backgroundColor="#0a0a0c"
          />
          
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onInit={setReactFlowInstance}
            onMove={(event, viewport) => {
              setZoomLevel(Math.round(viewport.zoom * 100))
            }}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            snapToGrid={true}
            snapGrid={[30, 30]}
            deleteKeyCode={['Delete', 'Backspace']}
            panOnScroll={true}
            panOnScrollMode="free"
            zoomOnScroll={false}
            zoomOnPinch={true}
            panOnDrag={[1, 2]}
            selectionOnDrag={true}
            selectionMode="partial"
            zoomActivationKeyCode="Control"
            fitView
            fitViewOptions={{ padding: 0.2 }}
            defaultEdgeOptions={{ type: 'neonEdge' }}
            proOptions={{ hideAttribution: true }}
            style={{ background: 'transparent' }}>
            
            {/* No background component needed - using custom background */}
          </ReactFlow>

          {/* Empty state hint */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/40">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </div>
                </div>
                <p className="text-white/60 text-sm font-medium mb-1">Build Your AI Workflow</p>
                <p className="text-white/30 text-xs">Drag components from the sidebar to get started</p>
                <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-white/20">
                  <span>•</span>
                  <span>Connect nodes to create data flow</span>
                  <span>•</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Properties Panel - REMOVED */}
      </div>

      {/* Bottom Navigation */}
      <div className="h-12 bg-black/80 backdrop-blur-sm border-t border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-white/60">{zoomLevel}%</span>
        </div>
      </div>

      {/* Execution Progress Overlay */}
      {executionProgress && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="bg-black/90 backdrop-blur-sm border border-white/20 rounded-xl p-6 min-w-[300px]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white text-sm mb-2">Processing Workflow</p>
              <p className="text-white/60 text-xs">
                Step {executionProgress.current} of {executionProgress.total}
              </p>
              {executionProgress.node && (
                <p className="text-blue-400 text-xs mt-1">
                  {executionProgress.node.data.label}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Debug Info - Press Ctrl+Shift+D to toggle */}
    <DebugInfo />
    </>
  )
}
