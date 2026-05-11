/**
 * Documentation.jsx — NOMADS
 * Synced with LandingPage theme:
 * Dark #050507 · Dot grid · Glassmorphism · Orange gradient · Framer Motion
 */
import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowLeft, BookOpen, Cpu, Layers, Shield, Zap, HelpCircle, ChevronRight } from 'lucide-react'

/* ─── Shared style tokens (mirrors LandingPage) ─────────────────────────── */
const glass = 'bg-white/5 backdrop-blur-xl border border-white/10'
const orangeGrad = 'bg-gradient-to-r from-orange-500 to-amber-400 text-black font-bold shadow-[0_0_28px_rgba(234,97,19,0.45)] hover:shadow-[0_0_44px_rgba(234,97,19,0.7)] transition-all duration-200'

/* ─── Scroll-reveal wrapper ─────────────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  )
}

/* ─── Sections data ─────────────────────────────────────────────────────── */
const sections = [
  {
    id: 'overview',
    icon: <BookOpen size={16} />,
    label: 'Overview',
    title: 'Tổng quan',
    color: '#f97316',
    content: 'Nomads chú trọng vào việc chuyển đổi các logic lập trình và quy trình vận hành khô khan thành một hệ sinh thái đồ họa trực quan. Tại đây, mọi nhà quản trị đều có thể thiết kế, triển khai và tối ưu hóa các dòng chảy công việc thông minh mà không cần can thiệp vào mã nguồn.',
    subsections: [
      {
        title: 'Ba Trụ cột Sức mạnh cốt lõi',
        items: [
          { name: 'Visual Orchestration Canvas', desc: 'Chuyển đổi các logic lập trình và kiến trúc API phức tạp thành một không gian đồ họa trực quan. Điều này cho phép nhà quản trị "nhìn thấy" và trực tiếp thiết kế dòng chảy công việc thông qua các node chức năng mà không cần am hiểu về mã nguồn.' },
          { name: 'Agentic Workflow Engine', desc: 'Hệ thống lõi cho phép các AI Agent (như GPT-4, Gemini, Llama 3) và các công cụ tự động hóa phối hợp nhịp nhàng trong một chuỗi xử lý đa tầng. Nền tảng không chỉ thực hiện tác vụ rời rạc mà tạo ra một hệ sinh thái các "đặc vụ" tự vận hành theo mục tiêu của doanh nghiệp.' },
          { name: 'Standardized Operational Blueprints', desc: 'Sở hữu thư viện khung vận hành đã được chuẩn hóa và thẩm định bởi các chuyên gia đầu ngành. Đây là các "tài sản trí tuệ" dạng đóng gói, giúp doanh nghiệp ngay lập tức kích hoạt năng lực thực thi chuyên sâu.' },
        ],
      },
    ],
  },
  {
    id: 'core-concepts',
    icon: <Cpu size={16} />,
    label: 'Core Concepts',
    title: 'Khái niệm cốt lõi',
    color: '#8b5cf6',
    subsections: [
      {
        title: '2.1. Khái niệm',
        content: 'Nomads được định nghĩa là một nền tảng tự động hóa quy trình trực quan (visual workflow automation), nơi người dùng xây dựng các luồng công việc thông minh bằng cách kết nối các mô hình AI. Giải pháp này loại bỏ hoàn toàn rào cản kỹ thuật.',
      },
      {
        title: '2.2. Các thành phần',
        content: 'Cấu trúc hệ thống được xây dựng dựa trên bốn thành phần chính:',
        items: [
          { name: 'Nodes', desc: 'Các khối chức năng độc lập, mỗi node thực hiện một tác vụ cụ thể.' },
          { name: 'Connections', desc: 'Liên kết truyền dẫn dữ liệu giữa các node.' },
          { name: 'Workflows', desc: 'Quy trình hoàn chỉnh được tạo từ nhiều node kết nối.' },
          { name: 'Templates', desc: 'Quy trình mẫu có sẵn, sẵn sàng sử dụng ngay.' },
        ],
      },
      {
        title: '2.3. Cơ chế hoạt động',
        content: 'Quy trình bắt đầu khi người dùng cấu hình các thành phần trên Canvas, sau đó Execution Engine sẽ điều hành các Node theo thứ tự và gửi lệnh gọi API đến các dịch vụ AI. Kết quả được hiển thị tức thì trên từng Node thông qua tính năng Inline Preview.',
      },
      {
        title: '2.4. Công cụ và Kỹ năng',
        content: 'Nền tảng tích hợp giao diện Visual Canvas hỗ trợ kéo-thả cùng các mô hình AI hàng đầu. Người dùng không cần kiến thức lập trình chuyên sâu, chỉ cần thực hiện các thao tác kéo-thả và cấu hình thông số cơ bản.',
      },
    ],
  },
  {
    id: 'getting-started',
    icon: <Zap size={16} />,
    label: 'Getting Started',
    title: 'Bắt đầu nhanh',
    color: '#f59e0b',
    subsections: [
      {
        title: 'Quy trình 4 bước',
        items: [
          { name: '1. Khởi tạo', desc: 'Tạo một quy trình mới từ Canvas trống hoặc chọn từ Thư viện Blueprint.' },
          { name: '2. Thiết kế', desc: 'Kéo các Node cần thiết và kết nối chúng theo logic vận hành của bạn.' },
          { name: '3. Cấu hình', desc: 'Thiết lập tham số cho từng AI Node (chọn model Gemini, GPT-4, hoặc Llama 3).' },
          { name: '4. Kích hoạt', desc: 'Nhấn "Run" để xem AI thực thi quy trình theo thời gian thực.' },
        ],
      },
    ],
  },
  {
    id: 'guides',
    icon: <Layers size={16} />,
    label: 'Guides',
    title: 'Hướng dẫn chi tiết',
    color: '#10b981',
    subsections: [
      {
        title: 'Tài liệu hướng dẫn',
        items: [
          { name: 'Tối ưu hóa Prompt', desc: 'Cách viết lệnh để AI Agent hoạt động chính xác nhất trong chuỗi đa tầng.' },
          { name: 'Tích hợp API', desc: 'Hướng dẫn kết nối Nomads với các dịch vụ bên thứ ba thông qua Webhook.' },
          { name: 'Xây dựng Blueprint', desc: 'Cách đóng gói quy trình cá nhân thành tài sản trí tuệ của doanh nghiệp.' },
        ],
      },
    ],
  },
  {
    id: 'security',
    icon: <Shield size={16} />,
    label: 'Security',
    title: 'Bảo mật & Quyền riêng tư',
    color: '#3b82f6',
    subsections: [
      {
        title: 'Các biện pháp bảo mật',
        items: [
          { name: 'Mã hóa dữ liệu', desc: 'Toàn bộ kết nối được bảo vệ bởi giao thức HTTPS/TLS 1.3.' },
          { name: 'Xác thực', desc: 'Sử dụng Supabase Auth với cơ chế JWT và hỗ trợ bảo mật đa lớp (MFA).' },
          { name: 'Quyền riêng tư', desc: 'Dữ liệu người dùng và API Key được mã hóa ở cấp độ cơ sở dữ liệu, đảm bảo không có sự can thiệp từ bên thứ ba.' },
        ],
      },
    ],
  },
  {
    id: 'troubleshooting',
    icon: <HelpCircle size={16} />,
    label: 'FAQ',
    title: 'Troubleshooting & FAQ',
    color: '#ec4899',
    subsections: [
      {
        title: 'Các vấn đề thường gặp',
        items: [
          { name: 'Lỗi Node AI', desc: 'Cách xử lý khi mô hình vượt quá giới hạn ký tự hoặc phản hồi chậm.' },
          { name: 'Tốc độ thực thi', desc: 'Tối ưu hóa số lượng node để đạt hiệu suất cao nhất.' },
          { name: 'Câu hỏi thường gặp', desc: 'Giải đáp về chi phí Tier, cách chia sẻ Workflow cho đội nhóm và cập nhật mô hình mới.' },
        ],
      },
    ],
  },
]

export default function Documentation({ onBack }) {
  const [activeSection, setActiveSection] = useState('overview')
  const active = sections.find(s => s.id === activeSection)

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden"
      style={{ background: '#050507', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Dot grid (same as LandingPage) ── */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

      {/* ── Ambient glow ── */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse, rgba(234,97,19,0.06) 0%, transparent 70%)' }} />

      {/* ══════════════════════════════════════════════════════
          NAVBAR — mirrors LandingPage navbar style
      ══════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-50 w-full flex justify-center px-4 pt-4">
        <motion.header
          initial={{ y: -70, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-6xl">
          <nav className={`${glass} rounded-2xl px-5 py-3 flex items-center justify-between shadow-[0_8px_40px_rgba(0,0,0,0.5)]`}>
            {/* Logo + badge */}
            <div className="flex items-center gap-3">
              <span className="text-white font-black text-sm tracking-[0.22em] select-none">NOMADS</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase"
                style={{ background: 'rgba(234,97,19,0.12)', color: '#f97316', border: '1px solid rgba(234,97,19,0.25)' }}>
                <BookOpen size={10} />
                Docs
              </span>
            </div>

            {/* Section quick-links (desktop) */}
            <div className="hidden lg:flex items-center gap-5">
              {sections.map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className="text-xs font-medium transition-colors duration-200"
                  style={{ color: activeSection === s.id ? '#f97316' : 'rgba(255,255,255,0.45)' }}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Back button */}
            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
              }}>
              <ArrowLeft size={13} />
              <span className="hidden sm:inline">Back</span>
            </motion.button>
          </nav>
        </motion.header>
      </div>

      {/* ══════════════════════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-14 pb-10">
        <FadeUp>
          <div className="flex flex-col items-start gap-4 mb-12">
            <span className={`${glass} text-xs text-white/60 font-medium px-4 py-1.5 rounded-full inline-flex items-center gap-2`}>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" style={{ boxShadow: '0 0 6px #F59E0B' }} />
              Documentation
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] text-white">
              Nomads{' '}
              <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-orange-500 bg-clip-text text-transparent">
                Documentation
              </span>
            </h1>
            <p className="text-white/40 text-base md:text-lg max-w-2xl leading-relaxed">
              Hệ Điều Hành Vận Hành Thông Minh. Trung tâm tài liệu chính thức của Nomads — nền tảng Visual AI Orchestration thế hệ mới.
            </p>
          </div>
        </FadeUp>

        {/* ══════════════════════════════════════════════════════
            MAIN LAYOUT: Sidebar + Content
        ══════════════════════════════════════════════════════ */}
        <div className="flex gap-8 items-start">

          {/* ── Sidebar ── */}
          <FadeUp delay={0.1}>
            <aside className="hidden md:flex flex-col gap-1 w-56 flex-shrink-0 sticky top-28">
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3"
                style={{ color: 'rgba(234,97,19,0.5)' }}>
                Mục lục
              </p>
              {sections.map((s) => {
                const isActive = activeSection === s.id
                return (
                  <motion.button
                    key={s.id}
                    onClick={() => setActiveSection(s.id)}
                    whileHover={{ x: isActive ? 0 : 4 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all duration-200 w-full"
                    style={{
                      background: isActive ? 'rgba(234,97,19,0.1)' : 'transparent',
                      border: `1px solid ${isActive ? 'rgba(234,97,19,0.3)' : 'rgba(255,255,255,0.05)'}`,
                      color: isActive ? '#f97316' : 'rgba(255,255,255,0.4)',
                    }}>
                    <span style={{ color: isActive ? s.color : 'rgba(255,255,255,0.25)' }}>
                      {s.icon}
                    </span>
                    {s.label}
                    {isActive && (
                      <ChevronRight size={12} className="ml-auto" style={{ color: '#f97316' }} />
                    )}
                  </motion.button>
                )
              })}
            </aside>
          </FadeUp>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">

            {/* Mobile section picker */}
            <div className="flex md:hidden gap-2 flex-wrap mb-6">
              {sections.map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all duration-200"
                  style={{
                    background: activeSection === s.id ? 'rgba(234,97,19,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${activeSection === s.id ? 'rgba(234,97,19,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: activeSection === s.id ? '#f97316' : 'rgba(255,255,255,0.5)',
                  }}>
                  {s.icon}{s.label}
                </button>
              ))}
            </div>

            {/* Section content */}
            {active && (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>

                {/* Section header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl"
                    style={{ background: `${active.color}18`, border: `1px solid ${active.color}30` }}>
                    <span style={{ color: active.color }}>{active.icon}</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.25em] uppercase mb-0.5"
                      style={{ color: `${active.color}99` }}>
                      {active.label}
                    </p>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                      {active.title}
                    </h2>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px mb-8 rounded-full"
                  style={{ background: `linear-gradient(to right, ${active.color}40, transparent)` }} />

                {/* Intro content */}
                {active.content && (
                  <p className="text-white/50 text-sm md:text-base leading-relaxed mb-8 max-w-3xl">
                    {active.content}
                  </p>
                )}

                {/* Subsections */}
                <div className="space-y-10">
                  {active.subsections?.map((sub, subIdx) => (
                    <FadeUp key={subIdx} delay={subIdx * 0.08}>
                      <div>
                        <h3 className="text-sm font-bold mb-4 tracking-wide"
                          style={{ color: active.color, fontFamily: 'monospace' }}>
                          {sub.title}
                        </h3>

                        {sub.content && (
                          <p className="text-white/45 text-sm leading-relaxed mb-5 max-w-3xl">
                            {sub.content}
                          </p>
                        )}

                        {sub.items && (
                          <div className="grid gap-3">
                            {sub.items.map((item, itemIdx) => (
                              <motion.div
                                key={itemIdx}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: itemIdx * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                whileHover={{ x: 4 }}
                                className="group flex gap-4 p-4 rounded-xl transition-all duration-200 cursor-default"
                                style={{
                                  background: 'rgba(255,255,255,0.025)',
                                  border: '1px solid rgba(255,255,255,0.07)',
                                }}>
                                {/* Accent dot */}
                                <div className="flex-shrink-0 mt-1">
                                  <div className="w-2 h-2 rounded-full mt-0.5 transition-all duration-200"
                                    style={{
                                      background: active.color,
                                      boxShadow: `0 0 8px ${active.color}80`,
                                    }} />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-white/85 mb-1"
                                    style={{ fontFamily: 'monospace' }}>
                                    {item.name}
                                  </p>
                                  <p className="text-xs text-white/40 leading-relaxed">
                                    {item.desc}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FadeUp>
                  ))}
                </div>

                {/* Next section button */}
                {(() => {
                  const idx = sections.findIndex(s => s.id === active.id)
                  const next = sections[idx + 1]
                  if (!next) return null
                  return (
                    <FadeUp delay={0.3}>
                      <div className="mt-12 pt-8 border-t border-white/5">
                        <p className="text-xs text-white/30 mb-3 uppercase tracking-widest font-semibold">Tiếp theo</p>
                        <motion.button
                          onClick={() => setActiveSection(next.id)}
                          whileHover={{ x: 6 }}
                          className="flex items-center gap-3 group">
                          <div className="p-2 rounded-lg transition-all duration-200"
                            style={{ background: `${next.color}15`, border: `1px solid ${next.color}25` }}>
                            <span style={{ color: next.color }}>{next.icon}</span>
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold tracking-widest uppercase mb-0.5"
                              style={{ color: `${next.color}80` }}>
                              {next.label}
                            </p>
                            <p className="text-sm font-semibold text-white/70 group-hover:text-white transition-colors">
                              {next.title}
                            </p>
                          </div>
                          <ChevronRight size={16} className="ml-2 text-white/20 group-hover:text-white/60 transition-colors" />
                        </motion.button>
                      </div>
                    </FadeUp>
                  )
                })()}
              </motion.div>
            )}
          </main>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 mt-20 border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-white font-black text-sm tracking-[0.22em] select-none">NOMADS</span>
          <p className="text-white/20 text-xs">© 2025 Nomads. Visual AI Orchestration Platform.</p>
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className={`${orangeGrad} text-xs px-5 py-2 rounded-xl`}>
            Get Started For Free
          </motion.button>
        </div>
      </footer>
    </div>
  )
}
