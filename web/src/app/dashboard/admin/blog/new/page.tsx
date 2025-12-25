"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Editor, JSONContent } from "@tiptap/react";
import {
  ArrowLeft,
  Save,
  Send,
  PanelRight,
  Wand2,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { PublishBlogs } from "@/features/users/server/actions";
import {
  BlogPostFormData,
  blogPostSchema,
} from "@/features/users/server/user-types";
import { autoSuggestBlogWithAi } from "@/features/Ai/server/action";
import { useDebouncedCallback } from "@/hooks/useAutoDraftSave";
import { CustomeTextSerializersForAi } from "@/features/tasks/components/richTextEdito/tiptap-ai-content-selized";

const PostingEditor = dynamic(
  () => import("@/features/tasks/components/richTextEdito/MainTiptapEditor"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-172.5 md:h-175 lg:h-195" />,
  },
);

export default function NewBlogPostPage() {
  const router = useRouter();
  const [contentText, setContentText] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: {},
      category: "",
      readTime: 5,
    },
  });
  const content = form.watch("content");

  const { mutateAsync: publishBlogMutation, isPending: isPublishing } =
    useMutation({
      mutationFn: PublishBlogs,
      onSuccess: ({ error }) => {
        if (error) {
          toast.error(error, { id: "blog-post" });
        } else {
          toast.success("successfully published", { id: "blog-post" });
          router.push("/dashboard/admin/blog");
        }
      },
    });
  const { mutateAsync: autoSuggest, isPending: isAutoSeggesting } = useMutation(
    {
      mutationFn: autoSuggestBlogWithAi,
      onSuccess: (d) => {},
      onError: (er) => {
        toast.error(er.message);
      },
    },
  );
  const handleEditorChange = useDebouncedCallback(
    (editor: Editor) => {
      if (!editor) return;
      const jsonContent = editor.getJSON();
      const textContent = editor.getText({
        textSerializers: CustomeTextSerializersForAi,
      });

      form.setValue("content", jsonContent, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
      setContentText(textContent);
    },
    200,
    [form],
  );

  async function handleBlogAutosuggestion() {
    const res = await autoSuggest({ content: contentText });

    form.reset({
      title: res.title,
      excerpt: res.description,
      category: res.category,
      readTime: res.readTime,
      content: content,
    });
    handleTitleChange(res.title);
  }

  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    form.setValue("slug", slug);
  };

  async function onSubmit(data: BlogPostFormData) {
    await publishBlogMutation(data);
  }
  function onError(errors: FieldErrors<BlogPostFormData>) {
    console.warn("Validation errors ", errors);
    setSheetOpen(true);

    const firstErrorField = Object.keys(errors)[0];
    const el = document.querySelector(`[name="${firstErrorField}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const SidebarFormContent = () => (
    <div className="p-4 flex flex-col gap-2 overflow-x-auto">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Title</FormLabel>
            <FormControl>
              <div className="relative ">
                <Input
                  placeholder="Blog post title"
                  {...field}
                  disabled={isPublishing || isAutoSeggesting}
                  onChange={(e) => {
                    field.onChange(e);
                    handleTitleChange(e.target.value);
                  }}
                  className="text-sm"
                />
                {isAutoSeggesting && (
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
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">URL Slug</FormLabel>
            <FormControl>
              <div className="relative ">
                <Input
                  placeholder="url-slug"
                  {...field}
                  className="text-sm"
                  disabled={isPublishing || isAutoSeggesting}
                />
                {isAutoSeggesting && (
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
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Category</FormLabel>
            <FormControl>
              <div className="relative ">
                <Input
                  placeholder="e.g., Career Tips"
                  {...field}
                  className="text-sm"
                  disabled={isPublishing || isAutoSeggesting}
                />
                {isAutoSeggesting && (
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
        name="readTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Read Time (minutes)</FormLabel>
            <FormControl>
              <div className="relative ">
                <Input
                  type="number"
                  min={1}
                  {...field}
                  className="text-sm"
                  disabled={isPublishing || isAutoSeggesting}
                />
                {isAutoSeggesting && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin" />
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="pt-4 border-t">
        <h3 className="font-semibold mb-4 text-sm">Description</h3>
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative ">
                  <Textarea
                    placeholder="Brief summary..."
                    rows={4}
                    {...field}
                    className="text-sm resize-none"
                    disabled={isPublishing || isAutoSeggesting}
                  />
                  {isAutoSeggesting && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin" />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  return (
    <div className="h-full  flex flex-col ">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)}>
          <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  disabled={isPublishing || isAutoSeggesting}
                >
                  <Link href="/dashboard/admin/blog">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <h1 className="text-lg font-semibold hidden sm:block">
                  New Blog Post
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" type="button" disabled={isPublishing}>
                  <Save className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Save Draft</span>
                </Button>
                <Button
                  type="submit"
                  disabled={isPublishing || isAutoSeggesting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Publish
                </Button>
              </div>
            </div>
          </header>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="lg:hidden fixed bottom-4 right-4 z-50 bg-sidebar hover:bg-background text-foreground cursor-pointer rounded-full shadow-lg"
              >
                <FileText className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96">
              <SheetHeader className="text-left">
                <div className="p-4 border-b bg-background flex justify-between items-center">
                  <h2 className="text-lg">Blog Details</h2>
                  <Button className="text-xs" type="button" variant={"outline"}>
                    <Wand2 /> Auto Suggest with Ai
                  </Button>
                </div>
              </SheetHeader>

              <Form {...form}>
                <SidebarFormContent />
              </Form>
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 overflow-hidden h-full ">
            <div className="flex-1 border-r flex flex-col min-w-0 ">
              <div className="flex-1 overflow-y-auto overflow-x-auto">
                <div className="px-6 py-6 min-w-fit">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <PostingEditor
                            content={field.value as JSONContent}
                            onChange={({ editor }) => {
                              handleEditorChange(editor);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <aside className="hidden lg:block w-80 border-l bg-card overflow-y-auto h-full">
              <div className="p-4 border-b bg-background flex justify-between items-center">
                <h2 className="text-lg">Blog Details</h2>
                <Button
                  className="text-xs"
                  type="button"
                  variant={"outline"}
                  onClick={handleBlogAutosuggestion}
                  disabled={isAutoSeggesting}
                >
                  <Wand2 /> Auto Suggest with Ai
                </Button>
              </div>
              <SidebarFormContent />
            </aside>
          </div>
        </form>
      </Form>
    </div>
  );
}
