"use client";
import dynamic from "next/dynamic";

const OnboardingForm = dynamic(() => import("./user-onboarding"), {
  ssr: false,
});

export default OnboardingForm;
