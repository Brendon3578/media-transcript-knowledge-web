import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  uploadMedia,
  getUploadStatus,
  getAllMedia,
  getTranscribedMedia,
} from "../api/endpoints/uploadEndpoint";
import type {
  UploadMediaRequest,
  MediaStatusResponse,
  GetAllMediaResponse,
  GetTranscribedMediaRequest,
  TranscribedMediaDtoPagedResponseDto,
} from "../api/types/models";

export const mediaKeys = {
  all: ["media"] as const,
  lists: () => [...mediaKeys.all, "list"] as const,
  list: (filters: string) => [...mediaKeys.lists(), { filters }] as const,
  details: () => [...mediaKeys.all, "detail"] as const,
  detail: (id: string) => [...mediaKeys.details(), id] as const,
  status: (id: string) => [...mediaKeys.detail(id), "status"] as const,
  transcribed: (params: GetTranscribedMediaRequest) =>
    [...mediaKeys.all, "transcribed", params] as const,
};

export const useUploadMedia = (
  options?: UseMutationOptions<void, Error, UploadMediaRequest>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadMedia,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["media", "transcribed"] });
      options?.onSuccess?.(...args);
    },
    ...options,
  });
};

export const useUploadStatus = (
  id: string,
  options?: Omit<
    UseQueryOptions<MediaStatusResponse, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: mediaKeys.status(id),
    queryFn: () => getUploadStatus(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data === "transcribed" || data === "failed") {
        return false;
      }
      return 1000;
    },
    ...options,
  });
};

export const useAllMedia = (
  options?: Omit<
    UseQueryOptions<GetAllMediaResponse, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: mediaKeys.lists(),
    queryFn: getAllMedia,
    ...options,
  });
};

export const useTranscribedMedia = (
  params: GetTranscribedMediaRequest,
  options?: Omit<
    UseQueryOptions<TranscribedMediaDtoPagedResponseDto, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: mediaKeys.transcribed(params),
    queryFn: () => getTranscribedMedia(params),
    placeholderData: keepPreviousData,
    ...options,
  });
};
