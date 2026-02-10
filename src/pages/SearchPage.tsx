import { useState, type KeyboardEvent } from "react";
import { useKnowledgeQuery } from "../hooks/useKnowledgeQuery";
import { useTranscribedMedia } from "../hooks/useMedia";
import type { QueryRequest, QuerySource } from "../api/types/models";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { Slider } from "../components/ui/slider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea"; // Need to check if Textarea exists, otherwise use Input or standard textarea
import {
  Loader2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  FileVideo,
  FileAudio,
  RotateCcw,
  X,
  Database,
  Clock,
  ChevronRight,
} from "lucide-react";
import { cn } from "../lib/utils";

export default function SearchPage() {
  // --- State ---
  const [question, setQuestion] = useState("");
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [startSeconds, setStartSeconds] = useState<string>(""); // Use string for input handling
  const [endSeconds, setEndSeconds] = useState<string>("");
  const [topK, setTopK] = useState([10]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // The request object that triggers the query
  const [activeRequest, setActiveRequest] = useState<QueryRequest | null>(null);

  // --- Queries ---
  // Fetch media for filters (page 1, large size to get list)
  const { data: mediaData, isLoading: isMediaLoading } = useTranscribedMedia({
    page: 1,
    pageSize: 100,
  });

  // Main search query
  const {
    data: searchResults,
    isLoading: isSearching,
    isError,
    error,
    refetch,
  } = useKnowledgeQuery(activeRequest || { question: "", topK: 3 }, {
    enabled: !!activeRequest,
    retry: false, // Don't retry automatically on 400/500 for search usually
  });

  // --- Handlers ---
  const handleSearch = () => {
    if (!question.trim()) return;

    const filters = {
      mediaIds: selectedMediaIds.length > 0 ? selectedMediaIds : [],
      startSeconds: startSeconds ? Number(startSeconds) : undefined,
      endSeconds: endSeconds ? Number(endSeconds) : undefined,
    };

    // Clean up filters - remove keys if undefined/empty
    // But our interface expects optional keys, so passing undefined is fine if the object structure matches.
    // However, the prompt says "Only include filters in the query request if they are explicitly set".
    // So if mediaIds is empty, maybe we shouldn't send it? Or send empty array?
    // The interface QueryFilters has mediaIds as string[]. It's not optional in the interface definition provided earlier:
    // export interface QueryFilters { mediaIds: string[]; startSeconds?: number; endSeconds?: number; }
    // So we must pass mediaIds.

    setActiveRequest({
      question: question.trim(),
      filters: {
        mediaIds: selectedMediaIds,
        ...(startSeconds ? { startSeconds: Number(startSeconds) } : {}),
        ...(endSeconds ? { endSeconds: Number(endSeconds) } : {}),
      },
      topK: topK[0],
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    setSelectedMediaIds([]);
    setStartSeconds("");
    setEndSeconds("");
    setTopK([3]);
  };

  const toggleMediaSelection = (id: string) => {
    setSelectedMediaIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // --- Render Helpers ---
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl min-h-screen flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-center gap-3 pb-4 border-b">
        <Database className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Knowledge Base Search
          </h1>
          <p className="text-muted-foreground">
            Semantic search over transcribed media content
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Filters */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent font-semibold text-lg"
                      >
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                        {isFiltersOpen ? (
                          <ChevronUp className="w-4 h-4 ml-2 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 ml-2 text-muted-foreground" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  {/* Clear Filters Button */}
                  {(selectedMediaIds.length > 0 ||
                    startSeconds ||
                    endSeconds ||
                    topK[0] !== 3) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="h-8 px-2 text-xs"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-6 pt-0">
                  {/* Top K Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium">
                        Results (Top K)
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {topK[0]}
                      </span>
                    </div>
                    <Slider
                      value={topK}
                      onValueChange={setTopK}
                      max={25}
                      min={1}
                      step={1}
                    />
                  </div>

                  <Separator />

                  {/* Time Range */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Time Range (s)
                    </label>
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="Start"
                        type="number"
                        value={startSeconds}
                        onChange={(e) => setStartSeconds(e.target.value)}
                        className="h-8 text-sm"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        placeholder="End"
                        type="number"
                        value={endSeconds}
                        onChange={(e) => setEndSeconds(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Media Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Source Media</label>
                    {isMediaLoading ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-2">
                          {mediaData?.items?.map((media) => (
                            <div
                              key={media.mediaId}
                              className="flex items-start space-x-2"
                            >
                              <Checkbox
                                id={media.mediaId}
                                checked={selectedMediaIds.includes(
                                  media.mediaId,
                                )}
                                onCheckedChange={() =>
                                  toggleMediaSelection(media.mediaId)
                                }
                              />
                              <label
                                htmlFor={media.mediaId}
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer pt-0.5 break-all"
                              >
                                {media.fileName || "Untitled Media"}
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {media.model}
                                </div>
                              </label>
                            </div>
                          ))}
                          {!mediaData?.items?.length && (
                            <div className="text-sm text-muted-foreground italic">
                              No media found.
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>

        {/* Right Panel: Search & Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Box */}
          <div className="relative">
            <Textarea
              placeholder="Ask a question about your media content..."
              className="min-h-[100px] text-lg p-4 pr-32 resize-none shadow-sm"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSearching}
            />
            <div className="absolute bottom-4 right-4">
              <Button
                onClick={handleSearch}
                disabled={!question.trim() || isSearching}
                className="gap-2"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search
              </Button>
            </div>
          </div>

          {/* Results Area */}
          <div className="min-h-[400px]">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p>Analyzing transcripts...</p>
              </div>
            ) : isError ? (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="p-3 rounded-full bg-destructive/10 text-destructive">
                    <X className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">Search Failed</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto mt-1">
                      {error instanceof Error
                        ? error.message
                        : "An unexpected error occurred."}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => refetch()}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : searchResults ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Answer Card */}
                <Card className="border-primary/20 shadow-md">
                  <CardHeader className="bg-primary/5 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-primary text-primary-foreground">
                        <Database className="w-4 h-4" />
                      </div>
                      Answer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                      {searchResults.answer ||
                        "No answer could be generated from the context."}
                    </div>
                  </CardContent>
                </Card>

                {/* Sources List */}
                {searchResults.sources && searchResults.sources.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      Sources
                      <Badge variant="secondary" className="rounded-full">
                        {searchResults.sources.length}
                      </Badge>
                    </h3>
                    <div className="grid gap-4">
                      {searchResults.sources.map((source, index) => (
                        <SourceItem
                          key={`${source.mediaId}-${index}`}
                          source={source}
                          formatTime={formatTime}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center h-64 space-y-4 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                <Search className="w-12 h-12 opacity-20" />
                <div className="text-center">
                  <h3 className="font-semibold text-lg text-foreground">
                    Ready to Search
                  </h3>
                  <p className="max-w-sm mx-auto mt-1">
                    Select media from the left and ask a question to get
                    started.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Separate component for Source Item to handle its own collapsible state cleanly
function SourceItem({
  source,
  formatTime,
}: {
  source: QuerySource;
  formatTime: (s: number) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="overflow-hidden border-l-4 border-l-primary/40">
      <div className="p-4 flex items-start gap-4">
        <div className="p-2 bg-secondary rounded-md">
          <FileAudio className="w-5 h-5 text-secondary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-medium truncate text-sm" title={source.mediaId}>
              Media ID: {source.mediaId.substring(0, 8)}...
            </h4>
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-normal",
                source.distance < 0.3
                  ? "bg-green-500/10 text-green-700 border-green-200"
                  : source.distance < 0.5
                    ? "bg-yellow-500/10 text-yellow-700 border-yellow-200"
                    : "bg-red-500/10 text-red-700 border-red-200",
              )}
            >
              Relevance: {((1 - source.distance) * 100).toFixed(0)}%
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded">
              <Clock className="w-3 h-3" />
              {formatTime(source.start)} - {formatTime(source.end)}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      </div>

      {isOpen && (
        <div className="px-4 pb-4 pt-0 animate-in slide-in-from-top-2 duration-200">
          <div className="bg-muted/30 p-3 rounded-md text-sm border">
            <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/80">
              {source.text}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
