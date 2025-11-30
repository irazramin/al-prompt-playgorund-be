import { Request, Response, NextFunction } from 'express';
import { validateGenerateRequest } from '../validators/ai.validator';
import { generateResponseStream } from '../services/ai/ai.service';
import ResponseHandler from '../helpers/response.helper';

export const generateStream = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { provider, prompt, aiModel, temperature } = req.body;

    const validation = validateGenerateRequest(prompt, aiModel, temperature, provider);
    if (!validation.isValid) {
      return ResponseHandler.badRequest(res, 'Validation failed', validation.errors);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.flushHeaders();

    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      await generateResponseStream(
        provider,
        prompt,
        aiModel,
        temperature,
        (chunk) => sendEvent('chunk', { content: chunk })
      );

      sendEvent('complete', {
        provider,
        usedModel: aiModel,
        temperature,
        createdAt: new Date().toISOString()
      });

      res.end();
    } catch (streamError: any) {
      console.error('Stream error:', streamError);

      let errorMessage = 'Failed to generate response';
      if (streamError.code === 'insufficient_quota') {
        errorMessage = 'OpenAI API quota exceeded. Please check your billing details.';
      } else if (streamError.message) {
        errorMessage = streamError.message;
      }

      sendEvent('error', { message: errorMessage, code: streamError.code });
      res.end();
    }
  } catch (error) {
    console.error('Controller error:', error);
    next(error);
  }
};
