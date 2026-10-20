import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { workflowsService } from '../services/workflows.service';

export async function workflowsRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
  // Lấy danh sách workflows
  fastify.get('/', {
    schema: {
      tags: ['Workflows'],
      summary: 'Lấy danh sách tất cả workflows',
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'string' },
          offset: { type: 'string' },
          search: { type: 'string' },
        },
      },
    },
  }, async (request, _reply) => {
    const query = request.query as { limit?: string; offset?: string; search?: string };
    const limit = query.limit ? parseInt(query.limit, 10) : 50;
    const offset = query.offset ? parseInt(query.offset, 10) : 0;
    const result = workflowsService.findAll(limit, offset, query.search);
    return { data: result };
  });

  // Export nhiều workflow
  fastify.get('/export', {
    schema: {
      tags: ['Workflows'],
      summary: 'Export danh sách workflow theo IDs',
      querystring: {
        type: 'object',
        properties: {
          ids: { type: 'string' },
        },
      },
    },
  }, async (request, _reply) => {
    const query = request.query as { ids?: string };
    const ids = (query.ids || '').split(',').filter(Boolean);
    const workflows = ids.map((id) => workflowsService.findOne(id)).filter(Boolean);
    return { data: workflows };
  });

  // Import workflows
  fastify.post('/import', {
    schema: {
      tags: ['Workflows'],
      summary: 'Import workflow từ JSON payload',
    },
  }, async (request, _reply) => {
    const result = workflowsService.importWorkflows(request.body);
    return { data: result };
  });

  // Lấy chi tiết 1 workflow
  fastify.get('/:id', {
    schema: {
      tags: ['Workflows'],
      summary: 'Lấy chi tiết một workflow theo ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const workflow = workflowsService.findOne(id);
    if (!workflow) {
      return reply.status(404).send({ error: `Không tìm thấy workflow có ID: ${id}` });
    }
    return { data: workflow };
  });

  // Tạo workflow mới
  fastify.post('/', {
    schema: {
      tags: ['Workflows'],
      summary: 'Tạo một workflow mới',
    },
  }, async (request, _reply) => {
    const body = (request.body as any) || {};
    const workflow = workflowsService.create(body);
    return { data: workflow };
  });

  // Cập nhật workflow
  fastify.put('/:id', {
    schema: {
      tags: ['Workflows'],
      summary: 'Cập nhật workflow (lưu node, edge, metadata)',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = (request.body as any) || {};
    const workflow = workflowsService.update(id, body);
    if (!workflow) {
      return reply.status(404).send({ error: `Không tìm thấy workflow có ID: ${id}` });
    }
    return { data: workflow };
  });

  // Xóa workflow
  fastify.delete('/:id', {
    schema: {
      tags: ['Workflows'],
      summary: 'Xóa một workflow',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = workflowsService.remove(id);
    if (!deleted) {
      return reply.status(404).send({ error: `Không tìm thấy workflow có ID: ${id}` });
    }
    return { data: { message: 'Đã xóa workflow thành công', id } };
  });

  // Validate workflow
  fastify.get('/:id/validate', {
    schema: {
      tags: ['Workflows'],
      summary: 'Kiểm tra tính hợp lệ trước khi thực thi',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, _reply) => {
    const { id } = request.params as { id: string };
    const result = workflowsService.validate(id);
    return { data: result };
  });

  // Execute workflow
  fastify.post('/:id/execute', {
    schema: {
      tags: ['Workflows'],
      summary: 'Thực thi workflow trên server',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, _reply) => {
    const { id } = request.params as { id: string };
    const body = (request.body as any) || {};
    const result = workflowsService.execute(id, body.input);
    return { data: result };
  });

  // Triggers
  fastify.get('/:id/triggers', {
    schema: {
      tags: ['Workflows'],
      summary: 'Lấy danh sách trigger của workflow',
    },
  }, async (_request, _reply) => {
    return { data: { triggers: [] } };
  });

  fastify.post('/:id/triggers', {
    schema: {
      tags: ['Workflows'],
      summary: 'Tạo trigger cho workflow',
    },
  }, async (request, _reply) => {
    const body = (request.body as any) || {};
    return {
      data: {
        id: `trig_${Date.now()}`,
        ...body,
        created_at: new Date().toISOString(),
      },
    };
  });

  fastify.get('/:id/webhook/:triggerId', {
    schema: {
      tags: ['Workflows'],
      summary: 'Lấy thông tin webhook của workflow',
    },
  }, async (request, _reply) => {
    const { id, triggerId } = request.params as { id: string; triggerId: string };
    return {
      data: {
        webhookUrl: `http://localhost:3001/api/workflows/${id}/webhook/${triggerId}/incoming`,
      },
    };
  });

  // Export 1 workflow
  fastify.get('/:id/export', {
    schema: {
      tags: ['Workflows'],
      summary: 'Export 1 workflow thành file JSON',
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const workflow = workflowsService.findOne(id);
    if (!workflow) {
      return reply.status(404).send({ error: `Không tìm thấy workflow có ID: ${id}` });
    }
    return { data: workflow };
  });
}
