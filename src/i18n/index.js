import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      common: {
        back: "Back",
        backToHome: "Back to Home",
        tryDemo: "Try Demo",
        tryLiveDemo: "Try Live Demo",
        readDocs: "Read the docs",
        documentation: "Documentation",
        projects: "Projects",
        settings: "Settings",
        retry: "Retry",
        noWorkflows: "No workflows yet",
        createNewFile: "Create New File",
        studio: "Workflow Studio",
        demoBadge: "Demo",
      },
      nav: {
        howItWorks: "How it works",
        features: "Features",
        canvas: "Canvas",
        nodes: "Nodes",
        docs: "Docs",
      },
      docs: {
        badge: "DOCS",
        navBack: "Back to Home",
        heroEyebrow: "Documentation Hub",
        heroTitle: "AI Work Flow Documentation.",
        heroTitleSub: "Intelligent Visual Operations System.",
        heroLead: "The official documentation center for designing, deploying, and automating enterprise workflows without code on AI Work Flow.",
        sidebarLabel: "Documentation Index",
        nextSection: "Next Section",
        readNext: "Continue Reading",
        startWorkflow: "Launch Workflow Studio",
        footerCopy: "Visual AI Orchestration Platform.",
        sections: {
          overview: {
            label: "Overview",
            title: "System Overview",
            content: "AI Work Flow transforms complex programming logic and operational workflows into an intuitive visual ecosystem. Administrators, product managers, and engineers can design, deploy, and optimize intelligent automations without writing or maintaining backend code.",
            subsections: [
              {
                title: "Three Core Architectural Pillars",
                items: [
                  {
                    name: "Visual Orchestration Canvas",
                    desc: "Converts intricate API integrations and workflow logic into an infinite graphical canvas. Users visually design pipelines through drag-and-drop functional nodes without deep coding expertise.",
                  },
                  {
                    name: "Agentic Workflow Engine",
                    desc: "The core orchestration runtime coordinating leading LLMs (such as LLaMA 3.3 70B, GPT-4o, Claude 3.5, Gemini 1.5) and automation tools in multi-stage execution pipelines tailored to business goals.",
                  },
                  {
                    name: "Standardized Operational Blueprints",
                    desc: "A library of pre-packaged operational templates designed for enterprise office tasks, enabling instant activation of email automation, document parsing, spreadsheet processing, and analytics.",
                  },
                ],
              },
            ],
          },
          coreConcepts: {
            label: "Core Concepts",
            title: "Core Architectural Concepts",
            subsections: [
              {
                title: "2.1. Visual Automation Platform",
                content: "AI Work Flow is a visual workflow automation platform where users construct smart workflows by connecting modular functional blocks and cutting-edge AI models.",
              },
              {
                title: "2.2. Four Fundamental Primitives",
                content: "The system architecture is established upon four core primitives:",
                items: [
                  {
                    name: "Nodes (Functional Blocks)",
                    desc: "Independent executable units: Input, Trigger, Logic (If/Else, Switch), AI Engine, Output, Email, and custom webhook processors.",
                  },
                  {
                    name: "Connections (Data Edges)",
                    desc: "Directional links transferring structured JSON data and execution states from output ports to subsequent input ports.",
                  },
                  {
                    name: "Workflows (Complete Pipelines)",
                    desc: "Directed acyclic graphs (DAG) of interconnected nodes defining an end-to-end automation runnable manually or via cron triggers.",
                  },
                  {
                    name: "Templates (Pre-built Blueprints)",
                    desc: "Pre-packaged blueprints addressing popular business scenarios, ready for one-click deployment.",
                  },
                ],
              },
              {
                title: "2.3. Execution & Runtime Engine",
                content: "Upon trigger, the Execution Engine traverses the graph via Topological Sort, dispatching each node in dependency order and proxying secure calls to AI providers. Outputs are persisted and rendered directly on each node.",
              },
            ],
          },
          gettingStarted: {
            label: "Getting Started",
            title: "Quick Start Guide",
            subsections: [
              {
                title: "4-Step Initialization Pipeline",
                items: [
                  {
                    name: "01. Create a Project",
                    desc: "Start a new workflow from an empty canvas or clone from our pre-built Templates library.",
                  },
                  {
                    name: "02. Wire Data Flows",
                    desc: "Drag and drop functional nodes from the left palette onto the canvas and connect their Input/Output handles.",
                  },
                  {
                    name: "03. Configure AI Parameters",
                    desc: "Select your preferred AI model (Llama 3.3, Gemini, GPT), define the System Prompt, and configure runtime hyperparameters (temperature, max tokens).",
                  },
                  {
                    name: "04. Trigger & Inspect",
                    desc: "Click 'Run' to monitor real-time execution flows with animated neon pulses and inspect live outputs on the Output Node.",
                  },
                ],
              },
            ],
          },
          guides: {
            label: "Guides",
            title: "Detailed Guides & Best Practices",
            subsections: [
              {
                title: "Advanced Construction Techniques",
                items: [
                  {
                    name: "Prompt Optimization with Context Injection",
                    desc: "Utilize {{input}} mustache templating syntax to inject email bodies or document contents directly into downstream AI prompts.",
                  },
                  {
                    name: "Conditional Branching & Logic",
                    desc: "Leverage FilterNode and IfElseNode to validate and route incoming data before invoking AI inference or dispatching emails.",
                  },
                  {
                    name: "Webhooks & External API Integrations",
                    desc: "Seamlessly bind AI Work Flow into internal enterprise backends using incoming REST Webhooks and event triggers.",
                  },
                ],
              },
            ],
          },
          security: {
            label: "Security",
            title: "Security & Enterprise Privacy",
            subsections: [
              {
                title: "Data Protection Standards",
                items: [
                  {
                    name: "In-Transit Encryption",
                    desc: "All network traffic between browser, backend microservices, and AI model providers is strictly encrypted via TLS 1.3.",
                  },
                  {
                    name: "Secure Credentials Vault",
                    desc: "Application passwords, OAuth tokens, and private API keys are safeguarded in encrypted database storage.",
                  },
                  {
                    name: "Session Access Control",
                    desc: "Rigorous JWT-based session management ensuring seamless token validation and isolated user workspaces.",
                  },
                ],
              },
            ],
          },
          troubleshooting: {
            label: "FAQ",
            title: "Troubleshooting & FAQ",
            subsections: [
              {
                title: "Common Scenarios & Resolutions",
                items: [
                  {
                    name: "Model API Rate Limit or Timeout",
                    desc: "Verify your API keys in Settings or partition large batch payloads into smaller concurrent chunks.",
                  },
                  {
                    name: "Node Not Receiving Data",
                    desc: "Ensure directional neon edges are firmly wired from the upstream Output handle to the downstream Input handle.",
                  },
                  {
                    name: "Gmail SMTP Delivery Failure",
                    desc: "Use a 16-character Google App Password or verify OAuth permissions rather than standard account credentials.",
                  },
                ],
              },
            ],
          },
        },
      },
    },
  },
  vi: {
    translation: {
      common: {
        back: "Quay lại",
        backToHome: "Quay lại Trang chủ",
        tryDemo: "Xem Demo",
        tryLiveDemo: "Xem Demo Ngay",
        readDocs: "Xem tài liệu",
        documentation: "Tài liệu",
        projects: "Dự án",
        settings: "Cài đặt",
        retry: "Thử lại",
        noWorkflows: "Chưa có quy trình nào",
        createNewFile: "Tạo File Mới",
        studio: "Xưởng Quy Trình",
        demoBadge: "Demo",
      },
      nav: {
        howItWorks: "Cách hoạt động",
        features: "Tính năng",
        canvas: "Bản vẽ Canvas",
        nodes: "Các Node",
        docs: "Tài liệu",
      },
      docs: {
        badge: "TÀI LIỆU",
        navBack: "Quay lại Trang chủ",
        heroEyebrow: "Trung tâm tài liệu",
        heroTitle: "Tài Liệu Hướng Dẫn AI Work Flow.",
        heroTitleSub: "Hệ điều hành vận hành thông minh.",
        heroLead: "Trung tâm tài liệu chính thức hỗ trợ thiết kế, triển khai và tự động hóa quy trình nghiệp vụ không cần viết code trên AI Work Flow.",
        sidebarLabel: "Danh mục tài liệu",
        nextSection: "Phần tiếp theo",
        readNext: "Xem tiếp",
        startWorkflow: "Bắt đầu tạo Workflow",
        footerCopy: "Nền tảng tự động hóa quy trình AI trực quan.",
        sections: {
          overview: {
            label: "Tổng quan",
            title: "Tổng quan hệ thống",
            content: "AI Work Flow chú trọng vào việc chuyển đổi các logic lập trình và quy trình vận hành phức tạp thành một hệ sinh thái đồ họa trực quan. Tại đây, mọi nhà quản trị, quản lý sản phẩm và kỹ sư đều có thể thiết kế, triển khai và tối ưu hóa các luồng công việc thông minh mà không cần can thiệp mã nguồn.",
            subsections: [
              {
                title: "Ba trụ cột sức mạnh cốt lõi",
                items: [
                  {
                    name: "Visual Orchestration Canvas",
                    desc: "Chuyển đổi logic lập trình và kiến trúc API phức tạp thành một không gian đồ họa trực quan vô cực. Cho phép người dùng trực tiếp thiết kế dòng chảy công việc thông qua các node chức năng kéo thả.",
                  },
                  {
                    name: "Agentic Workflow Engine",
                    desc: "Hệ thống lõi cho phép các AI Agent (như LLaMA 3.3 70B, GPT-4o, Claude 3.5, Gemini 1.5) và các công cụ tự động hóa phối hợp nhịp nhàng trong chuỗi xử lý đa tầng theo mục tiêu của doanh nghiệp.",
                  },
                  {
                    name: "Standardized Operational Blueprints",
                    desc: "Thư viện khung vận hành chuẩn hóa được thiết kế sẵn cho văn phòng, hỗ trợ kích hoạt tức thì các quy trình email, tài liệu, bảng tính và phân tích dữ liệu.",
                  },
                ],
              },
            ],
          },
          coreConcepts: {
            label: "Khái niệm cốt lõi",
            title: "Khái niệm kiến trúc nền tảng",
            subsections: [
              {
                title: "2.1. Nền tảng tự động hóa trực quan",
                content: "AI Work Flow là nền tảng tự động hóa quy trình trực quan (visual workflow automation), nơi người dùng xây dựng các luồng công việc thông minh bằng cách kết nối các khối chức năng và mô hình AI tiên tiến.",
              },
              {
                title: "2.2. Bốn thành phần nền tảng",
                content: "Cấu trúc hệ thống được xây dựng dựa trên bốn thành phần cơ bản:",
                items: [
                  {
                    name: "Nodes (Khối chức năng)",
                    desc: "Các đơn vị thực thi độc lập: Input, Trigger, Logic (If/Else, Switch), AI Engine, Output, Email, và bộ xử lý webhook tùy chỉnh.",
                  },
                  {
                    name: "Connections (Đường truyền dẫn)",
                    desc: "Liên kết có định hướng chuyển giao dữ liệu JSON và trạng thái giữa đầu ra của node này tới đầu vào của node tiếp theo.",
                  },
                  {
                    name: "Workflows (Quy trình hoàn chỉnh)",
                    desc: "Đồ thị có hướng không chu trình (DAG) tạo nên một kịch bản tự động hóa hoàn chỉnh có thể chạy thủ công hoặc theo lịch trình.",
                  },
                  {
                    name: "Templates (Mẫu quy trình)",
                    desc: "Các quy trình đã được đóng gói sẵn cho các bài toán phổ biến, sẵn sàng sử dụng chỉ với một cú nhấp chuột.",
                  },
                ],
              },
              {
                title: "2.3. Cơ chế hoạt động & Thực thi",
                content: "Khi kích hoạt, Execution Engine duyệt qua đồ thị theo thứ tự phụ thuộc (Topological Sort), điều phối từng Node thực thi và gửi lệnh gọi an toàn tới các dịch vụ AI. Kết quả được lưu trữ và hiển thị trực tiếp trên từng Node.",
              },
            ],
          },
          gettingStarted: {
            label: "Bắt đầu nhanh",
            title: "Hướng dẫn khởi động nhanh",
            subsections: [
              {
                title: "Quy trình khởi tạo 4 bước",
                items: [
                  {
                    name: "01. Khởi tạo dự án",
                    desc: "Tạo một quy trình mới từ Canvas trống hoặc nhân bản từ Thư viện Mẫu (Templates) có sẵn.",
                  },
                  {
                    name: "02. Thiết kế luồng dữ liệu",
                    desc: "Kéo thả các Node từ thanh công cụ bên trái vào Canvas và nối các cổng Input/Output với nhau.",
                  },
                  {
                    name: "03. Cấu hình tham số AI",
                    desc: "Chọn mô hình AI mong muốn (Llama 3.3, Gemini, GPT), nhập System Prompt và thiết lập các biến đầu vào cùng hyperparameters (temperature, max tokens).",
                  },
                  {
                    name: "04. Kích hoạt & Giám sát",
                    desc: "Nhấn 'Run' để theo dõi luồng dữ liệu chạy trực tiếp theo thời gian thực với hiệu ứng neon và kiểm tra kết quả tại Output Node.",
                  },
                ],
              },
            ],
          },
          guides: {
            label: "Hướng dẫn",
            title: "Hướng dẫn chi tiết & Best Practices",
            subsections: [
              {
                title: "Các kỹ thuật xây dựng nâng cao",
                items: [
                  {
                    name: "Tối ưu hóa Prompt với Context Injection",
                    desc: "Sử dụng cú pháp mustache {{input}} để truyền trực tiếp nội dung từ email hoặc tài liệu vào prompt của AI Node phía sau.",
                  },
                  {
                    name: "Xử lý rẽ nhánh điều kiện (Conditional Branching)",
                    desc: "Sử dụng FilterNode và IfElseNode để kiểm tra và định tuyến dữ liệu đầu vào trước khi quyết định gọi AI hay gửi email.",
                  },
                  {
                    name: "Tích hợp Webhook & API bên ngoài",
                    desc: "Kết nối AI Work Flow với hệ thống nội bộ của bạn thông qua REST Webhooks và Trigger tự động.",
                  },
                ],
              },
            ],
          },
          security: {
            label: "Bảo mật",
            title: "Bảo mật & Quyền riêng tư doanh nghiệp",
            subsections: [
              {
                title: "Tiêu chuẩn bảo vệ dữ liệu",
                items: [
                  {
                    name: "Mã hóa truyền tải (In-Transit Encryption)",
                    desc: "Toàn bộ kết nối giữa trình duyệt, máy chủ và các nhà cung cấp AI đều được bảo vệ nghiêm ngặt qua giao thức TLS 1.3.",
                  },
                  {
                    name: "Bảo mật thông tin xác thực (Credentials Vault)",
                    desc: "Mật khẩu ứng dụng (App Password), token OAuth và API Key của người dùng được mã hóa an toàn ở cấp cơ sở dữ liệu.",
                  },
                  {
                    name: "Kiểm soát quyền truy cập theo phiên (JWT Auth)",
                    desc: "Hệ thống quản lý phiên đăng nhập chặt chẽ qua JWT tokens với khả năng tự động gia hạn an toàn và phân lập không gian làm việc.",
                  },
                ],
              },
            ],
          },
          troubleshooting: {
            label: "FAQ",
            title: "Xử lý sự cố & Câu hỏi thường gặp",
            subsections: [
              {
                title: "Các tình huống thường gặp & Cách khắc phục",
                items: [
                  {
                    name: "Lỗi gọi API mô hình (Rate Limit / Timeout)",
                    desc: "Kiểm tra lại cấu hình API Key trong mục Settings hoặc phân chia dữ liệu lớn thành nhiều phần nhỏ hơn.",
                  },
                  {
                    name: "Node không nhận được dữ liệu đầu vào",
                    desc: "Đảm bảo dây nối (connection edge) được cắm đúng cổng Output của node trước và Input của node tiếp theo.",
                  },
                  {
                    name: "Cấu hình SMTP Gmail không gửi được thư",
                    desc: "Cần sử dụng App Password (Mật khẩu ứng dụng 16 ký tự) của Google hoặc xác thực OAuth thay vì mật khẩu tài khoản chính.",
                  },
                ],
              },
            ],
          },
        },
      },
    },
  },
};

const savedLang = typeof window !== 'undefined' ? localStorage.getItem('app_lang') || 'en' : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
