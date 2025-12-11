import { getAdminAiSandboxTests } from "@/features/Ai/server/action";
import AIRuleSandboxPage from "@/features/Ai/server/components/AiSanbodxPageComps";

export default async function page() {
  const res = await getAdminAiSandboxTests();
  return <AIRuleSandboxPage adminAiSandboxTests={res!} />;
}
