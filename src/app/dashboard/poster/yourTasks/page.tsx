import { getServerUserSession } from "@/features/auth/server/actions"
import { getAllCategoryMap, getPosterTasksbyIdPaginated } from "@/features/tasks/server/action"
import PosterPublishedTasks from "@/features/tasks/components/posterOwnTasksPageComp"


export default async function ServerWrapper({
  searchParams,
}: {
  searchParams: Promise<{ q: string; page: string }>
}) {
  const currentUser = await getServerUserSession()
  if (!currentUser || !currentUser.role || !currentUser.id) return

  const categoryMap = await getAllCategoryMap()
  const { q, page } = await searchParams
  const search = q ?? ""
  const pages = Number.parseInt(page ?? "1")
  const limit = 6
  const offset = (pages - 1) * limit

  const { tasks, totalCount } = await getPosterTasksbyIdPaginated(currentUser.id, {
    search,
    limit,
    offset,
  })

  const totalPages = Math.ceil(totalCount / limit)
  const hasPrevious = pages > 1
  const hasNext = pages < totalPages
  return (
    <PosterPublishedTasks
      tasks={tasks}
      totalCount={totalCount}
      categoryMap={categoryMap}
      pages={pages}
      totalPages={totalPages}
      hasPrevious={hasPrevious}
      hasNext={hasNext}
    />
  )
}
