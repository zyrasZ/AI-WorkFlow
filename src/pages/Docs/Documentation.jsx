/**
 * Documentation.jsx — AI Work Flow
 * Minimalist design synchronized with LandingPage:
 * Dark monochrome palette (#0a0a0b), single orange accent (#f97316),
 * hairline borders, and clear typography hierarchy. No glows or gradients.
 */
import { useState } from 'react'
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

/* ─── Sections data ─────────────────────────────────────────────────────── */
const sections = [
  {
    id: 'overview',
    icon: BookOpen,
    label: 'Overview',
    title: 'Tổng quan',
    content:
      'AI Work Flow chú trọng vào việc chuyển đổi các logic lập trình và quy trình vận hành phức tạp thành một hệ sinh thái đồ họa trực quan. Tại đây, mọi nhà quản trị và kỹ sư đều có thể thiết kế, triển khai và tối ưu hóa các luồng công việc thông minh mà không cần can thiệp vào mã nguồn.',
    subsections: [
      {
        title: 'Ba trụ cột sức mạnh cốt lõi',
        items: [
          {
            name: 'Visual Orchestration Canvas',
            desc: 'Chuyển đổi logic lập trình và kiến trúc API phức tạp thành một không gian đồ họa trực quan. Cho phép người dùng trực tiếp thiết kế dòng chảy công việc thông qua các node chức năng mà không cần am hiểu sâu về mã nguồn.',
          },
          {
            name: 'Agentic Workflow Engine',
            desc: 'Hệ thống lõi cho phép các AI Agent (như GPT-4o, Claude 3.5, Gemini 1.5, Llama 3.3) và các công cụ tự động hóa phối hợp nhịp nhàng trong chuỗi xử lý đa tầng theo mục tiêu của doanh nghiệp.',
          },
          {
            name: 'Standardized Operational Blueprints',
            desc: 'Thư viện khung vận hành chuẩn hóa được thiết kế sẵn cho văn phòng, hỗ trợ kích hoạt tức thì các quy trình email, tài liệu, bảng tính và phân tích dữ liệu.',
          },
        ],
      },
    ],
  },
  {
    id: 'core-concepts',
    icon: Cpu,
    label: 'Core Concepts',
    title: 'Khái niệm cốt lõi',
    subsections: [
      {
        title: '2.1. Nền tảng tự động hóa trực quan',
        content:
          'AI Work Flow là nền tảng tự động hóa quy trình trực quan (visual workflow automation), nơi người dùng xây dựng các luồng công việc thông minh bằng cách kết nối các khối chức năng và mô hình AI.',
      },
      {
        title: '2.2. Bốn thành phần nền tảng',
        content: 'Cấu trúc hệ thống được xây dựng dựa trên bốn thành phần chính:',
        items: [
          {
            name: 'Nodes (Khối chức năng)',
            desc: 'Các đơn vị thực thi độc lập: Input, Trigger, Logic (If/Else, Switch), AI Engine, Output, Email, v.v.',
          },
          {
            name: 'Connections (Đường truyền dẫn)',
            desc: 'Liên kết có định hướng chuyển giao dữ liệu JSON và trạng thái giữa đầu ra của node này tới đầu vào của node khác.',
          },
          {
            name: 'Workflows (Quy trình hoàn chỉnh)',
            desc: 'Toàn bộ đồ thị các node và kết nối tạo nên một kịch bản tự động hóa hoàn chỉnh có thể chạy thủ công hoặc theo lịch trình.',
          },
          {
            name: 'Templates (Mẫu quy trình)',
            desc: 'Các quy trình đã được đóng gói sẵn cho các bài toán phổ biến, sẵn sàng sử dụng chỉ với một cú nhấp chuột.',
          },
        ],
      },
      {
        title: '2.3. Cơ chế hoạt động & Thực thi',
        content:
          'Khi kích hoạt, Execution Engine duyệt qua đồ thị theo thứ tự phụ thuộc (Topological Sort), điều phối từng Node thực thi và gửi lệnh gọi an toàn tới các dịch vụ AI. Kết quả được lưu trữ và hiển thị trực tiếp trên từng Node.',
      },
    ],
  },
  {
    id: 'getting-started',
    icon: Zap,
    label: 'Getting Started',
    title: 'Bắt đầu nhanh',
    subsections: [
      {
        title: 'Quy trình khởi tạo 4 bước',
        items: [
          {
            name: '01. Khởi tạo dự án',
            desc: 'Tạo một quy trình mới từ Canvas trống hoặc nhân bản từ Thư viện Mẫu (Templates) có sẵn.',
          },
          {
            name: '02. Thiết kế luồng dữ liệu',
            desc: 'Kéo thả các Node từ thanh công cụ bên trái vào Canvas và nối các cổng Input/Output với nhau.',
          },
          {
            name: '03. Cấu hình tham số AI',
            desc: 'Chọn mô hình AI mong muốn (Gemini, Llama 3.3, GPT), nhập System Prompt và thiết lập các biến đầu vào.',
          },
          {
            name: '04. Kích hoạt & Giám sát',
            desc: 'Nhấn "Run" để theo dõi luồng dữ liệu chạy trực tiếp theo thời gian thực và kiểm tra kết quả tại Output Node.',
          },
        ],
      },
    ],
  },
  {
    id: 'guides',
    icon: Layers,
    label: 'Guides',
    title: 'Hướng dẫn chi tiết',
    subsections: [
      {
        title: 'Các kỹ thuật xây dựng nâng cao',
        items: [
          {
            name: 'Tối ưu hóa Prompt với Context Injection',
            desc: 'Sử dụng cú pháp mustache {{input}} để truyền trực tiếp nội dung từ email hoặc tài liệu vào prompt của AI Node.',
          },
          {
            name: 'Xử lý rẽ nhánh điều kiện (Conditional Branching)',
            desc: 'Sử dụng FilterNode và IfElseNode để kiểm tra dữ liệu đầu vào trước khi quyết định gọi AI hay gửi email.',
          },
          {
            name: 'Tích hợp Webhook & API bên ngoài',
            desc: 'Kết nối AI Work Flow với hệ thống nội bộ của bạn thông qua REST Webhooks và Trigger tự động.',
          },
        ],
      },
    ],
  },
  {
    id: 'security',
    icon: Shield,
    label: 'Security',
    title: 'Bảo mật & Quyền riêng tư',
    subsections: [
      {
        title: 'Tiêu chuẩn bảo vệ dữ liệu',
        items: [
          {
            name: 'Mã hóa truyền tải (In-Transit Encryption)',
            desc: 'Toàn bộ kết nối giữa trình duyệt, máy chủ và các nhà cung cấp AI đều được bảo vệ nghiêm ngặt qua TLS 1.3.',
          },
          {
            name: 'Bảo mật thông tin xác thực (Credentials Vault)',
            desc: 'Mật khẩu email ứng dụng (App Password) và API Key của người dùng được mã hóa an toàn ở cấp cơ sở dữ liệu.',
          },
          {
            name: 'Kiểm soát quyền truy cập theo phiên (JWT Auth)',
            desc: 'Hệ thống quản lý phiên đăng nhập chặt chẽ qua JWT tokens với khả năng tự động gia hạn an toàn.',
          },
        ],
      },
    ],
  },
  {
    id: 'troubleshooting',
    icon: HelpCircle,
    label: 'FAQ',
    title: 'Troubleshooting & FAQ',
    subsections: [
      {
        title: 'Các tình huống thường gặp',
        items: [
          {
            name: 'Lỗi gọi API mô hình (Rate Limit / Timeout)',
            desc: 'Kiểm tra lại cấu hình API Key trong mục Settings hoặc phân chia tài liệu lớn thành nhiều phần nhỏ hơn.',
          },
          {
            name: 'Node không nhận được dữ liệu đầu vào',
            desc: 'Đảm bảo dây nối (connection edge) được cắm đúng cổng Output của node trước và Input của node tiếp theo.',
          },
          {
            name: 'Cấu hình SMTP Gmail không gửi được thư',
            desc: 'Cần sử dụng App Password (Mật khẩu ứng dụng 16 ký tự) của Google thay vì mật khẩu đăng nhập tài khoản chính.',
          },
        ],
      },
    ],
  },
]

export default function Documentation({ onBack }) {
  const [activeSection, setActiveSection] = useState('overview')
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
              aria-label="AI Work Flow — về trang chủ"
            >
              <LogoMark />
              <span>AI Work Flow</span>
            </button>
            <span className="doc-badge">DOCS</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lp-btn lp-btn--ghost lp-btn--sm"
              onClick={onBack}
            >
              <ArrowLeft size={14} />
              Quay lại Trang chủ
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero header ── */}
      <section className="doc-hero">
        <div className="doc-container">
          <span className="doc-eyebrow">Tài liệu hướng dẫn</span>
          <h1 className="doc-title">
            AI Work Flow Documentation.
            <br />
            <span className="doc-muted">Hệ điều hành vận hành thông minh.</span>
          </h1>
          <p className="doc-lead">
            Trung tâm tài liệu hướng dẫn thiết kế, triển khai và tự động hóa
            quy trình công việc không cần code trên nền tảng AI Work Flow.
          </p>
        </div>
      </section>

      {/* ── Main body ── */}
      <div className="doc-body">
        <div className="doc-container doc-layout">
          {/* Desktop Sidebar */}
          <aside className="doc-sidebar">
            <div className="doc-sidebar__label">Danh mục tài liệu</div>
            <nav className="doc-nav-list" aria-label="Mục lục tài liệu">
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
                  <div className="doc-section-cat">Phần tiếp theo</div>
                  <div style={{ color: 'var(--text)', fontSize: '15px', fontWeight: 500 }}>
                    {nextSection.title} ({nextSection.label})
                  </div>
                </div>
                <button
                  type="button"
                  className="doc-next-btn"
                  onClick={handleNextSection}
                >
                  <span>Xem tiếp</span>
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
            © {new Date().getFullYear()} AI Work Flow. Visual AI Orchestration Platform.
          </p>
          <button
            type="button"
            className="lp-btn lp-btn--primary lp-btn--sm"
            onClick={onBack}
          >
            Bắt đầu tạo Workflow
          </button>
        </div>
      </footer>
    </div>
  )
}
