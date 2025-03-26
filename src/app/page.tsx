import { Button } from "@/components/ui/button";
import { getServerUserSession, GithubSignInAction, GithubSignOutAction } from "@/features/users/server/actions";
import { Github, LogOut, ShieldCheck } from 'lucide-react'
export default async function Home() {
  const user = await getServerUserSession();

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <h1 className="text-center text-5xl font-serif ">Solveit</h1>

      <form action="/api/webhooks/stripe/subscription/checkout" method="POST" className="pt-4">
        <Button type="submit" className="cursor-pointer">

          <ShieldCheck />Stripe subscription Testing

        </Button>
      </form>
      {!user && (
        <form action={GithubSignInAction}>
          <Button className="cursor-pointer" type='submit'>

            <Github />oAuth Testing

          </Button>
        </form>)}
      {user && (
        <form action={GithubSignOutAction}>
          <Button className="cursor-pointer" type='submit'>

            <LogOut />Logout oAuth Testing

          </Button>
        </form>

      )}


    </div>
  );
}
