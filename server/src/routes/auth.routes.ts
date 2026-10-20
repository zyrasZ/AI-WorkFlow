import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { authService } from '../services/auth.service';

export async function authRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
  // Lấy thông tin user hiện tại
  fastify.get('/user', {
    schema: {
      tags: ['Auth'],
      summary: 'Lấy thông tin người dùng hiện tại',
      response: {
        200: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                    role: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, async (_request, _reply) => {
    return { data: { user: authService.getCurrentUser() } };
  });

  // Đăng nhập
  fastify.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Đăng nhập tài khoản',
      body: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
        },
      },
    },
  }, async (request, _reply) => {
    const result = authService.login(request.body);
    return { data: result };
  });

  // Đăng ký tài khoản (register)
  fastify.post('/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Đăng ký tài khoản mới',
    },
  }, async (request, _reply) => {
    const result = authService.register(request.body);
    return { data: result };
  });

  // Đăng ký tài khoản (signup alias)
  fastify.post('/signup', {
    schema: {
      tags: ['Auth'],
      summary: 'Đăng ký tài khoản mới (signup alias)',
    },
  }, async (request, _reply) => {
    const result = authService.register(request.body);
    return { data: result };
  });

  // Đăng xuất
  fastify.post('/logout', {
    schema: {
      tags: ['Auth'],
      summary: 'Đăng xuất',
    },
  }, async (_request, _reply) => {
    return { data: { message: 'Đã đăng xuất thành công' } };
  });
}
