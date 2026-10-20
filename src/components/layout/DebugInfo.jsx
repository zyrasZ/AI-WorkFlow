import { useState, useEffect } from 'react';

/**
 * Debug Info Component - Shows version info and cache status
 * Press Ctrl+Shift+D to toggle
 */
export default function DebugInfo() {
  const [show, setShow] = useState(false);
  const [versions, setVersions] = useState({
    registry: 'Loading...',
    engine: 'Loading...',
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    // Keyboard shortcut to toggle debug info
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShow(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    // Check versions from console logs
    const checkVersions = () => {
      // This will be logged by the modules themselves
      setVersions({
        registry: '2.0.0',
        engine: '2.0.0',
        timestamp: new Date().toISOString(),
        cacheStatus: 'Check console for version logs'
      });
    };

    checkVersions();
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 right-4 z-[9999] bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-4 min-w-[300px] shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">🐛 Debug Info</h3>
        <button
          onClick={() => setShow(false)}
          className="text-white/60 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-white/60">NodeRegistry:</span>
          <span className="text-green-400 font-mono">{versions.registry}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Engine:</span>
          <span className="text-green-400 font-mono">{versions.engine}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60">Loaded:</span>
          <span className="text-blue-400 font-mono text-[10px]">
            {new Date(versions.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <p className="text-xs text-white/60 mb-2">Cache Issues?</p>
        <div className="space-y-1">
          <button
            onClick={() => {
              window.location.reload(true);
            }}
            className="w-full px-2 py-1 bg-blue-600/20 border border-blue-500/30 rounded text-xs text-blue-400 hover:bg-blue-600/30 transition-colors"
          >
            🔄 Hard Reload
          </button>
          <button
            onClick={() => {
              if ('caches' in window) {
                caches.keys().then(names => {
                  names.forEach(name => caches.delete(name));
                });
              }
              localStorage.clear();
              sessionStorage.clear();
              alert('Cache cleared! Reloading...');
              window.location.reload(true);
            }}
            className="w-full px-2 py-1 bg-red-600/20 border border-red-500/30 rounded text-xs text-red-400 hover:bg-red-600/30 transition-colors"
          >
            🗑️ Clear All Cache
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10">
        <p className="text-[10px] text-white/40">
          Press <kbd className="px-1 py-0.5 bg-white/10 rounded">Ctrl+Shift+D</kbd> to toggle
        </p>
      </div>
    </div>
  );
}
