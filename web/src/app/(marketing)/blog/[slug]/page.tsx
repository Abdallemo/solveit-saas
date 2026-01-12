import BlogPostPageComps from "@/components/marketing/BlogPostPageComps";
import { getReturnUrl } from "@/features/subscriptions/server/action";
import { getBlogBySlug } from "@/features/users/server/actions";
import { notFound } from "next/navigation";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  const referUrl = await getReturnUrl("/blog");

  if (!blog) {
    notFound();
  }

  return <BlogPostPageComps blog={blog} returnUrl={referUrl} />;
}
