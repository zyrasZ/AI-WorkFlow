# AI-WorkFlow

A **no-code / low-code** AI workflow automation platform. Users build pipelines by dragging and dropping nodes onto a visual canvas, connecting them together, then hitting Run — the entire sequence executes automatically without writing a single line of code.

---

## The Problem

Small teams and individuals constantly repeat time-consuming processes: gathering information from multiple sources, writing content, sending scheduled emails, classifying input data, calling external APIs. These tasks are both tedious and error-prone when done manually.

Existing solutions like Zapier, Make, and n8n still require users to understand connector configuration, API error handling, and credential management — the technical barrier remains high for non-developers.

**AI-WorkFlow** takes a different approach: every step in the pipeline is represented by a node with a minimal configuration UI. AI handles the complex parts (content generation, analysis, conditional decision-making), while users only need to define _intent_ — what to do, with what data, and where to send it.

---

## Key Features

**Drag-and-drop Canvas**

- Infinite canvas with Figma-style dot-grid alignment
- Snap-to-grid, zoom, pan, and multi-select
- Connect nodes by dragging handles — edge colors automatically distinguish data types

**Node System**

| Category           | Nodes                                                               |
| ------------------ | ------------------------------------------------------------------- |
| AI Models          | Groq Llama 3.3 70B, Llama 3.1 8B, Mixtral 8x7B, Gemma 2 9B          |
| Logic              | If/Else, Switch, Loop, Merge, Delay                                 |
| Email              | Email Account, Read Email, Filter Email, Email Template, Send Email |
| Input / Output     | Prompt, File Input, Output                                          |
| Research & Content | Web Scraper, PDF Analyzer, Content Writer, SEO Optimizer            |
| Media              | Image Generator, Design System, Video Editor, Subtitle Generator    |

**Execution Engine**

- Graph traversal via DFS (Depth-First Search) to determine execution order
- Data flows between nodes through `inputData / outputData` contracts
- Conditional routing: unchosen branches are skipped along with all their downstream nodes
- Realtime status indicator per node (idle → running → success / error)

**Project Management**

- Multiple independent workflow projects
- Auto-save canvas state to the backend (Supabase)
- Thumbnail automatically generated from the canvas

**Auth & Integrations**

- Sign in with email/password or Google OAuth
- Gmail integration: read and send email via OAuth2 or SMTP/IMAP

---

## Tech Stack

| Layer              | Technology                          |
| ------------------ | ----------------------------------- |
| Frontend framework | React 19 + Vite 8                   |
| Canvas / graph     | React Flow 11                       |
| Animation          | Framer Motion 12, GSAP 3            |
| Styling            | Tailwind CSS 3                      |
| Smooth scroll      | Lenis                               |
| Icons              | Lucide React                        |
| Auth & Database    | Supabase                            |
| AI inference       | Groq API (Llama, Mixtral, Gemma)    |
| Deployment         | Vercel (frontend), Docker (backend) |

---

## Architecture

```
src/
├── components/
│   ├── sidebar/              # SlimNav, SidebarWrapper, LibraryPanel, FilesPanel
│   ├── GhostNode.jsx         # Generic node with glassmorphism UI
│   ├── PromptNode.jsx        # Prompt input with variable interpolation
│   ├── OutputNode.jsx        # Renders final output
│   ├── IfElseNode.jsx        # Conditional branching
│   ├── SwitchNode.jsx        # Multi-case routing
│   ├── LoopNode.jsx          # Iterative processing
│   ├── DelayNode.jsx         # Step delay
│   ├── MergeNode.jsx         # Merges multiple data streams
│   ├── EmailAccountNode.jsx
│   ├── ReadEmailNode.jsx
│   ├── FilterEmailNode.jsx
│   ├── EmailTemplateNode.jsx
│   ├── SendEmailNode.jsx
│   ├── NeonEdge.jsx          # Animated edge with pulse effect
│   └── FigmaWeaveBackground.jsx  # Dot-grid canvas background
├── engine/
│   └── Engine.js             # DFS execution engine + node processors
├── registry/
│   └── NodeRegistry.js       # Node type and processor registration
├── hooks/
│   ├── useAuth.jsx
│   └── useCanvasLogic.js     # Connection logic, grid snapping
└── lib/
    ├── api.js                # API client wrapper
    ├── supabase.js           # Supabase auth & DB
    └── config.js
```

**Workflow execution flow:**

```
User clicks Run
  → Engine.buildExecutionOrder()   // DFS → ordered node list
  → Engine.executeGraph()          // iterates over each node
      → collectInputData()         // aggregates output from upstream nodes
      → executeNode(node, input)   // calls the node's registered processor
      → notifyStatusChange()       // updates UI in realtime
      → passes output to downstream nodes
  → onProgress callback            // renders execution progress
```

---

## Environment Variables

| Variable                    | Description                |
| --------------------------- | -------------------------- |
| `VITE_SUPABASE_URL`         | Supabase project URL       |
| `VITE_SUPABASE_ANON_KEY`    | Supabase anon key          |
| `VITE_API_BASE_URL`         | Backend API URL            |
| `VITE_GOOGLE_CLIENT_ID`     | Google OAuth client ID     |
| `VITE_GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

---

## Roadmap

- [ ] Additional AI providers (OpenAI, Anthropic, Gemini)
- [ ] Pre-built workflow templates (email newsletter, lead scoring, content pipeline)
- [ ] Real-time collaboration on shared canvas
- [ ] Webhook trigger — run workflows on incoming external events
- [ ] Community node marketplace
- [ ] Scheduler — run workflows on a cron schedule
- [ ] Workflow version history

---

## License

MIT
