# Workflow Automation System - API Documentation

**Base URL**: `http://localhost:3000` (Development)  
**Authentication**: Bearer token trong header `Authorization`

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Workflow Management](#workflow-management)
3. [Workflow Execution](#workflow-execution)
4. [Triggers](#triggers)
5. [Node Types](#node-types)
6. [Email Accounts](#email-accounts)
7. [Email Templates](#email-templates)
8. [Usage & Rate Limiting](#usage--rate-limiting)
9. [Import/Export](#importexport)
10. [Error Handling](#error-handling)

---

## 🔐 Authentication

Tất cả API endpoints (trừ login/signup) yêu cầu authentication token:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Get Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "refresh_token": "eyJhbGc...",
    "expires_in": 3600
  }
}
```

---

## 🔄 Workflow Management

### 1. List All Workflows

```http
GET /api/workflows
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "workflows": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "user-uuid",
      "name": "Customer Onboarding",
      "description": "Automated email sequence for new customers",
      "nodes": [...],
      "edges": [...],
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 2. Get Single Workflow

```http
GET /api/workflows/{id}
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "workflow": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Customer Onboarding",
    "nodes": [
      {
        "id": "node-1",
        "type": "if-else",
        "config": {
          "condition": "{{input.customer_type}} == 'vip'"
        }
      },
      {
        "id": "node-2",
        "type": "send-email",
        "config": {
          "to": ["{{input.email}}"],
          "subject": "Welcome VIP Customer",
          "body": {
            "html": "<h1>Welcome!</h1>"
          }
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
    ]
  }
}
```

### 3. Create Workflow

```http
POST /api/workflows
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "My Workflow",
  "description": "Description here",
  "nodes": [
    {
      "id": "node-1",
      "type": "if-else",
      "config": {
        "condition": "{{input.value}} > 10"
      }
    }
  ],
  "edges": []
}
```

**Response:**
```json
{
  "workflow": {
    "id": "new-workflow-uuid",
    "name": "My Workflow",
    ...
  },
  "message": "Workflow created successfully"
}
```

### 4. Update Workflow

```http
PATCH /api/workflows/{id}
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "is_active": false
}
```

### 5. Delete Workflow

```http
DELETE /api/workflows/{id}
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "message": "Workflow deleted successfully"
}
```

---

## ▶️ Workflow Execution

### 1. Execute Workflow

```http
POST /api/workflows/{id}/execute
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "input": {
    "customer_email": "customer@example.com",
    "customer_type": "vip",
    "order_total": 150.00
  }
}
```

**Response (202 Accepted):**
```json
{
  "executionId": "exec-uuid",
  "status": "running",
  "message": "Workflow execution started"
}
```

### 2. Get Execution Status

```http
GET /api/executions/{executionId}
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "execution": {
    "id": "exec-uuid",
    "workflow_id": "workflow-uuid",
    "status": "completed",
    "input_data": {
      "customer_email": "customer@example.com"
    },
    "output_data": {
      "email_sent": true,
      "message_id": "msg-123"
    },
    "started_at": "2024-01-15T10:30:00Z",
    "completed_at": "2024-01-15T10:30:05Z",
    "duration_ms": 5000,
    "logs": [
      {
        "node_id": "node-1",
        "node_type": "if-else",
        "status": "completed",
        "output_data": {
          "branch": "true"
        },
        "duration_ms": 50
      },
      {
        "node_id": "node-2",
        "node_type": "send-email",
        "status": "completed",
        "output_data": {
          "message_id": "msg-123"
        },
        "duration_ms": 4950
      }
    ]
  }
}
```

### 3. List Executions

```http
GET /api/executions?workflow_id={id}&status=completed&limit=10
Authorization: Bearer TOKEN
```

**Query Parameters:**
- `workflow_id` (optional): Filter by workflow
- `status` (optional): `running`, `completed`, `failed`
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset

### 4. Validate Workflow

```http
GET /api/workflows/{id}/validate
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    {
      "nodeId": "node-3",
      "type": "unused_node",
      "message": "Node is not connected to any other nodes"
    }
  ]
}
```

---

## ⏰ Triggers

### 1. List Triggers

```http
GET /api/workflows/{workflowId}/triggers
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "triggers": [
    {
      "id": "trigger-uuid",
      "workflow_id": "workflow-uuid",
      "trigger_type": "schedule",
      "config": {
        "cron_expression": "0 9 * * *",
        "timezone": "Asia/Ho_Chi_Minh"
      },
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 2. Create Schedule Trigger

```http
POST /api/workflows/{workflowId}/triggers
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "trigger_type": "schedule",
  "config": {
    "cron_expression": "0 9 * * *",
    "timezone": "Asia/Ho_Chi_Minh",
    "input_data": {
      "source": "scheduled"
    }
  },
  "is_active": true
}
```

**Cron Expression Examples:**
- `0 9 * * *` - Every day at 9:00 AM
- `*/15 * * * *` - Every 15 minutes
- `0 0 * * 0` - Every Sunday at midnight
- `0 12 1 * *` - First day of month at noon

### 3. Create Email Trigger

```http
POST /api/workflows/{workflowId}/triggers
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "trigger_type": "email",
  "config": {
    "email_account_id": "account-uuid",
    "folder": "INBOX",
    "polling_interval_minutes": 5,
    "filter_rules": [
      {
        "field": "subject",
        "operator": "contains",
        "value": "Order Confirmation"
      },
      {
        "field": "from",
        "operator": "equals",
        "value": "orders@example.com"
      }
    ],
    "mark_as_read": true
  },
  "is_active": true
}
```

### 4. Create Webhook Trigger

```http
POST /api/workflows/{workflowId}/triggers
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "trigger_type": "webhook",
  "config": {
    "authentication": {
      "type": "api_key",
      "key": "your-secret-key"
    }
  },
  "is_active": true
}
```

**Response:**
```json
{
  "trigger": {
    "id": "trigger-uuid",
    "trigger_type": "webhook",
    "config": {
      "webhook_url": "https://your-domain.com/api/workflows/workflow-uuid/webhook/trigger-uuid",
      "authentication": {
        "type": "api_key"
      }
    }
  }
}
```

**Trigger Webhook:**
```http
POST https://your-domain.com/api/workflows/{workflowId}/webhook/{triggerId}
Content-Type: application/json
X-API-Key: your-secret-key

{
  "order_id": "12345",
  "customer_email": "customer@example.com"
}
```

### 5. Update Trigger

```http
PATCH /api/workflows/{workflowId}/triggers/{triggerId}
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "is_active": false
}
```

### 6. Delete Trigger

```http
DELETE /api/workflows/{workflowId}/triggers/{triggerId}
Authorization: Bearer TOKEN
```

---

## 🧩 Node Types

### Get Available Node Types

```http
GET /api/node-types
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "nodeTypes": [
    {
      "type": "if-else",
      "name": "If/Else",
      "description": "Branch workflow based on condition",
      "category": "logic",
      "config_schema": {
        "condition": {
          "type": "string",
          "required": true,
          "description": "Expression to evaluate (e.g., {{input.value}} > 10)"
        }
      },
      "input_schema": {},
      "output_schema": {
        "branch": {
          "type": "string",
          "enum": ["true", "false"]
        }
      }
    },
    {
      "type": "send-email",
      "name": "Send Email",
      "description": "Send email via SMTP or Gmail",
      "category": "action",
      "config_schema": {
        "to": {
          "type": "array",
          "required": true
        },
        "subject": {
          "type": "string",
          "required": true
        },
        "body": {
          "type": "object",
          "required": true
        }
      }
    }
  ]
}
```

**Available Node Types:**

**Logic Nodes:**
- `if-else` - Conditional branching
- `switch` - Multi-way branching
- `loop` - Iterate over arrays
- `delay` - Wait for duration
- `merge` - Combine multiple inputs
- `set-variable` - Store values
- `code` - Execute JavaScript
- `data-mapper` - Transform data

**Action Nodes:**
- `send-email` - Send emails
- `read-email` - Read emails from inbox
- `ai-chat` - AI conversation
- `ai-classifier` - AI text classification
- `email-filter` - Filter emails
- `email-template` - Render email templates

---

## 📧 Email Accounts

### 1. List Email Accounts

```http
GET /api/email/accounts
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "accounts": [
    {
      "id": "account-uuid",
      "name": "My Gmail",
      "email_address": "user@gmail.com",
      "provider": "gmail",
      "auth_type": "oauth2",
      "is_active": true,
      "last_sync_at": "2024-01-15T10:30:00Z",
      "last_error": null
    }
  ]
}
```

### 2. Create Email Account (IMAP/SMTP)

```http
POST /api/email/accounts
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "My Email",
  "email_address": "user@example.com",
  "provider": "imap",
  "auth_type": "imap-smtp",
  "config": {
    "username": "user@example.com",
    "password": "your-password",
    "host": "imap.example.com",
    "port": 993,
    "secure": true
  }
}
```

### 3. Create Email Account (Gmail OAuth2)

```http
POST /api/email/accounts
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "My Gmail",
  "email_address": "user@gmail.com",
  "provider": "gmail",
  "auth_type": "oauth2",
  "config": {
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "accessToken": "your-access-token",
    "refreshToken": "your-refresh-token"
  }
}
```

### 4. Validate Email Account

```http
POST /api/email/accounts/{id}/validate
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Connection successful"
}
```

### 5. Update Email Account

```http
PATCH /api/email/accounts/{id}
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "is_active": false
}
```

### 6. Delete Email Account

```http
DELETE /api/email/accounts/{id}
Authorization: Bearer TOKEN
```

---

## 📝 Email Templates

### 1. List Templates

```http
GET /api/email/templates
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "templates": [
    {
      "id": "template-uuid",
      "name": "Welcome Email",
      "subject": "Welcome {{name}}!",
      "body": "<h1>Hello {{name}}</h1><p>Welcome to our platform!</p>",
      "format": "html",
      "variables": ["name"],
      "tags": ["welcome", "onboarding"],
      "usage_count": 150,
      "last_used_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 2. Create Template

```http
POST /api/email/templates
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "Order Confirmation",
  "description": "Sent after order is placed",
  "subject": "Order #{{order_number}} Confirmed",
  "body": "<h1>Thank you {{customer_name}}!</h1><p>Order total: ${{total}}</p>",
  "format": "html",
  "tags": ["orders", "confirmation"]
}
```

**Response:**
```json
{
  "template": {
    "id": "template-uuid",
    "name": "Order Confirmation",
    "variables": ["order_number", "customer_name", "total"],
    ...
  }
}
```

### 3. Preview Template

```http
POST /api/email/templates/{id}/preview
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "data": {
    "order_number": "12345",
    "customer_name": "John Doe",
    "total": "99.99"
  }
}
```

**Response:**
```json
{
  "preview": {
    "subject": "Order #12345 Confirmed",
    "body_html": "<h1>Thank you John Doe!</h1><p>Order total: $99.99</p>",
    "body_text": "Thank you John Doe!\n\nOrder total: $99.99",
    "variables_used": ["order_number", "customer_name", "total"]
  }
}
```

### 4. Update Template

```http
PATCH /api/email/templates/{id}
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "subject": "Updated subject",
  "tags": ["orders", "confirmation", "automated"]
}
```

### 5. Delete Template

```http
DELETE /api/email/templates/{id}
Authorization: Bearer TOKEN
```

---

## 📊 Usage & Rate Limiting

### Get Usage Statistics

```http
GET /api/usage
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "usage": {
    "user_id": "user-uuid",
    "quota_tier": "pro",
    "current_usage": {
      "ai_calls_this_minute": 5,
      "emails_sent_this_hour": 23,
      "workflow_executions_today": 145
    },
    "limits": {
      "ai_calls_per_minute": 20,
      "emails_per_hour": 100,
      "workflow_executions_per_day": 1000
    },
    "reset_times": {
      "ai_calls_reset_at": "2024-01-15T10:31:00Z",
      "emails_reset_at": "2024-01-15T11:00:00Z",
      "workflow_executions_reset_at": "2024-01-16T00:00:00Z"
    }
  }
}
```

**Quota Tiers:**
- `basic`: 10 AI calls/min, 50 emails/hour, 500 executions/day
- `pro`: 20 AI calls/min, 100 emails/hour, 1000 executions/day
- `enterprise`: 50 AI calls/min, 500 emails/hour, 10000 executions/day

**Rate Limit Headers:**
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 1705315860
```

---

## 📦 Import/Export

### 1. Export Single Workflow

```http
GET /api/workflows/{id}/export
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "version": "1.0",
  "exported_at": "2024-01-15T10:30:00Z",
  "workflows": [
    {
      "id": "workflow-uuid",
      "name": "Customer Onboarding",
      "nodes": [...],
      "edges": [...]
    }
  ]
}
```

### 2. Export Multiple Workflows

```http
GET /api/workflows/export?ids=uuid1&ids=uuid2&ids=uuid3
Authorization: Bearer TOKEN
```

### 3. Import Workflows

```http
POST /api/workflows/import
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "version": "1.0",
  "workflows": [
    {
      "name": "Imported Workflow",
      "nodes": [...],
      "edges": [...]
    }
  ]
}
```

**Response:**
```json
{
  "result": {
    "imported": 2,
    "failed": 1,
    "workflows": [
      {
        "original_id": "old-uuid-1",
        "new_id": "new-uuid-1",
        "name": "Workflow 1",
        "status": "success"
      },
      {
        "original_id": "old-uuid-2",
        "new_id": "new-uuid-2",
        "name": "Workflow 2",
        "status": "success"
      }
    ],
    "errors": [
      {
        "workflow_name": "Workflow 3",
        "error": "Invalid node type: custom-node"
      }
    ]
  }
}
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "error": "Validation error",
  "message": "Workflow name is required",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "name",
    "constraint": "required"
  }
}
```

### HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created
- `202 Accepted` - Request accepted (async operation)
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (duplicate)
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Common Error Codes

- `VALIDATION_ERROR` - Invalid input data
- `AUTHENTICATION_REQUIRED` - Missing auth token
- `UNAUTHORIZED` - Invalid or expired token
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `WORKFLOW_VALIDATION_FAILED` - Invalid workflow structure
- `EXECUTION_FAILED` - Workflow execution error
- `CONNECTION_FAILED` - Email account connection error

---

## 🔧 Complete Example: Build a Workflow

```javascript
// 1. Create email account
const emailAccount = await fetch('http://localhost:3000/api/email/accounts', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Gmail',
    email_address: 'user@gmail.com',
    provider: 'gmail',
    auth_type: 'oauth2',
    config: {
      clientId: 'your-client-id',
      clientSecret: 'your-client-secret',
      accessToken: 'your-access-token',
      refreshToken: 'your-refresh-token'
    }
  })
});

// 2. Create email template
const template = await fetch('http://localhost:3000/api/email/templates', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Welcome Email',
    subject: 'Welcome {{name}}!',
    body: '<h1>Hello {{name}}</h1><p>Welcome!</p>',
    format: 'html'
  })
});

// 3. Create workflow
const workflow = await fetch('http://localhost:3000/api/workflows', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Customer Onboarding',
    description: 'Send welcome email to new customers',
    nodes: [
      {
        id: 'node-1',
        type: 'if-else',
        config: {
          condition: '{{input.customer_type}} == "vip"'
        }
      },
      {
        id: 'node-2',
        type: 'send-email',
        config: {
          email_account_id: emailAccount.account.id,
          to: ['{{input.email}}'],
          template_id: template.template.id,
          template_data: {
            name: '{{input.name}}'
          }
        }
      }
    ],
    edges: [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        sourceHandle: 'true'
      }
    ]
  })
});

// 4. Create schedule trigger
const trigger = await fetch(`http://localhost:3000/api/workflows/${workflow.workflow.id}/triggers`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    trigger_type: 'schedule',
    config: {
      cron_expression: '0 9 * * *', // Every day at 9 AM
      timezone: 'Asia/Ho_Chi_Minh'
    },
    is_active: true
  })
});

// 5. Execute workflow manually
const execution = await fetch(`http://localhost:3000/api/workflows/${workflow.workflow.id}/execute`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    input: {
      customer_type: 'vip',
      email: 'customer@example.com',
      name: 'John Doe'
    }
  })
});

// 6. Check execution status
const status = await fetch(`http://localhost:3000/api/executions/${execution.executionId}`, {
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
```

---

## 📚 Additional Resources

- **TypeScript Types**: See `doc/workflow-api-types.ts` for complete TypeScript definitions
- **Node Documentation**: See `sourse/Back-end/lib/workflow-engine/nodes/` for node-specific docs
- **Database Schema**: See `sourse/Back-end/SQL/workflow-engine-schema.sql`

---

## 🆘 Support

For issues or questions:
- Check execution logs: `GET /api/executions/{id}`
- Validate workflow: `GET /api/workflows/{id}/validate`
- Check usage limits: `GET /api/usage`
