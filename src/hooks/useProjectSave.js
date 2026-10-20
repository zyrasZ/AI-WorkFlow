import { useState, useCallback, useEffect, useRef } from 'react'
import { apiClient } from '../lib/api'

/**
 * Handles project auto-save, manual save (Ctrl+S), and thumbnail generation.
 *
 * @param {{ currentProject, nodes, edges }} deps
 * @returns {{ isSaving, lastSaved, saveProject }}
 */
export function useProjectSave({ currentProject, nodes, edges }) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const saveTimeoutRef = useRef(null)
  const lastSaveDataRef = useRef(null)

  // ── Thumbnail generator ───────────────────────────────────────────────────
  const generateThumbnail = useCallback(
    async (reactFlowInstance) => {
      if (!reactFlowInstance) return null

      const allNodes = reactFlowInstance.getNodes()
      if (allNodes.length === 0) return null

      try {
        const canvas = document.createElement('canvas')
        canvas.width = 400
        canvas.height = 240
        const ctx = canvas.getContext('2d')

        ctx.fillStyle = '#0a0a0c'
        ctx.fillRect(0, 0, 400, 240)

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
        allNodes.forEach(node => {
          minX = Math.min(minX, node.position.x)
          minY = Math.min(minY, node.position.y)
          maxX = Math.max(maxX, node.position.x + 200)
          maxY = Math.max(maxY, node.position.y + 100)
        })

        const w = maxX - minX
        const h = maxY - minY
        const scale = Math.min(350 / w, 200 / h, 1)
        const offsetX = (400 - w * scale) / 2 - minX * scale
        const offsetY = (240 - h * scale) / 2 - minY * scale

        allNodes.forEach(node => {
          const x = node.position.x * scale + offsetX
          const y = node.position.y * scale + offsetY
          const nw = 40 * scale
          const nh = 30 * scale

          ctx.fillStyle = node.data.color || '#3b82f6'
          ctx.globalAlpha = 0.3
          ctx.fillRect(x, y, nw, nh)
          ctx.globalAlpha = 1
          ctx.strokeStyle = node.data.color || '#3b82f6'
          ctx.lineWidth = 2
          ctx.strokeRect(x, y, nw, nh)
        })

        return canvas.toDataURL('image/png')
      } catch (error) {
        console.error('❌ Failed to generate thumbnail:', error)
        return null
      }
    },
    []
  )

  // ── Save ─────────────────────────────────────────────────────────────────
  const saveProject = useCallback(
    async (reactFlowInstance) => {
      if (!currentProject?.id) return

      setIsSaving(true)
      try {
        const thumbnail = await generateThumbnail(reactFlowInstance)

        const serializedNodes = nodes.map(node => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: {
            ...node.data,
            onDataChange: undefined,
            onNodeResult: undefined,
            getNodes: undefined,
            getEdges: undefined,
          },
        }))

        await apiClient.updateWorkflow(currentProject.id, {
          name: currentProject.name,
          description: currentProject.description || '',
          metadata: {
            ...currentProject.metadata,
            nodes: serializedNodes,
            edges,
            thumbnail,
            lastModified: new Date().toISOString(),
            nodeCount: nodes.length,
            edgeCount: edges.length,
          },
        })

        setLastSaved(new Date())
        console.log('✅ Project saved at', new Date().toLocaleTimeString())
      } catch (error) {
        console.error('❌ Failed to save project:', error.message)
      } finally {
        setIsSaving(false)
      }
    },
    [currentProject, nodes, edges, generateThumbnail]
  )

  // ── Auto-save with debounce + change detection ────────────────────────────
  useEffect(() => {
    if (!currentProject || nodes.length === 0) return

    const snapshot = JSON.stringify({
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: {
          ...n.data,
          onDataChange: undefined,
          onNodeResult: undefined,
          onPromptChange: undefined,
          getNodes: undefined,
          getEdges: undefined,
        },
      })),
      edges,
    })

    if (lastSaveDataRef.current === snapshot) return

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

    let isStructuralChange = true
    if (lastSaveDataRef.current) {
      try {
        const last = JSON.parse(lastSaveDataRef.current)
        isStructuralChange =
          last.nodes.length !== nodes.length || last.edges.length !== edges.length
      } catch {
        isStructuralChange = true
      }
    }

    const debounceTime = isStructuralChange ? 2000 : 15000

    saveTimeoutRef.current = setTimeout(() => {
      console.log(`💾 Auto-saving (${isStructuralChange ? 'structural' : 'data'} change)...`)
      lastSaveDataRef.current = snapshot
      saveProject(null) // no reactFlowInstance in effect — thumbnail skipped
    }, debounceTime)

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    }
  }, [nodes, edges, currentProject, saveProject])

  // ── Manual save Ctrl+S ────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (currentProject) saveProject(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentProject, saveProject])

  return { isSaving, lastSaved, saveProject, generateThumbnail }
}
