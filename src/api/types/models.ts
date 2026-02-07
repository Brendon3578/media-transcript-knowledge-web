export type UploadMediaResponse = void;

export interface MediaItem {
  id: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  status: number | string;
  durationSeconds?: number;
  createdAt: string;
}

export type GetAllMediaResponse = MediaItem[];

export type MediaStatusResponse =
  | "uploaded"
  | "processing"
  | "transcribed"
  | "failed";

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

export interface QueryFilters {
  mediaIds: string[];
  startSeconds?: number;
  endSeconds?: number;
}

export interface QueryRequest {
  question: string;
  filters?: QueryFilters;
  topK: number;
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
  status?: string | null;
  transcriptionText?: string | null;
  createdAt: string;
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
