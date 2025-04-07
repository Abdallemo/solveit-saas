import PosterDashboardSidebar from "@/features/users/components/PosterDashbaordSidebar";
import { ReactNode } from "react";
import { SidebarProvider} from "@/components/ui/sidebar";

export default function PosterDashbaordLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <SidebarProvider open={true}>
        <PosterDashboardSidebar />
          {children}        
      </SidebarProvider>
    </>
  );
}
