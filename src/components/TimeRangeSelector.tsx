import { Slider } from "./ui/slider";
import { formatDuration } from "../lib/formatters";

interface TimeRangeSelectorProps {
  duration: number;
  startSeconds: number;
  endSeconds: number;
  onChange: (start: number, end: number) => void;
}

export function TimeRangeSelector({
  duration,
  startSeconds,
  endSeconds,
  onChange,
}: TimeRangeSelectorProps) {
  const handleValueChange = (values: number[]) => {
    if (values.length === 2) {
      onChange(values[0], values[1]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Time Range</label>
        <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
          {formatDuration(startSeconds)} - {formatDuration(endSeconds)}
        </span>
      </div>
      <Slider
        min={0}
        max={duration}
        step={1}
        minStepsBetweenThumbs={1} // Ensure thumbs don't overlap too much
        value={[startSeconds, endSeconds]}
        onValueChange={handleValueChange}
        className="py-2"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>00:00</span>
        <span>{formatDuration(duration)}</span>
      </div>
    </div>
  );
}
