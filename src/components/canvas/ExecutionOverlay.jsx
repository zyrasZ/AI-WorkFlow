/**
 * Floating overlay shown while a workflow is executing.
 * Renders nothing when executionProgress is null.
 */
export default function ExecutionOverlay({ executionProgress }) {
  if (!executionProgress) return null

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
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
  )
}
