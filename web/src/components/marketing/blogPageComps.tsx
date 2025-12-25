import { BlogType } from "@/features/users/server/user-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

export default function BlogPageComps({
  blogs,
  href = "/blog/",
}: {
  blogs: BlogType[];
  href?: string;
}) {
  return (
    <div className="">
      <div className="">
        <div className="container mx-auto max-w-5xl px-5 py-12">
          <h1 className="text-4xl font-bold mb-3 text-balance">
            Latest News From Solveit team
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Articls, and platform updates for students.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.map((blog) => (
            <>
              <Card
                key={blog.id}
                className="flex flex-col hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {blog.category}
                    </Badge>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{blog.readTime} min</span>
                    </div>
                  </div>

                  <CardTitle className="text-xl leading-tight text-balance">
                    <Link
                      href={`${href}${blog.url}`}
                      className="hover:text-primary transition-colors"
                    >
                      {blog.title}
                    </Link>
                  </CardTitle>

                  <CardDescription className="text-sm text-muted-foreground pt-2 break-all">
                    {blog.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="mt-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="h-3 w-3" />
                      <time dateTime={blog.publishedAt.toLocaleDateString()}>
                        {new Date(blog.publishedAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </time>
                    </div>

                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`${href}${blog.url}`} className="gap-1">
                        Read more
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                    <span className="font-medium">{blog.blogAuthor.name}</span>
                    <span className="mx-2">·</span>
                    <span>{blog.blogAuthor.role.toLocaleLowerCase()}</span>
                  </div>
                </CardContent>
              </Card>
            </>
          ))}
        </div>
      </div>
    </div>
  );
}
