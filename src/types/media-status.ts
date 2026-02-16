export type MediaProcessingStatus =
  | "Uploaded"
  | "Transcribing"
  | "TranscriptionCompleted"
  | "Embedding"
  | "Completed"
  | "Failed"
  | string;

export interface MediaStatusResponse {
  mediaId: string;
  status: MediaProcessingStatus | null;
  transcriptionProgress: number;
  embeddingProgress: number;
}
