import BlogPostPageComps from "@/components/marketing/BlogPostPageComps";
import { getReturnUrl } from "@/features/subscriptions/server/action";
import { getBlogBySlug } from "@/features/users/server/actions";
import { notFound } from "next/navigation";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const blog = await getBlogBySlug(id);
  const referUrl = await getReturnUrl("/dashboard/admin/blog");

  if (!blog) {
    notFound();
  }

  return <BlogPostPageComps blog={blog} returnUrl={referUrl} />;
}
