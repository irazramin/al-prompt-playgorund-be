import { AIProviderFactory, AIProviderType } from '.';

export const generateResponseStream = async (
  providerType: AIProviderType,
  prompt: string,
  model: string,
  temperature: number,
  onChunk: (chunk: string) => void
): Promise<void> => {
  const provider = AIProviderFactory.getProvider(providerType);
  await provider.generateStream(prompt, { model, temperature }, onChunk);
};
