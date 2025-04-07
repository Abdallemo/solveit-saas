import PosterDashboardSidebar from "@/features/users/components/PosterDashbaordSidebar";
import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function PosterDashbaordLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <SidebarProvider>
        <PosterDashboardSidebar />

        <main className="">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </>
  );
}
