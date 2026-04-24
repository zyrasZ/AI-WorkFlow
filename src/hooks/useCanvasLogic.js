import { useCallback } from 'react';
import { addEdge } from 'reactflow';

const GRID_SIZE = 30;

/**
 * Snap a value to the nearest grid multiple
 */
export function snapToGrid(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

/**
 * Get color for a connection based on source node's pillar/color
 */
export function getEdgeColor(nodes, sourceId) {
  const sourceNode = nodes.find(n => n.id === sourceId);
  return sourceNode?.data?.color || '#3b82f6';
}

/**
 * Central hook for canvas logic: connections, snapping, deletion
 */
export function useCanvasLogic({ nodes, setNodes, setEdges, onConnectionMade }) {

  // ── Connect nodes ──────────────────────────────────────────────────────────
  const onConnect = useCallback((params) => {
    const color = getEdgeColor(nodes, params.source);
    const newEdge = {
      ...params,
      type: 'neonEdge',
      data: { color, animated: false, dataFlow: true },
    };
    
    setEdges(eds => {
      const updatedEdges = addEdge(newEdge, eds);
      
      // Notify about new connection for realtime result display
      if (onConnectionMade) {
        setTimeout(() => {
          console.log('🔗 New connection made, syncing results...');
          onConnectionMade(params.source, params.target);
        }, 100);
      }
      
      return updatedEdges;
    });
  }, [nodes, setEdges, onConnectionMade]);

  // ── Delete edge ────────────────────────────────────────────────────────────
  const onDeleteEdge = useCallback((edgeId) => {
    setEdges(eds => eds.filter(e => e.id !== edgeId));
  }, [setEdges]);

  // ── Grid snap on node drag stop ────────────────────────────────────────────
  const onNodeDragStop = useCallback((_, node) => {
    const snappedX = snapToGrid(node.position.x);
    const snappedY = snapToGrid(node.position.y);

    // Only update if position actually changed
    if (snappedX !== node.position.x || snappedY !== node.position.y) {
      setNodes(nds => nds.map(n =>
        n.id === node.id
          ? { ...n, position: { x: snappedX, y: snappedY } }
          : n
      ));
    }
  }, [setNodes]);

  return { onConnect, onDeleteEdge, onNodeDragStop };
}
