import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
} from "axios";
import { z } from "zod";
import type { ProblemDetails } from "./types/models";

/* ---------------------------------- */
/* Environment Validation (Zod) */
/* ---------------------------------- */

const envSchema = z.object({
  VITE_QUERY_API_URL: z.url("VITE_QUERY_API_URL must be a valid URL"),
  VITE_UPLOAD_API_URL: z.url("VITE_UPLOAD_API_URL must be a valid URL"),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  const formatted = parsedEnv.error.issues
    .map((e) => `• ${e.path.join(".")}: ${e.message}`)
    .join("\n");

  throw new Error(
    `Environment variables are not properly configured:\n${formatted}`,
  );
}

const { VITE_QUERY_API_URL, VITE_UPLOAD_API_URL } = parsedEnv.data;

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

function ensureApiSuffix(url: string): string {
  return url.endsWith("/api") ? url : `${url}/api`;
}

export const QUERY_API_URL = ensureApiSuffix(VITE_QUERY_API_URL);
export const UPLOAD_API_URL = ensureApiSuffix(VITE_UPLOAD_API_URL);

/* ---------------------------------- */
/* Axios Factory */
/* ---------------------------------- */

function createApiClient(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  attachProblemInterceptor(instance);

  return instance;
}

export const queryApi = createApiClient(QUERY_API_URL);
export const uploadApi = createApiClient(UPLOAD_API_URL);

/* ---------------------------------- */
/* ProblemDetails Error */
/* ---------------------------------- */

export class ProblemDetailsError extends Error {
  readonly problem: ProblemDetails;
  readonly status?: number;
  readonly title?: string;
  readonly traceId?: string;

  constructor(problem: ProblemDetails) {
    const message =
      problem.detail?.trim() || problem.title || "Unexpected error occurred.";

    super(message);

    this.name = "ProblemDetailsError";
    this.problem = problem;
    this.status = problem.status;
    this.title = problem.title;
    this.traceId = problem.traceId;
  }
}

/* ---------------------------------- */
/* Type Guards */
/* ---------------------------------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isProblemDetails(data: unknown): data is ProblemDetails {
  if (!isRecord(data)) return false;

  return (
    typeof data.title === "string" ||
    typeof data.detail === "string" ||
    typeof data.status === "number"
  );
}

/* ---------------------------------- */
/* Extractor */
/* ---------------------------------- */

function extractProblemDetails(error: AxiosError): ProblemDetails {
  const responseData = error.response?.data;

  if (isProblemDetails(responseData)) {
    const traceId =
      typeof responseData.traceId === "string"
        ? responseData.traceId
        : undefined;

    return {
      type:
        typeof responseData.type === "string" ? responseData.type : undefined,
      title: responseData.title,
      status:
        typeof responseData.status === "number"
          ? responseData.status
          : error.response?.status,
      detail: responseData.detail,
      instance:
        typeof responseData.instance === "string"
          ? responseData.instance
          : undefined,
      traceId,
    };
  }

  return {
    title: error.response?.statusText || "Request failed",
    status: error.response?.status,
    detail: "An unexpected error occurred while processing the request.",
  };
}

/* ---------------------------------- */
/* Interceptor */
/* ---------------------------------- */

function attachProblemInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      if (!error.response) {
        return Promise.reject(
          new ProblemDetailsError({
            title: "Network Error",
            detail: "Unable to reach the server.",
          }),
        );
      }

      const problem = extractProblemDetails(error);
      return Promise.reject(new ProblemDetailsError(problem));
    },
  );
}
