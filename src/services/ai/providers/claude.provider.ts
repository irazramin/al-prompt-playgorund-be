import Anthropic from '@anthropic-ai/sdk';
import { BaseAIProvider } from '../core/base.provider';
import { AIStreamConfig } from '../core/types';

export class ClaudeProvider extends BaseAIProvider {
    private client: Anthropic;

    constructor(apiKey: string) {
        super();
        this.client = new Anthropic({ apiKey });
    }

    async generateStream(
        prompt: string,
        config: AIStreamConfig,
        onChunk: (chunk: string) => void
    ): Promise<void> {
        const stream = await this.client.messages.create({
            model: config.model,
            max_tokens: config.maxTokens || 1024,
            temperature: config.temperature,
            messages: [{ role: 'user', content: prompt }],
            stream: true,
        });

        for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                onChunk(chunk.delta.text);
            }
        }
    }
}
