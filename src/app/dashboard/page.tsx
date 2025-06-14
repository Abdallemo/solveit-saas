import DashboardCheckingComponent from "@/components/dashboard/dashboardCheckingComponent";
import { Suspense } from "react";

export default function page() {
  return (
    <Suspense fallback={"here ill but a custom loading skeekton for them"}>
      <DashboardCheckingComponent />;
    </Suspense>
  );
}
