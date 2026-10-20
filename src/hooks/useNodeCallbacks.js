import { useCallback } from 'react'

/**
 * Returns stable callbacks for node data changes, prompt changes,
 * node results, and new connections — all used by canvas nodes.
 *
 * @param {{ nodes, edges, reactFlowInstance, setNodes, setEdges }} deps
 */
export function useNodeCallbacks({ nodes, edges, reactFlowInstance, setNodes, setEdges }) {
  // ── Node data change (generic field update) ───────────────────────────────
  const handleNodeDataChange = useCallback(
    (nodeId, newData) => {
      setNodes(nds =>
        nds.map(node =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
        )
      )
    },
    [setNodes]
  )

  // ── Prompt change — propagate to connected downstream nodes ───────────────
  const handlePromptChange = useCallback(
    (promptNodeId, newPrompt, connectedTargets) => {
      console.log('🔄 Prompt changed, updating connected nodes:', connectedTargets)

      setNodes(nds =>
        nds.map(node => {
          if (connectedTargets.includes(node.id)) {
            return {
              ...node,
              data: { ...node.data, inputPrompt: newPrompt, hasUpdatedInput: true },
            }
          }
          return node
        })
      )

      const currentEdges = reactFlowInstance?.getEdges() || edges
      const outputTargets = currentEdges
        .filter(e => connectedTargets.includes(e.source))
        .map(e => e.target)

      if (outputTargets.length > 0) {
        setNodes(nds =>
          nds.map(node =>
            outputTargets.includes(node.id) ? { ...node, data: { ...node.data } } : node
          )
        )
      }
    },
    [reactFlowInstance, edges, setNodes]
  )

  // ── Node execution result — propagate to downstream nodes ─────────────────
  const handleNodeResult = useCallback(
    (sourceNodeId, result) => {
      console.log('📤 Node result ready, syncing to connected nodes:', sourceNodeId)

      const currentEdges = reactFlowInstance?.getEdges() || edges
      const targetIds = currentEdges
        .filter(e => e.source === sourceNodeId)
        .map(e => e.target)

      setNodes(nds =>
        nds.map(node => {
          if (node.id === sourceNodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                result,
                lastExecuted: new Date().toISOString(),
                status: 'success',
              },
            }
          }
          if (targetIds.includes(node.id)) {
            return {
              ...node,
              data: {
                ...node.data,
                result,
                lastExecuted: new Date().toISOString(),
                status: 'success',
              },
            }
          }
          return node
        })
      )

      setEdges(eds =>
        eds.map(edge =>
          edge.source === sourceNodeId
            ? { ...edge, data: { ...edge.data, success: true, animated: true } }
            : edge
        )
      )

      setTimeout(() => {
        setEdges(eds =>
          eds.map(edge =>
            edge.source === sourceNodeId
              ? { ...edge, data: { ...edge.data, success: false, animated: false } }
              : edge
          )
        )
      }, 2000)
    },
    [reactFlowInstance, edges, setNodes, setEdges]
  )

  // ── New connection made — immediately sync source result to target ─────────
  const handleConnectionMade = useCallback(
    (sourceNodeId, targetNodeId) => {
      const sourceNode = nodes.find(n => n.id === sourceNodeId)
      if (!sourceNode?.data.result) return

      setNodes(nds =>
        nds.map(node =>
          node.id === targetNodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  result: sourceNode.data.result,
                  lastExecuted: sourceNode.data.lastExecuted,
                  status: 'success',
                },
              }
            : node
        )
      )
    },
    [nodes, setNodes]
  )

  return {
    handleNodeDataChange,
    handlePromptChange,
    handleNodeResult,
    handleConnectionMade,
  }
}
