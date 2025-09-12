import { UserRole } from "@/features/auth/server/auth-uitls";

export type publicUserType = {
  id: string;
  name: string | null;
  role: UserRole | null;
  image: string | null;
  email: string | null;
  emailVerified: Date | null;
  createdAt: Date | null;
};

export type OnboardingFormData = {
  first_name: string;
  last_name: string;
  dob: Date | undefined;
  address: Address;
  business_profile: Business;
};

export type Address = {
  line1: string;
  city: string;
  postal_code: string;
  state: string;
  country: string;
};
export type Business = {
  mcc?: string;
};
