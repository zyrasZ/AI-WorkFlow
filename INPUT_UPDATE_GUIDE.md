# Hướng dẫn Cập nhật Input Liên tục

## Tổng quan
Hệ thống giờ đây **theo dõi thay đổi input** và thông báo cho các node được nối khi cần cập nhật kết quả.

## Cách hoạt động

### 1. Khi thay đổi Prompt
```
Prompt Node (đang gõ) → AI Model Node (nhận thông báo)
     ↓                           ↓
  [Input thay đổi]      [Hiển thị "Input đã thay đổi"]
```

**Các bước:**
1. Bạn gõ/sửa prompt trong Prompt Node
2. AI Model Node được nối sẽ nhận thông báo realtime
3. Nút "Run Model" đổi màu vàng → "Run with New Input"
4. Hiển thị indicator: "Input đã thay đổi - Nhấn Run để cập nhật"
5. Nhấn "Run with New Input" để chạy lại với prompt mới

### 2. Visual Indicators

#### **Prompt Node**
- Không có thay đổi đặc biệt
- Vẫn gõ bình thường

#### **AI Model Node (có input mới)**
- 🟡 Nút "Run Model" → màu vàng
- 🟡 Text: "Run with New Input"
- 🟡 Indicator: "Input đã thay đổi - Nhấn Run để cập nhật"
- 🟡 Dot nhấp nháy màu vàng

#### **AI Model Node (sau khi Run)**
- ✅ Nút quay lại màu trắng
- ✅ Indicator biến mất
- ✅ Kết quả mới hiển thị

### 3. Workflow Example

```
┌─────────────────┐      ┌──────────────────────┐      ┌─────────────┐
│ Prompt Node     │─────▶│ AI Model Node        │─────▶│ Output Node │
│ [Đang gõ...]    │      │ [Input đã thay đổi]  │      │ [Kết quả cũ]│
└─────────────────┘      └──────────────────────┘      └─────────────┘
                                    ↓
                         [Nhấn "Run with New Input"]
                                    ↓
                         ┌──────────────────────┐
                         │ AI Model Node        │
                         │ [Đang chạy...]       │
                         └──────────────────────┘
                                    ↓
                         ┌──────────────────────┐      ┌─────────────┐
                         │ AI Model Node        │─────▶│ Output Node │
                         │ [Kết quả mới]        │      │ [Kết quả mới]│
                         └──────────────────────┘      └─────────────┘
```

## Các thay đổi kỹ thuật

### 1. `PromptNode.jsx`
```javascript
// Khi prompt thay đổi
handlePromptChange: (e) => {
  const newValue = e.target.value;
  
  // Cập nhật data
  data.value = newValue;
  data.prompt = newValue;
  
  // Thông báo cho connected nodes
  if (onPromptChange && getEdges) {
    const connectedTargets = getEdges()
      .filter(e => e.source === id)
      .map(e => e.target);
    
    onPromptChange(id, newValue, connectedTargets);
  }
}
```

### 2. `App.jsx`
```javascript
// Xử lý prompt change
handlePromptChange: (promptNodeId, newPrompt, connectedTargets) => {
  // Cập nhật connected AI nodes
  setNodes(nds => nds.map(node => {
    if (connectedTargets.includes(node.id)) {
      return {
        ...node,
        data: {
          ...node.data,
          inputPrompt: newPrompt,
          hasUpdatedInput: true, // Flag để hiển thị indicator
        }
      };
    }
    return node;
  }));
  
  // Cũng cập nhật Output Nodes nếu có
  const outputTargets = edges
    .filter(e => connectedTargets.includes(e.source))
    .map(e => e.target);
  
  // Update output nodes...
}
```

### 3. `GhostNode.jsx`
```javascript
// Hiển thị indicator khi có input mới
{hasUpdatedInput && !isProcessing && (
  <div className="text-yellow-400 bg-yellow-400/10 border border-yellow-400/20">
    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
    <span>Input đã thay đổi - Nhấn Run để cập nhật</span>
  </div>
)}

// Nút Run với màu khác khi có input mới
<button className={hasUpdatedInput ? 'bg-yellow-500/20 text-yellow-300' : 'bg-white/10'}>
  {hasUpdatedInput ? 'Run with New Input' : 'Run Model'}
</button>

// Clear flag sau khi chạy
executeProcessor: async () => {
  data.hasUpdatedInput = false; // Clear flag
  
  // Use inputPrompt if available
  const finalPrompt = data.inputPrompt || promptFromConnectedNode || ...;
  
  // Execute...
}
```

## Lợi ích

✅ **Feedback realtime**: Biết ngay khi input thay đổi  
✅ **Tránh nhầm lẫn**: Không chạy với input cũ  
✅ **Visual clear**: Màu vàng nổi bật, dễ nhận biết  
✅ **Kiểm soát tốt**: Vẫn phải nhấn Run, không tự động  
✅ **UX tốt hơn**: Giống như IDE với "unsaved changes"  

## Use Cases

### 1. Thử nghiệm prompt
```
1. Gõ prompt: "Viết email xin nghỉ việc"
2. Nhấn Run → Xem kết quả
3. Sửa prompt: "Viết email xin nghỉ việc chuyên nghiệp"
4. Thấy indicator màu vàng
5. Nhấn "Run with New Input" → Kết quả mới
```

### 2. A/B Testing
```
1. Tạo 2 AI Model nodes từ 1 Prompt
2. Sửa prompt
3. Cả 2 nodes đều hiển thị "Input đã thay đổi"
4. Chạy từng node để so sánh kết quả
```

### 3. Workflow phức tạp
```
Prompt → AI Model 1 → AI Model 2 → Output
   ↓           ↓            ↓
[Sửa]    [Cần update]  [Cần update]

- Sửa prompt
- AI Model 1 hiển thị indicator
- Chạy AI Model 1
- AI Model 2 tự động nhận input mới từ AI Model 1
- Chạy AI Model 2
- Output hiển thị kết quả cuối cùng
```

## Tùy chọn: Xóa kết quả cũ khi input thay đổi

Nếu bạn muốn **xóa kết quả cũ** khi input thay đổi (để tránh nhầm lẫn):

Mở `src/App.jsx`, tìm function `handlePromptChange`, uncomment dòng:

```javascript
handlePromptChange: (promptNodeId, newPrompt, connectedTargets) => {
  setNodes(nds => nds.map(node => {
    if (connectedTargets.includes(node.id)) {
      return {
        ...node,
        data: {
          ...node.data,
          inputPrompt: newPrompt,
          hasUpdatedInput: true,
          result: null, // ← Uncomment dòng này để xóa kết quả cũ
        }
      };
    }
    return node;
  }));
}
```

**Lưu ý**: Xóa kết quả cũ sẽ làm Output Node cũng mất kết quả.

## So sánh với phiên bản cũ

| Tính năng | Cũ | Mới |
|-----------|-----|-----|
| Thay đổi prompt | ❌ Không thông báo | ✅ Thông báo realtime |
| Visual indicator | ❌ Không có | ✅ Màu vàng + text |
| Biết input mới | ❌ Không | ✅ Rõ ràng |
| Tránh nhầm lẫn | ❌ Dễ chạy với input cũ | ✅ Indicator rõ ràng |
| UX | ⚠️ Bình thường | ✅ Professional |

## Roadmap

🔮 **Tương lai**:
- [ ] Auto-run option (toggle để tự động chạy khi input thay đổi)
- [ ] Debounce để tránh update quá nhiều lần
- [ ] History của các input changes
- [ ] Diff view để so sánh input cũ vs mới
- [ ] Batch update cho multiple nodes

---

**Version**: 1.0.0  
**Last Updated**: 2026-04-24
