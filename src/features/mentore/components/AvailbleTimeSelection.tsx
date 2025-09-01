import { Label } from "@/components/ui/label";
import { AvailabilitySlot } from "../server/action";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  daysInWeek,
  getValidEndTimes,
  timeOptions,
  ToPascalCase,
} from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type AvailbleTimeSelectionProps = {
  availableTimes: AvailabilitySlot[];
  addAvailabilitySlot: () => void;
  removeAvailabilitySlot: (n: number) => void;
  updateAvailabilitySlot: (
    index: number,
    field: keyof AvailabilitySlot,
    value: string
  ) => void;
};

export default function AvailbleTimeSelection({
  removeAvailabilitySlot,
  updateAvailabilitySlot,
  addAvailabilitySlot,
  availableTimes,
}: AvailbleTimeSelectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Available Times</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addAvailabilitySlot}
          disabled={availableTimes.length >= 7}
          className="h-8 bg-transparent">
          <Plus className="h-3 w-3 mr-1" />
          Add Time Slot
        </Button>
      </div>

      {availableTimes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No availableTimes slots added yet.</p>
          <p className="text-xs">Click "Add Time Slot" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {availableTimes.length >= 7 && (
            <div className="text-center py-2 text-muted-foreground">
              <p className="text-xs">All days of the week have been added.</p>
            </div>
          )}
          {availableTimes.map((slot, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
              <Select
                value={slot.day}
                onValueChange={(value) =>
                  updateAvailabilitySlot(index, "day", value)
                }>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {daysInWeek
                    .filter(
                      (day) =>
                        day === slot.day ||
                        !availableTimes.some(
                          (otherSlot, otherIndex) =>
                            otherIndex !== index && otherSlot.day === day
                        )
                    )
                    .map((day) => (
                      <SelectItem key={day} value={day}>
                        {ToPascalCase(day)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select
                value={slot.start}
                onValueChange={(value) =>
                  updateAvailabilitySlot(index, "start", value)
                }>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-muted-foreground">to</span>

              <Select
                value={slot.end}
                onValueChange={(value) =>
                  updateAvailabilitySlot(index, "end", value)
                }>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getValidEndTimes(slot.start).map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeAvailabilitySlot(index)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {availableTimes.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Current Availability:
          </Label>
          <div className="flex flex-wrap gap-2">
            {availableTimes.map((slot, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {ToPascalCase(slot.day)} {slot.start}-{slot.end}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Set your available time slots for mentoring sessions
      </p>
    </div>
  );
}
