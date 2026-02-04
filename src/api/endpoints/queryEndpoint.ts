import { queryApi } from "../client";
import type { QueryRequest, QueryResponse } from "../types/models";

/**
 * Submits a query to the knowledge base.
 * POST /api/Query
 */
export const query = async (request: QueryRequest): Promise<QueryResponse> => {
  const response = await queryApi.post("/Query", request);
  return response.data;
};
