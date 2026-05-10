/**
 * NomadsBackground.jsx
 * Shared premium mesh gradient background — dùng cho cả LandingPage và Canvas workspace.
 *
 * Layers:
 *  1. Base color  #0d0928  (Violet Dusk deep)
 *  2. Mesh radial gradients — purple + orange + accent  (blur 100px, opacity 0.6)
 *  3. SVG fractal-noise grain texture  (opacity 0.03)
 *  4. GSAP: parallax scroll + slow organic float per orb
 */
import { useEffect, useRef, memo } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const NomadsBackground = memo(() => {
  const orbPurple = useRef(null)   // Violet Dusk  — top-left
  const orbOrange = useRef(null)   // Sunset Orange — bottom-right
  const orbAccent = useRef(null)   // Mid-tone      — center
  const orbExtra  = useRef(null)   // Extra depth   — bottom-left

  useEffect(() => {
    const ctx = gsap.context(() => {
      const st = {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
      }

      /* Parallax — each orb drifts at a different scroll speed */
      gsap.to(orbPurple.current, { y: -200, ease: 'none', scrollTrigger: { ...st, scrub: 2.8 } })
      gsap.to(orbOrange.current, { y: -280, ease: 'none', scrollTrigger: { ...st, scrub: 1.6 } })
      gsap.to(orbAccent.current, { y: -140, ease: 'none', scrollTrigger: { ...st, scrub: 3.2 } })
      gsap.to(orbExtra.current,  { y: -100, ease: 'none', scrollTrigger: { ...st, scrub: 2.0 } })

      /* Slow organic float — each orb moves independently */
      gsap.to(orbPurple.current, {
        x: 40, duration: 18, ease: 'sine.inOut', yoyo: true, repeat: -1,
      })
      gsap.to(orbOrange.current, {
        x: -50, y: 30, duration: 22, ease: 'sine.inOut', yoyo: true, repeat: -1,
      })
      gsap.to(orbAccent.current, {
        x: 25, y: -35, duration: 26, ease: 'sine.inOut', yoyo: true, repeat: -1,
      })
      gsap.to(orbExtra.current, {
        x: -30, y: 45, duration: 20, ease: 'sine.inOut', yoyo: true, repeat: -1,
      })
    })
    return () => ctx.revert()
  }, [])

  /* SVG fractal-noise grain — identical to the original CSS ::after */
  const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: '100%', height: '100%',
      backgroundColor: '#0d0928',
      zIndex: -1, overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      {/* Violet Dusk — top-left */}
      <div ref={orbPurple} style={{
        position: 'absolute',
        left: '-5%', top: '-5%',
        width: '65%', height: '75%',
        background: 'radial-gradient(circle at 30% 35%, #3A0353 0%, transparent 55%)',
        filter: 'blur(100px)',
        opacity: 0.65,
        willChange: 'transform',
      }} />

      {/* Sunset Orange — bottom-right */}
      <div ref={orbOrange} style={{
        position: 'absolute',
        right: '-10%', bottom: '-5%',
        width: '60%', height: '70%',
        background: 'radial-gradient(circle at 65% 60%, #FF9D42 0%, transparent 45%)',
        filter: 'blur(100px)',
        opacity: 0.55,
        willChange: 'transform',
      }} />

      {/* Mid-tone accent — center */}
      <div ref={orbAccent} style={{
        position: 'absolute',
        left: '20%', top: '20%',
        width: '60%', height: '60%',
        background: 'radial-gradient(circle at 50% 50%, #1a1736 0%, transparent 65%)',
        filter: 'blur(100px)',
        opacity: 0.70,
        willChange: 'transform',
      }} />

      {/* Extra depth — bottom-left */}
      <div ref={orbExtra} style={{
        position: 'absolute',
        left: '-8%', bottom: '10%',
        width: '45%', height: '55%',
        background: 'radial-gradient(circle at 35% 55%, #3A0353 0%, #FF9D4222 50%, transparent 70%)',
        filter: 'blur(120px)',
        opacity: 0.45,
        willChange: 'transform',
      }} />

      {/* Fractal-noise grain texture */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%',
        opacity: 0.03,
        backgroundImage: noiseSvg,
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        pointerEvents: 'none',
      }} />
    </div>
  )
})

export default NomadsBackground
