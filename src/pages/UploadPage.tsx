import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  X,
  FileAudio,
  FileVideo,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUploadMedia } from "@/hooks/useMedia";
import { cn } from "@/lib/utils";

// Types
type FileStatus = "idle" | "uploading" | "success" | "error";

interface FileWithStatus {
  id: string;
  file: File;
  status: FileStatus;
  error?: string;
}

const TRANSCRIPTION_MODELS = [
  { value: "whisper-small", label: "Whisper Small" },
  { value: "whisper-medium", label: "Whisper Medium" },
  { value: "whisper-large", label: "Whisper Large" },
];

export default function UploadPage() {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [model, setModel] = useState<string>("whisper-small");
  const uploadMutation = useUploadMedia();

  // Helper to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Helper to get file icon
  const getFileIcon = (file: File) => {
    if (file.type.startsWith("video/")) {
      return <FileVideo className="h-8 w-8 text-blue-500" />;
    }
    return <FileAudio className="h-8 w-8 text-orange-500" />;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => {
      const newFiles = acceptedFiles.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}`,
        file,
        status: "idle" as FileStatus,
      }));
      return [...prev, ...newFiles];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [],
      "video/*": [],
    },
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFile = async (fileItem: FileWithStatus) => {
    if (fileItem.status === "uploading" || fileItem.status === "success")
      return;

    // Update status to uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileItem.id
          ? { ...f, status: "uploading", error: undefined }
          : f,
      ),
    );

    try {
      await uploadMutation.mutateAsync({
        file: fileItem.file,
        model,
      });

      // Update status to success
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, status: "success" } : f,
        ),
      );
      toast.success(`Uploaded ${fileItem.file.name}`);
    } catch (error) {
      console.error("Upload error:", error);
      // Update status to error
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? {
                ...f,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : f,
        ),
      );
      toast.error(`Failed to upload ${fileItem.file.name}`);
    }
  };

  const uploadAll = async () => {
    const idleFiles = files.filter((f) => f.status === "idle");
    if (idleFiles.length === 0) return;

    // Execute sequentially
    for (const fileItem of idleFiles) {
      await uploadFile(fileItem);
    }
  };

  const hasIdleFiles = files.some((f) => f.status === "idle");

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Media</h1>
        <p className="text-muted-foreground mt-2">
          Upload audio or video files for transcription.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Configuration Section */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Select the transcription model to be used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full max-w-xs">
              <label className="text-sm font-medium mb-2 block">
                Transcription Model
              </label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSCRIPTION_MODELS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Dropzone Section */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="p-4 rounded-full bg-background border shadow-sm">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-medium">
                {isDragActive ? "Drop files here" : "Drag & drop files here"}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to select audio/video files
              </p>
            </div>
          </div>
        </div>

        {/* File List Section */}
        {files.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Selected Files</CardTitle>
                <CardDescription>
                  {files.length} file{files.length !== 1 && "s"} selected
                </CardDescription>
              </div>
              {hasIdleFiles && (
                <Button onClick={uploadAll} disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Upload All
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid gap-4">
              {files.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    {getFileIcon(item.file)}
                    <div className="grid gap-1 truncate">
                      <p className="font-medium truncate">{item.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(item.file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Status Indicators */}
                    {item.status === "uploading" && (
                      <Badge variant="secondary" className="gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Uploading
                      </Badge>
                    )}
                    {item.status === "success" && (
                      <Badge
                        variant="default"
                        className="bg-green-500 hover:bg-green-600 gap-1"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Success
                      </Badge>
                    )}
                    {item.status === "error" && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Error
                      </Badge>
                    )}
                    {item.status === "idle" && (
                      <Badge variant="outline">Idle</Badge>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {item.status === "idle" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => uploadFile(item)}
                          disabled={uploadMutation.isPending}
                          title="Upload this file"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      )}

                      {item.status !== "uploading" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(item.id)}
                          className="text-muted-foreground hover:text-destructive"
                          title="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Error Message Display */}
                  {item.status === "error" && item.error && (
                    <div className="absolute bottom-1 right-4 text-[10px] text-destructive">
                      {item.error}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
