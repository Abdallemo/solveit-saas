import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import Link from "next/link"

export default function AdminBlogListPage() {
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
              <Link href="/admin/blog/new">
                <Plus className="h-4 w-4" />
                New Post
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-6 py-8">
        <p className="text-muted-foreground ">
          Your blog posts will be listed here
        </p>
      </div>
    </div>
  )
}
