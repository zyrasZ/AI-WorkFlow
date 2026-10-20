import { useState } from 'react'
import { motion } from 'framer-motion'

const footerLinks = {
  solutions: [
    { label: 'Request a Demo', href: '#demo' },
    { label: 'API Access', href: '#api' },
    { label: 'Enterprise Plan', href: '#enterprise' },
  ],
  platform: [
    { label: 'About Us', href: '#about' },
    { label: 'Trust & Security', href: '#security' },
    { label: 'Privacy Policy', href: '#privacy' },
  ],
  connect: [
    { label: 'Workflow Library', href: '#library' },
    { label: 'Help Center', href: '#help' },
    { label: 'Affiliates', href: '#affiliates' },
  ],
}

const socialLinks = [
  { 
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ), 
    href: '#linkedin', 
    label: 'LinkedIn' 
  },
  { 
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
      </svg>
    ), 
    href: '#twitter', 
    label: 'Twitter' 
  },
  { 
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 16c-1.5 1.5-3 1.5-3 1.5s0-1.5 1.5-3L12 10l4.5 4.5L12 19z"/>
        <path d="M14.5 9.5L9 15"/>
      </svg>
    ), 
    href: '#slack', 
    label: 'Slack' 
  },
  { 
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
        <path d="M9 18c-4.51 2-5-2-7-2"/>
      </svg>
    ), 
    href: '#github', 
    label: 'Github' 
  },
  { 
    icon: () => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
        <path d="m10 15 5-3-5-3z"/>
      </svg>
    ), 
    href: '#youtube', 
    label: 'Youtube' 
  },
]

function FooterLink({ href, children }) {
  const [hovered, setHovered] = useState(false)
  
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontSize: '13px',
        color: hovered ? '#fff' : 'rgba(255,255,255,0.4)',
        textDecoration: 'none',
        fontWeight: hovered ? 600 : 400,
        transition: 'all 0.2s ease',
        display: 'block',
        marginBottom: '12px',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {children}
    </a>
  )
}

function SocialIcon({ icon: Icon, href, label }) {
  const [hovered, setHovered] = useState(false)
  
  return (
    <motion.a
      href={href}
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered ? '#e2ff46' : 'rgba(255,255,255,0.08)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: hovered ? '#e2ff46' : 'rgba(255,255,255,0.4)',
        transition: 'all 0.3s ease',
        boxShadow: hovered ? '0 0 20px rgba(226,255,70,0.3)' : 'none',
      }}
    >
      <Icon />
    </motion.a>
  )
}

export default function Footer({ onGetStarted }) {
  return (
    <footer style={{ 
      position: 'relative', 
      background: '#111113', 
      borderTop: '1px solid rgba(226,255,70,0.2)',
      boxShadow: '0 -4px 40px rgba(226,255,70,0.08)',
      overflow: 'hidden',
    }}>
      {/* Dot Grid Background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        opacity: 0.5,
      }} />

      {/* Breathing Radial Glow */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(226,255,70,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(60px)',
        }}
      />

      {/* Content Container */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        maxWidth: '1400px', 
        margin: '0 auto', 
        padding: '80px 40px 40px',
      }}>
        {/* Top Section: Hero Slogan + Description */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1.5fr', 
          gap: '60px', 
          marginBottom: '80px',
          alignItems: 'start',
        }}>
          {/* Left: Hero Slogan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1.3,
              marginBottom: '16px',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              Artificial Intelligence + <br />
              <span style={{ color: '#ff71ce' }}>Office Productivity</span>
            </h2>
            
            {/* Decorative Line */}
            <div style={{
              width: '80px',
              height: '3px',
              background: 'linear-gradient(to right, #e2ff46, transparent)',
              borderRadius: '2px',
            }} />
          </motion.div>

          {/* Right: Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p style={{
              fontSize: '15px',
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.5)',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}>
              <span style={{ color: '#ff71ce', fontWeight: 600 }}>OfficeAI Weave</span> is the new intelligence engine for modern businesses. 
              We are automating tedious tasks, from deep PDF analysis to multi-language <span style={{ color: '#ff71ce', fontWeight: 600 }}>OCR</span>, 
              enabling teams to focus on strategic growth.
            </p>
          </motion.div>
        </div>

        {/* Middle Section: Links Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '60px',
          marginBottom: '60px',
          paddingBottom: '60px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {/* Solutions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '20px',
              fontFamily: 'monospace',
            }}>
              Solutions
            </h3>
            {footerLinks.solutions.map(link => (
              <FooterLink key={link.label} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </motion.div>

          {/* Platform */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '20px',
              fontFamily: 'monospace',
            }}>
              Platform
            </h3>
            {footerLinks.platform.map(link => (
              <FooterLink key={link.label} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </motion.div>

          {/* Connect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: '20px',
              fontFamily: 'monospace',
            }}>
              Connect
            </h3>
            {footerLinks.connect.map(link => (
              <FooterLink key={link.label} href={link.href}>
                {link.label}
              </FooterLink>
            ))}
          </motion.div>
        </div>

        {/* Bottom Section: Social + Certification + CTA */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '40px',
        }}>
          {/* Left: Social Icons */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{ display: 'flex', gap: '12px' }}
          >
            {socialLinks.map(social => (
              <SocialIcon key={social.label} {...social} />
            ))}
          </motion.div>

          {/* Center: Certification */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                CERTIFIED
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontFamily: 'monospace' }}>
                SOC 2 Type II
              </div>
            </div>
          </motion.div>

          {/* Right: Start Now Button */}
          <motion.button
            onClick={onGetStarted}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 30px rgba(226,255,70,0.4)',
            }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '16px 40px',
              background: '#e2ff46',
              color: '#050507',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              cursor: 'pointer',
              fontFamily: "'Inter', system-ui, sans-serif",
              textTransform: 'uppercase',
              boxShadow: '0 4px 20px rgba(226,255,70,0.2)',
              clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
            }}
          >
            Start Now →
          </motion.button>
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{
            marginTop: '60px',
            paddingTop: '30px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            textAlign: 'center',
          }}
        >
          <p style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.25)',
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
          }}>
            © 2026 OfficeAI Weave. All Rights Reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}
