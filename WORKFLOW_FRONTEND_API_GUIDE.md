# **HƯỚNG DẪN SỬ DỤNG API WORKFLOW AUTOMATION - CHO FRONTEND**

## **📋 Mục lục**

1. [Thông tin chung](#thông-tin-chung)
2. [Authentication](#authentication)
3. [Quản lý Workflows](#quản-lý-workflows)
4. [Thực thi Workflows](#thực-thi-workflows)
5. [Quản lý Triggers](#quản-lý-triggers)
6. [Node Types](#node-types)
7. [Import/Export](#importexport)
8. [Executions History](#executions-history)
9. [Error Handling](#error-handling)
10. [Code Examples](#code-examples)

---

## **Thông tin chung**

**Base URL:** `http://localhost:3000` (development)  
**Authentication:** Bearer token trong header `Authorization`  
**Content-Type:** `application/json`

### Response Format

Tất cả API đều trả về format:

```typescript
{
  "data": { ... },      // Dữ liệu khi thành công
  "error": "string",    // Thông báo lỗi (nếu có)
  "message": "string"   // Thông báo bổ sung
}
```

---

## **Authentication**

Tất cả các endpoint đều yêu cầu Bearer token:

```javascript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

---

## **Quản lý Workflows**

### **1. Lấy danh sách workflows**

```
GET /api/workflows
```

**Query Parameters:**
- `page` (number, optional): Trang hiện tại (default: 1)
- `limit` (number, optional): Số lượng mỗi trang (default: 10)
- `search` (string, optional): Tìm kiếm theo tên hoặc mô tả

**Response:**
```json
{
  "data": {
    "workflows": [
      {
        "id": "uuid",
        "name": "My Workflow",
        "description": "Description",
        "metadata": {
          "author": "user@example.com",
          "version": 1,
          "tags": ["automation", "email"]
        },
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

**Frontend Usage:**
```typescript
const fetchWorkflows = async (page = 1, search = '') => {
  const response = await fetch(
    `/api/workflows?page=${page}&limit=10&search=${encodeURIComponent(search)}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  const { data } = await response.json();
  return data;
};
```

---

### **2. Lấy chi tiết một workflow**

```
GET /api/workflows/{id}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "My Workflow",
    "description": "Description",
    "nodes": [
      {
        "id": "node-1",
        "type": "if-else",
        "position": { "x": 100, "y": 100 },
        "config": {
          "condition": "{{input.value}} > 10"
        }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "node-1",
        "target": "node-2",
        "sourceHandle": "true"
      }
    ],
    "metadata": {
      "author": "user@example.com",
      "version": 1,
      "tags": []
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Frontend Usage:**
```typescript
const fetchWorkflow = async (workflowId: string) => {
  const response = await fetch(`/api/workflows/${workflowId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  const { data } = await response.json();
  return data;
};
```

---

### **3. Tạo workflow mới**

```
POST /api/workflows
```

**Request Body:**
```json
{
  "name": "My New Workflow",
  "description": "Optional description",
  "nodes": [
    {
      "id": "node-1",
      "type": "if-else",
      "position": { "x": 100, "y": 100 },
      "config": {
        "condition": "{{input.value}} > 10"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2"
    }
  ],
  "metadata": {
    "tags": ["automation"]
  }
}
```

**Response:** (201 Created)
```json
{
  "data": {
    "id": "new-uuid",
    "name": "My New Workflow",
    ...
  }
}
```

**Frontend Usage:**
```typescript
const createWorkflow = async (workflowData) => {
  const response = await fetch('/api/workflows', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workflowData)
  });
  const { data } = await response.json();
  return data;
};
```

---

### **4. Cập nhật workflow**

```
PUT /api/workflows/{id}
```

**Request Body:** (Tất cả fields đều optional)
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "nodes": [...],
  "edges": [...],
  "metadata": {
    "tags": ["updated"]
  }
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "Updated Name",
    "metadata": {
      "version": 2,
      ...
    },
    ...
  }
}
```

**Frontend Usage:**
```typescript
const updateWorkflow = async (workflowId: string, updates) => {
  const response = await fetch(`/api/workflows/${workflowId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates)
  });
  const { data } = await response.json();
  return data;
};
```

---

### **5. Xóa workflow**

```
DELETE /api/workflows/{id}
```

**Response:**
```json
{
  "data": {
    "success": true,
    "deleted_id": "uuid"
  }
}
```

**Frontend Usage:**
```typescript
const deleteWorkflow = async (workflowId: string) => {
  const response = await fetch(`/api/workflows/${workflowId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  const { data } = await response.json();
  return data;
};
```

---

## **Thực thi Workflows**

### **6. Validate workflow trước khi chạy**

```
GET /api/workflows/{id}/validate
```

**Response:**
```json
{
  "data": {
    "valid": true,
    "errors": [],
    "warnings": [
      {
        "nodeId": "node-3",
        "type": "missing-config",
        "message": "Code node has empty code field"
      }
    ]
  }
}
```

**Frontend Usage:**
```typescript
const validateWorkflow = async (workflowId: string) => {
  const response = await fetch(`/api/workflows/${workflowId}/validate`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  const { data } = await response.json();
  return data;
};

// Sử dụng trước khi execute
const handleExecute = async () => {
  const validation = await validateWorkflow(workflowId);
  
  if (!validation.valid) {
    alert(`Workflow có lỗi: ${validation.errors.map(e => e.message).join(', ')}`);
    return;
  }
  
  if (validation.warnings.length > 0) {
    const proceed = confirm(
      `Workflow có cảnh báo. Bạn có muốn tiếp tục?\n${validation.warnings.map(w => w.message).join('\n')}`
    );
    if (!proceed) return;
  }
  
  await executeWorkflow(workflowId);
};
```

---

### **7. Thực thi workflow (Manual Trigger)**

```
POST /api/workflows/{id}/execute
```

**Request Body:** (Optional)
```json
{
  "input": {
    "value": 15,
    "customer_name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Response:** (202 Accepted)
```json
{
  "data": {
    "executionId": "execution-uuid",
    "status": "running",
    "message": "Workflow execution started"
  }
}
```

**Frontend Usage:**
```typescript
const executeWorkflow = async (workflowId: string, input = {}) => {
  const response = await fetch(`/api/workflows/${workflowId}/execute`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input })
  });
  const { data } = await response.json();
  return data;
};

// Polling để kiểm tra kết quả
const pollExecution = async (executionId: string) => {
  let status = 'running';
  
  while (status === 'running') {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
    
    const execution = await fetch(`/api/executions/${executionId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    
    status = execution.data.status;
    
    if (status === 'completed') {
      console.log('Success!', execution.data.results);
      return execution.data;
    } else if (status === 'failed') {
      console.error('Failed:', execution.data.error);
      throw new Error(execution.data.error);
    }
  }
};

// Sử dụng
const { executionId } = await executeWorkflow(workflowId, { value: 15 });
const result = await pollExecution(executionId);
```


---

## **Quản lý Triggers**

### **8. Lấy danh sách triggers của workflow**

```
GET /api/workflows/{id}/triggers
```

**Response:**
```json
{
  "data": {
    "triggers": [
      {
        "id": "trigger-uuid",
        "workflow_id": "workflow-uuid",
        "type": "schedule",
        "config": {
          "cronExpression": "0 9 * * *",
          "timezone": "Asia/Ho_Chi_Minh"
        },
        "is_active": true,
        "last_triggered_at": "2024-01-01T09:00:00Z",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

**Frontend Usage:**
```typescript
const fetchTriggers = async (workflowId: string) => {
  const response = await fetch(`/api/workflows/${workflowId}/triggers`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  const { data } = await response.json();
  return data.triggers;
};
```

---

### **9. Tạo trigger mới**

```
POST /api/workflows/{id}/triggers
```

**Request Body - Schedule Trigger:**
```json
{
  "type": "schedule",
  "config": {
    "cronExpression": "0 9 * * *",
    "timezone": "Asia/Ho_Chi_Minh"
  },
  "is_active": true
}
```

**Request Body - Email Trigger:**
```json
{
  "type": "email",
  "config": {
    "emailAccountId": "account-uuid",
    "filters": {
      "from": "customer@example.com",
      "subject": "Order"
    }
  },
  "is_active": true
}
```

**Request Body - Webhook Trigger:**
```json
{
  "type": "webhook",
  "config": {
    "authType": "apiKey",
    "secret": "your-secret-key"
  },
  "is_active": true
}
```

**Response:** (201 Created)
```json
{
  "data": {
    "id": "trigger-uuid",
    "workflow_id": "workflow-uuid",
    "type": "schedule",
    "config": {...},
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

**Frontend Usage:**
```typescript
// Schedule Trigger
const createScheduleTrigger = async (workflowId: string, cronExpression: string) => {
  const response = await fetch(`/api/workflows/${workflowId}/triggers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'schedule',
      config: {
        cronExpression,
        timezone: 'Asia/Ho_Chi_Minh'
      },
      is_active: true
    })
  });
  const { data } = await response.json();
  return data;
};

// Email Trigger
const createEmailTrigger = async (workflowId: string, emailAccountId: string, filters: any) => {
  const response = await fetch(`/api/workflows/${workflowId}/triggers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'email',
      config: {
        emailAccountId,
        filters
      },
      is_active: true
    })
  });
  const { data } = await response.json();
  return data;
};

// Webhook Trigger
const createWebhookTrigger = async (workflowId: string) => {
  const response = await fetch(`/api/workflows/${workflowId}/triggers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'webhook',
      config: {
        authType: 'apiKey',
        secret: generateRandomSecret()
      },
      is_active: true
    })
  });
  const { data } = await response.json();
  
  // Webhook URL sẽ là: /api/workflows/{workflowId}/webhook/{triggerId}
  const webhookUrl = `${window.location.origin}/api/workflows/${workflowId}/webhook/${data.id}`;
  
  return { ...data, webhookUrl };
};
```

---

### **10. Lấy thông tin webhook trigger**

```
GET /api/workflows/{id}/webhook/{triggerId}
```

**Response:**
```json
{
  "data": {
    "webhookUrl": "/api/workflows/uuid/webhook/trigger-uuid",
    "workflowId": "uuid",
    "triggerId": "trigger-uuid",
    "isActive": true,
    "authType": "apiKey",
    "allowedMethods": ["POST"],
    "allowedContentTypes": ["application/json", "application/x-www-form-urlencoded"],
    "maxBodySize": 1048576,
    "hasSecret": true,
    "hasApiKey": true,
    "lastTriggeredAt": "2024-01-01T00:00:00Z"
  }
}
```

**Frontend Usage:**
```typescript
const getWebhookInfo = async (workflowId: string, triggerId: string) => {
  const response = await fetch(`/api/workflows/${workflowId}/webhook/${triggerId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  const { data } = await response.json();
  return data;
};
```

---

## **Node Types**

### **11. Lấy danh sách các loại node có sẵn**

```
GET /api/node-types
```

**Response:**
```json
{
  "data": {
    "nodes": [
      {
        "type": "if-else",
        "name": "If/Else Branch",
        "category": "logic",
        "description": "Route execution based on conditions",
        "configSchema": {
          "type": "object",
          "properties": {
            "condition": {
              "type": "string",
              "description": "Condition expression"
            }
          },
          "required": ["condition"]
        },
        "inputSchema": {...},
        "outputSchema": {...}
      },
      {
        "type": "send-email",
        "name": "Send Email",
        "category": "action",
        "description": "Send email via SMTP",
        "configSchema": {...}
      }
    ]
  }
}
```

**Frontend Usage:**
```typescript
const fetchNodeTypes = async () => {
  const response = await fetch('/api/node-types', {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  const { data } = await response.json();
  return data.nodes;
};

// Sử dụng để render node palette trong workflow builder
const NodePalette = () => {
  const [nodeTypes, setNodeTypes] = useState([]);
  
  useEffect(() => {
    fetchNodeTypes().then(setNodeTypes);
  }, []);
  
  return (
    <div className="node-palette">
      {nodeTypes.map(nodeType => (
        <div 
          key={nodeType.type}
          className="node-item"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('nodeType', nodeType.type);
          }}
        >
          <h4>{nodeType.name}</h4>
          <p>{nodeType.description}</p>
        </div>
      ))}
    </div>
  );
};
```

---

## **Import/Export**

### **12. Export workflow**

```
GET /api/workflows/{id}/export
```

**Query Parameters:**
- `ids` (string, optional): Comma-separated list of workflow IDs để export nhiều workflows

**Response - Single Workflow:**
```json
{
  "data": {
    "exportVersion": "1.0",
    "exportedAt": "2024-01-01T00:00:00Z",
    "exportedBy": "user@example.com",
    "workflow": {
      "id": "uuid",
      "name": "My Workflow",
      "description": "Description",
      "nodes": [...],
      "edges": [...],
      "metadata": {...}
    }
  }
}
```

**Response - Multiple Workflows:**
```json
{
  "data": {
    "exportVersion": "1.0",
    "exportedAt": "2024-01-01T00:00:00Z",
    "exportedBy": "user@example.com",
    "count": 3,
    "workflows": [...]
  }
}
```

**Frontend Usage:**
```typescript
// Export single workflow
const exportWorkflow = async (workflowId: string) => {
  const response = await fetch(`/api/workflows/${workflowId}/export`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  const { data } = await response.json();
  
  // Download as JSON file
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workflow-${workflowId}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Export multiple workflows
const exportMultipleWorkflows = async (workflowIds: string[]) => {
  const idsParam = workflowIds.join(',');
  const response = await fetch(`/api/workflows/export?ids=${idsParam}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  const { data } = await response.json();
  
  // Download as JSON file
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workflows-export-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

---

### **13. Import workflows**

```
POST /api/workflows/import
```

**Request Body - Single Workflow:**
```json
{
  "workflow": {
    "name": "Imported Workflow",
    "description": "Description",
    "nodes": [...],
    "edges": [...],
    "metadata": {...}
  }
}
```

**Request Body - Multiple Workflows:**
```json
{
  "workflows": [
    {
      "name": "Workflow 1",
      ...
    },
    {
      "name": "Workflow 2",
      ...
    }
  ]
}
```

**Response:**
```json
{
  "data": {
    "success": true,
    "successCount": 2,
    "failedCount": 0,
    "importedWorkflowIds": ["new-uuid-1", "new-uuid-2"],
    "errors": [],
    "warnings": [
      {
        "workflowName": "Workflow 1",
        "warning": "Missing node types: custom-node. Workflow imported but may not execute correctly."
      }
    ],
    "missingNodeTypes": ["custom-node"]
  }
}
```

**Frontend Usage:**
```typescript
const importWorkflows = async (file: File) => {
  const text = await file.text();
  const data = JSON.parse(text);
  
  const response = await fetch('/api/workflows/import', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  });
  
  const result = await response.json();
  
  if (result.data.failedCount > 0) {
    console.error('Import errors:', result.data.errors);
  }
  
  if (result.data.warnings.length > 0) {
    console.warn('Import warnings:', result.data.warnings);
  }
  
  return result.data;
};

// File upload component
const ImportButton = () => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const result = await importWorkflows(file);
      alert(`Import thành công ${result.successCount} workflows!`);
      
      if (result.warnings.length > 0) {
        alert(`Cảnh báo:\n${result.warnings.map(w => w.warning).join('\n')}`);
      }
    } catch (error) {
      alert(`Import thất bại: ${error.message}`);
    }
  };
  
  return (
    <input 
      type="file" 
      accept=".json"
      onChange={handleFileChange}
    />
  );
};
```

---

## **Executions History**

### **14. Lấy danh sách executions**

```
GET /api/executions
```

**Query Parameters:**
- `workflow_id` (string, optional): Filter by workflow ID
- `status` (string, optional): Filter by status (running, completed, failed)
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Response:**
```json
{
  "data": {
    "executions": [
      {
        "id": "execution-uuid",
        "workflow_id": "workflow-uuid",
        "user_id": "user-uuid",
        "status": "completed",
        "results": {
          "node-1": { "output": "value" },
          "node-2": { "output": "value" }
        },
        "error": null,
        "started_at": "2024-01-01T00:00:00Z",
        "completed_at": "2024-01-01T00:00:05Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10
  }
}
```

**Frontend Usage:**
```typescript
const fetchExecutions = async (workflowId?: string, status?: string) => {
  const params = new URLSearchParams();
  if (workflowId) params.append('workflow_id', workflowId);
  if (status) params.append('status', status);
  
  const response = await fetch(`/api/executions?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  const { data } = await response.json();
  return data;
};
```

---

### **15. Lấy chi tiết một execution**

```
GET /api/executions/{id}
```

**Response:**
```json
{
  "data": {
    "id": "execution-uuid",
    "workflow_id": "workflow-uuid",
    "user_id": "user-uuid",
    "status": "completed",
    "results": {
      "node-1": {
        "success": true,
        "output": { "value": 15 },
        "duration_ms": 100
      },
      "node-2": {
        "success": true,
        "output": { "email_sent": true },
        "duration_ms": 500
      }
    },
    "error": null,
    "started_at": "2024-01-01T00:00:00Z",
    "completed_at": "2024-01-01T00:00:05Z"
  }
}
```

**Frontend Usage:**
```typescript
const fetchExecution = async (executionId: string) => {
  const response = await fetch(`/api/executions/${executionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });
  const { data } = await response.json();
  return data;
};

// Execution history table component
const ExecutionHistory = ({ workflowId }) => {
  const [executions, setExecutions] = useState([]);
  
  useEffect(() => {
    fetchExecutions(workflowId).then(data => setExecutions(data.executions));
  }, [workflowId]);
  
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Status</th>
          <th>Started</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        {executions.map(exec => (
          <tr key={exec.id}>
            <td>{exec.id.slice(0, 8)}</td>
            <td>
              <span className={`status-${exec.status}`}>
                {exec.status}
              </span>
            </td>
            <td>{new Date(exec.started_at).toLocaleString()}</td>
            <td>
              {exec.completed_at 
                ? `${Math.round((new Date(exec.completed_at) - new Date(exec.started_at)) / 1000)}s`
                : 'Running...'
              }
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

## **Error Handling**

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Request thành công |
| 201 | Created | Resource được tạo thành công |
| 202 | Accepted | Request được chấp nhận (async processing) |
| 400 | Bad Request | Kiểm tra request body/params |
| 401 | Unauthorized | Token không hợp lệ hoặc hết hạn |
| 403 | Forbidden | Không có quyền truy cập |
| 404 | Not Found | Resource không tồn tại |
| 500 | Internal Server Error | Lỗi server |

### Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "name",
    "message": "Name is required"
  }
}
```

### Frontend Error Handling

```typescript
const handleApiError = (error: any) => {
  if (error.status === 401) {
    // Token expired - redirect to login
    window.location.href = '/login';
  } else if (error.status === 400) {
    // Validation error
    alert(`Validation error: ${error.error}`);
  } else if (error.status === 404) {
    // Not found
    alert('Resource not found');
  } else {
    // Generic error
    alert(`Error: ${error.error || 'Something went wrong'}`);
  }
};

// Wrapper function
const apiRequest = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw { status: response.status, ...error };
    }
    
    return await response.json();
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
```

---

## **Code Examples**

### Complete React Hook Example

```typescript
// hooks/useWorkflows.ts
import { useState, useEffect } from 'react';

export const useWorkflows = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const token = localStorage.getItem('access_token');
  
  const fetchWorkflows = async (search = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/workflows?search=${encodeURIComponent(search)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch workflows');
      
      const { data } = await response.json();
      setWorkflows(data.workflows);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const createWorkflow = async (workflowData) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflowData)
      });
      
      if (!response.ok) throw new Error('Failed to create workflow');
      
      const { data } = await response.json();
      setWorkflows(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  const updateWorkflow = async (workflowId, updates) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update workflow');
      
      const { data } = await response.json();
      setWorkflows(prev => prev.map(w => w.id === workflowId ? data : w));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  const deleteWorkflow = async (workflowId) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete workflow');
      
      setWorkflows(prev => prev.filter(w => w.id !== workflowId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  const executeWorkflow = async (workflowId, input = {}) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input })
      });
      
      if (!response.ok) throw new Error('Failed to execute workflow');
      
      const { data } = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  useEffect(() => {
    fetchWorkflows();
  }, []);
  
  return {
    workflows,
    loading,
    error,
    fetchWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
  };
};
```

### Complete Workflow Builder Component

```typescript
// components/WorkflowBuilder.tsx
import React, { useState, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

export const WorkflowBuilder = ({ workflowId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowName, setWorkflowName] = useState('');
  const [saving, setSaving] = useState(false);
  
  const token = localStorage.getItem('access_token');
  
  // Load workflow
  useEffect(() => {
    if (workflowId) {
      fetch(`/api/workflows/${workflowId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(({ data }) => {
          setWorkflowName(data.name);
          setNodes(data.nodes);
          setEdges(data.edges);
        });
    }
  }, [workflowId]);
  
  // Handle edge connection
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  
  // Save workflow
  const handleSave = async () => {
    setSaving(true);
    
    try {
      const method = workflowId ? 'PUT' : 'POST';
      const url = workflowId ? `/api/workflows/${workflowId}` : '/api/workflows';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: workflowName,
          nodes,
          edges,
        })
      });
      
      if (!response.ok) throw new Error('Failed to save workflow');
      
      alert('Workflow saved successfully!');
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  // Execute workflow
  const handleExecute = async () => {
    if (!workflowId) {
      alert('Please save the workflow first');
      return;
    }
    
    try {
      // Validate first
      const validation = await fetch(`/api/workflows/${workflowId}/validate`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(r => r.json());
      
      if (!validation.data.valid) {
        alert(`Validation errors:\n${validation.data.errors.map(e => e.message).join('\n')}`);
        return;
      }
      
      // Execute
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: {} })
      });
      
      const { data } = await response.json();
      alert(`Workflow execution started! Execution ID: ${data.executionId}`);
      
      // Poll for result
      pollExecution(data.executionId);
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };
  
  const pollExecution = async (executionId) => {
    let status = 'running';
    
    while (status === 'running') {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch(`/api/executions/${executionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const { data } = await response.json();
      status = data.status;
      
      if (status === 'completed') {
        alert('Workflow completed successfully!');
        console.log('Results:', data.results);
      } else if (status === 'failed') {
        alert(`Workflow failed: ${data.error}`);
      }
    }
  };
  
  return (
    <div style={{ height: '100vh' }}>
      <div style={{ padding: '10px', background: '#f0f0f0' }}>
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          placeholder="Workflow name"
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={handleExecute} style={{ marginLeft: '10px' }}>
          Execute
        </button>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
```

---

## **Tổng kết**

### Các endpoint chính:

1. **Workflows**: GET, POST, PUT, DELETE `/api/workflows`
2. **Execute**: POST `/api/workflows/{id}/execute`
3. **Validate**: GET `/api/workflows/{id}/validate`
4. **Triggers**: GET, POST `/api/workflows/{id}/triggers`
5. **Webhook**: POST `/api/workflows/{id}/webhook/{triggerId}`
6. **Node Types**: GET `/api/node-types`
7. **Import/Export**: GET `/api/workflows/{id}/export`, POST `/api/workflows/import`
8. **Executions**: GET `/api/executions`, GET `/api/executions/{id}`

### Best Practices:

1. **Luôn validate workflow trước khi execute**
2. **Sử dụng polling để theo dõi execution status**
3. **Handle errors properly với try-catch**
4. **Store token securely (localStorage hoặc httpOnly cookie)**
5. **Implement loading states cho UX tốt hơn**
6. **Cache node types để giảm API calls**
7. **Debounce auto-save trong workflow builder**

### Lưu ý:

- Tất cả endpoints đều yêu cầu authentication
- Response format nhất quán với `{ data, error, message }`
- Workflow execution là async (202 Accepted)
- Import/export hỗ trợ cả single và multiple workflows
- Webhook URL được generate tự động khi tạo webhook trigger
