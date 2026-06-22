/**
 * Sequential Execution Engine
 * Inspired by LiteGraph.js - handles graph traversal and node execution
 */

import { API_BASE_URL } from '../lib/config.js';

class ExecutionEngine {
  constructor() {
    this.isRunning = false;
    this.executionQueue = [];
    this.nodeRegistry = new Map();
    this.executionCallbacks = new Map();
  }

  /**
   * Register a node processor function
   * @param {string} nodeType - The type of node (e.g., 'research', 'code', 'marketing')
   * @param {Function} processor - The processing function
   */
  registerNodeProcessor(nodeType, processor) {
    this.nodeRegistry.set(nodeType, processor);
  }

  /**
   * Depth-First Search traversal to build execution order
   * @param {Array} nodes - React Flow nodes
   * @param {Array} edges - React Flow edges
   * @returns {Array} - Ordered array of nodes for execution
   */
  buildExecutionOrder(nodes, edges) {
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const edgeMap = new Map();
    const visited = new Set();
    const executionOrder = [];

    // Build adjacency list
    edges.forEach(edge => {
      if (!edgeMap.has(edge.source)) {
        edgeMap.set(edge.source, []);
      }
      edgeMap.get(edge.source).push(edge.target);
    });

    // Find root nodes (nodes with no incoming edges)
    const incomingEdges = new Set(edges.map(edge => edge.target));
    const rootNodes = nodes.filter(node => !incomingEdges.has(node.id));

    // DFS traversal
    const dfs = (nodeId) => {
      if (visited.has(nodeId)) return;
      
      visited.add(nodeId);
      const node = nodeMap.get(nodeId);
      
      if (node) {
        executionOrder.push(node);
        
        // Visit connected nodes
        const connections = edgeMap.get(nodeId) || [];
        connections.forEach(targetId => dfs(targetId));
      }
    };

    // Start DFS from all root nodes
    rootNodes.forEach(node => dfs(node.id));

    return executionOrder;
  }

  /**
   * Execute a single node's data processor
   * @param {Object} node - React Flow node
   * @param {Object} inputData - Data from previous nodes
   * @returns {Promise<Object>} - Execution result
   */
  async executeNode(node, inputData = {}) {
    const { nodeType, pillar, processor } = node.data;
    
    console.log(`\n🔍 Finding processor for node: ${node.data.label}`);
    console.log(`   Node ID: ${node.id}`);
    console.log(`   Node type (React Flow): ${node.type}`);
    console.log(`   Node data.nodeType: ${nodeType}`);
    console.log(`   Node data.pillar: ${pillar}`);
    
    // Try to get processor from node data first, then from registry
    let nodeProcessor = processor;
    
    if (!nodeProcessor) {
      // Try multiple keys to find the right processor
      const processorKeys = [
        node.type, // React Flow node type (e.g., 'promptNode')
        nodeType,  // Custom node type
        pillar,    // Pillar category
        node.data.label?.toLowerCase().replace(/\s+/g, '-')
      ].filter(Boolean);
      
      console.log(`   🔎 Trying processor keys:`, processorKeys);
      
      for (const key of processorKeys) {
        nodeProcessor = this.nodeRegistry.get(key);
        if (nodeProcessor) {
          console.log(`   ✅ Found processor with key: ${key}`);
          break;
        }
      }
    } else {
      console.log(`   ✅ Using processor from node data`);
    }

    if (!nodeProcessor) {
      console.warn(`⚠️ No processor found for node. Trying default processor...`, {
        nodeType,
        pillar,
        type: node.type,
        label: node.data.label
      });
      
      // Use pillar as fallback
      nodeProcessor = this.nodeRegistry.get(pillar) || this.nodeRegistry.get('research');
    }

    // Update node status to running
    this.notifyNodeStatusChange(node.id, 'running');

    try {
      console.log(`   🚀 Executing processor for: ${node.data.label}`);
      console.log(`   📥 Input data:`, inputData);
      
      // Execute the processor with node data and input from previous nodes
      const result = await nodeProcessor(node.data, inputData);
      
      console.log(`   ✅ Processor result:`, result);
      
      // Update node status to success
      this.notifyNodeStatusChange(node.id, 'success');
      
      return {
        nodeId: node.id,
        success: true,
        data: result,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`❌ Node execution error (${node.id}):`, error);
      
      // Update node status to error
      this.notifyNodeStatusChange(node.id, 'error');
      
      return {
        nodeId: node.id,
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Execute the entire graph with data flow between nodes
   * @param {Array} nodes - React Flow nodes
   * @param {Array} edges - React Flow edges
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Array>} - Array of execution results
   */
  async executeGraph(nodes, edges, onProgress = () => {}) {
    if (this.isRunning) {
      throw new Error('Execution already in progress');
    }

    this.isRunning = true;
    const executionOrder = this.buildExecutionOrder(nodes, edges);
    const results = [];
    const nodeOutputs = new Map(); // Store outputs from each node

    console.log('🚀 Starting workflow execution...');
    console.log('📋 Execution order:', executionOrder.map(n => `${n.id}: ${n.data.label}`));

    // Build edge map for quick lookup (target → [{source, sourceHandle}])
    const edgeMap = new Map();
    edges.forEach(edge => {
      if (!edgeMap.has(edge.target)) {
        edgeMap.set(edge.target, []);
      }
      edgeMap.get(edge.target).push({
        source: edge.source,
        sourceHandle: edge.sourceHandle || null,
      });
    });

    // Set of skipped nodes (due to conditional routing)
    const skippedNodes = new Set();

    try {
      for (let i = 0; i < executionOrder.length; i++) {
        const node = executionOrder[i];

        // Skip nodes that were excluded by conditional routing
        if (skippedNodes.has(node.id)) {
          console.log(`\n⏭️ Skipping node ${node.data.label} (${node.id}) — branch not taken`);
          results.push({ nodeId: node.id, success: true, data: null, skipped: true, timestamp: Date.now() });
          nodeOutputs.set(node.id, { success: true, data: null, skipped: true });
          continue;
        }
        
        console.log(`\n📍 Executing node ${i + 1}/${executionOrder.length}: ${node.data.label} (${node.id})`);
        
        onProgress({
          current: i + 1,
          total: executionOrder.length,
          node: node,
          status: 'executing'
        });

        // Collect input data from connected nodes (with conditional routing check)
        const inputEdges = edgeMap.get(node.id) || [];
        const inputData = {};
        let shouldSkip = false;
        
        console.log(`   📥 Input sources: ${inputEdges.length > 0 ? inputEdges.map(e => e.source).join(', ') : 'none'}`);
        
        for (const { source: sourceId, sourceHandle } of inputEdges) {
          const sourceOutput = nodeOutputs.get(sourceId);
          if (!sourceOutput || !sourceOutput.success) continue;
          if (sourceOutput.skipped) { shouldSkip = true; break; }

          const sourceData = sourceOutput.data;

          // Check if source is a conditional node (IF/ELSE or SWITCH)
          if (sourceData && sourceData.type === 'if-else' && sourceHandle) {
            // Only pass data if this edge's sourceHandle matches the branch taken
            if (sourceHandle !== sourceData.branch) {
              console.log(`   ⏭️ Skipping input from ${sourceId} — branch "${sourceData.branch}" ≠ handle "${sourceHandle}"`);
              shouldSkip = true;
              break;
            }
            // Pass the original data through (not the if-else metadata)
            Object.assign(inputData, sourceData.data || {});
          } else if (sourceData && sourceData.type === 'switch' && sourceHandle) {
            // Only pass data if this edge's sourceHandle matches the matched case
            if (sourceHandle !== sourceData.matchedCase) {
              console.log(`   ⏭️ Skipping input from ${sourceId} — case "${sourceData.matchedCase}" ≠ handle "${sourceHandle}"`);
              shouldSkip = true;
              break;
            }
            Object.assign(inputData, sourceData.data || {});
          } else {
            // Normal node — merge all data
            console.log(`   ✅ Merging data from ${sourceId}:`, sourceData);
            Object.assign(inputData, sourceData || {});
          }
        }

        // If this node should be skipped due to conditional routing
        if (shouldSkip) {
          console.log(`   ⏭️ Node skipped — conditional branch not taken`);
          skippedNodes.add(node.id);
          // Also skip all downstream nodes from this one
          const markDownstream = (nid) => {
            const downEdges = edges.filter(e => e.source === nid);
            downEdges.forEach(e => {
              if (!skippedNodes.has(e.target)) {
                skippedNodes.add(e.target);
                markDownstream(e.target);
              }
            });
          };
          markDownstream(node.id);
          results.push({ nodeId: node.id, success: true, data: null, skipped: true, timestamp: Date.now() });
          nodeOutputs.set(node.id, { success: true, data: null, skipped: true });
          continue;
        }

        console.log(`   📦 Input data for ${node.data.label}:`, inputData);

        // Execute node with input data
        const result = await this.executeNode(node, inputData);
        results.push(result);
        
        console.log(`   ${result.success ? '✅' : '❌'} Result:`, result);
        
        // Store output for downstream nodes
        nodeOutputs.set(node.id, result);

        // Add delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('\n🎉 Workflow execution completed successfully!');
      console.log('📊 Final results:', results);

      onProgress({
        current: executionOrder.length,
        total: executionOrder.length,
        status: 'completed'
      });

      return results;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Register callback for node status changes
   * @param {Function} callback - Callback function
   */
  onNodeStatusChange(callback) {
    this.executionCallbacks.set('statusChange', callback);
  }

  /**
   * Notify about node status changes
   * @param {string} nodeId - Node ID
   * @param {string} status - New status
   */
  notifyNodeStatusChange(nodeId, status) {
    const callback = this.executionCallbacks.get('statusChange');
    if (callback) {
      callback(nodeId, status);
    }
  }

  /**
   * Stop execution (if running)
   */
  stop() {
    this.isRunning = false;
  }

  /**
   * Get execution status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      registeredProcessors: Array.from(this.nodeRegistry.keys())
    };
  }
}

// Import API client for real AI processing
import { apiClient, hasValidAuth, handleApiError } from '../lib/api.js';

// Version check for debugging
const ENGINE_VERSION = '2.0.0'; // Updated with better error handling
console.log(`⚙️ ExecutionEngine v${ENGINE_VERSION} loaded`);

// Default processors for the 5 Pillars with REAL API integration
const defaultProcessors = {
  // Prompt Node - Passes data to connected nodes
  'prompt-input': async (nodeData, inputData) => {
    console.log('📝 Prompt Node Processing:', nodeData.label);
    console.log('   Node data:', nodeData);
    console.log('   Input data:', inputData);
    
    // Get prompt from multiple sources
    const promptValue = nodeData.value || nodeData.prompt || '';
    
    console.log('   📤 Outputting prompt:', promptValue);
    
    return {
      type: 'prompt',
      prompt: promptValue,
      value: promptValue, // Also include as 'value' for compatibility
      variables: nodeData.variables || [],
      timestamp: Date.now()
    };
  },

  // Also register for 'promptNode' type (React Flow node type)
  'promptNode': async (nodeData, inputData) => {
    console.log('📝 PromptNode (React Flow type) Processing:', nodeData.label);
    console.log('   Node data:', nodeData);
    
    const promptValue = nodeData.value || nodeData.prompt || '';
    console.log('   📤 Outputting prompt:', promptValue);
    
    return {
      type: 'prompt',
      prompt: promptValue,
      value: promptValue,
      variables: nodeData.variables || [],
      timestamp: Date.now()
    };
  },

  // AI Model Nodes - Call real API
  'ai-model': async (nodeData, inputData) => {
    console.log('🤖 AI Model Processing:', nodeData.label);
    
    // Check authentication
    if (!hasValidAuth()) {
      throw new Error('Vui lòng đăng nhập để sử dụng AI');
    }

    // Get prompt from input data or node data
    const prompt = inputData.prompt || nodeData.prompt || nodeData.value || '';
    
    if (!prompt) {
      throw new Error('Không có prompt để xử lý');
    }

    // Determine model based on node label
    let model = 'llama-3.1-8b-instant'; // Default
    if (nodeData.label?.includes('3.3') || nodeData.label?.includes('70B')) {
      model = 'llama-3.3-70b-versatile';
    } else if (nodeData.label?.includes('GPT-4')) {
      model = 'gpt-4o';
    }

    try {
      // Call real API
      const response = await apiClient.chatWithAI({
        prompt: prompt,
        model: model,
        temperature: nodeData.temperature || 0.7,
        maxTokens: nodeData.maxTokens || 1000
      });

      return {
        type: 'ai-response',
        response: response.data?.response || response.response,
        model: model,
        usage: response.data?.usage || response.usage,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('AI API Error:', error);
      throw new Error(handleApiError(error));
    }
  },

  research: async (nodeData, inputData) => {
    console.log('🔍 Research Node Processing:', nodeData.label);
    
    if (!hasValidAuth()) {
      throw new Error('Vui lòng đăng nhập để sử dụng Research');
    }

    const query = inputData.prompt || nodeData.query || '';
    
    try {
      // Use AI to perform research
      const response = await apiClient.chatWithAI({
        prompt: `Conduct research on: ${query}. Provide detailed findings with sources.`,
        model: 'llama-3.1-8b-instant',
        systemPrompt: 'You are a research assistant. Provide comprehensive research findings.'
      });

      return {
        type: 'research',
        findings: response.data?.response || response.response,
        query: query,
        confidence: 0.85,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  code: async (nodeData, inputData) => {
    console.log('💻 Code Node Processing:', nodeData.label);
    
    if (!hasValidAuth()) {
      throw new Error('Vui lòng đăng nhập để sử dụng Code Generator');
    }

    const prompt = inputData.prompt || inputData.response || nodeData.prompt || '';
    const language = nodeData.language || 'javascript';
    
    try {
      const response = await apiClient.chatWithAI({
        prompt: `Generate ${language} code for: ${prompt}`,
        model: 'llama-3.1-8b-instant',
        systemPrompt: `You are a code generator. Generate clean, production-ready ${language} code.`
      });

      return {
        type: 'code',
        generated: response.data?.response || response.response,
        language: language,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  marketing: async (nodeData, inputData) => {
    console.log('📈 Marketing Node Processing:', nodeData.label);
    
    if (!hasValidAuth()) {
      throw new Error('Vui lòng đăng nhập để sử dụng Marketing');
    }

    const content = inputData.response || inputData.prompt || nodeData.content || '';
    
    try {
      const response = await apiClient.chatWithAI({
        prompt: `Create a marketing strategy for: ${content}`,
        model: 'llama-3.1-8b-instant',
        systemPrompt: 'You are a marketing strategist. Create comprehensive marketing plans.'
      });

      return {
        type: 'marketing',
        strategy: response.data?.response || response.response,
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  imagine: async (nodeData, inputData) => {
    console.log('🎨 Imagine Node Processing:', nodeData.label);
    
    if (!hasValidAuth()) {
      throw new Error('Vui lòng đăng nhập để sử dụng Image Generation');
    }

    const prompt = inputData.prompt || nodeData.prompt || '';
    
    try {
      // For now, use AI to generate image descriptions
      // In future, integrate with DALL-E or Stable Diffusion
      const response = await apiClient.chatWithAI({
        prompt: `Create a detailed image generation prompt for: ${prompt}`,
        model: 'llama-3.1-8b-instant',
        systemPrompt: 'You are an image prompt engineer. Create detailed prompts for image generation.'
      });

      return {
        type: 'imagine',
        imagePrompt: response.data?.response || response.response,
        style: nodeData.style || 'photorealistic',
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  video: async (nodeData, inputData) => {
    console.log('🎬 Video Node Processing:', nodeData.label);
    
    if (!hasValidAuth()) {
      throw new Error('Vui lòng đăng nhập để sử dụng Video Generation');
    }

    const content = inputData.response || inputData.imagePrompt || inputData.prompt || '';
    
    try {
      const response = await apiClient.chatWithAI({
        prompt: `Create a video script and storyboard for: ${content}`,
        model: 'llama-3.1-8b-instant',
        systemPrompt: 'You are a video production expert. Create detailed video scripts and storyboards.'
      });

      return {
        type: 'video',
        script: response.data?.response || response.response,
        duration: nodeData.duration || '5s',
        quality: nodeData.quality || '4K',
        timestamp: Date.now()
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // Image Generator nodes
  'image-generator': async (nodeData, inputData) => {
    return defaultProcessors.imagine(nodeData, inputData);
  },

  // Code Generator nodes
  'code-generator': async (nodeData, inputData) => {
    return defaultProcessors.code(nodeData, inputData);
  },

  // Video Editor nodes
  'video-editor': async (nodeData, inputData) => {
    return defaultProcessors.video(nodeData, inputData);
  },

  // Content Writer nodes
  'content-writer': async (nodeData, inputData) => {
    return defaultProcessors.marketing(nodeData, inputData);
  },

  // ─── Read Email Node ───────────────────────────────────────────────────────
  'readEmailNode': async (nodeData, inputData) => {
    console.log('📬 ReadEmail Node Processing:', nodeData.label);

    const API = API_BASE_URL;

    // ── 1. Detect provider from connected EmailAccountNode credentials ──
    const getCredentials = () => {
      if (nodeData.getNodes && nodeData.getEdges) {
        const allNodes = nodeData.getNodes();
        const allEdges = nodeData.getEdges();
        const incomingEdges = allEdges.filter(e => e.target === nodeData.id);

        for (const edge of incomingEdges) {
          const sourceNode = allNodes.find(n => n.id === edge.source);
          if (!sourceNode) continue;
          const nd = sourceNode.data;
          const val = nd.value || {};

          // OAuth / Gmail
          if (val.mode === 'oauth' || nd.mode === 'oauth') {
            const gmailToken = localStorage.getItem('gmail_access_token');
            if (gmailToken) {
              return {
                provider: 'gmail',
                credentials: {
                  type: 'oauth2',
                  accessToken: gmailToken,
                  refreshToken: localStorage.getItem('gmail_refresh_token') || undefined,
                  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
                  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
                },
              };
            }
          }

          // SMTP / IMAP (password-based)
          const email    = (val.email    || nd.email    || '').trim();
          const password = (val.password || nd.password || '').trim();
          if (email && password) {
            return {
              provider: 'imap',
              credentials: {
                type: 'password',
                username: email,
                password,
                host: val.host || nd.host || 'imap.gmail.com',
                port: val.port || nd.port || 993,
              },
            };
          }
        }
      }

      // Fallback: read directly from nodeData (manual config)
      const gmailToken = localStorage.getItem('gmail_access_token');
      if (gmailToken) {
        return {
          provider: 'gmail',
          credentials: {
            type: 'oauth2',
            accessToken: gmailToken,
            refreshToken: localStorage.getItem('gmail_refresh_token') || undefined,
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
            clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
          },
        };
      }

      return null;
    };

    // ── 2. Build config with { provider, credentials } format ──
    const credInfo = getCredentials();
    if (!credInfo) {
      throw new Error('ReadEmail: No email credentials found. Connect an Email Account node.');
    }

    const config = {
      provider: credInfo.provider,
      credentials: credInfo.credentials,
    };

    // ── 3. Options: folder, limit, unreadOnly ──
    const options = {
      folder:     nodeData.folder     || 'INBOX',
      limit:      nodeData.limit      || 10,
      unreadOnly: nodeData.unreadOnly ?? false,
    };

    const token = localStorage.getItem('office_weave_token') || localStorage.getItem('auth_token');

    const requestBody = {
      provider: credInfo.provider,
      config,
      options,
    };

    console.log('📤 ReadEmail request:', { provider: credInfo.provider, options });

    const response = await fetch(`${API_BASE_URL}/api/email/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    console.log('📬 ReadEmail response:', response.status, result);

    if (!response.ok) {
      throw new Error(result.error || result.message || `ReadEmail failed: ${response.status}`);
    }

    const emails = result.data?.emails || result.emails || [];

    return {
      type: 'read-email',
      emails,
      count: emails.length,
      folder: options.folder,
      timestamp: Date.now(),
    };
  },

  // ─── Send Email Node ───────────────────────────────────────────────────────
  'sendEmailNode': async (nodeData, inputData) => {
    console.log('📧 SendEmail Node Processing:', nodeData.label);

    const API = API_BASE_URL;

    // ── 1. Detect provider + build credentials from connected EmailAccountNode ──
    const getCredentials = () => {
      if (nodeData.getNodes && nodeData.getEdges) {
        const allNodes = nodeData.getNodes();
        const allEdges = nodeData.getEdges();
        const incomingEdges = allEdges.filter(e => e.target === nodeData.id);

        for (const edge of incomingEdges) {
          const sourceNode = allNodes.find(n => n.id === edge.source);
          if (!sourceNode) continue;
          const nd = sourceNode.data;
          const val = nd.value || {};

          // OAuth / Gmail
          if (val.mode === 'oauth' || nd.mode === 'oauth') {
            const gmailToken = localStorage.getItem('gmail_access_token');
            if (gmailToken) {
              return {
                provider: 'gmail',
                credentials: {
                  type: 'oauth2',
                  accessToken: gmailToken,
                  refreshToken: localStorage.getItem('gmail_refresh_token') || undefined,
                  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
                  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
                },
              };
            }
          }

          // SMTP (password-based)
          const email    = (val.email    || nd.email    || '').trim();
          const password = (val.password || nd.password || '').trim();
          if (email && password) {
            const host = val.host || nd.host || 'smtp.gmail.com';
            const port = val.port || nd.port || 587;
            return {
              provider: 'smtp',
              credentials: {
                type: 'password',
                username: email,
                password,
                host,
                port,
                secure: port === 465,
              },
            };
          }
        }
      }

      // Fallback: OAuth from localStorage
      const gmailToken = localStorage.getItem('gmail_access_token');
      if (gmailToken) {
        return {
          provider: 'gmail',
          credentials: {
            type: 'oauth2',
            accessToken: gmailToken,
            refreshToken: localStorage.getItem('gmail_refresh_token') || undefined,
            clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
            clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
          },
        };
      }

      return null;
    };

    // ── 2. Build config with { provider, credentials } format ──
    const credInfo = getCredentials();
    if (!credInfo) {
      throw new Error('SendEmail: No email credentials found. Connect an Email Account node.');
    }

    const config = {
      provider: credInfo.provider,
      credentials: credInfo.credentials,
    };

    // ── 3. Build email.to with [{ address }] format ──
    const rawTo = nodeData.to || inputData.to || '';
    if (!rawTo) {
      throw new Error('SendEmail: Recipient (to) is required.');
    }

    const toAddresses = String(rawTo)
      .split(',')
      .map(e => ({ address: e.trim() }))
      .filter(e => e.address);

    // ── 4. Build email.body with { body: { text, html } } format ──
    const rawBody = nodeData.body || inputData.body || '';
    const isHtml  = nodeData.isHtmlMode || false;

    const emailBody = isHtml
      ? {
          html: rawBody,
          text: rawBody.replace(/<[^>]*>/g, ''),
        }
      : {
          text: rawBody,
          html: `<p>${String(rawBody).replace(/\n/g, '<br>')}</p>`,
        };

    const emailPayload = {
      to: toAddresses,
      subject: nodeData.subject || inputData.subject || '(No Subject)',
      body: emailBody,
    };

    // Optional CC / BCC
    if (nodeData.cc) {
      emailPayload.cc = String(nodeData.cc)
        .split(',')
        .map(e => ({ address: e.trim() }))
        .filter(e => e.address);
    }
    if (nodeData.bcc) {
      emailPayload.bcc = String(nodeData.bcc)
        .split(',')
        .map(e => ({ address: e.trim() }))
        .filter(e => e.address);
    }

    const token = localStorage.getItem('office_weave_token') || localStorage.getItem('auth_token');

    const requestBody = {
      provider: credInfo.provider,
      config,
      email: emailPayload,
    };

    console.log('📤 SendEmail request:', {
      provider: credInfo.provider,
      to: emailPayload.to,
      subject: emailPayload.subject,
    });

    const response = await fetch(`${API}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    console.log('📬 SendEmail response:', response.status, result);

    if (!response.ok && !(result.success || result.data?.success)) {
      throw new Error(result.error || result.message || `SendEmail failed: ${response.status}`);
    }

    return {
      type: 'send-email',
      success: true,
      messageId: result.messageId || result.data?.messageId,
      to: emailPayload.to.map(t => t.address).join(', '),
      subject: emailPayload.subject,
      timestamp: Date.now(),
    };
  },

  // ─── Logic Nodes ───────────────────────────────────────────────────────────

  // IF/ELSE Node — evaluates condition, routes to true/false
  'ifElseNode': async (nodeData, inputData) => {
    console.log('🔀 IfElse Node Processing:', nodeData.label);
    console.log('   Condition:', nodeData.condition);
    console.log('   Input data:', inputData);

    const condition = nodeData.condition || '';
    let result = false;

    if (condition) {
      try {
        // Create a safe evaluation context with input data available
        const evalFn = new Function('data', 'input', `
          try { return !!(${condition}); }
          catch(e) { return false; }
        `);
        result = evalFn(inputData, inputData);
      } catch (err) {
        console.warn('⚠️ IfElse condition eval error:', err.message);
        result = false;
      }
    }

    console.log(`   Result: ${result ? '✅ TRUE' : '❌ FALSE'}`);

    return {
      type: 'if-else',
      condition,
      result,
      branch: result ? 'true' : 'false',
      data: inputData,
      timestamp: Date.now(),
    };
  },

  'if-else': async (nodeData, inputData) => {
    return defaultProcessors['ifElseNode'](nodeData, inputData);
  },

  // SWITCH Node — routes to matching case port
  'switchNode': async (nodeData, inputData) => {
    console.log('🔀 Switch Node Processing:', nodeData.label);
    console.log('   Switch key:', nodeData.switchKey);
    console.log('   Cases:', nodeData.cases);
    console.log('   Input data:', inputData);

    const switchKey = nodeData.switchKey || '';
    let switchValue = '';

    if (switchKey) {
      try {
        const evalFn = new Function('data', 'input', `
          try { return ${switchKey}; }
          catch(e) { return ''; }
        `);
        switchValue = String(evalFn(inputData, inputData) || '');
      } catch (err) {
        console.warn('⚠️ Switch key eval error:', err.message);
      }
    }

    const cases = nodeData.cases || [];
    const matchedCase = cases.find(c => c === switchValue) || 'default';

    console.log(`   Switch value: "${switchValue}" → matched: "${matchedCase}"`);

    return {
      type: 'switch',
      switchKey,
      switchValue,
      matchedCase,
      cases,
      data: inputData,
      timestamp: Date.now(),
    };
  },

  'switch': async (nodeData, inputData) => {
    return defaultProcessors['switchNode'](nodeData, inputData);
  },

  // LOOP Node — iterates over array, collects results
  'loopNode': async (nodeData, inputData) => {
    console.log('🔁 Loop Node Processing:', nodeData.label);
    console.log('   Iterator key:', nodeData.iteratorKey);
    console.log('   Item var:', nodeData.itemVar);
    console.log('   Input data:', inputData);

    const iteratorKey = nodeData.iteratorKey || '';
    let items = [];

    if (iteratorKey) {
      try {
        const evalFn = new Function('data', 'input', `
          try { return ${iteratorKey}; }
          catch(e) { return []; }
        `);
        const result = evalFn(inputData, inputData);
        items = Array.isArray(result) ? result : [];
      } catch (err) {
        console.warn('⚠️ Loop iterator eval error:', err.message);
      }
    } else if (Array.isArray(inputData.emails)) {
      items = inputData.emails;
    } else if (Array.isArray(inputData.items)) {
      items = inputData.items;
    } else if (Array.isArray(inputData.data)) {
      items = inputData.data;
    }

    console.log(`   Found ${items.length} items to iterate`);

    // For client-side, we just pass through the array
    // Server-side engine handles actual iteration with sub-graph execution
    return {
      type: 'loop',
      items,
      count: items.length,
      itemVar: nodeData.itemVar || 'item',
      timestamp: Date.now(),
    };
  },

  'loop': async (nodeData, inputData) => {
    return defaultProcessors['loopNode'](nodeData, inputData);
  },

  // DELAY Node — waits then passes data through unchanged
  'delayNode': async (nodeData, inputData) => {
    console.log('⏱️ Delay Node Processing:', nodeData.label);

    const amount = nodeData.delayAmount ?? 1000;
    const unit = nodeData.unit || 'ms';

    let delayMs = amount;
    if (unit === 's') delayMs = amount * 1000;
    else if (unit === 'min') delayMs = amount * 60000;

    // Cap client-side delay at 30 seconds to avoid blocking
    const actualDelay = Math.min(delayMs, 30000);

    console.log(`   Waiting ${actualDelay}ms (configured: ${amount}${unit})...`);
    await new Promise(resolve => setTimeout(resolve, actualDelay));
    console.log('   ✅ Delay complete, passing data through');

    return {
      type: 'delay',
      delayMs,
      actualDelay,
      ...inputData,
      timestamp: Date.now(),
    };
  },

  'delay': async (nodeData, inputData) => {
    return defaultProcessors['delayNode'](nodeData, inputData);
  },

  // MERGE Node — combines multiple inputs into one output
  'mergeNode': async (nodeData, inputData) => {
    console.log('🔗 Merge Node Processing:', nodeData.label);
    console.log('   Strategy:', nodeData.mergeStrategy);
    console.log('   Input data:', inputData);

    const strategy = nodeData.mergeStrategy || 'array';

    // inputData already contains merged data from all connected sources
    // (Engine.js merges via Object.assign in executeGraph)
    let merged;

    switch (strategy) {
      case 'array':
        // Wrap all input values into an array
        merged = Object.values(inputData).filter(v => v !== undefined);
        break;
      case 'object':
        // Keep as merged object (already done by engine)
        merged = { ...inputData };
        break;
      case 'concat':
        // Concatenate string/array values
        const values = Object.values(inputData).filter(v => v !== undefined);
        if (values.every(v => typeof v === 'string')) {
          merged = values.join('\n');
        } else if (values.every(v => Array.isArray(v))) {
          merged = values.flat();
        } else {
          merged = values;
        }
        break;
      default:
        merged = inputData;
    }

    console.log('   ✅ Merged result:', merged);

    return {
      type: 'merge',
      strategy,
      merged,
      data: merged,
      timestamp: Date.now(),
    };
  },

  'merge': async (nodeData, inputData) => {
    return defaultProcessors['mergeNode'](nodeData, inputData);
  },
};

// Create and configure the global engine instance
const engine = new ExecutionEngine();

// Register default processors
Object.entries(defaultProcessors).forEach(([type, processor]) => {
  engine.registerNodeProcessor(type, processor);
});

console.log('✅ Engine initialized with default processors');

export default engine;
export { ExecutionEngine, defaultProcessors };