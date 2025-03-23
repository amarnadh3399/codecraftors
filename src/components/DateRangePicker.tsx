
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  className?: string;
  onChange?: (date: DateRange | undefined) => void;
  // Add the new props
  from?: Date;
  to?: Date;
  onUpdate?: (values: { from: Date; to: Date }) => void;
}

export function DateRangePicker({ className, onChange, from, to, onUpdate }: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from: from || new Date(2023, 9, 1), // Oct 1, 2023
    to: to || new Date(2023, 9, 31),    // Oct 31, 2023
  });

  // Update internal state when props change
  useEffect(() => {
    if (from && to) {
      setDate({ from, to });
    }
  }, [from, to]);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    
    if (onChange) {
      onChange(range);
    }
    
    if (onUpdate && range?.from && range?.to) {
      onUpdate({ from: range.from, to: range.to });
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
