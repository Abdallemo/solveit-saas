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
import PostingEditor from "@/features/tasks/components/richTextEdito/BlogTiptap";
import { MIN_CONTENT_LENGTH } from "@/features/tasks/server/task-types";
import { calculateEditorTextLength } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  excerpt: z
    .string()
    .min(1, "Excerpt is required")
    .max(500, "Excerpt is too long"),
  content: z
    .unknown()
    .refine(
      (val) => {
        const content = val as JSONContent;
        const textLength = calculateEditorTextLength(content);
        return textLength >= MIN_CONTENT_LENGTH;
      },
      {
        message: `Task content is too short. Please provide at least ${MIN_CONTENT_LENGTH} characters.`,
      }
    )
    .transform((val) => val as JSONContent),
  category: z.string().min(1, "Category is required"),
  authorName: z.string().min(1, "Author name is required"),
  authorRole: z.string().min(1, "Author role is required"),
  readTime: z.coerce.number().min(1, "Read time must be at least 1 minute"),
  publishedAt: z.string().optional(),
});

type BlogPostFormData = z.infer<typeof blogPostSchema>;

export default function NewBlogPostPage() {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const form = useForm({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: {},
      category: "",
      authorName: "",
      authorRole: "",
      readTime: 5,
      publishedAt: new Date().toISOString().split("T")[0],
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
    setIsPublishing(true);

    try {
      // TODO: Call your server action here

      console.log("[v0] Blog post data:", data);
      console.log("[v0] Is draft:", isDraft);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(
        isDraft
          ? "Draft saved successfully!"
          : "Blog post published successfully!"
      );
      router.push("/dashboard/admin/blog");
    } catch (error) {
      console.error("[v0] Error submitting blog post:", error);
      toast.error("Failed to save blog post. Please try again.");
    } finally {
      setIsPublishing(false);
    }
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
              disabled={isPublishing}>
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
                      className="text-xs text-muted-foreground hover:text-foreground">
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

                  <FormField
                    control={form.control}
                    name="publishedAt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Publish Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="text-sm" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="px-6 py-6 border-b">
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

              <div className="px-6 py-6">
                <h3 className="font-semibold mb-4 text-sm">Author</h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="authorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
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
                    name="authorRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Role</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Career Advisor"
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
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
