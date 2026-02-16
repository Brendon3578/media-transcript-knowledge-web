import React from "react";
import { useMediaStatus } from "@/hooks/useMediaStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaProcessingStatusCardProps {
  mediaId: string;
  onComplete?: () => void;
}

export const MediaProcessingStatusCard: React.FC<
  MediaProcessingStatusCardProps
> = ({ mediaId, onComplete }) => {
  const { data, isLoading, isError, isFetching } = useMediaStatus(
    mediaId,
    onComplete,
  );

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading status...
          </span>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="w-full border-destructive/50">
        <CardContent className="flex items-center justify-center p-6 text-destructive">
          <AlertCircle className="h-6 w-6" />
          <span className="ml-2 text-sm font-medium">
            Failed to load media status
          </span>
        </CardContent>
      </Card>
    );
  }

  const { status, transcriptionProgress, embeddingProgress } = data;

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Failed":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "Uploaded":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  const isCompleted = status === "Completed";
  const isFailed = status === "Failed";

  // UI Logic mapping
  let displayTranscriptionProgress = transcriptionProgress;
  let displayEmbeddingProgress = embeddingProgress;

  if (status === "Uploaded") {
    displayTranscriptionProgress = 0;
    displayEmbeddingProgress = 0;
  } else if (status === "Transcribing") {
    displayEmbeddingProgress = 0;
  } else if (status === "TranscriptionCompleted") {
    displayTranscriptionProgress = 100;
    displayEmbeddingProgress = 0;
  } else if (status === "Embedding") {
    displayTranscriptionProgress = 100;
  } else if (status === "Completed") {
    displayTranscriptionProgress = 100;
    displayEmbeddingProgress = 100;
  }

  return (
    <Card className="w-full overflow-hidden transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            Processing Status
            {isFetching && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </CardTitle>
          <Badge
            variant="outline"
            className={cn("capitalize", getStatusColor(status))}
          >
            {status || "Unknown"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transcription Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <div className="flex items-center gap-2">
              <FileAudio className="h-4 w-4 text-muted-foreground" />
              <span>Transcription</span>
            </div>
            <span>{Math.round(displayTranscriptionProgress)}%</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 ease-out",
                isFailed ? "bg-destructive" : "bg-primary",
              )}
              style={{ width: `${displayTranscriptionProgress}%` }}
            />
          </div>
        </div>

        {/* Embedding Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span>Embedding</span>
            </div>
            <span>{Math.round(displayEmbeddingProgress)}%</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 ease-out",
                isFailed ? "bg-destructive" : "bg-primary",
              )}
              style={{ width: `${displayEmbeddingProgress}%` }}
            />
          </div>
        </div>

        {isCompleted && (
          <div className="flex items-center gap-2 text-sm text-green-500 font-medium pt-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Processing completed successfully</span>
          </div>
        )}

        {isFailed && (
          <div className="flex items-center gap-2 text-sm text-destructive font-medium pt-2">
            <AlertCircle className="h-4 w-4" />
            <span>Processing failed. Please try again.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
