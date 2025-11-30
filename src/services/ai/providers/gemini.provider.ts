import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAIProvider } from '../core/base.provider';
import { AIStreamConfig } from '../core/types';

export class GeminiProvider extends BaseAIProvider {
    private client: GoogleGenerativeAI;

    constructor(apiKey: string) {
        super();
        this.client = new GoogleGenerativeAI(apiKey);
    }

    async generateStream(
        prompt: string,
        config: AIStreamConfig,
        onChunk: (chunk: string) => void
    ): Promise<void> {
        const genModel = this.client.getGenerativeModel({
            model: config.model,
            generationConfig: { temperature: config.temperature }
        });

        const result = await genModel.generateContentStream(prompt);

        for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) onChunk(text);
        }
    }
}
