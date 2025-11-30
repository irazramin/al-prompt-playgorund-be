export interface AIStreamConfig {
    model: string;
    temperature: number;
    maxTokens?: number;
}

export interface AIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
