"use client";

import { CheckIcon, ChevronsUpDownIcon, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewuseTask } from "@/contexts/TaskContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getAllTaskCatagories } from "../server/data";

interface CategoryCompsProps {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  isPending: boolean;
}

export function CategoryComps({
  value,
  onChange,
  isPending: isLoading,
}: CategoryCompsProps) {
  const [open, setOpen] = useState(false);
  // const { setCategory } = useTask(); // migrated from
  const { updateDraft } = NewuseTask(); //Migrated to
  const isMobile = useIsMobile();

  const { data: fetchedCategories, isPending } = useQuery({
    queryKey: ["category"],
    queryFn: async () => await getAllTaskCatagories(),
  });
  if (isMobile)
    return (
      <Select
        disabled={isPending || isLoading}
        value={value}
        onValueChange={(v) => {
          onChange(v);
          updateDraft({ category: v });
        }}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent className="w-full">
          <SelectGroup>
            {fetchedCategories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={isPending || isLoading}
          variant="outline"
          role="combobox"
          className="w-full justify-between">
          {value
            ? fetchedCategories?.find((cat) => cat.name === value)?.name
            : "Select Category..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0 z">
        <Command>
          <CommandInput placeholder="Search Category..." />
          <CommandList>
            <CommandEmpty>No Category found.</CommandEmpty>
            <CommandGroup>
              {isPending && <Loader2 className="animate-spin" />}
              {fetchedCategories?.map((cat) => (
                <CommandItem
                  key={cat.id}
                  value={cat.name}
                  onSelect={() => {
                    onChange(cat.name);
                    updateDraft({ category: cat.name });
                    setOpen(false);
                  }}>
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === cat.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {cat.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
