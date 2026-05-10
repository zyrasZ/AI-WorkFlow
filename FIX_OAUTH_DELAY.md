# 🔧 Fix: OAuth Login Delay - Phải F5 mới hiển thị data

## 🎯 Vấn đề

Sau khi đăng nhập bằng Google OAuth:
- ❌ Dữ liệu được lưu vào localStorage
- ❌ Nhưng UI không tự động update
- ❌ Phải F5 (reload) trang thì mới hiển thị tên và avatar thật

## 🔍 Nguyên nhân

### 1. **Race Condition**
```
OAuth callback → Lưu data vào localStorage → Navigate to Projects
                                              ↓
                                    ProjectManagement đã mount
                                              ↓
                                    useAuth chưa kịp update user state
                                              ↓
                                    UI hiển thị data cũ (null)
```

### 2. **useAuth không biết localStorage đã thay đổi**
- `useAuth` chỉ check auth 1 lần khi mount
- Sau khi OAuth callback lưu data, `useAuth` không re-check
- Component không re-render với data mới

### 3. **getUserData() function không reactive**
- ProjectManagement và Settings dùng `getUserData()` function
- Function này được gọi mỗi lần render
- Nhưng không trigger re-render khi localStorage thay đổi

## ✅ Giải pháp

### 1. **Custom Event để notify auth changes**

#### App.jsx - Dispatch event sau khi lưu data
```javascript
// Store complete user data
localStorage.setItem('user_data', JSON.stringify(userData))

// Dispatch custom event to notify useAuth to refresh
window.dispatchEvent(new CustomEvent('auth-changed', { detail: userData }))

// Small delay to ensure auth state is updated before navigation
setTimeout(() => {
  setShowProjectManagement(true)
  // ... navigate
}, 100)
```

#### useAuth.jsx - Listen event và update state
```javascript
// Listen for auth changes (e.g., after OAuth callback)
useEffect(() => {
  const handleAuthChange = (event) => {
    console.log('🔄 Auth changed event received:', event.detail)
    const userData = event.detail
    setUser(userData)
    setError(null)
    setLoading(false)
  }

  window.addEventListener('auth-changed', handleAuthChange)
  
  return () => {
    window.removeEventListener('auth-changed', handleAuthChange)
  }
}, [])
```

### 2. **Reactive currentUser calculation**

#### Trước (không reactive):
```javascript
const getUserData = () => {
  if (user) return user
  // ... fallback to localStorage
}

const currentUser = getUserData() // Chỉ gọi 1 lần khi render
```

#### Sau (reactive):
```javascript
// This will re-calculate whenever 'user' changes
const currentUser = user || (() => {
  try {
    const storedUserData = localStorage.getItem('user_data')
    if (storedUserData) {
      return JSON.parse(storedUserData)
    }
  } catch (e) {
    console.error('Failed to parse user_data:', e)
  }
  return null
})()
```

**Lợi ích:**
- Khi `user` từ useAuth thay đổi → Component re-render
- `currentUser` được re-calculate với giá trị mới
- UI tự động update

### 3. **Small delay trước khi navigate**

```javascript
// Small delay to ensure auth state is updated before navigation
setTimeout(() => {
  setShowProjectManagement(true)
  // ...
}, 100) // 100ms delay
```

**Lý do:**
- Đảm bảo event được dispatch và xử lý xong
- useAuth có thời gian update state
- Component mount với state đã đúng

## 📊 Flow sau khi fix

```
1. User clicks "Tiếp tục với Google"
   ↓
2. Google OAuth flow
   ↓
3. Backend redirects: /?access_token=xxx
   ↓
4. App.jsx detects token in URL
   ↓
5. Fetch user info from backend
   ↓
6. Store to localStorage
   ↓
7. Dispatch 'auth-changed' event ← NEW!
   ↓
8. useAuth receives event ← NEW!
   ↓
9. useAuth updates user state ← NEW!
   ↓
10. Wait 100ms ← NEW!
   ↓
11. Navigate to ProjectManagement
   ↓
12. ProjectManagement renders with correct user data ✅
```

## 🧪 Test

### Test 1: Đăng nhập Google
```
1. Xóa localStorage: localStorage.clear()
2. Reload trang
3. Click "Tiếp tục với Google"
4. Chọn tài khoản Google
5. Cho phép quyền truy cập
6. ✅ Kiểm tra: Tên và avatar hiển thị NGAY LẬP TỨC
7. ✅ KHÔNG cần F5
```

### Test 2: Kiểm tra Console
```javascript
// Sau khi đăng nhập, xem logs:
✅ Google OAuth callback detected
📥 Fetching user info
📦 User data response: {...}
✅ User info received: {name: "...", avatar: "..."}
🔄 Auth changed event received: {...}  ← Event được nhận
✅ Google login successful, navigating to projects

=== ProjectManagement User Debug ===
User from useAuth: {name: "...", email: "...", avatar_url: "..."}  ← User có data
```

### Test 3: Kiểm tra UI
```
✅ Sidebar hiển thị tên thật ngay lập tức
✅ Avatar từ Google hiển thị ngay lập tức
✅ User menu hiển thị đầy đủ thông tin
✅ KHÔNG cần F5
```

## 📁 Files Changed

1. **src/App.jsx**
   - Dispatch `auth-changed` event sau khi lưu user data
   - Thêm 100ms delay trước khi navigate

2. **src/hooks/useAuth.jsx**
   - Thêm event listener cho `auth-changed`
   - Update user state khi nhận event

3. **src/components/ProjectManagement.jsx**
   - Đổi `getUserData()` function thành reactive calculation
   - `currentUser` tự động update khi `user` thay đổi

4. **src/components/Settings.jsx**
   - Đổi `getUserData()` function thành reactive calculation
   - `currentUser` tự động update khi `user` thay đổi

## 🔍 Technical Details

### Custom Event Pattern
```javascript
// Dispatch
window.dispatchEvent(new CustomEvent('auth-changed', { 
  detail: userData 
}))

// Listen
window.addEventListener('auth-changed', (event) => {
  const userData = event.detail
  setUser(userData)
})
```

**Lợi ích:**
- ✅ Decoupled: App.jsx không cần biết về useAuth
- ✅ Flexible: Nhiều component có thể listen cùng event
- ✅ Standard: Dùng Web API có sẵn

### Reactive Calculation Pattern
```javascript
// Inline IIFE (Immediately Invoked Function Expression)
const currentUser = user || (() => {
  // Fallback logic
  return getFallbackUser()
})()
```

**Lợi ích:**
- ✅ Re-calculate mỗi lần component re-render
- ✅ Tự động update khi `user` thay đổi
- ✅ Không cần useEffect hoặc useMemo

## ⚡ Performance

### Có ảnh hưởng performance không?

**Không!** Vì:
1. Event chỉ dispatch 1 lần khi login
2. Inline IIFE chỉ chạy khi `user` là null/undefined
3. 100ms delay không đáng kể

### Có memory leak không?

**Không!** Vì:
- Event listener được cleanup trong useEffect return
- Không có circular reference

## ✅ Checklist

- [x] Dispatch `auth-changed` event trong App.jsx
- [x] Listen event trong useAuth.jsx
- [x] Update user state khi nhận event
- [x] Thêm 100ms delay trước navigate
- [x] Đổi getUserData() thành reactive calculation
- [x] Test với Google OAuth
- [x] Test không cần F5
- [x] Kiểm tra Console logs
- [x] Kiểm tra UI update ngay lập tức

## 🎉 Kết quả

Sau khi fix:
- ✅ Đăng nhập Google → Hiển thị tên và avatar **NGAY LẬP TỨC**
- ✅ **KHÔNG cần F5**
- ✅ UI tự động update
- ✅ Smooth user experience

## 🐛 Troubleshooting

### Vẫn phải F5?

**Kiểm tra Console:**
```javascript
// Xem có log này không:
🔄 Auth changed event received: {...}
```

**Nếu không có:**
- Event không được dispatch
- Kiểm tra App.jsx có dispatch event không

**Nếu có nhưng vẫn không update:**
- Kiểm tra ProjectManagement có re-render không
- Kiểm tra `user` từ useAuth có update không

### Avatar vẫn không hiển thị?

**Kiểm tra:**
```javascript
const { user } = useAuth()
console.log('User from useAuth:', user)
console.log('Has avatar?', !!user?.avatar_url)
```

**Nếu user = null:**
- useAuth chưa update
- Kiểm tra event listener

**Nếu user có data nhưng không có avatar:**
- Backend không trả về avatar_url
- Xem `GOOGLE_OAUTH_USER_DATA_FIX.md`

## 📞 Support

Nếu vẫn gặp vấn đề:
1. Xóa localStorage: `localStorage.clear()`
2. Reload trang
3. Đăng nhập lại
4. Kiểm tra Console logs
5. Xem có error không

## 🎯 Summary

**Vấn đề:** OAuth login delay, phải F5 mới hiển thị data

**Giải pháp:**
1. Custom event để notify auth changes
2. Reactive currentUser calculation
3. Small delay trước khi navigate

**Kết quả:** UI tự động update ngay lập tức, không cần F5! 🎉
