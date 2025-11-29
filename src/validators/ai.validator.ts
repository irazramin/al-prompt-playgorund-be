export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

const SUPPORTED_MODELS = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'];

export const validateGenerateRequest = (prompt: any, model: any, temperature: any): ValidationResult => {
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

  return { isValid: errors.length === 0, errors };
};

export const getSupportedModels = () => SUPPORTED_MODELS;
