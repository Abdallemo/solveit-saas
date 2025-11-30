"use client";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { NewuseTask } from "@/contexts/TaskContext";
import FileUploadUi from "@/features/media/components/FileUploadUi";
import { CategoryComps } from "@/features/tasks/components/CategorySelectWrapper";
import { getAllTaskDeadlines } from "@/features/tasks/server/data";
import {
  PartialTaskDraft,
  TaskSchema,
} from "@/features/tasks/server/task-types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDebouncedCallback } from "@/hooks/useAutoDraftSave";
import { useQuery } from "@tanstack/react-query";
import { FileText, Loader2, Wand2 } from "lucide-react";
import { useFormContext } from "react-hook-form";
import TextareaAutosize from "react-textarea-autosize";

export default function NewTaskSidebar({
  isDisabled,
  open,
  setOpen,
  handleSugestions,
  isAutoSeggesting: isPending,
}: {
  isDisabled: boolean;
  open: boolean;
  isAutoSeggesting: boolean;
  setOpen: (value: boolean) => void;
  handleSugestions: () => void;
}) {
  const isMobile = useIsMobile();

  if (isMobile)
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <Button
          type="button"
          size="lg"
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-sidebar hover:bg-background text-foreground cursor-pointer rounded-full shadow-lg"
        >
          <FileText className="w-5 h-5" />
        </Button>
        <SheetContent side="right" className="w-80 sm:w-96">
          <SheetHeader>
            <SheetTitle>Task Details</SheetTitle>
            <Button
              disabled={isPending || isDisabled}
              className="text-xs"
              type="button"
              variant={"outline"}
              onClick={handleSugestions}
            >
              {" "}
              {isPending ? (
                <Loader2 className=" size-4 animate-spin" />
              ) : (
                <Wand2 />
              )}
              Auto Suggest with Ai{" "}
            </Button>
          </SheetHeader>
          <div className="mt-4 overflow-y-auto">
            <SideBarForm isPending={isPending} />
          </div>
        </SheetContent>
      </Sheet>
    );

  return (
    <div className="w-80 border-l bg-muted/20  flex flex-col h-full">
      <div className="p-4 border-b bg-background flex justify-between items-center">
        <h2 className="text-lg">Task Details</h2>
        <Button
          className="text-xs"
          type="button"
          disabled={isPending || isDisabled}
          variant={"outline"}
          onClick={handleSugestions}
        >
          {" "}
          {isPending ? <Loader2 className=" size-4 animate-spin" /> : <Wand2 />}
          Auto Suggest with Ai{" "}
        </Button>
      </div>
      <SideBarForm isPending={isPending} />
    </div>
  );
}

function SideBarForm({ isPending }: { isPending: boolean }) {
  const {
    draft: { title, description },
    updateDraft,
  } = NewuseTask(); //m Mirating to
  const { data: fetchedDeadlines, isPending: isLoading } = useQuery({
    queryKey: ["deadline"],
    queryFn: async () => await getAllTaskDeadlines(),
  });
  const form = useFormContext<TaskSchema>();

  const debouncedUpdateDraft = useDebouncedCallback(
    (updates: PartialTaskDraft) => {
      updateDraft(updates);
    },
    200,
    [updateDraft],
  );

  return (
    <div className="px-5 py-3 mb-3 flex flex-col gap-2 overflow-x-auto">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <div className="relative ">
                <TextareaAutosize
                  disabled={isPending}
                  minRows={1}
                  maxRows={2}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Task Title"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    debouncedUpdateDraft({ title: e.target.value });
                  }}
                />
                {isPending && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin" />
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <div className="relative">
                <TextareaAutosize
                  disabled={isPending}
                  minRows={1}
                  maxRows={2}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Task Description"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    debouncedUpdateDraft({ description: e.target.value });
                  }}
                />
                {isPending && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin" />
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        name="deadline"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Deadline</FormLabel>
            <Select
              value={field.value}
              disabled={isLoading}
              onValueChange={(val) => {
                field.onChange(val);
                debouncedUpdateDraft({ deadline: val });
              }}
            >
              <FormControl>
                <SelectTrigger className=" w-full">
                  <SelectValue placeholder="Select task deadline" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  {isLoading && <Loader2 className="animate-spin" />}
                  {fetchedDeadlines?.map((de) => (
                    <SelectItem
                      key={de.id}
                      value={de.deadline}
                      className="text-white"
                    >
                      {de.deadline}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="visibility"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Visibility</FormLabel>
            <Select
              value={field.value}
              onValueChange={(val) => {
                field.onChange(val);
                debouncedUpdateDraft({
                  visibility: val as "public" | "private",
                });
              }}
            >
              <FormControl>
                <SelectTrigger className=" w-full">
                  <SelectValue placeholder="Choose task visibility" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <FormControl>
              <div className="relative">
                <CategoryComps
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                    debouncedUpdateDraft({ category: val });
                  }}
                  isPending={isPending}
                />
                {isPending && (
                  <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 size-4 animate-spin" />
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  disabled={isPending}
                  type="number"
                  min={10}
                  placeholder="Enter price"
                  {...field}
                  onChange={(e) => {
                    const price = Number(e.target.value);
                    field.onChange(price);
                    debouncedUpdateDraft({ price });
                  }}
                />
                {isPending && (
                  <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 size-4 animate-spin" />
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />

      <div className="space-y-1 ">
        <div className="flex items-center gap-1 ">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <Label>Attachments</Label>
        </div>
        <FileUploadUi />
      </div>
    </div>
  );
}
