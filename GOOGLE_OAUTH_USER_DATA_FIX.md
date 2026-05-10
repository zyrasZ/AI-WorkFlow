# 🔧 Google OAuth User Data Fix

## 🎯 Vấn đề đã sửa

Sau khi đăng nhập bằng Google OAuth, ứng dụng không hiển thị thông tin người dùng thật từ Google (tên, email, avatar).

## ✅ Những gì đã sửa

### 1. **Cải thiện OAuth Callback Handler** (`src/App.jsx`)
- ✅ Thêm logging chi tiết để debug
- ✅ Kiểm tra response status trước khi parse JSON
- ✅ Xử lý nhiều format user data từ backend
- ✅ Lưu đầy đủ thông tin user vào localStorage
- ✅ Hiển thị thông báo lỗi rõ ràng nếu thất bại

### 2. **Hiển thị thông tin user thật** (`src/components/ProjectManagement.jsx`)
- ✅ Hiển thị **tên thật** từ Google thay vì email
- ✅ Hiển thị **avatar từ Google** thay vì chữ cái
- ✅ Hiển thị email đầy đủ trong dropdown
- ✅ Hỗ trợ nhiều format data từ backend:
  - `user.name`
  - `user.user_metadata.full_name`
  - `user.user_metadata.name`
  - `user.avatar_url`
  - `user.user_metadata.avatar_url`
  - `user.user_metadata.picture`

### 3. **Thêm Debug Logging**
- ✅ Log chi tiết user data trong console
- ✅ Dễ dàng kiểm tra format data từ backend

## 🧪 Cách test

### Bước 1: Xóa dữ liệu cũ
```javascript
// Mở Console (F12) và chạy:
localStorage.clear()
location.reload()
```

### Bước 2: Đăng nhập lại bằng Google
1. Click "Tiếp tục với Google"
2. Chọn tài khoản Google
3. Cho phép quyền truy cập

### Bước 3: Kiểm tra Console
Sau khi đăng nhập, mở Console (F12) và kiểm tra:

```javascript
// Xem token
console.log('Token:', localStorage.getItem('office_weave_token'))

// Xem user data
console.log('User data:', JSON.parse(localStorage.getItem('user_data')))
```

**Kết quả mong đợi:**
```javascript
{
  "id": "uuid-here",
  "email": "your@gmail.com",
  "name": "Your Name",  // ← Tên thật từ Google
  "avatar_url": "https://lh3.googleusercontent.com/...",  // ← Avatar từ Google
  "provider": "google",
  "email_verified": true,
  "user_metadata": {
    "full_name": "Your Name",
    "avatar_url": "https://...",
    "picture": "https://..."
  }
}
```

### Bước 4: Kiểm tra UI
1. **Sidebar**: Xem avatar và tên hiển thị đúng
2. **User Menu**: Click vào avatar, xem dropdown hiển thị:
   - Avatar từ Google
   - Tên thật
   - Email đầy đủ

## 🔍 Debug nếu vẫn không hiển thị

### Kiểm tra 1: Backend có trả về đúng data không?

Mở Console và chạy:
```javascript
const token = localStorage.getItem('office_weave_token')
fetch('https://back-end-auto-office-f8xt.vercel.app/api/auth/user', {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include'
})
  .then(r => r.json())
  .then(data => {
    console.log('Backend response:', data)
    console.log('User data:', data.data || data.user || data)
  })
```

**Kết quả mong đợi:**
- `data.data.email` hoặc `data.email` có giá trị
- `data.data.name` hoặc `data.user_metadata.full_name` có giá trị
- `data.data.avatar_url` hoặc `data.user_metadata.avatar_url` có giá trị

### Kiểm tra 2: Frontend có parse đúng không?

Mở Console và xem logs:
```
=== ProjectManagement User Debug ===
User from useAuth: {...}
Current user (with fallback): {...}
User email: your@gmail.com
User name: Your Name  ← Phải có giá trị
User avatar: https://...  ← Phải có URL
Computed values:
  - workspaceName: Your Name  ← Phải là tên thật
  - userAvatar: https://...  ← Phải có URL
  - userDisplayName: Your Name  ← Phải là tên thật
```

### Kiểm tra 3: Avatar có load được không?

Nếu avatar không hiển thị:
1. Mở DevTools → Network tab
2. Reload trang
3. Tìm request đến `lh3.googleusercontent.com`
4. Kiểm tra status code (phải là 200)

Nếu bị lỗi CORS hoặc 403:
- Google avatar URL có thể bị block
- Cần backend proxy avatar hoặc dùng fallback

## 📋 Checklist

- [ ] Xóa localStorage và reload
- [ ] Đăng nhập lại bằng Google
- [ ] Kiểm tra Console có log user data
- [ ] Kiểm tra sidebar hiển thị tên thật
- [ ] Kiểm tra sidebar hiển thị avatar từ Google
- [ ] Click user menu, xem dropdown hiển thị đầy đủ
- [ ] Kiểm tra email hiển thị đúng

## 🐛 Các vấn đề có thể gặp

### 1. Avatar không hiển thị
**Nguyên nhân:** Google avatar URL bị CORS hoặc 403

**Giải pháp:**
- Backend cần proxy avatar
- Hoặc dùng fallback (chữ cái đầu)

### 2. Tên không hiển thị
**Nguyên nhân:** Backend không trả về `name` hoặc `user_metadata.full_name`

**Giải pháp:**
- Kiểm tra backend response format
- Cập nhật code để parse đúng field

### 3. Token không lưu
**Nguyên nhân:** Backend redirect về URL sai

**Giải pháp:**
- Backend phải redirect về: `/?access_token=xxx`
- Không phải: `/auth/callback?access_token=xxx`

## 📝 Code Changes Summary

### `src/App.jsx`
```javascript
// Improved OAuth callback with better logging and error handling
useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const accessToken = params.get('access_token')
  
  if (accessToken) {
    // Store token
    localStorage.setItem('office_weave_token', accessToken)
    
    // Fetch user info with detailed logging
    fetch(`${API_BASE}/api/auth/user`, {
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
      .then(r => {
        console.log('Response status:', r.status)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        const userData = data.data || data.user || data
        localStorage.setItem('user_data', JSON.stringify(userData))
        // Navigate to projects
      })
  }
}, [])
```

### `src/components/ProjectManagement.jsx`
```javascript
// Extract user info from multiple possible fields
const workspaceName = currentUser?.name || 
                      currentUser?.user_metadata?.full_name ||
                      currentUser?.email?.split('@')[0]

const userAvatar = currentUser?.avatar_url || 
                   currentUser?.user_metadata?.avatar_url ||
                   currentUser?.user_metadata?.picture

const userDisplayName = currentUser?.name ||
                        currentUser?.user_metadata?.full_name ||
                        currentUser?.email?.split('@')[0]

// Display avatar
{userAvatar ? (
  <img src={userAvatar} alt={userDisplayName} />
) : (
  <div>{workspaceName.charAt(0).toUpperCase()}</div>
)}
```

## 🎉 Kết quả

Sau khi sửa, khi đăng nhập bằng Google:
- ✅ Hiển thị **tên thật** từ Google
- ✅ Hiển thị **avatar** từ Google
- ✅ Hiển thị **email** đầy đủ
- ✅ Lưu đầy đủ thông tin vào localStorage
- ✅ Có logging chi tiết để debug

## 🔗 Related Files

- `src/App.jsx` - OAuth callback handler
- `src/components/ProjectManagement.jsx` - User info display
- `src/hooks/useAuth.jsx` - Auth context
- `src/lib/api.js` - API client

## 📞 Support

Nếu vẫn gặp vấn đề:
1. Kiểm tra Console logs
2. Kiểm tra Network tab
3. Kiểm tra backend response format
4. Liên hệ backend team để verify OAuth implementation
