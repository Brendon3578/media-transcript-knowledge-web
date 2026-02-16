export type UploadMediaResponse = void;

export const MediaStatus = {
  Uploaded: "Uploaded",
  TranscriptionProcessing: "TranscriptionProcessing",
  TranscriptionCompleted: "TranscriptionCompleted",
  EmbeddingProcessing: "EmbeddingProcessing",
  Completed: "Completed",
  Failed: "Failed",
} as const;

export type MediaStatusType = (typeof MediaStatus)[keyof typeof MediaStatus];

export interface MediaItem {
  id: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  status: MediaStatusType;
  durationSeconds?: number;
  createdAt: string;
}

export type GetAllMediaResponse = MediaItem[];

export interface MediaStatusResponse {
  mediaId: string;
  fileName: string;
  status: MediaStatusType;
  uploadedAt: string;
  updatedAt: string;
  model: string;
}

export interface TranscribedMediaItem {
  id: string;
  fileName: string;
  createdAt: string;
}

export interface PaginatedTranscribedMediaResponse {
  items: TranscribedMediaItem[];
  page: number;
  pageSize: number;
  totalItems: number;
}

export interface TimeRange {
  mediaId: string;
  startSeconds?: number;
  endSeconds?: number;
}

export interface QueryRequest {
  question: string;
  timeRanges?: TimeRange[];
  topK?: number;
  maxDistance?: number;
  modelName?: string;
}

export interface QuerySource {
  mediaId: string;
  start: number;
  end: number;
  text: string;
  distance: number;
}

export interface QueryResponse {
  answer: string;
  sources?: QuerySource[];
}

// New Types from Swagger
export interface TranscribedMediaDto {
  mediaId: string;
  fileName?: string | null;
  mediaType?: string | null;
  duration: number;
  status?: MediaStatusType | null;
  transcriptionText?: string | null;
  createdAt?: string | null;
  model: string;
}

export interface TranscribedMediaDtoPagedResponseDto {
  page: number;
  pageSize: number;
  total: number;
  items?: TranscribedMediaDto[] | null;
}

export interface UploadMediaRequest {
  model?: string;
  file: File;
}

export interface GetTranscribedMediaRequest {
  page?: number;
  pageSize?: number;
}

export interface MediaTranscriptionStatusResponse {
  mediaId: string;
  status: MediaStatusType | null;
  transcriptionProgress: number;
  embeddingProgress: number;
}
