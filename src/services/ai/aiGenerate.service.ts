import { AIProviderFactory, AIProviderType } from '.';

export const generateResponseStream = async (
  providerType: AIProviderType,
  prompt: string,
  model: string,
  temperature: number,
  onChunk: (chunk: string) => void
): Promise<string> => {
  const provider = AIProviderFactory.getProvider(providerType);

  let fullResponse = '';

  // Wrap the onChunk callback to accumulate the response
  await provider.generateStream(prompt, { model, temperature }, (chunk) => {
    fullResponse += chunk;
    onChunk(chunk); // Still call the original callback for streaming
  });

  return fullResponse;
};
