# 🚀 Hướng Dẫn Thực Thi Workflow với API Thật

## ✅ Đã Triển Khai

### 1. **Giao Tiếp Giữa Các Node**

#### PromptNode → AI Model Node
- **PromptNode** giờ đây lưu dữ liệu vào `data.value` khi bạn nhập văn bản
- Khi workflow chạy, dữ liệu tự động truyền từ Prompt Node sang các Node được kết nối
- Engine sử dụng React Flow edges để xác định luồng dữ liệu

```javascript
// Ví dụ: Prompt Node → Llama 3.3 70B
// 1. Nhập prompt vào PromptNode
// 2. Kết nối PromptNode với AI Model Node
// 3. Nhấn "Run Workflow"
// 4. Dữ liệu prompt tự động truyền vào AI Model
```

#### Cách Hoạt Động
```javascript
// Engine.js - executeGraph()
const inputSources = edgeMap.get(node.id) || [];
const inputData = {};

inputSources.forEach(sourceId => {
  const sourceOutput = nodeOutputs.get(sourceId);
  if (sourceOutput && sourceOutput.success) {
    Object.assign(inputData, sourceOutput.data);
  }
});
```

### 2. **API Thật Được Gắn Vào "Run Workflow"**

#### Nút "Run Workflow" (Màu Xanh Lá)
- Kiểm tra authentication trước khi chạy
- Gọi `apiClient.chatWithAI()` cho các AI Model Node
- Hiển thị progress bar trong quá trình thực thi
- Cập nhật kết quả vào từng Node sau khi hoàn thành

```javascript
// App.jsx - handleRunWorkflow()
const handleRunWorkflow = async () => {
  // 1. Kiểm tra auth
  if (!hasAuth) {
    alert('Vui lòng đăng nhập để chạy workflow');
    return;
  }

  // 2. Thực thi workflow với API thật
  const results = await engine.executeGraph(nodes, edges, (progress) => {
    setExecutionProgress(progress);
  });

  // 3. Cập nhật kết quả vào nodes
  results.forEach(result => {
    if (result.success && result.data) {
      // Update node with result
    }
  });
};
```

### 3. **Các Chức Năng Chuyên Biệt**

#### 📊 Bảng Mapping API

| Nhóm Chức Năng | Node Type | API Endpoint | Model |
|----------------|-----------|--------------|-------|
| **Prompt** | `prompt-input` | N/A | Truyền dữ liệu |
| **AI Model** | `ai-model` | `/api/ai/chat` | `llama-3.1-8b-instant` hoặc `llama-3.3-70b-versatile` |
| **Research** | `research` | `/api/ai/chat` | `llama-3.1-8b-instant` |
| **Code Generator** | `code`, `code-generator` | `/api/ai/chat` | `llama-3.1-8b-instant` |
| **Marketing** | `marketing`, `content-writer` | `/api/ai/chat` | `llama-3.1-8b-instant` |
| **Image Generator** | `imagine`, `image-generator` | `/api/ai/chat` | `llama-3.1-8b-instant` |
| **Video Editor** | `video`, `video-editor` | `/api/ai/chat` | `llama-3.1-8b-instant` |

#### Ví Dụ Sử Dụng

**1. Research Node**
```javascript
// Input: Prompt từ PromptNode
// Output: Research findings với sources
{
  type: 'research',
  findings: 'Detailed research results...',
  query: 'Original query',
  confidence: 0.85
}
```

**2. Code Generator Node**
```javascript
// Input: Prompt hoặc research findings
// Output: Generated code
{
  type: 'code',
  generated: 'function example() { ... }',
  language: 'javascript'
}
```

**3. AI Model Node (Llama 3.3 70B)**
```javascript
// Input: Prompt text
// API Call:
await apiClient.chatWithAI({
  prompt: inputData.prompt,
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  maxTokens: 1000
});

// Output:
{
  type: 'ai-response',
  response: 'AI generated response...',
  model: 'llama-3.3-70b-versatile',
  usage: { total_tokens: 150 }
}
```

### 4. **UX Improvements**

#### ✅ Kiểm Tra Quyền (Authentication)
```javascript
// Trước khi chạy bất kỳ Node nào
if (!hasValidAuth()) {
  alert('Vui lòng đăng nhập để sử dụng AI');
  return;
}
```

#### ⏳ Loading States

**1. Node Level Loading**
- Status: `idle` → `running` → `success`/`error`
- Visual feedback: Pulse animation, spinner overlay
- Status icon thay đổi theo trạng thái

**2. Workflow Level Loading**
```javascript
// Progress overlay hiển thị:
{
  current: 2,
  total: 5,
  status: 'executing',
  node: currentNode
}
```

**3. Edge Animation**
- Edges được animate khi data flow qua
- Success state: Green glow effect
- Error state: Red glow effect

#### 🎨 Visual Feedback

**Node Status Colors:**
- `idle`: Gray border, dim background
- `running`: Blue border, pulse animation
- `success`: Green border, checkmark icon
- `error`: Red border, X icon

**Result Display:**
- Kết quả hiển thị trong expandable section
- Syntax highlighting cho code
- Timestamp và token usage
- Copy button cho kết quả

## 📝 Cách Sử Dụng

### Bước 1: Tạo Workflow
1. Kéo **Prompt Node** vào canvas
2. Nhập prompt text vào PromptNode
3. Kéo **AI Model Node** (Llama 3.3 70B) vào canvas
4. Kết nối Prompt Node → AI Model Node

### Bước 2: Cấu Hình
1. Click vào AI Model Node
2. Chọn model (Llama 3.1 hoặc 3.3)
3. Điều chỉnh temperature, maxTokens (optional)

### Bước 3: Chạy Workflow
1. Nhấn nút **"Run Workflow"** (màu xanh lá, góc dưới)
2. Hệ thống sẽ:
   - Kiểm tra authentication
   - Thực thi từng node theo thứ tự
   - Hiển thị progress
   - Cập nhật kết quả

### Bước 4: Xem Kết Quả
1. Kết quả hiển thị trong mỗi Node
2. Click vào Node để xem chi tiết
3. Expand để xem full response
4. Copy kết quả nếu cần

## 🔧 API Configuration

### Environment Variables
```bash
# .env.local
VITE_API_URL=https://back-end-auto-office-f8xt.vercel.app
```

### Authentication
```javascript
// Token được lưu trong localStorage
localStorage.getItem('office_weave_token')

// Kiểm tra auth
import { hasValidAuth } from './lib/api.js';
if (!hasValidAuth()) {
  // Redirect to login
}
```

## 🐛 Error Handling

### 1. Authentication Errors
```javascript
// 401 Unauthorized
if (error.status === 401) {
  alert('Vui lòng đăng nhập lại');
  // Redirect to login
}
```

### 2. API Errors
```javascript
// Sử dụng handleApiError helper
import { handleApiError } from './lib/api.js';

try {
  await apiClient.chatWithAI(params);
} catch (error) {
  const message = handleApiError(error);
  alert(message);
}
```

### 3. Node Execution Errors
- Node status → `error`
- Error message hiển thị trong console
- Workflow dừng lại tại node lỗi
- User được thông báo qua alert

## 🎯 Best Practices

### 1. Prompt Engineering
- Viết prompt rõ ràng, cụ thể
- Sử dụng variables cho dynamic content
- Test với model nhỏ trước (Llama 3.1 8B)

### 2. Model Selection
- **Llama 3.1 8B**: Fast, cheap, good for simple tasks
- **Llama 3.3 70B**: Slower, more expensive, better quality

### 3. Error Recovery
- Luôn kiểm tra auth trước khi chạy
- Handle API errors gracefully
- Provide clear error messages

### 4. Performance
- Limit maxTokens để giảm cost
- Use lower temperature cho deterministic results
- Chain nodes efficiently

## 📚 Code Examples

### Example 1: Simple Prompt → AI
```javascript
// Workflow:
// [Prompt Node] → [Llama 3.3 70B]

// Prompt Node data:
{
  value: "Write a React component for a todo list",
  variables: []
}

// AI Model Node sẽ nhận:
{
  prompt: "Write a React component for a todo list"
}

// Kết quả:
{
  response: "import React, { useState } from 'react'...",
  model: "llama-3.3-70b-versatile"
}
```

### Example 2: Research → Code
```javascript
// Workflow:
// [Prompt] → [Research] → [Code Generator]

// Flow:
// 1. Prompt: "Best practices for React hooks"
// 2. Research: Tìm kiếm và tổng hợp thông tin
// 3. Code Generator: Tạo code examples dựa trên research
```

### Example 3: Multi-Model Pipeline
```javascript
// Workflow:
// [Prompt] → [Llama 3.1] → [Llama 3.3] → [Output]

// Use case:
// 1. Llama 3.1: Generate draft (fast)
// 2. Llama 3.3: Refine and improve (quality)
```

## 🚀 Next Steps

### Planned Features
- [ ] PDF Analyzer integration
- [ ] Image generation with DALL-E
- [ ] Video generation with Runway
- [ ] Workflow templates
- [ ] Result export (JSON, Markdown)
- [ ] Workflow sharing
- [ ] Real-time collaboration

### API Endpoints to Implement
```javascript
// PDF Analysis
apiClient.analyzePDF(file)

// Image Generation
apiClient.generateImage(prompt, style)

// Video Generation
apiClient.generateVideo(script, duration)
```

## 📞 Support

Nếu gặp vấn đề:
1. Check console logs
2. Verify authentication token
3. Check API endpoint availability
4. Review error messages

---

**Tóm tắt:** Workflow execution đã được tích hợp hoàn toàn với API thật. Dữ liệu flow tự động giữa các nodes, authentication được kiểm tra, và kết quả được hiển thị real-time với UX feedback đầy đủ.
