import { useCallback } from 'react';
import { addEdge } from 'reactflow';

const GRID_SIZE = 30;

// Color map by node type
const NODE_TYPE_COLORS = {
  promptNode:        '#8b5cf6',
  emailAccountNode:  '#8b5cf6',
  readEmailNode:     '#3b82f6',
  filterEmailNode:   '#eab308',
  emailTemplateNode: '#10b981',
  sendEmailNode:     '#f97316',
  outputNode:        '#f59e0b',
  fileInputNode:     '#f97316',
  ghostNode:         '#3b82f6',
};

export function snapToGrid(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export function getEdgeColor(nodes, sourceId) {
  const sourceNode = nodes.find(n => n.id === sourceId);
  if (!sourceNode) return '#3b82f6';
  // Priority: node type color > data color > default
  return NODE_TYPE_COLORS[sourceNode.type] || sourceNode.data?.color || '#3b82f6';
}

export function useCanvasLogic({ nodes, setNodes, setEdges, onConnectionMade }) {

  const onConnect = useCallback((params) => {
    const color = getEdgeColor(nodes, params.source);
    const newEdge = {
      ...params,
      type: 'neonEdge',
      data: { color, animated: false, dataFlow: true },
    };
    
    setEdges(eds => {
      const updatedEdges = addEdge(newEdge, eds);
      if (onConnectionMade) {
        setTimeout(() => onConnectionMade(params.source, params.target), 100);
      }
      return updatedEdges;
    });
  }, [nodes, setEdges, onConnectionMade]);

  const onDeleteEdge = useCallback((edgeId) => {
    setEdges(eds => eds.filter(e => e.id !== edgeId));
  }, [setEdges]);

  const onNodeDragStop = useCallback((_, node) => {
    const snappedX = snapToGrid(node.position.x);
    const snappedY = snapToGrid(node.position.y);
    if (snappedX !== node.position.x || snappedY !== node.position.y) {
      setNodes(nds => nds.map(n =>
        n.id === node.id ? { ...n, position: { x: snappedX, y: snappedY } } : n
      ));
    }
  }, [setNodes]);

  return { onConnect, onDeleteEdge, onNodeDragStop };
}
