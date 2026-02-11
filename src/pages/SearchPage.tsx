import { useState, type KeyboardEvent, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSemanticSearch } from "../hooks/useKnowledgeQuery";
import { useTranscribedMedia } from "../hooks/useMedia";
import type { QueryRequest, QuerySource, TimeRange } from "../api/types/models";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Slider } from "../components/ui/slider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import {
  Loader2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  FileAudio,
  RotateCcw,
  X,
  Database,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "../lib/utils";
import { TimeRangeSelector } from "../components/TimeRangeSelector";
import { formatDuration } from "../lib/formatters";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialMediaId = searchParams.get("mediaId");

  // --- State ---
  const [question, setQuestion] = useState("");
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>(
    initialMediaId ? [initialMediaId] : [],
  );
  const [mediaTimeRanges, setMediaTimeRanges] = useState<
    Record<string, { start: number; end: number }>
  >({});
  const [topK, setTopK] = useState([3]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  // The request object that triggers the query
  const [activeRequest, setActiveRequest] = useState<QueryRequest | null>(null);

  // --- Queries ---
  // Fetch media for filters (page 1, large size to get list)
  const { data: mediaData, isLoading: isMediaLoading } = useTranscribedMedia({
    page: 1,
    pageSize: 100,
  });

  // Reset time ranges when selection changes
  useEffect(() => {
    setMediaTimeRanges((prev) => {
      const next = { ...prev };
      // Remove keys that are no longer in selectedMediaIds
      Object.keys(next).forEach((key) => {
        if (!selectedMediaIds.includes(key)) {
          delete next[key];
        }
      });

      return next;
    });
  }, [selectedMediaIds]);

  // Main search query
  const {
    data: searchResults,
    isLoading: isSearching,
    isError,
    error,
    refetch,
  } = useSemanticSearch(activeRequest || { question: "" }, {
    enabled: !!activeRequest,
    retry: false,
  });

  // --- Handlers ---
  const handleSearch = () => {
    if (!question.trim()) return;

    const timeRanges: TimeRange[] = [];

    if (selectedMediaIds.length > 0) {
      selectedMediaIds.forEach((id) => {
        const range = mediaTimeRanges[id];
        if (range) {
          timeRanges.push({
            mediaId: id,
            startSeconds: range.start,
            endSeconds: range.end,
          });
        } else {
          timeRanges.push({ mediaId: id });
        }
      });
    }

    const request: QueryRequest = {
      question: question.trim(),
      topK: topK[0],
    };

    if (timeRanges.length > 0) {
      request.timeRanges = timeRanges;
    }

    console.log(request);

    return;

    setActiveRequest(request);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    setSelectedMediaIds([]);
    setMediaTimeRanges({});
    setTopK([3]);
  };

  const toggleMediaSelection = (id: string) => {
    setSelectedMediaIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleTimeRangeChange = (
    mediaId: string,
    start: number,
    end: number,
  ) => {
    setMediaTimeRanges((prev) => ({
      ...prev,
      [mediaId]: { start, end },
    }));
  };

  // --- Render Helpers ---
  // Helper to format time for display (reusing lib or local)
  const formatTimeDisplay = (seconds: number) => formatDuration(seconds);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Search & Results */}
        <div className="lg:col-span-2 space-y-6">
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
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="pt-2 my-0 text-lg flex items-center gap-2">
                      <div className="p-2 rounded-md bg-primary text-primary-foreground">
                        <Sparkles className="w-5 h-5" />
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
                          formatTime={formatTimeDisplay}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    Ask anything about your media
                  </h3>
                  <p className="mt-2 max-w-md text-center text-muted-foreground">
                    Type a question in natural language to search through your
                    transcribed media content. The AI will find relevant
                    segments and provide an answer with citations.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {[
                      "What were the key decisions made?",
                      "Summarize the main points",
                      "What was said about revenue?",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setQuestion(suggestion)}
                        className="rounded-full border border-border bg-secondary/50 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Panel: Filters */}
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
                    Object.keys(mediaTimeRanges).length > 0 ||
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

                  {/* Media Selection & Time Ranges */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Source Media</label>
                    {isMediaLoading ? (
                      <div className="flex justify-center p-4">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-4">
                          {mediaData?.items?.map((media) => {
                            const isSelected = selectedMediaIds.includes(
                              media.mediaId,
                            );
                            const range = mediaTimeRanges[media.mediaId];

                            return (
                              <div
                                key={media.mediaId}
                                className={cn(
                                  "space-y-2 rounded-lg border p-3 transition-colors",
                                  isSelected
                                    ? "bg-muted/50 border-primary/20"
                                    : "border-transparent hover:bg-muted/30",
                                )}
                              >
                                <div className="flex items-start space-x-2">
                                  <Checkbox
                                    id={media.mediaId}
                                    checked={isSelected}
                                           }
                                  />
                                  <div className="grid gap-1.5 leading-none w-full">
                                    <label
                                      htmlFor={media.mediaId}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer break-all"
                                    >
                                      {media.fileName || "Untitled Media"}
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                      {media.model}
                                    </p>
                                  </div>
                                </div>

                                {/* Per-media Time Range Selector */}
                                {isSelected && (
                                  <div className="pt-2 pl-6 animate-in slide-in-from-top-2 duration-200">
                                    <TimeRangeSelector
                                      duration={media.duration}
                                      startSeconds={range?.start ?? 0}
                                      endSeconds={range?.end ?? media.duration}
                                      onChange={(s, e) =>
                                        handleTimeRangeChange(
                                          media.mediaId,
                                          s,
                                          e,
                                        )
                                      }
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
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
      </div>
    </div>
  );
}

// Separate component for Source Item
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
