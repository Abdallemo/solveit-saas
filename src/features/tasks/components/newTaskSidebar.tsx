"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileText, Calendar, Eye, Tag, DollarSign } from "lucide-react";
import FileUploadUi from "@/features/media/components/FileUploadUi";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExampleCombobox } from "./CategorySelectWrapper";
import { useTask } from "@/contexts/TaskContext";
import useCurrentUser from "@/hooks/useCurrentUser";
import { autoSaveDraftTask } from "../server/action";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import TextareaAutosize from "react-textarea-autosize";
import { useFormContext } from "react-hook-form";
import { TaskSchema } from "@/features/tasks/server/task-types";

export default function NewTaskSidebar() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile)
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="">
          <Button
            variant="outline"
            size="sm"
            className="w-20 h-8 sticky shadow-md bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-transform">
            Task Details
            <span className="sr-only">Task Details</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 sm:w-96">
          <SheetHeader>
            <SheetTitle>Task Details</SheetTitle>
          </SheetHeader>
          <div className="mt-4 overflow-y-auto">
            <SideBarForm />
          </div>
        </SheetContent>
      </Sheet>
    );

  return (
    <div className="w-80 border-l bg-muted/20 overflow-hidden flex flex-col">
      <div className="p-4 border-b bg-background">
        <h2 className="font-medium">Task Details</h2>
      </div>
      <SideBarForm />
    </div>
  );
}

function SideBarForm() {
  const { user } = useCurrentUser();
  const {
    title,
    description,
    category,
    deadline,
    price,
    visibility,
    content,
    setTitle,
    setDescription,
    setPrice,
    setVisibility,
    setDeadline,
  } = useTask();

  useEffect(() => {
    async function autoDraftSave() {
      await autoSaveDraftTask(
        title,
        description,
        content,
        user?.id!,
        category,
        price,
        visibility,
        deadline
      );
    }
    setTimeout(() => {
      autoDraftSave();
    }, 500);
  }, [content, user, category, price, visibility, deadline,title,description]);
  const form = useFormContext<TaskSchema>();
  return (
    <div className="p-4 space-y-4 full">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <TextareaAutosize
                minRows={1}
                maxRows={2}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Task Title"
                {...field}
                value={title}
                onChange={(e) => {
                  field.onChange(e.target.value);
                  setTitle(e.target.value);
                }}
              />
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
              <TextareaAutosize
                minRows={1}
                maxRows={2}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                placeholder="Task Description"
                {...field}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);

                  field.onChange(e.target.value);
                }}
              />
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
              onValueChange={(val) => {
                field.onChange(val);
                setDeadline(val);
              }}>
              <FormControl>
                <SelectTrigger className=" w-full">
                  <SelectValue placeholder="Select time task takes to be completed" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="12h">12h</SelectItem>
                <SelectItem value="24h">24h</SelectItem>
                <SelectItem value="48h">48h</SelectItem>
                <SelectItem value="3days">3 days</SelectItem>
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
                setVisibility(val as "public" | "private");
              }}>
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
              <ExampleCombobox value={field.value} onChange={field.onChange} />
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
              <Input
                type="number"
                min={10}
                placeholder="Enter price"
                {...field}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  field.onChange(val);
                  setPrice(val);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />

      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <Label>Attachments</Label>
        </div>
        <FileUploadUi />
      </div>
    </div>
  );
}
