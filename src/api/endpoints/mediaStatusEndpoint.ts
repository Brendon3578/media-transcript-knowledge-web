import { type MediaStatusResponse } from "@/types/media-status";
import { queryApi } from "../client";

export async function getMediaStatus(
  mediaId: string,
): Promise<MediaStatusResponse> {
  const { data } = await queryApi.get<MediaStatusResponse>(
    `/media/${mediaId}/status`,
  );
  return data;
}
