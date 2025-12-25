import BlogPageComps from "@/components/marketing/blogPageComps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllBlogs } from "@/features/users/server/actions";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import Link from "next/link";

export default async function BlogPage() {
  const blogs = await getAllBlogs();

  return <BlogPageComps blogs={blogs} />;
}
