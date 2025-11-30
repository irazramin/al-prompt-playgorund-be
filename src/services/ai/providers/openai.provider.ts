import OpenAI from 'openai';
import { BaseAIProvider } from '../core/base.provider';
import { AIStreamConfig } from '../core/types';

export class OpenAIProvider extends BaseAIProvider {
    private client: OpenAI;

    constructor(apiKey: string) {
        super();
        this.client = new OpenAI({ apiKey });
    }

    async generateStream(
        prompt: string,
        config: AIStreamConfig,
        onChunk: (chunk: string) => void
    ): Promise<void> {
        const stream = await this.client.chat.completions.create({
            model: config.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: config.temperature,
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) onChunk(content);
        }
    }

    async generate(
        prompt: string,
        config: AIStreamConfig
    ): Promise<string> {
        const response = await this.client.chat.completions.create({
            model: config.model,
            messages: [{ role: 'user', content: prompt }],
            temperature: config.temperature,
            stream: false,
        });

        return response.choices[0]?.message?.content || '';
    }
}
