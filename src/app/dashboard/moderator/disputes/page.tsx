import {
  RefundTable
} from "@/features/tasks/components/refund/refundComps";
import { getAllDisputes } from "@/features/tasks/server/data";

export default async function Page() {
  const allDisputes = await getAllDisputes();
  return (
    <main className="w-full h-full flex  justify-center ">
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Dispute Management
        </h1>
        <p className="text-muted-foreground">Manage All poster disputes here</p>
        <RefundTable data={allDisputes} />
      </div>
    </main>
  );
}
