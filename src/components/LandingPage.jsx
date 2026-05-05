import { useState, useRef, useEffect } from 'react'
import { motion, useInView, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'

// Magnetic Button Component
function MagneticButton({ children, onClick, style = {} }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springConfig = { damping: 20, stiffness: 300 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY
    
    // Magnetic effect within 100px radius
    const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)
    if (distance < 100) {
      x.set(distanceX * 0.3)
      y.set(distanceY * 0.3)
    }
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ 
        ...style,
        x: springX,
        y: springY,
        position: 'relative'
      }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
    >
      {/* Ripple effect on click */}
      <motion.span
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none'
        }}
      />
      {children}
    </motion.button>
  )
}

// Cursor Follower Component - Decorative
function CursorFollower() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  
  const cursorX = useSpring(mousePosition.x, { damping: 30, stiffness: 200 })
  const cursorY = useSpring(mousePosition.y, { damping: 30, stiffness: 200 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  if (!isVisible) return null

  return (
    <>
      {/* Glow effect following cursor */}
      <motion.div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          x: cursorX,
          y: cursorY,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234,97,19,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 9999,
          translateX: '-50%',
          translateY: '-50%',
          filter: 'blur(40px)'
        }}
        transition={{ type: 'spring', damping: 50, stiffness: 300 }}
      />
    </>
  )
}

// Animated Counter Component
function AnimatedCounter({ value, suffix = '' }) {
  const [count, setCount] = useState(value)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    
    const isNumber = !isNaN(parseInt(value))
    if (!isNumber) return
    
    const target = parseInt(value)
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [inView, value])

  return <span ref={ref}>{count}{suffix}</span>
}

// Workflow Animation Component - Modern Premium Design with Design System
function WorkflowAnimation() {
  const nodes = [
    { id: 1, x: 60, y: 180, label: 'Input', icon: '→', size: 56 },
    { id: 2, x: 220, y: 100, label: 'Process', icon: '◇', size: 64 },
    { 
      id: 3, 
      x: 380, 
      y: 40, 
      label: 'AI', 
      icon: (
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.6"/>
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M12 4V8M12 16V20M4 12H8M16 12H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
        </svg>
      ), 
      size: 80, 
      primary: true 
    },
    { id: 4, x: 540, y: 100, label: 'Transform', icon: '◇', size: 64 },
    { id: 5, x: 700, y: 180, label: 'Output', icon: '✓', size: 56 }
  ]

  const connections = [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 4, to: 5 }
  ]

  const getNodeCenter = (id) => {
    const node = nodes.find(n => n.id === id)
    return { x: node.x + node.size / 2, y: node.y + node.size / 2 }
  }

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%', 
      minHeight: '400px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      
      {/* Subtle background gradient using design system */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'radial-gradient(ellipse 50% 40% at 50% 40%, var(--accent-glow) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          {/* Clean gradient for lines using design system */}
          <linearGradient id="lineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--action-core)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--action-core)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--action-core)" stopOpacity="0" />
          </linearGradient>

          {/* Soft glow filter */}
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Connections */}
        {connections.map((conn, i) => {
          const from = getNodeCenter(conn.from)
          const to = getNodeCenter(conn.to)
          
          return (
            <g key={i}>
              {/* Base line */}
              <motion.line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(246,219,192,0.08)"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
              />
              
              {/* Animated light pulse */}
              <motion.line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="url(#lineGlow)"
                strokeWidth="2"
                strokeLinecap="round"
                filter="url(#softGlow)"
                strokeDasharray="50 250"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -300 }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: i * 0.4
                }}
              />
            </g>
          )
        })}
      </svg>

      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: i * 0.1,
            ease: [0.16, 1, 0.3, 1]
          }}
          style={{
            position: 'absolute',
            left: node.x,
            top: node.y,
            width: `${node.size}px`,
            height: `${node.size}px`
          }}
        >
          {/* Hover glow effect using design system */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'absolute',
              inset: -8,
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
              filter: 'blur(12px)',
              pointerEvents: 'none'
            }}
          />

          {/* Main node container */}
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={node.primary ? 'interactive-glow' : ''}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: node.primary 
                ? 'linear-gradient(135deg, rgba(234,97,19,0.12) 0%, rgba(251,185,49,0.08) 100%)'
                : 'rgba(102, 37, 73, 0.08)',
              border: node.primary 
                ? '1.5px solid rgba(234,97,19,0.4)'
                : '1px solid rgba(246,219,192,0.1)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
              boxShadow: node.primary
                ? '0 8px 32px var(--accent-glow), inset 0 1px 0 rgba(246,219,192,0.1)'
                : '0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(246,219,192,0.05)'
            }}
          >
            {/* Icon */}
            <motion.div
              animate={node.primary ? { 
                rotate: [0, 90, 180, 270, 360],
                scale: [1, 1.05, 1, 1.05, 1]
              } : {}}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              style={{
                fontSize: node.primary ? '28px' : '20px',
                color: node.primary ? 'var(--action-core)' : 'var(--text-highlight)',
                fontWeight: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: node.primary ? 1 : 0.6
              }}
            >
              {node.icon}
            </motion.div>

            {/* Subtle rotating border for primary node */}
            {node.primary && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                style={{
                  position: 'absolute',
                  inset: -1,
                  borderRadius: '50%',
                  background: 'conic-gradient(from 0deg, transparent 0%, rgba(234,97,19,0.4) 10%, transparent 20%)',
                  pointerEvents: 'none'
                }}
              />
            )}

            {/* Pulse effect */}
            <motion.div
              animate={{ 
                scale: [1, 1.8],
                opacity: [0.4, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 0.3
              }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: node.primary 
                  ? '1px solid var(--action-core)'
                  : '1px solid rgba(246,219,192,0.2)',
                pointerEvents: 'none'
              }}
            />
          </motion.div>

          {/* Label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 + 0.4 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '10px',
              fontSize: '11px',
              fontWeight: 'var(--font-header)',
              color: node.primary ? 'var(--action-core)' : 'var(--text-highlight)',
              fontFamily: "'Inter', system-ui, sans-serif",
              textAlign: 'center',
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
              opacity: node.primary ? 0.8 : 0.4
            }}
          >
            {node.label}
          </motion.div>
        </motion.div>
      ))}

      {/* Floating particles - minimal and elegant */}
      {[...Array(8)].map((_, i) => {
        // Pre-calculate random values outside of render
        const randomX = (i * 0.3 - 0.5) * 100;
        const randomY = (i * 0.4 - 0.5) * 100;
        const randomDuration = 5 + (i % 3);
        const randomLeft = 30 + (i * 5) % 40;
        const randomTop = 30 + (i * 7) % 40;
        
        return (
          <motion.div
            key={`particle-${i}`}
            animate={{
              x: [0, randomX],
              y: [0, randomY],
              opacity: [0, 0.4, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: randomDuration,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              left: `${randomLeft}%`,
              top: `${randomTop}%`,
              width: '2px',
              height: '2px',
              borderRadius: '50%',
              background: 'var(--action-core)',
              pointerEvents: 'none'
            }}
          />
        );
      })}
    </div>
  )
}

const pillars = [
  {
    id: 'visual',
    title: 'VISUAL ORCHESTRATION',
    sub: 'Canvas · Node-based · No-code',
    color: '#F39F5A',
    border: 'rgba(243,159,90,0.3)',
    glow: 'rgba(243,159,90,0.45)',
    meta: [['Interface', 'Drag & Drop'], ['Complexity', 'Zero Code'], ['Learning', '5 Minutes'], ['Design', 'Visual Flow']],
    icon: <svg className="living-icon" width="36" height="36" viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="18" y="4" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><rect x="11" y="18" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M9 14v2M23 14v2M16 14v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    desc: 'Chuyển đổi các logic lập trình và kiến trúc API phức tạp thành một không gian đồ họa trực quan. Điều này cho phép nhà quản trị "nhìn thấy" và trực tiếp thiết kế dòng chảy công việc thông qua các node chức năng mà không cần am hiểu về mã nguồn.'
  },
  {
    id: 'agentic',
    title: 'AGENTIC WORKFLOW',
    sub: 'GPT-4 · Gemini · Llama 3',
    color: '#AE445A',
    border: 'rgba(174,68,90,0.3)',
    glow: 'rgba(174,68,90,0.45)',
    meta: [['Models', 'Multi-AI'], ['Execution', 'Auto-chain'], ['Intelligence', 'Adaptive'], ['Scale', 'Enterprise']],
    icon: <svg className="living-icon" width="36" height="36" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="24" r="4" stroke="currentColor" strokeWidth="1.5"/><circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M14 11l-4 10M18 11l4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
    desc: 'Hệ thống lõi cho phép các AI Agent (như GPT-4, Gemini, Llama 3) và các công cụ tự động hóa phối hợp nhịp nhàng trong một chuỗi xử lý đa tầng. Nền tảng không chỉ thực hiện tác vụ rời rạc mà tạo ra một hệ sinh thái các "đặc vụ" tự vận hành theo mục tiêu của doanh nghiệp.'
  },
  {
    id: 'blueprints',
    title: 'OPERATIONAL BLUEPRINTS',
    sub: 'Marketing · Legal · Finance',
    color: '#935073',
    border: 'rgba(147,80,115,0.3)',
    glow: 'rgba(147,80,115,0.45)',
    meta: [['Templates', '100+ Ready'], ['Expertise', 'Industry-proven'], ['Deploy', 'Instant'], ['ROI', 'Immediate']],
    icon: <svg className="living-icon" width="36" height="36" viewBox="0 0 32 32" fill="none"><rect x="6" y="4" width="20" height="24" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 10h12M10 15h12M10 20h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="24" cy="8" r="2" fill="currentColor" opacity="0.7"/></svg>,
    desc: 'Sở hữu thư viện khung vận hành đã được chuẩn hóa và thẩm định bởi các chuyên gia đầu ngành. Đây là các "tài sản trí tuệ" dạng đóng gói, giúp doanh nghiệp ngay lập tức kích hoạt năng lực thực thi chuyên sâu trong các lĩnh vực Marketing, Pháp lý hay Tài chính mà không cần xây dựng lại từ đầu.'
  },
]

const stats = [
  { v: '0', l: 'Code Required' },
  { v: '5min', l: 'Setup Time' },
  { v: '100+', l: 'Blueprints' },
  { v: '3', l: 'AI Models' },
]

function FadeUp({ children, delay = 0, style = {} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }} style={style}>
      {children}
    </motion.div>
  )
}

function Pillar({ p, i }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div 
      ref={ref} 
      initial={{ opacity: 0, y: 30 }} 
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ 
        duration: 0.8, 
        delay: i * 0.2,
        ease: [0.16, 1, 0.3, 1] 
      }}
      style={{ 
        flex: 1, 
        minWidth: 0, 
        position: 'relative'
      }}
    >
      <div
        className="glass-surface"
        style={{ 
          position: 'relative', 
          zIndex: 2, 
          minHeight: '460px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: 'var(--space-lg) var(--space-md) var(--space-lg)', 
          borderRadius: '4px',
          border: `1px solid ${p.border}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}
      >
        {/* Icon */}
        <div 
          style={{ 
            color: 'rgba(255,255,255,0.35)', 
            marginBottom: '18px', 
            position: 'relative', 
            zIndex: 3
          }}
        >
          {p.icon}
        </div>

        <div 
          style={{ 
            fontFamily: 'monospace', 
            fontSize: '13px', 
            fontWeight: 'var(--font-hero)', 
            color: p.color, 
            marginBottom: 'var(--space-xs)', 
            zIndex: 3, 
            position: 'relative',
            letterSpacing: '0.3em'
          }}
        >
          {p.title}
        </div>
        
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-highlight)', opacity: 0.6, letterSpacing: '0.08em', marginBottom: 'var(--space-md)', zIndex: 3, position: 'relative', fontWeight: 'var(--font-header)' }}>{p.sub}</div>

        <div 
          style={{ 
            width: '100%', 
            height: '1px', 
            background: `linear-gradient(to right, transparent, ${p.border}, transparent)`, 
            marginBottom: 'var(--space-md)', 
            zIndex: 3, 
            position: 'relative',
            opacity: 0.3
          }} 
        />

        <div style={{ width: '100%', zIndex: 3, position: 'relative', marginBottom: 'var(--space-sm)' }}>
          {p.meta.map(([k, v], idx) => (
            <motion.div 
              key={k} 
              initial={{ opacity: 0, x: -10 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.2 + idx * 0.05 + 0.5 }}
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)', alignItems: 'center' }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-highlight)', opacity: 0.5, fontWeight: 'var(--font-header)' }}>{k}</span>
              <span 
                className="data-number"
                style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 'var(--font-header)', color: 'var(--text-primary)' }}
              >
                {v}
              </span>
            </motion.div>
          ))}
        </div>

        <p 
          style={{ 
            fontSize: '11px', 
            lineHeight: '1.6', 
            marginBottom: 'var(--space-sm)', 
            zIndex: 3, 
            position: 'relative',
            opacity: 0.7,
            fontWeight: 'var(--font-body)',
            color: 'var(--text-highlight)'
          }}
        >
          {p.desc}
        </p>

        {/* Online status */}
        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-sm)', width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', zIndex: 3, position: 'relative' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: p.color }} />
          <span style={{ fontFamily: 'monospace', fontSize: '10px', color: 'var(--text-highlight)', opacity: 0.5, letterSpacing: '0.2em', fontWeight: 'var(--font-header)' }}>ONLINE</span>
        </div>
      </div>
    </motion.div>
  )
}

export default function LandingPage({ onEnter, onNavigateToDocs }) {
  // Parallax scroll effect
  const { scrollY } = useScroll()
  
  // 1. LINEAR SCROLL JOURNEY - Background color transition
  const backgroundColor = useTransform(
    scrollY,
    [0, 500, 1000, 1500, 2000],
    ['#1D1A39', '#451952', '#662549', '#F39F5A', '#E8BCB9']
  )
  
  // 3. Z-AXIS PARALLAX DEPTH - Different layers move at different speeds
  const canvasY = useTransform(scrollY, [0, 1000], [0, -200]) // Layer 0: slowest (0.2x)
  const voiceY = useTransform(scrollY, [0, 1000], [0, -1000]) // Layer 1: normal (1x)
  const signageY = useTransform(scrollY, [0, 1000], [0, -1200]) // Layer 2: fastest (1.2x)
  
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  
  // 4. ORBITAL MOTION - 3D Celestial body
  const orbitalX = useTransform(scrollY, [0, 2000], ['-10%', '110%'])
  const orbitalY = useTransform(
    scrollY,
    [0, 500, 1000, 1500, 2000],
    ['80%', '40%', '20%', '30%', '60%']
  )
  const celestialColor = useTransform(
    scrollY,
    [0, 1000, 2000],
    ['#F8D299', '#EA6113', '#EA6113']
  )
  const celestialGlow = useTransform(
    scrollY,
    [0, 1000, 2000],
    ['0 0 40px rgba(248,210,153,0.6)', '0 0 80px rgba(234,97,19,0.8)', '0 0 100px rgba(234,97,19,1)']
  )
  
  // Mouse position for interactive effects
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <motion.div 
      style={{ 
        minHeight: '100vh', 
        width: '100%', 
        background: backgroundColor, // 1. LINEAR SCROLL JOURNEY
        fontFamily: "'Inter', system-ui, sans-serif", 
        overflowX: 'hidden',
        position: 'relative'
      }}
    >
      
      {/* Design System CSS Variables */}
      <style>{`
        :root {
          /* Color Palette - Journey from Deep Night to Dawn */
          --canvas-bg: #1D1A39;
          --surface-plum: #662549;
          --surface-midnight: #451952;
          --action-core: #EA6113;
          --action-secondary: #F88F22;
          --text-primary: #F8F4E9;
          --text-highlight: #F6DBC0;
          --accent-glow: rgba(234, 97, 19, 0.2);
          
          /* Typography System */
          --font-hero: 700;
          --font-header: 500;
          --font-body: 400;
          
          /* Elevation System */
          --z-canvas: 0;
          --z-voice: 10;
          --z-signage: 20;
          
          /* Spacing System */
          --space-xs: 8px;
          --space-sm: 16px;
          --space-md: 24px;
          --space-lg: 32px;
          --space-xl: 48px;
        }
        
        /* Tabular Numbers for Data */
        .data-number {
          font-variant-numeric: tabular-nums;
        }
        
        /* Glassmorphism Effect */
        .glass-surface {
          background: rgba(102, 37, 73, 0.15);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(246, 219, 192, 0.1);
        }
        
        /* 2. LIVING ICONS - Interactive Glow */
        .living-icon {
          stroke-width: 1.5px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .living-icon:hover {
          stroke: var(--action-core);
          stroke-width: 1.8px;
        }
        
        .living-icon.active {
          stroke-width: 2px;
          filter: drop-shadow(0 0 10px rgba(234, 97, 19, 0.2));
        }
        
        /* Linear Gradient Transition */
        @keyframes dawn-journey {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
      
      {/* Custom Cursor - decorative only */}
      <CursorFollower />

      {/* Import fonts - using Google Fonts as reliable fallback */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap');
      `}</style>

      {/* LAYER 0 (THE CANVAS) - Slowest parallax */}
      <motion.div 
        style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundImage: 'radial-gradient(circle, rgba(246,219,192,0.08) 1px, transparent 1px)', 
          backgroundSize: '40px 40px', 
          pointerEvents: 'none', 
          zIndex: 0,
          y: canvasY
        }} 
      />

      {/* 4. ORBITAL MOTION - 3D Celestial Body */}
      <motion.div
        style={{
          position: 'fixed',
          left: orbitalX,
          top: orbitalY,
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: celestialColor,
          boxShadow: celestialGlow,
          pointerEvents: 'none',
          zIndex: 1,
          filter: 'blur(2px)',
          opacity: 0.8
        }}
      >
        {/* Bloom effect */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            inset: -20,
            borderRadius: '50%',
            background: 'radial-gradient(circle, currentColor 0%, transparent 70%)',
            color: celestialColor
          }}
        />
      </motion.div>

      {/* NAV - LAYER 2 (THE SIGNAGE) */}
      <motion.nav 
        className="glass-surface" 
        style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 'var(--z-signage)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: 'var(--space-sm) var(--space-lg)',
          y: signageY
        }}
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ width: '16px', height: '16px', border: '1.5px solid var(--action-core)', transform: 'rotate(45deg)', flexShrink: 0, position: 'relative' }}
          >
            {/* Inner rotating element */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute',
                inset: 3,
                border: '1px solid var(--action-secondary)',
                borderRadius: '50%'
              }}
            />
          </motion.div>
          <span style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.3em', color: 'var(--text-highlight)', textTransform: 'uppercase', fontWeight: 'var(--font-header)' }}>Nomads</span>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
          style={{ display: 'flex', gap: 'var(--space-lg)' }}>
          {[
            { label: 'Platform', href: '#platform' },
            { label: 'Blueprints', href: '#blueprints' },
            { label: 'Docs', href: '#', onClick: (e) => { e.preventDefault(); onNavigateToDocs?.(); } }
          ].map((item, i) => (
            <motion.a 
              key={item.label} 
              href={item.href} 
              onClick={item.onClick} 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ y: -2 }}
              style={{ 
                fontFamily: 'monospace', 
                fontSize: '10px', 
                color: 'var(--text-primary)', 
                opacity: 0.6,
                textDecoration: 'none', 
                letterSpacing: '0.15em', 
                textTransform: 'uppercase', 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                fontWeight: 'var(--font-header)'
              }}
              onMouseEnter={e => e.target.style.opacity = '1'}
              onMouseLeave={e => e.target.style.opacity = '0.6'}
            >
              {/* 2. LIVING ICON effect on text */}
              <span style={{ position: 'relative' }}>
                {item.label}
                <motion.span
                  style={{
                    position: 'absolute',
                    bottom: -4,
                    left: 0,
                    right: 0,
                    height: 1.5,
                    background: 'var(--action-core)',
                    scaleX: 0,
                    transformOrigin: 'left'
                  }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                />
              </span>
            </motion.a>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <MagneticButton
            onClick={onEnter}
            style={{ 
              background: 'var(--action-core)', 
              color: 'var(--text-primary)', 
              border: 'none', 
              padding: '10px 24px', 
              fontFamily: 'monospace', 
              fontSize: '10px', 
              fontWeight: 'var(--font-hero)', 
              letterSpacing: '0.2em', 
              textTransform: 'uppercase', 
              cursor: 'pointer', 
              borderRadius: '4px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >Bắt Đầu</MagneticButton>
        </motion.div>
      </motion.nav>

      {/* HERO - LAYER 1 (THE VOICE) */}
      <motion.section 
        style={{ 
          position: 'relative', 
          zIndex: 'var(--z-voice)', 
          padding: '100px var(--space-lg) 70px', 
          minHeight: '88vh', 
          display: 'flex', 
          alignItems: 'center',
          y: voiceY
        }}
      >
        {/* Animated gradient orbs */}
        <motion.div 
          style={{ 
            position: 'absolute', 
            top: '20%', 
            left: '50%', 
            width: '600px', 
            height: '300px', 
            background: 'radial-gradient(ellipse, var(--accent-glow) 0%, transparent 70%)', 
            pointerEvents: 'none',
            opacity,
            x: mousePosition.x,
            filter: 'blur(60px)'
          }} 
        />
        
        {/* Secondary orb */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: '40%',
            right: '10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(147,80,115,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
            filter: 'blur(80px)'
          }}
        />

        <div style={{ display: 'flex', gap: '80px', alignItems: 'center', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Left Content */}
          <div style={{ flex: '0 0 600px', position: 'relative', zIndex: 2 }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }} style={{ marginBottom: 'var(--space-sm)' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.45em', color: 'var(--text-highlight)', textTransform: 'uppercase', fontWeight: 'var(--font-header)', opacity: 0.6 }}>Visual AI Orchestration · v1.0</span>
            </motion.div>

            <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', overflow: 'hidden' }}>
              {/* Text Reveal Animation - Letter by Letter */}
              <div style={{ display: 'flex', position: 'relative' }}>
                {['N', 'O', 'M', 'A', 'D', 'S'].map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 100, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.15 + i * 0.08,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    style={{ 
                      fontSize: 'clamp(64px, 8vw, 110px)', 
                      fontWeight: 'var(--font-hero)', 
                      letterSpacing: '-0.02em', 
                      color: 'var(--text-primary)', 
                      lineHeight: 1, 
                      textTransform: 'uppercase', 
                      fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif",
                      display: 'inline-block',
                      transformOrigin: 'bottom'
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
                
                {/* Gradient Sweep Effect */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ 
                    duration: 1.5, 
                    delay: 0.8,
                    ease: "easeInOut"
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, transparent 0%, var(--accent-glow) 50%, transparent 100%)',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>

            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
              style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-primary)', opacity: 0.7, maxWidth: '580px', lineHeight: 2, marginBottom: 'var(--space-lg)', fontWeight: 'var(--font-body)' }}>
              Hệ điều hành vận hành thông minh.<br />
              Chuyển đổi API phức tạp thành workflow trực quan.<br />
              Không cần code. Chỉ cần kéo-thả.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}
              style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
              <MagneticButton 
                onClick={onEnter}
                style={{ 
                  background: 'var(--action-core)', 
                  color: 'var(--text-primary)', 
                  border: 'none', 
                  padding: 'var(--space-sm) var(--space-lg)', 
                  fontFamily: 'monospace', 
                  fontSize: '12px', 
                  fontWeight: 'var(--font-hero)', 
                  letterSpacing: '0.2em', 
                  textTransform: 'uppercase', 
                  cursor: 'pointer', 
                  borderRadius: '4px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                Bắt Đầu Ngay →
              </MagneticButton>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-primary)', opacity: 0.5, letterSpacing: '0.1em' }}>Miễn phí dùng thử</span>
            </motion.div>
          </div>

          {/* Right - Animated Workflow */}
          <motion.div 
            style={{ 
              flex: 1, 
              position: 'relative', 
              minHeight: '500px',
              x: mousePosition.x * 0.5,
              y: mousePosition.y * 0.5
            }}
          >
            <WorkflowAnimation />
          </motion.div>
        </div>

        {/* scroll hint with enhanced animation */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 1.4 }}
          style={{ position: 'absolute', bottom: 'var(--space-md)', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-xs)' }}
        >
          <motion.div 
            animate={{ y: [0, 7, 0] }} 
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '1px', height: '28px', background: 'linear-gradient(to bottom, var(--text-highlight), transparent)' }} 
          />
          <motion.span
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ 
              fontFamily: 'monospace', 
              fontSize: '9px', 
              color: 'var(--text-highlight)',
              letterSpacing: '0.2em',
              fontWeight: 'var(--font-header)'
            }}
          >
            SCROLL
          </motion.span>
        </motion.div>
      </motion.section>

      {/* STATS - LAYER 1 (THE VOICE) with Data Flow Animation */}
      <motion.section 
        style={{ 
          position: 'relative', 
          zIndex: 'var(--z-voice)', 
          padding: '0 var(--space-lg) var(--space-xl)',
          y: voiceY
        }}
      >
        <div className="glass-surface" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
          {/* Animated border glow */}
          <motion.div
            animate={{
              x: ['-100%', '200%']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '50%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, var(--accent-glow), transparent)',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
          
          {/* 5. DATA FLOW ANIMATION - Staggered Fade-in */}
          {stats.map((s, i) => (
            <FadeUp key={s.l} delay={i * 0.08} style={{ position: 'relative', zIndex: 2 }}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.6, 
                  delay: i * 0.15,
                  ease: [0.4, 0, 0.2, 1]
                }}
                whileHover={{ 
                  background: 'rgba(102, 37, 73, 0.2)',
                  scale: 1.02,
                  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
                }}
                style={{ 
                  padding: 'var(--space-md) var(--space-sm)', 
                  textAlign: 'center', 
                  background: 'rgba(102, 37, 73, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* 5. Counter Animation for numbers */}
                <div className="data-number" style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 'var(--font-hero)', color: 'var(--action-core)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  <AnimatedCounter value={s.v} />
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--text-highlight)', marginTop: 'var(--space-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 'var(--font-header)', opacity: 0.6 }}>{s.l}</div>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </motion.section>

      {/* PILLARS - LAYER 1 (THE VOICE) */}
      <motion.section 
        id="platform" 
        style={{ 
          position: 'relative', 
          zIndex: 'var(--z-voice)', 
          padding: '0 var(--space-lg) var(--space-xl)',
          y: voiceY
        }}
      >
        <FadeUp style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '9px', color: 'var(--action-secondary)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 'var(--space-xs)', fontWeight: 'var(--font-header)', opacity: 0.8 }}>Ba Trụ Cột Sức Mạnh</div>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 44px)', fontWeight: 'var(--font-hero)', color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Core Architecture</h2>
        </FadeUp>
        
        <div style={{ position: 'relative' }}>
          {/* Connecting Lines between cards */}
          <svg 
            style={{ 
              position: 'absolute', 
              top: '50%', 
              left: 0, 
              width: '100%', 
              height: '2px',
              pointerEvents: 'none',
              zIndex: 1
            }}
          >
            {/* Line 1 to 2 */}
            <motion.line
              x1="33%" y1="0" x2="50%" y2="0"
              stroke="rgba(243,159,90,0.3)"
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.8 }}
            />
            {/* Line 2 to 3 */}
            <motion.line
              x1="50%" y1="0" x2="67%" y2="0"
              stroke="rgba(174,68,90,0.3)"
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 1 }}
            />
          </svg>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)', position: 'relative', zIndex: 2 }}>
            {pillars.map((p, i) => <Pillar key={p.id} p={p} i={i} />)}
          </div>
        </div>
      </motion.section>

      {/* CTA - LAYER 1 (THE VOICE) */}
      <motion.section 
        style={{ 
          position: 'relative', 
          zIndex: 'var(--z-voice)', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '0 var(--space-lg) var(--space-xl)',
          y: voiceY
        }}
      >
        <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ width: '1px', height: '70px', background: 'linear-gradient(to bottom, transparent, var(--action-secondary))', transformOrigin: 'top' }} />
        <FadeUp>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '-16px', background: 'var(--accent-glow)', filter: 'blur(24px)' }} />
            <MagneticButton 
              onClick={onEnter}
              style={{ 
                position: 'relative', 
                background: 'var(--action-core)', 
                color: 'var(--text-primary)', 
                border: 'none', 
                padding: '18px 56px', 
                fontFamily: 'monospace', 
                fontSize: '11px', 
                fontWeight: 'var(--font-hero)', 
                letterSpacing: '0.3em', 
                textTransform: 'uppercase', 
                cursor: 'pointer', 
                borderRadius: '4px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              BẮT ĐẦU NGAY
            </MagneticButton>
          </div>
        </FadeUp>
        <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, var(--action-secondary), transparent)', transformOrigin: 'top' }} />
      </motion.section>
    </motion.div>
  )
}
