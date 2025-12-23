"use client";
import { JSONContent } from "@tiptap/react";

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
const PostingEditor = dynamic(
  () => import("@/features/tasks/components/richTextEdito/MainTiptapEditor"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-172.5 md:h-175 lg:h-195" />,
  },
);
import { PublishBlogs } from "@/features/users/server/actions";
import {
  BlogPostFormData,
  blogPostSchema,
} from "@/features/users/server/user-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Save, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewBlogPostPage() {
  const router = useRouter();
  const [isDraft, setIsDraft] = useState(false);

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
  const { mutateAsync: publishBlogMutation, isPending: isPublishing } =
    useMutation({
      mutationFn: PublishBlogs,
      onSuccess: ({ error }) => {
        if (error) {
          toast.error(error, { id: "blog-post" });
        } else {
          toast.success("successfully published", { id: "blog-post" });
        }
      },
    });
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
    router.push("/dashboard/admin/blog");
  }

  const handleSaveDraft = () => {
    setIsDraft(true);
    form.handleSubmit(onSubmit)();
  };

  const handlePublish = () => {
    setIsDraft(false);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="h-full bg-background flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/admin/blog">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold">New Blog Post</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isPublishing}
            >
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing}>
              <Send className="h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 border-r flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto overflow-x-auto">
            <div className="px-6 py-6 min-w-fit">
              <Form {...form}>
                <form>
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <PostingEditor
                            content={field.value as JSONContent}
                            onChange={({ editor }) => {
                              field.onChange(editor.getJSON());
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </div>
        </div>

        <div className="w-80 border-l bg-card overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
              <div className="px-6 py-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Blog Details</h2>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href="#"
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Auto Suggest with AI
                    </a>
                  </Button>
                </div>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Blog post title"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleTitleChange(e.target.value);
                            }}
                            className="text-sm"
                          />
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
                          <Input
                            placeholder="url-slug"
                            {...field}
                            className="text-sm"
                          />
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
                          <Input
                            placeholder="e.g., Career Tips"
                            {...field}
                            className="text-sm"
                          />
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
                        <FormLabel className="text-xs">
                          Read Time (minutes)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="5"
                            {...field}
                            className="text-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="px-6 py-6 ">
                <h3 className="font-semibold mb-4 text-sm">Excerpt</h3>
                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Brief summary of the blog post..."
                          rows={4}
                          {...field}
                          className="text-sm resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
