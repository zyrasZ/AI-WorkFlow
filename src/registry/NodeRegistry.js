/**
 * Node Registry - Modular node system inspired by Rete.js
 * Each node type is a separate component that can be registered
 */

import engine, { defaultProcessors } from '../engine/Engine.js';

class NodeRegistry {
  constructor() {
    this.nodeTypes = new Map();
    this.nodeTemplates = new Map();
    this.pillarCategories = new Map();
  }

  /**
   * Register a new node type
   * @param {string} type - Node type identifier
   * @param {Object} config - Node configuration
   */
  registerNodeType(type, config) {
    const {
      pillar,
      label,
      subtitle,
      color,
      defaultFields = [],
      processor,
      hasInput = true,
      hasOutput = true,
      icon
    } = config;

    // Validate pillar
    const validPillars = ['research', 'code', 'marketing', 'imagine', 'video'];
    if (!validPillars.includes(pillar)) {
      throw new Error(`Invalid pillar: ${pillar}. Must be one of: ${validPillars.join(', ')}`);
    }

    // Register the node type
    this.nodeTypes.set(type, {
      type,
      pillar,
      label,
      subtitle,
      color,
      defaultFields,
      processor,
      hasInput,
      hasOutput,
      icon
    });

    // Register processor with execution engine
    if (processor) {
      engine.registerNodeProcessor(type, processor);
    }

    // Add to pillar category
    if (!this.pillarCategories.has(pillar)) {
      this.pillarCategories.set(pillar, []);
    }
    this.pillarCategories.get(pillar).push(type);

    console.log(`✅ Registered node type: ${type} (${pillar} pillar)`);
  }

  /**
   * Create a node instance from registered type
   * @param {string} type - Node type
   * @param {Object} overrides - Override default properties
   * @returns {Object} - Node data object
   */
  createNode(type, overrides = {}) {
    const nodeConfig = this.nodeTypes.get(type);
    if (!nodeConfig) {
      throw new Error(`Node type not registered: ${type}`);
    }

    return {
      label: nodeConfig.label,
      subtitle: nodeConfig.subtitle,
      pillar: nodeConfig.pillar,
      nodeType: type,
      color: nodeConfig.color,
      status: 'idle',
      fields: [...nodeConfig.defaultFields],
      hasInput: nodeConfig.hasInput,
      hasOutput: nodeConfig.hasOutput,
      processor: nodeConfig.processor,
      ...overrides
    };
  }

  /**
   * Get all registered node types
   * @returns {Array} - Array of node type configurations
   */
  getAllNodeTypes() {
    return Array.from(this.nodeTypes.values());
  }

  /**
   * Get node types by pillar
   * @param {string} pillar - Pillar name
   * @returns {Array} - Array of node types for the pillar
   */
  getNodeTypesByPillar(pillar) {
    const types = this.pillarCategories.get(pillar) || [];
    return types.map(type => this.nodeTypes.get(type));
  }

  /**
   * Get all pillars with their node types
   * @returns {Object} - Object with pillar names as keys
   */
  getPillarCategories() {
    const categories = {};
    this.pillarCategories.forEach((types, pillar) => {
      categories[pillar] = types.map(type => this.nodeTypes.get(type));
    });
    return categories;
  }

  /**
   * Check if node type exists
   * @param {string} type - Node type
   * @returns {boolean}
   */
  hasNodeType(type) {
    return this.nodeTypes.has(type);
  }

  /**
   * Unregister a node type
   * @param {string} type - Node type to remove
   */
  unregisterNodeType(type) {
    const nodeConfig = this.nodeTypes.get(type);
    if (nodeConfig) {
      // Remove from pillar category
      const pillarTypes = this.pillarCategories.get(nodeConfig.pillar);
      if (pillarTypes) {
        const index = pillarTypes.indexOf(type);
        if (index > -1) {
          pillarTypes.splice(index, 1);
        }
      }

      // Remove from registry
      this.nodeTypes.delete(type);
      console.log(`❌ Unregistered node type: ${type}`);
    }
  }
}

// Create global registry instance
const nodeRegistry = new NodeRegistry();

// Version check for debugging cache issues
const REGISTRY_VERSION = '2.0.0'; // Updated to fix "Prompt is required" error
console.log(`📦 NodeRegistry v${REGISTRY_VERSION} loaded`);

// Register default node types for the 5 Pillars
const defaultNodeTypes = [
  // Research Pillar
  {
    type: 'web-scraper',
    pillar: 'research',
    label: 'Web Scraper',
    subtitle: 'Extract data from websites',
    color: '#3b82f6',
    defaultFields: [
      { label: 'URL', type: 'text', value: '', placeholder: 'https://example.com' },
      { label: 'Selectors', type: 'textarea', value: '', placeholder: 'CSS selectors...' }
    ],
    processor: async (data) => {
      console.log('🔍 Web Scraper processing:', data.label);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { type: 'research', data: 'Scraped content', urls: [data.fields?.[0]?.value] };
    }
  },
  {
    type: 'pdf-analyzer',
    pillar: 'research',
    label: 'PDF Analyzer',
    subtitle: 'Extract text and data from PDFs',
    color: '#3b82f6',
    defaultFields: [
      { label: 'File Path', type: 'text', value: '', placeholder: '/path/to/document.pdf' },
      { label: 'Extract Mode', type: 'select', value: 'text', options: ['text', 'tables', 'images'] }
    ],
    processor: async (data) => {
      console.log('📄 PDF Analyzer processing:', data.label);
      await new Promise(resolve => setTimeout(resolve, 1200));
      return { type: 'research', extractedText: 'PDF content...', pages: 10 };
    }
  },

  // Code Pillar
  {
    type: 'code-generator',
    pillar: 'code',
    label: 'Code Generator',
    subtitle: 'Generate code from specifications',
    color: '#10b981',
    defaultFields: [
      { label: 'Language', type: 'select', value: 'javascript', options: ['javascript', 'python', 'java', 'go'] },
      { label: 'Specification', type: 'textarea', value: '', placeholder: 'Describe what to generate...' }
    ],
    processor: async (data) => {
      console.log('💻 Code Generator processing:', data.label);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { type: 'code', language: data.fields?.[0]?.value, code: '// Generated code here' };
    }
  },
  {
    type: 'groq-llama-3.3-70b',
    pillar: 'code',
    label: 'Groq Llama 3.3 70B',
    subtitle: 'Fast inference with Llama 3.3',
    color: '#10b981',
    defaultFields: [
      { label: 'Temperature', type: 'select', value: '0.7', options: ['0.1', '0.3', '0.5', '0.7', '0.9', '1.0'] },
      { label: 'Max Tokens', type: 'text', value: '1000', placeholder: '1000' }
    ],
    processor: async (data, inputs) => {
      console.log('🚀 Groq Llama 3.3 70B processing:', data.label);
      
      // Import API client dynamically
      const { apiClient } = await import('../lib/api.js');
      
      // Chỉ lấy prompt từ inputs (từ PromptNode truyền qua)
      const prompt = (inputs?.prompt || inputs?.value || '').trim();
      const temperature = parseFloat(data.fields?.[0]?.value || data.temperature || '0.7');
      const maxTokens = parseInt(data.fields?.[1]?.value || data.maxTokens || '1000');
      
      if (!prompt) {
        console.warn('No prompt provided, skipping node execution');
        return { 
          type: 'text', 
          model: 'llama-3.3-70b-versatile',
          response: 'Chưa có prompt. Hãy kết nối với Prompt Node.',
          skipped: true
        };
      }
      
      try {
        const response = await apiClient.chatWithAI({
          provider: 'groq',
          model: 'llama-3.3-70b-versatile',
          prompt: prompt,
          temperature: temperature,
          maxTokens: maxTokens
        });
        
        return { 
          type: 'text', 
          model: 'llama-3.3-70b-versatile',
          response: response.data?.response || response.response,
          usage: response.data?.usage || response.usage
        };
      } catch (error) {
        console.error('Groq API error:', error);
        throw new Error(`Groq API failed: ${error.message}`);
      }
    }
  },
  {
    type: 'groq-llama-3.1-8b',
    pillar: 'code',
    label: 'Groq Llama 3.1 8B',
    subtitle: 'Lightweight & fast Llama model',
    color: '#10b981',
    defaultFields: [
      { label: 'Temperature', type: 'select', value: '0.7', options: ['0.1', '0.3', '0.5', '0.7', '0.9', '1.0'] },
      { label: 'Max Tokens', type: 'text', value: '1000', placeholder: '1000' }
    ],
    processor: async (data, inputs) => {
      console.log('🚀 Groq Llama 3.1 8B processing:', data.label);
      
      const { apiClient } = await import('../lib/api.js');
      
      const prompt = (inputs?.prompt || inputs?.value || '').trim();
      const temperature = parseFloat(data.fields?.[0]?.value || data.temperature || '0.7');
      const maxTokens = parseInt(data.fields?.[1]?.value || data.maxTokens || '1000');
      
      if (!prompt) {
        console.warn('No prompt provided, skipping node execution');
        return { 
          type: 'text', 
          model: 'llama-3.1-8b-instant',
          response: 'Chưa có prompt. Hãy kết nối với Prompt Node.',
          skipped: true
        };
      }
      
      try {
        const response = await apiClient.chatWithAI({
          provider: 'groq',
          model: 'llama-3.1-8b-instant',
          prompt: prompt,
          temperature: temperature,
          maxTokens: maxTokens
        });
        
        return { 
          type: 'text', 
          model: 'llama-3.1-8b-instant',
          response: response.data?.response || response.response,
          usage: response.data?.usage || response.usage
        };
      } catch (error) {
        console.error('Groq API error:', error);
        throw new Error(`Groq API failed: ${error.message}`);
      }
    }
  },
  {
    type: 'groq-mixtral-8x7b',
    pillar: 'code',
    label: 'Groq Mixtral 8x7B',
    subtitle: 'Mixture of Experts model',
    color: '#10b981',
    defaultFields: [
      { label: 'Temperature', type: 'select', value: '0.7', options: ['0.1', '0.3', '0.5', '0.7', '0.9', '1.0'] },
      { label: 'Max Tokens', type: 'text', value: '1000', placeholder: '1000' }
    ],
    processor: async (data, inputs) => {
      console.log('🚀 Groq Mixtral 8x7B processing:', data.label);
      
      const { apiClient } = await import('../lib/api.js');
      
      const prompt = (inputs?.prompt || inputs?.value || '').trim();
      const temperature = parseFloat(data.fields?.[0]?.value || data.temperature || '0.7');
      const maxTokens = parseInt(data.fields?.[1]?.value || data.maxTokens || '1000');
      
      if (!prompt) {
        console.warn('No prompt provided, skipping node execution');
        return { 
          type: 'text', 
          model: 'mixtral-8x7b-32768',
          response: 'Chưa có prompt. Hãy kết nối với Prompt Node.',
          skipped: true
        };
      }
      
      try {
        const response = await apiClient.chatWithAI({
          provider: 'groq',
          model: 'mixtral-8x7b-32768',
          prompt: prompt,
          temperature: temperature,
          maxTokens: maxTokens
        });
        
        return { 
          type: 'text', 
          model: 'mixtral-8x7b-32768',
          response: response.data?.response || response.response,
          usage: response.data?.usage || response.usage
        };
      } catch (error) {
        console.error('Groq API error:', error);
        throw new Error(`Groq API failed: ${error.message}`);
      }
    }
  },
  {
    type: 'groq-gemma-2-9b',
    pillar: 'code',
    label: 'Groq Gemma 2 9B',
    subtitle: 'Google Gemma on Groq',
    color: '#10b981',
    defaultFields: [
      { label: 'Temperature', type: 'select', value: '0.7', options: ['0.1', '0.3', '0.5', '0.7', '0.9', '1.0'] },
      { label: 'Max Tokens', type: 'text', value: '1000', placeholder: '1000' }
    ],
    processor: async (data, inputs) => {
      console.log('🚀 Groq Gemma 2 9B processing:', data.label);
      
      const { apiClient } = await import('../lib/api.js');
      
      const prompt = (inputs?.prompt || inputs?.value || '').trim();
      const temperature = parseFloat(data.fields?.[0]?.value || data.temperature || '0.7');
      const maxTokens = parseInt(data.fields?.[1]?.value || data.maxTokens || '1000');
      
      if (!prompt) {
        console.warn('No prompt provided, skipping node execution');
        return { 
          type: 'text', 
          model: 'gemma2-9b-it',
          response: 'Chưa có prompt. Hãy kết nối với Prompt Node.',
          skipped: true
        };
      }
      
      try {
        const response = await apiClient.chatWithAI({
          provider: 'groq',
          model: 'gemma2-9b-it',
          prompt: prompt,
          temperature: temperature,
          maxTokens: maxTokens
        });
        
        return { 
          type: 'text', 
          model: 'gemma2-9b-it',
          response: response.data?.response || response.response,
          usage: response.data?.usage || response.usage
        };
      } catch (error) {
        console.error('Groq API error:', error);
        throw new Error(`Groq API failed: ${error.message}`);
      }
    }
  },
  {
    type: 'api-client',
    pillar: 'code',
    label: 'API Client',
    subtitle: 'Make HTTP requests',
    color: '#10b981',
    defaultFields: [
      { label: 'Endpoint', type: 'text', value: '', placeholder: 'https://api.example.com/data' },
      { label: 'Method', type: 'select', value: 'GET', options: ['GET', 'POST', 'PUT', 'DELETE'] },
      { label: 'Headers', type: 'textarea', value: '', placeholder: 'JSON headers...' }
    ],
    processor: async (data) => {
      console.log('🌐 API Client processing:', data.label);
      await new Promise(resolve => setTimeout(resolve, 800));
      return { type: 'code', response: { status: 200, data: 'API response' } };
    }
  },

  // Marketing Pillar
  {
    type: 'content-writer',
    pillar: 'marketing',
    label: 'Content Writer',
    subtitle: 'Generate marketing content',
    color: '#f59e0b',
    defaultFields: [
      { label: 'Content Type', type: 'select', value: 'blog', options: ['blog', 'social', 'email', 'ad-copy'] },
      { label: 'Topic', type: 'text', value: '', placeholder: 'Content topic...' },
      { label: 'Tone', type: 'select', value: 'professional', options: ['professional', 'casual', 'friendly', 'urgent'] }
    ],
    processor: async (data) => {
      console.log('✍️ Content Writer processing:', data.label);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { type: 'marketing', content: 'Generated marketing content...', wordCount: 500 };
    }
  },
  {
    type: 'seo-optimizer',
    pillar: 'marketing',
    label: 'SEO Optimizer',
    subtitle: 'Optimize content for search engines',
    color: '#f59e0b',
    defaultFields: [
      { label: 'Target Keywords', type: 'textarea', value: '', placeholder: 'keyword1, keyword2...' },
      { label: 'Content', type: 'textarea', value: '', placeholder: 'Content to optimize...' }
    ],
    processor: async (data) => {
      console.log('🔍 SEO Optimizer processing:', data.label);
      await new Promise(resolve => setTimeout(resolve, 900));
      return { type: 'marketing', optimizedContent: 'SEO optimized content...', score: 85 };
    }
  },

  // Imagine Pillar
  {
    type: 'image-generator',
    pillar: 'imagine',
    label: 'Image Generator',
    subtitle: 'Create images from text prompts',
    color: '#8b5cf6',
    defaultFields: [
      { label: 'Prompt', type: 'textarea', value: '', placeholder: 'Describe the image...' },
      { label: 'Style', type: 'select', value: 'realistic', options: ['realistic', 'artistic', 'cartoon', 'abstract'] },
      { label: 'Size', type: 'select', value: '1024x1024', options: ['512x512', '1024x1024', '1920x1080'] }
    ],
    processor: async (data) => {
      console.log('🎨 Image Generator processing:', data.label);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { type: 'imagine', imageUrl: 'generated_image.png', prompt: data.fields?.[0]?.value };
    }
  },
  {
    type: 'design-system',
    pillar: 'imagine',
    label: 'Design System',
    subtitle: 'Generate UI components and styles',
    color: '#8b5cf6',
    defaultFields: [
      { label: 'Component Type', type: 'select', value: 'button', options: ['button', 'card', 'form', 'navigation'] },
      { label: 'Theme', type: 'select', value: 'modern', options: ['modern', 'classic', 'minimal', 'bold'] }
    ],
    processor: async (data) => {
      console.log('🎨 Design System processing:', data.label);
      await new Promise(resolve => setTimeout(resolve, 1300));
      return { type: 'imagine', components: ['Button.jsx', 'styles.css'], theme: data.fields?.[1]?.value };
    }
  },

  // Video Pillar
  {
    type: 'video-editor',
    pillar: 'video',
    label: 'Video Editor',
    subtitle: 'Edit and process video files',
    color: '#ef4444',
    defaultFields: [
      { label: 'Input Video', type: 'text', value: '', placeholder: 'path/to/video.mp4' },
      { label: 'Operation', type: 'select', value: 'trim', options: ['trim', 'merge', 'resize', 'filter'] },
      { label: 'Parameters', type: 'textarea', value: '', placeholder: 'Operation parameters...' }
    ],
    processor: async (data) => {
      console.log('🎬 Video Editor processing:', data.label);
      await new Promise(resolve => setTimeout(resolve, 2500));
      return { type: 'video', outputFile: 'edited_video.mp4', duration: 120 };
    }
  },
  {
    type: 'subtitle-generator',
    pillar: 'video',
    label: 'Subtitle Generator',
    subtitle: 'Generate subtitles from audio',
    color: '#ef4444',
    defaultFields: [
      { label: 'Video/Audio File', type: 'text', value: '', placeholder: 'path/to/media.mp4' },
      { label: 'Language', type: 'select', value: 'en', options: ['en', 'es', 'fr', 'de', 'zh'] }
    ],
    processor: async (data) => {
      console.log('📝 Subtitle Generator processing:', data.label);
      await new Promise(resolve => setTimeout(resolve, 1800));
      return { type: 'video', subtitles: 'subtitles.srt', language: data.fields?.[1]?.value };
    }
  },

  // Prompt Node - Special input node
  {
    type: 'prompt-input',
    pillar: 'research',
    label: 'Prompt',
    subtitle: 'AI prompt input with variables',
    color: '#8b5cf6',
    hasInput: false,
    hasOutput: true,
    defaultFields: [
      { label: 'Prompt Text', type: 'textarea', value: '', placeholder: 'Enter your AI prompt here...' },
      { label: 'Variables', type: 'text', value: '', placeholder: 'Comma-separated variables' }
    ],
    processor: async (data) => {
      console.log('💬 Prompt processing:', data.label);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { type: 'text', prompt: data.prompt || data.fields?.[0]?.value, variables: data.variables };
    }
  }
];

// Register all default node types
defaultNodeTypes.forEach(nodeType => {
  nodeRegistry.registerNodeType(nodeType.type, nodeType);
});

// Also register processors for React Flow node types
engine.registerNodeProcessor('promptNode', defaultProcessors['prompt-input']);
engine.registerNodeProcessor('outputNode', async (data, inputs) => {
  const responseText =
    inputs?.response ||
    inputs?.findings ||
    inputs?.generated ||
    inputs?.strategy ||
    inputs?.imagePrompt ||
    inputs?.script ||
    inputs?.prompt ||
    '';
  return { type: 'output', response: responseText, ...inputs };
});
engine.registerNodeProcessor('ghostNode', async (data, inputs) => {
  // GhostNode uses nodeType or pillar to determine processor
  const processor = defaultProcessors[data.nodeType] || defaultProcessors[data.pillar];
  if (processor) {
    return processor(data, inputs);
  }
  throw new Error(`No processor for ghostNode with nodeType: ${data.nodeType}, pillar: ${data.pillar}`);
});

// Email node processors
engine.registerNodeProcessor('emailAccountNode', async (data) => {
  return {
    type: 'email-credentials',
    email:    data.email,
    password: data.password,
    provider: data.provider || 'gmail',
    host:     data.value?.host || 'smtp.gmail.com',
    port:     data.value?.port || 587,
  };
});

engine.registerNodeProcessor('readEmailNode', async (data, inputs) => {
  const token = localStorage.getItem('office_weave_token') || localStorage.getItem('auth_token');
  const creds = inputs?.email ? inputs : null;
  if (!creds?.email || !creds?.password) {
    return { type: 'email-list', emails: [], count: 0, error: 'No credentials' };
  }
  const response = await fetch('https://back-end-auto-office-f8xt.vercel.app/api/email/read', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      provider: creds.provider === 'gmail' ? 'imap' : (creds.provider || 'imap'),
      config: {
        provider: creds.provider === 'gmail' ? 'imap' : (creds.provider || 'imap'),
        host:   creds.host || 'imap.gmail.com',
        port:   creds.port || 993,
        secure: (creds.port || 993) === 993,
        auth:   { user: creds.email, pass: creds.password },
      },
      options: {
        folder:     data.folder     || 'INBOX',
        limit:      data.limit      || 10,
        unreadOnly: data.unreadOnly || false,
      },
    }),
  });
  const result = await response.json();
  return { type: 'email-list', emails: result.emails || [], count: result.count || 0 };
});

engine.registerNodeProcessor('filterEmailNode', async (data, inputs) => {
  const emails = inputs?.emails || [];
  if (!emails.length) return { type: 'filter-result', matched: [], unmatched: [], matchedCount: 0, unmatchedCount: 0 };
  const token = localStorage.getItem('office_weave_token') || localStorage.getItem('auth_token');
  const response = await fetch('https://back-end-auto-office-f8xt.vercel.app/api/email/filter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      emails,
      config: { logic: data.logic || 'AND', rules: data.rules || [] },
    }),
  });
  const result = await response.json();
  return {
    type: 'filter-result',
    matched:        result.matched        || [],
    unmatched:      result.unmatched      || [],
    matchedCount:   result.matchedCount   || 0,
    unmatchedCount: result.unmatchedCount || 0,
  };
});

engine.registerNodeProcessor('emailTemplateNode', async (data) => {
  const varData = Object.fromEntries((data.variables || []).map(v => [v.key, v.value]));
  const renderLocal = (text) => {
    let out = text || '';
    Object.entries(varData).forEach(([k, v]) => {
      out = out.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), v || `{{${k}}}`);
    });
    return out;
  };
  return {
    type:    'template-result',
    subject: renderLocal(data.subject),
    text:    data.bodyType !== 'html' ? renderLocal(data.body) : undefined,
    html:    data.bodyType !== 'text' ? renderLocal(data.body) : undefined,
  };
});

engine.registerNodeProcessor('sendEmailNode', async (data, inputs) => {
  const token = localStorage.getItem('office_weave_token') || localStorage.getItem('auth_token');
  const creds = inputs?.email ? inputs : null;
  if (!creds?.email || !creds?.password) {
    return { type: 'email-sent', success: false, error: 'No credentials' };
  }
  const subject = inputs?.subject || data.subject || '';
  const body    = inputs?.text    || inputs?.html || data.body || '';
  const to      = data.to || '';
  if (!to || !subject) {
    return { type: 'email-sent', success: false, error: 'Missing to/subject' };
  }
  const response = await fetch('https://back-end-auto-office-f8xt.vercel.app/api/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      provider: 'smtp',
      config: {
        provider: 'smtp',
        host:   creds.host || 'smtp.gmail.com',
        port:   creds.port || 587,
        secure: false,
        auth:   { user: creds.email, pass: creds.password },
      },
      email: {
        to:      to.split(',').map(e => ({ email: e.trim() })),
        subject,
        text:    body,
        html:    inputs?.html || `<p>${body.replace(/\n/g, '<br>')}</p>`,
      },
    }),
  });
  const result = await response.json();
  return {
    type:      'email-sent',
    success:   result.success || false,
    messageId: result.messageId,
    timestamp: result.timestamp,
    to,
    subject,
  };
});

console.log('✅ All processors registered');
console.log('📋 Available processors:', Array.from(engine.nodeRegistry.keys()));

export default nodeRegistry;
export { NodeRegistry };