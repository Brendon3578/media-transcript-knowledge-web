import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileAudio,
  FileVideo,
  RefreshCw,
  Eye,
  AlertCircle,
  Upload,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { useAllMedia, useRefreshMediaStatus } from "../hooks/useMedia";
import type { MediaItem } from "../api/types/models";
import { formatBytes, formatDuration, formatDate } from "../lib/formatters";

import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";

type badgeVariantClassType =
  | "default"
  | "secondary"
  | "destructive"
  | "outline";

export default function LibraryPage() {
  const {
    data: mediaList,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useAllMedia({
    refetchInterval: 1000 * 60 * 30, // Poll every 30 minutos
  });

  const { mutate: refreshStatus, isPending: isRefreshingStatus } =
    useRefreshMediaStatus();

  // Track which item is currently refreshing to show spinner only for that item
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const handleRefreshStatus = (id: string) => {
    setRefreshingId(id);
    refreshStatus(id, {
      onSettled: () => setRefreshingId(null),
    });
  };

  const handleGlobalRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading library...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load media library</h2>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  if (!mediaList || mediaList.length === 0) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center">
        <div className="rounded-full bg-muted p-6">
          <Upload className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">No media uploaded yet</h2>
          <p className="text-muted-foreground max-w-sm">
            Upload your audio or video files to start processing and
            transcribing content.
          </p>
        </div>
        <Button asChild>
          <Link to="/upload">Upload Media</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground">
            Manage your uploaded media and transcriptions.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGlobalRefresh}
          disabled={isFetching}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mediaList.map((media) => (
          <MediaCard
            key={media.id}
            media={media}
            onRefreshStatus={handleRefreshStatus}
            isRefreshing={refreshingId === media.id}
          />
        ))}
      </div>
    </div>
  );
}

function MediaCard({
  media,
  onRefreshStatus,
  isRefreshing,
}: {
  media: MediaItem;
  onRefreshStatus: (id: string) => void;
  isRefreshing: boolean;
}) {
  const status = String(media.status).toLowerCase();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "uploaded":
        return { label: "Uploaded", variant: "secondary", icon: Upload };
      case "processing":
        return {
          label: "Processing",
          variant: "warning",
          icon: RefreshCw,
          animate: true,
        };
      case "transcribed":
        return { label: "Transcribed", variant: "success", icon: FileAudio }; // "success" might not be a valid variant in shadcn default, use "default" or "outline" + class
      case "completed":
        return { label: "Completed", variant: "default", icon: FileAudio };
      case "failed":
        return { label: "Failed", variant: "destructive", icon: AlertCircle };
      default:
        return { label: status, variant: "outline", icon: FileAudio };
    }
  };

  const config = getStatusConfig(status);
  const StatusIcon = config.icon;

  // Helper to map variant string to Badge props (handling custom ones if needed)

  const getBadgeVariant = (v: string): badgeVariantClassType => {
    if (["default", "secondary", "destructive", "outline"].includes(v))
      return v as badgeVariantClassType;
    return "secondary"; // Fallback
  };

  const isVideo = media.contentType?.startsWith("video");

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 gap-2">
        <div className="p-2 bg-muted rounded-md">
          {isVideo ? (
            <FileVideo className="h-6 w-6 text-blue-500" />
          ) : (
            <FileAudio className="h-6 w-6 text-orange-500" />
          )}
        </div>
        <Badge
          variant={getBadgeVariant(config.variant)}
          className={
            status === "transcribed"
              ? "bg-green-500 hover:bg-green-600 text-white"
              : ""
          }
        >
          {config.animate && (
            <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
          )}
          {!config.animate && <StatusIcon className="mr-1 h-3 w-3" />}
          {config.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2 flex-1">
        <div className="space-y-1">
          <h3 className="font-semibold truncate" title={media.fileName}>
            {media.fileName}
          </h3>
          <p className="text-xs text-muted-foreground font-mono">
            {media.id.substring(0, 8)}...
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground pt-2">
          <div>
            <span className="block text-xs font-medium text-foreground">
              Size
            </span>
            {formatBytes(media.fileSizeBytes || 0)}
          </div>
          <div>
            <span className="block text-xs font-medium text-foreground">
              Duration
            </span>
            {formatDuration(media.durationSeconds || 0)}
          </div>
          <div className="col-span-2">
            <span className="block text-xs font-medium text-foreground">
              Uploaded
            </span>
            {formatDate(media.createdAt)}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex w-full gap-2">
          {(status === "uploaded" || status === "processing") && (
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={() => onRefreshStatus(media.id)}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Check Status
            </Button>
          )}

          {(status === "transcribed" || status === "completed") && (
            <Button variant="default" className="w-full" size="sm" asChild>
              <Link to={`/media/${media.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </Button>
          )}

          {status === "failed" && (
            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive"
              size="sm"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
