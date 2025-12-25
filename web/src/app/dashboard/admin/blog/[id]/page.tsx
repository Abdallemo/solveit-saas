import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getBlogBySlug } from "@/features/users/server/actions";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";

const PostingEditor = dynamic(
  () => import("@/features/tasks/components/richTextEdito/MainTiptapEditor"),
  {
    loading: () => <Skeleton className="h-172.5 md:h-175 lg:h-195" />,
  },
);

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const blog = await getBlogBySlug(id);

  if (!blog) {
    notFound();
  }

  return (
    <div className="">
      <div className="container mx-auto max-w-5xl px-6 py-4">
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>

      <article className="container mx-auto max-w-5xl px-6 pb-24">
        <div className="flex items-center gap-3 mb-6 text-sm text-muted-foreground">
          <Badge variant="secondary">{blog.category}</Badge>
          <time dateTime={blog.publishedAt.toLocaleDateString()}>
            {new Date(blog.publishedAt).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          <span>·</span>
          <span>{blog.readTime} min read</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-balance">
          {blog.title}
        </h1>

        <div className="flex items-center gap-3 pb-8 mb-8 border-b">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
            {blog.blogAuthor.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{blog.blogAuthor.name}</div>
            <div className="text-sm text-muted-foreground">
              {blog.blogAuthor.role.toLowerCase()}
            </div>
          </div>
        </div>

        <PostingEditor
          content={blog.content}
          showMenuBar={false}
          editorOptions={{ editable: false }}
          className="border-0 "
        />
      </article>
    </div>
  );
}
