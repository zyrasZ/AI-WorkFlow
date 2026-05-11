import { useState, memo } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreHorizontal,
  Plus,
  Upload,
  File,
  X
} from 'lucide-react';

/**
 * FileInputNode - Node for uploading files (Office documents)
 * Features drag & drop area and URL input
 */
const FileInputNode = memo(({ data, selected, id }) => {
  const [files, setFiles] = useState(data.files || []);
  const [fileUrl, setFileUrl] = useState(data.fileUrl || '');
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isNodeHovered, setIsNodeHovered] = useState(false);

  const {
    label = 'File Input',
    color = '#f97316',
    hasOutput = true,
    onDataChange
  } = data;

  // Handle file upload
  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    const newFiles = [...files, ...uploadedFiles];
    setFiles(newFiles);
    
    // Update data
    if (onDataChange) {
      onDataChange(id, { files: newFiles, fileUrl });
    }
  };

  // Handle drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const newFiles = [...files, ...droppedFiles];
    setFiles(newFiles);
    
    // Update data
    if (onDataChange) {
      onDataChange(id, { files: newFiles, fileUrl });
    }
  };

  // Handle URL change
  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setFileUrl(newUrl);
    
    // Update data
    if (onDataChange) {
      onDataChange(id, { files, fileUrl: newUrl });
    }
  };

  // Remove file
  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    
    // Update data
    if (onDataChange) {
      onDataChange(id, { files: newFiles, fileUrl });
    }
  };

  // Menu actions
  const menuActions = [
    { icon: Upload, label: 'Upload File', action: () => document.getElementById(`file-input-${id}`).click() },
    { icon: X, label: 'Clear All', action: () => { setFiles([]); setFileUrl(''); } }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        relative rounded-lg border backdrop-blur-md
        ${selected ? 'ring-2 ring-orange-400/50 ring-offset-1 ring-offset-black border-orange-400/60' : 'border-white/20'}
        bg-black/90 backdrop-blur-md
        shadow-xl transition-all duration-300
      `}
      style={{ width: 350 }}
      onMouseEnter={() => setIsNodeHovered(true)}
      onMouseLeave={() => setIsNodeHovered(false)}
    >
      {/* Output Handle */}
      {hasOutput && (
        <div
          className="absolute"
          style={{ right: -6, top: '50%', transform: 'translateY(-50%)' }}
        >
          <Handle
            type="source"
            position={Position.Right}
            className="w-3 h-3 border-2 border-orange-400/60 bg-orange-500/20 backdrop-blur-sm !relative !transform-none !inset-auto"
          />
          <AnimatePresence>
            {isNodeHovered && (
              <motion.div
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 6 }}
                transition={{ duration: 0.15 }}
                style={{ left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)', position: 'absolute' }}
                className="whitespace-nowrap pointer-events-none"
              >
                <span className="text-xs font-semibold text-orange-400" style={{ textShadow: '0 0 10px rgba(251,146,60,0.9)' }}>
                  Files
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-orange-500/20 border border-orange-400/30">
            <File size={14} className="text-orange-400" />
          </div>
          <h3 className="text-xs font-semibold text-white truncate">
            {label}
          </h3>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <MoreHorizontal size={16} className="text-white/60" />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="absolute top-full right-0 mt-2 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg py-2 min-w-[140px] z-50 shadow-xl"
              >
                {menuActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        action.action();
                        setShowMenu(false);
                      }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-[10px] text-white/70 hover:bg-white/10 transition-colors"
                    >
                      <Icon size={11} />
                      <span>{action.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Upload Area */}
      <div className="p-3">
        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById(`file-input-${id}`).click()}
          className={`
            border-2 border-dashed rounded-lg p-6 cursor-pointer
            transition-all duration-200
            ${isDragging 
              ? 'border-orange-400/60 bg-orange-500/10' 
              : 'border-white/20 hover:border-orange-400/40 hover:bg-white/5'
            }
          `}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <Upload size={32} className="text-orange-400 mb-2" />
            <p className="text-xs text-white/70 mb-1">Tải tệp lên hoặc kéo thả</p>
            <p className="text-[10px] text-white/50">Word, Excel, PowerPoint</p>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          id={`file-input-${id}`}
          type="file"
          multiple
          accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded-lg"
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <File size={14} className="text-orange-400 shrink-0" />
                  <span className="text-[10px] text-white/80 truncate">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-white/10 rounded transition-colors shrink-0"
                >
                  <X size={12} className="text-white/60" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* URL Input */}
        <div className="mt-3">
          <input
            type="text"
            value={fileUrl}
            onChange={handleUrlChange}
            placeholder="URL hoặc đường dẫn file"
            className="w-full px-3 py-2 bg-gray-800/50 border border-white/10 rounded-lg text-white placeholder-white/40 text-xs focus:border-orange-400/40 focus:outline-none focus:ring-1 focus:ring-orange-400/20 transition-all duration-200"
          />
        </div>

        {/* Add Button */}
        <button
          onClick={() => document.getElementById(`file-input-${id}`).click()}
          className="w-full mt-3 flex items-center justify-center space-x-1 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-[10px] text-white transition-colors"
        >
          <Plus size={12} />
          <span>Thêm tệp</span>
        </button>
      </div>

      {/* Status Indicator */}
      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-white rounded-full" />
      </div>
    </motion.div>
  );
});

FileInputNode.displayName = 'FileInputNode';

export default FileInputNode;
