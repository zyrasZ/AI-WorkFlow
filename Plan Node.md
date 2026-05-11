## Gợi ý Logic Nodes cho MVP

Dựa trên codebase hiện có, đây là những node nên build để có MVP chạy được:

---

### 🔧 Core Logic Nodes (ưu tiên cao)

**1. If/Else Node**
```
Đầu vào: data + điều kiện
Đầu ra: true branch / false branch
Ví dụ: Nếu email.subject chứa "urgent" → route sang nhánh khẩn cấp
```

**2. Switch/Router Node**
```
Đầu vào: data + field để switch
Đầu ra: nhiều nhánh theo giá trị
Ví dụ: Nếu category = "sales" → nhánh 1, "support" → nhánh 2, "spam" → nhánh 3
```

**3. Loop Node**
```
Đầu vào: array items
Đầu ra: xử lý từng item (iterate)
Ví dụ: Duyệt qua 50 email, filter từng cái, gửi reply
```

**4. Delay/Wait Node**
```
Đầu vào: data + thời gian chờ
Đầu ra: data sau khi chờ
Ví dụ: Chờ 2 giờ rồi gửi follow-up email
```

**5. Merge Node**
```
Đầu vào: nhiều nhánh
Đầu ra: gộp kết quả
Ví dụ: Gộp kết quả từ 3 nhánh xử lý parallel
```

---

### 📊 Data Transform Nodes

**6. Set Variable Node**
```
Gán giá trị biến, tính toán đơn giản
Ví dụ: set total = price * quantity
```

**7. Code/Function Node**
```
Chạy JavaScript snippet custom
Ví dụ: Format dữ liệu, gọi API bên thứ 3, tính toán phức tạp
```

**8. Data Mapper Node**
```
Map fields từ input sang output format
Ví dụ: { email.from.address } → { customer_email }
```

---

### 🔌 Trigger Nodes (cần để workflow tự chạy)

**9. Email Trigger**
```
Kích hoạt khi có email mới đến
Dùng IMAP IDLE hoặc polling mỗi X phút
→ Chạy workflow với email data làm input
```

**10. Schedule Trigger (Cron)**
```
Chạy workflow theo lịch
Ví dụ: Mỗi ngày 9h sáng, mỗi thứ 2, mỗi 1/1 hàng tháng
```

**11. Manual Trigger**
```
User nhấn nút để chạy workflow
Đơn giản nhất — click = execute
```

**12. Webhook Trigger**
```
Nhận HTTP request từ bên ngoài
Ví dụ: Form submit → webhook → workflow
```

---

### 📧 Email Action Nodes (đã có backend, cần wrap thành node)

**13. Send Email Node** — đã có `/api/email/send`
**14. Read Email Node** — đã có `/api/email/read`
**15. Filter Email Node** — đã có `/api/email/filter`
**16. Template Email Node** — đã có `/api/email/template`

---

### 🤖 AI Nodes

**17. AI Chat Node** — đã có `/api/ai/chat`
```
Gọi AI với prompt, lấy response
Ví dụ: Phân loại email, sinh reply, tóm tắt
```

**18. AI Classifier Node**
```
Phân loại input vào các category
Ví dụ: Email → sales / support / spam / other
```

---

### 📋 Ưu tiên cho MVP

| Phase | Nodes | Lý do |
|-------|-------|-------|
| **1 (Tuần 1)** | Manual Trigger → AI Chat → Send Email | Demo được end-to-end |
| **2 (Tuần 2)** | If/Else, Loop, Data Mapper, Code Node | Xử lý logic phức tạp |
| **3 (Tuần 3)** | Email Trigger, Schedule Trigger, Email Nodes | Workflow tự chạy |
| **4 (Sau MVP)** | Switch, Delay, Merge, Webhook | Mở rộng use case |

---

### Workflow MVP mẫu (demo được)

```
[Manual Trigger]
    ↓
[Read Email Node] → lấy 10 email mới nhất
    ↓
[Loop Node] → duyệt từng email
    ↓
[AI Classifier Node] → phân loại: sales / support / spam
    ↓
[If/Else Node]
    ├── sales → [Template: reply giá] → [Send Email]
    ├── support → [Template: tạo ticket] → [Send Email]
    └── spam → [Bỏ qua]
    ↓
[Merge Node] → gộp kết quả
    ↓
[Output: log kết quả]
```

---

### Cần build thêm ở backend

| Component | Mô tả | Ước lượng |
|-----------|--------|-----------|
| **Workflow Executor** | Engine chạy nodes tuần tự/parallel | 2-3 ngày |
| **Node Registry** | Đăng ký node types, factory pattern | 1 ngày |
| **Node SDK** | Interface cho node: input/output/config | 1 ngày |
| **Execution Context** | Truyền data giữa các nodes | 1 ngày |
| **Trigger Manager** | Cron + email polling + webhook listener | 2 ngày |

**Tổng MVP:** ~8-10 ngày để có sản phẩm demo được.

Muốn mình bắt đầu design Workflow Executor trước?