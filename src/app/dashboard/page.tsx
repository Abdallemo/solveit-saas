import { Button } from "@/components/ui/button";
import { SignOutAction } from "@/features/auth/server/actions";
import { auth } from "@/lib/auth";
import { LogOut } from "lucide-react";

export default async function page() {
  const session = await auth();

  return (
    <>
      <h1 className="text-green-700 text-6xl text-center">Succsseeded</h1>

      <p>{JSON.stringify(session)}</p>
      <form action={SignOutAction}>
        <Button className="cursor-pointer" type="submit">
          <LogOut />
          Logout oAuth Testing
        </Button>
      </form>
    </>
  );
}
