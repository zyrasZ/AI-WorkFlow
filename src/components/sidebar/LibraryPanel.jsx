import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Zap, FileOutput } from 'lucide-react';
import SectionContent from './SectionContent';
import FilesPanel from './FilesPanel';

const LibraryPanel = memo(({ activeSection, isVisible, onOpenFile, onCreateFile }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Chỉ giữ các node thực sự hoạt động
  const nodeLibrary = [
    {
      section: 'INPUT',
      color: '#8b5cf6',
      nodes: [
        {
          id: 'prompt-input',
          icon: FileText,
          label: 'Prompt',
          description: 'Nhập nội dung gửi cho AI',
        },
      ],
    },
    {
      section: 'AI MODELS',
      color: '#10b981',
      nodes: [
        { id: 'groq-llama-3.3-70b', icon: Zap, label: 'Llama 3.3 70B', description: 'Mạnh nhất - Groq', badge: 'GROQ' },
        { id: 'groq-llama-3.1-8b',  icon: Zap, label: 'Llama 3.1 8B',  description: 'Nhanh & nhẹ - Groq',  badge: 'GROQ' },
        { id: 'groq-mixtral-8x7b',  icon: Zap, label: 'Mixtral 8x7B',  description: 'Đa năng - Groq',      badge: 'GROQ' },
        { id: 'groq-gemma-2-9b',    icon: Zap, label: 'Gemma 2 9B',    description: 'Google - Groq',        badge: 'GROQ' },
      ],
    },
    {
      section: 'OUTPUT',
      color: '#f59e0b',
      nodes: [
        {
          id: 'output-node',
          icon: FileOutput,
          label: 'Kết quả AI',
          description: 'Hiển thị response từ AI',
          badge: 'NEW',
          badgeColor: '#f59e0b',
        },
      ],
    },
  ];

  const filtered = nodeLibrary.map(group => ({
    ...group,
    nodes: group.nodes.filter(n =>
      n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.description.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(g => g.nodes.length > 0);

  const handleDragStart = (e, node) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: node.id === 'output-node' ? 'output-node' : node.id,
      label: node.label,
      description: node.description,
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  if (!isVisible) return null;

  const showLibrary = activeSection === 'history';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -320, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-72 bg-black/70 backdrop-blur-sm border-r border-white/10 flex flex-col"
        style={{ height: '100vh' }}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 shrink-0">
          <h2 className="text-sm font-semibold text-white mb-1">Office-AI Weave</h2>
          <p className="text-xs text-white/50 mb-3">Kéo node vào canvas để bắt đầu</p>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Tìm node..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/40 focus:border-white/20 focus:outline-none"
            />
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto ${showLibrary ? 'p-4 space-y-5' : ''}`}
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>

          {showLibrary ? (
            <>
              {filtered.map(group => (
                <div key={group.section}>
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-2"
                    style={{ color: group.color }}>
                    {group.section}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {group.nodes.map(node => {
                      const Icon = node.icon;
                      return (
                        <div
                          key={node.id}
                          draggable
                          onDragStart={e => handleDragStart(e, node)}
                          className="relative aspect-square p-3 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-150 group flex flex-col items-center justify-center text-center select-none hover:scale-[1.03]"
                          title={node.description}
                        >
                          {node.badge && (
                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold"
                              style={{
                                background: `${node.badgeColor || '#10b981'}20`,
                                border: `1px solid ${node.badgeColor || '#10b981'}40`,
                                color: node.badgeColor || '#10b981',
                              }}>
                              {node.badge}
                            </div>
                          )}
                          <Icon size={20} className="mb-2 transition-colors text-white/60 group-hover:text-white"
                            style={{ color: node.badge ? group.color : undefined }} />
                          <span className="text-[11px] text-white/75 group-hover:text-white font-medium leading-tight">
                            {node.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-10">
                  <Search size={28} className="text-white/20 mx-auto mb-2" />
                  <p className="text-xs text-white/40">Không tìm thấy node</p>
                </div>
              )}
            </>
          ) : (
            <SectionContent activeSection={activeSection} />
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/10 shrink-0">
          <div className="flex items-center justify-between text-[10px] text-white/40">
            <span>{filtered.reduce((a, g) => a + g.nodes.length, 0)} nodes</span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              Ready
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

LibraryPanel.displayName = 'LibraryPanel';
export default LibraryPanel;
