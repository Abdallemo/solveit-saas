import { MentorProfile } from "@/features/mentore/components/componentMentorListing";
import {
  getMentorListigProfile,
} from "@/features/mentore/server/action";

export default async function MentorPage() {
  const mentorData = await getMentorListigProfile();

  return (
    <div className="min-h-full bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Mentor Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your mentor profile and availability for mentees
          </p>
        </div>
        <MentorProfile mentorDataa={mentorData!} />
      </div>
    </div>
  );
}
