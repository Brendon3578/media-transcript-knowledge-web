---
name: "create-react-query-hook"
description: "Generates standardized React hooks using React Query for API entities. Invoke when user wants to create data-fetching hooks, manage API entities, or asks for 'use<Entity>' hooks."
---

# React Query Hook Generator

## Role

You are a senior frontend engineer AI working on a React + TypeScript application that consumes a backend API for a media transcription and RAG system.

## Goal

Create a standardized React hook for a specific API entity.
Each hook must be created under `src/hooks` and follow the naming convention `use<EntityName>` (e.g. `useMedia`, `useTranscription`).

## Technical Constraints

- Use **React + TypeScript**
- Use **@tanstack/react-query** as the data-fetching and caching layer
- Hooks must be **composable, reusable, and isolated** from UI concerns
- HTTP client can be assumed to be a preconfigured `api` instance (Axios or fetch wrapper) imported from `src/lib/api` or `src/api/client` (check existing codebase).

## Hook Responsibilities

For each entity, the hook should:

1. **Encapsulate all API interactions** related to that entity.
2. **Expose**:
   - Queries (`useQuery`) for read operations (e.g. list, get by id).
   - Mutations (`useMutation`) for write operations (create, update, delete when applicable).
3. **Handle**:
   - Query keys standardization.
   - Cache invalidation and refetching strategies (using `queryClient.invalidateQueries`).
   - Loading and error states via React Query.

## Example (Media Entity)

When generating `useMedia`, the hook should include:

- `getAllMedia` → list all uploaded media
- `getMediaById` → fetch media details by id
- `uploadMedia` → mutation for uploading a new media file

## Project Structure Requirements

```
src/
├── hooks/
│   └── useMedia.ts
├── services/
│   └── media.service.ts (optional abstraction for API calls)
└── lib/
    └── react-query.ts (QueryClient setup)
```

## Best Practices to Follow

- **Strong typing** with TypeScript interfaces / DTOs.
- **Clear and consistent query keys** (e.g. `['media']`, `['media', id]`).
- **Do not mix UI logic** with data-fetching logic.
- **Prefer small, explicit functions** over generic abstractions.

## Implementation Steps

1. **Analyze Requirements**: Identify the entity name and required operations (CRUD).
2. **Check Existing Code**: Look for existing types, services, or similar hooks to maintain consistency.
3. **Create/Update Service (Optional)**: If the project uses a service layer, create `src/services/<entity>.service.ts` with async functions calling the API.
4. **Create Hook**: Create `src/hooks/use<Entity>.ts`.
   - Define Query Keys constant.
   - Implement `use<Entity>Query` (or named specific queries).
   - Implement mutations with `onSuccess` invalidation.
   - Export a composed hook or individual hooks as appropriate for the project style.
5. **Review**: Ensure types are correct and React Query best practices are followed.

## Output

Generate the full implementation of the hook file (e.g. `useMedia.ts`) and, if necessary, the corresponding service file used to communicate with the backend API.
