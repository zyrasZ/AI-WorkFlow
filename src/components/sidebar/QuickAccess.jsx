import { memo } from 'react';
import { 
  MessageSquare, 
  Upload, 
  Download, 
  Eye, 
  Zap, 
  Clock,
  Star,
  Bookmark
} from 'lucide-react';

/**
 * QuickAccess - Quick action buttons for the library panel
 * Provides immediate access to common operations
 */
const QuickAccess = memo(() => {
  const quickActions = [
    { id: 'prompt', icon: MessageSquare, label: 'New Prompt', color: 'blue' },
    { id: 'import', icon: Upload, label: 'Import', color: 'green' },
    { id: 'export', icon: Download, label: 'Export', color: 'orange' },
    { id: 'preview', icon: Eye, label: 'Preview', color: 'purple' },
    { id: 'automate', icon: Zap, label: 'Automate', color: 'yellow' },
    { id: 'recent', icon: Clock, label: 'Recent', color: 'gray' },
    { id: 'favorites', icon: Star, label: 'Favorites', color: 'pink' },
    { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks', color: 'indigo' }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/30',
      green: 'text-green-400 hover:bg-green-400/10 hover:border-green-400/30',
      orange: 'text-orange-400 hover:bg-orange-400/10 hover:border-orange-400/30',
      purple: 'text-purple-400 hover:bg-purple-400/10 hover:border-purple-400/30',
      yellow: 'text-yellow-400 hover:bg-yellow-400/10 hover:border-yellow-400/30',
      gray: 'text-gray-400 hover:bg-gray-400/10 hover:border-gray-400/30',
      pink: 'text-pink-400 hover:bg-pink-400/10 hover:border-pink-400/30',
      indigo: 'text-indigo-400 hover:bg-indigo-400/10 hover:border-indigo-400/30'
    };
    return colorMap[color] || colorMap.gray;
  };

  const handleDragStart = (e, action) => {
    const dragData = {
      type: action.id,
      label: action.label,
      description: `Quick access: ${action.label}`,
      nodeConfig: action
    };
    
    e.dataTransfer.setData('application/reactflow', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold tracking-wider uppercase mb-3 text-white/70">
        QUICK ACCESS
      </h3>
      
      <div className="grid grid-cols-4 gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          
          return (
            <button
              key={action.id}
              draggable
              onDragStart={(e) => handleDragStart(e, action)}
              className={`
                aspect-square p-2 border border-white/10 rounded-lg
                transition-all duration-200 group cursor-grab active:cursor-grabbing
                hover:scale-105 hover:shadow-lg select-none
                ${getColorClasses(action.color)}
                flex flex-col items-center justify-center
              `}
              title={action.label}
            >
              <Icon size={16} className="mb-1" />
              <span className="text-xs font-medium leading-tight text-center">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

QuickAccess.displayName = 'QuickAccess';

export default QuickAccess;