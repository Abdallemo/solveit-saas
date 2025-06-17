import DashboardCheckingComponent from "@/components/dashboard/DashboardCheckingComponent";
import { Suspense } from "react";
import DashboardSkeleton from "./loading";

export default function page() {
  return (
    <Suspense fallback={<DashboardSkeleton/>}>
      <DashboardCheckingComponent />;
    </Suspense>
  );
}
