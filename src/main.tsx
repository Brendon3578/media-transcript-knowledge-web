import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ProblemDetailsError } from "./api/client";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof ProblemDetailsError) {
        const message =
          typeof error.message === "string" && error.message.trim().length > 0
            ? error.message
            : "Ocorreu um erro inesperado.";
        toast.error(message);
        return;
      }

      if (error instanceof Error) {
        const message =
          typeof error.message === "string" && error.message.trim().length > 0
            ? error.message
            : "Ocorreu um erro inesperado.";
        toast.error(message);
        return;
      }

      toast.error("Ocorreu um erro inesperado.");
    },
  }),
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ProblemDetailsError) {
          const status = error.problem.status ?? error.status;
          if (typeof status === "number") {
            if (status >= 400 && status < 500) return false;
            if (status >= 500 && status < 600) return failureCount < 2;
          }
        }
        return failureCount < 2;
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
