import { AIStreamConfig } from './types';

export abstract class BaseAIProvider {
    abstract generateStream(
        prompt: string,
        config: AIStreamConfig,
        onChunk: (chunk: string) => void
    ): Promise<void>;

    abstract generate(
        prompt: string,
        config: AIStreamConfig
    ): Promise<string>;
}
