import { useParams, Link } from "react-router-dom";
import {
  FileAudio,
  FileVideo,
  ArrowLeft,
  Calendar,
  Clock,
  RefreshCw,
  AlertCircle,
  FileText,
  Sparkles,
} from "lucide-react";
import { useTranscribedMediaById } from "../hooks/useMedia";
import { formatDuration, formatDate } from "../lib/formatters";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { ScrollArea } from "../components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

export default function MediaPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: media,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useTranscribedMediaById(id!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading media details...</p>
        </div>
      </div>
    );
  }

  if (isError || !media) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/library">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load media details. The media might not exist or the
            server is unreachable.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const isProcessing =
    media.status?.toLowerCase() === "processing" ||
    media.status?.toLowerCase() === "uploaded";
  const isFailed = media.status?.toLowerCase() === "failed";
  const isCompleted =
    media.status?.toLowerCase() === "completed" ||
    media.status?.toLowerCase() === "transcribed";

  const isVideo = media.mediaType?.toLowerCase().includes("video");

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link to="/library">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Metadata Card */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Status
              </span>
              <div>
                <Badge
                  variant={
                    isCompleted
                      ? "default" // success-like if available, or just default
                      : isProcessing
                        ? "secondary" // warning-like
                        : isFailed
                          ? "destructive"
                          : "outline"
                  }
                  className={
                    isCompleted
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : isProcessing
                        ? "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 border-yellow-200"
                        : ""
                  }
                >
                  {media.status}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Type
              </span>
              <div className="flex items-center gap-2">
                {isVideo ? (
                  <FileVideo className="h-4 w-4" />
                ) : (
                  <FileAudio className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {media.mediaType || "Unknown"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Duration
              </span>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {formatDuration(media.duration)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Uploaded
              </span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {formatDate(media.createdAt || new Date().toISOString())}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transcription Content */}
        <div className="md:col-span-2 space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 pb-1">
                <FileText className="h-6 w-6" />
                <span className="text-xl">Transcription</span>
                <span className="ml-auto flex items-center gap-2 text-muted-foreground font-medium text-sm">
                  <Sparkles className="size-5" />
                  Model whisper {media.model?.toLowerCase()}
                </span>
              </CardTitle>
              <CardDescription className="truncate pb-1">
                {media.fileName}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[400px]">
              {isProcessing && (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4 bg-muted/30 rounded-lg border border-dashed">
                  <RefreshCw className="h-10 w-10 animate-spin text-muted-foreground" />
                  <div className="space-y-1">
                    <h3 className="font-semibold">Processing Media</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Your media is currently being transcribed. This may take a
                      few minutes depending on the file duration.
                    </p>
                  </div>
                </div>
              )}

              {isFailed && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Transcription Failed</AlertTitle>
                  <AlertDescription>
                    We encountered an error while processing this file. Please
                    try re-uploading or check the file format.
                  </AlertDescription>
                </Alert>
              )}

              {isCompleted && !media.transcriptionText && (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-2 bg-muted/30 rounded-lg border border-dashed">
                  <p className="text-muted-foreground">
                    No transcription text available.
                  </p>
                </div>
              )}

              {isCompleted && media.transcriptionText && (
                <ScrollArea className="h-[500px] w-full rounded-md border p-4 bg-muted/10">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap p-1 pb-8 font-mono">
                    {media.transcriptionText}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
