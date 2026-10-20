import { FastifyInstance, FastifyPluginOptions } from 'fastify';

// Lưu trữ executions trong memory
const executionsStore: any[] = [];
let userSettings: any = {
  theme: 'dark',
  email_config: {},
  preferences: {
    autoSave: true,
    notifications: true,
  },
};

export async function systemRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
  // Health check
  fastify.get('/health', {
    schema: {
      tags: ['System'],
      summary: 'Kiểm tra trạng thái server đang sống',
    },
  }, async (_request, _reply) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      framework: 'Fastify',
    };
  });

  // Node types
  fastify.get('/node-types', {
    schema: {
      tags: ['System'],
      summary: 'Lấy danh sách các loại node khả dụng',
    },
  }, async (_request, _reply) => {
    return {
      data: {
        nodes: [
          { type: 'promptNode', name: 'Prompt Node', category: 'input' },
          { type: 'ghostNode', name: 'AI LLM Inference', category: 'ai' },
          { type: 'outputNode', name: 'Output Display', category: 'output' },
          { type: 'webhookNode', name: 'Webhook Trigger', category: 'trigger' },
          { type: 'scheduleNode', name: 'Schedule Trigger', category: 'trigger' },
        ],
      },
    };
  });

  // Executions
  fastify.get('/executions', {
    schema: {
      tags: ['Executions'],
      summary: 'Lấy lịch sử thực thi workflows',
    },
  }, async (request, _reply) => {
    const query = request.query as any;
    const limit = query?.limit ? parseInt(query.limit, 10) : 50;
    const offset = query?.offset ? parseInt(query.offset, 10) : 0;
    let list = executionsStore;
    if (query?.workflow_id) {
      list = list.filter((e) => e.workflow_id === query.workflow_id);
    }
    return {
      data: {
        executions: list.slice(offset, offset + limit),
        total: list.length,
        limit,
        offset,
      },
    };
  });

  fastify.post('/executions', {
    schema: {
      tags: ['Executions'],
      summary: 'Tạo một phiên thực thi workflow mới',
    },
  }, async (request, _reply) => {
    const body = (request.body as any) || {};
    const newExec = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      workflow_id: body.workflow_id,
      status: body.status || 'running',
      results: null,
      created_at: new Date().toISOString(),
    };
    executionsStore.unshift(newExec);
    return { data: newExec };
  });

  fastify.get('/executions/:id', {
    schema: {
      tags: ['Executions'],
      summary: 'Lấy thông tin chi tiết một lượt thực thi',
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const exec = executionsStore.find((e) => e.id === id);
    if (!exec) {
      return reply.status(404).send({ error: 'Không tìm thấy execution' });
    }
    return { data: exec };
  });

  fastify.patch('/executions/:id', {
    schema: {
      tags: ['Executions'],
      summary: 'Cập nhật trạng thái / kết quả thực thi',
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = (request.body as any) || {};
    const index = executionsStore.findIndex((e) => e.id === id);
    if (index === -1) {
      return reply.status(404).send({ error: 'Không tìm thấy execution' });
    }
    executionsStore[index] = {
      ...executionsStore[index],
      ...body,
      updated_at: new Date().toISOString(),
    };
    return { data: executionsStore[index] };
  });

  // Settings
  fastify.get('/settings', {
    schema: {
      tags: ['Settings'],
      summary: 'Lấy cấu hình người dùng',
    },
  }, async (_request, _reply) => {
    return { data: userSettings };
  });

  fastify.put('/settings', {
    schema: {
      tags: ['Settings'],
      summary: 'Cập nhật cấu hình người dùng',
    },
  }, async (request, _reply) => {
    const body = (request.body as any) || {};
    userSettings = {
      ...userSettings,
      ...body,
    };
    return { data: userSettings };
  });
}
