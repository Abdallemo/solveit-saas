import { Button } from "@/components/ui/button";
import { isAuthorized, SignOutAction } from "@/features/auth/server/actions";

export default async function page() {
  await isAuthorized("ADMIN");
  
  return (
    <div>
      Admin Dashbaord
      <form action={SignOutAction}>
        <Button variant={"ghost"}>Signout</Button>
      </form>
    </div>
  );
}
