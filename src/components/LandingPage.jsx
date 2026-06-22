/**
 * LandingPage.jsx — NOMADS
 * Editorial broadsheet layout from DESIGN.md
 * Dark canvas #0B0B0E, orange-500 as primary CTA, editorial serif typography
 */
import { useRef, useEffect, forwardRef, useCallback } from 'react'
import { ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

/* ─── CSS tokens (DESIGN.md adapted for dark canvas) ─── */
const tokens = {
  canvas:     '#0B0B0E',
  ink:        '#f0f0ee',      // near-white on dark, mirrors Linen↔Obsidian flip
  inkMuted:   'rgba(240,240,238,0.38)',
  inkFaint:   'rgba(240,240,238,0.08)',
  sage:       'rgba(240,240,238,0.22)',
  accent:     '#f97316',      // orange-500 — CTA, mark, tick
  accentGlow: 'rgba(249,115,22,0.45) 1px 8px 20px 0px, rgba(249,115,22,0.25) 1px 8px 20px 0px',
  mist:       'rgba(240,240,238,0.06)',
  panel:      '#080809',
}

/* ─── ScrollReveal — use the App.jsx motion.div as scroller ─── */
function useScrollReveal(ref, animateFn, start = 'top 88%') {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const scroller = document.getElementById('landing-scroller') || window
    let st
    try {
      st = ScrollTrigger.create({
        trigger: el,
        scroller,
        start,
        end: 'bottom 5%',
        onEnter: () => animateFn(el, false),
        onLeaveBack: () => animateFn(el, true),
      })
    } catch (e) {
      // fallback: just animate immediately
      animateFn(el, false)
    }
    return () => st && st.kill()
  }, [ref, animateFn, start])
}

/* ─── Magnetic Button ─── */
const MagneticBtn = forwardRef(function MagneticBtn({ children, className, style, onClick }, ref) {
  const inner = useRef(null)
  const el = ref || inner
  return (
    <button ref={el} className={className} style={style} onClick={onClick}
      onMouseMove={(e) => {
        const r = el.current.getBoundingClientRect()
        gsap.to(el.current, { x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3, scale: 1.05, duration: 0.4, ease: 'power2.out' })
      }}
      onMouseLeave={() => gsap.to(el.current, { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1,0.4)' })}>
      {children}
    </button>
  )
})

/* ─── Cursor Glow ─── */
function CursorGlow() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3.out' })
    const fn = (e) => { xTo(e.clientX); yTo(e.clientY) }
    window.addEventListener('mousemove', fn)
    return () => window.removeEventListener('mousemove', fn)
  }, [])
  return (
    <div ref={ref} className="pointer-events-none fixed z-[9999] top-0 left-0" style={{
      width: 320, height: 320, marginLeft: -160, marginTop: -160, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(249,115,22,0.10) 0%, transparent 70%)',
      mixBlendMode: 'screen', willChange: 'transform',
    }} />
  )
}

/* ─── Accent Tick (DESIGN.md: short horizontal orange line) ─── */
function AccentTick({ className = '' }) {
  return <div className={`w-[50px] h-[2px] ${className}`} style={{ background: tokens.accent }} />
}

/* ─── NodeCircuitAnimation ─── */
function NodeCircuitAnimation() {
  const leftNodes = [
    { id: 'prompt',  label: 'Prompt',       tag: 'INPUT',  color: '#8b5cf6', dot: '#a78bfa', cy: 50  },
    { id: 'read',    label: 'Read Email',    tag: 'EMAIL',  color: '#3b82f6', dot: '#60a5fa', cy: 160 },
    { id: 'filter',  label: 'Filter Email',  tag: 'LOGIC',  color: '#eab308', dot: '#fbbf24', cy: 270 },
    { id: 'account', label: 'Email Account', tag: 'AUTH',   color: '#8b5cf6', dot: '#c084fc', cy: 380 },
  ]
  const rightNodes = [
    { id: 'send',     label: 'Send Email',     tag: 'ACTION', color: '#f97316', dot: '#fb923c', cy: 50  },
    { id: 'template', label: 'Email Template', tag: 'TMPL',   color: '#10b981', dot: '#34d399', cy: 160 },
    { id: 'output',   label: 'Output',         tag: 'OUT',    color: '#f59e0b', dot: '#fcd34d', cy: 270 },
    { id: 'llama',    label: 'Llama 3.3',      tag: 'AI',     color: '#10b981', dot: '#6ee7b7', cy: 380 },
  ]
  const W = 900, H = 480, CX = 450, CY = 240
  const NW = 162, NH = 48, NR = 14, CW = 110, CH = 110
  const LX = 4, RX = W - NW - 4, ML = 220, MR = W - 220
  const pL = (cy) => `M ${LX+NW} ${cy+NH/2} H ${ML} V ${CY} H ${CX-CW/2}`
  const pR = (cy) => `M ${RX} ${cy+NH/2} H ${MR} V ${CY} H ${CX+CW/2}`
  const delays = [0, 0.75, 1.5, 2.25]
  return (
    <div style={{ width: '100%', maxWidth: 920, margin: '0 auto' }}>
      <style>{`
        @keyframes nca-pulse{0%{stroke-dashoffset:340;opacity:0}8%{opacity:1}72%{opacity:.85}100%{stroke-dashoffset:0;opacity:0}}
        @keyframes nca-particle{0%{offset-distance:0%;opacity:0}6%{opacity:1}88%{opacity:1}100%{offset-distance:100%;opacity:0}}
        @keyframes nca-chip-glow{0%,100%{filter:drop-shadow(0 0 16px rgba(249,115,22,.65))}50%{filter:drop-shadow(0 0 28px rgba(249,115,22,.95))}}
        @keyframes nca-spin{from{transform:rotate(0deg);transform-origin:${CX}px ${CY}px}to{transform:rotate(360deg);transform-origin:${CX}px ${CY}px}}
        @keyframes nca-spin-r{from{transform:rotate(0deg);transform-origin:${CX}px ${CY}px}to{transform:rotate(-360deg);transform-origin:${CX}px ${CY}px}}
        @keyframes nca-scan{0%{transform:translateY(-${CH/2}px);opacity:0}12%{opacity:.5}88%{opacity:.5}100%{transform:translateY(${CH/2}px);opacity:0}}
        @keyframes nca-in{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}
        @keyframes nca-in-r{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
        @keyframes nca-dot{0%,100%{opacity:.4}50%{opacity:1}}
        @keyframes nca-pin{0%,100%{opacity:.15}50%{opacity:.9}}
        @keyframes nca-breathe{0%,100%{opacity:.85}50%{opacity:1}}
      `}</style>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: 'visible', display: 'block' }}>
        <defs>
          <linearGradient id="chip-g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1535"/><stop offset="100%" stopColor="#0d0a1a"/>
          </linearGradient>
          <linearGradient id="chip-b" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316"/><stop offset="50%" stopColor="#fbbf24" stopOpacity=".7"/><stop offset="100%" stopColor="#f97316"/>
          </linearGradient>
          {[...leftNodes,...rightNodes].map(n=>(
            <linearGradient key={`ng-${n.id}`} id={`ng-${n.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={n.color} stopOpacity=".14"/><stop offset="100%" stopColor={n.color} stopOpacity=".04"/>
            </linearGradient>
          ))}
          <filter id="glow-sm" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glow-md" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <clipPath id="chip-clip"><rect x={CX-CW/2+3} y={CY-CH/2+3} width={CW-6} height={CH-6} rx={15}/></clipPath>
        </defs>
        {leftNodes.map(n=><path key={`tl-${n.id}`} d={pL(n.cy)} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>)}
        {rightNodes.map(n=><path key={`tr-${n.id}`} d={pR(n.cy)} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>)}
        {leftNodes.map((n,i)=><path key={`pl-${n.id}`} d={pL(n.cy)} fill="none" stroke={n.dot} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="50 340" strokeDashoffset="340" filter="url(#glow-sm)" style={{animation:`nca-pulse 3.2s ease ${delays[i]}s infinite`}}/>)}
        {rightNodes.map((n,i)=><path key={`pr-${n.id}`} d={pR(n.cy)} fill="none" stroke={n.dot} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="50 340" strokeDashoffset="340" filter="url(#glow-sm)" style={{animation:`nca-pulse 3.2s ease ${delays[i]+0.4}s infinite`}}/>)}
        <ellipse cx={CX} cy={CY} rx={CW/2+26} ry={CH/2+26} fill="none" stroke="rgba(249,115,22,.15)" strokeWidth="1" strokeDasharray="6 5" style={{animation:'nca-spin 14s linear infinite'}}/>
        <ellipse cx={CX} cy={CY} rx={CW/2+16} ry={CH/2+16} fill="none" stroke="rgba(251,191,36,.1)" strokeWidth="1" strokeDasharray="3 7" style={{animation:'nca-spin-r 9s linear infinite'}}/>
        {[-30,-10,10,30].map((off,i)=>(
          <g key={`pin-${i}`}>
            <line x1={CX+off} y1={CY+CH/2} x2={CX+off} y2={CY+CH/2+18} stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" style={{animation:`nca-pin 2s ease ${i*.3}s infinite`,filter:'drop-shadow(0 0 3px #f97316)'}}/>
            <line x1={CX+off} y1={CY-CH/2} x2={CX+off} y2={CY-CH/2-18} stroke="rgba(249,115,22,.35)" strokeWidth="1.5" strokeLinecap="round" style={{animation:`nca-pin 2.4s ease ${i*.25}s infinite`}}/>
          </g>
        ))}
        <g style={{animation:'nca-chip-glow 3s ease-in-out infinite'}}>
          <rect x={CX-CW/2-6} y={CY-CH/2-6} width={CW+12} height={CH+12} rx={24} fill="rgba(249,115,22,.05)"/>
          <rect x={CX-CW/2} y={CY-CH/2} width={CW} height={CH} rx={18} fill="url(#chip-g)" stroke="url(#chip-b)" strokeWidth="1.5"/>
          <rect x={CX-CW/2+8} y={CY-CH/2+8} width={CW-16} height={CH-16} rx={12} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1"/>
          <g clipPath="url(#chip-clip)">
            <line x1={CX-CW/2+3} y1={CY} x2={CX+CW/2-3} y2={CY} stroke="rgba(251,191,36,.3)" strokeWidth="1.5" style={{animation:'nca-scan 2.8s ease-in-out infinite'}}/>
          </g>
          {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sy],i)=>(
            <g key={`c-${i}`}>
              <line x1={CX+sx*(CW/2-10)} y1={CY+sy*(CH/2-10)} x2={CX+sx*(CW/2-10)} y2={CY+sy*(CH/2-22)} stroke="rgba(249,115,22,.55)" strokeWidth="2" strokeLinecap="round"/>
              <line x1={CX+sx*(CW/2-10)} y1={CY+sy*(CH/2-10)} x2={CX+sx*(CW/2-22)} y2={CY+sy*(CH/2-10)} stroke="rgba(249,115,22,.55)" strokeWidth="2" strokeLinecap="round"/>
            </g>
          ))}
          <text x={CX} y={CY+2} textAnchor="middle" fill="white" fontSize="28" fontWeight="900" fontFamily="Inter,sans-serif" style={{letterSpacing:'-.03em'}}>AI</text>
          <text x={CX} y={CY+20} textAnchor="middle" fill="rgba(249,115,22,.8)" fontSize="7" fontWeight="700" fontFamily="monospace" style={{letterSpacing:'.28em'}}>NOMADS</text>
        </g>
        {leftNodes.map((n,i)=>(
          <g key={`nl-${n.id}`} style={{animation:`nca-in .7s cubic-bezier(.16,1,.3,1) ${.08+i*.13}s both, nca-breathe 4s ease ${i*.6}s infinite`}}>
            <rect x={LX+3} y={n.cy+4} width={NW} height={NH} rx={NR} fill={n.color} opacity=".07"/>
            <rect x={LX} y={n.cy} width={NW} height={NH} rx={NR} fill={`url(#ng-${n.id})`}/>
            <rect x={LX} y={n.cy} width={NW} height={NH} rx={NR} fill="none" stroke={n.color} strokeWidth=".8" strokeOpacity=".35"/>
            <circle cx={LX+16} cy={n.cy+NH/2} r="4" fill={n.dot} filter="url(#glow-sm)" style={{animation:`nca-dot 2.2s ease ${i*.4}s infinite`}}/>
            <text x={LX+28} y={n.cy+NH/2+5} fill="rgba(255,255,255,.9)" fontSize="12" fontWeight="600" fontFamily="Inter,sans-serif">{n.label}</text>
            <rect x={LX+NW-42} y={n.cy+8} width={36} height={14} rx={7} fill={n.color} opacity=".2"/>
            <text x={LX+NW-24} y={n.cy+18.5} textAnchor="middle" fill={n.dot} fontSize="7" fontWeight="700" fontFamily="monospace" style={{letterSpacing:'.06em'}}>{n.tag}</text>
            <circle cx={LX+NW+1} cy={n.cy+NH/2} r="5" fill={n.dot} filter="url(#glow-sm)" style={{animation:`nca-dot 2s ease ${i*.35}s infinite`}}/>
            <circle cx={LX+NW+1} cy={n.cy+NH/2} r="9" fill="none" stroke={n.dot} strokeWidth="1" strokeOpacity=".2"/>
          </g>
        ))}
        {rightNodes.map((n,i)=>(
          <g key={`nr-${n.id}`} style={{animation:`nca-in-r .7s cubic-bezier(.16,1,.3,1) ${.12+i*.13}s both, nca-breathe 4s ease ${i*.6+.3}s infinite`}}>
            <rect x={RX+3} y={n.cy+4} width={NW} height={NH} rx={NR} fill={n.color} opacity=".07"/>
            <rect x={RX} y={n.cy} width={NW} height={NH} rx={NR} fill={`url(#ng-${n.id})`}/>
            <rect x={RX} y={n.cy} width={NW} height={NH} rx={NR} fill="none" stroke={n.color} strokeWidth=".8" strokeOpacity=".35"/>
            <circle cx={RX-1} cy={n.cy+NH/2} r="5" fill={n.dot} filter="url(#glow-sm)" style={{animation:`nca-dot 2s ease ${i*.35+.2}s infinite`}}/>
            <circle cx={RX-1} cy={n.cy+NH/2} r="9" fill="none" stroke={n.dot} strokeWidth="1" strokeOpacity=".2"/>
            <rect x={RX+6} y={n.cy+8} width={36} height={14} rx={7} fill={n.color} opacity=".2"/>
            <text x={RX+24} y={n.cy+18.5} textAnchor="middle" fill={n.dot} fontSize="7" fontWeight="700" fontFamily="monospace" style={{letterSpacing:'.06em'}}>{n.tag}</text>
            <text x={RX+48} y={n.cy+NH/2+5} fill="rgba(255,255,255,.9)" fontSize="12" fontWeight="600" fontFamily="Inter,sans-serif">{n.label}</text>
            <circle cx={RX+NW-16} cy={n.cy+NH/2} r="4" fill={n.dot} filter="url(#glow-sm)" style={{animation:`nca-dot 2.2s ease ${i*.4+.2}s infinite`}}/>
          </g>
        ))}
        {leftNodes.map((n,i)=><circle key={`pal-${n.id}`} r="3" fill={n.dot} filter="url(#glow-md)" style={{offsetPath:`path("${pL(n.cy)}")`,animation:`nca-particle 3.2s ease ${delays[i]+.15}s infinite`}}/>)}
        {rightNodes.map((n,i)=><circle key={`par-${n.id}`} r="3" fill={n.dot} filter="url(#glow-md)" style={{offsetPath:`path("${pR(n.cy)}")`,animation:`nca-particle 3.2s ease ${delays[i]+.5}s infinite`}}/>)}
      </svg>
    </div>
  )
}

/* ─── LiveCanvasMockup ─── */
function LiveCanvasMockup() {
  const svgRef = useRef(null)
  const nodes = [
    { id: 'trigger',  label: 'Email Trigger',    tag: 'TRIGGER', x: 60,  y: 80,  color: '#3b82f6', dot: '#60a5fa' },
    { id: 'read',     label: 'Read Email',        tag: 'EMAIL',   x: 60,  y: 190, color: '#8b5cf6', dot: '#a78bfa' },
    { id: 'prompt',   label: 'Prompt Node',       tag: 'INPUT',   x: 60,  y: 300, color: '#eab308', dot: '#fbbf24' },
    { id: 'ai',       label: 'Llama 3.3',         tag: 'AI',      x: 340, y: 135, color: '#10b981', dot: '#34d399' },
    { id: 'filter',   label: 'Filter Email',      tag: 'LOGIC',   x: 340, y: 250, color: '#f97316', dot: '#fb923c' },
    { id: 'template', label: 'Email Template',    tag: 'TMPL',    x: 620, y: 80,  color: '#10b981', dot: '#6ee7b7' },
    { id: 'send',     label: 'Send Email',        tag: 'ACTION',  x: 620, y: 190, color: '#f59e0b', dot: '#fcd34d' },
    { id: 'output',   label: 'Output',            tag: 'OUT',     x: 620, y: 300, color: '#8b5cf6', dot: '#c084fc' },
  ]
  const edges = [
    { from: 'trigger', to: 'ai',       color: '#60a5fa' },
    { from: 'read',    to: 'ai',       color: '#a78bfa' },
    { from: 'prompt',  to: 'filter',   color: '#fbbf24' },
    { from: 'ai',      to: 'template', color: '#34d399' },
    { from: 'ai',      to: 'send',     color: '#34d399' },
    { from: 'filter',  to: 'send',     color: '#fb923c' },
    { from: 'filter',  to: 'output',   color: '#fb923c' },
    { from: 'template', to: 'send',    color: '#6ee7b7' },
  ]
  const NW = 155, NH = 44, NR = 10
  const SVG_W = 860, SVG_H = 400
  const portR = (n) => ({ x: n.x + NW, y: n.y + NH / 2 })
  const portL = (n) => ({ x: n.x, y: n.y + NH / 2 })
  const getNodeById = (id) => nodes.find(n => n.id === id)
  const edgePath = (from, to) => {
    const s = portR(from), e = portL(to)
    const cx = (s.x + e.x) / 2
    return `M ${s.x} ${s.y} C ${cx} ${s.y}, ${cx} ${e.y}, ${e.x} ${e.y}`
  }
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const tweens = []
    const dots = svg.querySelectorAll('.node-dot')
    dots.forEach((d, i) => {
      tweens.push(gsap.to(d, { opacity: 0.3, duration: 0.9 + (i % 4) * 0.3, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: i * 0.2 }))
    })
    return () => tweens.forEach(t => t.kill())
  }, [])
  return (
    <div className="w-full overflow-hidden rounded-[14px]" style={{
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
      backgroundSize: '28px 28px',
    }}>
      <style>{`@keyframes dash-flow { to { stroke-dashoffset: -20; } } .edge-track { animation: dash-flow 1.8s linear infinite; }`}</style>
      <svg ref={svgRef} viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          {edges.map((e, i) => { const fn = getNodeById(e.from), tn = getNodeById(e.to); if (!fn || !tn) return null; return <path key={`def-${i}`} id={`ep-${i}`} d={edgePath(fn, tn)} fill="none" /> })}
          {nodes.map(n => (<linearGradient key={`ng-${n.id}`} id={`ng-${n.id}`} x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor={n.color} stopOpacity="0.18" /><stop offset="100%" stopColor={n.color} stopOpacity="0.06" /></linearGradient>))}
          <filter id="lc-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        {edges.map((e, i) => { const fn = getNodeById(e.from), tn = getNodeById(e.to); if (!fn || !tn) return null; return <path key={`track-${i}`} d={edgePath(fn, tn)} fill="none" stroke={e.color} strokeWidth="1.5" strokeOpacity="0.12" strokeDasharray="6 5" className="edge-track" style={{ animationDelay: `${i * 0.3}s` }} /> })}
        {edges.map((e, i) => { const fn = getNodeById(e.from), tn = getNodeById(e.to); if (!fn || !tn) return null; return (
          <circle key={`particle-${i}`} r="4" fill={e.color} filter="url(#lc-glow)" opacity="0">
            <animateMotion dur={`${1.8 + (i % 3) * 0.4}s`} repeatCount="indefinite" begin={`${(i * 0.55) % 3.5}s`}><mpath href={`#ep-${i}`} /></animateMotion>
          </circle>
        )})}
        {nodes.map((n) => (
          <g key={n.id}>
            <rect x={n.x + 3} y={n.y + 4} width={NW} height={NH} rx={NR} fill={n.color} opacity="0.08" />
            <rect x={n.x} y={n.y} width={NW} height={NH} rx={NR} fill={`url(#ng-${n.id})`} stroke={n.color} strokeWidth="0.8" strokeOpacity="0.4" />
            <circle className="node-dot" cx={n.x} cy={n.y + NH / 2} r="5" fill={n.dot} filter="url(#lc-glow)" />
            <circle cx={n.x} cy={n.y + NH / 2} r="9" fill="none" stroke={n.dot} strokeWidth="1" strokeOpacity="0.2" />
            <circle className="node-dot" cx={n.x + NW} cy={n.y + NH / 2} r="5" fill={n.dot} filter="url(#lc-glow)" />
            <circle cx={n.x + NW} cy={n.y + NH / 2} r="9" fill="none" stroke={n.dot} strokeWidth="1" strokeOpacity="0.2" />
            <text x={n.x + 18} y={n.y + NH / 2 + 5} fill="rgba(255,255,255,0.88)" fontSize="12" fontWeight="600" fontFamily="Inter, system-ui, sans-serif">{n.label}</text>
            <rect x={n.x + NW - 44} y={n.y + 9} width={38} height={14} rx={7} fill={n.color} opacity="0.22" />
            <text x={n.x + NW - 25} y={n.y + 19.5} textAnchor="middle" fill={n.dot} fontSize="7" fontWeight="700" fontFamily="monospace" style={{ letterSpacing: '0.06em' }}>{n.tag}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════
   EDITORIAL BROADSHEET SECTIONS — DESIGN.md layout on dark canvas
   ════════════════════════════════════════════════════════════════════ */

/* ─── Navbar — minimal top bar per DESIGN.md ─── */
function Navbar({ onEnter, onNavigateToDocs }) {
  return (
    <div className="sticky top-0 z-50 w-full flex justify-between items-center px-6 md:px-[50px] py-[18px]"
      style={{ background: 'rgba(11,11,14,0.85)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${tokens.mist}` }}>
      {/* Wordmark — "NOM" ink + "ADS" orange, per DESIGN.md logo split */}
      <span className="text-[14px] tracking-[0.01em] select-none" style={{ fontWeight: 550, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <span style={{ color: tokens.ink }}>NOM</span><span style={{ color: tokens.accent }}>ADS</span>
      </span>
      <div className="flex items-center gap-8">
        <div className="hidden md:flex items-center gap-7">
          {['Canvas', 'Nodes', 'Templates', 'Pricing'].map(l => (
            <a key={l} href="#" className="transition-colors duration-300"
              style={{ color: tokens.sage, fontSize: 14, fontWeight: 350, fontFamily: 'Inter, system-ui, sans-serif' }}
              onMouseEnter={e => e.target.style.color = tokens.ink}
              onMouseLeave={e => e.target.style.color = tokens.sage}>{l}</a>
          ))}
          <button onClick={onNavigateToDocs} className="transition-colors duration-300"
            style={{ color: tokens.sage, fontSize: 14, fontWeight: 350, fontFamily: 'Inter, system-ui, sans-serif', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.target.style.color = tokens.ink}
            onMouseLeave={e => e.target.style.color = tokens.sage}>Docs</button>
        </div>
        {/* Menu + mark icon — per DESIGN.md nav */}
        <div className="flex items-center gap-2 cursor-pointer group" onClick={onEnter}>
          <span className="transition-colors duration-300 text-[14px]"
            style={{ color: tokens.sage, fontWeight: 350, fontFamily: 'Inter, system-ui, sans-serif' }}
            onMouseEnter={e => e.target.style.color = tokens.ink}
            onMouseLeave={e => e.target.style.color = tokens.sage}>Menu</span>
          <span className="text-[14px] font-bold tracking-[0.2em]" style={{ color: tokens.accent }}>||</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Hero — Display headline at 120–140px, asymmetric layout ─── */
function Hero({ onEnter, onNavigateToDocs = () => {} }) {
  const headlineRef = useRef(null)
  const subRef = useRef(null)
  const ctaRef = useRef(null)
  const circuitRef = useRef(null)
  const tagRef = useRef(null)

  useEffect(() => {
    gsap.set([headlineRef.current, subRef.current, ctaRef.current, circuitRef.current, tagRef.current], { opacity: 0 })
    gsap.set(headlineRef.current, { y: 80 })
    gsap.set(subRef.current, { y: 30 })
    gsap.set(ctaRef.current, { y: 20 })
    gsap.set(circuitRef.current, { y: 50 })
    gsap.set(tagRef.current, { y: 10 })

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.2 })
    tl.to(tagRef.current, { opacity: 1, y: 0, duration: 0.6 })
      .to(headlineRef.current, { opacity: 1, y: 0, duration: 1.1 }, '-=0.3')
      .to(subRef.current, { opacity: 1, y: 0, duration: 0.7 }, '-=0.6')
      .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .to(circuitRef.current, { opacity: 1, y: 0, duration: 1.0 }, '-=0.7')
    return () => tl.kill()
  }, [])

  return (
    <section className="relative px-6 md:px-[50px] pt-[100px] md:pt-[130px] pb-[80px] overflow-hidden">
      {/* Faint radial glow — kept minimal per DESIGN.md */}
      <div className="absolute top-0 right-0 w-[800px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.05) 0%, transparent 65%)' }} />

      <div className="max-w-[1440px] mx-auto relative z-10">
        {/* Edition tag — caption size */}
        <div ref={tagRef} className="flex items-center gap-3 mb-10">
          <AccentTick />
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase" style={{ color: tokens.accent, fontWeight: 700 }}>
            No-Code Workflow Automation
          </span>
        </div>

        {/* Broadsheet display headline — 120–140px, line-height 0.90, tracking tight */}
        <h1 ref={headlineRef}
          className="font-editorial leading-[0.90] text-[80px] sm:text-[100px] md:text-[120px] lg:text-[140px] mb-0 max-w-[1100px]"
          style={{ letterSpacing: '-0.02em', color: tokens.ink, lineHeight: 0.90 }}>
          No-Code{' '}
          <span className="font-mondwest italic"
            style={{ background: 'linear-gradient(90deg, #fcd34d, #f97316, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Workflow
          </span>
          <br />
          Automation.
        </h1>

        {/* Asymmetric split — body left narrow, circuit right wide — per DESIGN.md section layout */}
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-[80px] items-start mt-[80px]">
          {/* Left column — text block, 340px wide */}
          <div className="w-full lg:w-[340px] flex-shrink-0 flex flex-col items-start gap-6">
            <p ref={subRef} className="font-sans text-[18px] leading-[1.5] max-w-[320px]"
              style={{ color: tokens.inkMuted, fontWeight: 350, fontFamily: 'Inter, system-ui, sans-serif' }}>
              Streamline office tasks with a visual, artistic approach. Build powerful automations without writing a single line of code.
            </p>
            <div ref={ctaRef} className="flex flex-col items-start gap-4">
              <MagneticBtn onClick={onEnter}
                className="text-[14px] px-[50px] py-[20px] rounded-[10px] flex items-center gap-3 transition-all duration-200 cursor-pointer"
                style={{
                  background: tokens.accent,
                  color: '#0B0B0E',
                  fontWeight: 550,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  letterSpacing: '0.01em',
                  boxShadow: tokens.accentGlow,
                  border: 'none',
                }}>
                START BUILDING <ArrowRight size={16} />
              </MagneticBtn>
              {/* Ghost link per DESIGN.md */}
              <button onClick={onNavigateToDocs} className="text-[14px] transition-colors duration-300"
                style={{ color: tokens.sage, fontWeight: 350, fontFamily: 'Inter, system-ui, sans-serif', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                View documentation →
              </button>
            </div>
          </div>

          {/* Right column — circuit animation as editorial image tile */}
          <div ref={circuitRef} className="flex-1 w-full min-w-0">
            <div className="rounded-[14px] overflow-hidden">
              <NodeCircuitAnimation />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── HowItWorks — editorial numbered steps, DESIGN.md typography scale ─── */
function HowItWorks() {
  const headRef = useRef(null)
  const stepsRef = useRef(null)

  useEffect(() => { if (headRef.current) gsap.set(headRef.current, { opacity: 0, y: 50 }) }, [])
  const animateHead = useCallback((el, reverse) => {
    if (reverse) gsap.to(el, { opacity: 0, y: 50, duration: 0.4, ease: 'power2.in' })
    else gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
  }, [])
  const animateSteps = useCallback((el, reverse) => {
    const items = el.querySelectorAll('.hiw-step')
    if (reverse) gsap.to(items, { opacity: 0, y: 40, duration: 0.35, stagger: 0.08, ease: 'power2.in' })
    else gsap.fromTo(items, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.22, ease: 'power3.out' })
  }, [])
  useScrollReveal(headRef, animateHead)
  useScrollReveal(stepsRef, animateSteps)

  const steps = [
    { num: '01', title: 'Connect Apps', desc: 'Link your favorite office tools — email, spreadsheets, calendars — in seconds with our pre-built connectors.' },
    { num: '02', title: 'Build Logic', desc: 'Drag, drop, and connect nodes on a visual canvas. Add AI, conditions, loops — no code required.' },
    { num: '03', title: 'Automate', desc: 'Activate your workflow and watch tasks complete themselves. Monitor runs in real-time from your dashboard.' },
  ]

  return (
    <section className="relative py-[120px] px-6 md:px-[50px]" style={{ borderTop: `1px solid ${tokens.mist}` }}>
      <div className="max-w-[1440px] mx-auto">
        <div ref={headRef}>
          <AccentTick className="mb-10" />
          {/* DESIGN.md: heading-lg 96px, line-height 1.1, tracking -1.92px */}
          <h2 className="font-editorial mb-[100px] max-w-[800px]"
            style={{ fontSize: 'clamp(60px, 7vw, 96px)', lineHeight: 1.0, letterSpacing: '-1.92px', color: tokens.ink }}>
            Three steps to<br />
            <span style={{ color: tokens.inkFaint, WebkitTextStroke: `1px ${tokens.sage}` }}>automation.</span>
          </h2>
        </div>

        {/* Steps — big PP Mondwest number + body text, DESIGN.md portfolio card rhythm */}
        <div ref={stepsRef} className="flex flex-col gap-[70px]">
          {steps.map((step, i) => (
            <div key={step.num} className="hiw-step flex flex-col md:flex-row items-start gap-[30px] md:gap-[80px] group"
              style={{ borderBottom: `1px solid ${tokens.mist}`, paddingBottom: i < steps.length - 1 ? 70 : 0 }}>
              {/* Large number — Mondwest 140px, near-invisible until hover */}
              <div className="font-mondwest leading-[0.85] w-[120px] md:w-[180px] flex-shrink-0 select-none transition-colors duration-500"
                style={{ fontSize: 'clamp(80px, 10vw, 140px)', color: 'rgba(240,240,238,0.05)', letterSpacing: '-0.04em' }}>
                {step.num}
              </div>
              <div className="max-w-[520px] pt-2 md:pt-6">
                {/* Tag line */}
                <span className="font-mono text-[11px] tracking-[0.25em] uppercase block mb-4"
                  style={{ color: tokens.accent, fontWeight: 700, fontFamily: 'monospace' }}>
                  Step {step.num}
                </span>
                <h3 className="font-sans mb-4" style={{ fontSize: 22, color: tokens.ink, fontWeight: 550, fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {step.title}
                </h3>
                <p className="font-sans text-[16px] leading-[1.5]" style={{ color: tokens.inkMuted, fontWeight: 350, fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── FeaturesSection — no card borders, type defines hierarchy ─── */
function FeaturesSection() {
  const headRef = useRef(null)
  const gridRef = useRef(null)

  useEffect(() => { if (headRef.current) gsap.set(headRef.current, { opacity: 0, y: 50 }) }, [])
  const animateHead = useCallback((el, reverse) => {
    if (reverse) gsap.to(el, { opacity: 0, y: 50, duration: 0.4, ease: 'power2.in' })
    else gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
  }, [])
  const animateGrid = useCallback((el, reverse) => {
    const items = el.querySelectorAll('.feat-item')
    if (reverse) gsap.to(items, { opacity: 0, y: 30, duration: 0.3, stagger: 0.06, ease: 'power2.in' })
    else gsap.fromTo(items, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out' })
  }, [])
  useScrollReveal(headRef, animateHead)
  useScrollReveal(gridRef, animateGrid)

  const features = [
    { title: 'Drag & Drop Canvas', desc: 'Build complex workflows visually. Connect nodes with a click, rearrange freely, and see your logic come alive.', tag: '01' },
    { title: 'AI-Powered Nodes', desc: 'Embed GPT, Llama, and other AI models directly into your workflows. Summarize, classify, generate — all automated.', tag: '02' },
    { title: 'Real-time Monitoring', desc: 'Watch every workflow run live. Inspect node outputs, catch errors instantly, and replay failed steps.', tag: '03' },
    { title: 'One-click Deploy', desc: 'Publish your workflow with a single click. Schedule it, trigger via webhook, or run on demand.', tag: '04' },
  ]

  return (
    <section className="relative py-[120px] px-6 md:px-[50px]" style={{ borderTop: `1px solid ${tokens.mist}` }}>
      <div className="max-w-[1440px] mx-auto">
        {/* Asymmetric: headline left, sub-statement right — DESIGN.md layout */}
        <div ref={headRef} className="flex flex-col lg:flex-row lg:items-end gap-[60px] mb-[100px]">
          <div className="flex-1">
            <AccentTick className="mb-10" />
            <h2 className="font-editorial max-w-[600px]"
              style={{ fontSize: 'clamp(60px, 7vw, 96px)', lineHeight: 1.0, letterSpacing: '-1.92px', color: tokens.ink }}>
              Everything<br />
              <span style={{ color: tokens.sage }}>you need.</span>
            </h2>
          </div>
          <div className="w-full lg:w-[340px] flex-shrink-0">
            <p className="font-sans text-[16px] leading-[1.6]" style={{ color: tokens.inkMuted, fontWeight: 350, fontFamily: 'Inter, system-ui, sans-serif' }}>
              Four capabilities that form the core of every automated workflow you'll build on NOMADS.
            </p>
          </div>
        </div>

        {/* Feature grid — no borders, pure typography hierarchy */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 gap-y-[70px] gap-x-[80px] max-w-[1000px]">
          {features.map((feat) => (
            <div key={feat.title} className="feat-item flex flex-col group">
              <span className="font-mono text-[11px] tracking-[0.25em] uppercase mb-5 block"
                style={{ color: tokens.accent, fontWeight: 700, fontFamily: 'monospace' }}>
                {feat.tag}
              </span>
              <h3 className="font-sans mb-4 transition-colors duration-300"
                style={{ fontSize: 20, color: tokens.ink, fontWeight: 550, fontFamily: 'Inter, system-ui, sans-serif' }}>
                {feat.title}
              </h3>
              <p className="font-sans text-[16px] leading-[1.6]" style={{ color: tokens.inkMuted, fontWeight: 350, fontFamily: 'Inter, system-ui, sans-serif' }}>
                {feat.desc}
              </p>
              {/* Hairline divider — DESIGN.md mist divider */}
              <div className="mt-8 h-[1px] transition-colors duration-500" style={{ background: tokens.mist }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Visual Canvas Section — editorial asymmetric image + text ─── */
function VisualCanvasSection() {
  const mockRef = useRef(null)
  const textRef = useRef(null)

  useEffect(() => {
    if (mockRef.current) gsap.set(mockRef.current, { opacity: 0, y: 50, scale: 0.98 })
    if (textRef.current) gsap.set(textRef.current, { opacity: 0, x: -30 })
  }, [])
  const animateMock = useCallback((el, reverse) => {
    if (reverse) gsap.to(el, { opacity: 0, y: 50, scale: 0.98, duration: 0.4, ease: 'power2.in' })
    else gsap.to(el, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power3.out' })
  }, [])
  const animateText = useCallback((el, reverse) => {
    if (reverse) gsap.to(el, { opacity: 0, x: -30, duration: 0.4, ease: 'power2.in' })
    else gsap.to(el, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' })
  }, [])
  useScrollReveal(mockRef, animateMock)
  useScrollReveal(textRef, animateText)

  return (
    <section className="relative py-[120px] px-6 md:px-[50px]" style={{ borderTop: `1px solid ${tokens.mist}` }}>
      <div className="max-w-[1440px] mx-auto">
        {/* Asymmetric: text left narrow, canvas right wide — DESIGN.md editorial layout */}
        <div className="flex flex-col lg:flex-row gap-[60px] lg:gap-[100px] items-start">
          <div ref={textRef} className="w-full lg:w-[380px] flex-shrink-0 pt-4">
            <AccentTick className="mb-10" />
            <h2 className="font-editorial mb-8"
              style={{ fontSize: 'clamp(52px, 5.5vw, 72px)', lineHeight: 0.92, letterSpacing: '-1.2px', color: tokens.ink }}>
              Visual<br />Canvas.
            </h2>
            <p className="font-sans text-[18px] leading-[1.5] mb-6 max-w-[340px]"
              style={{ color: tokens.inkMuted, fontWeight: 350, fontFamily: 'Inter, system-ui, sans-serif' }}>
              An infinite, zoomable canvas where you design workflows like an artist. Pan, zoom, group nodes, and build with total freedom.
            </p>
            {/* Caption pair — DESIGN.md: Times/editorial italic caption */}
            <p className="font-editorial italic text-[16px] leading-[1.4]" style={{ color: tokens.sage }}>
              — Drag, connect, and watch data flow between nodes in real time.
            </p>
          </div>

          {/* Canvas mockup — acts as editorial image tile, 14px radius, no extra border chrome */}
          <div ref={mockRef} className="flex-1 w-full min-w-0">
            <div className="rounded-[14px] overflow-hidden" style={{ border: `1px solid ${tokens.mist}` }}>
              {/* Window chrome — mimics DESIGN.md image tile with editorial label */}
              <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: `1px solid ${tokens.mist}`, background: 'rgba(0,0,0,0.35)' }}>
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                <span className="ml-3 font-mono text-[11px]" style={{ color: tokens.sage }}>nomads — workflow canvas</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" style={{ boxShadow: '0 0 4px #4ade80' }} />
                  <span className="font-mono text-[10px] text-green-400/60">Running</span>
                </div>
              </div>
              <div className="p-5">
                <LiveCanvasMockup />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── NodeLibrarySection — PP Mondwest statement + editorial list ─── */
function NodeLibrarySection() {
  const headRef = useRef(null)
  const gridRef = useRef(null)

  useEffect(() => { if (headRef.current) gsap.set(headRef.current, { opacity: 0, y: 50 }) }, [])
  const animateHead = useCallback((el, reverse) => {
    if (reverse) gsap.to(el, { opacity: 0, y: 50, duration: 0.4, ease: 'power2.in' })
    else gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' })
  }, [])
  const animateGrid = useCallback((el, reverse) => {
    const items = el.querySelectorAll('.node-entry')
    if (reverse) gsap.to(items, { opacity: 0, y: 25, duration: 0.3, stagger: 0.05, ease: 'power2.in' })
    else gsap.fromTo(items, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.12, ease: 'power3.out' })
  }, [])
  useScrollReveal(headRef, animateHead)
  useScrollReveal(gridRef, animateGrid)

  const categories = [
    { label: 'AI Nodes',        count: '12+', color: '#8b5cf6', desc: 'GPT, Llama, Claude, embeddings, classifiers' },
    { label: 'Office Tools',    count: '18+', color: '#f97316', desc: 'Email, Sheets, Docs, Calendar, Drive' },
    { label: 'Data Processing', count: '10+', color: '#0ea5e9', desc: 'Transform, filter, aggregate, join data' },
    { label: 'Logic Control',   count: '8+',  color: '#10b981', desc: 'If/else, loops, switches, merge, split' },
    { label: 'Utility Nodes',   count: '14+', color: '#f43f5e', desc: 'HTTP, webhooks, delay, variables, code' },
  ]

  return (
    <section className="relative py-[120px] px-6 md:px-[50px]" style={{ borderTop: `1px solid ${tokens.mist}` }}>
      <div className="max-w-[1440px] mx-auto">
        {/* DESIGN.md: PP Mondwest 96px statement headline */}
        <div ref={headRef}>
          <AccentTick className="mb-10" />
          <h2 className="font-mondwest mb-[80px]"
            style={{ fontSize: 'clamp(60px, 7vw, 96px)', lineHeight: 0.92, letterSpacing: '-0.04em', color: tokens.ink }}>
            60+ nodes,<br />
            <span style={{ color: tokens.sage }}>zero limits.</span>
          </h2>
        </div>

        {/* Portfolio card style — no border, no shadow, type alone defines hierarchy */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-[55px] gap-x-[50px] max-w-[1100px]">
          {categories.map((cat) => (
            <div key={cat.label} className="node-entry flex flex-col group cursor-default">
              {/* Count — Mondwest color accent */}
              <div className="flex items-baseline gap-3 mb-3">
                <span className="font-mondwest text-[36px] leading-none" style={{ color: cat.color }}>{cat.count}</span>
                <span className="font-sans text-[18px] transition-colors duration-300"
                  style={{ color: tokens.ink, fontWeight: 550, fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {cat.label}
                </span>
              </div>
              <p className="font-sans text-[14px] leading-[1.5] mb-5"
                style={{ color: tokens.sage, fontWeight: 350, fontFamily: 'Inter, system-ui, sans-serif' }}>
                {cat.desc}
              </p>
              {/* Hairline bottom divider — mist per DESIGN.md */}
              <div className="h-[1px] transition-colors duration-500" style={{ background: tokens.mist }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── BottomCTA — massive display headline + Voltage CTA ─── */
function BottomCTA({ onEnter }) {
  const contentRef = useRef(null)

  useEffect(() => { if (contentRef.current) gsap.set(contentRef.current, { opacity: 0, y: 50 }) }, [])
  const animateContent = useCallback((el, reverse) => {
    if (reverse) gsap.to(el, { opacity: 0, y: 50, duration: 0.4, ease: 'power2.in' })
    else gsap.to(el, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' })
  }, [])
  useScrollReveal(contentRef, animateContent)

  return (
    <section className="relative py-[140px] px-6 md:px-[50px] overflow-hidden" style={{ borderTop: `1px solid ${tokens.mist}` }}>
      {/* Minimal background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 60%)' }} />

      <div ref={contentRef} className="relative z-10 max-w-[1440px] mx-auto">
        <AccentTick className="mb-14" />
        {/* DESIGN.md display scale: 120–140px, line-height 0.90, mixed faces */}
        <h2 className="font-editorial mb-10 max-w-[960px]"
          style={{ fontSize: 'clamp(60px, 10vw, 140px)', lineHeight: 0.90, letterSpacing: '-0.02em', color: tokens.ink }}>
          Build your first{' '}
          <span className="font-mondwest italic"
            style={{ background: 'linear-gradient(90deg, #fcd34d, #f97316, #ea580c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            workflow.
          </span>
        </h2>
        <p className="font-sans text-[18px] md:text-[20px] leading-[1.5] mb-14 max-w-[480px]"
          style={{ color: tokens.inkMuted, fontWeight: 350, fontFamily: 'Inter, system-ui, sans-serif' }}>
          Join thousands of teams automating their office work with NOMADS. No credit card required.
        </p>
        {/* Voltage CTA button — DESIGN.md primary action */}
        <MagneticBtn onClick={onEnter}
          className="text-[14px] px-[50px] py-[20px] rounded-[10px] inline-flex items-center gap-3 transition-all duration-200 cursor-pointer"
          style={{
            background: tokens.accent,
            color: '#0B0B0E',
            fontWeight: 550,
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '0.01em',
            boxShadow: tokens.accentGlow,
            border: 'none',
          }}>
          START BUILDING FOR FREE <ArrowRight size={16} />
        </MagneticBtn>
      </div>
    </section>
  )
}

/* ─── Footer — Obsidian panel, minimal links ─── */
function Footer() {
  return (
    <footer className="relative py-[50px] px-6 md:px-[50px]"
      style={{ background: tokens.panel, borderTop: `1px solid ${tokens.mist}` }}>
      <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Wordmark — logo split per DESIGN.md */}
          <span className="text-[14px] select-none" style={{ fontWeight: 550, fontFamily: 'Inter, system-ui, sans-serif' }}>
            <span style={{ color: tokens.ink }}>NOM</span><span style={{ color: tokens.accent }}>ADS</span>
          </span>
          <div className="flex items-center gap-6">
            {['About Us', 'Contact', 'Privacy', 'Terms'].map(link => (
              <a key={link} href="#" className="text-[14px] transition-colors duration-300"
                style={{ color: 'rgba(240,240,238,0.20)', fontWeight: 350, fontFamily: 'Inter, system-ui, sans-serif', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color = tokens.sage}
                onMouseLeave={e => e.target.style.color = 'rgba(240,240,238,0.20)'}>
                {link}
              </a>
            ))}
          </div>
        </div>
        <p className="font-mono text-[11px]" style={{ color: 'rgba(240,240,238,0.12)', letterSpacing: '0.01em' }}>
          © 2024 NOMADS. All rights reserved.
        </p>
      </div>
    </footer>
  )
}


/* ─── LandingPage (default export) ─── */
export default function LandingPage({ onEnter, onNavigateToDocs = () => {} }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden"
      style={{ background: tokens.canvas, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        .font-editorial { font-family: 'Playfair Display', 'Georgia', serif; font-weight: 300; }
        .font-mondwest  { font-family: 'Playfair Display', 'Georgia', serif; font-weight: 400; font-style: italic; }
        .font-sans      { font-family: 'Inter', system-ui, sans-serif; }
        .font-mono      { font-family: 'JetBrains Mono', 'Fira Mono', monospace; }
        ::selection { background: rgba(249,115,22,0.35); color: #fff; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(249,115,22,0.35); border-radius: 2px; }
        /* Ensure sections breathe — DESIGN.md section gap 80-120px */
        section { position: relative; }
      `}</style>
      <CursorGlow />
      <Navbar onEnter={onEnter} onNavigateToDocs={onNavigateToDocs} />
      <Hero onEnter={onEnter} onNavigateToDocs={onNavigateToDocs} />
      <HowItWorks />
      <FeaturesSection />
      <VisualCanvasSection />
      <NodeLibrarySection />
      <BottomCTA onEnter={onEnter} />
      <Footer />
    </div>
  )
}
