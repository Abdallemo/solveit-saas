import { Skeleton } from "@/components/ui/skeleton"
import CreateCategoryDialog, { CategoryCard } from "@/features/tasks/components/mod/CatagoryComps"
import { getAllTaskCatagories } from "@/features/tasks/server/data"
import { InboxIcon } from "lucide-react"
import { Suspense } from "react"

export default function CategoryPage() {
  return (
    <div className="h-full flex flex-col flex-1 p-6">
      <div className="flex justify-between items-start mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage your task categories</p>
        </div>
        <CreateCategoryDialog />
      </div>

      <div className="flex-1">
        <Suspense fallback={<CategorySkeleton />}>
          <CategoryList />
        </Suspense>
      </div>
    </div>
  )
}

function CategorySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-lg" />
      ))}
    </div>
  )
}

async function CategoryList() {
  const categories = await getAllTaskCatagories()

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <InboxIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No categories created yet</h3>
          <p className="text-muted-foreground max-w-md">
            Create your first category to start organizing your tasks by department or project type.
          </p>
        </div>
        <CreateCategoryDialog triggerText="Create your first category" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {categories.length} {categories.length === 1 ? "category" : "categories"} found
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}
