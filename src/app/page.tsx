import { Button } from "@/components/ui/button";
import { getServerUserSession, GithubSignInAction, GithubSignOutAction, GooogleSignInAction } from "@/features/users/server/actions";
import {  Github, LogOut, Mail, ShieldCheck } from 'lucide-react'
import ChatPage from "@/components/ai_test_model";
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
        <>

          <form action={GithubSignInAction}>
            <Button className="cursor-pointer" type='submit'>

              <Github />Github oAuth Testing

            </Button>
          </form>

          <form action={GooogleSignInAction}>
            <Button className="cursor-pointer" type='submit'>

              < Mail />Google oAuth Testing

            </Button>
          </form>

        </>
      )

      }
      {user && (
        <form action={GithubSignOutAction}>
          <Button className="cursor-pointer" type='submit'>

            <LogOut />Logout oAuth Testing

          </Button>
        </form>

      )}
      <ChatPage/>

    </div>
  );
}
