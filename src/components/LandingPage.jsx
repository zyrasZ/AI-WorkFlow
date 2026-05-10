/**
 * LandingPage.jsx — NOMADS
 * Full redesign: Tailwind CSS + Framer Motion + GSAP + Lucide React
 * Glassmorphism · Dark mode · Web3/AI SaaS aesthetic
 * All sub-components in single file (Fast Refresh warnings are lint-only, not build errors)
 */
/* eslint-disable react-refresh/only-export-components */
import { useRef, useEffect, memo } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'
import {
  Layers, Cpu, Users, Database, GitBranch, Wrench,
  Play, ArrowRight,
} from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* ─── Scroll-reveal wrapper (Framer Motion useInView — works with any scroller) ── */
function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 44 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 44 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ─── Stagger container for card grids ── */
function StaggerGrid({ children, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const controls = useAnimation()
  useEffect(() => {
    if (inView) controls.start('show')
  }, [inView, controls])
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={controls}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
    >
      {children}
    </motion.div>
  )
}

const cardVariant = {
  hidden: { opacity: 0, y: 50 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}

/* ─── Shared style strings ───────────────────────────────────────────────── */
const glass = 'bg-white/5 backdrop-blur-xl border border-white/10'
const orangeGrad = 'bg-gradient-to-r from-orange-500 to-amber-400 text-black font-bold shadow-[0_0_28px_rgba(234,97,19,0.45)] hover:shadow-[0_0_44px_rgba(234,97,19,0.7)] transition-all duration-200'

/* ══════════════════════════════════════════════════════════════════════════
   MAGNETIC BUTTON
══════════════════════════════════════════════════════════════════════════ */
function MagneticBtn({ children, className, onClick, strength = 0.35 }) {
  const ref = useRef(null)
  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    gsap.to(ref.current, { x: x * strength, y: y * strength, duration: 0.4, ease: 'power2.out' })
  }
  const handleMouseLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
  }
  return (
    <button ref={ref} className={className} onClick={onClick}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {children}
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   SVG ANIMATED CONNECTOR
══════════════════════════════════════════════════════════════════════════ */
function MockConnector() {
  return (
    <svg width="40" height="12" viewBox="0 0 40 12" className="flex-shrink-0 mx-1">
      <line x1="0" y1="6" x2="36" y2="6" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"
        strokeDasharray="4 3" style={{ animation: 'dashFlow 1.2s linear infinite' }} />
      <circle cx="38" cy="6" r="2" fill="rgba(255,255,255,0.3)" />
      <style>{`@keyframes dashFlow { to { stroke-dashoffset: -14; } }`}</style>
    </svg>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   CIRCLE PROGRESS (Framer Motion + GSAP counter — no ScrollTrigger)
══════════════════════════════════════════════════════════════════════════ */
function CircleProgress() {
  const circleRef = useRef(null)
  const textRef   = useRef(null)
  const wrapRef   = useRef(null)
  const inView    = useInView(wrapRef, { once: true, margin: '-60px' })
  const r    = 36
  const circ = 2 * Math.PI * r
  const target = 55

  useEffect(() => {
    if (!inView) return
    const el  = circleRef.current
    const txt = textRef.current
    if (!el || !txt) return

    gsap.fromTo(el,
      { strokeDashoffset: circ },
      { strokeDashoffset: circ - (target / 100) * circ, duration: 1.8, ease: 'power3.out' }
    )
    const counter = { val: 0 }
    gsap.to(counter, {
      val: target, duration: 1.8, ease: 'power3.out',
      onUpdate: () => { if (txt) txt.textContent = Math.round(counter.val) + '%' },
    })
  }, [inView, circ])

  return (
    <div ref={wrapRef} className="flex flex-col items-center gap-2">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <defs>
          <linearGradient id="pgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EA6113" />
          </linearGradient>
        </defs>
        <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle ref={circleRef} cx="48" cy="48" r={r} fill="none"
          stroke="url(#pgGrad)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ}
          transform="rotate(-90 48 48)" />
        <text ref={textRef} x="48" y="53" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">0%</text>
      </svg>
      <p className="text-white/40 text-xs">Completion Rate</p>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   MINI BAR CHART
══════════════════════════════════════════════════════════════════════════ */
const MiniBarChart = memo(function MiniBarChart() {
  const bars = [40, 65, 45, 80, 55, 90, 70]
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <div className="flex flex-col gap-2">
      <p className="text-white/40 text-xs mb-1">Executions / day</p>
      <div className="flex items-end gap-1.5 h-14">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-sm transition-all duration-300"
            style={{
              height: `${h}%`,
              background: i === bars.length - 1
                ? 'linear-gradient(to top, #EA6113, #F59E0B)'
                : 'rgba(255,255,255,0.12)',
            }} />
        ))}
      </div>
      <div className="flex justify-between">
        {days.map((d, i) => (
          <span key={i} className="flex-1 text-center text-white/20 text-[10px]">{d}</span>
        ))}
      </div>
    </div>
  )
})

/* ══════════════════════════════════════════════════════════════════════════
   MOCK NODE
══════════════════════════════════════════════════════════════════════════ */
function MockNode({ label, status }) {
  const styles = {
    running:   { dot: '#60a5fa', ring: 'rgba(96,165,250,0.35)',  glow: '0 0 6px #60a5fa' },
    completed: { dot: '#4ade80', ring: 'rgba(74,222,128,0.35)',  glow: '0 0 6px #4ade80' },
    error:     { dot: '#f87171', ring: 'rgba(248,113,113,0.35)', glow: '0 0 6px #f87171' },
  }
  const s = styles[status]
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full text-white text-xs font-medium flex-shrink-0"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${s.ring}`,
        backdropFilter: 'blur(12px)',
      }}>
      <span className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: s.dot, boxShadow: s.glow }} />
      {label}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   NODE CIRCUIT ANIMATION — Real product nodes + AI chip center
   Left side: Prompt, Read Email, Filter Email, Email Account
   Right side: Send Email, Email Template, Output, Llama 3.3
══════════════════════════════════════════════════════════════════════════ */
function NodeCircuitAnimation() {
  const leftNodes = [
    { id: 'prompt',   label: 'Prompt',        tag: 'INPUT',  color: '#8b5cf6', dot: '#a78bfa', cy: 55  },
    { id: 'read',     label: 'Read Email',     tag: 'EMAIL',  color: '#3b82f6', dot: '#60a5fa', cy: 165 },
    { id: 'filter',   label: 'Filter Email',   tag: 'LOGIC',  color: '#eab308', dot: '#fbbf24', cy: 275 },
    { id: 'account',  label: 'Email Account',  tag: 'AUTH',   color: '#8b5cf6', dot: '#c084fc', cy: 385 },
  ]
  const rightNodes = [
    { id: 'send',     label: 'Send Email',     tag: 'ACTION', color: '#f97316', dot: '#fb923c', cy: 55  },
    { id: 'template', label: 'Email Template', tag: 'TMPL',   color: '#10b981', dot: '#34d399', cy: 165 },
    { id: 'output',   label: 'Output',         tag: 'OUT',    color: '#f59e0b', dot: '#fcd34d', cy: 275 },
    { id: 'llama',    label: 'Llama 3.3 70B',  tag: 'AI',     color: '#10b981', dot: '#6ee7b7', cy: 385 },
  ]

  const SVG_W = 860
  const SVG_H = 480
  const CX = SVG_W / 2
  const CY = SVG_H / 2
  const NODE_W = 148
  const NODE_H = 44
  const NODE_RX = 10
  const CHIP_W = 104
  const CHIP_H = 104
  const LEFT_X = 10
  const RIGHT_X = SVG_W - NODE_W - 10
  const MID_L = 210
  const MID_R = SVG_W - 210

  const pathL = (cy) =>
    `M ${LEFT_X + NODE_W} ${cy + NODE_H / 2} H ${MID_L} V ${CY} H ${CX - CHIP_W / 2}`
  const pathR = (cy) =>
    `M ${RIGHT_X} ${cy + NODE_H / 2} H ${MID_R} V ${CY} H ${CX + CHIP_W / 2}`

  const delays = [0, 0.7, 1.4, 2.1]

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', position: 'relative' }}>
      <style>{`
        @keyframes nca-pulse {
          0%   { stroke-dashoffset: 320; opacity: 0; }
          6%   { opacity: 1; }
          70%  { opacity: 0.9; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @keyframes nca-particle {
          0%   { offset-distance: 0%;   opacity: 0; }
          5%   { opacity: 1; }
          90%  { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @keyframes nca-chip-glow {
          0%, 100% { filter: drop-shadow(0 0 12px rgba(234,97,19,0.7)) drop-shadow(0 0 32px rgba(234,97,19,0.35)); }
          50%       { filter: drop-shadow(0 0 24px rgba(234,97,19,1))   drop-shadow(0 0 60px rgba(234,97,19,0.55)); }
        }
        @keyframes nca-ring-spin {
          from { transform: rotate(0deg);   transform-origin: ${SVG_W/2}px ${SVG_H/2}px; }
          to   { transform: rotate(360deg); transform-origin: ${SVG_W/2}px ${SVG_H/2}px; }
        }
        @keyframes nca-ring-spin-rev {
          from { transform: rotate(0deg);    transform-origin: ${SVG_W/2}px ${SVG_H/2}px; }
          to   { transform: rotate(-360deg); transform-origin: ${SVG_W/2}px ${SVG_H/2}px; }
        }
        @keyframes nca-scan {
          0%   { transform: translateY(-${CHIP_H/2}px); opacity: 0; }
          10%  { opacity: 0.6; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(${CHIP_H/2}px);  opacity: 0; }
        }
        @keyframes nca-node-in {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes nca-node-in-r {
          from { opacity: 0; transform: translateX(18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes nca-dot-blink {
          0%, 100% { opacity: 0.3; r: 3; }
          50%       { opacity: 1;   r: 4.5; }
        }
        @keyframes nca-pin-blink {
          0%, 100% { opacity: 0.2; }
          50%       { opacity: 1; }
        }
        @keyframes nca-orbit-dash {
          to { stroke-dashoffset: -80; }
        }
        @keyframes nca-node-pulse {
          0%, 100% { opacity: 0.82; }
          50%       { opacity: 1; }
        }
      `}</style>

      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        width="100%"
        style={{ overflow: 'visible', display: 'block' }}
      >
        <defs>
          <linearGradient id="nca-chip-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2a1f42" />
            <stop offset="100%" stopColor="#0f0c1c" />
          </linearGradient>
          <linearGradient id="nca-chip-border" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.9" />
          </linearGradient>
          <filter id="nca-glow-sm">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="nca-glow-md">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Clip for scan line inside chip */}
          <clipPath id="nca-chip-clip">
            <rect x={CX - CHIP_W/2 + 2} y={CY - CHIP_H/2 + 2} width={CHIP_W - 4} height={CHIP_H - 4} rx={14} />
          </clipPath>
        </defs>

        {/* ── Background grid dots (subtle) ── */}
        {Array.from({ length: 7 }, (_, row) =>
          Array.from({ length: 15 }, (_, col) => (
            <circle key={`grid-${row}-${col}`}
              cx={col * 60 + 10} cy={row * 70 + 20}
              r="1" fill="rgba(255,255,255,0.04)" />
          ))
        )}

        {/* ── Static dim circuit tracks ── */}
        {leftNodes.map(n => (
          <path key={`track-l-${n.id}`} d={pathL(n.cy)}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {rightNodes.map(n => (
          <path key={`track-r-${n.id}`} d={pathR(n.cy)}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {/* ── Colored glow tracks (dim) ── */}
        {leftNodes.map(n => (
          <path key={`glow-l-${n.id}`} d={pathL(n.cy)}
            fill="none" stroke={n.dot} strokeWidth="1" strokeOpacity="0.12"
            strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {rightNodes.map(n => (
          <path key={`glow-r-${n.id}`} d={pathR(n.cy)}
            fill="none" stroke={n.dot} strokeWidth="1" strokeOpacity="0.12"
            strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {/* ── Animated pulse lines (left → chip) ── */}
        {leftNodes.map((n, i) => (
          <path key={`pulse-l-${n.id}`} d={pathL(n.cy)}
            fill="none" stroke={n.dot} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="55 320" strokeDashoffset="320"
            filter={`url(#nca-glow-sm)`}
            style={{
              animation: `nca-pulse 3s cubic-bezier(0.4,0,0.2,1) ${delays[i]}s infinite`,
            }} />
        ))}

        {/* ── Animated pulse lines (chip → right) ── */}
        {rightNodes.map((n, i) => (
          <path key={`pulse-r-${n.id}`} d={pathR(n.cy)}
            fill="none" stroke={n.dot} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="55 320" strokeDashoffset="320"
            filter={`url(#nca-glow-sm)`}
            style={{
              animation: `nca-pulse 3s cubic-bezier(0.4,0,0.2,1) ${delays[i] + 0.35}s infinite`,
            }} />
        ))}

        {/* ── Outer spinning dashed ring ── */}
        <ellipse
          cx={CX} cy={CY}
          rx={CHIP_W / 2 + 22} ry={CHIP_H / 2 + 22}
          fill="none" stroke="rgba(234,97,19,0.18)" strokeWidth="1"
          strokeDasharray="8 6"
          style={{ animation: 'nca-ring-spin 12s linear infinite' }} />

        {/* ── Inner spinning dashed ring (reverse) ── */}
        <ellipse
          cx={CX} cy={CY}
          rx={CHIP_W / 2 + 14} ry={CHIP_H / 2 + 14}
          fill="none" stroke="rgba(251,191,36,0.12)" strokeWidth="1"
          strokeDasharray="4 8"
          style={{ animation: 'nca-ring-spin-rev 8s linear infinite' }} />

        {/* ── Chip connector pins ── */}
        {[-28, -10, 10, 28].map((offset, i) => (
          <g key={`pins-${i}`}>
            <line
              x1={CX + offset} y1={CY + CHIP_H / 2}
              x2={CX + offset} y2={CY + CHIP_H / 2 + 20}
              stroke="#EA6113" strokeWidth="2" strokeLinecap="round"
              style={{ animation: `nca-pin-blink 1.8s ease-in-out ${i * 0.25}s infinite`,
                filter: 'drop-shadow(0 0 4px #EA6113)' }} />
            <line
              x1={CX + offset} y1={CY - CHIP_H / 2}
              x2={CX + offset} y2={CY - CHIP_H / 2 - 20}
              stroke="rgba(234,97,19,0.4)" strokeWidth="1.5" strokeLinecap="round"
              style={{ animation: `nca-pin-blink 2.2s ease-in-out ${i * 0.2}s infinite` }} />
          </g>
        ))}

        {/* ── Center AI Chip ── */}
        <g style={{ animation: 'nca-chip-glow 2.6s ease-in-out infinite' }}>
          {/* Chip shadow/glow base */}
          <rect
            x={CX - CHIP_W / 2 - 4} y={CY - CHIP_H / 2 - 4}
            width={CHIP_W + 8} height={CHIP_H + 8} rx={20}
            fill="rgba(234,97,19,0.08)" />

          {/* Chip body */}
          <rect
            x={CX - CHIP_W / 2} y={CY - CHIP_H / 2}
            width={CHIP_W} height={CHIP_H} rx={16}
            fill="url(#nca-chip-grad)"
            stroke="url(#nca-chip-border)" strokeWidth="1.5" />

          {/* Inner inset border */}
          <rect
            x={CX - CHIP_W / 2 + 7} y={CY - CHIP_H / 2 + 7}
            width={CHIP_W - 14} height={CHIP_H - 14} rx={10}
            fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />

          {/* Scan line animation */}
          <g clipPath="url(#nca-chip-clip)">
            <line
              x1={CX - CHIP_W / 2 + 2} y1={CY}
              x2={CX + CHIP_W / 2 - 2} y2={CY}
              stroke="rgba(251,191,36,0.35)" strokeWidth="1.5"
              style={{ animation: 'nca-scan 2.4s ease-in-out infinite' }} />
          </g>

          {/* Corner circuit marks */}
          {[[-1,-1],[1,-1],[1,1],[-1,1]].map(([sx, sy], i) => (
            <g key={`corner-${i}`}>
              <line
                x1={CX + sx * (CHIP_W/2 - 9)} y1={CY + sy * (CHIP_H/2 - 9)}
                x2={CX + sx * (CHIP_W/2 - 9)} y2={CY + sy * (CHIP_H/2 - 22)}
                stroke="rgba(234,97,19,0.5)" strokeWidth="2" strokeLinecap="round" />
              <line
                x1={CX + sx * (CHIP_W/2 - 9)} y1={CY + sy * (CHIP_H/2 - 9)}
                x2={CX + sx * (CHIP_W/2 - 22)} y2={CY + sy * (CHIP_H/2 - 9)}
                stroke="rgba(234,97,19,0.5)" strokeWidth="2" strokeLinecap="round" />
            </g>
          ))}

          {/* AI text */}
          <text x={CX} y={CY + 4}
            textAnchor="middle" fill="white" fontSize="26" fontWeight="900"
            fontFamily="Inter, system-ui, sans-serif"
            style={{ letterSpacing: '-0.04em' }}>
            AI
          </text>
          {/* NOMADS label */}
          <text x={CX} y={CY + 22}
            textAnchor="middle" fill="rgba(234,97,19,0.85)" fontSize="7.5" fontWeight="700"
            fontFamily="monospace" style={{ letterSpacing: '0.22em' }}>
            NOMADS
          </text>
        </g>

        {/* ── Left node cards ── */}
        {leftNodes.map((n, i) => (
          <g key={`node-l-${n.id}`}
            style={{
              animation: `nca-node-in 0.6s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.12}s both, nca-node-pulse 3.5s ease-in-out ${i * 0.5}s infinite`,
            }}>
            {/* Card shadow */}
            <rect x={LEFT_X + 2} y={n.cy + 3} width={NODE_W} height={NODE_H} rx={NODE_RX}
              fill={n.color} opacity="0.08" />
            {/* Card bg */}
            <rect x={LEFT_X} y={n.cy} width={NODE_W} height={NODE_H} rx={NODE_RX}
              fill="rgba(12,10,24,0.95)"
              stroke={n.color} strokeWidth="1" strokeOpacity="0.45" />
            {/* Left accent bar */}
            <rect x={LEFT_X} y={n.cy + 2} width={3.5} height={NODE_H - 4} rx={2}
              fill={n.color} opacity="0.9"
              style={{ filter: `drop-shadow(0 0 4px ${n.color})` }} />
            {/* Tag badge */}
            <rect x={LEFT_X + 10} y={n.cy + 6} width={28} height={12} rx={3}
              fill={n.color} opacity="0.18" />
            <text x={LEFT_X + 24} y={n.cy + 15.5}
              textAnchor="middle" fill={n.dot} fontSize="6.5" fontWeight="700"
              fontFamily="monospace" style={{ letterSpacing: '0.08em' }}>
              {n.tag}
            </text>
            {/* Label */}
            <text x={LEFT_X + 44} y={n.cy + NODE_H / 2 + 4.5}
              fill="rgba(255,255,255,0.88)" fontSize="11.5" fontWeight="600"
              fontFamily="Inter, system-ui, sans-serif">
              {n.label}
            </text>
            {/* Output connector dot */}
            <circle cx={LEFT_X + NODE_W} cy={n.cy + NODE_H / 2} r="5"
              fill={n.dot}
              filter="url(#nca-glow-sm)"
              style={{ animation: `nca-dot-blink 2s ease-in-out ${i * 0.3}s infinite` }} />
            {/* Connector ring */}
            <circle cx={LEFT_X + NODE_W} cy={n.cy + NODE_H / 2} r="8"
              fill="none" stroke={n.dot} strokeWidth="1" strokeOpacity="0.25" />
          </g>
        ))}

        {/* ── Right node cards ── */}
        {rightNodes.map((n, i) => (
          <g key={`node-r-${n.id}`}
            style={{
              animation: `nca-node-in-r 0.6s cubic-bezier(0.16,1,0.3,1) ${0.15 + i * 0.12}s both, nca-node-pulse 3.5s ease-in-out ${i * 0.5 + 0.25}s infinite`,
            }}>
            {/* Card shadow */}
            <rect x={RIGHT_X + 2} y={n.cy + 3} width={NODE_W} height={NODE_H} rx={NODE_RX}
              fill={n.color} opacity="0.08" />
            {/* Card bg */}
            <rect x={RIGHT_X} y={n.cy} width={NODE_W} height={NODE_H} rx={NODE_RX}
              fill="rgba(12,10,24,0.95)"
              stroke={n.color} strokeWidth="1" strokeOpacity="0.45" />
            {/* Right accent bar */}
            <rect x={RIGHT_X + NODE_W - 3.5} y={n.cy + 2} width={3.5} height={NODE_H - 4} rx={2}
              fill={n.color} opacity="0.9"
              style={{ filter: `drop-shadow(0 0 4px ${n.color})` }} />
            {/* Input connector dot */}
            <circle cx={RIGHT_X} cy={n.cy + NODE_H / 2} r="5"
              fill={n.dot}
              filter="url(#nca-glow-sm)"
              style={{ animation: `nca-dot-blink 2s ease-in-out ${i * 0.3 + 0.15}s infinite` }} />
            {/* Connector ring */}
            <circle cx={RIGHT_X} cy={n.cy + NODE_H / 2} r="8"
              fill="none" stroke={n.dot} strokeWidth="1" strokeOpacity="0.25" />
            {/* Label */}
            <text x={RIGHT_X + 14} y={n.cy + NODE_H / 2 + 4.5}
              fill="rgba(255,255,255,0.88)" fontSize="11.5" fontWeight="600"
              fontFamily="Inter, system-ui, sans-serif">
              {n.label}
            </text>
            {/* Tag badge */}
            <rect x={RIGHT_X + NODE_W - 38} y={n.cy + 6} width={28} height={12} rx={3}
              fill={n.color} opacity="0.18" />
            <text x={RIGHT_X + NODE_W - 24} y={n.cy + 15.5}
              textAnchor="middle" fill={n.dot} fontSize="6.5" fontWeight="700"
              fontFamily="monospace" style={{ letterSpacing: '0.08em' }}>
              {n.tag}
            </text>
          </g>
        ))}

        {/* ── Floating data particles on paths ── */}
        {leftNodes.map((n, i) => (
          <circle key={`particle-l-${n.id}`} r="3.5"
            fill={n.dot}
            filter="url(#nca-glow-md)"
            style={{
              offsetPath: `path("${pathL(n.cy)}")`,
              animation: `nca-particle 3s ease-in-out ${delays[i] + 0.1}s infinite`,
            }} />
        ))}
        {rightNodes.map((n, i) => (
          <circle key={`particle-r-${n.id}`} r="3.5"
            fill={n.dot}
            filter="url(#nca-glow-md)"
            style={{
              offsetPath: `path("${pathR(n.cy)}")`,
              animation: `nca-particle 3s ease-in-out ${delays[i] + 0.45}s infinite`,
            }} />
        ))}
      </svg>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   1. NAVBAR
══════════════════════════════════════════════════════════════════════════ */
function Navbar({ onEnter }) {
  return (
    <div className="sticky top-0 z-50 w-full flex justify-center px-4 pt-4">
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl"
      >
        <nav className={`${glass} rounded-2xl px-5 py-3 flex items-center justify-between shadow-[0_8px_40px_rgba(0,0,0,0.5)]`}>
          {/* Logo */}
          <span className="text-white font-black text-sm tracking-[0.22em] select-none">NOMADS</span>

          {/* Links */}
          <div className="hidden md:flex items-center gap-7">
            {['Canvas', 'Nodes', 'Templates', 'Pricing'].map(l => (
              <a key={l} href="#"
                className="text-white/50 hover:text-white text-sm font-medium transition-colors duration-200">
                {l}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="text-white/50 hover:text-white text-sm font-medium transition-colors duration-200 hidden sm:block">
              Login
            </button>
            <MagneticBtn onClick={onEnter}
              className={`${orangeGrad} text-xs px-4 py-2 rounded-xl`}>
              Bắt đầu miễn phí
            </MagneticBtn>
          </div>
        </nav>
      </motion.header>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   2. HERO — line-by-line clip-path reveal
══════════════════════════════════════════════════════════════════════════ */
function Hero({ onEnter }) {
  const lines = [
    { text: 'NOMADS: Automate any', gradient: false },
    { text: 'office task', gradient: true },
    { text: 'with just a few drags', gradient: false },
    { text: 'and drops.', gradient: false },
  ]

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-8 pb-20 px-5 text-center overflow-hidden">
      {/* Spotlight */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 mb-6">
          <span className={`${glass} text-xs text-white/60 font-medium px-4 py-1.5 rounded-full`}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 mr-2"
              style={{ boxShadow: '0 0 6px #F59E0B' }} />
            Visual Workflow Automation
          </span>
        </motion.div>

        {/* Headline — line-by-line reveal */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight mb-6">
          {lines.map((line, i) => {
            const delays = [0.1, 0.18, 0.26, 0.34]
            return (
              <div key={i} style={{ overflow: 'hidden', display: 'block' }}>
                <motion.span
                  style={{ display: 'inline-block' }}
                  initial={{ y: '110%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.7, delay: delays[i], ease: [0.16, 1, 0.3, 1] }}
                  className={line.gradient
                    ? 'bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 bg-clip-text text-transparent'
                    : 'text-white'
                  }
                >
                  {line.text}
                </motion.span>
              </div>
            )
          })}
        </h1>

        {/* Sub-headline */}
        <div style={{ overflow: 'hidden' }}>
          <motion.p
            style={{ display: 'block' }}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.65, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/50 text-lg md:text-xl mb-10 font-medium">
            A fully no-code experience
          </motion.p>
        </div>

        {/* AI Node Circuit Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mb-10">
          <NodeCircuitAnimation />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={onEnter}
            className={`${glass} hover:border-white/20 transition-all duration-300 text-white font-semibold text-sm px-8 py-3.5 rounded-full`}>
            Open Free Canvas
          </button>
          <MagneticBtn
            className={`${orangeGrad} flex items-center justify-center gap-2 text-sm px-8 py-3.5 rounded-full`}>
            <Play size={14} className="fill-current" />
            Watch Product Tour
          </MagneticBtn>
        </motion.div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   3. CORE COMPONENTS — GSAP ScrollTrigger stagger + center-glow scrub
══════════════════════════════════════════════════════════════════════════ */
const coreCards = [
  {
    icon: <Layers size={26} className="text-amber-400" />,
    title: 'Visual Canvas',
    desc: 'Drag, connect, and configure nodes on an infinite canvas. Build complex workflows without writing a single line of code.',
    glow: 'rgba(245,158,11,0.15)',
    glowBright: 'rgba(245,158,11,0.35)',
    border: 'rgba(245,158,11,0.25)',
    shadow: '0 0 60px rgba(245,158,11,0.25)',
  },
  {
    icon: <Cpu size={26} className="text-purple-400" />,
    title: 'AI & Office Node Library',
    desc: 'Access 100+ pre-built nodes for AI models, email, spreadsheets, databases, and every tool your office relies on.',
    glow: 'rgba(168,85,247,0.15)',
    glowBright: 'rgba(168,85,247,0.35)',
    border: 'rgba(168,85,247,0.25)',
    shadow: '0 0 60px rgba(168,85,247,0.25)',
  },
  {
    icon: <Users size={26} className="text-sky-400" />,
    title: 'Real-time Collaboration',
    desc: 'Invite your team to build and edit workflows together in real time. Share, comment, and ship faster as a unit.',
    glow: 'rgba(56,189,248,0.15)',
    glowBright: 'rgba(56,189,248,0.35)',
    border: 'rgba(56,189,248,0.25)',
    shadow: '0 0 60px rgba(56,189,248,0.25)',
  },
]

function CoreComponents() {
  return (
    <section className="relative z-10 py-24 px-5">
      <div className="max-w-6xl mx-auto">

        <FadeUp className="text-center mb-14">
          <p className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Core Components</p>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
            Everything you need to automate
          </h2>
          <p className="text-white/40 text-base max-w-md mx-auto">
            Three pillars that power every workflow you build on NOMADS.
          </p>
        </FadeUp>

        <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {coreCards.map((c) => (
            <motion.div
              key={c.title}
              variants={cardVariant}
              className="h-full rounded-2xl p-7 cursor-default transition-colors duration-300"
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.09)',
                boxShadow: `0 0 40px ${c.glow}`,
              }}
              whileHover={{
                borderColor: c.border,
                boxShadow: `0 0 70px ${c.glowBright}`,
                transition: { duration: 0.25 },
              }}
            >
              <div className="mb-5 w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: c.glow, border: '1px solid rgba(255,255,255,0.08)' }}>
                {c.icon}
              </div>
              <h3 className="text-white font-bold text-lg mb-3">{c.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   4. NODE LIBRARY — GSAP ScrollTrigger stagger
══════════════════════════════════════════════════════════════════════════ */
const nodeLibrary = [
  { icon: <Cpu size={20} />,       color: 'text-purple-400', bg: 'rgba(168,85,247,0.15)',  title: 'AI Nodes',        sub: 'GPT, Claude, Gemini & more' },
  { icon: <Layers size={20} />,    color: 'text-amber-400',  bg: 'rgba(245,158,11,0.15)',  title: 'Office Tools',    sub: 'Email, Sheets, Docs, Calendar' },
  { icon: <Database size={20} />,  color: 'text-sky-400',    bg: 'rgba(56,189,248,0.15)',  title: 'Data Processing', sub: 'Transform, filter, aggregate' },
  { icon: <GitBranch size={20} />, color: 'text-green-400',  bg: 'rgba(74,222,128,0.15)',  title: 'Logic Control',   sub: 'If/else, loops, conditions' },
  { icon: <Wrench size={20} />,    color: 'text-rose-400',   bg: 'rgba(251,113,133,0.15)', title: 'Utility Nodes',   sub: 'Timers, webhooks, formatters' },
]

function NodeLibrary() {
  return (
    <section className="relative z-10 py-20 px-5">
      <div className="max-w-6xl mx-auto">

        <FadeUp className="text-center mb-12">
          <p className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Node Library</p>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
            Diverse Node Library
          </h2>
          <p className="text-white/40 text-base max-w-md mx-auto">
            Pick from a growing catalog of nodes — connect anything to everything.
          </p>
        </FadeUp>

        <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {nodeLibrary.map((n) => (
            <motion.div
              key={n.title}
              variants={cardVariant}
              className="rounded-2xl p-5 flex flex-col items-center text-center cursor-default"
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              whileHover={{
                background: 'rgba(255,255,255,0.07)',
                borderColor: 'rgba(255,255,255,0.18)',
                transition: { duration: 0.2 },
              }}
            >
              <div className={`${n.color} w-11 h-11 rounded-xl flex items-center justify-center mb-4`}
                style={{ background: n.bg, border: '1px solid rgba(255,255,255,0.08)' }}>
                {n.icon}
              </div>
              <p className="text-white font-semibold text-sm mb-1">{n.title}</p>
              <p className="text-white/35 text-xs leading-snug">{n.sub}</p>
            </motion.div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   5. DASHBOARD MOCKUP
══════════════════════════════════════════════════════════════════════════ */
function DashboardMockup() {
  return (
    <section className="relative z-10 py-20 px-5">
      <div className="max-w-6xl mx-auto">

        <FadeUp className="text-center mb-12">
          <p className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Visual Workspace</p>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
            Library of Infinite Possibilities
          </h2>
          <p className="text-white/40 text-base max-w-lg mx-auto">
            A node-based editor with an infinite canvas. Connect any service, trigger any action, and build workflows that run on autopilot.
          </p>
        </FadeUp>

        <FadeUp delay={0.15}>
          <div className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(10,10,18,0.80)',
              backdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}>

            {/* Titlebar */}
            <div className="flex items-center gap-2 px-5 py-3.5"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(248,113,113,0.7)' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(251,191,36,0.7)' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(74,222,128,0.7)' }} />
              <span className="ml-3 text-white/25 text-xs font-mono tracking-wider">nomads — workflow editor</span>
            </div>

            <div className="flex flex-col lg:flex-row min-h-[340px]">

              {/* LEFT — Canvas */}
              <div className="flex-1 p-8 relative overflow-hidden"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }}>
                <p className="text-white/25 text-xs font-mono tracking-widest uppercase mb-8 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#F59E0B', boxShadow: '0 0 6px #F59E0B' }} />
                  Canvas
                </p>

                <div className="flex flex-col gap-5">
                  <div className="flex items-center flex-wrap gap-2">
                    <MockNode label="Email Trigger" status="completed" />
                    <MockConnector />
                    <MockNode label="AI Processor" status="running" />
                    <MockConnector />
                    <MockNode label="Send Reply" status="running" />
                  </div>
                  <div className="flex items-center flex-wrap gap-2 ml-8">
                    <MockNode label="Filter Rules" status="completed" />
                    <MockConnector />
                    <MockNode label="Spreadsheet" status="error" />
                  </div>
                  <div className="flex items-center flex-wrap gap-2">
                    <MockNode label="Schedule" status="completed" />
                    <MockConnector />
                    <MockNode label="HTTP Request" status="completed" />
                    <MockConnector />
                    <MockNode label="Transform" status="running" />
                  </div>
                </div>

                {/* Sidebar hint */}
                <div className="absolute right-4 top-8 hidden xl:flex flex-col gap-2">
                  {['Trigger', 'AI Model', 'Email', 'Logic', 'Output'].map(n => (
                    <div key={n} className="text-white/30 text-[10px] px-3 py-1.5 rounded-lg font-mono"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      {n}
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="hidden lg:block w-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
              <div className="lg:hidden h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

              {/* RIGHT — Monitoring */}
              <div className="w-full lg:w-72 p-8 flex flex-col gap-7">
                <p className="text-white/25 text-xs font-mono tracking-widest uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full"
                    style={{ background: '#a855f7', boxShadow: '0 0 6px #a855f7' }} />
                  Monitoring
                </p>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Runs today',   value: '247',   color: '#F59E0B' },
                    { label: 'Success rate', value: '98.2%', color: '#4ade80' },
                    { label: 'Avg. time',    value: '1.4s',  color: '#60a5fa' },
                    { label: 'Active flows', value: '12',    color: '#a855f7' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-3"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <p className="font-bold text-lg leading-none mb-1" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-white/30 text-[10px]">{s.label}</p>
                    </div>
                  ))}
                </div>

                <CircleProgress />
                <MiniBarChart />
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   6. BOTTOM CTA
══════════════════════════════════════════════════════════════════════════ */
function BottomCTA({ onEnter }) {
  return (
    <section className="relative z-10 py-32 px-5 text-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full pointer-events-none"
        style={{ background: 'rgba(109,40,217,0.20)', filter: 'blur(100px)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] rounded-full pointer-events-none"
        style={{ background: 'rgba(234,97,19,0.10)', filter: 'blur(80px)' }} />

      <FadeUp className="relative z-10 max-w-2xl mx-auto">
        <div className="rounded-3xl p-12 md:p-16"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-5 leading-tight">
            Build your first{' '}
            <span className="bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent">
              workflow.
            </span>
          </h2>
          <p className="text-white/45 text-base mb-10 max-w-sm mx-auto leading-relaxed">
            Start automating in minutes. No credit card required. Free forever on the starter plan.
          </p>
          <MagneticBtn onClick={onEnter}
            className={`${orangeGrad} inline-flex items-center gap-2 text-sm font-bold px-10 py-4 rounded-full`}>
            Get Started for Free
            <ArrowRight size={16} />
          </MagneticBtn>
        </div>
      </FadeUp>
    </section>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   ROOT EXPORT
══════════════════════════════════════════════════════════════════════════ */
// eslint-disable-next-line no-unused-vars
export default function LandingPage({ onEnter, onNavigateToDocs }) {
  return (
    <div className="relative min-h-screen"
      style={{ fontFamily: "'Inter', 'Sora', system-ui, sans-serif" }}>

      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        ::selection { background: rgba(245,158,11,0.35); color: #fff; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.5); border-radius: 2px; }
      `}</style>

      <Navbar onEnter={onEnter} />
      <Hero onEnter={onEnter} />
      <CoreComponents />
      <NodeLibrary />
      <DashboardMockup />
      <BottomCTA onEnter={onEnter} />

      <div className="h-20" />
    </div>
  )
}
