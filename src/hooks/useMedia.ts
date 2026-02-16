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
  getAllMedia,
  getTranscribedMedia,
  getTranscribedMediaById,
  getTranscriptionMediaStatus,
  getUploadStatus,
} from "../api/endpoints/uploadEndpoint";
import {
  type UploadMediaRequest,
  type GetAllMediaResponse,
  type GetTranscribedMediaRequest,
  type TranscribedMediaDtoPagedResponseDto,
  type TranscribedMediaDto,
  type MediaTranscriptionStatusResponse,
  MediaStatus,
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
  transcribedDetail: (id: string) =>
    [...mediaKeys.all, "transcribed", id] as const,
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

export const useTranscribedMediaById = (
  id: string,
  options?: Omit<
    UseQueryOptions<TranscribedMediaDto, Error>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: mediaKeys.transcribedDetail(id),
    queryFn: () => getTranscribedMediaById(id),
    enabled: !!id,
    ...options,
  });
};

export const useRefreshMediaStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await getUploadStatus(id);
      return { id, status: response.status };
    },
    onSuccess: ({ id, status }) => {
      queryClient.setQueryData(
        mediaKeys.lists(),
        (oldData: GetAllMediaResponse | undefined) => {
          if (!oldData) return oldData;
          return oldData.map((item) =>
            item.id === id ? { ...item, status } : item,
          );
        },
      );
    },
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

export function useTranscriptionMediaStatus(
  mediaId: string,
  onComplete?: () => void,
) {
  return useQuery<MediaTranscriptionStatusResponse>({
    queryKey: ["mediaStatus", mediaId],
    queryFn: () => getTranscriptionMediaStatus(mediaId),
    enabled: !!mediaId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000;

      const isFinished =
        data.status === MediaStatus.Completed ||
        data.status === MediaStatus.Failed;

      if (isFinished && data.status === MediaStatus.Completed) {
        onComplete?.();
      }

      return isFinished ? false : 2000;
    },
    placeholderData: keepPreviousData,
  });
}
