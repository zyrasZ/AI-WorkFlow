import * as fs from 'fs';
import * as path from 'path';

export interface AiChatResponse {
  response: string;
  model: string;
  provider: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  timestamp: number;
}

export interface ChatAiDto {
  prompt: string;
  provider?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export class AiService {
  /**
   * Đọc GROQ_API_KEY từ process.env hoặc trực tiếp từ file server/.env
   */
  private getApiKey(): string | undefined {
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '') {
      return process.env.GROQ_API_KEY.trim();
    }
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
        for (const line of lines) {
          const match = line.match(/^\s*GROQ_API_KEY\s*=\s*(.*)?\s*$/);
          if (match && match[1]) {
            const val = match[1].trim().replace(/^['"](.*)['"]$/, '$1');
            if (val) {
              process.env.GROQ_API_KEY = val;
              return val;
            }
          }
        }
      }
    } catch {
      // Bỏ qua lỗi đọc file
    }
    return undefined;
  }

  /**
   * Gọi Groq API completions
   */
  private async callGroq(
    apiKey: string,
    model: string,
    prompt: string,
    systemPrompt: string,
    temperature: number,
    maxTokens: number,
  ): Promise<Response> {
    return fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });
  }

  /**
   * Lấy danh sách các models đang active trên tài khoản Groq này
   */
  async getModels(): Promise<string[]> {
    const groqApiKey = this.getApiKey();
    if (!groqApiKey) return [];
    return this.getAvailableModels(groqApiKey);
  }

  /**
   * Truy vấn API Groq /openai/v1/models
   */
  async getAvailableModels(apiKey: string): Promise<string[]> {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        const models = (json.data || [])
          .map((m: any) => m.id)
          .filter((id: string) => !id.includes('whisper') && !id.includes('tts') && !id.includes('safetensors'));
        return models;
      }
    } catch (e: any) {
      console.error(`[Fastify AI] Exception khi lấy models từ Groq: ${e.message}`);
    }
    return [];
  }

  /**
   * Chọn model Chat tốt nhất trong danh sách models khả dụng của Groq
   */
  private getBestChatModel(availableModels: string[], requestedModel?: string): string {
    if (requestedModel && availableModels.includes(requestedModel)) {
      return requestedModel;
    }

    const priorityList = [
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'qwen/qwen3.8-27b',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
    ];

    for (const p of priorityList) {
      if (availableModels.includes(p)) {
        return p;
      }
    }

    const validChatModels = availableModels.filter(
      (m) => !m.includes('guard') && !m.includes('orpheus') && !m.includes('whisper') && !m.includes('tts'),
    );

    return validChatModels[0] || availableModels[0] || 'openai/gpt-oss-120b';
  }

  /**
   * Xử lý gọi AI qua Groq API hoặc Mock thông minh
   */
  async chat(dto: ChatAiDto): Promise<AiChatResponse> {
    const groqApiKey = this.getApiKey();
    let model = dto.model || 'openai/gpt-oss-120b';
    const temperature = dto.temperature ?? 0.7;
    const maxTokens = dto.maxTokens ?? 1000;
    const systemPrompt = dto.systemPrompt || 'You are an intelligent workflow automation assistant.';

    // 1. Nếu có API key, gọi Groq thật
    if (groqApiKey) {
      try {
        const availableModels = await this.getAvailableModels(groqApiKey);
        const bestModel = this.getBestChatModel(availableModels, model);
        if (bestModel !== model) {
          model = bestModel;
        }

        let response = await this.callGroq(groqApiKey, model, dto.prompt, systemPrompt, temperature, maxTokens);

        // Fallback nếu model lỗi 404
        if (!response.ok && response.status === 404 && availableModels.length > 0) {
          const chatCandidates = availableModels.filter(
            (m) => m !== model && !m.includes('guard') && !m.includes('orpheus'),
          );
          for (const fallbackModel of chatCandidates) {
            const fallbackRes = await this.callGroq(groqApiKey, fallbackModel, dto.prompt, systemPrompt, temperature, maxTokens);
            if (fallbackRes.ok) {
              response = fallbackRes;
              model = fallbackModel;
              break;
            }
          }
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Groq API (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || 'Không có phản hồi từ AI';

        return {
          response: content,
          model,
          provider: 'groq',
          usage: data.usage || {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0,
          },
          timestamp: Date.now(),
        };
      } catch (err: any) {
        console.warn(`[Fastify AI] Lỗi khi gọi Groq API: ${err.message}`);
        return {
          response: `[Lỗi Groq API]: ${err.message}\n\nVui lòng kiểm tra lại GROQ_API_KEY hoặc kết nối mạng.`,
          model,
          provider: 'groq (error)',
          timestamp: Date.now(),
        };
      }
    }

    // 2. Chưa có GROQ_API_KEY, trả về phản hồi mô phỏng
    return {
      response: `[AI ${model}]: Đã xử lý yêu cầu thành công!\n\nNội dung bạn gửi: "${dto.prompt}"\n\n(Ghi chú: Để gọi AI thật trực tiếp từ Groq miễn phí, bạn chỉ cần điền GROQ_API_KEY=gsk_... vào file server/.env)`,
      model,
      provider: 'groq (simulated)',
      usage: {
        prompt_tokens: Math.ceil((dto.prompt || '').length / 4),
        completion_tokens: 45,
        total_tokens: Math.ceil((dto.prompt || '').length / 4) + 45,
      },
      timestamp: Date.now(),
    };
  }
}

export const aiService = new AiService();
