import { useEffect, useRef, useState } from "react";
import { UPLOAD_API_URL } from "../api/client";
import type {
  StreamStatus,
  TranscriptionSegmentStreamDto,
} from "../types/transcription-stream";

interface UseTranscriptionStreamState {
  segments: TranscriptionSegmentStreamDto[];
  fullText: string;
  status: StreamStatus;
}

export function useTranscriptionStream(
  mediaId: string | undefined,
): UseTranscriptionStreamState {
  const [segments, setSegments] = useState<TranscriptionSegmentStreamDto[]>([]);
  const [fullText, setFullText] = useState<string>("");
  const [status, setStatus] = useState<StreamStatus>("idle");
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!mediaId) {
      return;
    }

    const url = `${UPLOAD_API_URL}/media/${mediaId}/stream`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    setStatus("streaming");

    const handleSegment = (event: MessageEvent<string>) => {
      try {
        const parsed: TranscriptionSegmentStreamDto = JSON.parse(event.data);

        setSegments((prev) => [...prev, parsed]);
        setFullText((prev) =>
          prev.length === 0 ? parsed.text : `${prev} ${parsed.text}`,
        );
      } catch {
        setStatus("error");
        eventSource.close();
      }
    };

    const handleCompleted = () => {
      setStatus("completed");
      eventSource.close();
    };

    const handleError = () => {
      setStatus("error");
      eventSource.close();
    };

    eventSource.addEventListener("segment", handleSegment as EventListener);
    eventSource.addEventListener("completed", handleCompleted as EventListener);
    eventSource.onerror = handleError;

    return () => {
      eventSource.removeEventListener(
        "segment",
        handleSegment as EventListener,
      );
      eventSource.removeEventListener(
        "completed",
        handleCompleted as EventListener,
      );
      eventSource.onerror = null;
      eventSource.close();
      eventSourceRef.current = null;
      setSegments([]);
      setFullText("");
      setStatus("idle");
    };
  }, [mediaId]);

  return {
    segments,
    fullText,
    status,
  };
}
