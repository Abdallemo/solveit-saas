import React from "react";
import { cn } from "@/lib/utils";
import { Spotlight } from "@/components/Spotlight";
import { Button } from "@/components/ui/button";
import { SignOutAction } from "@/features/auth/server/actions";
import { LogIn, LogOut, ShieldCheck } from "lucide-react";
import ChatPage from "@/components/ai_test_model";
import { getServerUserSession } from "@/features/auth/server/actions";
export default async function SpotlightPreview() {
  const user = await getServerUserSession();


  return (
    <div className="relative flex h-screen w-full overflow-hidden rounded-md bg-black/[0.96] antialiased md:items-center md:justify-center">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 [background-size:40px_40px] select-none",
          "[background-image:linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)]"
        )}
      />

      <Spotlight
        className="-top-40 left-0 md:-top-20 md:left-60"
        fill="white"
      />
      <div className="relative z-10 mx-auto w-full max-w-7xl p-4 pt-20 md:pt-0">
        <h1 className="bg-opacity-50 bg-gradient-to-b from-neutral-50 to-neutral-400 bg-clip-text text-center text-4xl font-bold text-transparent md:text-7xl line-clamp-3">
          SolveIt <br /> The Future of Task Collaboration & Payments.
        </h1>
        <p className=" mx-auto mt-4 max-w-lg text-center text-base font-normal text-neutral-300">
          A powerful SaaS platform designed to streamline task management,
          connect skilled solvers with posters, and ensure secure, escrow-backed
          payments. Say goodbye to disputes—experience seamless collaboration
          today.
        </p>
        <form
          action="/api/webhooks/stripe/subscription/checkout"
          method="POST"
          className="pt-4">
          <Button type="submit" className="cursor-pointer">
            <ShieldCheck />
            Stripe subscription Testing
          </Button>
        </form>
        {!user && (
          <>
            <form action="/login">
              <Button className="cursor-pointer" type="submit">
                <LogIn />
                Login Testing
              </Button>
            </form>
          </>
        )}
        {user && (
          <form action={SignOutAction}>
            <Button className="cursor-pointer" type="submit">
              <LogOut />
              Logout oAuth Testing
            </Button>
          </form>
        )}
        <ChatPage />
      </div>
      
    </div>
  );
}
