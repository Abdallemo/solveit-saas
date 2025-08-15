import { Skeleton } from "@/components/ui/skeleton"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

export default function DashboardSkeleton() {
  return (
    <SidebarProvider defaultOpen style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }>
      <AppSidebarSkeleton />
     
    </SidebarProvider>
  )
}

function AppSidebarSkeleton() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-2">
          <Skeleton className="h-6 w-16" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard - Active item */}
              <SidebarMenuItem>
                <SidebarMenuButton className="bg-sidebar-accent">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Tasks & Jobs with sub-items */}
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <div className="flex items-center gap-2 px-2 py-1">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <div className="flex items-center gap-2 px-2 py-1">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>

              {/* Mentorship with sub-items */}
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-20" />
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <div className="flex items-center gap-2 px-2 py-1">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <div className="flex items-center gap-2 px-2 py-1">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <div className="flex items-center gap-2 px-2 py-1">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <div className="flex items-center gap-2 px-2 py-1">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* Support */}
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Feedback */}
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-18" />
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* User Profile */}
          <SidebarMenuItem>
            <SidebarMenuButton className="h-12">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-2 w-32" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
