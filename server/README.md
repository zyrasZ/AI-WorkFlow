# AI Work Flow - Fastify Backend

Backend siêu nhẹ, hiệu năng cao được xây dựng trên nền tảng **Fastify** và **TypeScript**, cung cấp toàn bộ API xử lý Workflow, Auth, AI Inference qua Groq Cloud và Swagger Docs.

## 🚀 Đặc điểm kỹ thuật
- **Framework**: [Fastify](https://fastify.dev/) v5 (Tốc độ xử lý cao gấp 2-4x Express/NestJS, khởi động dưới 1 giây, RAM tiêu thụ chỉ ~30MB).
- **Ngôn ngữ**: TypeScript & Node.js 22+.
- **Tài liệu API**: OpenAPI / Swagger UI tích hợp tại `/api/docs`.
- **CORS**: Tự động hỗ trợ Frontend React / Vite tại `http://localhost:5173`.
- **Lưu trữ**: File-based JSON database an toàn tại `server/data/workflows.json` (dễ dàng chuyển sang Supabase / PostgreSQL).
- **AI Engine**: Tích hợp trực tiếp Groq Cloud SDK (Llama 3.3 70B, GPT-OSS 120B, Qwen...) kèm chế độ AI mô phỏng tự động khi chưa có API key.

---

## 🛠️ Hướng dẫn cài đặt & chạy

### 1. Cài đặt thư viện
```bash
cd server
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env` (hoặc sao chép từ `.env.example`):
```env
PORT=3001
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### 3. Chạy server ở môi trường phát triển (Dev Watch)
```bash
npm run start:dev
```
Server sẽ chạy tại:
- **API Base**: `http://localhost:3001/api`
- **Swagger UI**: `http://localhost:3001/api/docs`
- **Health Check**: `http://localhost:3001/health`

### 4. Build & Chạy Production
```bash
npm run build
npm run start:prod
```

---

## 🐳 Docker Deployment

### Chạy trực tiếp Dockerfile
```bash
docker build -t ai-workflow-server .
docker run -p 3001:3001 ai-workflow-server
```

### Chạy qua Docker Compose (Cả Frontend + Backend)
Tại thư mục gốc của dự án:
```bash
docker compose up -d --build
```
- Frontend: `http://localhost:4173`
- Backend API: `http://localhost:3001/api`
- Swagger Docs: `http://localhost:3001/api/docs`

---

## 📡 Danh sách Endpoints chính

### Auth
- `GET /api/auth/user` - Lấy thông tin user hiện tại
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` hoặc `POST /api/auth/signup` - Đăng ký
- `POST /api/auth/logout` - Đăng xuất

### Workflows
- `GET /api/workflows` - Danh sách workflow (phân trang, tìm kiếm)
- `GET /api/workflows/:id` - Chi tiết workflow
- `POST /api/workflows` - Tạo mới workflow
- `PUT /api/workflows/:id` - Cập nhật nodes, edges, metadata
- `DELETE /api/workflows/:id` - Xóa workflow
- `GET /api/workflows/:id/validate` - Kiểm tra tính hợp lệ của workflow
- `POST /api/workflows/:id/execute` - Kích hoạt chạy workflow trên server

### AI Integration
- `GET /api/ai/models` - Danh sách model AI khả dụng trên Groq Cloud
- `POST /api/ai/chat` - Gửi prompt đến AI (Groq LLM hoặc Mock thông minh)
