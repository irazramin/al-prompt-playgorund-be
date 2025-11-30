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

export const enhancePrompt = async (
  providerType: AIProviderType,
  userPrompt: string,
  model: string,
  temperature: number
): Promise<string> => {
  const provider = AIProviderFactory.getProvider(providerType);

  const systemPrompt = `You are a prompt enhancement assistant. Take the user's prompt and improve it by:
- Making it more specific and detailed
- Adding relevant context where appropriate
- Structuring it clearly
- Maintaining the original intent
- Avoid giving markdown or html tags
- Avoid giving any extra information
- Answer should be short and concise

User's prompt: ${userPrompt}

Return ONLY the enhanced prompt, nothing else.`;

  const enhancedPrompt = await provider.generate(systemPrompt, { model, temperature });
  return enhancedPrompt.trim();
};
