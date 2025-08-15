"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { signOut } from "next-auth/react";
import { AppUser } from "../../../../types/next-auth";
import Link from "next/link";
import { createStripeCheckoutSession, upgradeSolverToPlus } from "@/features/subscriptions/server/action";
import { useStripeSubscription } from "@/hooks/provider/stripe-subscription-provider";
import useCurrentUser from "@/hooks/useCurrentUser";

export function NavUser({ image, name, email, role,id }: AppUser) {
  const { subTier } = useStripeSubscription();
  const { isMobile, openMobile, setOpenMobile, setOpen, open, toggleSidebar } =
    useSidebar();
  const closeMobileSidebar = () => {
    if (isMobile && openMobile) setOpenMobile(false);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={image!} alt={"test"} />
                <AvatarFallback className="rounded-lg">
                  {name?.split("")[0]}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-foreground">
                  {name}
                </span>
                <span className="truncate text-xs text-foreground">
                  {email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar>
                  <AvatarImage src={image!} alt={"test"} />
                  <AvatarFallback className="rounded-lg">
                    {name?.split("")[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{name}</span>
                  <span className="truncate text-xs">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {role === "POSTER" && (
                <DropdownMenuItem
                  onSelect={async () => {
                    await createStripeCheckoutSession("SOLVER");
                  }}>
                  <Sparkles />
                  Upgrade to Solver
                </DropdownMenuItem>
              )}
              {role === "SOLVER" && subTier === "SOLVER" && (
                <DropdownMenuItem
                  onSelect={async () => {
                    await upgradeSolverToPlus(id!);
                  }}>
                  <Sparkles />
                  Upgrade to Solver++
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link
                href={`/dashboard/${role?.toLocaleLowerCase()}/account`}
                onClick={closeMobileSidebar}>
                <DropdownMenuItem>
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem>
                <Bell />
                <Link href={`/dashboard/notifications`}>
                Notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut({ redirectTo: "/login" })}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
