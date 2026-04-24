# API Integration Guide

## 📦 Files Created

1. **`.env.local`** - Environment variables
2. **`src/lib/api.js`** - API client with all methods
3. **`src/hooks/useAuth.js`** - Authentication React hook

## 🚀 Quick Start

### 1. Install Dependencies (if needed)

No additional dependencies required! Uses native `fetch` API.

### 2. Wrap App with AuthProvider

Update `src/main.jsx`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
```

### 3. Use Authentication in Components

```jsx
import { useAuth } from './hooks/useAuth'

function MyComponent() {
  const { user, loading, login, logout, isAuthenticated } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!isAuthenticated) {
    return (
      <button onClick={() => login('user@example.com', 'password')}>
        Login
      </button>
    )
  }

  return (
    <div>
      <p>Welcome {user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### 4. Use API Client Directly

```jsx
import { apiClient, handleApiError } from './lib/api'

async function createWorkflow() {
  try {
    const response = await apiClient.createWorkflow({
      name: 'My Workflow',
      description: 'Test workflow',
      nodes: [],
      edges: [],
    })
    console.log('Created:', response.data)
  } catch (error) {
    console.error(handleApiError(error))
  }
}
```

## 📚 API Methods

### Authentication

```javascript
// Sign up
await apiClient.signup('user@example.com', 'password123')

// Login
await apiClient.login('user@example.com', 'password123')

// Get current user
await apiClient.getCurrentUser()

// Logout
await apiClient.logout()
```

### Workflows

```javascript
// Create workflow
await apiClient.createWorkflow({
  name: 'My Workflow',
  description: 'Description',
  nodes: [...],
  edges: [...],
  metadata: { tags: ['automation'] }
})

// Get all workflows
await apiClient.getWorkflows({ 
  search: 'automation', 
  limit: 20, 
  offset: 0 
})

// Get single workflow
await apiClient.getWorkflow('workflow-id')

// Update workflow
await apiClient.updateWorkflow('workflow-id', {
  name: 'Updated Name',
  nodes: [...]
})

// Delete workflow
await apiClient.deleteWorkflow('workflow-id')
```

### AI Chat

```javascript
await apiClient.chatWithAI({
  prompt: 'Write a professional email',
  provider: 'groq', // 'groq', 'gemini', or 'openai'
  temperature: 0.7,
  maxTokens: 1000,
  systemPrompt: 'You are a helpful assistant'
})
```

### Executions

```javascript
// Create execution
await apiClient.createExecution('workflow-id')

// Get executions
await apiClient.getExecutions({
  workflow_id: 'workflow-id',
  status: 'completed',
  limit: 20
})

// Get single execution
await apiClient.getExecution('execution-id')

// Update execution
await apiClient.updateExecution('execution-id', {
  status: 'completed',
  results: { ... }
})
```

### Settings

```javascript
// Get settings
await apiClient.getSettings()

// Update settings
await apiClient.updateSettings({
  email_config: {
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    from_email: 'user@example.com'
  },
  preferences: {
    theme: 'dark',
    language: 'vi'
  }
})
```

## 🔒 Authentication Flow

1. User calls `login()` or `signup()`
2. Backend sets `sb-auth-token` cookie (httpOnly, secure)
3. All subsequent requests automatically include cookie
4. Use `getCurrentUser()` to check auth status
5. Call `logout()` to clear session

## ⚠️ Error Handling

```javascript
import { handleApiError } from './lib/api'

try {
  await apiClient.login(email, password)
} catch (error) {
  const userMessage = handleApiError(error)
  alert(userMessage) // User-friendly Vietnamese message
}
```

## 🎯 Example: Login Form

```jsx
import { useState } from 'react'
import { useAuth } from './hooks/useAuth'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await login(email, password)
      // Redirect to dashboard
    } catch (err) {
      // Error is already set in useAuth
      console.error(err)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  )
}
```

## 🎯 Example: Workflow List

```jsx
import { useState, useEffect } from 'react'
import { apiClient, handleApiError } from './lib/api'

export default function WorkflowList() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadWorkflows()
  }, [])

  async function loadWorkflows() {
    try {
      setLoading(true)
      const response = await apiClient.getWorkflows({ limit: 20 })
      setWorkflows(response.data.workflows)
    } catch (err) {
      setError(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  async function deleteWorkflow(id) {
    if (!confirm('Xóa workflow này?')) return
    
    try {
      await apiClient.deleteWorkflow(id)
      setWorkflows(workflows.filter(w => w.id !== id))
    } catch (err) {
      alert(handleApiError(err))
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>My Workflows</h2>
      {workflows.map(workflow => (
        <div key={workflow.id}>
          <h3>{workflow.name}</h3>
          <p>{workflow.description}</p>
          <button onClick={() => deleteWorkflow(workflow.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
```

## 🎯 Example: AI Chat

```jsx
import { useState } from 'react'
import { apiClient, handleApiError } from './lib/api'

export default function AIChat() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    
    try {
      setLoading(true)
      const result = await apiClient.chatWithAI({
        prompt,
        provider: 'groq',
        temperature: 0.7,
      })
      setResponse(result.data.response)
    } catch (err) {
      alert(handleApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI anything..."
          rows={4}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>
      
      {response && (
        <div>
          <h3>AI Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  )
}
```

## 📝 Notes

- **Cookies**: Authentication uses httpOnly cookies, automatically sent with requests
- **CORS**: Backend configured to allow all origins
- **Rate Limiting**: AI endpoints limited to 20 requests/minute/user
- **Error Messages**: All in Vietnamese for better UX

## 🔗 Backend URL

**Production**: https://back-end-auto-office-f8xt.vercel.app

## ✅ Checklist

- [x] Created `.env.local` with API URL and Supabase keys
- [x] Created `src/lib/api.js` with all API methods
- [x] Created `src/hooks/useAuth.js` for authentication
- [ ] Wrap app with `<AuthProvider>`
- [ ] Update SignIn component to use real API
- [ ] Test authentication flow
- [ ] Implement workflow CRUD
- [ ] Test AI chat functionality

---

**Ready to use!** 🚀
