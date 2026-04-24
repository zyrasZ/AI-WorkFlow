# Tính năng Hiển thị Kết quả Realtime

## Tổng quan
Hệ thống giờ đây hỗ trợ **hiển thị kết quả realtime** trên Output Node khi:
1. Nối Output Node với AI Node đã có kết quả
2. Chạy workflow bằng "Run Model" hoặc "Run Workflow"

**Lưu ý**: AI Node chỉ thực thi khi nhấn nút, KHÔNG tự động chạy khi nối.

## Cách hoạt động

### 1. Chạy AI Node
**Cách 1: Run Model (từng node)**
- Nhấn nút "Run Model" trên AI Node
- Node đó sẽ chạy và hiển thị kết quả
- Kết quả tự động sync sang các Output Node được nối

**Cách 2: Run Workflow (toàn bộ)**
- Nhấn nút "Run Workflow" ở bottom bar
- Tất cả nodes trong workflow sẽ chạy theo thứ tự
- Kết quả tự động sync sang các Output Node

### 2. Realtime Result Sync
Khi nối Output Node với AI Node:
- **Nếu AI Node đã có kết quả**: Output Node hiển thị ngay lập tức
- **Nếu AI Node chưa có kết quả**: Output Node hiển thị "Chưa có kết quả"
- **Sau khi AI Node chạy xong**: Kết quả tự động cập nhật vào Output Node

### 3. Workflow Example
```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│ Prompt Node │─────▶│ AI Model     │─────▶│ Output Node │
│             │      │ [Run Model]  │      │ [Auto Show] │
└─────────────┘      └──────────────┘      └─────────────┘
     ↓                      ↓                      ↓
  [Input]            [Click to Run]         [Display Result]
```

**Các bước:**
1. Kéo "Prompt Node" → Nhập prompt
2. Kéo "Groq Gemma 2 9B" 
3. Nối Prompt → AI Model
4. **Nhấn "Run Model"** trên AI Model Node
5. Kết quả hiển thị trong AI Model Node
6. Kéo "Output Node"
7. Nối AI Model → Output Node
8. **Kết quả tự động hiển thị trong Output Node!** ✨

## Các thay đổi kỹ thuật

### 1. `useCanvasLogic.js`
```javascript
// Khi có connection mới, sync kết quả (không chạy AI)
onConnect: (params) => {
  // Tạo edge
  // Gọi onConnectionMade để sync result
  onConnectionMade(params.source, params.target);
}
```

### 2. `App.jsx`
```javascript
// Sync kết quả khi có connection mới
handleConnectionMade: (sourceId, targetId) => {
  const sourceNode = nodes.find(n => n.id === sourceId);
  if (sourceNode?.data.result) {
    // Cập nhật target node với result từ source
    setNodes(nds => nds.map(node => 
      node.id === targetId 
        ? { ...node, data: { ...node.data, result: sourceNode.data.result } }
        : node
    ));
  }
}

// Sau khi Run Workflow, sync kết quả sang downstream nodes
handleRunWorkflow: async () => {
  // ... execute workflow ...
  
  // Sync results to connected Output Nodes
  results.forEach(result => {
    const connectedTargets = edges
      .filter(e => e.source === result.nodeId)
      .map(e => e.target);
    
    // Update all connected nodes with result
    setNodes(nds => nds.map(node => 
      connectedTargets.includes(node.id)
        ? { ...node, data: { ...node.data, result: result.data } }
        : node
    ));
  });
}
```

### 3. `GhostNode.jsx`
```javascript
// Nút "Run Model" để chạy từng node
<button onClick={executeProcessor}>
  <Play size={12} />
  <span>Run Model</span>
</button>

// Sau khi chạy xong, gọi callback để sync
executeProcessor: async () => {
  const result = await processor(data, inputs);
  data.result = result;
  
  // Sync sang các node được nối
  if (data.onNodeResult) {
    data.onNodeResult(id, result);
  }
}
```

### 4. `OutputNode.jsx`
```javascript
// Tự động sync khi data.result thay đổi
useEffect(() => {
  if (data.result) setDisplayResult(data.result);
}, [data.result]);
```

## Lợi ích

✅ **Kiểm soát tốt hơn**: AI chỉ chạy khi bạn muốn
✅ **Tiết kiệm credits**: Không gọi API không cần thiết
✅ **Hiển thị realtime**: Kết quả tự động sync sang Output Node
✅ **Workflow linh hoạt**: Chạy từng node hoặc toàn bộ
✅ **Debug dễ dàng**: Thấy rõ kết quả từng bước

## Use Cases

### 1. Test từng node
```
1. Tạo Prompt Node với prompt test
2. Nối với AI Model
3. Nhấn "Run Model" để test
4. Xem kết quả ngay trong node
5. Nếu OK, nối tiếp với node khác
```

### 2. Reuse kết quả
```
1. AI Model đã chạy và có kết quả
2. Kéo nhiều Output Node
3. Nối tất cả với AI Model
4. Tất cả Output Node hiển thị cùng kết quả
5. Không cần chạy lại AI
```

### 3. Workflow phức tạp
```
Prompt → AI Model 1 → Output 1
              ↓
         AI Model 2 → Output 2
              ↓
         AI Model 3 → Output 3

- Nhấn "Run Workflow" để chạy tất cả
- Hoặc nhấn "Run Model" từng cái để debug
```

## So sánh với phiên bản cũ

| Tính năng | Cũ | Mới |
|-----------|-----|-----|
| Khi nối node | ❌ Không làm gì | ✅ Sync kết quả nếu có |
| Chạy AI | ✅ Chỉ Run Workflow | ✅ Run Model hoặc Run Workflow |
| Hiển thị kết quả | ❌ Chỉ trong AI Node | ✅ Cả AI Node và Output Node |
| Realtime sync | ❌ Không | ✅ Tự động |
| Tiết kiệm credits | ❌ Chạy lại mỗi lần | ✅ Reuse kết quả |

## Lưu ý

⚠️ **Authentication**: Cần đăng nhập để chạy AI
⚠️ **Result persistence**: Kết quả chỉ lưu trong session, không lưu vào DB
⚠️ **Connection order**: Nối Output Node SAU KHI AI đã chạy để thấy kết quả ngay

## Roadmap

🔮 **Tương lai**:
- [ ] Lưu kết quả vào database
- [ ] Cache kết quả để load lại sau
- [ ] Streaming response cho AI models
- [ ] Multiple outputs từ 1 AI node
- [ ] Result history và versioning

---

**Version**: 2.0.0  
**Last Updated**: 2026-04-24
