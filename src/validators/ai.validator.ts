export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const SUPPORTED_MODELS = [
  "gpt-4",
  "gpt-3.5-turbo",
  "gemini-2.5-flash-preview-09-2025",
  "gemini-3-pro-preview"
];

export const validateGenerateRequest = (prompt: string, model: string, temperature: number, provider: string): ValidationResult => {
  const errors: string[] = [];

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    errors.push('Prompt is required and cannot be empty');
  }

  if (!model || !SUPPORTED_MODELS.includes(model)) {
    errors.push(`Model must be one of: ${SUPPORTED_MODELS.join(', ')}`);
  }

  if (typeof temperature !== 'number' || temperature < 0 || temperature > 1) {
    errors.push('Temperature must be a number between 0 and 1');
  }

  if (!provider || !['openai', 'claude', 'gemini'].includes(provider)) {
    errors.push('Invalid provider. Must be: openai, claude, or gemini');
  }

  return { isValid: errors.length === 0, errors };
};

export const getSupportedModels = () => SUPPORTED_MODELS;
