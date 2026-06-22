/**
 * API Client for Backend Communication
 */

import { API_BASE_URL } from './config.js';

/**
 * Base API request handler
 * @param {string} endpoint - API endpoint path
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>} Response data
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  // Get auth token from localStorage
  const token = localStorage.getItem('office_weave_token')
  
  // Debugging: Log token hiện tại
  console.log("=== API REQUEST DEBUG ===")
  console.log("Endpoint:", endpoint)
  console.log("Token hiện tại trong máy:", token)
  console.log("Token exists:", !!token)
  console.log("All localStorage keys:", Object.keys(localStorage))
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // Chỉ thêm Authorization header nếu có token (tránh gửi "Bearer undefined")
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  }
  
  console.log("Headers being sent:", config.headers)

  try {
    console.log(`API Request: ${config.method || 'GET'} ${url}`)
    
    const response = await fetch(url, config)
    
    // Handle different response types
    let data
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      try {
        data = JSON.parse(text)
      } catch {
        data = { message: text }
      }
    }

    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`, data)
      
      // Xử lý lỗi 401 (Unauthorized): Xóa token và redirect về login
      // CHỈ redirect nếu KHÔNG đang ở trang login (tránh infinite loop)
      if (response.status === 401) {
        console.log('Unauthorized - Xóa token')
        localStorage.removeItem('office_weave_token')
        localStorage.removeItem('user_data')
        
        // Chỉ redirect nếu không đang ở trang login
        const currentPath = window.location.pathname + window.location.hash
        if (!currentPath.includes('/login') && !currentPath.includes('#/signin')) {
          console.log('Redirecting to login...')
          window.location.href = '/#/signin'
        }
      }
      
      throw new Error(data.error || data.message || `API request failed with status ${response.status}`)
    }

    console.log(`API Success: ${config.method || 'GET'} ${url}`, data)
    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

/**
 * API Client with all methods
 */
export const apiClient = {
  // ==================== AUTH METHODS ====================
  
  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{data: {user: object}}>}
   */
  async signup(email, password) {
    const response = await request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    console.log("Full response từ BE:", response)
    console.log("Type of response:", typeof response)
    
    // Kiểm tra response có tồn tại không
    if (!response) {
      console.error("Response từ BE là null/undefined!")
      throw new Error("Backend không trả về response")
    }
    
    // Kiểm tra token ở nhiều vị trí có thể
    const token = response.token || 
                  (response.data && response.data.token) || 
                  response.access_token || 
                  (response.data && response.data.access_token) ||
                  (response.data && response.data.session && response.data.session.access_token)
    
    if (!token) {
      console.error("BE không trả về token!")
      console.error("Response structure:", JSON.stringify(response, null, 2))
      throw new Error("Backend không trả về token")
    }
    
    console.log("Token nhận được từ signup:", token)
    localStorage.setItem('office_weave_token', token)
    
    // Lưu user data nếu có
    const userData = response.user || 
                     (response.data && response.data.user) || 
                     (response.data && response.data.session && response.data.session.user)
    if (userData) {
      localStorage.setItem('user_data', JSON.stringify(userData))
    }
    
    return response
  },

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{data: {user: object, session: object}}>}
   */
  async login(email, password) {
    const response = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    console.log("Full response từ BE:", response)
    console.log("Type of response:", typeof response)
    
    // Kiểm tra response có tồn tại không
    if (!response) {
      console.error("Response từ BE là null/undefined!")
      throw new Error("Backend không trả về response")
    }
    
    // Kiểm tra token ở nhiều vị trí có thể
    const token = response.token || 
                  (response.data && response.data.token) || 
                  response.access_token || 
                  (response.data && response.data.access_token) ||
                  (response.data && response.data.session && response.data.session.access_token)
    
    if (!token) {
      console.error("BE không trả về token!")
      console.error("Response structure:", JSON.stringify(response, null, 2))
      throw new Error("Backend không trả về token")
    }
    
    console.log("Token nhận được từ login:", token)
    localStorage.setItem('office_weave_token', token)
    
    // Lưu user data nếu có
    const userData = response.user || 
                     (response.data && response.data.user) || 
                     (response.data && response.data.session && response.data.session.user)
    if (userData) {
      localStorage.setItem('user_data', JSON.stringify(userData))
    }
    
    return response
  },

  /**
   * Logout current user
   * @returns {Promise<{data: {message: string}}>}
   */
  async logout() {
    const response = await request('/api/auth/logout', {
      method: 'POST',
    })
    
    // Xóa token và user data sau khi logout
    localStorage.removeItem('office_weave_token')
    localStorage.removeItem('user_data')
    
    return response
  },

  /**
   * Get current authenticated user
   * @returns {Promise<{data: object}>}
   */
  async getCurrentUser() {
    return request('/api/auth/user')
  },

  // ==================== WORKFLOW METHODS ====================

  /**
   * Create a new workflow
   * @param {object} workflow - Workflow data
   * @param {string} workflow.name - Workflow name
   * @param {string} workflow.description - Workflow description
   * @param {Array} workflow.nodes - Workflow nodes
   * @param {Array} workflow.edges - Workflow edges
   * @param {object} workflow.metadata - Additional metadata
   * @returns {Promise<{data: object}>}
   */
  async createWorkflow(workflow) {
    return request('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    })
  },

  /**
   * Get list of workflows
   * @param {object} params - Query parameters
   * @param {string} params.search - Search query
   * @param {number} params.limit - Limit results
   * @param {number} params.offset - Offset for pagination
   * @returns {Promise<{data: {workflows: Array, total: number, limit: number, offset: number}}>}
   */
  async getWorkflows(params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v != null)
    ).toString()
    return request(`/api/workflows${query ? `?${query}` : ''}`)
  },

  /**
   * Get workflow by ID
   * @param {string} id - Workflow ID
   * @returns {Promise<{data: object}>}
   */
  async getWorkflow(id) {
    return request(`/api/workflows/${id}`)
  },

  /**
   * Update workflow
   * @param {string} id - Workflow ID
   * @param {object} updates - Updated workflow data
   * @returns {Promise<{data: object}>}
   */
  async updateWorkflow(id, updates) {
    return request(`/api/workflows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  /**
   * Delete workflow
   * @param {string} id - Workflow ID
   * @returns {Promise<{data: {message: string}}>}
   */
  async deleteWorkflow(id) {
    return request(`/api/workflows/${id}`, {
      method: 'DELETE',
    })
  },

  // ==================== WORKFLOW EXECUTION (SERVER-SIDE) ====================

  /**
   * Validate workflow before execution
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<{data: {valid: boolean, errors: Array, warnings: Array}}>}
   */
  async validateWorkflow(workflowId) {
    return request(`/api/workflows/${workflowId}/validate`)
  },

  /**
   * Execute workflow on server-side
   * @param {string} workflowId - Workflow ID
   * @param {object} input - Optional input data for the workflow
   * @returns {Promise<{data: {executionId: string, status: string, message: string}}>}
   */
  async executeWorkflow(workflowId, input = {}) {
    return request(`/api/workflows/${workflowId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ input }),
    })
  },

  // ==================== TRIGGERS ====================

  /**
   * Get triggers for a workflow
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<{data: {triggers: Array}}>}
   */
  async getTriggers(workflowId) {
    return request(`/api/workflows/${workflowId}/triggers`)
  },

  /**
   * Create a new trigger for a workflow
   * @param {string} workflowId - Workflow ID
   * @param {object} trigger - Trigger configuration
   * @param {'schedule'|'email'|'webhook'} trigger.type - Trigger type
   * @param {object} trigger.config - Trigger-specific config
   * @param {boolean} trigger.is_active - Whether trigger is active
   * @returns {Promise<{data: object}>}
   */
  async createTrigger(workflowId, trigger) {
    return request(`/api/workflows/${workflowId}/triggers`, {
      method: 'POST',
      body: JSON.stringify(trigger),
    })
  },

  /**
   * Get webhook trigger info
   * @param {string} workflowId - Workflow ID
   * @param {string} triggerId - Trigger ID
   * @returns {Promise<{data: object}>}
   */
  async getWebhookInfo(workflowId, triggerId) {
    return request(`/api/workflows/${workflowId}/webhook/${triggerId}`)
  },

  // ==================== NODE TYPES ====================

  /**
   * Get available node types from backend
   * @returns {Promise<{data: {nodes: Array}}>}
   */
  async getNodeTypes() {
    return request('/api/node-types')
  },

  // ==================== IMPORT / EXPORT ====================

  /**
   * Export a single workflow
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<{data: object}>}
   */
  async exportWorkflow(workflowId) {
    return request(`/api/workflows/${workflowId}/export`)
  },

  /**
   * Export multiple workflows
   * @param {string[]} workflowIds - Array of workflow IDs
   * @returns {Promise<{data: object}>}
   */
  async exportWorkflows(workflowIds) {
    const ids = workflowIds.join(',')
    return request(`/api/workflows/export?ids=${ids}`)
  },

  /**
   * Import workflows from JSON data
   * @param {object} importData - Import payload (single or multiple workflows)
   * @returns {Promise<{data: {success: boolean, successCount: number, failedCount: number, importedWorkflowIds: Array}}>}
   */
  async importWorkflows(importData) {
    return request('/api/workflows/import', {
      method: 'POST',
      body: JSON.stringify(importData),
    })
  },

  // ==================== AI METHODS ====================

  /**
   * Chat with AI
   * @param {object} params - Chat parameters
   * @param {string} params.prompt - User prompt
   * @param {'groq'|'gemini'|'openai'} params.provider - AI provider
   * @param {string} params.model - Model name (e.g., 'llama-3.3-70b-versatile')
   * @param {number} params.temperature - Temperature (0-1)
   * @param {number} params.maxTokens - Max tokens
   * @param {string} params.systemPrompt - System prompt
   * @returns {Promise<{data: {response: string, usage: object, metadata: object}}>}
   */
  async chatWithAI(params) {
    return request('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        provider: 'groq', // Default to groq (fast & free)
        model: params.model || 'llama-3.1-8b-instant', // Default model
        temperature: 0.7,
        maxTokens: 1000,
        ...params,
      }),
    })
  },

  // ==================== EXECUTION METHODS ====================

  /**
   * Create a new execution
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<{data: object}>}
   */
  async createExecution(workflowId) {
    return request('/api/executions', {
      method: 'POST',
      body: JSON.stringify({ 
        workflow_id: workflowId, 
        status: 'running' 
      }),
    })
  },

  /**
   * Get list of executions
   * @param {object} params - Query parameters
   * @param {string} params.workflow_id - Filter by workflow ID
   * @param {string} params.status - Filter by status
   * @param {number} params.limit - Limit results
   * @param {number} params.offset - Offset for pagination
   * @returns {Promise<{data: {executions: Array, total: number, limit: number, offset: number}}>}
   */
  async getExecutions(params = {}) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v != null)
    ).toString()
    return request(`/api/executions${query ? `?${query}` : ''}`)
  },

  /**
   * Get execution by ID
   * @param {string} id - Execution ID
   * @returns {Promise<{data: object}>}
   */
  async getExecution(id) {
    return request(`/api/executions/${id}`)
  },

  /**
   * Update execution
   * @param {string} id - Execution ID
   * @param {object} updates - Updated execution data
   * @param {string} updates.status - Execution status
   * @param {object} updates.results - Execution results
   * @param {string} updates.error - Error message if failed
   * @returns {Promise<{data: object}>}
   */
  async updateExecution(id, updates) {
    return request(`/api/executions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  },

  // ==================== SETTINGS METHODS ====================

  /**
   * Get user settings
   * @returns {Promise<{data: object}>}
   */
  async getSettings() {
    return request('/api/settings')
  },

  /**
   * Update user settings
   * @param {object} settings - Settings data
   * @param {object} settings.email_config - Email configuration
   * @param {object} settings.preferences - User preferences
   * @returns {Promise<{data: object}>}
   */
  async updateSettings(settings) {
    return request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    })
  },
}

/**
 * Error handler helper
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export function handleApiError(error) {
  if (error.message.includes('401')) {
    return 'Vui lòng đăng nhập lại'
  }
  if (error.message.includes('403')) {
    return 'Bạn không có quyền thực hiện thao tác này'
  }
  if (error.message.includes('404')) {
    return 'Không tìm thấy dữ liệu'
  }
  if (error.message.includes('429')) {
    return 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau'
  }
  if (error.message.includes('500')) {
    return 'Lỗi server. Vui lòng thử lại sau'
  }
  return error.message || 'Đã có lỗi xảy ra'
}

/**
 * Check if user has valid authentication
 * @returns {boolean}
 */
export function hasValidAuth() {
  const token = localStorage.getItem('office_weave_token')
  const userData = localStorage.getItem('user_data')
  return !!(token && userData)
}

/**
 * Clear all authentication data
 */
export function clearAuth() {
  localStorage.removeItem('office_weave_token')
  localStorage.removeItem('user_data')
}

/**
 * Get stored user data
 * @returns {object|null}
 */
export function getStoredUser() {
  try {
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  } catch (error) {
    console.error('Failed to parse stored user data:', error)
    clearAuth()
    return null
  }
}

export default apiClient
