import OnboardingForm from "@/components/dashboard/user-onboarding-lazyloaded";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <OnboardingForm />
    </main>
  );
}
