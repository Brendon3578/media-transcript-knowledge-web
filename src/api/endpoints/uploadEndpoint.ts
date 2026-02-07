import { uploadApi } from "../client";
import type {
  UploadMediaRequest,
  TranscribedMediaDtoPagedResponseDto,
  GetTranscribedMediaRequest,
  MediaStatusResponse,
  GetAllMediaResponse,
} from "../types/models";

/**
 * Uploads a media file.
 * POST /api/Upload
 */
export const uploadMedia = async ({
  file,
  model,
}: UploadMediaRequest): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await uploadApi.post("/Upload", formData, {
    params: { model },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * Gets the status of an upload.
 * GET /api/Upload/{id}/status
 */
export const getUploadStatus = async (
  id: string,
): Promise<MediaStatusResponse> => {
  const response = await uploadApi.get(`/Upload/${id}/status`);
  return response.data;
};

/**
 * Gets all media.
 */
export const getAllMedia = async (): Promise<GetAllMediaResponse> => {
  const response = await uploadApi.get("/Upload/GetAllMedia");
  return response.data;
};

/**
 * Gets transcribed media with pagination.
 * GET /api/Upload/transcribed
 */
export const getTranscribedMedia = async (
  params: GetTranscribedMediaRequest,
): Promise<TranscribedMediaDtoPagedResponseDto> => {
  const response = await uploadApi.get("/Upload/transcribed", {
    params,
  });

  return response.data;
};
