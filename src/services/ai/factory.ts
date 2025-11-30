import { BaseAIProvider } from './core/base.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { ClaudeProvider } from './providers/claude.provider';
import { GeminiProvider } from './providers/gemini.provider';

export type AIProviderType = 'openai' | 'claude' | 'gemini';

export class AIProviderFactory {
    static getProvider(type: AIProviderType): BaseAIProvider {
        switch (type) {
            case 'openai':
                if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');
                return new OpenAIProvider(process.env.OPENAI_API_KEY);

            case 'claude':
                if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured');
                return new ClaudeProvider(process.env.ANTHROPIC_API_KEY);

            case 'gemini':
                if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');
                return new GeminiProvider(process.env.GEMINI_API_KEY);

            default:
                throw new Error(`Unknown provider type: ${type}`);
        }
    }
}
