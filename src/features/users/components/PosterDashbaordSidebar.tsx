"use client";
import React, { Suspense } from "react";
import {
  LuClipboardList,
  LuClipboardPlus,
  LuListChecks,
} from "react-icons/lu";
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
import { Home, Bug, Send, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { NavUser } from "./User_nav_bar";
import useCurrentUser from "@/hooks/useCurrentUser";
import ProfileSkeleton from "@/components/profile-loading-skeleton";
import { NavSecondary } from "./NavSecondary";
import { usePathname } from "next/navigation";

const MenuItemsPoster = [
  {
    title: "Home",
    url: "/dashboard/poster",
    icon: Home,
  },
  {
    title: "Tasks & Jobs",
    url: "/dashboard/tasks",
    icon: LuClipboardList,
    child: [
      {
        title: "New Task/Job",
        url: "/dashboard/poster/newTask",
        icon: LuClipboardPlus,
      },
      {
        title: "Your Tasks/Jobs",
        url: "/dashboard/poster/yourTasks",
        icon: LuListChecks,
      },
    ],
  },
];

const MenuItemsSolver = [
  {
    title: "Home",
    url: "/dashboard/solver",
    icon: Home,
  },
  {
    title: "Tasks & Jobs",
    url: "/dashboard/solver",
    icon: Bug,
    child: [
      {
        title: "Explore Issues",
        url: "/dashboard/tasks",
        icon: Send,
      },
    ],
  },
];

const navSecondary = [
  {
    title: "Support",
    url: "#",
    icon: LifeBuoy,
  },
  {
    title: "Feedback",
    url: "#",
    icon: Send,
  },
];

export default function PosterDashboardSidebar() {
  const { user, state } = useCurrentUser();
  const pathname = usePathname();

  const isActive = (url: string, exact = false) => {
    if (exact) return pathname === url;
    return pathname === url || pathname.startsWith(`${url}/`);
  };

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
                      <Link
                        href={item.url}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                          isActive(item.url, true)
                            ? "bg-foreground/10 text-foreground"
                            : ""
                        }`}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>

                    {item.child && (
                      <SidebarMenuSub>
                        {item.child.map((cld) => (
                          <SidebarMenuSubItem key={cld.title}>
                            <SidebarMenuSubButton asChild>
                              <Link
                                href={cld.url}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                                  isActive(cld.url)
                                    ? "bg-foreground/10 text-foreground"
                                    : ""
                                }`}
                              >
                                <cld.icon />
                                <span>{cld.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ))}

              {user?.role === "SOLVER" &&
                MenuItemsSolver.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                          isActive(item.url, true)
                            ? "bg-foreground/10 text-foreground"
                            : ""
                        }`}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>

                    {item.child && (
                      <SidebarMenuSub>
                        {item.child.map((cld) => (
                          <SidebarMenuSubItem key={cld.title}>
                            <SidebarMenuSubButton asChild>
                              <Link
                                href={cld.url}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                                  isActive(cld.url)
                                    ? "bg-foreground/10 text-foreground"
                                    : ""
                                }`}
                              >
                                <cld.icon />
                                <span>{cld.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavSecondary items={navSecondary} />
        {state === "loading" ? (
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
