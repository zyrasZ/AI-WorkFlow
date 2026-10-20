import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { aiService, ChatAiDto } from '../services/ai.service';

export async function aiRoutes(fastify: FastifyInstance, _options: FastifyPluginOptions) {
  // Lấy danh sách models khả dụng
  fastify.get('/models', {
    schema: {
      tags: ['AI'],
      summary: 'Lấy danh sách các model AI khả dụng trên tài khoản Groq',
      description: 'Truy vấn Groq Cloud để trả về danh sách model mà API key hiện tại có quyền truy cập',
    },
  }, async (_request, _reply) => {
    const models = await aiService.getModels();
    return { data: models };
  });

  // Chat AI
  fastify.post('/chat', {
    schema: {
      tags: ['AI'],
      summary: 'Gửi prompt tới AI (Groq Llama, Mixtral, Gemma...)',
      description: 'Gọi AI xử lý nội dung. Nếu chưa cấu hình GROQ_API_KEY, server tự động trả về phản hồi mô phỏng thông minh để test.',
      body: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: { type: 'string' },
          provider: { type: 'string' },
          model: { type: 'string' },
          temperature: { type: 'number' },
          maxTokens: { type: 'number' },
          systemPrompt: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const body = request.body as ChatAiDto;
    if (!body || !body.prompt) {
      return reply.status(400).send({ error: 'Thiếu trường prompt trong request body' });
    }
    const result = await aiService.chat(body);
    return { data: result };
  });
}
