import { UserRole } from "@/features/auth/server/auth-uitls";

function createSelection<T extends Record<string, true>>(selection: T): T {
  return selection;
}
export type publicUserType = {
  id: string;
  name: string | null;
  role: UserRole | null;
  image: string | null;
  email: string | null;
};
export const publicUserColumns = createSelection({
  id: true,
  email: true,
  name: true,
  image: true,
  role: true,
});

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
