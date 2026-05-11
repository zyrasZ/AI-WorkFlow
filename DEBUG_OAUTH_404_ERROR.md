# Debug OAuth 404 Error

## 🔍 Vấn Đề Hiện Tại

**Triệu chứng**:
- OAuth callback thành công (status 200)
- User được authenticate
- Nhưng sau đó có 302 redirects
- Cuối cùng frontend nhận 404

**Log từ Vercel**:
```
07:58:03.737 OAuth success: {
  userId: 'ac615ac1-5ce0-4b65-b147-2c4141145897',
  email: 'phatcute5113@gmail.com',
  provider: 'google'
}
```

✅ Backend hoạt động đúng
❌ Frontend không nhận được redirect hoặc URL không tồn tại

---

## 🎯 Nguyên Nhân Có Thể

### 1. Frontend URL Không Tồn Tại

**Kiểm tra**:
```bash
# URL backend đang redirect đến
https://office-ai-weave.surge.sh/auth/callback
```

**Vấn đề**:
- Frontend không có route `/auth/callback`
- Hoặc route này không handle query parameters

### 2. Tokens Quá Dài Trong URL

**Vấn đề**:
- JWT tokens rất dài (~500-1000 characters)
- URL có thể vượt quá giới hạn
- Browser hoặc server có thể reject

**Ví dụ URL**:
```
https://office-ai-weave.surge.sh/auth/callback?access_token=eyJhbGc...&refresh_token=eyJhbGc...
```

### 3. CORS Blocking Redirect

**Vấn đề**:
- Browser block redirect từ backend → frontend
- Cần proper CORS headers

### 4. Frontend Không Handle Tokens

**Vấn đề**:
- Frontend nhận tokens nhưng không lưu
- Không redirect về dashboard
- Hiển thị 404

---

## ✅ Giải Pháp

### Fix 1: Kiểm Tra Frontend Route

**Frontend cần có route**: `/auth/callback`

**React Router Example**:
```typescript
// App.tsx hoặc routes.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**AuthCallbackPage.tsx**:
```typescript
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Extract tokens from URL
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const providerToken = searchParams.get('provider_token');
    const error = searchParams.get('error');

    console.log('Auth callback received:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasProviderToken: !!providerToken,
      error,
    });

    if (error) {
      console.error('OAuth error:', error);
      navigate('/login?error=' + encodeURIComponent(error));
      return;
    }

    if (!accessToken || !refreshToken) {
      console.error('Missing tokens');
      navigate('/login?error=missing_tokens');
      return;
    }

    // Save tokens to localStorage
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    if (providerToken) {
      localStorage.setItem('provider_token', providerToken);
    }

    console.log('Tokens saved, redirecting to dashboard');

    // Redirect to dashboard
    navigate('/dashboard');
  }, [searchParams, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <h2>Completing login...</h2>
        <p>Please wait while we redirect you.</p>
      </div>
    </div>
  );
}
```

### Fix 2: Sử Dụng POST Thay Vì GET (Khuyến Nghị)

**Vấn đề với GET + URL params**:
- Tokens quá dài
- Không an toàn (tokens visible trong URL)
- Browser history lưu tokens

**Giải pháp tốt hơn**: Sử dụng POST với body

**Backend** (đã update):
```typescript
// app/api/auth/google/callback/route.ts
export async function GET(request: NextRequest) {
  // ... exchange code for session ...
  
  // Instead of redirect with tokens in URL,
  // redirect to a page that will fetch tokens via POST
  const frontendUrl = process.env.FRONTEND_SUCCESS_URL;
  const sessionId = data.session.access_token.substring(0, 20); // Short ID
  
  // Store session temporarily (Redis, database, or memory)
  await storeSession(sessionId, {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
  
  // Redirect with short session ID
  return Response.redirect(`${frontendUrl}?session=${sessionId}`);
}

// New endpoint to fetch tokens
export async function POST(request: NextRequest) {
  const { sessionId } = await request.json();
  
  // Retrieve and delete session
  const session = await getAndDeleteSession(sessionId);
  
  if (!session) {
    return ApiResponse.error('Invalid or expired session', 400);
  }
  
  return ApiResponse.success(session);
}
```

**Frontend**:
```typescript
// AuthCallbackPage.tsx
useEffect(() => {
  const sessionId = searchParams.get('session');
  
  if (!sessionId) {
    navigate('/login?error=missing_session');
    return;
  }
  
  // Fetch tokens via POST
  fetch('https://back-end-auto-office-f8xt.vercel.app/api/auth/google/callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId }),
  })
    .then(res => res.json())
    .then(data => {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      navigate('/dashboard');
    })
    .catch(error => {
      console.error('Failed to fetch tokens:', error);
      navigate('/login?error=token_fetch_failed');
    });
}, [searchParams, navigate]);
```

### Fix 3: Kiểm Tra Environment Variables

**Verify trên Vercel**:
```bash
FRONTEND_SUCCESS_URL=https://office-ai-weave.surge.sh/auth/callback
```

**Test locally**:
```bash
# .env.local
FRONTEND_SUCCESS_URL=http://localhost:5173/auth/callback
```

### Fix 4: Add Proper CORS Headers

**Đã có trong middleware**, nhưng verify:
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', origin || '*');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
}
```

---

## 🧪 Testing Steps

### Step 1: Verify Frontend Route Exists

1. Mở: `https://office-ai-weave.surge.sh/auth/callback`
2. Nên thấy: Loading page hoặc "Missing tokens" message
3. Không nên thấy: 404 error

### Step 2: Test OAuth Flow

1. Mở: `https://office-ai-weave.surge.sh/login`
2. Click "Login with Google"
3. Login với Google
4. **Kiểm tra Network tab**:
   - Request đến `/api/auth/google/callback`
   - Response: 302 redirect
   - Location header: Frontend URL với tokens
5. **Kiểm tra Console**:
   - Log: "Auth callback received"
   - Log: "Tokens saved"
   - Log: "Redirecting to dashboard"

### Step 3: Verify Tokens

```typescript
// Browser console
console.log({
  access_token: localStorage.getItem('access_token'),
  refresh_token: localStorage.getItem('refresh_token'),
});
```

### Step 4: Test API with Token

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://back-end-auto-office-f8xt.vercel.app/api/auth/user
```

---

## 📊 Debug Checklist

### Backend

- [x] OAuth callback returns 200
- [x] User is authenticated
- [x] Tokens are generated
- [x] Redirect URL is correct
- [ ] Redirect headers are proper
- [ ] Logs show redirect URL

### Frontend

- [ ] Route `/auth/callback` exists
- [ ] Route handles query parameters
- [ ] Tokens are extracted from URL
- [ ] Tokens are saved to localStorage
- [ ] User is redirected to dashboard
- [ ] No 404 error

### Environment

- [ ] `FRONTEND_SUCCESS_URL` is set correctly
- [ ] Frontend URL is accessible
- [ ] CORS is configured properly
- [ ] No firewall blocking

---

## 🔍 Debug Commands

### Check Redirect URL

```bash
# Test OAuth callback
curl -v "https://back-end-auto-office-f8xt.vercel.app/api/auth/google/callback?code=test"

# Look for Location header
# Should be: https://office-ai-weave.surge.sh/auth/callback?access_token=...
```

### Check Frontend Route

```bash
# Test if route exists
curl -I https://office-ai-weave.surge.sh/auth/callback

# Should return 200, not 404
```

### Check Vercel Logs

1. Vào Vercel Dashboard
2. Deployments → Latest
3. View Function Logs
4. Tìm: "Redirecting to frontend"
5. Kiểm tra redirect URL

---

## 🎯 Recommended Solution

**Tốt nhất**: Implement POST-based token exchange

**Lý do**:
- ✅ Tokens không visible trong URL
- ✅ Không bị giới hạn URL length
- ✅ An toàn hơn
- ✅ Không lưu tokens trong browser history

**Implementation**:
1. Backend: Store session temporarily với short ID
2. Backend: Redirect với session ID
3. Frontend: Fetch tokens via POST với session ID
4. Frontend: Save tokens và redirect

---

## 📞 Next Steps

1. **Kiểm tra frontend code**:
   - Có route `/auth/callback` không?
   - Route có handle tokens không?

2. **Check Vercel logs**:
   - Redirect URL có đúng không?
   - URL length bao nhiêu?

3. **Test trực tiếp**:
   - Mở `https://office-ai-weave.surge.sh/auth/callback?test=1`
   - Có 404 không?

4. **Implement POST-based flow** (khuyến nghị):
   - Safer và reliable hơn
   - Không bị URL length limit

---

**Cập nhật lần cuối**: 2024  
**Commit**: `4c0819d`

