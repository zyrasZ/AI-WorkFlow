# ⚡ Frontend Quick Reference - Google OAuth

## 🚀 TL;DR - Cách nhanh nhất

### **1. Add Login Button**
```tsx
<a href="/api/auth/google">
  <button>Sign in with Google</button>
</a>
```

### **2. Create Success Page** (`/auth/success`)
```tsx
'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthSuccess() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const token = searchParams.get('access_token');
    if (token) {
      localStorage.setItem('access_token', token);
      window.location.href = '/dashboard';
    }
  }, []);
  
  return <div>Authenticating...</div>;
}
```

### **3. Create Error Page** (`/auth/error`)
```tsx
'use client';
import { useSearchParams } from 'next/navigation';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('message');
  
  return (
    <div>
      <h1>Login Failed</h1>
      <p>{error}</p>
      <a href="/login">Try Again</a>
    </div>
  );
}
```

### **4. Get User Info**
```tsx
const token = localStorage.getItem('access_token');
const response = await fetch('/api/auth/user', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data } = await response.json();
console.log(data); // { id, email, name, avatar_url, provider }
```

---

## 📋 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/google` | GET | Redirect to Google OAuth |
| `/api/auth/google` | POST | Get OAuth URL (JSON) |
| `/api/auth/user` | GET | Get current user info |

---

## 🔑 Response Format

### **User Object**
```typescript
{
  id: string;              // UUID
  email: string;           // user@gmail.com
  name: string;            // John Doe
  avatar_url?: string;     // Google profile picture
  provider: string;        // "google" or "email"
  email_verified: boolean; // true/false
  created_at: string;      // ISO date
  last_sign_in_at: string; // ISO date
}
```

---

## 🎨 Copy-Paste Components

### **Google Button (Styled)**
```tsx
export function GoogleButton() {
  return (
    <button
      onClick={() => window.location.href = '/api/auth/google'}
      className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
    >
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Sign in with Google
    </button>
  );
}
```

### **Auth Hook**
```tsx
// hooks/useAuth.ts
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setUser(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    window.location.href = '/';
  };

  return { user, loading, logout };
}
```

### **Protected Route**
```tsx
// components/ProtectedRoute.tsx
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;
  
  return children;
}
```

---

## 🔄 OAuth Flow

```
User clicks button
  ↓
Redirect to /api/auth/google
  ↓
Google OAuth page
  ↓
User authorizes
  ↓
Redirect to /auth/success?access_token=xxx
  ↓
Store token → Fetch user → Redirect to dashboard
```

---

## ⚠️ Common Mistakes

### ❌ **Wrong:**
```tsx
// Don't store token in state only
const [token, setToken] = useState('');
```

### ✅ **Correct:**
```tsx
// Store in localStorage or cookie
localStorage.setItem('access_token', token);
```

---

### ❌ **Wrong:**
```tsx
// Don't forget Authorization header
fetch('/api/auth/user')
```

### ✅ **Correct:**
```tsx
fetch('/api/auth/user', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

---

## 🐛 Debugging

### **Check if backend is ready:**
```bash
curl http://localhost:3000/api/auth/google -X POST
```

### **Check token:**
```javascript
console.log(localStorage.getItem('access_token'));
```

### **Check user:**
```javascript
const token = localStorage.getItem('access_token');
fetch('/api/auth/user', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log);
```

---

## 📞 Need Help?

- **Full Guide:** `doc/Frontend-Google-OAuth-Integration.md`
- **API Docs:** `doc/Google-OAuth-API-Documentation.md`
- **Test Page:** `http://localhost:3000/test-google-oauth.html`

---

**Created:** 2026-04-27  
**Status:** ✅ Ready to Use
