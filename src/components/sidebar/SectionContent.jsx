import { memo } from 'react';
import { 
  Search, 
  History, 
  FolderOpen, 
  Brain, 
  Briefcase, 
  Settings, 
  HelpCircle, 
  MessageCircle,
  Clock,
  Star,
  Folder,
  File,
  Cpu,
  Zap,
  Book,
  Users
} from 'lucide-react';

/**
 * SectionContent - Dynamic content based on active SlimNav section
 * Each section shows relevant content and tools
 */
const SectionContent = memo(({ activeSection }) => {
  const sectionData = {
    search: {
      title: 'Search & Discovery',
      subtitle: 'Find components and workflows',
      icon: Search,
      items: [
        { icon: Search, label: 'Global Search', description: 'Search across all components', count: 247 },
        { icon: Star, label: 'Popular', description: 'Most used components', count: 18 },
        { icon: Clock, label: 'Recent', description: 'Recently accessed items', count: 12 },
        { icon: Folder, label: 'Categories', description: 'Browse by category', count: 8 }
      ]
    },
    history: {
      title: 'Recent Activity',
      subtitle: 'Your workflow history',
      icon: History,
      items: [
        { icon: File, label: 'Last Workflow', description: 'Marketing Campaign Builder', time: '2 min ago' },
        { icon: File, label: 'PDF Analysis', description: 'Document Processing Flow', time: '1 hour ago' },
        { icon: File, label: 'Code Review', description: 'Automated Code Analysis', time: '3 hours ago' },
        { icon: File, label: 'Content Generation', description: 'Blog Post Creator', time: '1 day ago' }
      ]
    },
    assets: {
      title: 'Asset Library',
      subtitle: 'Manage your resources',
      icon: FolderOpen,
      items: [
        { icon: Folder, label: 'Documents', description: '24 files', count: 24 },
        { icon: Folder, label: 'Images', description: '156 files', count: 156 },
        { icon: Folder, label: 'Videos', description: '8 files', count: 8 },
        { icon: Folder, label: 'Templates', description: '12 files', count: 12 }
      ]
    },
    models: {
      title: 'AI Models',
      subtitle: 'Available AI capabilities',
      icon: Brain,
      items: [
        { icon: Zap, label: 'Llama 3.3 70B', description: 'Mạnh nhất - Groq', status: 'active', count: 1, badge: 'GROQ' },
        { icon: Zap, label: 'Llama 3.1 8B', description: 'Nhanh & nhẹ - Groq', status: 'active', count: 1, badge: 'GROQ' },
        { icon: Zap, label: 'Mixtral 8x7B', description: 'Đa năng - Groq', status: 'active', count: 1, badge: 'GROQ' },
        { icon: Zap, label: 'Gemma 2 9B', description: 'Google - Groq', status: 'active', count: 1, badge: 'GROQ' }
      ]
    },
    projects: {
      title: 'My Projects',
      subtitle: 'Your workspace projects',
      icon: Briefcase,
      items: [
        { icon: Folder, label: 'Marketing Suite', description: '5 workflows', progress: 85, count: 5 },
        { icon: Folder, label: 'Content Pipeline', description: '3 workflows', progress: 60, count: 3 },
        { icon: Folder, label: 'Data Analysis', description: '7 workflows', progress: 90, count: 7 },
        { icon: Folder, label: 'Automation Hub', description: '2 workflows', progress: 30, count: 2 }
      ]
    },
    settings: {
      title: 'Preferences',
      subtitle: 'Customize your experience',
      icon: Settings,
      items: [
        { icon: Settings, label: 'General', description: 'Basic preferences', count: 12 },
        { icon: Zap, label: 'Performance', description: 'Optimization settings', count: 8 },
        { icon: Users, label: 'Team', description: 'Collaboration settings', count: 4 },
        { icon: Book, label: 'API Keys', description: 'Service integrations', count: 6 }
      ]
    },
    help: {
      title: 'Help & Support',
      subtitle: 'Get assistance and learn',
      icon: HelpCircle,
      items: [
        { icon: Book, label: 'Documentation', description: 'Complete user guide', count: 45 },
        { icon: Users, label: 'Community', description: 'Join discussions', count: 1234 },
        { icon: MessageCircle, label: 'Contact Support', description: 'Get help from our team', count: 3 },
        { icon: Star, label: 'What\'s New', description: 'Latest features and updates', count: 7 }
      ]
    },
    discord: {
      title: 'Community',
      subtitle: 'Connect with other users',
      icon: MessageCircle,
      items: [
        { icon: Users, label: 'General Chat', description: '1,234 members online', count: 1234 },
        { icon: Book, label: 'Tutorials', description: 'Learn from the community', count: 89 },
        { icon: Star, label: 'Showcase', description: 'Share your workflows', count: 156 },
        { icon: HelpCircle, label: 'Q&A', description: 'Get help from experts', count: 67 }
      ]
    }
  };

  const section = sectionData[activeSection];
  if (!section) return null;

  const SectionIcon = section.icon;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center space-x-3 mb-4 pt-4">
        <div className="p-2 bg-white/10 rounded-lg">
          <SectionIcon size={20} className="text-white/80" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{section.title}</h3>
          <p className="text-xs text-white/60">{section.subtitle}</p>
        </div>
      </div>

      {/* AI Models - Exact copy from LibraryPanel */}
      {activeSection === 'models' ? (
        <div className="px-4 mt-6">
          <p className="text-[10px] font-bold tracking-widest uppercase mb-2"
            style={{ color: '#10b981' }}>
            AI MODELS
          </p>
          <div className="grid grid-cols-2 gap-2">
            {section.items.map((item, index) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={index}
                  className="relative aspect-square p-3 border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-150 group flex flex-col items-center justify-center text-center select-none hover:scale-[1.03]"
                  title={item.description}
                >
                  {item.badge && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold"
                      style={{
                        background: `${item.badgeColor || '#10b981'}20`,
                        border: `1px solid ${item.badgeColor || '#10b981'}40`,
                        color: item.badgeColor || '#10b981',
                      }}>
                      {item.badge}
                    </div>
                  )}
                  <ItemIcon size={20} className="mb-2 transition-colors text-white/60 group-hover:text-white"
                    style={{ color: item.badge ? '#10b981' : undefined }} />
                  <span className="text-[11px] text-white/75 group-hover:text-white font-medium leading-tight">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Section Items - Default List Style */
        <div className="space-y-3">
          {section.items.map((item, index) => {
            const ItemIcon = item.icon;
            
            return (
              <div
                key={index}
                className="p-4 bg-gray-800/50 hover:bg-gray-700/50 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="shrink-0 p-2.5 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
                      <ItemIcon size={20} className="text-white/60 group-hover:text-white/80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-medium text-white/90 mb-1">
                        {item.label}
                      </h4>
                      <p className="text-sm text-white/50">
                        {item.description}
                      </p>
                      {item.time && (
                        <p className="text-xs text-white/40 mt-1">{item.time}</p>
                      )}
                      {item.status && (
                        <span className={`
                          inline-block text-xs font-semibold px-2 py-1 rounded-full mt-2
                          ${item.status === 'active' ? 'bg-green-400/20 text-green-400 border border-green-400/30' : ''}
                          ${item.status === 'limited' ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30' : ''}
                        `}>
                          {item.status}
                        </span>
                      )}
                      {item.badge && (
                        <span className="inline-block text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 mt-2 ml-2">
                          {item.badge}
                        </span>
                      )}
                      {item.progress !== undefined && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                            <span>Progress</span>
                            <span>{item.progress}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Count/Number on the right */}
                  {item.count !== undefined && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white/80 mb-1">
                        {item.count}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

SectionContent.displayName = 'SectionContent';

export default SectionContent;