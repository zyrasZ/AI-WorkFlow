# Tài liệu Dự án: NOMADS - Office Automation Platform

## 1. Tổng quan dự án (Introduction)
**NOMADS** là một nền tảng tự động hóa quy trình làm việc dựa trên các nút (**node-based workflow automation**) dành cho các tác vụ văn phòng. Lấy cảm hứng từ kiến trúc Figma Weave, hệ thống cho phép người dùng không chuyên (non-coder) xây dựng các quy trình tự động hóa bằng cách kết nối các khối chức năng trực quan trên một không gian làm việc số [1].

## 2. Các thành phần chính của hệ thống (Core Components)
*   **Canvas**: Không gian làm việc trực quan để kéo thả và kết nối các node [2].
*   **Node Library**: Thư viện chứa các khối tác vụ có sẵn (AI, Office Tools, Logic...) [3].
*   **Execution Engine**: Bộ máy thực thi quy trình theo thời gian thực [4].
*   **Workspace**: Môi trường làm việc nhóm, quản lý workflow và template [2].

## 3. Ý tưởng thiết kế Landing Page cho Brand "NOMADS"

### A. Hero Section: "Sức mạnh của sự tự do"
- **Headline**: NOMADS: Tự động hóa mọi tác vụ văn phòng chỉ bằng vài cú kéo thả.
- **Visual**: Demo động về Canvas với các đường nối (Connections) mềm mại giữa các node AI và Office Tools [5].
- **Thông điệp**: Nhấn mạnh vào trải nghiệm "No-code" hoàn toàn.

### B. Canvas Experience (Trải nghiệm không gian làm việc)
- Hiển thị nền lưới (Grid background) để căn chỉnh [5].
- Minh họa tính năng thu phóng (Zoom) và di chuyển (Pan) linh hoạt [5].
- Trình diễn bảng cấu hình (Configuration Panel) hiện ra khi click vào node để tùy chỉnh tham số [6].

### C. Thư viện Node đa dạng (Node Library)
Thiết kế các Card cho 5 nhóm node chính [3]:
1.  **AI Nodes**: Tích hợp LLM (tạo văn bản), OCR (quét tài liệu), NLP (phân tích cảm xúc) [7].
2.  **Office Tool Nodes**: Xử lý Email, tạo tài liệu Word, Spreadsheet và PDF [8].
3.  **Data Processing**: Chuyển đổi, lọc và kiểm tra tính hợp lệ của dữ liệu [3, 9].
4.  **Logic Control**: Các vòng lặp (Loops) và nhánh điều kiện (Conditional branching) [3].
5.  **Utility Nodes**: Các công cụ tiện ích bổ trợ khác [3].

### D. Khả năng thực thi và Theo dõi (Monitoring)
- **Real-time Status**: Hiển thị trạng thái node khi đang chạy (pending, running, completed, failed) ngay trên giao diện Canvas [4].
- **Dashboard**: Biểu đồ thống kê tỷ lệ thành công, thời gian thực thi trung bình và lịch sử lỗi [10].

## 4. Đặc tính kỹ thuật nổi bật
- **Nền tảng Web**: Chạy hoàn toàn trên trình duyệt (Chrome, Firefox, Safari, Edge), không cần cài đặt [11].
- **Cộng tác (Collaboration)**: Chia sẻ workflow qua link, phân quyền Viewer/Editor/Admin và hỗ trợ cùng chỉnh sửa [12, 13].
- **Bảo mật**: Xác thực đa yếu tố (MFA) và quản lý API key tập trung tại platform [8, 13].
- **Hiệu suất**: Hỗ trợ workflow lên đến 100 nodes với tốc độ 60 fps [14].

## 5. Hướng dẫn trải nghiệm người dùng (UX)
- **Tutorial**: Hệ thống hướng dẫn tương tác cho người dùng mới khi lần đầu tiếp cận Canvas [15].
- **Tooltip**: Hiển thị mô tả và ví dụ sử dụng khi di chuột qua các node trong thư viện [15].
- **Version Control**: Xem lịch sử thay đổi (tối đa 50 phiên bản) và khôi phục về phiên bản cũ khi cần [16].

---
*Tài liệu này được biên soạn dựa trên Requirements Document của dự án NOMADS.*