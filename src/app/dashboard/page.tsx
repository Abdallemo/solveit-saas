import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await auth();
  const useRole = session?.user.role
  if(!useRole){
    return null
  }
  switch (useRole) {
    case 'POSTER':
    redirect('/dashboard/poster')
    case 'SOLVER' :
    redirect('/dashboard/solver')
    case 'MODERATOR' :
    redirect('/dashboard/moderator')
    case 'ADMIN' :
    redirect('/dashboard/admin')
  
    default:
      break;
  }
  return (
    <>
    </>
  );
}
