# Output Node - Cập nhật Liên tục

## Tổng quan
**Output Node** giờ đây tự động cập nhật liên tục khi nhận kết quả mới từ các node được nối, không cần làm gì thêm!

## Cách hoạt động

### 1. Auto-sync từ Connected Nodes
```
AI Model Node (chạy xong) → Output Node (tự động cập nhật)
        ↓                            ↓
   [Kết quả mới]              [Hiển thị ngay lập tức]
```

**Cơ chế:**
- Output Node **polling** (kiểm tra) mỗi 500ms
- Phát hiện khi source node có kết quả mới
- Tự động cập nhật và hiển thị
- Không cần nhấn nút, không cần làm gì!

### 2. Visual Feedback

#### **Khi nhận kết quả mới:**
- 🟢 **Border sáng màu xanh** (1 giây)
- 🟢 **Glow effect** xung quanh node
- 🟢 **Indicator**: "Đang cập nhật kết quả mới..."
- 🟢 **Badge**: "X updates" (số lần cập nhật)

#### **Sau khi cập nhật xong:**
- ✅ Border trở lại bình thường
- ✅ Hiển thị kết quả mới
- ✅ Timestamp cập nhật
- ✅ History lưu 5 kết quả gần nhất

### 3. Workflow Example

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│ Prompt Node │─────▶│ AI Model     │─────▶│ Output Node     │
│ [Gõ prompt] │      │ [Run Model]  │      │ [Auto Update]   │
└─────────────┘      └──────────────┘      └─────────────────┘
                            ↓                        ↓
                     [Kết quả sẵn sàng]    [🟢 Cập nhật tự động]
```

**Các bước:**
1. Kéo Prompt Node → Nhập prompt
2. Kéo AI Model Node → Nối Prompt → AI Model
3. Nhấn "Run Model" trên AI Model
4. Kết quả hiển thị trong AI Model Node
5. Kéo Output Node → Nối AI Model → Output
6. **✨ Output Node tự động hiển thị kết quả ngay lập tức!**
7. Sửa prompt → Nhấn "Run Model" lại
8. **✨ Output Node tự động cập nhật kết quả mới!**

### 4. Multiple Sources

Output Node có thể nhận từ nhiều sources:

```
AI Model 1 ─┐
            ├─▶ Output Node (hiển thị kết quả mới nhất)
AI Model 2 ─┘
```

- Hiển thị kết quả từ node chạy gần nhất
- Badge hiển thị số lần update
- History lưu tất cả kết quả

## Các thay đổi kỹ thuật

### 1. `OutputNode.jsx` - Polling Mechanism

```javascript
// Poll for updates every 500ms
useEffect(() => {
  const checkForUpdates = () => {
    const allNodes = getNodes();
    const allEdges = getEdges();
    
    // Find source nodes connected to this output
    const incomingEdges = allEdges.filter(e => e.target === id);
    
    for (const edge of incomingEdges) {
      const sourceNode = allNodes.find(n => n.id === edge.source);
      
      // Check if source has new result
      if (sourceNode?.data?.result) {
        const sourceResult = JSON.stringify(sourceNode.data.result);
        const currentResult = JSON.stringify(displayResult);
        
        if (sourceResult !== currentResult) {
          // New result detected! Update immediately
          setIsUpdating(true);
          setDisplayResult(sourceNode.data.result);
          
          // Add to history
          setResultHistory(prev => [...prev, {
            result: sourceNode.data.result,
            timestamp: sourceNode.data.lastExecuted
          }].slice(-5));
        }
      }
    }
  };

  const interval = setInterval(checkForUpdates, 500);
  return () => clearInterval(interval);
}, [getNodes, getEdges, id, displayResult]);
```

### 2. `App.jsx` - Result Propagation

```javascript
// Khi node chạy xong, sync ngay sang connected nodes
handleNodeResult: (sourceNodeId, result) => {
  const targetIds = edges
    .filter(e => e.source === sourceNodeId)
    .map(e => e.target);

  setNodes(nds => nds.map(node => {
    // Update source node
    if (node.id === sourceNodeId) {
      return { ...node, data: { ...node.data, result } };
    }
    
    // Update all connected targets (including Output Nodes)
    if (targetIds.includes(node.id)) {
      return { ...node, data: { ...node.data, result } };
    }
    
    return node;
  }));

  // Animate edges to show data flow
  setEdges(eds => eds.map(edge => 
    edge.source === sourceNodeId 
      ? { ...edge, data: { ...edge.data, animated: true } }
      : edge
  ));
}
```

### 3. Visual Effects

```javascript
// Update animation
<motion.div
  animate={{ 
    boxShadow: isUpdating 
      ? '0 0 0 2px rgba(34, 197, 94, 0.4)' // Green glow
      : '0 0 0 0px transparent'
  }}
  className={isUpdating ? 'border-green-400/60' : ''}
>
  {isUpdating && (
    <div className="text-green-400 bg-green-400/10">
      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      <span>Đang cập nhật kết quả mới...</span>
    </div>
  )}
</motion.div>
```

### 4. Result History

```javascript
// Keep last 5 results
const [resultHistory, setResultHistory] = useState([]);

// Add to history on update
setResultHistory(prev => {
  const newHistory = [...prev, {
    result: newResult,
    timestamp: new Date().toISOString()
  }];
  return newHistory.slice(-5); // Keep only last 5
});

// Display history count
{resultHistory.length > 1 && (
  <span className="text-blue-400">
    {resultHistory.length} updates
  </span>
)}
```

## Lợi ích

✅ **Tự động 100%**: Không cần làm gì, chỉ nối và xem  
✅ **Realtime**: Cập nhật ngay lập tức (500ms polling)  
✅ **Visual feedback**: Biết rõ khi nào đang update  
✅ **History tracking**: Lưu 5 kết quả gần nhất  
✅ **Multiple sources**: Nhận từ nhiều nodes  
✅ **Performance**: Polling thông minh, không lag  

## Use Cases

### 1. Live Preview
```
Prompt → AI Model → Output
   ↓         ↓         ↓
[Sửa]   [Run lại]  [Xem ngay]

- Sửa prompt nhiều lần
- Mỗi lần Run, Output tự động cập nhật
- Không cần nối lại, không cần refresh
```

### 2. A/B Testing
```
Prompt → AI Model 1 ─┐
                     ├─▶ Output (so sánh)
      → AI Model 2 ─┘

- Chạy cả 2 models
- Output hiển thị kết quả mới nhất
- Badge hiển thị "2 updates"
- Xem history để so sánh
```

### 3. Pipeline Processing
```
Prompt → AI 1 → AI 2 → AI 3 → Output
   ↓       ↓      ↓      ↓       ↓
[Input] [Step1] [Step2] [Step3] [Final]

- Chạy workflow từng bước
- Output cập nhật sau mỗi step
- Thấy rõ progress
```

### 4. Multi-output Dashboard
```
         ┌─▶ Output 1 (Summary)
AI Model ├─▶ Output 2 (Details)
         └─▶ Output 3 (Analysis)

- 1 AI Model → 3 Output Nodes
- Tất cả đều tự động cập nhật
- Hiển thị cùng kết quả, khác format
```

## Performance

### Polling Strategy
- **Interval**: 500ms (0.5 giây)
- **Smart check**: Chỉ so sánh khi có thay đổi
- **JSON compare**: Nhanh và chính xác
- **Auto cleanup**: Clear interval khi unmount

### Optimization
```javascript
// Only check if result actually changed
const sourceResult = JSON.stringify(sourceNode.data.result);
const currentResult = JSON.stringify(displayResult);

if (sourceResult !== currentResult) {
  // Update only when different
  setDisplayResult(sourceNode.data.result);
}
```

### Memory Management
```javascript
// Keep only last 5 results
setResultHistory(prev => [...prev, newResult].slice(-5));
```

## Tùy chọn: Thay đổi Polling Interval

Nếu bạn muốn thay đổi tốc độ cập nhật:

Mở `src/components/OutputNode.jsx`, tìm dòng:

```javascript
const interval = setInterval(checkForUpdates, 500); // ← Đổi 500 thành giá trị khác
```

**Gợi ý:**
- `100` = Cập nhật rất nhanh (0.1s) - tốn performance
- `500` = Cập nhật nhanh (0.5s) - **khuyến nghị**
- `1000` = Cập nhật bình thường (1s)
- `2000` = Cập nhật chậm (2s) - tiết kiệm performance

## So sánh với phiên bản cũ

| Tính năng | Cũ | Mới |
|-----------|-----|-----|
| Cập nhật kết quả | ❌ Phải nối lại | ✅ Tự động liên tục |
| Polling | ❌ Không có | ✅ 500ms interval |
| Visual feedback | ❌ Không | ✅ Green glow + indicator |
| History | ❌ Không | ✅ Lưu 5 kết quả |
| Multiple sources | ❌ Không hỗ trợ | ✅ Hỗ trợ đầy đủ |
| Performance | ⚠️ N/A | ✅ Optimized |

## Troubleshooting

### Output không cập nhật?
1. Kiểm tra edge đã nối đúng chưa
2. Kiểm tra source node có kết quả chưa
3. Mở Console, xem log "🔄 OutputNode detected new result"
4. Thử disconnect và connect lại

### Cập nhật chậm?
1. Giảm polling interval xuống 100ms
2. Kiểm tra có quá nhiều nodes không
3. Kiểm tra browser performance

### Hiển thị kết quả cũ?
1. Xóa cache browser
2. Refresh page
3. Disconnect và connect lại edge

---

**Version**: 1.0.0  
**Last Updated**: 2026-04-24  
**Performance**: Optimized với polling 500ms
