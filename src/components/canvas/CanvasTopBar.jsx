import { useState, useCallback } from 'react'
import { apiClient } from '../../lib/api'

/**
 * Top bar shown while a project canvas is open.
 * Handles inline title editing, save status, and navigation back.
 */
export default function CanvasTopBar({
  currentProject,
  setCurrentProject,
  navigationHistory,
  isSaving,
  lastSaved,
  onBack,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')

  const handleRenameProject = useCallback(
    async (newName) => {
      if (!currentProject || !newName.trim()) return
      try {
        await apiClient.updateWorkflow(currentProject.id, { name: newName.trim() })
        setCurrentProject(prev => ({ ...prev, name: newName.trim() }))
      } catch (error) {
        console.error('❌ Failed to rename project:', error)
        alert('Không thể đổi tên project')
      }
    },
    [currentProject, setCurrentProject]
  )

  const startEditing = useCallback(() => {
    if (currentProject) {
      setEditedTitle(currentProject.name)
      setIsEditingTitle(true)
    }
  }, [currentProject])

  const finishEditing = useCallback(() => {
    if (editedTitle.trim() && editedTitle !== currentProject?.name) {
      handleRenameProject(editedTitle)
    }
    setIsEditingTitle(false)
  }, [editedTitle, currentProject, handleRenameProject])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') finishEditing()
      else if (e.key === 'Escape') {
        setIsEditingTitle(false)
        setEditedTitle(currentProject?.name || '')
      }
    },
    [finishEditing, currentProject]
  )

  return (
    <div className="h-14 bg-black/40 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-4 z-50">
      {/* Left — back button + project title */}
      <div className="flex items-center space-x-3">
        {navigationHistory.length > 1 && (
          <button
            onClick={onBack}
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
              onChange={e => setEditedTitle(e.target.value)}
              onBlur={finishEditing}
              onKeyDown={handleKeyDown}
              autoFocus
              className="px-3 py-1.5 bg-white/5 border border-blue-400/50 rounded-lg text-sm font-semibold text-white outline-none"
              style={{ minWidth: '200px' }}
            />
          ) : (
            <button
              onClick={startEditing}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold text-white transition-colors"
            >
              {currentProject.name}
            </button>
          )
        )}
      </div>

      {/* Right — status indicators */}
      <div className="flex items-center space-x-3">
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
                  Đã lưu{' '}
                  {new Date(lastSaved).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
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
  )
}
