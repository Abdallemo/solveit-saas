import MentorshipWorkspace from "@/features/mentore/components/workspace/MentorshipWorkspace";

export default async function Page() {
  return <MentorshipWorkspace controlled={false} sidebar={true} />;
}
