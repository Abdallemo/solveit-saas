"use client";

import { useEffect, useState } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
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
import { catagoryType, getAllTaskCatagories } from "../server/action";
import { useTask } from "@/contexts/TaskContext";

interface ExampleComboboxProps {
  value: string;
  onChange: (value: string) => void;
  name?: string;
}

export function ExampleCombobox({ value, onChange }: ExampleComboboxProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<catagoryType>([]);
  const {setCategory} = useTask()
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetched = await getAllTaskCatagories();
        setCategories(fetched);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between">
          {value ? categories.find((cat) => cat.name === value)?.name : "Select Category..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0">
        <Command>
          <CommandInput placeholder="Search Category..." />
          <CommandList>
            <CommandEmpty>No Category found.</CommandEmpty>
            <CommandGroup>
              {categories.map((cat) => (
                <CommandItem
                  key={cat.id}
                  value={cat.name}
                  onSelect={() => {
                    onChange(cat.name); 
                      setCategory(cat.name);  
                    setOpen(false);
                  }}>
                  <CheckIcon
                    className={cn("mr-2 h-4 w-4", value === cat.name ? "opacity-100" : "opacity-0")}
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
