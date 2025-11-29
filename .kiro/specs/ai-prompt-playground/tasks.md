# Implementation Plan

- [x] 1. Set up dependencies and configuration



  - Install OpenAI SDK package (`npm install openai`)
  - Install fast-check for property-based testing (`npm install --save-dev fast-check @types/fast-check`)
  - Add OPENAI_API_KEY to .env.example file
  - _Requirements: 3.1, 3.2_




- [ ] 2. Create validation utilities
  - Create `src/validators/ai.validator.ts` with validation functions
  - Implement prompt validation (non-empty string check)
  - Implement model validation (check against supported models list)
  - Implement temperature validation (number between 0-1)
  - Export ValidationResult interface and validateGenerateRequest function
  - _Requirements: 1.2, 1.3, 1.4_

- [ ]* 2.1 Write property test for prompt validation
  - **Property 1: Non-empty prompt validation**
  - **Validates: Requirements 1.2**

- [ ]* 2.2 Write property test for model validation
  - **Property 2: Model validation**
  - **Validates: Requirements 1.3**







- [ ]* 2.3 Write property test for temperature validation
  - **Property 3: Temperature bounds validation**
  - **Validates: Requirements 1.4**

- [ ] 3. Implement AI service layer
  - Create `src/services/ai.service.ts`
  - Define GenerateRequest and GenerateResponse interfaces
  - Implement generateResponse function that routes to OpenAI or mock based on API key presence
  - Implement generateResponseStream function for streaming responses with callbacks
  - Implement callOpenAI function for OpenAI API integration
  - Implement callOpenAIStream function for streaming OpenAI responses
  - Implement generateMockResponse function for mock responses
  - Implement generateMockResponseStream function for streaming mock responses with delays
  - Add supported models constant array
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 5.1, 5.4_

- [ ]* 3.1 Write property test for response completeness
  - **Property 4: Response completeness**
  - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

- [ ]* 3.2 Write property test for model consistency
  - **Property 5: Response model consistency**
  - **Validates: Requirements 2.3**

- [ ]* 3.3 Write property test for temperature consistency
  - **Property 6: Response temperature consistency**
  - **Validates: Requirements 2.4**

- [ ]* 3.4 Write property test for timestamp format
  - **Property 7: Timestamp format validity**
  - **Validates: Requirements 2.5**



- [ ]* 3.5 Write property test for mock fallback
  - **Property 8: Mock fallback behavior**
  - **Validates: Requirements 3.2, 3.3**

- [ ]* 3.6 Write unit tests for mock response variations
  - Test that different models produce different mock responses
  - Test that mock responses include prompt context
  - _Requirements: 3.3, 5.5_

- [ ] 4. Create controller layer
  - Create `src/controllers/ai.controller.ts`
  - Implement generate controller function for standard responses
  - Implement generateStream controller function for SSE streaming
  - Extract request parameters (prompt, model, temperature)
  - Call validation utilities
  - Handle validation errors with 400 status
  - Call service layer for generation (standard and streaming)
  - Set appropriate headers for SSE (Content-Type: text/event-stream, Cache-Control, Connection)
  - Implement SSE event sending helper (chunk, complete, error events)
  - Format success responses using ResponseHandler (standard) or SSE events (streaming)
  - Handle service errors with 500 status
  - Pass errors to Express error middleware
  - _Requirements: 1.1, 1.5, 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ]* 4.1 Write property test for validation error status codes
  - **Property 9: Error status code correctness**


  - **Validates: Requirements 4.1**

- [ ]* 4.2 Write property test for service error handling
  - **Property 10: Service error handling**
  - **Validates: Requirements 4.2, 4.3**

- [ ]* 4.3 Write unit tests for controller error handling
  - Test missing parameters return 400
  - Test service errors return 500
  - Test error responses don't expose sensitive details
  - _Requirements: 4.1, 4.2, 4.5_

- [ ] 5. Set up routing

  - Create `src/routes/ai.routes.ts`
  - Define POST /generate route for standard responses
  - Define POST /generate/stream route for SSE streaming
  - Connect routes to appropriate controller functions
  - Update `src/routes/index.ts` to include AI routes under /ai path
  - _Requirements: 1.1_

- [ ]* 5.1 Write property test for model support minimum
  - **Property 11: Model support minimum**
  - **Validates: Requirements 5.1**

- [ ]* 5.2 Write integration tests for both endpoints
  - Test successful generation with valid inputs (standard endpoint)
  - Test successful streaming with valid inputs (streaming endpoint)
  - Test SSE event format (chunk, complete, error events)
  - Test with OpenAI API (if key available)
  - Test with mock service (no API key)
  - Test various validation failures
  - Test response format matches specification
  - _Requirements: 1.1, 2.1, 3.1, 3.2_

- [ ] 6. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
