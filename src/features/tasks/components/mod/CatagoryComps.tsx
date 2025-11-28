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
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { FolderIcon, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createCatagory, deleteCatagory } from "../../server/action";
import { CatagoryType } from "../../server/task-types";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be less than 50 characters"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CreateCategoryDialog({
  triggerText,
}: {
  triggerText?: string;
}) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createCatagoryMutation, isPending } = useMutation({
    mutationFn: createCatagory,
    onSuccess: () => {
      toast.success("Successfully created", { id: "create-catagory" });
    },
    onError: (e) => toast.error(e.message, { id: "create-catagory" }),
  });
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: CategoryFormData) => {
    toast.loading("creating catagory..", { id: "create-catagory" });
    await createCatagoryMutation(data.name);

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
          {triggerText ?? "Create Category"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Add a new category to organize your items. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter category name..."
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
                  : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
export function CategoryCard({ category }: { category: CatagoryType }) {
  const { mutateAsync: deleteCatagoryMutation, isPending: isDeleting } =
    useMutation({
      mutationFn: deleteCatagory,
      onSuccess: () => {
        toast.success("Successfully deleted", { id: "delete-catagory" });
      },
      onError: (e) => toast.error(e.message, { id: "delete-catagory" }),
    });
  const handleDelete = async () => {
    await deleteCatagoryMutation(category.id);
  };
  console.log(category)

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FolderIcon className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold truncate">
              {category.name}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Tasks: {category.taskCount}</span>
          <span>
            Created: {(new Date(category.createdAt)).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
