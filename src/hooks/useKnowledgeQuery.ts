import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { query } from "../api/endpoints/queryEndpoint";
import type { QueryRequest, QueryResponse } from "../api/types/models";

export const knowledgeKeys = {
  all: ["knowledge"] as const,
  search: (request: QueryRequest) =>
    [...knowledgeKeys.all, "search", request] as const,
};

export const useSemanticSearch = (
  request: QueryRequest,
  options?: Omit<UseQueryOptions<QueryResponse, Error>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: knowledgeKeys.search(request),
    queryFn: () => query(request),
    enabled: !!request.question && (options?.enabled ?? true),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    ...options,
  });
};
