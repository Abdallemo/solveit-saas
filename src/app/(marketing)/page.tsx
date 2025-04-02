import { Button } from "@/components/ui/button";
import {GithubSignOutAction } from "@/features/auth/server/actions";
import {  LogIn, LogOut, ShieldCheck } from 'lucide-react'
import ChatPage from "@/components/ai_test_model";
import {getServerUserSession} from '@/features/users/server/actions' 
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

          <form action='/login'>
            <Button className="cursor-pointer" type='submit'>

              <LogIn/>Login Testing

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
