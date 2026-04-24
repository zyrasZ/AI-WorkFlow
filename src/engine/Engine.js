/**
 * Sequential Execution Engine
 * Inspired by LiteGraph.js - handles graph traversal and node execution
 */

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

    // Build edge map for quick lookup
    const edgeMap = new Map();
    edges.forEach(edge => {
      if (!edgeMap.has(edge.target)) {
        edgeMap.set(edge.target, []);
      }
      edgeMap.get(edge.target).push(edge.source);
    });

    try {
      for (let i = 0; i < executionOrder.length; i++) {
        const node = executionOrder[i];
        
        console.log(`\n📍 Executing node ${i + 1}/${executionOrder.length}: ${node.data.label} (${node.id})`);
        
        onProgress({
          current: i + 1,
          total: executionOrder.length,
          node: node,
          status: 'executing'
        });

        // Collect input data from connected nodes
        const inputSources = edgeMap.get(node.id) || [];
        const inputData = {};
        
        console.log(`   📥 Input sources: ${inputSources.length > 0 ? inputSources.join(', ') : 'none'}`);
        
        inputSources.forEach(sourceId => {
          const sourceOutput = nodeOutputs.get(sourceId);
          if (sourceOutput && sourceOutput.success) {
            console.log(`   ✅ Merging data from ${sourceId}:`, sourceOutput.data);
            // Merge data from source nodes
            Object.assign(inputData, sourceOutput.data);
          }
        });

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
  }
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