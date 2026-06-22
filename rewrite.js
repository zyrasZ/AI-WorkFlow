const fs = require('fs');
const file = 'src/components/LandingPage.jsx';
const content = fs.readFileSync(file, 'utf8');

const importsMatch = content.match(/[\s\S]*?\/\* ─── Navbar ─── \*\//);
const headerAndUtils = importsMatch[0].replace(/\/\* ─── Navbar ─── \*\//, '');

const liveCanvasMatch = content.match(/\/\* ─── LiveCanvasMockup — animated nodes with flowing connections ─── \*\/[\s\S]*?\/\* ─── DashboardMockup ─── \*\//);
const liveCanvasComponent = liveCanvasMatch[0].replace(/\/\* ─── DashboardMockup ─── \*\//, '');

const newComponents = `
/* ─── Navbar ─── */
function Navbar({ onEnter, onNavigateToDocs }) {
  const navRef = useRef(null);
  
  return (
    <div className="w-full flex justify-between items-center px-[50px] py-6 z-50 relative">
      <div className="font-sans font-medium text-sm text-white">
        NOMADS
      </div>
      <div className="flex items-center gap-6">
        <button onClick={onNavigateToDocs} className="text-white/70 hover:text-white font-sans text-sm transition-colors">
          Docs
        </button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={onEnter}>
          <span className="text-white font-sans text-sm">Menu</span>
          <span className="text-orange-500 font-bold tracking-widest">||</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Hero ─── */
function Hero({ onEnter }) {
  return (
    <section className="relative pt-[120px] pb-[80px] px-[50px] overflow-hidden">
      <div className="max-w-[1440px] mx-auto relative z-10">
        <h1 className="font-editorial text-[140px] leading-[0.9] tracking-[-1.4px] text-white max-w-[1200px] mb-12">
          No-Code<br/>
          Workflow<br/>
          <span className="font-mondwest italic text-orange-500">Automation.</span>
        </h1>
        
        <div className="flex flex-col md:flex-row gap-12 items-start mt-[100px]">
          <div className="w-[300px] flex-shrink-0 flex flex-col items-start gap-4">
            <MagneticBtn onClick={onEnter} className="bg-orange-500 text-black font-sans font-bold text-sm px-[50px] py-[20px] rounded-[10px] flex items-center gap-2 shadow-[0_8px_20px_rgba(234,97,19,0.45)] hover:shadow-[0_8px_20px_rgba(234,97,19,0.7)] transition-shadow">
              Start Building <ArrowRight size={16} />
            </MagneticBtn>
            <p className="font-sans text-[16px] text-white/50 leading-[1.4] mt-4">
              Streamline office tasks with an artistic, visual approach. Join thousands of teams automating their work.
            </p>
          </div>
          <div className="flex-1 w-full flex justify-end">
             <div className="max-w-[800px] w-full bg-[#0a0a0c] rounded-[14px]">
               <NodeCircuitAnimation />
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── HowItWorks ─── */
function HowItWorks() {
  return (
    <section className="relative py-[120px] px-[50px] max-w-[1440px] mx-auto">
      <div className="w-12 h-1 bg-orange-500 mb-12"></div>
      <h2 className="font-editorial text-[96px] leading-[1.1] tracking-[-1.92px] text-white mb-[80px]">
        Three steps to automation.
      </h2>
      
      <div className="flex flex-col gap-[80px]">
        {[
          { num: '01', title: 'Connect Apps', desc: 'Link your favorite office tools — email, spreadsheets, calendars — in seconds with our pre-built connectors.' },
          { num: '02', title: 'Build Logic', desc: 'Drag, drop, and connect nodes on a visual canvas. Add AI, conditions, loops — no code required.' },
          { num: '03', title: 'Automate', desc: 'Activate your workflow and watch tasks complete themselves. Monitor runs in real-time.' }
        ].map(step => (
          <div key={step.num} className="flex flex-col md:flex-row items-start gap-[40px] md:gap-[120px]">
             <div className="font-mondwest text-[140px] leading-[0.9] text-white/20 w-[150px]">
               {step.num}
             </div>
             <div className="max-w-[500px] pt-4">
               <h3 className="font-sans text-[24px] font-bold text-white mb-4">{step.title}</h3>
               <p className="font-sans text-[18px] text-white/50 leading-[1.4]">{step.desc}</p>
             </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Features & Core ─── */
function CoreFeatures() {
  return (
    <section className="relative py-[120px] px-[50px] max-w-[1440px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-[120px]">
        <div className="flex-1">
          <div className="w-12 h-1 bg-purple-500 mb-12"></div>
          <h2 className="font-editorial text-[96px] leading-[1.1] tracking-[-1.92px] text-white mb-[60px]">
            Visual Canvas.
          </h2>
          <p className="font-sans text-[18px] text-white/50 leading-[1.4] max-w-[400px]">
            An infinite, zoomable canvas where you design workflows like an artist. Pan, zoom, group nodes, and build with total freedom.
          </p>
        </div>
        
        <div className="flex-1">
           <div className="bg-[#0a0a0c] rounded-[14px] overflow-hidden border border-white/5 p-4">
              <LiveCanvasMockup />
           </div>
           <p className="font-editorial italic text-[16px] text-white/40 mt-4">
             — Drag, connect, and watch data flow in real time.
           </p>
        </div>
      </div>
    </section>
  );
}

/* ─── NodeLibrary ─── */
function NodeLibrary() {
  return (
    <section className="relative py-[120px] px-[50px] max-w-[1440px] mx-auto border-t border-white/10">
      <h2 className="font-mondwest text-[96px] leading-[1.1] text-white mb-[80px]">
        60+ nodes, zero limits.
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-[80px] gap-x-[40px]">
        {[
          { label: 'AI Nodes', color: 'text-purple-500', desc: 'GPT, Llama, Claude, embeddings, classifiers' },
          { label: 'Office Tools', color: 'text-orange-500', desc: 'Email, Sheets, Docs, Calendar, Drive' },
          { label: 'Data Processing', color: 'text-sky-500', desc: 'Transform, filter, aggregate, join data' },
          { label: 'Logic Control', color: 'text-emerald-500', desc: 'If/else, loops, switches, merge, split' },
          { label: 'Utility Nodes', color: 'text-rose-500', desc: 'HTTP, webhooks, delay, variables, code' }
        ].map(node => (
          <div key={node.label} className="flex flex-col">
            <h3 className={\`font-sans text-[24px] font-bold \${node.color} mb-4\`}>{node.label}</h3>
            <p className="font-sans text-[18px] text-white/50 leading-[1.4]">{node.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="relative py-[60px] px-[50px] border-t border-white/10 mt-[120px]">
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-sans font-black text-sm tracking-[0.22em] text-white">NOMADS</div>
        <div className="flex gap-8">
          <a href="#" className="font-sans text-[14px] text-white/40 hover:text-white">About Us</a>
          <a href="#" className="font-sans text-[14px] text-white/40 hover:text-white">Contact</a>
          <a href="#" className="font-sans text-[14px] text-white/40 hover:text-white">Privacy</a>
        </div>
      </div>
    </footer>
  );
}

/* ─── LandingPage (default export) ─── */
export default function LandingPage({ onEnter, onNavigateToDocs }) {
  return (
    <div className="relative min-h-screen bg-[#0B0B0E] overflow-x-hidden">
      <CursorGlow />
      <Navbar onEnter={onEnter} onNavigateToDocs={onNavigateToDocs} />
      <Hero onEnter={onEnter} />
      <HowItWorks />
      <CoreFeatures />
      <NodeLibrary />
      <Footer />
    </div>
  )
}
`;

fs.writeFileSync(file, headerAndUtils + liveCanvasComponent + newComponents);
console.log('done');
