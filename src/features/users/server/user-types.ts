import { UserRoleType } from "@/drizzle/schemas";
import { auth } from "@/lib/auth";
export type UserRole = UserRoleType;

function createSelection<T extends Record<string, true>>(selection: T): T {
  return selection;
}

export type User = Omit<(typeof auth.$Infer.Session)["user"], "role"> & {
  role: UserRole;
};
export type Session = Omit<typeof auth.$Infer.Session, "user"> & {
  user: User;
};
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
  emailVerified: true,
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
