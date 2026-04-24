import { useState, memo } from 'react';
import SlimNav from './SlimNav';
import LibraryPanel from './LibraryPanel';

/**
 * SidebarWrapper - Main container for the nested double sidebar system
 * Manages state and coordination between SlimNav and LibraryPanel
 */
const SidebarWrapper = memo(() => {
  const [activeSection, setActiveSection] = useState('history'); // Default to library
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  const handleSectionChange = (sectionId) => {
    if (activeSection === sectionId && isPanelVisible) {
      // If clicking the same section, toggle panel visibility
      setIsPanelVisible(false);
    } else {
      // Switch to new section and ensure panel is visible
      setActiveSection(sectionId);
      setIsPanelVisible(true);
    }
  };

  return (
    <div className="flex h-full sidebar-container">
      {/* Slim Navigation (Always Visible) */}
      <SlimNav 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      
      {/* Library Panel (Conditional) */}
      {isPanelVisible && (
        <LibraryPanel 
          activeSection={activeSection}
          isVisible={isPanelVisible}
        />
      )}
    </div>
  );
});

SidebarWrapper.displayName = 'SidebarWrapper';

export default SidebarWrapper;