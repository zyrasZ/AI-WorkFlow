import { memo } from 'react';
import { Layers, Brain, History, Settings } from 'lucide-react';

const SlimNav = memo(({ activeSection, onSectionChange }) => {
  const navItems = [
    { id: 'history', icon: Layers,   label: 'Components', tooltip: 'Node Library' },
    { id: 'models',  icon: Brain,    label: 'Models',     tooltip: 'AI Models' },
    { id: 'history-log', icon: History, label: 'History', tooltip: 'Run History' },
    { id: 'settings', icon: Settings, label: 'Settings',  tooltip: 'Settings' },
  ];

  return (
    <div className="w-[60px] bg-black border-r border-white/10 flex flex-col">
      <div className="flex-1 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => onSectionChange(item.id)}
                className={`w-full h-12 flex items-center justify-center transition-all duration-200
                  ${isActive
                    ? 'text-yellow-400 bg-yellow-400/10 border-r-2 border-yellow-400'
                    : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                  }`}
                title={item.tooltip}
              >
                <Icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : ''} />
              </button>
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/90 border border-white/20 rounded text-xs text-white/90 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.tooltip}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-black/90" />
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t border-white/10">
        <div className="w-2 h-2 bg-green-400 rounded-full mx-auto animate-pulse" title="Online" />
      </div>
    </div>
  );
});

SlimNav.displayName = 'SlimNav';
export default SlimNav;
