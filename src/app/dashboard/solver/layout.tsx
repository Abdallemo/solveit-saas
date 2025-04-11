import PosterDashboardSidebar from "@/features/users/components/PosterDashbaordSidebar";
import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function PosterDashbaordLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <PosterDashboardSidebar />
        <div className="flex flex-col flex-1 overflow-auto">
          <header className="sticky top-0 z-10 bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60 border-b">
            <div className="container flex h-14 items-center px-4 sm:px-6">
              <SidebarTrigger className="mr-2" />
              
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}