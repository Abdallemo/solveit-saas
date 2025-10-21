import { getAllAiRules } from "@/features/Ai/server/action";
import { AIRuleManagement } from "@/features/Ai/server/components/ai-rule-management";
import { isAuthorized } from "@/features/auth/server/actions";

export default async function AIPage() {
  const { user } = await isAuthorized(["ADMIN"]);
  const allAiRules = await getAllAiRules();
  return (
    <div className="h-full w-full flex flex-col flex-1 p-6 items-center gap-3">
      <h1 className="text-3xl font-bold tracking-tight">AI Rule Management</h1>
      <p className="text-muted-foreground">
        {" "}
        Manage AI rules and policies for your system.
      </p>
      
      <AIRuleManagement allAiRules={allAiRules} adminId={user.id} />
    </div>
  );
}
