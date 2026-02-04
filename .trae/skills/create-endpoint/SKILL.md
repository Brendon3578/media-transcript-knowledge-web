---
name: "create-endpoint"
description: "Generates frontend API endpoints adhering to strict project standards. Invoke when user wants to create, add, or implement a new API endpoint."
---

# Create Endpoint Skill

This skill ensures all frontend API endpoints are created following the strict project standards.

## When to Use

Use this skill whenever the user asks to:

- Create a new API endpoint
- Add a function to consume an API
- Implement a backend call in the frontend

## Standards & Rules

### 1. Project Structure

- **Location**: All endpoint functions must be in `src/api/endpoints/`.
- **File Organization**: Group by domain (e.g., `media.ts`, `query.ts`).
- **Clients**: Import `uploadApi` or `queryApi` from `src/api/client.ts`.

### 2. Coding Style

- **Language**: TypeScript only.
- **Async/Await**: Mandatory.
- **Return Value**: Always return `response.data`.
- **Error Handling**: **DO NOT** catch errors inside the endpoint function. Let the global handler or caller manage it.
- **Purity**: No business logic or UI logic inside.

### 3. Typing

- **Imports**: Import types from `src/api/types/*`.
- **Strictness**: All request payloads and response bodies must be typed.
- **No Inline Types**: Define interfaces/types in the `types` directory, not inline.

### 4. Axios Usage

- **Upload.Api**: Use `uploadApi`.
- **Query.Api**: Use `queryApi`.
- **Prohibitions**: Never create new Axios instances. Never use `fetch`.

### 5. Function Pattern (Mandatory)

```ts
import { uploadApi | queryApi } from "../client";
import type { RequestDto, ResponseDto } from "../types/...";

export const functionName = async (
  paramsOrPayload: RequestDto
): Promise<ResponseDto> => {
  const response = await uploadApi | queryApi.httpMethod(
    "endpoint",
    paramsOrPayload
  );

  return response.data;
};
```

### 6. Naming Conventions

- Start with a verb: `get`, `create`, `update`, `delete`, `upload`, `query`.
- Descriptive names: `getAllMedia`, `createGroup`.

## Execution Steps

1. **Identify Domain**: Determine which file in `src/api/endpoints/` the endpoint belongs to (or create a new one).
2. **Identify Client**: Decide between `uploadApi` and `queryApi`.
3. **Check Types**: Ensure request/response types exist in `src/api/types/`. If not, create them first.
4. **Implement**: Write the function using the mandatory pattern.
