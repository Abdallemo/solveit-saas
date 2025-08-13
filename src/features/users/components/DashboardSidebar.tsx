"use client";
import React, { Suspense, useState } from "react";
import {
  MenuItemsAdmin,
  MenuItemsModerator,
  MenuItemsPoster,
  MenuItemsSolver,
  navSecondary,
} from "@/components/dashboard/menu-items";
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
  useSidebar,
} from "@/components/ui/sidebar";

import Link from "next/link";
import { NavUser } from "./User_nav_bar";
import ProfileSkeleton from "@/components/profile-loading-skeleton";
import { NavSecondary } from "./NavSecondary";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { useStripeSubscription } from "@/hooks/provider/stripe-subscription-provider";

export default function DashboardSidebar({ user }: { user: Session["user"] }) {
  const pathname = usePathname();
  const { isMobile, openMobile, setOpenMobile, setOpen, open, toggleSidebar } =
    useSidebar();
  const { subTier } = useStripeSubscription();
  const closeMobileSidebar = () => {
    if (isMobile && openMobile) setOpenMobile(false);
  };
  const isActive = (url: string, exact = false) => {
    const defaultSolverPath = "/dashboard/solver";
    const defaultPosterPath = "/dashboard/poster";

    if (exact) return pathname === url;

    if (
      (user?.role === "SOLVER" &&
        pathname === defaultSolverPath &&
        url === defaultSolverPath) ||
      (user?.role === "POSTER" &&
        pathname === defaultPosterPath &&
        url === defaultPosterPath)
    ) {
      return true;
    }

    return pathname === url || pathname.startsWith(`${url}/`);
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {user?.role == "SOLVER" ? subTier : user.role}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {user?.role === "POSTER" &&
                MenuItemsPoster.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        onClick={closeMobileSidebar}
                        href={item.url}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                          isActive(item.url, true)
                            ? "bg-foreground/10 text-foreground"
                            : ""
                        }`}>
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
                                onClick={closeMobileSidebar}
                                href={cld.url}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                                  isActive(cld.url)
                                    ? "bg-foreground/10 text-foreground"
                                    : ""
                                }`}>
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
              {user?.role === "MODERATOR" &&
                MenuItemsModerator.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        onClick={closeMobileSidebar}
                        href={item.url}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                          isActive(item.url, true)
                            ? "bg-foreground/10 text-foreground"
                            : ""
                        }`}>
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
                                onClick={closeMobileSidebar}
                                href={cld.url}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                                  isActive(cld.url)
                                    ? "bg-foreground/10 text-foreground"
                                    : ""
                                }`}>
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
                        onClick={closeMobileSidebar}
                        href={item.url}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                          isActive(item.url, true)
                            ? "bg-foreground/10 text-foreground"
                            : ""
                        }`}>
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
                                onClick={closeMobileSidebar}
                                href={cld.url}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                                  isActive(cld.url)
                                    ? "bg-foreground/10 text-foreground"
                                    : ""
                                }`}>
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

              {user?.role === "ADMIN" &&
                MenuItemsAdmin.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        onClick={closeMobileSidebar}
                        href={item.url}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                          isActive(item.url, true)
                            ? "bg-foreground/10 text-foreground"
                            : ""
                        }`}>
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
                                onClick={closeMobileSidebar}
                                href={cld.url}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                                  isActive(cld.url)
                                    ? "bg-foreground/10 text-foreground"
                                    : ""
                                }`}>
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
        <Suspense fallback={<ProfileSkeleton />}>
          <NavUser
            email={user?.email}
            name={user?.name}
            image={user?.image}
            role={user?.role}
            id={user.id}
          />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}
