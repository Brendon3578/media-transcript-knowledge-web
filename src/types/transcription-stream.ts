export interface TranscriptionSegmentStreamDto {
  mediaId: string;
  index: number;
  startSeconds: number;
  endSeconds: number;
  text: string;
}

export type StreamStatus = "idle" | "streaming" | "completed" | "error";

