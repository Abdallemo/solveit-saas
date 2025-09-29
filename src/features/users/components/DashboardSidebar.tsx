"use client";
import { useStripeSubscription } from "@/hooks/provider/stripe-subscription-provider";
import { GalleryVerticalEnd } from "lucide-react";
import { Session } from "next-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

import {
  MenuItem,
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

import ProfileSkeleton from "@/components/profile-loading-skeleton";
import { UserRole } from "@/features/auth/server/auth-uitls";
import { NavSecondary } from "./NavSecondary";
import { NavUser } from "./User_nav_bar";

const roleMenuMap: Record<UserRole, MenuItem[]> = {
  POSTER: MenuItemsPoster,
  MODERATOR: MenuItemsModerator,
  SOLVER: MenuItemsSolver,
  ADMIN: MenuItemsAdmin,
};

export default function DashboardSidebar({ user }: { user: Session["user"] }) {
  const pathname = usePathname();
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  const { subTier } = useStripeSubscription();

  const closeMobileSidebar = () => {
    if (isMobile && openMobile) setOpenMobile(false);
  };

  const isActive = (url: string, exact = false) => {
    const defaultSolverPath = "/dashboard/solver";
    const defaultPosterPath = "/dashboard/poster";
    const defaultModPath = "/dashboard/moderator";
    const defaultAdminPath = "/dashboard/admin";

    if (exact) return pathname === url;

    if (
      (user?.role === "SOLVER" &&
        pathname === defaultSolverPath &&
        url === defaultSolverPath) ||
      (user?.role === "POSTER" &&
        pathname === defaultPosterPath &&
        url === defaultPosterPath) ||
      (user?.role === "MODERATOR" &&
        pathname === defaultModPath &&
        url === defaultModPath) ||
      (user?.role === "ADMIN" &&
        pathname === defaultAdminPath &&
        url === defaultAdminPath)
    ) {
      return true;
    }

    return pathname === url || pathname.startsWith(`${url}/`);
  };

  const menuItems = roleMenuMap[user?.role ?? "POSTER"] || [];

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Solveit</span>
                  <span className="">v1.0.0</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {user?.role === "SOLVER" ? subTier : user?.role}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <MenuRenderer
                items={menuItems}
                isActive={isActive}
                closeMobileSidebar={closeMobileSidebar}
              />
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

function MenuRenderer({
  items,
  isActive,
  closeMobileSidebar,
}: {
  items: MenuItem[];
  isActive: (url: string, exact?: boolean) => boolean;
  closeMobileSidebar: () => void;
}) {
  return (
    <>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          {item.type === "category" ? (
            <SidebarMenuButton>
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton asChild>
              <Link
                onClick={closeMobileSidebar}
                href={item.url}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                  isActive(item.url, true)
                    ? "bg-primary text-sidebar-primary-foreground"
                    : ""
                }`}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          )}

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
                          ? "bg-primary text-sidebar-primary-foreground"
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
    </>
  );
}
