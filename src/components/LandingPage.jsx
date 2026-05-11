/**
 * LandingPage.jsx — NOMADS
 * Clean rewrite: GSAP + ScrollTrigger with custom scroller (#landing-scroller)
 */
import { useRef, useEffect, forwardRef, useCallback } from 'react'
import { Layers, Cpu, Users, Database, GitBranch, Wrench, ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const SCROLLER = '#landing-scroller'
const glass = 'bg-white/5 backdrop-blur-xl border border-white/10'
const orangeGrad = 'bg-gradient-to-r from-orange-500 to-amber-400 text-black font-bold shadow-[0_0_28px_rgba(234,97,19,0.45)] hover:shadow-[0_0_44px_rgba(234,97,19,0.7)] transition-all duration-200'

/* ─── ScrollReveal hook — plays on enter, reverses on scroll back up ─── */
function useScrollReveal(ref, animateFn, start = 'top 88%') {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const st = ScrollTrigger.create({
      trigger: el,
      scroller: SCROLLER,
      start,
      end: 'bottom 5%',
      onEnter: () => animateFn(el, false),
      onLeaveBack: () => animateFn(el, true),
    })
    return () => st.kill()
  }, [ref, animateFn, start])
}

/* ─── Magnetic Button ─── */
const MagneticBtn = forwardRef(function MagneticBtn({ children, className, onClick }, ref) {
  const inner = useRef(null)
  const el = ref || inner
  return (
    <button ref={el} className={className} onClick={onClick}
      onMouseMove={(e) => {
        const r = el.current.getBoundingClientRect()
        gsap.to(el.current, { x: (e.clientX - r.left - r.width / 2) * 0.35, y: (e.clientY - r.top - r.height / 2) * 0.35, scale: 1.06, duration: 0.4, ease: 'power2.out' })
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
      background: 'radial-gradient(circle, rgba(234,97,19,0.13) 0%, transparent 70%)',
      mixBlendMode: 'screen', willChange: 'transform',
    }} />
  )
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
        @keyframes nca-chip-glow{0%,100%{filter:drop-shadow(0 0 16px rgba(234,97,19,.65))}50%{filter:drop-shadow(0 0 28px rgba(234,97,19,.95))}}
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
        {/* tracks */}
        {leftNodes.map(n=><path key={`tl-${n.id}`} d={pL(n.cy)} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>)}
        {rightNodes.map(n=><path key={`tr-${n.id}`} d={pR(n.cy)} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>)}
        {/* pulses */}
        {leftNodes.map((n,i)=><path key={`pl-${n.id}`} d={pL(n.cy)} fill="none" stroke={n.dot} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="50 340" strokeDashoffset="340" filter="url(#glow-sm)" style={{animation:`nca-pulse 3.2s ease ${delays[i]}s infinite`}}/>)}
        {rightNodes.map((n,i)=><path key={`pr-${n.id}`} d={pR(n.cy)} fill="none" stroke={n.dot} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="50 340" strokeDashoffset="340" filter="url(#glow-sm)" style={{animation:`nca-pulse 3.2s ease ${delays[i]+0.4}s infinite`}}/>)}
        {/* rings */}
        <ellipse cx={CX} cy={CY} rx={CW/2+26} ry={CH/2+26} fill="none" stroke="rgba(234,97,19,.15)" strokeWidth="1" strokeDasharray="6 5" style={{animation:'nca-spin 14s linear infinite'}}/>
        <ellipse cx={CX} cy={CY} rx={CW/2+16} ry={CH/2+16} fill="none" stroke="rgba(251,191,36,.1)" strokeWidth="1" strokeDasharray="3 7" style={{animation:'nca-spin-r 9s linear infinite'}}/>
        {/* pins */}
        {[-30,-10,10,30].map((off,i)=>(
          <g key={`pin-${i}`}>
            <line x1={CX+off} y1={CY+CH/2} x2={CX+off} y2={CY+CH/2+18} stroke="#EA6113" strokeWidth="1.5" strokeLinecap="round" style={{animation:`nca-pin 2s ease ${i*.3}s infinite`,filter:'drop-shadow(0 0 3px #EA6113)'}}/>
            <line x1={CX+off} y1={CY-CH/2} x2={CX+off} y2={CY-CH/2-18} stroke="rgba(234,97,19,.35)" strokeWidth="1.5" strokeLinecap="round" style={{animation:`nca-pin 2.4s ease ${i*.25}s infinite`}}/>
          </g>
        ))}
        {/* chip */}
        <g style={{animation:'nca-chip-glow 3s ease-in-out infinite'}}>
          <rect x={CX-CW/2-6} y={CY-CH/2-6} width={CW+12} height={CH+12} rx={24} fill="rgba(234,97,19,.05)"/>
          <rect x={CX-CW/2} y={CY-CH/2} width={CW} height={CH} rx={18} fill="url(#chip-g)" stroke="url(#chip-b)" strokeWidth="1.5"/>
          <rect x={CX-CW/2+8} y={CY-CH/2+8} width={CW-16} height={CH-16} rx={12} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="1"/>
          <g clipPath="url(#chip-clip)">
            <line x1={CX-CW/2+3} y1={CY} x2={CX+CW/2-3} y2={CY} stroke="rgba(251,191,36,.3)" strokeWidth="1.5" style={{animation:'nca-scan 2.8s ease-in-out infinite'}}/>
          </g>
          {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx,sy],i)=>(
            <g key={`c-${i}`}>
              <line x1={CX+sx*(CW/2-10)} y1={CY+sy*(CH/2-10)} x2={CX+sx*(CW/2-10)} y2={CY+sy*(CH/2-22)} stroke="rgba(234,97,19,.55)" strokeWidth="2" strokeLinecap="round"/>
              <line x1={CX+sx*(CW/2-10)} y1={CY+sy*(CH/2-10)} x2={CX+sx*(CW/2-22)} y2={CY+sy*(CH/2-10)} stroke="rgba(234,97,19,.55)" strokeWidth="2" strokeLinecap="round"/>
            </g>
          ))}
          <text x={CX} y={CY+2} textAnchor="middle" fill="white" fontSize="28" fontWeight="900" fontFamily="Inter,sans-serif" style={{letterSpacing:'-.03em'}}>AI</text>
          <text x={CX} y={CY+20} textAnchor="middle" fill="rgba(234,97,19,.8)" fontSize="7" fontWeight="700" fontFamily="monospace" style={{letterSpacing:'.28em'}}>NOMADS</text>
        </g>
        {/* left nodes */}
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
        {/* right nodes */}
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
        {/* particles */}
        {leftNodes.map((n,i)=><circle key={`pal-${n.id}`} r="3" fill={n.dot} filter="url(#glow-md)" style={{offsetPath:`path("${pL(n.cy)}")`,animation:`nca-particle 3.2s ease ${delays[i]+.15}s infinite`}}/>)}
        {rightNodes.map((n,i)=><circle key={`par-${n.id}`} r="3" fill={n.dot} filter="url(#glow-md)" style={{offsetPath:`path("${pR(n.cy)}")`,animation:`nca-particle 3.2s ease ${delays[i]+.5}s infinite`}}/>)}
      </svg>
    </div>
  )
}

/* ─── Navbar ─── */
function Navbar({ onEnter, onNavigateToDocs }) {
  const navRef = useRef(null)
  const logoRef = useRef(null)
  const linksRef = useRef(null)
  const actionsRef = useRef(null)

  useEffect(() => {
    const nav = navRef.current, logo = logoRef.current
    const links = linksRef.current, actions = actionsRef.current
    if (!nav || !logo || !links || !actions) return
    gsap.set(logo, { x: -40, opacity: 0 })
    gsap.set(links.children, { y: -20, opacity: 0 })
    gsap.set(actions.children, { opacity: 0, y: -10 })
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 })
    tl.to(logo, { x: 0, opacity: 1, duration: 0.7 })
      .to(links.children, { y: 0, opacity: 1, duration: 0.5, stagger: 0.07 }, '-=0.4')
      .to(actions.children, { opacity: 1, y: 0, duration: 0.45, stagger: 0.08 }, '-=0.3')
    const scroller = document.getElementById('landing-scroller') || window
    const onScroll = () => {
      const scrolled = (scroller === window ? window.scrollY : scroller.scrollTop) > 40
      gsap.to(nav, { paddingTop: scrolled ? '6px' : '12px', paddingBottom: scrolled ? '6px' : '12px', duration: 0.35, ease: 'power2.out' })
    }
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => { tl.kill(); scroller.removeEventListener('scroll', onScroll) }
  }, [])

  return (
    <div className="sticky top-0 z-50 w-full flex justify-center px-4 pt-4">
      <header className="w-full max-w-5xl">
        <nav ref={navRef} className={`${glass} rounded-2xl px-5 py-3 flex items-center justify-between shadow-[0_8px_40px_rgba(0,0,0,0.5)]`}>
          <span ref={logoRef} className="text-white font-black text-sm tracking-[0.22em] select-none">NOMADS</span>
          <div ref={linksRef} className="hidden md:flex items-center gap-7">
            {['Canvas', 'Nodes', 'Templates', 'Pricing'].map(l => (
              <a key={l} href="#" className="text-white/50 hover:text-white text-sm font-medium transition-colors duration-200">{l}</a>
            ))}
            <button onClick={onNavigateToDocs} className="text-white/50 hover:text-white text-sm font-medium transition-colors duration-200">Docs</button>
          </div>
          <div ref={actionsRef} className="flex items-center gap-3">
            <button className="text-white/50 hover:text-white text-sm font-medium transition-colors duration-200 hidden sm:block">Login</button>
            <MagneticBtn onClick={onEnter} className={`${orangeGrad} text-xs px-4 py-2 rounded-xl`}>Get Started For Free</MagneticBtn>
          </div>
        </nav>
      </header>
    </div>
  )
}

/* ─── Hero ─── */
function Hero({ onEnter }) {
  const sectionRef = useRef(null)
  const badgeRef = useRef(null)
  const headlineRef = useRef(null)
  const subRef = useRef(null)
  const circuitRef = useRef(null)
  const ctaRef = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    // Direct gsap calls - NO gsap.context()
    gsap.set([badgeRef.current, subRef.current, ctaRef.current], { opacity: 0, y: 20 })
    gsap.set(circuitRef.current, { opacity: 0, x: 40 })
    const charEls = headlineRef.current?.querySelectorAll('.hero-char')
    if (charEls?.length) gsap.set(charEls, { opacity: 0, y: 30 })

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.2 })
    tl.to(badgeRef.current, { opacity: 1, y: 0, duration: 0.6 })
    if (charEls?.length) tl.to(charEls, { opacity: 1, y: 0, duration: 0.5, stagger: 0.015 }, '-=0.3')
    tl.to(subRef.current, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
      .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
      .to(circuitRef.current, { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }, '-=0.5')

    // Parallax on background glows - direct ScrollTrigger (no context)
    const glows = sectionRef.current?.querySelectorAll('.hero-glow')
    glows?.forEach((g, i) => {
      gsap.to(g, {
        y: i === 0 ? -80 : -50,
        ease: 'none',
        scrollTrigger: { trigger: sectionRef.current, scroller: SCROLLER, start: 'top top', end: 'bottom top', scrub: 1.5 }
      })
    })

    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars.trigger === sectionRef.current) t.kill()
      })
    }
  }, [])

  const lines = [
    { text: 'NOMADS:', gradient: true },
    { text: 'No-Code Workflow', gradient: false },
    { text: 'Automation', gradient: false },
  ]

  const renderLine = (line, idx) => (
    <div key={idx} style={{ overflow: 'hidden', display: 'block' }}>
      <span className={line.gradient ? 'inline-block' : 'text-white inline-block'} style={{ perspective: 600 }}>
        {line.text.split('').map((ch, ci) => (
          <span key={ci} className={`hero-char inline-block ${line.gradient ? 'bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 bg-clip-text text-transparent' : ''}`}
            style={{ whiteSpace: ch === ' ' ? 'pre' : 'normal', WebkitBackgroundClip: line.gradient ? 'text' : undefined, WebkitTextFillColor: line.gradient ? 'transparent' : undefined }}>
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
      </span>
    </div>
  )

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center pt-8 pb-20 px-5 overflow-hidden">
      <div className="hero-glow absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[140px] pointer-events-none" />
      <div className="hero-glow absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(234,97,19,0.12) 0%, transparent 65%)' }} />
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        <div className="flex-1 flex flex-col items-start text-left max-w-xl">
          <div ref={badgeRef} className="inline-flex items-center gap-2 mb-7">
            <span className={`${glass} text-xs text-white/60 font-medium px-4 py-1.5 rounded-full`}>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-2" style={{ boxShadow: '0 0 6px #F59E0B' }} />
              No-Code Workflow Automation
            </span>
          </div>
          <h1 ref={headlineRef} className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            {lines.map((l, i) => renderLine(l, i))}
          </h1>
          <p ref={subRef} className="text-white/50 text-lg md:text-xl mb-10 font-medium leading-relaxed">
            Streamline office tasks with an artistic, visual approach.
          </p>
          <div ref={ctaRef}>
            <MagneticBtn ref={btnRef} onClick={onEnter}
              className={`${orangeGrad} flex items-center gap-2 text-sm px-8 py-3.5 rounded-full`}>
              Start Building for Free <ArrowRight size={16} />
            </MagneticBtn>
          </div>
        </div>
        <div ref={circuitRef} className="flex-1 w-full min-w-0 flex items-center justify-center">
          <NodeCircuitAnimation />
        </div>
      </div>
    </section>
  )
}

/* ─── HowItWorks ─── */
function HowItWorks() {
  const sectionRef = useRef(null)
  const headRef = useRef(null)
  const gridRef = useRef(null)

  // Set initial hidden state on mount
  useEffect(() => {
    if (headRef.current) gsap.set(headRef.current, { opacity: 0, y: 40 })
  }, [])

  const animateHead = useCallback((el, reverse) => {
    if (reverse) gsap.to(el, { opacity: 0, y: 40, duration: 0.4, ease: 'power2.in' })
    else gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
  }, [])
  const animateGrid = useCallback((el, reverse) => {
    const items = el.querySelectorAll('.hiw-step')
    if (reverse) gsap.to(items, { opacity: 0, y: 40, duration: 0.35, stagger: 0.08, ease: 'power2.in' })
    else gsap.fromTo(items, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power3.out' })
  }, [])

  useScrollReveal(headRef, animateHead)
  useScrollReveal(gridRef, animateGrid)

  const steps = [
    {
      num: '01',
      title: 'Connect Apps',
      desc: 'Link your favorite office tools — email, spreadsheets, calendars — in seconds with our pre-built connectors.',
      color: '#f59e0b',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      ),
    },
    {
      num: '02',
      title: 'Build Logic',
      desc: 'Drag, drop, and connect nodes on a visual canvas. Add AI, conditions, loops — no code required.',
      color: '#8b5cf6',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/><path d="M17.5 17.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0"/>
          <path d="M6.5 10v4M10 6.5h4M17.5 10v4"/>
        </svg>
      ),
    },
    {
      num: '03',
      title: 'Automate',
      desc: 'Activate your workflow and watch tasks complete themselves. Monitor runs in real-time from your dashboard.',
      color: '#0ea5e9',
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      ),
    },
  ]

  return (
    <section ref={sectionRef} className="relative py-28 px-5 overflow-hidden"
      >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-purple-900/10 blur-[120px]" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <div ref={headRef} className="text-center mb-16" >
          <span className="text-xs font-bold tracking-[0.3em] text-amber-400/70 uppercase mb-4 block">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Three steps to automation</h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">From idea to running workflow in minutes, not months.</p>
        </div>
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.num} className={`hiw-step ${glass} rounded-2xl p-8 relative overflow-hidden cursor-default`}
              
              onMouseEnter={(e) => gsap.to(e.currentTarget, { y: -6, duration: 0.3, ease: 'power2.out' })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' })}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none"
                style={{ background: `${step.color}18` }} />
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{ background: `${step.color}15`, border: `1px solid ${step.color}30` }}>
                {step.icon}
              </div>
              <div className="text-xs font-black tracking-[0.25em] mb-3" style={{ color: step.color }}>{step.num}</div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── FeaturesGrid ─── */
function FeaturesGrid() {
  const sectionRef = useRef(null)
  const headRef = useRef(null)
  const gridRef = useRef(null)

  useEffect(() => {
    if (headRef.current) gsap.set(headRef.current, { opacity: 0, y: 40 })
  }, [])

  const animateHead = useCallback((el, reverse) => {
    if (reverse) gsap.to(el, { opacity: 0, y: 40, duration: 0.4, ease: 'power2.in' })
    else gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
  }, [])
  const animateGrid = useCallback((el, reverse) => {
    const items = el.querySelectorAll('.feat-card')
    if (reverse) gsap.to(items, { opacity: 0, y: 40, scale: 0.96, duration: 0.35, stagger: 0.06, ease: 'power2.in' })
    else gsap.fromTo(items, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.12, ease: 'power3.out' })
  }, [])

  useScrollReveal(headRef, animateHead)
  useScrollReveal(gridRef, animateGrid)

  const features = [
    {
      num: '01',
      title: 'Drag & Drop Canvas',
      desc: 'Build complex workflows visually. Connect nodes with a click, rearrange freely, and see your logic come alive.',
      color: '#f59e0b',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 9l4-4 4 4"/><path d="M9 5v14"/><path d="M19 15l-4 4-4-4"/><path d="M15 19V5"/>
        </svg>
      ),
    },
    {
      num: '02',
      title: 'AI-Powered Nodes',
      desc: 'Embed GPT, Llama, and other AI models directly into your workflows. Summarize, classify, generate — all automated.',
      color: '#8b5cf6',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 0 6h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1 0-6h1V6a4 4 0 0 1 4-4z"/>
          <circle cx="9" cy="9" r="1" fill="#8b5cf6"/><circle cx="15" cy="9" r="1" fill="#8b5cf6"/>
        </svg>
      ),
    },
    {
      num: '03',
      title: 'Real-time Monitoring',
      desc: 'Watch every workflow run live. Inspect node outputs, catch errors instantly, and replay failed steps.',
      color: '#0ea5e9',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
    },
    {
      num: '04',
      title: 'One-click Deploy',
      desc: 'Publish your workflow with a single click. Schedule it, trigger via webhook, or run on demand — your choice.',
      color: '#10b981',
      icon: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      ),
    },
  ]

  return (
    <section ref={sectionRef} className="relative py-28 px-5 overflow-hidden"
      >
      <div className="relative z-10 max-w-6xl mx-auto">
        <div ref={headRef} className="text-center mb-16" >
          <span className="text-xs font-bold tracking-[0.3em] text-purple-400/70 uppercase mb-4 block">Features</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Everything you need</h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">Powerful tools designed for teams who want results, not complexity.</p>
        </div>
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((feat) => (
            <div key={feat.num} className={`feat-card ${glass} rounded-2xl p-8 relative overflow-hidden cursor-default`}
              
              onMouseEnter={(e) => gsap.to(e.currentTarget, { y: -5, duration: 0.3, ease: 'power2.out' })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' })}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] pointer-events-none"
                style={{ background: `${feat.color}12` }} />
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${feat.color}15`, border: `1px solid ${feat.color}30` }}>
                  {feat.icon}
                </div>
                <div>
                  <div className="text-xs font-black tracking-[0.25em] mb-2" style={{ color: feat.color }}>{feat.num}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── CoreComponents ─── */
function CoreComponents() {
  const sectionRef = useRef(null)
  const headRef = useRef(null)
  const gridRef = useRef(null)

  useEffect(() => {
    if (headRef.current) gsap.set(headRef.current, { opacity: 0, y: 40 })
  }, [])

  const animateHead = useCallback((el, reverse) => {
    if (reverse) gsap.to(el, { opacity: 0, y: 40, duration: 0.4, ease: 'power2.in' })
    else gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
  }, [])
  const animateGrid = useCallback((el, reverse) => {
    const items = el.querySelectorAll('.core-card')
    if (reverse) gsap.to(items, { opacity: 0, y: 50, duration: 0.35, stagger: 0.08, ease: 'power2.in' })
    else gsap.fromTo(items, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.65, stagger: 0.15, ease: 'power3.out' })
  }, [])

  useScrollReveal(headRef, animateHead)
  useScrollReveal(gridRef, animateGrid)

  const cards = [
    {
      title: 'Visual Canvas',
      desc: 'An infinite, zoomable canvas where you design workflows like an artist. Pan, zoom, group nodes, and build with total freedom.',
      color: '#f59e0b',
      Icon: Layers,
    },
    {
      title: 'AI & Office Node Library',
      desc: 'Over 50 pre-built nodes covering AI models, email, spreadsheets, calendars, databases, and more — ready to drop in.',
      color: '#8b5cf6',
      Icon: Cpu,
    },
    {
      title: 'Real-time Collaboration',
      desc: 'Invite teammates to edit workflows together. See cursors, changes, and comments live — like Figma for automation.',
      color: '#0ea5e9',
      Icon: Users,
    },
  ]

  const handleTilt = (e, el) => {
    const r = el.getBoundingClientRect()
    const x = (e.clientY - r.top - r.height / 2) / (r.height / 2)
    const y = -(e.clientX - r.left - r.width / 2) / (r.width / 2)
    gsap.to(el, { rotateX: x * 8, rotateY: y * 8, scale: 1.03, duration: 0.3, ease: 'power2.out', transformPerspective: 800 })
  }
  const resetTilt = (el) => {
    gsap.to(el, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1,0.5)' })
  }

  return (
    <section ref={sectionRef} className="relative py-28 px-5 overflow-hidden"
      >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-amber-900/8 blur-[100px]" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <div ref={headRef} className="text-center mb-16" >
          <span className="text-xs font-bold tracking-[0.3em] text-amber-400/70 uppercase mb-4 block">Core Components</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Built for power users</h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">Three pillars that make NOMADS the most capable no-code automation platform.</p>
        </div>
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.title} className={`core-card ${glass} rounded-2xl p-8 relative overflow-hidden cursor-default`}
              style={{ opacity: 0, transformStyle: 'preserve-3d' }}
              onMouseMove={(e) => handleTilt(e, e.currentTarget)}
              onMouseLeave={(e) => resetTilt(e.currentTarget)}>
              <div className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 0%, ${card.color}10 0%, transparent 60%)` }} />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: `${card.color}15`, border: `1px solid ${card.color}30` }}>
                <card.Icon size={26} color={card.color} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{card.desc}</p>
              <div className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${card.color}40, transparent)` }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── NodeLibrary ─── */
function NodeLibrary() {
  const sectionRef = useRef(null)
  const headRef = useRef(null)
  const gridRef = useRef(null)

  useEffect(() => {
    if (headRef.current) gsap.set(headRef.current, { opacity: 0, y: 40 })
  }, [])

  const animateHead = useCallback((el, reverse) => {
    if (reverse) gsap.to(el, { opacity: 0, y: 40, duration: 0.4, ease: 'power2.in' })
    else gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
  }, [])
  const animateGrid = useCallback((el, reverse) => {
    const items = el.querySelectorAll('.node-item')
    if (reverse) gsap.to(items, { opacity: 0, y: 30, scale: 0.95, duration: 0.3, stagger: 0.05, ease: 'power2.in' })
    else gsap.fromTo(items, { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' })
  }, [])

  useScrollReveal(headRef, animateHead)
  useScrollReveal(gridRef, animateGrid)

  const nodeTypes = [
    { label: 'AI Nodes', count: '12+', color: '#8b5cf6', Icon: Cpu, desc: 'GPT, Llama, Claude, embeddings, classifiers' },
    { label: 'Office Tools', count: '18+', color: '#f59e0b', Icon: Layers, desc: 'Email, Sheets, Docs, Calendar, Drive' },
    { label: 'Data Processing', count: '10+', color: '#0ea5e9', Icon: Database, desc: 'Transform, filter, aggregate, join data' },
    { label: 'Logic Control', count: '8+', color: '#10b981', Icon: GitBranch, desc: 'If/else, loops, switches, merge, split' },
    { label: 'Utility Nodes', count: '14+', color: '#f43f5e', Icon: Wrench, desc: 'HTTP, webhooks, delay, variables, code' },
  ]

  return (
    <section ref={sectionRef} className="relative py-28 px-5 overflow-hidden"
      >
      <div className="relative z-10 max-w-6xl mx-auto">
        <div ref={headRef} className="text-center mb-16" >
          <span className="text-xs font-bold tracking-[0.3em] text-sky-400/70 uppercase mb-4 block">Node Library</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">60+ nodes, zero limits</h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">Every node you need to automate any office workflow, out of the box.</p>
        </div>
        <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {nodeTypes.map((node) => (
            <div key={node.label} className={`node-item ${glass} rounded-2xl p-6 flex flex-col items-center text-center cursor-default`}
              
              onMouseEnter={(e) => gsap.to(e.currentTarget, { y: -6, duration: 0.3, ease: 'power2.out' })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' })}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${node.color}15`, border: `1px solid ${node.color}30` }}>
                <node.Icon size={22} color={node.color} />
              </div>
              <div className="text-2xl font-black mb-1" style={{ color: node.color }}>{node.count}</div>
              <div className="text-white font-bold text-sm mb-2">{node.label}</div>
              <div className="text-white/35 text-xs leading-relaxed">{node.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── DashboardMockup helpers ─── */
function MockConnector({ x1, y1, x2, y2, color = 'rgba(255,255,255,0.15)' }) {
  const mx = (x1 + x2) / 2
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
      <path d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
        fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="5 4" strokeLinecap="round" />
    </svg>
  )
}

function MockNode({ label, status = 'completed', color = '#8b5cf6' }) {
  const statusColors = { running: '#f59e0b', completed: '#10b981', error: '#f43f5e' }
  const dot = statusColors[status] || '#10b981'
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/80 select-none"
      style={{ background: `${color}18`, border: `1px solid ${color}35`, backdropFilter: 'blur(8px)', whiteSpace: 'nowrap' }}>
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot, boxShadow: `0 0 6px ${dot}` }} />
      {label}
    </div>
  )
}

function CircleProgress() {
  const circleRef = useRef(null)
  const pct = 55
  const r = 36, circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)

  useEffect(() => {
    const el = circleRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        gsap.fromTo(el, { strokeDashoffset: circ }, { strokeDashoffset: offset, duration: 1.4, ease: 'power2.out' })
        obs.disconnect()
      }
    }, { threshold: 0.5 })
    obs.observe(el.closest('svg') || el)
    return () => obs.disconnect()
  }, [circ, offset])

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle ref={circleRef} cx="45" cy="45" r={r} fill="none" stroke="#f59e0b" strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ}
          transform="rotate(-90 45 45)" style={{ filter: 'drop-shadow(0 0 6px #f59e0b)' }} />
        <text x="45" y="50" textAnchor="middle" fill="white" fontSize="14" fontWeight="800" fontFamily="Inter,sans-serif">{pct}%</text>
      </svg>
      <span className="text-white/40 text-xs">Success Rate</span>
    </div>
  )
}

function MiniBarChart() {
  const bars = [42, 68, 55, 80, 63, 91, 74]
  const maxH = 40
  return (
    <div className="flex items-end gap-1.5" style={{ height: maxH + 20 }}>
      {bars.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div className="rounded-sm w-5 transition-all duration-300"
            style={{ height: (v / 100) * maxH, background: i === 5 ? '#f59e0b' : 'rgba(245,158,11,0.3)', boxShadow: i === 5 ? '0 0 8px #f59e0b80' : 'none' }} />
        </div>
      ))}
    </div>
  )
}

/* ─── DashboardMockup ─── */
function DashboardMockup() {
  const sectionRef = useRef(null)
  const mockRef = useRef(null)

  useEffect(() => {
    if (mockRef.current) gsap.set(mockRef.current, { opacity: 0, y: 50, scale: 0.97 })
  }, [])

  const animateMock = useCallback((el, reverse) => {
    if (reverse) gsap.to(el, { opacity: 0, y: 50, scale: 0.97, duration: 0.4, ease: 'power2.in' })
    else gsap.to(el, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' })
  }, [])

  useScrollReveal(mockRef, animateMock)

  const stats = [
    { label: 'Total Runs', value: '247', color: '#f59e0b' },
    { label: 'Success Rate', value: '98.2%', color: '#10b981' },
    { label: 'Avg Time', value: '1.4s', color: '#0ea5e9' },
    { label: 'Active', value: '12', color: '#8b5cf6' },
  ]

  return (
    <section ref={sectionRef} className="relative py-28 px-5 overflow-hidden"
      >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-purple-900/8 blur-[120px]" />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold tracking-[0.3em] text-purple-400/70 uppercase mb-4 block">Dashboard</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Monitor everything, live</h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">A real-time command center for all your running workflows.</p>
        </div>
        <div ref={mockRef} className={`${glass} rounded-3xl overflow-hidden`} >
          {/* Titlebar */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="ml-3 text-white/30 text-xs font-mono">nomads — workflow canvas</span>
          </div>
          <div className="flex flex-col lg:flex-row">
            {/* Canvas area */}
            <div className="flex-1 relative p-8 min-h-[280px]" style={{ background: 'radial-gradient(circle at 30% 50%, rgba(139,92,246,0.05) 0%, transparent 60%)' }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
              {/* Nodes positioned absolutely */}
              <div className="relative" style={{ height: 220 }}>
                <div className="absolute" style={{ left: 0, top: 20 }}>
                  <MockNode label="Read Email" status="completed" color="#3b82f6" />
                </div>
                <div className="absolute" style={{ left: 0, top: 90 }}>
                  <MockNode label="AI Classify" status="running" color="#8b5cf6" />
                </div>
                <div className="absolute" style={{ left: 0, top: 160 }}>
                  <MockNode label="Filter Logic" status="completed" color="#f59e0b" />
                </div>
                <div className="absolute" style={{ left: '42%', top: 55 }}>
                  <MockNode label="Prompt Node" status="running" color="#8b5cf6" />
                </div>
                <div className="absolute" style={{ right: 0, top: 20 }}>
                  <MockNode label="Send Email" status="completed" color="#f97316" />
                </div>
                <div className="absolute" style={{ right: 0, top: 100 }}>
                  <MockNode label="Output" status="completed" color="#10b981" />
                </div>
                {/* SVG connectors overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                  <line x1="130" y1="30" x2="200" y2="75" stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" strokeDasharray="5 4" />
                  <line x1="130" y1="100" x2="200" y2="75" stroke="rgba(139,92,246,0.3)" strokeWidth="1.5" strokeDasharray="5 4" />
                  <line x1="130" y1="170" x2="200" y2="75" stroke="rgba(245,158,11,0.3)" strokeWidth="1.5" strokeDasharray="5 4" />
                </svg>
              </div>
            </div>
            {/* Monitoring panel */}
            <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-white/5 p-6 flex flex-col gap-5">
              <div className="text-white/50 text-xs font-bold tracking-widest uppercase">Monitoring</div>
              <div className="grid grid-cols-2 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-xl p-3" style={{ background: `${s.color}10`, border: `1px solid ${s.color}20` }}>
                    <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-white/35 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <CircleProgress />
                <div className="flex flex-col items-center gap-1">
                  <MiniBarChart />
                  <span className="text-white/40 text-xs">Weekly Runs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── BottomCTA ─── */
function BottomCTA({ onEnter }) {
  const sectionRef = useRef(null)
  const cardRef = useRef(null)
  const glowRef = useRef(null)

  useEffect(() => {
    if (cardRef.current) gsap.set(cardRef.current, { opacity: 0, y: 40, scale: 0.97 })
  }, [])

  const animateCard = useCallback((el, reverse) => {
    if (reverse) gsap.to(el, { opacity: 0, y: 40, scale: 0.97, duration: 0.4, ease: 'power2.in' })
    else gsap.to(el, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out' })
  }, [])

  useScrollReveal(cardRef, animateCard)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return
    gsap.to(glow, {
      y: -60,
      ease: 'none',
      scrollTrigger: { trigger: sectionRef.current, scroller: SCROLLER, start: 'top bottom', end: 'bottom top', scrub: 2 }
    })
    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars.trigger === sectionRef.current) t.kill()
      })
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative py-28 px-5 overflow-hidden"
      >
      <div ref={glowRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(234,97,19,0.15) 0%, transparent 65%)' }} />
      <div className="relative z-10 max-w-4xl mx-auto">
        <div ref={cardRef} className={`${glass} rounded-3xl p-12 md:p-16 text-center`} >
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Build your first{' '}
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              workflow.
            </span>
          </h2>
          <p className="text-white/45 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Join thousands of teams automating their office work with NOMADS. No credit card required.
          </p>
          <MagneticBtn onClick={onEnter}
            className={`${orangeGrad} inline-flex items-center gap-2 text-sm px-10 py-4 rounded-full`}>
            Start Building for Free <ArrowRight size={16} />
          </MagneticBtn>
        </div>
      </div>
    </section>
  )
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="relative py-10 px-5 border-t border-white/5"
      >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <span className="text-white font-black text-sm tracking-[0.22em] select-none">NOMADS</span>
          <div className="flex items-center gap-5">
            {['About Us', 'Contact', 'Privacy', 'Terms'].map(link => (
              <a key={link} href="#" className="text-white/35 hover:text-white/70 text-xs font-medium transition-colors duration-200">{link}</a>
            ))}
          </div>
        </div>
        <p className="text-white/25 text-xs">© 2024 NOMADS. All rights reserved.</p>
      </div>
    </footer>
  )
}

/* ─── LandingPage (default export) ─── */
export default function LandingPage({ onEnter, onNavigateToDocs }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        ::selection { background: rgba(245,158,11,0.35); color: #fff; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.5); border-radius: 2px; }
      `}</style>
      <CursorGlow />
      <Navbar onEnter={onEnter} onNavigateToDocs={onNavigateToDocs} />
      <Hero onEnter={onEnter} />
      <HowItWorks />
      <FeaturesGrid />
      <CoreComponents />
      <NodeLibrary />
      <DashboardMockup />
      <BottomCTA onEnter={onEnter} />
      <Footer />
    </div>
  )
}
