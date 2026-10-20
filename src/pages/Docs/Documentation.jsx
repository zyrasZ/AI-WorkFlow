/**
 * Documentation.jsx — AI Work Flow
 * Full bilingual documentation with i18next integration (English default, Vietnamese translation)
 * Minimalist design synchronized with LandingPage:
 * Dark monochrome palette (#0a0a0b), single orange accent (#f97316),
 * hairline borders, and clear typography hierarchy. No glows or gradients.
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Cpu,
  HelpCircle,
  Layers,
  Shield,
  Zap,
} from 'lucide-react'
import LanguageSwitcher from '../../components/common/LanguageSwitcher'
import './Documentation.css'

/* ─── Shared Brand Mark ─── */
function LogoMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true">
      <rect
        x="0.5"
        y="0.5"
        width="21"
        height="21"
        rx="6"
        fill="#111113"
        stroke="rgba(255,255,255,0.14)"
      />
      <path d="M8.5 11h5" stroke="#ededef" strokeOpacity="0.45" />
      <circle cx="7" cy="11" r="2.1" fill="#ededef" />
      <circle cx="15" cy="11" r="2.1" fill="#f97316" />
    </svg>
  )
}

const SECTION_CONFIG = [
  { id: 'overview', key: 'overview', icon: BookOpen },
  { id: 'core-concepts', key: 'coreConcepts', icon: Cpu },
  { id: 'getting-started', key: 'gettingStarted', icon: Zap },
  { id: 'guides', key: 'guides', icon: Layers },
  { id: 'security', key: 'security', icon: Shield },
  { id: 'troubleshooting', key: 'troubleshooting', icon: HelpCircle },
]

export default function Documentation({ onBack }) {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState('overview')

  const sections = SECTION_CONFIG.map((cfg) => {
    const data = t(`docs.sections.${cfg.key}`, { returnObjects: true }) || {}
    return {
      id: cfg.id,
      icon: cfg.icon,
      label: data.label || cfg.id,
      title: data.title || '',
      content: data.content || '',
      subsections: data.subsections || [],
    }
  })

  const active = sections.find((s) => s.id === activeSection) || sections[0]
  const ActiveIcon = active.icon

  const handleNextSection = () => {
    const idx = sections.findIndex((s) => s.id === active.id)
    const next = sections[idx + 1]
    if (next) {
      setActiveSection(next.id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const activeIdx = sections.findIndex((s) => s.id === active.id)
  const nextSection = sections[activeIdx + 1]

  return (
    <div className="doc-page">
      {/* ── Navbar ── */}
      <header className="doc-nav">
        <div className="doc-container doc-nav__inner">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="doc-logo"
              onClick={onBack}
              aria-label="AI Work Flow — back to home"
            >
              <LogoMark />
              <span>AI Work Flow</span>
            </button>
            <span className="doc-badge">{t('docs.badge', 'DOCS')}</span>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              type="button"
              className="lp-btn lp-btn--ghost lp-btn--sm"
              onClick={onBack}
            >
              <ArrowLeft size={14} />
              {t('docs.navBack', 'Back to Home')}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero header ── */}
      <section className="doc-hero">
        <div className="doc-container">
          <span className="doc-eyebrow">{t('docs.heroEyebrow')}</span>
          <h1 className="doc-title">
            {t('docs.heroTitle')}
            <br />
            <span className="doc-muted">{t('docs.heroTitleSub')}</span>
          </h1>
          <p className="doc-lead">
            {t('docs.heroLead')}
          </p>
        </div>
      </section>

      {/* ── Main body ── */}
      <div className="doc-body">
        <div className="doc-container doc-layout">
          {/* Desktop Sidebar */}
          <aside className="doc-sidebar">
            <div className="doc-sidebar__label">{t('docs.sidebarLabel')}</div>
            <nav className="doc-nav-list" aria-label="Documentation Table of Contents">
              {sections.map((s) => {
                const Icon = s.icon
                const isActive = s.id === activeSection
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`doc-nav-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => setActiveSection(s.id)}
                  >
                    <span className="doc-nav-icon">
                      <Icon size={16} strokeWidth={1.75} />
                    </span>
                    <span>{s.label}</span>
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Mobile Tab Bar */}
          <div className="doc-mobile-tabs">
            {sections.map((s) => {
              const Icon = s.icon
              const isActive = s.id === activeSection
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`doc-mobile-tab ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveSection(s.id)}
                >
                  <Icon size={14} />
                  <span>{s.label}</span>
                </button>
              )
            })}
          </div>

          {/* Main Content Area */}
          <main className="doc-content">
            <div className="doc-section-header">
              <div className="doc-icon-box">
                <ActiveIcon size={20} strokeWidth={1.75} />
              </div>
              <div>
                <div className="doc-section-cat">{active.label}</div>
                <h2 className="doc-section-title">{active.title}</h2>
              </div>
            </div>

            {active.content && <p className="doc-lead-p">{active.content}</p>}

            <div className="doc-subsections">
              {active.subsections?.map((sub, idx) => (
                <section key={idx}>
                  <h3 className="doc-sub-title">{sub.title}</h3>
                  {sub.content && <p className="doc-sub-p">{sub.content}</p>}
                  {sub.items && (
                    <div className="doc-item-grid">
                      {sub.items.map((item, itemIdx) => (
                        <article key={itemIdx} className="doc-item-card">
                          <h4 className="doc-item-name">{item.name}</h4>
                          <p className="doc-item-desc">{item.desc}</p>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Next section navigation */}
            {nextSection && (
              <div className="doc-next-box">
                <div>
                  <div className="doc-section-cat">{t('docs.nextSection')}</div>
                  <div style={{ color: 'var(--text)', fontSize: '15px', fontWeight: 500 }}>
                    {nextSection.title} ({nextSection.label})
                  </div>
                </div>
                <button
                  type="button"
                  className="doc-next-btn"
                  onClick={handleNextSection}
                >
                  <span>{t('docs.readNext')}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="doc-footer">
        <div className="doc-container doc-footer__inner">
          <div className="flex items-center gap-3">
            <LogoMark size={20} />
            <span style={{ fontSize: '14px', fontWeight: 550, color: 'var(--text)' }}>
              AI Work Flow
            </span>
          </div>
          <p className="doc-footer__copy">
            © {new Date().getFullYear()} AI Work Flow. {t('docs.footerCopy')}
          </p>
          <button
            type="button"
            className="lp-btn lp-btn--primary lp-btn--sm"
            onClick={onBack}
          >
            {t('docs.startWorkflow')}
          </button>
        </div>
      </footer>
    </div>
  )
}
