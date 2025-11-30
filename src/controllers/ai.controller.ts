import { Request, Response, NextFunction } from 'express';
import { validateGenerateRequest } from '../validators/ai.validator';
import { generateResponseStream, enhancePrompt as enhancePromptService } from '../services/ai/aiGenerate.service';
import ResponseHandler from '../helpers/response.helper';
import { saveChat } from '../services/chat.service';
import * as chatService from '../services/chat.service';

export const generateStream = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { provider, prompt, aiModel, temperature, chatId, userId } = req.body;

    const validation = validateGenerateRequest(prompt, aiModel, temperature, provider);
    if (!validation.isValid) {
      return ResponseHandler.badRequest(res, 'Validation failed', validation.errors);
    }

    console.log(chatId);
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
      const fullResponse = await generateResponseStream(
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

      await saveChat(chatId, prompt, fullResponse, userId, aiModel, temperature);


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

export const getChats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!req.user) {
      return ResponseHandler.unauthorized(res, 'Authentication required');
    }

    const result = await chatService.getChatList(req.user._id.toString(), page, limit);

    return ResponseHandler.success(res, result);
  } catch (error) {
    console.error('Get chats error:', error);
    next(error);
  }
};

export const getChatMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { chatId } = req.params;

    if (!req.user) {
      return ResponseHandler.unauthorized(res, 'Authentication required');
    }

    const messages = await chatService.getChatMessages(chatId, req.user._id.toString());

    return ResponseHandler.success(res, messages);
  } catch (error: any) {
    console.error('Get chat messages error:', error);
    if (error.message === 'Chat not found or unauthorized') {
      return ResponseHandler.notFound(res, error.message);
    }
    next(error);
  }
};

export const enhancePrompt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { provider, prompt, aiModel, temperature } = req.body;

    const validation = validateGenerateRequest(prompt, aiModel, temperature, provider);
    if (!validation.isValid) {
      return ResponseHandler.badRequest(res, 'Validation failed', validation.errors);
    }

    const enhancedPrompt = await enhancePromptService(provider, prompt, aiModel, temperature);

    return ResponseHandler.success(res, { enhancedPrompt });
  } catch (error) {
    console.error('Enhance prompt error:', error);
    next(error);
  }
};

export const updateConversationTitle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;

    if (!req.user) {
      return ResponseHandler.unauthorized(res, 'Authentication required');
    }

    if (!title || title.trim() === '') {
      return ResponseHandler.badRequest(res, 'Title is required');
    }

    const updatedConversation = await chatService.updateConversationTitle(
      chatId,
      req.user._id.toString(),
      title.trim()
    );

    return ResponseHandler.success(res, updatedConversation);
  } catch (error: any) {
    console.error('Update conversation title error:', error);
    if (error.message === 'Chat not found or unauthorized') {
      return ResponseHandler.notFound(res, error.message);
    }
    next(error);
  }
};

