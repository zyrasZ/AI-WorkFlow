import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

import { authRoutes } from './routes/auth.routes';
import { workflowsRoutes } from './routes/workflows.routes';
import { aiRoutes } from './routes/ai.routes';
import { systemRoutes } from './routes/system.routes';

// 1. Nạp biến môi trường từ .env
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

async function bootstrap() {
  const app = Fastify({
    logger: {
      level: 'info',
    },
  });

  // 2. CORS: Cho phép Frontend Local và Vercel gọi API
  await app.register(cors, {
    origin: (origin, cb) => {
      // Cho phép request không có origin (server-to-server, swagger) hoặc từ Vercel, localhost
      if (!origin || origin.includes('localhost') || origin.endsWith('.vercel.app') || (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)) {
        cb(null, true);
        return;
      }
      // Trong môi trường demo, cho phép gọi để tránh lỗi CORS
      cb(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // 3. Swagger & Swagger UI (Tài liệu API tại /api/docs)
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'AI-WorkFlow API (Fastify)',
        description: 'Tài liệu API hiệu năng cao cho hệ thống AI Workflow Automation (Fastify Backend)',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3001',
          description: 'Development Server',
        },
      ],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/api/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // 4. Đăng ký các Route Plugins dưới prefix /api
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(workflowsRoutes, { prefix: '/api/workflows' });
  await app.register(aiRoutes, { prefix: '/api/ai' });
  await app.register(systemRoutes, { prefix: '/api' });

  // Root health check
  app.get('/health', async () => ({ status: 'ok', framework: 'Fastify' }));
  app.get('/', async () => ({
    message: 'Welcome to AI-WorkFlow API (Fastify)',
    documentation: '/api/docs',
    health: '/health',
  }));

  const port = Number(process.env.PORT || 3001);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await app.listen({ port, host });
    console.log(`\n⚡ Server Fastify siêu nhẹ & tốc độ cao đang chạy tại: http://localhost:${port}/api`);
    console.log(`📖 Xem Menu Swagger tại:                             http://localhost:${port}/api/docs\n`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();
