import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Footer from './Footer'

const pillars = [
  {
    id: 'research',
    title: 'RESEARCH',
    sub: 'PDF · Data · Insights',
    color: '#3b82f6',
    border: 'rgba(59,130,246,0.3)',
    glow: 'rgba(59,130,246,0.45)',
    meta: [['Model', 'GPT-4o'], ['Latency', '120ms'], ['Context', '128k'], ['Input', 'PDF / Web']],
    icon: <svg width="36" height="36" viewBox="0 0 32 32" fill="none"><rect x="6" y="4" width="14" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 9h6M10 13h6M10 17h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="22" cy="22" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M25 25l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  },
  {
    id: 'creation',
    title: 'CREATION',
    sub: 'Writing · Marketing · Copy',
    color: '#a855f7',
    border: 'rgba(168,85,247,0.3)',
    glow: 'rgba(168,85,247,0.45)',
    meta: [['Model', 'Claude 3.5'], ['Latency', '95ms'], ['Tone', 'Adaptive'], ['Output', 'Multi-format']],
    icon: <svg width="36" height="36" viewBox="0 0 32 32" fill="none"><path d="M8 24l2-6 12-12 4 4-12 12-6 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M18 8l4 4" stroke="currentColor" strokeWidth="1.5"/><circle cx="26" cy="10" r="1.5" fill="currentColor" opacity="0.7"/></svg>,
  },
  {
    id: 'technical',
    title: 'TECHNICAL',
    sub: 'OCR · Automation · Vision',
    color: '#10b981',
    border: 'rgba(16,185,129,0.3)',
    glow: 'rgba(16,185,129,0.45)',
    meta: [['Model', 'Vision Pro'], ['Latency', '80ms'], ['Accuracy', '99.2%'], ['Pipeline', 'Auto-chain']],
    icon: <svg width="36" height="36" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="1.5"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/><path d="M4 16c0-6.627 5.373-12 12-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M28 16c0 6.627-5.373 12-12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M8 8l2 2M22 22l2 2M24 8l-2 2M8 24l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  },
]

const stats = [
  { v: '10x', l: 'Faster' },
  { v: '99.9%', l: 'Uptime' },
  { v: '128k', l: 'Context' },
  { v: '<80ms', l: 'Latency' },
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
  const [hov, setHov] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 50 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ flex: 1, minWidth: 0, position: 'relative', cursor: 'default' }}
    >
      {/* top glow */}
      <motion.div animate={{ opacity: hov ? 1 : 0 }} transition={{ duration: 0.3 }}
        style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 100% 50% at 50% 0%, ${p.glow} 0%, transparent 60%)`, pointerEvents: 'none', zIndex: 1, borderRadius: '2px' }}
      />
      <motion.div
        animate={{ borderColor: hov ? p.color : p.border, boxShadow: hov ? `0 0 60px rgba(0,0,0,0.4), 0 0 30px ${p.border}` : '0 0 0 transparent' }}
        transition={{ duration: 0.3 }}
        style={{ position: 'relative', zIndex: 2, minHeight: '460px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '44px 28px 32px', background: 'rgba(255,255,255,0.025)', backdropFilter: 'blur(8px)', border: `1px solid ${p.border}`, borderRadius: '2px' }}
      >
        {/* center line */}
        <div style={{ position: 'absolute', left: '50%', top: 0, height: '70%', width: '1px', transform: 'translateX(-50%)', background: `linear-gradient(to bottom, ${p.color}, transparent)`, opacity: 0.5 }} />

        <motion.div animate={{ color: hov ? p.color : 'rgba(255,255,255,0.35)' }} transition={{ duration: 0.3 }}
          style={{ color: 'rgba(255,255,255,0.35)', marginBottom: '18px', position: 'relative', zIndex: 3 }}>
          {p.icon}
        </motion.div>

        <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, letterSpacing: '0.3em', color: p.color, marginBottom: '6px', zIndex: 3, position: 'relative' }}>{p.title}</div>
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', marginBottom: '28px', zIndex: 3, position: 'relative' }}>{p.sub}</div>

        <div style={{ width: '100%', height: '1px', background: `linear-gradient(to right, transparent, ${p.border}, transparent)`, marginBottom: '24px', zIndex: 3, position: 'relative' }} />

        <div style={{ width: '100%', zIndex: 3, position: 'relative' }}>
          {p.meta.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.22)' }}>{k}</span>
              <motion.span animate={{ color: hov ? p.color : 'rgba(255,255,255,0.5)' }} transition={{ duration: 0.3 }}
                style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 600 }}>{v}</motion.span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '20px', width: '100%', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 3, position: 'relative' }}>
          <motion.div animate={{ backgroundColor: hov ? p.color : 'rgba(255,255,255,0.12)' }} transition={{ duration: 0.3 }}
            style={{ width: '6px', height: '6px', borderRadius: '50%' }} />
          <span style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.2em' }}>ONLINE</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function LandingPage({ onEnter }) {
  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#050507', fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden' }}>

      {/* dot grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', background: 'rgba(5,5,7,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <motion.div animate={{ rotate: [45, 90, 45] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '14px', height: '14px', border: '1.5px solid #e2ff46', transform: 'rotate(45deg)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>Office AI Weave</span>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
          style={{ display: 'flex', gap: '28px' }}>
          {['Platform', 'Pricing', 'Docs'].map(item => (
            <a key={item} href="#" style={{ fontFamily: 'monospace', fontSize: '9px', color: 'rgba(255,255,255,0.22)', textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.65)'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.22)'}
            >{item}</a>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <motion.button
            onClick={onEnter} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{ background: '#e2ff46', color: '#050507', border: 'none', padding: '9px 20px', fontFamily: 'monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))' }}
          >Get Started</motion.button>
        </motion.div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', zIndex: 10, padding: '100px 40px 70px', minHeight: '88vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', background: 'radial-gradient(ellipse, rgba(226,255,70,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }} style={{ marginBottom: '18px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.45em', color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase' }}>AI Productivity · v2.0</span>
        </motion.div>

        <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '20px', marginBottom: '28px' }}>
          <motion.h1 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 'clamp(52px, 9vw, 130px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1, margin: 0, textTransform: 'uppercase' }}>
            FOUNDATION
          </motion.h1>
          <motion.span initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.85, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: 'clamp(36px, 6.5vw, 95px)', fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.1)', lineHeight: 1 }}>
            Intelligence
          </motion.span>
        </div>

        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
          style={{ fontFamily: 'monospace', fontSize: '13px', color: 'rgba(255,255,255,0.3)', maxWidth: '480px', lineHeight: 2, marginBottom: '40px' }}>
          Three pillars. One platform.<br />Built for the modern knowledge worker.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.52 }}
          style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <motion.button onClick={onEnter} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{ background: '#e2ff46', color: '#050507', border: 'none', padding: '16px 40px', fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            Enter The Weave →
          </motion.button>
          <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>Free to start</span>
        </motion.div>

        {/* scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          style={{ position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '1px', height: '28px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)' }} />
        </motion.div>
      </section>

      {/* STATS */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 40px 80px' }}>
        <div style={{ display: 'flex', gap: '1px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
          {stats.map((s, i) => (
            <FadeUp key={s.l} delay={i * 0.08} style={{ flex: 1 }}>
              <div style={{ padding: '28px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 900, color: '#e2ff46', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontFamily: 'monospace', fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginTop: '8px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{s.l}</div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* PILLARS */}
      <section style={{ position: 'relative', zIndex: 10, padding: '0 40px 0' }}>
        <FadeUp style={{ marginBottom: '32px' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '9px', color: 'rgba(226,255,70,0.5)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '10px' }}>Core Architecture</div>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 44px)', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>Three Pillars</h2>
        </FadeUp>
        <div style={{ display: 'flex', gap: '12px' }}>
          {pillars.map((p, i) => <Pillar key={p.id} p={p} i={i} />)}
        </div>
      </section>

      {/* CTA */}
      <section style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 40px' }}>
        <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{ width: '1px', height: '70px', background: 'linear-gradient(to bottom, transparent, rgba(226,255,70,0.7))', transformOrigin: 'top' }} />
        <FadeUp>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '-16px', background: 'rgba(226,255,70,0.1)', filter: 'blur(24px)' }} />
            <motion.button onClick={onEnter} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              style={{ position: 'relative', background: '#e2ff46', color: '#050507', border: 'none', padding: '18px 56px', fontFamily: 'monospace', fontSize: '11px', fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer', clipPath: 'polygon(0 0, calc(100% - 11px) 0, 100% 11px, 100% 100%, 11px 100%, 0 calc(100% - 11px))' }}>
              ENTER THE WEAVE
            </motion.button>
          </div>
        </FadeUp>
        <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, rgba(226,255,70,0.5), transparent)', transformOrigin: 'top' }} />
      </section>

      {/* FOOTER */}
      <Footer onGetStarted={onEnter} />
    </div>
  )
}
