import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, MoreVertical, Trash2, Clock } from 'lucide-react';
import { apiClient } from '../../lib/api';

function formatTimeAgo(date) {
  const seconds = Math.floor((Date.now() - date) / 1000);
  if (seconds < 60) return 'vừa xong';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

export default function FilesPanel({ onOpenFile, onCreateFile }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredFile, setHoveredFile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getWorkflows({ limit: 20 });
      console.log('📥 Loading files, response:', response);
      
      const workflows = response.data.workflows.map(w => {
        const thumbnail = w.metadata?.thumbnail || null;
        console.log('📄 Workflow:', w.name, 'has thumbnail:', !!thumbnail, thumbnail ? `(${thumbnail.substring(0, 50)}...)` : '');
        
        return {
          id: w.id,
          name: w.name || 'Untitled',
          lastEdited: new Date(w.updated_at).getTime(),
          nodeCount: w.metadata?.nodeCount || 0,
          thumbnail: thumbnail
        };
      });
      
      console.log('✅ Loaded', workflows.length, 'workflows');
      setFiles(workflows);
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Xóa workflow này?')) return;
    
    try {
      await apiClient.deleteWorkflow(id);
      setFiles(prev => prev.filter(f => f.id !== id));
      setMenuOpen(null);
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Không thể xóa workflow');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">My Files</h3>
          <button
            onClick={onCreateFile}
            className="p-1.5 bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/40 rounded-lg transition-colors"
            title="Create new workflow"
          >
            <Plus size={14} className="text-yellow-400" />
          </button>
        </div>
        <p className="text-xs text-white/40">
          {files.length} workflow{files.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto p-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-10">
            <FileText size={32} className="text-white/20 mx-auto mb-2" />
            <p className="text-xs text-white/40 mb-3">Chưa có workflow</p>
            <button
              onClick={onCreateFile}
              className="px-3 py-1.5 bg-yellow-400/20 hover:bg-yellow-400/30 border border-yellow-400/40 rounded-lg text-xs text-yellow-400 transition-colors"
            >
              Tạo workflow mới
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {files.map(file => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                onMouseEnter={() => setHoveredFile(file.id)}
                onMouseLeave={() => { setHoveredFile(null); setMenuOpen(null); }}
                onClick={() => onOpenFile(file)}
                className="relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg cursor-pointer transition-all group overflow-hidden"
              >
                {/* Thumbnail Preview */}
                {file.thumbnail ? (
                  <div className="relative aspect-video bg-black/60 overflow-hidden">
                    <img 
                      src={file.thumbnail} 
                      alt={file.name}
                      className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Node count badge */}
                    {file.nodeCount > 0 && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm border border-white/20 rounded text-[10px] text-white/80">
                        {file.nodeCount} nodes
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-black/40 flex items-center justify-center border-b border-white/10">
                    <FileText size={24} className="text-white/20" />
                  </div>
                )}

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate mb-1">
                        {file.name}
                      </p>
                      <span className="text-[10px] text-white/40 flex items-center">
                        <Clock size={10} className="mr-1" />
                        {formatTimeAgo(file.lastEdited)}
                      </span>
                    </div>

                    {/* Menu button */}
                    {hoveredFile === file.id && (
                      <div className="relative ml-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === file.id ? null : file.id); }}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          <MoreVertical size={12} className="text-white/60" />
                        </button>

                        {/* Dropdown */}
                        {menuOpen === file.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full mt-1 bg-black/95 border border-white/20 rounded-lg p-1 min-w-[120px] z-50 shadow-xl"
                          >
                            <button
                              onClick={(e) => handleDelete(file.id, e)}
                              className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-400/10 rounded flex items-center space-x-2 transition-colors"
                            >
                              <Trash2 size={12} />
                              <span>Xóa</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
