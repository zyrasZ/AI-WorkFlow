import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const sections = [
  {
    id: 'overview',
    title: '1. Overview (Tổng quan)',
    content: `Nomads chú trọng vào việc chuyển đổi các logic lập trình và quy trình vận hành khô khan thành một hệ sinh thái đồ họa trực quan. Tại đây, mọi nhà quản trị đều có thể thiết kế, triển khai và tối ưu hóa các dòng chảy công việc thông minh (intelligent workflows) mà không cần can thiệp vào mã nguồn.`,
    subsections: [
      {
        title: 'Ba Trụ cột Sức mạnh cốt lõi',
        items: [
          {
            name: 'Visual Orchestration Canvas',
            desc: 'Chuyển đổi các logic lập trình và kiến trúc API phức tạp thành một không gian đồ họa trực quan. Điều này cho phép nhà quản trị "nhìn thấy" và trực tiếp thiết kế dòng chảy công việc thông qua các node chức năng mà không cần am hiểu về mã nguồn.'
          },
          {
            name: 'Agentic Workflow Engine',
            desc: 'Hệ thống lõi cho phép các AI Agent (như GPT-4, Gemini, Llama 3) và các công cụ tự động hóa phối hợp nhịp nhàng trong một chuỗi xử lý đa tầng. Nền tảng không chỉ thực hiện tác vụ rời rạc mà tạo ra một hệ sinh thái các "đặc vụ" tự vận hành theo mục tiêu của doanh nghiệp.'
          },
          {
            name: 'Standardized Operational Blueprints',
            desc: 'Sở hữu thư viện khung vận hành đã được chuẩn hóa và thẩm định bởi các chuyên gia đầu ngành. Đây là các "tài sản trí tuệ" dạng đóng gói, giúp doanh nghiệp ngay lập tức kích hoạt năng lực thực thi chuyên sâu trong các lĩnh vực Marketing, Pháp lý hay Tài chính mà không cần xây dựng lại từ đầu.'
          }
        ]
      }
    ]
  },
  {
    id: 'core-concepts',
    title: '2. Core Concepts (Khái niệm cốt lõi)',
    subsections: [
      {
        title: '2.1. Khái niệm',
        content: 'Nomads được định nghĩa là một nền tảng tự động hóa quy trình trực quan (visual workflow automation), nơi người dùng xây dựng các luồng công việc thông minh bằng cách kết nối các mô hình AI. Giải pháp này loại bỏ hoàn toàn rào cản kỹ thuật, cho phép bất kỳ ai cũng có thể tạo ra các hệ thống tự động phức tạp mà không cần viết mã nguồn.'
      },
      {
        title: '2.2. Các thành phần',
        content: 'Cấu trúc hệ thống được xây dựng dựa trên bốn thành phần chính:',
        items: [
          { name: 'Nodes', desc: 'Các khối chức năng' },
          { name: 'Connections', desc: 'Liên kết truyền dẫn dữ liệu' },
          { name: 'Workflows', desc: 'Quy trình hoàn chỉnh' },
          { name: 'Templates', desc: 'Quy trình mẫu có sẵn' }
        ]
      },
      {
        title: '2.3. Cơ chế hoạt động',
        content: 'Quy trình bắt đầu khi người dùng cấu hình các thành phần trên Canvas, sau đó Execution Engine sẽ điều hành các Node theo thứ tự và gửi lệnh gọi API đến các dịch vụ AI. Kết quả được hiển thị tức thì trên từng Node thông qua tính năng Inline Preview, giúp người dùng theo dõi và kiểm tra tính chính xác của dữ liệu ngay trong quá trình thực thi.'
      },
      {
        title: '2.4. Công cụ và Kỹ năng',
        content: 'Nền tảng tích hợp giao diện Visual Canvas hỗ trợ kéo-thả cùng các mô hình AI hàng đầu (tối ưu chất lượng đầu ra). Người dùng không cần kiến thức lập trình chuyên sâu, chỉ cần thực hiện các thao tác kéo-thả và cấu hình thông số cơ bản để vận hành hệ thống.'
      },
      {
        title: '2.5. Tương tác và Thiết lập',
        content: 'Người dùng có thể bắt đầu nhanh chóng bằng cách đăng ký tài khoản qua email và hoàn thành bài hướng dẫn tương tác trong vòng 5 phút. Vì phần Frontend chạy hoàn toàn trên trình duyệt web nên hệ thống không yêu cầu cài đặt phức tạp, cho phép người dùng tương tác và nhận kết quả trực tiếp một cách dễ dàng.'
      }
    ]
  },
  {
    id: 'getting-started',
    title: '3. Getting Started (Bắt đầu nhanh)',
    subsections: [
      {
        title: 'Quy trình 4 bước',
        items: [
          { name: '1. Khởi tạo', desc: 'Tạo một quy trình mới từ Canvas trống hoặc chọn từ Thư viện Blueprint.' },
          { name: '2. Thiết kế', desc: 'Kéo các Node cần thiết và kết nối chúng theo logic vận hành của bạn.' },
          { name: '3. Cấu hình', desc: 'Thiết lập tham số cho từng AI Node (chọn model Gemini, GPT-4, hoặc Llama 3).' },
          { name: '4. Kích hoạt', desc: 'Nhấn "Run" để xem AI thực thi quy trình theo thời gian thực.' }
        ]
      }
    ]
  },
  {
    id: 'guides',
    title: '4. Guides (Hướng dẫn chi tiết)',
    subsections: [
      {
        title: 'Tài liệu hướng dẫn',
        items: [
          { name: 'Tối ưu hóa Prompt', desc: 'Cách viết lệnh để AI Agent hoạt động chính xác nhất trong chuỗi đa tầng.' },
          { name: 'Tích hợp API', desc: 'Hướng dẫn kết nối Nomads với các dịch vụ bên thứ ba thông qua Webhook.' },
          { name: 'Xây dựng Blueprint', desc: 'Cách đóng gói quy trình cá nhân thành tài sản trí tuệ của doanh nghiệp.' }
        ]
      }
    ]
  },
  {
    id: 'security',
    title: '5. Security & Privacy (Bảo mật & Quyền riêng tư)',
    subsections: [
      {
        title: 'Các biện pháp bảo mật',
        items: [
          { name: 'Mã hóa dữ liệu', desc: 'Toàn bộ kết nối được bảo vệ bởi giao thức HTTPS/TLS 1.3.' },
          { name: 'Xác thực', desc: 'Sử dụng Supabase Auth với cơ chế JWT và hỗ trợ bảo mật đa lớp (MFA).' },
          { name: 'Quyền riêng tư', desc: 'Dữ liệu người dùng và API Key được mã hóa ở cấp độ cơ sở dữ liệu, đảm bảo không có sự can thiệp từ bên thứ ba.' }
        ]
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: '6. Troubleshooting & FAQ (Xử lý sự cố)',
    subsections: [
      {
        title: 'Các vấn đề thường gặp',
        items: [
          { name: 'Lỗi Node AI', desc: 'Cách xử lý khi mô hình vượt quá giới hạn ký tự hoặc phản hồi chậm.' },
          { name: 'Tốc độ thực thi', desc: 'Tối ưu hóa số lượng node để đạt hiệu suất cao nhất.' },
          { name: 'Câu hỏi thường gặp', desc: 'Giải đáp về chi phí Tier, cách chia sẻ Workflow cho đội nhóm và cập nhật mô hình mới.' }
        ]
      }
    ]
  }
]

function FadeUp({ children, delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  )
}

export default function Documentation({ onBack }) {
  const [activeSection, setActiveSection] = useState('overview')

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#050507', fontFamily: "'Inter', system-ui, sans-serif", overflowX: 'hidden' }}>
      
      {/* dot grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none', zIndex: 0 }} />

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 40px', background: 'rgba(5,5,7,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <motion.div animate={{ rotate: [45, 90, 45] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '14px', height: '14px', border: '1.5px solid #EA6113', transform: 'rotate(45deg)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>Nomads Documentation</span>
        </motion.div>

        <motion.button
          onClick={onBack} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', padding: '9px 20px', fontFamily: 'monospace', fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))' }}
        >← Quay lại</motion.button>
      </nav>

      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', padding: '40px', gap: '60px' }}>
        
        {/* Sidebar TOC - Fixed position */}
        <aside style={{ 
          width: '280px', 
          position: 'sticky', 
          top: '120px', 
          height: 'fit-content',
          maxHeight: 'calc(100vh - 160px)',
          flexShrink: 0
        }}>
          <FadeUp>
            <div style={{ fontFamily: 'monospace', fontSize: '9px', color: 'rgba(234,97,19,0.5)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '20px' }}>Mục lục</div>
            {sections.map((section, i) => (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                whileHover={{ x: 4 }}
                style={{ 
                  display: 'block', 
                  width: '100%',
                  padding: '12px 16px', 
                  marginBottom: '4px',
                  background: activeSection === section.id ? 'rgba(234,97,19,0.1)' : 'transparent',
                  border: `1px solid ${activeSection === section.id ? 'rgba(234,97,19,0.3)' : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: '4px',
                  color: activeSection === section.id ? '#EA6113' : 'rgba(255,255,255,0.4)',
                  fontSize: '12px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {section.title}
              </motion.button>
            ))}
          </FadeUp>
        </aside>

        {/* Main Content - Scrollable */}
        <main style={{ flex: 1, position: 'relative', zIndex: 10, minWidth: 0 }}>
          
          {/* Hero */}
          <FadeUp>
            <div style={{ marginBottom: '60px' }}>
              <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.1, marginBottom: '16px' }}>
                Nomads Documentation
              </h1>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.8, maxWidth: '700px' }}>
                Hệ Điều Hành Vận Hành Thông Minh. Chào mừng bạn đến với trung tâm tài liệu chính thức của Nomads - nền tảng Visual AI Orchestration thế hệ mới.
              </p>
            </div>
          </FadeUp>

          {/* Display only active section */}
          {sections.map((section) => {
            if (section.id !== activeSection) return null;
            
            return (
              <FadeUp key={section.id}>
                <section id={section.id} style={{ marginBottom: '80px' }}>
                  
                  <div style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, color: '#fff', margin: 0 }}>
                      {section.title}
                    </h2>
                  </div>

                  {section.content && (
                    <p style={{ fontSize: '15px', lineHeight: 1.9, color: 'rgba(255,255,255,0.5)', marginBottom: '32px', maxWidth: '800px' }}>
                      {section.content}
                    </p>
                  )}

                  {section.subsections?.map((sub, subIdx) => (
                    <div key={subIdx} style={{ marginBottom: '40px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#EA6113', marginBottom: '16px', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                        {sub.title}
                      </h3>
                      
                      {sub.content && (
                        <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'rgba(255,255,255,0.45)', marginBottom: '20px' }}>
                          {sub.content}
                        </p>
                      )}

                      {sub.items && (
                        <div style={{ display: 'grid', gap: '16px' }}>
                          {sub.items.map((item, itemIdx) => (
                            <motion.div
                              key={itemIdx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: itemIdx * 0.1 }}
                              whileHover={{ x: 4 }}
                              style={{ 
                                padding: '20px 24px', 
                                background: 'rgba(255,255,255,0.02)', 
                                border: '1px solid rgba(255,255,255,0.08)', 
                                borderRadius: '8px',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontFamily: 'monospace' }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: '13px', lineHeight: 1.7, color: 'rgba(255,255,255,0.4)' }}>
                                {item.desc}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              </FadeUp>
            );
          })}

        </main>
      </div>
    </div>
  )
}
