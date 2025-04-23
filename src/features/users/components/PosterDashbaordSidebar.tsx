"use client";
import React, { Suspense } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Home,Bug,Newspaper, Send } from "lucide-react";
import Link from "next/link";
import { NavUser } from "./User_nav_bar";
import useCurrentUser from "@/hooks/useCurrentUser";
import ProfileSkeleton from "@/components/profile-loading-skeleton";
const MenuItemsPoster = [
  {
    title: "Home",
    url: "/dashboard/poster",
    icon: Home,
  },
  {
    title: "Post",
    url: "/dashboard/tasks",
    icon: Newspaper,
  },
];

const MenuItemsSolver = [
  {
    title: "Home",
    url: "/dashboard/solver",
    icon: Home,
  },
  {
    title: "Issues",
    url: "/dashboard/solver",
    icon: Bug,
    child: {
      title: "Explore Issues",
      url: "/dashboard/tasks",
      icon: Send,
    },
  },
];

export default function PosterDashboardSidebar() {
  const { user, state } = useCurrentUser();
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{user?.role}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {user?.role === "POSTER" &&
                MenuItemsPoster.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              {user?.role == "SOLVER" &&
                MenuItemsSolver.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.child && (
                      <SidebarMenuSub>
                        <SidebarMenuSubItem key={item.child.title}>
                          <SidebarMenuSubButton asChild>
                            <Link href={item.child.url ?? item.url}>
                              <item.child.icon />
                              <span>{item.child.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {state == "loading" ? (
          <ProfileSkeleton />
        ) : (
          <Suspense fallback={<ProfileSkeleton />}>
            <NavUser
              email={user?.email}
              name={user?.name}
              image={user?.image}
              role={user?.role}
            />
          </Suspense>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
