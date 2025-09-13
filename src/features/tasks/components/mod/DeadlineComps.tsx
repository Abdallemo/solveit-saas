"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatDateAndTime } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { FolderIcon, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createDeadline, deleteDeadline } from "../../server/action";
import { DeadlineType } from "../../server/task-types";

const deadlineSchema = z.object({
  deadline: z.string().regex(/^(\d+)([hdwmy])$/, {
    message: "please enter a valid deadline e.g 12d,2w,1m,2y",
  }),
});

type DeadlineFormData = z.infer<typeof deadlineSchema>;

export default function CreateDeadlineDialog({
  triggerText,
}: {
  triggerText?: string;
}) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createDeadlineMutation, isPending } = useMutation({
    mutationFn: createDeadline,
    onSuccess: () => {
      toast.success("Successfully created", { id: "create-catagory" });
    },
    onError: (e) => toast.error(e.message, { id: "create-catagory" }),
  });
  const form = useForm<DeadlineFormData>({
    resolver: zodResolver(deadlineSchema),
    defaultValues: {
      deadline: "",
    },
  });

  const onSubmit = async (data: DeadlineFormData) => {
    toast.loading("creating catagory..", { id: "create-catagory" });
    await createDeadlineMutation(data.deadline);

    setOpen(false);
    form.reset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          {triggerText ?? "Create Deadline"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task Deadline</DialogTitle>
          <DialogDescription>
            Add a new task deadline to define student task deadline. Click save
            when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter deadline e.g 12h,1d,1w or 1y"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isPending}>
                {form.formState.isSubmitting
                  ? "Creating..."
                  : "Create Deadline"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
export function DeadlineCard({ deadline }: { deadline: DeadlineType }) {
  const { mutateAsync: deleteDeadlineMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: deleteDeadline,
      onSuccess: () => {
        toast.success("Successfully deleted", { id: "delete-catagory" });
      },
      onError: (e) => toast.error(e.message, { id: "delete-catagory" }),
    });
  const handleDelete = async () => {
    await deleteDeadlineMutation(deadline.id);
  };

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderIcon className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold truncate">
              {deadline.deadline}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            disabled={isDeleting}
            size="sm"
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Tasks: {0}</span>
          <span>
            Created: {formatDateAndTime(new Date(deadline.createdAt!))}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
