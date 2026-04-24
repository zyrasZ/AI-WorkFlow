# Backend Configuration for Frontend

## 🔗 Backend URL

**Production Backend:** `https://back-end-auto-office-f8xt.vercel.app`

**Local Development:** `http://localhost:3000`

---

## 📋 Environment Variables cho Frontend

Thêm các biến sau vào file `.env` hoặc `.env.local` của frontend:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=https://back-end-auto-office-f8xt.vercel.app
# hoặc cho development:
# NEXT_PUBLIC_API_URL=http://localhost:3000

# Supabase Configuration (giống với backend)
NEXT_PUBLIC_SUPABASE_URL=https://fzahzvxgilcrifreozsw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6YWh6dnhnaWxjcmlmcmVvenN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NTE2OTgsImV4cCI6MjA5MjUyNzY5OH0.zY2MtYKP9eX4i4LEv1G81Ah0a5bfkh0G7NbRgpMwO9I
```

---

## 🚀 API Endpoints

### Base URL
```javascript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://back-end-auto-office-f8xt.vercel.app';
```

### Authentication Endpoints

#### 1. Đăng ký (Sign Up)
```javascript
POST ${API_BASE_URL}/api/auth/signup
Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (201):
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### 2. Đăng nhập (Login)
```javascript
POST ${API_BASE_URL}/api/auth/login
Content-Type: application/json

Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com"
    },
    "session": {
      "access_token": "jwt-token",
      "refresh_token": "refresh-token",
      "expires_at": 1234567890
    }
  }
}
```

#### 3. Đăng xuất (Logout)
```javascript
POST ${API_BASE_URL}/api/auth/logout
Cookie: sb-auth-token (tự động)

Response (200):
{
  "data": {
    "message": "Logged out successfully"
  }
}
```

#### 4. Lấy thông tin user hiện tại
```javascript
GET ${API_BASE_URL}/api/auth/user
Cookie: sb-auth-token (tự động)

Response (200):
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

### Workflow Endpoints

#### 1. Tạo workflow
```javascript
POST ${API_BASE_URL}/api/workflows
Content-Type: application/json
Cookie: sb-auth-token (tự động)

Body:
{
  "name": "My Workflow",
  "description": "Workflow description",
  "nodes": [
    {
      "id": "node-1",
      "type": "trigger",
      "position": { "x": 100, "y": 100 },
      "config": { "type": "manual" }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2"
    }
  ],
  "metadata": {
    "tags": ["automation"],
    "version": "1.0.0"
  }
}

Response (201):
{
  "data": {
    "id": "uuid",
    "name": "My Workflow",
    "description": "Workflow description",
    "nodes": [...],
    "edges": [...],
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 2. Lấy danh sách workflows
```javascript
GET ${API_BASE_URL}/api/workflows?search=automation&limit=20&offset=0
Cookie: sb-auth-token (tự động)

Response (200):
{
  "data": {
    "workflows": [
      {
        "id": "uuid",
        "name": "My Workflow",
        "description": "Description",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 50,
    "limit": 20,
    "offset": 0
  }
}
```

#### 3. Lấy chi tiết workflow
```javascript
GET ${API_BASE_URL}/api/workflows/:id
Cookie: sb-auth-token (tự động)

Response (200):
{
  "data": {
    "id": "uuid",
    "name": "My Workflow",
    "description": "Description",
    "nodes": [...],
    "edges": [...],
    "metadata": {...},
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 4. Cập nhật workflow
```javascript
PUT ${API_BASE_URL}/api/workflows/:id
Content-Type: application/json
Cookie: sb-auth-token (tự động)

Body:
{
  "name": "Updated Name",
  "description": "Updated description",
  "nodes": [...],
  "edges": [...]
}

Response (200):
{
  "data": {
    "id": "uuid",
    "name": "Updated Name",
    ...
  }
}
```

#### 5. Xóa workflow
```javascript
DELETE ${API_BASE_URL}/api/workflows/:id
Cookie: sb-auth-token (tự động)

Response (200):
{
  "data": {
    "message": "Workflow deleted successfully"
  }
}
```

---

### AI Endpoints

#### 1. Chat với AI
```javascript
POST ${API_BASE_URL}/api/ai/chat
Content-Type: application/json
Cookie: sb-auth-token (tự động)

Body:
{
  "prompt": "Write a professional email",
  "provider": "groq",  // "groq", "gemini", hoặc "openai"
  "temperature": 0.7,
  "maxTokens": 1000,
  "systemPrompt": "You are a helpful assistant"
}

Response (200):
{
  "data": {
    "response": "Here is a professional email...",
    "usage": {
      "prompt_tokens": 10,
      "completion_tokens": 50,
      "total_tokens": 60
    },
    "metadata": {
      "model": "llama-3.3-70b-versatile",
      "duration": 1234
    }
  }
}

Response Headers:
X-RateLimit-Remaining: 19

Rate Limit: 20 requests/phút/user
```

---

### Execution Endpoints

#### 1. Tạo execution
```javascript
POST ${API_BASE_URL}/api/executions
Content-Type: application/json
Cookie: sb-auth-token (tự động)

Body:
{
  "workflow_id": "uuid",
  "status": "running"
}

Response (201):
{
  "data": {
    "id": "uuid",
    "workflow_id": "uuid",
    "status": "running",
    "started_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 2. Lấy danh sách executions
```javascript
GET ${API_BASE_URL}/api/executions?workflow_id=uuid&status=completed&limit=20
Cookie: sb-auth-token (tự động)

Response (200):
{
  "data": {
    "executions": [
      {
        "id": "uuid",
        "workflow_id": "uuid",
        "workflow_name": "My Workflow",
        "status": "completed",
        "started_at": "2024-01-01T00:00:00Z",
        "completed_at": "2024-01-01T00:01:00Z",
        "duration": 60
      }
    ],
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

#### 3. Lấy chi tiết execution
```javascript
GET ${API_BASE_URL}/api/executions/:id
Cookie: sb-auth-token (tự động)

Response (200):
{
  "data": {
    "id": "uuid",
    "workflow_id": "uuid",
    "workflow_name": "My Workflow",
    "status": "completed",
    "results": {
      "node-1": { "output": "data" }
    },
    "error": null,
    "started_at": "2024-01-01T00:00:00Z",
    "completed_at": "2024-01-01T00:01:00Z",
    "duration": 60
  }
}
```

#### 4. Cập nhật execution
```javascript
PATCH ${API_BASE_URL}/api/executions/:id
Content-Type: application/json
Cookie: sb-auth-token (tự động)

Body:
{
  "status": "completed",
  "results": {
    "node-1": { "output": "data" }
  },
  "error": null
}

Response (200):
{
  "data": {
    "id": "uuid",
    "status": "completed",
    "results": {...},
    "completed_at": "2024-01-01T00:01:00Z"
  }
}
```

---

### Settings Endpoints

#### 1. Lấy settings
```javascript
GET ${API_BASE_URL}/api/settings
Cookie: sb-auth-token (tự động)

Response (200):
{
  "data": {
    "user_id": "uuid",
    "email_config": {
      "smtp_host": "smtp.gmail.com",
      "smtp_port": 587,
      "from_email": "user@example.com"
    },
    "preferences": {
      "theme": "dark",
      "language": "vi"
    }
  }
}
```

#### 2. Cập nhật settings
```javascript
PUT ${API_BASE_URL}/api/settings
Content-Type: application/json
Cookie: sb-auth-token (tự động)

Body:
{
  "email_config": {
    "smtp_host": "smtp.gmail.com",
    "smtp_port": 587,
    "from_email": "user@example.com",
    "smtp_password": "password"
  },
  "preferences": {
    "theme": "dark",
    "language": "vi"
  }
}

Response (200):
{
  "data": {
    "user_id": "uuid",
    "email_config": {...},
    "preferences": {...},
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## 💻 Code Examples cho Frontend

### 1. API Client Setup (JavaScript/TypeScript)

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://back-end-auto-office-f8xt.vercel.app';

export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Quan trọng: Gửi cookies
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  },

  // Auth methods
  async signup(email: string, password: string) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  },

  async getCurrentUser() {
    return this.request('/api/auth/user');
  },

  // Workflow methods
  async createWorkflow(workflow: any) {
    return this.request('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
  },

  async getWorkflows(params?: { search?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/workflows${query ? `?${query}` : ''}`);
  },

  async getWorkflow(id: string) {
    return this.request(`/api/workflows/${id}`);
  },

  async updateWorkflow(id: string, updates: any) {
    return this.request(`/api/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteWorkflow(id: string) {
    return this.request(`/api/workflows/${id}`, {
      method: 'DELETE',
    });
  },

  // AI methods
  async chatWithAI(params: {
    prompt: string;
    provider: 'groq' | 'gemini' | 'openai';
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }) {
    return this.request('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Execution methods
  async createExecution(workflowId: string) {
    return this.request('/api/executions', {
      method: 'POST',
      body: JSON.stringify({ workflow_id: workflowId, status: 'running' }),
    });
  },

  async getExecutions(params?: { workflow_id?: string; status?: string; limit?: number; offset?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/executions${query ? `?${query}` : ''}`);
  },

  async getExecution(id: string) {
    return this.request(`/api/executions/${id}`);
  },

  async updateExecution(id: string, updates: any) {
    return this.request(`/api/executions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Settings methods
  async getSettings() {
    return this.request('/api/settings');
  },

  async updateSettings(settings: any) {
    return this.request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};
```

### 2. React Hook Example

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await apiClient.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await apiClient.login(email, password);
    setUser(response.data.user);
    return response;
  }

  async function signup(email: string, password: string) {
    const response = await apiClient.signup(email, password);
    setUser(response.data.user);
    return response;
  }

  async function logout() {
    await apiClient.logout();
    setUser(null);
  }

  return { user, loading, login, signup, logout, checkAuth };
}
```

### 3. Usage Example

```typescript
// pages/login.tsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

---

## 🔒 Authentication Flow

1. **Đăng ký/Đăng nhập**: Frontend gọi `/api/auth/signup` hoặc `/api/auth/login`
2. **Cookie tự động**: Backend set cookie `sb-auth-token` (httpOnly, secure)
3. **Authenticated requests**: Tất cả requests sau đó tự động gửi cookie
4. **Check auth**: Gọi `/api/auth/user` để kiểm tra trạng thái đăng nhập
5. **Đăng xuất**: Gọi `/api/auth/logout` để xóa session

**Quan trọng**: Phải set `credentials: 'include'` trong fetch options để gửi cookies!

---

## ⚠️ Error Handling

Tất cả errors có format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (chưa đăng nhập)
- `403`: Forbidden (không có quyền)
- `404`: Not Found
- `429`: Too Many Requests (rate limit)
- `500`: Internal Server Error

---

## 📊 Rate Limiting

**AI Endpoints**: 20 requests/phút/user

Response headers khi gọi AI:
```
X-RateLimit-Remaining: 19
```

Khi vượt quá limit (429):
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

Headers:
```
Retry-After: 60
```

---

## 🧪 Testing

### Test với cURL

```bash
# Signup
curl -X POST https://back-end-auto-office-f8xt.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Login và lưu cookie
curl -X POST https://back-end-auto-office-f8xt.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  -c cookies.txt

# Get user (với cookie)
curl https://back-end-auto-office-f8xt.vercel.app/api/auth/user \
  -b cookies.txt

# Create workflow
curl -X POST https://back-end-auto-office-f8xt.vercel.app/api/workflows \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name":"Test","nodes":[],"edges":[]}'

# AI Chat
curl -X POST https://back-end-auto-office-f8xt.vercel.app/api/ai/chat \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"prompt":"Hello","provider":"groq"}'
```

---

## 📝 Notes

- **CORS**: Backend đã cấu hình CORS cho phép tất cả origins trong production
- **Cookies**: Authentication sử dụng httpOnly cookies, tự động được gửi với mỗi request
- **Timestamps**: Tất cả timestamps ở định dạng ISO 8601 (UTC)
- **IDs**: Tất cả IDs là UUID v4
- **AI Provider**: Khuyến nghị dùng `groq` (nhanh, miễn phí, model mới nhất)

---

## 🔗 Links

- **Backend Production**: https://back-end-auto-office-f8xt.vercel.app
- **Supabase Dashboard**: https://supabase.com/dashboard/project/fzahzvxgilcrifreozsw
- **API Documentation**: Xem file `doc/API.md` để biết chi tiết đầy đủ

---

## ✅ Checklist cho Frontend Developer

- [ ] Thêm `NEXT_PUBLIC_API_URL` vào `.env.local`
- [ ] Thêm Supabase keys vào `.env.local`
- [ ] Tạo API client với `credentials: 'include'`
- [ ] Implement authentication flow
- [ ] Handle errors và rate limiting
- [ ] Test tất cả endpoints
- [ ] Implement loading states
- [ ] Add error boundaries

---

**Last Updated**: 2024-01-01
**Backend Version**: 1.0.0
**API Version**: v1
