import AdminBlogListComps from "@/features/users/components/admin/AdminBlogListComps";
import { getAllOwnerBlog } from "@/features/users/server/actions";

export default async function AdminBlogListPage() {
  const posts = await getAllOwnerBlog();

  return <AdminBlogListComps posts={posts} />;
}
