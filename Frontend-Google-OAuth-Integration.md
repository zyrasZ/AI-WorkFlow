# 🎨 Frontend Integration Guide - Google OAuth Login

## 📋 Tổng quan

Backend đã implement Google OAuth authentication. Document này hướng dẫn Frontend team cách integrate tính năng đăng nhập bằng Google.

---

## 🚀 Quick Start

### **Option 1: Simple Link (Recommended)**

```html
<a href="/api/auth/google">
  <button>Sign in with Google</button>
</a>
```

### **Option 2: API Call**

```typescript
async function loginWithGoogle() {
  const response = await fetch('/api/auth/google', {
    method: 'POST'
  });
  const data = await response.json();
  
  if (data.success) {
    window.location.href = data.data.url;
  }
}
```

---

## 🔌 API Endpoints

### 1. **Initiate Google OAuth**

#### **GET /api/auth/google** (Direct Redirect)
```typescript
// Simple redirect - no API call needed
<a href="/api/auth/google">Sign in with Google</a>
```

#### **POST /api/auth/google** (Get OAuth URL)
```typescript
// Request
POST /api/auth/google
Content-Type: application/json
{}

// Response
{
  "success": true,
  "data": {
    "url": "https://accounts.google.com/o/oauth2/v2/auth?...",
    "provider": "google"
  }
}
```

---

### 2. **Handle OAuth Callback**

Backend tự động xử lý callback và redirect về frontend.

**Success:** `{APP_URL}/auth/success?access_token={token}`  
**Error:** `{APP_URL}/auth/error?message={error}`

---

### 3. **Get User Info**

```typescript
// Request
GET /api/auth/user
Authorization: Bearer {access_token}

// Response
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@gmail.com",
    "name": "John Doe",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "provider": "google",
    "email_verified": true,
    "created_at": "2026-04-27T10:00:00Z",
    "last_sign_in_at": "2026-04-27T12:00:00Z"
  }
}
```

---

## 💻 Implementation Examples

### **React/Next.js Example**

#### **1. Login Component**

```typescript
// components/GoogleLoginButton.tsx
'use client';

import { useState } from 'react';

export default function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      
      // Option 1: Direct redirect (simplest)
      window.location.href = '/api/auth/google';
      
      // Option 2: Get URL first (more control)
      // const response = await fetch('/api/auth/google', {
      //   method: 'POST'
      // });
      // const data = await response.json();
      // if (data.success) {
      //   window.location.href = data.data.url;
      // }
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
    >
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {loading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  );
}
```

---

#### **2. Callback Handler (Success Page)**

```typescript
// app/auth/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get access token from URL
        const accessToken = searchParams.get('access_token');
        
        if (!accessToken) {
          setError('No access token received');
          return;
        }

        // Store token
        localStorage.setItem('access_token', accessToken);
        // Or use cookies for better security
        // document.cookie = `access_token=${accessToken}; path=/; secure; httponly`;

        // Get user info
        const response = await fetch('/api/auth/user', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        const data = await response.json();

        if (data.success) {
          setUser(data.data);
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setError(data.error || 'Failed to get user info');
        }
      } catch (err) {
        setError('Authentication failed');
        console.error(err);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Authentication Failed
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="mb-4">
          {user.avatar_url && (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-20 h-20 rounded-full mx-auto mb-4"
            />
          )}
          <h1 className="text-2xl font-bold text-green-600 mb-2">
            Welcome, {user.name}!
          </h1>
          <p className="text-gray-600">{user.email}</p>
        </div>
        <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
```

---

#### **3. Error Handler (Error Page)**

```typescript
// app/auth/error/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorMessage = searchParams.get('message') || 'Authentication failed';

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Authentication Failed
        </h1>
        <p className="text-gray-600 mb-6">{errorMessage}</p>
        <div className="space-x-4">
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

#### **4. Auth Context (Optional - for global state)**

```typescript
// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider: string;
  email_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data);
      } else {
        localStorage.removeItem('access_token');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = () => {
    window.location.href = '/api/auth/google';
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    window.location.href = '/';
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

---

#### **5. Protected Route Component**

```typescript
// components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

---

### **Vue.js Example**

```vue
<!-- components/GoogleLoginButton.vue -->
<template>
  <button
    @click="handleGoogleLogin"
    :disabled="loading"
    class="google-login-btn"
  >
    <svg width="20" height="20" viewBox="0 0 24 24">
      <!-- Google icon SVG paths -->
    </svg>
    {{ loading ? 'Signing in...' : 'Sign in with Google' }}
  </button>
</template>

<script setup>
import { ref } from 'vue';

const loading = ref(false);

const handleGoogleLogin = async () => {
  try {
    loading.value = true;
    window.location.href = '/api/auth/google';
  } catch (error) {
    console.error('Login failed:', error);
    loading.value = false;
  }
};
</script>

<style scoped>
.google-login-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
}

.google-login-btn:hover {
  background: #f5f5f5;
}

.google-login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
```

---

### **Angular Example**

```typescript
// google-login.component.ts
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-google-login',
  template: `
    <button 
      (click)="handleGoogleLogin()"
      [disabled]="loading"
      class="google-login-btn"
    >
      <svg width="20" height="20" viewBox="0 0 24 24">
        <!-- Google icon -->
      </svg>
      {{ loading ? 'Signing in...' : 'Sign in with Google' }}
    </button>
  `
})
export class GoogleLoginComponent {
  loading = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  handleGoogleLogin() {
    this.loading = true;
    window.location.href = '/api/auth/google';
  }
}
```

---

## 🎨 UI Components

### **Google Sign-In Button (Styled)**

```tsx
// components/GoogleSignInButton.tsx
export default function GoogleSignInButton() {
  return (
    <button
      onClick={() => window.location.href = '/api/auth/google'}
      className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
    >
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>Sign in with Google</span>
    </button>
  );
}
```

---

## 🔐 Token Management

### **Store Token Securely**

```typescript
// utils/auth.ts

// Option 1: localStorage (simple but less secure)
export function saveToken(token: string) {
  localStorage.setItem('access_token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('access_token');
}

export function removeToken() {
  localStorage.removeItem('access_token');
}

// Option 2: Secure cookie (recommended)
export function saveTokenToCookie(token: string) {
  document.cookie = `access_token=${token}; path=/; secure; samesite=strict; max-age=3600`;
}

export function getTokenFromCookie(): string | null {
  const match = document.cookie.match(/access_token=([^;]+)/);
  return match ? match[1] : null;
}

export function removeTokenFromCookie() {
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}
```

---

### **API Client with Auth**

```typescript
// utils/api.ts

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('access_token');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  return response.json();
}

// Usage
const user = await apiCall('/api/auth/user');
const workflows = await apiCall('/api/workflows');
```

---

## 🔄 OAuth Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  1. User clicks "Sign in with Google"                   │
│     Frontend: window.location.href = '/api/auth/google' │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  2. Backend generates OAuth URL                         │
│     Redirects to Google OAuth page                       │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  3. User authorizes on Google                           │
│     Google redirects back with code                      │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  4. Backend handles callback                            │
│     Exchanges code for tokens                            │
│     Creates/updates user in Supabase                     │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  5. Backend redirects to frontend                       │
│     Success: /auth/success?access_token={token}         │
│     Error: /auth/error?message={error}                  │
└────────────────────┬────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────┐
│  6. Frontend handles callback                           │
│     Stores token                                         │
│     Fetches user info                                    │
│     Redirects to dashboard                               │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing

### **Test Page Available**

Backend đã cung cấp test page:
```
http://localhost:3000/test-google-oauth.html
```

### **Manual Testing Steps**

1. Start backend server:
   ```bash
   cd sourse/Back-end
   npm run dev
   ```

2. Open test page or your frontend app

3. Click "Sign in with Google"

4. Authorize with Google account

5. Verify redirect back to app

6. Check user info displays correctly

7. Test logout

8. Test re-login

---

## ❌ Error Handling

### **Common Errors**

```typescript
// Handle OAuth errors
try {
  const response = await fetch('/api/auth/user', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!data.success) {
    switch (response.status) {
      case 401:
        // Token expired or invalid
        handleTokenExpired();
        break;
      case 403:
        // Forbidden
        showError('Access denied');
        break;
      case 500:
        // Server error
        showError('Server error. Please try again.');
        break;
      default:
        showError(data.error || 'Unknown error');
    }
  }
} catch (error) {
  showError('Network error. Please check your connection.');
}
```

---

## 🔒 Security Best Practices

### **1. Token Storage**
- ✅ Use httpOnly cookies (most secure)
- ⚠️ Use localStorage (simple but less secure)
- ❌ Never store in URL or query params

### **2. Token Validation**
```typescript
// Always validate token before using
const token = getToken();
if (!token) {
  redirectToLogin();
  return;
}

// Check token expiration
const isExpired = checkTokenExpiration(token);
if (isExpired) {
  refreshToken();
}
```

### **3. HTTPS Only**
- Always use HTTPS in production
- OAuth will not work over HTTP in production

### **4. CORS Configuration**
- Backend already configured CORS
- Make sure frontend domain is allowed

---

## 📝 Environment Variables

### **Frontend .env**

```bash
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:3000

# OAuth Redirect URLs
NEXT_PUBLIC_OAUTH_REDIRECT_URL=http://localhost:3000/auth/callback

# Production
# NEXT_PUBLIC_API_URL=https://your-domain.com
# NEXT_PUBLIC_OAUTH_REDIRECT_URL=https://your-domain.com/auth/callback
```

---

## 🚀 Production Deployment

### **Checklist**

- [ ] Update `NEXT_PUBLIC_API_URL` to production URL
- [ ] Update `NEXT_PUBLIC_OAUTH_REDIRECT_URL` to production URL
- [ ] Ensure HTTPS is enabled
- [ ] Test OAuth flow on production domain
- [ ] Configure CORS for production domain
- [ ] Set up error monitoring (Sentry, etc.)

---

## 📞 Support

### **Backend API Documentation**
- Full API docs: `doc/Google-OAuth-API-Documentation.md`
- Setup guide: `doc/Google-OAuth-Setup-Guide.md`
- Quick start: `sourse/Back-end/GOOGLE_OAUTH_README.md`

### **Test Endpoint**
```bash
# Test if backend is ready
curl http://localhost:3000/api/auth/google -X POST

# Should return OAuth URL
```

### **Common Issues**

1. **"redirect_uri_mismatch"**
   - Check OAuth redirect URLs in Google Console
   - Must match exactly with backend configuration

2. **"Unauthorized"**
   - Token expired or invalid
   - Clear token and login again

3. **"CORS error"**
   - Backend CORS not configured for your domain
   - Contact backend team

---

## ✅ Checklist

### **Frontend Implementation**
- [ ] Add Google Sign-In button
- [ ] Create `/auth/success` page
- [ ] Create `/auth/error` page
- [ ] Implement token storage
- [ ] Implement user state management
- [ ] Add protected routes
- [ ] Handle token expiration
- [ ] Add logout functionality
- [ ] Test OAuth flow
- [ ] Handle errors gracefully

### **Testing**
- [ ] Test login flow
- [ ] Test callback handling
- [ ] Test user info display
- [ ] Test logout
- [ ] Test token expiration
- [ ] Test error scenarios
- [ ] Test on different browsers
- [ ] Test on mobile devices

---

## 🎉 Ready to Integrate!

Backend Google OAuth is ready. Follow this guide to integrate into your frontend application.

**Questions?** Contact backend team or check documentation in `doc/` folder.

---

**Created:** 2026-04-27  
**Backend Version:** 1.0.0  
**Status:** ✅ Ready for Frontend Integration
