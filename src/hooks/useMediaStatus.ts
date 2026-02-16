import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getMediaStatus } from "@/api/endpoints/mediaStatusEndpoint";
import { type MediaStatusResponse } from "@/types/media-status";

export function useMediaStatus(mediaId: string, onComplete?: () => void) {
  return useQuery<MediaStatusResponse>({
    queryKey: ["mediaStatus", mediaId],
    queryFn: () => getMediaStatus(mediaId),
    enabled: !!mediaId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 2000;

      const isFinished =
        data.status === "Completed" || data.status === "Failed";

      if (isFinished && data.status === "Completed") {
        onComplete?.();
      }

      return isFinished ? false : 2000;
    },
    placeholderData: keepPreviousData,
  });
}
