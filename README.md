# Node-Based AI Platform - Figma Weave Style

A modular React Flow-based AI platform inspired by **Figma Weave**, implementing professional dot grid background system and the **5 Pillars** architecture for AI workflow automation.

## 🎨 **Figma Weave Dot Grid System**

### **Visual Design Philosophy**
- **Deep Black Background** (`#0B0B0E`) - Creates infinite canvas feeling
- **Subtle Dot Grid** - 24px spacing with 12% opacity white dots
- **Invisible Alignment** - Provides structure without visual clutter
- **Professional Layout** - Matches industry-standard design tools

### **Technical Implementation**
```css
/* Figma Weave Style Dot Grid */
background-color: #0B0B0E;
background-image: radial-gradient(circle, rgba(255,255,255,0.12) 1.2px, transparent 1.2px);
background-size: 24px 24px;
```

### **Grid Specifications**
- **Grid Size**: 24px × 24px
- **Dot Size**: 1.2px radius
- **Dot Color**: `rgba(255,255,255,0.12)` (12% opacity)
- **Background**: `#0B0B0E` (Deep black)
- **Alignment**: Invisible coordinate system for node positioning

## 🏗️ **Architecture Overview**

### **Core Components**

1. **FigmaWeaveBackground.jsx** - Custom dot grid background system
2. **GhostNode.jsx** - Glassmorphism nodes with preview capabilities
3. **NeonEdge.jsx** - Animated data flow connections
4. **GridInfo.jsx** - Interactive grid system information
5. **Engine.js** - Sequential execution with DFS traversal
6. **NodeRegistry.js** - Modular component system

### **5 Pillars System**

Each node belongs to one of five specialized pillars:

- 🔍 **Research** (`#3b82f6`) - Data gathering, web scraping, PDF analysis
- 💻 **Code** (`#10b981`) - Code generation, API calls, database queries  
- 📈 **Marketing** (`#f59e0b`) - Content creation, SEO optimization, social media
- 🎨 **Imagine** (`#8b5cf6`) - Image generation, design systems, UI mockups
- 🎬 **Video** (`#ef4444`) - Video editing, subtitle generation, media processing

## 🎯 **Figma Weave Features**

### **Professional Canvas**
- **Infinite Scroll** - Seamless panning and zooming
- **Dot Grid Alignment** - Invisible 24px coordinate system
- **Visual Hierarchy** - Nodes float above subtle background
- **Clean Interface** - Minimal distractions, maximum focus

### **Node System**
- **Preview Integration** - Live image/video previews in nodes
- **Glassmorphism Design** - Translucent with backdrop blur
- **Status Indicators** - Real-time processing feedback
- **Modular Architecture** - Easy to extend and customize

### **Data Flow Visualization**
- **Animated Edges** - Pulse effects during data processing
- **Color-Coded Connections** - Different colors for data types
- **Success Feedback** - Visual confirmation of completed operations
- **Professional Styling** - Subtle glows and smooth animations

### **User Experience**
- **Left-to-Right Flow** - Intuitive data processing direction
- **Snap-to-Grid** - Automatic alignment assistance
- **Context Panels** - Detailed node configuration
- **Professional Tools** - Selection, pan, undo/redo controls

## 🛠️ **Usage**

### **Running the Application**

```bash
npm install
npm run dev
```

### **Grid System Benefits**

1. **Invisible Guidance** - Dots provide alignment without visual noise
2. **Professional Layout** - Consistent spacing and organization
3. **Infinite Canvas** - No boundaries, unlimited workspace
4. **Focus Enhancement** - Reduced distractions, better concentration
5. **Industry Standard** - Matches professional design tools

### **Creating Workflows**

1. **Drag Components** - From organized sidebar to canvas
2. **Align to Grid** - Automatic snapping to 24px coordinates
3. **Connect Nodes** - Draw data flow connections
4. **Configure Settings** - Expand nodes for detailed options
5. **Execute Workflow** - Run button processes entire graph

### **Grid Information**

Click the grid info button (bottom-left) to learn about:
- Grid specifications and measurements
- Alignment system benefits
- Visual design philosophy
- Professional workflow tips

## 🎨 **Design System**

### **Color Palette**
```css
/* Background */
--bg-primary: #0B0B0E;
--bg-secondary: rgba(0,0,0,0.6);

/* Grid System */
--grid-dots: rgba(255,255,255,0.12);
--grid-size: 24px;

/* Pillar Colors */
--research: #3b82f6;
--code: #10b981;
--marketing: #f59e0b;
--imagine: #8b5cf6;
--video: #ef4444;

/* UI Elements */
--glass-bg: rgba(255,255,255,0.08);
--glass-border: rgba(255,255,255,0.15);
--text-primary: rgba(255,255,255,0.9);
--text-secondary: rgba(255,255,255,0.6);
```

### **Typography**
- **Font Family**: Inter, system-ui, sans-serif
- **Primary Text**: `rgba(255,255,255,0.9)`
- **Secondary Text**: `rgba(255,255,255,0.6)`
- **Accent Text**: Pillar-specific colors

### **Spacing System**
- **Grid Base**: 24px
- **Component Padding**: 12px, 16px, 24px
- **Border Radius**: 8px, 12px, 16px
- **Icon Sizes**: 12px, 16px, 20px, 24px

## 📁 **Project Structure**

```
src/
├── components/
│   ├── FigmaWeaveBackground.jsx    # Custom dot grid system
│   ├── GhostNode.jsx              # Glassmorphism nodes
│   ├── NeonEdge.jsx               # Animated connections
│   ├── GridInfo.jsx               # Grid system info
│   ├── Sidebar.jsx                # Component library
│   └── PropertiesPanel.jsx        # Node configuration
├── engine/
│   └── Engine.js                  # Execution system
├── registry/
│   └── NodeRegistry.js            # Component registry
└── index.css                      # Figma Weave styles
```

## 🌟 **Key Improvements**

### **Professional Background**
- ✅ **Figma Weave Style** - Exact dot grid replication
- ✅ **24px Grid System** - Professional alignment
- ✅ **Invisible Coordinates** - Subtle guidance system
- ✅ **Infinite Canvas** - Boundless workspace feeling

### **Enhanced UX**
- ✅ **Grid Information** - Interactive learning system
- ✅ **Visual Hierarchy** - Clear content organization
- ✅ **Professional Tools** - Industry-standard controls
- ✅ **Smooth Interactions** - Polished animations

### **Technical Excellence**
- ✅ **Custom Background** - Optimized rendering
- ✅ **Modular System** - Easy maintenance
- ✅ **Performance** - Efficient updates
- ✅ **Accessibility** - Proper focus management

## 🎯 **Next Steps**

- [ ] Add real AI service integrations
- [ ] Implement workflow templates
- [ ] Add collaborative features
- [ ] Create component marketplace
- [ ] Add performance analytics
- [ ] Implement auto-save functionality

## 📄 **License**

MIT License - Professional AI workflow platform with Figma Weave design system.