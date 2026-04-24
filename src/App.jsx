import { useState, useCallback, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LandingPage from './components/LandingPage'
import SignIn from './components/SignIn'
import ProjectManagement from './components/ProjectManagement'
import Settings from './components/Settings'
import ReactFlow, {
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'

import SidebarWrapper from './components/sidebar/SidebarWrapper'
import GhostNode from './components/GhostNode'
import PromptNode from './components/PromptNode'
import OutputNode from './components/OutputNode'
import NeonEdge from './components/NeonEdge'
import PropertiesPanel from './components/PropertiesPanel'
import FigmaWeaveBackground from './components/FigmaWeaveBackground'
import DebugInfo from './components/DebugInfo'
import nodeRegistry from './registry/NodeRegistry.js'
import engine from './engine/Engine.js'
import { useCanvasLogic } from './hooks/useCanvasLogic.js'

const nodeTypes = { 
  ghostNode: GhostNode,
  promptNode: PromptNode,
  outputNode: OutputNode,
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
  const [showProjectManagement, setShowProjectManagement] = useState(!!hasAuthToken)
  const [showSettings, setShowSettings] = useState(false)
  const [currentProject, setCurrentProject] = useState(null)
  const [navigationHistory, setNavigationHistory] = useState(hasAuthToken ? ['projects'] : ['landing'])
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionProgress, setExecutionProgress] = useState(null)
  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)

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

  // Handle sign in
  const handleSignIn = useCallback(() => {
    // Token is already stored by apiClient.login in api.js
    // Just update UI state
    setShowSignIn(false)
    setShowProjectManagement(true)
    setNavigationHistory(['projects'])
    window.history.replaceState({ page: 'projects' }, '', '#/projects')
  }, [])

  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('auth_token')
    setShowProjectManagement(false)
    setShowLanding(true)
    setCurrentProject(null)
    setNavigationHistory(['landing'])
    window.history.pushState({ page: 'landing' }, '', '#/')
  }, [])

  // Navigate from landing to sign in
  const navigateToSignIn = useCallback(() => {
    setShowLanding(false)
    setShowSignIn(true)
    setNavigationHistory(prev => [...prev, 'signin'])
    window.history.pushState({ page: 'signin' }, '', '#/signin')
  }, [])

  // Navigate to settings
  const navigateToSettings = useCallback(() => {
    setShowProjectManagement(false)
    setShowSettings(true)
    setCurrentProject(null)
    setNavigationHistory(prev => [...prev, 'settings'])
    window.history.pushState({ page: 'settings' }, '', '#/settings')
  }, [])

  // Sync with browser history
  useEffect(() => {
    // Set initial landing page state
    if (!window.history.state) {
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
          setCurrentProject(null)
          setNavigationHistory(['landing'])
        } else if (page === 'signin') {
          setShowLanding(false)
          setShowSignIn(true)
          setShowProjectManagement(false)
          setShowSettings(false)
          setCurrentProject(null)
          setNavigationHistory(['landing', 'signin'])
        } else if (page === 'projects') {
          setShowLanding(false)
          setShowSignIn(false)
          setShowProjectManagement(true)
          setShowSettings(false)
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
          setCurrentProject(null)
          setNavigationHistory(['landing', 'projects', 'settings'])
        } else if (page === 'canvas') {
          setShowLanding(false)
          setShowSignIn(false)
          setShowProjectManagement(false)
          setShowSettings(false)
          setNavigationHistory(['landing', 'projects', 'canvas'])
          // currentProject already set
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Navigation helpers
  const navigateToCanvas = useCallback((project) => {
    setCurrentProject(project)
    setNavigationHistory(prev => [...prev, 'canvas'])
    window.history.pushState({ page: 'canvas', projectId: project.id }, '', `#/project/${project.id}`)
  }, [])

  const navigateBack = useCallback(() => {
    window.history.back()
  }, [])

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

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

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

  // Execute workflow with REAL API integration
  const handleRunWorkflow = async () => {
    if (isExecuting) {
      engine.stop();
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

    // Lấy nodes và edges mới nhất từ React Flow instance
    const currentNodes = reactFlowInstance?.getNodes() || nodes;
    const currentEdges = reactFlowInstance?.getEdges() || edges;

    console.log('🚀 Starting workflow with nodes:', currentNodes.map(n => ({
      id: n.id,
      type: n.type,
      label: n.data.label,
      value: n.data.value,
      prompt: n.data.prompt
    })));

    setIsExecuting(true);
    setExecutionProgress({ current: 0, total: currentNodes.length, status: 'starting' });

    try {
      // Execute graph with real API calls using CURRENT nodes
      const results = await engine.executeGraph(currentNodes, currentEdges, (progress) => {
        setExecutionProgress(progress);
      });

      console.log('Workflow execution completed:', results);

      // Update nodes with results and sync to connected nodes
      results.forEach(result => {
        if (result.success && result.data) {
          // Update the node itself
          setNodes(nds => nds.map(node => 
            node.id === result.nodeId 
              ? { 
                  ...node, 
                  data: { 
                    ...node.data, 
                    result: result.data,
                    lastExecuted: new Date().toISOString(),
                    status: 'success'
                  } 
                }
              : node
          ));

          // Immediately sync to connected downstream nodes
          const connectedTargets = currentEdges
            .filter(e => e.source === result.nodeId)
            .map(e => e.target);
          
          if (connectedTargets.length > 0) {
            console.log('📤 Syncing result from', result.nodeId, 'to', connectedTargets);
            
            // Use setTimeout to ensure state is updated
            setTimeout(() => {
              setNodes(nds => nds.map(node => 
                connectedTargets.includes(node.id)
                  ? { 
                      ...node, 
                      data: { 
                        ...node.data, 
                        result: result.data,
                        lastExecuted: new Date().toISOString(),
                        status: 'success'
                      } 
                    }
                  : node
              ));
            }, 100);
          }
        }
      });

      // Reset edge animations after completion
      setTimeout(() => {
        setEdges(eds => eds.map(edge => ({ 
          ...edge, 
          data: { ...edge.data, success: false, animated: false } 
        })));
      }, 3000);

      // Show success message
      alert('Workflow hoàn thành thành công!');

    } catch (error) {
      console.error('Workflow execution failed:', error);
      alert(`Lỗi khi chạy workflow: ${error.message}`);
      
      // Reset all node statuses to idle
      setNodes(nds => nds.map(node => ({ 
        ...node, 
        data: { ...node.data, status: 'idle' } 
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
  }, [reactFlowInstance, setNodes])

  return (
    <>
      <AnimatePresence mode="wait">
        {showLanding && (
          <motion.div
            key="landing"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'absolute', inset: 0, zIndex: 100, overflowY: 'auto', overflowX: 'hidden' }}
          >
            <LandingPage onEnter={navigateToSignIn} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showSignIn && (
          <motion.div
            key="signin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'absolute', inset: 0, zIndex: 95 }}
          >
            <SignIn onSignIn={handleSignIn} />
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

      <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: '#0a0a0c' }}>
      {/* Top Right Status Bar */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-3">
        {(currentProject || showProjectManagement) && navigationHistory.length > 1 && (
          <button
            onClick={navigateBack}
            className="px-3 py-1.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg text-xs text-white/80 hover:bg-white/5 transition-colors"
          >
            ← Back
          </button>
        )}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
          <span className="text-xs text-white/80">Credits: 247</span>
        </div>
        <button className="px-3 py-1.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg text-xs text-white/80 hover:bg-white/5 transition-colors">
          Share
        </button>
        <button className="px-3 py-1.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg text-xs text-white/80 hover:bg-white/5 transition-colors">
          Tasks (2)
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <SidebarWrapper />

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
            panOnScrollMode="vertical"
            zoomOnScroll={false}
            zoomOnPinch={true}
            panOnDrag={false}
            selectionOnDrag={true}
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
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-white/5 rounded transition-colors" title="Selection Tool">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/60">
              <path d="M3 3L10.5 12L7 16L3 3Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
          <button className="p-2 hover:bg-white/5 rounded transition-colors" title="Pan Tool">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/60">
              <path d="M8 12L12 8L16 12L12 16L8 12Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
          <div className="w-px h-6 bg-white/10" />
          <button 
            onClick={handleRunWorkflow}
            disabled={isExecuting}
            className="flex items-center space-x-2 px-3 py-1.5 bg-green-600/20 border border-green-500/30 rounded text-xs text-green-400 hover:bg-green-600/30 disabled:opacity-50 transition-colors"
          >
            {isExecuting ? (
              <>
                <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5V19L19 12L8 5Z"/>
                </svg>
                <span>Run Workflow</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-white/5 rounded transition-colors" title="Undo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/60">
              <path d="M3 7V11H7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 11C3 11 5 7 12 7C19 7 21 11 21 11" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
          <button className="p-2 hover:bg-white/5 rounded transition-colors" title="Redo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/60">
              <path d="M21 7V11H17" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M21 11C21 11 19 7 12 7C5 7 3 11 3 11" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
          <div className="w-px h-6 bg-white/10" />
          <span className="text-xs text-white/60">100%</span>
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
