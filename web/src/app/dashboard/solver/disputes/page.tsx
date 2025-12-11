import { DisputesPage } from "@/features/tasks/components/refund/usersRefundPageComp";
import { getUserDisputes } from "@/features/tasks/server/data";

export default async function page() {
  const data = await getUserDisputes();
  return (
    <main className="w-full h-full">
      <DisputesPage disputes={data} />
    </main>
  );
}
