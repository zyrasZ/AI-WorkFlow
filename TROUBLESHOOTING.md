# 🔧 Troubleshooting Guide

## ❌ Error: "Prompt is required"

### Nguyên Nhân
Browser đang cache phiên bản cũ của `NodeRegistry.js` mặc dù code đã được cập nhật.

### Giải Pháp Nhanh

#### 1️⃣ Hard Refresh (Khuyến nghị nhất)
- **Windows/Linux**: `Ctrl + Shift + R` hoặc `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

#### 2️⃣ Sử dụng Debug Panel
1. Nhấn `Ctrl + Shift + D` để mở Debug Info panel
2. Click nút **"🔄 Hard Reload"**
3. Hoặc click **"🗑️ Clear All Cache"** nếu hard reload không work

#### 3️⃣ DevTools Method
1. Mở DevTools (`F12`)
2. Right-click vào nút Reload
3. Chọn **"Empty Cache and Hard Reload"**

#### 4️⃣ Manual Cache Clear
1. Mở DevTools (`F12`)
2. Vào tab **Application** (Chrome) hoặc **Storage** (Firefox)
3. Click **"Clear site data"**
4. Reload trang

### Verify Fix Worked

Sau khi clear cache, mở Console (`F12`) và kiểm tra:

```javascript
// Bạn sẽ thấy:
📦 NodeRegistry v2.0.0 loaded
⚙️ ExecutionEngine v2.0.0 loaded
```

Nếu thấy version `2.0.0`, nghĩa là code mới đã được load!

### Test Workflow

1. Nhập text vào **Prompt Node**
2. Kết nối với **AI Model Node** (Llama 3.3 70B)
3. Nhấn **"Run Workflow"**
4. Xem Console logs:

```javascript
🚀 Starting workflow execution...
📋 Execution order: 1: Prompt, 3: Llama 3.3 70B

📍 Executing node 1/2: Prompt (1)
   📥 Input sources: none
   📦 Input data: {}
   ✅ Result: { prompt: "your text", value: "your text" }

📍 Executing node 2/2: Llama 3.3 70B (3)
   📥 Input sources: 1
   ✅ Merging data from 1: { prompt: "your text", value: "your text" }
   📦 Input data: { prompt: "your text", value: "your text" }
🚀 Groq Llama 3.3 70B processing: Llama 3.3 70B
   ✅ Result: { response: "AI response..." }

🎉 Workflow execution completed successfully!
```

---

## 🐛 Other Common Issues

### Issue: "Vui lòng đăng nhập để sử dụng AI"

**Nguyên nhân**: Không có authentication token

**Giải pháp**:
1. Đăng nhập lại
2. Kiểm tra localStorage:
   ```javascript
   console.log(localStorage.getItem('office_weave_token'))
   ```
3. Nếu null, đăng nhập lại

### Issue: Node không chạy khi nhấn "Run Workflow"

**Kiểm tra**:
1. Mở Console (`F12`)
2. Xem có error không
3. Kiểm tra nodes có được kết nối đúng không
4. Verify authentication token

**Debug**:
```javascript
// Check nodes
console.log('Nodes:', nodes)

// Check edges
console.log('Edges:', edges)

// Check auth
console.log('Has auth:', !!localStorage.getItem('office_weave_token'))
```

### Issue: Kết quả không hiển thị trong Node

**Nguyên nhân**: Node chưa được expand hoặc result chưa được set

**Giải pháp**:
1. Click vào Node để expand
2. Kiểm tra Console logs xem có result không
3. Verify node có `result` property:
   ```javascript
   console.log('Node data:', node.data)
   console.log('Result:', node.data.result)
   ```

### Issue: "Failed to fetch" hoặc Network Error

**Nguyên nhân**: Backend không available hoặc CORS issue

**Giải pháp**:
1. Kiểm tra backend URL:
   ```javascript
   console.log('API URL:', import.meta.env.VITE_API_URL)
   ```
2. Verify backend đang chạy: https://back-end-auto-office-f8xt.vercel.app
3. Kiểm tra network tab trong DevTools

### Issue: Workflow chạy nhưng không có response

**Kiểm tra**:
1. Xem Console logs
2. Kiểm tra API response:
   ```javascript
   // Trong api.js, response được log
   console.log('API Success:', data)
   ```
3. Verify model name đúng không

---

## 🔍 Debug Tools

### 1. Debug Info Panel
- Nhấn `Ctrl + Shift + D` để toggle
- Shows version info
- Quick cache clear buttons

### 2. Console Logging
Workflow execution có detailed logging:
```javascript
// Enable verbose logging
localStorage.setItem('debug', 'true')

// Disable
localStorage.removeItem('debug')
```

### 3. Network Tab
1. Mở DevTools (`F12`)
2. Vào tab **Network**
3. Filter: **Fetch/XHR**
4. Xem API requests và responses

### 4. React DevTools
1. Install React DevTools extension
2. Inspect component state
3. Check node data

---

## 📞 Still Having Issues?

### Collect Debug Info

1. **Console Logs**:
   - Mở Console (`F12`)
   - Copy tất cả logs
   
2. **Network Logs**:
   - Mở Network tab
   - Copy failed requests
   
3. **Version Info**:
   - Nhấn `Ctrl + Shift + D`
   - Screenshot Debug Info panel

4. **Error Stack Trace**:
   - Copy full error message từ Console

### Common Patterns

**Pattern 1: Cache Issue**
```
Error: Prompt is required
at processor (NodeRegistry.js?t=OLD_TIMESTAMP:275:11)
```
→ Solution: Hard refresh

**Pattern 2: Auth Issue**
```
Error: Vui lòng đăng nhập để sử dụng AI
```
→ Solution: Re-login

**Pattern 3: API Issue**
```
Error: Failed to fetch
```
→ Solution: Check backend availability

**Pattern 4: Data Flow Issue**
```
📦 Input data: {} (empty)
```
→ Solution: Check node connections and PromptNode has text

---

## 🎯 Prevention Tips

### 1. Always Hard Refresh After Code Changes
- `Ctrl + Shift + R` should be your habit

### 2. Keep DevTools Open During Development
- Enable "Disable cache" in Network tab

### 3. Use Incognito for Testing
- Fresh environment without cache

### 4. Monitor Console Logs
- Catch errors early

### 5. Verify Versions
- Check version logs after refresh:
  ```
  📦 NodeRegistry v2.0.0 loaded
  ⚙️ ExecutionEngine v2.0.0 loaded
  ```

---

**TL;DR**: 
1. Nhấn `Ctrl + Shift + R` để hard refresh
2. Nhấn `Ctrl + Shift + D` để mở Debug panel
3. Check Console logs để debug
4. Verify versions sau khi refresh
