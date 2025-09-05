import { UserTable } from "@/drizzle/schemas";
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

