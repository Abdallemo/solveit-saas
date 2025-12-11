"use client";

import {
  BadgeCheck,
  Banknote,
  Bell,
  ChevronsUpDown,
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
import {
  createStripeCheckoutSession,
  upgradeSolverToPlus,
} from "@/features/subscriptions/server/action";
import { User } from "@/features/users/server/user-types";
import { useStripeSubscription } from "@/hooks/provider/stripe-subscription-provider";
import { signOut } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function NavUser({ image, name, email, role, id }: User) {
  const { subTier } = useStripeSubscription();
  const router = useRouter();
  const { isMobile, openMobile, setOpenMobile, setOpen, open, toggleSidebar } =
    useSidebar();
  const closeMobileSidebar = () => {
    if (isMobile && openMobile) setOpenMobile(false);
  };
  const urlPrfx = `/dashboard/${role?.toLocaleLowerCase()}`;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="">
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
            sideOffset={4}
          >
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
                  className="cursor-pointer"
                  onSelect={async () => {
                    await createStripeCheckoutSession("SOLVER");
                  }}
                >
                  <Sparkles />
                  Become a Solver
                </DropdownMenuItem>
              )}
              {role === "SOLVER" && subTier === "SOLVER" && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={async () => {
                    await upgradeSolverToPlus(id!);
                  }}
                >
                  <Sparkles />
                  Upgrade to Solver++
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href={`${urlPrfx}/account`}
                  onClick={closeMobileSidebar}
                  className="cursor-pointer"
                >
                  <BadgeCheck />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`${urlPrfx}/billings`} className="cursor-pointer">
                  <Banknote /> Billings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/notifications`}
                  className="cursor-pointer"
                >
                  <Bell />
                  Notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut().then(() => router.push("/login"))}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
