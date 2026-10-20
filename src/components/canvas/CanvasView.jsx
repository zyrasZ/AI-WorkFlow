import { useState, useCallback, useRef } from 'react'
import ReactFlow, { useNodesState, useEdgesState } from 'reactflow'
import 'reactflow/dist/style.css'

import SidebarWrapper from '../sidebar/SidebarWrapper'
import FigmaWeaveBackground from '../layout/FigmaWeaveBackground'
import DebugInfo from '../layout/DebugInfo'
import { nodeTypes, edgeTypes } from './nodeTypes'
import CanvasTopBar from './CanvasTopBar'
import ExecutionOverlay from './ExecutionOverlay'

import { useCanvasLogic } from '../../hooks/useCanvasLogic'
import { useNodeCallbacks } from '../../hooks/useNodeCallbacks'
import { useProjectSave } from '../../hooks/useProjectSave'
import { useWorkflowExecution } from '../../hooks/useWorkflowExecution'

import nodeRegistry from '../../registry/NodeRegistry'
import engine from '../../engine/Engine'
import { apiClient } from '../../lib/api'

/**
 * Full canvas workspace rendered when a project is open.
 * Owns all canvas-level state: nodes, edges, zoom, reactFlowInstance.
 */
export default function CanvasView({
  currentProject,
  setCurrentProject,
  navigationHistory,
  onBack,
  onNavigateToCanvas,
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [zoomLevel, setZoomLevel] = useState(100)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const reactFlowWrapper = useRef(null)

  // ── Node callbacks ────────────────────────────────────────────────────────
  const {
    handleNodeDataChange,
    handlePromptChange,
    handleNodeResult,
    handleConnectionMade,
  } = useNodeCallbacks({ nodes, edges, reactFlowInstance, setNodes, setEdges })

  // ── Canvas connect + snap logic ───────────────────────────────────────────
  const { onConnect, onNodeDragStop } = useCanvasLogic({
    nodes,
    setNodes,
    setEdges,
    onConnectionMade: handleConnectionMade,
  })

  // ── Save ──────────────────────────────────────────────────────────────────
  const { isSaving, lastSaved } = useProjectSave({
    currentProject,
    nodes,
    edges,
  })

  // ── Execution ─────────────────────────────────────────────────────────────
  const { executionProgress } = useWorkflowExecution({
    currentProject,
    nodes,
    edges,
    reactFlowInstance,
    setNodes,
    setEdges,
  })

  // ── Engine status → node UI ───────────────────────────────────────────────
  engine.onNodeStatusChange((nodeId, status) => {
    setNodes(nds =>
      nds.map(node =>
        node.id === nodeId ? { ...node, data: { ...node.data, status } } : node
      )
    )
    if (status === 'success') {
      setEdges(eds =>
        eds.map(edge =>
          edge.source === nodeId
            ? { ...edge, data: { ...edge.data, success: true, animated: true } }
            : edge
        )
      )
    }
  })

  // ── Helper to build node data with injected callbacks ─────────────────────
  const buildNodeCallbacks = useCallback(
    () => ({
      onDataChange: handleNodeDataChange,
      onPromptChange: handlePromptChange,
      onNodeResult: handleNodeResult,
      getNodes: () => reactFlowInstance?.getNodes() || [],
      getEdges: () => reactFlowInstance?.getEdges() || [],
    }),
    [handleNodeDataChange, handlePromptChange, handleNodeResult, reactFlowInstance]
  )

  // ── Load project nodes/edges when project changes ─────────────────────────
  const loadProject = useCallback(
    async (project) => {
      try {
        const response = await apiClient.getWorkflow(project.id)
        const workflow = response.data
        const loadedNodes =
          workflow.metadata?.nodes || workflow.nodes || workflow.data?.nodes || []
        const loadedEdges =
          workflow.metadata?.edges || workflow.edges || workflow.data?.edges || []

        if (loadedNodes.length > 0) {
          const restored = loadedNodes.map(node => {
            const registryNode = nodeRegistry.nodeTypes?.get(node.data?.nodeType)
            const processor = registryNode?.processor || node.data?.processor || undefined
            return {
              ...node,
              data: { ...node.data, processor, ...buildNodeCallbacks() },
            }
          })
          setNodes(restored)
        } else {
          setNodes([])
        }

        setEdges(loadedEdges.length > 0 ? loadedEdges : [])
      } catch (error) {
        console.warn('❌ Failed to load project from API, using project demo nodes:', error)
        const fallbackNodes = project.nodes || []
        const fallbackEdges = project.edges || []
        if (fallbackNodes.length > 0) {
          const restored = fallbackNodes.map(node => {
            const registryNode = nodeRegistry.nodeTypes?.get(node.data?.nodeType)
            const processor = registryNode?.processor || node.data?.processor || undefined
            return {
              ...node,
              data: { ...node.data, processor, ...buildNodeCallbacks() },
            }
          })
          setNodes(restored)
        } else {
          setNodes([])
        }
        setEdges(fallbackEdges)
      }
    },
    [buildNodeCallbacks, setNodes, setEdges]
  )

  // Expose loadProject so App can call it when navigating to canvas
  if (currentProject && typeof currentProject._load === 'function') {
    currentProject._load(loadProject)
  }

  // ── Drag-and-drop from sidebar ─────────────────────────────────────────────
  const onDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'
  }, [])

  const onDragLeave = useCallback((e) => {
    e.currentTarget.style.backgroundColor = 'transparent'
  }, [])

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      const raw = e.dataTransfer.getData('application/reactflow')
      if (!raw) return

      try {
        const { type, label, description } = JSON.parse(raw)
        const position = reactFlowInstance.screenToFlowPosition({
          x: e.clientX,
          y: e.clientY,
        })

        let nodeData
        let nodeType = 'ghostNode'

        const typeMap = {
          'prompt-input':   ['promptNode',        { label: 'Prompt', color: '#8b5cf6', prompt: '', variables: [], hasOutput: true, nodeType: 'prompt-input' }],
          'output-node':    ['outputNode',         { label: 'Kết quả AI', color: '#f59e0b', status: 'idle', nodeType: 'output' }],
          'file-input':     ['fileInputNode',      { label: 'File Input', color: '#f97316', files: [], fileUrl: '', hasOutput: true, nodeType: 'file-input' }],
          'email-account':  ['emailAccountNode',   { label: 'Email Account', color: '#8b5cf6', email: '', password: '', hasOutput: true, nodeType: 'email-account' }],
          'send-email':     ['sendEmailNode',      { label: 'Send Email', color: '#f97316', to: '', subject: '', body: '', hasInput: true, hasOutput: true, nodeType: 'send-email' }],
          'read-email':     ['readEmailNode',      { label: 'Read Email', color: '#3b82f6', folder: 'INBOX', limit: 10, unreadOnly: false, hasInput: true, hasOutput: true, nodeType: 'read-email' }],
          'filter-email':   ['filterEmailNode',    { label: 'Filter Email', color: '#eab308', logic: 'AND', rules: [], hasInput: true, hasOutput: true, nodeType: 'filter-email' }],
          'email-template': ['emailTemplateNode',  { label: 'Email Template', color: '#10b981', subject: '', body: '', bodyType: 'text', variables: [], hasInput: true, hasOutput: true, nodeType: 'email-template' }],
          'if-else':        ['ifElseNode',         { label: 'IF / ELSE', color: '#f59e0b', condition: '', nodeType: 'if-else' }],
          'switch':         ['switchNode',         { label: 'SWITCH', color: '#8b5cf6', switchKey: '', cases: ['case1', 'case2'], nodeType: 'switch' }],
          'loop':           ['loopNode',           { label: 'LOOP', color: '#06b6d4', iteratorKey: '', itemVar: 'item', nodeType: 'loop' }],
          'delay':          ['delayNode',          { label: 'DELAY', color: '#f97316', delayAmount: 1000, unit: 'ms', nodeType: 'delay' }],
          'merge':          ['mergeNode',          { label: 'MERGE', color: '#ec4899', inputCount: 2, mergeStrategy: 'array', nodeType: 'merge' }],
        }

        if (typeMap[type]) {
          ;[nodeType, nodeData] = typeMap[type]
        } else if (nodeRegistry.hasNodeType(type)) {
          nodeData = nodeRegistry.createNode(type)
        } else {
          nodeData = {
            label: label || 'New Node',
            subtitle: description || 'Custom node',
            nodeType: type,
            color: '#3b82f6',
            status: 'idle',
            pillar: 'research',
            fields: [{ label: 'Configuration', type: 'textarea', value: '', placeholder: 'Enter configuration...' }],
            hasInput: true,
            hasOutput: true,
          }
        }

        const newNode = {
          id: `node-${Date.now()}`,
          type: nodeType,
          position,
          data: { ...nodeData, ...buildNodeCallbacks() },
        }

        setNodes(nds => [...nds, newNode])
        e.currentTarget.style.backgroundColor = 'transparent'
      } catch (error) {
        console.error('Error parsing drag data:', error)
      }
    },
    [reactFlowInstance, setNodes, buildNodeCallbacks]
  )

  // ── Create new workflow from sidebar ──────────────────────────────────────
  const handleCreateFile = useCallback(async () => {
    try {
      const response = await apiClient.createWorkflow({
        name: 'Untitled Workflow',
        description: 'New workflow',
        metadata: { nodes: [], edges: [], nodeCount: 0, edgeCount: 0 },
      })
      const project = { id: response.data.id, name: response.data.name, nodes: [], edges: [] }
      onNavigateToCanvas(project)
    } catch (err) {
      console.warn('Backend createWorkflow offline, creating local workflow:', err)
      const localId = `wf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      const project = { id: localId, name: 'Untitled Workflow', nodes: [], edges: [] }
      onNavigateToCanvas(project)
    }
  }, [onNavigateToCanvas])

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{ background: '#0d0928' }}
    >
      {/* Top bar */}
      <CanvasTopBar
        currentProject={currentProject}
        setCurrentProject={setCurrentProject}
        navigationHistory={navigationHistory}
        isSaving={isSaving}
        lastSaved={lastSaved}
        onBack={onBack}
      />

      <div className="flex flex-1 overflow-hidden">
        <SidebarWrapper
          onOpenFile={onNavigateToCanvas}
          onCreateFile={handleCreateFile}
        />

        {/* Canvas */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
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
            onInit={setReactFlowInstance}
            onMove={(_event, viewport) => setZoomLevel(Math.round(viewport.zoom * 100))}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onNodeDragStop={onNodeDragStop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            snapToGrid
            snapGrid={[30, 30]}
            deleteKeyCode={['Delete', 'Backspace']}
            panOnScroll
            panOnScrollMode="free"
            zoomOnScroll={false}
            zoomOnPinch
            panOnDrag={[1, 2]}
            selectionOnDrag
            selectionMode="partial"
            zoomActivationKeyCode="Control"
            fitView
            fitViewOptions={{ padding: 0.2 }}
            defaultEdgeOptions={{ type: 'neonEdge' }}
            proOptions={{ hideAttribution: true }}
            style={{ background: 'transparent' }}
          />

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/40">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" />
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

          <ExecutionOverlay executionProgress={executionProgress} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="h-12 bg-black/80 backdrop-blur-sm border-t border-white/10 flex items-center justify-between px-4">
        <div />
        <span className="text-xs text-white/60">{zoomLevel}%</span>
      </div>

      <DebugInfo />
    </div>
  )
}
