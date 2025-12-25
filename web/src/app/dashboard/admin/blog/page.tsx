import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllOwnerBlog } from "@/features/users/server/actions";
import { formatDateAndTimeNUTC } from "@/lib/utils/date-time";
import { ArrowRight, CalendarDays, Clock, Plus } from "lucide-react";
import Link from "next/link";

export default async function AdminBlogListPage() {
  const posts = await getAllOwnerBlog();
  return (
    <div className="h-full bg-background">
      <header className="border-b">
        <div className="container mx-auto max-w-6xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Blog Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and publish blog posts
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/admin/blog/new">
                <Plus className="h-4 w-4" />
                New Post
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {!posts ||
        (posts.length <= 0 && (
          <div className="container mx-auto max-w-6xl px-6 py-8">
            <p className="text-muted-foreground ">
              Your blog posts will be listed here
            </p>
          </div>
        ))}
      <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="flex flex-col hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{post.readTime} min</span>
                  </div>
                </div>

                <CardTitle className="text-xl leading-tight text-balance">
                  <Link
                    href={`/blog/${post.url}`}
                    className="hover:text-primary transition-colors"
                  >
                    {post.title}
                  </Link>
                </CardTitle>

                <CardDescription className="text-sm text-muted-foreground pt-2 break-all">
                  {post.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="mt-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    <time dateTime={post.publishedAt.toDateString()}>
                      {formatDateAndTimeNUTC(post.publishedAt)}
                    </time>
                  </div>

                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      href={`/dashboard/admin/blog/${post.url}/`}
                      className="gap-1"
                    >
                      Read more
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                  <span className="font-medium">{post.blogAuthor.name}</span>
                  <span className="mx-2">·</span>
                  <span>{post.blogAuthor.role}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
