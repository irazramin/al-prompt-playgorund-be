# Design Document

## Overview

The AI Prompt Playground backend provides REST API endpoints for generating AI responses based on user prompts. The system supports both standard request-response and real-time streaming responses. It integrates with OpenAI's API when credentials are available, or falls back to a mock implementation for development and testing. The architecture follows the existing Express.js patterns in the codebase with a controller-service-model separation of concerns.

### Response Modes

1. **Standard Mode** (POST /api/generate): Returns complete response after generation
2. **Streaming Mode** (POST /api/generate/stream): Returns response chunks in real-time using Server-Sent Events (SSE)

## Architecture

The system follows a layered architecture pattern:

```
┌─────────────────────────────────────────────────┐
│            API Route Layer                      │
│  POST /api/generate (standard)                  │
│  POST /api/generate/stream (SSE streaming)      │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│         Controller Layer                        │
│  (ai.controller.ts)                             │
│  - Request validation                           │
│  - Response formatting (JSON/SSE)               │
│  - Stream management                            │
└──────────────┬──────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│          Service Layer                          │
│  (ai.service.ts)                                │
│  - Business logic                               │
│  - OpenAI/Mock selection                        │
│  - Stream handling                              │
└──────────────┬──────────────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
┌───────▼──────┐ ┌───▼──────────┐
│ OpenAI API   │ │ Mock Service │
│ Integration  │ │ (with stream │
│ (streaming)  │ │  simulation) │
└──────────────┘ └──────────────┘
```

The design leverages the existing project infrastructure:
- Express.js routing and middleware
- ResponseHandler utility for consistent API responses
- Error middleware for centralized error handling
- Environment configuration via dotenv

## Components and Interfaces

### 1. Route Definition

**File:** `src/routes/ai.routes.ts`

Defines two POST endpoints for prompt generation:

**Standard Endpoint:**
- Path: `/api/generate`
- Method: POST
- Response: JSON
- No authentication required (public endpoint)

**Streaming Endpoint:**
- Path: `/api/generate/stream`
- Method: POST
- Response: Server-Sent Events (text/event-stream)
- No authentication required (public endpoint)
- Headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`

### 2. Controller

**File:** `src/controllers/ai.controller.ts`

**Responsibilities:**
- Extract and validate request parameters
- Invoke service layer
- Format responses using ResponseHandler
- Handle errors via Express error middleware

**Interface:**
```typescript
// Standard response
export const generate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>

// Streaming response
export const generateStream = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void>
```

### 3. Service Layer

**File:** `src/services/ai.service.ts`

**Responsibilities:**
- Determine whether to use OpenAI API or mock
- Call appropriate generation method
- Return standardized response format
- Handle streaming responses with callbacks

**Interface:**
```typescript
interface GenerateRequest {
  prompt: string;
  model: string;
  temperature: number;
}

interface GenerateResponse {
  reply: string;
  usedModel: string;
  temperature: number;
  createdAt: string;
}

// Standard generation
export const generateResponse = async (
  request: GenerateRequest
): Promise<GenerateResponse>

// Streaming generation
export const generateResponseStream = async (
  request: GenerateRequest,
  onChunk: (chunk: string) => void,
  onComplete: (metadata: { usedModel: string; temperature: number; createdAt: string }) => void,
  onError: (error: Error) => void
): Promise<void>
```

### 4. OpenAI Integration

**Responsibilities:**
- Initialize OpenAI client with API key
- Make API calls to OpenAI (standard and streaming)
- Handle API errors

**Interface:**
```typescript
// Standard call
const callOpenAI = async (
  prompt: string,
  model: string,
  temperature: number
): Promise<string>

// Streaming call
const callOpenAIStream = async (
  prompt: string,
  model: string,
  temperature: number,
  onChunk: (chunk: string) => void
): Promise<void>
```

### 5. Mock Service

**Responsibilities:**
- Generate simulated AI responses
- Vary responses based on model selection
- Include prompt context in mock responses
- Simulate streaming with artificial delays

**Interface:**
```typescript
// Standard mock
const generateMockResponse = (
  prompt: string,
  model: string,
  temperature: number
): string

// Streaming mock
const generateMockResponseStream = async (
  prompt: string,
  model: string,
  temperature: number,
  onChunk: (chunk: string) => void
): Promise<void>
```

### 6. Validation Utilities

**File:** `src/validators/ai.validator.ts`

**Responsibilities:**
- Validate prompt is non-empty string
- Validate model is in supported list
- Validate temperature is number between 0-1

**Interface:**
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateGenerateRequest = (
  prompt: any,
  model: any,
  temperature: any
): ValidationResult
```

## Data Models

### Request Schema

```typescript
{
  prompt: string;      // Required, non-empty
  model: string;       // Required, one of supported models
  temperature: number; // Required, 0-1 inclusive
}
```

### Response Schema (Standard)

```typescript
{
  status: 'success' | 'error';
  statusCode: number;
  message?: string;
  data?: {
    reply: string;
    usedModel: string;
    temperature: number;
    createdAt: string; // ISO 8601 format
  };
  errors?: any;
  timestamp: string;
}
```

### Streaming Response Format (SSE)

Server-Sent Events format with three event types:

**Chunk Event** (sent multiple times during generation):
```
event: chunk
data: {"content": "partial text"}

```

**Complete Event** (sent once at the end):
```
event: complete
data: {"usedModel": "gpt-3.5-turbo", "temperature": 0.7, "createdAt": "2024-01-01T00:00:00.000Z"}

```

**Error Event** (sent if an error occurs):
```
event: error
data: {"message": "Error description"}

```

Client-side handling example:
```typescript
const eventSource = new EventSource('/api/v1/ai/generate/stream', {
  method: 'POST',
  body: JSON.stringify({ prompt, model, temperature })
});

eventSource.addEventListener('chunk', (e) => {
  const { content } = JSON.parse(e.data);
  // Append content to UI
});

eventSource.addEventListener('complete', (e) => {
  const metadata = JSON.parse(e.data);
  // Close connection and show metadata
  eventSource.close();
});

eventSource.addEventListener('error', (e) => {
  const { message } = JSON.parse(e.data);
  // Handle error
  eventSource.close();
});
```

### Supported Models

```typescript
const SUPPORTED_MODELS = [
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4-turbo'
];
```

### Configuration

Environment variables required:
```
OPENAI_API_KEY=<optional-api-key>
```

When `OPENAI_API_KEY` is not set, the system automatically uses mock responses.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Non-empty prompt validation

*For any* request with an empty or whitespace-only prompt, the API should reject the request with a 400 status code and validation error message.

**Validates: Requirements 1.2**

### Property 2: Model validation

*For any* request with a model identifier not in the supported models list, the API should reject the request with a 400 status code and validation error message.

**Validates: Requirements 1.3**

### Property 3: Temperature bounds validation

*For any* request with a temperature value outside the range [0, 1], the API should reject the request with a 400 status code and validation error message.

**Validates: Requirements 1.4**

### Property 4: Response completeness

*For any* valid request that is successfully processed, the response should contain all required fields: reply, usedModel, temperature, and createdAt.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

### Property 5: Response model consistency

*For any* valid request, the usedModel field in the response should match the model field from the request.

**Validates: Requirements 2.3**

### Property 6: Response temperature consistency

*For any* valid request, the temperature field in the response should match the temperature field from the request.

**Validates: Requirements 2.4**

### Property 7: Timestamp format validity

*For any* successful response, the createdAt timestamp should be a valid ISO 8601 formatted string.

**Validates: Requirements 2.5**

### Property 8: Mock fallback behavior

*For any* valid request when OpenAI API key is not configured, the system should generate a mock response without throwing errors.

**Validates: Requirements 3.2, 3.3**

### Property 9: Error status code correctness

*For any* request that fails validation, the response status code should be 400.

**Validates: Requirements 4.1**

### Property 10: Service error handling

*For any* request where the AI service encounters an error, the response status code should be 500 and should include an error message.

**Validates: Requirements 4.2, 4.3**

### Property 11: Model support minimum

*For any* system configuration, the list of supported models should contain at least two distinct model identifiers.

**Validates: Requirements 5.1**

## Error Handling

### Validation Errors (400)

Returned when:
- Prompt is missing, empty, or only whitespace
- Model is missing or not in supported list
- Temperature is missing, not a number, or outside [0, 1]

Response format:
```typescript
{
  status: 'error',
  statusCode: 400,
  message: 'Validation failed',
  errors: ['Specific validation error messages'],
  timestamp: '2024-01-01T00:00:00.000Z'
}
```

### Service Errors (500)

Returned when:
- OpenAI API call fails
- Unexpected errors during processing

Response format:
```typescript
{
  status: 'error',
  statusCode: 500,
  message: 'Failed to generate response',
  timestamp: '2024-01-01T00:00:00.000Z'
}
```

Error handling strategy:
- All errors caught by controller and passed to Express error middleware
- Sensitive error details logged but not exposed to client
- Generic error messages for production
- Detailed errors in development mode

## Testing Strategy

### Unit Testing

Unit tests will cover:
- Validation logic for each parameter type
- Mock response generation with different models
- Error handling for various failure scenarios
- Response formatting and structure

Testing framework: Jest (already configured in project)

### Property-Based Testing

Property-based tests will verify the correctness properties defined above using random input generation. The tests will use `fast-check` library for TypeScript property-based testing.

Configuration:
- Minimum 100 iterations per property test
- Each property test tagged with format: `**Feature: ai-prompt-playground, Property {number}: {property_text}**`
- Each correctness property implemented as a single property-based test

Property test coverage:
- Property 1-3: Input validation properties
- Property 4-7: Response structure and consistency properties
- Property 8: Mock fallback behavior
- Property 9-10: Error handling properties
- Property 11: Configuration validation

### Integration Testing

Integration tests will verify:
- End-to-end request/response flow
- OpenAI API integration (when credentials available)
- Mock service integration
- Error middleware integration

Testing approach:
- Use supertest for HTTP endpoint testing
- Test both OpenAI and mock modes
- Verify response formats match specification
- Test error scenarios

## Implementation Notes

### OpenAI SDK

Use the official `openai` npm package:
```bash
npm install openai
```

For streaming, use the OpenAI streaming API:
```typescript
const stream = await openai.chat.completions.create({
  model: model,
  messages: [{ role: 'user', content: prompt }],
  temperature: temperature,
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  if (content) {
    onChunk(content);
  }
}
```

### Mock Response Strategy

Mock responses should:
- Include the original prompt in the response for context
- Vary response length/style based on model (e.g., gpt-4 responses slightly longer)
- Incorporate temperature in response (higher temp = more varied responses)
- Be deterministic for testing purposes

For streaming mocks:
- Split the mock response into words or chunks
- Send each chunk with a small delay (e.g., 50-100ms) to simulate real streaming
- Use `setTimeout` or `setInterval` to create artificial delays
```typescript
const words = mockResponse.split(' ');
for (const word of words) {
  await new Promise(resolve => setTimeout(resolve, 50));
  onChunk(word + ' ');
}
```

### Environment Detection

```typescript
const useOpenAI = !!process.env.OPENAI_API_KEY;
```

### Route Integration

Add to existing routes index:
```typescript
import aiRoutes from './ai.routes';
router.use('/ai', aiRoutes);
```

This makes the endpoints accessible at:
- Standard: `/api/v1/ai/generate`
- Streaming: `/api/v1/ai/generate/stream`

### SSE Implementation in Express

For the streaming endpoint, set appropriate headers and use `res.write()`:
```typescript
export const generateStream = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Send chunk helper
    const sendEvent = (event: string, data: any) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };
    
    // Handle streaming
    await generateResponseStream(
      request,
      (chunk) => sendEvent('chunk', { content: chunk }),
      (metadata) => {
        sendEvent('complete', metadata);
        res.end();
      },
      (error) => {
        sendEvent('error', { message: error.message });
        res.end();
      }
    );
  } catch (error) {
    next(error);
  }
};
```
